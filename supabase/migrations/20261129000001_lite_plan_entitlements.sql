-- ============================================================================
-- WebPulse Analytics — Lite Plan Entitlements, Invitations, Archiving & Filter Indexes
-- Migration: 20261129000001_lite_plan_entitlements.sql
-- Idempotent & non-destructive: matched to live Supabase schema.
-- ============================================================================

-- 1. Update Lite row in public.plans to match canonical Lite limits & entitlements
UPDATE public.plans
SET
  limits = jsonb_build_object(
    'monthly_events', 100000,
    'projects', 3,
    'origins_per_project', 10,
    'team_members', 3,
    'retention_days', 30,
    'dashboard_refresh_seconds', 30,
    'api_requests_per_minute', 60,
    'ingestion_events_per_second', 30,
    'ingestion_burst', 60,
    'shared_reports_per_month', 10,
    'share_link_expiry_days', 30
  ),
  entitlements = jsonb_build_object(
    'basic_analytics', true,
    'visitor_analytics', true,
    'traffic_sources', true,
    'country_statistics', true,
    'device_analytics', true,
    'custom_events', true,
    'basic_rest_api', true,
    'domain_verification', true,
    'origin_protection', true,
    'security_notifications', true,
    'limited_report_sharing', true,
    'globe_analyze', true,
    'advanced_geo_analytics', true,
    'advanced_filters', true,
    'csv_export', true,
    'pdf_export', true,
    'team_collaboration', true,
    'real_time_analytics', false,
    'live_visitor_logs', false,
    'scheduled_reports', false,
    'custom_dashboards', false,
    'webhooks', false,
    'v2_beta', false,
    'alpha_access', false
  ),
  access = jsonb_build_object(
    'marketing', true,
    'v1', true,
    'v2_beta', false,
    'alpha', false
  ),
  allowed_origins = 10,
  team_members_limit = 3,
  refresh_rate = 30,
  share_report = 10,
  share_reports_limit = 10,
  share_link_expiry_days = 30,
  api_requests_per_minute = 60,
  ingestion_events_per_second = 30,
  ingestion_burst = 60,
  updated_at = now()
WHERE id = 'lite';

-- 2. Project archiving support (non-destructive)
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS archived_at timestamptz;

CREATE INDEX IF NOT EXISTS projects_user_archived_idx
  ON public.projects(user_id, archived_at);

-- 3. Project invitations table for Lite/Pro/Max team collaboration
CREATE TABLE IF NOT EXISTS public.project_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  invited_by uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  invited_email text NOT NULL,
  role text NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'viewer')),
  token_hash text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'revoked', 'expired')),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  responded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS project_invitations_project_status_idx
  ON public.project_invitations(project_id, status);
CREATE INDEX IF NOT EXISTS project_invitations_email_status_idx
  ON public.project_invitations(lower(invited_email), status);

ALTER TABLE public.project_invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Project owners and admins can view invitations" ON public.project_invitations;
CREATE POLICY "Project owners and admins can view invitations"
  ON public.project_invitations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id
        AND (p.owner_id = (SELECT auth.uid()) OR p.user_id = (SELECT auth.uid()))
    )
    OR lower(invited_email) = lower(coalesce((SELECT auth.jwt() ->> 'email'), ''))
  );

DROP POLICY IF EXISTS "Project owners can manage invitations" ON public.project_invitations;
CREATE POLICY "Project owners can manage invitations"
  ON public.project_invitations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id
        AND (p.owner_id = (SELECT auth.uid()) OR p.user_id = (SELECT auth.uid()))
    )
  );

-- 4. Advanced analytics filter indexes (matched to live columns on visitors, sessions, page_views)
CREATE INDEX IF NOT EXISTS visitors_project_country_device_idx
  ON public.visitors(project_id, country, device_type, last_seen DESC);
CREATE INDEX IF NOT EXISTS visitors_project_browser_os_idx
  ON public.visitors(project_id, browser, os);
CREATE INDEX IF NOT EXISTS sessions_project_utm_idx
  ON public.sessions(project_id, utm_source, utm_medium, utm_campaign);
CREATE INDEX IF NOT EXISTS page_views_project_path_time_idx
  ON public.page_views(project_id, path, created_at DESC);
