import dotenv from 'dotenv';

dotenv.config();

function required(name, fallback = undefined) {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    // eslint-disable-next-line no-console
    console.warn(`[env] Missing environment variable: ${name} (using undefined — set this in .env)`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 4000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  databaseUrl: required('DATABASE_URL'),
  pgSsl: process.env.PGSSL === 'true',

  jwtSecret: required('JWT_SECRET', 'dev_only_insecure_secret'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,

  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  platformFeePercent: Number(process.env.PLATFORM_FEE_PERCENT) || 10,

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  resendApiKey: process.env.RESEND_API_KEY,
  emailFrom: process.env.EMAIL_FROM || 'Mister <no-reply@mister.app>',
};
