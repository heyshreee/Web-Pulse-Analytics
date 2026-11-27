import { resolveAuthorizedProject } from '../utils/projectAuth.js';
import shareService from '../services/share.service.js';
import usageService from '../services/usage.service.js';
import asyncHandler from '../utils/asyncHandler.js';

export const listSharedReports = asyncHandler(async (req, res) => {
  const project = await resolveAuthorizedProject(req.params.id, req.user.id, 'viewer');
  const result = await shareService.listProjectSharedReports(project.id, req.user);
  res.json(result);
});

export const createSharedReport = asyncHandler(async (req, res) => {
  const project = await resolveAuthorizedProject(req.params.id, req.user.id, 'admin');
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
  const project = await resolveAuthorizedProject(req.params.id, req.user.id, 'admin');
  const result = await shareService.revokeSharedReport({
    projectId: project.id,
    userId: project.owner_id || project.user_id,
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
