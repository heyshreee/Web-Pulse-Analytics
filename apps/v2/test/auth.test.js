import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  setSession,
  isAuthenticated,
  markLoggedOut,
  wasJustLoggedOut,
  setLoggingOut,
  isLoggingOut,
  clearLoggedOut,
  SESSION_FLAG,
} from '../src/utils/auth.js';
import { apiRequest, probeSession } from '../src/utils/api.js';

function createMemoryStorage() {
  const store = new Map();
  return {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear(),
  };
}

describe('V2 Session & Logout Guards', () => {
  const origWindow = globalThis.window;
  const origLocalStorage = globalThis.localStorage;
  const origSessionStorage = globalThis.sessionStorage;
  const origFetch = globalThis.fetch;
  let assignMock;

  beforeEach(() => {
    const local = createMemoryStorage();
    const session = createMemoryStorage();
    assignMock = vi.fn();

    globalThis.localStorage = local;
    globalThis.sessionStorage = session;
    globalThis.window = {
      location: {
        hostname: 'localhost',
        origin: 'http://localhost:5175',
        pathname: '/dashboard',
        search: '',
        assign: assignMock,
      },
      dispatchEvent: vi.fn(),
    };
    globalThis.Event = class Event {
      constructor(type) {
        this.type = type;
      }
    };
  });

  afterEach(() => {
    setLoggingOut(false);
    clearLoggedOut();
    globalThis.window = origWindow;
    globalThis.localStorage = origLocalStorage;
    globalThis.sessionStorage = origSessionStorage;
    globalThis.fetch = origFetch;
  });

  it('tracks login, logout guard, and clears logout guard on setSession()', () => {
    expect(isAuthenticated()).toBe(false);
    setSession();
    expect(isAuthenticated()).toBe(true);
    expect(globalThis.localStorage.getItem(SESSION_FLAG)).toBe('1');
    expect(wasJustLoggedOut()).toBe(false);

    markLoggedOut();
    expect(isAuthenticated()).toBe(false);
    expect(wasJustLoggedOut()).toBe(true);

    setSession();
    expect(isAuthenticated()).toBe(true);
    expect(wasJustLoggedOut()).toBe(false);
  });

  it('suppresses returnUrl redirect during logout and after markLoggedOut()', async () => {
    globalThis.fetch = vi.fn(async () => ({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Session revoked' }),
    }));

    setSession();
    setLoggingOut(true);
    expect(isLoggingOut()).toBe(true);
    await expect(apiRequest('/projects')).rejects.toThrow('Session revoked');
    expect(isAuthenticated()).toBe(false);
    expect(assignMock).not.toHaveBeenCalled();

    setLoggingOut(false);
    markLoggedOut();
    await expect(apiRequest('/usage')).rejects.toThrow('Session revoked');
    expect(assignMock).not.toHaveBeenCalled();

    clearLoggedOut();
    setSession();
    await expect(apiRequest('/projects')).rejects.toThrow('Session revoked');
    expect(isAuthenticated()).toBe(false);
    expect(assignMock).toHaveBeenCalledWith('/login?returnUrl=%2Fdashboard');
  });

  it('coalesces concurrent probeSession() calls into a single /auth/session request', async () => {
    let calls = 0;
    globalThis.fetch = vi.fn(async (url) => {
      calls += 1;
      expect(url).toContain('/auth/session');
      return {
        ok: true,
        status: 200,
        json: async () => ({ authenticated: false, user: null }),
      };
    });

    const [a, b] = await Promise.all([probeSession(), probeSession()]);
    expect(calls).toBe(1);
    expect(a).toEqual({ authenticated: false, user: null });
    expect(b).toEqual({ authenticated: false, user: null });
  });
});
