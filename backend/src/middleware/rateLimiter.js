import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import ActivityLogService from '../services/activity.service.js';
import { getClientIp } from '../utils/ip.js';

/**
 * Normalised rate-limit key for an IP address.
 * `ipKeyGenerator` collapses IPv6 addresses into a /56 subnet so a single
 * host cannot rotate through its address range to dodge a limit.
 */
const ipKey = (req) => {
    const ip = getClientIp(req) || 'unknown';
    try {
        return ipKeyGenerator(ip);
    } catch {
        return ip;
    }
};

const logRateLimitHit = async (req) => {
    const projectId = req.params?.projectId || req.params?.id || req.body?.trackingId || req.body?.projectId;
    const userId = req.user?.id;

    if (!projectId) return;

    await ActivityLogService.log(
        projectId,
        userId,
        'rate_limit.hit',
        'Rate limit exceeded',
        'blocked',
        getClientIp(req),
        {
            resource: req.originalUrl,
            http_method: req.method,
            http_status: 429,
            user_agent: req.headers['user-agent']
        }
    );
};

/**
 * Public tracking limiter — 100 requests per IP per 15 minutes.
 * Shared by the public tracking routes and the contact form.
 */
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later',
    handler: async (req, res, next, options) => {
        await logRateLimitHit(req);
        res.status(options.statusCode).send(options.message);
    }
});

/**
 * Account limiter — applied to every credential-handling endpoint.
 * Blunts password spraying and OTP guessing from a single address.
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: ipKey,
    message: 'Too many attempts from this IP, please try again later',
    handler: async (req, res, next, options) => {
        res.status(options.statusCode).send(options.message);
    }
});

/**
 * Credential limiter — keyed by IP *and* the address being used, so one
 * account cannot be sprayed from a single host and one host cannot spray
 * many accounts.
 */
const credentialLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        const email = String(req.body?.email || '').trim().toLowerCase();
        return `${ipKey(req)}:${email}`;
    },
    message: 'Too many attempts for this account, please try again later',
    handler: async (req, res, next, options) => {
        res.status(options.statusCode).send(options.message);
    }
});

/**
 * Verification-code limiter — tighter, because a 6-digit code is a small
 * search space.
 */
const verificationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 8,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        const email = String(req.body?.email || '').trim().toLowerCase();
        return `${ipKey(req)}:${email}`;
    },
    message: 'Too many verification attempts, please try again later',
    handler: async (req, res, next, options) => {
        res.status(options.statusCode).send(options.message);
    }
});

export { limiter, authLimiter, credentialLimiter, verificationLimiter };
export default limiter;
