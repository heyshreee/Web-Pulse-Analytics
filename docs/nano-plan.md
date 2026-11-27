# WebPulse Analytics — Nano Plan (Free Tier)

Nano is the free forever (`₹0/month`) entry-level plan for personal websites and testing on V1 Stable (`app.webpulseanalytics.tech`).

## Resource Limits & Entitlements

| Resource / Capability | Nano | Lite | Pro | Max |
|---|---:|---:|---:|---:|
| Monthly accepted events | 10,000 | 100,000 | 1,000,000 | 5,000,000 |
| Active projects | 1 | 3 | 10 | 50 |
| Verified origins per project | 3 | 3 | 10 | 25 |
| Team members | 1 (owner) | 1 | 3 | 10 |
| Raw event retention (UTC) | 7 days | 30 days | 90 days | 365 days |
| Dashboard auto-refresh | 60 seconds | 15 seconds | 5 seconds | 1 second |
| API rate limit | 30/min | Plan-scaled | Plan-scaled | Plan-scaled |
| Ingestion rate / burst | 10/s (burst 20) | Plan-scaled | Plan-scaled | Plan-scaled |
| Shared reports / UTC month | 1 | 5 | Unlimited | Unlimited |
| Shared report link expiry | 7 days | 30 days | 90 days | 365 days |
| Globe Analyze (`globe_analyze`) | Disabled | Enabled | Enabled | Enabled |
| CSV / PDF export | Disabled | CSV enabled | Enabled | Enabled |
| V2 Beta (`v2_beta`) | Disabled | Disabled | Enabled | Enabled |

All limits and entitlements are defined in [backend/src/config/plans.js](../backend/src/config/plans.js) and enforced server-side.

## Domain Verification & Origin Protection

- Origins are managed per project in `public.project_origins` via:
  - `GET /api/v1/projects/:id/origins`
  - `POST /api/v1/projects/:id/origins`
  - `POST /api/v1/projects/:id/origins/:originId/verify`
  - `PATCH /api/v1/projects/:id/origins/:originId/block`
  - `DELETE /api/v1/projects/:id/origins/:originId`
- Verification methods:
  - **DNS TXT**: `_webpulse-verify.<hostname>` containing `webpulse-verification=<token>`
  - **Verification File**: `<origin>/.well-known/webpulse-verify-<token>.txt` containing `webpulse-verification=<token>`
- Ingestion (`trackingCors` and `visitor.controller.js`) normalizes origins (`protocol + host + non-default port`), requires exact verified origin matches (subdomains are never auto-trusted), rejects `pending` / `blocked` / unregistered origins with `403`, and logs security notifications and activity events.

## Analytics REST API

Authenticated project analytics routes (rate-limited and entitlement-checked):

- `GET /api/v1/projects/:id/analytics/overview`
- `GET /api/v1/projects/:id/analytics/pages`
- `GET /api/v1/projects/:id/analytics/sources`
- `GET /api/v1/projects/:id/analytics/countries`
- `GET /api/v1/projects/:id/analytics/devices`
- `GET /api/v1/projects/:id/analytics/globe` (gated by `globe_analyze`; returns `403 FEATURE_LOCKED` for Nano)
- `GET /api/v1/projects/:id/analytics/export` (gated by `csv_export` / `pdf_export`; returns `403 FEATURE_LOCKED` for Nano)

Raw visitor IP addresses are stripped from dashboard and activity responses, and `lat`/`lng` coordinates are omitted when `globe_analyze` is disabled.

## Atomic Event Quota & Idempotency

- Monthly usage is enforced atomically in UTC (`YYYY-MM`) via `consume_monthly_event_quota` in [supabase/migrations/20261128000001_nano_plan_entitlements.sql](../supabase/migrations/20261128000001_nano_plan_entitlements.sql) and `usageService.consumeEventQuota`.
- Duplicate retries carrying the same `event_id` are deduplicated in `public.ingested_events` so they never consume quota twice.
- Deduplicated notifications are emitted at **80%** (`info`), **90%** (`warning`), and **100%** (`limit`) usage per UTC billing month. At 100%, billable ingestion stops while dashboard reads remain accessible.

## Limited Snapshot Report Sharing

- `POST /api/v1/projects/:id/share-reports` generates a 32-byte cryptographic token (`crypto.randomBytes(32)`), stores only its SHA-256 `token_hash` in `public.shared_reports`, captures an anonymized read-only metrics snapshot (`snapshot_data`), and enforces 1 report per UTC calendar month with a 7-day expiry on Nano.
- `GET /api/v1/projects/share/:shareToken` serves the read-only snapshot and returns `404` when revoked or `410` when expired.
- `DELETE /api/v1/projects/:id/share-reports/:reportId` revokes an active link immediately.

## 7-Day UTC Data Retention

- `RetentionService.cleanupExpiredData()` runs hourly in [backend/src/server.js](../backend/src/server.js) and calls the `cleanup_expired_analytics` RPC (with a query-based UTC fallback).
- Deletes expired raw rows in `page_views`, `events`, `sessions`, `visitors`, `ingested_events`, and expired `shared_reports` according to each owner's plan retention (`7 days` for Nano), while preserving `projects`, `project_origins`, `project_settings`, `analytics_daily`, and `usages`.

## V2 Beta Surface Access

- `requireSurfaceAccess()` checks `X-WebPulse-App` / request origin against `entitlements.access.v2_beta`.
- Nano and Lite users receive `403 SURFACE_ACCESS_DENIED` on V2 Beta API requests and are shown a V1 Stable / Upgrade gate in `apps/v2/src/components/Layout.jsx`.
