-- ============================================================================
-- WebPulse Analytics — Max Plan Entitlements, Alpha Flags, Webhooks,
-- Scheduled Reports, Custom Dashboards & Audit Log Hardening
-- Migration: 20261130000001_max_plan_entitlements.sql
-- Idempotent & non-destructive. Matched to live Supabase schema.
-- ============================================================================

-- 1. Update Max row in public.plans to match canonical Max limits & entitlements
UPDATE public.plans
SET
  monthly_events = 2000000,
  max_projects = 25,
  allowed_origins = 50,
  retention_days = 365,
  refresh_rate = 5,
  team_members_limit = 25,
  share_report = 500,
  share_reports_limit = 500,
  share_link_expiry_days = 365,
  api_requests_per_minute = 300,
  ingestion_events_per_second = 250,
  ingestion_burst = 500,
  limits = jsonb_build_object(
    'monthly_events', 2000000,
    'projects', 25,
    'origins_per_project', 50,
    'team_members', 25,
    'retention_days', 365,
    'dashboard_refresh_seconds', 5,
    'api_requests_per_minute', 300,
    'ingestion_events_per_second', 250,
    'ingestion_burst', 500,
    'shared_reports_per_month', 500,
    'share_link_expiry_days', 365
  ),
  access = jsonb_build_object(
    'marketing', true,
    'v1', true,
    'v2_beta', true,
    'alpha', true
  ),
  updated_at = now()
WHERE id = 'max';

-- 2. Allow 'analyst' role in project_members & project_invitations
ALTER TABLE public.project_members
  DROP CONSTRAINT IF EXISTS project_members_role_check;
ALTER TABLE public.project_members
  ADD CONSTRAINT project_members_role_check
  CHECK (role IN ('owner', 'admin', 'editor', 'analyst', 'viewer'));

ALTER TABLE public.project_invitations
  DROP CONSTRAINT IF EXISTS project_invitations_role_check;
ALTER TABLE public.project_invitations
  ADD CONSTRAINT project_invitations_role_check
  CHECK (role IN ('admin', 'analyst', 'viewer'));

-- 3. Alpha access & per-feature experimental flags
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS alpha_revoked boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS alpha_flags jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE TABLE IF NOT EXISTS public.alpha_feature_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  feature_key text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_alpha_feature_usage_user_time
  ON public.alpha_feature_usage(user_id, created_at DESC);

ALTER TABLE public.alpha_feature_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own alpha usage" ON public.alpha_feature_usage;
CREATE POLICY "Users can view own alpha usage"
  ON public.alpha_feature_usage FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- 4. Webhooks & delivery logs (HMAC-SHA256, SSRF-protected, retryable)
CREATE TABLE IF NOT EXISTS public.webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  url text NOT NULL,
  events text[] NOT NULL DEFAULT ARRAY['event.tracked', 'security.alert'],
  secret_hash text NOT NULL,
  secret_prefix text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  last_triggered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_webhooks_project_active
  ON public.webhooks(project_id, is_active);

CREATE TABLE IF NOT EXISTS public.webhook_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id uuid NOT NULL REFERENCES public.webhooks(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  attempt_count integer NOT NULL DEFAULT 1,
  http_status integer,
  error_message text,
  next_retry_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook_time
  ON public.webhook_deliveries(webhook_id, created_at DESC);

ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Project members can view webhooks" ON public.webhooks;
CREATE POLICY "Project members can view webhooks"
  ON public.webhooks FOR SELECT
  TO authenticated
  USING (public.has_project_access(project_id));

DROP POLICY IF EXISTS "Owners can manage webhooks" ON public.webhooks;
CREATE POLICY "Owners can manage webhooks"
  ON public.webhooks FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id
        AND (p.owner_id = (SELECT auth.uid()) OR p.user_id = (SELECT auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Project members can view webhook deliveries" ON public.webhook_deliveries;
CREATE POLICY "Project members can view webhook deliveries"
  ON public.webhook_deliveries FOR SELECT
  TO authenticated
  USING (public.has_project_access(project_id));

-- 5. Scheduled reports & custom dashboard templates (Pro/Max)
CREATE TABLE IF NOT EXISTS public.scheduled_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  recipient_email text NOT NULL,
  cadence text NOT NULL DEFAULT 'weekly' CHECK (cadence IN ('daily', 'weekly', 'monthly')),
  format text NOT NULL DEFAULT 'pdf' CHECK (format IN ('csv', 'pdf')),
  is_active boolean NOT NULL DEFAULT true,
  last_sent_at timestamptz,
  last_status text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.custom_dashboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  layout jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_org_wide boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.scheduled_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_dashboards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own scheduled reports" ON public.scheduled_reports;
CREATE POLICY "Users manage own scheduled reports"
  ON public.scheduled_reports FOR ALL
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users manage own custom dashboards" ON public.custom_dashboards;
CREATE POLICY "Users manage own custom dashboards"
  ON public.custom_dashboards FOR ALL
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- 6. Audit logs immutability & indexing (append-only for ordinary users)
ALTER TABLE public.audit_logs
  ADD COLUMN IF NOT EXISTS target text;

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action_time
  ON public.audit_logs(user_id, action, created_at DESC);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own audit logs" ON public.audit_logs;
CREATE POLICY "Users can view own audit logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

REVOKE UPDATE, DELETE ON public.audit_logs FROM authenticated, anon;
