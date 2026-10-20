/**
 * Focused checks for the security fixes that do not need a database.
 * Run with: npm run check:security
 */
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-value-for-checks';
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'test-service-key';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

import assert from 'node:assert';
import jwt from 'jsonwebtoken';

import {
    generateToken,
    generateResetToken,
    verifyToken,
    TOKEN_PURPOSE
} from '../src/utils/jwt.js';
import csrf from '../src/middleware/csrf.js';

let passed = 0;
const check = (name, fn) => {
    try {
        fn();
        passed += 1;
        console.log(`  ok  ${name}`);
    } catch (err) {
        console.error(`FAIL  ${name}\n      ${err.message}`);
        process.exitCode = 1;
    }
};

console.log('\nToken model');

check('session token carries purpose=session and a jti', () => {
    const token = generateToken('user-1');
    const decoded = verifyToken(token);
    assert.strictEqual(decoded.purpose, TOKEN_PURPOSE.SESSION);
    assert.ok(decoded.jti, 'jti missing');
    assert.strictEqual(decoded.id, 'user-1');
});

check('password reset token carries purpose=password_reset', () => {
    const token = generateResetToken('user-1');
    const decoded = verifyToken(token);
    assert.strictEqual(decoded.purpose, TOKEN_PURPOSE.PASSWORD_RESET);
    assert.ok(decoded.jti);
});

check('reset token is not accepted as a session token', () => {
    const decoded = verifyToken(generateResetToken('user-1'));
    assert.notStrictEqual(decoded.purpose, TOKEN_PURPOSE.SESSION);
});

check('session token is not accepted as a reset token', () => {
    const decoded = verifyToken(generateToken('user-1'));
    assert.notStrictEqual(decoded.purpose, TOKEN_PURPOSE.PASSWORD_RESET);
});

check('reset token expires quickly (15 minutes)', () => {
    const decoded = jwt.decode(generateResetToken('user-1'));
    const lifetimeSeconds = decoded.exp - decoded.iat;
    assert.ok(lifetimeSeconds <= 15 * 60 + 5, `lifetime was ${lifetimeSeconds}s`);
    assert.ok(lifetimeSeconds > 0);
});

check('session token lives 7 days', () => {
    const decoded = jwt.decode(generateToken('user-1'));
    const lifetimeSeconds = decoded.exp - decoded.iat;
    assert.strictEqual(lifetimeSeconds, 7 * 24 * 60 * 60);
});

check('every token gets a unique jti', () => {
    const a = jwt.decode(generateToken('user-1'));
    const b = jwt.decode(generateToken('user-1'));
    assert.notStrictEqual(a.jti, b.jti);
});

check('a token signed with another secret is rejected', () => {
    const foreign = jwt.sign({ id: 'user-1', purpose: 'session' }, 'other-secret', { jwtid: 'x' });
    assert.throws(() => verifyToken(foreign));
});

console.log('\nCSRF middleware');

const mockRes = () => {
    const res = { statusCode: 200, body: null };
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (payload) => {
        res.body = payload;
        return res;
    };
    return res;
};

check('GET is allowed without the header', () => {
    const res = mockRes();
    let called = false;
    csrf({ method: 'GET', headers: {} }, res, () => { called = true; });
    assert.ok(called);
});

check('POST without the header is rejected', () => {
    const res = mockRes();
    let called = false;
    csrf({ method: 'POST', headers: {} }, res, () => { called = true; });
    assert.ok(!called);
    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.body.error, 'CSRF_PROTECTION');
});

check('POST with the header is allowed', () => {
    const res = mockRes();
    let called = false;
    csrf({ method: 'POST', headers: { 'x-requested-with': 'XMLHttpRequest' } }, res, () => { called = true; });
    assert.ok(called);
});

check('POST with an explicit Authorization header is allowed', () => {
    const res = mockRes();
    let called = false;
    csrf({ method: 'POST', headers: { authorization: 'Bearer abc' } }, res, () => { called = true; });
    assert.ok(called);
});

console.log(`\n${passed} checks passed\n`);
