import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../main';
import { generatePlaceholderTextures } from '../render/placeholderArt';
// Echte CC0-Kacheln (Kenney „Tiny Town", CC0 — siehe ASSETS.md). Vite liefert die
// korrekte (gehashte, base-bewusste) URL; Phaser lädt sie als Textur.
import grassUrl from '../assets/tiles/grass.png';
import wallUrl from '../assets/tiles/wall.png';
import pathUrl from '../assets/tiles/path.png';

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

    // Echte CC0-Kacheln laden (Kenney Tiny Town).
    this.load.image('tile-grass', grassUrl);
    this.load.image('tile-wall', wallUrl);
    this.load.image('tile-path', pathUrl);
  }

  create(): void {
    // Prozedurale Platzhalter-Texturen (ph-<kind>) erzeugen — global verfügbar,
    // bis echte CC0-Assets eingepflegt sind. Szenen nutzen sie mit Rechteck-Fallback.
    generatePlaceholderTextures(this);
    this.scene.start('Title');
  }
}
