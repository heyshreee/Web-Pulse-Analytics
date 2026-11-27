import crypto from 'crypto';
import net from 'net';
import supabase from '../config/supabase.js';
import AppError from '../errors/AppError.js';

function isPrivateOrBlockedIp(ip) {
  if (!ip) return true;
  const clean = String(ip).replace(/^::ffff:/i, '').toLowerCase();

  if (clean === '::1' || clean === '::' || clean.startsWith('fe80:') || clean.startsWith('fc') || clean.startsWith('fd')) {
    return true;
  }

  const parts = clean.split('.').map(Number);
  if (parts.length === 4 && parts.every((n) => Number.isInteger(n) && n >= 0 && n <= 255)) {
    const [a, b] = parts;
    if (a === 127 || a === 10 || a === 0) return true;
    if (a === 169 && b === 254) return true; // Cloud metadata IMDS
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
  }
  return false;
}

/**
 * Validates webhook target URLs against SSRF vectors (localhost, loopback,
 * link-local metadata IPs, private RFC1918 ranges, embedded credentials).
 */
export function validateWebhookUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    throw AppError.badRequest('Webhook URL is required', 'INVALID_WEBHOOK_URL');
  }

  let parsed;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    throw AppError.badRequest('Webhook URL must be a valid URL', 'INVALID_WEBHOOK_URL');
  }

  if (parsed.protocol !== 'https:') {
    throw AppError.badRequest('Webhook URL must use HTTPS', 'INVALID_WEBHOOK_URL');
  }

  if (parsed.username || parsed.password) {
    throw AppError.badRequest('Webhook URL must not contain embedded credentials', 'INVALID_WEBHOOK_URL');
  }

  const host = parsed.hostname.toLowerCase();
  if (
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    host.endsWith('.local') ||
    host.endsWith('.internal')
  ) {
    throw AppError.badRequest('Webhook target host is not permitted (SSRF protection)', 'SSRF_BLOCKED');
  }

  if (net.isIP(host) && isPrivateOrBlockedIp(host)) {
    throw AppError.badRequest('Private or loopback IP addresses are not permitted (SSRF protection)', 'SSRF_BLOCKED');
  }

  return parsed.toString();
}

export function signWebhookPayload(secret, timestamp, bodyString) {
  const payload = `${timestamp}.${bodyString}`;
  const sig = crypto.createHmac('sha256', String(secret)).update(payload).digest('hex');
  return `t=${timestamp},v1=${sig}`;
}

export async function deliverWebhookWithRetry({
  webhook,
  eventType,
  payload,
  rawSecret,
  fetcher = fetch,
  maxAttempts = 3,
  baseDelayMs = 25,
}) {
  const bodyString = JSON.stringify({ event: eventType, timestamp: new Date().toISOString(), data: payload });
  let lastStatus = null;
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const ts = Math.floor(Date.now() / 1000);
    const signature = signWebhookPayload(rawSecret || webhook.secret_hash, ts, bodyString);

    try {
      const res = await fetcher(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WebPulse-Event': eventType,
          'X-WebPulse-Signature': signature,
        },
        body: bodyString,
      });

      lastStatus = res.status;
      if (res.ok) {
        await supabase.from('webhook_deliveries').insert({
          webhook_id: webhook.id,
          project_id: webhook.project_id,
          event_type: eventType,
          status: 'success',
          attempt_count: attempt,
          http_status: res.status,
        });
        await supabase
          .from('webhooks')
          .update({ last_triggered_at: new Date().toISOString() })
          .eq('id', webhook.id);
        return { delivered: true, attempts: attempt, httpStatus: res.status };
      }
      lastError = `HTTP ${res.status}`;
    } catch (err) {
      lastError = err.message || 'Delivery error';
    }

    if (attempt < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, baseDelayMs * Math.pow(2, attempt - 1)));
    }
  }

  await supabase.from('webhook_deliveries').insert({
    webhook_id: webhook.id,
    project_id: webhook.project_id,
    event_type: eventType,
    status: 'failed',
    attempt_count: maxAttempts,
    http_status: lastStatus,
    error_message: lastError,
    next_retry_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
  });

  return { delivered: false, attempts: maxAttempts, httpStatus: lastStatus, error: lastError };
}

export default {
  validateWebhookUrl,
  signWebhookPayload,
  deliverWebhookWithRetry,
};
