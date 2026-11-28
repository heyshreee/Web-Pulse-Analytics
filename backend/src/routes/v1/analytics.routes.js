import express from 'express';
const router = express.Router();
import projectController from '../../controllers/project.controller.js';
import visitorController from '../../controllers/visitor.controller.js';
import analyticsController from '../../controllers/analytics.controller.js';
import trackingCors from '../../middlewares/trackingCors.js';
import auth from '../../middlewares/auth.js';
import rateLimiter, { apiPlanLimiter } from '../../middlewares/rateLimiter.js';
import { requireFeature, requireSurfaceAccess } from '../../middlewares/entitlements.js';

// Public Analytics (Standard SaaS API). Customer sites call this with an
// x-api-key header, so it uses the public, non-credentialed CORS policy.
router.options('/count', trackingCors);
router.get('/count', trackingCors, rateLimiter, visitorController.getEventCount);

router.use(auth);
router.use(apiPlanLimiter);
router.use(requireSurfaceAccess());

// Global & Organization Analytics
router.get('/overview', visitorController.getDashboardStats);
router.get('/organization', analyticsController.getOrganizationAnalytics);
router.get('/globe', requireFeature('globe_analyze'), analyticsController.getGlobeAnalyze);

// Project Analytics
router.get('/projects/:id/overview', projectController.getProjectStats);
router.get('/projects/:id/traffic', visitorController.getProjectDetailedStats);
router.get('/projects/:id/pages', projectController.getProjectPages);
router.get('/projects/:id/activity', projectController.getProjectActivity);
router.get('/projects/:id/sources', analyticsController.getSources);
router.get('/projects/:id/countries', analyticsController.getCountries);
router.get('/projects/:id/devices', analyticsController.getDevices);
router.get('/projects/:id/globe', requireFeature('globe_analyze'), analyticsController.getGlobeAnalyze);
router.get('/projects/:id/export', analyticsController.exportProjectAnalytics);

export default router;
