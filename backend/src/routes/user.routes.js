import express from 'express';
const router = express.Router();
import userController from '../controllers/user.controller.js';
import auth from '../middleware/auth.js';

router.get('/usage', auth, userController.getUsageStats);

export default router;
