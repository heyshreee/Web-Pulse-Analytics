import AppError from '../errors/AppError.js';
import { fail } from '../utils/ApiResponse.js';

/**
 * 404 handler for unmatched routes.
 */
export const notFound = (req, res, next) => {
  next(AppError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
};

/**
 * Global error handler. Must be registered LAST in the middleware chain.
 * - Thrown AppError (or any error with statusCode) -> mapped to its status.
 * - Supabase/postgres errors with a .code -> mapped to 400 with the code.
 * - Any other error in production -> generic 500 (no internals leaked).
 */
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong';
  let code = err.code;
  let details = err.details;

  // Supabase errors often expose a postgres code. Map unexpected client issues.
  if (!(err instanceof AppError) && err && typeof err.code === 'string' && err.message) {
    statusCode = 400;
    code = code || 'SUPABASE_ERROR';
  }

  if (statusCode >= 500) {
    // eslint-disable-next-line no-console
    console.error('[Error]', req.method, req.originalUrl, err);
  }

  const isProd = process.env.NODE_ENV === 'production';
  if (statusCode >= 500 && isProd) {
    message = 'Internal server error';
    code = 'INTERNAL';
    details = undefined;
  }

  return fail(res, statusCode, message, code, details ?? undefined);
};
