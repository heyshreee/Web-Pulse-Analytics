import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import ActivityLogService from '../services/activity.service.js';
import { getPlanConfig, normalizePlanId } from '../config/plans.js';
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
 * Public tracking fallback IP limiter — protects abusive floods per IP.
 */
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 600,
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
 * many accounts. Normalizes email (trimmed and lowercased).
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

// In-memory plan-aware sliding window (API RPM) and token bucket (Ingestion EPS/burst)
const apiWindowStore = new Map();
const ingestionBuckets = new Map();

export function __resetPlanRateLimiters() {
    apiWindowStore.clear();
    ingestionBuckets.clear();
}

/**
 * Enforces plan-configured API requests per minute (e.g. 30/min on Nano).
 */
export const apiPlanLimiter = (req, res, next) => {
    const userId = req.user?.id;
    const key = userId ? `user:${userId}` : `ip:${ipKey(req)}`;
    const plan = normalizePlanId(req.user?.plan || 'nano');
    const maxPerMinute = getPlanConfig(plan).limits.api_requests_per_minute;

    const now = Date.now();
    const windowMs = 60 * 1000;
    const timestamps = (apiWindowStore.get(key) || []).filter((ts) => now - ts < windowMs);

    if (timestamps.length >= maxPerMinute) {
        const oldest = timestamps[0] || now;
        const retryAfterSec = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
        res.setHeader('X-RateLimit-Limit', String(maxPerMinute));
        res.setHeader('X-RateLimit-Remaining', '0');
        res.setHeader('Retry-After', String(retryAfterSec));
        return res.status(429).json({
            error: 'API_RATE_LIMIT_EXCEEDED',
            message: `API rate limit (${maxPerMinute} requests/minute on ${plan} plan) exceeded. Please retry shortly.`,
            limit: maxPerMinute,
            plan,
        });
    }

    timestamps.push(now);
    apiWindowStore.set(key, timestamps);

    res.setHeader('X-RateLimit-Limit', String(maxPerMinute));
    res.setHeader('X-RateLimit-Remaining', String(Math.max(0, maxPerMinute - timestamps.length)));
    return next();
};

/**
 * Enforces plan-configured ingestion events per second and burst capacity
 * (e.g. 10 events/sec, burst 20 on Nano) using a token bucket.
 */
export function consumeIngestionToken({ bucketKey, planId = 'nano', now = Date.now() }) {
    const plan = normalizePlanId(planId);
    const limits = getPlanConfig(plan).limits;
    const rate = Math.max(1, limits.ingestion_events_per_second);
    const burst = Math.max(rate, limits.ingestion_burst);

    const existing = ingestionBuckets.get(bucketKey) || { tokens: burst, lastRefillMs: now };
    const elapsedSec = Math.max(0, (now - existing.lastRefillMs) / 1000);
    const refilled = Math.min(burst, existing.tokens + elapsedSec * rate);

    if (refilled < 1) {
        ingestionBuckets.set(bucketKey, { tokens: refilled, lastRefillMs: now });
        return {
            allowed: false,
            remaining: 0,
            limit: rate,
            burst,
            retryAfterSec: Math.max(1, Math.ceil((1 - refilled) / rate)),
        };
    }

    ingestionBuckets.set(bucketKey, { tokens: refilled - 1, lastRefillMs: now });
    return {
        allowed: true,
        remaining: Math.floor(refilled - 1),
        limit: rate,
        burst,
        retryAfterSec: 0,
    };
}

export { limiter, authLimiter, credentialLimiter, verificationLimiter };
export default limiter;
