import express from 'express';
const router = express.Router();
import activityController from '../../controllers/activity.controller.js';
import requireAuth from '../../middleware/auth.js';

router.get('/:projectId', requireAuth, activityController.getProjectLogs);
router.get('/', requireAuth, activityController.getProjectLogs);

export default router;
