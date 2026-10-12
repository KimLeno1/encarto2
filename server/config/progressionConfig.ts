export type RankTierName = 
  | 'BRONZE' 
  | 'SILVER' 
  | 'GOLD' 
  | 'PLATINUM' 
  | 'DIAMOND' 
  | 'MASTER' 
  | 'GRANDMASTER';

export interface RankTier {
  name: RankTierName;
  title: string;
  minLevel: number;
  maxLevel: number;
  color: string;
  badgeIcon: string;
}

export const RANK_TIERS: RankTier[] = [
  { name: 'BRONZE', title: 'Bronze Contender', minLevel: 1, maxLevel: 4, color: '#cd7f32', badgeIcon: 'shield' },
  { name: 'SILVER', title: 'Silver Duelist', minLevel: 5, maxLevel: 9, color: '#c0c0c0', badgeIcon: 'shield-check' },
  { name: 'GOLD', title: 'Gold Striker', minLevel: 10, maxLevel: 14, color: '#ffd700', badgeIcon: 'award' },
  { name: 'PLATINUM', title: 'Platinum Warlord', minLevel: 15, maxLevel: 19, color: '#00e5ff', badgeIcon: 'zap' },
  { name: 'DIAMOND', title: 'Diamond Apex', minLevel: 20, maxLevel: 29, color: '#b9f2ff', badgeIcon: 'gem' },
  { name: 'MASTER', title: 'Master Champion', minLevel: 30, maxLevel: 39, color: '#bf5af2', badgeIcon: 'crown' },
  { name: 'GRANDMASTER', title: 'Grandmaster Paragon', minLevel: 40, maxLevel: 999, color: '#ff2d55', badgeIcon: 'trophy' },
];

export interface ProgressionRewardConfig {
  pvp: {
    winExp: number;
    lossExp: number;
    drawExp: number;
    forfeitWinnerExp: number;
    forfeitLoserExp: number;
    maxPerformanceBonusExp: number;
  };
  bot: {
    easy: { winExp: number; lossExp: number; drawExp: number };
    normal: { winExp: number; lossExp: number; drawExp: number };
    hard: { winExp: number; lossExp: number; drawExp: number };
  };
  baseExpPerLevel: number;
  expGrowthRate: number;
}

export const PROGRESSION_CONFIG: ProgressionRewardConfig = {
  pvp: {
    winExp: 150,
    lossExp: 50,
    drawExp: 75,
    forfeitWinnerExp: 150,
    forfeitLoserExp: 0,
    maxPerformanceBonusExp: 50,
  },
  bot: {
    easy: { winExp: 30, lossExp: 10, drawExp: 15 },
    normal: { winExp: 50, lossExp: 20, drawExp: 25 },
    hard: { winExp: 75, lossExp: 30, drawExp: 40 },
  },
  baseExpPerLevel: 300,
  expGrowthRate: 1.15,
};

/**
 * Calculates level and progress details from total accumulated experience
 */
export function calculateLevelFromExp(totalExp: number): {
  level: number;
  tier: RankTier;
  expInLevel: number;
  expForNextLevel: number;
  progressPercent: number;
} {
  const safeExp = Math.max(0, Math.floor(totalExp));
  let level = 1;
  let remainingExp = safeExp;
  let expRequiredForCurrentLevel = getExpRequiredForLevel(level);

  while (remainingExp >= expRequiredForCurrentLevel) {
    remainingExp -= expRequiredForCurrentLevel;
    level++;
    expRequiredForCurrentLevel = getExpRequiredForLevel(level);
  }

  const tier = getTierForLevel(level);
  const progressPercent = Math.min(100, Math.round((remainingExp / expRequiredForCurrentLevel) * 100));

  return {
    level,
    tier,
    expInLevel: remainingExp,
    expForNextLevel: expRequiredForCurrentLevel,
    progressPercent,
  };
}

/**
 * Returns EXP required to advance from `level` to `level + 1`
 */
export function getExpRequiredForLevel(level: number): number {
  if (level <= 1) return PROGRESSION_CONFIG.baseExpPerLevel;
  return Math.round(
    PROGRESSION_CONFIG.baseExpPerLevel * Math.pow(PROGRESSION_CONFIG.expGrowthRate, level - 1)
  );
}

/**
 * Retrieves the rank tier associated with a given level
 */
export function getTierForLevel(level: number): RankTier {
  for (const tier of RANK_TIERS) {
    if (level >= tier.minLevel && level <= tier.maxLevel) {
      return tier;
    }
  }
  return RANK_TIERS[RANK_TIERS.length - 1];
}
