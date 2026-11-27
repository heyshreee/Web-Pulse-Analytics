import crypto from 'crypto';
import supabase from '../config/supabase.js';
import { getPlanConfig, normalizePlanId } from '../config/plans.js';
import { resolveAuthorizedProject } from '../utils/projectAuth.js';
import ActivityLogService from '../services/activity.service.js';
import NotificationService from '../services/notification.service.js';
import { logAction } from '../services/audit.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../errors/AppError.js';

function hashInviteToken(rawToken) {
  return crypto.createHash('sha256').update(String(rawToken)).digest('hex');
}

export const getProjectMembers = asyncHandler(async (req, res) => {
  const project = await resolveAuthorizedProject(req.params.id, req.user.id, 'viewer');

  const ownerId = project.owner_id || project.user_id;
  const { data: ownerUser } = await supabase
    .from('users')
    .select('plan, email, name')
    .eq('id', ownerId)
    .maybeSingle();

  const plan = normalizePlanId(ownerUser?.plan || req.user.plan || 'nano');
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
            id: `owner-${ownerId}`,
            project_id: project.id,
            user_id: ownerId,
            role: 'owner',
            status: 'active',
            email: ownerUser?.email || req.user.email,
            name: ownerUser?.name || req.user.name,
          },
        ];

  const { data: invitations } = await supabase
    .from('project_invitations')
    .select('id, invited_email, role, status, expires_at, created_at')
    .eq('project_id', project.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  const pendingList = Array.isArray(invitations) ? invitations : [];
  const usedSeats = normalizedMembers.length + pendingList.length;

  res.json({
    members: normalizedMembers,
    invitations: pendingList,
    used: usedSeats,
    limit,
    canInvite:
      project.memberRole === 'owner' &&
      Boolean(planConfig.features.team_collaboration) &&
      usedSeats < limit,
    plan,
    currentRole: project.memberRole,
  });
});

export const inviteProjectMember = asyncHandler(async (req, res) => {
  const project = await resolveAuthorizedProject(req.params.id, req.user.id, 'owner');
  const { email, role = 'viewer' } = req.body || {};

  const plan = normalizePlanId(req.user.plan || 'nano');
  const planConfig = getPlanConfig(plan);
  const seatLimit = planConfig.limits.team_members;

  if (!planConfig.features.team_collaboration || seatLimit <= 1) {
    throw AppError.forbidden(
      `Team invitations are not enabled on the ${planConfig.name} plan (maximum ${seatLimit} team member). Upgrade to Lite or higher to invite collaborators.`,
      'TEAM_LIMIT_REACHED',
      {
        used: 1,
        limit: seatLimit,
        plan,
        upgradeRequired: true,
      }
    );
  }

  // Strictly forbid role escalation to 'owner'
  const allowedRoles = ['max', 'enterprise'].includes(plan)
    ? ['admin', 'analyst', 'viewer']
    : ['admin', 'viewer'];
  if (!allowedRoles.includes(role)) {
    throw AppError.badRequest(
      `Role must be ${allowedRoles.join(', ')} (owner role cannot be assigned)`,
      'INVALID_ROLE'
    );
  }

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    throw AppError.badRequest('Valid member email is required');
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (req.user.email && normalizedEmail === req.user.email.toLowerCase()) {
    throw AppError.badRequest('You cannot invite yourself to your own project');
  }

  const { data: existingMembers } = await supabase
    .from('project_members')
    .select('id, user_id')
    .eq('project_id', project.id);

  const { data: pendingInvites } = await supabase
    .from('project_invitations')
    .select('id, invited_email')
    .eq('project_id', project.id)
    .eq('status', 'pending');

  const activeCount = Math.max(1, existingMembers?.length || 1);
  const pendingCount = pendingInvites?.length || 0;
  const usedSeats = activeCount + pendingCount;

  if (usedSeats >= seatLimit) {
    throw AppError.limitExceeded(
      `Team member limit reached (${usedSeats}/${seatLimit} on ${plan} plan). Upgrade your plan to add more members.`
    );
  }

  if (pendingInvites?.some((inv) => String(inv.invited_email).toLowerCase() === normalizedEmail)) {
    throw AppError.conflict('An active invitation is already pending for this email');
  }

  const { data: invitedUser } = await supabase
    .from('users')
    .select('id, email, name')
    .eq('email', normalizedEmail)
    .maybeSingle();

  if (invitedUser && existingMembers?.some((m) => m.user_id === invitedUser.id)) {
    throw AppError.conflict('User is already a member of this project');
  }

  const rawToken = crypto.randomBytes(24).toString('hex');
  const tokenHash = hashInviteToken(rawToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: invitation, error } = await supabase
    .from('project_invitations')
    .insert({
      project_id: project.id,
      invited_by: req.user.id,
      invited_email: normalizedEmail,
      role,
      token_hash: tokenHash,
      status: 'pending',
      expires_at: expiresAt,
    })
    .select('id, project_id, invited_email, role, status, expires_at, created_at')
    .single();

  if (error) throw error;

  if (invitedUser) {
    await NotificationService.create(
      invitedUser.id,
      'Project Invitation',
      `You were invited to join "${project.name}" as ${role}.`,
      'info'
    );
  }

  await ActivityLogService.log(
    project.id,
    req.user.id,
    'team.invitation_created',
    `Invited ${normalizedEmail} as ${role}`,
    'success',
    req.ip,
    { invited_email: normalizedEmail, role }
  );

  res.status(201).json({
    invitation,
    inviteToken: rawToken,
  });
});

export const acceptProjectInvitation = asyncHandler(async (req, res) => {
  const rawToken = req.params.token || req.body?.token;
  if (!rawToken) {
    throw AppError.badRequest('Invitation token is required');
  }

  const tokenHash = hashInviteToken(rawToken);
  const { data: invitation, error } = await supabase
    .from('project_invitations')
    .select('*')
    .eq('token_hash', tokenHash)
    .maybeSingle();

  if (error) throw error;
  if (!invitation) {
    throw AppError.notFound('Invitation not found or invalid', 'INVITATION_NOT_FOUND');
  }

  if (invitation.status !== 'pending') {
    throw AppError.badRequest(`Invitation has already been ${invitation.status}`, 'INVITATION_INACTIVE');
  }

  if (new Date(invitation.expires_at) <= new Date()) {
    await supabase
      .from('project_invitations')
      .update({ status: 'expired' })
      .eq('id', invitation.id);
    throw AppError.badRequest('Invitation has expired', 'INVITATION_EXPIRED');
  }

  if (
    req.user.email &&
    String(invitation.invited_email).toLowerCase() !== String(req.user.email).toLowerCase()
  ) {
    throw AppError.forbidden('This invitation belongs to a different email address', 'FORBIDDEN');
  }

  const { data: project } = await supabase
    .from('projects')
    .select('id, name, user_id, owner_id')
    .eq('id', invitation.project_id)
    .single();

  if (!project) {
    throw AppError.notFound('Project not found');
  }

  const ownerId = project.owner_id || project.user_id;
  const { data: owner } = await supabase
    .from('users')
    .select('plan')
    .eq('id', ownerId)
    .single();

  const plan = normalizePlanId(owner?.plan || 'nano');
  const seatLimit = getPlanConfig(plan).limits.team_members;

  const { data: existingMembers } = await supabase
    .from('project_members')
    .select('id, user_id')
    .eq('project_id', project.id);

  const usedSeats = Math.max(1, existingMembers?.length || 1);
  if (usedSeats >= seatLimit && !existingMembers?.some((m) => m.user_id === req.user.id)) {
    throw AppError.limitExceeded(`Project team member limit (${seatLimit}) has been reached.`);
  }

  const assignedRole = ['admin', 'analyst', 'viewer'].includes(invitation.role)
    ? invitation.role
    : 'viewer';

  const { data: member, error: memErr } = await supabase
    .from('project_members')
    .upsert(
      {
        project_id: project.id,
        user_id: req.user.id,
        role: assignedRole,
        status: 'active',
      },
      { onConflict: 'project_id,user_id' }
    )
    .select('*')
    .single();

  if (memErr) throw memErr;

  await supabase
    .from('project_invitations')
    .update({ status: 'accepted', responded_at: new Date().toISOString() })
    .eq('id', invitation.id);

  await ActivityLogService.log(
    project.id,
    req.user.id,
    'team.invitation_accepted',
    `${req.user.email} accepted invitation as ${assignedRole}`,
    'success',
    req.ip,
    { role: assignedRole }
  );

  res.json({ success: true, member, role: assignedRole, projectId: project.id });
});

export const rejectProjectInvitation = asyncHandler(async (req, res) => {
  const rawToken = req.params.token || req.body?.token;
  if (!rawToken) {
    throw AppError.badRequest('Invitation token is required');
  }

  const tokenHash = hashInviteToken(rawToken);
  const { data: invitation } = await supabase
    .from('project_invitations')
    .select('*')
    .eq('token_hash', tokenHash)
    .maybeSingle();

  if (!invitation) {
    throw AppError.notFound('Invitation not found', 'INVITATION_NOT_FOUND');
  }

  if (
    req.user.email &&
    String(invitation.invited_email).toLowerCase() !== String(req.user.email).toLowerCase()
  ) {
    throw AppError.forbidden('This invitation belongs to a different email address');
  }

  await supabase
    .from('project_invitations')
    .update({ status: 'rejected', responded_at: new Date().toISOString() })
    .eq('id', invitation.id);

  res.json({ success: true, status: 'rejected' });
});

export const revokeProjectInvitation = asyncHandler(async (req, res) => {
  const project = await resolveAuthorizedProject(req.params.id, req.user.id, 'owner');
  const { invitationId } = req.params;

  const { data: invitation } = await supabase
    .from('project_invitations')
    .select('id, status')
    .eq('id', invitationId)
    .eq('project_id', project.id)
    .maybeSingle();

  if (!invitation) {
    throw AppError.notFound('Invitation not found');
  }

  await supabase
    .from('project_invitations')
    .update({ status: 'revoked', responded_at: new Date().toISOString() })
    .eq('id', invitationId)
    .eq('project_id', project.id);

  res.json({ success: true, status: 'revoked' });
});

export const removeProjectMember = asyncHandler(async (req, res) => {
  const project = await resolveAuthorizedProject(req.params.id, req.user.id, 'owner');
  const targetId = req.params.memberId || req.params.memberUserId;

  if (targetId === req.user.id || targetId === project.user_id || targetId === project.owner_id) {
    throw AppError.badRequest('The project owner cannot be removed');
  }

  await supabase
    .from('project_members')
    .delete()
    .eq('project_id', project.id)
    .or(`user_id.eq.${targetId},id.eq.${targetId}`);

  await ActivityLogService.log(
    project.id,
    req.user.id,
    'team.member_removed',
    `Removed member ${targetId}`,
    'success',
    req.ip,
    { member_target: targetId }
  );

  await logAction(req.user.id, 'team.member_removed', { projectId: project.id, memberTarget: targetId }, project.id);

  res.json({ success: true });
});

export const updateProjectMemberRole = asyncHandler(async (req, res) => {
  const project = await resolveAuthorizedProject(req.params.id, req.user.id, 'owner');
  const targetId = req.params.memberId || req.params.memberUserId;
  const { role } = req.body || {};
  const plan = normalizePlanId(req.user.plan || 'nano');

  const allowedRoles = ['max', 'enterprise'].includes(plan)
    ? ['admin', 'analyst', 'viewer']
    : ['admin', 'viewer'];

  if (!allowedRoles.includes(role)) {
    throw AppError.badRequest(
      `Role must be ${allowedRoles.join(', ')} (privilege escalation to owner is forbidden)`,
      'INVALID_ROLE'
    );
  }

  if (targetId === req.user.id || targetId === project.user_id || targetId === project.owner_id) {
    throw AppError.forbidden('The project owner role cannot be modified', 'PRIVILEGE_ESCALATION_BLOCKED');
  }

  const { data: updated, error } = await supabase
    .from('project_members')
    .update({ role })
    .eq('project_id', project.id)
    .or(`user_id.eq.${targetId},id.eq.${targetId}`)
    .select('*')
    .single();

  if (error || !updated) {
    throw AppError.notFound('Project member not found');
  }

  await logAction(
    req.user.id,
    'team.role_changed',
    { projectId: project.id, memberTarget: targetId, newRole: role },
    project.id
  );

  res.json(updated);
});

export default {
  getProjectMembers,
  inviteProjectMember,
  acceptProjectInvitation,
  rejectProjectInvitation,
  revokeProjectInvitation,
  removeProjectMember,
  updateProjectMemberRole,
};
