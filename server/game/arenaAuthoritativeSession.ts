import { Server, Socket } from 'socket.io';
import { MatchSession } from '../services/matchmakingService.ts';
import { MatchPersistenceService } from '../services/matchPersistenceService.ts';
import { BotBrain } from '../../game/ai/botBrain.ts';
import { BOT_DIFFICULTY_PRESETS } from '../../game/ai/botConfig.ts';

export interface AuthoritativePlayerState {
  id: string;
  name: string;
  isBot: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  aimAngle: number;
  health: number;
  maxHealth: number;
  score: number;
  damageDealt: number;
  damageTaken: number;
  hitsLanded: number;
  currentCombo: number;
  maxCombo: number;
  isDashing: boolean;
  isInvulnerable: boolean;
  invulnerableUntil: number;
  dashUntil: number;
  lastAttackTime: number;
  lastSpecialTime: number;
  lastDashTime: number;
  lastHitLandedTime: number;
  disconnectedAt?: number;
}

export interface AuthoritativeProjectile {
  id: string;
  ownerId: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  isSpecial: boolean;
  spawnTime: number;
  lifetimeMs: number;
}

export class ArenaAuthoritativeSession {
  public matchId: string;
  public matchSession: MatchSession;
  private io: Server;

  // Constants
  private arenaWidth = 1200;
  private arenaHeight = 800;
  private playerSpeed = 240;
  private dashSpeed = 600;
  private attackCooldownMs = 250;
  private specialCooldownMs = 2500;
  private dashCooldownMs = 2000;
  private projectileSpeed = 650;
  private projectileLifetimeMs = 1200;
  private playerHitRadius = 22;
  private attackDamage = 25;
  private specialDamage = 60;
  private matchDurationSeconds = 120;

  // State
  public players: Map<string, AuthoritativePlayerState> = new Map();
  public projectiles: AuthoritativeProjectile[] = [];
  public timeRemaining: number = 120;
  public isRunning: boolean = false;
  public isCompleted: boolean = false;

  private tickTimer?: NodeJS.Timeout;
  private secondTimer?: NodeJS.Timeout;
  private nextProjectileId = 1;
  private botBrain: BotBrain | null = null;
  private botId: string | null = null;

  // Disconnect grace window
  public disconnectTimeoutMs = 15000;
  private disconnectTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor(matchSession: MatchSession, io: Server) {
    this.matchId = matchSession.id;
    this.matchSession = matchSession;
    this.io = io;

    this.initPlayers();
  }

  private initPlayers() {
    const playerAId = this.matchSession.playerOrder[0];
    const playerBId = this.matchSession.playerOrder[1];

    const pA = this.matchSession.participants[playerAId];
    const pB = this.matchSession.participants[playerBId];

    // Spawn positions: left and right
    this.players.set(playerAId, {
      id: playerAId,
      name: pA.username,
      isBot: pA.isBot,
      x: 240,
      y: this.arenaHeight / 2,
      vx: 0,
      vy: 0,
      aimAngle: 0,
      health: 100,
      maxHealth: 100,
      score: 0,
      damageDealt: 0,
      damageTaken: 0,
      hitsLanded: 0,
      currentCombo: 0,
      maxCombo: 0,
      isDashing: false,
      isInvulnerable: false,
      invulnerableUntil: 0,
      dashUntil: 0,
      lastAttackTime: 0,
      lastSpecialTime: 0,
      lastDashTime: 0,
      lastHitLandedTime: 0,
    });

    this.players.set(playerBId, {
      id: playerBId,
      name: pB.username,
      isBot: pB.isBot,
      x: this.arenaWidth - 240,
      y: this.arenaHeight / 2,
      vx: 0,
      vy: 0,
      aimAngle: Math.PI,
      health: 100,
      maxHealth: 100,
      score: 0,
      damageDealt: 0,
      damageTaken: 0,
      hitsLanded: 0,
      currentCombo: 0,
      maxCombo: 0,
      isDashing: false,
      isInvulnerable: false,
      invulnerableUntil: 0,
      dashUntil: 0,
      lastAttackTime: 0,
      lastSpecialTime: 0,
      lastDashTime: 0,
      lastHitLandedTime: 0,
    });

    if (this.matchSession.isBotMatch) {
      this.botId = playerBId;
      this.botBrain = new BotBrain(BOT_DIFFICULTY_PRESETS.HARD);
    }
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.isCompleted = false;
    this.timeRemaining = this.matchDurationSeconds;

    // Simulation loop running at 30Hz (~33ms)
    const tickIntervalMs = 33;
    let lastTime = Date.now();

    this.tickTimer = setInterval(() => {
      const now = Date.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      this.tick(now, dt);
    }, tickIntervalMs);

    // 1-second countdown timer
    this.secondTimer = setInterval(() => {
      if (this.isCompleted) return;
      this.timeRemaining--;
      if (this.timeRemaining <= 0) {
        this.handleTimeoutEnd();
      }
    }, 1000);

    // Broadcast match start
    this.io.to(`room:match:${this.matchId}`).emit('match:start', {
      matchId: this.matchId,
      isBotMatch: this.matchSession.isBotMatch,
      botName: this.matchSession.botName,
      players: Array.from(this.players.values()).map(this.serializePlayer),
      timeRemaining: this.timeRemaining,
    });
  }

  public handlePlayerInput(userId: string, input: { vx: number; vy: number; aimAngle: number }) {
    if (!this.isRunning || this.isCompleted) return;
    const player = this.players.get(userId);
    if (!player) return;

    // Reject speed hack: clamp magnitude to 1
    const len = Math.hypot(input.vx, input.vy);
    let normVx = input.vx;
    let normVy = input.vy;
    if (len > 1) {
      normVx = input.vx / len;
      normVy = input.vy / len;
    }

    if (!player.isDashing) {
      player.vx = normVx * this.playerSpeed;
      player.vy = normVy * this.playerSpeed;
    }
    player.aimAngle = input.aimAngle;
  }

  public handlePlayerAttack(userId: string, aimAngle: number): boolean {
    if (!this.isRunning || this.isCompleted) return false;
    const player = this.players.get(userId);
    if (!player) return false;

    const now = Date.now();
    if (now - player.lastAttackTime < this.attackCooldownMs) {
      return false; // On cooldown
    }
    player.lastAttackTime = now;

    // Spawn server projectile
    const offsetX = Math.cos(aimAngle) * 30;
    const offsetY = Math.sin(aimAngle) * 30;
    const proj: AuthoritativeProjectile = {
      id: `proj-${this.nextProjectileId++}`,
      ownerId: userId,
      x: player.x + offsetX,
      y: player.y + offsetY,
      vx: Math.cos(aimAngle) * this.projectileSpeed,
      vy: Math.sin(aimAngle) * this.projectileSpeed,
      damage: this.attackDamage,
      isSpecial: false,
      spawnTime: now,
      lifetimeMs: this.projectileLifetimeMs,
    };
    this.projectiles.push(proj);

    this.io.to(`room:match:${this.matchId}`).emit('match:projectile_spawned', {
      id: proj.id,
      ownerId: userId,
      x: proj.x,
      y: proj.y,
      vx: proj.vx,
      vy: proj.vy,
      isSpecial: false,
    });

    return true;
  }

  public handlePlayerSpecial(userId: string, aimAngle: number): boolean {
    if (!this.isRunning || this.isCompleted) return false;
    const player = this.players.get(userId);
    if (!player) return false;

    const now = Date.now();
    if (now - player.lastSpecialTime < this.specialCooldownMs) {
      return false; // On cooldown
    }
    player.lastSpecialTime = now;

    const offsetX = Math.cos(aimAngle) * 34;
    const offsetY = Math.sin(aimAngle) * 34;
    const proj: AuthoritativeProjectile = {
      id: `proj-${this.nextProjectileId++}`,
      ownerId: userId,
      x: player.x + offsetX,
      y: player.y + offsetY,
      vx: Math.cos(aimAngle) * (this.projectileSpeed * 1.1),
      vy: Math.sin(aimAngle) * (this.projectileSpeed * 1.1),
      damage: this.specialDamage,
      isSpecial: true,
      spawnTime: now,
      lifetimeMs: this.projectileLifetimeMs,
    };
    this.projectiles.push(proj);

    this.io.to(`room:match:${this.matchId}`).emit('match:projectile_spawned', {
      id: proj.id,
      ownerId: userId,
      x: proj.x,
      y: proj.y,
      vx: proj.vx,
      vy: proj.vy,
      isSpecial: true,
    });

    return true;
  }

  public handlePlayerDash(userId: string): boolean {
    if (!this.isRunning || this.isCompleted) return false;
    const player = this.players.get(userId);
    if (!player) return false;

    const now = Date.now();
    if (now - player.lastDashTime < this.dashCooldownMs || player.isDashing) {
      return false; // On cooldown
    }
    player.lastDashTime = now;
    player.isDashing = true;
    player.isInvulnerable = true;
    player.dashUntil = now + 180;
    player.invulnerableUntil = now + 180;

    // Dash in aim angle or current movement direction
    let dirX = Math.cos(player.aimAngle);
    let dirY = Math.sin(player.aimAngle);
    if (player.vx !== 0 || player.vy !== 0) {
      const len = Math.hypot(player.vx, player.vy);
      dirX = player.vx / len;
      dirY = player.vy / len;
    }

    player.vx = dirX * this.dashSpeed;
    player.vy = dirY * this.dashSpeed;

    this.io.to(`room:match:${this.matchId}`).emit('match:player_dashed', {
      userId,
      vx: player.vx,
      vy: player.vy,
    });

    return true;
  }

  private tick(now: number, dt: number) {
    if (!this.isRunning || this.isCompleted) return;

    // 1. Bot AI decision tick if bot match
    if (this.botBrain && this.botId) {
      const bot = this.players.get(this.botId);
      const humanId = this.matchSession.playerOrder[0];
      const human = this.players.get(humanId);

      if (bot && human) {
        const incomingProjs = this.projectiles
          .filter((p) => p.ownerId !== this.botId)
          .map((p) => ({
            x: p.x,
            y: p.y,
            vx: p.vx,
            vy: p.vy,
            speed: Math.hypot(p.vx, p.vy),
          }));

        const decision = this.botBrain.update(
          {
            botX: bot.x,
            botY: bot.y,
            botHealth: bot.health,
            botMaxHealth: bot.maxHealth,
            playerX: human.x,
            playerY: human.y,
            playerVx: human.vx,
            playerVy: human.vy,
            playerHealth: human.health,
            canAttack: now - bot.lastAttackTime >= this.attackCooldownMs,
            canSpecialAttack: now - bot.lastSpecialTime >= this.specialCooldownMs,
            canDash: now - bot.lastDashTime >= this.dashCooldownMs,
            incomingProjectiles: incomingProjs,
            arenaWidth: this.arenaWidth,
            arenaHeight: this.arenaHeight,
          },
          now
        );

        if (!bot.isDashing) {
          bot.vx = decision.moveX * this.playerSpeed;
          bot.vy = decision.moveY * this.playerSpeed;
        }
        bot.aimAngle = decision.aimAngle;

        if (decision.shouldDash) {
          this.handlePlayerDash(this.botId);
        } else if (decision.shouldSpecialAttack) {
          this.handlePlayerSpecial(this.botId, decision.aimAngle);
        } else if (decision.shouldAttack) {
          this.handlePlayerAttack(this.botId, decision.aimAngle);
        }
      }
    }

    // 2. Update players position
    for (const player of this.players.values()) {
      // Check dash expiry
      if (player.isDashing && now >= player.dashUntil) {
        player.isDashing = false;
        player.vx = 0;
        player.vy = 0;
      }
      // Check invulnerability expiry
      if (player.isInvulnerable && now >= player.invulnerableUntil) {
        player.isInvulnerable = false;
      }

      // Combo decay
      if (player.currentCombo > 0 && now - player.lastHitLandedTime > 2500) {
        player.currentCombo = 0;
      }

      player.x += player.vx * dt;
      player.y += player.vy * dt;

      // Arena bounds clamping
      const margin = 48;
      player.x = Math.max(margin, Math.min(this.arenaWidth - margin, player.x));
      player.y = Math.max(margin, Math.min(this.arenaHeight - margin, player.y));
    }

    // 3. Update projectiles and collision detection
    const remainingProjectiles: AuthoritativeProjectile[] = [];

    for (const proj of this.projectiles) {
      proj.x += proj.vx * dt;
      proj.y += proj.vy * dt;

      // Check wall collision or lifetime expiry
      const hitWall =
        proj.x <= 20 ||
        proj.x >= this.arenaWidth - 20 ||
        proj.y <= 20 ||
        proj.y >= this.arenaHeight - 20;

      const expired = now - proj.spawnTime >= proj.lifetimeMs;

      if (hitWall || expired) {
        continue; // Despawn projectile
      }

      // Check collision with opposing player
      let hitPlayer = false;
      for (const [targetId, targetPlayer] of this.players.entries()) {
        if (targetId === proj.ownerId) continue; // Don't hit yourself

        const dist = Math.hypot(proj.x - targetPlayer.x, proj.y - targetPlayer.y);
        if (dist <= this.playerHitRadius) {
          hitPlayer = true;

          // Apply damage if not invulnerable
          if (!targetPlayer.isInvulnerable) {
            const actualDamage = Math.min(targetPlayer.health, proj.damage);
            targetPlayer.health = Math.max(0, targetPlayer.health - actualDamage);
            targetPlayer.damageTaken += actualDamage;
            targetPlayer.isInvulnerable = true;
            targetPlayer.invulnerableUntil = now + 350;

            // Credit attacker
            const attacker = this.players.get(proj.ownerId);
            if (attacker) {
              attacker.damageDealt += actualDamage;
              attacker.hitsLanded++;
              attacker.score += proj.damage * 10;
              attacker.currentCombo++;
              if (attacker.currentCombo > attacker.maxCombo) {
                attacker.maxCombo = attacker.currentCombo;
              }
              attacker.lastHitLandedTime = now;
            }

            // Broadcast hit event
            this.io.to(`room:match:${this.matchId}`).emit('match:hit', {
              projectileId: proj.id,
              targetId,
              attackerId: proj.ownerId,
              damage: actualDamage,
              targetHealth: targetPlayer.health,
              isSpecial: proj.isSpecial,
              x: targetPlayer.x,
              y: targetPlayer.y,
            });

            // Check if player eliminated
            if (targetPlayer.health <= 0) {
              this.handleMatchConcluded(proj.ownerId, targetId, 'ELIMINATION');
              return;
            }
          }
          break;
        }
      }

      if (!hitPlayer) {
        remainingProjectiles.push(proj);
      }
    }

    this.projectiles = remainingProjectiles;

    // 4. Broadcast state snapshot
    this.broadcastSnapshot();
  }

  private broadcastSnapshot() {
    this.io.to(`room:match:${this.matchId}`).emit('match:snapshot', {
      timeRemaining: this.timeRemaining,
      players: Array.from(this.players.values()).map(this.serializePlayer),
      projectiles: this.projectiles.map((p) => ({
        id: p.id,
        x: Math.round(p.x),
        y: Math.round(p.y),
        isSpecial: p.isSpecial,
        ownerId: p.ownerId,
      })),
    });
  }

  private serializePlayer(p: AuthoritativePlayerState) {
    return {
      id: p.id,
      name: p.name,
      isBot: p.isBot,
      x: Math.round(p.x),
      y: Math.round(p.y),
      vx: Math.round(p.vx),
      vy: Math.round(p.vy),
      aimAngle: Number(p.aimAngle.toFixed(3)),
      health: p.health,
      maxHealth: p.maxHealth,
      score: p.score,
      damageDealt: p.damageDealt,
      damageTaken: p.damageTaken,
      currentCombo: p.currentCombo,
      isDashing: p.isDashing,
      isInvulnerable: p.isInvulnerable,
    };
  }

  private handleTimeoutEnd() {
    // Winner decided by health or damage dealt
    const playerA = this.players.get(this.matchSession.playerOrder[0])!;
    const playerB = this.players.get(this.matchSession.playerOrder[1])!;

    if (playerA.health > playerB.health) {
      this.handleMatchConcluded(playerA.id, playerB.id, 'TIMEOUT');
    } else if (playerB.health > playerA.health) {
      this.handleMatchConcluded(playerB.id, playerA.id, 'TIMEOUT');
    } else {
      this.handleMatchConcluded(null, null, 'DRAW');
    }
  }

  public handlePlayerDisconnect(userId: string) {
    if (!this.isRunning || this.isCompleted) return;

    const player = this.players.get(userId);
    if (!player || player.isBot) return;

    player.disconnectedAt = Date.now();
    player.vx = 0;
    player.vy = 0;

    this.io.to(`room:match:${this.matchId}`).emit('match:player_disconnected', {
      userId,
      timeoutSeconds: Math.round(this.disconnectTimeoutMs / 1000),
    });

    // Grace period timer: if player does not reconnect, forfeit!
    const timer = setTimeout(() => {
      if (!this.isCompleted) {
        // Other player wins by forfeit
        const remainingPlayer = Array.from(this.players.values()).find((p) => p.id !== userId);
        const winnerId = remainingPlayer ? remainingPlayer.id : null;
        this.handleMatchConcluded(winnerId, userId, 'FORFEIT');
      }
    }, this.disconnectTimeoutMs);

    this.disconnectTimers.set(userId, timer);
  }

  public handlePlayerReconnect(userId: string, newSocket: Socket) {
    const player = this.players.get(userId);
    if (!player) return;

    // Clear disconnect timer
    const timer = this.disconnectTimers.get(userId);
    if (timer) {
      clearTimeout(timer);
      this.disconnectTimers.delete(userId);
    }

    player.disconnectedAt = undefined;
    newSocket.join(`room:match:${this.matchId}`);

    this.io.to(`room:match:${this.matchId}`).emit('match:player_reconnected', {
      userId,
    });

    // Send full current snapshot to reconnected player
    newSocket.emit('match:start', {
      matchId: this.matchId,
      isBotMatch: this.matchSession.isBotMatch,
      botName: this.matchSession.botName,
      players: Array.from(this.players.values()).map(this.serializePlayer),
      timeRemaining: this.timeRemaining,
    });
  }

  public handleMatchConcluded(
    winnerId: string | null,
    loserId: string | null,
    reason: 'ELIMINATION' | 'TIMEOUT' | 'FORFEIT' | 'DRAW'
  ) {
    if (this.isCompleted) return;
    this.isCompleted = true;
    this.isRunning = false;

    if (this.tickTimer) clearInterval(this.tickTimer);
    if (this.secondTimer) clearInterval(this.secondTimer);
    for (const t of this.disconnectTimers.values()) clearTimeout(t);

    const winner = winnerId ? this.players.get(winnerId) : null;
    const loser = loserId ? this.players.get(loserId) : null;

    // Authoritative completion persistence
    MatchPersistenceService.completeMatchIdempotent({
      matchId: this.matchId,
      winnerId,
      loserId,
      winnerScore: winner ? winner.score : 0,
      loserScore: loser ? loser.score : 0,
      reason,
      telemetry: {
        players: Array.from(this.players.values()).map(this.serializePlayer),
        timeRemaining: this.timeRemaining,
      },
    }).then((completionRes) => {
      if (completionRes.progressionResults && completionRes.progressionResults.length > 0) {
        this.io.to(`room:match:${this.matchId}`).emit('match:progression_awarded', {
          matchId: this.matchId,
          progression: completionRes.progressionResults,
        });
      }
    });

    // Broadcast conclusion to room
    this.io.to(`room:match:${this.matchId}`).emit('match:concluded', {
      matchId: this.matchId,
      winnerId,
      loserId,
      winnerName: winner ? winner.name : null,
      reason,
      stats: {
        winnerScore: winner ? winner.score : 0,
        loserScore: loser ? loser.score : 0,
        players: Array.from(this.players.values()).map(this.serializePlayer),
      },
    });
  }

  public destroy() {
    this.isRunning = false;
    this.isCompleted = true;
    if (this.tickTimer) clearInterval(this.tickTimer);
    if (this.secondTimer) clearInterval(this.secondTimer);
    for (const t of this.disconnectTimers.values()) clearTimeout(t);
  }
}
