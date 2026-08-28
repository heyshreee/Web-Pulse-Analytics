import { Router } from 'express';
import env from '../../config/env.js';
import EmailService from '../../services/email.service.js';
import limiter from '../../middleware/rateLimiter.js';
import asyncHandler from '../../utils/asyncHandler.js';
import AppError from '../../errors/AppError.js';

const router = Router();

const REPOSITORY = 'https://github.com/heyshreee/Web-Pulse-Analytics';

/**
 * Public, read-only site metadata. Lets the frontend render
 * contact addresses only when they are actually configured.
 */
router.get('/', asyncHandler(async (req, res) => {
    res.json({
        name: 'WebPulse',
        repository: REPOSITORY,
        issues: `${REPOSITORY}/issues`,
        supportEmail: env.supportEmail || null,
        privacyEmail: env.privacyEmail || null,
    });
}));

/**
 * Public contact form. Forwards the message to the monitored support
 * mailbox via the email service (reply-to the sender).
 */
router.post('/contact', limiter, asyncHandler(async (req, res) => {
    const { name, email, subject, message } = req.body || {};

    if (!email || typeof email !== 'string' || !email.includes('@')) {
        throw AppError.badRequest('A valid email address is required.', 'INVALID_EMAIL');
    }
    if (!message || typeof message !== 'string' || message.trim().length < 10) {
        throw AppError.badRequest('Please provide a message of at least 10 characters.', 'INVALID_MESSAGE');
    }

    await EmailService.sendContactRequest({
        name: typeof name === 'string' ? name.trim() : '',
        email: email.trim(),
        subject: typeof subject === 'string' ? subject.trim().slice(0, 120) : 'General question',
        message: message.trim()
    });

    res.json({ success: true });
}));

export default router;