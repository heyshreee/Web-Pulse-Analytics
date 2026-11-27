import express from 'express';
const router = express.Router();
import auditController from '../../controllers/audit.controller.js';
import auth from '../../middlewares/auth.js';
import { apiPlanLimiter } from '../../middlewares/rateLimiter.js';
import { requireSurfaceAccess } from '../../middlewares/entitlements.js';

router.use(auth);
router.use(apiPlanLimiter);
router.use(requireSurfaceAccess());

router.get('/', auditController.getAuditLogs);
router.put('/:id', auditController.rejectAuditMutation);
router.patch('/:id', auditController.rejectAuditMutation);
router.delete('/:id', auditController.rejectAuditMutation);

export default router;
