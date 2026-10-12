import { Router } from 'express';
import { MatchmakingController } from '../controllers/matchmakingController.js';
import { authenticate } from '../middlewares/auth.js';

export const matchmakingRouter = Router();

// Queue operations
matchmakingRouter.get('/status', MatchmakingController.getQueueStatus);
matchmakingRouter.post('/queue', authenticate, MatchmakingController.joinQueue);
matchmakingRouter.post('/cancel', authenticate, MatchmakingController.cancelQueue);
matchmakingRouter.post('/bot-fallback', authenticate, MatchmakingController.acceptBotMatch);

// Match inspect
matchmakingRouter.get('/matches/:matchId', MatchmakingController.getMatchDetails);
