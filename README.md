<div align="center">
  <img src="apps/marketing/public/logo.png" alt="WebPulse Analytics Logo" width="160" />
  <h1>WebPulse Analytics</h1>
  <p>
    <strong>Privacy-first, real-time web analytics &amp; telemetry platform.</strong><br />
    Cookie-free edge ingestion, sub-second Socket.IO streams, monochrome dashboards, and Postgres storage.
  </p>

  <p>
    <a href="https://github.com/heyshreee/Web-Pulse-Analytics/releases"><img src="https://img.shields.io/badge/version-1.0.0-111111.svg?style=flat-square" alt="Version 1.0.0" /></a>
    <a href="https://github.com/heyshreee/Web-Pulse-Analytics/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/heyshreee/Web-Pulse-Analytics/ci.yml?branch=main&style=flat-square&label=CI" alt="CI Status" /></a>
    <a href="https://github.com/heyshreee/Web-Pulse-Analytics/actions/workflows/security.yml"><img src="https://img.shields.io/github/actions/workflow/status/heyshreee/Web-Pulse-Analytics/security.yml?branch=main&style=flat-square&label=Security" alt="Security Status" /></a>
    <a href="https://github.com/heyshreee/Web-Pulse-Analytics/actions/workflows/codeql.yml"><img src="https://img.shields.io/github/actions/workflow/status/heyshreee/Web-Pulse-Analytics/codeql.yml?branch=main&style=flat-square&label=CodeQL" alt="CodeQL" /></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-111111.svg?style=flat-square" alt="License MIT" /></a>
    <a href="https://github.com/heyshreee/Web-Pulse-Analytics/issues"><img src="https://img.shields.io/github/issues/heyshreee/Web-Pulse-Analytics?style=flat-square" alt="Open Issues" /></a>
  </p>

  <p>
    <a href="docs/getting-started.md">Documentation</a> ·
    <a href="docs/architecture.md">Architecture</a> ·
    <a href="docs/api-reference.md">API Reference</a> ·
    <a href="DESIGN.md">Design System</a> ·
    <a href="CONTRIBUTING.md">Contributing</a>
  </p>
</div>

> **Monorepo Architecture:** WebPulse Analytics organizes four independent Node.js packages under one repository (`apps/marketing`, `apps/v1`, `apps/v2`, and `backend/`). Each application maintains its own `package.json`, lockfile, and deployment target rather than root npm workspaces; root `package.json` provides convenience orchestration scripts across all packages.

---

## Table of Contents

- [Release Lines & Applications](#release-lines--applications)
- [Interfaces & Design Systems](#interfaces--design-systems)
- [Core Capabilities & Privacy Model](#core-capabilities--privacy-model)
- [Subscription Plans](#subscription-plans)
- [Architecture & Data Pipeline](#architecture--data-pipeline)
- [Technology Stack](#technology-stack)
- [Quick Start](#quick-start)
- [Tracking Script & Integration](#tracking-script--integration)
- [Application Route Map](#application-route-map)
- [API Overview](#api-overview)
- [Project Structure](#project-structure)
- [Documentation Directory](#documentation-directory)
- [Security & Compliance](#security--compliance)
- [Contributing & Community](#contributing--community)
- [License](#license)

---

## Release Lines & Applications

WebPulse isolates public marketing, stable production analytics, and beta console development so new telemetry views can iterate without destabilizing active workspaces.

| Surface | Directory | Production Host | Local Dev URL | Git Branch | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Marketing Site** | `apps/marketing` | `https://webpulseanalytics.tech` | `http://localhost:5174` | `development` / `main` | Public product site, interactive docs, pricing, and portal redirects |
| **Stable V1 Console** | `apps/v1` | `https://app.webpulseanalytics.tech` | `http://localhost:5173` | `development` / `main` | Default production dashboard, projects, billing, and settings |
| **Beta V2 Console** | `apps/v2` | `https://beta.webpulseanalytics.tech` | `http://localhost:5175` | `development` (`beta` planned) | Observatory V2 dashboard with 15+ views and 3D geography |
| **API & Socket Server** | `backend` | `https://api.webpulseanalytics.tech` | `http://localhost:3000` (`5000` fallback) | `development` / `main` | Express 5 REST API, tracking ingestion, and Socket.IO broadcasts |

- **Default Console Routing:** Marketing `/login`, `/register`, and `/dashboard/*` paths route to Stable V1 by default, while `/beta/*` aliases target V2 (`apps/marketing/src/utils/urls.js`).
- **Cross-Subdomain SSO:** Setting `COOKIE_DOMAIN=.webpulseanalytics.tech` shares `HttpOnly` JWT sessions across V1 and V2, restored seamlessly via `GET /api/v1/auth/me`.
- **Branch Topology:** `main` (protected production) and `development` (integration base) are active branches; a dedicated `beta` branch is pre-configured in CI/CD workflows (`.github/workflows/ci.yml`, `deploy-v2.yml`) for future isolation.

---

## Interfaces & Design Systems

- **Marketing & Shared Auth (`Editorial Noir`):** Built for `apps/marketing` and shared across `apps/v1` and `apps/v2` authentication screens (`AuthShell`, `EditorialGlobe`, `Toast`). Uses monochrome obsidian canvases (`#050505` / `#0A0A0A`), `1px` architectural hairlines, `Geist` + `Geist Mono` typography, and an interactive Three.js TopoJSON wireframe globe (`world-110m.json`) inside a `min-h-dvh` responsive card shell.
- **Stable V1 Console (`apps/v1`):** Production workspace console covering executive metrics, project onboarding, installation verification, share links, API keys, billing, and session management with synchronized View Transitions light/dark switching.
- **Beta V2 Observatory (`apps/v2`):** Follows the **v0 Playground Studio** specification in [DESIGN.md](DESIGN.md) — `#000000` canvas, `#0A0A0A` panels, `#222222` structural borders, `tabular-nums` monospace metrics, and expanded modules for live visitor streams, sessions, events, sources, alerts, and 3D geography.

Screenshot placeholders and capture naming conventions (`dashboard-v1.png`, `dashboard-v2.png`, `visitor-globe.png`) are documented in [docs/images/README.md](docs/images/README.md).

---
## Core Capabilities & Privacy Model

- **Real-Time Telemetry Streams:** WebSocket broadcasts via Socket.IO (`setupVisitorSocket`, `global.io`) push live visitor activity and KPI updates to active workspace rooms without polling.
- **Cookie-Free Client Collector:** The browser script (`~1.1 KB` uncompressed / `~540 B` gzipped) sets zero cookies, writes zero keys to `localStorage`, and injects zero third-party ad-network scripts.
- **Project-Scoped Origin Security:** Per-project `trackingCors` enforcement validates origin/referrer headers alongside `express-rate-limit` throttling and automated bot filtering (`isBot`).
- **3D & Regional Geography Views:** Server-side IP geolocation (`ipwho.is` with offline `geoip-lite` fallback) feeds an interactive Three.js 3D visitor globe and country-level breakdowns.
- **Custom Events & Unified Ingest:** Supports standard pageviews via `window.tracker` as well as custom event payloads and server-side REST ingestion (`/api/track/events` and `/api/track/:trackingId`).
- **Tokenized Public Share Links:** Generate, regenerate, or revoke read-only `/share/:shareToken` dashboards (`POST` / `DELETE /api/v1/projects/:id/share-token`) without exposing workspace credentials.
- **Workspace Governance & Security:** Revocable Postgres session tracking (`public.user_sessions`), `HttpOnly` JWT authentication, cross-subdomain SSO, CSRF validation, dynamic Helmet 8 CSP headers, and Supabase Row Level Security (`RLS`).
- **Billing & Alert Channels:** Razorpay order processing, payment verification, PDF invoice receipts (`pdfkit`) with Resend email dispatch, plus Telegram and Twilio alert integrations.

### Privacy & Telemetry Pipeline Boundaries

- **Visitor browser:** Zero cookies, zero `localStorage` persistence, and zero third-party tracking scripts on tracked customer sites.
- **Ingestion server:** Applies SHA-256 deduplication hit hashing (`IP + UserAgent + ProjectId`), bot heuristics, `ua-parser-js` browser/OS/device parsing, and IP geolocation (`ipwho.is` / `geoip-lite`) prior to persisting records in Supabase PostgreSQL. Configure project privacy settings (`anonymize_ip`, `respect_dnt`, `retention_days` in `public.project_settings`) according to your regional compliance requirements.

### Version 2.0 Observatory Highlights

- **v0 Playground Studio UI (`apps/v2`):** Rebuilt using the monochrome tokens defined in [DESIGN.md](DESIGN.md) (`#000000` canvas, `#0A0A0A` panels, `1px` borders, `tabular-nums` Geist Mono telemetry).
- **Backend-Only Data Normalization:** `apps/v2/src/lib/dataService.js` fetches metrics exclusively from `/api/v1/analytics/*` backed by Express + Supabase service-role queries, returning honest zeroes (`—` / `<0.1%`) with no synthetic fallback data.
- **Expanded Telemetry Views:** Adds dedicated views for Visitors, Sessions, Pages, Events, Event Drilldowns, Sources, 3D Geography, Live Activity, Alerts, Integrations, and Workspace Activity.

---

## Subscription Plans

Tier quotas enforced by `backend/src/services/usage.service.js`, `backend/src/controllers/payment.controller.js`, and `public.plans`:

| Tier | Pricing (INR / USD) | Monthly Events | Projects | Allowed Domains / Project | Retention | Refresh Interval | Access Highlights |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Nano** | `₹0` / `$0` | `10,000` | `1` | `1` | `7 days` | `60s` | Core analytics, basic REST API, V1 Stable console |
| **Lite** | `₹199` / `$2.49` | `100,000` | `3` | `3` | `30 days` | `15s` | Everything in Nano, CSV exports |
| **Pro** | `₹699` / `$8.99` | `1,000,000` | `10` | `10` | `90 days` | `5s` | Full API, live event logs, 3 team seats, **V2 Beta** access |
| **Max** | `₹1,999` / `$24.99` | `5,000,000` | `50` | `25` | `12 months` | `1s` | 10 seats, unlimited saved reports, **V2 Beta & Alpha** eligibility |
| **Enterprise** | `Custom` | `Negotiated` | `Custom` | `Custom` | `Custom` | `Dedicated (1s)` | RBAC, SSO integration, custom pipelines, contractual SLA |

---
## Architecture & Data Pipeline

WebPulse separates public marketing, console presentation, and telemetry ingestion into four independent runtime surfaces backed by Supabase PostgreSQL:

```text
Tracked Visitor Browsers
  └─ GET  /api/track/:id/script.js   (~1.1 KB raw / ~540 B gzip, zero cookies)
  └─ POST /api/track/:id             ──┐
  └─ POST /api/track/events          ──┤
                                       ▼
                           Express 5 API + Ingestion
  Marketing (apps/marketing) ──▶ Portals ──▶ /login, /register, /beta/*
  Stable V1 (apps/v1)        ◀── REST /api/v1/* + Socket.IO WS ◀──┤
  Beta V2   (apps/v2)        ◀── REST /api/v1/* + Socket.IO WS ◀──┤
                                       │
                        Bot Filter · Hit Hash · Geo (ipwho.is / geoip-lite) · UA Parse
                                       │
                                       ▼
                           Supabase PostgreSQL + RLS
```

1. **Collector & Ingest:** `GET /api/track/:trackingId/script.js` (or `/api/track/script.js`) delivers a lightweight script that collects page path, title, and referrer without touching cookies or `localStorage`. Events post to `POST /api/track/:trackingId` or `POST /api/track/events`.
2. **Validation & Enrichment:** `trackingCors` verifies project origins while `express-rate-limit` and `isBot` filter abusive or automated hits. `visitor.controller.js` computes deduplication hit hashes, parses user agents via `ua-parser-js`, and resolves location via `ipwho.is` with offline `geoip-lite` fallback.
3. **Persistence & Broadcast:** Ingestion writes normalized records across `visitors`, `sessions`, `page_views`, `events`, and `analytics_daily`, then emits live room updates over Socket.IO (`setupVisitorSocket`, validated by shared origin rules in `backend/src/config/origins.js`).
4. **Console API & SSO:** Both V1 and V2 query Express (`/api/v1/analytics/*`) rather than embedding privileged service credentials in the browser, sharing `HttpOnly` JWT sessions via `COOKIE_DOMAIN`.

> **Runtime Note:** Because the backend maintains persistent Socket.IO WebSocket connections, scheduled notification cleanup, and the local `geoip-lite` dataset, it runs as a long-lived Node.js service rather than a stateless serverless function. See [docs/deployment.md](docs/deployment.md).

---

## Technology Stack

### Frontend Applications (`apps/marketing`, `apps/v1`, `apps/v2`)

| Layer | Technologies |
| :--- | :--- |
| **Core Framework** | React `19.2`, Vite `7.2`, React Router `7.12` |
| **Design & Motion** | Tailwind CSS `3.4`, Editorial Noir & Playground Studio tokens (`Geist` / `Geist Mono`), Framer Motion `12.26` / `motion 13.1`, GSAP `3.15`, Lucide React |
| **Data & 3D Visualization** | Recharts `3.6`, Three.js `0.183` (`world-110m.json` wireframe globe), `react-globe.gl` `2.37`, Leaflet `1.9` + `react-leaflet` `5.0` |
| **Realtime & Client Auth** | `socket.io-client` `4.8`, `@react-oauth/google` `0.13`, `react-syntax-highlighter` |
| **Testing & Linting** | Vitest `5.1` (`apps/v1`, `apps/v2`), ESLint `9.39` |

### Backend Service (`backend/`) & Infrastructure

| Layer | Technologies |
| :--- | :--- |
| **Server & Realtime** | Node.js `20+` (`22 LTS` in CI), Express `5.2`, Socket.IO `4.8` |
| **Database & Schema** | `@supabase/supabase-js` `2.90`, PostgreSQL, versioned SQL RPCs & RLS policies (`supabase/migrations/`) |
| **Auth & Hardening** | `jsonwebtoken` `9.0`, `google-auth-library` `10.5`, `bcryptjs` `3.0`, Helmet `8.1`, `express-rate-limit` `8.2`, CSRF header checks |
| **Telemetry & Media** | `geoip-lite` `2.0`, `ipwho.is` lookup, `ua-parser-js` `2.0`, `pdfkit` `0.17`, Cloudinary `2.9` + `multer` `2.0` |
| **Billing, Alerts & CI** | Razorpay `2.9`, Resend `6.7`, Telegram / Twilio, `node --test`, CodeQL & Gitleaks workflows (`.github/workflows/`) |

---
## Quick Start

### Prerequisites

- **Node.js 20+** (Node `22 LTS` used in CI workflows) and **npm**
- A **Supabase** project (PostgreSQL database)
- Optional integrations (only needed for features that use them): Razorpay, Google OAuth, Resend, Cloudinary, Telegram, Twilio

### Installation

Each package maintains independent dependencies (no root npm workspaces):

```bash
git clone https://github.com/heyshreee/Web-Pulse-Analytics.git
cd Web-Pulse-Analytics

npm --prefix backend install
npm --prefix apps/marketing install
npm --prefix apps/v1 install
npm --prefix apps/v2 install
```

### Environment Setup

Copy the template environment files and fill in your credentials before starting any service:

```bash
cp backend/.env.example backend/.env
cp apps/marketing/.env.example apps/marketing/.env
cp apps/v1/.env.example apps/v1/.env
cp apps/v2/.env.example apps/v2/.env
```

- **Backend (`backend/.env`):** Configure `PORT=3000` (if `PORT` is omitted, `backend/src/config/env.js` falls back to `5000`; `.env.example` and Vite dev proxies default to `http://localhost:3000`), `JWT_SECRET`, `CSRF_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `FRONTEND_URL`, and comma-separated `FRONTEND_URLS`. Add `COOKIE_DOMAIN` in multi-subdomain production deployments for V1/V2 SSO.
- **Frontends (`apps/*/.env`):** Set `VITE_API_URL=http://localhost:3000/api`, `VITE_MARKETING_URL`, `VITE_V1_APP_URL` / `VITE_APP_URL`, `VITE_V2_APP_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, plus optional `VITE_SOCKET_URL`, `VITE_GOOGLE_CLIENT_ID`, and `VITE_RAZORPAY_KEY_ID`.

### Database Migrations

SQL migrations live in [`supabase/migrations/`](supabase/migrations/) and are never auto-applied by CI/CD. Apply all 8 files in order via the Supabase CLI (`supabase db push`) or the Supabase SQL Editor:

1. `20261001000001_core_schema.sql` — Profiles, projects, members, and project settings
2. `20261001000002_analytics_tables.sql` — Visitors, sessions, page views, events, and daily aggregates
3. `20261001000003_indexes.sql` — Query performance indexes
4. `20261001000004_analytics_functions.sql` — SQL analytics aggregation functions
5. `20261001000005_rls_security.sql` — Row Level Security (`RLS`) policies
6. `20261008000001_fix_security_and_performance_linter.sql` — Linter security and performance fixes
7. `20261020000001_user_sessions.sql` — Revocable server-side sessions (`public.user_sessions`)
8. `20261124000001_update_subscription_plans.sql` — Canonical `public.plans` seed (`nano` through `enterprise`)

Validate migration filenames and basic SQL hygiene offline with `node scripts/check-migrations.mjs`.

### Running Applications & Checks

Launch each service in its own terminal from the repository root:

```bash
# 1. Start the Backend API & Socket.IO server (http://localhost:3000)
npm run dev:backend

# 2. Start the Stable V1 Dashboard (http://localhost:5173 — Default Production)
npm run dev:v1

# 3. Start the Marketing Website (http://localhost:5174)
npm run dev:marketing

# 4. Start the Beta V2 Observatory Dashboard (http://localhost:5175)
npm run dev:v2
```

Run tests, linting, syntax validation, and production builds using root convenience scripts:

```bash
npm run check:backend   # Syntax check across backend/src
npm run test:backend    # Backend unit tests (node --test)
npm run test:v1         # Vitest suite for apps/v1
npm run test:v2         # Vitest suite for apps/v2
npm run test:all        # Run backend, V1, and V2 test suites
npm run lint:all        # ESLint across all three frontend apps
npm run build:all       # Production Vite builds for marketing, V1, and V2
```

---

## Tracking Script & Integration

### 1. Standard HTML Embed

Embed the cookie-free tracker SDK and initialize your project ID:

```html
<script src="https://api.webpulseanalytics.tech/api/track/script.js" defer></script>
<script>
  window.addEventListener('load', function () {
    window.tracker('init', 'YOUR_PROJECT_TRACKING_ID');
    window.tracker('track', 'page_view');
  });
</script>
```

You can also embed the project-scoped URL directly (`https://api.webpulseanalytics.tech/api/track/YOUR_PROJECT_TRACKING_ID/script.js`), which auto-initializes your tracking ID on load.

### 2. Custom Events & SPA Transitions

Fire custom events or manual SPA route transitions using `window.tracker`:

```javascript
if (typeof window.tracker === 'function') {
  window.tracker('track', 'checkout_completed', {
    plan: 'pro',
    value: 699
  });
}
```

### 3. REST API Ingestion

Record custom events or server-side pageviews over HTTP:

```http
POST /api/track/events HTTP/1.1
Host: YOUR_API_HOST
Content-Type: application/json
x-api-key: YOUR_PROJECT_TRACKING_ID

{
  "event": "checkout_completed",
  "url": "https://example.com/checkout/success",
  "referrer": "https://example.com/pricing",
  "metadata": {
    "currency": "INR",
    "amount": 699
  }
}
```

To record a pageview and receive the updated live count in one call:

```http
POST /api/track/YOUR_PROJECT_TRACKING_ID HTTP/1.1
Host: YOUR_API_HOST
Content-Type: application/json

{
  "pageUrl": "https://example.com/pricing",
  "title": "Pricing"
}
```

---
## Application Route Map

### Authentication & Shared Console Routes (`apps/v1` & `apps/v2`)

| Route | View Description | Scope |
| :--- | :--- | :--- |
| `/login`, `/register` | Editorial Noir monochrome authentication tabs with Three.js `EditorialGlobe` | V1 & V2 |
| `/verify-email`, `/forgot-password`, `/reset-password` | Email OTP verification and credential recovery flows | V1 & V2 |
| `/auth/google/callback` | Google OAuth session exchange handler | V1 & V2 |
| `/share/:shareToken` | Public, tokenized read-only analytics report | V1 & V2 |
| `/dashboard` | Executive KPI overview, traffic trends, and live visitor counter | V1 & V2 |
| `/dashboard/projects` | Project directory, site creation, and active project selection | V1 & V2 |
| `/dashboard/projects/:idOrName/:tab?` | Project overview, install snippet generator, verification, and settings | V1 & V2 |
| `/dashboard/activity`, `/dashboard/projects/:idOrName/activity` | Workspace and per-project activity audit logs | V1 & V2 |
| `/dashboard/api-key` | Tracking ID management and verification snippets | V1 & V2 |
| `/dashboard/billing` | Subscription tiers (`Nano`–`Enterprise`), Razorpay checkout, and invoices | V1 & V2 |
| `/dashboard/settings/:tab?` | Profile, security/sessions, notifications, and linked account settings | V1 & V2 |

### Extended Observatory Views (`apps/v2`)

| Route | View Description |
| :--- | :--- |
| `/dashboard/visitors` | Unique visitor counts, devices, browsers, and operating systems |
| `/dashboard/sessions` | Session duration, landing/exit pages, and bounce metrics |
| `/dashboard/pages` | Top paths, pageview rankings, and content breakdown |
| `/dashboard/events`, `/dashboard/events/:name` | Custom event frequency and per-event drilldowns |
| `/dashboard/sources` | Acquisition channels, referrers, and UTM campaign attribution |
| `/dashboard/geography` | Interactive 3D Visitor Network globe and regional distribution |
| `/dashboard/live` | Real-time Socket.IO visitor stream |
| `/dashboard/alerts` | Alert threshold rules, anomaly monitors, and notification logs |
| `/dashboard/integrations` | CMS, framework, and third-party alert integrations |

### Public & Marketing Views (`apps/marketing`)

| Route | Description |
| :--- | :--- |
| `/` | Landing page featuring live telemetry previews and platform architecture |
| `/features` | Capability breakdown and telemetry pipeline overview |
| `/pricing` | Subscription tiers (`Nano`, `Lite`, `Pro`, `Max`, `Enterprise`) |
| `/blog`, `/integrations`, `/api`, `/security` | Engineering notes, integration guides, API showcase, and security overview |
| `/community`, `/help`, `/privacy`, `/terms`, `/cookies` | Open-source community, FAQ/support, and legal policies |
| `/docs/*` | Multi-section technical documentation rail |
| `/login`, `/register`, `/dashboard/*`, `/v1/*` | Canonical redirects to Stable V1 console (`apps/v1`) |
| `/beta/*` | Redirects to Beta V2 Observatory (`apps/v2`) |

---

## API Overview

WebPulse exposes tracking ingestion at `/api/track` and authenticated console endpoints under `/api/v1`:

| Endpoint Base | Methods | Purpose |
| :--- | :--- | :--- |
| `/` | `GET` | Service health banner (`WebPulse Analytics API is running...`) |
| `/api/track` | `GET`, `POST`, `OPTIONS` | Tracker script delivery (`script.js`), event ingest (`/events`), and visitor counts (`/:trackingId`) |
| `/api/v1/auth` | `POST`, `GET` | Registration, login, logout, session restore (`/me`), email OTP, password reset, and Google OAuth |
| `/api/v1/analytics` | `GET` | Live counts (`/count`), workspace overview, per-project traffic, pages, and activity metrics |
| `/api/v1/projects` | `GET`, `POST`, `PUT`, `DELETE` | Project CRUD, settings, pinning, installation verification, and `/share/:shareToken` |
| `/api/v1/user` | `GET`, `PUT`, `POST`, `DELETE` | Profile updates, avatar uploads, passwords, active sessions, notifications, and Telegram linking |
| `/api/v1/payment` | `GET`, `POST` | Subscription catalog (`/plans`), Razorpay orders, verification, receipts, history, and downgrades |
| `/api/v1/usage` | `GET` | Monthly event quota usage for the current billing cycle |
| `/api/v1/notifications` | `GET`, `PUT`, `DELETE` | In-app notifications and read-state management |
| `/api/v1/activity` | `GET` | Workspace and project audit history |
| `/api/v1/meta` | `GET`, `POST` | Service metadata and contact form submissions |

Complete request and response contracts are documented in [docs/api-reference.md](docs/api-reference.md).

---

## Project Structure

```text
Web-Pulse-Analytics/
├── apps/
│   ├── marketing/            # Public Editorial Noir website (Landing, Docs, Pricing, Blog)
│   │   ├── public/           # Static branding assets, SVG illustrations, and sitemap
│   │   ├── src/
│   │   │   ├── components/   # Marketing layout, ErrorBoundary, interactive previews
│   │   │   ├── data/         # Canonical tier definitions (plans.js), docs, blog data
│   │   │   ├── pages/        # Landing, Pricing, Features, API, Docs, Legal pages
│   │   │   └── App.jsx
│   │   ├── package.json      # webpulse-marketing
│   │   └── vite.config.js
│   │
│   ├── v1/                   # Stable V1 Console (Default Production, :5173)
│   │   ├── src/
│   │   │   ├── components/   # AuthShell, EditorialGlobe, project tabs, Toast, WorldMap
│   │   │   ├── pages/        # Dashboard, Projects, ProjectDetail, Billing, Settings, Auth
│   │   │   └── App.jsx
│   │   ├── test/             # Vitest test suite
│   │   ├── package.json      # webpulse-v1
│   │   └── vite.config.js
│   │
│   └── v2/                   # Beta V2 Observatory Dashboard (:5175)
│       ├── src/
│       │   ├── components/   # Studio App Shell, AuthShell, EditorialGlobe, UI kit
│       │   ├── lib/          # Backend dataService normalization & formatting helpers
│       │   ├── pages/        # 15+ analytics modules (Visitors, Sessions, Events, Geo, Live)
│       │   ├── styles/       # Playground Studio design tokens
│       │   └── App.jsx
│       ├── test/             # Vitest test suite
│       ├── package.json      # webpulse-v2
│       └── vite.config.js
│
├── backend/                  # Long-lived Node.js & Express 5 API + Socket.IO Server
│   ├── src/
│   │   ├── config/           # env validation, origins allowlist, Supabase, Razorpay
│   │   ├── controllers/      # auth, visitor, project, user, payment, notification, activity
│   │   ├── errors/           # Structured AppError classes
│   │   ├── middlewares/      # JWT auth, CSRF, Helmet, trackingCors, rateLimiter, errorHandler
│   │   ├── routes/v1/        # Versioned v1 REST routers + public /api/track router
│   │   ├── services/         # Analytics, email, receipts, plans, usage, activity, notifications
│   │   ├── socket/           # Socket.IO visitor streaming setup
│   │   └── utils/            # Crypto, validators, IP normalization, formatters
│   └── package.json
├── supabase/
│   └── migrations/           # 8 ordered SQL schema, function, RLS, session, and plan migrations
├── scripts/                  # Maintenance checks (check-migrations.mjs, check-syntax.mjs)
├── docs/                     # Architecture, API, database, security, deployment, and QA docs
├── .github/                  # CI/CD workflows, CodeQL, Gitleaks, Dependabot, templates
├── DESIGN.md                 # v0 Playground Studio design specification (apps/v2)
├── CHANGELOG.md              # Release notes and version history
├── CONTRIBUTING.md           # Contribution workflow and local setup rules
├── SECURITY.md               # Vulnerability disclosure and threat boundaries
├── CODE_OF_CONDUCT.md        # Community conduct standards
├── package.json              # Root convenience scripts (no root npm workspaces)
├── LICENSE                   # MIT License
└── README.md                 # Project overview
```

---

## Documentation Directory

- [Getting Started Guide](docs/getting-started.md) — End-to-end local setup and environment configuration
- [Architecture Deep Dive](docs/architecture.md) — System boundaries, Socket.IO real-time design, and data flows
- [API Reference](docs/api-reference.md) — Public tracking and authenticated `/api/v1` endpoint contracts
- [Tracking Guide](docs/tracking-guide.md) — Collector script installation, custom events, and origin rules
- [Database Schema](docs/database-schema.md) — Supabase PostgreSQL tables, SQL functions, and RLS policies
- [Monorepo Migration Guide](docs/migration-monorepo.md) — App isolation mapping and production domain routing
- [Design System](DESIGN.md) — v0 Playground Studio tokens, typography, and layout architecture
- [Security & Privacy](docs/security.md) — Hardening controls, CSP, session revocation, and secret handling
- [Deployment Guide](docs/deployment.md) — Deploying Express + Socket.IO and static Vite SPAs
- [Branching Strategy](docs/branching-strategy.md) — Branch topology and PR promotion lifecycle
- [Branch Protection Guide](docs/branch-protection.md) — Ruleset configuration for `main`
- [Troubleshooting](docs/troubleshooting.md) — Common setup and runtime fixes
- [Roadmap](docs/roadmap.md) — Planned milestones and platform improvements
- [Changelog](CHANGELOG.md) — Versioned history following Keep a Changelog

---

## Security & Compliance

- **Dynamic Content Security Policy:** Helmet 8 dynamically scopes allowed Supabase, map tile, Google OAuth, and WebSocket origins based on environment configuration (`backend/src/app.js`).
- **Row Level Security & Revocable Sessions:** PostgreSQL policies enforce tenant isolation in Supabase alongside server-side revocable `public.user_sessions` and `X-Requested-With` CSRF protection.
- **Automated Static & Secret Scanning:** `.github/workflows/` runs ESLint, Vite builds, Node syntax checks, offline SQL migration checks, CodeQL (`codeql.yml`), Gitleaks (`security.yml`), and Dependency Review (`dependency-review.yml`).
- **Responsible Disclosure:** Review [SECURITY.md](SECURITY.md) before reporting security vulnerabilities privately.

---

## Contributing & Community

Contributions are welcome via small, well-tested pull requests targeting `development`:

- Read [CONTRIBUTING.md](CONTRIBUTING.md) for local checks and commit conventions.
- Follow the [Code of Conduct](CODE_OF_CONDUCT.md).
- Browse [`good first issue`](https://github.com/heyshreee/Web-Pulse-Analytics/labels/good%20first%20issue) issues or open a bug/feature template under `.github/`.

---

## License

Licensed under the **MIT License**. See [LICENSE](LICENSE) for full terms.
