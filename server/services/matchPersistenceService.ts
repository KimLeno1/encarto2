import { prisma } from '../db/client.ts';
import { logAuditEvent } from '../utils/audit.ts';
import { ProgressionService, AwardResultForUser } from './progressionService.ts';

export interface MatchInitParams {
  id: string;
  gameType: string;
  playerAId: string;
  playerBId?: string;
  isBotMatch: boolean;
  botName?: string;
  botDifficulty?: 'EASY' | 'NORMAL' | 'HARD';
  wager?: number;
}

export interface MatchCompleteParams {
  matchId: string;
  winnerId: string | null; // null for draw
  loserId: string | null;
  winnerScore: number;
  loserScore: number;
  reason: 'ELIMINATION' | 'TIMEOUT' | 'FORFEIT' | 'DRAW';
  telemetry?: Record<string, any>;
}

// In-memory persistent cache to guarantee smooth operations in standalone dev environments
const memoryMatchStore = new Map<string, any>();

export class MatchPersistenceService {
  static async recordMatchCreated(params: MatchInitParams): Promise<void> {
    const memoryRecord = {
      id: params.id,
      gameType: params.gameType,
      playerAId: params.playerAId,
      playerBId: params.playerBId || (params.isBotMatch ? `bot:${params.botName}` : null),
      isBotMatch: params.isBotMatch,
      botName: params.botName,
      botDifficulty: params.botDifficulty || 'NORMAL',
      wager: params.wager || 0,
      status: 'IN_PROGRESS',
      createdAt: new Date(),
      completedAt: null,
      winnerId: null,
    };
    memoryMatchStore.set(params.id, memoryRecord);

    try {
      // If DB is connected, persist to Prisma
      await prisma.match.create({
        data: {
          id: params.id,
          gameType: params.gameType,
          playerAId: params.playerAId,
          playerBId: params.playerBId || undefined,
          wager: params.wager || 0,
          status: 'IN_PROGRESS',
          telemetry: {
            isBotMatch: params.isBotMatch,
            botName: params.botName,
            botDifficulty: params.botDifficulty,
          },
        },
      });
    } catch {
      // Gracefully continue using memoryRecord
    }
  }

  static async completeMatchIdempotent(
    params: MatchCompleteParams
  ): Promise<{ alreadyCompleted: boolean; match: any; progressionResults?: AwardResultForUser[] }> {
    const memoryRecord = memoryMatchStore.get(params.matchId);
    if (memoryRecord && memoryRecord.completedAt) {
      return { alreadyCompleted: true, match: memoryRecord };
    }

    if (memoryRecord) {
      memoryRecord.status = params.reason === 'FORFEIT' ? 'CANCELLED' : 'COMPLETED';
      memoryRecord.completedAt = new Date();
      memoryRecord.winnerId = params.winnerId;
      memoryRecord.reason = params.reason;
      memoryRecord.telemetry = params.telemetry;
    }

    // Prepare participants for ProgressionService
    const participantResults: Array<{
      userId: string;
      username: string;
      isBot: boolean;
      score: number;
      isWinner: boolean;
      isLoser: boolean;
      isDraw: boolean;
      isForfeit: boolean;
    }> = [];

    if (params.winnerId) {
      const isBot = params.winnerId.startsWith('bot:');
      participantResults.push({
        userId: params.winnerId,
        username: isBot ? (memoryRecord?.botName || params.winnerId) : params.winnerId,
        isBot,
        score: params.winnerScore,
        isWinner: params.reason !== 'DRAW',
        isLoser: false,
        isDraw: params.reason === 'DRAW',
        isForfeit: false,
      });
    }

    if (params.loserId) {
      const isBot = params.loserId.startsWith('bot:');
      participantResults.push({
        userId: params.loserId,
        username: isBot ? (memoryRecord?.botName || params.loserId) : params.loserId,
        isBot,
        score: params.loserScore,
        isWinner: false,
        isLoser: params.reason !== 'DRAW',
        isDraw: params.reason === 'DRAW',
        isForfeit: params.reason === 'FORFEIT',
      });
    }

    // Award XP and stats idempotently via ProgressionService
    let progressionResults: AwardResultForUser[] = [];
    if (participantResults.length > 0) {
      progressionResults = await ProgressionService.awardMatchProgression({
        matchId: params.matchId,
        gameType: memoryRecord?.gameType || 'arena',
        isBotMatch: memoryRecord?.isBotMatch ?? Boolean(params.loserId?.startsWith('bot:') || params.winnerId?.startsWith('bot:')),
        botDifficulty: memoryRecord?.botDifficulty || 'NORMAL',
        botName: memoryRecord?.botName,
        participantResults,
        reason: params.reason,
        telemetry: params.telemetry,
      });
    }

    // Award XP in DB if Prisma is available
    try {
      await prisma.$transaction(async (tx) => {
        const dbMatch = await tx.match.findUnique({
          where: { id: params.matchId },
        });

        if (dbMatch && dbMatch.completedAt) {
          return;
        }

        if (dbMatch) {
          await tx.match.update({
            where: { id: params.matchId },
            data: {
              status: params.reason === 'FORFEIT' ? 'CANCELLED' : 'COMPLETED',
              winnerId: params.winnerId || undefined,
              completedAt: new Date(),
              telemetry: params.telemetry || {},
            },
          });
        }
      });
    } catch {
      // Memory store already updated
    }

    await logAuditEvent({
      action: 'MATCH_COMPLETED',
      performedBy: params.winnerId,
      details: {
        matchId: params.matchId,
        winnerId: params.winnerId,
        loserId: params.loserId,
        reason: params.reason,
        winnerScore: params.winnerScore,
      },
    });

    return { alreadyCompleted: false, match: memoryRecord, progressionResults };
  }

  static getMatch(matchId: string): any | null {
    return memoryMatchStore.get(matchId) || null;
  }
}
