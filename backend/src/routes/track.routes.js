import express from 'express';
const router = express.Router();
import visitorController from '../controllers/visitor.controller.js';
import rateLimiter from '../middleware/rateLimiter.js';

import trackingCors from '../middleware/trackingCors.js';

// Apply CORS middleware to all tracking routes
router.use('/:trackingId', trackingCors);

// Public tracking endpoint (POST /api/track/:trackingId)
router.post('/:trackingId', rateLimiter, visitorController.trackVisitorPublic);

// Public stats endpoint (GET /api/track/:trackingId)
router.get('/:trackingId', visitorController.getVisitorCountPublic);

export default router;
