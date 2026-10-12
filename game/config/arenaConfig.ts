import { BotDifficulty } from '../ai/botConfig.ts';

export type GameMode = 'PRACTICE_DUMMY' | 'BOT_DUEL' | 'BOT_SKIRMISH';

export interface ArenaConfig {
  width: number;
  height: number;
  arenaWidth: number;
  arenaHeight: number;
  playerSpeed: number;
  playerMaxHealth: number;
  dummyMaxHealth: number;
  attackDamage: number;
  attackCooldownMs: number;
  specialAttackDamage: number;
  specialAttackCooldownMs: number;
  dashCooldownMs: number;
  dashSpeed: number;
  dashDurationMs: number;
  invulnerabilityDurationMs: number;
  projectileSpeed: number;
  projectileLifetimeMs: number;
  matchDurationSeconds: number;
}

export const DEFAULT_ARENA_CONFIG: ArenaConfig = {
  width: 960,
  height: 600,
  arenaWidth: 1200,
  arenaHeight: 800,
  playerSpeed: 240,
  playerMaxHealth: 100,
  dummyMaxHealth: 250,
  attackDamage: 25,
  attackCooldownMs: 250,
  specialAttackDamage: 60,
  specialAttackCooldownMs: 2500,
  dashCooldownMs: 2000,
  dashSpeed: 600,
  dashDurationMs: 180,
  invulnerabilityDurationMs: 400,
  projectileSpeed: 650,
  projectileLifetimeMs: 1200,
  matchDurationSeconds: 120,
};

export type GameStateStatus = 'READY' | 'PLAYING' | 'VICTORY' | 'DEFEAT' | 'DRAW';

export interface CombatStats {
  score: number;
  damageDealt: number;
  damageTaken: number;
  hitsLanded: number;
  combosMax: number;
  currentCombo: number;
  botsDefeated: number;
}

export interface OpponentHUDInfo {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  difficulty: BotDifficulty;
  state: string;
  isAlive: boolean;
}

export interface PlayerHUDState {
  mode: GameMode;
  difficulty: BotDifficulty;
  botCount: number;
  health: number;
  maxHealth: number;
  dummyHealth: number;
  dummyMaxHealth: number;
  opponents: OpponentHUDInfo[];
  attackReady: boolean;
  specialAttackReady: boolean;
  specialCooldownProgress: number; // 0 to 1
  dashReady: boolean;
  dashCooldownProgress: number; // 0 to 1
  matchTimeRemaining: number;
  status: GameStateStatus;
  stats: CombatStats;
}
