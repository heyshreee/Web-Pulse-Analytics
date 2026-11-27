import crypto from 'crypto';
import supabase from '../config/supabase.js';
import { resolveAuthorizedProject } from '../utils/projectAuth.js';
import { validateWebhookUrl, deliverWebhookWithRetry } from '../services/webhook.service.js';
import { logAction } from '../services/audit.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../errors/AppError.js';

function generateWebhookSecret() {
  const raw = `whsec_${crypto.randomBytes(24).toString('hex')}`;
  const prefix = raw.substring(0, 12);
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  return { raw, prefix, hash };
}

export const listWebhooks = asyncHandler(async (req, res) => {
  const project = await resolveAuthorizedProject(req.params.id, req.user.id, 'admin');

  const { data, error } = await supabase
    .from('webhooks')
    .select('id, project_id, url, events, secret_prefix, is_active, last_triggered_at, created_at')
    .eq('project_id', project.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  res.json({ webhooks: data || [] });
});

export const createWebhook = asyncHandler(async (req, res) => {
  const project = await resolveAuthorizedProject(req.params.id, req.user.id, 'admin');
  const validatedUrl = validateWebhookUrl(req.body?.url);
  const events = Array.isArray(req.body?.events) && req.body.events.length > 0
    ? req.body.events.map(String).slice(0, 10)
    : ['event.tracked', 'security.alert'];

  const { raw, prefix, hash } = generateWebhookSecret();

  const { data: created, error } = await supabase
    .from('webhooks')
    .insert({
      project_id: project.id,
      user_id: req.user.id,
      url: validatedUrl,
      events,
      secret_hash: hash,
      secret_prefix: prefix,
      is_active: true,
    })
    .select('id, project_id, url, events, secret_prefix, is_active, created_at')
    .single();

  if (error) throw error;

  await logAction(
    req.user.id,
    'webhook.created',
    { projectId: project.id, webhookId: created.id, url: validatedUrl, events },
    created.id
  );

  res.status(201).json({ webhook: created, signingSecret: raw });
});

export const rotateWebhookSecret = asyncHandler(async (req, res) => {
  const project = await resolveAuthorizedProject(req.params.id, req.user.id, 'admin');
  const { webhookId } = req.params;

  const { data: existing } = await supabase
    .from('webhooks')
    .select('id')
    .eq('id', webhookId)
    .eq('project_id', project.id)
    .maybeSingle();

  if (!existing) {
    throw AppError.notFound('Webhook not found');
  }

  const { raw, prefix, hash } = generateWebhookSecret();
  const { data: updated, error } = await supabase
    .from('webhooks')
    .update({ secret_hash: hash, secret_prefix: prefix, updated_at: new Date().toISOString() })
    .eq('id', webhookId)
    .eq('project_id', project.id)
    .select('id, project_id, url, events, secret_prefix, is_active, created_at')
    .single();

  if (error) throw error;

  await logAction(
    req.user.id,
    'webhook.secret_rotated',
    { projectId: project.id, webhookId },
    webhookId
  );

  res.json({ webhook: updated, signingSecret: raw });
});

export const listWebhookDeliveries = asyncHandler(async (req, res) => {
  const project = await resolveAuthorizedProject(req.params.id, req.user.id, 'admin');
  const { webhookId } = req.params;

  const { data, error } = await supabase
    .from('webhook_deliveries')
    .select('id, webhook_id, event_type, status, attempt_count, http_status, error_message, next_retry_at, created_at')
    .eq('webhook_id', webhookId)
    .eq('project_id', project.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  res.json({ deliveries: data || [] });
});

export const triggerWebhookTest = asyncHandler(async (req, res) => {
  const project = await resolveAuthorizedProject(req.params.id, req.user.id, 'admin');
  const { webhookId } = req.params;

  const { data: webhook } = await supabase
    .from('webhooks')
    .select('*')
    .eq('id', webhookId)
    .eq('project_id', project.id)
    .maybeSingle();

  if (!webhook) {
    throw AppError.notFound('Webhook not found');
  }

  validateWebhookUrl(webhook.url);

  const result = await deliverWebhookWithRetry({
    webhook,
    eventType: 'webhook.test',
    payload: { projectId: project.id, projectName: project.name },
    rawSecret: req.body?.signingSecret || webhook.secret_hash,
  });

  res.json(result);
});

export const deleteWebhook = asyncHandler(async (req, res) => {
  const project = await resolveAuthorizedProject(req.params.id, req.user.id, 'admin');
  const { webhookId } = req.params;

  await supabase
    .from('webhooks')
    .delete()
    .eq('id', webhookId)
    .eq('project_id', project.id);

  await logAction(
    req.user.id,
    'webhook.deleted',
    { projectId: project.id, webhookId },
    webhookId
  );

  res.json({ success: true });
});

export default {
  listWebhooks,
  createWebhook,
  rotateWebhookSecret,
  listWebhookDeliveries,
  triggerWebhookTest,
  deleteWebhook,
};
