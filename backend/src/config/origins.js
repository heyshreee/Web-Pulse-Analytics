import { env } from './env.js';

/**
 * Normalizes a browser Origin header value.
 * Origin headers never include a trailing slash, but deployment variables often
 * do, so both forms are treated as the same origin.
 */
export const normalizeOrigin = (origin) => origin.trim().replace(/\/+$/, '');

const developmentOrigins = env.isProd
  ? []
  : [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5174',
      'http://localhost:5175',
      'http://127.0.0.1:5175',
      'http://localhost:4173',
      'http://127.0.0.1:4173',
      'http://localhost:4174',
      'http://127.0.0.1:4174',
      'http://localhost:4175',
      'http://127.0.0.1:4175',
    ];

/**
 * Explicit allowlist for credentialed cross-origin requests.
 *
 * Never add a wildcard or a `*.vercel.app` pattern here: production auth cookies
 * use SameSite=None, so any origin on the list can read authenticated responses.
 * Add each preview URL individually (or use a dedicated preview environment).
 */
export const allowedOrigins = [
  ...new Set([...env.frontendUrls, ...developmentOrigins]),
];

export const isAllowedOrigin = (origin) => {
  if (!origin) return true; // server-to-server or same-origin requests
  return allowedOrigins.includes(normalizeOrigin(origin));
};

if (env.isProd && env.frontendUrls.length === 0) {
  console.warn(
    '[cors] No FRONTEND_URLS/FRONTEND_URL configured. Browser origins will be rejected.'
  );
}

export default { allowedOrigins, isAllowedOrigin, normalizeOrigin };
