import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../main';
import { makeRng } from '../systems/rng';

// Platzhalter-Titelbildschirm (Phase 0): zeigt, dass Rendering + Eingabe laufen.
export class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create(): void {
    const cx = GAME_WIDTH / 2;

    this.add.text(cx, GAME_HEIGHT / 2 - 40, 'Tempest – Chronik', {
      fontFamily: 'serif', fontSize: '44px', color: '#e9c56c'
    }).setOrigin(0.5);

    this.add.text(cx, GAME_HEIGHT / 2 + 14, 'Phase 0 – Gerüst läuft', {
      fontFamily: 'sans-serif', fontSize: '18px', color: '#9fb2cc'
    }).setOrigin(0.5);

    const hint = this.add.text(cx, GAME_HEIGHT / 2 + 70, 'Tippen oder Taste drücken', {
      fontFamily: 'sans-serif', fontSize: '16px', color: '#5d7090'
    }).setOrigin(0.5);

    // Eingabe-Smoke-Test: Tap/Taste wechselt deterministisch die Hinweisfarbe.
    const rng = makeRng(1);
    const react = () => {
      const c = Phaser.Display.Color.HSVToRGB(rng(), 0.5, 1) as Phaser.Types.Display.ColorObject;
      hint.setColor(Phaser.Display.Color.RGBToString(c.r, c.g, c.b));
    };
    this.input.on('pointerdown', react);
    this.input.keyboard?.on('keydown', react);
  }
}
