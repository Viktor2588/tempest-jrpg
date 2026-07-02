import Phaser from 'phaser';
import { configureHiDpiScene } from '../render/hiDpi';

// Frühe Initialisierung (Skalierung/Input-Grundeinstellungen), dann weiter zum Preload.
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create(): void {
    configureHiDpiScene(this);
    this.scale.refresh();
    this.scene.start('Preload');
  }
}
