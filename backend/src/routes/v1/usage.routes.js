import express from 'express';
const router = express.Router();
import userController from '../../controllers/user.controller.js';
import auth from '../../middleware/auth.js';

router.use(auth);

router.get('/', userController.getUsageStats);

export default router;
