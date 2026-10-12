/**
 * Lightweight Vercel health endpoint.
 *
 * Keep this endpoint independent of the Express app so it can report whether
 * the serverless runtime and required environment configuration are present
 * even if app startup fails during configuration or Prisma initialization.
 * Never return secret values.
 */
export default function handler(_req: any, res: any) {
  const required = [
    'DATABASE_URL',
    'SESSION_SECRET',
    'CORS_ORIGIN',
    'ADMIN_USERNAME',
    'ADMIN_EMAIL',
    'ADMIN_PASSWORD',
  ] as const;

  const missing = required.filter((key) => !process.env[key]?.trim());

  res.setHeader('Cache-Control', 'no-store');
  return res.status(missing.length ? 503 : 200).json({
    status: missing.length ? 'degraded' : 'ok',
    service: 'encarto-api-runtime',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV ?? 'unknown',
    configuration: {
      requiredVariablesPresent: missing.length === 0,
      missingVariables: missing,
    },
    note: 'This endpoint checks runtime and configuration only; it does not test the Neon database connection.',
  });
}
