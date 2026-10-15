import { Request, Response, NextFunction } from 'express';
import { verifySessionToken } from '../utils/session.js';
import { prisma } from '../db/client.js';
import { DEMO_ACCOUNTS } from '../config/demoAccounts.js';

export interface AuthenticatedUser {
  id: string;
  username: string;
  email: string;
  role: 'USER' | 'MODERATOR' | 'ORGANIZER' | 'ADMIN';
  rank: number;
  exp: number;
  balance: number;
  avatarUrl: string | null;
  bio: string | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function extractSessionToken(req: Request): string | null {
  const cookieToken = req.cookies?.encarto_session;
  if (cookieToken) return cookieToken;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
}

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = extractSessionToken(req);
  if (!token) {
    res.status(401).json({ error: 'Authentication required. No session token provided.' });
    return;
  }

  const session = verifySessionToken(token);
  if (!session) {
    res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
    return;
  }

  // Fast-path for demo user sessions
  if (session.userId.startsWith('demo-')) {
    const demoAcc = DEMO_ACCOUNTS.find((a) => a.user.id === session.userId);
    if (demoAcc) {
      req.user = {
        ...demoAcc.user,
        balance: Number(demoAcc.user.balance),
      };
      return next();
    }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        rank: true,
        exp: true,
        balance: true,
        avatarUrl: true,
        bio: true,
      },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
      return;
    }

    req.user = {
      ...user,
      balance: Number(user.balance),
    };
    next();
  } catch {
    // If DB is offline but token is a recognized demo account, authenticate safely
    const demoAcc = DEMO_ACCOUNTS.find((a) => a.user.id === session.userId);
    if (demoAcc) {
      req.user = {
        ...demoAcc.user,
        balance: Number(demoAcc.user.balance),
      };
      return next();
    }
    res.status(503).json({ error: 'Authentication service temporarily unavailable.' });
    return;
  }
}

export function requireRole(allowedRoles: Array<'USER' | 'MODERATOR' | 'ORGANIZER' | 'ADMIN'>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Forbidden: Insufficient privileges to perform this action.',
      });
      return;
    }

    next();
  };
}
