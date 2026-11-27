import express from 'express';
const router = express.Router();
import alphaController from '../../controllers/alpha.controller.js';
import auth from '../../middlewares/auth.js';
import { apiPlanLimiter } from '../../middlewares/rateLimiter.js';

router.use(auth);
router.use(apiPlanLimiter);

router.get('/features', alphaController.getAlphaFeatures);
router.patch('/flags/:flagKey', alphaController.toggleAlphaFlag);
router.post('/experiments/:flagKey/run', alphaController.runAlphaExperiment);
router.post('/revoke', alphaController.revokeAlphaAccess);

export default router;
