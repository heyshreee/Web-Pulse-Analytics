import ActivityLogService from '../services/activity.service.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getProjectLogs = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { page, limit, search, type, days } = req.query;
    const userId = req.user.id;

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
