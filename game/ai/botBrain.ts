import {
  BotDifficultyConfig,
  BotAIState,
} from './botConfig.js';

export interface EntityPosition {
  x: number;
  y: number;
  vx?: number;
  vy?: number;
}

export interface IncomingProjectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
}

export interface BotContext {
  botX: number;
  botY: number;
  botHealth: number;
  botMaxHealth: number;
  playerX: number;
  playerY: number;
  playerVx: number;
  playerVy: number;
  playerHealth: number;
  canAttack: boolean;
  canSpecialAttack: boolean;
  canDash: boolean;
  incomingProjectiles: IncomingProjectile[];
  arenaWidth: number;
  arenaHeight: number;
}

export interface BotDecision {
  moveX: number;
  moveY: number;
  aimAngle: number;
  shouldAttack: boolean;
  shouldSpecialAttack: boolean;
  shouldDash: boolean;
  state: BotAIState;
  targetDistance: number;
}

export class BotBrain {
  public currentState: BotAIState = 'IDLE';
  public lastStateChangeTime: number = 0;
  private config: BotDifficultyConfig;

  // Reaction lag buffer
  private lastEvaluationTime: number = 0;
  private cachedDecision: BotDecision = {
    moveX: 0,
    moveY: 0,
    aimAngle: 0,
    shouldAttack: false,
    shouldSpecialAttack: false,
    shouldDash: false,
    state: 'IDLE',
    targetDistance: 0,
  };

  // Stuck detection
  private lastStuckCheckX: number = 0;
  private lastStuckCheckY: number = 0;
  private lastStuckCheckTime: number = 0;
  private stuckRecoveryUntil: number = 0;
  private stuckEscapeVector: { x: number; y: number } = { x: 0, y: 0 };

  // Patrol / Wander
  private patrolTarget: { x: number; y: number } | null = null;
  private lastPatrolChangeTime: number = 0;

  // Combat strafe direction (-1 or 1)
  private strafeDirection: number = 1;
  private lastStrafeSwitchTime: number = 0;

  // Last special attack fired timestamp
  private lastSpecialAttackTime: number = 0;

  constructor(config: BotDifficultyConfig) {
    this.config = config;
  }

  public setDifficulty(config: BotDifficultyConfig) {
    this.config = config;
  }

  public update(context: BotContext, time: number): BotDecision {
    // 1. Stuck Recovery active timer check
    if (time < this.stuckRecoveryUntil) {
      this.currentState = 'STUCK_RECOVERY';
      const aim = Math.atan2(context.playerY - context.botY, context.playerX - context.botX);
      return {
        moveX: this.stuckEscapeVector.x,
        moveY: this.stuckEscapeVector.y,
        aimAngle: aim,
        shouldAttack: false,
        shouldSpecialAttack: false,
        shouldDash: false,
        state: 'STUCK_RECOVERY',
        targetDistance: Math.hypot(context.playerX - context.botX, context.playerY - context.botY),
      };
    }

    // 2. Check for stuck state (every 400ms)
    if (this.lastStuckCheckTime === 0) {
      this.lastStuckCheckX = context.botX;
      this.lastStuckCheckY = context.botY;
      this.lastStuckCheckTime = time;
    } else if (time - this.lastStuckCheckTime > 400) {
      const movedDist = Math.hypot(
        context.botX - this.lastStuckCheckX,
        context.botY - this.lastStuckCheckY
      );
      if (
        (this.cachedDecision.moveX !== 0 || this.cachedDecision.moveY !== 0) &&
        movedDist < 8 &&
        this.currentState !== 'IDLE'
      ) {
        // Trigger recovery: impulse toward arena center or perpendicular
        const centerX = context.arenaWidth / 2;
        const centerY = context.arenaHeight / 2;
        const toCenterX = centerX - context.botX;
        const toCenterY = centerY - context.botY;
        const len = Math.hypot(toCenterX, toCenterY) || 1;
        this.stuckEscapeVector = { x: toCenterX / len, y: toCenterY / len };
        this.stuckRecoveryUntil = time + 550;
        this.currentState = 'STUCK_RECOVERY';
        this.lastStuckCheckX = context.botX;
        this.lastStuckCheckY = context.botY;
        this.lastStuckCheckTime = time;

        const aim = Math.atan2(context.playerY - context.botY, context.playerX - context.botX);
        const recoveryDecision: BotDecision = {
          moveX: this.stuckEscapeVector.x,
          moveY: this.stuckEscapeVector.y,
          aimAngle: aim,
          shouldAttack: false,
          shouldSpecialAttack: false,
          shouldDash: false,
          state: 'STUCK_RECOVERY',
          targetDistance: Math.hypot(context.playerX - context.botX, context.playerY - context.botY),
        };
        this.cachedDecision = recoveryDecision;
        return recoveryDecision;
      }
      this.lastStuckCheckX = context.botX;
      this.lastStuckCheckY = context.botY;
      this.lastStuckCheckTime = time;
    }

    // 3. Reaction Delay Window: if within reaction lag, return cached decision with continuously updated aim
    if (time - this.lastEvaluationTime < this.config.reactionDelayMs) {
      // Recompute aimAngle for smooth tracking even between reaction ticks
      const aim = this.calculateAimAngle(context);
      return {
        ...this.cachedDecision,
        aimAngle: aim,
      };
    }

    this.lastEvaluationTime = time;

    // 4. Compute Distance & Perception
    const dx = context.playerX - context.botX;
    const dy = context.playerY - context.botY;
    const distanceToPlayer = Math.hypot(dx, dy);

    // 5. Threat Evaluation (Incoming Projectiles)
    const threateningProjectile = this.findThreateningProjectile(context);
    let isDodging = false;
    let dodgeMoveX = 0;
    let dodgeMoveY = 0;
    let shouldDash = false;

    if (threateningProjectile && Math.random() < this.config.dodgeProbability) {
      isDodging = true;
      this.currentState = 'DODGE';
      // Perpendicular vector to projectile trajectory
      const projSpeed = Math.hypot(threateningProjectile.vx, threateningProjectile.vy) || 1;
      const perpX = -threateningProjectile.vy / projSpeed;
      const perpY = threateningProjectile.vx / projSpeed;

      // Choose side closer away from walls
      const option1X = context.botX + perpX * 60;
      const option2X = context.botX - perpX * 60;
      const side = (option1X > this.config.boundaryBuffer && option1X < context.arenaWidth - this.config.boundaryBuffer) ? 1 : -1;

      dodgeMoveX = perpX * side;
      dodgeMoveY = perpY * side;

      // If hard or normal bot with dash ready, trigger tactical dash to evade!
      if (this.config.canTacticalDash && context.canDash) {
        shouldDash = true;
      }
    }

    // 6. State Decision Logic
    let moveX = 0;
    let moveY = 0;

    if (isDodging) {
      moveX = dodgeMoveX;
      moveY = dodgeMoveY;
    } else if (distanceToPlayer > this.config.perceptionRadius) {
      // Outside perception: PATROL
      this.currentState = 'PATROL';
      if (!this.patrolTarget || time - this.lastPatrolChangeTime > 3000) {
        // Pick new patrol point in arena
        this.patrolTarget = {
          x: Math.random() * (context.arenaWidth - 200) + 100,
          y: Math.random() * (context.arenaHeight - 200) + 100,
        };
        this.lastPatrolChangeTime = time;
      }
      const pDx = this.patrolTarget.x - context.botX;
      const pDy = this.patrolTarget.y - context.botY;
      const pLen = Math.hypot(pDx, pDy);
      if (pLen > 20) {
        moveX = pDx / pLen;
        moveY = pDy / pLen;
      }
    } else {
      // Inside perception radius: CHASE, ENGAGE, or RETREAT
      const preferredDist = this.config.preferredCombatDistance;
      const buffer = 45;

      // Periodically flip strafe direction to be less predictable
      if (time - this.lastStrafeSwitchTime > 2200) {
        this.strafeDirection *= -1;
        this.lastStrafeSwitchTime = time;
      }

      if (distanceToPlayer < preferredDist - buffer) {
        // Too close: RETREAT / KITE back
        this.currentState = 'RETREAT';
        const retreatAngle = Math.atan2(context.botY - context.playerY, context.botX - context.playerX);
        // Add lateral strafe to avoid backing straight into a corner
        const strafeAngle = retreatAngle + (Math.PI / 4) * this.strafeDirection;
        moveX = Math.cos(strafeAngle);
        moveY = Math.sin(strafeAngle);
      } else if (distanceToPlayer > preferredDist + buffer) {
        // Too far: CHASE
        this.currentState = 'CHASE';
        const normDx = dx / distanceToPlayer;
        const normDy = dy / distanceToPlayer;
        moveX = normDx;
        moveY = normDy;
      } else {
        // In sweet spot: ENGAGE / ORBIT
        this.currentState = 'ENGAGE';
        // Orbit around player (tangential vector)
        const tangentX = -dy / distanceToPlayer * this.strafeDirection;
        const tangentY = dx / distanceToPlayer * this.strafeDirection;
        // Minor radial pull to maintain distance
        const radialAdjustment = (distanceToPlayer - preferredDist) / preferredDist;
        moveX = tangentX + (dx / distanceToPlayer) * radialAdjustment;
        moveY = tangentY + (dy / distanceToPlayer) * radialAdjustment;
      }
    }

    // 7. Arena Boundary Avoidance (smooth steering away from walls)
    const avoidance = this.calculateBoundaryAvoidance(context);
    moveX += avoidance.x;
    moveY += avoidance.y;

    // Normalize movement vector
    const moveLen = Math.hypot(moveX, moveY);
    if (moveLen > 0.05) {
      moveX /= moveLen;
      moveY /= moveLen;
    } else {
      moveX = 0;
      moveY = 0;
    }

    // 8. Aiming calculation
    const aimAngle = this.calculateAimAngle(context);

    // 9. Attack Decisions
    let shouldAttack = false;
    let shouldSpecialAttack = false;

    if (distanceToPlayer <= this.config.perceptionRadius) {
      // Check if roughly pointing at target
      const directAngle = Math.atan2(dy, dx);
      let angleDiff = Math.abs(aimAngle - directAngle);
      while (angleDiff > Math.PI) angleDiff = Math.abs(angleDiff - 2 * Math.PI);

      const isAimedWell = angleDiff < 0.45; // ~25 deg tolerance

      if (isAimedWell && context.canAttack) {
        shouldAttack = true;
      }

      // Special attack rules based on difficulty
      if (
        context.canSpecialAttack &&
        time - this.lastSpecialAttackTime >= this.config.specialAttackIntervalMs
      ) {
        if (this.config.difficulty === 'HARD') {
          // Hard bots fire special when player is close or in range
          if (distanceToPlayer < 380 && isAimedWell) {
            shouldSpecialAttack = true;
            shouldAttack = false;
            this.lastSpecialAttackTime = time;
          }
        } else if (this.config.difficulty === 'NORMAL') {
          if (distanceToPlayer < 320 && isAimedWell) {
            shouldSpecialAttack = true;
            shouldAttack = false;
            this.lastSpecialAttackTime = time;
          }
        } else {
          // Easy: occasional special attack
          if (Math.random() < 0.25) {
            shouldSpecialAttack = true;
            shouldAttack = false;
            this.lastSpecialAttackTime = time;
          }
        }
      }
    }

    const decision: BotDecision = {
      moveX,
      moveY,
      aimAngle,
      shouldAttack,
      shouldSpecialAttack,
      shouldDash,
      state: this.currentState,
      targetDistance: distanceToPlayer,
    };

    this.cachedDecision = decision;
    return decision;
  }

  private calculateAimAngle(context: BotContext): number {
    let targetX = context.playerX;
    let targetY = context.playerY;

    // Hard Bot: Predictive Aiming (Leads moving target)
    if (this.config.predictiveAiming) {
      const projSpeed = 650; // default projectile speed
      const dist = Math.hypot(targetX - context.botX, targetY - context.botY);
      const timeToHit = dist / projSpeed;
      targetX += context.playerVx * timeToHit;
      targetY += context.playerVy * timeToHit;
    }

    let angle = Math.atan2(targetY - context.botY, targetX - context.botX);

    // Apply difficulty accuracy jitter
    if (this.config.aimAccuracyJitterRad > 0) {
      const jitter = (Math.random() * 2 - 1) * this.config.aimAccuracyJitterRad;
      angle += jitter;
    }

    return angle;
  }

  private findThreateningProjectile(context: BotContext): IncomingProjectile | null {
    const dangerRadius = 200;
    for (const proj of context.incomingProjectiles) {
      const pDist = Math.hypot(proj.x - context.botX, proj.y - context.botY);
      if (pDist < dangerRadius) {
        // Check if projectile is moving towards bot (dot product > 0)
        const toBotX = context.botX - proj.x;
        const toBotY = context.botY - proj.y;
        const dot = proj.vx * toBotX + proj.vy * toBotY;
        if (dot > 0) {
          return proj;
        }
      }
    }
    return null;
  }

  private calculateBoundaryAvoidance(context: BotContext): { x: number; y: number } {
    const buffer = this.config.boundaryBuffer;
    let forceX = 0;
    let forceY = 0;

    // Left wall
    if (context.botX < buffer) {
      forceX += (buffer - context.botX) / buffer * 2.0;
    }
    // Right wall
    if (context.botX > context.arenaWidth - buffer) {
      forceX -= (context.botX - (context.arenaWidth - buffer)) / buffer * 2.0;
    }
    // Top wall
    if (context.botY < buffer) {
      forceY += (buffer - context.botY) / buffer * 2.0;
    }
    // Bottom wall
    if (context.botY > context.arenaHeight - buffer) {
      forceY -= (context.botY - (context.arenaHeight - buffer)) / buffer * 2.0;
    }

    return { x: forceX, y: forceY };
  }
}
