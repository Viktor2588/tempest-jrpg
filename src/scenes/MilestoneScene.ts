import Phaser from 'phaser';
import { playSfx } from '../audio/sfx';
import { GAME_HEIGHT, GAME_WIDTH } from '../main';
import { configureHiDpiScene } from '../render/hiDpi';
import { PARTY_BATTLE_ART } from '../render/battleArt';
import { getMilestoneById, type MilestoneTone } from '../systems/milestones';
import { addUiPanel, addUiTextButton } from '../render/uiSkin';
import { fadeIn } from './transition';

const TONE_COLORS: Readonly<Record<MilestoneTone, number>> = {
  bond: 0x68d7ff,
  battle: 0xff8aa0,
  chapter: 0xe9c56c
};

export class MilestoneScene extends Phaser.Scene {
  constructor() {
    super('Milestone');
  }

  create(data: { milestoneId?: string }): void {
    configureHiDpiScene(this);
    const milestone = getMilestoneById(data?.milestoneId ?? '');
    if (!milestone) {
      this.close();
      return;
    }

    const accent = TONE_COLORS[milestone.tone];
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x05070c, 0.82);
    addUiPanel(this, 140, GAME_HEIGHT / 2, 680, 360, { originY: 0.5 });
    this.add.rectangle(GAME_WIDTH / 2, 114, 680, 5, accent, 0.95);
    const joinArtKey = milestone.id === 'gobta-joins'
      ? PARTY_BATTLE_ART.gobta
      : milestone.id === 'ranga-joins'
        ? PARTY_BATTLE_ART.ranga
        : null;
    if (joinArtKey && this.textures.exists(joinArtKey)) {
      this.add.image(742, 338, joinArtKey).setDisplaySize(150, 150);
    }

    this.add.text(GAME_WIDTH / 2, 142, milestone.kicker.toUpperCase(), {
      fontFamily: 'sans-serif',
      fontSize: '14px',
      color: colorHex(accent)
    }).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, 184, milestone.title, {
      fontFamily: 'serif',
      fontSize: '30px',
      color: '#e9eef7'
    }).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, 236, milestone.body, {
      fontFamily: 'sans-serif',
      fontSize: '15px',
      color: '#cbd6e8',
      align: 'center',
      wordWrap: { width: 570 }
    }).setOrigin(0.5);

    milestone.highlights.slice(0, 3).forEach((highlight, index) => {
      this.add.text(248, 298 + index * 28, `◆ ${highlight}`, {
        fontFamily: 'sans-serif',
        fontSize: '14px',
        color: index === 0 ? colorHex(accent) : '#cdeaff'
      });
    });

    addUiTextButton(
      this,
      GAME_WIDTH / 2 - 110,
      404,
      220,
      milestone.tone === 'chapter' ? 'Weiter zum nächsten Kapitel' : 'Weiter',
      () => this.close(),
      { height: 46, fill: 0x1b2940, idleAlpha: 1, fontSize: '15px', textOffsetX: 12 }
    );

    this.input.keyboard?.once('keydown-SPACE', () => this.close());
    this.input.keyboard?.once('keydown-ENTER', () => this.close());
    this.input.keyboard?.once('keydown-ESC', () => this.close());
    playSfx(milestone.tone === 'battle' || milestone.tone === 'chapter' ? 'victory' : 'confirm');
    fadeIn(this);
  }

  private close(): void {
    if (this.scene.isPaused('Overworld')) this.scene.resume('Overworld');
    this.scene.stop();
  }
}

function colorHex(color: number): string {
  return `#${color.toString(16).padStart(6, '0')}`;
}
