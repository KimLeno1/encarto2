import { z } from 'zod';

export const queueRequestSchema = z.object({
  preferredGame: z.enum(['arena', 'chess', 'checkers', 'car_racing']).default('arena'),
  wager: z.number().min(0).max(1000).default(0),
});

export const playerInputSchema = z.object({
  vx: z.number().min(-1.5).max(1.5),
  vy: z.number().min(-1.5).max(1.5),
  aimAngle: z.number(),
  sequence: z.number().optional(),
});

export const attackInputSchema = z.object({
  aimAngle: z.number(),
});

export const botOfferResponseSchema = z.object({
  matchId: z.string().optional(),
  accept: z.boolean(),
});
