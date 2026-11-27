import http from 'node:http';
import { Server } from 'socket.io';

import createApp from './app.js';
import setupVisitorSocket from './socket/visitorSocket.js';
import NotificationService from './services/notification.service.js';
import RetentionService from './services/retention.service.js';
import { env } from './config/env.js';
import { isAllowedOrigin } from './config/origins.js';

const app = createApp();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => callback(null, isAllowedOrigin(origin)),
    methods: ['GET', 'POST'],
    credentials: true,
  },
  // CORS does not apply to raw WebSocket upgrades, so validate the Origin
  // header for every transport as well.
  allowRequest: (req, callback) => {
    const origin = req.headers.origin;
    if (!origin || isAllowedOrigin(origin)) return callback(null, true);
    return callback(null, false);
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 30000,
  pingInterval: 25000,
});

io.engine.on('connection_error', (err) => {
  if (process.env.NODE_ENV !== 'production') {
    console.debug('[Socket] Engine connection notice:', err.message, err.code);
  }
});

// Expose io globally so controllers/services can push real-time updates
global.io = io;

// Socket.io real-time visitor updates
setupVisitorSocket(io);

const PORT = env.port;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  // Cleanup old notifications and expired analytics data every hour (UTC)
  setInterval(() => {
    NotificationService.cleanup();
    RetentionService.cleanupExpiredData().catch((err) => {
      console.error('[Retention] Scheduled cleanup failed:', err);
    });
  }, 60 * 60 * 1000);
});
