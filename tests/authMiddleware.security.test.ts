import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';

vi.mock('../server/db/client.ts', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

import { prisma } from '../server/db/client.ts';
import { authenticate } from '../server/middlewares/auth.ts';
import { createSessionToken } from '../server/utils/session.ts';

const findUnique = vi.mocked(prisma.user.findUnique);

function makeRequest() {
  const token = createSessionToken({
    userId: 'security-test-user',
    username: 'security_test',
    role: 'ADMIN',
    createdAt: Date.now(),
  });
  return {
    cookies: { encarto_session: token },
    headers: {},
  } as unknown as Request;
}

function makeResponse() {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
  };
  res.status.mockReturnValue(res);
  return res as unknown as Response & { status: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn> };
}

describe('authentication fails closed', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('rejects a validly signed session when the account no longer exists', async () => {
    findUnique.mockResolvedValue(null);

    const req = makeRequest();
    const res = makeResponse();
    const next = vi.fn() as unknown as NextFunction;

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Invalid or expired session. Please log in again.',
    });
    expect(next).not.toHaveBeenCalled();
    expect(req.user).toBeUndefined();
  });

  it('returns 503 and never trusts token claims when the database lookup fails', async () => {
    findUnique.mockRejectedValue(new Error('database unavailable'));

    const req = makeRequest();
    const res = makeResponse();
    const next = vi.fn() as unknown as NextFunction;

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Authentication service temporarily unavailable.',
    });
    expect(next).not.toHaveBeenCalled();
    expect(req.user).toBeUndefined();
  });

  it('loads current role and account data from the database on success', async () => {
    findUnique.mockResolvedValue({
      id: 'security-test-user',
      username: 'security_test',
      email: 'security@example.com',
      role: 'USER',
      rank: 2,
      exp: 150,
      balance: 25,
      avatarUrl: null,
      bio: null,
    } as never);

    const req = makeRequest();
    const res = makeResponse();
    const next = vi.fn() as unknown as NextFunction;

    await authenticate(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(req.user?.role).toBe('USER');
    expect(req.user?.balance).toBe(25);
  });
});
