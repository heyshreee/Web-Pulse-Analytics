import supabase from '../config/supabase.js';
import { randomUUID } from 'crypto';

/**
 * Session store
 * -------------
 * Server-side record of every issued session and password-reset token.
 * Sessions are keyed on the JWT `jti`, which is what allows a token to be
 * revoked server-side (sign-out, "revoke this device", password reset).
 *
 * The table lives in `public.user_sessions` and is created by the migration
 * in `supabase/migrations/`. Migrations are applied by a human, so the store
 * may be missing on a deployment that has not run it yet. Every helper
 * therefore degrades gracefully: when the table is absent the API falls back
 * to stateless JWT validation instead of locking every user out.
 */

const TABLE = 'user_sessions';

export const SESSION_PURPOSE = {
    SESSION: 'session',
    PASSWORD_RESET: 'password_reset'
};

const REPROBE_INTERVAL_MS = 5 * 60 * 1000;

let storeState = null; // null = unknown, true = available, false = missing
let lastProbeAt = 0;

const isMissingTable = (error) =>
    error?.code === '42P01' || /does not exist|not found/i.test(error?.message || '');

/**
 * True when the session table is present. Re-probes every few minutes so a
 * deployment that applies the migration later recovers without a restart.
 */
const isStoreAvailable = async () => {
    if (storeState === true) return true;
    if (storeState === false && Date.now() - lastProbeAt < REPROBE_INTERVAL_MS) {
        return false;
    }

    lastProbeAt = Date.now();
    const { error } = await supabase.from(TABLE).select('id').limit(1);
    if (!error) {
        storeState = true;
        return true;
    }
    if (isMissingTable(error)) {
        if (storeState !== false) {
            console.warn(
                '[sessions] `user_sessions` table not found — server-side session revocation is disabled until the migration is applied.'
            );
        }
        storeState = false;
        return false;
    }
    // Any other error (network, permissions) is treated as "unavailable" for
    // this request; availability wins over revocation for infrastructure faults.
    console.error('[sessions] session store probe failed:', error.message);
    storeState = false;
    return false;
};

/**
 * Creates a session (or password-reset) row.
 * Returns the stored row, or null when the store is unavailable.
 */
export const createSession = async ({
    userId,
    tokenId,
    purpose = SESSION_PURPOSE.SESSION,
    userAgent = null,
    ip = null,
    expiresAt
}) => {
    if (!(await isStoreAvailable())) return null;

    const { data, error } = await supabase
        .from(TABLE)
        .insert({
            id: randomUUID(),
            user_id: userId,
            token_id: tokenId,
            purpose,
            user_agent: userAgent,
            ip,
            expires_at: expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single();

    if (error) {
        console.error('[sessions] failed to store session:', error.message);
        return null;
    }
    return data;
};

/** Returns the stored row for a token id, or null. */
export const getSession = async (tokenId) => {
    if (!tokenId) return null;
    if (!(await isStoreAvailable())) return null;

    const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .eq('token_id', tokenId)
        .maybeSingle();

    if (error) {
        console.error('[sessions] failed to read session:', error.message);
        return null;
    }
    return data;
};

/**
 * Whether a token id may still be used.
 * `true` / `false` when the store answers, `null` when it cannot — callers
 * treat `null` as "allow" so an unavailable store never breaks sign-in.
 */
export const isSessionActive = async (tokenId) => {
    if (!tokenId) return null;
    if (!(await isStoreAvailable())) return null;

    const { data, error } = await supabase
        .from(TABLE)
        .select('id, user_id, expires_at, revoked_at')
        .eq('token_id', tokenId)
        .maybeSingle();

    if (error) {
        console.error('[sessions] failed to check session:', error.message);
        return null;
    }
    if (!data) return false;
    if (data.revoked_at) return false;
    if (data.expires_at && new Date(data.expires_at) <= new Date()) return false;
    return true;
};

/** Records that a session was just used. Best-effort. */
export const touchSession = async (tokenId) => {
    if (!tokenId) return;
    if (!(await isStoreAvailable())) return;

    await supabase
        .from(TABLE)
        .update({ last_seen_at: new Date().toISOString() })
        .eq('token_id', tokenId);
};

/** All live sessions for an account, newest activity first. */
export const listSessions = async (userId) => {
    if (!(await isStoreAvailable())) return [];

    const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .eq('user_id', userId)
        .eq('purpose', SESSION_PURPOSE.SESSION)
        .is('revoked_at', null)
        .order('last_seen_at', { ascending: false });

    if (error) {
        console.error('[sessions] failed to list sessions:', error.message);
        return [];
    }

    const now = Date.now();
    return (data || []).filter((row) => !row.expires_at || new Date(row.expires_at).getTime() > now);
};

/** Revokes one session of an account. Ownership is enforced by `user_id`. */
export const revokeSession = async (userId, sessionId) => {
    if (!(await isStoreAvailable())) return false;

    const { data, error } = await supabase
        .from(TABLE)
        .update({ revoked_at: new Date().toISOString() })
        .eq('id', sessionId)
        .eq('user_id', userId)
        .select('id')
        .maybeSingle();

    if (error) {
        console.error('[sessions] failed to revoke session:', error.message);
        return false;
    }
    return Boolean(data);
};

/** Revokes the session behind a specific token id. */
export const revokeSessionByTokenId = async (userId, tokenId) => {
    if (!tokenId) return false;
    if (!(await isStoreAvailable())) return false;

    const { error } = await supabase
        .from(TABLE)
        .update({ revoked_at: new Date().toISOString() })
        .eq('token_id', tokenId)
        .eq('user_id', userId);

    if (error) {
        console.error('[sessions] failed to revoke session by token:', error.message);
        return false;
    }
    return true;
};

/**
 * Revokes every live session of an account — used after a password reset so
 * a stolen token cannot outlive the credential it was issued against.
 * `exceptTokenId` keeps the caller's own session alive.
 */
export const revokeAllSessions = async (userId, { exceptTokenId = null } = {}) => {
    if (!(await isStoreAvailable())) return 0;

    let query = supabase
        .from(TABLE)
        .update({ revoked_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('purpose', SESSION_PURPOSE.SESSION)
        .is('revoked_at', null);

    if (exceptTokenId) {
        query = query.neq('token_id', exceptTokenId);
    }

    const { data, error } = await query.select('token_id');

    if (error) {
        console.error('[sessions] failed to revoke sessions:', error.message);
        return 0;
    }

    return (data || []).length;
};

export default {
    SESSION_PURPOSE,
    createSession,
    getSession,
    isSessionActive,
    touchSession,
    listSessions,
    revokeSession,
    revokeSessionByTokenId,
    revokeAllSessions
};
