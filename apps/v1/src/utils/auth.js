/**
 * Session state for the V1 Stable console.
 *
 * The session token itself is delivered by the API as an HttpOnly cookie and
 * is never readable from page scripts. What the browser keeps is only a
 * non-sensitive flag saying "this browser has a session", used to decide
 * whether to render the dashboard or the sign-in screen. The API is still the
 * authority: a request without a valid cookie is rejected with 401.
 */
export const SESSION_FLAG = 'webpulse:session';
export const SESSION_EVENT = 'webpulse:session-changed';
const LOGOUT_GUARD_KEY = 'webpulse:logged_out_at';
let loggingOut = false;

function emitSessionChange() {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event(SESSION_EVENT));
    }
}

export function clearLoggedOut() {
    try {
        sessionStorage.removeItem(LOGOUT_GUARD_KEY);
    } catch {
        /* storage unavailable — ignore */
    }
}

export function setSession() {
    loggingOut = false;
    clearLoggedOut();
    try {
        localStorage.setItem(SESSION_FLAG, '1');
    } catch {
        /* storage unavailable — the API cookie still carries the session */
    }
    emitSessionChange();
}

export function clearSession() {
    try {
        localStorage.removeItem(SESSION_FLAG);
    } catch {
        /* storage unavailable — ignore */
    }
    emitSessionChange();
}

export function markLoggedOut() {
    clearSession();
    try {
        sessionStorage.setItem(LOGOUT_GUARD_KEY, String(Date.now()));
    } catch {
        /* storage unavailable — ignore */
    }
}

export function wasJustLoggedOut(maxAgeMs = 10000) {
    try {
        const raw = sessionStorage.getItem(LOGOUT_GUARD_KEY);
        if (!raw) return false;
        const ts = Number(raw);
        if (!Number.isFinite(ts) || Date.now() - ts > maxAgeMs) {
            sessionStorage.removeItem(LOGOUT_GUARD_KEY);
            return false;
        }
        return true;
    } catch {
        return false;
    }
}

export function setLoggingOut(active) {
    loggingOut = Boolean(active);
}

export function isLoggingOut() {
    return loggingOut;
}

export function isAuthenticated() {
    try {
        return localStorage.getItem(SESSION_FLAG) === '1';
    } catch {
        return false;
    }
}

export const TRUSTED_HOSTS = new Set([
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

    // Block protocol-relative (//evil.com) and backslash schemes (/\evil.com, \\evil.com)
    if (trimmed.startsWith('/') && !trimmed.startsWith('//') && !trimmed.startsWith('/\\')) {
        return trimmed;
    }

    try {
        if (typeof window !== 'undefined') {
            const parsed = new URL(trimmed, window.location.origin);
            if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
                return fallback;
            }
            if (parsed.origin === window.location.origin) {
                return `${parsed.pathname}${parsed.search}${parsed.hash}`;
            }
            if (TRUSTED_HOSTS.has(parsed.hostname)) {
                return `${parsed.origin}${parsed.pathname}${parsed.search}${parsed.hash}`;
            }
        }
    } catch {
        // Invalid URL string
    }
    return fallback;
}

/**
 * Helper to determine default base URL based on runtime environment.
 */
export function getCanonicalAppUrl(type = 'v1') {
    const isProdDomain = typeof window !== 'undefined' &&
        (window.location.hostname === 'webpulseanalytics.tech' || window.location.hostname.endsWith('.webpulseanalytics.tech'));

    if (type === 'v2' || type === 'beta') {
        return (import.meta.env.VITE_V2_APP_URL || (isProdDomain ? 'https://beta.webpulseanalytics.tech' : 'http://localhost:5175')).replace(/\/+$/, '');
    }
    if (type === 'marketing') {
        return (import.meta.env.VITE_MARKETING_URL || (isProdDomain ? 'https://webpulseanalytics.tech' : 'http://localhost:5174')).replace(/\/+$/, '');
    }
    return (import.meta.env.VITE_V1_APP_URL || import.meta.env.VITE_APP_URL || (isProdDomain ? 'https://app.webpulseanalytics.tech' : 'http://localhost:5173')).replace(/\/+$/, '');
}
