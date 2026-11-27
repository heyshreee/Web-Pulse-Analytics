import supabase from '../config/supabase.js';
import { isUuid } from '../utils/uuid.js';
import originService from '../services/origin.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../errors/AppError.js';

async function resolveOwnedProject(idOrName, userId) {
  let query = supabase
    .from('projects')
    .select('id, name, user_id')
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

export const getProjectOrigins = asyncHandler(async (req, res) => {
  const project = await resolveOwnedProject(req.params.id, req.user.id);
  const origins = await originService.listOrigins(project.id);
  res.json(origins);
});

export const addProjectOrigin = asyncHandler(async (req, res) => {
  const project = await resolveOwnedProject(req.params.id, req.user.id);
  const { origin, verificationMethod } = req.body || {};

  const created = await originService.registerOrigin({
    projectId: project.id,
    userId: req.user.id,
    rawOrigin: origin,
    verificationMethod,
  });

  res.status(201).json(created);
});

export const verifyProjectOrigin = asyncHandler(async (req, res) => {
  const project = await resolveOwnedProject(req.params.id, req.user.id);
  const { method } = req.body || {};

  const verified = await originService.verifyOrigin({
    projectId: project.id,
    originId: req.params.originId,
    userId: req.user.id,
    method,
  });

  res.json(verified);
});

export const toggleBlockProjectOrigin = asyncHandler(async (req, res) => {
  const project = await resolveOwnedProject(req.params.id, req.user.id);
  const { blocked } = req.body || {};

  if (typeof blocked !== 'boolean') {
    throw AppError.badRequest('Boolean "blocked" field is required');
  }

  const updated = await originService.setOriginBlocked({
    projectId: project.id,
    originId: req.params.originId,
    userId: req.user.id,
    blocked,
  });

  res.json(updated);
});

export const deleteProjectOrigin = asyncHandler(async (req, res) => {
  const project = await resolveOwnedProject(req.params.id, req.user.id);
  const result = await originService.removeOrigin({
    projectId: project.id,
    originId: req.params.originId,
    userId: req.user.id,
  });
  res.json(result);
});

export default {
  getProjectOrigins,
  addProjectOrigin,
  verifyProjectOrigin,
  toggleBlockProjectOrigin,
  deleteProjectOrigin,
};
