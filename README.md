# WebPulse Analytics v2.0

<p align="center">
  <img src="frontend/public/logo.png" alt="WebPulse Analytics Logo" width="80" height="80" />
</p>

<h3 align="center">Next-Generation Real-Time Web Telemetry & Visitor Analytics</h3>

<p align="center">
  A privacy-focused, high-performance web analytics platform engineered for modern web applications.<br />
  Track live visitors, page performance, and custom telemetry events with zero hassle.
</p>

<p align="center">
  <a href="https://github.com/heyshreee/Web-Pulse-Analytics/releases"><img src="https://img.shields.io/badge/version-2.0.0-blue.svg?style=flat-square" alt="Version 2.0.0" /></a>
  <a href="https://github.com/heyshreee/Web-Pulse-Analytics/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/heyshreee/Web-Pulse-Analytics/ci.yml?branch=development&style=flat-square&label=CI" alt="CI Status" /></a>
  <a href="https://github.com/heyshreee/Web-Pulse-Analytics/actions/workflows/security.yml"><img src="https://img.shields.io/github/actions/workflow/status/heyshreee/Web-Pulse-Analytics/security.yml?branch=development&style=flat-square&label=Security" alt="Security Status" /></a>
  <a href="https://github.com/heyshreee/Web-Pulse-Analytics/actions/workflows/codeql.yml"><img src="https://img.shields.io/github/actions/workflow/status/heyshreee/Web-Pulse-Analytics/codeql.yml?branch=development&style=flat-square&label=CodeQL" alt="CodeQL" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT%20(Jan%2017%2C%202026)-green.svg?style=flat-square" alt="License MIT" /></a>
  <a href="https://github.com/heyshreee/Web-Pulse-Analytics/issues"><img src="https://img.shields.io/github/issues/heyshreee/Web-Pulse-Analytics?style=flat-square" alt="Open Issues" /></a>
</p>

---

> **Current Release:** **Version 2.0** is the active, production-ready release of WebPulse Analytics. It brings a completely overhauled design system, a 3D interactive data network globe, 15+ comprehensive dashboard modules, additive Supabase SQL aggregations with 11 custom RPCs, and dual-layer resilient querying.

---

## Table of Contents

- [What's New in Version 2.0](#whats-new-in-version-20)
- [Key Features](#key-features)
- [Architecture & Data Strategy](#architecture--data-strategy)
- [Technology Stack](#technology-stack)
- [Quick Start](#quick-start)
  - [Prerequisites](#prerequisites)
  - [Environment Setup](#environment-setup)
  - [Database Migrations](#database-migrations)
  - [Running the Services](#running-the-services)
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

## What's New in Version 2.0

WebPulse Analytics v2 is an end-to-end upgrade of both client and server architectures:

| Module | Version 2.0 Upgrade |
| :--- | :--- |
| **Design System** | **Dark Data Observatory**: Semantic CSS tokens (`theme.css`), smooth dark/light mode switching using the native browser **View Transitions API** (circular click reveal), and refined SaaS typography. |
| **Interactive Globe** | **3D Visitor Network**: WebGL/Three.js interactive globe powered by `react-globe.gl` with centroid country mapping, drag-to-rotate, and live telemetry arcs. |
| **UI Component Kit** | Accessible primitives under `src/components/ui/` (`Icon`, `Button`, `Card`, `DataTable`, `Field`, `Display`, `Overlay`, `Blocks`, `Charts`, `State`, `Nav`, `Page`). |
| **Dashboard Suite** | **15+ Dedicated Views**: Visitors, Sessions, Pages, Custom Events & Drilldowns, Traffic Sources, Geography, Real-Time Activity, Threshold Alerts, Audit Logs, and Shareable Reports. |
| **Supabase Analytics Engine** | Additive PostgreSQL schema with **11 high-performance RPC aggregation functions**, composite B-tree indexes, partition-ready timestamp keys, and strict Row Level Security (RLS). |
| **Resilient Data Strategy** | Dual-source pipeline in `src/lib/dataService.js`: Direct Supabase PostgREST/RPC queries with automated Express 5 API fallback. Honest zero-data states without synthetic mocks. |
| **Zero-Flash Preloader** | Inlined SVG pulsing emblem in `index.html` with shimmer progress track eliminates white/blank flashes during asset loading. |
| **Security Hardening** | Dynamic Content Security Policy (CSP) for Supabase REST & WebSockets, Leaflet dark tile providers, rate limiting, and hashed API keys. |

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

## Architecture & Data Strategy

WebPulse Analytics v2 utilizes an optimized dual-path data flow engineered for sub-second dashboards and zero downtime:

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
 │   Supabase Postgres   │◄────┤  React 19 Dashboard  │
 │  - Core Tables       │      │  (Dual Data Service) │
 │  - 11 Analytics RPCs │      │  - Supabase Primary  │
 │  - RLS Security      │      │  - Express Fallback  │
 └──────────────────────┘      └──────────────────────┘
```

1. **Ingestion Layer:** Public endpoints (`/api/track/:trackingId` and `/api/track/events`) parse incoming pings, extract geo/device telemetry, and persist records to Supabase.
2. **Real-Time Stream:** Live events are broadcast via `Socket.IO` rooms scoped by project ID, triggering instantaneous dashboard metric increments.
3. **Analytics Layer:** The frontend queries high-speed SQL RPC functions directly via Supabase PostgREST. If permissions or connectivity require, `dataService.js` transparently falls back to the backend API.

---

## Technology Stack

### Frontend Application
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
   Edit `backend/.env` with your credentials:
   ```env
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   BACKEND_URL=http://localhost:5000
   JWT_SECRET=your_jwt_secret_key
   CSRF_SECRET=your_csrf_secret_key
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_KEY=your_supabase_service_role_key
   ```

3. **Configure Frontend Environment:**
   ```bash
   cd ../frontend
   cp .env.example .env
   ```
   Edit `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### Database Migrations

Apply the versioned SQL migrations in `supabase/migrations/` to your Supabase project in sequential order:

```bash
# Using Supabase CLI:
supabase db push

# Alternatively: Execute the SQL files in Supabase SQL Editor:
# 1. 20261001000001_core_schema.sql
# 2. 20261001000002_analytics_tables.sql
# 3. 20261001000003_indexes.sql
# 4. 20261001000004_analytics_functions.sql
# 5. 20261001000005_rls_security.sql
# 6. 20261008000001_fix_security_and_performance_linter.sql
```

> **Note:** Database migrations are never executed automatically by CI/CD workflows to prevent accidental production downtime.

### Running the Services

1. **Install and run the Backend:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   The API server will listen on `http://localhost:5000`.

2. **Install and run the Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   The Vite development server will open on `http://localhost:5173`.

---

## Tracking Script & Integration

WebPulse Analytics v2 provides a lightweight client tracker that can be embedded into any web property.

### 1. Standard HTML Embed
Add the following snippet before the closing `</head>` tag on your website:

```html
<!-- WebPulse Analytics v2 Tracker -->
<script
  defer
  src="http://localhost:5000/api/track/script.js"
  data-site="YOUR_PROJECT_TRACKING_ID">
</script>
```

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
Host: localhost:5000
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

The v2 frontend offers a complete suite of marketing, authentication, and telemetry views:

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
├── backend/                  # Node.js & Express 5 API Server
│   ├── src/
│   │   ├── config/           # Environment and third-party service configs
│   │   ├── controllers/      # Route request handlers
│   │   ├── errors/           # Centralized AppError classes
│   │   ├── middlewares/      # Auth, CORS, Helmet, Rate Limiter, Error handling
│   │   ├── routes/           # REST route definitions (v1 + track)
│   │   ├── services/         # Business logic (analytics, email, payments)
│   │   ├── socket/           # Socket.IO visitor streaming setup
│   │   └── utils/            # Shared utilities (crypto, IP, formatters)
│   └── package.json
├── frontend/                 # React 19 + Vite Single-Page Application
│   ├── public/               # Static assets, branding, and icons
│   ├── src/
│   │   ├── components/       # Reusable UI primitives, App Shell, & Modals
│   │   │   └── ui/           # Unified v2 UI kit (Button, Card, DataTable, etc.)
│   │   ├── context/          # React Contexts (Theme, Toast, Project)
│   │   ├── hooks/            # Custom application hooks
│   │   ├── lib/              # Dual data service client (dataService.js)
│   │   ├── pages/            # 36+ Route views (Dashboard, Marketing, Auth)
│   │   ├── styles/           # Design system tokens (theme.css, app.css)
│   │   └── utils/            # API client and formatting helpers
│   └── package.json
├── supabase/                 # Supabase PostgreSQL Migrations
│   └── migrations/           # 6 Versioned SQL migration scripts
├── docs/                     # Detailed architectural and user guides
├── .github/                  # CI/CD Workflows, security scans, and templates
├── LICENSE                   # MIT License (Created Jan 17, 2026)
└── README.md                 # Project documentation
```

---

## Documentation Directory

Deep dive into the architecture, deployment, and security of WebPulse Analytics:

- 📖 [Getting Started Guide](docs/getting-started.md) — Comprehensive local setup and configuration.
- 🏗️ [Architecture Deep Dive](docs/architecture.md) — System design, data pipeline, and real-time streams.
- 📡 [API Reference](docs/api-reference.md) — Full REST endpoint documentation and parameters.
- 🔍 [Tracking Guide](docs/tracking-guide.md) — Client integration, bot protection, and custom events.
- 💾 [Database Schema](docs/database-schema.md) — Supabase PostgreSQL schema, tables, and RPC functions.
- 🔒 [Security & Privacy](docs/security.md) — Hardening guide, CSP, RLS policies, and vulnerability reporting.
- 🚀 [Deployment Guide](docs/deployment.md) — Production setup for Vercel, Render, Railway, or VPS.
- 🛠️ [Troubleshooting](docs/troubleshooting.md) — Common operational issues and solutions.
- 🗺️ [Roadmap](docs/roadmap.md) — Project milestones and release planning.

---

## Security & Compliance

Security is a foundational pillar of WebPulse Analytics v2:
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

This project is licensed under the **MIT License** (Repository created on January 17, 2026).  
See the [LICENSE](LICENSE) file for the full license text.