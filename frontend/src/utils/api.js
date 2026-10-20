export const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    // If the URL ends with /v1, use it as is, otherwise append /v1
    const base = envUrl.replace(/\/$/, '');
    return base.endsWith('/v1') ? base : `${base}/v1`;
  }
  // Fallback for development with Vite proxy
  return '/api/v1';
};

import { clearSession } from './auth';

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
    // request, where a 401 just means the credentials were wrong.
    if (response.status === 401 && !endpoint.startsWith('/auth/')) {
      clearSession();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.assign('/login');
      }
    }

    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}
