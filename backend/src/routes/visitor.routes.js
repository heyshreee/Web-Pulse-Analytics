import express from 'express';
const router = express.Router();
import visitorController from '../controllers/visitor.controller.js';
import rateLimiter from '../middleware/rateLimiter.js';
import auth from '../middleware/auth.js';

// Public endpoint for tracking (no auth required)
router.post('/track', rateLimiter, visitorController.trackVisitor);

// Protected endpoints
router.get('/live', auth, visitorController.getLiveVisitors);
router.get('/dashboard-stats', auth, visitorController.getDashboardStats);

export default router;
