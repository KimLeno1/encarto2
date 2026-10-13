import { Request, Response, NextFunction } from 'express';
import { matchmakingService } from '../services/matchmakingService.js';
import { MatchPersistenceService } from '../services/matchPersistenceService.js';
import { queueRequestSchema } from '../validators/matchmaking.js';

export class MatchmakingController {
  static async getQueueStatus(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    const isQueued = userId ? matchmakingService.isQueued(userId) : false;
    const activeMatch = userId ? matchmakingService.getUserActiveMatch(userId) : undefined;

    res.json({
      queueCount: matchmakingService.getQueueCount(),
      isQueued,
      activeMatchId: activeMatch?.id || null,
    });
  }

  static async joinQueue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const parsed = queueRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
        return;
      }

      const result = matchmakingService.enqueue({
        userId: req.user.id,
        username: req.user.username,
        rank: req.user.rank || 1,
        socketId: 'http-pending',
        gameType: parsed.data.preferredGame,
        wager: parsed.data.wager,
      });

      if (!result.success) {
        res.status(400).json({ error: result.error });
        return;
      }

      res.status(200).json({
        message: 'Successfully queued for matchmaking.',
        userId: req.user.id,
        gameType: parsed.data.preferredGame,
      });
    } catch (err) {
      next(err);
    }
  }

  static async cancelQueue(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const removed = matchmakingService.dequeue(req.user.id);
    res.json({
      message: removed ? 'Matchmaking queue cancelled.' : 'Player was not queued.',
      cancelled: removed,
    });
  }

  static async acceptBotMatch(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const match = matchmakingService.createBotMatch(req.user.id);
    if (!match) {
      res.status(400).json({ error: 'Cannot create bot match. Player is not in queue.' });
      return;
    }

    res.json({
      message: 'Bot match created successfully.',
      matchId: match.id,
      isBotMatch: true,
      botName: match.botName,
    });
  }

  static async getMatchDetails(req: Request, res: Response): Promise<void> {
    const matchId = String(req.params.matchId);
    const match = MatchPersistenceService.getMatch(matchId);

    if (!match) {
      res.status(404).json({ error: 'Match session not found.' });
      return;
    }

    res.json({ match });
  }
}
