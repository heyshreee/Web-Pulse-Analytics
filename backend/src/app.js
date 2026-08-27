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

  // Global CORS — tracking endpoint CORS is handled per-route by trackingCors
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        callback(null, true);
      },
      credentials: true,
    })
  );

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
