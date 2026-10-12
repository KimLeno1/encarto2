import { Router } from 'express';
import { ProgressionController } from '../controllers/progressionController.ts';
import { authenticate } from '../middlewares/auth.ts';

export const progressionRouter = Router();

// Current authenticated user progression
progressionRouter.get('/me', authenticate, ProgressionController.getMyProgression);

// Leaderboard
progressionRouter.get('/leaderboard', ProgressionController.getLeaderboard);

// Public profile progression
progressionRouter.get('/profile/:userId', ProgressionController.getUserProgression);

// Filterable match history
progressionRouter.get('/history/:userId', ProgressionController.getMatchHistory);

// Authoritative bot practice completion
progressionRouter.post('/complete-bot-match', authenticate, ProgressionController.completeBotMatch);
