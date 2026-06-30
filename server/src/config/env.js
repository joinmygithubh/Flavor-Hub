import dotenv from 'dotenv';

dotenv.config();

/**
 * Centralized, validated access to environment variables.
 * Keeping this in one place avoids `process.env.X` scattered across the codebase
 * and lets us fail fast on misconfiguration in production.
 */
const required = ['MONGO_URI', 'JWT_SECRET'];

const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0 && process.env.NODE_ENV === 'production') {
  // In production a missing secret is fatal. In dev we warn so the app can still
  // boot for non-DB work, but most routes will fail without a DB connection.
  // eslint-disable-next-line no-console
  console.error(`FATAL: Missing required env vars: ${missing.join(', ')}`);
  process.exit(1);
}

const toInt = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

export const env = {
  port: toInt(process.env.PORT, 5000),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd: process.env.NODE_ENV === 'production',

  clientUrls: (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean),

  mongoUri: process.env.MONGO_URI,

  jwtSecret: process.env.JWT_SECRET || 'dev_insecure_secret_change_me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  paymentProvider: process.env.PAYMENT_PROVIDER || 'mock',

  rateLimit: {
    windowMs: toInt(process.env.RATE_LIMIT_WINDOW_MINUTES, 15) * 60 * 1000,
    max: toInt(process.env.RATE_LIMIT_MAX, 300),
  },

  seed: {
    adminEmail: process.env.SEED_ADMIN_EMAIL || 'admin@flavorhub.test',
    adminPassword: process.env.SEED_ADMIN_PASSWORD || 'Admin@12345',
  },
};
