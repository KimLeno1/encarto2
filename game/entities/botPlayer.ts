import Phaser from 'phaser';
import { ArenaConfig } from '../config/arenaConfig.ts';
import { Projectile, ProjectileConfig } from './projectile.ts';
import { BotBrain, BotContext, BotDecision, IncomingProjectile } from '../ai/botBrain.ts';
import { BotDifficultyConfig, BOT_DIFFICULTY_PRESETS, BotDifficulty } from '../ai/botConfig.ts';

export class BotPlayer extends Phaser.Physics.Arcade.Sprite {
  public id: string;
  public botName: string;
  public difficulty: BotDifficulty;
  public health: number;
  public maxHealth: number;
  public isInvulnerable: boolean = false;
  public isDashing: boolean = false;
  public isAlive: boolean = true;

  public brain: BotBrain;
  public difficultyConfig: BotDifficultyConfig;

  private lastAttackTime: number = 0;
  private lastSpecialAttackTime: number = 0;
  private lastDashTime: number = 0;
  private arenaConfig: ArenaConfig;
  private projectileGroup: Phaser.Physics.Arcade.Group;

  // Overhead UI elements
  private overheadContainer: Phaser.GameObjects.Container;
  private healthBarBg: Phaser.GameObjects.Rectangle;
  private healthBarFill: Phaser.GameObjects.Rectangle;
  private nameText: Phaser.GameObjects.Text;

  public latestDecision: BotDecision = {
    moveX: 0,
    moveY: 0,
    aimAngle: 0,
    shouldAttack: false,
    shouldSpecialAttack: false,
    shouldDash: false,
    state: 'IDLE',
    targetDistance: 0,
  };

  constructor(
    scene: Phaser.Scene,
    id: string,
    x: number,
    y: number,
    difficulty: BotDifficulty,
    arenaConfig: ArenaConfig,
    projectileGroup: Phaser.Physics.Arcade.Group
  ) {
    super(scene, x, y, 'bot_disc');
    this.id = id;
    this.difficulty = difficulty;
    this.difficultyConfig = BOT_DIFFICULTY_PRESETS[difficulty];
    this.botName = `${this.difficultyConfig.namePrefix} #${id}`;
    this.arenaConfig = arenaConfig;
    this.projectileGroup = projectileGroup;

    // Difficulty-adjusted health
    const healthMultiplier = difficulty === 'HARD' ? 1.25 : difficulty === 'NORMAL' ? 1.0 : 0.8;
    this.maxHealth = Math.round(arenaConfig.playerMaxHealth * healthMultiplier);
    this.health = this.maxHealth;

    this.brain = new BotBrain(this.difficultyConfig);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    if (this.body) {
      this.body.setCircle(18, 6, 6);
    }

    // Overhead Health & Status Bar
    this.overheadContainer = scene.add.container(x, y - 36);
    this.healthBarBg = scene.add.rectangle(0, 0, 48, 6, 0x111827);
    this.healthBarBg.setStrokeStyle(1, 0xef4444, 0.6);
    this.healthBarFill = scene.add.rectangle(-24, 0, 48, 6, 0xef4444);
    this.healthBarFill.setOrigin(0, 0.5);

    const diffBadgeColor = difficulty === 'HARD' ? '#c084fc' : difficulty === 'NORMAL' ? '#facc15' : '#4ade80';
    this.nameText = scene.add.text(0, -9, `${this.difficulty} • IDLE`, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '9px',
      color: diffBadgeColor,
      stroke: '#000000',
      strokeThickness: 2,
    });
    this.nameText.setOrigin(0.5);

    this.overheadContainer.add([this.healthBarBg, this.healthBarFill, this.nameText]);
    this.overheadContainer.setDepth(15);
  }

  public updateAI(
    time: number,
    playerX: number,
    playerY: number,
    playerVx: number,
    playerVy: number,
    playerHealth: number,
    incomingProjectiles: IncomingProjectile[]
  ) {
    if (!this.isAlive || !this.active) return;

    // Construct context for bot decision brain
    const context: BotContext = {
      botX: this.x,
      botY: this.y,
      botHealth: this.health,
      botMaxHealth: this.maxHealth,
      playerX,
      playerY,
      playerVx,
      playerVy,
      playerHealth,
      canAttack: this.canAttack(time),
      canSpecialAttack: this.canSpecialAttack(time),
      canDash: this.canDash(time),
      incomingProjectiles,
      arenaWidth: this.arenaConfig.arenaWidth,
      arenaHeight: this.arenaConfig.arenaHeight,
    };

    const decision = this.brain.update(context, time);
    this.latestDecision = decision;

    // Apply movement
    const baseSpeed = this.arenaConfig.playerSpeed * this.difficultyConfig.speedMultiplier;
    if (!this.isDashing) {
      this.setVelocity(decision.moveX * baseSpeed, decision.moveY * baseSpeed);
    }

    // Apply aiming rotation
    this.setRotation(decision.aimAngle);

    // Apply abilities
    if (decision.shouldDash && this.canDash(time)) {
      this.executeDash(time, decision.moveX, decision.moveY);
    } else if (decision.shouldSpecialAttack && this.canSpecialAttack(time)) {
      this.executeSpecialAttack(time, decision.aimAngle);
    } else if (decision.shouldAttack && this.canAttack(time)) {
      this.executeAttack(time, decision.aimAngle);
    }

    // Update overhead display
    this.updateOverheadUI();
  }

  private updateOverheadUI() {
    this.overheadContainer.setPosition(this.x, this.y - 36);
    const healthPercent = Math.max(0, this.health / this.maxHealth);
    this.healthBarFill.width = 48 * healthPercent;

    if (this.nameText) {
      this.nameText.setText(`${this.difficulty} • ${this.latestDecision.state}`);
    }
  }

  public canAttack(time: number): boolean {
    return time - this.lastAttackTime >= this.arenaConfig.attackCooldownMs;
  }

  public canSpecialAttack(time: number): boolean {
    return time - this.lastSpecialAttackTime >= this.arenaConfig.specialAttackCooldownMs;
  }

  public canDash(time: number): boolean {
    return time - this.lastDashTime >= this.arenaConfig.dashCooldownMs;
  }

  public executeAttack(time: number, angle: number): boolean {
    if (!this.canAttack(time)) return false;
    this.lastAttackTime = time;

    const proj = this.projectileGroup.get() as Projectile;
    if (proj) {
      const offsetX = Math.cos(angle) * 28;
      const offsetY = Math.sin(angle) * 28;
      const config: ProjectileConfig = {
        damage: this.arenaConfig.attackDamage,
        isSpecial: false,
        speed: this.arenaConfig.projectileSpeed * 0.95,
        lifetimeMs: this.arenaConfig.projectileLifetimeMs,
        fromPlayer: false, // hostile to player!
      };
      proj.setTexture('bot_projectile_bolt');
      proj.fire(this.x + offsetX, this.y + offsetY, angle, config);
      return true;
    }
    return false;
  }

  public executeSpecialAttack(time: number, angle: number): boolean {
    if (!this.canSpecialAttack(time)) return false;
    this.lastSpecialAttackTime = time;

    const proj = this.projectileGroup.get() as Projectile;
    if (proj) {
      const offsetX = Math.cos(angle) * 32;
      const offsetY = Math.sin(angle) * 32;
      const config: ProjectileConfig = {
        damage: this.arenaConfig.specialAttackDamage,
        isSpecial: true,
        speed: this.arenaConfig.projectileSpeed * 1.05,
        lifetimeMs: this.arenaConfig.projectileLifetimeMs,
        fromPlayer: false, // hostile to player!
      };
      proj.setTexture('bot_projectile_heavy');
      proj.fire(this.x + offsetX, this.y + offsetY, angle, config);
      return true;
    }
    return false;
  }

  public executeDash(time: number, vx: number, vy: number): boolean {
    if (!this.canDash(time) || this.isDashing) return false;
    this.lastDashTime = time;
    this.isDashing = true;
    this.isInvulnerable = true;

    let dirX = vx;
    let dirY = vy;
    if (dirX === 0 && dirY === 0) {
      dirX = Math.cos(this.rotation);
      dirY = Math.sin(this.rotation);
    }

    this.setVelocity(dirX * this.arenaConfig.dashSpeed, dirY * this.arenaConfig.dashSpeed);
    this.setAlpha(0.6);

    this.scene.time.delayedCall(this.arenaConfig.dashDurationMs, () => {
      this.isDashing = false;
      this.isInvulnerable = false;
      this.setAlpha(1);
    });

    return true;
  }

  public takeDamage(amount: number): { dead: boolean; damageDealt: number } {
    if (this.isInvulnerable || !this.isAlive) return { dead: !this.isAlive, damageDealt: 0 };

    const actual = Math.min(this.health, amount);
    this.health -= actual;
    this.isInvulnerable = true;

    // Flash hit tween
    this.scene.tweens.add({
      targets: this,
      alpha: 0.3,
      duration: 70,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        this.isInvulnerable = false;
        if (this.isAlive) this.setAlpha(1);
      },
    });

    if (this.health <= 0) {
      this.isAlive = false;
      this.handleDeath();
      return { dead: true, damageDealt: actual };
    }

    return { dead: false, damageDealt: actual };
  }

  private handleDeath() {
    this.setVelocity(0, 0);
    if (this.body) {
      this.body.enable = false;
    }
    this.overheadContainer.setVisible(false);

    // Death explosion tween
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.4,
      scaleY: 1.4,
      alpha: 0,
      duration: 350,
      ease: 'Power2',
      onComplete: () => {
        this.setActive(false);
        this.setVisible(false);
      },
    });
  }

  public reset(x: number, y: number) {
    this.setPosition(x, y);
    this.setVelocity(0, 0);
    this.health = this.maxHealth;
    this.isAlive = true;
    this.isInvulnerable = false;
    this.isDashing = false;
    this.setActive(true);
    this.setVisible(true);
    this.setAlpha(1);
    this.setScale(1);
    if (this.body) {
      this.body.enable = true;
    }
    this.overheadContainer.setVisible(true);
    this.updateOverheadUI();
    this.lastAttackTime = 0;
    this.lastSpecialAttackTime = 0;
    this.lastDashTime = 0;
  }

  public destroy(fromScene?: boolean) {
    if (this.overheadContainer) {
      this.overheadContainer.destroy();
    }
    super.destroy(fromScene);
  }
}
