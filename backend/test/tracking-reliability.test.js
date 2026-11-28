import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import vm from 'node:vm';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-only-secret';
process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_KEY = 'test-only-service-key';
process.env.FRONTEND_URL = 'http://localhost:5173';
process.env.FRONTEND_URLS = 'http://localhost:5173';

const { default: supabase } = await import('../src/config/supabase.js');
const { default: createApp } = await import('../src/app.js');
const { generateToken, verifyToken } = await import('../src/utils/jwt.js');
const { anonymizeIp } = await import('../src/utils/ip.js');
const { consumeIngestionToken, __resetPlanRateLimiters } = await import('../src/middlewares/rateLimiter.js');

const USER_ID = '11111111-1111-4111-8111-111111111111';
const PROJECT_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const PROJECT_B_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

function createMemoryDb() {
  const nowIso = new Date().toISOString();
  const oldIso = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString();
  const currentMonth = nowIso.slice(0, 7);

  const tables = {
    users: [
      { id: USER_ID, email: 'owner@example.com', name: 'Owner', plan: 'lite', is_verified: true, created_at: nowIso },
    ],
    user_sessions: [
      { id: 'sess-1', user_id: USER_ID, token_jti: 'jti-1', revoked_at: null, expires_at: new Date(Date.now() + 3600_000).toISOString() },
    ],
    projects: [
      {
        id: PROJECT_ID,
        user_id: USER_ID,
        owner_id: USER_ID,
        name: 'portfolio',
        tracking_id: 'trk_719084467c49',
        plan: 'lite',
        is_active: true,
        allowed_origins: null,
        timezone: 'Asia/Kolkata',
        created_at: nowIso,
      },
      {
        id: PROJECT_B_ID,
        user_id: USER_ID,
        owner_id: USER_ID,
        name: 'secondary',
        tracking_id: 'trk_secondary_99',
        plan: 'nano',
        is_active: true,
        allowed_origins: null,
        timezone: 'UTC',
        created_at: nowIso,
      },
    ],
    project_origins: [],
    project_members: [
      { id: 'mem-1', project_id: PROJECT_ID, user_id: USER_ID, role: 'owner', status: 'active' },
    ],
    project_settings: [
      { project_id: PROJECT_ID, anonymize_ip: true, retention_days: 30, tracking_enabled: true },
      { project_id: PROJECT_B_ID, anonymize_ip: false, retention_days: 7, tracking_enabled: true },
    ],
    api_keys: [],
    usages: [
      { id: 'usg-1', user_id: USER_ID, project_id: PROJECT_ID, month: currentMonth, views: 0, count: 0 },
    ],
    ingested_events: [],
    visitors: [],
    sessions: [],
    page_views: [],
    events: [],
    counters: [
      { project_id: PROJECT_ID, count: 0 },
      { project_id: PROJECT_B_ID, count: 0 },
    ],
    analytics_daily: [],
    activity_logs: [],
    notifications: [],
  };

  const clone = (row) => (row === null || row === undefined ? row : JSON.parse(JSON.stringify(row)));

  function makeQuery(tableName) {
    let filters = [];
    let isInsert = false;
    let isUpdate = false;
    let isUpsert = false;
    let payload = null;
    let upsertConflict = null;
    let limitN = null;
    let orderCol = null;
    let orderAsc = true;
    let countOnly = false;
    let singleMode = null;

    const matchRow = (row) =>
      filters.every((f) => {
        if (f.type === 'eq') return row[f.col] === f.val;
        if (f.type === 'neq') return row[f.col] !== f.val;
        if (f.type === 'in') return Array.isArray(f.val) && f.val.includes(row[f.col]);
        if (f.type === 'not') {
          if (f.op === 'is' && f.val === null) return row[f.col] !== null && row[f.col] !== undefined;
          return true;
        }
        if (f.type === 'gte') return String(row[f.col] ?? '') >= String(f.val);
        if (f.type === 'lt') return String(row[f.col] ?? '') < String(f.val);
        if (f.type === 'ilike') {
          const needle = String(f.val).replace(/%/g, '').toLowerCase();
          return String(row[f.col] ?? '').toLowerCase().includes(needle);
        }
        if (f.type === 'or') {
          return f.expr.split(',').some((clause) => {
            const [col, op, ...rest] = clause.split('.');
            const val = rest.join('.');
            if (op === 'eq') return String(row[col]) === val;
            return false;
          });
        }
        return true;
      });

    const exec = async () => {
      const table = tables[tableName] || (tables[tableName] = []);

      if (isInsert) {
        const rows = Array.isArray(payload) ? payload : [payload];
        const inserted = rows.map((r) => {
          const rec = {
            id: r.id || crypto.randomUUID(),
            created_at: r.created_at || new Date().toISOString(),
            ...clone(r),
          };
          table.push(rec);
          return clone(rec);
        });
        if (singleMode) return { data: inserted[0] || null, error: null };
        return { data: inserted, error: null };
      }

      if (isUpsert) {
        const rows = Array.isArray(payload) ? payload : [payload];
        const out = [];
        for (const r of rows) {
          const idx = upsertConflict
            ? table.findIndex((existing) => existing[upsertConflict] === r[upsertConflict])
            : -1;
          if (idx >= 0) {
            table[idx] = { ...table[idx], ...clone(r) };
            out.push(clone(table[idx]));
          } else {
            const rec = {
              id: r.id || crypto.randomUUID(),
              created_at: r.created_at || new Date().toISOString(),
              ...clone(r),
            };
            table.push(rec);
            out.push(clone(rec));
          }
        }
        if (singleMode) return { data: out[0] || null, error: null };
        return { data: out, error: null };
      }

      if (isUpdate) {
        const matched = [];
        for (let i = 0; i < table.length; i++) {
          if (matchRow(table[i])) {
            table[i] = { ...table[i], ...clone(payload) };
            matched.push(clone(table[i]));
          }
        }
        if (singleMode) return { data: matched[0] || null, error: null };
        return { data: matched, error: null };
      }

      let matched = table.filter(matchRow).map(clone);
      if (tableName === 'page_views') {
        matched = matched.map((pv) => ({
          ...pv,
          visitors: tables.visitors.find((v) => v.id === pv.visitor_id) || null,
        }));
      }
      if (orderCol) {
        matched.sort((a, b) => {
          const av = String(a[orderCol] ?? '');
          const bv = String(b[orderCol] ?? '');
          return orderAsc ? av.localeCompare(bv) : bv.localeCompare(av);
        });
      }
      if (limitN !== null) matched = matched.slice(0, limitN);
      if (countOnly) return { count: matched.length, data: null, error: null };
      if (singleMode === 'single') {
        if (!matched[0]) return { data: null, error: { code: 'PGRST116', message: 'Not found' } };
        return { data: matched[0], error: null };
      }
      if (singleMode === 'maybeSingle') {
        return { data: matched[0] || null, error: null };
      }
      return { data: matched, count: matched.length, error: null };
    };

    const builder = {
      select(_cols, opts) {
        if (opts?.head && opts?.count) countOnly = true;
        return builder;
      },
      insert(data) {
        isInsert = true;
        payload = data;
        return builder;
      },
      update(data) {
        isUpdate = true;
        payload = data;
        return builder;
      },
      upsert(data, opts) {
        isUpsert = true;
        payload = data;
        upsertConflict = opts?.onConflict || null;
        return builder;
      },
      eq(col, val) {
        filters.push({ type: 'eq', col, val });
        return builder;
      },
      in(col, val) {
        filters.push({ type: 'in', col, val });
        return builder;
      },
      not(col, op, val) {
        filters.push({ type: 'not', col, op, val });
        return builder;
      },
      gte(col, val) {
        filters.push({ type: 'gte', col, val });
        return builder;
      },
      lt(col, val) {
        filters.push({ type: 'lt', col, val });
        return builder;
      },
      ilike(col, val) {
        filters.push({ type: 'ilike', col, val });
        return builder;
      },
      neq(col, val) {
        filters.push({ type: 'neq', col, val });
        return builder;
      },
      or(expr) {
        filters.push({ type: 'or', expr });
        return builder;
      },
      order(col, opts) {
        orderCol = col;
        orderAsc = opts?.ascending !== false;
        return builder;
      },
      limit(n) {
        limitN = n;
        return builder;
      },
      single() {
        singleMode = 'single';
        return builder;
      },
      maybeSingle() {
        singleMode = 'maybeSingle';
        return builder;
      },
      then(resolve, reject) {
        return exec().then(resolve, reject);
      },
    };
    return builder;
  }

  return {
    tables,
    oldIso,
    from: (tableName) => makeQuery(tableName),
    rpc: async (fnName, params) => {
      if (fnName === 'increment_project_counter') {
        const c = tables.counters.find((r) => r.project_id === params.p_id);
        if (c) c.count += 1;
        else tables.counters.push({ project_id: params.p_id, count: 1 });
        return { data: null, error: null };
      }
      return { data: null, error: { message: 'RPC not mocked' } };
    },
  };
}

async function startServer(t, db) {
  const origFrom = supabase.from;
  const origRpc = supabase.rpc;
  supabase.from = db.from;
  supabase.rpc = db.rpc;
  __resetPlanRateLimiters();

  const app = createApp();
  const server = app.listen(0);
  t.after(() => {
    server.close();
    supabase.from = origFrom;
    supabase.rpc = origRpc;
    delete process.env.STRICT_ORIGIN_VERIFICATION;
    delete process.env.REQUIRE_API_KEY_FOR_ANALYTICS;
  });
  const { port } = server.address();
  return `http://127.0.0.1:${port}`;
}

function makeAuthHeader(db, userId = USER_ID) {
  const token = generateToken(userId);
  const decoded = verifyToken(token);
  db.tables.user_sessions.push({
    id: `us-${decoded.jti}`,
    user_id: userId,
    token_id: decoded.jti,
    purpose: 'session',
    revoked_at: null,
    expires_at: new Date(Date.now() + 3600_000).toISOString(),
  });
  return { Authorization: `Bearer ${token}` };
}

test('1. SDK script.js returns valid JS, supports command queue, data-site, and fetch+Blob fallback', async (t) => {
  const db = createMemoryDb();
  const baseUrl = await startServer(t, db);

  const res = await fetch(`${baseUrl}/api/v1/track/script.js`);
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type') || '', /application\/javascript/);
  const code = await res.text();

  // Execute SDK inside an isolated VM with mocked browser globals
  const fetchCalls = [];
  const windowObj = {
    location: { href: 'https://portfolio.example.com/' },
    crypto: { randomUUID: () => '11111111-1111-4111-8111-111111111111' },
  };
  // Simulate pre-load command queue before script executes
  windowObj.tracker = (...args) => {
    windowObj.tracker.q = windowObj.tracker.q || [];
    windowObj.tracker.q.push(args);
  };
  windowObj.tracker('init', 'trk_719084467c49');
  windowObj.tracker('track', 'page_view');

  const context = vm.createContext({
    window: windowObj,
    document: { referrer: 'https://google.com', title: 'Portfolio Home', currentScript: null },
    navigator: { userAgent: 'Mozilla/5.0 TestBrowser', sendBeacon: () => true },
    Blob,
    console,
    fetch: async (url, opts) => {
      fetchCalls.push({ url, opts });
      return { ok: true, status: 200 };
    },
  });

  vm.runInContext(code, context);
  assert.equal(fetchCalls.length, 1);
  assert.equal(fetchCalls[0].url, `${baseUrl}/api/v1/track/events`);
  assert.equal(fetchCalls[0].opts.headers['Content-Type'], 'application/json');
  assert.equal(fetchCalls[0].opts.headers['x-api-key'], 'trk_719084467c49');
  const sentBody = JSON.parse(fetchCalls[0].opts.body);
  assert.equal(sentBody.event, 'page_view');
  assert.equal(sentBody.type, 'pageview');
  assert.equal(sentBody.title, 'Portfolio Home');
});

test('2. sendBeacon text/plain JSON transport is parsed and malformed JSON is rejected with 400', async (t) => {
  const db = createMemoryDb();
  const baseUrl = await startServer(t, db);

  const okRes = await fetch(`${baseUrl}/api/v1/track/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=UTF-8',
      'Accept-Language': 'en-US',
      Origin: 'https://portfolio.example.com',
    },
    body: JSON.stringify({
      event: 'page_view',
      tracking_id: 'trk_719084467c49',
      url: 'https://portfolio.example.com/',
      title: 'Home',
      event_id: 'evt-beacon-1',
    }),
  });
  assert.equal(okRes.status, 200);
  assert.equal(db.tables.page_views.length, 1);
  assert.equal(db.tables.events.length, 0);

  const badRes = await fetch(`${baseUrl}/api/v1/track/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
    body: '{not-valid-json',
  });
  assert.equal(badRes.status, 400);
  const badJson = await badRes.json();
  assert.equal(badJson.code, 'INVALID_JSON');
});

test('3. Page-view vs custom event persistence are mutually exclusive', async (t) => {
  const db = createMemoryDb();
  const baseUrl = await startServer(t, db);

  const pvRes = await fetch(`${baseUrl}/api/v1/track/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'trk_719084467c49',
      'Accept-Language': 'en-US',
      'x-forwarded-for': '198.51.100.21',
      Origin: 'https://portfolio.example.com',
    },
    body: JSON.stringify({
      event: 'page_view',
      url: 'https://portfolio.example.com/about',
      title: 'About',
      event_id: 'evt-pv-only',
    }),
  });
  assert.equal(pvRes.status, 200);
  assert.equal(db.tables.page_views.length, 1);
  assert.equal(db.tables.events.length, 0);
  assert.equal(db.tables.page_views[0].path, '/about');

  const customRes = await fetch(`${baseUrl}/api/v1/track/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'trk_719084467c49',
      'Accept-Language': 'en-US',
      'x-forwarded-for': '198.51.100.22',
      Origin: 'https://portfolio.example.com',
    },
    body: JSON.stringify({
      event: 'button_click',
      url: 'https://portfolio.example.com/about',
      event_id: 'evt-custom-only',
    }),
  });
  assert.equal(customRes.status, 200);
  assert.equal(db.tables.page_views.length, 1);
  assert.equal(db.tables.events.length, 1);
  assert.equal(db.tables.events[0].event_name, 'button_click');
});

test('4. Rate-limit buckets are isolated per project', () => {
  __resetPlanRateLimiters();
  // Exhaust project B (nano burst = 20)
  for (let i = 0; i < 20; i++) {
    const res = consumeIngestionToken({ bucketKey: `project:${PROJECT_B_ID}`, planId: 'nano', now: 1000 });
    assert.equal(res.allowed, true);
  }
  const blockedB = consumeIngestionToken({ bucketKey: `project:${PROJECT_B_ID}`, planId: 'nano', now: 1000 });
  assert.equal(blockedB.allowed, false);

  // Project A must remain unaffected
  const allowedA = consumeIngestionToken({ bucketKey: `project:${PROJECT_ID}`, planId: 'nano', now: 1000 });
  assert.equal(allowedA.allowed, true);
});

test('5. Analytics consistency: counters reconciliation and date-window alignment', async (t) => {
  const db = createMemoryDb();
  // Simulate historical rows where counters.count was out of sync (0) and one row is 20 days old
  db.tables.visitors.push(
    { id: 'v-old', project_id: PROJECT_ID, user_id: USER_ID, session_id: 's-old', visitor_hash: 'h1', ip_address: '10.0.0.0', device_type: 'desktop', created_at: db.oldIso, last_seen: db.oldIso },
    { id: 'v-new', project_id: PROJECT_ID, user_id: USER_ID, session_id: 's-new', visitor_hash: 'h2', ip_address: '10.0.1.0', device_type: 'mobile', created_at: new Date().toISOString(), last_seen: new Date().toISOString() }
  );
  db.tables.page_views.push(
    { id: 'pv-old', project_id: PROJECT_ID, user_id: USER_ID, visitor_id: 'v-old', page_url: 'https://portfolio.example.com/old', path: '/old', title: 'Old', created_at: db.oldIso },
    { id: 'pv-new', project_id: PROJECT_ID, user_id: USER_ID, visitor_id: 'v-new', page_url: 'https://portfolio.example.com/new', path: '/new', title: 'New', created_at: new Date().toISOString() }
  );
  const baseUrl = await startServer(t, db);

  // counters.count is 0, but overview reconciles against persisted page_views (2)
  const overviewRes = await fetch(`${baseUrl}/api/v1/analytics/projects/${PROJECT_ID}/overview`, {
    headers: makeAuthHeader(db),
  });
  assert.equal(overviewRes.status, 200);
  const overview = await overviewRes.json();
  assert.equal(overview.total_views, 2);

  // 7d traffic should include only pv-new in BOTH trafficData/topPages AND activityList
  const traffic7dRes = await fetch(`${baseUrl}/api/v1/analytics/projects/${PROJECT_ID}/traffic?range=7d`, {
    headers: makeAuthHeader(db),
  });
  assert.equal(traffic7dRes.status, 200);
  const traffic7d = await traffic7dRes.json();
  assert.equal(traffic7d.uniqueVisitors, 1);
  assert.equal(traffic7d.topPages.length, 1);
  assert.equal(traffic7d.topPages[0].url, '/new');
  assert.equal(traffic7d.activityList.length, 1);
  assert.equal(traffic7d.activityList[0].path, '/new');
});

test('6. IP anonymization masks stored IPs and omits raw IPs from dashboard APIs', async (t) => {
  const db = createMemoryDb();
  const baseUrl = await startServer(t, db);

  assert.equal(anonymizeIp('203.0.113.42'), '203.0.113.0');
  assert.equal(anonymizeIp('::ffff:203.0.113.42'), '203.0.113.0');

  // Project A has anonymize_ip: true
  const trackRes = await fetch(`${baseUrl}/api/v1/track/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'trk_719084467c49',
      'Accept-Language': 'en-US',
      'x-forwarded-for': '203.0.113.42',
      Origin: 'https://portfolio.example.com',
    },
    body: JSON.stringify({ event: 'page_view', url: 'https://portfolio.example.com/', event_id: 'evt-ip-1' }),
  });
  assert.equal(trackRes.status, 200);
  assert.equal(db.tables.visitors[0].ip_address, '203.0.113.0');

  const trafficRes = await fetch(`${baseUrl}/api/v1/analytics/projects/${PROJECT_ID}/traffic?range=7d`, {
    headers: makeAuthHeader(db),
  });
  const traffic = await trafficRes.json();
  assert.equal(traffic.activityList[0].ip, undefined);

  const liveRes = await fetch(`${baseUrl}/api/v1/analytics/overview?range=7d`, {
    headers: makeAuthHeader(db),
  });
  const live = await liveRes.json();
  assert.equal(live.visitorsList[0].ip_address, undefined);
});

test('7. Security: strict origin mode, analytics wpk_ auth, and verified-origin enforcement', async (t) => {
  const db = createMemoryDb();
  const secretKey = 'wpk_test_secret_1234567890abcdef1234567890';
  db.tables.api_keys.push({
    id: 'key-1',
    project_id: PROJECT_ID,
    key_prefix: secretKey.substring(0, 8),
    key_hash: crypto.createHash('sha256').update(secretKey).digest('hex'),
    revoked_at: null,
    expires_at: null,
  });
  const baseUrl = await startServer(t, db);

  // Transition mode (0 origins): emits warning header instead of silently ignoring
  const warnRes = await fetch(`${baseUrl}/api/v1/track/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'trk_719084467c49',
      'Accept-Language': 'en-US',
      'x-forwarded-for': '198.51.100.77',
      Origin: 'https://portfolio.example.com',
    },
    body: JSON.stringify({ event: 'page_view', url: 'https://portfolio.example.com/', event_id: 'evt-warn-1' }),
  });
  assert.equal(warnRes.status, 200);
  assert.equal(warnRes.headers.get('x-webpulse-origin-warning'), 'unverified-fallback');

  // Strict mode: 0 origins blocks public trk_ ingestion
  process.env.STRICT_ORIGIN_VERIFICATION = 'true';
  const strictBlock = await fetch(`${baseUrl}/api/v1/track/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'trk_719084467c49',
      'Accept-Language': 'en-US',
      Origin: 'https://portfolio.example.com',
    },
    body: JSON.stringify({ event: 'page_view', url: 'https://portfolio.example.com/', event_id: 'evt-strict-1' }),
  });
  assert.equal(strictBlock.status, 403);

  // Secret wpk_ key still works server-side for both ingestion and analytics/count
  process.env.REQUIRE_API_KEY_FOR_ANALYTICS = 'true';
  const trkCountBlocked = await fetch(`${baseUrl}/api/v1/analytics/count`, {
    headers: { 'x-api-key': 'trk_719084467c49' },
  });
  assert.equal(trkCountBlocked.status, 401);

  const wpkCountOk = await fetch(`${baseUrl}/api/v1/analytics/count`, {
    headers: { 'x-api-key': secretKey },
  });
  assert.equal(wpkCountOk.status, 200);
  const wpkData = await wpkCountOk.json();
  assert.equal(wpkData.count, 1);
});

test('8. Automatic mode (data-site="auto"): resolves verified origin, rejects unverified/missing origin, and blocks duplicate claim', async (t) => {
  const db = createMemoryDb();
  db.tables.project_origins.push(
    { id: 'org-verified', project_id: PROJECT_ID, origin: 'https://portfolio.example.com', hostname: 'portfolio.example.com', status: 'verified', verification_token: 'tok-1' },
    { id: 'org-pending', project_id: PROJECT_B_ID, origin: 'https://pending.example.com', hostname: 'pending.example.com', status: 'pending', verification_token: 'tok-2' }
  );
  const baseUrl = await startServer(t, db);

  // SDK /tracker.js with data-site="auto" auto-tracks page_view with tracking_id: "auto"
  const scriptRes = await fetch(`${baseUrl}/api/v1/track/tracker.js`);
  assert.equal(scriptRes.status, 200);
  const code = await scriptRes.text();
  const fetchCalls = [];
  const windowObj = {
    location: { href: 'https://portfolio.example.com/projects' },
    crypto: { randomUUID: () => '22222222-2222-4222-8222-222222222222' },
  };
  vm.runInContext(
    code,
    vm.createContext({
      window: windowObj,
      document: {
        referrer: '',
        title: 'Projects',
        currentScript: { getAttribute: (name) => (name === 'data-site' ? 'auto' : null) },
      },
      navigator: { userAgent: 'Mozilla/5.0 TestBrowser', sendBeacon: () => true },
      Blob,
      console,
      fetch: async (url, opts) => {
        fetchCalls.push({ url, opts });
        return { ok: true, status: 200 };
      },
    })
  );
  assert.equal(fetchCalls.length, 1);
  assert.equal(JSON.parse(fetchCalls[0].opts.body).tracking_id, 'auto');

  // Verified origin resolves and persists page_view
  const okAuto = await fetch(`${baseUrl}/api/v1/track/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'auto',
      'Accept-Language': 'en-US',
      'x-forwarded-for': '198.51.100.88',
      Origin: 'https://portfolio.example.com',
    },
    body: JSON.stringify({ event: 'page_view', url: 'https://portfolio.example.com/projects', event_id: 'evt-auto-1' }),
  });
  assert.equal(okAuto.status, 200);
  assert.equal(db.tables.page_views.length, 1);
  assert.equal(db.tables.page_views[0].project_id, PROJECT_ID);

  // Pending / unverified origin is rejected
  const pendingAuto = await fetch(`${baseUrl}/api/v1/track/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'auto',
      'Accept-Language': 'en-US',
      Origin: 'https://pending.example.com',
    },
    body: JSON.stringify({ event: 'page_view', url: 'https://pending.example.com/', event_id: 'evt-auto-2' }),
  });
  assert.equal(pendingAuto.status, 403);

  // Missing Origin header is rejected with 400
  const noOriginAuto = await fetch(`${baseUrl}/api/v1/track/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'auto',
      'Accept-Language': 'en-US',
    },
    body: JSON.stringify({ event: 'page_view', url: 'https://portfolio.example.com/', event_id: 'evt-auto-3' }),
  });
  assert.equal(noOriginAuto.status, 400);

  // Duplicate verified origin claim on another project is rejected with 409
  const { default: originService } = await import('../src/services/origin.service.js');
  db.tables.project_origins.push({
    id: 'org-dup',
    project_id: PROJECT_B_ID,
    origin: 'https://portfolio.example.com',
    hostname: 'portfolio.example.com',
    status: 'pending',
    verification_token: 'tok-dup',
  });
  await assert.rejects(
    () =>
      originService.verifyOrigin({
        projectId: PROJECT_B_ID,
        originId: 'org-dup',
        userId: USER_ID,
        method: 'dns_txt',
        dnsResolver: async () => [['webpulse-verification=tok-dup']],
      }),
    (err) => err.statusCode === 409 && err.code === 'ORIGIN_ALREADY_CLAIMED'
  );
});
