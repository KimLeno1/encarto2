import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';
const productionRequired = [
  'DATABASE_URL',
  'SESSION_SECRET',
  'CORS_ORIGIN',
  'ADMIN_USERNAME',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD',
] as const;

if (isProduction) {
  const missing = productionRequired.filter((key) => !process.env[key]?.trim());
  if (missing.length > 0) {
    throw new Error(`Missing required production environment variables: ${missing.join(', ')}`);
  }

  const sessionSecret = process.env.SESSION_SECRET || '';
  if (sessionSecret.length < 32 || sessionSecret === 'encarto-super-secret-session-key-change-in-production-min32chars' || sessionSecret.startsWith('replace-with-')) {
    throw new Error('SESSION_SECRET must be a unique, randomly generated value of at least 32 characters in production.');
  }

  if (process.env.ADMIN_PASSWORD === 'EncartoAdmin2026!' || process.env.ADMIN_PASSWORD?.startsWith('replace-with-')) {
    throw new Error('ADMIN_PASSWORD must not use the example/default password in production.');
  }

  if ((process.env.ADMIN_USERNAME || '').startsWith('replace-with-') ||
      process.env.ADMIN_EMAIL === 'admin@example.com' ||
      (process.env.ADMIN_PASSWORD || '').length < 16) {
    throw new Error('Production admin provisioning values must be explicitly replaced; ADMIN_PASSWORD must be at least 16 characters.');
  }

  const configuredOrigins = (process.env.CORS_ORIGIN || '').split(',').map((origin) => origin.trim());
  if (configuredOrigins.some((origin) => !origin || origin === '*' || origin.includes('*'))) {
    throw new Error('CORS_ORIGIN must contain exact trusted origins and must not use wildcard values in production.');
  }
}

const envSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1).default('postgresql://postgres:postgres@localhost:5432/encarto_db?schema=public'),
  SESSION_SECRET: z.string().min(16).default('encarto-super-secret-session-key-change-in-production-min32chars'),
  // Comma-separated exact browser origins, e.g. https://encarto.vercel.app,https://encarto.example.com
  CORS_ORIGIN: z.string().min(1).default('http://localhost:3000'),
  ADMIN_USERNAME: z.string().min(1).default('encartomaster'),
  ADMIN_EMAIL: z.string().email().default('admin@encarto.gg'),
  ADMIN_PASSWORD: z.string().min(8).default('EncartoAdmin2026!'),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  // Invalid configuration must stop startup rather than silently falling back to defaults.
  throw new Error(`Invalid environment configuration: ${parsed.error.issues.map((issue) => issue.path.join('.') + ': ' + issue.message).join('; ')}`);
}

export const env = parsed.data;
