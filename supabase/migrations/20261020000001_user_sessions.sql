-- ============================================================================
-- Migration: user_sessions
-- ---------------------------------------------------------------------------
-- Server-side record of every issued session and password-reset token.
--
-- Sessions are keyed on the JWT `jti` (token_id). That is what makes a token
-- revocable: signing out, revoking a device, or changing a password marks the
-- row revoked, and the auth middleware refuses the token from then on.
--
-- The API talks to the database with the service role key, which bypasses RLS,
-- so the policies below are a second layer for any direct client access.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    token_id text NOT NULL UNIQUE,
    purpose text NOT NULL DEFAULT 'session',
    user_agent text,
    ip text,
    created_at timestamptz NOT NULL DEFAULT now(),
    last_seen_at timestamptz NOT NULL DEFAULT now(),
    expires_at timestamptz NOT NULL,
    revoked_at timestamptz
);

-- Lookups by token (auth middleware) and by account (session list).
CREATE INDEX IF NOT EXISTS idx_user_sessions_token_id ON public.user_sessions (token_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions (user_id, purpose);

-- Row Level Security -------------------------------------------------
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own sessions" ON public.user_sessions;
CREATE POLICY "Users can view their own sessions"
  ON public.user_sessions FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can revoke their own sessions" ON public.user_sessions;
CREATE POLICY "Users can revoke their own sessions"
  ON public.user_sessions FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));
