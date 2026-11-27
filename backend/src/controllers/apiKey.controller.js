import crypto from 'crypto';
import supabase from '../config/supabase.js';
import { resolveAuthorizedProject } from '../utils/projectAuth.js';
import { logAction } from '../services/audit.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../errors/AppError.js';

function generateSecretApiKey() {
  const raw = `wpk_${crypto.randomBytes(24).toString('hex')}`;
  const prefix = raw.substring(0, 8);
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  return { raw, prefix, hash };
}

export const listApiKeys = asyncHandler(async (req, res) => {
  const project = await resolveAuthorizedProject(req.params.id, req.user.id, 'admin');

  const { data, error } = await supabase
    .from('api_keys')
    .select('id, project_id, name, key_prefix, last_used_at, expires_at, revoked_at, created_at')
    .eq('project_id', project.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  res.json({ keys: data || [] });
});

export const createApiKey = asyncHandler(async (req, res) => {
  const project = await resolveAuthorizedProject(req.params.id, req.user.id, 'admin');
  const name = String(req.body?.name || 'API Key').trim().slice(0, 80);
  const { raw, prefix, hash } = generateSecretApiKey();

  const { data: created, error } = await supabase
    .from('api_keys')
    .insert({
      project_id: project.id,
      name,
      key_prefix: prefix,
      key_hash: hash,
    })
    .select('id, project_id, name, key_prefix, expires_at, revoked_at, created_at')
    .single();

  if (error) throw error;

  await logAction(
    req.user.id,
    'api_key.created',
    { projectId: project.id, keyId: created.id, prefix },
    created.id
  );

  const { key_hash: _omitted, ...safeKey } = created || {};
  res.status(201).json({ key: safeKey, apiKey: raw });
});

export const rotateApiKey = asyncHandler(async (req, res) => {
  const project = await resolveAuthorizedProject(req.params.id, req.user.id, 'admin');
  const { keyId } = req.params;

  const { data: existing } = await supabase
    .from('api_keys')
    .select('id, name')
    .eq('id', keyId)
    .eq('project_id', project.id)
    .maybeSingle();

  if (!existing) {
    throw AppError.notFound('API key not found');
  }

  await supabase
    .from('api_keys')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', keyId)
    .eq('project_id', project.id);

  const { raw, prefix, hash } = generateSecretApiKey();
  const { data: created, error } = await supabase
    .from('api_keys')
    .insert({
      project_id: project.id,
      name: `${existing.name || 'API Key'} (rotated)`,
      key_prefix: prefix,
      key_hash: hash,
    })
    .select('id, project_id, name, key_prefix, expires_at, revoked_at, created_at')
    .single();

  if (error) throw error;

  await logAction(
    req.user.id,
    'api_key.rotated',
    { projectId: project.id, oldKeyId: keyId, newKeyId: created.id, prefix },
    created.id
  );

  const { key_hash: _omitted, ...safeKey } = created || {};
  res.status(201).json({ key: safeKey, apiKey: raw });
});

export const revokeApiKey = asyncHandler(async (req, res) => {
  const project = await resolveAuthorizedProject(req.params.id, req.user.id, 'admin');
  const { keyId } = req.params;

  const { data: existing } = await supabase
    .from('api_keys')
    .select('id')
    .eq('id', keyId)
    .eq('project_id', project.id)
    .maybeSingle();

  if (!existing) {
    throw AppError.notFound('API key not found');
  }

  await supabase
    .from('api_keys')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', keyId)
    .eq('project_id', project.id);

  await logAction(
    req.user.id,
    'api_key.revoked',
    { projectId: project.id, keyId },
    keyId
  );

  res.json({ success: true });
});

export default {
  listApiKeys,
  createApiKey,
  rotateApiKey,
  revokeApiKey,
};
