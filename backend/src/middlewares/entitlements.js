import { getPlanConfig, hasFeature, hasSurfaceAccess, normalizePlanId } from '../config/plans.js';
import AppError from '../errors/AppError.js';

/**
 * Determines whether the incoming HTTP request originates from V2 Beta (`beta.webpulseanalytics.tech`).
 */
export function detectRequestedSurface(req) {
  const explicitApp = String(req.headers['x-webpulse-app'] || '').trim().toLowerCase();
  if (explicitApp === 'v2' || explicitApp === 'v2_beta' || explicitApp === 'beta') {
    return 'v2_beta';
  }
  if (explicitApp === 'alpha') {
    return 'alpha';
  }

  const originHeader = req.headers.origin || req.headers.referer || '';
  if (originHeader) {
    try {
      const url = new URL(originHeader);
      const host = url.hostname.toLowerCase();
      if (host === 'beta.webpulseanalytics.tech' || (host === 'localhost' && url.port === '5175') || (host === '127.0.0.1' && url.port === '5175')) {
        return 'v2_beta';
      }
    } catch {
      // Ignore malformed origin
    }
  }

  return 'v1';
}

/**
 * Middleware enforcing a boolean feature entitlement from the centralized plan matrix.
 */
export const requireFeature = (featureKey, message = null) => (req, res, next) => {
  const plan = normalizePlanId(req.user?.plan || 'nano');
  if (hasFeature(plan, featureKey)) {
    return next();
  }

  const cfg = getPlanConfig(plan);
  return next(
    AppError.forbidden(
      message || `Feature "${featureKey}" is not included in the ${cfg.name} plan. Upgrade to unlock it.`,
      'FEATURE_LOCKED',
      {
        feature: featureKey,
        plan,
        upgradeRequired: true,
      }
    )
  );
};

/**
 * Middleware enforcing release-surface access (e.g. `v2_beta` disabled on Nano & Lite).
 * When `forcedSurface` is omitted, checks the request headers (`X-WebPulse-App` / `Origin`).
 */
export const requireSurfaceAccess = (forcedSurface = null) => (req, res, next) => {
  const surface = forcedSurface || detectRequestedSurface(req);
  if (surface === 'v1' || surface === 'marketing') {
    return next();
  }

  const plan = normalizePlanId(req.user?.plan || 'nano');
  if (hasSurfaceAccess(plan, surface)) {
    return next();
  }

  const cfg = getPlanConfig(plan);
  return next(
    AppError.forbidden(
      `Your ${cfg.name} plan does not include access to ${surface === 'v2_beta' ? 'V2 Beta' : surface}. Upgrade to Pro or Max to continue.`,
      'SURFACE_ACCESS_DENIED',
      {
        surface,
        plan,
        upgradeRequired: true,
        allowedSurfaces: Object.entries(cfg.access)
          .filter(([, allowed]) => Boolean(allowed))
          .map(([key]) => key),
      }
    )
  );
};

export default {
  detectRequestedSurface,
  requireFeature,
  requireSurfaceAccess,
};
