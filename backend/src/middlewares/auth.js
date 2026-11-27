import { verifyToken, TOKEN_PURPOSE } from '../utils/jwt.js';
import { isSessionActive, touchSession } from '../services/session.service.js';
import supabase from '../config/supabase.js';

export async function resolveSession(req) {
    try {
        const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return { authenticated: false, status: 401, error: 'Authentication required' };
        }

        const decoded = verifyToken(token);

        // Only session tokens authenticate requests. A password-reset token
        // is never accepted here.
        if (decoded.purpose && decoded.purpose !== TOKEN_PURPOSE.SESSION) {
            return { authenticated: false, status: 401, error: 'Invalid token' };
        }

        const tokenId = decoded.jti || null;

        // Server-side revocation check. `null` means the session store could
        // not answer (missing migration, transient failure) — the request is
        // allowed through so an infrastructure fault never locks users out.
        const active = await isSessionActive(tokenId);
        if (active === false) {
            return { authenticated: false, status: 401, error: 'Session has been revoked' };
        }

        const { data: user, error } = await supabase
            .from('users')
            .select('id, email, name, plan, avatar_url, bio, timezone, language, job_title, notification_preferences')
            .eq('id', decoded.id)
            .single();

        // PGRST116 = zero rows for `.single()`. Any other error means the
        // lookup itself failed (network blip, rate limit, upstream 5xx) —
        // signal a transient failure so clients don't hard-logout on it.
        if (error && error.code !== 'PGRST116') {
            return { authenticated: false, status: 503, error: 'Authentication service temporarily unavailable' };
        }

        if (!user) {
            return { authenticated: false, status: 401, error: 'User not found' };
        }

        // Best-effort update of last_seen_at
        if (tokenId) {
            touchSession(tokenId).catch(() => {});
        }

        return { authenticated: true, tokenId, user };
    } catch {
        return { authenticated: false, status: 401, error: 'Invalid token' };
    }
}

export default async (req, res, next) => {
    const result = await resolveSession(req);
    if (!result.authenticated) {
        return res.status(result.status).json({ error: result.error });
    }

    req.tokenId = result.tokenId;
    req.user = result.user;
    next();
};
