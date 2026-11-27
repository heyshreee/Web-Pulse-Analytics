import supabase from '../config/supabase.js';
import { isUuid } from '../utils/uuid.js';
import shareService from '../services/share.service.js';
import usageService from '../services/usage.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../errors/AppError.js';

async function resolveOwnedProject(idOrName, userId) {
  let query = supabase
    .from('projects')
    .select('id, name, user_id, timezone, created_at')
    .eq('user_id', userId);

  if (isUuid(idOrName)) {
    query = query.eq('id', idOrName);
  } else if (String(idOrName).startsWith('trk_')) {
    query = query.eq('tracking_id', idOrName);
  } else {
    query = query.eq('name', idOrName);
  }

  const { data: project, error } = await query.maybeSingle();
  if (error) throw error;
  if (!project) throw AppError.notFound('Project not found');
  return project;
}

export const listSharedReports = asyncHandler(async (req, res) => {
  const project = await resolveOwnedProject(req.params.id, req.user.id);
  const result = await shareService.listProjectSharedReports(project.id, req.user);
  res.json(result);
});

export const createSharedReport = asyncHandler(async (req, res) => {
  const project = await resolveOwnedProject(req.params.id, req.user.id);
  const created = await shareService.createSharedReport({
    project,
    user: req.user,
    body: req.body || {},
  });

  if (global.io) {
    const updatedUsage = await usageService.calculateUsage(req.user.id);
    global.io.to(`user_${req.user.id}`).emit('usage_update', updatedUsage);
  }

  res.status(201).json(created);
});

export const revokeSharedReport = asyncHandler(async (req, res) => {
  const project = await resolveOwnedProject(req.params.id, req.user.id);
  const result = await shareService.revokeSharedReport({
    projectId: project.id,
    userId: req.user.id,
    reportId: req.params.reportId || null,
  });

  if (global.io) {
    const updatedUsage = await usageService.calculateUsage(req.user.id);
    global.io.to(`user_${req.user.id}`).emit('usage_update', updatedUsage);
  }

  res.json(result);
});

export const getPublicSharedReport = asyncHandler(async (req, res) => {
  const result = await shareService.resolvePublicSharedReport(req.params.shareToken);
  res.setHeader('Cache-Control', 'no-store');
  res.json(result);
});

export default {
  listSharedReports,
  createSharedReport,
  revokeSharedReport,
  getPublicSharedReport,
};
