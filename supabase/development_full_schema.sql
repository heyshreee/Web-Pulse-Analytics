-- ============================================================================
-- WebPulse Analytics — Consolidated Development & Production-Safe Schema
-- ============================================================================
-- This consolidated script provides the complete database definition for WebPulse.
-- It is designed to be 100% IDEMPOTENT and NON-DESTRUCTIVE:
--   * Safe to run on a brand-new local/development Supabase instance.
--   * Safe to run on an existing staging or production database without data loss.
--   * Uses IF NOT EXISTS, ADD COLUMN IF NOT EXISTS, CREATE OR REPLACE FUNCTION,
--     and DROP POLICY IF EXISTS ... CREATE POLICY.
--   * NEVER executes DROP TABLE, DROP DATABASE, or TRUNCATE.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. Extensions
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. Helper Functions & Triggers
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = pg_catalog.now();
    RETURN NEW;
END;
$$;

-- ----------------------------------------------------------------------------
-- 2. Base Identity & Access Tables
-- ----------------------------------------------------------------------------

-- 2.1 Users table (Express backend authentication)
CREATE TABLE IF NOT EXISTS public.users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text UNIQUE NOT NULL,
    password_hash text,
    name text,
    role text NOT NULL DEFAULT 'user',
    is_verified boolean NOT NULL DEFAULT false,
    plan text NOT NULL DEFAULT 'free',
    plan_id text,
    otp_code text,
    otp_expires_at timestamptz,
    reset_token text,
    reset_token_expires_at timestamptz,
    google_id text,
    avatar_url text,
    razorpay_customer_id text,
    razorpay_subscription_id text,
    telegram_chat_id text,
    telegram_bot_token text,
    telegram_notifications_enabled boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trigger_users_updated_at ON public.users;
CREATE TRIGGER trigger_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 2.2 Profiles table (1:1 with auth.users if Supabase Auth is enabled)
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text,
    email text,
    avatar_url text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 2.3 Subscription Plans table
CREATE TABLE IF NOT EXISTS public.plans (
    id text PRIMARY KEY,
    name text NOT NULL,
    price numeric NOT NULL DEFAULT 0,
    price_usd numeric NOT NULL DEFAULT 0,
    price_inr numeric NOT NULL DEFAULT 0,
    interval text NOT NULL DEFAULT 'month',
    visitor_limit bigint NOT NULL DEFAULT 1000,
    project_limit integer NOT NULL DEFAULT 1,
    allowed_origins_limit integer NOT NULL DEFAULT 1,
    features jsonb NOT NULL DEFAULT '[]'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Seed default plans if table is empty
INSERT INTO public.plans (id, name, price, price_usd, price_inr, interval, visitor_limit, project_limit, allowed_origins_limit, features)
VALUES 
('free', 'Free', 0, 0, 0, 'month', 1000, 1, 1, '["1 Project", "1 Allowed Origin", "1,000 events/mo", "60 sec refresh"]'::jsonb),
('basic', 'Basic', 299, 4, 299, 'month', 50000, 5, 3, '["5 Projects", "3 Allowed Origins", "Live Device Stats", "50,000 events/mo", "10 sec refresh"]'::jsonb),
('pro', 'Pro', 999, 12, 999, 'month', 500000, 20, 10, '["20 Projects", "10 Allowed Origins", "Telegram Alerts", "500,000 events/mo", "Real-time refresh"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 2.4 Server-Side Revocable User Sessions
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

-- ----------------------------------------------------------------------------
-- 3. Projects & Project Settings Tables
-- ----------------------------------------------------------------------------

-- 3.1 Projects table
CREATE TABLE IF NOT EXISTS public.projects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    user_id uuid,
    tracking_id text UNIQUE NOT NULL,
    target_url text,
    allowed_origins text,
    is_active boolean NOT NULL DEFAULT true,
    share_token text,
    is_public_shared boolean NOT NULL DEFAULT false,
    owner_id uuid,
    slug text,
    domain text,
    environment text NOT NULL DEFAULT 'production',
    description text,
    tracking_enabled boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add additive columns if projects already existed in earlier state
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS owner_id uuid,
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS domain text,
  ADD COLUMN IF NOT EXISTS environment text NOT NULL DEFAULT 'production',
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS tracking_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS allowed_origins text,
  ADD COLUMN IF NOT EXISTS share_token text,
  ADD COLUMN IF NOT EXISTS is_public_shared boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Backfill project columns if needed
UPDATE public.projects
SET 
  owner_id = COALESCE(owner_id, user_id),
  domain = COALESCE(domain, target_url, 'localhost'),
  slug = COALESCE(slug, lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g')), id::text)
WHERE slug IS NULL OR owner_id IS NULL;

DROP TRIGGER IF EXISTS trigger_projects_updated_at ON public.projects;
CREATE TRIGGER trigger_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 3.2 Project Members table
CREATE TABLE IF NOT EXISTS public.project_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id uuid NOT NULL,
    role text NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(project_id, user_id)
);

-- 3.3 Project Settings table
CREATE TABLE IF NOT EXISTS public.project_settings (
    project_id uuid PRIMARY KEY REFERENCES public.projects(id) ON DELETE CASCADE,
    tracking_enabled boolean NOT NULL DEFAULT true,
    anonymize_ip boolean NOT NULL DEFAULT true,
    respect_dnt boolean NOT NULL DEFAULT true,
    session_timeout_minutes integer NOT NULL DEFAULT 30,
    retention_days integer NOT NULL DEFAULT 365,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trigger_project_settings_updated_at ON public.project_settings;
CREATE TRIGGER trigger_project_settings_updated_at
BEFORE UPDATE ON public.project_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Seed project settings for any projects lacking settings
INSERT INTO public.project_settings (project_id, tracking_enabled, anonymize_ip, respect_dnt, session_timeout_minutes, retention_days)
SELECT id, COALESCE(is_active, true), true, true, 30, 365
FROM public.projects
ON CONFLICT (project_id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 4. Analytics Core: Visitors, Sessions, Pageviews & Events
-- ----------------------------------------------------------------------------

-- 4.1 Visitors table
CREATE TABLE IF NOT EXISTS public.visitors (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
    session_id text,
    ip_address text,
    user_agent text,
    page_url text,
    referrer text,
    device_type text,
    browser text,
    browser_version text,
    os text,
    operating_system text,
    operating_system_version text,
    country text,
    country_code text,
    country_name text,
    city text,
    region text,
    language text,
    visitor_hash text,
    is_active boolean NOT NULL DEFAULT true,
    first_seen_at timestamptz NOT NULL DEFAULT now(),
    last_seen_at timestamptz NOT NULL DEFAULT now(),
    last_seen timestamptz DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Ensure additive columns exist
ALTER TABLE public.visitors
  ADD COLUMN IF NOT EXISTS visitor_hash text,
  ADD COLUMN IF NOT EXISTS country_code text,
  ADD COLUMN IF NOT EXISTS country_name text,
  ADD COLUMN IF NOT EXISTS region text,
  ADD COLUMN IF NOT EXISTS browser_version text,
  ADD COLUMN IF NOT EXISTS operating_system text,
  ADD COLUMN IF NOT EXISTS operating_system_version text,
  ADD COLUMN IF NOT EXISTS language text,
  ADD COLUMN IF NOT EXISTS first_seen_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS last_seen_at timestamptz NOT NULL DEFAULT now();

UPDATE public.visitors
SET
  country_name = COALESCE(country_name, country),
  operating_system = COALESCE(operating_system, os),
  last_seen_at = COALESCE(last_seen_at, last_seen, created_at),
  first_seen_at = COALESCE(first_seen_at, created_at),
  visitor_hash = COALESCE(visitor_hash, md5(COALESCE(ip_address, '') || COALESCE(user_agent, '') || COALESCE(project_id::text, '')))
WHERE visitor_hash IS NULL;

-- 4.2 Sessions table
CREATE TABLE IF NOT EXISTS public.sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    visitor_id uuid REFERENCES public.visitors(id) ON DELETE CASCADE,
    session_id text NOT NULL,
    started_at timestamptz NOT NULL DEFAULT now(),
    ended_at timestamptz,
    last_activity_at timestamptz NOT NULL DEFAULT now(),
    duration_seconds integer DEFAULT 0,
    page_views integer NOT NULL DEFAULT 1,
    event_count integer NOT NULL DEFAULT 0,
    entry_page text,
    exit_page text,
    referrer text,
    utm_source text,
    utm_medium text,
    utm_campaign text,
    device_type text,
    browser text,
    operating_system text,
    country_code text,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(project_id, session_id)
);

-- 4.3 Page Views table
CREATE TABLE IF NOT EXISTS public.page_views (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    visitor_id uuid REFERENCES public.visitors(id) ON DELETE SET NULL,
    session_id uuid REFERENCES public.sessions(id) ON DELETE SET NULL,
    page_url text,
    path text,
    url text,
    title text,
    referrer text,
    viewed_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.page_views
  ADD COLUMN IF NOT EXISTS session_id uuid REFERENCES public.sessions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS path text,
  ADD COLUMN IF NOT EXISTS url text,
  ADD COLUMN IF NOT EXISTS referrer text,
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS viewed_at timestamptz NOT NULL DEFAULT now();

-- 4.4 Custom Events table
CREATE TABLE IF NOT EXISTS public.events (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    visitor_id uuid REFERENCES public.visitors(id) ON DELETE SET NULL,
    session_id uuid REFERENCES public.sessions(id) ON DELETE SET NULL,
    event_name text NOT NULL,
    event_category text,
    page_path text,
    properties jsonb DEFAULT '{}'::jsonb,
    occurred_at timestamptz NOT NULL DEFAULT now()
);

-- 4.5 Daily Aggregates table
CREATE TABLE IF NOT EXISTS public.analytics_daily (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    date date NOT NULL,
    visitors bigint NOT NULL DEFAULT 0,
    sessions bigint NOT NULL DEFAULT 0,
    page_views bigint NOT NULL DEFAULT 0,
    events bigint NOT NULL DEFAULT 0,
    UNIQUE(project_id, date)
);

-- ----------------------------------------------------------------------------
-- 5. Operational Tables: API Keys, Alerts, Counters, Usages, Payments, Logs
-- ----------------------------------------------------------------------------

-- 5.1 API Keys
CREATE TABLE IF NOT EXISTS public.api_keys (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    name text NOT NULL,
    key_prefix text NOT NULL,
    key_hash text NOT NULL,
    last_used_at timestamptz,
    expires_at timestamptz,
    revoked_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 5.2 Alerts & Alert Events
CREATE TABLE IF NOT EXISTS public.alerts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    name text NOT NULL,
    metric text NOT NULL,
    condition text NOT NULL,
    threshold numeric,
    enabled boolean NOT NULL DEFAULT true,
    last_triggered_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trigger_alerts_updated_at ON public.alerts;
CREATE TRIGGER trigger_alerts_updated_at
BEFORE UPDATE ON public.alerts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE IF NOT EXISTS public.alert_events (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    alert_id uuid NOT NULL REFERENCES public.alerts(id) ON DELETE CASCADE,
    triggered_at timestamptz NOT NULL DEFAULT now(),
    metric_value numeric,
    message text
);

-- 5.3 Counters
CREATE TABLE IF NOT EXISTS public.counters (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    key text NOT NULL DEFAULT 'visits',
    count bigint NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(project_id, key)
);

-- 5.4 Usages
CREATE TABLE IF NOT EXISTS public.usages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
    event_type text NOT NULL,
    count bigint NOT NULL DEFAULT 0,
    period text NOT NULL,
    period_start timestamptz,
    period_end timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 5.5 Payments
CREATE TABLE IF NOT EXISTS public.payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
    amount numeric NOT NULL,
    currency text NOT NULL DEFAULT 'USD',
    status text NOT NULL DEFAULT 'paid',
    method text NOT NULL DEFAULT 'razorpay',
    plan_id text,
    provider_payment_id text,
    provider_order_id text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 5.6 Activity & Audit Logs
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
    project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
    action text NOT NULL,
    entity_type text,
    entity_id text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_logs
  ADD COLUMN IF NOT EXISTS entity_type text,
  ADD COLUMN IF NOT EXISTS entity_id text,
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
    action text NOT NULL,
    details jsonb DEFAULT '{}'::jsonb,
    ip_address text,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 5.7 Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type text NOT NULL DEFAULT 'info',
    read boolean NOT NULL DEFAULT false,
    action_url text,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 6. Performance Indexes & Foreign Key Coverage
-- ----------------------------------------------------------------------------

-- Foreign key covering indexes
CREATE INDEX IF NOT EXISTS activity_logs_user_id_idx ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS counters_project_id_idx ON public.counters(project_id);
CREATE INDEX IF NOT EXISTS events_session_id_idx ON public.events(session_id);
CREATE INDEX IF NOT EXISTS events_visitor_id_idx ON public.events(visitor_id);
CREATE INDEX IF NOT EXISTS page_views_visitor_id_idx ON public.page_views(visitor_id);
CREATE INDEX IF NOT EXISTS usages_project_id_idx ON public.usages(project_id);

-- User sessions
CREATE INDEX IF NOT EXISTS idx_user_sessions_token_id ON public.user_sessions(token_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id, purpose);

-- Page views
CREATE INDEX IF NOT EXISTS page_views_project_time_idx ON public.page_views(project_id, viewed_at DESC);
CREATE INDEX IF NOT EXISTS page_views_project_path_idx ON public.page_views(project_id, path);
CREATE INDEX IF NOT EXISTS page_views_session_idx ON public.page_views(session_id);

-- Events
CREATE INDEX IF NOT EXISTS events_project_time_idx ON public.events(project_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS events_project_name_idx ON public.events(project_id, event_name);
CREATE INDEX IF NOT EXISTS events_properties_idx ON public.events USING gin(properties);

-- Sessions
CREATE INDEX IF NOT EXISTS sessions_project_last_activity_idx ON public.sessions(project_id, last_activity_at DESC);
CREATE INDEX IF NOT EXISTS sessions_project_started_idx ON public.sessions(project_id, started_at DESC);
CREATE INDEX IF NOT EXISTS sessions_visitor_idx ON public.sessions(visitor_id);

-- Visitors
CREATE INDEX IF NOT EXISTS visitors_project_last_seen_idx ON public.visitors(project_id, last_seen_at DESC);
CREATE INDEX IF NOT EXISTS visitors_project_hash_idx ON public.visitors(project_id, visitor_hash);

-- API keys & alerts
CREATE INDEX IF NOT EXISTS api_keys_project_idx ON public.api_keys(project_id);
CREATE INDEX IF NOT EXISTS alerts_project_idx ON public.alerts(project_id);
CREATE INDEX IF NOT EXISTS alert_events_alert_time_idx ON public.alert_events(alert_id, triggered_at DESC);

-- ----------------------------------------------------------------------------
-- 7. Analytics RPC Functions (SECURITY INVOKER, SET search_path = '')
-- ----------------------------------------------------------------------------

-- Helper: has_project_access
CREATE OR REPLACE FUNCTION public.has_project_access(p_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = p_id
      AND (
        p.owner_id = (SELECT auth.uid()) 
        OR p.user_id = (SELECT auth.uid())
        OR EXISTS (
          SELECT 1 FROM public.project_members pm
          WHERE pm.project_id = p.id AND pm.user_id = (SELECT auth.uid())
        )
      )
  );
$$;

-- Counter increment function
CREATE OR REPLACE FUNCTION public.increment_project_counter(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.counters
  SET count = count + 1, updated_at = pg_catalog.now()
  WHERE project_id = p_id;
END;
$$;

-- 7.1 Dashboard Summary
CREATE OR REPLACE FUNCTION public.get_dashboard_summary(
    p_project_id uuid,
    p_start timestamptz,
    p_end timestamptz
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    v_views bigint := 0;
    v_visitors bigint := 0;
    v_sessions bigint := 0;
    v_events bigint := 0;
    v_bounce_rate numeric := 0;
    v_avg_duration numeric := 0;
    v_result jsonb;
BEGIN
    SELECT COALESCE(COUNT(*), 0)
    INTO v_views
    FROM public.page_views
    WHERE (p_project_id IS NULL OR project_id = p_project_id)
      AND viewed_at >= p_start AND viewed_at <= p_end;

    SELECT 
        COALESCE(COUNT(*), 0),
        COALESCE(COUNT(DISTINCT visitor_id), 0),
        COALESCE(ROUND((COUNT(*) FILTER (WHERE page_views <= 1)::numeric / NULLIF(COUNT(*), 0)) * 100, 1), 0),
        COALESCE(ROUND(AVG(duration_seconds)::numeric, 0), 0)
    INTO v_sessions, v_visitors, v_bounce_rate, v_avg_duration
    FROM public.sessions
    WHERE (p_project_id IS NULL OR project_id = p_project_id)
      AND started_at >= p_start AND started_at <= p_end;

    IF v_visitors = 0 THEN
        SELECT COALESCE(COUNT(DISTINCT id), 0)
        INTO v_visitors
        FROM public.visitors
        WHERE (p_project_id IS NULL OR project_id = p_project_id)
          AND created_at >= p_start AND created_at <= p_end;
    END IF;

    SELECT COALESCE(COUNT(*), 0)
    INTO v_events
    FROM public.events
    WHERE (p_project_id IS NULL OR project_id = p_project_id)
      AND occurred_at >= p_start AND occurred_at <= p_end;

    v_result := jsonb_build_object(
        'page_views', v_views,
        'visitors', v_visitors,
        'sessions', v_sessions,
        'events', v_events,
        'bounce_rate', v_bounce_rate,
        'average_session_seconds', v_avg_duration
    );

    RETURN v_result;
END;
$$;

-- 7.2 Dashboard Comparison
CREATE OR REPLACE FUNCTION public.get_dashboard_comparison(
    p_project_id uuid,
    p_start timestamptz,
    p_end timestamptz
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    v_duration interval;
    v_prev_start timestamptz;
    v_prev_end timestamptz;
    v_cur jsonb;
    v_prev jsonb;
    v_change jsonb;
    v_cur_views numeric; v_prev_views numeric;
    v_cur_vis numeric; v_prev_vis numeric;
    v_cur_sess numeric; v_prev_sess numeric;
    v_cur_evt numeric; v_prev_evt numeric;
    v_cur_bounce numeric; v_prev_bounce numeric;
    v_cur_avg numeric; v_prev_avg numeric;
BEGIN
    v_duration := p_end - p_start;
    v_prev_end := p_start;
    v_prev_start := p_start - v_duration;

    v_cur := public.get_dashboard_summary(p_project_id, p_start, p_end);
    v_prev := public.get_dashboard_summary(p_project_id, v_prev_start, v_prev_end);

    v_cur_views := (v_cur->>'page_views')::numeric;
    v_prev_views := (v_prev->>'page_views')::numeric;
    v_cur_vis := (v_cur->>'visitors')::numeric;
    v_prev_vis := (v_prev->>'visitors')::numeric;
    v_cur_sess := (v_cur->>'sessions')::numeric;
    v_prev_sess := (v_prev->>'sessions')::numeric;
    v_cur_evt := (v_cur->>'events')::numeric;
    v_prev_evt := (v_prev->>'events')::numeric;
    v_cur_bounce := (v_cur->>'bounce_rate')::numeric;
    v_prev_bounce := (v_prev->>'bounce_rate')::numeric;
    v_cur_avg := (v_cur->>'average_session_seconds')::numeric;
    v_prev_avg := (v_prev->>'average_session_seconds')::numeric;

    v_change := jsonb_build_object(
        'page_views', CASE WHEN v_prev_views > 0 THEN ROUND(((v_cur_views - v_prev_views) / v_prev_views) * 100, 1) ELSE 0 END,
        'visitors', CASE WHEN v_prev_vis > 0 THEN ROUND(((v_cur_vis - v_prev_vis) / v_prev_vis) * 100, 1) ELSE 0 END,
        'sessions', CASE WHEN v_prev_sess > 0 THEN ROUND(((v_cur_sess - v_prev_sess) / v_prev_sess) * 100, 1) ELSE 0 END,
        'events', CASE WHEN v_prev_evt > 0 THEN ROUND(((v_cur_evt - v_prev_evt) / v_prev_evt) * 100, 1) ELSE 0 END,
        'bounce_rate', ROUND(v_cur_bounce - v_prev_bounce, 1),
        'average_session_seconds', CASE WHEN v_prev_avg > 0 THEN ROUND(((v_cur_avg - v_prev_avg) / v_prev_avg) * 100, 1) ELSE 0 END
    );

    RETURN jsonb_build_object(
        'current', v_cur,
        'previous', v_prev,
        'change', v_change
    );
END;
$$;

-- 7.3 Visitors Timeseries
CREATE OR REPLACE FUNCTION public.get_visitors_timeseries(
    p_project_id uuid,
    p_start timestamptz,
    p_end timestamptz,
    p_interval text DEFAULT 'day'
)
RETURNS TABLE(
    bucket timestamptz,
    visitors bigint,
    sessions bigint,
    page_views bigint
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    WITH date_series AS (
        SELECT pg_catalog.generate_series(
            pg_catalog.date_trunc(p_interval, p_start),
            pg_catalog.date_trunc(p_interval, p_end),
            ('1 ' || p_interval)::interval
        ) AS point
    ),
    sess_agg AS (
        SELECT 
            pg_catalog.date_trunc(p_interval, started_at) AS sess_point,
            COUNT(DISTINCT visitor_id) AS distinct_visitors,
            COUNT(*) AS total_sessions
        FROM public.sessions
        WHERE (p_project_id IS NULL OR project_id = p_project_id)
          AND started_at >= p_start AND started_at <= p_end
        GROUP BY 1
    ),
    pv_agg AS (
        SELECT 
            pg_catalog.date_trunc(p_interval, viewed_at) AS pv_point,
            COUNT(*) AS total_views
        FROM public.page_views
        WHERE (p_project_id IS NULL OR project_id = p_project_id)
          AND viewed_at >= p_start AND viewed_at <= p_end
        GROUP BY 1
    )
    SELECT 
        ds.point AS bucket,
        COALESCE(sa.distinct_visitors, 0)::bigint AS visitors,
        COALESCE(sa.total_sessions, 0)::bigint AS sessions,
        COALESCE(pa.total_views, 0)::bigint AS page_views
    FROM date_series ds
    LEFT JOIN sess_agg sa ON ds.point = sa.sess_point
    LEFT JOIN pv_agg pa ON ds.point = pa.pv_point
    ORDER BY ds.point ASC;
END;
$$;

-- 7.4 Live Visitors
CREATE OR REPLACE FUNCTION public.get_live_visitors(p_project_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    v_active_visitors bigint := 0;
    v_recent_pages jsonb;
    v_recent_feed jsonb;
BEGIN
    SELECT COALESCE(COUNT(DISTINCT visitor_id), 0)
    INTO v_active_visitors
    FROM public.sessions
    WHERE (p_project_id IS NULL OR project_id = p_project_id)
      AND last_activity_at >= pg_catalog.now() - interval '5 minutes';

    IF v_active_visitors = 0 THEN
        SELECT COALESCE(COUNT(DISTINCT id), 0)
        INTO v_active_visitors
        FROM public.visitors
        WHERE (p_project_id IS NULL OR project_id = p_project_id)
          AND last_seen_at >= pg_catalog.now() - interval '5 minutes';
    END IF;

    SELECT COALESCE(jsonb_agg(sub), '[]'::jsonb)
    INTO v_recent_pages
    FROM (
        SELECT path, COUNT(*) as count
        FROM public.page_views
        WHERE (p_project_id IS NULL OR project_id = p_project_id)
          AND viewed_at >= pg_catalog.now() - interval '30 minutes'
        GROUP BY path
        ORDER BY count DESC
        LIMIT 5
    ) sub;

    SELECT COALESCE(jsonb_agg(feed), '[]'::jsonb)
    INTO v_recent_feed
    FROM (
        SELECT 
            pv.id,
            pv.path,
            pv.viewed_at,
            s.country_code,
            s.browser,
            s.device_type
        FROM public.page_views pv
        LEFT JOIN public.sessions s ON pv.session_id = s.id
        WHERE (p_project_id IS NULL OR pv.project_id = p_project_id)
        ORDER BY pv.viewed_at DESC
        LIMIT 10
    ) feed;

    RETURN jsonb_build_object(
        'active_visitors', v_active_visitors,
        'top_active_pages', v_recent_pages,
        'recent_events', v_recent_feed
    );
END;
$$;

-- 7.5 Traffic Sources
CREATE OR REPLACE FUNCTION public.get_traffic_sources(
    p_project_id uuid,
    p_start timestamptz,
    p_end timestamptz
)
RETURNS TABLE(
    source text,
    sessions bigint,
    visitors bigint,
    percentage numeric
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    v_total bigint;
BEGIN
    SELECT COUNT(*) INTO v_total
    FROM public.sessions
    WHERE (p_project_id IS NULL OR project_id = p_project_id)
      AND started_at >= p_start AND started_at <= p_end;

    RETURN QUERY
    SELECT 
        COALESCE(NULLIF(utm_source, ''), NULLIF(referrer, ''), 'Direct') AS source,
        COUNT(*)::bigint AS sessions,
        COUNT(DISTINCT visitor_id)::bigint AS visitors,
        CASE WHEN v_total > 0 THEN ROUND((COUNT(*)::numeric / v_total) * 100, 1) ELSE 0 END AS percentage
    FROM public.sessions
    WHERE (p_project_id IS NULL OR project_id = p_project_id)
      AND started_at >= p_start AND started_at <= p_end
    GROUP BY 1
    ORDER BY sessions DESC
    LIMIT 10;
END;
$$;

-- 7.6 Top Pages
CREATE OR REPLACE FUNCTION public.get_top_pages(
    p_project_id uuid,
    p_start timestamptz,
    p_end timestamptz,
    p_limit integer DEFAULT 10
)
RETURNS TABLE(
    path text,
    views bigint,
    unique_visitors bigint
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(pv.path, '/') AS path,
        COUNT(*)::bigint AS views,
        COUNT(DISTINCT pv.visitor_id)::bigint AS unique_visitors
    FROM public.page_views pv
    WHERE (p_project_id IS NULL OR pv.project_id = p_project_id)
      AND pv.viewed_at >= p_start AND pv.viewed_at <= p_end
    GROUP BY 1
    ORDER BY views DESC
    LIMIT p_limit;
END;
$$;

-- 7.7 Geography
CREATE OR REPLACE FUNCTION public.get_geography(
    p_project_id uuid,
    p_start timestamptz,
    p_end timestamptz
)
RETURNS TABLE(
    country_code text,
    sessions bigint,
    percentage numeric
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    v_total bigint;
BEGIN
    SELECT COUNT(*) INTO v_total
    FROM public.sessions
    WHERE (p_project_id IS NULL OR project_id = p_project_id)
      AND started_at >= p_start AND started_at <= p_end;

    RETURN QUERY
    SELECT 
        COALESCE(s.country_code, 'Unknown') AS country_code,
        COUNT(*)::bigint AS sessions,
        CASE WHEN v_total > 0 THEN ROUND((COUNT(*)::numeric / v_total) * 100, 1) ELSE 0 END AS percentage
    FROM public.sessions s
    WHERE (p_project_id IS NULL OR s.project_id = p_project_id)
      AND s.started_at >= p_start AND s.started_at <= p_end
    GROUP BY 1
    ORDER BY sessions DESC
    LIMIT 15;
END;
$$;

-- 7.8 Devices
CREATE OR REPLACE FUNCTION public.get_devices(
    p_project_id uuid,
    p_start timestamptz,
    p_end timestamptz
)
RETURNS TABLE(
    device_type text,
    sessions bigint,
    percentage numeric
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    v_total bigint;
BEGIN
    SELECT COUNT(*) INTO v_total
    FROM public.sessions
    WHERE (p_project_id IS NULL OR project_id = p_project_id)
      AND started_at >= p_start AND started_at <= p_end;

    RETURN QUERY
    SELECT 
        COALESCE(s.device_type, 'Desktop') AS device_type,
        COUNT(*)::bigint AS sessions,
        CASE WHEN v_total > 0 THEN ROUND((COUNT(*)::numeric / v_total) * 100, 1) ELSE 0 END AS percentage
    FROM public.sessions s
    WHERE (p_project_id IS NULL OR s.project_id = p_project_id)
      AND s.started_at >= p_start AND s.started_at <= p_end
    GROUP BY 1
    ORDER BY sessions DESC;
END;
$$;

-- 7.9 Browsers
CREATE OR REPLACE FUNCTION public.get_browsers(
    p_project_id uuid,
    p_start timestamptz,
    p_end timestamptz
)
RETURNS TABLE(
    browser text,
    sessions bigint,
    percentage numeric
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    v_total bigint;
BEGIN
    SELECT COUNT(*) INTO v_total
    FROM public.sessions
    WHERE (p_project_id IS NULL OR project_id = p_project_id)
      AND started_at >= p_start AND started_at <= p_end;

    RETURN QUERY
    SELECT 
        COALESCE(s.browser, 'Other') AS browser,
        COUNT(*)::bigint AS sessions,
        CASE WHEN v_total > 0 THEN ROUND((COUNT(*)::numeric / v_total) * 100, 1) ELSE 0 END AS percentage
    FROM public.sessions s
    WHERE (p_project_id IS NULL OR s.project_id = p_project_id)
      AND s.started_at >= p_start AND s.started_at <= p_end
    GROUP BY 1
    ORDER BY sessions DESC
    LIMIT 10;
END;
$$;

-- 7.10 Operating Systems
CREATE OR REPLACE FUNCTION public.get_operating_systems(
    p_project_id uuid,
    p_start timestamptz,
    p_end timestamptz
)
RETURNS TABLE(
    operating_system text,
    sessions bigint,
    percentage numeric
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    v_total bigint;
BEGIN
    SELECT COUNT(*) INTO v_total
    FROM public.sessions
    WHERE (p_project_id IS NULL OR project_id = p_project_id)
      AND started_at >= p_start AND started_at <= p_end;

    RETURN QUERY
    SELECT 
        COALESCE(s.operating_system, 'Other') AS operating_system,
        COUNT(*)::bigint AS sessions,
        CASE WHEN v_total > 0 THEN ROUND((COUNT(*)::numeric / v_total) * 100, 1) ELSE 0 END AS percentage
    FROM public.sessions s
    WHERE (p_project_id IS NULL OR s.project_id = p_project_id)
      AND s.started_at >= p_start AND s.started_at <= p_end
    GROUP BY 1
    ORDER BY sessions DESC
    LIMIT 10;
END;
$$;

-- 7.11 Custom Events Summary
CREATE OR REPLACE FUNCTION public.get_event_summary(
    p_project_id uuid,
    p_start timestamptz,
    p_end timestamptz
)
RETURNS TABLE(
    event_name text,
    count bigint,
    unique_sessions bigint
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.event_name,
        COUNT(*)::bigint AS count,
        COUNT(DISTINCT e.session_id)::bigint AS unique_sessions
    FROM public.events e
    WHERE (p_project_id IS NULL OR e.project_id = p_project_id)
      AND e.occurred_at >= p_start AND e.occurred_at <= p_end
    GROUP BY 1
    ORDER BY count DESC
    LIMIT 20;
END;
$$;

-- ----------------------------------------------------------------------------
-- 8. Row Level Security & Access Policies
-- ----------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.project_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.analytics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.alert_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.usages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications ENABLE ROW LEVEL SECURITY;

-- 8.1 Users policies
DROP POLICY IF EXISTS "Users can view own account" ON public.users;
CREATE POLICY "Users can view own account"
  ON public.users FOR SELECT
  TO authenticated
  USING (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own account" ON public.users;
CREATE POLICY "Users can update own account"
  ON public.users FOR UPDATE
  TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

-- 8.2 User Sessions policies
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

-- 8.3 Profiles policies
DROP POLICY IF EXISTS "Users can view their profile" ON public.profiles;
CREATE POLICY "Users can view their profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update their profile" ON public.profiles;
CREATE POLICY "Users can update their profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

-- 8.4 Plans policies (read-only for all users)
DROP POLICY IF EXISTS "Plans are viewable by all" ON public.plans;
CREATE POLICY "Plans are viewable by all"
  ON public.plans FOR SELECT
  TO authenticated, anon
  USING (true);

-- 8.5 Projects policies
DROP POLICY IF EXISTS "Users can view accessible projects" ON public.projects;
CREATE POLICY "Users can view accessible projects"
  ON public.projects FOR SELECT
  TO authenticated
  USING (
    owner_id = (SELECT auth.uid())
    OR user_id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = public.projects.id
        AND pm.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can create projects" ON public.projects;
CREATE POLICY "Users can create projects"
  ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK (
    owner_id = (SELECT auth.uid())
    OR user_id = (SELECT auth.uid())
  );

DROP POLICY IF EXISTS "Owners can update projects" ON public.projects;
CREATE POLICY "Owners can update projects"
  ON public.projects FOR UPDATE
  TO authenticated
  USING (
    owner_id = (SELECT auth.uid())
    OR user_id = (SELECT auth.uid())
  )
  WITH CHECK (
    owner_id = (SELECT auth.uid())
    OR user_id = (SELECT auth.uid())
  );

DROP POLICY IF EXISTS "Owners can delete projects" ON public.projects;
CREATE POLICY "Owners can delete projects"
  ON public.projects FOR DELETE
  TO authenticated
  USING (
    owner_id = (SELECT auth.uid())
    OR user_id = (SELECT auth.uid())
  );

-- 8.6 Project Members policies
DROP POLICY IF EXISTS "Members can view project membership" ON public.project_members;
CREATE POLICY "Members can view project membership"
  ON public.project_members FOR SELECT
  TO authenticated
  USING (public.has_project_access(project_id));

DROP POLICY IF EXISTS "Project owners can insert members" ON public.project_members;
CREATE POLICY "Project owners can insert members"
  ON public.project_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id
        AND (p.owner_id = (SELECT auth.uid()) OR p.user_id = (SELECT auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Project owners can update members" ON public.project_members;
CREATE POLICY "Project owners can update members"
  ON public.project_members FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id
        AND (p.owner_id = (SELECT auth.uid()) OR p.user_id = (SELECT auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Project owners can delete members" ON public.project_members;
CREATE POLICY "Project owners can delete members"
  ON public.project_members FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id
        AND (p.owner_id = (SELECT auth.uid()) OR p.user_id = (SELECT auth.uid()))
    )
  );

-- 8.7 Project Settings policies
DROP POLICY IF EXISTS "Members can view project settings" ON public.project_settings;
CREATE POLICY "Members can view project settings"
  ON public.project_settings FOR SELECT
  TO authenticated
  USING (public.has_project_access(project_id));

DROP POLICY IF EXISTS "Owners can update project settings" ON public.project_settings;
CREATE POLICY "Owners can update project settings"
  ON public.project_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id
        AND (p.owner_id = (SELECT auth.uid()) OR p.user_id = (SELECT auth.uid()))
    )
  );

-- 8.8 Analytics policies: Visitors, Sessions, Page Views, Events
DROP POLICY IF EXISTS "Members can view project visitors" ON public.visitors;
CREATE POLICY "Members can view project visitors"
  ON public.visitors FOR SELECT
  TO authenticated
  USING (public.has_project_access(project_id));

DROP POLICY IF EXISTS "Members can view project sessions" ON public.sessions;
CREATE POLICY "Members can view project sessions"
  ON public.sessions FOR SELECT
  TO authenticated
  USING (public.has_project_access(project_id));

DROP POLICY IF EXISTS "Members can view project page views" ON public.page_views;
CREATE POLICY "Members can view project page views"
  ON public.page_views FOR SELECT
  TO authenticated
  USING (public.has_project_access(project_id));

DROP POLICY IF EXISTS "Members can view project events" ON public.events;
CREATE POLICY "Members can view project events"
  ON public.events FOR SELECT
  TO authenticated
  USING (public.has_project_access(project_id));

DROP POLICY IF EXISTS "Members can view daily analytics" ON public.analytics_daily;
CREATE POLICY "Members can view daily analytics"
  ON public.analytics_daily FOR SELECT
  TO authenticated
  USING (public.has_project_access(project_id));

-- 8.9 API Keys policies
DROP POLICY IF EXISTS "Members can view project api keys" ON public.api_keys;
CREATE POLICY "Members can view project api keys"
  ON public.api_keys FOR SELECT
  TO authenticated
  USING (public.has_project_access(project_id));

DROP POLICY IF EXISTS "Owners can manage api keys" ON public.api_keys;
CREATE POLICY "Owners can manage api keys"
  ON public.api_keys FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id
        AND (p.owner_id = (SELECT auth.uid()) OR p.user_id = (SELECT auth.uid()))
    )
  );

-- 8.10 Alerts policies
DROP POLICY IF EXISTS "Members can view project alerts" ON public.alerts;
CREATE POLICY "Members can view project alerts"
  ON public.alerts FOR SELECT
  TO authenticated
  USING (public.has_project_access(project_id));

DROP POLICY IF EXISTS "Owners can manage alerts" ON public.alerts;
CREATE POLICY "Owners can manage alerts"
  ON public.alerts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id
        AND (p.owner_id = (SELECT auth.uid()) OR p.user_id = (SELECT auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Members can view alert events" ON public.alert_events;
CREATE POLICY "Members can view alert events"
  ON public.alert_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.alerts a
      WHERE a.id = alert_id AND public.has_project_access(a.project_id)
    )
  );

-- 8.11 Notifications policies
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- ============================================================================
-- End of Consolidated Schema Definition
-- ============================================================================
