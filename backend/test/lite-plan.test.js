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
const { default: RetentionService } = await import('../src/services/retention.service.js');
const { __resetPlanRateLimiters } = await import('../src/middlewares/rateLimiter.js');

const NANO_ID = '11111111-1111-4111-8111-111111111111';
const LITE_ID = '22222222-2222-4222-8222-222222222222';
const PRO_ID = '33333333-3333-4333-8333-333333333333';
const MAX_ID = '44444444-4444-4444-8444-444444444444';
const MEMBER_VIEWER_ID = '55555555-5555-4555-8555-555555555555';
const MEMBER_ADMIN_ID = '66666666-6666-4666-8666-666666666666';
const OUTSIDER_ID = '77777777-7777-4777-8777-777777777777';

const LITE_PROJ_1 = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1';
const LITE_PROJ_2 = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2';
const NANO_PROJ = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

function createLiteDb() {
  const nowIso = new Date().toISOString();
  const daysAgo20 = new Date(Date.now() - 20 * 86400000).toISOString();
  const daysAgo35 = new Date(Date.now() - 35 * 86400000).toISOString();
  const currentMonth = nowIso.slice(0, 7);

  const tables = {
    users: [
      { id: NANO_ID, email: 'nano@example.com', name: 'Nano', plan: 'nano', is_verified: true },
      { id: LITE_ID, email: 'lite@example.com', name: 'Lite', plan: 'lite', is_verified: true },
      { id: PRO_ID, email: 'pro@example.com', name: 'Pro', plan: 'pro', is_verified: true },
      { id: MAX_ID, email: 'max@example.com', name: 'Max', plan: 'max', is_verified: true },
      { id: MEMBER_VIEWER_ID, email: 'viewer@example.com', name: 'Viewer', plan: 'nano', is_verified: true },
      { id: MEMBER_ADMIN_ID, email: 'admin@example.com', name: 'Admin', plan: 'nano', is_verified: true },
      { id: OUTSIDER_ID, email: 'outsider@example.com', name: 'Outsider', plan: 'lite', is_verified: true },
    ],
    user_sessions: [],
    plans: [],
    projects: [
      { id: LITE_PROJ_1, user_id: LITE_ID, owner_id: LITE_ID, name: 'lite-main', tracking_id: 'trk_lite_1', is_active: true, created_at: nowIso },
      { id: LITE_PROJ_2, user_id: LITE_ID, owner_id: LITE_ID, name: 'lite-docs', tracking_id: 'trk_lite_2', is_active: true, created_at: nowIso },
      { id: NANO_PROJ, user_id: NANO_ID, owner_id: NANO_ID, name: 'nano-site', tracking_id: 'trk_nano_1', is_active: true, created_at: nowIso },
    ],
    project_origins: [
      { id: 'org-l1', project_id: LITE_PROJ_1, origin: 'https://lite.example.com', hostname: 'lite.example.com', status: 'verified' },
    ],
    project_members: [
      { id: 'pm-l1', project_id: LITE_PROJ_1, user_id: LITE_ID, role: 'owner', status: 'active' },
      { id: 'pm-n1', project_id: NANO_PROJ, user_id: NANO_ID, role: 'owner', status: 'active' },
    ],
    project_invitations: [],
    project_settings: [
      { project_id: LITE_PROJ_1, retention_days: 30, tracking_enabled: true },
      { project_id: NANO_PROJ, retention_days: 7, tracking_enabled: true },
    ],
    usages: [
      { id: 'usg-l1', project_id: LITE_PROJ_1, month: currentMonth, views: 0, alerts_sent: {} },
      { id: 'usg-l2', project_id: LITE_PROJ_2, month: currentMonth, views: 0, alerts_sent: {} },
    ],
    counters: [{ project_id: LITE_PROJ_1, count: 0 }],
    ingested_events: [],
    shared_reports: [],
    visitors: [
      {
        id: 'v-in',
        project_id: LITE_PROJ_1,
        visitor_hash: 'vh-in',
        country: 'India',
        country_name: 'India',
        country_code: 'IN',
        region: 'Karnataka',
        city: 'Bengaluru',
        device_type: 'mobile',
        browser: 'Chrome',
        os: 'Android',
        referrer: 'https://www.google.com/search?q=webpulse',
        utm_source: 'google',
        utm_medium: 'cpc',
        utm_campaign: 'spring_launch',
        created_at: nowIso,
        last_seen: nowIso,
        last_seen_at: nowIso,
      },
      {
        id: 'v-us',
        project_id: LITE_PROJ_1,
        visitor_hash: 'vh-us',
        country: 'United States',
        country_name: 'United States',
        country_code: 'US',
        region: 'California',
        city: 'San Francisco',
        device_type: 'desktop',
        browser: 'Firefox',
        os: 'macOS',
        referrer: '',
        utm_source: '',
        utm_medium: '',
        utm_campaign: '',
        created_at: daysAgo20,
        last_seen: daysAgo20,
        last_seen_at: daysAgo20,
      },
      {
        id: 'v-old-35',
        project_id: LITE_PROJ_1,
        visitor_hash: 'vh-old',
        country: 'Germany',
        device_type: 'desktop',
        created_at: daysAgo35,
        last_seen: daysAgo35,
        last_seen_at: daysAgo35,
      },
    ],
    sessions: [
      {
        id: 's-in',
        project_id: LITE_PROJ_1,
        session_id: 'ses-in',
        visitor_id: 'v-in',
        referrer: 'https://www.google.com/search?q=webpulse',
        utm_source: 'google',
        utm_medium: 'cpc',
        utm_campaign: 'spring_launch',
        started_at: nowIso,
        last_activity_at: nowIso,
      },
    ],
    page_views: [
      {
        id: 'pv-in',
        project_id: LITE_PROJ_1,
        visitor_id: 'v-in',
        session_id: 'ses-in',
        path: '/pricing',
        page_url: 'https://lite.example.com/pricing',
        title: 'Pricing',
        created_at: nowIso,
        viewed_at: nowIso,
      },
      {
        id: 'pv-us',
        project_id: LITE_PROJ_1,
        visitor_id: 'v-us',
        session_id: 'ses-us',
        path: '/docs',
        page_url: 'https://lite.example.com/docs',
        title: 'Docs',
        created_at: daysAgo20,
        viewed_at: daysAgo20,
      },
      {
        id: 'pv-old-35',
        project_id: LITE_PROJ_1,
        visitor_id: 'v-old-35',
        session_id: 'ses-old',
        path: '/old',
        page_url: 'https://lite.example.com/old',
        title: 'Old',
        created_at: daysAgo35,
        viewed_at: daysAgo35,
      },
    ],
    events: [
      { id: 'ev-1', project_id: LITE_PROJ_1, event_name: 'checkout', occurred_at: nowIso, created_at: nowIso },
      { id: 'ev-old-35', project_id: LITE_PROJ_1, event_name: 'old', occurred_at: daysAgo35, created_at: daysAgo35 },
    ],
    analytics_daily: [{ id: 'ad-l1', project_id: LITE_PROJ_1, date: currentMonth + '-01', views: 10 }],
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
          return String(f.val)
            .split(',')
            .some((clause) => {
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
        if (tableName === 'ingested_events') {
          for (const item of items) {
            if (rows.find((r) => r.project_id === item.project_id && r.event_id === item.event_id)) {
              return { data: null, error: { code: '23505', message: 'duplicate' } };
            }
          }
        }
        rows.push(...items);
        return { data: Array.isArray(state.payload) ? items : items[0], error: null };
      }

      if (state.op === 'upsert') {
        const items = Array.isArray(state.payload) ? state.payload : [state.payload];
        for (const item of items) {
          const idx = rows.findIndex(
            (r) =>
              (tableName === 'project_members' && r.project_id === item.project_id && r.user_id === item.user_id) ||
              (tableName === 'project_settings' && r.project_id === item.project_id)
          );
          if (idx >= 0) rows[idx] = { ...rows[idx], ...item };
          else rows.push({ id: item.id || nextId(tableName.slice(0, 3)), ...item });
        }
        return { data: items[0], error: null };
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
      select(cols = '*', opts = {}) {
        if (opts?.head) state.head = true;
        if (opts?.count) state.countMode = opts.count;
        return builder;
      },
      insert(p) { state.op = 'insert'; state.payload = p; return builder; },
      update(p) { state.op = 'update'; state.payload = p; return builder; },
      upsert(p) { state.op = 'upsert'; state.payload = p; return builder; },
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
      if (args.p_event_id) {
        const dup = tables.ingested_events.find((e) => e.project_id === args.p_project_id && e.event_id === args.p_event_id);
        if (dup) {
          const total = tables.usages.filter((u) => u.month === args.p_month).reduce((a, u) => a + (u.views || 0), 0);
          return Promise.resolve({ data: { allowed: true, duplicate: true, current_total: total }, error: null });
        }
        tables.ingested_events.push({ project_id: args.p_project_id, event_id: args.p_event_id });
      }
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

async function startLiteServer(t, db) {
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

test('Lite Cases 1-2: Lite creates up to 3 projects and 4th project is rejected', async (t) => {
  const db = createLiteDb();
  const baseUrl = await startLiteServer(t, db);
  const headers = authHeaders(db, LITE_ID);

  const res3 = await fetch(`${baseUrl}/api/v1/projects`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ name: 'lite-third' }),
  });
  assert.equal(res3.status, 201);

  const res4 = await fetch(`${baseUrl}/api/v1/projects`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ name: 'lite-fourth' }),
  });
  assert.equal(res4.status, 403);
  const body4 = await res4.json();
  assert.equal(body4.code, 'LIMIT_EXCEEDED');
});

test('Lite Cases 3-4: Lite registers up to 10 verified origins per project and rejects 11th', async (t) => {
  const db = createLiteDb();
  const baseUrl = await startLiteServer(t, db);
  const headers = authHeaders(db, LITE_ID);

  for (let i = 2; i <= 10; i++) {
    const res = await fetch(`${baseUrl}/api/v1/projects/${LITE_PROJ_1}/origins`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ origin: `https://sub${i}.example.com` }),
    });
    assert.equal(res.status, 201);
  }

  const res11 = await fetch(`${baseUrl}/api/v1/projects/${LITE_PROJ_1}/origins`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ origin: 'https://sub11.example.com' }),
  });
  assert.equal(res11.status, 403);
});

test('Lite Cases 5-7: Shared 100K monthly quota across projects, atomic concurrency, and event_id deduplication', async (t) => {
  const db = createLiteDb();
  mock.method(supabase, 'from', db.from);
  mock.method(supabase, 'rpc', db.rpc);
  t.after(() => mock.restoreAll());

  db.tables.usages[0].views = 60000;
  db.tables.usages[1].views = 39997;

  // Concurrent requests across project 1 and project 2 share the single 100,000 quota
  const results = await Promise.all([
    usageService.consumeEventQuota(LITE_ID, LITE_PROJ_1, 'evt-share-1'),
    usageService.consumeEventQuota(LITE_ID, LITE_PROJ_2, 'evt-share-2'),
    usageService.consumeEventQuota(LITE_ID, LITE_PROJ_1, 'evt-share-3'),
    usageService.consumeEventQuota(LITE_ID, LITE_PROJ_2, 'evt-share-4'),
    usageService.consumeEventQuota(LITE_ID, LITE_PROJ_1, 'evt-share-5'),
  ]);
  assert.equal(results.filter((r) => r.allowed).length, 3);

  // Duplicate event_id does not count twice
  const dup = await usageService.consumeEventQuota(LITE_ID, LITE_PROJ_1, 'evt-share-1');
  assert.equal(dup.duplicate, true);
});

test('Lite Case 8: Raw data retention is 30 days (keeps 20-day data, deletes 35-day data)', async (t) => {
  const db = createLiteDb();
  mock.method(supabase, 'from', db.from);
  mock.method(supabase, 'rpc', db.rpc);
  t.after(() => mock.restoreAll());

  await RetentionService.cleanupExpiredData();
  // 20-day-old visitor & page_view remain; 35-day-old records are purged
  assert.ok(db.tables.visitors.some((v) => v.id === 'v-us'));
  assert.equal(db.tables.visitors.some((v) => v.id === 'v-old-35'), false);
  assert.ok(db.tables.page_views.some((p) => p.id === 'pv-us'));
  assert.equal(db.tables.page_views.some((p) => p.id === 'pv-old-35'), false);
});

test('Lite Cases 9-11: Globe Analyze, geographic filters, and advanced filters work on Lite', async (t) => {
  const db = createLiteDb();
  const baseUrl = await startLiteServer(t, db);
  const headers = authHeaders(db, LITE_ID);

  const globeRes = await fetch(`${baseUrl}/api/v1/projects/${LITE_PROJ_1}/analytics/globe?country=India&region=Karnataka`, { headers });
  assert.equal(globeRes.status, 200);
  const globeBody = await globeRes.json();
  assert.equal(globeBody.markers.length, 1);
  assert.equal(globeBody.markers[0].country, 'India');

  const countriesRes = await fetch(`${baseUrl}/api/v1/projects/${LITE_PROJ_1}/analytics/countries?range=30d`, { headers });
  assert.equal(countriesRes.status, 200);
  const countriesBody = await countriesRes.json();
  assert.ok(Array.isArray(countriesBody.regions));

  const advRes = await fetch(
    `${baseUrl}/api/v1/projects/${LITE_PROJ_1}/analytics/overview?range=30d&device=mobile&utm_campaign=spring_launch`,
    { headers }
  );
  assert.equal(advRes.status, 200);
  const advBody = await advRes.json();
  assert.equal(advBody.totalPageViews, 1);
});

test('Lite Cases 12-13: CSV and PDF exports work on Lite', async (t) => {
  const db = createLiteDb();
  const baseUrl = await startLiteServer(t, db);
  const headers = authHeaders(db, LITE_ID);

  const csvRes = await fetch(`${baseUrl}/api/v1/projects/${LITE_PROJ_1}/analytics/export?format=csv&type=countries&range=30d`, { headers });
  assert.equal(csvRes.status, 200);
  assert.ok(csvRes.headers.get('content-type').includes('text/csv'));
  const csvText = await csvRes.text();
  assert.ok(csvText.includes('country,visitors'));

  const pdfRes = await fetch(`${baseUrl}/api/v1/projects/${LITE_PROJ_1}/analytics/export?format=pdf&range=30d`, { headers });
  assert.equal(pdfRes.status, 200);
  assert.ok(pdfRes.headers.get('content-type').includes('application/pdf'));
  const pdfBuf = Buffer.from(await pdfRes.arrayBuffer());
  assert.equal(pdfBuf.subarray(0, 4).toString(), '%PDF');
});

test('Lite Cases 14-16: Report sharing (10/month allowed, 11th rejected, 30-day expiry)', async (t) => {
  const db = createLiteDb();
  const baseUrl = await startLiteServer(t, db);
  const headers = authHeaders(db, LITE_ID);

  let lastToken = null;
  for (let i = 1; i <= 10; i++) {
    const res = await fetch(`${baseUrl}/api/v1/projects/${LITE_PROJ_1}/share-reports`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ title: `Lite Report ${i}` }),
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    lastToken = body.share_token;
    const daysToExpiry = (new Date(body.report.expires_at).getTime() - Date.now()) / 86400000;
    assert.ok(daysToExpiry > 29 && daysToExpiry <= 30.1);
  }

  const res11 = await fetch(`${baseUrl}/api/v1/projects/${LITE_PROJ_1}/share-reports`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ title: 'Lite Report 11' }),
  });
  assert.equal(res11.status, 403);

  // Expiry after 30 days enforced
  db.tables.shared_reports[9].expires_at = new Date(Date.now() - 1000).toISOString();
  const expiredRes = await fetch(`${baseUrl}/api/v1/projects/share/${lastToken}`);
  assert.equal(expiredRes.status, 410);
});

test('Lite Cases 17-19: Team membership, invitations, 4th member rejection, and role permissions', async (t) => {
  const db = createLiteDb();
  const baseUrl = await startLiteServer(t, db);
  const ownerHeaders = authHeaders(db, LITE_ID);
  const viewerHeaders = authHeaders(db, MEMBER_VIEWER_ID);
  const adminHeaders = authHeaders(db, MEMBER_ADMIN_ID);
  const outsiderHeaders = authHeaders(db, OUTSIDER_ID);

  // Invite viewer (seat 2/3) & admin (seat 3/3)
  const invViewer = await fetch(`${baseUrl}/api/v1/projects/${LITE_PROJ_1}/members/invite`, {
    method: 'POST',
    headers: ownerHeaders,
    body: JSON.stringify({ email: 'viewer@example.com', role: 'viewer' }),
  });
  assert.equal(invViewer.status, 201);
  const { inviteToken: viewerToken } = await invViewer.json();

  const invAdmin = await fetch(`${baseUrl}/api/v1/projects/${LITE_PROJ_1}/members/invite`, {
    method: 'POST',
    headers: ownerHeaders,
    body: JSON.stringify({ email: 'admin@example.com', role: 'admin' }),
  });
  assert.equal(invAdmin.status, 201);
  const { inviteToken: adminToken } = await invAdmin.json();

  // Case 18: 4th member rejected
  const inv4 = await fetch(`${baseUrl}/api/v1/projects/${LITE_PROJ_1}/members/invite`, {
    method: 'POST',
    headers: ownerHeaders,
    body: JSON.stringify({ email: 'fourth@example.com', role: 'viewer' }),
  });
  assert.equal(inv4.status, 403);

  // Accept invitations
  assert.equal((await fetch(`${baseUrl}/api/v1/projects/invitations/${viewerToken}/accept`, { method: 'POST', headers: viewerHeaders })).status, 200);
  assert.equal((await fetch(`${baseUrl}/api/v1/projects/invitations/${adminToken}/accept`, { method: 'POST', headers: adminHeaders })).status, 200);

  // Case 17 & 19: Viewer can read analytics, cannot add origin; Admin can add origin; Outsider gets 404
  assert.equal((await fetch(`${baseUrl}/api/v1/projects/${LITE_PROJ_1}/analytics/overview`, { headers: viewerHeaders })).status, 200);
  assert.equal((await fetch(`${baseUrl}/api/v1/projects/${LITE_PROJ_1}/origins`, { method: 'POST', headers: viewerHeaders, body: JSON.stringify({ origin: 'https://v.example.com' }) })).status, 403);
  assert.equal((await fetch(`${baseUrl}/api/v1/projects/${LITE_PROJ_1}/origins`, { method: 'POST', headers: adminHeaders, body: JSON.stringify({ origin: 'https://a.example.com' }) })).status, 201);
  assert.equal((await fetch(`${baseUrl}/api/v1/projects/${LITE_PROJ_1}/analytics/overview`, { headers: outsiderHeaders })).status, 404);
});

test('Lite Case 20: API rate limit enforced at 60 requests/minute for Lite', async (t) => {
  const db = createLiteDb();
  const baseUrl = await startLiteServer(t, db);
  const headers = authHeaders(db, LITE_ID);

  let hit429 = false;
  for (let i = 0; i < 65; i++) {
    const res = await fetch(`${baseUrl}/api/v1/projects/${LITE_PROJ_1}/analytics/devices`, { headers });
    if (res.status === 429) {
      hit429 = true;
      break;
    }
  }
  assert.equal(hit429, true);
});

test('Lite Cases 21-25: Nano backward compatibility, Lite V2 Beta block, and Pro/Max unchanged', async (t) => {
  const db = createLiteDb();
  const baseUrl = await startLiteServer(t, db);
  const nanoHeaders = authHeaders(db, NANO_ID);
  const liteV2Headers = authHeaders(db, LITE_ID, { 'X-WebPulse-App': 'v2_beta' });
  const proV2Headers = authHeaders(db, PRO_ID, { 'X-WebPulse-App': 'v2_beta' });

  // Cases 21-23: Nano restrictions remain active
  assert.equal((await fetch(`${baseUrl}/api/v1/projects/${NANO_PROJ}/analytics/globe`, { headers: nanoHeaders })).status, 403);
  assert.equal((await fetch(`${baseUrl}/api/v1/projects/${NANO_PROJ}/analytics/export?format=csv`, { headers: nanoHeaders })).status, 403);
  assert.equal((await fetch(`${baseUrl}/api/v1/projects/${NANO_PROJ}/analytics/overview?country=India`, { headers: nanoHeaders })).status, 403);

  // Case 24: Lite blocked from V2 Beta; Pro allowed
  assert.equal((await fetch(`${baseUrl}/api/v1/projects`, { headers: liteV2Headers })).status, 403);
  assert.equal((await fetch(`${baseUrl}/api/v1/projects`, { headers: proV2Headers })).status, 200);

  // Case 25: Pro and Max entitlements unchanged
  const pro = getPlanLimits('pro');
  const max = getPlanLimits('max');
  assert.equal(pro.monthlyViews, 1000000);
  assert.equal(pro.access.v2_beta, true);
  assert.equal(max.monthlyViews, 2000000);
  assert.equal(max.access.alpha, true);
});
