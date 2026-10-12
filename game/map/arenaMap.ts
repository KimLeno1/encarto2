import Phaser from 'phaser';

export class ArenaMap {
  private scene: Phaser.Scene;
  public wallGroup: Phaser.Physics.Arcade.StaticGroup;
  public arenaWidth: number;
  public arenaHeight: number;

  constructor(scene: Phaser.Scene, arenaWidth: number, arenaHeight: number) {
    this.scene = scene;
    this.arenaWidth = arenaWidth;
    this.arenaHeight = arenaHeight;
    this.wallGroup = scene.physics.add.staticGroup();
    this.buildArena();
  }

  private buildArena() {
    // 1. Floor grid background
    const tileSize = 64;
    for (let x = 0; x < this.arenaWidth; x += tileSize) {
      for (let y = 0; y < this.arenaHeight; y += tileSize) {
        this.scene.add.image(x + tileSize / 2, y + tileSize / 2, 'arena_floor_tile');
      }
    }

    // 2. Arena perimeter borders (Walls)
    const wallThickness = 32;

    // Top wall
    for (let x = 0; x < this.arenaWidth; x += wallThickness) {
      const wall = this.wallGroup.create(x + wallThickness / 2, wallThickness / 2, 'arena_wall');
      wall.refreshBody();
    }
    // Bottom wall
    for (let x = 0; x < this.arenaWidth; x += wallThickness) {
      const wall = this.wallGroup.create(
        x + wallThickness / 2,
        this.arenaHeight - wallThickness / 2,
        'arena_wall'
      );
      wall.refreshBody();
    }
    // Left wall
    for (let y = wallThickness; y < this.arenaHeight - wallThickness; y += wallThickness) {
      const wall = this.wallGroup.create(wallThickness / 2, y + wallThickness / 2, 'arena_wall');
      wall.refreshBody();
    }
    // Right wall
    for (let y = wallThickness; y < this.arenaHeight - wallThickness; y += wallThickness) {
      const wall = this.wallGroup.create(
        this.arenaWidth - wallThickness / 2,
        y + wallThickness / 2,
        'arena_wall'
      );
      wall.refreshBody();
    }

    // 3. Central combat ring markings
    const centerG = this.scene.add.graphics();
    centerG.lineStyle(2, 0x06b6d4, 0.4);
    centerG.strokeCircle(this.arenaWidth / 2, this.arenaHeight / 2, 160);
    centerG.lineStyle(1, 0x3b82f6, 0.2);
    centerG.strokeCircle(this.arenaWidth / 2, this.arenaHeight / 2, 280);

    // Decorative quadrant brackets
    centerG.lineStyle(2, 0xa855f7, 0.5);
    const cx = this.arenaWidth / 2;
    const cy = this.arenaHeight / 2;
    centerG.strokeRect(cx - 300, cy - 200, 600, 400);

    // 4. Tactical Pillars in corners for tactical cover
    const pillars = [
      { x: 260, y: 200 },
      { x: this.arenaWidth - 260, y: 200 },
      { x: 260, y: this.arenaHeight - 200 },
      { x: this.arenaWidth - 260, y: this.arenaHeight - 200 },
    ];

    pillars.forEach((p) => {
      const pillar = this.wallGroup.create(p.x, p.y, 'arena_wall');
      pillar.setScale(1.5);
      pillar.refreshBody();
    });
  }
}
