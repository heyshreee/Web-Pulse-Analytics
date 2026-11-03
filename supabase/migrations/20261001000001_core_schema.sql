-- ============================================================================
-- Migration 001: Core Architecture, Profiles, and Additive Schema Upgrade
-- ============================================================================

-- 1. Helper function for updated_at
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

-- 2. Profiles table (tied to auth.users if Supabase Auth is utilized)
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text,
    email text,
    avatar_url text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Trigger for profiles updated_at
DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 3. Additive columns for public.projects (preserving existing id, created_at, name, user_id, tracking_id)
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS owner_id uuid,
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS domain text,
  ADD COLUMN IF NOT EXISTS environment text NOT NULL DEFAULT 'production',
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS tracking_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Backfill project columns from existing data
UPDATE public.projects
SET 
  owner_id = COALESCE(owner_id, user_id),
  domain = COALESCE(domain, target_url, 'localhost'),
  slug = COALESCE(slug, lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g')), id::text)
WHERE slug IS NULL OR owner_id IS NULL;

-- Trigger for projects updated_at
DROP TRIGGER IF EXISTS trigger_projects_updated_at ON public.projects;
CREATE TRIGGER trigger_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 4. Project Members table
CREATE TABLE IF NOT EXISTS public.project_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id uuid NOT NULL,
    role text NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(project_id, user_id)
);

-- 5. Project Settings table
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

-- Trigger for project_settings updated_at
DROP TRIGGER IF EXISTS trigger_project_settings_updated_at ON public.project_settings;
CREATE TRIGGER trigger_project_settings_updated_at
BEFORE UPDATE ON public.project_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Seed project_settings for any existing projects without settings
INSERT INTO public.project_settings (project_id, tracking_enabled, anonymize_ip, respect_dnt, session_timeout_minutes, retention_days)
SELECT id, COALESCE(is_active, true), true, true, 30, 365
FROM public.projects
ON CONFLICT (project_id) DO NOTHING;

-- 6. Additive columns for public.visitors
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

-- Backfill visitor columns from existing data
UPDATE public.visitors
SET
  country_name = COALESCE(country_name, country),
  operating_system = COALESCE(operating_system, os),
  last_seen_at = COALESCE(last_seen_at, last_seen, created_at),
  first_seen_at = COALESCE(first_seen_at, created_at),
  visitor_hash = COALESCE(visitor_hash, md5(COALESCE(ip_address, '') || COALESCE(user_agent, '') || COALESCE(project_id::text, '')))
WHERE visitor_hash IS NULL;
