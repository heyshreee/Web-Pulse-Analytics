import supabase from '../config/supabase.js';
import { getPlanConfig, normalizePlanId } from '../config/plans.js';

/**
 * Deletes expired raw analytics rows (page_views, events, sessions, visitors,
 * event deduplication records) using UTC timestamps strictly according to each
 * project owner's plan retention ceiling (e.g., 7 days for Nano).
 *
 * Never deletes active project configurations (`projects`, `project_origins`,
 * `project_settings`), daily rollups (`analytics_daily`), or monthly usage quotas (`usages`).
 */
export async function cleanupExpiredData({ now = new Date() } = {}) {
  const nowDate = now instanceof Date ? now : new Date(now);
  const nowIso = nowDate.toISOString();

  // Prefer single transactional database RPC when available
  try {
    const { data, error } = await supabase.rpc('cleanup_expired_analytics', {
      p_now: nowIso,
    });
    if (!error && data) {
      const row = Array.isArray(data) ? data[0] : data;
      return { source: 'rpc', ...(row || {}) };
    }
  } catch {
    // Fall back to query-driven UTC cleanup
  }

  const { data: projects, error: projErr } = await supabase
    .from('projects')
    .select('id, user_id, owner_id');

  if (projErr || !Array.isArray(projects)) {
    return { source: 'fallback', projectsProcessed: 0, pageViewsDeleted: 0, eventsDeleted: 0, visitorsDeleted: 0, sessionsDeleted: 0 };
  }

  let pageViewsDeleted = 0;
  let eventsDeleted = 0;
  let sessionsDeleted = 0;
  let visitorsDeleted = 0;
  let dedupDeleted = 0;

  for (const project of projects) {
    const ownerId = project.owner_id || project.user_id;
    let plan = 'nano';
    if (ownerId) {
      const { data: owner } = await supabase
        .from('users')
        .select('plan')
        .eq('id', ownerId)
        .maybeSingle();
      plan = normalizePlanId(owner?.plan || 'nano');
    }

    const planRetention = getPlanConfig(plan).limits.retention_days;
    const { data: settings } = await supabase
      .from('project_settings')
      .select('retention_days')
      .eq('project_id', project.id)
      .maybeSingle();

    const effectiveDays = Math.max(
      1,
      Math.min(
        Number(settings?.retention_days || planRetention),
        Number(planRetention)
      )
    );

    const cutoffIso = new Date(nowDate.getTime() - effectiveDays * 24 * 60 * 60 * 1000).toISOString();

    const { data: delViews } = await supabase
      .from('page_views')
      .delete()
      .eq('project_id', project.id)
      .lt('created_at', cutoffIso)
      .select('id');
    pageViewsDeleted += delViews?.length || 0;

    const { data: delEvents } = await supabase
      .from('events')
      .delete()
      .eq('project_id', project.id)
      .lt('occurred_at', cutoffIso)
      .select('id');
    eventsDeleted += delEvents?.length || 0;

    const { data: delSessions } = await supabase
      .from('sessions')
      .delete()
      .eq('project_id', project.id)
      .lt('last_activity_at', cutoffIso)
      .select('id');
    sessionsDeleted += delSessions?.length || 0;

    const { data: delVisitors } = await supabase
      .from('visitors')
      .delete()
      .eq('project_id', project.id)
      .lt('last_seen_at', cutoffIso)
      .select('id');
    visitorsDeleted += delVisitors?.length || 0;

    const { data: delDedup } = await supabase
      .from('ingested_events')
      .delete()
      .eq('project_id', project.id)
      .lt('created_at', cutoffIso)
      .select('id');
    dedupDeleted += delDedup?.length || 0;
  }

  return {
    source: 'fallback',
    projectsProcessed: projects.length,
    pageViewsDeleted,
    eventsDeleted,
    sessionsDeleted,
    visitorsDeleted,
    dedupDeleted,
    executedAt: nowIso,
  };
}

export default { cleanupExpiredData };
