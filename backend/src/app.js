import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import { env } from './config/env.js';
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
          ],
          'connect-src': [
            "'self'",
            'ws:',
            'http://localhost:*',
            'https://*.basemaps.cartocdn.com',
            'https://*.tile.openstreetmap.org',
            'https://*.vercel.app',
            'https://accounts.google.com',
            'https://*.googleapis.com',
            'https://api.ipify.org',
            'http://ip-api.com',
          ],
        },
      },
    })
  );

  app.use(cookieParser());

  // Global CORS — tracking endpoints handle their own CORS (trackingCors).
  // Only known dashboard origins may call the authenticated API with credentials;
  // unknown origins get no CORS headers, so browser preflights fail.
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'https://obs-tracker.netlify.app',
    env.frontendUrl ? new URL(env.frontendUrl).origin : null,
  ].filter(Boolean);

  const apiCors = cors({
    origin: (origin, callback) => {
      // No Origin header: same-origin, server-to-server or CLI tools — allow.
      if (!origin) return callback(null, true);
      callback(null, allowedOrigins.includes(origin.replace(/\/$/, '')));
    },
    credentials: true,
  });

  // Public tracking endpoints (/api/track/*) are called from arbitrary
  // customer origins and keep the historic permissive CORS behaviour (the API
  // key is public by design). Everything else — the authenticated API — uses
  // a strict origin allowlist.
  const publicCors = cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
  });

  app.use((req, res, next) => {
    if (req.path.startsWith('/api/track') || req.path.startsWith('/api/v1/track')) {
      return publicCors(req, res, next);
    }
    return apiCors(req, res, next);
  });

  app.use(express.json());

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
