import { z } from 'zod';

// Read apps/api/.env when it exists (Render and other hosts set real environment variables).
try {
  process.loadEnvFile();
} catch {
  // No .env file: rely on the environment
}

const isProduction = process.env.NODE_ENV === 'production';
const blankIsUnset = (schema) => z.preprocess((v) => (v === '' ? undefined : v), schema);

const schema = z.object({
  PORT: z.coerce.number().int().positive().default(4100),
  MONGODB_URI: z.string().default(''),
  JWT_SECRET: blankIsUnset(isProduction
    ? z.string().min(32, 'JWT_SECRET must be at least 32 characters in production')
    : z.string().default('dev-only-secret-change-me-dev-only-secret')),
  CORS_ORIGIN: z.string().default('http://localhost:5180,http://localhost:4173'),
  ADMIN_EMAIL: blankIsUnset(z.string().email().default('admin@hapivet.com')),
  // The demo password only applies locally; a live server must set its own.
  ADMIN_PASSWORD: blankIsUnset(isProduction ? z.string().min(8) : z.string().min(8).default('hapivet123')),
  FIXED_OTP: z.string().regex(/^\d{6}$/, 'FIXED_OTP must be 6 digits').default('123456'),
  SEED_SAMPLE_LEADS: blankIsUnset(z.enum(['true', 'false']).default(isProduction ? 'false' : 'true')).transform((v) => v === 'true'),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment:', z.flattenError(parsed.error).fieldErrors);
  process.exit(1);
}

export const config = {
  ...parsed.data,
  isProduction,
  // Browsers send the origin without a trailing slash, so a pasted URL still has to match.
  corsOrigins: parsed.data.CORS_ORIGIN.split(',').map((o) => o.trim().replace(/\/+$/, '')).filter(Boolean),
};
