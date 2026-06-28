import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../main';
import { createNewSave, loadSave } from '../systems/save';
import { createWorldState, getActiveEnding } from '../systems/world';
import { playSfx } from '../audio/sfx';

// Abschlussbildschirm nach Act 3: zeigt das gewählte Ende (Freiheit/Ordnung/
// Wahres Ende). Wird einmalig aus der Overworld-Szene ausgelöst, wenn ein
// `ending.*`-Flag gesetzt ist; Titel/Text kommen aus denselben Codex-Einträgen.
export class EndingScene extends Phaser.Scene {
  constructor() {
    super('Ending');
  }

  create(): void {
    const cx = GAME_WIDTH / 2;
    const save = loadSave(window.localStorage) ?? createNewSave();
    const ending = getActiveEnding(createWorldState(save));

    this.add.rectangle(cx, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x05070c, 0.97);
    this.add.text(cx, 78, 'Tempest – Chronik', { fontFamily: 'serif', fontSize: '22px', color: '#9fb2cc' }).setOrigin(0.5);
    this.add.text(cx, 112, 'Akt I – III · Ende', { fontFamily: 'sans-serif', fontSize: '13px', color: '#6f83a5' }).setOrigin(0.5);

    this.add.text(cx, 192, ending?.title ?? 'Ende', {
      fontFamily: 'serif', fontSize: '38px', color: '#e9c56c'
    }).setOrigin(0.5);
    this.add.text(cx, 300, ending?.body ?? 'Die Geschichte von Tempest findet ihren Abschluss.', {
      fontFamily: 'sans-serif', fontSize: '17px', color: '#e9eef7',
      align: 'center', wordWrap: { width: GAME_WIDTH - 200 }, lineSpacing: 6
    }).setOrigin(0.5);

    const button = this.add.rectangle(cx, 452, 260, 46, 0x1b2940, 1).setStrokeStyle(1, 0xe9c56c, 0.7).setInteractive();
    this.add.text(cx, 452, 'Weiterspielen', { fontFamily: 'sans-serif', fontSize: '18px', color: '#e9eef7' }).setOrigin(0.5);
    button.on('pointerover', () => button.setFillStyle(0x274062, 1));
    button.on('pointerout', () => button.setFillStyle(0x1b2940, 1));
    button.on('pointerdown', () => { playSfx('confirm'); this.close(); });
    this.input.keyboard?.on('keydown-ESC', () => this.close());
  }

  private close(): void {
    this.scene.resume('Overworld');
    this.scene.stop();
  }
}
