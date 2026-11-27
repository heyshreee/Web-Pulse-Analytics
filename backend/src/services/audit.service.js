import supabase from '../config/supabase.js';

const SENSITIVE_KEY_PATTERN = /(password|token|secret|key_hash|api_key|apikey|authorization|cookie|signature)/i;

export function sanitizeAuditMetadata(value, depth = 0) {
  if (depth > 4 || value === null || value === undefined) return value;
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeAuditMetadata(item, depth + 1));
  }
  if (typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (SENSITIVE_KEY_PATTERN.test(k)) {
        out[k] = '[REDACTED]';
      } else {
        out[k] = sanitizeAuditMetadata(v, depth + 1);
      }
    }
    return out;
  }
  return value;
}

/**
 * Append-only audit logging service to track critical security and admin actions.
 * Sensitive credentials (passwords, tokens, signing secrets) are always redacted.
 */
const logAction = async (userId, action, metadata = {}, target = null) => {
  if (!userId) return;

  const safeMetadata = sanitizeAuditMetadata(metadata || {});

  try {
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: userId,
        action,
        target: target ? String(target) : safeMetadata?.target || null,
        metadata: safeMetadata,
        created_at: new Date().toISOString(),
      });

    if (error) {
      if (error.code === '23503') {
        console.warn(`[Audit] Skipped log for non-existent user: ${userId}`);
        return;
      }
      if (error.code === 'PGRST205' || error.code === '42P01') {
        console.warn('⚠️ Audit logs table is missing.');
      } else {
        console.error('Audit log error:', error.message);
      }
    }
  } catch (err) {
    console.error('Audit log service error:', err.message);
  }
};

export default { logAction, sanitizeAuditMetadata };
export { logAction };

