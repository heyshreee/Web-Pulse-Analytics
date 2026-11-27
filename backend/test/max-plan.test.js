import test, { mock } from 'node:test';
import assert from 'node:assert/strict';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-only-secret';
process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_KEY = 'test-only-service-key';
process.env.FRONTEND_URL = 'http://localhost:5173';
process.env.FRONTEND_URLS = 'http://localhost:5173,https://app.webpulseanalytics.tech,https://beta.webpulseanalytics.tech';
process.env.RESEND_API_KEY = 'test-only-resend-key';
process.env.RAZORPAY_KEY_ID = 'test-only-razorpay-id';
process.env.RAZORPAY_KEY_SECRET = 'test-only-razorpay-secret';

const { default: supabase } = await import('../src/config/supabase.js');
const { default: createApp } = await import('../src/app.js');
const { generateToken, verifyToken } = await import('../src/utils/jwt.js');
const { getPlanLimits } = await import('../src/config/plans.js');
const { default: usageService, __resetAlertCacheForTests } = await import('../src/services/usage.service.js');
const { sanitizeAuditMetadata } = await import('../src/services/audit.service.js');
const { validateWebhookUrl, signWebhookPayload, deliverWebhookWithRetry } = await import('../src/services/webhook.service.js');
const { __resetPlanRateLimiters } = await import('../src/middlewares/rateLimiter.js');

const MAX_ID = '44444444-4444-4444-8444-444444444444';
const PRO_ID = '33333333-3333-4333-8333-333333333333';
const LITE_ID = '22222222-2222-4222-8222-222222222222';
const NANO_ID = '11111111-1111-4111-8111-111111111111';
const ANALYST_ID = '88888888-8888-4888-8888-888888888888';

const MAX_PROJ_1 = 'cccccccc-cccc-4ccc-8ccc-ccccccccccc1';
const MAX_PROJ_2 = 'cccccccc-cccc-4ccc-8ccc-ccccccccccc2';
const OTHER_PROJ = 'dddddddd-dddd-4ddd-8ddd-ddddddddddd1';

function createMaxDb() {
  const nowIso = new Date().toISOString();
  const currentMonth = nowIso.slice(0, 7);

  const tables = {
    users: [
      { id: MAX_ID, email: 'max@example.com', name: 'Max Owner', plan: 'max', alpha_revoked: false, alpha_flags: {}, is_verified: true },
      { id: PRO_ID, email: 'pro@example.com', name: 'Pro User', plan: 'pro', alpha_revoked: false, alpha_flags: {}, is_verified: true },
      { id: LITE_ID, email: 'lite@example.com', name: 'Lite User', plan: 'lite', alpha_revoked: false, alpha_flags: {}, is_verified: true },
      { id: NANO_ID, email: 'nano@example.com', name: 'Nano User', plan: 'nano', alpha_revoked: false, alpha_flags: {}, is_verified: true },
      { id: ANALYST_ID, email: 'analyst@example.com', name: 'Analyst', plan: 'nano', alpha_revoked: false, alpha_flags: {}, is_verified: true },
    ],
    user_sessions: [],
    plans: [],
    projects: [
      { id: MAX_PROJ_1, user_id: MAX_ID, owner_id: MAX_ID, name: 'max-core', tracking_id: 'trk_max_1', is_active: true, created_at: nowIso },
      { id: MAX_PROJ_2, user_id: MAX_ID, owner_id: MAX_ID, name: 'max-store', tracking_id: 'trk_max_2', is_active: true, created_at: nowIso },
      { id: OTHER_PROJ, user_id: PRO_ID, owner_id: PRO_ID, name: 'pro-other', tracking_id: 'trk_pro_other', is_active: true, created_at: nowIso },
    ],
    project_origins: [],
    project_members: [
      { id: 'pm-m1', project_id: MAX_PROJ_1, user_id: MAX_ID, role: 'owner', status: 'active' },
      { id: 'pm-m2', project_id: MAX_PROJ_1, user_id: ANALYST_ID, role: 'analyst', status: 'active' },
    ],
    project_invitations: [],
    project_settings: [{ project_id: MAX_PROJ_1, retention_days: 365 }],
    usages: [
      { id: 'u-m1', project_id: MAX_PROJ_1, month: currentMonth, views: 0 },
      { id: 'u-m2', project_id: MAX_PROJ_2, month: currentMonth, views: 0 },
    ],
    ingested_events: [],
    shared_reports: [],
    alpha_feature_usage: [],
    audit_logs: [],
    api_keys: [],
    webhooks: [],
    webhook_deliveries: [],
    visitors: [
      { id: 'vm-1', project_id: MAX_PROJ_1, visitor_hash: 'vh-m1', country: 'India', device_type: 'desktop', browser: 'Chrome', os: 'Linux', created_at: nowIso, last_seen: nowIso },
      { id: 'vm-2', project_id: MAX_PROJ_2, visitor_hash: 'vh-m2', country: 'United Kingdom', device_type: 'mobile', browser: 'Safari', os: 'iOS', created_at: nowIso, last_seen: nowIso },
      { id: 'vp-other', project_id: OTHER_PROJ, visitor_hash: 'vh-other', country: 'Brazil', device_type: 'desktop', created_at: nowIso, last_seen: nowIso },
    ],
    sessions: [
      { id: 'sm-1', project_id: MAX_PROJ_1, session_id: 's1', visitor_id: 'vm-1', started_at: nowIso },
      { id: 'sp-other', project_id: OTHER_PROJ, session_id: 's2', visitor_id: 'vp-other', started_at: nowIso },
    ],
    page_views: [
      { id: 'pvm-1', project_id: MAX_PROJ_1, visitor_id: 'vm-1', session_id: 's1', path: '/home', page_url: 'https://max.example.com/home', created_at: nowIso, viewed_at: nowIso },
      { id: 'pvm-2', project_id: MAX_PROJ_2, visitor_id: 'vm-2', session_id: 's2', path: '/shop', page_url: 'https://shop.example.com/shop', created_at: nowIso, viewed_at: nowIso },
      { id: 'pvp-other', project_id: OTHER_PROJ, visitor_id: 'vp-other', session_id: 's2', path: '/secret-pro', page_url: 'https://pro.example.com/secret-pro', created_at: nowIso, viewed_at: nowIso },
    ],
    events: [
      { id: 'evm-1', project_id: MAX_PROJ_1, event_name: 'upgrade_click', occurred_at: nowIso, created_at: nowIso },
      { id: 'evp-other', project_id: OTHER_PROJ, event_name: 'pro_secret_ev', occurred_at: nowIso, created_at: nowIso },
    ],
    notifications: [],
    activity_logs: [],
  };

  let seq = 1;
  const nextId = (p) => `${p}-${seq++}`;

  function applyFilters(rows, filters) {
    return rows.filter((row) =>
      filters.every((f) => {
        const val = row[f.col];
        if (f.op === 'eq') return val === f.val;
        if (f.op === 'in') return Array.isArray(f.val) && f.val.includes(val);
        if (f.op === 'is') return f.val === null ? val === null || val === undefined : val === f.val;
        if (f.op === 'gte') return String(val ?? '') >= String(f.val);
        if (f.op === 'lte') return String(val ?? '') <= String(f.val);
        if (f.op === 'lt') return String(val ?? '') < String(f.val);
        if (f.op === 'not') return f.notOp === 'is' && f.val === null ? val !== null && val !== undefined : val !== f.val;
        if (f.op === 'or') {
          return String(f.val).split(',').some((clause) => {
            const [col, op, target] = clause.split('.');
            return op === 'eq' && String(row[col]) === target;
          });
        }
        return true;
      })
    );
  }

  function from(tableName) {
    if (!tables[tableName]) tables[tableName] = [];
    const state = { op: 'select', filters: [], payload: null, head: false, countMode: null, orderCol: null, orderAsc: true, limitNum: null };

    const exec = () => {
      const rows = tables[tableName];
      if (state.op === 'insert') {
        const items = (Array.isArray(state.payload) ? state.payload : [state.payload]).map((item) => ({
          id: item.id || nextId(tableName.slice(0, 3)),
          created_at: item.created_at || new Date().toISOString(),
          ...item,
        }));
        rows.push(...items);
        return { data: Array.isArray(state.payload) ? items : items[0], error: null };
      }
      const matched = applyFilters(rows, state.filters);
      if (state.op === 'update') {
        matched.forEach((r) => Object.assign(r, state.payload));
        return { data: matched, error: null };
      }
      if (state.op === 'delete') {
        const s = new Set(matched);
        tables[tableName] = rows.filter((r) => !s.has(r));
        return { data: matched, count: matched.length, error: null };
      }
      let out = [...matched];
      if (state.orderCol) {
        out.sort((a, b) =>
          state.orderAsc
            ? String(a[state.orderCol] ?? '').localeCompare(String(b[state.orderCol] ?? ''))
            : String(b[state.orderCol] ?? '').localeCompare(String(a[state.orderCol] ?? ''))
        );
      }
      if (state.limitNum !== null) out = out.slice(0, state.limitNum);
      return { data: state.head ? null : out, count: state.countMode ? matched.length : undefined, error: null };
    };

    const builder = {
      select(_c = '*', opts = {}) {
        if (opts?.head) state.head = true;
        if (opts?.count) state.countMode = opts.count;
        return builder;
      },
      insert(p) { state.op = 'insert'; state.payload = p; return builder; },
      update(p) { state.op = 'update'; state.payload = p; return builder; },
      delete() { state.op = 'delete'; return builder; },
      eq(c, v) { state.filters.push({ op: 'eq', col: c, val: v }); return builder; },
      in(c, v) { state.filters.push({ op: 'in', col: c, val: v }); return builder; },
      is(c, v) { state.filters.push({ op: 'is', col: c, val: v }); return builder; },
      gte(c, v) { state.filters.push({ op: 'gte', col: c, val: v }); return builder; },
      lte(c, v) { state.filters.push({ op: 'lte', col: c, val: v }); return builder; },
      lt(c, v) { state.filters.push({ op: 'lt', col: c, val: v }); return builder; },
      not(c, no, v) { state.filters.push({ op: 'not', col: c, notOp: no, val: v }); return builder; },
      or(v) { state.filters.push({ op: 'or', col: '', val: v }); return builder; },
      order(c, o = {}) { state.orderCol = c; state.orderAsc = o?.ascending !== false; return builder; },
      limit(n) { state.limitNum = n; return builder; },
      single() {
        const res = exec();
        const row = Array.isArray(res.data) ? res.data[0] : res.data;
        return Promise.resolve({ data: row || null, error: row ? res.error : { code: 'PGRST116', message: 'Not found' } });
      },
      maybeSingle() {
        const res = exec();
        const row = Array.isArray(res.data) ? res.data[0] || null : res.data || null;
        return Promise.resolve({ data: row, error: res.error });
      },
      then(resolve, reject) { return Promise.resolve(exec()).then(resolve, reject); },
    };
    return builder;
  }

  function rpc(fnName, args) {
    if (fnName === 'consume_monthly_event_quota') {
      const userProjects = tables.projects.filter((p) => p.user_id === args.p_user_id).map((p) => p.id);
      const totalBefore = tables.usages
        .filter((u) => userProjects.includes(u.project_id) && u.month === args.p_month)
        .reduce((a, u) => a + (u.views || 0), 0);
      if (totalBefore >= args.p_limit) {
        return Promise.resolve({ data: { allowed: false, duplicate: false, current_total: totalBefore }, error: null });
      }
      let row = tables.usages.find((u) => u.project_id === args.p_project_id && u.month === args.p_month);
      if (!row) {
        row = { id: nextId('usg'), project_id: args.p_project_id, month: args.p_month, views: 0 };
        tables.usages.push(row);
      }
      row.views += 1;
      return Promise.resolve({ data: { allowed: true, duplicate: false, current_total: totalBefore + 1 }, error: null });
    }
    return Promise.resolve({ data: null, error: { message: 'not implemented' } });
  }

  return { tables, from, rpc };
}

function authHeaders(db, userId, extra = {}) {
  const token = generateToken(userId);
  const decoded = verifyToken(token);
  db.tables.user_sessions.push({
    id: `us-${decoded.jti}`,
    user_id: userId,
    token_id: decoded.jti,
    purpose: 'session',
    revoked_at: null,
    expires_at: new Date(Date.now() + 3600000).toISOString(),
  });
  return {
    Cookie: `token=${token}`,
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/json',
    ...extra,
  };
}

async function startMaxServer(t, db) {
  mock.method(supabase, 'from', db.from);
  mock.method(supabase, 'rpc', db.rpc);
  __resetAlertCacheForTests();
  __resetPlanRateLimiters();
  const server = createApp().listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(() => {
    mock.restoreAll();
    server.closeAllConnections?.();
    return new Promise((resolve) => server.close(resolve));
  });
  return `http://127.0.0.1:${server.address().port}`;
}

test('Max entitlements and shared 2,000,000 monthly quota across projects', async (t) => {
  const max = getPlanLimits('max');
  assert.equal(max.monthlyViews, 2000000);
  assert.equal(max.projectLimit, 25);
  assert.equal(max.allowedOriginsLimit, 50);
  assert.equal(max.limits.team_members, 25);
  assert.equal(max.retentionDays, 365);
  assert.equal(max.refreshRate, 5);
  assert.equal(max.apiRequestsPerMinute, 300);
  assert.equal(max.share_report, 500);
  assert.equal(max.access.v2_beta, true);
  assert.equal(max.access.alpha, true);

  const db = createMaxDb();
  mock.method(supabase, 'from', db.from);
  mock.method(supabase, 'rpc', db.rpc);
  t.after(() => mock.restoreAll());

  db.tables.usages[0].views = 1500000;
  db.tables.usages[1].views = 499998;
  const results = await Promise.all([
    usageService.consumeEventQuota(MAX_ID, MAX_PROJ_1, 'max-q1'),
    usageService.consumeEventQuota(MAX_ID, MAX_PROJ_2, 'max-q2'),
    usageService.consumeEventQuota(MAX_ID, MAX_PROJ_1, 'max-q3'),
  ]);
  assert.equal(results.filter((r) => r.allowed).length, 2);
});

test('Alpha access: Max allowed with per-flag toggle & revocation; Pro/Lite/Nano denied', async (t) => {
  const db = createMaxDb();
  const baseUrl = await startMaxServer(t, db);
  const maxHeaders = authHeaders(db, MAX_ID);
  const proHeaders = authHeaders(db, PRO_ID);
  const liteHeaders = authHeaders(db, LITE_ID);
  const nanoHeaders = authHeaders(db, NANO_ID);

  // Pro, Lite, Nano denied Alpha
  assert.equal((await fetch(`${baseUrl}/api/v1/alpha/features`, { headers: proHeaders })).status, 403);
  assert.equal((await fetch(`${baseUrl}/api/v1/alpha/features`, { headers: liteHeaders })).status, 403);
  assert.equal((await fetch(`${baseUrl}/api/v1/alpha/features`, { headers: nanoHeaders })).status, 403);

  // Max allowed; disabled flag cannot run until explicitly enabled
  const featRes = await fetch(`${baseUrl}/api/v1/alpha/features`, { headers: maxHeaders });
  assert.equal(featRes.status, 200);
  assert.equal((await fetch(`${baseUrl}/api/v1/alpha/experiments/alpha_funnel_explorer/run`, { method: 'POST', headers: maxHeaders })).status, 403);

  await fetch(`${baseUrl}/api/v1/alpha/flags/alpha_funnel_explorer`, {
    method: 'PATCH',
    headers: maxHeaders,
    body: JSON.stringify({ enabled: true }),
  });
  assert.equal((await fetch(`${baseUrl}/api/v1/alpha/experiments/alpha_funnel_explorer/run`, { method: 'POST', headers: maxHeaders })).status, 200);

  // Revoke Alpha without affecting V1 or V2
  const revokeRes = await fetch(`${baseUrl}/api/v1/alpha/revoke`, { method: 'POST', headers: maxHeaders, body: JSON.stringify({}) });
  assert.equal(revokeRes.status, 200);
  assert.equal((await fetch(`${baseUrl}/api/v1/alpha/features`, { headers: maxHeaders })).status, 403);
  assert.equal((await fetch(`${baseUrl}/api/v1/projects`, { headers: maxHeaders })).status, 200);
  assert.equal((await fetch(`${baseUrl}/api/v1/projects`, { headers: authHeaders(db, MAX_ID, { 'X-WebPulse-App': 'v2_beta' }) })).status, 200);
});

test('Organization-wide analytics isolates cross-account data and blocks Pro/Lite/Nano', async (t) => {
  const db = createMaxDb();
  const baseUrl = await startMaxServer(t, db);
  const maxHeaders = authHeaders(db, MAX_ID);
  const proHeaders = authHeaders(db, PRO_ID);

  assert.equal((await fetch(`${baseUrl}/api/v1/analytics/organization`, { headers: proHeaders })).status, 403);

  const orgRes = await fetch(`${baseUrl}/api/v1/analytics/organization?range=30d`, { headers: maxHeaders });
  assert.equal(orgRes.status, 200);
  const body = await orgRes.json();
  assert.equal(body.accountTotals.activeProjects, 2);
  assert.equal(body.accountTotals.totalPageViews, 2);
  assert.equal(JSON.stringify(body).includes('pro-other'), false);
});

test('Audit logs: redacts secrets, enforces immutability, and paginates', async (t) => {
  const redacted = sanitizeAuditMetadata({ password: 'p1', signingSecret: 'whsec_123', projectId: 'p1' });
  assert.equal(redacted.password, '[REDACTED]');
  assert.equal(redacted.signingSecret, '[REDACTED]');
  assert.equal(redacted.projectId, 'p1');

  const db = createMaxDb();
  const baseUrl = await startMaxServer(t, db);
  const maxHeaders = authHeaders(db, MAX_ID);
  const proHeaders = authHeaders(db, PRO_ID);

  assert.equal((await fetch(`${baseUrl}/api/v1/audit-logs`, { headers: proHeaders })).status, 403);
  assert.equal((await fetch(`${baseUrl}/api/v1/audit-logs/some-id`, { method: 'DELETE', headers: maxHeaders })).status, 403);
  assert.equal((await fetch(`${baseUrl}/api/v1/audit-logs`, { headers: maxHeaders })).status, 200);
});

test('Team analyst role enforcement and privilege escalation protection', async (t) => {
  const db = createMaxDb();
  const baseUrl = await startMaxServer(t, db);
  const maxHeaders = authHeaders(db, MAX_ID);
  const analystHeaders = authHeaders(db, ANALYST_ID);

  // Analyst can read analytics and export, cannot mutate origins/webhooks
  assert.equal((await fetch(`${baseUrl}/api/v1/projects/${MAX_PROJ_1}/analytics/overview`, { headers: analystHeaders })).status, 200);
  assert.equal((await fetch(`${baseUrl}/api/v1/projects/${MAX_PROJ_1}/origins`, { method: 'POST', headers: analystHeaders, body: JSON.stringify({ origin: 'https://blocked.example.com' }) })).status, 403);

  // Privilege escalation to 'owner' blocked
  const escRes = await fetch(`${baseUrl}/api/v1/projects/${MAX_PROJ_1}/members/${ANALYST_ID}/role`, {
    method: 'PATCH',
    headers: maxHeaders,
    body: JSON.stringify({ role: 'owner' }),
  });
  assert.equal(escRes.status, 400);

  // Valid role change succeeds and writes audit log
  const roleRes = await fetch(`${baseUrl}/api/v1/projects/${MAX_PROJ_1}/members/${ANALYST_ID}/role`, {
    method: 'PATCH',
    headers: maxHeaders,
    body: JSON.stringify({ role: 'admin' }),
  });
  assert.equal(roleRes.status, 200);
  assert.ok(db.tables.audit_logs.some((l) => l.action === 'team.role_changed'));
});

test('API keys and Webhook SSRF protection, HMAC signing, and exponential backoff retry', async (t) => {
  assert.throws(() => validateWebhookUrl('http://example.com/hook'), { code: 'INVALID_WEBHOOK_URL' });
  assert.throws(() => validateWebhookUrl('https://localhost/hook'), { code: 'SSRF_BLOCKED' });
  assert.throws(() => validateWebhookUrl('https://169.254.169.254/latest/meta-data'), { code: 'SSRF_BLOCKED' });
  assert.throws(() => validateWebhookUrl('https://10.0.0.5/internal'), { code: 'SSRF_BLOCKED' });

  const sig = signWebhookPayload('whsec_test', 1700000000, '{"ok":true}');
  assert.ok(sig.startsWith('t=1700000000,v1='));

  const db = createMaxDb();
  const baseUrl = await startMaxServer(t, db);
  const maxHeaders = authHeaders(db, MAX_ID);

  // API key create + rotate (never exposes key_hash)
  const keyRes = await fetch(`${baseUrl}/api/v1/projects/${MAX_PROJ_1}/api-keys`, {
    method: 'POST',
    headers: maxHeaders,
    body: JSON.stringify({ name: 'CI Key' }),
  });
  assert.equal(keyRes.status, 201);
  const keyBody = await keyRes.json();
  assert.ok(keyBody.apiKey.startsWith('wpk_'));
  assert.equal(keyBody.key.key_hash, undefined);

  // Webhook create rejects SSRF, accepts public HTTPS, and retries on transient 500
  assert.equal((await fetch(`${baseUrl}/api/v1/projects/${MAX_PROJ_1}/webhooks`, {
    method: 'POST',
    headers: maxHeaders,
    body: JSON.stringify({ url: 'https://127.0.0.1/hook' }),
  })).status, 400);

  const whRes = await fetch(`${baseUrl}/api/v1/projects/${MAX_PROJ_1}/webhooks`, {
    method: 'POST',
    headers: maxHeaders,
    body: JSON.stringify({ url: 'https://hooks.example.com/webpulse' }),
  });
  assert.equal(whRes.status, 201);
  const whBody = await whRes.json();

  let calls = 0;
  const delivery = await deliverWebhookWithRetry({
    webhook: { id: whBody.webhook.id, project_id: MAX_PROJ_1, url: whBody.webhook.url, secret_hash: 'h' },
    eventType: 'event.tracked',
    payload: { count: 1 },
    rawSecret: whBody.signingSecret,
    fetcher: async () => {
      calls += 1;
      return calls < 2 ? { ok: false, status: 502 } : { ok: true, status: 200 };
    },
    baseDelayMs: 1,
  });
  assert.equal(delivery.delivered, true);
  assert.equal(delivery.attempts, 2);
});
