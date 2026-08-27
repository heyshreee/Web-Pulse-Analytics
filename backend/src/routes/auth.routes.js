import express from 'express';
const router = express.Router();
import authController from '../controllers/auth.controller.js';
import auth from '../middleware/auth.js';

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/google-login', authController.googleLogin);
router.get('/me', auth, authController.getMe);

export default router;
