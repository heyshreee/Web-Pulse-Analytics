/**
 * Consistent JSON response helpers.
 * Success shape: { success: true, data, ...meta }
 * Error shape is produced by the global error handler (ApiResponse.error is
 * still provided for convenience).
 */
export const success = (res, data = null, meta = {}, statusCode = 200) => {
  const body = { success: true, data };
  if (Object.keys(meta).length > 0) body.meta = meta;
  return res.status(statusCode).json(body);
};

export const created = (res, data = null, meta = {}) =>
  success(res, data, meta, 201);

export const noContent = (res) => res.status(204).end();

export const fail = (res, statusCode, message, code = null, details = null) => {
  const body = { success: false, error: message };
  if (code) body.code = code;
  if (details !== null) body.details = details;
  return res.status(statusCode).json(body);
};
