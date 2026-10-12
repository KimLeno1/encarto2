import crypto from 'crypto';
import { env } from '../config/env.js';

export interface SessionData {
  userId: string;
  role: 'USER' | 'MODERATOR' | 'ORGANIZER' | 'ADMIN';
  username: string;
  createdAt: number;
}

// In-memory token store with TTL (backed by session ID)
// Can be backed by Redis or DB in scale; acts as safe session store
const sessionStore = new Map<string, SessionData>();

export function createSessionToken(data: SessionData): string {
  const token = crypto.randomBytes(32).toString('hex');
  const signature = crypto
    .createHmac('sha256', env.SESSION_SECRET)
    .update(token)
    .digest('hex');
  
  sessionStore.set(token, data);
  return `${token}.${signature}`;
}

export function verifySessionToken(signedToken: string): SessionData | null {
  if (!signedToken || !signedToken.includes('.')) return null;
  const [token, signature] = signedToken.split('.');
  if (!token || !signature) return null;

  const expectedSignature = crypto
    .createHmac('sha256', env.SESSION_SECRET)
    .update(token)
    .digest('hex');

  // Constant-time comparison
  const sigBuffer = Buffer.from(signature, 'hex');
  const expectedBuffer = Buffer.from(expectedSignature, 'hex');
  if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
    return null;
  }

  const session = sessionStore.get(token);
  if (!session) return null;

  // Check 7 days expiration
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  if (Date.now() - session.createdAt > sevenDaysMs) {
    sessionStore.delete(token);
    return null;
  }

  return session;
}

export function invalidateSessionToken(signedToken: string): void {
  if (!signedToken || !signedToken.includes('.')) return;
  const [token] = signedToken.split('.');
  if (token) {
    sessionStore.delete(token);
  }
}

export function invalidateAllUserSessions(userId: string): void {
  for (const [token, session] of sessionStore.entries()) {
    if (session.userId === userId) {
      sessionStore.delete(token);
    }
  }
}

export function extractSessionToken(req: any): string | null {
  if (req.cookies && req.cookies.encarto_session) {
    return req.cookies.encarto_session;
  }
  const authHeader = req.headers?.authorization;
  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

