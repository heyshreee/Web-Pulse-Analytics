# WebPulse Analytics — Lite Plan

Lite is the first paid tier on WebPulse Analytics (`app.webpulseanalytics.tech`), expanding capacity and analytics capabilities over Nano while keeping V2 Beta (`beta.webpulseanalytics.tech`) and Alpha restricted to Pro and Max.

## Resource Limits & Entitlements

| Resource / Capability | Nano | Lite |
|---|---:|---:|
| Monthly accepted events (account-wide) | 10,000 | 100,000 |
| Active projects | 1 | 3 |
| Verified origins per project | 3 | 10 |
| Team members per project | 1 (owner) | 3 (owner, admin, viewer) |
| Raw event retention (UTC) | 7 days | 30 days |
| Dashboard auto-refresh | 60 seconds | 30 seconds |
| API rate limit | 30/min | 60/min |
| Ingestion rate / burst | 10/s (burst 20) | 30/s (burst 60) |
| Shared reports / UTC month | 1 | 10 |
| Shared report link expiry | 7 days | 30 days |
| Globe Analyze (`globe_analyze`) | Disabled | Enabled |
| Advanced geo analytics | Disabled | Enabled |
| Advanced filters (`advanced_filters`) | Disabled | Enabled |
| CSV export (`csv_export`) | Disabled | Enabled |
| PDF export (`pdf_export`) | Disabled | Enabled |
| Team collaboration (`team_collaboration`) | Disabled | Enabled |
| V2 Beta (`v2_beta`) & Alpha | Disabled | Disabled |

All limits and entitlements are defined in [backend/src/config/plans.js](../backend/src/config/plans.js) and enforced server-side.

## Multi-Project & Origin Management

- Lite accounts can create up to **3 active projects** (plus archive/restore via `PATCH /api/v1/projects/:id/archive`).
- Each project has its own `tracking_id`, analytics, settings, and up to **10 verified origins** (`public.project_origins`).
- The **100,000 monthly event quota** is shared atomically across all projects owned by the account (`consume_monthly_event_quota`).

## Globe Analyze, Regional Geo & Advanced Filters

- `globe_analyze` and `advanced_geo_analytics` are enabled for Lite (`GET /api/v1/analytics/globe`, `GET /api/v1/projects/:id/analytics/globe`, and regional breakdowns on `GET /api/v1/projects/:id/analytics/countries`).
- All project analytics endpoints (`overview`, `pages`, `sources`, `countries`, `devices`, `globe`, `export`) support `origin`, `country`, `region`, `device`, `browser`, `os`, `source`, `referrer`, `page`, `event`, `utm_source`, `utm_medium`, and `utm_campaign` filters when `advanced_filters` is enabled (returning `403 FEATURE_LOCKED` on Nano).

## CSV & PDF Exports

- `GET /api/v1/projects/:id/analytics/export?format=csv|pdf&type=overview|pages|sources|countries|devices`
- Exports are bounded to `1000` rows, exclude raw visitor identifiers/IPs, validate date ranges, and generate PDF reports using `pdfkit` with date range and UTC generation timestamps.

## Team Collaboration & Role Authorization

- Lite supports up to **3 members per project** (owner + invited `admin` or `viewer` seats; role escalation to `owner` is forbidden).
- Endpoints:
  - `GET /api/v1/projects/:id/members`
  - `POST /api/v1/projects/:id/members/invite`
  - `POST /api/v1/projects/invitations/:token/accept`
  - `POST /api/v1/projects/invitations/:token/reject`
  - `DELETE /api/v1/projects/:id/invitations/:invitationId`
  - `DELETE /api/v1/projects/:id/members/:memberId`
- Project membership and role rank (`viewer` < `admin` < `owner`) are enforced via [backend/src/utils/projectAuth.js](../backend/src/utils/projectAuth.js).

## Database Migration

Apply [supabase/migrations/20261129000001_lite_plan_entitlements.sql](../supabase/migrations/20261129000001_lite_plan_entitlements.sql) in Supabase SQL Editor (after `20261128000001_nano_plan_entitlements.sql`).
