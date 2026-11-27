# WebPulse Analytics — Max Plan

Max is the highest standard subscription tier on WebPulse Analytics, combining all Nano, Lite, and Pro capabilities with organization-wide analytics, immutable audit logs, advanced team roles (`owner`, `admin`, `analyst`, `viewer`), SSRF-protected webhooks, scheduled reports, V2 Beta, and eligible Alpha access.

## Resource Limits & Entitlements

| Resource / Capability | Max Limit |
|---|---:|
| Monthly accepted events (account-wide) | 2,000,000 |
| Active projects | 25 |
| Verified origins per project | 50 |
| Team members per project | 25 |
| Raw event retention (UTC) | Up to 365 days |
| Dashboard auto-refresh | 5 seconds |
| API rate limit | 300/minute |
| Ingestion rate / burst | 250/s (burst 500) |
| Shared reports / UTC month | 500 |
| Shared report link expiry | Up to 365 days |
| V2 Beta (`v2_beta`) | Enabled |
| Alpha (`alpha`) | Eligible (per-flag & revocable) |

## Alpha Access & Experimental Flags

- `GET /api/v1/alpha/features` — lists eligible experimental flags (`alpha_funnel_explorer`, `alpha_anomaly_alerts`, `alpha_cohort_retention`) with unstable warnings.
- `PATCH /api/v1/alpha/flags/:flagKey` — toggles individual experimental flags per account.
- `POST /api/v1/alpha/experiments/:flagKey/run` — executes an enabled experiment and records usage in `public.alpha_feature_usage`.
- `POST /api/v1/alpha/revoke` — revokes Alpha access on the account without affecting V1 or V2 Beta.
- Pro, Lite, and Nano accounts receive `403 SURFACE_ACCESS_DENIED`.

## Organization-Wide Analytics & Audit Logs

- `GET /api/v1/analytics/organization` — aggregates authorized project metrics (`accountTotals`, `projectComparison`, `trafficTrends`, `countries`, `devices`, `browsers`, `sources`, `customEventsBreakdown`, `usageOverview`) with strict cross-account isolation.
- `GET /api/v1/audit-logs` — paginated, filterable (`action`, `target`, `startDate`, `endDate`) immutable audit trail. Sensitive keys (`password`, `token`, `secret`, `key_hash`, `signature`) are redacted before storage, and `PUT`/`PATCH`/`DELETE` mutations return `403 AUDIT_IMMUTABLE`.

## API Keys, Webhooks & Role Permissions

- **Roles**: `viewer` < `analyst` < `admin` < `owner`. Role changes (`PATCH /api/v1/projects/:id/members/:memberId/role`) forbid privilege escalation to `owner`.
- **API Keys**: `GET/POST /api/v1/projects/:id/api-keys`, `POST .../rotate`, `DELETE .../:keyId` (`key_hash` is never returned).
- **Webhooks**: `GET/POST /api/v1/projects/:id/webhooks`, `POST .../rotate-secret`, `POST .../test`, `GET .../deliveries`, `DELETE .../:webhookId`. Target URLs require `HTTPS` and block loopback, link-local metadata (`169.254.169.254`), and private RFC1918 ranges (SSRF protection). Payloads are signed with HMAC-SHA256 (`X-WebPulse-Signature`) and retried with exponential backoff.

## Database Migration

Apply [20261130000001_max_plan_entitlements.sql](../supabase/migrations/20261130000001_max_plan_entitlements.sql) in order after `20261128000001_nano_plan_entitlements.sql` and `20261129000001_lite_plan_entitlements.sql`.
