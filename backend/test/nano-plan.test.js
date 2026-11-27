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
const { default: usageService, __resetAlertCacheForTests } = await import('../src/services/usage.service.js');
const { default: originService } = await import('../src/services/origin.service.js');
const { default: RetentionService } = await import('../src/services/retention.service.js');
const { __resetPlanRateLimiters } = await import('../src/middlewares/rateLimiter.js');

const NANO_USER_ID = '11111111-1111-4111-8111-111111111111';
const LITE_USER_ID = '22222222-2222-4222-8222-222222222222';
const PRO_USER_ID = '33333333-3333-4333-8333-333333333333';
const PROJECT_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

function createMemoryDb() {
    const nowIso = new Date().toISOString();
    const oldIso = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
    const currentMonth = nowIso.slice(0, 7);

    const tables = {
        users: [
            { id: NANO_USER_ID, email: 'nano@example.com', name: 'Nano User', plan: 'nano', is_verified: true, created_at: nowIso },
            { id: LITE_USER_ID, email: 'lite@example.com', name: 'Lite User', plan: 'lite', is_verified: true, created_at: nowIso },
            { id: PRO_USER_ID, email: 'pro@example.com', name: 'Pro User', plan: 'pro', is_verified: true, created_at: nowIso }
        ],
        user_sessions: [],
        plans: [],
        projects: [
            {
                id: PROJECT_ID,
                user_id: NANO_USER_ID,
                name: 'my-business',
                tracking_id: 'trk_nano_123456',
                plan: 'nano',
                is_active: true,
                allowed_origins: null,
                timezone: 'UTC',
                created_at: nowIso
            }
        ],
        project_origins: [],
        project_members: [
            { id: 'mem-1', project_id: PROJECT_ID, user_id: NANO_USER_ID, role: 'owner', status: 'active', created_at: nowIso }
        ],
        project_settings: [
            { project_id: PROJECT_ID, retention_days: 7, tracking_enabled: true }
        ],
        usages: [
            { id: 'usg-1', project_id: PROJECT_ID, month: currentMonth, views: 0, alerts_sent: {}, updated_at: nowIso }
        ],
        counters: [{ project_id: PROJECT_ID, count: 0 }],
        ingested_events: [],
        shared_reports: [],
        visitors: [
            {
                id: 'vis-recent',
                project_id: PROJECT_ID,
                visitor_hash: 'vh_recent',
                ip_address: '1.2.3.4',
                country: 'India',
                city: 'Bengaluru',
                device_type: 'desktop',
                browser: 'Chrome',
                os: 'Windows',
                last_seen: nowIso,
                last_seen_at: nowIso,
                created_at: nowIso
            },
            {
                id: 'vis-old',
                project_id: PROJECT_ID,
                visitor_hash: 'vh_old',
                ip_address: '5.6.7.8',
                country: 'United States',
                city: 'New York',
                device_type: 'mobile',
                browser: 'Safari',
                os: 'iOS',
                last_seen: oldIso,
                last_seen_at: oldIso,
                created_at: oldIso
            }
        ],
        sessions: [
            { id: 'ses-1', project_id: PROJECT_ID, visitor_id: 'vis-recent', started_at: nowIso, last_activity_at: nowIso },
            { id: 'ses-old', project_id: PROJECT_ID, visitor_id: 'vis-old', started_at: oldIso, last_activity_at: oldIso }
        ],
        page_views: [
            {
                id: 'pv-1',
                project_id: PROJECT_ID,
                visitor_id: 'vis-recent',
                session_id: 'ses-1',
                page_url: 'https://example.com/pricing',
                title: 'Pricing',
                referrer: 'https://www.google.com/search?q=webpulse',
                created_at: nowIso,
                viewed_at: nowIso
            },
            {
                id: 'pv-old',
                project_id: PROJECT_ID,
                visitor_id: 'vis-old',
                session_id: 'ses-old',
                page_url: 'https://example.com/old',
                title: 'Old',
                referrer: '',
                created_at: oldIso,
                viewed_at: oldIso
            }
        ],
        events: [
            { id: 'ev-1', project_id: PROJECT_ID, event_name: 'signup', occurred_at: nowIso, created_at: nowIso },
            { id: 'ev-old', project_id: PROJECT_ID, event_name: 'old_ev', occurred_at: oldIso, created_at: oldIso }
        ],
        analytics_daily: [
            { id: 'ad-1', project_id: PROJECT_ID, date: currentMonth + '-01', views: 5 }
        ],
        notifications: [],
        activity_logs: [],
        api_keys: []
    };

    let idSeq = 1;
    const nextId = (prefix) => `${prefix}-${idSeq++}`;

    function applyFilters(rows, filters) {
        return rows.filter((row) =>
            filters.every((f) => {
                const val = row[f.col];
                if (f.op === 'eq') return val === f.val;
                if (f.op === 'neq') return val !== f.val;
                if (f.op === 'in') return Array.isArray(f.val) && f.val.includes(val);
                if (f.op === 'is') return f.val === null ? (val === null || val === undefined) : val === f.val;
                if (f.op === 'gte') return String(val ?? '') >= String(f.val);
                if (f.op === 'lte') return String(val ?? '') <= String(f.val);
                if (f.op === 'lt') return String(val ?? '') < String(f.val);
                if (f.op === 'not') {
                    if (f.notOp === 'is' && f.val === null) return val !== null && val !== undefined;
                    return val !== f.val;
                }
                if (f.op === 'or') {
                    return String(f.val)
                        .split(',')
                        .some((clause) => {
                            const [col, op, target] = clause.split('.');
                            if (op === 'eq') return String(row[col]) === target;
                            return false;
                        });
                }
                return true;
            })
        );
    }

    function from(tableName) {
        if (!tables[tableName]) tables[tableName] = [];
        const state = {
            op: 'select',
            filters: [],
            payload: null,
            head: false,
            countMode: null,
            orderCol: null,
            orderAsc: true,
            limitNum: null,
            selectCols: '*'
        };

        const exec = () => {
            const rows = tables[tableName];
            if (state.op === 'insert') {
                const items = (Array.isArray(state.payload) ? state.payload : [state.payload]).map((item) => ({
                    id: item.id || nextId(tableName.slice(0, 3)),
                    created_at: item.created_at || new Date().toISOString(),
                    ...item
                }));
                if (tableName === 'ingested_events') {
                    for (const item of items) {
                        const dup = rows.find((r) => r.project_id === item.project_id && r.event_id === item.event_id);
                        if (dup) {
                            return { data: null, error: { code: '23505', message: 'duplicate key value violates unique constraint' } };
                        }
                    }
                }
                rows.push(...items);
                return { data: Array.isArray(state.payload) ? items : items[0], error: null };
            }

            if (state.op === 'upsert') {
                const items = Array.isArray(state.payload) ? state.payload : [state.payload];
                for (const item of items) {
                    const idx = rows.findIndex((r) =>
                        (item.id && r.id === item.id) ||
                        (item.project_id && item.month && r.project_id === item.project_id && r.month === item.month) ||
                        (item.project_id && !item.month && tableName === 'project_settings' && r.project_id === item.project_id)
                    );
                    if (idx >= 0) {
                        rows[idx] = { ...rows[idx], ...item };
                    } else {
                        rows.push({ id: item.id || nextId(tableName.slice(0, 3)), ...item });
                    }
                }
                return { data: items[0], error: null };
            }

            const matched = applyFilters(rows, state.filters);

            if (state.op === 'update') {
                matched.forEach((row) => Object.assign(row, state.payload));
                return { data: matched, error: null };
            }

            if (state.op === 'delete') {
                const matchedSet = new Set(matched);
                tables[tableName] = rows.filter((r) => !matchedSet.has(r));
                return { data: matched, count: matched.length, error: null };
            }

            let out = [...matched];
            if (state.orderCol) {
                out.sort((a, b) => {
                    const av = a[state.orderCol] ?? '';
                    const bv = b[state.orderCol] ?? '';
                    return state.orderAsc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
                });
            }
            if (state.limitNum !== null) {
                out = out.slice(0, state.limitNum);
            }

            // Hydrate simple joins used in analytics/overview
            if (tableName === 'page_views' && state.selectCols.includes('visitors(')) {
                out = out.map((pv) => ({
                    ...pv,
                    visitors: tables.visitors.find((v) => v.id === pv.visitor_id) || null
                }));
            }

            return {
                data: state.head ? null : out,
                count: state.countMode ? matched.length : undefined,
                error: null
            };
        };

        const builder = {
            select(cols = '*', opts = {}) {
                if (state.op === 'select') state.selectCols = cols;
                if (opts?.head) state.head = true;
                if (opts?.count) state.countMode = opts.count;
                return builder;
            },
            insert(payload) {
                state.op = 'insert';
                state.payload = payload;
                return builder;
            },
            update(payload) {
                state.op = 'update';
                state.payload = payload;
                return builder;
            },
            upsert(payload) {
                state.op = 'upsert';
                state.payload = payload;
                return builder;
            },
            delete() {
                state.op = 'delete';
                return builder;
            },
            eq(col, val) {
                state.filters.push({ op: 'eq', col, val });
                return builder;
            },
            neq(col, val) {
                state.filters.push({ op: 'neq', col, val });
                return builder;
            },
            in(col, val) {
                state.filters.push({ op: 'in', col, val });
                return builder;
            },
            is(col, val) {
                state.filters.push({ op: 'is', col, val });
                return builder;
            },
            gte(col, val) {
                state.filters.push({ op: 'gte', col, val });
                return builder;
            },
            lte(col, val) {
                state.filters.push({ op: 'lte', col, val });
                return builder;
            },
            lt(col, val) {
                state.filters.push({ op: 'lt', col, val });
                return builder;
            },
            not(col, notOp, val) {
                state.filters.push({ op: 'not', col, notOp, val });
                return builder;
            },
            or(val) {
                state.filters.push({ op: 'or', col: '', val });
                return builder;
            },
            order(col, opts = {}) {
                state.orderCol = col;
                state.orderAsc = opts?.ascending !== false;
                return builder;
            },
            limit(n) {
                state.limitNum = n;
                return builder;
            },
            single() {
                const res = exec();
                const row = Array.isArray(res.data) ? res.data[0] : res.data;
                return Promise.resolve({
                    data: row || null,
                    error: row ? res.error : res.error || { code: 'PGRST116', message: 'Not found' }
                });
            },
            maybeSingle() {
                const res = exec();
                const row = Array.isArray(res.data) ? res.data[0] || null : res.data || null;
                return Promise.resolve({ data: row, error: res.error });
            },
            then(resolve, reject) {
                return Promise.resolve(exec()).then(resolve, reject);
            }
        };
        return builder;
    }

    function rpc(fnName, args) {
        if (fnName === 'consume_monthly_event_quota') {
            if (args.p_event_id) {
                const dup = tables.ingested_events.find(
                    (e) => e.project_id === args.p_project_id && e.event_id === args.p_event_id
                );
                if (dup) {
                    const total = tables.usages
                        .filter((u) => u.month === args.p_month)
                        .reduce((acc, u) => acc + (u.views || 0), 0);
                    return Promise.resolve({ data: { allowed: true, duplicate: true, current_total: total }, error: null });
                }
                tables.ingested_events.push({ project_id: args.p_project_id, event_id: args.p_event_id });
            }

            const userProjects = tables.projects.filter((p) => p.user_id === args.p_user_id).map((p) => p.id);
            const totalBefore = tables.usages
                .filter((u) => userProjects.includes(u.project_id) && u.month === args.p_month)
                .reduce((acc, u) => acc + (u.views || 0), 0);

            if (totalBefore >= args.p_limit) {
                return Promise.resolve({ data: { allowed: false, duplicate: false, current_total: totalBefore }, error: null });
            }

            let row = tables.usages.find((u) => u.project_id === args.p_project_id && u.month === args.p_month);
            if (!row) {
                row = { id: nextId('usg'), project_id: args.p_project_id, month: args.p_month, views: 0, alerts_sent: {} };
                tables.usages.push(row);
            }
            row.views += 1;
            return Promise.resolve({ data: { allowed: true, duplicate: false, current_total: totalBefore + 1 }, error: null });
        }

        if (fnName === 'increment_project_counter') {
            let c = tables.counters.find((x) => x.project_id === args.p_id);
            if (!c) {
                c = { project_id: args.p_id, count: 0 };
                tables.counters.push(c);
            }
            c.count += 1;
            return Promise.resolve({ data: null, error: null });
        }

        if (fnName === 'cleanup_expired_analytics') {
            const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
            const del = (arr, field) => {
                const before = arr.length;
                const kept = arr.filter((r) => (r[field] || r.created_at) >= cutoff);
                return { kept, deleted: before - kept.length };
            };
            const pv = del(tables.page_views, 'viewed_at');
            tables.page_views = pv.kept;
            const ev = del(tables.events, 'occurred_at');
            tables.events = ev.kept;
            const ses = del(tables.sessions, 'last_activity_at');
            tables.sessions = ses.kept;
            const vis = del(tables.visitors, 'last_seen_at');
            tables.visitors = vis.kept;
            return Promise.resolve({
                data: [{
                    deleted_page_views: pv.deleted,
                    deleted_events: ev.deleted,
                    deleted_sessions: ses.deleted,
                    deleted_visitors: vis.deleted,
                    deleted_shared_reports: 0
                }],
                error: null
            });
        }

        return Promise.resolve({ data: null, error: null });
    }

    return { tables, from, rpc };
}

function makeAuthHeaders(db, userId, _plan = 'nano', extra = {}) {
    const token = generateToken(userId);
    const decoded = verifyToken(token);
    db.tables.user_sessions.push({
        id: `us-${decoded.jti}`,
        user_id: userId,
        token_id: decoded.jti,
        purpose: 'session',
        revoked_at: null,
        expires_at: new Date(Date.now() + 3600_000).toISOString()
    });
    return {
        Cookie: `token=${token}`,
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
        ...extra
    };
}

async function startTestServer(t, db) {
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

test('Cases 1-2: Nano user creates 1 project and is blocked from creating a 2nd project', async (t) => {
    const db = createMemoryDb();
    db.tables.projects = []; // start with 0 projects
    const baseUrl = await startTestServer(t, db);
    const headers = makeAuthHeaders(db, NANO_USER_ID, 'nano');

    const res1 = await fetch(`${baseUrl}/api/v1/projects`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: 'first-project', description: 'Main site' })
    });
    assert.equal(res1.status, 201);
    const p1 = await res1.json();
    assert.equal(p1.name, 'first-project');

    const res2 = await fetch(`${baseUrl}/api/v1/projects`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: 'second-project' })
    });
    assert.equal(res2.status, 403);
    const body2 = await res2.json();
    assert.equal(body2.code, 'LIMIT_EXCEEDED');
});

test('Cases 3-5: Nano registers up to 3 verified origins, blocks 4th, and verifies DNS TXT / file token', async (t) => {
    const db = createMemoryDb();
    const baseUrl = await startTestServer(t, db);
    const headers = makeAuthHeaders(db, NANO_USER_ID, 'nano');

    const origins = ['https://example.com', 'https://blog.example.com', 'https://store.example.com'];
    const created = [];
    for (const origin of origins) {
        const res = await fetch(`${baseUrl}/api/v1/projects/${PROJECT_ID}/origins`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ origin, verification_method: 'dns_txt' })
        });
        assert.equal(res.status, 201);
        const data = await res.json();
        const originObj = data.origin && typeof data.origin === 'object' ? data.origin : data;
        assert.equal(originObj.status, 'pending');
        created.push(originObj);
    }

    // Case 4: 4th origin rejected
    const res4 = await fetch(`${baseUrl}/api/v1/projects/${PROJECT_ID}/origins`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ origin: 'https://docs.example.com' })
    });
    assert.equal(res4.status, 403);

    // Case 5: DNS TXT verification fails with wrong token, succeeds with matching token
    const target = created[0];
    await assert.rejects(
        () => originService.verifyOrigin({
            projectId: PROJECT_ID,
            userId: NANO_USER_ID,
            originId: target.id,
            method: 'dns_txt',
            dnsResolver: async () => [['webpulse-verification=wrong-token']]
        }),
        { code: 'ORIGIN_VERIFICATION_FAILED' }
    );

    const okVerify = await originService.verifyOrigin({
        projectId: PROJECT_ID,
        userId: NANO_USER_ID,
        originId: target.id,
        method: 'dns_txt',
        dnsResolver: async () => [[`webpulse-verification=${target.verification_token}`]]
    });
    assert.equal(okVerify.status, 'verified');

    // File verification succeeds with matching token
    const second = created[1];
    const fileOk = await originService.verifyOrigin({
        projectId: PROJECT_ID,
        userId: NANO_USER_ID,
        originId: second.id,
        method: 'file',
        fetcher: async () => ({ ok: true, text: async () => `webpulse-verification=${second.verification_token}` })
    });
    assert.equal(fileOk.status, 'verified');
});

test('Cases 6-9: Ingestion enforces exact verified origin, rejects unverified/blocked/unverified-subdomain & logs security alert', async (t) => {
    const db = createMemoryDb();
    db.tables.project_origins = [
        { id: 'org-1', project_id: PROJECT_ID, origin: 'https://example.com', hostname: 'example.com', status: 'verified', verification_token: 't1' },
        { id: 'org-2', project_id: PROJECT_ID, origin: 'https://pending.example.com', hostname: 'pending.example.com', status: 'pending', verification_token: 't2' },
        { id: 'org-3', project_id: PROJECT_ID, origin: 'https://blocked.example.com', hostname: 'blocked.example.com', status: 'blocked', verification_token: 't3' }
    ];
    const baseUrl = await startTestServer(t, db);

    const postEvent = (origin, eventId) =>
        fetch(`${baseUrl}/api/v1/track/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': 'trk_nano_123456',
                Origin: origin
            },
            body: JSON.stringify({ event: 'page_view', url: `${origin}/home`, event_id: eventId })
        });

    // Case 6: verified exact origin accepted
    const okRes = await postEvent('https://example.com', 'evt-ok-1');
    assert.equal(okRes.status, 200);

    // Case 7: unverified origin rejected + security notification logged
    const unverifiedRes = await postEvent('https://pending.example.com', 'evt-pend-1');
    assert.equal(unverifiedRes.status, 403);
    assert.ok(db.tables.notifications.some((n) => n.type === 'security'));

    // Case 8: blocked origin rejected
    const blockedRes = await postEvent('https://blocked.example.com', 'evt-blk-1');
    assert.equal(blockedRes.status, 403);

    // Case 9: subdomain NOT auto-verified when only root domain is verified
    const subRes = await postEvent('https://blog.example.com', 'evt-sub-1');
    assert.equal(subRes.status, 403);
});

test('Cases 10-13: Atomic 10,000 quota, concurrent safety, event_id idempotency, and deduplicated 80/90/100% alerts', async (t) => {
    const db = createMemoryDb();
    db.tables.project_origins = [
        { id: 'org-1', project_id: PROJECT_ID, origin: 'https://example.com', hostname: 'example.com', status: 'verified', verification_token: 't1' }
    ];
    const currentMonth = new Date().toISOString().slice(0, 7);
    db.tables.usages[0] = { id: 'usg-1', project_id: PROJECT_ID, month: currentMonth, views: 7999, alerts_sent: {} };
    const baseUrl = await startTestServer(t, db);

    // Case 13: 80% notification
    await usageService.consumeEventQuota(NANO_USER_ID, PROJECT_ID, 'evt-8000');
    assert.equal(db.tables.notifications.filter((n) => n.title.includes('80%')).length, 1);

    // Case 12: retrying same event_id does NOT consume quota twice
    const retry = await usageService.consumeEventQuota(NANO_USER_ID, PROJECT_ID, 'evt-8000');
    assert.equal(retry.duplicate, true);
    assert.equal(db.tables.usages[0].views, 8000);

    // 90% notification (deduplicated)
    db.tables.usages[0].views = 8999;
    await usageService.consumeEventQuota(NANO_USER_ID, PROJECT_ID, 'evt-9000');
    await usageService.consumeEventQuota(NANO_USER_ID, PROJECT_ID, 'evt-9001');
    assert.equal(db.tables.notifications.filter((n) => n.title.includes('90%')).length, 1);

    // Case 11: Concurrent requests near 10,000 limit cannot exceed 10,000
    db.tables.usages[0].views = 9997;
    const concurrent = await Promise.all(
        [1, 2, 3, 4, 5].map((n) => usageService.consumeEventQuota(NANO_USER_ID, PROJECT_ID, `evt-conc-${n}`))
    );
    const allowedCount = concurrent.filter((r) => r.allowed).length;
    assert.equal(allowedCount, 3);
    assert.equal(db.tables.usages[0].views, 10000);

    // Case 10: 10,001st ingestion rejected while dashboard analytics read still succeeds
    const overRes = await fetch(`${baseUrl}/api/v1/track/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': 'trk_nano_123456', Origin: 'https://example.com' },
        body: JSON.stringify({ event: 'page_view', url: 'https://example.com/10001', event_id: 'evt-10001' })
    });
    assert.equal(overRes.status, 403);

    const dashRes = await fetch(`${baseUrl}/api/v1/projects/${PROJECT_ID}/analytics/overview`, {
        headers: makeAuthHeaders(db, NANO_USER_ID, 'nano')
    });
    assert.equal(dashRes.status, 200);
});

test('Cases 14-16: Basic analytics allowed for Nano; Globe Analyze blocked on Nano and allowed on Lite/Pro/Max', async (t) => {
    const db = createMemoryDb();
    const baseUrl = await startTestServer(t, db);
    const nanoHeaders = makeAuthHeaders(db, NANO_USER_ID, 'nano');
    const liteHeaders = makeAuthHeaders(db, LITE_USER_ID, 'lite');

    // Case 14: overview, pages, sources, countries, devices
    for (const ep of ['overview', 'pages', 'sources', 'countries', 'devices']) {
        const res = await fetch(`${baseUrl}/api/v1/projects/${PROJECT_ID}/analytics/${ep}`, { headers: nanoHeaders });
        assert.equal(res.status, 200, `${ep} should return 200 for Nano`);
    }

    // Case 15: Globe Analyze blocked for Nano
    const globeNano = await fetch(`${baseUrl}/api/v1/projects/${PROJECT_ID}/analytics/globe`, { headers: nanoHeaders });
    assert.equal(globeNano.status, 403);
    const globeNanoBody = await globeNano.json();
    assert.equal(globeNanoBody.code, 'FEATURE_LOCKED');

    // Case 16: Globe Analyze allowed for Lite+
    const globeLite = await fetch(`${baseUrl}/api/v1/analytics/globe`, { headers: liteHeaders });
    assert.equal(globeLite.status, 200);
});

test('Cases 17-20: Limited report sharing (1/month, 7d expiry, snapshot only, revoke)', async (t) => {
    const db = createMemoryDb();
    const baseUrl = await startTestServer(t, db);
    const nanoHeaders = makeAuthHeaders(db, NANO_USER_ID, 'nano');

    // Case 17: Create 1st shared report
    const create1 = await fetch(`${baseUrl}/api/v1/projects/${PROJECT_ID}/share-reports`, {
        method: 'POST',
        headers: nanoHeaders,
        body: JSON.stringify({ title: 'Monthly Snapshot' })
    });
    assert.equal(create1.status, 201);
    const createdBody = await create1.json();
    assert.ok(createdBody.share_token);
    assert.ok(createdBody.report.expires_at);

    // Public snapshot works and exposes no raw IPs
    const pubRes = await fetch(`${baseUrl}/api/v1/projects/share/${createdBody.share_token}`);
    assert.equal(pubRes.status, 200);
    const pubBody = await pubRes.json();
    assert.equal(pubBody.report?.readOnly, true);
    assert.equal(pubBody.report?.snapshot, true);
    assert.ok(pubBody.report?.expiresAt);
    assert.equal(JSON.stringify(pubBody).includes('1.2.3.4'), false);

    // Case 18: 2nd shared report in same calendar month blocked
    const create2 = await fetch(`${baseUrl}/api/v1/projects/${PROJECT_ID}/share-reports`, {
        method: 'POST',
        headers: nanoHeaders,
        body: JSON.stringify({ title: 'Second Snapshot' })
    });
    assert.equal(create2.status, 403);

    // Case 19: Expired report (>7 days) returns 410
    db.tables.shared_reports[0].expires_at = new Date(Date.now() - 1000).toISOString();
    const expiredRes = await fetch(`${baseUrl}/api/v1/projects/share/${createdBody.share_token}`);
    assert.equal(expiredRes.status, 410);

    // Case 20: Revoked report returns 404
    db.tables.shared_reports[0].expires_at = new Date(Date.now() + 86400000).toISOString();
    const revokeRes = await fetch(`${baseUrl}/api/v1/projects/${PROJECT_ID}/share-reports/${createdBody.report.id}`, {
        method: 'DELETE',
        headers: nanoHeaders
    });
    assert.equal(revokeRes.status, 200);
    const revokedPubRes = await fetch(`${baseUrl}/api/v1/projects/share/${createdBody.share_token}`);
    assert.equal(revokedPubRes.status, 404);
});

test('Case 21: UTC 7-day retention deletes expired raw analytics while preserving projects, origins, aggregates, and usages', async (t) => {
    const db = createMemoryDb();
    db.tables.project_origins = [
        { id: 'org-1', project_id: PROJECT_ID, origin: 'https://example.com', hostname: 'example.com', status: 'verified' }
    ];
    mock.method(supabase, 'from', db.from);
    mock.method(supabase, 'rpc', db.rpc);
    t.after(() => mock.restoreAll());

    const result = await RetentionService.cleanupExpiredData();
    assert.equal(result.deleted_page_views, 1);
    assert.equal(result.deleted_events, 1);
    assert.equal(result.deleted_sessions, 1);
    assert.equal(result.deleted_visitors, 1);
    assert.equal(db.tables.projects.length, 1);
    assert.equal(db.tables.project_origins.length, 1);
    assert.equal(db.tables.analytics_daily.length, 1);
    assert.equal(db.tables.usages.length, 1);
});

test('Case 22: Nano user blocked from inviting team members (team_members = 1)', async (t) => {
    const db = createMemoryDb();
    const baseUrl = await startTestServer(t, db);
    const nanoHeaders = makeAuthHeaders(db, NANO_USER_ID, 'nano');

    const res = await fetch(`${baseUrl}/api/v1/projects/${PROJECT_ID}/members`, {
        method: 'POST',
        headers: nanoHeaders,
        body: JSON.stringify({ email: 'teammate@example.com', role: 'viewer' })
    });
    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.code, 'TEAM_LIMIT_REACHED');
});

test('Case 23: Nano blocked from V2 Beta surface while Pro user is allowed', async (t) => {
    const db = createMemoryDb();
    const baseUrl = await startTestServer(t, db);

    const nanoV2 = await fetch(`${baseUrl}/api/v1/projects`, {
        headers: makeAuthHeaders(db, NANO_USER_ID, 'nano', { 'X-WebPulse-App': 'v2_beta' })
    });
    assert.equal(nanoV2.status, 403);
    const nanoBody = await nanoV2.json();
    assert.equal(nanoBody.code, 'SURFACE_ACCESS_DENIED');

    const proV2 = await fetch(`${baseUrl}/api/v1/projects`, {
        headers: makeAuthHeaders(db, PRO_USER_ID, 'pro', { 'X-WebPulse-App': 'v2_beta' })
    });
    assert.equal(proV2.status, 200);
});
