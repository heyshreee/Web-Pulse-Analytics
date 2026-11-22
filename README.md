# WebPulse Analytics

<p align="center">
  <img src="apps/marketing/public/logo.png" alt="WebPulse Analytics Logo" width="80" height="80" />
</p>

<h3 align="center">Privacy-Friendly Real-Time Web Telemetry & Analytics Platform</h3>

<p align="center">
  A high-performance web analytics platform engineered for modern web applications.<br />
  Track live visitors, page performance, and custom telemetry events with zero hassle.
</p>

<p align="center">
  <a href="https://github.com/heyshreee/Web-Pulse-Analytics/releases"><img src="https://img.shields.io/badge/version-1.0.0-blue.svg?style=flat-square" alt="Version 1.0.0" /></a>
  <a href="https://github.com/heyshreee/Web-Pulse-Analytics/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/heyshreee/Web-Pulse-Analytics/ci.yml?branch=main&style=flat-square&label=CI" alt="CI Status" /></a>
  <a href="https://github.com/heyshreee/Web-Pulse-Analytics/actions/workflows/security.yml"><img src="https://img.shields.io/github/actions/workflow/status/heyshreee/Web-Pulse-Analytics/security.yml?branch=main&style=flat-square&label=Security" alt="Security Status" /></a>
  <a href="https://github.com/heyshreee/Web-Pulse-Analytics/actions/workflows/codeql.yml"><img src="https://img.shields.io/github/actions/workflow/status/heyshreee/Web-Pulse-Analytics/codeql.yml?branch=main&style=flat-square&label=CodeQL" alt="CodeQL" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-green.svg?style=flat-square" alt="License MIT" /></a>
  <a href="https://github.com/heyshreee/Web-Pulse-Analytics/issues"><img src="https://img.shields.io/github/issues/heyshreee/Web-Pulse-Analytics?style=flat-square" alt="Open Issues" /></a>
</p>

---

> [!NOTE]
> **Monorepo Architecture & Release Tracks:**  
> The repository is structured as an independent multi-package monorepo containing the public marketing site (`apps/marketing`), the **default stable production dashboard** (`apps/v1`), the **beta preview dashboard** (`apps/v2`), and the centralized API server (`backend/`).  
> Each application installs and builds with its own `package.json` (no root npm workspaces). The backend is a persistent Node.js service (Express 5, WebSockets, `geoip-lite`) and must not be hosted on serverless functions. See the [Monorepo Migration Guide](docs/migration-monorepo.md) and [Deployment Guide](docs/deployment.md).

---

## Table of Contents

- [Dashboard Release Lines (V1 vs. V2)](#dashboard-release-lines-v1-vs-v2)
- [Screenshots](#screenshots)
- [Key Features](#key-features)
- [What's New in Version 2.0 (Beta Track)](#whats-new-in-version-20-beta-track)
- [Architecture & Data Strategy](#architecture--data-strategy)
- [Technology Stack](#technology-stack)
- [Quick Start](#quick-start)
  - [Prerequisites](#prerequisites)
  - [Environment Setup](#environment-setup)
  - [Database Migrations](#database-migrations)
  - [Running Applications](#running-applications)
- [Tracking Script & Integration](#tracking-script--integration)
  - [HTML Snippet](#1-standard-html-embed)
  - [Custom Event Telemetry](#2-custom-event-telemetry)
  - [REST Ingestion](#3-rest-api-ingestion)
- [Application Route Map](#application-route-map)
- [API Overview](#api-overview)
- [Project Structure](#project-structure)
- [Documentation Directory](#documentation-directory)
- [Security & Compliance](#security--compliance)
- [Contributing & Community](#contributing--community)
- [License](#license)

---

## Dashboard Release Lines (V1 vs. V2)

WebPulse Analytics maintains two distinct dashboard implementations to preserve production stability while advancing a next-generation UI:

| Application | Track | Production URL | Local Port | Status & Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Stable V1 Dashboard** (`apps/v1`) | `main` | `https://app.webpulseanalytics.tech` | `5173` | **Default Stable Production**. Hardened analytics interface with core metric cards, live counters, projects switcher, settings, and billing. |
| **Beta V2 Dashboard** (`apps/v2`) | `beta` | `https://beta.webpulseanalytics.tech` | `5175` | **Active Beta Preview**. Redesigned Dark Data Observatory UI featuring 3D Three.js visitor globe, modular primitives, and 15+ specialized views. |
| **Marketing Site** (`apps/marketing`) | `main` | `https://webpulseanalytics.tech` | `5174` | Canonical public landing page, pricing, documentation, and blog. |
| **Backend API** (`backend`) | `main` | `https://api.webpulseanalytics.tech` | `3000` | Express 5 persistent service with Socket.IO streaming, rate limiting, and Supabase integration. |

---

## Screenshots

> [!NOTE]
> **TODO(owner)**: Supply updated production screenshots for the stable V1 dashboard and beta V2 dashboard to `docs/images/`.

| Stable V1 Dashboard (Production Default) | Beta V2 Observatory (Beta Preview) |
| :---: | :---: |
| ![Stable V1 Dashboard](docs/images/dashboard-v1.png) | ![Beta V2 Dashboard](docs/images/dashboard-v2.png) |
| *Stable production dashboard (`apps/v1`)* | *Next-generation 3D observatory (`apps/v2`)* |

---

## Key Features

- ⚡ **Real-Time Visitor Streaming**: Live telemetry and active visitor counts streamed via Socket.IO directly to your dashboard.
- 🌐 **3D Geospatial Visualizations**: Interactive WebGL visitor globe and high-definition Leaflet maps for granular geographic distribution.
- 🎯 **Custom Event Telemetry**: Track interactions, conversions, button clicks, and custom metadata with flexible JSONB payloads.
- 📊 **Content & Page Performance**: Monitor real-time pageviews, bounce rates, visit durations, entrance/exit paths, and scroll depth.
- 🧭 **Attribution & Source Breakdown**: Automatic tracking of search engines, social referrals, direct traffic, and campaign channels.
- 🛡️ **Privacy & Compliance**: Cookieless tracking options, hashed IP addresses, and respect for Do Not Track (DNT) headers.
- 🏢 **Multi-Project Management**: Manage multiple websites and apps under a single workspace with per-project tracking IDs and settings.
- 🔔 **Multi-Channel Alerting**: Instant threshold triggers and notifications dispatched via Transactional Email (Resend) and Telegram bots.
- 🔗 **Shareable Public Reports**: Generate secured, read-only dashboard tokens to share real-time metrics with clients and stakeholders.
- 💳 **Billing & Quota Management**: Built-in subscription tiers, usage limits, and Razorpay payment integration.

---

## What's New in Version 2.0 (Beta Track)

The v2 track introduces modern visual and computational capabilities being tested for future promotion to default production:

| Module | Version 2.0 Capabilities |
| :--- | :--- |
| **Design System** | **Dark Data Observatory**: Semantic CSS tokens (`theme.css`), smooth dark/light mode switching using the native browser **View Transitions API**, and refined typography. |
| **Interactive Globe** | **3D Visitor Network**: WebGL/Three.js interactive globe powered by `react-globe.gl` with centroid country mapping, drag-to-rotate, and live telemetry arcs. |
| **UI Component Kit** | Accessible primitives under `src/components/ui/` (`Icon`, `Button`, `Card`, `DataTable`, `Field`, `Display`, `Overlay`, `Blocks`, `Charts`, `State`, `Nav`, `Page`). |
| **Dashboard Suite** | **15+ Dedicated Views**: Visitors, Sessions, Pages, Custom Events & Drilldowns, Traffic Sources, Geography, Real-Time Activity, Threshold Alerts, Audit Logs, and Shareable Reports. |
| **Supabase Analytics Engine** | PostgreSQL schema with **11 high-performance RPC aggregation functions**, composite B-tree indexes, partition-ready timestamp keys, and strict Row Level Security (RLS). |
| **Resilient Data Strategy** | Dual-source pipeline in `src/lib/dataService.js`: Direct Supabase PostgREST/RPC queries with automated Express 5 API fallback. |
| **Zero-Flash Preloader** | Inlined SVG pulsing emblem in `index.html` with shimmer progress track eliminates blank flashes during asset loading. |
| **Security Hardening** | Content Security Policy (CSP) for Supabase REST & WebSockets, Leaflet tile providers, rate limiting, and hashed API keys. |

---

## Architecture & Data Strategy

WebPulse Analytics utilizes an optimized dual-path data flow engineered for sub-second dashboards and high resilience:

```
[ Tracked Websites ]
         │ (HTTP POST /api/track)
         ▼
 ┌──────────────────────────────────────────────┐
 │             Express 5 Backend                │
 │  - Rate Limiter & Helmet CSP                │
 │  - Geolocation (geoip-lite) & User-Agent    │
 │  - Socket.IO Gateway Server                 │
 └──────┬────────────────────────────────┬──────┘
        │                                │ (Live WebSocket Events)
        ▼                                ▼
 ┌──────────────────────┐      ┌──────────────────────┐
 │   Supabase Postgres   │◄────┤  React Dashboard     │
 │  - Core Tables       │      │  (Dual Data Service) │
 │  - 11 Analytics RPCs │      │  - Supabase Primary  │
 │  - RLS Security      │      │  - Express Fallback  │
 └──────────────────────┘      └──────────────────────┘
```

1. **Ingestion Layer:** Public endpoints (`/api/track/:trackingId` and `/api/track/events`) parse incoming pings, extract geo/device telemetry, and persist records to Supabase.
2. **Real-Time Stream:** Live events are broadcast via `Socket.IO` rooms scoped by project ID, triggering instantaneous dashboard metric increments.
3. **Analytics Layer:** The frontend queries high-speed SQL RPC functions directly via Supabase PostgREST. If permissions or network constraints require, `dataService.js` transparently falls back to the backend API.

---

## Technology Stack

### Frontend Applications
- **Framework:** [React 19](https://react.dev/) + [Vite 7](https://vitejs.dev/)
- **Routing:** [React Router 7](https://reactrouter.com/)
- **Styling:** [Tailwind CSS 3](https://tailwindcss.com/) + Custom CSS Design System (`theme.css`, `app.css`)
- **Visualizations:** [Recharts 3](https://recharts.org/), [react-globe.gl](https://globe.gl/) (Three.js), [Leaflet](https://leafletjs.com/)
- **Animations:** [Framer Motion 12](https://motion.dev/), [GSAP](https://gsap.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Real-Time:** [Socket.IO Client 4](https://socket.io/)
- **Database Client:** [@supabase/supabase-js 2](https://supabase.com/docs/reference/javascript)

### Backend Service
- **Runtime:** [Node.js 22 LTS](https://nodejs.org/)
- **Web Framework:** [Express 5](https://expressjs.com/)
- **Real-Time Server:** [Socket.IO 4](https://socket.io/)
- **Authentication:** JWT, [Google Auth Library](https://github.com/googleapis/google-auth-library-nodejs), bcryptjs
- **Telemetry Parsers:** [geoip-lite](https://github.com/bluesmoon/node-geoip), [ua-parser-js](https://github.com/faisalman/ua-parser-js)
- **Security Middleware:** [Helmet 8](https://helmetjs.github.io/), [express-rate-limit](https://github.com/express-rate-limit/express-rate-limit), CORS, cookie-parser
- **Notifications & Billing:** [Resend](https://resend.com/), [Razorpay](https://razorpay.com/), Cloudinary, PDFKit

### Database & Storage
- **Database:** [Supabase PostgreSQL 15+](https://supabase.com/)
- **Analytics Functions:** 11 Custom PL/pgSQL RPC procedures (`supabase/migrations/`)
- **Security:** Row Level Security (RLS) policies with multi-tenant isolation

---

## Quick Start

### Prerequisites
- **Node.js:** v20.0.0 or higher (v22 LTS recommended)
- **npm:** v10 or higher
- **Supabase Account:** A Supabase project for PostgreSQL data storage

### Environment Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/heyshreee/Web-Pulse-Analytics.git
   cd Web-Pulse-Analytics
   ```

2. **Configure Backend Environment:**
   ```bash
   cd backend
   cp .env.example .env
   ```
   Edit `backend/.env` with your credentials (see `backend/.env.example` for all options):
   ```env
   PORT=3000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   FRONTEND_URLS=http://localhost:5173,http://localhost:5174,http://localhost:5175
   BACKEND_URL=http://localhost:3000
   JWT_SECRET=your_jwt_secret_key
   CSRF_SECRET=your_csrf_secret_key
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_KEY=your_supabase_service_role_key
   ```

3. **Configure Frontend Environments:**
   Configure environment files for the applications you want to run:
   ```bash
   # From the repository root:

   # Marketing site
   cp apps/marketing/.env.example apps/marketing/.env

   # Stable V1 Dashboard (Default Production)
   cp apps/v1/.env.example apps/v1/.env

   # Beta V2 Dashboard (Beta Track)
   cp apps/v2/.env.example apps/v2/.env
   ```

   Each frontend application `.env` exposes variables starting with `VITE_`:
   ```env
   VITE_API_URL=http://localhost:3000/api
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   `VITE_API_URL` defaults to `http://localhost:3000/api`. Vite's development proxy will forward `/api` and `/api/track` requests to the local backend running on port `3000`.

### Database Migrations

Apply the versioned SQL migrations in `supabase/migrations/` to your Supabase project in sequential order:

```bash
# Using Supabase CLI:
supabase db push

# Alternatively, execute the SQL files in the Supabase SQL Editor:
# 1. 20261001000001_core_schema.sql
# 2. 20261001000002_analytics_tables.sql
# 3. 20261001000003_indexes.sql
# 4. 20261001000004_analytics_functions.sql
# 5. 20261001000005_rls_security.sql
# 6. 20261008000001_fix_security_and_performance_linter.sql
# 7. 20261020000001_user_sessions.sql
```

> **Note:** Database migrations are never executed automatically by CI/CD workflows to prevent accidental production schema drift.

### Running Applications

The root `package.json` includes convenience scripts to run each application on its designated port:

```bash
# 1. Start the Backend API server (http://localhost:3000)
npm run dev:backend

# 2. Start the Stable V1 Dashboard (http://localhost:5173 - Default Production)
npm run dev:v1

# 3. Start the Beta V2 Dashboard (http://localhost:5175 - Beta Track)
npm run dev:v2

# 4. Start the Marketing Website (http://localhost:5174)
npm run dev:marketing
```

To build all frontend applications for production:
```bash
npm run build:all
```
Or build individually:
```bash
npm run build:marketing
npm run build:v1
npm run build:v2
```

---

## Tracking Script & Integration

WebPulse Analytics provides a lightweight client tracker that can be embedded into any web property.

### 1. Standard HTML Embed
Add the following snippet before the closing `</head>` tag on your website:

```html
<!-- WebPulse Analytics Tracker -->
<script
  defer
  src="https://YOUR_API_HOST/api/track/script.js"
  data-site="YOUR_PROJECT_TRACKING_ID">
</script>
```

*(For local testing, replace `https://YOUR_API_HOST` with `http://localhost:3000`)*.

### 2. Custom Event Telemetry
Send custom interaction events from your application code:

```javascript
// Track button clicks, conversions, or signups
if (window.webpulse) {
  window.webpulse('track', 'button_click', {
    button_name: 'upgrade_cta',
    plan_tier: 'pro_annual',
    value: 120
  });
}
```

### 3. REST API Ingestion
You can also record events server-side using standard HTTP requests:

```http
POST /api/track/events HTTP/1.1
Host: YOUR_API_HOST
Content-Type: application/json

{
  "trackingId": "YOUR_PROJECT_TRACKING_ID",
  "eventName": "checkout_completed",
  "url": "https://example.com/checkout/success",
  "metadata": {
    "currency": "USD",
    "amount": 49.99
  }
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
