import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { getApiUrl } from '../utils/api';

const API_URL = getApiUrl();
const SOCKET_URL = API_URL.replace('/api/v1', '');

export default function useProjectSocket(projectId, onUpdate) {
  useEffect(() => {
    if (!projectId || !onUpdate) return;

    let socket;
    
    // Skip socket for Vercel demo if needed, but here we assume it's standard
    if (!SOCKET_URL.includes('vercel.app')) {
      socket = io(SOCKET_URL, {
        withCredentials: true,
        transports: ['websocket', 'polling']
      });

      socket.on('visitor_update', (data) => {
        if (data.project_id && data.project_id !== projectId) return;
        onUpdate(projectId, data);
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
