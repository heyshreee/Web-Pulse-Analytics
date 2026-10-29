-- ============================================================================
-- Migration 005: Row Level Security & Access Policies
-- ============================================================================

-- 1. Helper function for project authorization check (STABLE, SECURITY INVOKER, immutable search_path)
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

-- 2. Enable RLS on core tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Projects policies (InitPlan optimized via (SELECT auth.uid()))
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

-- 4. Project Members policies
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
      WHERE p.id = project_members.project_id
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

DROP POLICY IF EXISTS "Project owners can delete members" ON public.project_members;
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

-- 5. Project Settings policies
DROP POLICY IF EXISTS "Members can view project settings" ON public.project_settings;
CREATE POLICY "Members can view project settings"
  ON public.project_settings FOR SELECT
  TO authenticated
  USING (public.has_project_access(project_id));

DROP POLICY IF EXISTS "Project managers can update settings" ON public.project_settings;
CREATE POLICY "Project managers can update settings"
  ON public.project_settings FOR UPDATE
  TO authenticated
  USING (public.has_project_access(project_id))
  WITH CHECK (public.has_project_access(project_id));

-- 6. Analytics Data policies (Visitors, Sessions, Page views, Events)
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

-- 7. API Keys policies
DROP POLICY IF EXISTS "Members can manage project API keys" ON public.api_keys;
CREATE POLICY "Members can manage project API keys"
  ON public.api_keys FOR ALL
  TO authenticated
  USING (public.has_project_access(project_id))
  WITH CHECK (public.has_project_access(project_id));

-- 8. Alerts policies
DROP POLICY IF EXISTS "Members can manage project alerts" ON public.alerts;
CREATE POLICY "Members can manage project alerts"
  ON public.alerts FOR ALL
  TO authenticated
  USING (public.has_project_access(project_id))
  WITH CHECK (public.has_project_access(project_id));

DROP POLICY IF EXISTS "Members can view project alert events" ON public.alert_events;
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

-- 9. Counters & Usages policies
DROP POLICY IF EXISTS "Members can view project counters" ON public.counters;
CREATE POLICY "Members can view project counters"
  ON public.counters FOR SELECT
  TO authenticated
  USING (public.has_project_access(project_id));

DROP POLICY IF EXISTS "Members can view project usages" ON public.usages;
CREATE POLICY "Members can view project usages"
  ON public.usages FOR SELECT
  TO authenticated
  USING (public.has_project_access(project_id));

-- 10. Notifications policy
DROP POLICY IF EXISTS "Users can manage their own notifications" ON public.notifications;
CREATE POLICY "Users can manage their own notifications"
  ON public.notifications FOR ALL
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- 11. Profiles policy
DROP POLICY IF EXISTS "Users can view and edit their own profile" ON public.profiles;
CREATE POLICY "Users can view and edit their own profile"
  ON public.profiles FOR ALL
  TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));
