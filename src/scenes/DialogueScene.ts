import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../main';
import { configureHiDpiScene } from '../render/hiDpi';
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
import { buildStoryMoment, type StoryMomentView } from '../systems/storyMoment';
import { playSfx, type SfxName } from '../audio/sfx';
import { portraitKeyForSpeaker } from '../render/portraitAtlas';
import { addUiPanel, addUiPortraitFrame, addUiTextButton } from '../render/uiSkin';

export class DialogueScene extends Phaser.Scene {
  private save!: SaveGameV2;
  private view!: DialogView;
  private layer!: Phaser.GameObjects.Container;
  private bodyText?: Phaser.GameObjects.Text;
  private fullText = '';
  private revealEvent?: Phaser.Time.TimerEvent;
  private selectedIndex = 0;  // Phase 119: keyboard nav selection

  constructor() {
    super('Dialogue');
  }

  create(data: { npcId?: string; dialogId?: string; nodeId?: string }): void {
    configureHiDpiScene(this);
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
    // Phase 119: Tastatur-Navigation (Pfeile, Leertaste/Enter)
    this.setupKeyboardNavigation();
    this.refresh();
  }

  // Phase 119: setup arrow keys + space/enter for choice selection (default "weiter")
  private setupKeyboardNavigation(): void {
    const kb = this.input.keyboard;
    if (!kb) return;
    kb.on('keydown-LEFT', () => this.moveSelection(-1));
    kb.on('keydown-RIGHT', () => this.moveSelection(1));
    kb.on('keydown-UP', () => this.moveSelection(-2));
    kb.on('keydown-DOWN', () => this.moveSelection(2));
    kb.on('keydown-SPACE', () => this.chooseSelected());
    kb.on('keydown-ENTER', () => this.chooseSelected());
    // ensure initial selection points to "weiter" if present
    this.selectedIndex = 0;
  }

  private moveSelection(delta: number): void {
    const n = this.view.choices.length || 1;
    this.selectedIndex = (this.selectedIndex + delta + n) % n;
    this.refresh();
  }

  private chooseSelected(): void {
    if (this.view.choices.length === 0) {
      this.close();
      return;
    }
    const clamped = Math.max(0, Math.min(this.selectedIndex, this.view.choices.length - 1));
    const choice = this.view.choices[clamped];
    if (choice) this.choose(choice.id);
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
    if (this.view.choices.length > 0) {
      this.selectedIndex = Math.min(this.selectedIndex, this.view.choices.length - 1);
    } else {
      this.selectedIndex = 0;
    }
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
    // Phase 119: highlight selected for keyboard nav (default to "weiter" first if present)
    const nChoices = this.view.choices.length;
    if (nChoices > 0) {
      // ensure selected is valid
      if (this.selectedIndex >= nChoices) this.selectedIndex = 0;
      // prefer "weiter" as initial if present on first render with choices
      if (this.selectedIndex === 0 && nChoices > 1) {
        const weiterIdx = this.view.choices.findIndex(c => /weiter/i.test(c.label));
        if (weiterIdx >= 0) this.selectedIndex = weiterIdx;
      }
    }
    this.view.choices.forEach((choice, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const isSelected = index === this.selectedIndex;
      this.button(94 + col * 410, 398 + row * 48, 384, choice.label, () => this.choose(choice.id), isSelected);
    });
    if (this.view.choices.length === 0) {
      this.button(94, 398, 384, 'Weiter', () => this.close(), true);
    }
  }

  private choose(choiceId: string): void {
    const choice = this.view.choices.find((candidate) => candidate.id === choiceId);
    const result = chooseDialogOption(
      createWorldState(this.save),
      this.view.dialogId,
      this.view.nodeId,
      choiceId
    );
    this.save = applyWorldState(this.save, result.state.world);
    autoSave(window.localStorage, this.save);
    playSfx(this.sfxForChoice(choice));

    const continueAfterMoment = (): void => {
      if (!result.ok || !result.state.next) {
        this.close();
        return;
      }

      this.view = result.state.next;
      this.refresh();
    };
    const moment = buildStoryMoment(choice?.effects);
    if (moment) {
      this.showStoryMoment(moment, continueAfterMoment);
      return;
    }
    continueAfterMoment();
  }

  private sfxForChoice(choice: DialogView['choices'][number] | undefined): SfxName {
    const moment = buildStoryMoment(choice?.effects);
    if (moment?.tone === 'quest' || moment?.tone === 'recruit') return 'victory';
    if (moment?.tone === 'rest') return 'heal';
    if (moment?.tone === 'bond') return 'magic';
    const effects = choice?.effects ?? [];
    if (effects.some((effect) => effect.type === 'complete-quest')) return 'victory';
    if (effects.some((effect) =>
      effect.type === 'set-flag'
      && effect.flag === 'story.council.ready'
      && effect.value
    )) return 'victory';
    if (effects.some((effect) =>
      effect.type === 'set-flag'
      && (
        effect.flag === 'story.storm-dragon.oath'
        || effect.flag === 'story.shuna.ready'
        || effect.flag === 'story.vael.ready'
        || effect.flag.endsWith('.pact')
      )
      && effect.value
    )) return 'magic';
    return 'confirm';
  }

  private showStoryMoment(moment: StoryMomentView, onContinue: () => void): void {
    this.completeReveal();
    const colors: Record<StoryMomentView['tone'], number> = {
      bond: 0x2f385f,
      recruit: 0x1f4a38,
      quest: 0x4d3a1b,
      rest: 0x1f4550
    };
    const overlay = this.add.container(0, 0).setDepth(30);
    const backdrop = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x05070d, 0.44)
      .setInteractive();
    overlay.add(backdrop);
    overlay.add(addUiPanel(this, 180, 124, GAME_WIDTH - 360, 226, { originY: 0, alpha: 0.98 }));
    overlay.add(this.add.rectangle(194, 138, GAME_WIDTH - 388, 4, colors[moment.tone], 0.95).setOrigin(0, 0));
    overlay.add(this.add.text(GAME_WIDTH / 2, 158, moment.title, {
      fontFamily: 'serif',
      fontSize: '28px',
      color: '#e9c56c'
    }).setOrigin(0.5, 0));
    overlay.add(this.add.text(GAME_WIDTH / 2, 212, moment.body, {
      fontFamily: 'sans-serif',
      fontSize: '16px',
      color: '#e9eef7',
      align: 'center',
      wordWrap: { width: GAME_WIDTH - 430 }
    }).setOrigin(0.5, 0));

    let dismissed = false;
    const dismiss = (): void => {
      if (dismissed) return;
      dismissed = true;
      overlay.destroy();
      onContinue();
    };
    overlay.add(addUiTextButton(this, GAME_WIDTH / 2 - 90, 304, 180, 'Weiter', dismiss, {
      idleAlpha: 0.98,
      fill: colors[moment.tone],
      textOffsetX: 54
    }));
    backdrop.on('pointerdown', dismiss);
    this.input.keyboard?.once('keydown-ENTER', dismiss);
    this.input.keyboard?.once('keydown-SPACE', dismiss);
  }

  private close(): void {
    this.scene.resume('Overworld');
    this.scene.stop();
  }

  private panel(x: number, y: number, width: number, height: number): void {
    this.layer.add(addUiPanel(this, x, y, width, height, { originY: 0, alpha: 0.96 }));
  }

  private button(x: number, y: number, width: number, label: string, callback: () => void, isSelected = false): void {
    // Phase 119: visual for keyboard selected (brighter border / hover fill)
    this.layer.add(addUiTextButton(this, x, y, width, label, callback, {
      idleAlpha: isSelected ? 1.0 : 0.98,
      hoverFill: isSelected ? 0x3a6a9a : undefined,
      fill: isSelected ? 0x274062 : undefined
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
