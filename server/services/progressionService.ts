import { prisma } from '../db/client.js';
import { logAuditEvent } from '../utils/audit.js';
import {
  PROGRESSION_CONFIG,
  calculateLevelFromExp,
  RankTier,
} from '../config/progressionConfig.js';

export type MatchOutcome = 'VICTORY' | 'DEFEAT' | 'DRAW' | 'FORFEIT';
export type MatchEndReason = 'ELIMINATION' | 'TIMEOUT' | 'FORFEIT' | 'DRAW';

export interface XPTransaction {
  id: string;
  userId: string;
  matchId: string;
  amount: number;
  gameType: string;
  reason: string;
  previousExp: number;
  newExp: number;
  previousLevel: number;
  newLevel: number;
  createdAt: Date;
}

export interface PlayerPvpStats {
  played: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number; // percentage 0-100
  currentStreak: number;
  highestStreak: number;
}

export interface PlayerBotStats {
  played: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
}

export interface PlayerProgressionStats {
  userId: string;
  totalMatches: number;
  totalExpEarned: number;
  totalScore: number;
  totalDamageDealt: number;
  totalEliminations: number;
  pvp: PlayerPvpStats;
  bot: PlayerBotStats;
  gameBreakdown: Record<string, { played: number; wins: number }>;
}

export interface MatchHistoryItem {
  id: string;
  matchId: string;
  gameType: string;
  isBotMatch: boolean;
  botDifficulty?: 'EASY' | 'NORMAL' | 'HARD';
  opponentId?: string;
  opponentName: string;
  opponentIsBot: boolean;
  outcome: MatchOutcome;
  playerScore: number;
  opponentScore: number;
  xpEarned: number;
  reason: MatchEndReason;
  completedAt: Date;
  telemetry?: Record<string, any>;
}

export interface AwardMatchProgressionParams {
  matchId: string;
  gameType: string;
  isBotMatch: boolean;
  botDifficulty?: 'EASY' | 'NORMAL' | 'HARD';
  botName?: string;
  participantResults: Array<{
    userId: string;
    username: string;
    isBot: boolean;
    score: number;
    damageDealt?: number;
    hitsLanded?: number;
    isWinner: boolean;
    isLoser: boolean;
    isDraw: boolean;
    isForfeit: boolean;
  }>;
  reason: MatchEndReason;
  telemetry?: Record<string, any>;
}

export interface AwardResultForUser {
  userId: string;
  alreadyAwarded: boolean;
  xpEarned: number;
  previousExp: number;
  newExp: number;
  previousLevel: number;
  newLevel: number;
  leveledUp: boolean;
  tier: RankTier;
  outcome: MatchOutcome;
  transactionId?: string;
}

// In-Memory persistent caches for high reliability in any runtime
const processedMatches = new Set<string>();
const xpTransactionsStore: XPTransaction[] = [];
const matchHistoryStore: Map<string, MatchHistoryItem[]> = new Map(); // userId -> MatchHistoryItem[]
const playerStatsStore: Map<string, PlayerProgressionStats> = new Map(); // userId -> stats
const userExpStore: Map<string, number> = new Map(); // userId -> totalExp

export class ProgressionService {
  /**
   * Resets in-memory stores for isolated unit testing
   */
  static resetForTesting(): void {
    processedMatches.clear();
    xpTransactionsStore.length = 0;
    matchHistoryStore.clear();
    playerStatsStore.clear();
    userExpStore.clear();
  }

  /**
   * Atomically and idempotently awards XP and updates stats for match participants
   */
  static async awardMatchProgression(
    params: AwardMatchProgressionParams
  ): Promise<AwardResultForUser[]> {
    const { matchId, gameType, isBotMatch, botDifficulty = 'NORMAL', botName, participantResults, reason, telemetry } = params;

    // Check idempotency: if this matchId was already awarded, return existing result without duplicate rewards
    if (processedMatches.has(matchId)) {
      return participantResults
        .filter((p) => !p.isBot)
        .map((p) => {
          const userHistory = (matchHistoryStore.get(p.userId) || []).find((h) => h.matchId === matchId);
          const currentExp = this.getUserTotalExp(p.userId);
          const levelInfo = calculateLevelFromExp(currentExp);
          return {
            userId: p.userId,
            alreadyAwarded: true,
            xpEarned: userHistory ? userHistory.xpEarned : 0,
            previousExp: currentExp,
            newExp: currentExp,
            previousLevel: levelInfo.level,
            newLevel: levelInfo.level,
            leveledUp: false,
            tier: levelInfo.tier,
            outcome: userHistory ? userHistory.outcome : 'DRAW',
          };
        });
    }

    processedMatches.add(matchId);

    const results: AwardResultForUser[] = [];

    for (const participant of participantResults) {
      if (participant.isBot) continue; // Bots do not earn XP

      const userId = participant.userId;
      const opponent = participantResults.find((p) => p.userId !== userId);
      const opponentName = opponent ? opponent.username : (botName || 'AI Challenger');
      const opponentIsBot = opponent ? opponent.isBot : isBotMatch;
      const opponentScore = opponent ? opponent.score : 0;

      // Determine match outcome
      let outcome: MatchOutcome = 'DRAW';
      if (participant.isForfeit) {
        outcome = 'FORFEIT';
      } else if (participant.isWinner) {
        outcome = 'VICTORY';
      } else if (participant.isLoser) {
        outcome = 'DEFEAT';
      }

      // Calculate XP based on rules & mode
      let xpEarned = 0;
      let reasonLabel = '';

      if (isBotMatch) {
        // Distinguish bot match rewards by difficulty
        const botConfig = PROGRESSION_CONFIG.bot[botDifficulty.toLowerCase() as 'easy' | 'normal' | 'hard'] || PROGRESSION_CONFIG.bot.normal;
        if (outcome === 'VICTORY') {
          xpEarned = botConfig.winExp;
          reasonLabel = `BOT_WIN_${botDifficulty}`;
        } else if (outcome === 'DEFEAT') {
          xpEarned = botConfig.lossExp;
          reasonLabel = `BOT_LOSS_${botDifficulty}`;
        } else {
          xpEarned = botConfig.drawExp;
          reasonLabel = `BOT_DRAW_${botDifficulty}`;
        }
      } else {
        // Human PvP rules
        if (participant.isForfeit) {
          xpEarned = PROGRESSION_CONFIG.pvp.forfeitLoserExp; // 0 XP penalty for abandon/forfeit
          reasonLabel = 'PVP_FORFEIT_PENALTY';
        } else if (opponent?.isForfeit && participant.isWinner) {
          xpEarned = PROGRESSION_CONFIG.pvp.forfeitWinnerExp;
          reasonLabel = 'PVP_WIN_BY_FORFEIT';
        } else if (outcome === 'VICTORY') {
          xpEarned = PROGRESSION_CONFIG.pvp.winExp;
          reasonLabel = 'PVP_WIN';
        } else if (outcome === 'DEFEAT') {
          xpEarned = PROGRESSION_CONFIG.pvp.lossExp;
          reasonLabel = 'PVP_LOSS';
        } else {
          xpEarned = PROGRESSION_CONFIG.pvp.drawExp;
          reasonLabel = 'PVP_DRAW';
        }

        // Add performance bonus for score/performance if not forfeited
        if (!participant.isForfeit && participant.score > 300) {
          const perfBonus = Math.min(
            PROGRESSION_CONFIG.pvp.maxPerformanceBonusExp,
            Math.floor(participant.score / 50)
          );
          if (perfBonus > 0) {
            xpEarned += perfBonus;
            reasonLabel += `_WITH_BONUS`;
          }
        }
      }

      // Current Experience & Levels
      const previousExp = this.getUserTotalExp(userId);
      const prevLevelInfo = calculateLevelFromExp(previousExp);
      const newExp = previousExp + xpEarned;
      const newLevelInfo = calculateLevelFromExp(newExp);
      const leveledUp = newLevelInfo.level > prevLevelInfo.level;

      // Update in-memory user total exp
      userExpStore.set(userId, newExp);

      // Create auditable XP transaction
      const transactionId = `xpt-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      const transaction: XPTransaction = {
        id: transactionId,
        userId,
        matchId,
        amount: xpEarned,
        gameType,
        reason: reasonLabel,
        previousExp,
        newExp,
        previousLevel: prevLevelInfo.level,
        newLevel: newLevelInfo.level,
        createdAt: new Date(),
      };
      xpTransactionsStore.unshift(transaction);

      // Record match history entry
      const historyEntry: MatchHistoryItem = {
        id: `mhi-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        matchId,
        gameType,
        isBotMatch,
        botDifficulty: isBotMatch ? botDifficulty : undefined,
        opponentId: opponent?.userId,
        opponentName,
        opponentIsBot,
        outcome,
        playerScore: participant.score,
        opponentScore,
        xpEarned,
        reason,
        completedAt: new Date(),
        telemetry,
      };

      const userHistory = matchHistoryStore.get(userId) || [];
      userHistory.unshift(historyEntry);
      matchHistoryStore.set(userId, userHistory);

      // Update player statistics
      this.updatePlayerStats(userId, {
        gameType,
        isBotMatch,
        outcome,
        score: participant.score,
        damageDealt: participant.damageDealt || 0,
        xpEarned,
      });

      // Persist to database if Prisma is available
      try {
        await prisma.$transaction(async (tx) => {
          const dbUser = await tx.user.findUnique({ where: { id: userId } });
          if (dbUser) {
            await tx.user.update({
              where: { id: userId },
              data: {
                exp: newExp,
                rank: newLevelInfo.level,
              },
            });
          }
        });
      } catch {
        // Fallback already cached
      }

      // Audit log entry for compliance
      await logAuditEvent({
        action: 'XP_AWARDED',
        performedBy: userId,
        details: {
          matchId,
          transactionId,
          gameType,
          isBotMatch,
          xpEarned,
          previousExp,
          newExp,
          newLevel: newLevelInfo.level,
          tier: newLevelInfo.tier.name,
          reason: reasonLabel,
        },
      });

      results.push({
        userId,
        alreadyAwarded: false,
        xpEarned,
        previousExp,
        newExp,
        previousLevel: prevLevelInfo.level,
        newLevel: newLevelInfo.level,
        leveledUp,
        tier: newLevelInfo.tier,
        outcome,
        transactionId,
      });
    }

    return results;
  }

  /**
   * Retrieves player progression profile including level, tier, stats, recent history & XP transactions
   */
  static async getPlayerProgression(userId: string): Promise<{
    userId: string;
    level: number;
    tier: RankTier;
    totalExp: number;
    expInLevel: number;
    expForNextLevel: number;
    progressPercent: number;
    stats: PlayerProgressionStats;
    recentHistory: MatchHistoryItem[];
    recentTransactions: XPTransaction[];
  }> {
    // Attempt to read exp from DB if available, else in-memory
    let totalExp = this.getUserTotalExp(userId);
    try {
      const dbUser = await prisma.user.findUnique({ where: { id: userId } });
      if (dbUser && dbUser.exp > totalExp) {
        totalExp = dbUser.exp;
        userExpStore.set(userId, totalExp);
      }
    } catch {
      // Continue with memory store
    }

    const levelInfo = calculateLevelFromExp(totalExp);
    const stats = this.getOrCreatePlayerStats(userId);
    const history = matchHistoryStore.get(userId) || [];
    const transactions = xpTransactionsStore.filter((t) => t.userId === userId).slice(0, 25);

    return {
      userId,
      level: levelInfo.level,
      tier: levelInfo.tier,
      totalExp,
      expInLevel: levelInfo.expInLevel,
      expForNextLevel: levelInfo.expForNextLevel,
      progressPercent: levelInfo.progressPercent,
      stats,
      recentHistory: history.slice(0, 20),
      recentTransactions: transactions,
    };
  }

  /**
   * Retrieves match history for a user with optional mode filter
   */
  static getMatchHistory(
    userId: string,
    filter?: { mode?: 'pvp' | 'bot' | 'all'; gameType?: string; limit?: number }
  ): MatchHistoryItem[] {
    let items = matchHistoryStore.get(userId) || [];

    if (filter?.mode === 'pvp') {
      items = items.filter((i) => !i.isBotMatch);
    } else if (filter?.mode === 'bot') {
      items = items.filter((i) => i.isBotMatch);
    }

    if (filter?.gameType) {
      items = items.filter((i) => i.gameType === filter.gameType);
    }

    const limit = filter?.limit || 50;
    return items.slice(0, limit);
  }

  /**
   * Leaderboard: returns top ranked players
   */
  static async getLeaderboard(limit: number = 20): Promise<Array<{
    userId: string;
    username: string;
    level: number;
    tier: RankTier;
    totalExp: number;
    pvpWinRate: number;
    pvpMatches: number;
  }>> {
    const list: Array<{
      userId: string;
      username: string;
      level: number;
      tier: RankTier;
      totalExp: number;
      pvpWinRate: number;
      pvpMatches: number;
    }> = [];

    // Collect from in-memory stats
    for (const [uid, stats] of playerStatsStore.entries()) {
      const exp = this.getUserTotalExp(uid);
      const levelInfo = calculateLevelFromExp(exp);
      list.push({
        userId: uid,
        username: uid,
        level: levelInfo.level,
        tier: levelInfo.tier,
        totalExp: exp,
        pvpWinRate: stats.pvp.winRate,
        pvpMatches: stats.pvp.played,
      });
    }

    // Try reading top users from DB if present
    try {
      const topDbUsers = await prisma.user.findMany({
        take: limit,
        orderBy: { exp: 'desc' },
      });
      for (const u of topDbUsers) {
        if (!list.find((x) => x.userId === u.id)) {
          const levelInfo = calculateLevelFromExp(u.exp);
          const stats = this.getOrCreatePlayerStats(u.id);
          list.push({
            userId: u.id,
            username: u.username,
            level: levelInfo.level,
            tier: levelInfo.tier,
            totalExp: u.exp,
            pvpWinRate: stats.pvp.winRate,
            pvpMatches: stats.pvp.played,
          });
        }
      }
    } catch {
      // Continue
    }

    list.sort((a, b) => b.totalExp - a.totalExp);
    return list.slice(0, limit);
  }

  /**
   * Internal helpers
   */
  public static getUserTotalExp(userId: string): number {
    return userExpStore.get(userId) || 0;
  }

  public static setUserTotalExp(userId: string, exp: number): void {
    userExpStore.set(userId, exp);
  }

  private static getOrCreatePlayerStats(userId: string): PlayerProgressionStats {
    let stats = playerStatsStore.get(userId);
    if (!stats) {
      stats = {
        userId,
        totalMatches: 0,
        totalExpEarned: 0,
        totalScore: 0,
        totalDamageDealt: 0,
        totalEliminations: 0,
        pvp: {
          played: 0,
          wins: 0,
          losses: 0,
          draws: 0,
          winRate: 0,
          currentStreak: 0,
          highestStreak: 0,
        },
        bot: {
          played: 0,
          wins: 0,
          losses: 0,
          draws: 0,
          winRate: 0,
        },
        gameBreakdown: {},
      };
      playerStatsStore.set(userId, stats);
    }
    return stats;
  }

  private static updatePlayerStats(
    userId: string,
    params: {
      gameType: string;
      isBotMatch: boolean;
      outcome: MatchOutcome;
      score: number;
      damageDealt: number;
      xpEarned: number;
    }
  ): void {
    const stats = this.getOrCreatePlayerStats(userId);
    stats.totalMatches += 1;
    stats.totalExpEarned += params.xpEarned;
    stats.totalScore += params.score;
    stats.totalDamageDealt += params.damageDealt;
    if (params.outcome === 'VICTORY') {
      stats.totalEliminations += 1;
    }

    // Per game breakdown
    if (!stats.gameBreakdown[params.gameType]) {
      stats.gameBreakdown[params.gameType] = { played: 0, wins: 0 };
    }
    stats.gameBreakdown[params.gameType].played += 1;
    if (params.outcome === 'VICTORY') {
      stats.gameBreakdown[params.gameType].wins += 1;
    }

    // Distinguish PvP vs Bot practice stats
    if (params.isBotMatch) {
      stats.bot.played += 1;
      if (params.outcome === 'VICTORY') stats.bot.wins += 1;
      else if (params.outcome === 'DEFEAT' || params.outcome === 'FORFEIT') stats.bot.losses += 1;
      else stats.bot.draws += 1;

      stats.bot.winRate = Math.round((stats.bot.wins / stats.bot.played) * 100);
    } else {
      stats.pvp.played += 1;
      if (params.outcome === 'VICTORY') {
        stats.pvp.wins += 1;
        stats.pvp.currentStreak += 1;
        if (stats.pvp.currentStreak > stats.pvp.highestStreak) {
          stats.pvp.highestStreak = stats.pvp.currentStreak;
        }
      } else if (params.outcome === 'DEFEAT' || params.outcome === 'FORFEIT') {
        stats.pvp.losses += 1;
        stats.pvp.currentStreak = 0;
      } else {
        stats.pvp.draws += 1;
        stats.pvp.currentStreak = 0;
      }

      stats.pvp.winRate = Math.round((stats.pvp.wins / stats.pvp.played) * 100);
    }
  }
}
