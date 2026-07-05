import { verifyToken } from '../utils/jwt.js';
import { AppError } from '../utils/AppError.js';
import { query } from '../config/db.js';

/**
 * Requires a valid JWT bearer token. Attaches req.user = { id, role, email }.
 */
export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new AppError('Missing or invalid Authorization header', 401);
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch (err) {
    throw new AppError('Invalid or expired token', 401);
  }

  const { rows } = await query(
    'SELECT id, email, role, full_name, is_active, is_suspended FROM users WHERE id = $1',
    [payload.sub]
  );
  const user = rows[0];

  if (!user) throw new AppError('User no longer exists', 401);
  if (!user.is_active) throw new AppError('Account is deactivated', 403);
  if (user.is_suspended) throw new AppError('Account is suspended', 403);

  req.user = user;
  next();
}

/**
 * Restrict a route to one or more roles. Use after requireAuth.
 * Usage: router.get('/admin/x', requireAuth, requireRole('admin'), handler)
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) throw new AppError('Not authenticated', 401);
    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError(`This action requires role: ${allowedRoles.join(' or ')}`, 403);
    }
    next();
  };
}
