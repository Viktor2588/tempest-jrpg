import Phaser from 'phaser';
import { playSfx } from '../audio/sfx';
import { GAME_HEIGHT, GAME_WIDTH } from '../main';
import { configureHiDpiScene } from '../render/hiDpi';
import { fadeIn } from './transition';
import { addUiPanel, addUiTextButton } from '../render/uiSkin';
import { addInventoryItem } from '../systems/inventory';
import { getMapDiscoveryAt } from '../systems/mapDiscovery';
import { autoSave, loadSave } from '../systems/save';

interface DiscoveryData {
  readonly mapId?: string;
  readonly x?: number;
  readonly y?: number;
}

// Modal-Overlay über der pausierten Oberwelt: zeigt eine Fundstelle (Lore),
// vergibt einmalig Belohnung + Flag und kehrt zurück. Spiegelt das
// RangaJourney-/Milestone-Muster.
export class DiscoveryScene extends Phaser.Scene {
  constructor() {
    super('Discovery');
  }

  create(data: DiscoveryData): void {
    configureHiDpiScene(this);
    const save = loadSave(window.localStorage);
    const discovery = save && data.mapId !== undefined && data.x !== undefined && data.y !== undefined
      ? getMapDiscoveryAt(data.mapId, data.x, data.y, save.flags)
      : null;
    if (!discovery) {
      this.close();
      return;
    }

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x05070d, 0.55);
    addUiPanel(this, GAME_WIDTH / 2 - 280, GAME_HEIGHT / 2, 560, 240, { originY: 0.5 });

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 88, 'ENTDECKUNG', {
      fontFamily: 'sans-serif', fontSize: '13px', color: '#e9c56c'
    }).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 56, discovery.title, {
      fontFamily: 'serif', fontSize: '26px', color: '#e9eef7'
    }).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 10, discovery.body, {
      fontFamily: 'sans-serif', fontSize: '14px', color: '#cbd6e8', align: 'center', wordWrap: { width: 480 }
    }).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 38, `Fund: ${discovery.rewardLabel}`, {
      fontFamily: 'sans-serif', fontSize: '15px', color: '#8affc1'
    }).setOrigin(0.5);

    addUiTextButton(
      this,
      GAME_WIDTH / 2 - 110,
      GAME_HEIGHT / 2 + 82,
      220,
      `${discovery.rewardLabel} nehmen`,
      () => this.claim(discovery.flag, discovery.rewardItemId),
      { height: 46, fill: 0x284b42, idleAlpha: 1, fontSize: '14px', textOffsetX: 12 }
    );

    this.input.keyboard?.once('keydown-SPACE', () => this.claim(discovery.flag, discovery.rewardItemId));
    this.input.keyboard?.once('keydown-ENTER', () => this.claim(discovery.flag, discovery.rewardItemId));
    this.input.keyboard?.once('keydown-ESC', () => this.close());
    playSfx('confirm');
    fadeIn(this);
  }

  private claim(flag: string, rewardItemId: string): void {
    const save = loadSave(window.localStorage);
    if (save && !save.flags[flag]) {
      autoSave(window.localStorage, {
        ...save,
        flags: { ...save.flags, [flag]: true },
        inventory: { stacks: addInventoryItem(save.inventory.stacks, rewardItemId, 1) }
      });
      playSfx('victory');
    }
    this.close();
  }

  private close(): void {
    if (this.scene.isPaused('Overworld')) this.scene.resume('Overworld');
    this.scene.stop();
  }
}
