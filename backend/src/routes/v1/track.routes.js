import express from 'express';
const router = express.Router();
import visitorController from '../../controllers/visitor.controller.js';
import rateLimiter from '../../middleware/rateLimiter.js';
import trackingCors from '../../middleware/trackingCors.js';

// Public tracking endpoints. trackingCors owns CORS (including preflight) for
// every route here so customer-site origins are never mixed with API CORS.
// Routes without a tracking ID use the open, non-credentialed policy. The
// parameterized mount below is required so project-specific origin validation
// can read req.params.trackingId.
router.options('/events', trackingCors);
router.options('/script.js', trackingCors);
router.post('/events', trackingCors, rateLimiter, visitorController.trackEvent);
router.get('/script.js', trackingCors, visitorController.getTrackerScript);

// Public tracking endpoints (Legacy /:trackingId style)
router.use('/:trackingId', trackingCors);
router.post('/:trackingId', rateLimiter, visitorController.trackVisitorPublic);
router.get('/:trackingId', visitorController.getVisitorCountPublic);
router.get('/:trackingId/script.js', visitorController.getTrackerScript);

export default router;
