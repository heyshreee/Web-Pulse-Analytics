# Roadmap

Web Pulse Analytics roadmap, organized by release line. This reflects current
priorities: **stabilize V1 first**, keep **V2 UI work separate**.

- [Guiding principles](#guiding-principles)
- [V1 Stabilization (stable release)](#v1-stabilization-stable-release)
- [V2 UI (new interface)](#v2-ui-new-interface)
- [Future / nice-to-have](#future--nice-to-have)
- [How to influence the roadmap](#how-to-influence-the-roadmap)

## Guiding principles

1. **Stability > scope**: V1 must remain stable and safe for production use.
2. **Security first**: RLS, authZ/authN, tracking hardening, and dependency hygiene
   are non-negotiable.
3. **Isolate redesigns**: V2 UI work lives on `v2-ui` and never merges into V1
   stabilization branches.
4. **Small, reviewed changes**: Prefer additive, testable, well-documented PRs.
5. **No fake badges/data**: Everything in README/docs must reflect reality.

## V1 Stabilization (stable release)

Target: harden the existing implementation for a stable V1. Work against
`v1-stabilization` branch.

| Priority | Item | Status | Notes |
| --- | --- | --- | --- |
| P0 | **Test coverage baseline** — add minimal backend tests (unit + API) and wire into CI | Not started | Update `backend/package.json` test script; expand CI to run `npm test` |
| P0 | **Input validation hardening** — tighten payload validation for tracking (`/api/track`) | In progress | Strengthen `utils/validators.js`, reject unknown fields, length caps |
| P0 | **RLS audit** — verify policies cover all analytics tables and edge cases | Not started | Review migration 005; add regression tests/documentation |
| P1 | **Rate limiting tuning** — per-IP/project limits with distributed store | Not started | Replace in-memory store with Redis if horizontally scaling |
| P1 | **IP anonymization** — implement configurable IP truncation (GDPR) | Not started | Respect `project_settings.anonymize_ip`; truncate IPv4/IPv6 before geoip |
| P1 | **DNT support** — honor `respect_dnt` in tracker/ingest | Not started | Check `navigator.doNotTrack` in tracker or respect header server-side |
| P1 | **Error handling polish** — consistent error shapes, avoid leaking internals in prod | Not started | Ensure centralized handler returns safe messages |
| P2 | **Pagination everywhere** — analytics lists (pages, activity, events) | Not started | Add `limit/offset` or cursor pagination; update API reference |
| P2 | **Retention enforcement** — background job to purge old data | Not started | Use `retention_days` from `project_settings` |
| P2 | **Logging hygiene** — redact PII/secrets from logs | Not started | Audit controllers/middleware for log statements |

## V2 UI (new interface)

Target: modernized dashboard/marketing experience. Work against `v2-ui` branch.
Keep separate from V1.

| Priority | Item | Status | Notes |
| --- | --- | --- | --- |
| P0 | **Design system extraction** — shared tokens/components to reduce duplication | Not started | Extract glass/obs styles; unify public shell/footer |
| P1 | **Accessibility** — ARIA, keyboard nav, color contrast, focus states | Not started | Audit charts (Recharts), modals, dropdowns |
| P1 | **Performance** — code splitting, lazy routes, image optimization | Not started | Reduce bundle size; improve LCP on marketing pages |
| P2 | **Dark/light consistency** — theme coverage across all pages | Not started | Ensure marketing/docs respect theme or stay dark per product choice |
| P2 | **Responsive polish** — mobile layouts for tables/charts/globe | Not started | Geography globe + tables need mobile treatment |
| P2 | **Empty/loading states** — unify across pages | In progress | Some pages already use `EmptyState`/loading props |

## Future / nice-to-have

| Item | Notes |
| --- | --- |
| **Exports** — CSV/JSON export for analytics (pages, events, sessions) | Authenticated, respects project access |
| **Webhooks** — alert webhooks on threshold breaches | Integrate with alerts/`alert_events` |
| **Funnels** — conversion funnel tracking/visualization | Event sequence analysis |
| **UTM attribution** — parse/store UTM params from query strings | Enrich page views/events |
| **Bot filtering** — user-agent heuristics + known bot lists | Reduce noise in analytics |
| **API keys (service)** — scoped read/write keys for programmatic access | Separate from JWT/session auth |
| **Multi-region** — geo-replication considerations | If scaling globally |
| **OpenTelemetry** — tracing/metrics for backend | Observability |

## How to influence the roadmap

- **Open an issue** with the `feature` template and select the release line (`v1-stabilization` vs `v2-ui`).
- Use `good first issue`/`help wanted` if you're looking to contribute.
- Security items go through [SECURITY.md](../SECURITY.md), not public issues.
- For large changes, discuss scope before opening a PR (see [CONTRIBUTING.md](../CONTRIBUTING.md)).

This roadmap is a living document. Items may move between priorities as the project evolves.
