import { AppError } from '../utils/AppError.js';
import { env } from '../config/env.js';

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      details: err.details,
    });
  }

  // Postgres unique violation
  if (err.code === '23505') {
    return res.status(409).json({ error: 'A record with these details already exists.' });
  }

  console.error('[error]', err);
  return res.status(500).json({
    error: 'Internal server error',
    ...(env.nodeEnv === 'development' ? { message: err.message, stack: err.stack } : {}),
  });
}

export function notFoundHandler(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}
