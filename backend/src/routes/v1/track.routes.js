import express from 'express';
const router = express.Router();
import visitorController from '../../controllers/visitor.controller.js';
import rateLimiter from '../../middleware/rateLimiter.js';
import trackingCors from '../../middleware/trackingCors.js';

// Standard SaaS Tracking Endpoints (v1)
// These apply CORS to all origins as they are public tracking endpoints
router.post('/events', rateLimiter, visitorController.trackEvent);
router.get('/script.js', visitorController.getTrackerScript);

// Public tracking endpoints (Legacy /:trackingId style) - apply CORS to all methods including OPTIONS
router.use('/:trackingId', trackingCors);
router.post('/:trackingId', rateLimiter, visitorController.trackVisitorPublic);
router.get('/:trackingId', visitorController.getVisitorCountPublic);
router.get('/:trackingId/script.js', visitorController.getTrackerScript);

export default router;
