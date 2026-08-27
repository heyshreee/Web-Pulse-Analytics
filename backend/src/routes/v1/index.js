import express from 'express';
const router = express.Router();
import csrf from '../../middleware/csrf.js';

// Import sub-routers
import authRoutes from './auth.routes.js';
import projectRoutes from './projects.routes.js';
import analyticsRoutes from './analytics.routes.js';
import trackRoutes from './track.routes.js';
import usageRoutes from './usage.routes.js';
import notificationRoutes from './notification.routes.js';
import activityRoutes from './activity.routes.js';
import paymentRoutes from './payment.routes.js';
import userRoutes from './user.routes.js';

// Apply CSRF protection to all non-GET v1 routes, except public tracking
router.use((req, res, next) => {
    if (req.path.startsWith('/track')) {
        return next();
    }
    csrf(req, res, next);
});

// Mount sub-routers
router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/track', trackRoutes);
router.use('/usage', usageRoutes);

router.use('/notifications', notificationRoutes);
router.use('/activity', activityRoutes);
router.use('/payment', paymentRoutes);
router.use('/user', userRoutes);

export default router;
