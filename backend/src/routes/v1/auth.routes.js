import express from 'express';
const router = express.Router();
import authController from '../../controllers/auth.controller.js';
import auth from '../../middleware/auth.js';
import { authLimiter, credentialLimiter, verificationLimiter } from '../../middleware/rateLimiter.js';

/**
 * Every credential-handling endpoint is rate limited. `credentialLimiter` is
 * keyed by IP *and* the address in the body, so neither one account nor one
 * host can be used to grind through credentials.
 */
router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, credentialLimiter, authController.login);
router.post('/logout', auth, authController.logout);
router.get('/me', auth, authController.getMe);
router.post('/verify-email', verificationLimiter, authController.verifyEmail);
router.post('/resend-verification', verificationLimiter, authController.resendVerification);
router.post('/forgot-password', authLimiter, credentialLimiter, authController.forgotPassword);
router.post('/reset-password', authLimiter, authController.resetPassword);
router.post('/google-login', authLimiter, authController.googleLogin);

export default router;
