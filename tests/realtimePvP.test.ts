import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'http';
import { io as Client, Socket as ClientSocket } from 'socket.io-client';
import { app } from '../server/app.ts';
import { setupSocketIO } from '../server/socket/index.ts';
import { matchmakingService } from '../server/services/matchmakingService.ts';
import { createSessionToken } from '../server/utils/session.ts';
import { MatchPersistenceService } from '../server/services/matchPersistenceService.ts';
import { ArenaAuthoritativeSession } from '../game/../server/game/arenaAuthoritativeSession.ts';

describe('Real-Time Online PvP and Matchmaking', () => {
  let server: http.Server;
  let port: number;
  let tokenPlayer1: string;
  let tokenPlayer2: string;
  let clientSocket1: ClientSocket;
  let clientSocket2: ClientSocket;

  beforeAll(async () => {
    // 1. Start test HTTP & Socket.IO server
    server = http.createServer(app);
    const ioServer = setupSocketIO(server);

    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        const addr = server.address() as any;
        port = addr.port;
        resolve();
      });
    });

    // 2. Provision two separate authenticated sessions
    tokenPlayer1 = createSessionToken({
      userId: 'user-pilot-1',
      username: 'ShadowPilot',
      role: 'USER',
      createdAt: Date.now(),
    });

    tokenPlayer2 = createSessionToken({
      userId: 'user-pilot-2',
      username: 'ApexTitan',
      role: 'USER',
      createdAt: Date.now(),
    });
  });

  afterAll(async () => {
    if (clientSocket1) clientSocket1.disconnect();
    if (clientSocket2) clientSocket2.disconnect();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('Rejects unauthenticated Socket.IO connection attempts', async () => {
    const unauthSocket = Client(`http://127.0.0.1:${port}`, {
      auth: { token: 'invalid.token.signature' },
      transports: ['websocket'],
      autoConnect: true,
      reconnection: false,
    });

    const errorPromise = new Promise<string>((resolve) => {
      unauthSocket.on('connect_error', (err) => {
        resolve(err.message);
      });
    });

    const msg = await errorPromise;
    expect(msg).toContain('Authentication failed');
    unauthSocket.disconnect();
  });

  it('Allows authenticated players to connect via Socket.IO', async () => {
    clientSocket1 = Client(`http://127.0.0.1:${port}`, {
      auth: { token: tokenPlayer1 },
      transports: ['websocket'],
      autoConnect: true,
    });

    clientSocket2 = Client(`http://127.0.0.1:${port}`, {
      auth: { token: tokenPlayer2 },
      transports: ['websocket'],
      autoConnect: true,
    });

    await Promise.all([
      new Promise<void>((resolve) => clientSocket1.on('connect', resolve)),
      new Promise<void>((resolve) => clientSocket2.on('connect', resolve)),
    ]);

    expect(clientSocket1.connected).toBe(true);
    expect(clientSocket2.connected).toBe(true);
  });

  it('Prevents the same player from queueing multiple times concurrently', () => {
    const res1 = matchmakingService.enqueue({
      userId: 'user-pilot-1',
      username: 'ShadowPilot',
      rank: 1,
      socketId: clientSocket1.id || 'sock-1',
      gameType: 'arena',
    });
    expect(res1.success).toBe(true);

    // Duplicate queue attempt
    const res2 = matchmakingService.enqueue({
      userId: 'user-pilot-1',
      username: 'ShadowPilot',
      rank: 1,
      socketId: clientSocket1.id || 'sock-1',
      gameType: 'arena',
    });
    expect(res2.success).toBe(false);
    expect(res2.error).toContain('already queued');

    // Clean up
    matchmakingService.dequeue('user-pilot-1');
  });

  it('Allows players to cancel queueing', () => {
    matchmakingService.enqueue({
      userId: 'user-pilot-1',
      username: 'ShadowPilot',
      rank: 1,
      socketId: 'sock-1',
    });
    expect(matchmakingService.isQueued('user-pilot-1')).toBe(true);

    const cancelled = matchmakingService.dequeue('user-pilot-1');
    expect(cancelled).toBe(true);
    expect(matchmakingService.isQueued('user-pilot-1')).toBe(false);
  });

  it('Offers a clearly labeled bot match after configurable timeout', async () => {
    // Configure a short timeout for test
    matchmakingService.botOfferTimeoutMs = 50;

    clientSocket1.emit('matchmaking:join', { gameType: 'arena' });

    const botOffer = await new Promise<any>((resolve) => {
      clientSocket1.on('matchmaking:bot_offer', resolve);
    });

    expect(botOffer.botName).toContain('[AI BOT]');
    expect(botOffer.message).toBeDefined();

    // Reset timeout
    matchmakingService.botOfferTimeoutMs = 10000;
    clientSocket1.emit('matchmaking:leave');
  });

  it('Matches two queued human players and executes ready handshake', async () => {
    const matchPromise1 = new Promise<any>((resolve) => {
      clientSocket1.once('matchmaking:match_found', resolve);
    });
    const matchPromise2 = new Promise<any>((resolve) => {
      clientSocket2.once('matchmaking:match_found', resolve);
    });

    // Both players queue up
    clientSocket1.emit('matchmaking:join', { gameType: 'arena' });
    clientSocket2.emit('matchmaking:join', { gameType: 'arena' });

    const [matchData1, matchData2] = await Promise.all([matchPromise1, matchPromise2]);

    expect(matchData1.matchId).toBe(matchData2.matchId);
    expect(matchData1.isBotMatch).toBe(false);
    expect(matchData1.participants.length).toBe(2);

    // Both players execute ready handshake
    const startPromise = new Promise<any>((resolve) => {
      clientSocket1.once('match:start', resolve);
    });

    clientSocket1.emit('match:ready', { matchId: matchData1.matchId });
    clientSocket2.emit('match:ready', { matchDataId: matchData2.matchId, matchId: matchData2.matchId });

    const startData = await startPromise;
    expect(startData.matchId).toBe(matchData1.matchId);
    expect(startData.players.length).toBe(2);
  });

  it('Enforces server-authoritative physics, movement limits, and cooldowns', async () => {
    matchmakingService.enqueue({
      userId: 'user-pilot-auth',
      username: 'AuthTester',
      rank: 1,
      socketId: 'sock-auth',
    });
    const match = matchmakingService.createBotMatch('user-pilot-auth')!;
    expect(match).toBeDefined();
    const session = new ArenaAuthoritativeSession(match, { to: () => ({ emit: () => {} }) } as any);
    session.isRunning = true;

    // Player inputs extreme movement (speed hacking attempt)
    session.handlePlayerInput('user-pilot-auth', { vx: 999, vy: 999, aimAngle: 0 });
    const p = session.players.get('user-pilot-auth')!;
    // Speed must be bounded to playerSpeed (240)
    const speed = Math.hypot(p.vx, p.vy);
    expect(speed).toBeLessThanOrEqual(241);

    // Attack cooldown enforcement
    const attack1 = session.handlePlayerAttack('user-pilot-auth', 0);
    expect(attack1).toBe(true);
    // Immediate repeat attack must be rejected on cooldown
    const attack2 = session.handlePlayerAttack('user-pilot-auth', 0);
    expect(attack2).toBe(false);
  });

  it('Processes match completion and rewards idempotently', async () => {
    const testMatchId = `test-match-${Date.now()}`;
    await MatchPersistenceService.recordMatchCreated({
      id: testMatchId,
      gameType: 'arena',
      playerAId: 'user-pilot-1',
      playerBId: 'user-pilot-2',
      isBotMatch: false,
    });

    // First completion
    const res1 = await MatchPersistenceService.completeMatchIdempotent({
      matchId: testMatchId,
      winnerId: 'user-pilot-1',
      loserId: 'user-pilot-2',
      winnerScore: 500,
      loserScore: 100,
      reason: 'ELIMINATION',
    });
    expect(res1.alreadyCompleted).toBe(false);

    // Duplicate completion attempt (e.g. race condition or replay)
    const res2 = await MatchPersistenceService.completeMatchIdempotent({
      matchId: testMatchId,
      winnerId: 'user-pilot-1',
      loserId: 'user-pilot-2',
      winnerScore: 500,
      loserScore: 100,
      reason: 'ELIMINATION',
    });
    expect(res2.alreadyCompleted).toBe(true);
  });
});
