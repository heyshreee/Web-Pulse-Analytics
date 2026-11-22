import express from 'express';
const router = express.Router();
import authController from '../controllers/auth.controller.js';
import auth from '../middlewares/auth.js';
import { authLimiter } from '../middlewares/rateLimiter.js';

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/logout', auth, authController.logout);
router.post('/verify-email', authLimiter, authController.verifyEmail);
router.post('/resend-verification', authLimiter, authController.resendVerification);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password', authLimiter, authController.resetPassword);
router.post('/google-login', authLimiter, authController.googleLogin);
router.get('/me', auth, authController.getMe);

export default router;
