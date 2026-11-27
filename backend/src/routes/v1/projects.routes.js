import express from 'express';
const router = express.Router();
import projectController from '../../controllers/project.controller.js';
import originController from '../../controllers/origin.controller.js';
import teamController from '../../controllers/team.controller.js';
import shareController from '../../controllers/share.controller.js';
import analyticsController from '../../controllers/analytics.controller.js';
import apiKeyController from '../../controllers/apiKey.controller.js';
import webhookController from '../../controllers/webhook.controller.js';
import auth from '../../middlewares/auth.js';
import { apiPlanLimiter } from '../../middlewares/rateLimiter.js';
import { requireFeature, requireSurfaceAccess } from '../../middlewares/entitlements.js';

// Public routes
router.get('/share/:shareToken', shareController.getPublicSharedReport);

router.use(auth);
router.use(apiPlanLimiter);
router.use(requireSurfaceAccess());

router.post('/', projectController.createProject);
router.get('/', projectController.getProjects);
router.get('/:id', projectController.getProject);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);
router.get('/:id/settings', projectController.getProjectSettings);
router.put('/:id/settings', projectController.updateProjectSettings);
router.put('/:id/pin', projectController.togglePin);
router.patch('/:id/archive', projectController.archiveProject);
router.post('/:id/regenerate-token', projectController.regenerateShareToken);
router.get('/:id/verify', projectController.verifyProjectInstallation);

// Verified origins management (max 3 on Nano)
router.get('/:id/origins', originController.getProjectOrigins);
router.post('/:id/origins', originController.addProjectOrigin);
router.post('/:id/origins/:originId/verify', originController.verifyProjectOrigin);
router.patch('/:id/origins/:originId/block', originController.toggleBlockProjectOrigin);
router.delete('/:id/origins/:originId', originController.deleteProjectOrigin);

// Team membership (max 1 owner on Nano, max 3 on Lite)
router.get('/:id/members', teamController.getProjectMembers);
router.post('/:id/members', teamController.inviteProjectMember);
router.post('/:id/members/invite', teamController.inviteProjectMember);
router.patch('/:id/members/:memberId/role', teamController.updateProjectMemberRole);
router.delete('/:id/members/:memberId', teamController.removeProjectMember);
router.delete('/:id/invitations/:invitationId', teamController.revokeProjectInvitation);
router.post('/invitations/:token/accept', teamController.acceptProjectInvitation);
router.post('/invitations/:token/reject', teamController.rejectProjectInvitation);

// Shared reports (1/month, 7-day expiry snapshot on Nano)
router.get('/:id/share-reports', shareController.listSharedReports);
router.post('/:id/share-reports', shareController.createSharedReport);
router.delete('/:id/share-reports/:reportId', shareController.revokeSharedReport);

// Project analytics REST API (Section 8)
router.get('/:id/analytics/overview', analyticsController.getOverview);
router.get('/:id/analytics/pages', analyticsController.getPages);
router.get('/:id/analytics/sources', analyticsController.getSources);
router.get('/:id/analytics/countries', analyticsController.getCountries);
router.get('/:id/analytics/devices', analyticsController.getDevices);
router.get('/:id/analytics/globe', requireFeature('globe_analyze'), analyticsController.getGlobeAnalyze);
router.get('/:id/analytics/export', analyticsController.exportProjectAnalytics);

// API Key management (admin/owner)
router.get('/:id/api-keys', apiKeyController.listApiKeys);
router.post('/:id/api-keys', apiKeyController.createApiKey);
router.post('/:id/api-keys/:keyId/rotate', apiKeyController.rotateApiKey);
router.delete('/:id/api-keys/:keyId', apiKeyController.revokeApiKey);

// Webhook management (Pro/Max/Enterprise)
router.get('/:id/webhooks', requireFeature('webhooks'), webhookController.listWebhooks);
router.post('/:id/webhooks', requireFeature('webhooks'), webhookController.createWebhook);
router.post('/:id/webhooks/:webhookId/rotate-secret', requireFeature('webhooks'), webhookController.rotateWebhookSecret);
router.post('/:id/webhooks/:webhookId/test', requireFeature('webhooks'), webhookController.triggerWebhookTest);
router.get('/:id/webhooks/:webhookId/deliveries', requireFeature('webhooks'), webhookController.listWebhookDeliveries);
router.delete('/:id/webhooks/:webhookId', requireFeature('webhooks'), webhookController.deleteWebhook);

// Backward-compatible share-token aliases used by both the V1 and V2 dashboards.
router.post('/:id/share-token', projectController.regenerateShareToken);
router.delete('/:id/share-token', projectController.revokeShareToken);

export default router;
