-- ============================================================================
-- Migration 003: High-Performance Analytics Indexes
-- ============================================================================

-- Page views indexes
CREATE INDEX IF NOT EXISTS page_views_project_time_idx
  ON public.page_views(project_id, viewed_at DESC);

CREATE INDEX IF NOT EXISTS page_views_project_path_idx
  ON public.page_views(project_id, path);

CREATE INDEX IF NOT EXISTS page_views_session_idx
  ON public.page_views(session_id);

-- Events indexes
CREATE INDEX IF NOT EXISTS events_project_time_idx
  ON public.events(project_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS events_project_name_idx
  ON public.events(project_id, event_name);

CREATE INDEX IF NOT EXISTS events_properties_idx
  ON public.events USING gin(properties);

-- Sessions indexes
CREATE INDEX IF NOT EXISTS sessions_project_last_activity_idx
  ON public.sessions(project_id, last_activity_at DESC);

CREATE INDEX IF NOT EXISTS sessions_project_started_idx
  ON public.sessions(project_id, started_at DESC);

CREATE INDEX IF NOT EXISTS sessions_visitor_idx
  ON public.sessions(visitor_id);

-- Visitors indexes
CREATE INDEX IF NOT EXISTS visitors_project_last_seen_idx
  ON public.visitors(project_id, last_seen_at DESC);

CREATE INDEX IF NOT EXISTS visitors_project_hash_idx
  ON public.visitors(project_id, visitor_hash);

-- API keys & alerts
CREATE INDEX IF NOT EXISTS api_keys_project_idx
  ON public.api_keys(project_id);

CREATE INDEX IF NOT EXISTS alerts_project_idx
  ON public.alerts(project_id);

CREATE INDEX IF NOT EXISTS alert_events_alert_time_idx
  ON public.alert_events(alert_id, triggered_at DESC);
