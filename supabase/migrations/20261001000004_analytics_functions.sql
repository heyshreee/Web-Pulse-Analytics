-- ============================================================================
-- Migration 004: Analytic Aggregation RPC Functions
-- ============================================================================

-- 1. Dashboard Summary
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
    -- Page views
    SELECT COALESCE(COUNT(*), 0)
    INTO v_views
    FROM public.page_views
    WHERE (p_project_id IS NULL OR project_id = p_project_id)
      AND viewed_at >= p_start AND viewed_at <= p_end;

    -- Sessions & metrics
    SELECT 
        COALESCE(COUNT(*), 0),
        COALESCE(COUNT(DISTINCT visitor_id), 0),
        COALESCE(ROUND((COUNT(*) FILTER (WHERE page_views <= 1)::numeric / NULLIF(COUNT(*), 0)) * 100, 1), 0),
        COALESCE(ROUND(AVG(duration_seconds)::numeric, 0), 0)
    INTO v_sessions, v_visitors, v_bounce_rate, v_avg_duration
    FROM public.sessions
    WHERE (p_project_id IS NULL OR project_id = p_project_id)
      AND started_at >= p_start AND started_at <= p_end;

    -- If sessions table is empty for date range, fallback to visitors table
    IF v_visitors = 0 THEN
        SELECT COALESCE(COUNT(DISTINCT id), 0)
        INTO v_visitors
        FROM public.visitors
        WHERE (p_project_id IS NULL OR project_id = p_project_id)
          AND created_at >= p_start AND created_at <= p_end;
    END IF;

    -- Events
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

-- 2. Dashboard Comparison
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

-- 3. Visitors Timeseries
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

-- 4. Live Visitors
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
    v_cutoff := now() - interval '5 minutes';

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

-- 5. Traffic Sources
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
    v_total bigint := 0;
    v_sources jsonb;
BEGIN
    -- Classify referrer
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

    -- If no sessions in range, check visitors
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

-- 6. Top Pages
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

-- 7. Geography
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

-- 8. Devices
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

-- 9. Browsers
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

-- 10. Operating Systems
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

-- 11. Event Summary
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
