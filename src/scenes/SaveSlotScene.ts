import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../main';
import { configureHiDpiScene } from '../render/hiDpi';
import {
  createNewSave,
  listSaveSlots,
  resetSave,
  setActiveSlot,
  slotSaveKey,
  writeSave,
  type SaveSlotInfo
} from '../systems/save';
import { getChapterBanner } from '../systems/chapterBanner';
import { playSfx } from '../audio/sfx';
import { fadeIn, fadeToScene } from './transition';
import { portraitKey } from '../render/portraitAtlas';
import { addUiPortraitFrame } from '../render/uiSkin';
import type { PortraitKind } from '../render/artSpec';

// Phase 90 — Speicherstand-Auswahl: pro Slot Fortsetzen / Neues Spiel / Löschen.
// Der gewählte Slot wird aktiv gesetzt; alle Spielszenen speichern/laden dann dorthin.
export class SaveSlotScene extends Phaser.Scene {
  private layer!: Phaser.GameObjects.Container;

  constructor() {
    super('SaveSlots');
  }

  create(): void {
    configureHiDpiScene(this);
    fadeIn(this);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0c1018);
    this.add.text(GAME_WIDTH / 2, 48, '🗂 Speicherstände', {
      fontFamily: 'serif',
      fontSize: '32px',
      color: '#e9c56c'
    }).setOrigin(0.5);
    this.layer = this.add.container(0, 0);
    this.render();
  }

  private render(): void {
    this.layer.removeAll(true);
    const slots = listSaveSlots(window.localStorage);
    const cardWidth = 640;
    const cardHeight = 108;
    const x = GAME_WIDTH / 2 - cardWidth / 2;
    slots.forEach((info, index) => {
      this.slotCard(x, 96 + index * (cardHeight + 16), cardWidth, cardHeight, info);
    });
    // Persistente Aktionen im Layer neu zeichnen (der Layer wird bei jedem render geleert).
    this.button(GAME_WIDTH / 2, GAME_HEIGHT - 34, 180, '↩ Zurück', () => {
      playSfx('cancel');
      fadeToScene(this, 'Title');
    });
  }

  private slotCard(x: number, y: number, w: number, h: number, info: SaveSlotInfo): void {
    this.layer.add(
      this.add.rectangle(x, y, w, h, 0x141d2c, 0.96).setOrigin(0, 0).setStrokeStyle(1, 0x3a5578, 0.9)
    );
    this.layer.add(this.add.text(x + 16, y + 14, `Slot ${info.slot}`, {
      fontFamily: 'sans-serif', fontSize: '16px', fontStyle: 'bold', color: '#9fe8ff'
    }));

    if (info.save) {
      const banner = getChapterBanner(info.save);
      const lead = info.save.party.active[0];
      const leadText = lead ? `${lead.name} · Lv ${lead.level}` : 'Party unbekannt';
      const leadPortrait = lead ? portraitKey(lead.characterId as PortraitKind) : null;
      if (leadPortrait && this.textures.exists(leadPortrait)) {
        this.layer.add(addUiPortraitFrame(this, x + 40, y + 66, 44));
        this.layer.add(this.add.image(x + 40, y + 66, leadPortrait).setDisplaySize(44, 44));
      }
      this.layer.add(this.add.text(x + 76, y + 40, `${banner.kicker}: ${banner.line}`, {
        fontFamily: 'sans-serif', fontSize: '15px', color: '#e9eef7'
      }));
      this.layer.add(this.add.text(x + 76, y + 64, `${leadText}  ·  ${formatDate(info.save.updatedAt)}`, {
        fontFamily: 'sans-serif', fontSize: '13px', color: '#9fb2cc'
      }));
      this.button(x + w - 300, y + h / 2, 130, '▶ Fortsetzen', () => this.continueSlot(info.slot));
      this.button(x + w - 150, y + h / 2, 130, '🗑 Löschen', () => this.confirmDelete(info.slot), 0x3a1d24, 0xd98a8a);
    } else {
      this.layer.add(this.add.text(x + 16, y + 52, 'Leer', {
        fontFamily: 'sans-serif', fontSize: '15px', color: '#6f8098'
      }));
      this.button(x + w - 170, y + h / 2, 150, '✚ Neues Spiel', () => this.newGame(info.slot));
    }
  }

  private continueSlot(slot: number): void {
    playSfx('confirm');
    setActiveSlot(window.localStorage, slot);
    fadeToScene(this, 'Overworld');
  }

  private newGame(slot: number): void {
    playSfx('confirm');
    writeSave(window.localStorage, createNewSave(), slotSaveKey(slot));
    setActiveSlot(window.localStorage, slot);
    fadeToScene(this, 'Overworld');
  }

  private confirmDelete(slot: number): void {
    playSfx('select');
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    const overlay = this.add.container(0, 0).setDepth(100);
    overlay.add(this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x05070c, 0.82).setInteractive());
    overlay.add(this.add.rectangle(cx, cy, 460, 200, 0x141d2c, 1).setStrokeStyle(1, 0x3a5578, 0.9));
    overlay.add(this.add.text(cx, cy - 56, `Slot ${slot} wirklich löschen?`, {
      fontFamily: 'sans-serif', fontSize: '19px', fontStyle: 'bold', color: '#e9eef7'
    }).setOrigin(0.5));
    overlay.add(this.add.text(cx, cy - 22, 'Dieser Speicherstand geht unwiderruflich verloren.', {
      fontFamily: 'sans-serif', fontSize: '14px', color: '#c6a0a0'
    }).setOrigin(0.5));
    const mkBtn = (dx: number, label: string, cb: () => void, fill: number, stroke: number): void => {
      const b = this.add.rectangle(cx + dx, cy + 44, 180, 44, fill, 1).setStrokeStyle(1, stroke, 0.8).setInteractive();
      const t = this.add.text(cx + dx, cy + 44, label, { fontFamily: 'sans-serif', fontSize: '16px', color: '#e9eef7' }).setOrigin(0.5);
      b.on('pointerdown', cb);
      overlay.add(b);
      overlay.add(t);
    };
    mkBtn(-100, '↩ Abbrechen', () => { playSfx('cancel'); overlay.destroy(); }, 0x1b2940, 0x68d7ff);
    mkBtn(100, '🗑 Löschen', () => {
      playSfx('confirm');
      resetSave(window.localStorage, slotSaveKey(slot));
      overlay.destroy();
      this.render();
    }, 0x3a1d24, 0xd98a8a);
  }

  private button(x: number, y: number, w: number, label: string, cb: () => void, fill = 0x1b2940, stroke = 0x68d7ff): void {
    const bg = this.add.rectangle(x, y, w, 40, fill, 0.95).setStrokeStyle(1, stroke, 0.6).setInteractive();
    const txt = this.add.text(x, y, label, { fontFamily: 'sans-serif', fontSize: '15px', color: '#e9eef7' }).setOrigin(0.5);
    bg.on('pointerover', () => bg.setFillStyle(fill === 0x1b2940 ? 0x274062 : 0x4a2530, 1));
    bg.on('pointerout', () => bg.setFillStyle(fill, 0.95));
    bg.on('pointerdown', cb);
    this.layer.add(bg);
    this.layer.add(txt);
  }
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' });
}
