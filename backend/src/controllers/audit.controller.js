import supabase from '../config/supabase.js';
import { getPlanConfig, normalizePlanId } from '../config/plans.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../errors/AppError.js';

export const getAuditLogs = asyncHandler(async (req, res) => {
  const plan = normalizePlanId(req.user?.plan || 'nano');
  const cfg = getPlanConfig(plan);

  if (!['max', 'enterprise'].includes(plan)) {
    throw AppError.forbidden(
      'Advanced audit logs require the Max plan.',
      'FEATURE_LOCKED',
      { feature: 'advanced_audit_logs', plan, upgradeRequired: true }
    );
  }

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 25));
  const offset = (page - 1) * limit;
  const actionFilter = req.query.action ? String(req.query.action).trim() : null;
  const targetFilter = req.query.target ? String(req.query.target).trim() : null;

  let query = supabase
    .from('audit_logs')
    .select('id, user_id, action, target, metadata, created_at', { count: 'exact' })
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false });

  if (actionFilter) {
    query = query.eq('action', actionFilter);
  }
  if (targetFilter) {
    query = query.eq('target', targetFilter);
  }
  if (req.query.startDate) {
    query = query.gte('created_at', new Date(req.query.startDate).toISOString());
  }
  if (req.query.endDate) {
    query = query.lte('created_at', new Date(req.query.endDate).toISOString());
  }

  const { data: logs, count, error } = await query;
  if (error) throw error;

  const all = Array.isArray(logs) ? logs : [];
  const paged = all.slice(offset, offset + limit);

  res.json({
    logs: paged,
    total: count ?? all.length,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil((count ?? all.length) / limit)),
    retentionDays: cfg.limits.retention_days,
  });
});

export const rejectAuditMutation = asyncHandler(async (_req, _res) => {
  throw AppError.forbidden('Audit logs are immutable and cannot be modified or deleted.', 'AUDIT_IMMUTABLE');
});

export default {
  getAuditLogs,
  rejectAuditMutation,
};
