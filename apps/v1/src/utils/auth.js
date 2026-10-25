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
