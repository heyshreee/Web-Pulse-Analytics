import crypto from 'node:crypto';
import supabase from '../config/supabase.js';
import NotificationService from './notification.service.js';
import ActivityLogService from './activity.service.js';
import { getPlanConfig, normalizePlanId } from '../config/plans.js';
import { getClientIp } from '../utils/ip.js';
import {
  extractExactOriginFromHeaders,
  parseAndNormalizeOrigin,
  verifyOriginDnsTxt,
  verifyOriginFile,
} from '../utils/origin.js';
import AppError from '../errors/AppError.js';

function buildVerificationInstructions(originRow) {
  return {
    dns_txt: {
      type: 'TXT',
      host: `_webpulse-verify.${originRow.hostname}`,
      value: `webpulse-verification=${originRow.verification_token}`,
    },
    file: {
      url: `${originRow.origin}/.well-known/webpulse-verify-${originRow.verification_token}.txt`,
      content: `webpulse-verification=${originRow.verification_token}`,
    },
  };
}

export async function syncLegacyAllowedOrigins(projectId) {
  try {
    const { data: rows, error } = await supabase
      .from('project_origins')
      .select('origin, status')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (error || !Array.isArray(rows)) return;

    const verifiedOrigins = rows
      .filter((r) => r.status === 'verified')
      .map((r) => r.origin)
      .join(',');

    await supabase
      .from('projects')
      .update({ allowed_origins: verifiedOrigins || null })
      .eq('id', projectId);
  } catch {
    // Non-fatal sync
  }
}

export async function listOrigins(projectId) {
  const { data: rows, error } = await supabase
    .from('project_origins')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });

  if (!error && Array.isArray(rows)) {
    return rows.map((row) => ({
      ...row,
      instructions: buildVerificationInstructions(row),
    }));
  }

  // Fallback for pre-migration schemas
  const { data: project } = await supabase
    .from('projects')
    .select('id, allowed_origins')
    .eq('id', projectId)
    .maybeSingle();

  if (!project?.allowed_origins) return [];

  return String(project.allowed_origins)
    .split(',')
    .map((item) => parseAndNormalizeOrigin(item))
    .filter((p) => p.valid)
    .map((p, idx) => ({
      id: `legacy-${idx}`,
      project_id: projectId,
      origin: p.origin,
      hostname: p.hostname,
      status: 'verified',
      verification_method: 'legacy_migration',
      verification_token: null,
      verified_at: null,
      blocked_at: null,
    }));
}

export async function registerOrigin({ projectId, userId, rawOrigin, verificationMethod = 'dns_txt' }) {
  const parsed = parseAndNormalizeOrigin(rawOrigin);
  if (!parsed.valid) {
    throw AppError.badRequest(parsed.error, 'INVALID_ORIGIN');
  }

  if (verificationMethod && !['dns_txt', 'file'].includes(verificationMethod)) {
    throw AppError.badRequest('Verification method must be dns_txt or file', 'INVALID_VERIFICATION_METHOD');
  }

  const { data: owner } = await supabase
    .from('users')
    .select('plan')
    .eq('id', userId)
    .single();

  const plan = normalizePlanId(owner?.plan || 'nano');
  const planConfig = getPlanConfig(plan);
  const maxOrigins = planConfig.limits.origins_per_project;

  const existing = await listOrigins(projectId);
  if (existing.some((item) => item.origin === parsed.origin)) {
    throw AppError.conflict('This origin is already registered for this project', 'ORIGIN_ALREADY_EXISTS');
  }

  if (existing.length >= maxOrigins) {
    throw AppError.limitExceeded(
      `Origin limit reached on ${plan} plan (${existing.length}/${maxOrigins} origins allowed per project). Remove an origin or upgrade your plan.`
    );
  }

  const verificationToken = crypto.randomBytes(18).toString('hex');

  const { data: inserted, error } = await supabase
    .from('project_origins')
    .insert({
      project_id: projectId,
      origin: parsed.origin,
      hostname: parsed.hostname,
      status: 'pending',
      verification_method: verificationMethod || 'dns_txt',
      verification_token: verificationToken,
    })
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') {
      throw AppError.conflict('This origin is already registered for this project', 'ORIGIN_ALREADY_EXISTS');
    }
    throw error;
  }

  await ActivityLogService.log(
    projectId,
    userId,
    'origin.register',
    `Registered pending origin ${parsed.origin}`,
    'success',
    null,
    { origin: parsed.origin }
  );

  return {
    ...inserted,
    instructions: buildVerificationInstructions(inserted),
  };
}

export async function verifyOrigin({
  projectId,
  originId,
  userId,
  method,
  dnsResolver,
  fetcher,
}) {
  const { data: originRow, error } = await supabase
    .from('project_origins')
    .select('*')
    .eq('id', originId)
    .eq('project_id', projectId)
    .maybeSingle();

  if (error) throw error;
  if (!originRow) {
    throw AppError.notFound('Registered origin not found', 'ORIGIN_NOT_FOUND');
  }

  if (originRow.status === 'blocked') {
    throw AppError.forbidden('Blocked origins cannot be verified until unblocked', 'ORIGIN_BLOCKED');
  }

  const activeMethod = method || originRow.verification_method || 'dns_txt';
  if (!['dns_txt', 'file'].includes(activeMethod)) {
    throw AppError.badRequest('Verification method must be dns_txt or file', 'INVALID_VERIFICATION_METHOD');
  }

  const checkResult =
    activeMethod === 'file'
      ? await verifyOriginFile(originRow.origin, originRow.verification_token, fetcher)
      : await verifyOriginDnsTxt(originRow.hostname, originRow.verification_token, dnsResolver);

  const nowIso = new Date().toISOString();

  if (!checkResult.verified) {
    await supabase
      .from('project_origins')
      .update({ last_checked_at: nowIso })
      .eq('id', originId)
      .eq('project_id', projectId);

    throw AppError.badRequest(
      checkResult.reason || 'Domain ownership verification failed',
      'ORIGIN_VERIFICATION_FAILED'
    );
  }

  const { data: updated, error: updateErr } = await supabase
    .from('project_origins')
    .update({
      status: 'verified',
      verification_method: activeMethod,
      verified_at: nowIso,
      last_checked_at: nowIso,
    })
    .eq('id', originId)
    .eq('project_id', projectId)
    .select('*')
    .single();

  if (updateErr) throw updateErr;

  await syncLegacyAllowedOrigins(projectId);

  await NotificationService.create(
    userId,
    'Origin Verified',
    `Domain ${originRow.origin} was verified via ${activeMethod === 'file' ? 'verification file' : 'DNS TXT'} and can now send telemetry.`,
    'success'
  );

  await ActivityLogService.log(
    projectId,
    userId,
    'origin.verified',
    `Origin ${originRow.origin} verified via ${activeMethod}`,
    'success',
    null,
    { origin: originRow.origin, method: activeMethod }
  );

  return {
    ...updated,
    instructions: buildVerificationInstructions(updated),
  };
}

export async function setOriginBlocked({ projectId, originId, userId, blocked }) {
  const { data: originRow, error } = await supabase
    .from('project_origins')
    .select('*')
    .eq('id', originId)
    .eq('project_id', projectId)
    .maybeSingle();

  if (error) throw error;
  if (!originRow) {
    throw AppError.notFound('Registered origin not found', 'ORIGIN_NOT_FOUND');
  }

  const nowIso = new Date().toISOString();
  const nextStatus = blocked ? 'blocked' : originRow.verified_at ? 'verified' : 'pending';

  const { data: updated, error: updateErr } = await supabase
    .from('project_origins')
    .update({
      status: nextStatus,
      blocked_at: blocked ? nowIso : null,
    })
    .eq('id', originId)
    .eq('project_id', projectId)
    .select('*')
    .single();

  if (updateErr) throw updateErr;

  await syncLegacyAllowedOrigins(projectId);

  await NotificationService.create(
    userId,
    blocked ? 'Origin Blocked' : 'Origin Unblocked',
    blocked
      ? `Telemetry ingestion from ${originRow.origin} has been blocked.`
      : `Origin ${originRow.origin} was unblocked (status: ${nextStatus}).`,
    blocked ? 'security' : 'info'
  );

  await ActivityLogService.log(
    projectId,
    userId,
    blocked ? 'origin.blocked' : 'origin.unblocked',
    `${originRow.origin} ${blocked ? 'blocked' : 'unblocked'}`,
    blocked ? 'warning' : 'success',
    null,
    { origin: originRow.origin, status: nextStatus }
  );

  return {
    ...updated,
    instructions: buildVerificationInstructions(updated),
  };
}

export async function removeOrigin({ projectId, originId, userId }) {
  const { data: originRow, error } = await supabase
    .from('project_origins')
    .select('*')
    .eq('id', originId)
    .eq('project_id', projectId)
    .maybeSingle();

  if (error) throw error;
  if (!originRow) {
    throw AppError.notFound('Registered origin not found', 'ORIGIN_NOT_FOUND');
  }

  const { error: delErr } = await supabase
    .from('project_origins')
    .delete()
    .eq('id', originId)
    .eq('project_id', projectId);

  if (delErr) throw delErr;

  await syncLegacyAllowedOrigins(projectId);

  await ActivityLogService.log(
    projectId,
    userId,
    'origin.removed',
    `Removed origin ${originRow.origin}`,
    'success',
    null,
    { origin: originRow.origin }
  );

  return { success: true, removedOrigin: originRow.origin };
}

async function recordSecurityRejection({ project, req, reasonCode, detailMessage, exactOrigin }) {
  const ip = getClientIp(req);
  if (project.user_id) {
    await NotificationService.create(
      project.user_id,
      'Security Alert: Unauthorized Origin Blocked',
      detailMessage,
      'security'
    );

    await ActivityLogService.log(
      project.id,
      project.user_id,
      'security.alert',
      detailMessage,
      'failure',
      ip,
      {
        resource: req.originalUrl,
        http_method: req.method,
        http_status: 403,
        user_agent: req.headers['user-agent'],
        event_type: 'security.alert',
        reason: reasonCode,
        origin: exactOrigin || req.headers?.origin || null,
      }
    );
  }
}

/**
 * Strictly validates an analytics ingestion request's origin against exact
 * verified origins registered on the project.
 *
 * - Never trusts HTTP Origin headers as authentication.
 * - Never auto-authorizes subdomains.
 * - Rejects pending, blocked, and unregistered origins, logging security alerts.
 */
export async function validateIngestionOrigin({ project, req, hasSecretApiKey = false }) {
  const origins = await listOrigins(project.id);
  const exactOrigin = extractExactOriginFromHeaders(req);

  if (!origins.length) {
    // Allow legacy projects without configured origins only if authenticated with secret API key
    // or until the owner registers origins. Once any origin is registered, exact match is mandatory.
    return { allowed: true, origin: exactOrigin };
  }

  if (!exactOrigin) {
    // Server-to-server ingestion authenticated with a secret wpk_ API key does not send Origin.
    if (hasSecretApiKey && !req.headers?.origin && !req.headers?.referer) {
      return { allowed: true, origin: null };
    }

    await recordSecurityRejection({
      project,
      req,
      reasonCode: 'ORIGIN_REQUIRED',
      detailMessage: `Rejected analytics ingestion without valid Origin header for project "${project.name || project.id}".`,
      exactOrigin: null,
    });
    return {
      allowed: false,
      code: 'ORIGIN_NOT_ALLOWED',
      message: 'Valid verified Origin header is required for this project',
    };
  }

  const matched = origins.find((o) => o.origin === exactOrigin);
  if (!matched) {
    await recordSecurityRejection({
      project,
      req,
      reasonCode: 'ORIGIN_NOT_REGISTERED',
      detailMessage: `Blocked request from unregistered origin "${exactOrigin}" for project "${project.name || project.id}".`,
      exactOrigin,
    });
    return {
      allowed: false,
      code: 'ORIGIN_NOT_ALLOWED',
      message: 'Origin is not registered for this project',
    };
  }

  if (matched.status === 'blocked') {
    await recordSecurityRejection({
      project,
      req,
      reasonCode: 'ORIGIN_BLOCKED',
      detailMessage: `Blocked request from disabled/blocked origin "${exactOrigin}" for project "${project.name || project.id}".`,
      exactOrigin,
    });
    return {
      allowed: false,
      code: 'ORIGIN_BLOCKED',
      message: 'This origin has been blocked by the project owner',
    };
  }

  if (matched.status !== 'verified') {
    await recordSecurityRejection({
      project,
      req,
      reasonCode: 'ORIGIN_NOT_VERIFIED',
      detailMessage: `Rejected analytics ingestion from unverified origin "${exactOrigin}" for project "${project.name || project.id}".`,
      exactOrigin,
    });
    return {
      allowed: false,
      code: 'ORIGIN_NOT_VERIFIED',
      message: 'Origin domain ownership has not been verified',
    };
  }

  return { allowed: true, origin: exactOrigin, originRecord: matched };
}

export default {
  listOrigins,
  syncLegacyAllowedOrigins,
  registerOrigin,
  verifyOrigin,
  setOriginBlocked,
  removeOrigin,
  validateIngestionOrigin,
};
