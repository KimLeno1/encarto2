import crypto from 'crypto';
import { env } from '../config/env.js';

export interface SessionData {
  userId: string;
  role: 'USER' | 'MODERATOR' | 'ORGANIZER' | 'ADMIN';
  username: string;
  createdAt: number;
}

type SignedSession = SessionData & { expiresAt: number };
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function sign(payload: string): string {
  return crypto.createHmac('sha256', env.SESSION_SECRET).update(payload).digest('base64url');
}

/**
 * Stateless signed sessions work across serverless instances. The previous
 * implementation depended on a process-local Map, which is not shared between
 * Vercel invocations and caused valid logins to appear unauthenticated.
 */
export function createSessionToken(data: SessionData): string {
  const payload = Buffer.from(JSON.stringify({
    ...data,
    expiresAt: data.createdAt + SESSION_TTL_MS,
  } satisfies SignedSession)).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(signedToken: string): SessionData | null {
  if (!signedToken || typeof signedToken !== 'string') return null;
  const separator = signedToken.lastIndexOf('.');
  if (separator <= 0 || separator === signedToken.length - 1) return null;

  const payload = signedToken.slice(0, separator);
  const signature = signedToken.slice(separator + 1);
  const expected = sign(payload);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(actualBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as Partial<SignedSession>;
    const allowedRoles = ['USER', 'MODERATOR', 'ORGANIZER', 'ADMIN'];
    if (
      typeof parsed.userId !== 'string' ||
      typeof parsed.username !== 'string' ||
      typeof parsed.createdAt !== 'number' ||
      typeof parsed.expiresAt !== 'number' ||
      typeof parsed.role !== 'string' ||
      !allowedRoles.includes(parsed.role) ||
      parsed.expiresAt <= Date.now() ||
      parsed.createdAt > Date.now() + 60_000
    ) return null;

    return {
      userId: parsed.userId,
      username: parsed.username,
      role: parsed.role as SessionData['role'],
      createdAt: parsed.createdAt,
    };
  } catch {
    return null;
  }
}

/**
 * Stateless tokens cannot be individually revoked without a durable session
 * table or shared revocation store. Logout clears the HttpOnly browser cookie;
 * password/role checks still reload the authoritative user from the database.
 */
export function invalidateSessionToken(_signedToken: string): void {
  // Intentionally stateless; clearing the cookie ends the browser session.
}

export function invalidateAllUserSessions(_userId: string): void {
  // Intentionally stateless; tokens expire after seven days.
}

export function extractSessionToken(req: any): string | null {
  if (req.cookies && req.cookies.encarto_session) return req.cookies.encarto_session;
  const authHeader = req.headers?.authorization;
  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}
