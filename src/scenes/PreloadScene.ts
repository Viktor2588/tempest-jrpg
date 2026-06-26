import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../main';

// Lädt globale Assets mit Fortschrittsbalken. (Noch keine echten Assets — Phase 0.)
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  preload(): void {
    const barW = 280;
    const x = (GAME_WIDTH - barW) / 2;
    const y = GAME_HEIGHT / 2;

    const frame = this.add.rectangle(GAME_WIDTH / 2, y, barW + 6, 22).setStrokeStyle(2, 0x4a5876);
    const fill = this.add.rectangle(x, y, 1, 14, 0x68d7ff).setOrigin(0, 0.5);
    this.add.text(GAME_WIDTH / 2, y - 30, 'Lade …', { fontFamily: 'sans-serif', fontSize: '16px', color: '#cbd6e8' }).setOrigin(0.5);

    this.load.on('progress', (p: number) => { fill.width = barW * p; });
    this.load.on('complete', () => { frame.destroy(); fill.destroy(); });

    // Platzhalter, damit der Loader einen Tick durchläuft (Phase 1 ersetzt das durch echte Assets).
    this.load.image('__noop__', 'data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=');
  }

  create(): void {
    this.scene.start('Title');
  }
}
