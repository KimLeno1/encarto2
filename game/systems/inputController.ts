import Phaser from 'phaser';

export interface InputVector {
  x: number;
  y: number;
  aimAngle: number;
  aimWorldX: number;
  aimWorldY: number;
  isAttacking: boolean;
  isSpecialAttacking: boolean;
  isDashing: boolean;
}

export class InputController {
  private scene: Phaser.Scene;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
  private keyW: Phaser.Input.Keyboard.Key | null = null;
  private keyA: Phaser.Input.Keyboard.Key | null = null;
  private keyS: Phaser.Input.Keyboard.Key | null = null;
  private keyD: Phaser.Input.Keyboard.Key | null = null;
  private keySpace: Phaser.Input.Keyboard.Key | null = null;
  private keyQ: Phaser.Input.Keyboard.Key | null = null;
  private keyE: Phaser.Input.Keyboard.Key | null = null;

  private isMousePointerDown: boolean = false;
  private isRightMouseDown: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.setupKeys();
  }

  private setupKeys() {
    if (!this.scene.input || !this.scene.input.keyboard) return;

    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.keyW = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keySpace = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keyQ = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    this.keyE = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.rightButtonDown()) {
        this.isRightMouseDown = true;
      } else {
        this.isMousePointerDown = true;
      }
    });

    this.scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (!pointer.rightButtonDown()) {
        this.isRightMouseDown = false;
      }
      if (!pointer.leftButtonDown()) {
        this.isMousePointerDown = false;
      }
    });
  }

  public getInputVector(playerX: number, playerY: number): InputVector {
    let moveX = 0;
    let moveY = 0;

    if (this.keyA?.isDown || this.cursors?.left.isDown) moveX -= 1;
    if (this.keyD?.isDown || this.cursors?.right.isDown) moveX += 1;
    if (this.keyW?.isDown || this.cursors?.up.isDown) moveY -= 1;
    if (this.keyS?.isDown || this.cursors?.down.isDown) moveY += 1;

    // Normalize diagonal movement
    if (moveX !== 0 && moveY !== 0) {
      const invSqrt2 = 0.70710678;
      moveX *= invSqrt2;
      moveY *= invSqrt2;
    }

    const pointer = this.scene.input.activePointer;
    const worldPoint = pointer.positionToCamera(this.scene.cameras.main) as Phaser.Math.Vector2;
    const aimWorldX = worldPoint.x;
    const aimWorldY = worldPoint.y;
    const aimAngle = Phaser.Math.Angle.Between(playerX, playerY, aimWorldX, aimWorldY);

    const isAttacking = this.isMousePointerDown || (this.keyQ?.isDown ?? false);
    const isSpecialAttacking = this.isRightMouseDown || (this.keyE?.isDown ?? false);
    const isDashing = (this.keySpace?.isDown ?? false);

    return {
      x: moveX,
      y: moveY,
      aimAngle,
      aimWorldX,
      aimWorldY,
      isAttacking,
      isSpecialAttacking,
      isDashing,
    };
  }
}
