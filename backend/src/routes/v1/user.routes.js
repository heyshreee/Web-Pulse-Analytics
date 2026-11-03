import express from 'express';
const router = express.Router();
import userController from '../../controllers/user.controller.js';
import linkedAccountsController from '../../controllers/linked-accounts.controller.js';
import authenticate from '../../middleware/auth.js';
import upload from '../../middleware/upload.js';

router.use(authenticate);

router.put('/profile', userController.updateProfile);
router.put('/avatar', upload.single('avatar'), userController.updateAvatar);
router.put('/password', userController.updatePassword);
router.get('/sessions', userController.getSessions);
router.delete('/sessions/:sessionId', userController.revokeSession);
router.put('/notifications', userController.updateNotificationPreferences);

// Linked accounts (V1 Settings). The controller stores integration credentials
// server-side and must never echo them back to the browser.
router.get('/linked-accounts', linkedAccountsController.getLinkedAccounts);
router.post('/linked-accounts/telegram', linkedAccountsController.linkTelegram);
router.delete('/linked-accounts/:platform', linkedAccountsController.unlinkAccount);

export default router;
