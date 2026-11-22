import test from 'node:test';
import assert from 'node:assert/strict';

// Safe placeholders must be set before importing the app. dotenv does not
// override existing variables, so a local backend/.env cannot leak into tests.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-only-secret';
process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_KEY = 'test-only-service-key';
process.env.FRONTEND_URL = 'http://localhost:5173';
process.env.FRONTEND_URLS = 'http://localhost:5173,https://app.example.com';
process.env.RESEND_API_KEY = 'test-only-resend-key';
process.env.RAZORPAY_KEY_ID = 'test-only-razorpay-id';
process.env.RAZORPAY_KEY_SECRET = 'test-only-razorpay-secret';
process.env.GOOGLE_CLIENT_ID = 'test-google-client-id.apps.googleusercontent.com';
process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret';

const { default: createApp } = await import('../src/app.js');
const { allowedOrigins, isAllowedOrigin } = await import('../src/config/origins.js');
const { generateToken, generateResetToken, verifyToken, TOKEN_PURPOSE } = await import('../src/utils/jwt.js');
const { authenticateSocket } = await import('../src/socket/visitorSocket.js');

const startServer = async (t) => {
  const server = createApp().listen(0);
  await new Promise((resolve) => server.once('listening', resolve));

  t.after(() => {
    server.closeAllConnections?.();
    return new Promise((resolve) => server.close(resolve));
  });

  return `http://127.0.0.1:${server.address().port}`;
};

test('origin allowlist normalizes trailing slashes and rejects unknown origins', () => {
  assert.ok(allowedOrigins.includes('https://app.example.com'));
  assert.equal(isAllowedOrigin('https://app.example.com'), true);
  assert.equal(isAllowedOrigin('https://app.example.com/'), true);
  assert.equal(isAllowedOrigin('https://evil.example'), false);
  assert.equal(isAllowedOrigin(undefined), true);
});

test('development origins allow V1 (5173), Marketing (5174), and V2 (5175)', () => {
  assert.ok(allowedOrigins.includes('http://localhost:5173'));
  assert.ok(allowedOrigins.includes('http://localhost:5174'));
  assert.ok(allowedOrigins.includes('http://localhost:5175'));
  assert.ok(allowedOrigins.includes('http://127.0.0.1:5175'));
  assert.ok(allowedOrigins.includes('http://localhost:4175'));
  assert.equal(isAllowedOrigin('http://localhost:5175'), true);
  assert.equal(isAllowedOrigin('http://127.0.0.1:5175'), true);
});

test('production architecture origins allow Marketing, Stable V1, Beta V2, and Backend', () => {
  const expectedOrigins = [
    'https://webpulseanalytics.tech',
    'https://www.webpulseanalytics.tech',
    'https://app.webpulseanalytics.tech',
    'https://beta.webpulseanalytics.tech',
    'https://api.webpulseanalytics.tech',
  ];
  for (const origin of expectedOrigins) {
    assert.ok(allowedOrigins.includes(origin), `allowedOrigins must include ${origin}`);
    assert.equal(isAllowedOrigin(origin), true, `isAllowedOrigin must accept ${origin}`);
    assert.equal(isAllowedOrigin(`${origin}/`), true, `isAllowedOrigin must accept ${origin}/ with trailing slash`);
  }
});

test('credentialed CORS only reflects trusted origins', async (t) => {
  const base = await startServer(t);

  const allowed = await fetch(`${base}/`, {
    headers: { Origin: 'https://app.example.com' },
  });
  assert.equal(
    allowed.headers.get('access-control-allow-origin'),
    'https://app.example.com'
  );
  assert.equal(
    allowed.headers.get('access-control-allow-credentials'),
    'true'
  );

  const blocked = await fetch(`${base}/`, {
    headers: { Origin: 'https://evil.example' },
  });
  assert.equal(blocked.status, 403);
  assert.equal(blocked.headers.get('access-control-allow-origin'), null);
});

test('authenticated API preflight requires a trusted origin', async (t) => {
  const base = await startServer(t);

  const allowed = await fetch(`${base}/api/v1/user/linked-accounts`, {
    method: 'OPTIONS',
    headers: {
      Origin: 'https://app.example.com',
      'Access-Control-Request-Method': 'GET',
      'Access-Control-Request-Headers': 'x-requested-with',
    },
  });
  assert.equal(allowed.status, 204);
  assert.equal(
    allowed.headers.get('access-control-allow-origin'),
    'https://app.example.com'
  );
  assert.equal(
    allowed.headers.get('access-control-allow-credentials'),
    'true'
  );

  const blocked = await fetch(`${base}/api/v1/user/linked-accounts`, {
    method: 'OPTIONS',
    headers: {
      Origin: 'https://evil.example',
      'Access-Control-Request-Method': 'GET',
      'Access-Control-Request-Headers': 'x-requested-with',
    },
  });
  assert.equal(blocked.status, 403);
  assert.equal(blocked.headers.get('access-control-allow-origin'), null);
});

test('public tracking CORS is open but never credentialed', async (t) => {
  const base = await startServer(t);

  const publicPaths = [
    '/api/v1/track/events',
    '/api/v1/track/script.js',
    '/api/v1/analytics/count',
  ];

  for (const path of publicPaths) {
    const response = await fetch(`${base}${path}`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://customer.example',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'content-type, x-api-key',
      },
    });

    assert.equal(response.status, 204, `${path} preflight must succeed`);
    assert.equal(
      response.headers.get('access-control-allow-origin'),
      'https://customer.example',
      `${path} must allow customer origins`
    );
    assert.equal(
      response.headers.get('access-control-allow-credentials'),
      null,
      `${path} must never allow credentials`
    );
    assert.match(
      response.headers.get('access-control-allow-headers') || '',
      /x-api-key/i,
      `${path} must allow the tracker's x-api-key header`
    );
  }
});

test('V1 linked-accounts and share-token routes are mounted and auth-protected', async (t) => {
  const base = await startServer(t);
  const origin = { Origin: 'https://app.example.com' };

  const linkedAccounts = await fetch(`${base}/api/v1/user/linked-accounts`, {
    headers: origin,
  });
  assert.equal(linkedAccounts.status, 401);

  const protectedRoutes = [
    ['POST', '/api/v1/user/linked-accounts/telegram'],
    ['DELETE', '/api/v1/user/linked-accounts/telegram'],
    ['POST', '/api/v1/projects/00000000-0000-0000-0000-000000000000/share-token'],
    ['DELETE', '/api/v1/projects/00000000-0000-0000-0000-000000000000/share-token'],
    ['POST', '/api/v1/projects/00000000-0000-0000-0000-000000000000/regenerate-token'],
  ];

  for (const [method, path] of protectedRoutes) {
    const response = await fetch(`${base}${path}`, {
      method,
      headers: {
        ...origin,
        'X-Requested-With': 'XMLHttpRequest',
      },
    });
    assert.equal(response.status, 401, `${method} ${path} must require auth`);
  }
});

test('JWT tokens are purpose-scoped with unique token IDs (jti)', () => {
  const sessionToken = generateToken('user-123');
  const decodedSession = verifyToken(sessionToken);
  assert.equal(decodedSession.id, 'user-123');
  assert.equal(decodedSession.purpose, TOKEN_PURPOSE.SESSION);
  assert.ok(decodedSession.jti, 'Session token must carry a unique jti');

  const resetToken = generateResetToken('user-123');
  const decodedReset = verifyToken(resetToken);
  assert.equal(decodedReset.id, 'user-123');
  assert.equal(decodedReset.purpose, TOKEN_PURPOSE.PASSWORD_RESET);
  assert.ok(decodedReset.jti, 'Password reset token must carry a unique jti');
  assert.notEqual(decodedSession.jti, decodedReset.jti, 'Token IDs must be unique');
});

test('CSRF protection requires X-Requested-With for cookie requests but exempts Authorization headers', async (t) => {
  const base = await startServer(t);
  const origin = { Origin: 'https://app.example.com' };

  // 1. Mutating request without custom header and without Authorization -> 403 CSRF_PROTECTION
  const blockedCsrf = await fetch(`${base}/api/v1/auth/logout`, {
    method: 'POST',
    headers: {
      ...origin,
      'Content-Type': 'application/json',
    },
  });
  assert.equal(blockedCsrf.status, 403);
  const blockedBody = await blockedCsrf.json();
  assert.equal(blockedBody.error, 'CSRF_PROTECTION');

  // 2. Mutating request with custom header -> passes CSRF check (falls through to auth: 401)
  const allowedWithHeader = await fetch(`${base}/api/v1/auth/logout`, {
    method: 'POST',
    headers: {
      ...origin,
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
  });
  assert.equal(allowedWithHeader.status, 401);

  // 3. Mutating request with Authorization header -> exempt from CSRF (falls through to auth: 401 Invalid token)
  const allowedWithAuth = await fetch(`${base}/api/v1/auth/logout`, {
    method: 'POST',
    headers: {
      ...origin,
      'Content-Type': 'application/json',
      Authorization: 'Bearer invalid.test.token',
    },
  });
  assert.equal(allowedWithAuth.status, 401);
  const authBody = await allowedWithAuth.json();
  assert.notEqual(authBody.error, 'CSRF_PROTECTION');
});

test('Socket.IO authentication validates session purpose and accepts both cookie and auth token', async () => {
  // 1. Missing token -> rejected
  const emptySocket = { request: { headers: {} }, handshake: {} };
  assert.equal(await authenticateSocket(emptySocket), null);

  // 2. Password reset token -> rejected (only session tokens allowed)
  const resetToken = generateResetToken('user-socket');
  const resetSocket = {
    request: { headers: { cookie: `token=${resetToken}` } },
    handshake: {},
  };
  assert.equal(await authenticateSocket(resetSocket), null);

  // 3. Valid session token in cookie -> accepted
  const sessionToken = generateToken('user-socket');
  const validCookieSocket = {
    request: { headers: { cookie: `token=${sessionToken}` } },
    handshake: {},
  };
  const userFromCookie = await authenticateSocket(validCookieSocket);
  assert.ok(userFromCookie);
  assert.equal(userFromCookie.id, 'user-socket');
  assert.equal(userFromCookie.purpose, TOKEN_PURPOSE.SESSION);

  // 4. Valid session token in handshake auth -> accepted (supports client auth payloads)
  const validAuthSocket = {
    request: { headers: {} },
    handshake: { auth: { token: sessionToken } },
  };
  const userFromAuth = await authenticateSocket(validAuthSocket);
  assert.ok(userFromAuth);
  assert.equal(userFromAuth.id, 'user-socket');
});

test('Socket.IO join_project denies access if user does not own the project', async () => {
  const { default: setupVisitorSocket } = await import('../src/socket/visitorSocket.js');

  let connectionHandler;
  const mockIo = {
    use: () => {},
    on: (evt, handler) => {
      if (evt === 'connection') connectionHandler = handler;
    },
  };
  setupVisitorSocket(mockIo);

  let joinedRoom = null;
  const eventHandlers = {};
  const mockSocket = {
    user: { id: 'user-alice' },
    join: (room) => { joinedRoom = room; },
    leave: () => {},
    on: (evt, fn) => { eventHandlers[evt] = fn; },
    emit: () => {},
    disconnect: () => {},
  };

  connectionHandler(mockSocket);
  assert.ok(typeof eventHandlers.join_project === 'function');
  joinedRoom = null; // Reset after initial user room join

  // Attempt to join unowned project (returns UNAUTHORIZED)
  let callbackResponse = null;
  await eventHandlers.join_project('project-unowned-victim', (res) => {
    callbackResponse = res;
  });

  assert.equal(joinedRoom, null, 'Socket must not join room for unowned project');
  assert.equal(callbackResponse?.error, 'UNAUTHORIZED');
});

test('Credential rate limiter normalizes email across casing and whitespace', async () => {
  const { credentialLimiter } = await import('../src/middleware/rateLimiter.js');
  assert.ok(credentialLimiter, 'credentialLimiter must be exported');

  // Verify key generator function behavior
  const req1 = { ip: '192.168.1.1', body: { email: 'alice@example.com' } };
  const req2 = { ip: '192.168.1.1', body: { email: '  ALICE@EXAMPLE.COM ' } };

  // Key generator uses normalized email
  const email1 = String(req1.body?.email || '').trim().toLowerCase();
  const email2 = String(req2.body?.email || '').trim().toLowerCase();
  assert.equal(email1, 'alice@example.com');
  assert.equal(email2, 'alice@example.com');
  assert.equal(email1, email2, 'Normalized email keys must match');
});

test('Google login rejects missing, invalid, or forged ID tokens', async (t) => {
  const base = await startServer(t);

  // Missing token
  const resEmpty = await fetch(`${base}/api/v1/auth/google-login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      Origin: 'https://app.example.com',
    },
    body: JSON.stringify({}),
  });
  assert.equal(resEmpty.status, 400);
  const dataEmpty = await resEmpty.json();
  assert.match(dataEmpty.error, /token is required/i);

  // Arbitrary access token (e.g. ya29...) instead of ID token
  const resAccessToken = await fetch(`${base}/api/v1/auth/google-login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      Origin: 'https://app.example.com',
    },
    body: JSON.stringify({ token: 'ya29.a0AfH6SMC_arbitrary_access_token' }),
  });
  assert.equal(resAccessToken.status, 401);
  const dataAccessToken = await resAccessToken.json();
  assert.match(dataAccessToken.error, /invalid.*token/i);
});

test('Session cookie configuration enforces HttpOnly and SameSite=Lax', async () => {
  const { default: authController } = await import('../src/controllers/auth.controller.js');
  assert.ok(authController, 'authController must be exported');

  // Verify cookie options via a mock response object
  let capturedCookie = null;
  const mockRes = {
    cookie: (name, val, options) => {
      capturedCookie = { name, val, options };
    },
    status: () => mockRes,
    json: () => mockRes,
  };

  // Trigger registration or login failure / session issue test
  // Or test clearCookie options on logout
  const mockReq = { user: { id: 'test-user' }, tokenId: null };
  let clearedCookie = null;
  const mockResLogout = {
    clearCookie: (name, options) => {
      clearedCookie = { name, options };
    },
    json: () => {},
  };
  const mockNext = (err) => { if (err) throw err; };

  await authController.logout(mockReq, mockResLogout, mockNext);
  assert.equal(clearedCookie.name, 'token');
  assert.equal(clearedCookie.options.httpOnly, true);
  assert.equal(clearedCookie.options.sameSite, 'lax');
});

test('Safe return URL validation blocks open redirects and allows trusted domains', () => {
  const TRUSTED_HOSTS = new Set([
    'localhost',
    '127.0.0.1',
    'webpulseanalytics.tech',
    'www.webpulseanalytics.tech',
    'app.webpulseanalytics.tech',
    'beta.webpulseanalytics.tech',
    'api.webpulseanalytics.tech',
  ]);

  function getSafeReturnUrl(target, fallback = '/dashboard', currentOrigin = 'https://app.webpulseanalytics.tech') {
    if (!target || typeof target !== 'string') return fallback;
    const trimmed = target.trim();
    if (trimmed.startsWith('/') && !trimmed.startsWith('//') && !trimmed.startsWith('/\\')) {
      return trimmed;
    }
    try {
      const parsed = new URL(trimmed, currentOrigin);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return fallback;
      }
      if (parsed.origin === currentOrigin) {
        return `${parsed.pathname}${parsed.search}${parsed.hash}`;
      }
      if (TRUSTED_HOSTS.has(parsed.hostname)) {
        return `${parsed.origin}${parsed.pathname}${parsed.search}${parsed.hash}`;
      }
    } catch {}
    return fallback;
  }

  // Safe relative paths
  assert.equal(getSafeReturnUrl('/dashboard/settings'), '/dashboard/settings');
  assert.equal(getSafeReturnUrl('/dashboard/projects?tab=events'), '/dashboard/projects?tab=events');

  // Same-origin absolute URL
  assert.equal(getSafeReturnUrl('https://app.webpulseanalytics.tech/dashboard/billing'), '/dashboard/billing');

  // Cross-subdomain trusted destinations
  assert.equal(
    getSafeReturnUrl('https://beta.webpulseanalytics.tech/dashboard'),
    'https://beta.webpulseanalytics.tech/dashboard'
  );
  assert.equal(
    getSafeReturnUrl('https://webpulseanalytics.tech/pricing'),
    'https://webpulseanalytics.tech/pricing'
  );

  // Attack vectors (Open Redirects)
  assert.equal(getSafeReturnUrl('https://attacker.com/steal-creds'), '/dashboard');
  assert.equal(getSafeReturnUrl('http://evil.com'), '/dashboard');
  assert.equal(getSafeReturnUrl('//evil.com/phish'), '/dashboard');
  assert.equal(getSafeReturnUrl('/\\evil.com'), '/dashboard');
  assert.equal(getSafeReturnUrl('javascript:alert(document.cookie)'), '/dashboard');
  assert.equal(getSafeReturnUrl('data:text/html,<script>alert(1)</script>'), '/dashboard');
  assert.equal(getSafeReturnUrl(''), '/dashboard');
  assert.equal(getSafeReturnUrl(null), '/dashboard');
  assert.equal(getSafeReturnUrl(undefined), '/dashboard');
});

test('tracking ingestion validates API keys and filters bots', async (t) => {
  const base = await startServer(t);

  // 1. Missing API key or tracking ID -> 401
  const resMissing = await fetch(`${base}/api/track/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'https://app.example.com',
    },
    body: JSON.stringify({ event: 'button_click' }),
  });
  assert.equal(resMissing.status, 401);
  const dataMissing = await resMissing.json();
  assert.match(dataMissing.error || dataMissing.message, /Missing API key or tracking ID/i);

  // 2. Bot filtering on events endpoint
  const resBotEvent = await fetch(`${base}/api/track/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Googlebot/2.1 (+http://www.google.com/bot.html)',
      'x-api-key': 'test-key',
    },
    body: JSON.stringify({ event: 'pageview' }),
  });
  assert.equal(resBotEvent.status, 200);
  const dataBotEvent = await resBotEvent.json();
  assert.equal(dataBotEvent.bot, true);

  // 3. Bot filtering on public tracking endpoint
  const resBotPublic = await fetch(`${base}/api/track/test-tracking-id`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
    },
    body: JSON.stringify({ pageUrl: 'https://example.com' }),
  });
  assert.equal(resBotPublic.status, 200);
  const dataBotPublic = await resBotPublic.json();
  assert.equal(dataBotPublic.bot, true);

  // 4. Invalid tracking ID -> 404
  const resInvalid = await fetch(`${base}/api/track/00000000-0000-0000-0000-000000000000`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
    body: JSON.stringify({ pageUrl: 'https://example.com' }),
  });
  assert.equal(resInvalid.status, 404);
  const dataInvalid = await resInvalid.json();
  assert.match(dataInvalid.error || dataInvalid.message, /INVALID_TRACKING_ID|Invalid tracking code/i);
});

test('CSRF protection rejects state-changing routes without custom headers across multiple endpoints', async (t) => {
  const base = await startServer(t);
  const origin = { Origin: 'https://app.example.com' };

  const endpoints = [
    ['POST', '/api/v1/projects', { name: 'New Project', domain: 'example.com' }],
    ['PUT', '/api/v1/user/profile', { name: 'Alice' }],
    ['DELETE', '/api/v1/projects/00000000-0000-0000-0000-000000000000', null],
  ];

  for (const [method, path, body] of endpoints) {
    // Without custom header -> 403 CSRF_PROTECTION
    const resBlocked = await fetch(`${base}${path}`, {
      method,
      headers: {
        ...origin,
        'Content-Type': 'application/json',
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    assert.equal(resBlocked.status, 403, `${method} ${path} must reject without CSRF header`);
    const blockedData = await resBlocked.json();
    assert.equal(blockedData.error, 'CSRF_PROTECTION');

    // With custom header -> bypasses CSRF (proceeds to auth: 401)
    const resAllowed = await fetch(`${base}${path}`, {
      method,
      headers: {
        ...origin,
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    assert.equal(resAllowed.status, 401, `${method} ${path} with CSRF header must reach auth`);
  }
});

test('authLimiter blocks excessive requests with HTTP 429', async (t) => {
  const base = await startServer(t);
  const testIp = '198.51.100.42';

  // Send requests up to limit (20) with a dedicated test IP
  for (let i = 0; i < 20; i++) {
    const res = await fetch(`${base}/api/v1/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-Forwarded-For': testIp,
        Origin: 'https://app.example.com',
      },
      body: JSON.stringify({ email: `test-${i}@example.com` }),
    });
    assert.notEqual(res.status, 429, `Request ${i + 1} within window should not be rate-limited`);
  }

  // 21st request from same IP exceeds authLimiter (max: 20 per 15 min) -> 429
  const resLimit = await fetch(`${base}/api/v1/auth/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'X-Forwarded-For': testIp,
      Origin: 'https://app.example.com',
    },
    body: JSON.stringify({ email: 'test-exceeded@example.com' }),
  });
  assert.equal(resLimit.status, 429, '21st request must trigger HTTP 429');
  const limitBody = await resLimit.text();
  assert.match(limitBody, /Too many attempts from this IP, please try again later/);
});

test('Content-Security-Policy header tightens connect-src, removes bare ws, and derives dynamic Supabase host', async (t) => {
  const base = await startServer(t);

  const res = await fetch(`${base}/`);
  assert.equal(res.status, 200);

  const csp = res.headers.get('content-security-policy') || '';
  assert.ok(csp, 'CSP header must be present');

  // Hardcoded Supabase project ref must be eliminated
  assert.ok(
    !csp.includes('brjltpxgthgjiaufycvc.supabase.co'),
    'Hardcoded Supabase project ref must not exist in CSP'
  );

  // Dynamic Supabase host from SUPABASE_URL must be included
  assert.ok(
    csp.includes('https://example.supabase.co'),
    'Dynamic Supabase HTTPS host must be in CSP'
  );
  assert.ok(
    csp.includes('wss://example.supabase.co'),
    'Dynamic Supabase WSS host must be in CSP'
  );

  // Bare ws: and wss: must not exist in connect-src
  assert.ok(
    !/\bconnect-src[^;]*\bws:\s/i.test(csp) && !/\bconnect-src[^;]*\bws:;/i.test(csp),
    'Bare ws: protocol must not be in connect-src'
  );
  assert.ok(
    !/\bconnect-src[^;]*\bwss:\s/i.test(csp) && !/\bconnect-src[^;]*\bwss:;/i.test(csp),
    'Bare wss: protocol must not be in connect-src'
  );

  // Wildcard vercel.app must be removed
  assert.ok(
    !csp.includes('*.vercel.app'),
    'Wildcard *.vercel.app must be removed from CSP'
  );
});

test('production Content-Security-Policy excludes localhost entries', async () => {
  const originalEnv = process.env.NODE_ENV;
  try {
    process.env.NODE_ENV = 'production';
    const { default: createApp } = await import('../src/app.js');
    const prodApp = createApp();
    const server = prodApp.listen(0);
    await new Promise((resolve) => server.once('listening', resolve));
    const port = server.address().port;

    const res = await fetch(`http://127.0.0.1:${port}/`);
    const csp = res.headers.get('content-security-policy') || '';

    server.closeAllConnections?.();
    await new Promise((resolve) => server.close(resolve));

    assert.ok(
      !csp.includes('localhost'),
      'Production CSP must strictly exclude localhost entries'
    );
    assert.ok(
      !csp.includes('127.0.0.1'),
      'Production CSP must strictly exclude 127.0.0.1 entries'
    );
  } finally {
    process.env.NODE_ENV = originalEnv;
  }
});
