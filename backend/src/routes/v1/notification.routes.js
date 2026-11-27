import express from 'express';
const router = express.Router();
import notificationController from '../../controllers/notification.controller.js';
import auth from '../../middlewares/auth.js';
import { requireSurfaceAccess } from '../../middlewares/entitlements.js';

router.use(auth);
router.use(requireSurfaceAccess());

router.get('/', notificationController.getNotifications);
router.put('/:id/read', notificationController.markAsRead);
router.put('/read-all', notificationController.markAllAsRead);
router.delete('/:id', notificationController.deleteNotification);

export default router;
