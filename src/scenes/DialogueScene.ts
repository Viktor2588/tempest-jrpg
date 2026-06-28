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
import { portraitKeyForSpeaker } from '../render/portraitAtlas';
import { addUiPanel, addUiPortraitFrame, addUiTextButton } from '../render/uiSkin';

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
    this.panel(70, 230, GAME_WIDTH - 140, 265);
    const textX = this.drawPortrait(this.view.speaker, 126, 314, 64) ? 180 : 94;
    this.layer.add(this.add.text(textX, 250, this.view.speaker, {
      fontFamily: 'serif',
      fontSize: '24px',
      color: hc ? '#ffffff' : '#e9c56c'
    }));

    // Schreibmaschineneffekt nach Textgeschwindigkeit; „sofort"/reduzierte Bewegung = ganzer Text.
    this.revealEvent?.remove();
    this.revealEvent = undefined;
    this.fullText = this.view.text;
    this.bodyText = this.add.text(textX, 292, '', {
      fontFamily: 'sans-serif',
      fontSize: '16px',
      color: hc ? '#ffffff' : '#e9eef7',
      wordWrap: { width: GAME_WIDTH - textX - 90 }
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

    // 2-Spalten-Raster: bis zu vier gefilterte Optionen bleiben sichtbar und klickbar
    // (die frühere horizontale Reihe lief bei 3–4 Optionen aus dem Bild).
    this.view.choices.forEach((choice, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      this.button(94 + col * 410, 398 + row * 48, 384, choice.label, () => this.choose(choice.id));
    });
    if (this.view.choices.length === 0) {
      this.button(94, 398, 384, 'Weiter', () => this.close());
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
    this.layer.add(addUiPanel(this, x, y, width, height, { originY: 0, alpha: 0.96 }));
  }

  private button(x: number, y: number, width: number, label: string, callback: () => void): void {
    this.layer.add(addUiTextButton(this, x, y, width, label, callback, {
      idleAlpha: 0.98
    }));
  }

  private drawPortrait(speaker: string, x: number, y: number, size: number): boolean {
    const key = portraitKeyForSpeaker(speaker);
    if (!key || !this.textures.exists(key)) {
      return false;
    }
    this.layer.add(addUiPortraitFrame(this, x, y, size));
    this.layer.add(this.add.image(x, y, key).setDisplaySize(size, size));
    return true;
  }
}
