import { verifyToken, TOKEN_PURPOSE } from '../utils/jwt.js';
import { isSessionActive } from '../services/session.service.js';
import supabase from '../config/supabase.js';

export default async (req, res, next) => {
    try {
        const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const decoded = verifyToken(token);

        // Only session tokens authenticate requests. A password-reset token
        // (or a legacy token minted before the `purpose` claim existed) is
        // never accepted here.
        if (decoded.purpose !== TOKEN_PURPOSE.SESSION) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        req.tokenId = decoded.jti || null;

        // Server-side revocation check. `null` means the session store could
        // not answer (missing migration, transient failure) — the request is
        // allowed through so an infrastructure fault never locks users out.
        const active = await isSessionActive(req.tokenId);
        if (active === false) {
            return res.status(401).json({ error: 'Session has been revoked' });
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
            return res.status(503).json({ error: 'Authentication service temporarily unavailable' });
        }

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};
