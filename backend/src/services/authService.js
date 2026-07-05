import { OAuth2Client } from 'google-auth-library';
import { query, getClient } from '../config/db.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';
import { AppError } from '../utils/AppError.js';
import { env } from '../config/env.js';

const googleClient = env.googleClientId ? new OAuth2Client(env.googleClientId) : null;

const PUBLIC_ROLES = ['contractor', 'customer']; // admin accounts are provisioned manually, not self-serve

function toPublicUser(user) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    role: user.role,
    phone: user.phone,
    createdAt: user.created_at,
  };
}

/**
 * Register with email + password.
 */
export async function registerWithPassword({ email, password, fullName, role, phone }) {
  if (!PUBLIC_ROLES.includes(role)) {
    throw new AppError(`role must be one of: ${PUBLIC_ROLES.join(', ')}`, 400);
  }
  if (!password || password.length < 8) {
    throw new AppError('Password must be at least 8 characters', 400);
  }

  const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    throw new AppError('An account with this email already exists', 409);
  }

  const passwordHash = await hashPassword(password);

  const client = await getClient();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `INSERT INTO users (email, password_hash, role, full_name, phone)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, role, full_name, phone, created_at`,
      [email, passwordHash, role, fullName, phone || null]
    );
    const user = rows[0];

    // Customers get an empty profile row immediately (few required fields).
    // Contractors build their profile in a dedicated onboarding flow (next phase)
    // because contractor_profiles requires a trade, service area, etc.
    if (role === 'customer') {
      await client.query('INSERT INTO customer_profiles (user_id) VALUES ($1)', [user.id]);
    }

    await client.query('COMMIT');

    const token = signToken(user);
    return { user: toPublicUser(user), token, hasProfile: role === 'customer' };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Login with email + password.
 */
export async function loginWithPassword({ email, password }) {
  const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
  const user = rows[0];

  if (!user) throw new AppError('Invalid email or password', 401);
  if (!user.password_hash) {
    throw new AppError('This account uses Google sign-in. Please continue with Google.', 401);
  }

  const valid = await comparePassword(password, user.password_hash);
  if (!valid) throw new AppError('Invalid email or password', 401);
  if (user.is_suspended) throw new AppError('Account is suspended', 403);
  if (!user.is_active) throw new AppError('Account is deactivated', 403);

  await query('UPDATE users SET last_login_at = now() WHERE id = $1', [user.id]);

  const token = signToken(user);
  const hasProfile = await checkHasProfile(user.id, user.role);
  return { user: toPublicUser(user), token, hasProfile };
}

/**
 * Sign in (or sign up, on first use) with a Google ID token from the frontend.
 * @param {string} idToken - Google ID token obtained via Google Identity Services on the client.
 * @param {string} [role] - Required only the first time a brand-new user signs in with Google.
 */
export async function loginWithGoogle({ idToken, role }) {
  if (!googleClient) {
    throw new AppError('Google OAuth is not configured on the server (missing GOOGLE_CLIENT_ID)', 500);
  }
  if (!idToken) throw new AppError('idToken is required', 400);

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({ idToken, audience: env.googleClientId });
    payload = ticket.getPayload();
  } catch (err) {
    throw new AppError('Invalid Google token', 401);
  }

  const { sub: googleId, email, name, picture } = payload;
  if (!email) throw new AppError('Google account has no email', 400);

  let { rows } = await query('SELECT * FROM users WHERE google_id = $1 OR email = $2', [googleId, email]);
  let user = rows[0];

  if (user) {
    if (!user.google_id) {
      // Existing password-based account signing in with Google for the first time — link it.
      await query('UPDATE users SET google_id = $1 WHERE id = $2', [googleId, user.id]);
    }
    await query('UPDATE users SET last_login_at = now() WHERE id = $1', [user.id]);
  } else {
    if (!role || !PUBLIC_ROLES.includes(role)) {
      throw new AppError(
        `New Google sign-ups must specify a role (one of: ${PUBLIC_ROLES.join(', ')})`,
        400,
        { code: 'ROLE_REQUIRED' }
      );
    }
    const client = await getClient();
    try {
      await client.query('BEGIN');
      const insertRes = await client.query(
        `INSERT INTO users (email, google_id, role, full_name, email_verified_at)
         VALUES ($1, $2, $3, $4, now())
         RETURNING *`,
        [email, googleId, role, name || email.split('@')[0]]
      );
      user = insertRes.rows[0];
      if (role === 'customer') {
        await client.query('INSERT INTO customer_profiles (user_id) VALUES ($1)', [user.id]);
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  const token = signToken(user);
  const hasProfile = await checkHasProfile(user.id, user.role);
  return { user: toPublicUser(user), token, hasProfile, googlePicture: picture };
}

async function checkHasProfile(userId, role) {
  if (role === 'contractor') {
    const { rows } = await query('SELECT 1 FROM contractor_profiles WHERE user_id = $1', [userId]);
    return rows.length > 0;
  }
  if (role === 'customer') {
    const { rows } = await query('SELECT 1 FROM customer_profiles WHERE user_id = $1', [userId]);
    return rows.length > 0;
  }
  return true; // admin
}

export { toPublicUser, checkHasProfile };
