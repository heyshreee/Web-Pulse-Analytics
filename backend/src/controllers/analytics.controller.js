import supabase from '../config/supabase.js';
import { isUuid } from '../utils/uuid.js';
import { classifyReferrerSource } from '../services/share.service.js';
import { getPlanConfig, hasFeature, normalizePlanId } from '../config/plans.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../errors/AppError.js';

async function resolveOwnedProject(idOrName, userId) {
  let query = supabase
    .from('projects')
    .select('id, name, user_id, tracking_id, timezone')
    .eq('user_id', userId);

  if (isUuid(idOrName)) {
    query = query.eq('id', idOrName);
  } else if (String(idOrName).startsWith('trk_')) {
    query = query.eq('tracking_id', idOrName);
  } else {
    query = query.eq('name', idOrName);
  }

  const { data: project, error } = await query.maybeSingle();
  if (error) throw error;
  if (!project) throw AppError.notFound('Project not found');
  return project;
}

function parseDateWindow(query = {}, planId = 'nano') {
  const plan = normalizePlanId(planId);
  const planRetentionDays = getPlanConfig(plan).limits.retention_days;
  const now = new Date();

  if (query.startDate || query.endDate) {
    const start = query.startDate ? new Date(query.startDate) : new Date(now.getTime() - 7 * 86400000);
    const end = query.endDate ? new Date(query.endDate) : now;
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw AppError.badRequest('Invalid date filter parameters', 'INVALID_DATE_RANGE');
    }
    if (start > end) {
      throw AppError.badRequest('startDate must be before endDate', 'INVALID_DATE_RANGE');
    }
    return {
      startIso: start.toISOString(),
      endIso: end.toISOString(),
      days: Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000)),
      range: 'custom',
      retentionDays: planRetentionDays,
    };
  }

  const range = ['24h', '7d', '30d', '90d'].includes(query.range) ? query.range : '7d';
  const requestedDays = range === '24h' ? 1 : range === '30d' ? 30 : range === '90d' ? 90 : 7;
  const days = Math.min(requestedDays, planRetentionDays);
  const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  return {
    startIso: start.toISOString(),
    endIso: now.toISOString(),
    days,
    range,
    retentionDays: planRetentionDays,
  };
}

function safePathname(urlStr) {
  if (!urlStr) return '/';
  try {
    return new URL(urlStr).pathname || '/';
  } catch {
    return String(urlStr).split('?')[0] || '/';
  }
}

export const getOverview = asyncHandler(async (req, res) => {
  const project = await resolveOwnedProject(req.params.projectId || req.params.id, req.user.id);
  const window = parseDateWindow(req.query, req.user.plan);

  const [{ data: pageViews }, { data: visitors }, { data: sessions }, { data: events }] =
    await Promise.all([
      supabase
        .from('page_views')
        .select('id, path, page_url, title, viewed_at, created_at, visitor_id, session_id')
        .eq('project_id', project.id)
        .gte('created_at', window.startIso)
        .lte('created_at', window.endIso)
        .limit(50000),
      supabase
        .from('visitors')
        .select('id, visitor_hash, session_id, referrer, country, country_name, country_code, device_type, browser, operating_system, os, last_seen, last_seen_at')
        .eq('project_id', project.id)
        .gte('last_seen', window.startIso)
        .lte('last_seen', window.endIso)
        .limit(50000),
      supabase
        .from('sessions')
        .select('id, session_id, visitor_id, page_views, event_count, duration_seconds, started_at')
        .eq('project_id', project.id)
        .gte('started_at', window.startIso)
        .lte('started_at', window.endIso)
        .limit(50000),
      supabase
        .from('events')
        .select('id, event_name, occurred_at')
        .eq('project_id', project.id)
        .gte('occurred_at', window.startIso)
        .lte('occurred_at', window.endIso)
        .limit(50000),
    ]);

  const views = pageViews || [];
  const totalPageViews = views.length;
  const uniqueVisitorSet = new Set(
    (visitors || []).map((v) => v.visitor_hash || v.id).filter(Boolean)
  );
  if (uniqueVisitorSet.size === 0) {
    views.forEach((v) => {
      if (v.visitor_id) uniqueVisitorSet.add(v.visitor_id);
    });
  }

  const totalSessions =
    (sessions || []).length ||
    new Set(views.map((v) => v.session_id).filter(Boolean)).size ||
    uniqueVisitorSet.size;

  const pagesPerSession =
    totalSessions > 0 ? Math.round((totalPageViews / totalSessions) * 100) / 100 : 0;

  // Daily chart buckets (UTC dates)
  const dayBuckets = {};
  const endDate = new Date(window.endIso);
  for (let i = window.days - 1; i >= 0; i--) {
    const key = new Date(endDate.getTime() - i * 86400000).toISOString().slice(0, 10);
    dayBuckets[key] = { fullDate: key, views: 0, visitors: new Set() };
  }

  views.forEach((v) => {
    const dayKey = String(v.viewed_at || v.created_at || '').slice(0, 10);
    if (dayBuckets[dayKey]) {
      dayBuckets[dayKey].views += 1;
      if (v.visitor_id) dayBuckets[dayKey].visitors.add(v.visitor_id);
    }
  });

  const dailyTraffic = Object.values(dayBuckets)
    .sort((a, b) => a.fullDate.localeCompare(b.fullDate))
    .map((b) => ({
      fullDate: b.fullDate,
      name: new Date(`${b.fullDate}T00:00:00Z`).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
      }),
      views: b.views,
      visitors: b.visitors.size,
    }));

  res.json({
    projectId: project.id,
    range: window.range,
    startDate: window.startIso,
    endDate: window.endIso,
    totalPageViews,
    uniqueVisitors: uniqueVisitorSet.size,
    totalSessions,
    pagesPerSession,
    customEvents: (events || []).length,
    dailyTraffic,
  });
});

export const getPages = asyncHandler(async (req, res) => {
  const project = await resolveOwnedProject(req.params.projectId || req.params.id, req.user.id);
  const window = parseDateWindow(req.query, req.user.plan);

  const { data: rows, error } = await supabase
    .from('page_views')
    .select('path, page_url, title, visitor_id, created_at')
    .eq('project_id', project.id)
    .gte('created_at', window.startIso)
    .lte('created_at', window.endIso)
    .limit(50000);

  if (error) throw error;

  const pageMap = new Map();
  (rows || []).forEach((r) => {
    const path = r.path || safePathname(r.page_url);
    if (!pageMap.has(path)) {
      pageMap.set(path, { url: path, title: r.title || path, views: 0, visitors: new Set() });
    }
    const entry = pageMap.get(path);
    entry.views += 1;
    if (r.visitor_id) entry.visitors.add(r.visitor_id);
    if (r.title && r.title !== 'Unknown Page') entry.title = r.title;
  });

  const pages = Array.from(pageMap.values())
    .map((p) => ({ url: p.url, title: p.title, views: p.views, uniqueVisitors: p.visitors.size }))
    .sort((a, b) => b.views - a.views);

  res.json({ projectId: project.id, range: window.range, pages });
});

export const getSources = asyncHandler(async (req, res) => {
  const project = await resolveOwnedProject(req.params.projectId || req.params.id, req.user.id);
  const window = parseDateWindow(req.query, req.user.plan);

  const [{ data: sessions }, { data: visitors }] = await Promise.all([
    supabase
      .from('sessions')
      .select('referrer, utm_source, utm_medium, utm_campaign, started_at')
      .eq('project_id', project.id)
      .gte('started_at', window.startIso)
      .lte('started_at', window.endIso)
      .limit(50000),
    supabase
      .from('visitors')
      .select('referrer, last_seen')
      .eq('project_id', project.id)
      .gte('last_seen', window.startIso)
      .lte('last_seen', window.endIso)
      .limit(50000),
  ]);

  const rows = (sessions && sessions.length > 0) ? sessions : (visitors || []);

  const channelCounts = {
    Direct: 0,
    'Organic Search': 0,
    Social: 0,
    Referral: 0,
  };
  const domainCounts = {};
  const utmSources = {};
  const utmMediums = {};
  const utmCampaigns = {};

  rows.forEach((r) => {
    const { channel, domain } = classifyReferrerSource(r.referrer);
    channelCounts[channel] = (channelCounts[channel] || 0) + 1;
    domainCounts[domain] = (domainCounts[domain] || 0) + 1;

    if (r.utm_source) utmSources[r.utm_source] = (utmSources[r.utm_source] || 0) + 1;
    if (r.utm_medium) utmMediums[r.utm_medium] = (utmMediums[r.utm_medium] || 0) + 1;
    if (r.utm_campaign) utmCampaigns[r.utm_campaign] = (utmCampaigns[r.utm_campaign] || 0) + 1;
  });

  const toSortedList = (obj) =>
    Object.entries(obj)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

  res.json({
    projectId: project.id,
    range: window.range,
    channels: Object.entries(channelCounts).map(([name, count]) => ({ name, count })),
    referrerDomains: toSortedList(domainCounts),
    utm: {
      sources: toSortedList(utmSources),
      mediums: toSortedList(utmMediums),
      campaigns: toSortedList(utmCampaigns),
    },
  });
});

export const getCountries = asyncHandler(async (req, res) => {
  const project = await resolveOwnedProject(req.params.projectId || req.params.id, req.user.id);
  const window = parseDateWindow(req.query, req.user.plan);

  const { data: visitors, error } = await supabase
    .from('visitors')
    .select('country, country_name, country_code, visitor_hash, id')
    .eq('project_id', project.id)
    .gte('last_seen', window.startIso)
    .lte('last_seen', window.endIso)
    .limit(50000);

  if (error) throw error;

  const countryMap = new Map();
  let total = 0;

  (visitors || []).forEach((v) => {
    const countryName = v.country_name || v.country || 'Unknown';
    const countryCode = v.country_code || 'XX';
    total += 1;
    if (!countryMap.has(countryName)) {
      countryMap.set(countryName, { country: countryName, countryCode, visitors: 0 });
    }
    countryMap.get(countryName).visitors += 1;
  });

  const countries = Array.from(countryMap.values())
    .sort((a, b) => b.visitors - a.visitors)
    .map((c) => ({
      ...c,
      share: total > 0 ? Math.round((c.visitors / total) * 1000) / 10 : 0,
    }));

  res.json({
    projectId: project.id,
    range: window.range,
    totalVisitors: total,
    countries,
  });
});

export const getDevices = asyncHandler(async (req, res) => {
  const project = await resolveOwnedProject(req.params.projectId || req.params.id, req.user.id);
  const window = parseDateWindow(req.query, req.user.plan);

  const { data: visitors, error } = await supabase
    .from('visitors')
    .select('device_type, browser, operating_system, os')
    .eq('project_id', project.id)
    .gte('last_seen', window.startIso)
    .lte('last_seen', window.endIso)
    .limit(50000);

  if (error) throw error;

  const deviceTypes = { mobile: 0, desktop: 0, tablet: 0 };
  const browsers = {};
  const operatingSystems = {};

  (visitors || []).forEach((v) => {
    const rawType = String(v.device_type || 'desktop').toLowerCase();
    const bucket = rawType === 'mobile' ? 'mobile' : rawType === 'tablet' ? 'tablet' : 'desktop';
    deviceTypes[bucket] += 1;

    const browser = v.browser || 'Unknown';
    browsers[browser] = (browsers[browser] || 0) + 1;

    const os = v.operating_system || v.os || 'Unknown';
    operatingSystems[os] = (operatingSystems[os] || 0) + 1;
  });

  const toList = (obj) =>
    Object.entries(obj)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

  res.json({
    projectId: project.id,
    range: window.range,
    deviceTypes: Object.entries(deviceTypes).map(([name, count]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      count,
    })),
    browsers: toList(browsers),
    operatingSystems: toList(operatingSystems),
  });
});

export const getGlobeAnalyze = asyncHandler(async (req, res) => {
  const projectId = req.params.projectId || req.params.id || req.query.projectId || null;
  if (projectId) {
    await resolveOwnedProject(projectId, req.user.id);
  }

  let query = supabase
    .from('visitors')
    .select('id, country, country_code, region, city, device_type, last_seen')
    .eq('user_id', req.user.id)
    .order('last_seen', { ascending: false })
    .limit(100);

  if (projectId) {
    query = query.eq('project_id', projectId);
  }

  const { data: visitors, error } = await query;
  if (error) throw error;

  res.json({
    enabled: true,
    markers: visitors || [],
  });
});

export const exportProjectAnalytics = asyncHandler(async (req, res) => {
  const project = await resolveOwnedProject(req.params.projectId || req.params.id, req.user.id);
  const format = String(req.query.format || 'csv').toLowerCase();
  const plan = normalizePlanId(req.user.plan || 'nano');

  if (format === 'pdf' && !hasFeature(plan, 'pdf_export')) {
    throw AppError.forbidden('PDF exports are not available on your current plan.', 'FEATURE_LOCKED', {
      feature: 'pdf_export',
      plan,
      upgradeRequired: true,
    });
  }

  if (format !== 'pdf' && !hasFeature(plan, 'csv_export')) {
    throw AppError.forbidden('CSV exports are not available on the Nano plan.', 'FEATURE_LOCKED', {
      feature: 'csv_export',
      plan,
      upgradeRequired: true,
    });
  }

  const { data: rows } = await supabase
    .from('page_views')
    .select('path, page_url, title, created_at')
    .eq('project_id', project.id)
    .order('created_at', { ascending: false })
    .limit(1000);

  const lines = ['path,title,created_at'];
  (rows || []).forEach((r) => {
    const path = JSON.stringify(r.path || safePathname(r.page_url));
    const title = JSON.stringify(r.title || '');
    const ts = JSON.stringify(r.created_at || '');
    lines.push(`${path},${title},${ts}`);
  });

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${project.name}-analytics.csv"`);
  res.send(lines.join('\n'));
});

export default {
  getOverview,
  getPages,
  getSources,
  getCountries,
  getDevices,
  getGlobeAnalyze,
  exportProjectAnalytics,
};
