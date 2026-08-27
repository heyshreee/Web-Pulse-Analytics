/**
 * Base application error with HTTP status + machine-readable code.
 * All controllers should throw AppError for known failures so the
 * global error handler can respond consistently.
 */
export default class AppError extends Error {
  constructor(statusCode, message, code = null, details = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code || (statusCode >= 500 ? 'INTERNAL' : 'ERROR');
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace?.(this, this.constructor);
  }

  static badRequest(message, code = 'BAD_REQUEST', details = null) {
    return new AppError(400, message, code, details);
  }

  static unauthorized(message = 'Authentication required', code = 'UNAUTHORIZED') {
    return new AppError(401, message, code);
  }

  static forbidden(message, code = 'FORBIDDEN', details = null) {
    return new AppError(403, message, code, details);
  }

  static notFound(message, code = 'NOT_FOUND') {
    return new AppError(404, message, code);
  }

  static conflict(message, code = 'CONFLICT') {
    return new AppError(409, message, code);
  }

  static limitExceeded(message, details = null) {
    return new AppError(403, message, 'LIMIT_EXCEEDED', details);
  }
}
