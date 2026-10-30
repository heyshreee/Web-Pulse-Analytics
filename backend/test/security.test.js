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

const { default: createApp } = await import('../src/app.js');
const { allowedOrigins, isAllowedOrigin } = await import('../src/config/origins.js');

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
