import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ProgressionService } from '../services/progressionService.ts';

const completeBotMatchSchema = z.object({
  matchId: z.string().min(3).max(100),
  gameType: z.string().default('arena'),
  botDifficulty: z.enum(['EASY', 'NORMAL', 'HARD']).default('NORMAL'),
  botName: z.string().optional(),
  outcome: z.enum(['VICTORY', 'DEFEAT', 'DRAW']),
  score: z.number().int().min(0).max(100000).default(0),
  damageDealt: z.number().min(0).default(0),
  botsDefeated: z.number().int().min(0).default(0),
  durationSeconds: z.number().min(1).max(3600).default(60),
});

export class ProgressionController {
  static async getMyProgression(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized: Session required' });
        return;
      }

      const progression = await ProgressionService.getPlayerProgression(req.user.id);
      res.json(progression);
    } catch (error) {
      next(error);
    }
  }

  static async getUserProgression(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = String(req.params.userId);
      const progression = await ProgressionService.getPlayerProgression(userId);
      res.json(progression);
    } catch (error) {
      next(error);
    }
  }

  static async getMatchHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = String(req.params.userId || (req.user ? req.user.id : ''));
      if (!userId) {
        res.status(400).json({ error: 'User ID is required' });
        return;
      }

      const mode = req.query.mode as 'pvp' | 'bot' | 'all' | undefined;
      const gameType = req.query.gameType as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;

      const history = ProgressionService.getMatchHistory(userId, { mode, gameType, limit });
      res.json({ userId, history });
    } catch (error) {
      next(error);
    }
  }

  static async getLeaderboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const leaderboard = await ProgressionService.getLeaderboard(limit);
      res.json({ leaderboard });
    } catch (error) {
      next(error);
    }
  }

  static async completeBotMatch(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized: Authentication required to submit match' });
        return;
      }

      const parsed = completeBotMatchSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: 'Validation failed',
          details: parsed.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
        });
        return;
      }

      const data = parsed.data;

      const results = await ProgressionService.awardMatchProgression({
        matchId: data.matchId,
        gameType: data.gameType,
        isBotMatch: true,
        botDifficulty: data.botDifficulty,
        botName: data.botName || `[AI BOT] ${data.botDifficulty}-SIM`,
        participantResults: [
          {
            userId: req.user.id,
            username: req.user.username,
            isBot: false,
            score: data.score,
            damageDealt: data.damageDealt,
            isWinner: data.outcome === 'VICTORY',
            isLoser: data.outcome === 'DEFEAT',
            isDraw: data.outcome === 'DRAW',
            isForfeit: false,
          },
          {
            userId: `bot:${data.botDifficulty}`,
            username: data.botName || `[AI BOT] ${data.botDifficulty}-SIM`,
            isBot: true,
            score: Math.max(0, 500 - data.score),
            isWinner: data.outcome === 'DEFEAT',
            isLoser: data.outcome === 'VICTORY',
            isDraw: data.outcome === 'DRAW',
            isForfeit: false,
          },
        ],
        reason: data.outcome === 'DRAW' ? 'DRAW' : 'ELIMINATION',
        telemetry: {
          durationSeconds: data.durationSeconds,
          botsDefeated: data.botsDefeated,
        },
      });

      const userResult = results.find((r) => r.userId === req.user?.id);

      res.json({
        message: userResult?.alreadyAwarded
          ? 'Match already recorded (idempotent result returned).'
          : 'Bot practice match completed and verified.',
        result: userResult,
      });
    } catch (error) {
      next(error);
    }
  }
}
