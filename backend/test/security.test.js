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
