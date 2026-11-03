-- ============================================================================
-- Migration 002: Sessions, Events, Page Views, Alerts, API Keys, and Daily Aggregates
-- ============================================================================

-- 1. Sessions table
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

-- Backfill sessions from existing visitors
INSERT INTO public.sessions (
    project_id, visitor_id, session_id, started_at, last_activity_at,
    entry_page, exit_page, referrer, device_type, browser, operating_system,
    country_code, page_views, created_at
)
SELECT 
    v.project_id, v.id, v.session_id, v.created_at, COALESCE(v.last_seen, v.created_at),
    v.page_url, v.page_url, v.referrer, v.device_type, v.browser, v.os,
    v.country, 1, v.created_at
FROM public.visitors v
WHERE v.project_id IS NOT NULL
ON CONFLICT (project_id, session_id) DO NOTHING;

-- 2. Additive columns for public.page_views
ALTER TABLE public.page_views
  ADD COLUMN IF NOT EXISTS session_id uuid REFERENCES public.sessions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS path text,
  ADD COLUMN IF NOT EXISTS url text,
  ADD COLUMN IF NOT EXISTS referrer text,
  ADD COLUMN IF NOT EXISTS viewed_at timestamptz NOT NULL DEFAULT now();

-- Backfill page_views columns
UPDATE public.page_views pv
SET
  url = COALESCE(pv.url, pv.page_url),
  path = COALESCE(pv.path, substring(pv.page_url from '^https?://[^/]+(/.*)$'), pv.page_url, '/'),
  viewed_at = COALESCE(pv.viewed_at, pv.created_at),
  session_id = COALESCE(pv.session_id, s.id)
FROM public.sessions s
WHERE pv.visitor_id = s.visitor_id AND (pv.path IS NULL OR pv.session_id IS NULL);

-- 3. Custom Events table
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

-- 4. API Keys table
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

-- 5. Alerts & Alert Events tables
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

-- 6. Additive columns for activity_logs
ALTER TABLE public.activity_logs
  ADD COLUMN IF NOT EXISTS entity_type text,
  ADD COLUMN IF NOT EXISTS entity_id text,
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- 7. Analytics Daily Aggregates table
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
