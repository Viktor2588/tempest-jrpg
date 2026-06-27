import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../main';
import {
  applyWorldState,
  chooseDialogOption,
  createWorldState,
  getDialogView,
  startDialogForNpc,
  type DialogView
} from '../systems/world';
import { autoSave, createNewSave, loadSave, type SaveGameV2 } from '../systems/save';
import { loadSettings, textCharDelayMs } from '../systems/settings';

export class DialogueScene extends Phaser.Scene {
  private save!: SaveGameV2;
  private view!: DialogView;
  private layer!: Phaser.GameObjects.Container;
  private bodyText?: Phaser.GameObjects.Text;
  private fullText = '';
  private revealEvent?: Phaser.Time.TimerEvent;

  constructor() {
    super('Dialogue');
  }

  create(data: { npcId?: string; dialogId?: string; nodeId?: string }): void {
    this.save = loadSave(window.localStorage) ?? createNewSave();
    const world = createWorldState(this.save);
    this.view = data.npcId
      ? startDialogForNpc(world, data.npcId)
      : getDialogView(world, data.dialogId ?? 'rigurd-intro', data.nodeId ?? 'start');

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x05070d, 0.64);
    this.layer = this.add.container(0, 0);
    this.input.keyboard?.on('keydown-ESC', () => this.close());
    // Tippen/Klicken vervollständigt den laufenden Schreibmaschineneffekt sofort.
    this.input.on('pointerdown', () => this.completeReveal());
    this.refresh();
  }

  // Schreibmaschineneffekt sofort beenden (zeigt den ganzen Text).
  private completeReveal(): void {
    if (this.revealEvent) {
      this.revealEvent.remove();
      this.revealEvent = undefined;
      this.bodyText?.setText(this.fullText);
    }
  }

  private refresh(): void {
    this.layer.removeAll(true);
    const settings = loadSettings(window.localStorage);
    const hc = settings.highContrast;
    this.panel(70, 315, GAME_WIDTH - 140, 180);
    this.layer.add(this.add.text(94, 250, this.view.speaker, {
      fontFamily: 'serif',
      fontSize: '24px',
      color: hc ? '#ffffff' : '#e9c56c'
    }));

    // Schreibmaschineneffekt nach Textgeschwindigkeit; „sofort"/reduzierte Bewegung = ganzer Text.
    this.revealEvent?.remove();
    this.revealEvent = undefined;
    this.fullText = this.view.text;
    this.bodyText = this.add.text(94, 292, '', {
      fontFamily: 'sans-serif',
      fontSize: '16px',
      color: hc ? '#ffffff' : '#e9eef7',
      wordWrap: { width: GAME_WIDTH - 188 }
    });
    this.layer.add(this.bodyText);
    const delay = settings.reducedMotion ? 0 : textCharDelayMs(settings);
    if (delay <= 0) {
      this.bodyText.setText(this.fullText);
    } else {
      let shown = 0;
      this.revealEvent = this.time.addEvent({
        delay,
        loop: true,
        callback: () => {
          shown += 1;
          this.bodyText?.setText(this.fullText.slice(0, shown));
          if (shown >= this.fullText.length) { this.revealEvent?.remove(); this.revealEvent = undefined; }
        }
      });
    }

    this.view.choices.forEach((choice, index) => {
      this.button(94 + index * 250, 432, 230, choice.label, () => this.choose(choice.id));
    });
    if (this.view.choices.length === 0) {
      this.button(94, 432, 230, 'Weiter', () => this.close());
    }
  }

  private choose(choiceId: string): void {
    const result = chooseDialogOption(
      createWorldState(this.save),
      this.view.dialogId,
      this.view.nodeId,
      choiceId
    );
    this.save = applyWorldState(this.save, result.state.world);
    autoSave(window.localStorage, this.save);

    if (!result.ok || !result.state.next) {
      this.close();
      return;
    }

    this.view = result.state.next;
    this.refresh();
  }

  private close(): void {
    this.scene.resume('Overworld');
    this.scene.stop();
  }

  private panel(x: number, y: number, width: number, height: number): void {
    this.layer.add(this.add.rectangle(x, y, width, height, 0x121b2a, 0.95)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0x33445f, 0.9));
  }

  private button(x: number, y: number, width: number, label: string, callback: () => void): void {
    const bg = this.add.rectangle(x, y, width, 44, 0x1b2940, 0.98)
      .setOrigin(0, 0.5)
      .setStrokeStyle(1, 0x68d7ff, 0.65)
      .setInteractive();
    const text = this.add.text(x + 12, y, label, {
      fontFamily: 'sans-serif',
      fontSize: '14px',
      color: '#e9eef7'
    }).setOrigin(0, 0.5);
    bg.on('pointerover', () => bg.setFillStyle(0x274062, 1));
    bg.on('pointerout', () => bg.setFillStyle(0x1b2940, 0.98));
    bg.on('pointerdown', callback);
    this.layer.add(bg);
    this.layer.add(text);
  }
}
