# Web Pulse Analytics

[![CI](https://github.com/heyshreee/Web-Pulse-Analytics/actions/workflows/ci.yml/badge.svg)](https://github.com/heyshreee/Web-Pulse-Analytics/actions/workflows/ci.yml)
[![Security](https://github.com/heyshreee/Web-Pulse-Analytics/actions/workflows/security.yml/badge.svg)](https://github.com/heyshreee/Web-Pulse-Analytics/actions/workflows/security.yml)
[![CodeQL](https://github.com/heyshreee/Web-Pulse-Analytics/actions/workflows/codeql.yml/badge.svg)](https://github.com/heyshreee/Web-Pulse-Analytics/actions/workflows/codeql.yml)
[![License](https://img.shields.io/github/license/heyshreee/Web-Pulse-Analytics)](LICENSE)
[![Issues](https://img.shields.io/github/issues/heyshreee/Web-Pulse-Analytics)](https://github.com/heyshreee/Web-Pulse-Analytics/issues)
[![Good First Issues](https://img.shields.io/github/issues/heyshreee/Web-Pulse-Analytics/good%20first%20issue)](https://github.com/heyshreee/Web-Pulse-Analytics/labels/good%20first%20issue)

Web Pulse Analytics is a real-time visitor tracking and web analytics platform. It captures page views, events, and visitor attributes, and streams live activity to the dashboard over WebSockets so you can monitor traffic, performance, and user behavior as it happens.

> **Status:** V1 stabilization in progress. V2 UI work is tracked separately on the `v2-ui` branch. See [Roadmap](docs/roadmap.md) for details.

## Quick links

- **Docs:** [Getting Started](docs/getting-started.md) · [Architecture](docs/architecture.md) · [API Reference](docs/api-reference.md) · [Tracking Guide](docs/tracking-guide.md)
- **Contributing:** [CONTRIBUTING.md](CONTRIBUTING.md) · [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- **Security:** [SECURITY.md](SECURITY.md) · [Security docs](docs/security.md)
- **Support:** [SUPPORT.md](SUPPORT.md) · [Troubleshooting](docs/troubleshooting.md)
- **Changelog:** [CHANGELOG.md](CHANGELOG.md)

## Key Features

- **Real-time visitor tracking** — live visitor sessions streamed to the dashboard via Socket.IO
- **Event tracking** — lightweight client-side script and REST endpoint for capturing page views and custom events
- **Rich analytics** — global overview, per-project stats, traffic breakdowns, page and activity reports
- **Interactive visualizations** — traffic globe, geographic maps (Leaflet), and analytics charts (Recharts)
- **Authentication & accounts** — email/password and Google OAuth (JWT-based session management)
- **Team projects** — manage multiple tracked sites with per-project dashboards and metrics
- **Plans & billing** — subscription plans with Razorpay payments and usage-based tracking
- **Notifications** — email and Telegram alerts for account and platform events
- **Security hardening** — Helmet, rate limiting, CSRF protection, CORS-restricted tracking endpoints, and Supabase RLS

## Technology Stack

### Frontend

- **React 19** with Vite — single-page application
- **Tailwind CSS** — utility-first styling
- **Recharts** — analytics charts
- **react-globe.gl** & **Leaflet** — geo-visualizations
- **Framer Motion** — animations
- **socket.io-client** — real-time updates

### Backend

- **Node.js** + **Express 5**
- **Socket.IO** — real-time visitor streaming
- **Supabase (PostgreSQL)** — data storage and retrieval
- **JWT** — authentication and session management (Google OAuth supported)
- **geoip-lite** & **ua-parser-js** — visitor geolocation and device detection
- **Razorpay** — subscription payments
- **Cloudinary** — media storage
- **Resend** — transactional email
- **Helmet**, **express-rate-limit**, **CSRF** — security middleware

## Getting Started

### Prerequisites

- Node.js 20+ (22 LTS recommended)
- npm
- A Supabase project (for the database)
- Optional: Razorpay, Google OAuth, Cloudinary, Resend, and Telegram credentials for full functionality

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/heyshreee/Web-Pulse-Analytics.git
   cd Web-Pulse-Analytics
   ```

2. **Install backend dependencies**

   ```bash
   cd backend
   npm install
   ```

3. **Configure the backend environment**

   ```bash
   cp .env.example .env
   ```

   At minimum, set the following required variables:

   ```env
   PORT=5000
   JWT_SECRET=your-secret
   SUPABASE_URL=your-supabase-url
   SUPABASE_SERVICE_KEY=your-service-key
   FRONTEND_URL=http://localhost:5173
   ```

4. **Install frontend dependencies**

   ```bash
   cd ../frontend
   npm install
   cp .env.example .env
   ```

   Frontend variables:

   ```env
   VITE_API_URL=http://localhost:5000
   VITE_GOOGLE_CLIENT_ID=your-google-client-id
   VITE_RAZORPAY_KEY_ID=your-razorpay-key-id
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

5. **Apply database migrations (Supabase)**

   Database migrations live in `supabase/migrations/`. Apply them to your Supabase project
   in timestamp order (via Supabase CLI `supabase db push` or SQL Editor). See
   [Database Schema](docs/database-schema.md) for details.

   > Migrations are **never** auto-deployed by release workflows — review and apply
   > manually per environment.

6. **Start the backend** (from `backend/`)

   ```bash
   npm run dev
   ```

7. **Start the frontend** (from `frontend/`)

   ```bash
   npm run dev
   ```

8. **Access the application**

   Open `http://localhost:5173` in your browser. The API runs on `http://localhost:5000`.

For full setup instructions, see [Getting Started](docs/getting-started.md).

## Project Structure

```
├── backend/            # Express API, Socket.IO, and business logic
│   └── src/
│       ├── config/     # Environment and third-party configuration
│       ├── controllers/# Request handlers
│       ├── middleware/ # Auth, CSRF, rate limiting, CORS
│       ├── routes/     # API route definitions
│       ├── services/   # Business logic (email, plans, usage, etc.)
│       ├── socket/     # Real-time visitor streams
│       └── utils/      # Shared helpers
├── frontend/           # React single-page application
│   └── src/
│       ├── components/ # Reusable UI components
│       ├── context/    # React context providers
│       ├── hooks/      # Custom hooks
│       ├── pages/      # Application routes/views
│       └── utils/      # API client and helpers
├── supabase/           # SQL migrations (schema, RLS, functions)
└── docs/               # Project documentation
```

## API Overview

The API is organized under versioned routes in `backend/src/routes`.

| Area             | Base path        | Description                                  |
| ---------------- | ---------------- | -------------------------------------------- |
| Tracking         | `/api/track`     | Public visitor tracking and count endpoints  |
| Analytics        | `/api/v1/analytics` | Global and per-project analytics           |
| Authentication   | `/api/v1/auth`   | Login, registration, and OAuth               |
| Projects         | `/api/v1/projects` | Project and website management             |
| Users            | `/api/v1/users`  | User profile and settings                     |
| Plans & Payments | `/api/v1/plans`, `/api/v1/payment` | Subscriptions and receipts    |
| Notifications    | `/api/v1/notifications` | Account and alert notifications         |
| Usage            | `/api/v1/usage`  | Event volume and quota tracking              |

### Tracking a visitor

```http
POST /api/track/:trackingId
Content-Type: application/json

{
  "page": "/pricing",
  "referrer": "https://google.com"
}
```

### Fetching visitor count

```http
GET /api/track/:trackingId
```

Real-time activity is delivered to connected clients over Socket.IO from the backend socket service.

See [API Reference](docs/api-reference.md) and [Tracking Guide](docs/tracking-guide.md) for full details.

## Development Scripts

### Backend (`backend/`)

| Command             | Description                |
| ------------------- | -------------------------- |
| `npm run dev`       | Start server with nodemon  |
| `npm start`         | Start the production server |

### Frontend (`frontend/`)

| Command        | Description               |
| -------------- | ------------------------- |
| `npm run dev`  | Start the Vite dev server |
| `npm run build`| Build for production      |
| `npm run lint` | Run ESLint                |
| `npm run preview` | Preview the production build |

## Contributing

Contributions are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening an issue
or pull request. Please follow our [Code of Conduct](CODE_OF_CONDUCT.md).

Branching: `main` (stable), `v1-stabilization` (V1 fixes), `v2-ui` (V2 redesign, isolated).

## Security

Found a vulnerability? **Do not** open a public issue. Follow the private reporting process
in [SECURITY.md](SECURITY.md).

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.