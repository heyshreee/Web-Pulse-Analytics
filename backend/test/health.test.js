import test from 'node:test';
import assert from 'node:assert/strict';

// Set safe placeholders before importing the app. dotenv does not override
// variables that are already present, so a local backend/.env cannot leak into
// the test run.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-only-secret';
process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_KEY = 'test-only-service-key';
process.env.FRONTEND_URL = 'http://localhost:5173';
process.env.RESEND_API_KEY = 'test-only-resend-key';
process.env.RAZORPAY_KEY_ID = 'test-only-razorpay-id';
process.env.RAZORPAY_KEY_SECRET = 'test-only-razorpay-secret';

test('backend boots and serves health + 404 responses', async (t) => {
  const { default: createApp } = await import('../src/app.js');
  const server = createApp().listen(0);
  await new Promise((resolve) => server.once('listening', resolve));

  t.after(() => {
    server.closeAllConnections?.();
    return new Promise((resolve) => server.close(resolve));
  });

  const { port } = server.address();

  const health = await fetch(`http://127.0.0.1:${port}/`);
  assert.equal(health.status, 200);
  assert.match(await health.text(), /API is running/);

  const missing = await fetch(`http://127.0.0.1:${port}/route-that-does-not-exist`);
  assert.equal(missing.status, 404);
});
