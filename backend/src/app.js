import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import { env } from './config/env.js';
import { isAllowedOrigin } from './config/origins.js';
import v1Routes from './routes/v1/index.js';
import trackRoutes from './routes/v1/track.routes.js';
import csrf from './middlewares/csrf.js';
import { notFound, errorHandler } from './middlewares/errorHandler.js';

const createApp = () => {
  const app = express();
  app.set('trust proxy', 1);

  // Derive dynamic Supabase host from configured environment URL
  let supabaseHost = '';
  try {
    if (env.supabaseUrl) {
      supabaseHost = new URL(env.supabaseUrl).hostname;
    }
  } catch {}

  const dynamicSupabaseHttps = supabaseHost ? `https://${supabaseHost}` : null;
  const dynamicSupabaseWss = supabaseHost ? `wss://${supabaseHost}` : null;
  const isProd = process.env.NODE_ENV === 'production';

  // Configured frontend origins from env (avoiding wildcard *.vercel.app)
  const configuredFrontendOrigins = (env.frontendUrls || [])
    .map((origin) => {
      try {
        return new URL(origin).origin;
      } catch {
        return null;
      }
    })
    .filter((origin) => {
      if (!origin) return false;
      if (isProd && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
        return false;
      }
      return true;
    });

  const cspImgSrc = [
    "'self'",
    'data:',
    'blob:',
    'https://*.basemaps.cartocdn.com',
    'https://*.tile.openstreetmap.org',
    'https://grainy-gradients.vercel.app',
    'https://*.supabase.co',
    dynamicSupabaseHttps,
  ].filter(Boolean);

  const cspConnectSrc = [
    "'self'",
    // Specific Supabase hosts
    dynamicSupabaseHttps,
    dynamicSupabaseWss,
    'https://*.supabase.co',
    'wss://*.supabase.co',
    'https://*.supabase.in',
    'wss://*.supabase.in',
    // Map tiles & authentication
    'https://*.basemaps.cartocdn.com',
    'https://*.tile.openstreetmap.org',
    'https://accounts.google.com',
    'https://*.googleapis.com',
    // Platform domains
    'https://*.webpulseanalytics.tech',
    'https://webpulseanalytics.tech',
    'wss://*.webpulseanalytics.tech',
    // Exact deployment origins from config
    ...configuredFrontendOrigins,
    // Development/test-only local addresses
    ...(!isProd
      ? [
          'http://localhost:*',
          'https://localhost:*',
          'ws://localhost:*',
          'wss://localhost:*',
          'http://127.0.0.1:*',
          'https://127.0.0.1:*',
          'ws://127.0.0.1:*',
          'wss://127.0.0.1:*',
        ]
      : []),
  ].filter(Boolean);

  // Security headers
  app.use(
    helmet({
      crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
      contentSecurityPolicy: {
        directives: {
          ...helmet.contentSecurityPolicy.getDefaultDirectives(),
          'img-src': Array.from(new Set(cspImgSrc)),
          'connect-src': Array.from(new Set(cspConnectSrc)),
        },
      },
    })
  );

  // Public tracking ingestion and the public live-count endpoint are called
  // directly from customer sites, so they use the non-credentialed public CORS
  // policy instead of the dashboard allowlist.
  const isTrackingPath = (path) =>
    path === '/api/track' ||
    path.startsWith('/api/track/') ||
    path === '/api/v1/track' ||
    path.startsWith('/api/v1/track/') ||
    path === '/api/v1/analytics/count' ||
    path === '/api/v1/analytics/count/';

  app.use(cookieParser());

  // CSRF protection for cookie-authenticated state-changing requests
  app.use((req, res, next) => {
    if (isTrackingPath(req.path)) return next();
    return csrf(req, res, next);
  });

  // Credentialed CORS for the authenticated API. Only explicitly configured
  // dashboard/marketing origins are allowed. Public tracking routes are skipped
  // here because trackingCors validates customer-site origins per project.
  const apiCors = cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      return callback(null, isAllowedOrigin(origin));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Cache-Control',
      'Pragma',
      'Expires',
    ],
  });

  app.use((req, res, next) => {
    if (isTrackingPath(req.path)) return next();

    const origin = req.headers.origin;
    if (origin && !isAllowedOrigin(origin)) {
      return res.status(403).json({
        error: 'CORS_ORIGIN_DENIED',
        message: 'Origin is not allowed to access this API',
      });
    }

    return apiCors(req, res, next);
  });

  // Body size cap — a large payload must never be buffered in memory.
  app.use(express.json({ limit: '100kb' }));

  // Parse text/plain JSON payloads on public tracking routes (e.g. navigator.sendBeacon)
  app.use(
    ['/api/track', '/api/v1/track'],
    express.text({ type: 'text/plain', limit: '100kb' }),
    (req, res, next) => {
      if (typeof req.body === 'string') {
        const trimmed = req.body.trim();
        if (!trimmed) {
          req.body = {};
          return next();
        }
        try {
          req.body = JSON.parse(trimmed);
        } catch {
          return res.status(400).json({
            success: false,
            error: 'Invalid JSON payload',
            code: 'INVALID_JSON',
          });
        }
      }
      return next();
    }
  );

  // Routes
  app.use('/api/v1', v1Routes);
  app.use('/api/track', trackRoutes);

  app.get('/', (req, res) => {
    res.send('WebPulse Analytics API is running...');
  });

  // 404 + centralized error handler
  app.use(notFound);
  app.use(errorHandler);

  return app;
};

export default createApp;
