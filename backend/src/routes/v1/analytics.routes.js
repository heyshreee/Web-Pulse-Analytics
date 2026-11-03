import express from 'express';
const router = express.Router();
import projectController from '../../controllers/project.controller.js';
import visitorController from '../../controllers/visitor.controller.js';
import trackingCors from '../../middleware/trackingCors.js';
import auth from '../../middleware/auth.js';

// Public Analytics (Standard SaaS API). Customer sites call this with an
// x-api-key header, so it uses the public, non-credentialed CORS policy.
router.options('/count', trackingCors);
router.get('/count', trackingCors, visitorController.getEventCount);

router.use(auth);

// Global Analytics
router.get('/overview', visitorController.getDashboardStats);

// Project Analytics
router.get('/projects/:id/overview', projectController.getProjectStats);
router.get('/projects/:id/traffic', visitorController.getProjectDetailedStats);
router.get('/projects/:id/pages', projectController.getProjectPages);
router.get('/projects/:id/activity', projectController.getProjectActivity);

export default router;
