import supabase from '../config/supabase.js';
import NotificationService from './notification.service.js';
import ActivityLogService from './activity.service.js';
import {
  PLAN_ALIASES,
  PLANS,
  getPlanConfig,
  getPlanLimits,
  normalizePlanId,
} from '../config/plans.js';

export { PLAN_ALIASES, PLANS, getPlanLimits, getPlanConfig, normalizePlanId };

// Per-user in-process async mutex for environments where DB RPC is absent (e.g., tests or un-migrated DB)
const userQuotaQueues = new Map();
const sentMonthlyAlerts = new Map();

function getUtcMonthKey(date = new Date()) {
  return date.toISOString().slice(0, 7);
}

export function getNextUtcMonthResetDate(date = new Date()) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  return new Date(Date.UTC(year, month + 1, 1, 0, 0, 0, 0)).toISOString();
}

function enqueueForUser(key, task) {
  const prev = userQuotaQueues.get(key) || Promise.resolve();
  const next = prev.then(task, task);
  userQuotaQueues.set(key, next.catch(() => {}));
  return next;
}

async function emitQuotaThresholdNotification(userId, totalViews, monthlyLimit, resetDate) {
  if (!userId || !monthlyLimit || monthlyLimit <= 0) return null;

  const monthKey = getUtcMonthKey();
  const pct = (totalViews / monthlyLimit) * 100;
  let level = null;
  let title = null;
  let message = null;
  let type = 'info';

  if (totalViews >= monthlyLimit) {
    level = '100';
    type = 'error';
    title = 'Usage Alert: Monthly Limit Reached';
    message = `You have reached 100% of your monthly tracking limit (${monthlyLimit.toLocaleString()} events). Additional billable events are paused until ${resetDate.slice(0, 10)} UTC. Upgrade your plan for higher capacity.`;
  } else if (pct >= 90) {
    level = '90';
    type = 'warning';
    title = 'Usage Warning: 90% Quota Used';
    message = `You have used ${totalViews.toLocaleString()} of ${monthlyLimit.toLocaleString()} monthly events (90%+). Upgrade soon to avoid tracking interruption.`;
  } else if (pct >= 80) {
    level = '80';
    type = 'info';
    title = 'Usage Notice: 80% Quota Used';
    message = `You have used ${totalViews.toLocaleString()} of ${monthlyLimit.toLocaleString()} monthly events (80%+). Quotas reset on ${resetDate.slice(0, 10)} UTC.`;
  }

  if (!level) return null;

  const dedupKey = `${userId}:${monthKey}:${level}`;
  if (sentMonthlyAlerts.has(dedupKey)) return level;
  sentMonthlyAlerts.set(dedupKey, true);

  await NotificationService.create(userId, title, message, type);
  return level;
}

/**
 * Calculate current usage, plan entitlements, and billing-cycle status for a user.
 */
export const calculateUsage = async (userId) => {
  const now = new Date();
  const currentMonth = getUtcMonthKey(now);
  const resetDate = getNextUtcMonthResetDate(now);

  const { data: user } = await supabase
    .from('users')
    .select('plan')
    .eq('id', userId)
    .single();

  const rawPlan = user?.plan || 'nano';
  const plan = normalizePlanId(rawPlan);
  const cfg = getPlanConfig(plan);
  const limits = getPlanLimits(plan);

  const { data: projects } = await supabase
    .from('projects')
    .select('id')
    .eq('user_id', userId);

  let totalViews = 0;
  if (projects && projects.length > 0) {
    const projectIds = projects.map((p) => p.id);
    const { data: usages } = await supabase
      .from('usages')
      .select('views, count')
      .in('project_id', projectIds)
      .eq('month', currentMonth);

    if (usages) {
      totalViews = usages.reduce((acc, curr) => acc + (curr.views ?? curr.count ?? 0), 0);
    }
  }

  const [{ count: visitorCount }, { count: viewCount }] = await Promise.all([
    supabase.from('visitors').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('page_views').select('*', { count: 'exact', head: true }).eq('user_id', userId),
  ]);

  // Realistic metadata footprint (~2 KB per visitor/view row)
  const visitorStorage = (visitorCount || 0) * 2048;
  const viewStorage = (viewCount || 0) * 2048;
  const storageUsed = visitorStorage + viewStorage;

  // Non-blocking background sync of cached user storage columns
  supabase
    .from('users')
    .update({
      storage_used: Math.round(storageUsed),
      storage_limit: Math.round(limits.storageLimit),
    })
    .eq('id', userId)
    .then(({ error }) => {
      if (error && !error.message?.includes('fetch failed') && error.code !== 'UND_ERR_CONNECT_TIMEOUT') {
        console.error('Failed to update storage stats in supabase:', error);
      }
    })
    .catch(() => {});

  // Count shared reports created during the current UTC billing month
  let shareReportCount = 0;
  try {
    const { count, error: srErr } = await supabase
      .from('shared_reports')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('month', currentMonth);

    if (!srErr && count !== null && count !== undefined) {
      shareReportCount = count;
    } else {
      const { count: legacyCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .not('share_token', 'is', null);
      shareReportCount = legacyCount || 0;
    }
  } catch {
    shareReportCount = 0;
  }

  const shareLimit = limits.share_report || 0;
  const usagePercent =
    limits.monthlyViews > 0
      ? Math.min(100, Math.round((totalViews / limits.monthlyViews) * 1000) / 10)
      : 0;

  return {
    totalViews,
    monthlyLimit: limits.monthlyViews,
    monthlyViews: limits.monthlyViews,
    usagePercent,
    quotaExceeded: totalViews >= limits.monthlyViews,
    billingMonth: currentMonth,
    resetDate,
    storageUsed,
    storageLimit: limits.storageLimit,
    storageBreakdown: {
      visitors: visitorStorage,
      pageViews: viewStorage,
    },
    plan,
    projectLimit: limits.projectLimit,
    liveLogs: limits.liveLogs,
    emailIntegrity: limits.emailIntegrity,
    allowedOriginsLimit: limits.allowedOriginsLimit,
    teamMembersLimit: limits.teamMembersLimit,
    retentionDays: limits.retentionDays,
    refreshRate: limits.refreshRate,
    apiRequestsPerMinute: limits.apiRequestsPerMinute,
    ingestionEventsPerSecond: limits.ingestionEventsPerSecond,
    ingestionBurst: limits.ingestionBurst,
    share_report: {
      used: shareReportCount,
      limit: shareLimit,
      remaining: Math.max(0, shareLimit - shareReportCount),
      expiryDays: limits.shareLinkExpiryDays,
    },
    limits: { ...cfg.limits },
    features: { ...cfg.features },
    access: { ...cfg.access },
    projectCount: projects?.length || 0,
  };
};

/**
 * Calculate storage and stats for a specific project
 */
export const calculateProjectUsage = async (projectId) => {
  const [{ count: visitorCount }, { count: viewCount }] = await Promise.all([
    supabase.from('visitors').select('*', { count: 'exact', head: true }).eq('project_id', projectId),
    supabase.from('page_views').select('*', { count: 'exact', head: true }).eq('project_id', projectId),
  ]);

  const visitorStorage = (visitorCount || 0) * 2048;
  const viewStorage = (viewCount || 0) * 2048;
  const storageUsed = visitorStorage + viewStorage;

  const { data: sessions } = await supabase
    .from('visitors')
    .select('session_id')
    .eq('project_id', projectId);

  const uniqueSessions = new Set(sessions?.map((s) => s.session_id)).size;

  return {
    storageUsed,
    storageBreakdown: {
      visitors: visitorStorage,
      pageViews: viewStorage,
    },
    visitorCount: visitorCount || 0,
    viewCount: viewCount || 0,
    sessionCount: uniqueSessions,
  };
};

/**
 * Atomically checks and consumes 1 billable event from the owner's monthly quota.
 * Duplicate eventIds return `{ allowed: true, duplicate: true }` without consuming quota.
 */
export const consumeEventQuota = async (userId, projectId, eventId = null) => {
  const now = new Date();
  const currentMonth = getUtcMonthKey(now);
  const resetDate = getNextUtcMonthResetDate(now);

  const { data: user } = await supabase
    .from('users')
    .select('plan')
    .eq('id', userId)
    .single();

  const plan = normalizePlanId(user?.plan || 'nano');
  const limits = getPlanLimits(plan);
  const monthlyLimit = limits.monthlyViews;

  const cleanEventId = eventId ? String(eventId).trim().slice(0, 128) : null;

  // Try database-level advisory-locked RPC first
  const { data: rpcResult, error: rpcError } = await supabase.rpc('consume_monthly_event_quota', {
    p_user_id: userId,
    p_project_id: projectId,
    p_month: currentMonth,
    p_limit: monthlyLimit,
    p_event_id: cleanEventId,
  });

  if (!rpcError && rpcResult && typeof rpcResult.allowed === 'boolean') {
    const total = Number(rpcResult.current_total ?? 0);
    await emitQuotaThresholdNotification(userId, total, monthlyLimit, resetDate);

    return {
      allowed: rpcResult.allowed,
      duplicate: Boolean(rpcResult.duplicate),
      currentTotal: total,
      monthlyLimit,
      plan,
      resetDate,
      reason: rpcResult.allowed
        ? null
        : `Monthly event limit reached on ${plan} plan (${total.toLocaleString()}/${monthlyLimit.toLocaleString()}). Upgrade to continue tracking.`,
    };
  }

  // Serialized per-user fallback when RPC is unavailable (local un-migrated schema or unit tests)
  return enqueueForUser(`${userId}:${currentMonth}`, async () => {
    if (cleanEventId) {
      const { data: existingDedup } = await supabase
        .from('ingested_events')
        .select('id')
        .eq('project_id', projectId)
        .eq('event_id', cleanEventId)
        .maybeSingle();

      if (existingDedup) {
        const usage = await calculateUsage(userId);
        return {
          allowed: true,
          duplicate: true,
          currentTotal: usage.totalViews,
          monthlyLimit,
          plan,
          resetDate,
          reason: null,
        };
      }
    }

    const usage = await calculateUsage(userId);
    if (usage.totalViews >= monthlyLimit) {
      await emitQuotaThresholdNotification(userId, usage.totalViews, monthlyLimit, resetDate);
      return {
        allowed: false,
        duplicate: false,
        currentTotal: usage.totalViews,
        monthlyLimit,
        plan,
        resetDate,
        reason: `Monthly event limit reached on ${plan} plan (${usage.totalViews.toLocaleString()}/${monthlyLimit.toLocaleString()}). Upgrade to continue tracking.`,
      };
    }

    if (cleanEventId) {
      const { error: dedupErr } = await supabase.from('ingested_events').insert({
        project_id: projectId,
        event_id: cleanEventId,
        month: currentMonth,
      });

      if (dedupErr && dedupErr.code === '23505') {
        return {
          allowed: true,
          duplicate: true,
          currentTotal: usage.totalViews,
          monthlyLimit,
          plan,
          resetDate,
          reason: null,
        };
      }
    }

    const { data: existingRow } = await supabase
      .from('usages')
      .select('views, count')
      .eq('project_id', projectId)
      .eq('month', currentMonth)
      .maybeSingle();

    if (existingRow) {
      const nextViews = (existingRow.views ?? existingRow.count ?? 0) + 1;
      await supabase
        .from('usages')
        .update({ views: nextViews, count: nextViews, updated_at: new Date().toISOString() })
        .eq('project_id', projectId)
        .eq('month', currentMonth);
    } else {
      await supabase.from('usages').insert({
        user_id: userId,
        project_id: projectId,
        event_type: 'event',
        count: 1,
        period: currentMonth,
        month: currentMonth,
        views: 1,
      });
    }

    const newTotal = usage.totalViews + 1;
    await emitQuotaThresholdNotification(userId, newTotal, monthlyLimit, resetDate);

    return {
      allowed: true,
      duplicate: false,
      currentTotal: newTotal,
      monthlyLimit,
      plan,
      resetDate,
      reason: null,
    };
  });
};

/**
 * Check if a user can perform an action (create_project, share_report, track).
 */
export const checkLimit = async (userId, type = 'track') => {
  const usage = await calculateUsage(userId);

  if (type === 'create_project') {
    const { count } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const projectsOk = (count || 0) < usage.projectLimit;

    if (!projectsOk) {
      await NotificationService.create(
        userId,
        'Plan Limit Reached',
        `You have reached the maximum number of projects (${usage.projectLimit}) for your ${usage.plan} plan. Upgrade to create more.`,
        'warning'
      );

      const { data: projects } = await supabase
        .from('projects')
        .select('id')
        .eq('user_id', userId)
        .limit(1);

      if (projects && projects.length > 0) {
        await ActivityLogService.log(
          projects[0].id,
          userId,
          'Plan Limit Reached',
          `Project creation blocked: ${usage.plan} plan limit of ${usage.projectLimit} project(s) reached`,
          'warning',
          null,
          {
            event_type: 'system.limit',
            plan: usage.plan,
          }
        );
      }
    }

    return {
      canTrack: projectsOk,
      reason: !projectsOk
        ? `Project limit reached (${count || 0}/${usage.projectLimit} on ${usage.plan} plan). Upgrade your plan to create more projects.`
        : null,
      usage,
    };
  }

  if (type === 'share_report') {
    const limit = usage.share_report.limit || 0;
    const used = usage.share_report.used || 0;
    const shareReportOk = used < limit;

    if (!shareReportOk) {
      const reason =
        limit === 0
          ? 'Your current plan does not include public share reports. Upgrade to a paid plan to share.'
          : `You have reached the monthly allowance of ${limit} shared report(s) on your ${usage.plan} plan. Upgrade to share more.`;
      await NotificationService.create(userId, 'Plan Limit Reached', reason, 'warning');
    }

    return {
      canTrack: shareReportOk,
      reason: !shareReportOk
        ? limit === 0
          ? 'Share reports are not included in your current plan. Upgrade to a paid plan.'
          : `Monthly shared report limit reached (${used}/${limit}). Upgrade your plan to share more.`
        : null,
      usage,
    };
  }

  const viewsOk = usage.totalViews < usage.monthlyLimit;
  await emitQuotaThresholdNotification(userId, usage.totalViews, usage.monthlyLimit, usage.resetDate);

  if (!viewsOk) {
    return {
      canTrack: false,
      reason: `Monthly event limit reached on ${usage.plan} plan (${usage.totalViews.toLocaleString()}/${usage.monthlyLimit.toLocaleString()}). Resets on ${usage.resetDate.slice(0, 10)} UTC.`,
      usage,
    };
  }

  return {
    canTrack: true,
    reason: null,
    usage,
  };
};

export const __resetAlertCacheForTests = () => {
  sentMonthlyAlerts.clear();
  userQuotaQueues.clear();
};

export default {
  PLAN_ALIASES,
  PLANS,
  normalizePlanId,
  getPlanConfig,
  getPlanLimits,
  calculateUsage,
  calculateProjectUsage,
  consumeEventQuota,
  checkLimit,
  getNextUtcMonthResetDate,
};
