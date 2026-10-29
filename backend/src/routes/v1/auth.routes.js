import express from 'express';
const router = express.Router();
import authController from '../../controllers/auth.controller.js';
import auth from '../../middleware/auth.js';

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', auth, authController.logout);
router.get('/me', auth, authController.getMe);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', auth, authController.resendVerification);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/google-login', authController.googleLogin);

export default router;
