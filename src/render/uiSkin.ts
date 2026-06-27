// Phaser-Renderer für den prozeduralen UI-Skin. Die Farben kommen aus
// artSpec.ts, damit Menü/Dialoge denselben Stil wie Tiles/Sprites/VFX nutzen.
import Phaser from 'phaser';
import { uiSkinSpec, type UiSkinKind } from './artSpec';

function hex(color: string): number {
  return Phaser.Display.Color.HexStringToColor(color).color;
}

export function uiColor(color: string): number {
  return hex(color);
}

export function addUiPanel(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  options: {
    readonly originY?: 0 | 0.5;
    readonly alpha?: number;
    readonly skin?: UiSkinKind;
  } = {}
): Phaser.GameObjects.Container {
  const skin = uiSkinSpec(options.skin ?? 'panel');
  const alpha = options.alpha ?? 0.94;
  const top = options.originY === 0.5 ? -height / 2 : 0;
  const container = scene.add.container(x, y);

  const shadow = scene.add.rectangle(4, top + 5, width, height, hex(skin.shadow), 0.35)
    .setOrigin(0, 0);
  const base = scene.add.rectangle(0, top, width, height, hex(skin.base), alpha)
    .setOrigin(0, 0)
    .setStrokeStyle(2, hex(skin.outline), 0.9);
  const topLine = scene.add.rectangle(3, top + 3, width - 6, 2, hex(skin.highlight), 0.55)
    .setOrigin(0, 0);
  const accent = scene.add.rectangle(3, top + height - 5, width - 6, 2, hex(skin.accent), 0.85)
    .setOrigin(0, 0);

  container.add([shadow, base, topLine, accent]);
  return container;
}

export function addUiButtonBackground(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  fill?: number,
  skinKind: UiSkinKind = 'button'
): Phaser.GameObjects.Rectangle {
  const skin = uiSkinSpec(skinKind);
  return scene.add.rectangle(x, y, width, height, fill ?? hex(skin.base), 0.97)
    .setOrigin(0, 0.5)
    .setStrokeStyle(2, hex(skin.outline), 0.72)
    .setInteractive();
}

export function addUiPortraitFrame(
  scene: Phaser.Scene,
  x: number,
  y: number,
  size: number
): Phaser.GameObjects.Container {
  const skin = uiSkinSpec('panel');
  const container = scene.add.container(x, y);
  const outer = scene.add.rectangle(0, 0, size + 8, size + 8, hex(skin.shadow), 0.92)
    .setStrokeStyle(2, hex(skin.outline), 0.95);
  const inner = scene.add.rectangle(0, 0, size + 2, size + 2, hex(skin.base), 0.88)
    .setStrokeStyle(1, hex(skin.accent), 0.85);
  container.add([outer, inner]);
  return container;
}
