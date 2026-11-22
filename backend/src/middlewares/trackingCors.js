import ActivityLogService from '../services/activity.service.js';
import supabase from '../config/supabase.js';
import { isAllowedOrigin, normalizeOrigin } from '../config/origins.js';
import { getClientIp } from '../utils/ip.js';

const isUuid = (value) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

/**
 * CORS for public tracking ingestion.
 *
 * This is deliberately separate from the credentialed API CORS in app.js:
 * - Dashboard origins may send cookies.
 * - Customer-site origins are validated against the project's allowed_origins
 *   and never receive Access-Control-Allow-Credentials.
 * - Public endpoints without a project identifier (for example /track/events)
 *   are open to any embedding origin, still without credentials.
 */
const trackingCors = async (req, res, next) => {
    try {
        const origin = req.headers.origin;
        const { trackingId, id } = req.params;
        const projectId = trackingId || id;
        const ip = getClientIp(req);

        res.header('Vary', 'Origin');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key, X-Requested-With, Accept, Cache-Control, Pragma');

        // Server-to-server requests have no Origin header.
        if (!origin) {
            return next();
        }

        const requestOrigin = normalizeOrigin(origin);

        // Dashboard origins are the only browser clients allowed to send cookies.
        if (isAllowedOrigin(requestOrigin)) {
            res.header('Access-Control-Allow-Origin', origin);
            res.header('Access-Control-Allow-Credentials', 'true');
            if (req.method === 'OPTIONS') return res.status(204).end();
            return next();
        }

        // Public tracking endpoints without a project identifier. The controller
        // is responsible for validating the tracking ID in the request body.
        if (!projectId) {
            res.header('Access-Control-Allow-Origin', origin);
            if (req.method === 'OPTIONS') return res.status(204).end();
            return next();
        }

        let query = supabase
            .from('projects')
            .select('id, user_id, allowed_origins, is_active');

        query = isUuid(projectId)
            ? query.eq('id', projectId)
            : query.eq('tracking_id', projectId);

        const { data: project, error: dbError } = await query.maybeSingle();

        if (dbError) {
            console.error('[CORS] Supabase error:', dbError);
        }

        if (!project) {
            console.log(`[CORS] Project not found for ID: ${projectId}`);
            if (req.method === 'OPTIONS') return res.status(204).end();
            return next();
        }

        if (project.is_active === false) {
            if (project.user_id) {
                await ActivityLogService.log(
                    project.id,
                    project.user_id,
                    'project.blocked',
                    'Request blocked: Project is disabled',
                    'failure',
                    ip,
                    {
                        resource: req.originalUrl,
                        http_method: req.method,
                        http_status: 403,
                        user_agent: req.headers['user-agent'],
                        event_type: 'project.blocked'
                    }
                );
            }

            if (req.method !== 'OPTIONS') {
                return res.status(403).json({
                    error: 'PROJECT_DISABLED',
                    message: 'Project is disabled'
                });
            }
            return res.status(204).end();
        }

        const allowedOrigins = project.allowed_origins
            ? project.allowed_origins
                .split(',')
                .map(normalizeOrigin)
                .filter(Boolean)
            : null;

        if (!allowedOrigins || allowedOrigins.includes(requestOrigin)) {
            res.header('Access-Control-Allow-Origin', origin);
            if (req.method === 'OPTIONS') return res.status(204).end();
            return next();
        }

        console.log(`[CORS] Blocked: Origin ${origin} not in allowed list for project ${projectId}`);

        if (project.user_id) {
            await ActivityLogService.log(
                project.id,
                project.user_id,
                'security.alert',
                `Blocked request from unauthorized origin: ${requestOrigin}`,
                'failure',
                ip,
                {
                    resource: req.originalUrl,
                    http_method: req.method,
                    http_status: 403,
                    user_agent: req.headers['user-agent'],
                    event_type: 'security.alert'
                }
            );
        }

        if (req.method !== 'OPTIONS') {
            return res.status(403).json({
                error: 'CORS_BLOCKED',
                message: 'Origin not allowed in project settings'
            });
        }
        return res.status(204).end();
    } catch (error) {
        console.error('CORS Middleware Error:', error);
        // Never turn a CORS lookup failure into an unhandled 500 for tracking.
        return next();
    }
};

export default trackingCors;
