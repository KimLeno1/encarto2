import Phaser from 'phaser';

export class TrainingDummy extends Phaser.Physics.Arcade.Sprite {
  public health: number;
  public maxHealth: number;
  public isInvulnerable: boolean = false;
  private hitCounter: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, maxHealth: number = 250) {
    super(scene, x, y, 'dummy_target');
    this.maxHealth = maxHealth;
    this.health = maxHealth;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Dummy is grounded and immovable by default
    this.setImmovable(true);
    if (this.body) {
      this.body.setCircle(26, 4, 4);
    }
  }

  public takeDamage(amount: number): { dead: boolean; damageDealt: number } {
    if (this.health <= 0) return { dead: true, damageDealt: 0 };

    const actualDamage = Math.min(this.health, amount);
    this.health -= actualDamage;
    this.hitCounter++;

    // Knockback shake & flash tween
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.15,
      scaleY: 0.85,
      duration: 60,
      yoyo: true,
      onComplete: () => {
        this.setScale(1);
      },
    });

    // Color tint flash
    this.setTint(0xff9999);
    this.scene.time.delayedCall(120, () => {
      this.clearTint();
    });

    const isDead = this.health <= 0;
    if (isDead) {
      this.handleDeath();
    }

    return { dead: isDead, damageDealt: actualDamage };
  }

  private handleDeath() {
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scale: 0.2,
      duration: 300,
      onComplete: () => {
        // Respawn after 2 seconds for continuous practice
        this.scene.time.delayedCall(2000, () => {
          this.respawn();
        });
      },
    });
  }

  public respawn() {
    this.health = this.maxHealth;
    this.setAlpha(1);
    this.setScale(1);
    this.clearTint();
  }

  public reset(x: number, y: number) {
    this.setPosition(x, y);
    this.health = this.maxHealth;
    this.setAlpha(1);
    this.setScale(1);
    this.clearTint();
  }
}
