/**
 * Session state for the console.
 *
 * The session token itself is delivered by the API as an HttpOnly cookie and
 * is never readable from page scripts. What the browser keeps is only a
 * non-sensitive flag saying "this browser has a session", used to decide
 * whether to render the dashboard or the sign-in screen. The API is still the
 * authority: a request without a valid cookie is rejected with 401.
 */
const SESSION_FLAG = 'webpulse:session';

export function setSession() {
    try {
        localStorage.setItem(SESSION_FLAG, '1');
    } catch {
        /* storage unavailable — the API cookie still carries the session */
    }
}

export function clearSession() {
    try {
        localStorage.removeItem(SESSION_FLAG);
    } catch {
        /* storage unavailable — ignore */
    }
}

export function isAuthenticated() {
    try {
        return localStorage.getItem(SESSION_FLAG) === '1';
    } catch {
        return false;
    }
}

const TRUSTED_HOSTS = new Set([
    'localhost',
    '127.0.0.1',
    'webpulseanalytics.tech',
    'www.webpulseanalytics.tech',
    'app.webpulseanalytics.tech',
    'beta.webpulseanalytics.tech',
    'api.webpulseanalytics.tech',
]);

/**
 * Validates a return URL to prevent open redirect vulnerabilities.
 * Only allows relative application paths (e.g., /dashboard/settings)
 * or explicit same-origin/trusted-domain routes, and disallows
 * protocol-relative URLs (//attacker.com) or backslash tricks.
 */
export function getSafeReturnUrl(target, fallback = '/dashboard') {
    if (!target || typeof target !== 'string') return fallback;
    const trimmed = target.trim();
    if (trimmed.startsWith('/') && !trimmed.startsWith('//') && !trimmed.startsWith('/\\')) {
        return trimmed;
    }
    try {
        if (typeof window !== 'undefined') {
            const parsed = new URL(trimmed, window.location.origin);
            if (parsed.origin === window.location.origin || TRUSTED_HOSTS.has(parsed.hostname)) {
                return `${parsed.pathname}${parsed.search}${parsed.hash}`;
            }
        }
    } catch {
        // Invalid URL string
    }
    return fallback;
}
