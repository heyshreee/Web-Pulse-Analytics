-- ============================================================================
-- Migration: Nano Plan Entitlements, Verified Origins, Atomic Quotas,
--            Limited Report Sharing, Idempotency & Data Retention
-- Idempotent and non-destructive. Safe to run on staging & production.
-- ============================================================================

-- 1. Extend public.plans with canonical entitlement & rate columns
ALTER TABLE public.plans
  ADD COLUMN IF NOT EXISTS retention_days integer NOT NULL DEFAULT 7,
  ADD COLUMN IF NOT EXISTS refresh_rate integer NOT NULL DEFAULT 60,
  ADD COLUMN IF NOT EXISTS team_members_limit integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS share_reports_limit integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS share_link_expiry_days integer NOT NULL DEFAULT 7,
  ADD COLUMN IF NOT EXISTS api_requests_per_minute integer NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS ingestion_events_per_second integer NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS ingestion_burst integer NOT NULL DEFAULT 20,
  ADD COLUMN IF NOT EXISTS limits jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS entitlements jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS access jsonb NOT NULL DEFAULT '{}'::jsonb;

INSERT INTO public.plans (
    id, name, price, price_usd, price_inr, interval, visitor_limit, project_limit, allowed_origins_limit,
    retention_days, refresh_rate, team_members_limit, share_reports_limit, share_link_expiry_days,
    api_requests_per_minute, ingestion_events_per_second, ingestion_burst, features, limits, entitlements, access
) VALUES
(
  'nano', 'Nano', 0, 0, 0, 'month', 10000, 1, 3,
  7, 60, 1, 1, 7, 30, 10, 20,
  '["1 Project", "Up to 3 Verified Origins", "10,000 events/mo", "7-day retention", "60 sec refresh", "1 Shared report/mo (7d expiry)", "Basic API"]'::jsonb,
  '{"monthly_events":10000,"projects":1,"origins_per_project":3,"team_members":1,"retention_days":7,"dashboard_refresh_seconds":60,"api_requests_per_minute":30,"ingestion_events_per_second":10,"ingestion_burst":20,"shared_reports_per_month":1,"share_link_expiry_days":7}'::jsonb,
  '{"basic_analytics":true,"visitor_analytics":true,"traffic_sources":true,"country_statistics":true,"device_analytics":true,"custom_events":true,"basic_rest_api":true,"domain_verification":true,"origin_protection":true,"security_notifications":true,"limited_report_sharing":true,"globe_analyze":false,"advanced_geo_analytics":false,"heatmaps":false,"real_time_analytics":false,"live_visitor_logs":false,"advanced_filters":false,"csv_export":false,"pdf_export":false,"scheduled_reports":false,"custom_dashboards":false,"team_collaboration":false,"webhooks":false,"v2_beta":false,"alpha_access":false}'::jsonb,
  '{"marketing":true,"v1":true,"v2_beta":false,"alpha":false}'::jsonb
),
(
  'lite', 'Lite', 199, 2.49, 199, 'month', 100000, 3, 3,
  30, 15, 1, 3, 30, 120, 25, 50,
  '["3 Projects", "Up to 3 Verified Origins", "100,000 events/mo", "30-day retention", "15 sec refresh", "Globe Analyze", "Basic API & CSV export"]'::jsonb,
  '{"monthly_events":100000,"projects":3,"origins_per_project":3,"team_members":1,"retention_days":30,"dashboard_refresh_seconds":15,"api_requests_per_minute":120,"ingestion_events_per_second":25,"ingestion_burst":50,"shared_reports_per_month":3,"share_link_expiry_days":30}'::jsonb,
  '{"basic_analytics":true,"visitor_analytics":true,"traffic_sources":true,"country_statistics":true,"device_analytics":true,"custom_events":true,"basic_rest_api":true,"domain_verification":true,"origin_protection":true,"security_notifications":true,"limited_report_sharing":true,"globe_analyze":true,"advanced_geo_analytics":false,"heatmaps":false,"real_time_analytics":false,"live_visitor_logs":false,"advanced_filters":false,"csv_export":true,"pdf_export":false,"scheduled_reports":false,"custom_dashboards":false,"team_collaboration":false,"webhooks":false,"v2_beta":false,"alpha_access":false}'::jsonb,
  '{"marketing":true,"v1":true,"v2_beta":false,"alpha":false}'::jsonb
),
(
  'pro', 'Pro', 699, 8.99, 699, 'month', 1000000, 10, 10,
  90, 5, 3, 25, 90, 600, 100, 200,
  '["10 Projects", "10 Verified Origins", "1,000,000 events/mo", "90-day retention", "5 sec refresh", "3 Team members", "Live Logs", "Globe Analyze", "Full API & Exports", "V2 Beta access"]'::jsonb,
  '{"monthly_events":1000000,"projects":10,"origins_per_project":10,"team_members":3,"retention_days":90,"dashboard_refresh_seconds":5,"api_requests_per_minute":600,"ingestion_events_per_second":100,"ingestion_burst":200,"shared_reports_per_month":25,"share_link_expiry_days":90}'::jsonb,
  '{"basic_analytics":true,"visitor_analytics":true,"traffic_sources":true,"country_statistics":true,"device_analytics":true,"custom_events":true,"basic_rest_api":true,"domain_verification":true,"origin_protection":true,"security_notifications":true,"limited_report_sharing":true,"globe_analyze":true,"advanced_geo_analytics":true,"heatmaps":true,"real_time_analytics":true,"live_visitor_logs":true,"advanced_filters":true,"csv_export":true,"pdf_export":true,"scheduled_reports":true,"custom_dashboards":false,"team_collaboration":true,"webhooks":true,"v2_beta":true,"alpha_access":false}'::jsonb,
  '{"marketing":true,"v1":true,"v2_beta":true,"alpha":false}'::jsonb
),
(
  'max', 'Max', 1999, 24.99, 1999, 'month', 5000000, 50, 25,
  365, 1, 10, 100, 365, 1800, 250, 500,
  '["50 Projects", "25 Verified Origins", "5,000,000 events/mo", "12-month retention", "1 sec refresh", "10 Team members", "Live Logs", "Globe Analyze", "Full API & Exports", "V2 Beta & Alpha access"]'::jsonb,
  '{"monthly_events":5000000,"projects":50,"origins_per_project":25,"team_members":10,"retention_days":365,"dashboard_refresh_seconds":1,"api_requests_per_minute":1800,"ingestion_events_per_second":250,"ingestion_burst":500,"shared_reports_per_month":100,"share_link_expiry_days":365}'::jsonb,
  '{"basic_analytics":true,"visitor_analytics":true,"traffic_sources":true,"country_statistics":true,"device_analytics":true,"custom_events":true,"basic_rest_api":true,"domain_verification":true,"origin_protection":true,"security_notifications":true,"limited_report_sharing":true,"globe_analyze":true,"advanced_geo_analytics":true,"heatmaps":true,"real_time_analytics":true,"live_visitor_logs":true,"advanced_filters":true,"csv_export":true,"pdf_export":true,"scheduled_reports":true,"custom_dashboards":true,"team_collaboration":true,"webhooks":true,"v2_beta":true,"alpha_access":true}'::jsonb,
  '{"marketing":true,"v1":true,"v2_beta":true,"alpha":true}'::jsonb
),
(
  'enterprise', 'Enterprise', 0, 0, 0, 'month', 50000000, 500, 100,
  730, 1, 100, 500, 730, 6000, 1000, 2000,
  '["Custom Projects", "Custom Origins", "Negotiated events/mo", "Custom retention", "1 sec refresh", "Dedicated support", "Custom SLA"]'::jsonb,
  '{"monthly_events":50000000,"projects":500,"origins_per_project":100,"team_members":100,"retention_days":730,"dashboard_refresh_seconds":1,"api_requests_per_minute":6000,"ingestion_events_per_second":1000,"ingestion_burst":2000,"shared_reports_per_month":500,"share_link_expiry_days":730}'::jsonb,
  '{"basic_analytics":true,"visitor_analytics":true,"traffic_sources":true,"country_statistics":true,"device_analytics":true,"custom_events":true,"basic_rest_api":true,"domain_verification":true,"origin_protection":true,"security_notifications":true,"limited_report_sharing":true,"globe_analyze":true,"advanced_geo_analytics":true,"heatmaps":true,"real_time_analytics":true,"live_visitor_logs":true,"advanced_filters":true,"csv_export":true,"pdf_export":true,"scheduled_reports":true,"custom_dashboards":true,"team_collaboration":true,"webhooks":true,"v2_beta":true,"alpha_access":true}'::jsonb,
  '{"marketing":true,"v1":true,"v2_beta":true,"alpha":true}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    price_usd = EXCLUDED.price_usd,
    price_inr = EXCLUDED.price_inr,
    visitor_limit = EXCLUDED.visitor_limit,
    project_limit = EXCLUDED.project_limit,
    allowed_origins_limit = EXCLUDED.allowed_origins_limit,
    retention_days = EXCLUDED.retention_days,
    refresh_rate = EXCLUDED.refresh_rate,
    team_members_limit = EXCLUDED.team_members_limit,
    share_reports_limit = EXCLUDED.share_reports_limit,
    share_link_expiry_days = EXCLUDED.share_link_expiry_days,
    api_requests_per_minute = EXCLUDED.api_requests_per_minute,
    ingestion_events_per_second = EXCLUDED.ingestion_events_per_second,
    ingestion_burst = EXCLUDED.ingestion_burst,
    features = EXCLUDED.features,
    limits = EXCLUDED.limits,
    entitlements = EXCLUDED.entitlements,
    access = EXCLUDED.access,
    updated_at = now();

-- 2. Reconcile public.usages with runtime columns (month, views, shared_reports_created, alerts_sent)
ALTER TABLE public.usages
  ADD COLUMN IF NOT EXISTS month text,
  ADD COLUMN IF NOT EXISTS views bigint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shared_reports_created integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS alerts_sent jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.usages
  ALTER COLUMN event_type SET DEFAULT 'event',
  ALTER COLUMN period SET DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM');

UPDATE public.usages
SET
  month = COALESCE(month, period, to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM')),
  views = GREATEST(COALESCE(views, 0), COALESCE(count, 0))
WHERE month IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_usages_project_month_unique
  ON public.usages(project_id, month)
  WHERE project_id IS NOT NULL AND month IS NOT NULL;

-- 3. Verified & blockable website origins per project
CREATE TABLE IF NOT EXISTS public.project_origins (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    origin text NOT NULL,
    hostname text NOT NULL,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'blocked')),
    verification_method text CHECK (verification_method IN ('dns_txt', 'file', 'legacy_migration')),
    verification_token text NOT NULL,
    verified_at timestamptz,
    blocked_at timestamptz,
    last_checked_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(project_id, origin)
);

CREATE INDEX IF NOT EXISTS idx_project_origins_project_status
  ON public.project_origins(project_id, status);

DROP TRIGGER IF EXISTS trigger_project_origins_updated_at ON public.project_origins;
CREATE TRIGGER trigger_project_origins_updated_at
BEFORE UPDATE ON public.project_origins
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.project_origins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view project origins" ON public.project_origins;
CREATE POLICY "Members can view project origins"
  ON public.project_origins FOR SELECT
  TO authenticated
  USING (public.has_project_access(project_id));

DROP POLICY IF EXISTS "Owners can manage project origins" ON public.project_origins;
CREATE POLICY "Owners can manage project origins"
  ON public.project_origins FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_origins.project_id
        AND (p.owner_id = (SELECT auth.uid()) OR p.user_id = (SELECT auth.uid()))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_origins.project_id
        AND (p.owner_id = (SELECT auth.uid()) OR p.user_id = (SELECT auth.uid()))
    )
  );

-- Non-destructive backfill of legacy comma-separated projects.allowed_origins
INSERT INTO public.project_origins (
    project_id, origin, hostname, status, verification_method, verification_token, verified_at
)
SELECT
    p.id,
    CASE
      WHEN lower(trim(raw_item)) ~ '^https?://' THEN lower(regexp_replace(trim(raw_item), '/+$', ''))
      ELSE 'https://' || lower(regexp_replace(trim(raw_item), '/+$', ''))
    END AS normalized_origin,
    lower(split_part(regexp_replace(regexp_replace(trim(raw_item), '^https?://', '', 'i'), '/.*$', ''), ':', 1)) AS parsed_host,
    'verified',
    'legacy_migration',
    encode(gen_random_bytes(16), 'hex'),
    now()
FROM public.projects p
CROSS JOIN LATERAL regexp_split_to_table(COALESCE(p.allowed_origins, ''), ',') AS raw_item
WHERE trim(raw_item) <> ''
ON CONFLICT (project_id, origin) DO NOTHING;

-- Backfill owner rows into project_members so team seat checks always count the owner
INSERT INTO public.project_members (project_id, user_id, role)
SELECT p.id, COALESCE(p.owner_id, p.user_id), 'owner'
FROM public.projects p
WHERE COALESCE(p.owner_id, p.user_id) IS NOT NULL
ON CONFLICT (project_id, user_id) DO NOTHING;

-- 4. Event ID idempotency table (prevents duplicate retries from double-counting quota)
CREATE TABLE IF NOT EXISTS public.ingested_events (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    event_id text NOT NULL,
    month text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(project_id, event_id)
);

CREATE INDEX IF NOT EXISTS idx_ingested_events_created_at
  ON public.ingested_events(created_at);

ALTER TABLE public.ingested_events ENABLE ROW LEVEL SECURITY;

-- 5. Limited shared report snapshots (sha256 token_hash only, strict expiry & revocation)
CREATE TABLE IF NOT EXISTS public.shared_reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    month text NOT NULL,
    token_hash text NOT NULL UNIQUE,
    report_title text,
    range_key text NOT NULL DEFAULT '7d',
    snapshot_data jsonb NOT NULL DEFAULT '{}'::jsonb,
    expires_at timestamptz NOT NULL,
    revoked_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shared_reports_project_month
  ON public.shared_reports(project_id, month);
CREATE INDEX IF NOT EXISTS idx_shared_reports_user_month
  ON public.shared_reports(user_id, month);
CREATE INDEX IF NOT EXISTS idx_shared_reports_expires
  ON public.shared_reports(expires_at);

ALTER TABLE public.shared_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view project shared reports" ON public.shared_reports;
CREATE POLICY "Members can view project shared reports"
  ON public.shared_reports FOR SELECT
  TO authenticated
  USING (public.has_project_access(project_id));

DROP POLICY IF EXISTS "Owners can manage project shared reports" ON public.shared_reports;
CREATE POLICY "Owners can manage project shared reports"
  ON public.shared_reports FOR ALL
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- 6. Atomic monthly event quota RPC (with event_id deduplication & UTC month boundary)
CREATE OR REPLACE FUNCTION public.consume_monthly_event_quota(
    p_user_id uuid,
    p_project_id uuid,
    p_month text,
    p_limit bigint,
    p_event_id text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    v_dedup_inserted integer := 0;
    v_total bigint := 0;
    v_new_total bigint := 0;
BEGIN
    -- Serialize quota updates for this owner within the billing month
    PERFORM pg_advisory_xact_lock(hashtext('quota:' || p_user_id::text || ':' || p_month));

    -- Event ID idempotency check
    IF p_event_id IS NOT NULL AND length(trim(p_event_id)) > 0 THEN
        INSERT INTO public.ingested_events (project_id, event_id, month)
        VALUES (p_project_id, trim(p_event_id), p_month)
        ON CONFLICT (project_id, event_id) DO NOTHING;

        GET DIAGNOSTICS v_dedup_inserted = ROW_COUNT;
        IF v_dedup_inserted = 0 THEN
            SELECT COALESCE(SUM(u.views), 0)
            INTO v_total
            FROM public.usages u
            JOIN public.projects p ON p.id = u.project_id
            WHERE (p.user_id = p_user_id OR p.owner_id = p_user_id)
              AND u.month = p_month;

            RETURN jsonb_build_object(
                'allowed', true,
                'duplicate', true,
                'current_total', v_total,
                'limit', p_limit
            );
        END IF;
    END IF;

    -- Compute owner's current accepted events for this UTC billing month
    SELECT COALESCE(SUM(u.views), 0)
    INTO v_total
    FROM public.usages u
    JOIN public.projects p ON p.id = u.project_id
    WHERE (p.user_id = p_user_id OR p.owner_id = p_user_id)
      AND u.month = p_month;

    IF v_total >= p_limit THEN
        RETURN jsonb_build_object(
            'allowed', false,
            'duplicate', false,
            'current_total', v_total,
            'limit', p_limit
        );
    END IF;

    INSERT INTO public.usages (user_id, project_id, event_type, count, period, month, views, updated_at)
    VALUES (p_user_id, p_project_id, 'event', 1, p_month, p_month, 1, pg_catalog.now())
    ON CONFLICT (project_id, month) WHERE project_id IS NOT NULL AND month IS NOT NULL
    DO UPDATE SET
        views = public.usages.views + 1,
        count = public.usages.count + 1,
        updated_at = pg_catalog.now();

    v_new_total := v_total + 1;

    RETURN jsonb_build_object(
        'allowed', true,
        'duplicate', false,
        'current_total', v_new_total,
        'limit', p_limit
    );
END;
$$;

-- 7. Atomic shared report monthly quota check RPC
CREATE OR REPLACE FUNCTION public.check_shared_report_quota(
    p_user_id uuid,
    p_month text,
    p_limit integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    v_used integer := 0;
BEGIN
    PERFORM pg_advisory_xact_lock(hashtext('share:' || p_user_id::text || ':' || p_month));

    SELECT COALESCE(COUNT(*), 0)::integer
    INTO v_used
    FROM public.shared_reports sr
    WHERE sr.user_id = p_user_id
      AND sr.month = p_month;

    RETURN jsonb_build_object(
        'allowed', v_used < p_limit,
        'used', v_used,
        'limit', p_limit
    );
END;
$$;

-- 8. Scheduled UTC raw-event retention cleanup RPC
-- Preserves projects, project_origins, analytics_daily aggregates, and usages counters.
CREATE OR REPLACE FUNCTION public.cleanup_expired_analytics(
    p_now timestamptz DEFAULT pg_catalog.now()
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    v_deleted_views bigint := 0;
    v_deleted_events bigint := 0;
    v_deleted_sessions bigint := 0;
    v_deleted_visitors bigint := 0;
    v_deleted_dedup bigint := 0;
    v_deleted_reports bigint := 0;
    v_rows bigint := 0;
    v_rec RECORD;
    v_cutoff timestamptz;
BEGIN
    FOR v_rec IN
        SELECT
            p.id AS project_id,
            LEAST(
                COALESCE(ps.retention_days, pl.retention_days, 7),
                COALESCE(pl.retention_days, 7)
            ) AS effective_retention_days
        FROM public.projects p
        LEFT JOIN public.users u ON u.id = COALESCE(p.owner_id, p.user_id)
        LEFT JOIN public.plans pl ON pl.id = COALESCE(
            CASE lower(u.plan)
                WHEN 'free' THEN 'nano'
                WHEN 'basic' THEN 'lite'
                WHEN 'business' THEN 'max'
                ELSE lower(u.plan)
            END,
            'nano'
        )
        LEFT JOIN public.project_settings ps ON ps.project_id = p.id
    LOOP
        v_cutoff := (p_now AT TIME ZONE 'UTC') - make_interval(days => GREATEST(v_rec.effective_retention_days, 1));

        DELETE FROM public.page_views
        WHERE project_id = v_rec.project_id
          AND COALESCE(viewed_at, created_at) < v_cutoff;
        GET DIAGNOSTICS v_rows = ROW_COUNT;
        v_deleted_views := v_deleted_views + v_rows;

        DELETE FROM public.events
        WHERE project_id = v_rec.project_id
          AND occurred_at < v_cutoff;
        GET DIAGNOSTICS v_rows = ROW_COUNT;
        v_deleted_events := v_deleted_events + v_rows;

        DELETE FROM public.sessions
        WHERE project_id = v_rec.project_id
          AND COALESCE(last_activity_at, started_at, created_at) < v_cutoff;
        GET DIAGNOSTICS v_rows = ROW_COUNT;
        v_deleted_sessions := v_deleted_sessions + v_rows;

        DELETE FROM public.visitors
        WHERE project_id = v_rec.project_id
          AND COALESCE(last_seen_at, last_seen, created_at) < v_cutoff;
        GET DIAGNOSTICS v_rows = ROW_COUNT;
        v_deleted_visitors := v_deleted_visitors + v_rows;

        DELETE FROM public.ingested_events
        WHERE project_id = v_rec.project_id
          AND created_at < v_cutoff;
        GET DIAGNOSTICS v_rows = ROW_COUNT;
        v_deleted_dedup := v_deleted_dedup + v_rows;
    END LOOP;

    -- Remove expired shared report links (preserve monthly quota usage rows separately)
    DELETE FROM public.shared_reports
    WHERE expires_at < p_now - interval '30 days';
    GET DIAGNOSTICS v_rows = ROW_COUNT;
    v_deleted_reports := v_rows;

    RETURN jsonb_build_object(
        'page_views_deleted', v_deleted_views,
        'events_deleted', v_deleted_events,
        'sessions_deleted', v_deleted_sessions,
        'visitors_deleted', v_deleted_visitors,
        'dedup_deleted', v_deleted_dedup,
        'expired_reports_purged', v_deleted_reports,
        'executed_at', p_now
    );
END;
$$;
