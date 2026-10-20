import { verifyToken, TOKEN_PURPOSE } from '../utils/jwt.js';
import { isSessionActive } from '../services/session.service.js';
import supabase from '../config/supabase.js';

import cookie from 'cookie';

/**
 * Validates the session token that came with the socket handshake.
 * Returns the decoded token when the session may be used, or null.
 */
const authenticate = async (token) => {
    if (!token) return null;

    const decoded = verifyToken(token);
    if (decoded.purpose !== TOKEN_PURPOSE.SESSION) return null;

    // Honour server-side revocation here too, so a revoked session cannot
    // keep a live socket open.
    const active = await isSessionActive(decoded.jti);
    if (active === false) return null;

    return decoded;
};

export default (io) => {
    io.use(async (socket, next) => {
        try {
            const cookies = cookie.parse(socket.request.headers.cookie || '');
            const decoded = await authenticate(cookies.token);

            if (!decoded) {
                return next(new Error('Authentication error'));
            }

            socket.user = decoded; // Attach user to socket
            next();
        } catch (error) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User ${socket.user.id} connected via socket`);

        // Auto-join user room
        socket.join(`user_${socket.user.id}`);
        console.log(`User ${socket.user.id} joined room user_${socket.user.id}`);

        // Periodic Auth Revalidation (every 5 minutes)
        const revalidateInterval = setInterval(async () => {
            try {
                const cookies = cookie.parse(socket.request.headers.cookie || '');
                const decoded = await authenticate(cookies.token);
                if (!decoded) throw new Error('No active session');
            } catch (error) {
                console.log(`Socket auth failed for user ${socket.user.id}, disconnecting...`);
                socket.emit('error', { message: 'Session expired' });
                socket.disconnect();
            }
        }, 5 * 60 * 1000);

        // Project rooms — verify ownership before joining so a user can never
        // subscribe to another tenant's live activity stream.
        socket.on('join_project', async (projectId) => {
            try {
                const { data: project } = await supabase
                    .from('projects')
                    .select('id')
                    .eq('id', projectId)
                    .eq('user_id', socket.user.id)
                    .maybeSingle();

                if (!project) {
                    console.warn(`User ${socket.user.id} denied join for project_${projectId}`);
                    return;
                }

                socket.join(`project_${projectId}`);
                console.log(`User ${socket.user.id} joined room project_${projectId}`);
            } catch (err) {
                console.error('join_project failed:', err.message);
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
