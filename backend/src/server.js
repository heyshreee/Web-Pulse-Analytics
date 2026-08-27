import http from 'node:http';
import { Server } from 'socket.io';

import createApp from './app.js';
import setupVisitorSocket from './socket/visitorSocket.js';
import NotificationService from './services/notification.service.js';
import { env } from './config/env.js';

const app = createApp();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'https://obs-tracker.netlify.app/',
      env.frontendUrl,
    ].filter(Boolean),
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Expose io globally so controllers/services can push real-time updates
global.io = io;

// Socket.io real-time visitor updates
setupVisitorSocket(io);

const PORT = env.port;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  // Cleanup old notifications every hour
  setInterval(() => {
    NotificationService.cleanup();
  }, 60 * 60 * 1000);
});
