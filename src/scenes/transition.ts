import Phaser from 'phaser';
import { loadSettings } from '../systems/settings';

const FADE_MS = 240;

function reduced(): boolean {
  return typeof window !== 'undefined' && loadSettings(window.localStorage).reducedMotion;
}

/** Sanfter Szenenwechsel per Kamera-Fade (sofort, wenn „reduzierte Bewegung"). */
export function fadeToScene(scene: Phaser.Scene, target: string, data?: object): void {
  if (reduced()) { scene.scene.start(target, data); return; }
  const cam = scene.cameras.main;
  cam.once('camerafadeoutcomplete', () => scene.scene.start(target, data));
  cam.fadeOut(FADE_MS, 0, 0, 0);
}

/** Beim Betreten einer Szene aufrufen, um sanft einzublenden. */
export function fadeIn(scene: Phaser.Scene): void {
  if (reduced()) return;
  scene.cameras.main.fadeIn(FADE_MS, 0, 0, 0);
}

/** Markanter Begegnungs-Übergang in den Kampf: kurzer Blitz + Shake + Fade. */
export function battleWipe(scene: Phaser.Scene, target: string, data?: object): void {
  if (reduced()) { scene.scene.start(target, data); return; }
  const cam = scene.cameras.main;
  cam.flash(120, 255, 255, 255);
  cam.shake(180, 0.008);
  cam.once('camerafadeoutcomplete', () => scene.scene.start(target, data));
  scene.time.delayedCall(170, () => cam.fadeOut(200, 0, 0, 0));
}
