import { z } from 'zod';
import * as authService from '../services/authService.js';
import { checkHasProfile } from '../services/authService.js';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
  role: z.enum(['contractor', 'customer']),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const googleSchema = z.object({
  idToken: z.string().min(10),
  role: z.enum(['contractor', 'customer']).optional(),
});

export async function register(req, res) {
  const data = registerSchema.parse(req.body);
  const result = await authService.registerWithPassword(data);
  res.status(201).json(result);
}

export async function login(req, res) {
  const data = loginSchema.parse(req.body);
  const result = await authService.loginWithPassword(data);
  res.json(result);
}

export async function google(req, res) {
  const data = googleSchema.parse(req.body);
  const result = await authService.loginWithGoogle(data);
  res.json(result);
}

export async function me(req, res) {
  const hasProfile = await checkHasProfile(req.user.id, req.user.role);
  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      fullName: req.user.full_name,
      role: req.user.role,
    },
    hasProfile,
  });
}

// Zod validation errors -> clean 400 response (wired in errorHandler via instanceof check below)
export function zodErrorMiddleware(err, req, res, next) {
  if (err?.name === 'ZodError') {
    return res.status(400).json({ error: 'Validation failed', details: err.issues });
  }
  next(err);
}
