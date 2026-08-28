# Web Pulse Analytics

Web Pulse Analytics is a real-time visitor tracking and web analytics platform. It captures page views, events, and visitor attributes, and streams live activity to the dashboard over WebSockets so you can monitor traffic, performance, and user behavior as it happens.

## Key Features

- **Real-time visitor tracking** — live visitor sessions streamed to the dashboard via Socket.IO
- **Event tracking** — lightweight client-side script and REST endpoint for capturing page views and custom events
- **Rich analytics** — global overview, per-project stats, traffic breakdowns, page and activity reports
- **Interactive visualizations** — traffic globe, geographic maps (Leaflet), and analytics charts (Recharts)
- **Authentication & accounts** — email/password and Google OAuth (JWT-based session management)
- **Team projects** — manage multiple tracked sites with per-project dashboards and metrics
- **Plans & billing** — subscription plans with Razorpay payments and usage-based tracking
- **Notifications** — email and Telegram alerts for account and platform events
- **Security hardening** — Helmet, rate limiting, CSRF protection, and CORS-restricted tracking endpoints

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

- Node.js 18 or higher
- npm or yarn
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
   ```

5. **Start the backend** (from `backend/`)

   ```bash
   npm run dev
   ```

6. **Start the frontend** (from `frontend/`)

   ```bash
   npm run dev
   ```

7. **Access the application**

   Open `http://localhost:5173` in your browser. The API runs on `http://localhost:5000`.

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
└── frontend/           # React single-page application
    └── src/
        ├── components/ # Reusable UI components
        ├── context/    # React context providers
        ├── hooks/      # Custom hooks
        ├── pages/      # Application routes/views
        └── utils/      # API client and helpers
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
  "referrer": "https://google.com",
  "userAgent": "Mozilla/5.0 ..."
}
```

### Fetching visitor count

```http
GET /api/track/:trackingId
```

Real-time activity is delivered to connected clients over Socket.IO from the backend socket service.

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

Contributions are welcome. Please follow these steps:

1. Fork the repository and create a feature branch (`git checkout -b feature/your-feature-name`).
2. Make your changes and follow the existing code style and conventions.
3. Run the linter (`npm run lint` in `frontend/`) before committing.
4. Commit with a clear, descriptive message and open a pull request that references any related issues.

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.