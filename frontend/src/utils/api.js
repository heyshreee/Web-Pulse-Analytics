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

import { getToken } from './auth';

const API_URL = getApiUrl();

export async function apiRequest(endpoint, options = {}) {
  // Token is now handled via HttpOnly cookie
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
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

