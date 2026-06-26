import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../main';

// Platzhalter-Titelbildschirm: Tippen/Taste startet die Oberwelt.
export class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create(): void {
    const cx = GAME_WIDTH / 2;

    this.add.text(cx, GAME_HEIGHT / 2 - 40, 'Tempest – Chronik', {
      fontFamily: 'serif', fontSize: '44px', color: '#e9c56c'
    }).setOrigin(0.5);

    this.add.text(cx, GAME_HEIGHT / 2 + 14, 'Ein JRPG der Tempest-Welt', {
      fontFamily: 'sans-serif', fontSize: '18px', color: '#9fb2cc'
    }).setOrigin(0.5);

    const hint = this.add.text(cx, GAME_HEIGHT / 2 + 70, 'Tippen oder Taste drücken zum Starten', {
      fontFamily: 'sans-serif', fontSize: '16px', color: '#5d7090'
    }).setOrigin(0.5);
    this.tweens.add({ targets: hint, alpha: 0.3, duration: 900, yoyo: true, repeat: -1 });

    const start = () => this.scene.start('Overworld');
    this.input.once('pointerdown', start);
    this.input.keyboard?.once('keydown', start);
  }
}
