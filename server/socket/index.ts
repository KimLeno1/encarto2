import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { verifySessionToken } from '../utils/session.js';
import { env } from '../config/env.js';
import { matchmakingService, MatchSession } from '../services/matchmakingService.js';
import { ArenaAuthoritativeSession } from '../game/arenaAuthoritativeSession.js';
import { playerInputSchema, attackInputSchema } from '../validators/matchmaking.js';

// Map of active authoritative sessions: matchId -> ArenaAuthoritativeSession
export const activeGameSessions = new Map<string, ArenaAuthoritativeSession>();

export function setupSocketIO(httpServer: HttpServer): SocketIOServer {
  const allowedOrigins = new Set(
    env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
  );
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) {
          callback(null, true);
          return;
        }
        callback(null, false);
      },
      credentials: true,
    },
    // CORS middleware does not protect the WebSocket upgrade itself; enforce Origin here too.
    allowRequest: (req, callback) => {
      const origin = req.headers.origin;
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }
      callback('Untrusted WebSocket origin', false);
    },
    transports: ['websocket', 'polling'],
  });

  // 1. Socket Authentication Middleware
  io.use((socket: Socket, next) => {
    try {
      let token: string | undefined = undefined;

      // Extract from auth object
      if (socket.handshake.auth && socket.handshake.auth.token) {
        token = socket.handshake.auth.token;
      }

      // Or extract from cookies in handshake headers
      if (!token && socket.handshake.headers.cookie) {
        const cookies = socket.handshake.headers.cookie.split(';');
        for (const cookie of cookies) {
          const [key, value] = cookie.trim().split('=');
          if (key === 'encarto_session') {
            token = decodeURIComponent(value);
            break;
          }
        }
      }

      if (!token) {
        return next(new Error('Authentication required: No session token provided.'));
      }

      const session = verifySessionToken(token);
      if (!session) {
        return next(new Error('Authentication failed: Invalid or expired session token.'));
      }

      // Attach authenticated user data to socket
      socket.data.user = {
        userId: session.userId,
        username: session.username,
        role: session.role,
      };

      next();
    } catch (err: any) {
      next(new Error(`Authentication error: ${err.message}`));
    }
  });

  // Background queue processing interval (runs every 500ms)
  setInterval(() => {
    const { pairedMatches, botOffersNeeded } = matchmakingService.processMatches();

    // Notify paired matches
    for (const match of pairedMatches) {
      notifyMatchFound(io, match);
    }

    // Offer bot matches to players waiting past timeout
    for (const queued of botOffersNeeded) {
      const socket = io.sockets.sockets.get(queued.socketId);
      if (socket) {
        socket.emit('matchmaking:bot_offer', {
          userId: queued.userId,
          message: 'No players found in queue yet. Battle an AI Bot or continue waiting?',
          botName: '[AI BOT] NEXUS-APEX',
          timeoutSeconds: 15,
        });
      }
    }
  }, 500);

  // 2. Connection Handling
  io.on('connection', (socket: Socket) => {
    const user = socket.data.user;

    // A. Matchmaking: Join Queue
    socket.on('matchmaking:join', (payload: { gameType?: string; wager?: number }) => {
      const result = matchmakingService.enqueue({
        userId: user.userId,
        username: user.username,
        rank: 1,
        socketId: socket.id,
        gameType: payload?.gameType || 'arena',
        wager: payload?.wager || 0,
      });

      if (!result.success) {
        socket.emit('matchmaking:error', { message: result.error });
        return;
      }

      socket.emit('matchmaking:queued', {
        userId: user.userId,
        gameType: payload?.gameType || 'arena',
        joinedAt: Date.now(),
      });
    });

    // B. Matchmaking: Leave Queue
    socket.on('matchmaking:leave', () => {
      const removed = matchmakingService.dequeue(user.userId);
      socket.emit('matchmaking:left', { success: removed });
    });

    // C. Matchmaking: Accept Bot Match
    socket.on('matchmaking:accept_bot', () => {
      const botMatch = matchmakingService.createBotMatch(user.userId);
      if (botMatch) {
        notifyMatchFound(io, botMatch);
      }
    });

    // D. Ready Handshake
    socket.on('match:ready', (payload: { matchId: string }) => {
      const { matchId } = payload;
      const match = matchmakingService.getMatch(matchId);
      if (!match) {
        socket.emit('match:error', { message: 'Match not found.' });
        return;
      }

      // Validate user is a participant
      if (!match.participants[user.userId]) {
        socket.emit('match:error', { message: 'Unauthorized match participation.' });
        return;
      }

      socket.join(`room:match:${matchId}`);
      const { allReady } = matchmakingService.setPlayerReady(matchId, user.userId);

      socket.emit('match:ready_confirmed', { userId: user.userId, matchId });

      if (allReady) {
        // Start authoritative game session
        let session = activeGameSessions.get(matchId);
        if (!session) {
          session = new ArenaAuthoritativeSession(match, io);
          activeGameSessions.set(matchId, session);
        }
        session.start();
      }
    });

    // E. Player Inputs (Authoritative validation)
    socket.on('match:input', (payload: { matchId: string; vx: number; vy: number; aimAngle: number }) => {
      const parsed = playerInputSchema.safeParse(payload);
      if (!parsed.success) return;

      const session = activeGameSessions.get(payload.matchId);
      if (!session || !session.players.has(user.userId)) return;

      session.handlePlayerInput(user.userId, parsed.data);
    });

    // F. Attacks (Authoritative validation)
    socket.on('match:attack', (payload: { matchId: string; aimAngle: number }) => {
      const parsed = attackInputSchema.safeParse(payload);
      if (!parsed.success) return;

      const session = activeGameSessions.get(payload.matchId);
      if (!session || !session.players.has(user.userId)) return;

      session.handlePlayerAttack(user.userId, parsed.data.aimAngle);
    });

    // G. Heavy Special Attack
    socket.on('match:special', (payload: { matchId: string; aimAngle: number }) => {
      const parsed = attackInputSchema.safeParse(payload);
      if (!parsed.success) return;

      const session = activeGameSessions.get(payload.matchId);
      if (!session || !session.players.has(user.userId)) return;

      session.handlePlayerSpecial(user.userId, parsed.data.aimAngle);
    });

    // H. Tactical Dash
    socket.on('match:dash', (payload: { matchId: string }) => {
      const session = activeGameSessions.get(payload.matchId);
      if (!session || !session.players.has(user.userId)) return;

      session.handlePlayerDash(user.userId);
    });

    // I. Reconnection
    socket.on('match:reconnect', (payload: { matchId: string }) => {
      const session = activeGameSessions.get(payload.matchId);
      if (session && session.players.has(user.userId)) {
        session.handlePlayerReconnect(user.userId, socket);
      }
    });

    // J. Disconnect Handling
    socket.on('disconnect', () => {
      const { queuedUserId, activeMatchId } = matchmakingService.handleSocketDisconnect(socket.id);

      if (activeMatchId) {
        const session = activeGameSessions.get(activeMatchId);
        if (session) {
          session.handlePlayerDisconnect(user.userId);
        }
      }
    });
  });

  return io;
}

function notifyMatchFound(io: SocketIOServer, match: MatchSession) {
  // Join both player sockets to room
  for (const participant of Object.values(match.participants)) {
    if (!participant.isBot) {
      const playerSocket = io.sockets.sockets.get(participant.socketId);
      if (playerSocket) {
        playerSocket.join(`room:match:${match.id}`);
      }
    }
  }

  // Pre-instantiate game session
  const session = new ArenaAuthoritativeSession(match, io);
  activeGameSessions.set(match.id, session);

  // Emit match_found to all participants in room
  io.to(`room:match:${match.id}`).emit('matchmaking:match_found', {
    matchId: match.id,
    gameType: match.gameType,
    wager: match.wager,
    isBotMatch: match.isBotMatch,
    botName: match.botName,
    participants: Object.values(match.participants).map((p) => ({
      userId: p.userId,
      username: p.username,
      rank: p.rank,
      isBot: p.isBot,
    })),
    handshakeTimeoutSeconds: 12,
  });

  // If bot match, auto-start since bot is already ready!
  if (match.isBotMatch) {
    session.start();
  }
}
