import { resolveAuthorizedProject } from '../utils/projectAuth.js';
import originService from '../services/origin.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../errors/AppError.js';

export const getProjectOrigins = asyncHandler(async (req, res) => {
  const project = await resolveAuthorizedProject(req.params.id, req.user.id, 'viewer');
  const origins = await originService.listOrigins(project.id);
  res.json(origins);
});

export const addProjectOrigin = asyncHandler(async (req, res) => {
  const project = await resolveAuthorizedProject(req.params.id, req.user.id, 'admin');
  const { origin, verificationMethod } = req.body || {};

  const created = await originService.registerOrigin({
    projectId: project.id,
    userId: project.owner_id || project.user_id,
    rawOrigin: origin,
    verificationMethod,
  });

  res.status(201).json(created);
});

export const verifyProjectOrigin = asyncHandler(async (req, res) => {
  const project = await resolveAuthorizedProject(req.params.id, req.user.id, 'admin');
  const { method } = req.body || {};

  const verified = await originService.verifyOrigin({
    projectId: project.id,
    originId: req.params.originId,
    userId: project.owner_id || project.user_id,
    method,
  });

  res.json(verified);
});

export const toggleBlockProjectOrigin = asyncHandler(async (req, res) => {
  const project = await resolveAuthorizedProject(req.params.id, req.user.id, 'admin');
  const { blocked } = req.body || {};

  if (typeof blocked !== 'boolean') {
    throw AppError.badRequest('Boolean "blocked" field is required');
  }

  const updated = await originService.setOriginBlocked({
    projectId: project.id,
    originId: req.params.originId,
    userId: project.owner_id || project.user_id,
    blocked,
  });

  res.json(updated);
});

export const deleteProjectOrigin = asyncHandler(async (req, res) => {
  const project = await resolveAuthorizedProject(req.params.id, req.user.id, 'admin');
  const result = await originService.removeOrigin({
    projectId: project.id,
    originId: req.params.originId,
    userId: project.owner_id || project.user_id,
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
