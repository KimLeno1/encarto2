import crypto from 'crypto';
import { MatchPersistenceService } from './matchPersistenceService.ts';

export interface QueuedPlayer {
  userId: string;
  username: string;
  rank: number;
  socketId: string;
  gameType: string;
  wager: number;
  joinedAt: number;
  offeredBotAt?: number;
}

export type MatchState = 'WAITING' | 'MATCHED' | 'ACTIVE' | 'COMPLETED' | 'ABANDONED' | 'CANCELLED';

export interface MatchParticipant {
  userId: string;
  username: string;
  rank: number;
  socketId: string;
  isBot: boolean;
  ready: boolean;
  disconnectedAt?: number;
}

export interface MatchSession {
  id: string;
  gameType: string;
  wager: number;
  isBotMatch: boolean;
  botName?: string;
  state: MatchState;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  participants: Record<string, MatchParticipant>;
  playerOrder: string[]; // [playerAId, playerBId]
  readyTimeoutTimer?: NodeJS.Timeout;
}

export class MatchmakingService {
  // Queue: userId -> QueuedPlayer
  private queue = new Map<string, QueuedPlayer>();
  // Active Match Sessions: matchId -> MatchSession
  private matches = new Map<string, MatchSession>();
  // User to Match mapping: userId -> matchId
  private userToMatch = new Map<string, string>();

  // Mutex flag for concurrency protection
  private isProcessingQueue = false;

  // Config
  public botOfferTimeoutMs = 10000; // 10s wait before offering bot match
  public readyTimeoutMs = 12000; // 12s to accept/ready handshake

  /**
   * Enqueue a player
   */
  public enqueue(player: {
    userId: string;
    username: string;
    rank: number;
    socketId: string;
    gameType?: string;
    wager?: number;
  }): { success: boolean; error?: string } {
    // 1. Prevent queuing if already in active match
    const existingMatchId = this.userToMatch.get(player.userId);
    if (existingMatchId) {
      const match = this.matches.get(existingMatchId);
      if (match && (match.state === 'MATCHED' || match.state === 'ACTIVE')) {
        return { success: false, error: 'Player is already in an ongoing match session.' };
      }
    }

    // 2. Prevent queuing multiple times
    if (this.queue.has(player.userId)) {
      return { success: false, error: 'Player is already queued in matchmaking.' };
    }

    const queuedPlayer: QueuedPlayer = {
      userId: player.userId,
      username: player.username,
      rank: player.rank,
      socketId: player.socketId,
      gameType: player.gameType || 'arena',
      wager: player.wager || 0,
      joinedAt: Date.now(),
    };

    this.queue.set(player.userId, queuedPlayer);
    return { success: true };
  }

  /**
   * Cancel queueing
   */
  public dequeue(userId: string): boolean {
    return this.queue.delete(userId);
  }

  public isQueued(userId: string): boolean {
    return this.queue.has(userId);
  }

  public getQueuedPlayer(userId: string): QueuedPlayer | undefined {
    return this.queue.get(userId);
  }

  public getQueueCount(): number {
    return this.queue.size;
  }

  /**
   * Safe atomic matchmaking pairing check
   */
  public processMatches(): {
    pairedMatches: MatchSession[];
    botOffersNeeded: QueuedPlayer[];
  } {
    if (this.isProcessingQueue) {
      return { pairedMatches: [], botOffersNeeded: [] };
    }

    this.isProcessingQueue = true;
    const pairedMatches: MatchSession[] = [];
    const botOffersNeeded: QueuedPlayer[] = [];

    try {
      const now = Date.now();
      const queuedList = Array.from(this.queue.values()).sort((a, b) => a.joinedAt - b.joinedAt);

      // Check if players have waited long enough for a bot offer
      for (const p of queuedList) {
        if (!p.offeredBotAt && now - p.joinedAt >= this.botOfferTimeoutMs) {
          p.offeredBotAt = now;
          botOffersNeeded.push(p);
        }
      }

      // Pair compatible players
      const matchedUserIds = new Set<string>();

      for (let i = 0; i < queuedList.length; i++) {
        const playerA = queuedList[i];
        if (matchedUserIds.has(playerA.userId)) continue;

        for (let j = i + 1; j < queuedList.length; j++) {
          const playerB = queuedList[j];
          if (matchedUserIds.has(playerB.userId)) continue;

          // Game types must match
          if (playerA.gameType === playerB.gameType) {
            matchedUserIds.add(playerA.userId);
            matchedUserIds.add(playerB.userId);

            // Remove from queue
            this.queue.delete(playerA.userId);
            this.queue.delete(playerB.userId);

            // Create match session
            const match = this.createHumanMatch(playerA, playerB);
            pairedMatches.push(match);
            break;
          }
        }
      }
    } finally {
      this.isProcessingQueue = false;
    }

    return { pairedMatches, botOffersNeeded };
  }

  private createHumanMatch(playerA: QueuedPlayer, playerB: QueuedPlayer): MatchSession {
    const matchId = `match-arena-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;

    const match: MatchSession = {
      id: matchId,
      gameType: playerA.gameType,
      wager: Math.min(playerA.wager, playerB.wager),
      isBotMatch: false,
      state: 'MATCHED',
      createdAt: Date.now(),
      playerOrder: [playerA.userId, playerB.userId],
      participants: {
        [playerA.userId]: {
          userId: playerA.userId,
          username: playerA.username,
          rank: playerA.rank,
          socketId: playerA.socketId,
          isBot: false,
          ready: false,
        },
        [playerB.userId]: {
          userId: playerB.userId,
          username: playerB.username,
          rank: playerB.rank,
          socketId: playerB.socketId,
          isBot: false,
          ready: false,
        },
      },
    };

    this.matches.set(matchId, match);
    this.userToMatch.set(playerA.userId, matchId);
    this.userToMatch.set(playerB.userId, matchId);

    // Record creation
    MatchPersistenceService.recordMatchCreated({
      id: matchId,
      gameType: playerA.gameType,
      playerAId: playerA.userId,
      playerBId: playerB.userId,
      isBotMatch: false,
      wager: match.wager,
    });

    return match;
  }

  /**
   * Create an explicitly labeled bot match
   */
  public createBotMatch(userId: string): MatchSession | null {
    const queuedPlayer = this.queue.get(userId);
    if (!queuedPlayer) {
      return null;
    }

    this.queue.delete(userId);

    const matchId = `match-arena-bot-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const botId = `bot-${crypto.randomBytes(4).toString('hex')}`;
    const botName = '[AI BOT] NEXUS-APEX';

    const match: MatchSession = {
      id: matchId,
      gameType: queuedPlayer.gameType,
      wager: queuedPlayer.wager,
      isBotMatch: true,
      botName,
      state: 'MATCHED',
      createdAt: Date.now(),
      playerOrder: [queuedPlayer.userId, botId],
      participants: {
        [queuedPlayer.userId]: {
          userId: queuedPlayer.userId,
          username: queuedPlayer.username,
          rank: queuedPlayer.rank,
          socketId: queuedPlayer.socketId,
          isBot: false,
          ready: true, // Auto-ready
        },
        [botId]: {
          userId: botId,
          username: botName,
          rank: Math.max(1, queuedPlayer.rank),
          socketId: 'bot-internal',
          isBot: true,
          ready: true, // Bot is always ready
        },
      },
    };

    this.matches.set(matchId, match);
    this.userToMatch.set(queuedPlayer.userId, matchId);

    MatchPersistenceService.recordMatchCreated({
      id: matchId,
      gameType: queuedPlayer.gameType,
      playerAId: queuedPlayer.userId,
      isBotMatch: true,
      botName,
      wager: queuedPlayer.wager,
    });

    return match;
  }

  public getMatch(matchId: string): MatchSession | undefined {
    return this.matches.get(matchId);
  }

  public getUserActiveMatch(userId: string): MatchSession | undefined {
    const matchId = this.userToMatch.get(userId);
    if (!matchId) return undefined;
    return this.matches.get(matchId);
  }

  public setPlayerReady(matchId: string, userId: string): { allReady: boolean; match?: MatchSession } {
    const match = this.matches.get(matchId);
    if (!match || match.state !== 'MATCHED') {
      return { allReady: false };
    }

    const participant = match.participants[userId];
    if (participant) {
      participant.ready = true;
    }

    const allReady = Object.values(match.participants).every((p) => p.ready);
    if (allReady) {
      match.state = 'ACTIVE';
      match.startedAt = Date.now();
      if (match.readyTimeoutTimer) {
        clearTimeout(match.readyTimeoutTimer);
      }
    }

    return { allReady, match };
  }

  public markMatchCompleted(matchId: string): void {
    const match = this.matches.get(matchId);
    if (match) {
      match.state = 'COMPLETED';
      match.completedAt = Date.now();
      Object.keys(match.participants).forEach((uid) => {
        if (!uid.startsWith('bot-')) {
          this.userToMatch.delete(uid);
        }
      });
    }
  }

  public markMatchAbandoned(matchId: string): void {
    const match = this.matches.get(matchId);
    if (match) {
      match.state = 'ABANDONED';
      match.completedAt = Date.now();
      Object.keys(match.participants).forEach((uid) => {
        if (!uid.startsWith('bot-')) {
          this.userToMatch.delete(uid);
        }
      });
    }
  }

  public handleSocketDisconnect(socketId: string): { queuedUserId?: string; activeMatchId?: string } {
    // Check if in queue
    for (const [uid, q] of this.queue.entries()) {
      if (q.socketId === socketId) {
        this.queue.delete(uid);
        return { queuedUserId: uid };
      }
    }

    // Check if in active match
    for (const [mId, m] of this.matches.entries()) {
      if (m.state === 'MATCHED' || m.state === 'ACTIVE') {
        for (const p of Object.values(m.participants)) {
          if (p.socketId === socketId && !p.isBot) {
            p.disconnectedAt = Date.now();
            return { activeMatchId: mId };
          }
        }
      }
    }

    return {};
  }
}

export const matchmakingService = new MatchmakingService();
