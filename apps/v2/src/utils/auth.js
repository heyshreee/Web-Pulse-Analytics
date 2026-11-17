const SESSION_FLAG = 'webpulse:session';

export function getToken() {
  try {
    return localStorage.getItem('token');
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) {
      localStorage.setItem('token', token);
    }
    localStorage.setItem(SESSION_FLAG, '1');
  } catch {
    /* storage unavailable */
  }
}

export function setSession() {
  try {
    localStorage.setItem(SESSION_FLAG, '1');
  } catch {
    /* storage unavailable */
  }
}

export function removeToken() {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem(SESSION_FLAG);
  } catch {
    /* storage unavailable */
  }
}

export function clearSession() {
  removeToken();
}

export function isAuthenticated() {
  try {
    const token = getToken();
    const hasSession = localStorage.getItem(SESSION_FLAG) === '1';
    return Boolean(token || hasSession);
  } catch {
    return false;
  }
}

/**
 * Validates a return URL to prevent open redirect vulnerabilities.
 * Only allows relative application paths (e.g., /dashboard/settings)
 * and disallows protocol-relative URLs (//attacker.com) or backslash tricks.
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
      if (parsed.origin === window.location.origin) {
        return `${parsed.pathname}${parsed.search}${parsed.hash}`;
      }
    }
  } catch {
    // Invalid URL string
  }
  return fallback;
}
