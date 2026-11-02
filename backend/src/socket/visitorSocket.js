import { verifyToken, TOKEN_PURPOSE } from '../utils/jwt.js';
import { isSessionActive } from '../services/session.service.js';
import supabase from '../config/supabase.js';
import cookie from 'cookie';

/**
 * Extracts and validates the session token from cookies, handshake auth, or headers.
 * Returns the decoded token when valid and active, or null.
 */
export const authenticateSocket = async (socket) => {
    try {
        const cookies = cookie.parse(socket.request?.headers?.cookie || '');
        const token =
            cookies.token ||
            socket.handshake?.auth?.token ||
            socket.handshake?.headers?.authorization?.replace(/^Bearer\s+/i, '');

        if (!token) return null;

        const decoded = verifyToken(token);
        if (decoded.purpose && decoded.purpose !== TOKEN_PURPOSE.SESSION) {
            return null;
        }

        // Validate server-side session revocation
        const active = await isSessionActive(decoded.jti);
        if (active === false) {
            return null;
        }

        return decoded;
    } catch {
        return null;
    }
};

export default (io) => {
    io.use(async (socket, next) => {
        const user = await authenticateSocket(socket);
        if (!user) {
            return next(new Error('Authentication error'));
        }
        socket.user = user;
        next();
    });

    io.on('connection', (socket) => {
        console.log(`User ${socket.user.id} connected via socket`);

        // Auto-join user room for account-level updates (usage, notifications)
        socket.join(`user_${socket.user.id}`);
        console.log(`User ${socket.user.id} joined room user_${socket.user.id}`);

        // Periodic Auth Revalidation (every 5 minutes)
        const revalidateInterval = setInterval(async () => {
            const user = await authenticateSocket(socket);
            if (!user) {
                console.log(`Socket session revoked for user ${socket.user.id}, disconnecting...`);
                socket.emit('error', { message: 'Session expired' });
                socket.disconnect();
            }
        }, 5 * 60 * 1000);
        revalidateInterval.unref?.();

        // Project rooms: verify ownership before allowing a socket to join,
        // preventing unauthorized subscribers from snooping on live traffic.
        socket.on('join_project', async (projectId, callback) => {
            try {
                if (!projectId) {
                    if (typeof callback === 'function') callback({ error: 'MISSING_PROJECT_ID' });
                    return;
                }

                const { data: project } = await supabase
                    .from('projects')
                    .select('id')
                    .eq('id', projectId)
                    .eq('user_id', socket.user.id)
                    .maybeSingle();

                if (!project) {
                    console.warn(`[Socket] Unauthorized join attempt for project ${projectId} by user ${socket.user.id}`);
                    if (typeof callback === 'function') {
                        callback({ error: 'UNAUTHORIZED', message: 'You do not have access to this project' });
                    }
                    return;
                }

                socket.join(`project_${projectId}`);
                console.log(`User ${socket.user.id} joined room project_${projectId}`);
                if (typeof callback === 'function') callback({ success: true });
            } catch (err) {
                console.error('[Socket] join_project failed:', err.message);
                if (typeof callback === 'function') callback({ error: 'SERVER_ERROR' });
            }
        });

        socket.on('leave_project', (projectId) => {
            socket.leave(`project_${projectId}`);
            console.log(`User ${socket.user.id} left room project_${projectId}`);
        });

        socket.on('disconnect', () => {
            clearInterval(revalidateInterval);
            console.log('Client disconnected');
        });
    });
};
