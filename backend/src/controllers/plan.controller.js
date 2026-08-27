import asyncHandler from '../utils/asyncHandler.js';
import planService from '../services/plan.service.js';

export const getPlans = asyncHandler(async (req, res) => {
    const plans = await planService.getAllPlans();
    res.json(plans);
});

export default { getPlans };
