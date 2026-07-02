import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../main';
import { configureHiDpiScene } from '../render/hiDpi';
import {
  loadSettings, saveSettings, type GameSettings,
  DIFFICULTIES, TEXT_SPEEDS, COLORBLIND_MODES,
  type Difficulty, type TextSpeed, type Colorblind
} from '../systems/settings';
import { playSfx } from '../audio/sfx';
import { updateMusicVolume } from '../audio/music';
import { fadeIn, fadeToScene } from './transition';

type VolumeKey = 'masterVolume' | 'musicVolume' | 'sfxVolume';

const DIFFICULTY_LABEL: Record<Difficulty, string> = { leicht: 'Leicht', normal: 'Normal', schwer: 'Schwer' };
const TEXTSPEED_LABEL: Record<TextSpeed, string> = { langsam: 'Langsam', normal: 'Normal', schnell: 'Schnell', sofort: 'Sofort' };
const COLORBLIND_LABEL: Record<Colorblind, string> = { aus: 'Aus', protan: 'Protanopie', deutan: 'Deuteranopie', tritan: 'Tritanopie' };

// Optionsbildschirm: Lautstärken, Zugänglichkeit (Schwierigkeit, Tempo, Kontrast,
// Farbfehlsicht) und Bewegung — jede Änderung wird sofort persistiert.
export class OptionsScene extends Phaser.Scene {
  private settings!: GameSettings;
  private from = 'Title';

  constructor() {
    super('Options');
  }

  create(data: { from?: string }): void {
    configureHiDpiScene(this);
    this.from = data?.from ?? 'Title';
    this.settings = loadSettings(window.localStorage);
    fadeIn(this);

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0c1018);
    this.add.text(GAME_WIDTH / 2, 52, '⚙ Optionen', { fontFamily: 'serif', fontSize: '32px', color: '#e9c56c' }).setOrigin(0.5);

    let y = 102;
    const pitch = 46;
    this.volumeRow('Gesamtlautstärke', 'masterVolume', y); y += pitch;
    this.volumeRow('Musik', 'musicVolume', y); y += pitch;
    this.volumeRow('Soundeffekte', 'sfxVolume', y); y += pitch;

    this.cycleRow('Schwierigkeit', y, () => DIFFICULTY_LABEL[this.settings.difficulty], (dir) => {
      this.settings.difficulty = cycle(DIFFICULTIES, this.settings.difficulty, dir);
    }); y += pitch;
    this.cycleRow('Textgeschwindigkeit', y, () => TEXTSPEED_LABEL[this.settings.textSpeed], (dir) => {
      this.settings.textSpeed = cycle(TEXT_SPEEDS, this.settings.textSpeed, dir);
    }); y += pitch;
    this.toggleRow('Reduzierte Bewegung', y, () => this.settings.reducedMotion, (v) => { this.settings.reducedMotion = v; }); y += pitch;
    this.toggleRow('Hoher Kontrast', y, () => this.settings.highContrast, (v) => { this.settings.highContrast = v; }); y += pitch;
    this.cycleRow('Farbfehlsicht', y, () => COLORBLIND_LABEL[this.settings.colorblind], (dir) => {
      this.settings.colorblind = cycle(COLORBLIND_MODES, this.settings.colorblind, dir);
    });

    this.button(GAME_WIDTH / 2 - 90, GAME_HEIGHT - 34, '↩ Zurück', () => {
      playSfx('cancel');
      fadeToScene(this, this.from);
    });
  }

  private persist(): void {
    saveSettings(window.localStorage, this.settings);
    updateMusicVolume();
    playSfx('select');
  }

  private rowLabel(label: string, y: number): void {
    this.add.text(GAME_WIDTH / 2 - 280, y, label, { fontFamily: 'sans-serif', fontSize: '17px', color: '#cdd8ea' }).setOrigin(0, 0.5);
  }

  private volumeRow(label: string, key: VolumeKey, y: number): void {
    const cx = GAME_WIDTH / 2;
    this.rowLabel(label, y);
    const valueText = this.add.text(cx + 150, y, this.pct(this.settings[key]), { fontFamily: 'sans-serif', fontSize: '17px', color: '#9fe8ff' }).setOrigin(0.5);
    const step = (delta: number) => {
      this.settings[key] = Math.min(1, Math.max(0, Math.round((this.settings[key] + delta) * 10) / 10));
      valueText.setText(this.pct(this.settings[key]));
      this.persist();
    };
    this.squareButton(cx + 70, y, '−', () => step(-0.1));
    this.squareButton(cx + 240, y, '+', () => step(0.1));
  }

  private cycleRow(label: string, y: number, value: () => string, change: (dir: number) => void): void {
    const cx = GAME_WIDTH / 2;
    this.rowLabel(label, y);
    const valueText = this.add.text(cx + 150, y, value(), { fontFamily: 'sans-serif', fontSize: '17px', color: '#9fe8ff' }).setOrigin(0.5);
    const apply = (dir: number) => { change(dir); valueText.setText(value()); this.persist(); };
    this.squareButton(cx + 70, y, '◀', () => apply(-1));
    this.squareButton(cx + 240, y, '▶', () => apply(1));
  }

  private toggleRow(label: string, y: number, get: () => boolean, set: (v: boolean) => void): void {
    const cx = GAME_WIDTH / 2;
    this.rowLabel(label, y);
    const txt = this.add.text(cx + 150, y, this.onOff(get()), { fontFamily: 'sans-serif', fontSize: '17px', color: '#9fe8ff' }).setOrigin(0.5);
    this.squareButton(cx + 70, y, '⇄', () => { set(!get()); txt.setText(this.onOff(get())); this.persist(); });
  }

  private pct(v: number): string { return Math.round(v * 100) + '%'; }
  private onOff(b: boolean): string { return b ? 'An' : 'Aus'; }

  private squareButton(x: number, y: number, label: string, cb: () => void): void {
    const bg = this.add.rectangle(x, y, 38, 38, 0x1b2940, 0.95).setStrokeStyle(1, 0x68d7ff, 0.6).setInteractive();
    this.add.text(x, y, label, { fontFamily: 'sans-serif', fontSize: '18px', color: '#e9eef7' }).setOrigin(0.5);
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

function cycle<T>(options: readonly T[], current: T, dir: number): T {
  const i = options.indexOf(current);
  const n = options.length;
  return options[(((i < 0 ? 0 : i) + dir) % n + n) % n]!;
}
