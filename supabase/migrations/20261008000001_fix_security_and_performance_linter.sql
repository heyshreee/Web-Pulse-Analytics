-- ============================================================================
-- Migration: Fix Supabase Database Linter Security and Performance Issues
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Ensure RLS is enabled on all public tables
-- ----------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.analytics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.project_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.alert_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.usages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.plans ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 2. Drop duplicate index and create covering indexes for unindexed foreign keys
-- ----------------------------------------------------------------------------
-- Drop redundant duplicate index on activity_logs(project_id)
DROP INDEX IF EXISTS public.idx_activity_logs_project_id;

-- Foreign key covering indexes
CREATE INDEX IF NOT EXISTS activity_logs_user_id_idx ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS counters_project_id_idx ON public.counters(project_id);
CREATE INDEX IF NOT EXISTS events_session_id_idx ON public.events(session_id);
CREATE INDEX IF NOT EXISTS events_visitor_id_idx ON public.events(visitor_id);
CREATE INDEX IF NOT EXISTS page_views_visitor_id_idx ON public.page_views(visitor_id);
CREATE INDEX IF NOT EXISTS usages_project_id_idx ON public.usages(project_id);

-- ----------------------------------------------------------------------------
-- 3. Fix Functions: Set immutable search_path and Security Invoker
-- ----------------------------------------------------------------------------

-- Helper function: update_updated_at
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

-- Helper function: has_project_access (STABLE, SECURITY INVOKER, optimized InitPlan)
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

-- Analytics RPC functions: SET search_path = '' & SECURITY INVOKER
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

CREATE OR REPLACE FUNCTION public.get_visitors_timeseries(
    p_project_id uuid,
    p_start timestamptz,
    p_end timestamptz,
    p_interval text DEFAULT 'hour'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    v_points jsonb;
BEGIN
    SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb)
    INTO v_points
    FROM (
        SELECT 
            date_trunc(p_interval, viewed_at) AS timestamp,
            COUNT(DISTINCT visitor_id) AS visitors,
            COUNT(DISTINCT session_id) AS sessions,
            COUNT(*) AS page_views
        FROM public.page_views
        WHERE (p_project_id IS NULL OR project_id = p_project_id)
          AND viewed_at >= p_start AND viewed_at <= p_end
        GROUP BY 1
        ORDER BY 1 ASC
    ) t;

    RETURN v_points;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_live_visitors(
    p_project_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    v_cutoff timestamptz;
    v_count integer := 0;
    v_pages jsonb;
    v_recent jsonb;
BEGIN
    v_cutoff := pg_catalog.now() - interval '5 minutes';

    SELECT COUNT(DISTINCT id)
    INTO v_count
    FROM public.visitors
    WHERE (p_project_id IS NULL OR project_id = p_project_id)
      AND is_active = true
      AND (last_seen_at >= v_cutoff OR last_seen >= v_cutoff);

    SELECT COALESCE(jsonb_agg(row_to_json(p)), '[]'::jsonb)
    INTO v_pages
    FROM (
        SELECT 
            COALESCE(page_url, '/') AS path,
            COUNT(*) AS visitors
        FROM public.visitors
        WHERE (p_project_id IS NULL OR project_id = p_project_id)
          AND is_active = true
          AND (last_seen_at >= v_cutoff OR last_seen >= v_cutoff)
        GROUP BY 1
        ORDER BY 2 DESC
        LIMIT 10
    ) p;

    SELECT COALESCE(jsonb_agg(row_to_json(r)), '[]'::jsonb)
    INTO v_recent
    FROM (
        SELECT 
            id,
            COALESCE(country_name, country, 'Unknown') AS country,
            COALESCE(city, 'Unknown') AS city,
            COALESCE(device_type, 'desktop') AS device_type,
            COALESCE(browser, 'Unknown') AS browser,
            COALESCE(operating_system, os, 'Unknown') AS operating_system,
            page_url,
            COALESCE(last_seen_at, last_seen) AS timestamp
        FROM public.visitors
        WHERE (p_project_id IS NULL OR project_id = p_project_id)
        ORDER BY COALESCE(last_seen_at, last_seen) DESC
        LIMIT 20
    ) r;

    RETURN jsonb_build_object(
        'active_visitors', v_count,
        'pages', v_pages,
        'recent_visitors', v_recent
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_traffic_sources(
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
    v_sources jsonb;
BEGIN
    WITH raw_sources AS (
        SELECT
            CASE
                WHEN referrer IS NULL OR referrer = '' OR referrer ILIKE '%direct%' THEN 'Direct'
                WHEN referrer ILIKE '%google%' THEN 'Google'
                WHEN referrer ILIKE '%bing%' THEN 'Bing'
                WHEN referrer ILIKE '%duckduckgo%' THEN 'DuckDuckGo'
                WHEN referrer ILIKE '%twitter%' OR referrer ILIKE '%t.co%' OR referrer ILIKE '%x.com%' THEN 'Twitter / X'
                WHEN referrer ILIKE '%linkedin%' THEN 'LinkedIn'
                WHEN referrer ILIKE '%facebook%' OR referrer ILIKE '%instagram%' THEN 'Social'
                WHEN referrer ILIKE '%github%' THEN 'GitHub'
                WHEN referrer ILIKE '%youtube%' THEN 'YouTube'
                ELSE 'Referral'
            END AS source_name,
            COUNT(*) AS hit_count
        FROM public.sessions
        WHERE (p_project_id IS NULL OR project_id = p_project_id)
          AND started_at >= p_start AND started_at <= p_end
        GROUP BY 1
    ),
    sum_total AS (
        SELECT COALESCE(SUM(hit_count), 0) AS total_hits FROM raw_sources
    )
    SELECT COALESCE(jsonb_agg(row_to_json(s)), '[]'::jsonb)
    INTO v_sources
    FROM (
        SELECT 
            r.source_name AS source,
            r.hit_count AS visitors,
            CASE WHEN st.total_hits > 0 THEN ROUND((r.hit_count::numeric / st.total_hits) * 100, 1) ELSE 0 END AS percentage
        FROM raw_sources r, sum_total st
        ORDER BY r.hit_count DESC
    ) s;

    IF jsonb_array_length(v_sources) = 0 THEN
        WITH raw_v AS (
            SELECT
                CASE
                    WHEN referrer IS NULL OR referrer = '' OR referrer ILIKE '%direct%' THEN 'Direct'
                    WHEN referrer ILIKE '%google%' THEN 'Google'
                    WHEN referrer ILIKE '%bing%' THEN 'Bing'
                    WHEN referrer ILIKE '%github%' THEN 'GitHub'
                    ELSE 'Referral'
                END AS source_name,
                COUNT(*) AS hit_count
            FROM public.visitors
            WHERE (p_project_id IS NULL OR project_id = p_project_id)
              AND created_at >= p_start AND created_at <= p_end
            GROUP BY 1
        ),
        sum_v AS (
            SELECT COALESCE(SUM(hit_count), 0) AS total_hits FROM raw_v
        )
        SELECT COALESCE(jsonb_agg(row_to_json(s)), '[]'::jsonb)
        INTO v_sources
        FROM (
            SELECT 
                r.source_name AS source,
                r.hit_count AS visitors,
                CASE WHEN st.total_hits > 0 THEN ROUND((r.hit_count::numeric / st.total_hits) * 100, 1) ELSE 0 END AS percentage
            FROM raw_v r, sum_v st
            ORDER BY r.hit_count DESC
        ) s;
    END IF;

    RETURN v_sources;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_top_pages(
    p_project_id uuid,
    p_start timestamptz,
    p_end timestamptz,
    p_limit int DEFAULT 10
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    v_pages jsonb;
BEGIN
    SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb)
    INTO v_pages
    FROM (
        SELECT 
            COALESCE(path, page_url, '/') AS path,
            MAX(COALESCE(title, 'Untitled Page')) AS title,
            COUNT(*) AS views,
            COUNT(DISTINCT visitor_id) AS unique_visitors
        FROM public.page_views
        WHERE (p_project_id IS NULL OR project_id = p_project_id)
          AND viewed_at >= p_start AND viewed_at <= p_end
        GROUP BY 1
        ORDER BY views DESC
        LIMIT p_limit
    ) t;

    RETURN v_pages;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_geography(
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
    v_geo jsonb;
BEGIN
    WITH geo_counts AS (
        SELECT 
            COALESCE(country_name, country, 'Unknown') AS country,
            COALESCE(country_code, 'UN') AS country_code,
            COUNT(*) AS visitors
        FROM public.visitors
        WHERE (p_project_id IS NULL OR project_id = p_project_id)
          AND created_at >= p_start AND created_at <= p_end
        GROUP BY 1, 2
    ),
    geo_total AS (
        SELECT COALESCE(SUM(visitors), 0) AS total_visitors FROM geo_counts
    )
    SELECT COALESCE(jsonb_agg(row_to_json(g)), '[]'::jsonb)
    INTO v_geo
    FROM (
        SELECT 
            gc.country,
            gc.country_code,
            gc.visitors,
            CASE WHEN gt.total_visitors > 0 THEN ROUND((gc.visitors::numeric / gt.total_visitors) * 100, 1) ELSE 0 END AS percentage
        FROM geo_counts gc, geo_total gt
        ORDER BY gc.visitors DESC
    ) g;

    RETURN v_geo;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_devices(
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
    v_devices jsonb;
BEGIN
    WITH device_counts AS (
        SELECT 
            COALESCE(device_type, 'desktop') AS device_type,
            COUNT(*) AS visitors
        FROM public.visitors
        WHERE (p_project_id IS NULL OR project_id = p_project_id)
          AND created_at >= p_start AND created_at <= p_end
        GROUP BY 1
    ),
    device_total AS (
        SELECT COALESCE(SUM(visitors), 0) AS total_visitors FROM device_counts
    )
    SELECT COALESCE(jsonb_agg(row_to_json(d)), '[]'::jsonb)
    INTO v_devices
    FROM (
        SELECT 
            INITCAP(dc.device_type) AS device_type,
            dc.visitors,
            CASE WHEN dt.total_visitors > 0 THEN ROUND((dc.visitors::numeric / dt.total_visitors) * 100, 1) ELSE 0 END AS percentage
        FROM device_counts dc, device_total dt
        ORDER BY dc.visitors DESC
    ) d;

    RETURN v_devices;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_browsers(
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
    v_browsers jsonb;
BEGIN
    WITH browser_counts AS (
        SELECT 
            COALESCE(browser, 'Other') AS browser,
            COUNT(*) AS visitors
        FROM public.visitors
        WHERE (p_project_id IS NULL OR project_id = p_project_id)
          AND created_at >= p_start AND created_at <= p_end
        GROUP BY 1
    ),
    browser_total AS (
        SELECT COALESCE(SUM(visitors), 0) AS total_visitors FROM browser_counts
    )
    SELECT COALESCE(jsonb_agg(row_to_json(b)), '[]'::jsonb)
    INTO v_browsers
    FROM (
        SELECT 
            bc.browser,
            bc.visitors,
            CASE WHEN bt.total_visitors > 0 THEN ROUND((bc.visitors::numeric / bt.total_visitors) * 100, 1) ELSE 0 END AS percentage
        FROM browser_counts bc, browser_total bt
        ORDER BY bc.visitors DESC
    ) b;

    RETURN v_browsers;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_operating_systems(
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
    v_os jsonb;
BEGIN
    WITH os_counts AS (
        SELECT 
            COALESCE(operating_system, os, 'Other') AS operating_system,
            COUNT(*) AS visitors
        FROM public.visitors
        WHERE (p_project_id IS NULL OR project_id = p_project_id)
          AND created_at >= p_start AND created_at <= p_end
        GROUP BY 1
    ),
    os_total AS (
        SELECT COALESCE(SUM(visitors), 0) AS total_visitors FROM os_counts
    )
    SELECT COALESCE(jsonb_agg(row_to_json(o)), '[]'::jsonb)
    INTO v_os
    FROM (
        SELECT 
            oc.operating_system,
            oc.visitors,
            CASE WHEN ot.total_visitors > 0 THEN ROUND((oc.visitors::numeric / ot.total_visitors) * 100, 1) ELSE 0 END AS percentage
        FROM os_counts oc, os_total ot
        ORDER BY oc.visitors DESC
    ) o;

    RETURN v_os;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_event_summary(
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
    v_events jsonb;
BEGIN
    SELECT COALESCE(jsonb_agg(row_to_json(e)), '[]'::jsonb)
    INTO v_events
    FROM (
        SELECT 
            event_name,
            COUNT(*) AS count,
            COUNT(DISTINCT visitor_id) AS unique_visitors,
            MAX(occurred_at) AS last_triggered
        FROM public.events
        WHERE (p_project_id IS NULL OR project_id = p_project_id)
          AND occurred_at >= p_start AND occurred_at <= p_end
        GROUP BY 1
        ORDER BY count DESC
    ) e;

    RETURN v_events;
END;
$$;

-- ----------------------------------------------------------------------------
-- 4. Clean up RLS Policies (Fix Multiple Permissive, InitPlan, and Permissive RLS)
-- ----------------------------------------------------------------------------

-- Projects
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can insert their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view accessible projects" ON public.projects;
DROP POLICY IF EXISTS "Users can create projects" ON public.projects;
DROP POLICY IF EXISTS "Owners can update projects" ON public.projects;
DROP POLICY IF EXISTS "Owners can delete projects" ON public.projects;

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

CREATE POLICY "Users can create projects"
  ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK (
    owner_id = (SELECT auth.uid())
    OR user_id = (SELECT auth.uid())
  );

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

CREATE POLICY "Owners can delete projects"
  ON public.projects FOR DELETE
  TO authenticated
  USING (
    owner_id = (SELECT auth.uid())
    OR user_id = (SELECT auth.uid())
  );

-- Project Members
DROP POLICY IF EXISTS "Members can view project membership" ON public.project_members;
DROP POLICY IF EXISTS "Project owners can manage members" ON public.project_members;
DROP POLICY IF EXISTS "Project owners can insert members" ON public.project_members;
DROP POLICY IF EXISTS "Project owners can update members" ON public.project_members;
DROP POLICY IF EXISTS "Project owners can delete members" ON public.project_members;

CREATE POLICY "Members can view project membership"
  ON public.project_members FOR SELECT
  TO authenticated
  USING (public.has_project_access(project_id));

CREATE POLICY "Project owners can insert members"
  ON public.project_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_members.project_id
        AND (p.owner_id = (SELECT auth.uid()) OR p.user_id = (SELECT auth.uid()))
    )
  );

CREATE POLICY "Project owners can update members"
  ON public.project_members FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_members.project_id
        AND (p.owner_id = (SELECT auth.uid()) OR p.user_id = (SELECT auth.uid()))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_members.project_id
        AND (p.owner_id = (SELECT auth.uid()) OR p.user_id = (SELECT auth.uid()))
    )
  );

CREATE POLICY "Project owners can delete members"
  ON public.project_members FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_members.project_id
        AND (p.owner_id = (SELECT auth.uid()) OR p.user_id = (SELECT auth.uid()))
    )
  );

-- Project Settings
DROP POLICY IF EXISTS "Members can view project settings" ON public.project_settings;
DROP POLICY IF EXISTS "Project managers can update settings" ON public.project_settings;

CREATE POLICY "Members can view project settings"
  ON public.project_settings FOR SELECT
  TO authenticated
  USING (public.has_project_access(project_id));

CREATE POLICY "Project managers can update settings"
  ON public.project_settings FOR UPDATE
  TO authenticated
  USING (public.has_project_access(project_id))
  WITH CHECK (public.has_project_access(project_id));

-- Visitors
DROP POLICY IF EXISTS "Users can view visitors for their projects" ON public.visitors;
DROP POLICY IF EXISTS "Members can view project visitors" ON public.visitors;

CREATE POLICY "Members can view project visitors"
  ON public.visitors FOR SELECT
  TO authenticated
  USING (public.has_project_access(project_id));

-- Sessions
DROP POLICY IF EXISTS "Members can view project sessions" ON public.sessions;

CREATE POLICY "Members can view project sessions"
  ON public.sessions FOR SELECT
  TO authenticated
  USING (public.has_project_access(project_id));

-- Page Views
DROP POLICY IF EXISTS "Users can view page views for their projects" ON public.page_views;
DROP POLICY IF EXISTS "Members can view project page views" ON public.page_views;

CREATE POLICY "Members can view project page views"
  ON public.page_views FOR SELECT
  TO authenticated
  USING (public.has_project_access(project_id));

-- Events
DROP POLICY IF EXISTS "Members can view project events" ON public.events;

CREATE POLICY "Members can view project events"
  ON public.events FOR SELECT
  TO authenticated
  USING (public.has_project_access(project_id));

-- Counters
DROP POLICY IF EXISTS "Users can view counters for their projects" ON public.counters;
DROP POLICY IF EXISTS "Members can view project counters" ON public.counters;

CREATE POLICY "Members can view project counters"
  ON public.counters FOR SELECT
  TO authenticated
  USING (public.has_project_access(project_id));

-- Usages
DROP POLICY IF EXISTS "Users can view usages for their projects" ON public.usages;
DROP POLICY IF EXISTS "Members can view project usages" ON public.usages;

CREATE POLICY "Members can view project usages"
  ON public.usages FOR SELECT
  TO authenticated
  USING (public.has_project_access(project_id));

-- API Keys
DROP POLICY IF EXISTS "Members can manage project API keys" ON public.api_keys;

CREATE POLICY "Members can manage project API keys"
  ON public.api_keys FOR ALL
  TO authenticated
  USING (public.has_project_access(project_id))
  WITH CHECK (public.has_project_access(project_id));

-- Alerts & Alert Events
DROP POLICY IF EXISTS "Members can manage project alerts" ON public.alerts;
DROP POLICY IF EXISTS "Members can view project alert events" ON public.alert_events;

CREATE POLICY "Members can manage project alerts"
  ON public.alerts FOR ALL
  TO authenticated
  USING (public.has_project_access(project_id))
  WITH CHECK (public.has_project_access(project_id));

CREATE POLICY "Members can view project alert events"
  ON public.alert_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.alerts a
      WHERE a.id = alert_events.alert_id
        AND public.has_project_access(a.project_id)
    )
  );

-- Daily Analytics
DROP POLICY IF EXISTS "Members can view project daily analytics" ON public.analytics_daily;

CREATE POLICY "Members can view project daily analytics"
  ON public.analytics_daily FOR SELECT
  TO authenticated
  USING (public.has_project_access(project_id));

-- Activity Logs
DROP POLICY IF EXISTS "Users can view logs for their projects" ON public.activity_logs;
DROP POLICY IF EXISTS "Users can insert logs for their projects" ON public.activity_logs;
DROP POLICY IF EXISTS "Members can view activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Members can insert activity logs" ON public.activity_logs;

CREATE POLICY "Members can view activity logs"
  ON public.activity_logs FOR SELECT
  TO authenticated
  USING (public.has_project_access(project_id));

CREATE POLICY "Members can insert activity logs"
  ON public.activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (public.has_project_access(project_id));

-- Audit Logs
-- Remove permissive INSERT policy (service_role already bypasses RLS in Postgres)
DROP POLICY IF EXISTS "Service role can insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Users can view their own audit logs" ON public.audit_logs;

CREATE POLICY "Users can view their own audit logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Plans
-- Consolidate to single public SELECT policy (removes multiple permissive policies and service_role RLS warnings)
DROP POLICY IF EXISTS "Allow public read access for plans" ON public.plans;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.plans;
DROP POLICY IF EXISTS "Enable write access for service_role only" ON public.plans;

CREATE POLICY "Allow public read access for plans"
  ON public.plans FOR SELECT
  TO public
  USING (true);

-- Notifications
DROP POLICY IF EXISTS "Users can manage their own notifications" ON public.notifications;

CREATE POLICY "Users can manage their own notifications"
  ON public.notifications FOR ALL
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Profiles
DROP POLICY IF EXISTS "Users can view and edit their own profile" ON public.profiles;

CREATE POLICY "Users can view and edit their own profile"
  ON public.profiles FOR ALL
  TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

-- Users table
DROP POLICY IF EXISTS "Users can view and edit their own user record" ON public.users;

CREATE POLICY "Users can view and edit their own user record"
  ON public.users FOR ALL
  TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));
