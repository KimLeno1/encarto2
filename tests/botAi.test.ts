import { describe, it, expect } from 'vitest';
import { BotBrain, BotContext } from '../game/ai/botBrain.ts';
import { BOT_DIFFICULTY_PRESETS } from '../game/ai/botConfig.ts';

describe('Encarto Arena AI Opponent Intelligence', () => {
  const baseContext: BotContext = {
    botX: 600,
    botY: 400,
    botHealth: 100,
    botMaxHealth: 100,
    playerX: 600,
    playerY: 200,
    playerVx: 0,
    playerVy: 0,
    playerHealth: 100,
    canAttack: true,
    canSpecialAttack: true,
    canDash: true,
    incomingProjectiles: [],
    arenaWidth: 1200,
    arenaHeight: 800,
  };

  it('Easy, Normal, and Hard presets have properly tiered configuration parameters', () => {
    const easy = BOT_DIFFICULTY_PRESETS.EASY;
    const normal = BOT_DIFFICULTY_PRESETS.NORMAL;
    const hard = BOT_DIFFICULTY_PRESETS.HARD;

    // Reaction time: Hard reacts fastest
    expect(hard.reactionDelayMs).toBeLessThan(normal.reactionDelayMs);
    expect(normal.reactionDelayMs).toBeLessThan(easy.reactionDelayMs);

    // Perception radius: Hard sees furthest
    expect(hard.perceptionRadius).toBeGreaterThan(normal.perceptionRadius);
    expect(normal.perceptionRadius).toBeGreaterThan(easy.perceptionRadius);

    // Dodge probability: Hard dodges most frequently
    expect(hard.dodgeProbability).toBeGreaterThan(normal.dodgeProbability);
    expect(normal.dodgeProbability).toBeGreaterThan(easy.dodgeProbability);

    // Hard uses predictive aiming
    expect(hard.predictiveAiming).toBe(true);
    expect(easy.predictiveAiming).toBe(false);
  });

  it('Patrols or wanders when player is outside perception radius', () => {
    const brain = new BotBrain(BOT_DIFFICULTY_PRESETS.EASY);
    const distantContext: BotContext = {
      ...baseContext,
      botX: 100,
      botY: 100,
      playerX: 1100,
      playerY: 700, // Distance > 1000px, exceeds Easy perception (480px)
    };

    const decision = brain.update(distantContext, 1000);
    expect(decision.state).toBe('PATROL');
    expect(decision.shouldAttack).toBe(false);
  });

  it('Chases player when inside perception radius but outside preferred combat distance', () => {
    const brain = new BotBrain(BOT_DIFFICULTY_PRESETS.NORMAL);
    const chaseContext: BotContext = {
      ...baseContext,
      botX: 600,
      botY: 600,
      playerX: 600,
      playerY: 200, // Distance = 400px (greater than preferred distance 210px)
    };

    const decision = brain.update(chaseContext, 1000);
    expect(decision.state).toBe('CHASE');
    // Moving towards player (negative Y direction)
    expect(decision.moveY).toBeLessThan(0);
  });

  it('Retreats / kites when player gets too close', () => {
    const brain = new BotBrain(BOT_DIFFICULTY_PRESETS.HARD);
    const closeContext: BotContext = {
      ...baseContext,
      botX: 600,
      botY: 400,
      playerX: 600,
      playerY: 340, // Distance = 60px (too close, preferred is 185px)
    };

    const decision = brain.update(closeContext, 1000);
    expect(decision.state).toBe('RETREAT');
    // Moves away from player (positive Y direction or strafe)
    expect(decision.moveY).toBeGreaterThan(0);
  });

  it('Engages and aims at player when within suitable combat distance', () => {
    const brain = new BotBrain(BOT_DIFFICULTY_PRESETS.NORMAL);
    const engageContext: BotContext = {
      ...baseContext,
      botX: 600,
      botY: 400,
      playerX: 600,
      playerY: 200, // Distance = 200px (within preferred 210px ± 45px)
    };

    const decision = brain.update(engageContext, 1000);
    expect(decision.state).toBe('ENGAGE');
    expect(decision.shouldAttack).toBe(true);
    // Aim angle points towards player (-PI/2)
    const expectedAngle = -Math.PI / 2;
    expect(Math.abs(decision.aimAngle - expectedAngle)).toBeLessThan(0.3);
  });

  it('Respects attack cooldowns and does not attack when on cooldown', () => {
    const brain = new BotBrain(BOT_DIFFICULTY_PRESETS.HARD);
    const cooldownContext: BotContext = {
      ...baseContext,
      canAttack: false,
      canSpecialAttack: false,
    };

    const decision = brain.update(cooldownContext, 1000);
    expect(decision.shouldAttack).toBe(false);
    expect(decision.shouldSpecialAttack).toBe(false);
  });

  it('Detects incoming projectiles on collision heading and evades', () => {
    const brain = new BotBrain({ ...BOT_DIFFICULTY_PRESETS.HARD, dodgeProbability: 1.0 });
    const threatContext: BotContext = {
      ...baseContext,
      incomingProjectiles: [
        {
          x: 600,
          y: 300,
          vx: 0,
          vy: 600, // Traveling straight down toward bot at (600, 400)
          speed: 600,
        },
      ],
    };

    const decision = brain.update(threatContext, 1000);
    expect(decision.state).toBe('DODGE');
    // Perpendicular movement to vertical incoming projectile (lateral move on X axis)
    expect(Math.abs(decision.moveX)).toBeGreaterThan(0);
    // Hard bot should trigger dash when projectile threatens
    expect(decision.shouldDash).toBe(true);
  });

  it('Steers away from arena perimeter (boundary avoidance)', () => {
    const brain = new BotBrain(BOT_DIFFICULTY_PRESETS.NORMAL);
    const wallContext: BotContext = {
      ...baseContext,
      botX: 20, // Right next to left wall
      botY: 400,
      playerX: 10,
      playerY: 400,
    };

    const decision = brain.update(wallContext, 1000);
    // Boundary repulsion pushes bot away from left wall (positive X)
    expect(decision.moveX).toBeGreaterThan(0);
  });

  it('Hard bot applies predictive aiming against a moving player', () => {
    const brain = new BotBrain(BOT_DIFFICULTY_PRESETS.HARD);
    const movingContext: BotContext = {
      ...baseContext,
      botX: 500,
      botY: 400,
      playerX: 500,
      playerY: 200,
      playerVx: 300, // Player moving rapidly rightwards
      playerVy: 0,
    };

    const decision = brain.update(movingContext, 1000);
    // Direct angle would be -PI/2 (-1.57 rad). Predictive angle leads to the right (greater than -1.57 rad).
    const directAngle = Math.atan2(movingContext.playerY - movingContext.botY, movingContext.playerX - movingContext.botX);
    expect(decision.aimAngle).toBeGreaterThan(directAngle);
  });

  it('Triggers stuck recovery when displacement is blocked', () => {
    const brain = new BotBrain(BOT_DIFFICULTY_PRESETS.NORMAL);

    // Tick 1: Try to move
    brain.update(baseContext, 1000);

    // Tick 2: Position hasn't changed despite velocity command
    const stuckDecision = brain.update(baseContext, 1500);

    // Should enter recovery
    expect(stuckDecision.state).toBe('STUCK_RECOVERY');
  });
});
