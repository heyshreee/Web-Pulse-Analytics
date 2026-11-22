# Pull Request: `development` -> `main`

**Title:**
```text
feat(v1): WebPulse v0 Stark Monochrome Studio redesign, 3D live globe, and platform hardening
```

---

## PR Description Body

```markdown
## Summary

Promotes all stable V1 dashboard features, design system overhaul, and bug fixes from `development` to `main`. This release implements the stark monochrome **v0 Playground Studio** design system (`DESIGN.md`), introduces a persistent 3D interactive telemetry globe with emerald pulse tracking, unifies workspace layouts across all views, eliminates Recharts negative dimension warnings, and hardens settings and Dependabot configuration.

## Linked Issue / Reference

Ref: Implementation plan `dashboard_hardening_plan.md` & `DESIGN.md` specification.

## Area

- [x] Stable V1 dashboard (`apps/v1`)
- [ ] Beta V2 dashboard (`apps/v2`)
- [ ] Marketing site (`apps/marketing`)
- [ ] Backend API (`backend/src`)
- [ ] Tracking ingestion (`backend/src/controllers/visitor.controller.js`, `routes/v1/track.routes.js`)
- [ ] Real-time (`Socket.IO`)
- [ ] Database / Supabase (`supabase/migrations`)
- [x] Tooling, CI, or Documentation (`.github`, `docs/`, `scripts/`)

## Release Line / Target

- [ ] `development` (Standard integration branch)
- [x] `main` (Production release branch — requires owner review)
- [ ] `beta` (Planned V2 preview track)

## What Changed

### 1. Stark Monochrome Studio Design System (`DESIGN.md`)
- Migrated all primary V1 dashboard views from legacy violet/purple styling to the stark monochrome **v0 Studio** design system:
  - Canvas: Pitch-black `#000000` with recessed `#0a0a0a` panel surfaces and `1px` architectural `#222222` hairlines.
  - Accent & Contrast: Pure white (`#ffffff`) primary actions with functional emerald (`#10b981`) live status indicators.
  - Tabular Precision: Fixed layout jitter by enforcing `font-variant-numeric: tabular-nums` and `Geist Mono` across all metric counters, timestamps, and axis ticks.
  - Standardized `.wp-panel`, `.wp-title-page`, `.wp-title-card`, `.wp-metric-mono`, and `.wp-studio-canvas` dot-matrix workspace across all views.

### 2. Live Geography 3D Interactive Studio Globe
- Implemented persistent 3D interactive globe (`NetworkGlobe.jsx`) that renders continuously in the Live Geography workspace.
- Refactored Three.js materials to studio tokens: silver dot-matrix continents (`0xededed` / `0x525252`), architectural `#222222` wireframe hairlines, and functional `#10b981` emerald nodes with traveling light pulses.
- Added smooth drag-to-rotate, studio zoom controls (`+` / `−`), hover tooltips with route metadata, and a minimizable floating "Ready to stream" glass card when active visitors are 0.

### 3. All Views Harmonized to Studio Layout
- **Dashboard (`Dashboard.jsx`)**: 4-column unified KPI strip (`82px`), split 7/5 workspace (Traffic Momentum + Live Geography), and single-line studio footer with live operational badge.
- **Project Detail (`ProjectDetail.jsx`)**: Added matching 4-column KPI strip, live activity feed, ingress sources breakdown, and unified segmented pill controls across Overview, Analytics, Integration, and Settings tabs.
- **Projects Directory (`Projects.jsx`)**: Studio project cards with health dots, domain tags, quick metrics, and copyable tracking IDs.
- **Activity Log (`ActivityLog.jsx`)**: High-density telemetric feed with monospace timestamps, device pills, and country flags.
- **API Keys (`APIKeys.jsx`)**: Scoped token management with masked secrets, copy feedback, and revocation flows.
- **Billing & Subscriptions (`Billing.jsx`)**: Fixed plan cards text overflow, structured pricing tiers, quota consumption meters, and invoice history table.
- **Account Settings (`Settings.jsx`)**: Overhauled all 7 preference sections (Profile, Security, Notifications, Usage & Quota, Projects & Teams, Billing & Invoices, Linked Accounts) with `.wp-panel` and studio typography.

### 4. Skeleton Loaders & Layout Hardening
- Replaced mismatched full-page spinners with scoped, architectural skeleton loaders across `Dashboard.jsx`, `ProjectDetail.jsx`, `Billing.jsx`, and `Layout.jsx` sidebar.
- Added `minWidth={0}` and fallback `minHeight` to all Recharts `ResponsiveContainer` instances (`Dashboard.jsx`, `TrafficTrendsChart.jsx`, `AnalyticsTab.jsx`, `ShareReport.jsx`), permanently resolving negative dimension warnings.
- Fixed `Notifications.jsx` syntax duplication and converted notification bell/flyout to studio design system.
- Hardened `NotificationsSection` in `Settings.jsx` with `parseSafePreferences` to prevent crashes on null/stringified database values.

### 5. CI & Tooling
- Configured `.github/dependabot.yml` with `open-pull-requests-limit: 0` and wildcard major update ignore rules to prevent automated PR spam while maintaining security checks.

## Test Evidence (Required)

### Automated Test Runs
- [x] `npm run check:backend` (Syntax check across backend/src: 56 files passed)
- [x] `npm run test:v1` (Vitest smoke tests passed)
- [x] `npm run lint:v1` (ESLint: 0 errors)
- [x] `npm run build:v1` (Vite production build: passed in 23.98s)

### Test Output / Verification Evidence

```text
> webpulse-analytics-monorepo@1.0.0 check:backend
> node scripts/check-syntax.mjs backend/src
Syntax check passed for 56 files.

> webpulse-analytics-monorepo@1.0.0 test:v1
> npm --prefix apps/v1 test
 ✓ test/smoke.test.js (1 test) 8ms
 Test Files  1 passed (1)
      Tests  1 passed (1)

> webpulse-v1@1.0.0 lint
> eslint .
✖ 14 problems (0 errors, 14 warnings)

> webpulse-v1@1.0.0 build
> vite build
✓ 3656 modules transformed.
dist/index.html                            3.08 kB │ gzip:   0.99 kB
dist/assets/index-DIihXka3.css            80.16 kB │ gzip:  18.92 kB
dist/assets/Dashboard-CGS8ohNt.js        570.95 kB │ gzip: 144.58 kB
✓ built in 23.98s
```

## Migrations / Database

- [x] This PR does **not** include database migrations

## Security & Privacy Checklist

- [x] No secrets, `.env` files, API keys, tokens, or credentials are committed
- [x] No real visitor data, raw IP addresses, or production PII are included
- [x] Authentication, authorization, and rate limits are preserved or tightened
- [x] Input validation is enforced on public endpoints
- [x] No required CI checks are disabled or bypassed with `continue-on-error`
```
