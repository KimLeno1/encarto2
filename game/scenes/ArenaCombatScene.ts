import Phaser from 'phaser';
import {
  ArenaConfig,
  DEFAULT_ARENA_CONFIG,
  PlayerHUDState,
  GameMode,
  OpponentHUDInfo,
} from '../config/arenaConfig.ts';
import { BotDifficulty } from '../ai/botConfig.ts';
import { AssetLoader } from '../assets/assetLoader.ts';
import { Player } from '../entities/player.ts';
import { TrainingDummy } from '../entities/trainingDummy.ts';
import { BotPlayer } from '../entities/botPlayer.ts';
import { Projectile } from '../entities/projectile.ts';
import { ArenaMap } from '../map/arenaMap.ts';
import { InputController } from '../systems/inputController.ts';
import { AudioManager } from '../audio/audioManager.ts';
import { IncomingProjectile } from '../ai/botBrain.ts';

export class ArenaCombatScene extends Phaser.Scene {
  private config: ArenaConfig;
  private player!: Player;
  private dummy: TrainingDummy | null = null;
  private bots: BotPlayer[] = [];
  private projectileGroup!: Phaser.Physics.Arcade.Group;
  private arenaMap!: ArenaMap;
  private inputController!: InputController;
  public audioManager!: AudioManager;

  // Mode & Difficulty Configuration
  public mode: GameMode = 'BOT_DUEL';
  public difficulty: BotDifficulty = 'NORMAL';
  public botCount: number = 1;

  // Combat Metrics
  private score: number = 0;
  private damageDealt: number = 0;
  private damageTaken: number = 0;
  private hitsLanded: number = 0;
  private botsDefeated: number = 0;
  private currentCombo: number = 0;
  private maxCombo: number = 0;
  private lastHitTime: number = 0;

  // Match State
  private matchTimeRemaining: number = 120;
  private matchTimerEvent?: Phaser.Time.TimerEvent;
  private isGameOver: boolean = false;
  private matchOutcome: 'PLAYING' | 'VICTORY' | 'DEFEAT' | 'DRAW' = 'PLAYING';
  private onHUDUpdate?: (hud: PlayerHUDState) => void;

  constructor() {
    super({ key: 'ArenaCombatScene' });
    this.config = DEFAULT_ARENA_CONFIG;
  }

  public init(data: {
    mode?: GameMode;
    difficulty?: BotDifficulty;
    botCount?: number;
    onHUDUpdate?: (hud: PlayerHUDState) => void;
    audioManager?: AudioManager;
  }) {
    this.mode = data.mode || this.mode || 'BOT_DUEL';
    this.difficulty = data.difficulty || this.difficulty || 'NORMAL';
    this.botCount = data.botCount || (this.mode === 'BOT_SKIRMISH' ? 2 : 1);
    this.onHUDUpdate = data.onHUDUpdate || this.onHUDUpdate;
    this.audioManager = data.audioManager || this.audioManager || new AudioManager();

    this.score = 0;
    this.damageDealt = 0;
    this.damageTaken = 0;
    this.hitsLanded = 0;
    this.botsDefeated = 0;
    this.currentCombo = 0;
    this.maxCombo = 0;
    this.isGameOver = false;
    this.matchOutcome = 'PLAYING';
    this.matchTimeRemaining = this.config.matchDurationSeconds;
  }

  public preload() {
    AssetLoader.preload(this);
  }

  public create() {
    // 1. Physics World Bounds
    this.physics.world.setBounds(0, 0, this.config.arenaWidth, this.config.arenaHeight);

    // 2. Arena Map
    this.arenaMap = new ArenaMap(this, this.config.arenaWidth, this.config.arenaHeight);

    // 3. Projectile Pool
    this.projectileGroup = this.physics.add.group({
      classType: Projectile,
      maxSize: 100,
      runChildUpdate: true,
    });

    // 4. Entities
    const spawnX = 220;
    const spawnY = this.config.arenaHeight / 2;
    this.player = new Player(this, spawnX, spawnY, this.config, this.projectileGroup);

    // Spawn based on selected mode
    this.spawnOpponents();

    // 5. Input
    this.inputController = new InputController(this);

    // 6. Camera Follow
    this.cameras.main.setBounds(0, 0, this.config.arenaWidth, this.config.arenaHeight);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    // 7. Setup Physics Colliders & Overlaps
    this.setupCollisions();

    // 8. Match Countdown Timer (1 second interval)
    if (this.matchTimerEvent) {
      this.matchTimerEvent.remove();
    }
    this.matchTimerEvent = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        if (this.isGameOver) return;
        this.matchTimeRemaining--;
        if (this.matchTimeRemaining <= 0) {
          // Determine outcome based on remaining health or draw
          if (this.mode === 'PRACTICE_DUMMY') {
            this.handleMatchEnd('DRAW');
          } else {
            const aliveBots = this.bots.filter((b) => b.isAlive);
            if (aliveBots.length === 0) {
              this.handleMatchEnd('VICTORY');
            } else if (this.damageDealt > this.damageTaken) {
              this.handleMatchEnd('VICTORY');
            } else {
              this.handleMatchEnd('DRAW');
            }
          }
        }
      },
    });
  }

  private spawnOpponents() {
    // Clean up existing dummy if any
    if (this.dummy) {
      this.dummy.destroy();
      this.dummy = null;
    }
    // Clean up existing bots if any
    this.bots.forEach((b) => b.destroy());
    this.bots = [];

    if (this.mode === 'PRACTICE_DUMMY') {
      const dummyX = this.config.arenaWidth - 280;
      const dummyY = this.config.arenaHeight / 2;
      this.dummy = new TrainingDummy(this, dummyX, dummyY, this.config.dummyMaxHealth);
    } else {
      // Spawn AI Bots
      const count = Math.min(3, Math.max(1, this.botCount));
      const spawnPoints = [
        { x: this.config.arenaWidth - 280, y: this.config.arenaHeight / 2 },
        { x: this.config.arenaWidth - 340, y: this.config.arenaHeight / 2 - 140 },
        { x: this.config.arenaWidth - 340, y: this.config.arenaHeight / 2 + 140 },
      ];

      for (let i = 0; i < count; i++) {
        const pt = spawnPoints[i % spawnPoints.length];
        const bot = new BotPlayer(
          this,
          String(i + 1),
          pt.x,
          pt.y,
          this.difficulty,
          this.config,
          this.projectileGroup
        );
        this.bots.push(bot);
      }
    }
  }

  private setupCollisions() {
    // Player vs Walls
    this.physics.add.collider(this.player, this.arenaMap.wallGroup);

    // Dummy collisions
    if (this.dummy) {
      this.physics.add.collider(this.dummy, this.arenaMap.wallGroup);
      this.physics.add.collider(this.player, this.dummy);
    }

    // Bots collisions
    this.bots.forEach((bot) => {
      this.physics.add.collider(bot, this.arenaMap.wallGroup);
      this.physics.add.collider(this.player, bot);
    });

    // Bot vs Bot collisions
    for (let i = 0; i < this.bots.length; i++) {
      for (let j = i + 1; j < this.bots.length; j++) {
        this.physics.add.collider(this.bots[i], this.bots[j]);
      }
    }

    // Projectile vs Walls
    this.physics.add.collider(this.projectileGroup, this.arenaMap.wallGroup, (projObj) => {
      const proj = projObj as Projectile;
      this.createSparks(proj.x, proj.y, proj.fromPlayer ? 0x38bdf8 : 0xf97316);
      proj.deactivate();
    });

    // Projectile vs Dummy
    if (this.dummy) {
      this.physics.add.overlap(this.projectileGroup, this.dummy, (dummyObj, projObj) => {
        const proj = projObj as Projectile;
        if (!proj.active || !proj.fromPlayer) return;

        const result = this.dummy!.takeDamage(proj.damage);
        this.createSparks(proj.x, proj.y, proj.isSpecial ? 0xd946ef : 0xfacc15, proj.isSpecial ? 16 : 8);
        this.createFloatingDamageNumber(this.dummy!.x, this.dummy!.y - 30, proj.damage, proj.isSpecial);
        this.audioManager.playHit();

        this.hitsLanded++;
        this.damageDealt += result.damageDealt;
        this.score += proj.damage * 10;
        this.updateCombo();

        if (result.dead) {
          this.score += 500;
          this.audioManager.playVictory();
          this.createFloatingDamageNumber(this.dummy!.x, this.dummy!.y - 50, 'TARGET DESTROYED!', true);
        }

        proj.deactivate();
      });
    }

    // Projectile vs Bots (Player hitting Bot)
    this.bots.forEach((bot) => {
      this.physics.add.overlap(this.projectileGroup, bot, (botObj, projObj) => {
        const targetBot = botObj as BotPlayer;
        const proj = projObj as Projectile;
        if (!proj.active || !proj.fromPlayer || !targetBot.isAlive) return;

        const result = targetBot.takeDamage(proj.damage);
        this.createSparks(proj.x, proj.y, proj.isSpecial ? 0xd946ef : 0xfacc15, proj.isSpecial ? 18 : 10);
        this.createFloatingDamageNumber(targetBot.x, targetBot.y - 32, proj.damage, proj.isSpecial);
        this.audioManager.playHit();

        this.hitsLanded++;
        this.damageDealt += result.damageDealt;
        this.score += proj.damage * 15;
        this.updateCombo();

        if (result.dead) {
          this.botsDefeated++;
          const bonus = this.difficulty === 'HARD' ? 1200 : this.difficulty === 'NORMAL' ? 800 : 500;
          this.score += bonus;
          this.createFloatingDamageNumber(targetBot.x, targetBot.y - 54, `BOT DESTROYED! +${bonus}`, true);

          // Check if all bots are eliminated
          const allDead = this.bots.every((b) => !b.isAlive);
          if (allDead) {
            this.handleMatchEnd('VICTORY');
          }
        }

        proj.deactivate();
      });
    });

    // Projectile vs Player (Hostile Bot hitting Player)
    this.physics.add.overlap(this.projectileGroup, this.player, (playerObj, projObj) => {
      const proj = projObj as Projectile;
      if (!proj.active || proj.fromPlayer || this.isGameOver) return;

      const tookDamage = this.player.takeDamage(proj.damage);
      if (tookDamage) {
        this.damageTaken += proj.damage;
        this.cameras.main.shake(140, 0.006);
        this.createSparks(this.player.x, this.player.y, 0xef4444, 12);
        this.createFloatingDamageNumber(this.player.x, this.player.y - 32, proj.damage, true);
        this.audioManager.playPlayerHurt();

        // Reset player combo on taking damage
        this.currentCombo = 0;

        if (this.player.health <= 0) {
          this.handleMatchEnd('DEFEAT');
        }
      }

      proj.deactivate();
    });
  }

  private updateCombo() {
    const now = this.time.now;
    if (now - this.lastHitTime < 2500) {
      this.currentCombo++;
    } else {
      this.currentCombo = 1;
    }
    this.lastHitTime = now;
    if (this.currentCombo > this.maxCombo) {
      this.maxCombo = this.currentCombo;
    }
  }

  public update(time: number) {
    if (this.isGameOver) return;

    // Reset combo if decay time passed
    if (this.currentCombo > 0 && time - this.lastHitTime > 2500) {
      this.currentCombo = 0;
    }

    const input = this.inputController.getInputVector(this.player.x, this.player.y);

    // Player Movement & Aiming
    this.player.move(input.x, input.y, this.config.playerSpeed);
    this.player.aim(input.aimAngle);

    // Player Attacks & Dashes
    if (input.isDashing) {
      const dashed = this.player.executeDash(time, input.x, input.y);
      if (dashed) this.audioManager.playDash();
    } else if (input.isSpecialAttacking) {
      const attacked = this.player.executeSpecialAttack(time, input.aimAngle);
      if (attacked) this.audioManager.playSpecialAttack();
    } else if (input.isAttacking) {
      const attacked = this.player.executeAttack(time, input.aimAngle);
      if (attacked) this.audioManager.playAttack();
    }

    // Collect active player projectiles to feed into Bot AI perception
    const playerProjectiles: IncomingProjectile[] = [];
    this.projectileGroup.getChildren().forEach((child) => {
      const p = child as Projectile;
      if (p.active && p.fromPlayer && p.body) {
        playerProjectiles.push({
          x: p.x,
          y: p.y,
          vx: p.body.velocity.x,
          vy: p.body.velocity.y,
          speed: Math.hypot(p.body.velocity.x, p.body.velocity.y),
        });
      }
    });

    // Update AI for all bots
    const playerVx = this.player.body?.velocity.x || 0;
    const playerVy = this.player.body?.velocity.y || 0;
    this.bots.forEach((bot) => {
      bot.updateAI(
        time,
        this.player.x,
        this.player.y,
        playerVx,
        playerVy,
        this.player.health,
        playerProjectiles
      );
    });

    // Push HUD updates
    this.broadcastHUD(time);
  }

  private broadcastHUD(time: number) {
    if (!this.onHUDUpdate) return;

    // Compile opponents info for HUD
    const opponents: OpponentHUDInfo[] = this.bots.map((b) => ({
      id: b.id,
      name: b.botName,
      health: b.health,
      maxHealth: b.maxHealth,
      difficulty: b.difficulty,
      state: b.latestDecision.state,
      isAlive: b.isAlive,
    }));

    const hudState: PlayerHUDState = {
      mode: this.mode,
      difficulty: this.difficulty,
      botCount: this.mode === 'PRACTICE_DUMMY' ? 0 : this.bots.length,
      health: this.player.health,
      maxHealth: this.player.maxHealth,
      dummyHealth: this.dummy ? this.dummy.health : 0,
      dummyMaxHealth: this.dummy ? this.dummy.maxHealth : 0,
      opponents,
      attackReady: this.player.canAttack(time),
      specialAttackReady: this.player.canSpecialAttack(time),
      specialCooldownProgress: this.player.getSpecialCooldownProgress(time),
      dashReady: this.player.canDash(time),
      dashCooldownProgress: this.player.getDashCooldownProgress(time),
      matchTimeRemaining: this.matchTimeRemaining,
      status: this.isGameOver ? this.matchOutcome : 'PLAYING',
      stats: {
        score: this.score,
        damageDealt: this.damageDealt,
        damageTaken: this.damageTaken,
        hitsLanded: this.hitsLanded,
        combosMax: this.maxCombo,
        currentCombo: this.currentCombo,
        botsDefeated: this.botsDefeated,
      },
    };

    this.onHUDUpdate(hudState);
  }

  private createSparks(x: number, y: number, color: number = 0xfacc15, count: number = 8) {
    for (let i = 0; i < count; i++) {
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const speed = Phaser.Math.FloatBetween(40, 180);
      const spark = this.add.circle(x, y, 3, color);
      this.physics.add.existing(spark);
      const body = spark.body as Phaser.Physics.Arcade.Body;
      if (body) {
        body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
      }
      this.tweens.add({
        targets: spark,
        alpha: 0,
        scale: 0.1,
        duration: 250,
        onComplete: () => spark.destroy(),
      });
    }
  }

  private createFloatingDamageNumber(x: number, y: number, val: number | string, isCrit: boolean = false) {
    const textStr = typeof val === 'number' ? `-${val}` : String(val);
    const txt = this.add.text(x, y, textStr, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: isCrit ? '20px' : '15px',
      fontStyle: 'bold',
      color: isCrit ? '#f43f5e' : '#facc15',
      stroke: '#000000',
      strokeThickness: 3,
    });
    txt.setOrigin(0.5);

    this.tweens.add({
      targets: txt,
      y: y - 40,
      alpha: 0,
      duration: 650,
      ease: 'Power1',
      onComplete: () => txt.destroy(),
    });
  }

  public handleMatchEnd(outcome: 'VICTORY' | 'DEFEAT' | 'DRAW') {
    if (this.isGameOver) return;
    this.isGameOver = true;
    this.matchOutcome = outcome;
    this.player.setVelocity(0, 0);

    if (outcome === 'VICTORY') {
      this.audioManager.playVictory();
    } else if (outcome === 'DEFEAT') {
      this.audioManager.playDefeat();
    }

    this.broadcastHUD(this.time.now);
  }

  public restartGame(mode?: GameMode, difficulty?: BotDifficulty, botCount?: number) {
    if (mode) this.mode = mode;
    if (difficulty) this.difficulty = difficulty;
    if (botCount) this.botCount = botCount;

    this.score = 0;
    this.damageDealt = 0;
    this.damageTaken = 0;
    this.hitsLanded = 0;
    this.botsDefeated = 0;
    this.currentCombo = 0;
    this.maxCombo = 0;
    this.isGameOver = false;
    this.matchOutcome = 'PLAYING';
    this.matchTimeRemaining = this.config.matchDurationSeconds;

    // Reset player
    const spawnX = 220;
    const spawnY = this.config.arenaHeight / 2;
    this.player.reset(spawnX, spawnY);

    // Clear projectiles
    this.projectileGroup.getChildren().forEach((child) => {
      (child as Projectile).deactivate();
    });

    // Re-spawn opponents and re-setup collisions
    this.spawnOpponents();
    this.setupCollisions();
  }
}
