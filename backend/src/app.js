import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import { env } from './config/env.js';
import { isAllowedOrigin } from './config/origins.js';
import v1Routes from './routes/v1/index.js';
import trackRoutes from './routes/v1/track.routes.js';
import { notFound, errorHandler } from './middlewares/errorHandler.js';

const createApp = () => {
  const app = express();
  app.set('trust proxy', 1);

  // Security headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          ...helmet.contentSecurityPolicy.getDefaultDirectives(),
          'img-src': [
            "'self'",
            'data:',
            'blob:',
            'https://*.basemaps.cartocdn.com',
            'https://*.tile.openstreetmap.org',
            'https://grainy-gradients.vercel.app',
            'https://*.supabase.co',
            'https://brjltpxgthgjiaufycvc.supabase.co',
          ],
          'connect-src': [
            "'self'",
            'ws:',
            'wss:',
            'http://localhost:*',
            'https://localhost:*',
            'https://brjltpxgthgjiaufycvc.supabase.co',
            'wss://brjltpxgthgjiaufycvc.supabase.co',
            'https://*.supabase.co',
            'wss://*.supabase.co',
            'https://*.supabase.in',
            'wss://*.supabase.in',
            'https://*.basemaps.cartocdn.com',
            'https://*.tile.openstreetmap.org',
            'https://*.vercel.app',
            'https://accounts.google.com',
            'https://*.googleapis.com',
            'https://api.ipify.org',
            'https://ipwho.is',
            'https://ipapi.co',
          ],
        },
      },
    })
  );

  app.use(cookieParser());

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
    ],
  });

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

  // Routes
  app.use('/api/v1', v1Routes);
  app.use('/api/track', trackRoutes);

  app.get('/', (req, res) => {
    res.send('Web Pluse Analytics API is running...');
  });

  // 404 + centralized error handler
  app.use(notFound);
  app.use(errorHandler);

  return app;
};

export default createApp;
