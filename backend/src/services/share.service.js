import crypto from 'node:crypto';
import supabase from '../config/supabase.js';
import { getPlanConfig, normalizePlanId } from '../config/plans.js';
import NotificationService from './notification.service.js';
import ActivityLogService from './activity.service.js';
import AppError from '../errors/AppError.js';

const shareQueues = new Map();

function hashShareToken(rawToken) {
  return crypto.createHash('sha256').update(String(rawToken)).digest('hex');
}

function enqueueShareCheck(key, fn) {
  const prev = shareQueues.get(key) || Promise.resolve();
  const next = prev.then(fn, fn);
  shareQueues.set(key, next.catch(() => {}));
  return next;
}

function getUtcMonth(date = new Date()) {
  return date.toISOString().slice(0, 7);
}

export function classifyReferrerSource(referrerUrl) {
  if (!referrerUrl) {
    return { channel: 'Direct', domain: 'Direct' };
  }

  let hostname = String(referrerUrl).trim().toLowerCase();
  try {
    hostname = new URL(referrerUrl).hostname.toLowerCase();
  } catch {
    hostname = hostname.replace(/^https?:\/\//i, '').split('/')[0].split(':')[0];
  }

  if (!hostname) {
    return { channel: 'Direct', domain: 'Direct' };
  }

  const searchHosts = [
    'google.', 'bing.com', 'duckduckgo.com', 'yahoo.com', 'baidu.com', 'yandex.', 'ecosia.org', 'search.brave.com',
  ];
  const socialHosts = [
    'twitter.com', 'x.com', 't.co', 'linkedin.com', 'lnkd.in', 'facebook.com', 'fb.com', 'instagram.com', 'reddit.com', 'youtube.com', 'youtu.be', 'github.com', 'news.ycombinator.com',
  ];

  if (searchHosts.some((s) => hostname === s || hostname.includes(s))) {
    return { channel: 'Organic Search', domain: hostname };
  }
  if (socialHosts.some((s) => hostname === s || hostname.endsWith('.' + s))) {
    return { channel: 'Social', domain: hostname };
  }

  return { channel: 'Referral', domain: hostname };
}

/**
 * Generates an anonymized, read-only snapshot payload for a shared report.
 * Never embeds visitor IDs, raw IPs, emails, API keys, or tracking secrets.
 */
export async function buildAnonymizedReportSnapshot(project, { range = '7d' } = {}) {
  const days = range === '24h' ? 1 : range === '30d' ? 30 : 7;
  const now = new Date();
  const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const startIso = start.toISOString();

  const [{ data: viewsRows }, { data: visitorRows }, { data: sessionRows }, { data: counter }] =
    await Promise.all([
      supabase
        .from('page_views')
        .select('page_url, path, title, referrer, viewed_at, created_at, visitor_id')
        .eq('project_id', project.id)
        .gte('created_at', startIso)
        .limit(50000),
      supabase
        .from('visitors')
        .select('referrer, device_type, browser, os, operating_system, country, country_name, country_code, last_seen_at, last_seen')
        .eq('project_id', project.id)
        .gte('last_seen', startIso)
        .limit(50000),
      supabase
        .from('sessions')
        .select('referrer, utm_source, utm_medium, utm_campaign, device_type, browser, operating_system, country_code, started_at')
        .eq('project_id', project.id)
        .gte('started_at', startIso)
        .limit(50000),
      supabase
        .from('counters')
        .select('count')
        .eq('project_id', project.id)
        .maybeSingle(),
    ]);

  const trafficMap = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    trafficMap[key] = 0;
  }

  const pageMap = {};
  const uniqueVisitorCount = new Set();
  (viewsRows || []).forEach((v) => {
    if (v.visitor_id) uniqueVisitorCount.add(String(v.visitor_id));
    const ts = String(v.viewed_at || v.created_at || '').slice(0, 10);
    if (trafficMap[ts] !== undefined) trafficMap[ts] += 1;

    let path = v.path || '/';
    if (!v.path && v.page_url) {
      try {
        path = new URL(v.page_url).pathname;
      } catch {
        path = v.page_url;
      }
    }
    if (!pageMap[path]) pageMap[path] = { url: path, title: v.title || path, views: 0 };
    pageMap[path].views += 1;
  });

  const trafficData = Object.entries(trafficMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([fullDate, views]) => ({
      fullDate,
      name: new Date(`${fullDate}T00:00:00Z`).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
      }),
      views,
    }));

  const topPages = Object.values(pageMap)
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  const sourceMap = {};
  const deviceMap = {};
  const countryMap = {};
  (visitorRows || []).forEach((v) => {
    const { domain } = classifyReferrerSource(v.referrer);
    sourceMap[domain] = (sourceMap[domain] || 0) + 1;

    const dev = v.device_type || 'desktop';
    deviceMap[dev] = (deviceMap[dev] || 0) + 1;

    const country = v.country_name || v.country || 'Unknown';
    if (country !== 'Unknown') countryMap[country] = (countryMap[country] || 0) + 1;
  });

  const palette = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
  const topReferrers = Object.entries(sourceMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)
    .map((item, idx) => ({ ...item, color: palette[idx] || '#CBD5E1' }));

  const deviceStats = Object.entries(deviceMap).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value,
    color: key === 'desktop' ? '#3B82F6' : key === 'mobile' ? '#10B981' : '#F59E0B',
  }));

  const countryStats = Object.entries(countryMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const totalViewsInRange = (viewsRows || []).length;
  const totalSessions = (sessionRows || []).length || Math.min(uniqueVisitorCount.size, totalViewsInRange);

  return {
    total_views: counter?.count ?? totalViewsInRange,
    current_month_views: totalViewsInRange,
    uniqueVisitors: uniqueVisitorCount.size || (visitorRows || []).length,
    sessions: totalSessions,
    pagesPerSession: totalSessions > 0 ? Math.round((totalViewsInRange / totalSessions) * 100) / 100 : 0,
    trafficData,
    topPages,
    topReferrers,
    deviceStats,
    countryStats,
    snapshotAt: now.toISOString(),
    range,
  };
}

export async function createSharedReport({ project, user, body = {} }) {
  const plan = normalizePlanId(user.plan || 'nano');
  const planConfig = getPlanConfig(plan);

  if (!planConfig.features.limited_report_sharing) {
    throw AppError.forbidden('Report sharing is not included in your plan', 'FEATURE_LOCKED');
  }

  // Reject restricted capabilities cleanly on Nano (or non-entitled plans)
  if (body.customBranding && plan === 'nano') {
    throw AppError.forbidden('Custom branding on shared reports is not available on the Nano plan', 'FEATURE_LOCKED');
  }
  if ((body.schedule || body.automatedEmail) && !planConfig.features.scheduled_reports) {
    throw AppError.forbidden('Scheduled/automated reports require a Pro or Max plan', 'FEATURE_LOCKED');
  }
  if (body.password && plan === 'nano') {
    throw AppError.forbidden('Password-protected shared links are disabled on the Nano plan', 'FEATURE_LOCKED');
  }
  if (body.advancedBuilder && plan === 'nano') {
    throw AppError.forbidden('Advanced report builder is disabled on the Nano plan', 'FEATURE_LOCKED');
  }

  const limit = planConfig.limits.shared_reports_per_month;
  const expiryDays = planConfig.limits.share_link_expiry_days;
  const currentMonth = getUtcMonth();
  const range = ['24h', '7d', '30d'].includes(body.range)
    ? (plan === 'nano' && body.range === '30d' ? '7d' : body.range)
    : '7d';

  return enqueueShareCheck(`share:${user.id}:${currentMonth}`, async () => {
    // Check atomic RPC quota first
    let used = 0;
    const { data: rpcQuota, error: rpcErr } = await supabase.rpc('check_shared_report_quota', {
      p_user_id: user.id,
      p_month: currentMonth,
      p_limit: limit,
    });

    if (!rpcErr && rpcQuota && typeof rpcQuota.allowed === 'boolean') {
      used = Number(rpcQuota.used || 0);
      if (!rpcQuota.allowed) {
        await NotificationService.create(
          user.id,
          'Plan Limit Reached',
          `Monthly shared report limit reached (${used}/${limit} on ${planConfig.name} plan). Upgrade to share additional reports.`,
          'warning'
        );
        throw AppError.limitExceeded(
          `Monthly shared report limit reached (${used}/${limit} on ${planConfig.name} plan). Upgrade to share more.`,
          { used, limit, plan }
        );
      }
    } else {
      const { count } = await supabase
        .from('shared_reports')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('month', currentMonth);
      used = count || 0;
      if (used >= limit) {
        await NotificationService.create(
          user.id,
          'Plan Limit Reached',
          `Monthly shared report limit reached (${used}/${limit} on ${planConfig.name} plan). Upgrade to share additional reports.`,
          'warning'
        );
        throw AppError.limitExceeded(
          `Monthly shared report limit reached (${used}/${limit} on ${planConfig.name} plan). Upgrade to share more.`,
          { used, limit, plan }
        );
      }
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashShareToken(rawToken);
    const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString();
    const snapshot = await buildAnonymizedReportSnapshot(project, { range });

    const { data: created, error: insertErr } = await supabase
      .from('shared_reports')
      .insert({
        project_id: project.id,
        user_id: user.id,
        month: currentMonth,
        token_hash: tokenHash,
        report_title: String(body.title || `${project.name} Analytics Snapshot`).slice(0, 120),
        range_key: range,
        snapshot_data: snapshot,
        expires_at: expiresAt,
      })
      .select('id, project_id, month, report_title, range_key, expires_at, revoked_at, created_at')
      .single();

    if (insertErr) throw insertErr;

    await NotificationService.create(
      user.id,
      'Shared Report Created',
      `Created read-only snapshot report for "${project.name}" (expires ${expiresAt.slice(0, 10)} UTC).`,
      'activity'
    );

    await ActivityLogService.log(
      project.id,
      user.id,
      'report.shared',
      `Created shared snapshot report (${used + 1}/${limit} this month)`,
      'success',
      null,
      { report_id: created.id, expires_at: expiresAt }
    );

    return {
      report: created,
      share_token: rawToken,
      quota: {
        used: used + 1,
        limit,
        remaining: Math.max(0, limit - (used + 1)),
        expiryDays,
      },
    };
  });
}

export async function listProjectSharedReports(projectId, user) {
  const plan = normalizePlanId(user.plan || 'nano');
  const planConfig = getPlanConfig(plan);
  const currentMonth = getUtcMonth();

  const { data: reports, error } = await supabase
    .from('shared_reports')
    .select('id, project_id, month, report_title, range_key, expires_at, revoked_at, created_at')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const { count: usedThisMonth } = await supabase
    .from('shared_reports')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('month', currentMonth);

  const limit = planConfig.limits.shared_reports_per_month;
  const used = usedThisMonth || 0;

  return {
    reports: (reports || []).map((r) => ({
      ...r,
      expired: new Date(r.expires_at) <= new Date(),
      active: !r.revoked_at && new Date(r.expires_at) > new Date(),
    })),
    quota: {
      used,
      limit,
      remaining: Math.max(0, limit - used),
      expiryDays: planConfig.limits.share_link_expiry_days,
    },
  };
}

export async function revokeSharedReport({ projectId, userId, reportId = null }) {
  let query = supabase
    .from('shared_reports')
    .update({ revoked_at: new Date().toISOString() })
    .eq('project_id', projectId)
    .eq('user_id', userId)
    .is('revoked_at', null);

  if (reportId) {
    query = query.eq('id', reportId);
  }

  const { data, error } = await query.select('id');
  if (error) throw error;

  await supabase
    .from('projects')
    .update({ share_token: null })
    .eq('id', projectId)
    .eq('user_id', userId);

  return { success: true, revokedCount: data?.length || 0 };
}

export async function resolvePublicSharedReport(rawToken) {
  if (!rawToken || typeof rawToken !== 'string') {
    throw AppError.notFound('Report not found or link is invalid');
  }

  const tokenHash = hashShareToken(rawToken);
  const { data: report } = await supabase
    .from('shared_reports')
    .select('id, project_id, report_title, range_key, snapshot_data, expires_at, revoked_at, created_at')
    .eq('token_hash', tokenHash)
    .maybeSingle();

  if (!report) {
    throw AppError.notFound('Report not found or link is invalid', 'REPORT_NOT_FOUND');
  }

  if (report.revoked_at) {
    throw AppError.notFound('This shared report link has been revoked', 'REPORT_REVOKED');
  }

  if (new Date(report.expires_at) <= new Date()) {
    throw new AppError(410, 'This shared report link has expired', 'REPORT_EXPIRED');
  }

  const { data: project } = await supabase
    .from('projects')
    .select('name, created_at')
    .eq('id', report.project_id)
    .maybeSingle();

  // Read-only sanitized response: never return project ID, tracking ID, visitor IDs, or owner ID
  return {
    project: {
      name: project?.name || report.report_title || 'WebPulse Report',
      created_at: project?.created_at || report.created_at,
    },
    report: {
      id: report.id,
      title: report.report_title,
      range: report.range_key,
      expiresAt: report.expires_at,
      createdAt: report.created_at,
      readOnly: true,
      snapshot: true,
    },
    stats: report.snapshot_data || {},
  };
}

export default {
  hashShareToken,
  classifyReferrerSource,
  buildAnonymizedReportSnapshot,
  createSharedReport,
  listProjectSharedReports,
  revokeSharedReport,
  resolvePublicSharedReport,
};
