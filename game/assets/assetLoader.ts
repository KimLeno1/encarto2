import Phaser from 'phaser';

export class AssetLoader {
  public static preload(scene: Phaser.Scene) {
    // Generate programmatic particle / weapon / entity textures so the game is 100% resilient
    this.createProceduralTextures(scene);
  }

  private static createProceduralTextures(scene: Phaser.Scene) {
    // 1. Player texture (Cyan neon hero)
    if (!scene.textures.exists('player_disc')) {
      const g = scene.make.graphics({ x: 0, y: 0 });
      // Outer glow ring
      g.lineStyle(4, 0x06b6d4, 1);
      g.fillStyle(0x0e7490, 1);
      g.fillCircle(24, 24, 20);
      g.strokeCircle(24, 24, 20);
      // Direction notch (facing right at angle 0)
      g.fillStyle(0x22d3ee, 1);
      g.fillTriangle(38, 24, 26, 16, 26, 32);
      // Center energy core
      g.fillStyle(0xffffff, 1);
      g.fillCircle(20, 24, 6);
      g.generateTexture('player_disc', 48, 48);
      g.destroy();
    }

    // 2. Training Dummy texture (Red-orange heavy practice target)
    if (!scene.textures.exists('dummy_target')) {
      const g = scene.make.graphics({ x: 0, y: 0 });
      g.lineStyle(4, 0xef4444, 1);
      g.fillStyle(0x991b1b, 1);
      g.fillCircle(30, 30, 26);
      g.strokeCircle(30, 30, 26);
      // Target bullseye
      g.lineStyle(3, 0xfca5a5, 1);
      g.strokeCircle(30, 30, 16);
      g.fillStyle(0xf87171, 1);
      g.fillCircle(30, 30, 8);
      // Crosshairs
      g.lineStyle(2, 0xffffff, 0.8);
      g.lineBetween(30, 6, 30, 54);
      g.lineBetween(6, 30, 54, 30);
      g.generateTexture('dummy_target', 60, 60);
      g.destroy();
    }

    // 3. Projectile (Basic Attack bolt)
    if (!scene.textures.exists('projectile_bolt')) {
      const g = scene.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x38bdf8, 1);
      g.fillCircle(8, 8, 7);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(8, 8, 3);
      g.generateTexture('projectile_bolt', 16, 16);
      g.destroy();
    }

    // 4. Special Attack (Heavy Energy Blast)
    if (!scene.textures.exists('projectile_heavy')) {
      const g = scene.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xa855f7, 0.4);
      g.fillCircle(16, 16, 15);
      g.fillStyle(0xd946ef, 1);
      g.fillCircle(16, 16, 11);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(16, 16, 5);
      g.generateTexture('projectile_heavy', 32, 32);
      g.destroy();
    }

    // 5. Arena Floor Tile
    if (!scene.textures.exists('arena_floor_tile')) {
      const g = scene.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x090d16, 1);
      g.fillRect(0, 0, 64, 64);
      // Grid line
      g.lineStyle(1, 0x1e293b, 0.6);
      g.strokeRect(0, 0, 64, 64);
      // Center subtle accent
      g.fillStyle(0x1e293b, 0.3);
      g.fillPoint(32, 32, 2);
      g.generateTexture('arena_floor_tile', 64, 64);
      g.destroy();
    }

    // 6. Arena Barrier / Wall
    if (!scene.textures.exists('arena_wall')) {
      const g = scene.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x0f172a, 1);
      g.fillRect(0, 0, 32, 32);
      g.lineStyle(2, 0x3b82f6, 0.8);
      g.strokeRect(0, 0, 32, 32);
      g.lineStyle(1, 0x1d4ed8, 0.4);
      g.lineBetween(0, 0, 32, 32);
      g.lineBetween(32, 0, 0, 32);
      g.generateTexture('arena_wall', 32, 32);
      g.destroy();
    }

    // 7. Spark / Particle
    if (!scene.textures.exists('hit_spark')) {
      const g = scene.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xfacc15, 1);
      g.fillCircle(4, 4, 3);
      g.generateTexture('hit_spark', 8, 8);
      g.destroy();
    }

    // 8. Bot Disc Texture (Crimson & Amber Hostile Unit)
    if (!scene.textures.exists('bot_disc')) {
      const g = scene.make.graphics({ x: 0, y: 0 });
      // Outer ring
      g.lineStyle(4, 0xef4444, 1);
      g.fillStyle(0x7f1d1d, 1);
      g.fillCircle(24, 24, 20);
      g.strokeCircle(24, 24, 20);
      // Direction notch (facing right at angle 0)
      g.fillStyle(0xf97316, 1);
      g.fillTriangle(38, 24, 26, 16, 26, 32);
      // Center energy core (Amber glowing eye)
      g.fillStyle(0xfef08a, 1);
      g.fillCircle(20, 24, 6);
      g.generateTexture('bot_disc', 48, 48);
      g.destroy();
    }

    // 9. Hostile Bot Bolt (Orange/Red energy projectile)
    if (!scene.textures.exists('bot_projectile_bolt')) {
      const g = scene.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xf97316, 1);
      g.fillCircle(8, 8, 7);
      g.fillStyle(0xffedd5, 1);
      g.fillCircle(8, 8, 3);
      g.generateTexture('bot_projectile_bolt', 16, 16);
      g.destroy();
    }

    // 10. Hostile Bot Heavy Blast (Crimson orb)
    if (!scene.textures.exists('bot_projectile_heavy')) {
      const g = scene.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xdc2626, 0.4);
      g.fillCircle(16, 16, 15);
      g.fillStyle(0xe11d48, 1);
      g.fillCircle(16, 16, 11);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(16, 16, 5);
      g.generateTexture('bot_projectile_heavy', 32, 32);
      g.destroy();
    }
  }
}
