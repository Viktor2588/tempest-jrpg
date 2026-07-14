import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../main';
import { configureHiDpiScene } from '../render/hiDpi';
import { createNewSave, loadSave, startNewGamePlus, writeSave } from '../systems/save';
import { incrementNewGamePlus, loadProfile, recordEndingSeen, saveProfile } from '../systems/profile';
import { buildEndingGallery, createWorldState, getActiveEnding } from '../systems/world';
import { playSfx } from '../audio/sfx';
import { fadeToScene } from './transition';

// Abschlussbildschirm nach Act 3: zeigt das gewählte Ende (Freiheit/Ordnung/
// Wahres Ende), die Ende-Galerie (welche Enden bereits gesehen wurden) und bietet
// New Game+ an, um die übrigen Enden ohne Komplett-Replay nachzuholen.
export class EndingScene extends Phaser.Scene {
  constructor() {
    super('Ending');
  }

  create(): void {
    configureHiDpiScene(this);
    const cx = GAME_WIDTH / 2;
    const storage = window.localStorage;
    const save = loadSave(storage) ?? createNewSave();
    const ending = getActiveEnding(createWorldState(save));

    // Erreichtes Ende persistent ins Profil aufnehmen (überlebt NG+/neue Spielstände).
    let profile = loadProfile(storage);
    if (ending) profile = saveProfile(storage, recordEndingSeen(profile, ending.kind));

    // Ende-Key-Art je Ausgang; Abdunkelung haelt Text/Galerie lesbar.
    const artKey = ending ? `bg-ending-${ending.kind}` : null;
    if (artKey && this.textures.exists(artKey)) {
      this.add.image(cx, GAME_HEIGHT / 2, artKey).setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
      this.add.rectangle(cx, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x05070c, 0.72);
    } else {
      this.add.rectangle(cx, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x05070c, 0.97);
    }
    this.add.text(cx, 54, 'Tempest – Chronik', { fontFamily: 'serif', fontSize: '20px', color: '#9fb2cc' }).setOrigin(0.5);
    this.add.text(cx, 84, 'Akt I – III · Ende', { fontFamily: 'sans-serif', fontSize: '12px', color: '#6f83a5' }).setOrigin(0.5);

    this.add.text(cx, 138, ending?.title ?? 'Ende', {
      fontFamily: 'serif', fontSize: '32px', color: '#e9c56c'
    }).setOrigin(0.5);
    this.add.text(cx, 210, ending?.body ?? 'Die Geschichte von Tempest findet ihren Abschluss.', {
      fontFamily: 'sans-serif', fontSize: '15px', color: '#e9eef7',
      align: 'center', wordWrap: { width: GAME_WIDTH - 220 }, lineSpacing: 5
    }).setOrigin(0.5);

    // Ende-Galerie: alle drei Enden, ungesehene bleiben verdeckt.
    const gallery = buildEndingGallery(profile.endingsSeen);
    const seenCount = gallery.filter((entry) => entry.seen).length;
    this.add.text(cx, 312, `Ende-Galerie — ${seenCount}/${gallery.length} entdeckt`, {
      fontFamily: 'sans-serif', fontSize: '13px', color: '#9fb2cc'
    }).setOrigin(0.5);
    gallery.forEach((entry, index) => {
      this.add.text(cx, 336 + index * 22, `${entry.seen ? '◈' : '◇'} ${entry.title}`, {
        fontFamily: 'sans-serif', fontSize: '13px',
        color: entry.seen ? '#8dffc2' : '#6f83a5'
      }).setOrigin(0.5);
    });
    if (seenCount === gallery.length) {
      this.add.text(cx, 336 + gallery.length * 22 + 4, '★ Alle Enden entdeckt — Chronist von Tempest ★', {
        fontFamily: 'serif', fontSize: '13px', color: '#e9c56c'
      }).setOrigin(0.5);
    }

    // New Game+ trägt Level/Skills/Ausrüstung/Inventar/Gold/Progression mit.
    this.button(cx - 142, 482, 264, 'Neues Spiel + starten', () => {
      const ngSave = startNewGamePlus(save);
      writeSave(storage, ngSave);
      saveProfile(storage, incrementNewGamePlus(profile));
      playSfx('confirm');
      fadeToScene(this, 'Overworld');
    });
    this.button(cx + 142, 482, 200, 'Weiterspielen', () => { playSfx('confirm'); this.close(); });
    this.input.keyboard?.on('keydown-ESC', () => this.close());
  }

  private button(x: number, y: number, width: number, label: string, onClick: () => void): void {
    const rect = this.add.rectangle(x, y, width, 44, 0x1b2940, 1).setStrokeStyle(1, 0xe9c56c, 0.7).setInteractive();
    this.add.text(x, y, label, { fontFamily: 'sans-serif', fontSize: '16px', color: '#e9eef7' }).setOrigin(0.5);
    rect.on('pointerover', () => rect.setFillStyle(0x274062, 1));
    rect.on('pointerout', () => rect.setFillStyle(0x1b2940, 1));
    rect.on('pointerdown', onClick);
  }

  private close(): void {
    this.scene.resume('Overworld');
    this.scene.stop();
  }
}
