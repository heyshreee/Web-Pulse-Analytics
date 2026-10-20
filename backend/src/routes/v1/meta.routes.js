import { Router } from 'express';
import env from '../../config/env.js';
import EmailService from '../../services/email.service.js';
import limiter from '../../middleware/rateLimiter.js';
import asyncHandler from '../../utils/asyncHandler.js';
import AppError from '../../errors/AppError.js';

const router = Router();

const REPOSITORY = 'https://github.com/heyshreee/Web-Pulse-Analytics';

/**
 * Where a request is delivered. Each kind maps to a dedicated mailbox so a
 * privacy request, a legal notice and a billing question never end up in the
 * same inbox. The support mailbox is the fallback for every kind so a request
 * is never silently dropped when a dedicated mailbox is not configured yet.
 */
const CONTACT_CHANNELS = {
    support: { label: 'Support', address: () => env.supportEmail },
    privacy: { label: 'Privacy request', address: () => env.privacyEmail || env.supportEmail },
    legal: { label: 'Legal notice', address: () => env.legalEmail || env.supportEmail },
    security: { label: 'Security report', address: () => env.securityEmail || env.supportEmail },
};

/**
 * Public, read-only site metadata. Lets the frontend render
 * contact addresses only when they are actually configured.
 */
router.get('/', asyncHandler(async (req, res) => {
    res.json({
        name: 'WebPulse',
        repository: REPOSITORY,
        issues: `${REPOSITORY}/issues`,
        securityAdvisories: `${REPOSITORY}/security/advisories/new`,
        supportEmail: env.supportEmail || null,
        privacyEmail: env.privacyEmail || null,
        legalEmail: env.legalEmail || null,
        securityEmail: env.securityEmail || null,
    });
}));

/**
 * Public contact form. Forwards the message to the monitored mailbox for the
 * selected request kind, with the sender address as reply-to.
 */
router.post('/contact', limiter, asyncHandler(async (req, res) => {
    const { name, email, subject, message, kind, account } = req.body || {};

    if (!email || typeof email !== 'string' || !email.includes('@')) {
        throw AppError.badRequest('A valid email address is required.', 'INVALID_EMAIL');
    }
    if (!message || typeof message !== 'string' || message.trim().length < 10) {
        throw AppError.badRequest('Please provide a message of at least 10 characters.', 'INVALID_MESSAGE');
    }

    const channel = CONTACT_CHANNELS[kind] || CONTACT_CHANNELS.support;

    await EmailService.sendContactRequest({
        name: typeof name === 'string' ? name.trim() : '',
        email: email.trim(),
        subject: typeof subject === 'string' ? subject.trim().slice(0, 120) : 'General question',
        message: message.trim(),
        kind: channel.label,
        account: typeof account === 'string' ? account.trim().slice(0, 200) : '',
        to: channel.address() || undefined,
    });

    res.json({ success: true });
}));

export default router;