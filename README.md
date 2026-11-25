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

### Dashboard & Analytics Views
| Route | View Description |
| :--- | :--- |
| `/dashboard` | Executive KPI overview, traffic trends, and live visitor counter |
| `/dashboard/visitors` | Unique visitor counts, returning rates, and device breakdowns |
| `/dashboard/sessions` | Session duration metrics, entrance/exit pages, and bounce rates |
| `/dashboard/pages` | Top content, URL performance, and real-time pageview logs |
| `/dashboard/events` | Telemetry events summary and custom event frequency |
| `/dashboard/events/:name` | Granular drilldown for specific telemetry event triggers |
| `/dashboard/sources` | Acquisition channels, referrers, and campaign attribution |
| `/dashboard/geography` | 3D Visitor Network Globe and regional geographic metrics |
| `/dashboard/live` | Real-time live activity stream powered by WebSockets |
| `/dashboard/alerts` | Alert threshold rules, anomaly monitors, and notification logs |
| `/dashboard/projects` | Project directory, website switcher, and site configurations |
| `/dashboard/activity` | Workspace audit logs and administrator activity history |
| `/dashboard/api-key` | Project API key generation, revocation, and security tokens |
| `/dashboard/billing` | Subscription tiers, invoices, and payment receipts |
| `/dashboard/settings` | Sectioned workspace, account, and team settings hub |
| `/share/:shareToken` | Public, tokenized read-only analytics dashboard |

### Public & Marketing Views
| Route | Description |
| :--- | :--- |
| `/` | Landing page featuring Dark Data Observatory and interactive globe |
| `/features` | Platform feature breakdown and technical specifications |
| `/pricing` | Subscription plans with monthly/annual billing toggle |
| `/blog` | Product updates, engineering notes, and release logs |
| `/integrations` | Supported third-party integrations and CMS plugins |
| `/api` | Interactive API documentation with syntax highlighting |
| `/security` | Security architecture, compliance, and encryption standards |
| `/community` | Open-source community channels and contributor links |
| `/help` | Knowledge base, FAQs, and support center |
| `/docs` | Comprehensive technical documentation hub |

---

## API Overview

WebPulse Analytics organizes its REST endpoints into structured resources:

| Endpoint Base | Methods | Purpose |
| :--- | :--- | :--- |
| `/api/track` | `POST`, `GET` | Public tracking ingest, tracker script delivery, and live counts |
| `/api/v1/analytics` | `GET` | Dashboard summaries, time-series metrics, geo, and content stats |
| `/api/v1/auth` | `POST`, `GET` | User registration, login, logout, password reset, and Google OAuth |
| `/api/v1/projects` | `GET`, `POST`, `PUT`, `DELETE` | Workspace projects, tracking credentials, and share links |
| `/api/v1/users` | `GET`, `PUT` | Profile settings, notification preferences, and password updates |
| `/api/v1/plans` | `GET` | Available subscription tiers and resource quotas |
| `/api/v1/payment` | `POST` | Razorpay order creation, payment verification, and invoices |
| `/api/v1/notifications` | `GET`, `PUT`, `DELETE` | In-app user notifications and dispatch management |
| `/api/v1/usage` | `GET` | Current billing cycle event volume and plan quota consumption |

For complete request/response schemas, refer to the [API Reference](docs/api-reference.md).

---

## Project Structure

```
Web-Pulse-Analytics/
├── apps/
│   ├── marketing/            # Canonical Public Website (Landing, Docs, Pricing, Blog)
│   │   ├── public/           # Static assets, branding, and SVG illustrations
│   │   ├── src/
│   │   │   ├── components/   # Marketing & landing components (Hero, Features, Shell)
│   │   │   ├── pages/        # Public pages (Landing, Pricing, Features, Docs, Legal)
│   │   │   └── App.jsx
│   │   ├── package.json      # webpulse-marketing
│   │   └── vite.config.js
│   │
│   ├── v1/                   # Stable V1 Dashboard Application (Default Production)
│   │   ├── src/
│   │   │   ├── components/   # V1 project tabs, WorldMap, and modals
│   │   │   ├── pages/        # V1 dashboard, projects, billing, settings
│   │   │   └── App.jsx
│   │   ├── package.json      # webpulse-v1
│   │   └── vite.config.js
│   │
│   └── v2/                   # Beta V2 Dashboard Application (Beta Preview)
│       ├── src/
│       │   ├── components/   # V2 App Shell, modular UI kit, and settings
│       │   ├── pages/        # V2 metrics views (Visitors, Sessions, Events, Geo)
│       │   ├── styles/       # Design system tokens (theme.css, app.css)
│       │   └── App.jsx
│       ├── package.json      # webpulse-v2
│       └── vite.config.js
│
├── backend/                  # Node.js & Express 5 API Server
│   ├── src/
│   │   ├── config/           # Environment and third-party service configs
│   │   ├── controllers/      # Route request handlers
│   │   ├── middlewares/      # Auth, CORS, Helmet, Rate Limiter, CSRF
│   │   ├── routes/           # REST route definitions (v1 + track)
│   │   ├── services/         # Business logic (analytics, email, payments)
│   │   ├── socket/           # Socket.IO visitor streaming setup
│   │   └── utils/            # Shared utilities (crypto, IP, formatters)
│   └── package.json
├── supabase/                 # Supabase PostgreSQL Migrations (applied manually)
│   └── migrations/           # 7 Versioned SQL migration scripts
├── scripts/                  # Repository maintenance & verification scripts
├── docs/                     # Detailed architectural and user guides
├── .github/                  # CI/CD Workflows, security scans, and templates
├── package.json              # Convenience scripts (no root npm workspaces)
├── LICENSE                   # MIT License
└── README.md                 # Project documentation
```

---

## Documentation Directory

Deep dive into the architecture, deployment, and security of WebPulse Analytics:

- 📋 [Monorepo Migration Guide](docs/migration-monorepo.md) — Architecture mapping, verification results, and Vercel checklist.
- 📖 [Getting Started Guide](docs/getting-started.md) — Comprehensive local setup and configuration.
- 🏗️ [Architecture Deep Dive](docs/architecture.md) — System design, monorepo layout, and data pipelines.
- 🛡️ [Branch Protection Guide](docs/branch-protection.md) — Setup and ruleset configuration for `main`.
- 🔀 [Branching Strategy](docs/branching-strategy.md) — Branch topology, promotion lifecycle, and PR rules.
- 📡 [API Reference](docs/api-reference.md) — Full REST endpoint documentation and parameters.
- 🔍 [Tracking Guide](docs/tracking-guide.md) — Client integration, bot protection, and custom events.
- 💾 [Database Schema](docs/database-schema.md) — Supabase PostgreSQL schema, tables, and RPC functions.
- 🔒 [Security & Privacy](docs/security.md) — Hardening guide, CSP, RLS policies, and vulnerability reporting.
- 🚀 [Deployment Guide](docs/deployment.md) — Production setup for Vercel, Render, Railway, or VPS.
- 🛠️ [Troubleshooting](docs/troubleshooting.md) — Common operational issues and solutions.
- 🗺️ [Roadmap](docs/roadmap.md) — Project milestones and release planning.

---

## Security & Compliance

Security is a foundational pillar of WebPulse Analytics:
- **Strict Content Security Policy:** Dynamic CSP headers guarding against unauthorized scripts and connections.
- **Row Level Security (RLS):** Strict Supabase database policies preventing cross-tenant data leaks.
- **Automated Security Pipelines:** CodeQL static analysis, Gitleaks secret detection, and Dependabot automated vulnerability updates.
- **Private Disclosure:** If you uncover a security vulnerability, please review our [Security Policy](SECURITY.md) to report it privately.

---

## Contributing & Community

We warmly welcome contributions from the community!
- Check out [CONTRIBUTING.md](CONTRIBUTING.md) to get started.
- Review our [Code of Conduct](CODE_OF_CONDUCT.md) to maintain an inclusive environment.
- Browse issues labeled [`good first issue`](https://github.com/heyshreee/Web-Pulse-Analytics/labels/good%20first%20issue) to make your first contribution.

---

## License

This project is licensed under the **MIT License**.  
See the [LICENSE](LICENSE) file for the full license text.
