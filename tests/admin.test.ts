import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';

vi.mock('../server/db/client.ts', () => ({
  checkDatabaseConnection: vi.fn().mockResolvedValue(false),
  prisma: {
    user: {
      findUnique: vi.fn(async ({ where }: { where: { id: string } }) => {
        const isAdmin = where.id === 'test-admin-id';
        return {
          id: where.id,
          username: isAdmin ? 'RootAdmin' : 'RegularUser',
          email: isAdmin ? 'admin@test.invalid' : 'user@test.invalid',
          role: isAdmin ? 'ADMIN' : 'USER',
          rank: 1,
          exp: 0,
          balance: 0,
          avatarUrl: null,
          bio: null,
        };
      }),
    },
    $queryRaw: vi.fn().mockRejectedValue(new Error('database unavailable in unit test')),
  },
}));
import http from 'http';
import request from 'supertest';
import { app } from '../server/app.ts';
import { createSessionToken } from '../server/utils/session.ts';

describe('Encarto Admin Control Panel API & Security', () => {
  let server: http.Server;
  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));

    adminToken = createSessionToken({
      userId: 'test-admin-id',
      username: 'RootAdmin',
      role: 'ADMIN',
      createdAt: Date.now(),
    });

    userToken = createSessionToken({
      userId: 'test-user-id',
      username: 'RegularUser',
      role: 'USER',
      createdAt: Date.now(),
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('Rejects unauthenticated requests to admin stats', async () => {
    const res = await request(app).get('/api/admin/stats');
    expect(res.status).toBe(401);
  });

  it('Rejects non-admin users attempting to access admin APIs with 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Cookie', `encarto_session=${userToken}`);
    expect(res.status).toBe(403);
    expect(res.body.error).toContain('Forbidden');
  });

  it('Allows ADMIN role to successfully fetch system stats and service health', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Cookie', `encarto_session=${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.health).toBeDefined();
    expect(res.body.health.api).toBe('healthy');
    expect(res.body.stats).toBeDefined();
    expect(res.body.config).toBeDefined();
  });

  it('Allows ADMIN role to query user registry', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Cookie', `encarto_session=${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.users)).toBe(true);
  });

  it('Allows ADMIN role to configure game availability and records audit log', async () => {
    const res = await request(app)
      .post('/api/admin/config/games')
      .set('Cookie', `encarto_session=${adminToken}`)
      .send({ game: 'chess', enabled: false });
    expect(res.status).toBe(200);
    expect(res.body.gameAvailability.chess).toBe(false);
  });
});
