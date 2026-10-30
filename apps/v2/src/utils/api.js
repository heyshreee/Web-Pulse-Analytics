export const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL?.trim();
  if (envUrl) {
    const base = envUrl.replace(/\/+$/, '');
    if (base.endsWith('/v1')) return base;
    if (base.endsWith('/api')) return `${base}/v1`;
    return `${base}/api/v1`;
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
    !['localhost', '127.0.0.1'].includes(window.location.hostname)
  ) {
    return window.location.origin;
  }

  return 'http://localhost:5000';
};

export const isSocketEnabled = () =>
  import.meta.env.VITE_ENABLE_SOCKET !== 'false';

import { getToken } from './auth';

const API_URL = getApiUrl();

export async function apiRequest(endpoint, options = {}) {
  // Token is now handled via HttpOnly cookie
  const token = getToken();

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'X-Requested-With': 'XMLHttpRequest', // CSRF Protection
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // Important for sending cookies
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
    const error = new Error(errorData.error || 'Request failed');
    error.data = errorData;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

