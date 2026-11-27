import express from 'express';
const router = express.Router();
import activityController from '../../controllers/activity.controller.js';
import requireAuth from '../../middlewares/auth.js';
import { apiPlanLimiter } from '../../middlewares/rateLimiter.js';
import { requireSurfaceAccess } from '../../middlewares/entitlements.js';

router.use(requireAuth, apiPlanLimiter, requireSurfaceAccess());

router.get('/:projectId', activityController.getProjectLogs);
router.get('/', activityController.getProjectLogs);

export default router;
