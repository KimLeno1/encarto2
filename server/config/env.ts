import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/encarto_db?schema=public'),
  SESSION_SECRET: z.string().min(16).default('encarto-super-secret-session-key-change-in-production-min32chars'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  ADMIN_USERNAME: z.string().default('encartomaster'),
  ADMIN_EMAIL: z.string().email().default('admin@encarto.gg'),
  ADMIN_PASSWORD: z.string().min(8).default('EncartoAdmin2026!'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables configuration:', parsed.error.format());
}

export const env = parsed.success ? parsed.data : envSchema.parse({});
