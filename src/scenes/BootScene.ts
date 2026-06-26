import Phaser from 'phaser';

// Frühe Initialisierung (Skalierung/Input-Grundeinstellungen), dann weiter zum Preload.
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create(): void {
    this.scale.refresh();
    this.scene.start('Preload');
  }
}
