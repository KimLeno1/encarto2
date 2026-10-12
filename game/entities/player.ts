import Phaser from 'phaser';
import { ArenaConfig } from '../config/arenaConfig.ts';
import { Projectile, ProjectileConfig } from './projectile.ts';

export class Player extends Phaser.Physics.Arcade.Sprite {
  public health: number;
  public maxHealth: number;
  public isInvulnerable: boolean = false;
  public isDashing: boolean = false;

  private lastAttackTime: number = 0;
  private lastSpecialAttackTime: number = 0;
  private lastDashTime: number = 0;
  private config: ArenaConfig;

  private projectileGroup: Phaser.Physics.Arcade.Group;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    config: ArenaConfig,
    projectileGroup: Phaser.Physics.Arcade.Group
  ) {
    super(scene, x, y, 'player_disc');
    this.config = config;
    this.health = config.playerMaxHealth;
    this.maxHealth = config.playerMaxHealth;
    this.projectileGroup = projectileGroup;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    if (this.body) {
      this.body.setCircle(18, 6, 6);
    }
  }

  public move(vx: number, vy: number, speed: number) {
    if (this.isDashing) return;
    this.setVelocity(vx * speed, vy * speed);
  }

  public aim(angle: number) {
    this.setRotation(angle);
  }

  public canAttack(time: number): boolean {
    return time - this.lastAttackTime >= this.config.attackCooldownMs;
  }

  public canSpecialAttack(time: number): boolean {
    return time - this.lastSpecialAttackTime >= this.config.specialAttackCooldownMs;
  }

  public canDash(time: number): boolean {
    return time - this.lastDashTime >= this.config.dashCooldownMs;
  }

  public getSpecialCooldownProgress(time: number): number {
    const elapsed = time - this.lastSpecialAttackTime;
    return Math.min(1, Math.max(0, elapsed / this.config.specialAttackCooldownMs));
  }

  public getDashCooldownProgress(time: number): number {
    const elapsed = time - this.lastDashTime;
    return Math.min(1, Math.max(0, elapsed / this.config.dashCooldownMs));
  }

  public executeAttack(time: number, angle: number): boolean {
    if (!this.canAttack(time)) return false;
    this.lastAttackTime = time;

    const proj = this.projectileGroup.get() as Projectile;
    if (proj) {
      const offsetX = Math.cos(angle) * 28;
      const offsetY = Math.sin(angle) * 28;
      const config: ProjectileConfig = {
        damage: this.config.attackDamage,
        isSpecial: false,
        speed: this.config.projectileSpeed,
        lifetimeMs: this.config.projectileLifetimeMs,
        fromPlayer: true,
      };
      proj.setTexture('projectile_bolt');
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
        damage: this.config.specialAttackDamage,
        isSpecial: true,
        speed: this.config.projectileSpeed * 1.1,
        lifetimeMs: this.config.projectileLifetimeMs,
        fromPlayer: true,
      };
      proj.setTexture('projectile_heavy');
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

    // If standing still, dash in rotation direction
    let dirX = vx;
    let dirY = vy;
    if (dirX === 0 && dirY === 0) {
      dirX = Math.cos(this.rotation);
      dirY = Math.sin(this.rotation);
    }

    this.setVelocity(dirX * this.config.dashSpeed, dirY * this.config.dashSpeed);
    this.setAlpha(0.6);

    this.scene.time.delayedCall(this.config.dashDurationMs, () => {
      this.isDashing = false;
      this.isInvulnerable = false;
      this.setAlpha(1);
    });

    return true;
  }

  public takeDamage(amount: number) {
    if (this.isInvulnerable) return false;

    this.health = Math.max(0, this.health - amount);
    this.isInvulnerable = true;

    // Flash red & invulnerability flicker
    this.scene.tweens.add({
      targets: this,
      alpha: 0.3,
      duration: 80,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        this.isInvulnerable = false;
        this.setAlpha(1);
      },
    });

    return true;
  }

  public reset(x: number, y: number) {
    this.setPosition(x, y);
    this.setVelocity(0, 0);
    this.health = this.maxHealth;
    this.isInvulnerable = false;
    this.isDashing = false;
    this.setAlpha(1);
    this.lastAttackTime = 0;
    this.lastSpecialAttackTime = 0;
    this.lastDashTime = 0;
  }
}
