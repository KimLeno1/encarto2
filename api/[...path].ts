/**
 * Single Vercel serverless entry point for the Express API.
 *
 * Vercel Hobby permits at most 12 serverless functions per deployment.
 * Keep API routing consolidated here so every Express route shares one
 * function and request paths like /api/auth/me reach the same router as
 * local development. The standalone api/health.ts remains independent so
 * platform/configuration health can still be checked if app startup fails.
 */
import { app } from '../server/app.js';

export default app;

export const config = {
  maxDuration: 30,
};
