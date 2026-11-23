import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { getSocketUrl, isSocketEnabled } from '../utils/api';

const SOCKET_URL = getSocketUrl();

export default function useProjectSocket(projectId, onUpdate) {
  useEffect(() => {
    if (!projectId || !onUpdate) return;

    let socket;
    
    if (isSocketEnabled()) {
      socket = io(SOCKET_URL, {
        withCredentials: true,
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
        timeout: 10000,
      });

      socket.on('visitor_update', (data) => {
        if (data.project_id && data.project_id !== projectId) return;
        onUpdate(projectId, data);
      });

      socket.on('connect_error', (err) => {
        if (import.meta.env.DEV) {
          console.debug('useProjectSocket notice:', err.message);
        }
      });
    }

    const interval = setInterval(() => {
      onUpdate(projectId);
    }, 10000); // 10s fallback for stats refresh

    return () => {
      if (socket) socket.disconnect();
      clearInterval(interval);
    };
  }, [projectId, onUpdate]);
}
