import Phaser from 'phaser';
import { playSfx } from '../audio/sfx';
import { GAME_HEIGHT, GAME_WIDTH } from '../main';
import { PARTY_BATTLE_ART } from '../render/battleArt';
import { configureHiDpiScene } from '../render/hiDpi';
import { addUiPanel, addUiTextButton } from '../render/uiSkin';
import { addInventoryItem } from '../systems/inventory';
import { getRangaJourneyDiscovery } from '../systems/rangaJourney';
import { autoSave, loadSave, type SaveLocation } from '../systems/save';
import { loadSettings } from '../systems/settings';

interface RangaJourneyData {
  readonly destinationId?: string;
  readonly destinationName?: string;
  readonly location?: SaveLocation;
}

export class RangaJourneyScene extends Phaser.Scene {
  private destinationId = '';
  private destinationName = '';
  private destination: SaveLocation | null = null;
  private finished = false;

  constructor() {
    super('RangaJourney');
  }

  create(data: RangaJourneyData): void {
    configureHiDpiScene(this);
    this.destinationId = data.destinationId ?? '';
    this.destinationName = data.destinationName ?? '';
    this.destination = data.location ?? null;
    this.finished = false;

    if (!this.destination || !this.destinationId) {
      this.finish();
      return;
    }

    const save = loadSave(window.localStorage);
    const discovery = save
      ? getRangaJourneyDiscovery(save.flags, this.destinationId)
      : null;
    const reducedMotion = loadSettings(window.localStorage).reducedMotion;

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x071019, 1);
    for (let index = 0; index < 9; index += 1) {
      const y = 92 + index * 42;
      const line = this.add.rectangle(GAME_WIDTH / 2, y, 560 - index * 24, 2, 0x68d7ff, 0.18);
      if (!reducedMotion) {
        this.tweens.add({
          targets: line,
          x: GAME_WIDTH / 2 + (index % 2 === 0 ? 110 : -110),
          alpha: { from: 0.08, to: 0.32 },
          duration: 520 + index * 35,
          yoyo: true,
          repeat: -1
        });
      }
    }

    const ranga = this.textures.exists(PARTY_BATTLE_ART.ranga)
      ? this.add.image(reducedMotion ? 250 : -120, 290, PARTY_BATTLE_ART.ranga).setDisplaySize(290, 290)
      : this.add.circle(reducedMotion ? 250 : -120, 290, 90, 0x3a4760);
    if (!reducedMotion) {
      this.tweens.add({ targets: ranga, x: 250, duration: 620, ease: 'Cubic.Out' });
    }

    addUiPanel(this, 430, 110, 450, 330, { originY: 0 });
    this.add.text(655, 142, 'RANGAS SCHNELLREISE', {
      fontFamily: 'sans-serif',
      fontSize: '13px',
      color: '#68d7ff'
    }).setOrigin(0.5);
    this.add.text(655, 180, this.destinationName, {
      fontFamily: 'serif',
      fontSize: '28px',
      color: '#e9eef7'
    }).setOrigin(0.5);

    if (discovery) {
      this.add.text(655, 230, discovery.title, {
        fontFamily: 'sans-serif',
        fontSize: '18px',
        color: '#e9c56c'
      }).setOrigin(0.5);
      this.add.text(655, 270, discovery.body, {
        fontFamily: 'sans-serif',
        fontSize: '13px',
        color: '#cbd6e8',
        align: 'center',
        wordWrap: { width: 370 }
      }).setOrigin(0.5);

      addUiTextButton(this, 470, 360, 180, `Spur untersuchen`, () => {
        this.claimDiscovery(discovery);
      }, { height: 46, fill: 0x284b42, fontSize: '13px' });
      addUiTextButton(this, 670, 360, 170, 'Weiterreisen', () => this.finish(), {
        height: 46,
        fill: 0x1b2940,
        fontSize: '13px'
      });
    } else {
      this.add.text(655, 254, 'Ranga hält die sichere Route offen.', {
        fontFamily: 'sans-serif',
        fontSize: '15px',
        color: '#cbd6e8'
      }).setOrigin(0.5);
      addUiTextButton(this, 560, 340, 190, 'Am Ziel ankommen', () => this.finish(), {
        height: 46,
        fill: 0x1b2940,
        fontSize: '14px'
      });
    }

    this.input.keyboard?.once('keydown-ESC', () => this.finish());
    this.input.keyboard?.once('keydown-ENTER', () => this.finish());
    playSfx('confirm');
  }

  private claimDiscovery(discovery: NonNullable<ReturnType<typeof getRangaJourneyDiscovery>>): void {
    const save = loadSave(window.localStorage);
    if (save && !save.flags[discovery.flag]) {
      autoSave(window.localStorage, {
        ...save,
        flags: { ...save.flags, [discovery.flag]: true },
        inventory: {
          stacks: addInventoryItem(save.inventory.stacks, discovery.rewardItemId, 1)
        }
      });
      playSfx('victory');
    }
    this.finish();
  }

  private finish(): void {
    if (this.finished) return;
    this.finished = true;
    const save = loadSave(window.localStorage);
    if (save && this.destination) {
      autoSave(window.localStorage, { ...save, location: this.destination });
    }
    this.scene.start('Overworld');
  }
}
