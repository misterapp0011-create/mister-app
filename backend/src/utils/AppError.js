/**
 * Standard operational error. Thrown anywhere in the app; caught by the
 * global error handler in middleware/errorHandler.js.
 */
export class AppError extends Error {
  constructor(message, statusCode = 400, details = undefined) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}
