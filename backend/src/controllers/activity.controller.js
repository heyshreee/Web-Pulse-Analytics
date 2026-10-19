import ActivityLogService from '../services/activity.service.js';
import supabase from '../config/supabase.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../errors/AppError.js';

export const getProjectLogs = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { page, limit, search, type, days } = req.query;
    const userId = req.user.id;

    if (projectId) {
        // The service scopes queries by project_id alone, so verify the caller
        // actually owns the project before exposing its activity logs.
        const { data: project } = await supabase
            .from('projects')
            .select('id')
            .eq('id', projectId)
            .eq('user_id', userId)
            .maybeSingle();

        if (!project) throw AppError.notFound('Project not found');
    }

    const result = await ActivityLogService.getLogs(projectId, userId, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        search,
        type,
        days
    });

    res.json(result);
});

export default { getProjectLogs };
