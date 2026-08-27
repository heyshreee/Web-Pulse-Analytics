import express from 'express';
const router = express.Router();
import userController from '../../controllers/user.controller.js';
import trackingCors from '../../middleware/trackingCors.js';
import auth from '../../middleware/auth.js';

router.use(auth);
router.use(trackingCors);

router.get('/', userController.getUsageStats);

export default router;
