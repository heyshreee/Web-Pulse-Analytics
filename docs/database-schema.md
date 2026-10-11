# Database Schema

This document describes the data model used by Web Pulse Analytics, including tables,
relationships, RLS policies, and key design notes. The source of truth is the SQL in
[`supabase/migrations/`](../supabase/migrations/).

- [Overview](#overview)
- [Auth and users](#auth-and-users)
- [Projects](#projects)
- [Analytics](#analytics)
- [Alerts, counters, usage](#alerts-counters-usage)
- [Notifications](#notifications)
- [Functions and triggers](#functions-and-triggers)
- [Row Level Security (RLS)](#row-level-security-rls)
- [Applying migrations](#applying-migrations)
- [Migration guidelines](#migration-guidelines)

## Overview

Data is stored in Supabase (Postgres). Migrations are timestamped and additive where
possible. Tables follow snake_case, timestamps use `timestamptz`, and soft-deletes are
not universally applied (use cascades instead).

Migrations in order:

1. `20261001000001_core_schema.sql` — core schema (profiles, projects, project_members, project_settings)
2. `20261001000002_analytics_tables.sql` — analytics tables (page_views, events, sessions, visitors, etc.)
3. `20261001000003_indexes.sql` — performance indexes
4. `20261001000004_analytics_functions.sql` — SQL functions
5. `20261001000005_rls_security.sql` — RLS policies
6. `20261008000001_fix_security_and_performance_linter.sql` — subsequent fixes

## Auth and users

Supabase Auth (`auth.users`) is the identity provider. The app maintains a `public.profiles`
table (1:1 with `auth.users(id)`).

| Table | Key columns | Notes |
| --- | --- | --- |
| `public.profiles` | `id uuid PK → auth.users(id) ON DELETE CASCADE`, `full_name text`, `email text`, `avatar_url text`, `created_at`, `updated_at` | Profile metadata |

## Projects

Projects represent tracked websites/apps. Each project gets a `tracking_id` used by the
public tracker (`/api/track/:trackingId`).

| Table | Key columns | Notes |
| --- | --- | --- |
| `public.projects` | `id uuid PK`, `name text`, `user_id uuid`, `owner_id uuid`, `slug text`, `domain text`, `tracking_id text`, `tracking_enabled bool`, `environment text`, `description text`, `created_at`, `updated_at` | Backfilled in migration 001 (owner/domain/slug) |
| `public.project_members` | `id uuid PK`, `project_id uuid FK → projects(id) ON DELETE CASCADE`, `user_id uuid`, `role text CHECK ('owner','admin','editor','viewer')`, `created_at` | Access control model; unique (project_id,user_id) |
| `public.project_settings` | `project_id uuid PK FK → projects(id) ON DELETE CASCADE`, `tracking_enabled`, `anonymize_ip`, `respect_dnt`, `session_timeout_minutes`, `retention_days`, `created_at`, `updated_at` | Per-project tracking/privacy settings |

## Analytics

Analytics tables store page views, events, sessions, and visitor identity.

| Table | Key columns | Notes |
| --- | --- | --- |
| `public.page_views` | `id uuid PK`, `project_id uuid FK`, `visitor_id uuid`, `session_id uuid`, `page text`, `referrer text`, `country text`, `city text`, `region text`, `device_type text`, `browser text`, `os text`, `created_at` | Core page view events |
| `public.events` | `id uuid PK`, `project_id uuid FK`, `visitor_id uuid`, `session_id uuid`, `event_name text`, `page text`, `referrer text`, `country/city/region`, `device/browser/os`, `created_at` | Custom events (separate from page views) |
| `public.sessions` | `id uuid PK`, `project_id uuid FK`, `visitor_id uuid`, `started_at`, `ended_at`, `duration_seconds int`, `page_count int`, `created_at` | Sessionization |
| `public.visitors` | `id uuid PK`, `project_id uuid FK`, `visitor_key text`, `first_seen_at`, `last_seen_at`, `country/city/region`, `device/browser/os`, `created_at` | Visitor identity |

Indexes (migration 003) are defined on common query paths: `(project_id, created_at)`,
`(project_id, visitor_id)`, `(project_id, session_id)`, `(tracking_id)` on projects
(where applicable), and time-range filters. See migration 003 for details.

## Alerts, counters, usage

Operational/limits tables:

| Table | Key columns | Notes |
| --- | --- | --- |
| `public.alerts` | `id uuid PK`, `project_id uuid FK`, `user_id uuid`, `name text`, `condition jsonb`, `enabled bool`, `created_at`, `updated_at` | Alert definitions |
| `public.alert_events` | `id uuid PK`, `alert_id uuid FK → alerts(id) ON DELETE CASCADE`, `project_id uuid`, `triggered_at`, `metadata jsonb` | Alert triggers |
| `public.counters` | `id uuid PK`, `project_id uuid FK`, `key text`, `value bigint`, `created_at`, `updated_at` | Generic counters |
| `public.usages` | `id uuid PK`, `project_id uuid FK`, `user_id uuid`, `event_type text`, `count bigint`, `period text`, `period_start`, `period_end`, `created_at`, `updated_at` | Quotas/usage tracking |

## Notifications

| Table | Key columns | Notes |
| --- | --- | --- |
| `public.notifications` | `id uuid PK`, `user_id uuid`, `title text`, `message text`, `type text`, `read bool DEFAULT false`, `action_url text`, `created_at` | User notifications |

## Functions and triggers

Migration 004 defines helper functions (e.g. `update_updated_at()` trigger function).
Triggers automatically set `updated_at` on tables that have it:

- `profiles` — `trigger_profiles_updated_at`
- `projects` — `trigger_projects_updated_at`
- `project_settings` — `trigger_project_settings_updated_at`

## Row Level Security (RLS)

RLS is enabled on relevant tables. Key policies (migration 005):

- **Projects**: owners and project members with appropriate roles can view/update/delete
  based on `public.has_project_access(project_id)` (helper exists in schema/migrations).
- **Members/settings**: accessible to project members with access.
- **Analytics (page_views/events/sessions/visitors)**: project members with access can
  read; writes happen via service role (server-side tracking). Public ingest does **not**
  use client-side anon key with RLS for inserts — tracking is handled server-side with
  `SUPABASE_SERVICE_KEY`.
- **Alerts/alert_events/counters/usages**: members can view; mutations restricted to
  authorized roles as defined.
- **Notifications**: users can `ALL` on their own rows (`user_id = auth.uid()`).
- **Profiles**: users can `ALL` on their own profile (`id = auth.uid()`).

> Important: The public tracking endpoint runs on the backend with the **service role**
> key, bypassing RLS for inserts. That is intentional and must remain server-side only.
> Never expose `SUPABASE_SERVICE_KEY` to the browser.

## Applying migrations

You can apply migrations in several ways:

1. **Supabase CLI (recommended for local/dev)**
   ```bash
   supabase db push        # apply pending migrations
   supabase db reset       # drop + recreate + apply all (destructive)
   ```
2. **SQL Editor** — copy each migration file in timestamp order and run in Supabase
   Dashboard → SQL Editor.

Migrations are **never auto-deployed** by the release workflow (`.github/workflows/release.yml`).
Apply and review them manually per environment.

## Migration guidelines

- **Additive first**: prefer additive changes; avoid destructive rewrites unless necessary.
- **Never edit applied migrations.** Add a new timestamped migration instead.
- **Include RLS**: if you add a table that stores user/project data, enable RLS and add
  policies in the same migration.
- **Backfill safely**: use `UPDATE ... WHERE ... IS NULL` with `COALESCE` (see migration 001).
- **Idempotent where practical**: use `IF NOT EXISTS`, `DROP POLICY IF EXISTS`, `CREATE OR REPLACE`.
- **Test locally** before applying to staging/production.
- **Document breaking changes** in `CHANGELOG.md`.

For a full view of each migration, open the files under `supabase/migrations/`.
