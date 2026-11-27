import ActivityLogService from '../services/activity.service.js';
import NotificationService from '../services/notification.service.js';
import originService from '../services/origin.service.js';
import supabase from '../config/supabase.js';
import { isAllowedOrigin, normalizeOrigin } from '../config/origins.js';
import { extractExactOriginFromHeaders } from '../utils/origin.js';
import { getClientIp } from '../utils/ip.js';

const isUuid = (value) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

/**
 * CORS for public tracking ingestion.
 *
 * - Dashboard origins may send credentials.
 * - Customer-site origins are matched against exact verified `project_origins`
 *   (no wildcard or automatic subdomain matching) and never receive credentials.
 * - Endpoints without a project path identifier validate origin in the controller
 *   once the tracking ID / API key is resolved.
 */
const trackingCors = async (req, res, next) => {
  try {
    const origin = req.headers.origin;
    const { trackingId, id } = req.params;
    const projectId = trackingId || id;
    const ip = getClientIp(req);

    res.header('Vary', 'Origin');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-API-Key, X-Requested-With, Accept, Cache-Control, Pragma'
    );

    if (!origin) {
      return next();
    }

    const requestOrigin = normalizeOrigin(origin);

    if (isAllowedOrigin(requestOrigin)) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Credentials', 'true');
      if (req.method === 'OPTIONS') return res.status(204).end();
      return next();
    }

    if (!projectId) {
      res.header('Access-Control-Allow-Origin', origin);
      if (req.method === 'OPTIONS') return res.status(204).end();
      return next();
    }

    let query = supabase
      .from('projects')
      .select('id, name, user_id, allowed_origins, is_active');

    query = isUuid(projectId)
      ? query.eq('id', projectId)
      : query.eq('tracking_id', projectId);

    const { data: project, error: dbError } = await query.maybeSingle();
    if (dbError) {
      console.error('[CORS] Supabase error:', dbError);
    }

    if (!project) {
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
            event_type: 'project.blocked',
          }
        );
      }

      if (req.method !== 'OPTIONS') {
        return res.status(403).json({
          error: 'PROJECT_DISABLED',
          message: 'Project is disabled',
        });
      }
      return res.status(204).end();
    }

    const exactOrigin = extractExactOriginFromHeaders(req);
    const origins = await originService.listOrigins(project.id);

    if (origins.length === 0) {
      res.header('Access-Control-Allow-Origin', origin);
      if (req.method === 'OPTIONS') return res.status(204).end();
      return next();
    }

    const matched = exactOrigin ? origins.find((o) => o.origin === exactOrigin) : null;
    if (matched && matched.status === 'verified') {
      res.header('Access-Control-Allow-Origin', origin);
      if (req.method === 'OPTIONS') return res.status(204).end();
      return next();
    }

    if (project.user_id) {
      await NotificationService.create(
        project.user_id,
        'Security Alert: Unauthorized Origin Blocked',
        `Blocked request from ${matched?.status || 'unregistered'} origin "${origin}" for project "${project.name || project.id}".`,
        'security'
      );
      await ActivityLogService.log(
        project.id,
        project.user_id,
        'security.alert',
        `Blocked request from unauthorized origin: ${origin}`,
        'failure',
        ip,
        {
          resource: req.originalUrl,
          http_method: req.method,
          http_status: 403,
          user_agent: req.headers['user-agent'],
          event_type: 'security.alert',
          origin,
        }
      );
    }

    if (req.method !== 'OPTIONS') {
      return res.status(403).json({
        error: matched?.status === 'blocked' ? 'ORIGIN_BLOCKED' : matched ? 'ORIGIN_NOT_VERIFIED' : 'ORIGIN_NOT_ALLOWED',
        message: 'Origin not verified or permitted by this project policy',
      });
    }
    return res.status(204).end();
  } catch (err) {
    console.error('[CORS] Middleware fatal error:', err);
    next();
  }
};

export default trackingCors;
