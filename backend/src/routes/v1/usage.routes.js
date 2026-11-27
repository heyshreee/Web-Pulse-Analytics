import express from 'express';
const router = express.Router();
import userController from '../../controllers/user.controller.js';
import auth from '../../middlewares/auth.js';
import { apiPlanLimiter } from '../../middlewares/rateLimiter.js';
import { requireSurfaceAccess } from '../../middlewares/entitlements.js';

router.use(auth);
router.use(apiPlanLimiter);
router.use(requireSurfaceAccess());

router.get('/', userController.getUsageStats);

export default router;
