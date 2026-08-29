import supabase from '../config/supabase.js';
import NotificationService from './notification.service.js';
import ActivityLogService from './activity.service.js';

const PLAN_LIMITS = {
    free: {
        monthlyViews: 1000,
        storageLimit: 1 * 1024 * 1024 * 1024, // 1GB
        projectLimit: 1,
        liveLogs: false,
        emailIntegrity: false,
        allowedOriginsLimit: 1,
        share_report: 0,
        amount: 0
    },
    basic: {
        monthlyViews: 50000,
        storageLimit: 5 * 1024 * 1024 * 1024, // 5GB
        projectLimit: 5,
        liveLogs: false,
        emailIntegrity: false,
        allowedOriginsLimit: 3,
        share_report: 0,
        amount: 299
    },
    pro: {
        monthlyViews: 500000,
        storageLimit: 15 * 1024 * 1024 * 1024, // 15GB
        projectLimit: 15,
        liveLogs: true,
        emailIntegrity: true,
        allowedOriginsLimit: 10,
        share_report: 5,
        amount: 999
    },
    business: {
        monthlyViews: 5000000,
        storageLimit: 100 * 1024 * 1024 * 1024, // 100GB
        projectLimit: 100,
        liveLogs: true,
        emailIntegrity: true,
        allowedOriginsLimit: 100,
        share_report: 100,
        amount: 2999
    }
};

/**
 * Get limits for a specific plan
 */
export const getPlanLimits = (plan = 'free') => {
    return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
};

/**
 * Calculate current usage for a user
 */
export const calculateUsage = async (userId) => {
    const currentMonth = new Date().toISOString().slice(0, 7);

    // 1. Get user plan
    const { data: user } = await supabase
        .from('users')
        .select('plan')
        .eq('id', userId)
        .single();

    const plan = user?.plan || 'free';
    const limits = getPlanLimits(plan);

    // 2. Calculate Views (Current Month)
    const { data: projects } = await supabase
        .from('projects')
        .select('id')
        .eq('user_id', userId);

    let totalViews = 0;
    if (projects && projects.length > 0) {
        const projectIds = projects.map(p => p.id);
        const { data: usages } = await supabase
            .from('usages')
            .select('views')
            .in('project_id', projectIds)
            .eq('month', currentMonth);

        if (usages) {
            totalViews = usages.reduce((acc, curr) => acc + curr.views, 0);
        }
    }

    // 3. Calculate Storage (Estimated)
    const [{ count: visitorCount }, { count: viewCount }] = await Promise.all([
        supabase.from('visitors').select('*', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('page_views').select('*', { count: 'exact', head: true }).eq('user_id', userId)
    ]);

    // Estimate: ~1.35MB per visitor row, ~1.35MB per page_view row (Fake/Inflated with float)
    const visitorStorage = (visitorCount || 0) * 1024 * 1024 * 1.35;
    const viewStorage = (viewCount || 0) * 1024 * 1024 * 1.35;
    const storageUsed = visitorStorage + viewStorage;

    // Update storage_used in users table (as requested)
    // We do this asynchronously and don't block the return
    supabase.from('users')
        .update({
            storage_used: Math.round(storageUsed),
            storage_limit: Math.round(limits.storageLimit)
        })
        .eq('id', userId)
        .then(({ error }) => {
            if (error) {
                // Determine if it is a transient connection error
                const isTimeout = error.message?.includes('fetch failed') || error.code === 'UND_ERR_CONNECT_TIMEOUT';
                if (isTimeout) {
                    console.warn(`[UsageService] Background updated for userId ${userId} timed out. Will retry next session.`);
                } else {
                    console.error('Failed to update storage stats in supabase:', error);
                }
            }
        })
        .catch(err => {
            const isTimeout = err.message?.includes('fetch failed') || err.code === 'UND_ERR_CONNECT_TIMEOUT';
            if (!isTimeout) {
                console.error(`[UsageService] Unexpected error updating stats for userId ${userId}:`, err.message);
            } else {
                console.warn(`[UsageService] Connectivity timeout updating stats for userId ${userId}`);
            }
        });
    // 4. Calculate Share Reports (Projects with share_token)
    const { count: shareReportCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .not('share_token', 'is', null);

    return {
        totalViews,
        monthlyLimit: limits.monthlyViews,
        monthlyViews: limits.monthlyViews,
        storageUsed,
        storageLimit: limits.storageLimit,
        storageBreakdown: {
            visitors: visitorStorage,
            pageViews: viewStorage
        },
        plan,
        projectLimit: limits.projectLimit,
        liveLogs: limits.liveLogs,
        emailIntegrity: limits.emailIntegrity,
        allowedOriginsLimit: limits.allowedOriginsLimit,
        share_report: {
            used: shareReportCount || 0,
            limit: limits.share_report
        },
        projectCount: projects?.length || 0
    };
};

/**
 * Calculate storage and stats for a specific project
 */
export const calculateProjectUsage = async (projectId) => {
    const [{ count: visitorCount }, { count: viewCount }] = await Promise.all([
        supabase.from('visitors').select('*', { count: 'exact', head: true }).eq('project_id', projectId),
        supabase.from('page_views').select('*', { count: 'exact', head: true }).eq('project_id', projectId)
    ]);

    const visitorStorage = (visitorCount || 0) * 1024 * 1024 * 1.35;
    const viewStorage = (viewCount || 0) * 1024 * 1024 * 1.35;
    const storageUsed = visitorStorage + viewStorage;

    // Calculate sessions per user for this project
    const { data: sessions } = await supabase
        .from('visitors')
        .select('session_id')
        .eq('project_id', projectId);

    const uniqueSessions = new Set(sessions?.map(s => s.session_id)).size;

    return {
        storageUsed,
        storageBreakdown: {
            visitors: visitorStorage,
            pageViews: viewStorage
        },
        visitorCount: visitorCount || 0,
        viewCount: viewCount || 0,
        sessionCount: uniqueSessions
    };
};

/**
 * Check if a user can still track data
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
                `You have reached the maximum number of projects for your plan. Upgrade to create more.`,
                'warning'
            );

            // Log to activity logs
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
                    `Project creation blocked: ${usage.plan} plan limit of ${usage.projectLimit} projects reached`,
                    'warning',
                    null,
                    {
                        event_type: 'system.limit',
                        plan: usage.plan
                    }
                );
            }
        }

        return {
            canTrack: projectsOk,
            reason: !projectsOk ? `Project limit reached (${count || 0}/${usage.projectLimit} on ${usage.plan} plan). Upgrade your plan to create more projects.` : null,
            usage
        };
    }

    if (type === 'share_report') {
        const limit = usage.share_report.limit || 0;
        const used = usage.share_report.used || 0;
        const shareReportOk = used < limit;

        if (!shareReportOk) {
            const reason = limit === 0
                ? 'Your current plan does not include public share reports. Upgrade to a paid plan to share.'
                : `You have reached the maximum of ${limit} share report(s) for your plan. Upgrade to share more.`;
            await NotificationService.create(
                userId,
                'Plan Limit Reached',
                reason,
                'warning'
            );
        }

        return {
            canTrack: shareReportOk,
            reason: !shareReportOk
                ? (limit === 0
                    ? 'Share reports are not included in your current plan. Upgrade to a paid plan.'
                    : `Share report limit reached (${used}/${limit}). Upgrade your plan to share more.`)
                : null,
            usage
        };
    }

    const viewsOk = usage.totalViews < usage.monthlyLimit;
    const storageOk = usage.storageUsed < usage.storageLimit;

    // Check for 80% usage warning
    if (usage.totalViews > usage.monthlyLimit * 0.8 && usage.totalViews < usage.monthlyLimit) {
        await NotificationService.create(
            userId,
            'Usage Alert: Near Limit',
            `You have reached 80% of your monthly tracking limit (${usage.totalViews.toLocaleString()} of ${usage.monthlyLimit.toLocaleString()} events). Upgrade soon to avoid data gaps.`,
            'system'
        );
    }

    // Check for 100% usage
    if (usage.totalViews >= usage.monthlyLimit && viewsOk === false) {
        await NotificationService.create(
            userId,
            'Usage Alert: Limit Reached',
            `You have reached 100% of your monthly tracking limit (${usage.monthlyLimit.toLocaleString()} events). Tracking is now blocked. Upgrade your plan.`,
            'error'
        );
    }

    if (usage.storageUsed >= usage.storageLimit && storageOk === false) {
        await NotificationService.create(
            userId,
            'Storage Alert: Full',
            `You have reached your storage limit. Tracking is now blocked. Upgrade your plan or clear old data.`,
            'error'
        );
    }

    if (!viewsOk || !storageOk) {
        let reason;
        if (!viewsOk && !storageOk) {
            reason = `Plan limits reached on ${usage.plan}: monthly events (${usage.totalViews.toLocaleString()}/${usage.monthlyLimit.toLocaleString()}) and storage (${(usage.storageUsed / 1024 / 1024 / 1024).toFixed(2)}GB/${(usage.storageLimit / 1024 / 1024 / 1024).toFixed(2)}GB). Upgrade to continue tracking.`;
        } else if (!viewsOk) {
            reason = `Monthly event limit reached on ${usage.plan} plan (${usage.totalViews.toLocaleString()}/${usage.monthlyLimit.toLocaleString()}). Upgrade to continue tracking.`;
        } else {
            reason = `Storage limit reached on ${usage.plan} plan (${(usage.storageUsed / 1024 / 1024 / 1024).toFixed(2)}GB/${(usage.storageLimit / 1024 / 1024 / 1024).toFixed(2)}GB). Upgrade or clear old data.`;
        }
        return {
            canTrack: false,
            reason,
            usage
        };
    }

    return {
        canTrack: true,
        reason: null,
        usage
    };
};

export default { getPlanLimits, calculateUsage, calculateProjectUsage, checkLimit };
