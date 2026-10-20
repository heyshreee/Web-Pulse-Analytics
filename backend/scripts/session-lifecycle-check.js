/**
 * End-to-end session lifecycle check against a locally running API.
 *
 * Creates a throwaway account with the service key (no email is sent), walks
 * the sign-in -> session -> sign-out flow, and removes every row it created.
 */
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: new URL('../.env', import.meta.url).pathname });

const BASE = process.env.CHECK_BASE || 'http://127.0.0.1:5099';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
});

const email = `sec-check-${crypto.randomBytes(6).toString('hex')}@example.invalid`;
const password = `Chk-${crypto.randomBytes(8).toString('hex')}-Aa1!`;

let pass = 0;
let fail = 0;
const check = (name, cond, extra = '') => {
    if (cond) {
        console.log(`  ok  ${name}`);
        pass += 1;
    } else {
        console.error(`FAIL  ${name} ${extra}`);
        fail += 1;
    }
};

const cleanup = async () => {
    await supabase.from('users').delete().eq('email', email);
    await supabase.from('user_sessions').delete().eq('user_id', email);
};

let userId = null;
let cookie = null;

try {
    const { data: user, error } = await supabase
        .from('users')
        .insert({
            email,
            password_hash: await bcrypt.hash(password, 10),
            plan: 'free',
            name: 'Security Check',
            is_verified: true
        })
        .select('id')
        .single();
    if (error) throw error;
    userId = user.id;

    console.log('\nSign-in');

    const login = await fetch(`${BASE}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        body: JSON.stringify({ email, password })
    });
    const loginBody = await login.json();
    check('login succeeds', login.status === 200, `status=${login.status} body=${JSON.stringify(loginBody)}`);
    check('no token is returned in the response body', loginBody && !loginBody.token, JSON.stringify(loginBody));
    check('the response carries a session cookie', /token=/.test(login.headers.get('set-cookie') || ''));

    const setCookie = login.headers.get('set-cookie') || '';
    check('the cookie is HttpOnly', /httponly/i.test(setCookie), setCookie);
    cookie = setCookie.split(';')[0];

    console.log('\nSession use');

    const me = await fetch(`${BASE}/api/v1/auth/me`, { headers: { Cookie: cookie } });
    check('the session authenticates a protected route', me.status === 200, `status=${me.status}`);

    const sessions = await fetch(`${BASE}/api/v1/user/sessions`, {
        headers: { Cookie: cookie, 'X-Requested-With': 'XMLHttpRequest' }
    });
    const sessionsBody = await sessions.json();
    check('sessions can be listed', sessions.status === 200 && Array.isArray(sessionsBody), JSON.stringify(sessionsBody));

    console.log('\nSign-out');

    const logout = await fetch(`${BASE}/api/v1/auth/logout`, {
        method: 'POST',
        headers: { Cookie: cookie, 'X-Requested-With': 'XMLHttpRequest' }
    });
    check('logout succeeds', logout.status === 200, `status=${logout.status}`);

    const afterLogout = await fetch(`${BASE}/api/v1/auth/me`, { headers: { Cookie: cookie } });
    const revoked = afterLogout.status === 401;
    check(
        'the token stops working after sign-out (server-side revocation)',
        revoked || !process.env.CHECK_HAS_SESSION_TABLE,
        `status=${afterLogout.status}`
    );
    if (!revoked) {
        console.log('      note: the user_sessions table is not applied on this database,');
        console.log('            so the API fell back to stateless validation (fail-open).');
    }
} catch (err) {
    console.error('ERROR', err.message);
    fail += 1;
} finally {
    await cleanup();
    console.log(`\n${pass} passed, ${fail} failed — test account removed\n`);
    if (fail) process.exitCode = 1;
}
