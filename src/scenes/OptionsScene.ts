import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../main';
import { loadSettings, saveSettings, type GameSettings } from '../systems/settings';
import { playSfx } from '../audio/sfx';
import { fadeIn, fadeToScene } from './transition';

type VolumeKey = 'masterVolume' | 'musicVolume' | 'sfxVolume';

// Optionsbildschirm: Lautstärken, reduzierte Bewegung — sofort persistiert.
export class OptionsScene extends Phaser.Scene {
  private settings!: GameSettings;
  private from = 'Title';

  constructor() {
    super('Options');
  }

  create(data: { from?: string }): void {
    this.from = data?.from ?? 'Title';
    this.settings = loadSettings(window.localStorage);
    fadeIn(this);

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0c1018);
    this.add.text(GAME_WIDTH / 2, 70, '⚙ Optionen', { fontFamily: 'serif', fontSize: '34px', color: '#e9c56c' }).setOrigin(0.5);

    const rows: Array<[string, VolumeKey]> = [
      ['Gesamtlautstärke', 'masterVolume'],
      ['Musik', 'musicVolume'],
      ['Soundeffekte', 'sfxVolume']
    ];
    rows.forEach(([label, key], i) => this.volumeRow(label, key, 150 + i * 60));

    this.toggleRow('Reduzierte Bewegung', 200 + rows.length * 60);

    this.button(GAME_WIDTH / 2 - 90, GAME_HEIGHT - 70, '↩ Zurück', () => {
      playSfx('cancel');
      fadeToScene(this, this.from);
    });
  }

  private persist(): void {
    saveSettings(window.localStorage, this.settings);
  }

  private volumeRow(label: string, key: VolumeKey, y: number): void {
    const cx = GAME_WIDTH / 2;
    this.add.text(cx - 260, y, label, { fontFamily: 'sans-serif', fontSize: '18px', color: '#cdd8ea' }).setOrigin(0, 0.5);
    const valueText = this.add.text(cx + 150, y, this.pct(this.settings[key]), { fontFamily: 'sans-serif', fontSize: '18px', color: '#9fe8ff' }).setOrigin(0.5);

    const step = (delta: number) => {
      this.settings[key] = Math.min(1, Math.max(0, Math.round((this.settings[key] + delta) * 10) / 10));
      valueText.setText(this.pct(this.settings[key]));
      this.persist();
      playSfx('select');
    };
    this.squareButton(cx + 60, y, '−', () => step(-0.1));
    this.squareButton(cx + 240, y, '+', () => step(0.1));
    // einfacher Balken
    this.add.rectangle(cx + 150, y + 20, 120, 6, 0x10151f).setOrigin(0.5);
    const fill = this.add.rectangle(cx + 150 - 60, y + 20, 120 * this.settings[key], 6, 0x53d98b).setOrigin(0, 0.5);
    this.events.on('update', () => { fill.width = 120 * this.settings[key]; });
  }

  private toggleRow(label: string, y: number): void {
    const cx = GAME_WIDTH / 2;
    this.add.text(cx - 260, y, label, { fontFamily: 'sans-serif', fontSize: '18px', color: '#cdd8ea' }).setOrigin(0, 0.5);
    const txt = this.add.text(cx + 150, y, this.onOff(this.settings.reducedMotion), { fontFamily: 'sans-serif', fontSize: '18px', color: '#9fe8ff' }).setOrigin(0.5);
    this.squareButton(cx + 60, y, '⇄', () => {
      this.settings.reducedMotion = !this.settings.reducedMotion;
      txt.setText(this.onOff(this.settings.reducedMotion));
      this.persist();
      playSfx('select');
    });
  }

  private pct(v: number): string { return Math.round(v * 100) + '%'; }
  private onOff(b: boolean): string { return b ? 'An' : 'Aus'; }

  private squareButton(x: number, y: number, label: string, cb: () => void): void {
    const bg = this.add.rectangle(x, y, 40, 40, 0x1b2940, 0.95).setStrokeStyle(1, 0x68d7ff, 0.6).setInteractive();
    this.add.text(x, y, label, { fontFamily: 'sans-serif', fontSize: '20px', color: '#e9eef7' }).setOrigin(0.5);
    bg.on('pointerover', () => bg.setFillStyle(0x274062, 1));
    bg.on('pointerout', () => bg.setFillStyle(0x1b2940, 0.95));
    bg.on('pointerdown', cb);
  }

  private button(x: number, y: number, label: string, cb: () => void): void {
    const bg = this.add.rectangle(x, y, 180, 40, 0x1b2940, 0.95).setOrigin(0, 0.5).setStrokeStyle(1, 0x68d7ff, 0.6).setInteractive();
    this.add.text(x + 16, y, label, { fontFamily: 'sans-serif', fontSize: '16px', color: '#e9eef7' }).setOrigin(0, 0.5);
    bg.on('pointerover', () => bg.setFillStyle(0x274062, 1));
    bg.on('pointerout', () => bg.setFillStyle(0x1b2940, 0.95));
    bg.on('pointerdown', cb);
  }
}
