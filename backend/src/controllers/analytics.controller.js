import PDFDocument from 'pdfkit';
import supabase from '../config/supabase.js';
import { resolveAuthorizedProject } from '../utils/projectAuth.js';
import { classifyReferrerSource } from '../services/share.service.js';
import { getPlanConfig, hasFeature, normalizePlanId } from '../config/plans.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../errors/AppError.js';

const FILTER_KEYS = [
  'origin',
  'country',
  'region',
  'device',
  'browser',
  'os',
  'source',
  'referrer',
  'page',
  'event',
  'utm_source',
  'utm_medium',
  'utm_campaign',
];

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

function parseAnalyticsFilters(query = {}, planId = 'nano') {
  const plan = normalizePlanId(planId);
  const filters = {};
  for (const key of FILTER_KEYS) {
    const raw = query[key];
    if (raw !== undefined && raw !== null && String(raw).trim() !== '') {
      filters[key] = String(raw).trim();
    }
  }

  if (Object.keys(filters).length > 0 && !hasFeature(plan, 'advanced_filters')) {
    throw AppError.forbidden(
      'Advanced analytics filters require Lite or higher.',
      'FEATURE_LOCKED',
      { feature: 'advanced_filters', plan, upgradeRequired: true }
    );
  }

  if (filters.region && !hasFeature(plan, 'advanced_geo_analytics')) {
    throw AppError.forbidden(
      'Regional geographic filtering requires Lite or higher.',
      'FEATURE_LOCKED',
      { feature: 'advanced_geo_analytics', plan, upgradeRequired: true }
    );
  }

  return filters;
}

function safePathname(urlStr) {
  if (!urlStr) return '/';
  try {
    return new URL(urlStr).pathname || '/';
  } catch {
    return String(urlStr).split('?')[0] || '/';
  }
}

function safeOrigin(urlStr) {
  if (!urlStr) return '';
  try {
    return new URL(urlStr).origin;
  } catch {
    return '';
  }
}

function matchesVisitorFilters(v, filters) {
  if (!filters || Object.keys(filters).length === 0) return true;
  if (filters.country) {
    const c = String(v.country_name || v.country || '').toLowerCase();
    const cc = String(v.country_code || '').toLowerCase();
    const target = filters.country.toLowerCase();
    if (c !== target && cc !== target) return false;
  }
  if (filters.region) {
    const r = String(v.region || '').toLowerCase();
    if (r !== filters.region.toLowerCase()) return false;
  }
  if (filters.device) {
    const d = String(v.device_type || 'desktop').toLowerCase();
    if (d !== filters.device.toLowerCase()) return false;
  }
  if (filters.browser) {
    const b = String(v.browser || '').toLowerCase();
    if (b !== filters.browser.toLowerCase()) return false;
  }
  if (filters.os) {
    const osVal = String(v.operating_system || v.os || '').toLowerCase();
    if (osVal !== filters.os.toLowerCase()) return false;
  }
  if (filters.source) {
    const { channel } = classifyReferrerSource(v.referrer);
    if (channel.toLowerCase() !== filters.source.toLowerCase()) return false;
  }
  if (filters.referrer) {
    const { domain } = classifyReferrerSource(v.referrer);
    if (!domain.toLowerCase().includes(filters.referrer.toLowerCase())) return false;
  }
  if (filters.utm_source && String(v.utm_source || '').toLowerCase() !== filters.utm_source.toLowerCase()) {
    return false;
  }
  if (filters.utm_medium && String(v.utm_medium || '').toLowerCase() !== filters.utm_medium.toLowerCase()) {
    return false;
  }
  if (filters.utm_campaign && String(v.utm_campaign || '').toLowerCase() !== filters.utm_campaign.toLowerCase()) {
    return false;
  }
  return true;
}

function matchesPageViewFilters(pv, visitorMap, filters) {
  if (!filters || Object.keys(filters).length === 0) return true;
  if (filters.origin) {
    const pvOrigin = safeOrigin(pv.page_url).toLowerCase();
    if (pvOrigin !== filters.origin.toLowerCase()) return false;
  }
  if (filters.page) {
    const path = (pv.path || safePathname(pv.page_url)).toLowerCase();
    if (!path.includes(filters.page.toLowerCase())) return false;
  }
  const visitor = pv.visitor_id ? visitorMap.get(pv.visitor_id) : null;
  if (visitor) {
    return matchesVisitorFilters(visitor, filters);
  }
  // If visitor-level filters are active and no visitor record matched, exclude
  const hasVisitorFilter = ['country', 'region', 'device', 'browser', 'os', 'source', 'referrer', 'utm_source', 'utm_medium', 'utm_campaign'].some(
    (k) => Boolean(filters[k])
  );
  return !hasVisitorFilter;
}

async function fetchScopedData(projectId, window) {
  const [{ data: pageViews }, { data: visitors }, { data: sessions }, { data: events }] =
    await Promise.all([
      supabase
        .from('page_views')
        .select('id, path, page_url, title, referrer, viewed_at, created_at, visitor_id, session_id')
        .eq('project_id', projectId)
        .gte('created_at', window.startIso)
        .lte('created_at', window.endIso)
        .limit(50000),
      supabase
        .from('visitors')
        .select('id, visitor_hash, session_id, referrer, country, country_name, country_code, region, city, device_type, browser, operating_system, os, utm_source, utm_medium, utm_campaign, created_at, last_seen, last_seen_at')
        .eq('project_id', projectId)
        .gte('last_seen', window.startIso)
        .lte('last_seen', window.endIso)
        .limit(50000),
      supabase
        .from('sessions')
        .select('id, session_id, visitor_id, referrer, utm_source, utm_medium, utm_campaign, page_views, event_count, duration_seconds, started_at')
        .eq('project_id', projectId)
        .gte('started_at', window.startIso)
        .lte('started_at', window.endIso)
        .limit(50000),
      supabase
        .from('events')
        .select('id, event_name, occurred_at')
        .eq('project_id', projectId)
        .gte('occurred_at', window.startIso)
        .lte('occurred_at', window.endIso)
        .limit(50000),
    ]);

  return {
    pageViews: pageViews || [],
    visitors: visitors || [],
    sessions: sessions || [],
    events: events || [],
  };
}

export const getOverview = asyncHandler(async (req, res) => {
  const project = await resolveAuthorizedProject(req.params.projectId || req.params.id, req.user.id, 'viewer');
  const window = parseDateWindow(req.query, req.user.plan);
  const filters = parseAnalyticsFilters(req.query, req.user.plan);

  const raw = await fetchScopedData(project.id, window);
  const filteredVisitors = raw.visitors.filter((v) => matchesVisitorFilters(v, filters));
  const visitorMap = new Map(filteredVisitors.map((v) => [v.id, v]));
  const views = raw.pageViews.filter((pv) => matchesPageViewFilters(pv, visitorMap, filters));
  const events = filters.event
    ? raw.events.filter((e) => String(e.event_name || '').toLowerCase() === filters.event.toLowerCase())
    : raw.events;

  const totalPageViews = views.length;
  const uniqueVisitorSet = new Set(
    filteredVisitors.map((v) => v.visitor_hash || v.id).filter(Boolean)
  );
  if (uniqueVisitorSet.size === 0) {
    views.forEach((v) => {
      if (v.visitor_id) uniqueVisitorSet.add(v.visitor_id);
    });
  }

  const totalSessions =
    Object.keys(filters).length === 0 && raw.sessions.length > 0
      ? raw.sessions.length
      : new Set(views.map((v) => v.session_id).filter(Boolean)).size || uniqueVisitorSet.size;

  const pagesPerSession =
    totalSessions > 0 ? Math.round((totalPageViews / totalSessions) * 100) / 100 : 0;

  // New vs Returning visitor estimates
  const startMs = new Date(window.startIso).getTime();
  let newVisitors = 0;
  let returningVisitors = 0;
  filteredVisitors.forEach((v) => {
    const createdMs = v.created_at ? new Date(v.created_at).getTime() : startMs;
    if (!Number.isNaN(createdMs) && createdMs < startMs) {
      returningVisitors += 1;
    } else {
      newVisitors += 1;
    }
  });

  // Landing & exit pages grouped by session_id
  const sessionViewsMap = new Map();
  views.forEach((v) => {
    const key = v.session_id || v.visitor_id || v.id;
    if (!sessionViewsMap.has(key)) sessionViewsMap.set(key, []);
    sessionViewsMap.get(key).push(v);
  });

  const landingCounts = {};
  const exitCounts = {};
  sessionViewsMap.forEach((list) => {
    list.sort((a, b) => String(a.viewed_at || a.created_at).localeCompare(String(b.viewed_at || b.created_at)));
    const firstPath = list[0]?.path || safePathname(list[0]?.page_url);
    const lastPath = list[list.length - 1]?.path || safePathname(list[list.length - 1]?.page_url);
    landingCounts[firstPath] = (landingCounts[firstPath] || 0) + 1;
    exitCounts[lastPath] = (exitCounts[lastPath] || 0) + 1;
  });

  const toRanked = (obj) =>
    Object.entries(obj)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

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
    filters,
    totalPageViews,
    uniqueVisitors: uniqueVisitorSet.size,
    newVisitors,
    returningVisitors,
    totalSessions,
    pagesPerSession,
    customEvents: events.length,
    landingPages: toRanked(landingCounts),
    exitPages: toRanked(exitCounts),
    dailyTraffic,
  });
});

export const getPages = asyncHandler(async (req, res) => {
  const project = await resolveAuthorizedProject(req.params.projectId || req.params.id, req.user.id, 'viewer');
  const window = parseDateWindow(req.query, req.user.plan);
  const filters = parseAnalyticsFilters(req.query, req.user.plan);

  const raw = await fetchScopedData(project.id, window);
  const visitorMap = new Map(
    raw.visitors.filter((v) => matchesVisitorFilters(v, filters)).map((v) => [v.id, v])
  );
  const rows = raw.pageViews.filter((pv) => matchesPageViewFilters(pv, visitorMap, filters));

  const pageMap = new Map();
  rows.forEach((r) => {
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

  res.json({ projectId: project.id, range: window.range, filters, pages });
});

export const getSources = asyncHandler(async (req, res) => {
  const project = await resolveAuthorizedProject(req.params.projectId || req.params.id, req.user.id, 'viewer');
  const window = parseDateWindow(req.query, req.user.plan);
  const filters = parseAnalyticsFilters(req.query, req.user.plan);

  const raw = await fetchScopedData(project.id, window);
  const sourceRows = (raw.sessions.length > 0 ? raw.sessions : raw.visitors).filter((r) =>
    matchesVisitorFilters(r, filters)
  );

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

  sourceRows.forEach((r) => {
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
    filters,
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
  const project = await resolveAuthorizedProject(req.params.projectId || req.params.id, req.user.id, 'viewer');
  const window = parseDateWindow(req.query, req.user.plan);
  const filters = parseAnalyticsFilters(req.query, req.user.plan);
  const plan = normalizePlanId(req.user.plan || 'nano');

  const raw = await fetchScopedData(project.id, window);
  const visitors = raw.visitors.filter((v) => matchesVisitorFilters(v, filters));

  const countryMap = new Map();
  const regionMap = new Map();
  let total = 0;

  visitors.forEach((v) => {
    const countryName = v.country_name || v.country || 'Unknown';
    const countryCode = v.country_code || 'XX';
    total += 1;
    if (!countryMap.has(countryName)) {
      countryMap.set(countryName, { country: countryName, countryCode, visitors: 0 });
    }
    countryMap.get(countryName).visitors += 1;

    if (hasFeature(plan, 'advanced_geo_analytics') && v.region) {
      const regKey = `${countryName}:${v.region}`;
      if (!regionMap.has(regKey)) {
        regionMap.set(regKey, { region: v.region, country: countryName, visitors: 0 });
      }
      regionMap.get(regKey).visitors += 1;
    }
  });

  const countries = Array.from(countryMap.values())
    .sort((a, b) => b.visitors - a.visitors)
    .map((c) => ({
      ...c,
      share: total > 0 ? Math.round((c.visitors / total) * 1000) / 10 : 0,
    }));

  const regions = hasFeature(plan, 'advanced_geo_analytics')
    ? Array.from(regionMap.values())
        .sort((a, b) => b.visitors - a.visitors)
        .map((r) => ({
          ...r,
          share: total > 0 ? Math.round((r.visitors / total) * 1000) / 10 : 0,
        }))
    : undefined;

  res.json({
    projectId: project.id,
    range: window.range,
    filters,
    totalVisitors: total,
    countries,
    ...(regions !== undefined ? { regions } : {}),
  });
});

export const getDevices = asyncHandler(async (req, res) => {
  const project = await resolveAuthorizedProject(req.params.projectId || req.params.id, req.user.id, 'viewer');
  const window = parseDateWindow(req.query, req.user.plan);
  const filters = parseAnalyticsFilters(req.query, req.user.plan);

  const raw = await fetchScopedData(project.id, window);
  const visitors = raw.visitors.filter((v) => matchesVisitorFilters(v, filters));

  const deviceTypes = { mobile: 0, desktop: 0, tablet: 0 };
  const browsers = {};
  const operatingSystems = {};

  visitors.forEach((v) => {
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
    filters,
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
  const window = parseDateWindow(req.query, req.user.plan);
  const filters = parseAnalyticsFilters(req.query, req.user.plan);

  if (projectId) {
    await resolveAuthorizedProject(projectId, req.user.id, 'viewer');
  }

  let query = supabase
    .from('visitors')
    .select('id, country, country_code, region, city, device_type, browser, os, referrer, utm_source, utm_medium, utm_campaign, last_seen')
    .gte('last_seen', window.startIso)
    .lte('last_seen', window.endIso)
    .order('last_seen', { ascending: false })
    .limit(500);

  if (projectId) {
    query = query.eq('project_id', projectId);
  } else {
    query = query.eq('user_id', req.user.id);
  }

  const { data: visitors, error } = await query;
  if (error) throw error;

  const markers = (visitors || []).filter((v) => matchesVisitorFilters(v, filters));

  res.json({
    enabled: true,
    range: window.range,
    filters,
    markers,
  });
});

export const exportProjectAnalytics = asyncHandler(async (req, res) => {
  const project = await resolveAuthorizedProject(req.params.projectId || req.params.id, req.user.id, 'viewer');
  const format = String(req.query.format || 'csv').toLowerCase();
  const exportType = String(req.query.type || 'pages').toLowerCase();
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

  const window = parseDateWindow(req.query, req.user.plan);
  const filters = parseAnalyticsFilters(req.query, req.user.plan);
  const raw = await fetchScopedData(project.id, window);
  const visitors = raw.visitors.filter((v) => matchesVisitorFilters(v, filters));
  const visitorMap = new Map(visitors.map((v) => [v.id, v]));
  const views = raw.pageViews.filter((pv) => matchesPageViewFilters(pv, visitorMap, filters)).slice(0, 1000);

  if (format === 'pdf') {
    const generatedAt = new Date().toISOString();
    const countryTotals = {};
    const deviceTotals = { desktop: 0, mobile: 0, tablet: 0 };
    visitors.forEach((v) => {
      const c = v.country_name || v.country || 'Unknown';
      countryTotals[c] = (countryTotals[c] || 0) + 1;
      const dt = String(v.device_type || 'desktop').toLowerCase();
      const bucket = dt === 'mobile' ? 'mobile' : dt === 'tablet' ? 'tablet' : 'desktop';
      deviceTotals[bucket] += 1;
    });

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    const pdfBuffer = await new Promise((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(18).text(`WebPulse Analytics Report: ${project.name}`);
      doc.moveDown(0.5);
      doc.fontSize(10).text(`Range: ${window.startIso.slice(0, 10)} to ${window.endIso.slice(0, 10)} (UTC)`);
      doc.text(`Generated At: ${generatedAt}`);
      doc.moveDown();

      doc.fontSize(13).text('Overview Summary');
      doc.fontSize(10).text(`Total Page Views: ${views.length}`);
      doc.text(`Unique Visitors: ${visitors.length}`);
      doc.text(`Devices — Desktop: ${deviceTotals.desktop}, Mobile: ${deviceTotals.mobile}, Tablet: ${deviceTotals.tablet}`);
      doc.moveDown();

      doc.fontSize(13).text('Top Countries');
      Object.entries(countryTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .forEach(([country, count]) => {
          doc.fontSize(10).text(`- ${country}: ${count} visitors`);
        });

      doc.end();
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${project.name}-report.pdf"`);
    return res.send(pdfBuffer);
  }

  const lines = [];
  if (exportType === 'countries') {
    lines.push('country,visitors');
    const counts = {};
    visitors.forEach((v) => {
      const c = v.country_name || v.country || 'Unknown';
      counts[c] = (counts[c] || 0) + 1;
    });
    Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 1000)
      .forEach(([c, count]) => lines.push(`${JSON.stringify(c)},${count}`));
  } else if (exportType === 'devices') {
    lines.push('device_type,browser,os,count');
    const counts = {};
    visitors.forEach((v) => {
      const key = `${v.device_type || 'desktop'}|${v.browser || 'Unknown'}|${v.operating_system || v.os || 'Unknown'}`;
      counts[key] = (counts[key] || 0) + 1;
    });
    Object.entries(counts)
      .slice(0, 1000)
      .forEach(([key, count]) => {
        const [d, b, o] = key.split('|');
        lines.push(`${JSON.stringify(d)},${JSON.stringify(b)},${JSON.stringify(o)},${count}`);
      });
  } else if (exportType === 'sources') {
    lines.push('channel,domain,utm_source,utm_medium,utm_campaign');
    visitors.slice(0, 1000).forEach((v) => {
      const { channel, domain } = classifyReferrerSource(v.referrer);
      lines.push(
        `${JSON.stringify(channel)},${JSON.stringify(domain)},${JSON.stringify(v.utm_source || '')},${JSON.stringify(v.utm_medium || '')},${JSON.stringify(v.utm_campaign || '')}`
      );
    });
  } else {
    lines.push('path,title,created_at');
    views.forEach((r) => {
      const path = JSON.stringify(r.path || safePathname(r.page_url));
      const title = JSON.stringify(r.title || '');
      const ts = JSON.stringify(r.created_at || '');
      lines.push(`${path},${title},${ts}`);
    });
  }

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${project.name}-${exportType}.csv"`);
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
