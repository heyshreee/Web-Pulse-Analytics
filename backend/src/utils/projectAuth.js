import supabase from '../config/supabase.js';
import { isUuid } from './uuid.js';
import AppError from '../errors/AppError.js';

const ROLE_RANK = {
  viewer: 1,
  analyst: 2,
  editor: 3,
  admin: 3,
  owner: 4,
};

/**
 * Resolves a project by UUID, tracking_id, or name and enforces role-based access
 * for the project owner or an active project_members row.
 *
 * Roles:
 * - viewer: read-only analytics access
 * - admin: manage project settings, origins, and analytics
 * - owner: full control (team management, billing, share revocation, deletion)
 */
export async function resolveAuthorizedProject(idOrName, userId, requiredRole = 'viewer') {
  if (!idOrName || !userId) {
    throw AppError.notFound('Project not found');
  }

  let query = supabase
    .from('projects')
    .select('id, name, user_id, owner_id, tracking_id, timezone, is_active, archived_at, allowed_origins, description');

  if (isUuid(idOrName)) {
    query = query.eq('id', idOrName);
  } else if (String(idOrName).startsWith('trk_')) {
    query = query.eq('tracking_id', idOrName);
  } else {
    query = query.eq('name', idOrName);
  }

  const { data: projects, error } = await query;
  if (error) throw error;

  const list = Array.isArray(projects) ? projects : projects ? [projects] : [];
  if (list.length === 0) {
    throw AppError.notFound('Project not found');
  }

  // First check direct ownership
  const owned = list.find((p) => p.user_id === userId || p.owner_id === userId);
  if (owned) {
    return { ...owned, memberRole: 'owner' };
  }

  // Otherwise check project_members for each candidate project
  const minRank = ROLE_RANK[requiredRole] ?? 1;
  for (const candidate of list) {
    const { data: member } = await supabase
      .from('project_members')
      .select('role, status')
      .eq('project_id', candidate.id)
      .eq('user_id', userId)
      .maybeSingle();

    if (member && (!member.status || member.status === 'active')) {
      const memberRole = String(member.role || 'viewer').toLowerCase();
      const memberRank = ROLE_RANK[memberRole] ?? 0;
      if (memberRank < minRank) {
        throw AppError.forbidden(
          `Insufficient project permissions (${requiredRole} role required).`,
          'INSUFFICIENT_ROLE',
          { requiredRole, currentRole: memberRole }
        );
      }
      return { ...candidate, memberRole };
    }
  }

  throw AppError.notFound('Project not found');
}

export default {
  resolveAuthorizedProject,
};
