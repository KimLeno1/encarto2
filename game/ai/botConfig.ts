export type BotDifficulty = 'EASY' | 'NORMAL' | 'HARD';

export type BotAIState =
  | 'IDLE'
  | 'PATROL'
  | 'CHASE'
  | 'ENGAGE'
  | 'RETREAT'
  | 'DODGE'
  | 'STUCK_RECOVERY';

export interface BotDifficultyConfig {
  difficulty: BotDifficulty;
  namePrefix: string;
  reactionDelayMs: number;
  perceptionRadius: number;
  speedMultiplier: number;
  preferredCombatDistance: number;
  aimAccuracyJitterRad: number;
  predictiveAiming: boolean;
  dodgeProbability: number;
  canTacticalDash: boolean;
  specialAttackIntervalMs: number;
  boundaryBuffer: number;
}

export const BOT_DIFFICULTY_PRESETS: Record<BotDifficulty, BotDifficultyConfig> = {
  EASY: {
    difficulty: 'EASY',
    namePrefix: 'RECRUIT-BOT',
    reactionDelayMs: 450,
    perceptionRadius: 480,
    speedMultiplier: 0.75,
    preferredCombatDistance: 270,
    aimAccuracyJitterRad: 0.35, // ~20 degrees of jitter
    predictiveAiming: false,
    dodgeProbability: 0.15,
    canTacticalDash: false,
    specialAttackIntervalMs: 6000,
    boundaryBuffer: 60,
  },
  NORMAL: {
    difficulty: 'NORMAL',
    namePrefix: 'VETERAN-BOT',
    reactionDelayMs: 220,
    perceptionRadius: 650,
    speedMultiplier: 0.95,
    preferredCombatDistance: 210,
    aimAccuracyJitterRad: 0.12, // ~7 degrees of jitter
    predictiveAiming: false,
    dodgeProbability: 0.50,
    canTacticalDash: true,
    specialAttackIntervalMs: 3500,
    boundaryBuffer: 80,
  },
  HARD: {
    difficulty: 'HARD',
    namePrefix: 'APEX-BOT',
    reactionDelayMs: 80,
    perceptionRadius: 900,
    speedMultiplier: 1.05,
    preferredCombatDistance: 185,
    aimAccuracyJitterRad: 0.03, // Laser accuracy
    predictiveAiming: true, // Leads moving target
    dodgeProbability: 0.85,
    canTacticalDash: true,
    specialAttackIntervalMs: 2600,
    boundaryBuffer: 95,
  },
};
