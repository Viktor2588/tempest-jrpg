// Phaser-Renderer für den prozeduralen UI-Skin. Die Farben kommen aus
// artSpec.ts, damit Menü/Dialoge denselben Stil wie Tiles/Sprites/VFX nutzen.
import Phaser from 'phaser';
import { uiSkinSpec, type UiSkinKind } from './artSpec';
import { hexColor } from './color';

export interface UiTextButtonOptions {
  readonly height?: number;
  readonly fill?: number;
  readonly hoverFill?: number;
  readonly idleAlpha?: number;
  readonly fontSize?: string;
  readonly textColor?: string;
  readonly textOffsetX?: number;
  readonly skinKind?: UiSkinKind;
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

  const shadow = scene.add.rectangle(4, top + 5, width, height, hexColor(skin.shadow), 0.35)
    .setOrigin(0, 0);
  const base = scene.add.rectangle(0, top, width, height, hexColor(skin.base), alpha)
    .setOrigin(0, 0)
    .setStrokeStyle(2, hexColor(skin.outline), 0.9);
  const topLine = scene.add.rectangle(3, top + 3, width - 6, 2, hexColor(skin.highlight), 0.55)
    .setOrigin(0, 0);
  const accent = scene.add.rectangle(3, top + height - 5, width - 6, 2, hexColor(skin.accent), 0.85)
    .setOrigin(0, 0);

  container.add([shadow, base, topLine, accent]);
  return container;
}

function addUiButtonBackground(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  fill?: number,
  skinKind: UiSkinKind = 'button'
): Phaser.GameObjects.Rectangle {
  const skin = uiSkinSpec(skinKind);
  return scene.add.rectangle(x, y, width, height, fill ?? hexColor(skin.base), 0.97)
    .setOrigin(0, 0.5)
    .setStrokeStyle(2, hexColor(skin.outline), 0.72)
    .setInteractive();
}

export function addUiTextButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  label: string,
  callback: () => void,
  options: UiTextButtonOptions = {}
): Phaser.GameObjects.Container {
  const skinKind = options.skinKind ?? 'button';
  const skin = uiSkinSpec(skinKind);
  const height = options.height ?? 44;
  const idleFill = options.fill ?? hexColor(skin.base);
  const hoverFill = options.hoverFill ?? 0x274062;
  const idleAlpha = options.idleAlpha ?? 0.97;
  const textOffsetX = options.textOffsetX ?? 12;

  const container = scene.add.container(x, y);
  const background = addUiButtonBackground(scene, 0, 0, width, height, idleFill, skinKind)
    .setFillStyle(idleFill, idleAlpha);
  const text = scene.add.text(textOffsetX, 0, label, {
    fontFamily: 'sans-serif',
    fontSize: options.fontSize ?? '14px',
    color: options.textColor ?? '#e9eef7'
  }).setOrigin(0, 0.5);

  background.on('pointerover', () => background.setFillStyle(hoverFill, 1));
  background.on('pointerout', () => background.setFillStyle(idleFill, idleAlpha));
  background.on('pointerdown', callback);
  container.add([background, text]);
  return container;
}

export function addUiPortraitFrame(
  scene: Phaser.Scene,
  x: number,
  y: number,
  size: number
): Phaser.GameObjects.Container {
  const skin = uiSkinSpec('panel');
  const container = scene.add.container(x, y);
  const outer = scene.add.rectangle(0, 0, size + 8, size + 8, hexColor(skin.shadow), 0.92)
    .setStrokeStyle(2, hexColor(skin.outline), 0.95);
  const inner = scene.add.rectangle(0, 0, size + 2, size + 2, hexColor(skin.base), 0.88)
    .setStrokeStyle(1, hexColor(skin.accent), 0.85);
  container.add([outer, inner]);
  return container;
}
