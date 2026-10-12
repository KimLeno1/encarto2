import Phaser from 'phaser';

export interface ProjectileConfig {
  damage: number;
  isSpecial: boolean;
  speed: number;
  lifetimeMs: number;
  fromPlayer: boolean;
}

export class Projectile extends Phaser.Physics.Arcade.Sprite {
  public damage: number = 20;
  public isSpecial: boolean = false;
  public fromPlayer: boolean = true;
  private spawnTime: number = 0;
  private lifetimeMs: number = 1000;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);
  }

  public fire(x: number, y: number, angle: number, config: ProjectileConfig) {
    this.enableBody(true, x, y, true, true);
    this.damage = config.damage;
    this.isSpecial = config.isSpecial;
    this.fromPlayer = config.fromPlayer;
    this.lifetimeMs = config.lifetimeMs;
    this.spawnTime = this.scene.time.now;

    this.setRotation(angle);
    this.scene.physics.velocityFromRotation(angle, config.speed, this.body?.velocity);

    if (this.body) {
      const radius = config.isSpecial ? 12 : 6;
      this.body.setCircle(radius, (this.width - radius * 2) / 2, (this.height - radius * 2) / 2);
    }
  }

  public update(time: number) {
    if (this.active && time - this.spawnTime > this.lifetimeMs) {
      this.deactivate();
    }
  }

  public deactivate() {
    this.setActive(false);
    this.setVisible(false);
    this.disableBody(true, true);
  }
}
