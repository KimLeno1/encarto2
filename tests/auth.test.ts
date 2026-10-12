import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../server/app.ts';
import { createSessionToken, verifySessionToken } from '../server/utils/session.ts';

describe('Encarto API Endpoints', () => {
  it('GET /api/health returns ok status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.environment).toBeDefined();
  });

  it('GET /api/health/database handles database health check', async () => {
    const res = await request(app).get('/api/health/database');
    expect([200, 503]).toContain(res.status);
    expect(res.body.database).toBe('PostgreSQL');
  });

  it('Rejects invalid registration schema with 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'ab', email: 'not-an-email', password: '123' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  it('Signs and verifies secure session tokens with constant-time HMAC', () => {
    const session = {
      userId: 'test-user-123',
      username: 'gamer_pro',
      role: 'USER' as const,
      createdAt: Date.now(),
    };
    const signedToken = createSessionToken(session);
    expect(signedToken).toContain('.');

    const verified = verifySessionToken(signedToken);
    expect(verified).not.toBeNull();
    expect(verified?.userId).toBe('test-user-123');
    expect(verified?.role).toBe('USER');

    // Tampered token check
    const tampered = signedToken.replace(/^./, 'x');
    expect(verifySessionToken(tampered)).toBeNull();
  });

  it('Blocks unauthenticated access to /api/auth/me', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });
  it('does not grant CORS permission to an unconfigured origin', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'https://attacker.example');

    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('blocks state-changing requests from an untrusted browser origin', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Origin', 'https://attacker.example');

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Untrusted request origin.');
  });

});
