import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../main';
import { loadSettings, saveSettings } from '../systems/settings';
import { playSfx, resumeAudio } from '../audio/sfx';
import { playMusic, resumeMusic } from '../audio/music';
import { fadeIn, fadeToScene } from './transition';

// Titelbildschirm: Start, Optionen und einmaliges Onboarding (Tutorial).
export class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create(): void {
    const cx = GAME_WIDTH / 2;
    fadeIn(this);
    playMusic('title');

    this.add.text(cx, 150, 'Tempest – Chronik', { fontFamily: 'serif', fontSize: '44px', color: '#e9c56c' }).setOrigin(0.5);
    this.add.text(cx, 196, 'Ein JRPG der Tempest-Welt', { fontFamily: 'sans-serif', fontSize: '18px', color: '#9fb2cc' }).setOrigin(0.5);

    this.menuButton(cx, 280, '▶ Spiel starten', () => { playSfx('confirm'); fadeToScene(this, 'Overworld'); });
    this.menuButton(cx, 336, '⚙ Optionen', () => { playSfx('select'); fadeToScene(this, 'Options', { from: 'Title' }); });

    // Audio braucht eine Nutzergeste — bei erster Eingabe freischalten.
    const unlockAudio = () => { resumeAudio(); resumeMusic(); };
    this.input.once('pointerdown', unlockAudio);
    this.input.keyboard?.once('keydown', unlockAudio);

    // Einmaliges Tutorial beim ersten Start.
    const settings = loadSettings(window.localStorage);
    if (!settings.seenTutorial) {
      this.showTutorial();
      saveSettings(window.localStorage, { ...settings, seenTutorial: true });
    }
  }

  private menuButton(cx: number, y: number, label: string, cb: () => void): void {
    const bg = this.add.rectangle(cx, y, 240, 44, 0x1b2940, 0.95).setStrokeStyle(1, 0x68d7ff, 0.6).setInteractive();
    this.add.text(cx, y, label, { fontFamily: 'sans-serif', fontSize: '18px', color: '#e9eef7' }).setOrigin(0.5);
    bg.on('pointerover', () => bg.setFillStyle(0x274062, 1));
    bg.on('pointerout', () => bg.setFillStyle(0x1b2940, 0.95));
    bg.on('pointerdown', cb);
  }

  private showTutorial(): void {
    const cx = GAME_WIDTH / 2, cy = GAME_HEIGHT / 2;
    const overlay = this.add.container(0, 0).setDepth(100);
    overlay.add(this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x05070c, 0.82));
    overlay.add(this.add.text(cx, cy - 110, 'Willkommen!', { fontFamily: 'serif', fontSize: '30px', color: '#e9c56c' }).setOrigin(0.5));
    const lines = [
      '🚶 Bewegen: WASD/Pfeiltasten oder das Touch-Steuerkreuz',
      '⚔ Kämpfe: rundenbasiert — Angriff, Magie, Verteidigen, Fliehen',
      '🎯 Schwächen ausnutzen: das richtige Element trifft härter',
      '⚙ Lautstärke & Bewegung jederzeit unter Optionen anpassbar'
    ];
    lines.forEach((l, i) => overlay.add(this.add.text(cx, cy - 50 + i * 30, l, { fontFamily: 'sans-serif', fontSize: '16px', color: '#cdd8ea' }).setOrigin(0.5)));
    const bg = this.add.rectangle(cx, cy + 100, 200, 44, 0x1b2940, 1).setStrokeStyle(1, 0x68d7ff, 0.7).setInteractive();
    overlay.add(bg);
    overlay.add(this.add.text(cx, cy + 100, 'Los geht’s', { fontFamily: 'sans-serif', fontSize: '18px', color: '#e9eef7' }).setOrigin(0.5));
    bg.on('pointerdown', () => { resumeAudio(); resumeMusic(); playSfx('confirm'); overlay.destroy(); });
  }
}
