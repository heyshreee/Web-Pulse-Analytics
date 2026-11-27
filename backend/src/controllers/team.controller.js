import supabase from '../config/supabase.js';
import { isUuid } from '../utils/uuid.js';
import { getPlanConfig, normalizePlanId } from '../config/plans.js';
import ActivityLogService from '../services/activity.service.js';
import NotificationService from '../services/notification.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../errors/AppError.js';

async function resolveOwnedProject(idOrName, userId) {
  let query = supabase
    .from('projects')
    .select('id, name, user_id, owner_id')
    .eq('user_id', userId);

  if (isUuid(idOrName)) {
    query = query.eq('id', idOrName);
  } else {
    query = query.eq('name', idOrName);
  }

  const { data: project, error } = await query.maybeSingle();
  if (error) throw error;
  if (!project) throw AppError.notFound('Project not found');
  return project;
}

export const getProjectMembers = asyncHandler(async (req, res) => {
  const project = await resolveOwnedProject(req.params.id, req.user.id);
  const plan = normalizePlanId(req.user.plan || 'nano');
  const planConfig = getPlanConfig(plan);
  const limit = planConfig.limits.team_members;

  const { data: members, error } = await supabase
    .from('project_members')
    .select('*')
    .eq('project_id', project.id)
    .order('created_at', { ascending: true });

  const normalizedMembers =
    !error && Array.isArray(members) && members.length > 0
      ? members
      : [
          {
            id: `owner-${req.user.id}`,
            project_id: project.id,
            user_id: req.user.id,
            role: 'owner',
            email: req.user.email,
            name: req.user.name,
          },
        ];

  res.json({
    members: normalizedMembers,
    used: normalizedMembers.length,
    limit,
    canInvite: Boolean(planConfig.features.team_collaboration) && normalizedMembers.length < limit,
    plan,
  });
});

export const inviteProjectMember = asyncHandler(async (req, res) => {
  const project = await resolveOwnedProject(req.params.id, req.user.id);
  const { email, role = 'viewer' } = req.body || {};

  const plan = normalizePlanId(req.user.plan || 'nano');
  const planConfig = getPlanConfig(plan);
  const seatLimit = planConfig.limits.team_members;

  if (!planConfig.features.team_collaboration || seatLimit <= 1) {
    throw AppError.forbidden(
      `Team invitations are not enabled on the ${planConfig.name} plan (maximum ${seatLimit} team member). Upgrade to Pro or Max to invite collaborators.`,
      'TEAM_LIMIT_REACHED',
      {
        used: 1,
        limit: seatLimit,
        plan,
        upgradeRequired: true,
      }
    );
  }

  if (!['admin', 'editor', 'viewer'].includes(role)) {
    throw AppError.badRequest('Role must be admin, editor, or viewer');
  }

  if (!email || typeof email !== 'string') {
    throw AppError.badRequest('Member email is required');
  }

  const { data: existingMembers } = await supabase
    .from('project_members')
    .select('id, user_id')
    .eq('project_id', project.id);

  const usedSeats = Math.max(1, existingMembers?.length || 1);
  if (usedSeats >= seatLimit) {
    throw AppError.limitExceeded(
      `Team member limit reached (${usedSeats}/${seatLimit} on ${plan} plan). Upgrade your plan to add more members.`
    );
  }

  const normalizedEmail = email.trim().toLowerCase();
  const { data: invitedUser } = await supabase
    .from('users')
    .select('id, email, name')
    .eq('email', normalizedEmail)
    .maybeSingle();

  if (!invitedUser) {
    throw AppError.notFound('No WebPulse user found with that email address');
  }

  if (existingMembers?.some((m) => m.user_id === invitedUser.id)) {
    throw AppError.conflict('User is already a member of this project');
  }

  const { data: created, error } = await supabase
    .from('project_members')
    .insert({
      project_id: project.id,
      user_id: invitedUser.id,
      role,
    })
    .select('*')
    .single();

  if (error) throw error;

  await NotificationService.create(
    invitedUser.id,
    'Project Invitation',
    `You were added to project "${project.name}" as ${role}.`,
    'info'
  );

  await ActivityLogService.log(
    project.id,
    req.user.id,
    'team.member_added',
    `Added ${normalizedEmail} as ${role}`,
    'success',
    req.ip,
    { member_user_id: invitedUser.id, role }
  );

  res.status(201).json(created);
});

export const removeProjectMember = asyncHandler(async (req, res) => {
  const project = await resolveOwnedProject(req.params.id, req.user.id);
  const { memberUserId } = req.params;

  if (memberUserId === req.user.id || memberUserId === project.user_id || memberUserId === project.owner_id) {
    throw AppError.badRequest('The project owner cannot be removed');
  }

  const { error } = await supabase
    .from('project_members')
    .delete()
    .eq('project_id', project.id)
    .eq('user_id', memberUserId);

  if (error) throw error;

  await ActivityLogService.log(
    project.id,
    req.user.id,
    'team.member_removed',
    `Removed member ${memberUserId}`,
    'success',
    req.ip,
    { member_user_id: memberUserId }
  );

  res.json({ success: true });
});

export default {
  getProjectMembers,
  inviteProjectMember,
  removeProjectMember,
};
