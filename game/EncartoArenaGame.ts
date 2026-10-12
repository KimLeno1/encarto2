import Phaser from 'phaser';
import { ArenaCombatScene } from './scenes/ArenaCombatScene.ts';
import { PlayerHUDState, DEFAULT_ARENA_CONFIG, GameMode } from './config/arenaConfig.ts';
import { BotDifficulty } from './ai/botConfig.ts';
import { AudioManager } from './audio/audioManager.ts';

export interface GameLaunchOptions {
  mode?: GameMode;
  difficulty?: BotDifficulty;
  botCount?: number;
}

export class EncartoArenaGame {
  private game: Phaser.Game | null = null;
  private scene: ArenaCombatScene | null = null;
  public audioManager: AudioManager;

  constructor() {
    this.audioManager = new AudioManager();
  }

  public init(
    container: HTMLElement,
    onHUDUpdate: (hud: PlayerHUDState) => void,
    options?: GameLaunchOptions
  ): Phaser.Game {
    if (this.game) {
      this.destroy();
    }

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: container,
      width: DEFAULT_ARENA_CONFIG.width,
      height: DEFAULT_ARENA_CONFIG.height,
      backgroundColor: '#05070e',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: [ArenaCombatScene],
    };

    this.game = new Phaser.Game(config);

    // Pass data into the scene when ready
    this.game.events.once('ready', () => {
      this.scene = this.game?.scene.getScene('ArenaCombatScene') as ArenaCombatScene;
      if (this.scene) {
        this.scene.scene.restart({
          mode: options?.mode || 'BOT_DUEL',
          difficulty: options?.difficulty || 'NORMAL',
          botCount: options?.botCount || 1,
          onHUDUpdate,
          audioManager: this.audioManager,
        });
      }
    });

    return this.game;
  }

  public restart(mode?: GameMode, difficulty?: BotDifficulty, botCount?: number) {
    if (this.scene) {
      this.scene.restartGame(mode, difficulty, botCount);
    }
  }

  public toggleMute(): boolean {
    return this.audioManager.toggleMute();
  }

  public isMuted(): boolean {
    return this.audioManager.getMuted();
  }

  public destroy() {
    if (this.game) {
      this.game.destroy(true);
      this.game = null;
      this.scene = null;
    }
  }
}
