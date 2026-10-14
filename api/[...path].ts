/**
 * Vercel serverless entry point for Encarto's Express API.
 *
 * Vercel routes /api/* requests here. The Express app already mounts its
 * routers at /api/auth, /api/admin, /api/progression, and /api/matchmaking.
 * Do not start an HTTP listener or attach Socket.IO in a serverless function.
 */
import { app } from '../server/app.ts';

export default app;

export const config = {
  maxDuration: 60,
};
