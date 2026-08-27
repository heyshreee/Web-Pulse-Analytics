import express from 'express';
const router = express.Router();
import userController from '../../controllers/user.controller.js';
import authenticate from '../../middleware/auth.js';
import upload from '../../middleware/upload.js';

router.use(authenticate);

router.put('/profile', userController.updateProfile);
router.put('/avatar', upload.single('avatar'), userController.updateAvatar);
router.put('/password', userController.updatePassword);
router.get('/sessions', userController.getSessions);
router.delete('/sessions/:sessionId', userController.revokeSession);
router.put('/notifications', userController.updateNotificationPreferences);

export default router;
