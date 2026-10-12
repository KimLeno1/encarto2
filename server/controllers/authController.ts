import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../db/client.ts';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
} from '../validators/auth.ts';
import {
  createSessionToken,
  invalidateSessionToken,
  invalidateAllUserSessions,
  extractSessionToken,
} from '../utils/session.ts';
import { logAuditEvent } from '../utils/audit.ts';

const BCRYPT_ROUNDS = 12;

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: 'Validation failed',
          details: parsed.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
        });
        return;
      }

      const { username, email, password, birthday, bio, avatarUrl } = parsed.data;

      // Check existing email or username
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: email.toLowerCase() },
            { username: { equals: username, mode: 'insensitive' } },
          ],
        },
      });

      if (existingUser) {
        if (existingUser.email.toLowerCase() === email.toLowerCase()) {
          res.status(409).json({ error: 'An account with this email address already exists.' });
          return;
        }
        res.status(409).json({ error: 'This username is already taken. Please choose another.' });
        return;
      }

      // Secure password hash
      const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

      // Create player user (NEVER allow role assignment from register body - strictly defaults to USER)
      const user = await prisma.user.create({
        data: {
          username,
          email: email.toLowerCase(),
          passwordHash,
          role: 'USER',
          isAdmin: false,
          bio: bio || null,
          avatarUrl: avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent(username),
          profile: {
            create: {
              selectedTheme: 'mha',
              birthday: birthday || null,
            },
          },
        },
        include: {
          profile: true,
        },
      });

      // Audit log registration
      await logAuditEvent({
        action: 'USER_REGISTERED',
        performedBy: user.id,
        details: { username: user.username, email: user.email },
        ipAddress: req.ip,
      });

      // Create session
      const token = createSessionToken({
        userId: user.id,
        username: user.username,
        role: user.role,
        createdAt: Date.now(),
      });

      res.cookie('encarto_session', token, {
        httpOnly: true,
        secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(201).json({
        message: 'Account enlisted successfully.',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          rank: user.rank,
          exp: user.exp,
          balance: Number(user.balance),
          avatarUrl: user.avatarUrl,
          bio: user.bio,
          profile: user.profile,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Invalid login payload.' });
        return;
      }

      const { emailOrUsername, password } = parsed.data;

      // Find user by username or email
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: emailOrUsername.toLowerCase() },
            { username: { equals: emailOrUsername, mode: 'insensitive' } },
          ],
        },
        include: {
          profile: true,
        },
      });

      // Constant-time check / generic auth error to prevent user enumeration
      const dummyHash = '$2b$12$e8pAqv8y/R0yR3gXqA0t7uX2mE34p7m2fU4x7m8p9q1w2e3r4t5y6';
      const isMatch = user
        ? await bcrypt.compare(password, user.passwordHash)
        : await bcrypt.compare(password, dummyHash);

      if (!user || !isMatch) {
        res.status(401).json({ error: 'Invalid identification credentials.' });
        return;
      }

      // Create session token
      const token = createSessionToken({
        userId: user.id,
        username: user.username,
        role: user.role,
        createdAt: Date.now(),
      });

      res.cookie('encarto_session', token, {
        httpOnly: true,
        secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      await logAuditEvent({
        action: 'USER_LOGIN',
        performedBy: user.id,
        details: { username: user.username },
        ipAddress: req.ip,
      });

      res.json({
        message: 'Station access granted.',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          rank: user.rank,
          exp: user.exp,
          balance: Number(user.balance),
          avatarUrl: user.avatarUrl,
          bio: user.bio,
          profile: user.profile,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response): Promise<void> {
    const token = extractSessionToken(req);
    if (token) {
      invalidateSessionToken(token);
    }

    res.clearCookie('encarto_session');
    res.json({ message: 'Session terminated. Station disconnected.' });
  }

  static async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: {
          profile: true,
          items: {
            include: {
              item: true,
            },
          },
        },
      });

      if (!user) {
        res.status(404).json({ error: 'User profile not found.' });
        return;
      }

      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          rank: user.rank,
          exp: user.exp,
          balance: Number(user.balance),
          avatarUrl: user.avatarUrl,
          bio: user.bio,
          profile: user.profile,
          ownedItems: user.items.map((i) => i.itemId),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const userId = String(req.params.userId);

      // Server-side ownership check: players can only update their own profile unless ADMIN
      if (req.user.id !== userId && req.user.role !== 'ADMIN') {
        res.status(403).json({ error: 'Forbidden: You cannot modify another player’s profile.' });
        return;
      }

      // Progression data integrity guard: reject arbitrary client claims
      if (req.body.exp !== undefined || req.body.rank !== undefined || req.body.balance !== undefined) {
        res.status(403).json({ error: 'Security violation: Players cannot manually alter XP, rank, or currency balances.' });
        return;
      }

      const parsed = updateProfileSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: 'Validation failed',
          details: parsed.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
        });
        return;
      }

      const data = parsed.data;

      // Handle password change if requested
      let updatedPasswordHash: string | undefined = undefined;
      if (data.newPassword) {
        if (!data.currentPassword && req.user.role !== 'ADMIN') {
          res.status(400).json({ error: 'Current password is required to set a new password.' });
          return;
        }

        const currentUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!currentUser) {
          res.status(404).json({ error: 'User not found.' });
          return;
        }

        if (req.user.role !== 'ADMIN') {
          const match = await bcrypt.compare(data.currentPassword || '', currentUser.passwordHash);
          if (!match) {
            res.status(400).json({ error: 'Current password does not match.' });
            return;
          }
        }

        updatedPasswordHash = await bcrypt.hash(data.newPassword, BCRYPT_ROUNDS);
        // Invalidate all old sessions for security
        invalidateAllUserSessions(userId);
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(data.username ? { username: data.username } : {}),
          ...(data.email ? { email: data.email.toLowerCase() } : {}),
          ...(data.bio !== undefined ? { bio: data.bio } : {}),
          ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl } : {}),
          ...(updatedPasswordHash ? { passwordHash: updatedPasswordHash } : {}),
          profile: {
            upsert: {
              create: {
                selectedTheme: data.selectedTheme || 'mha',
                phone: data.phone || null,
                birthday: data.birthday || null,
                activePlugin: data.activePlugin,
                activeDecoration: data.activeDecoration,
              },
              update: {
                ...(data.selectedTheme ? { selectedTheme: data.selectedTheme } : {}),
                ...(data.phone !== undefined ? { phone: data.phone } : {}),
                ...(data.birthday !== undefined ? { birthday: data.birthday } : {}),
                ...(data.activePlugin !== undefined ? { activePlugin: data.activePlugin } : {}),
                ...(data.activeDecoration !== undefined ? { activeDecoration: data.activeDecoration } : {}),
              },
            },
          },
        },
        include: {
          profile: true,
        },
      });

      await logAuditEvent({
        action: 'PROFILE_UPDATED',
        performedBy: req.user.id,
        details: { targetUserId: userId },
        ipAddress: req.ip,
      });

      res.json({
        message: 'Profile updated successfully.',
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          role: updatedUser.role,
          rank: updatedUser.rank,
          exp: updatedUser.exp,
          balance: Number(updatedUser.balance),
          avatarUrl: updatedUser.avatarUrl,
          bio: updatedUser.bio,
          profile: (updatedUser as any).profile,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async adminAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const logs = await prisma.auditLog.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, username: true, email: true, role: true },
          },
        },
      });
      res.json({ logs });
    } catch (error) {
      next(error);
    }
  }
}
