export const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL?.trim();
  if (envUrl) {
    const base = envUrl.replace(/\/+$/, '');
    if (base.endsWith('/v1')) return base;
    if (base.endsWith('/api')) return `${base}/v1`;
    return `${base}/api/v1`;
  }
  // Default to production backend API domain when hosted on webpulseanalytics.tech
  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'webpulseanalytics.tech' || window.location.hostname.endsWith('.webpulseanalytics.tech'))
  ) {
    return 'https://api.webpulseanalytics.tech/api/v1';
  }
  // Fallback for development with Vite proxy
  return '/api/v1';
};

/**
 * Socket.IO server URL. Prefer an explicit VITE_SOCKET_URL; otherwise derive it
 * from the API URL by removing the /api/v1 suffix. In local development the API
 * is proxied, so fall back to the backend dev server.
 */
export const getSocketUrl = () => {
  const explicit = import.meta.env.VITE_SOCKET_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, '');

  const apiUrl = getApiUrl();
  if (/^https?:\/\//i.test(apiUrl)) {
    return apiUrl
      .replace(/\/api\/v1\/?$/, '')
      .replace(/\/v1\/?$/, '')
      .replace(/\/api\/?$/, '');
  }

  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'webpulseanalytics.tech' || window.location.hostname.endsWith('.webpulseanalytics.tech'))
  ) {
    return 'https://api.webpulseanalytics.tech';
  }

  if (
    typeof window !== 'undefined' &&
    !['localhost', '127.0.0.1'].includes(window.location.hostname)
  ) {
    return window.location.origin;
  }

  return 'http://localhost:3000';
};

export const isSocketEnabled = () =>
  import.meta.env.VITE_ENABLE_SOCKET !== 'false';

import { clearSession, isLoggingOut, wasJustLoggedOut } from './auth';

const AUTH_PATHS = ['/login', '/register', '/verify-email', '/forgot-password', '/reset-password', '/auth/', '/share/'];

const API_URL = getApiUrl();

export async function apiRequest(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'X-Requested-With': 'XMLHttpRequest', // CSRF Protection
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    // The session lives in an HttpOnly cookie, so every request has to send
    // credentials. No auth token is ever read from or written to web storage.
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
    const error = new Error(errorData.error || 'Request failed');
    error.data = errorData;
    error.status = response.status;

    // The session expired or was revoked server-side. Drop the local flag
    // and send the visitor back to sign in — unless this *is* a sign-in
    // request or an intentional logout redirect is already in progress.
    if (response.status === 401 && !endpoint.startsWith('/auth/')) {
      clearSession();
      const onAuthPage =
        typeof window !== 'undefined' &&
        AUTH_PATHS.some((prefix) => window.location.pathname.startsWith(prefix));
      if (typeof window !== 'undefined' && !onAuthPage && !isLoggingOut() && !wasJustLoggedOut()) {
        const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.assign(`/login?returnUrl=${returnUrl}`);
      }
    }

    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

let inFlightSessionProbe = null;

/**
 * Checks whether an active server cookie session exists without triggering HTTP 401
 * noise in the browser console. Concurrent mounts (including React StrictMode) share
 * a single in-flight request.
 */
export function probeSession() {
  if (!inFlightSessionProbe) {
    inFlightSessionProbe = apiRequest('/auth/session').finally(() => {
      inFlightSessionProbe = null;
    });
  }
  return inFlightSessionProbe;
}
