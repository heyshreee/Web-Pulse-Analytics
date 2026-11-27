import supabase from '../config/supabase.js';
import { hasSurfaceAccess, normalizePlanId } from '../config/plans.js';
import { logAction } from '../services/audit.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../errors/AppError.js';

export const ALPHA_EXPERIMENTAL_FLAGS = {
  alpha_funnel_explorer: {
    key: 'alpha_funnel_explorer',
    name: 'Funnel Explorer',
    description: 'Multi-step conversion funnel preview across verified origins.',
    unstable: true,
    defaultEnabled: false,
    warning: 'Experimental & unstable: funnel calculations may change.',
  },
  alpha_anomaly_alerts: {
    key: 'alpha_anomaly_alerts',
    name: 'Traffic Anomaly Detection',
    description: 'Automated spike/drop detection across daily traffic.',
    unstable: true,
    defaultEnabled: false,
    warning: 'Experimental & unstable: sensitivity thresholds are under active tuning.',
  },
  alpha_cohort_retention: {
    key: 'alpha_cohort_retention',
    name: 'Cohort Retention Matrix',
    description: 'Weekly returning-visitor cohort matrix.',
    unstable: true,
    defaultEnabled: false,
    warning: 'Experimental & unstable: early preview.',
  },
};

async function requireEligibleAlphaAccount(req) {
  const plan = normalizePlanId(req.user?.plan || 'nano');
  if (!hasSurfaceAccess(plan, 'alpha')) {
    throw AppError.forbidden(
      'Alpha access is restricted to eligible Max accounts.',
      'SURFACE_ACCESS_DENIED',
      { surface: 'alpha', plan, upgradeRequired: true }
    );
  }

  const { data: userRow } = await supabase
    .from('users')
    .select('id, alpha_revoked, alpha_flags')
    .eq('id', req.user.id)
    .maybeSingle();

  if (userRow?.alpha_revoked === true) {
    throw AppError.forbidden(
      'Alpha access has been revoked for this account. V1 and V2 remain unaffected.',
      'ALPHA_REVOKED',
      { surface: 'alpha', revoked: true }
    );
  }

  return {
    plan,
    flags: userRow?.alpha_flags && typeof userRow.alpha_flags === 'object' ? userRow.alpha_flags : {},
  };
}

export const getAlphaFeatures = asyncHandler(async (req, res) => {
  const { plan, flags } = await requireEligibleAlphaAccount(req);

  const features = Object.values(ALPHA_EXPERIMENTAL_FLAGS).map((def) => ({
    ...def,
    enabled: flags[def.key] !== undefined ? Boolean(flags[def.key]) : def.defaultEnabled,
  }));

  res.json({
    plan,
    alphaEligible: true,
    isolatedFromV1: true,
    warning: 'Alpha features are experimental and unstable. Enable individual flags at your own discretion.',
    features,
  });
});

export const toggleAlphaFlag = asyncHandler(async (req, res) => {
  const { flags } = await requireEligibleAlphaAccount(req);
  const { flagKey } = req.params;
  const enabled = Boolean(req.body?.enabled);

  if (!ALPHA_EXPERIMENTAL_FLAGS[flagKey]) {
    throw AppError.notFound(`Unknown experimental flag: ${flagKey}`, 'ALPHA_FLAG_NOT_FOUND');
  }

  const nextFlags = { ...flags, [flagKey]: enabled };
  const { error } = await supabase
    .from('users')
    .update({ alpha_flags: nextFlags })
    .eq('id', req.user.id);

  if (error) throw error;

  await logAction(
    req.user.id,
    'alpha.flag_updated',
    { flagKey, enabled },
    flagKey
  );

  res.json({ flagKey, enabled, flags: nextFlags });
});

export const runAlphaExperiment = asyncHandler(async (req, res) => {
  const { flags } = await requireEligibleAlphaAccount(req);
  const { flagKey } = req.params;
  const def = ALPHA_EXPERIMENTAL_FLAGS[flagKey];

  if (!def) {
    throw AppError.notFound(`Unknown experimental flag: ${flagKey}`, 'ALPHA_FLAG_NOT_FOUND');
  }

  const isEnabled = flags[flagKey] !== undefined ? Boolean(flags[flagKey]) : def.defaultEnabled;
  if (!isEnabled) {
    throw AppError.forbidden(
      `Experimental feature "${def.name}" is not enabled for this account.`,
      'ALPHA_FLAG_DISABLED',
      { flagKey }
    );
  }

  await supabase.from('alpha_feature_usage').insert({
    user_id: req.user.id,
    feature_key: flagKey,
    metadata: { source: 'api' },
  });

  res.json({
    flagKey,
    experimental: true,
    warning: def.warning,
    executedAt: new Date().toISOString(),
  });
});

export const revokeAlphaAccess = asyncHandler(async (req, res) => {
  await requireEligibleAlphaAccount(req);

  const { error } = await supabase
    .from('users')
    .update({ alpha_revoked: true })
    .eq('id', req.user.id);

  if (error) throw error;

  await logAction(
    req.user.id,
    'alpha.access_revoked',
    { reason: req.body?.reason || 'user_or_admin_revoked' },
    req.user.id
  );

  res.json({
    success: true,
    alphaRevoked: true,
    v1Unaffected: true,
    v2Unaffected: true,
  });
});

export default {
  getAlphaFeatures,
  toggleAlphaFlag,
  runAlphaExperiment,
  revokeAlphaAccess,
};
