import type Phaser from 'phaser';

export const LOGICAL_GAME_WIDTH = 960;
export const LOGICAL_GAME_HEIGHT = 540;
export const MAX_RENDER_SCALE = 2;

export function resolveRenderScale(
  devicePixelRatio: number | undefined,
  maxScale = MAX_RENDER_SCALE
): number {
  if (!Number.isFinite(devicePixelRatio) || !devicePixelRatio || devicePixelRatio <= 1) return 1;
  return Math.min(devicePixelRatio, Math.max(1, maxScale));
}

export function renderBackingSize(
  logicalWidth: number,
  logicalHeight: number,
  scale: number
): { readonly width: number; readonly height: number } {
  return {
    width: Math.round(logicalWidth * scale),
    height: Math.round(logicalHeight * scale)
  };
}

export const GAME_RENDER_SCALE = resolveRenderScale(
  typeof window === 'undefined' ? 1 : window.devicePixelRatio
);

export const GAME_BACKING_SIZE = renderBackingSize(
  LOGICAL_GAME_WIDTH,
  LOGICAL_GAME_HEIGHT,
  GAME_RENDER_SCALE
);

export function withHiDpiTextStyle(
  style: Phaser.Types.GameObjects.Text.TextStyle = {},
  scale = GAME_RENDER_SCALE
): Phaser.Types.GameObjects.Text.TextStyle {
  return {
    ...style,
    resolution: style.resolution && style.resolution > 0 ? style.resolution : scale
  };
}

const HI_DPI_FACTORY_MARKER = Symbol('tempest-hi-dpi-text-factory');

type HiDpiTextFactory = Phaser.GameObjects.GameObjectFactory & {
  [HI_DPI_FACTORY_MARKER]?: true;
};

export function installHiDpiTextFactory(
  scene: Phaser.Scene,
  scale = GAME_RENDER_SCALE
): void {
  const factory = scene.add as HiDpiTextFactory;
  if (factory[HI_DPI_FACTORY_MARKER]) return;

  const originalText = factory.text;
  factory.text = function (
    x: number,
    y: number,
    text: string | string[],
    style?: Phaser.Types.GameObjects.Text.TextStyle
  ): Phaser.GameObjects.Text {
    return originalText.call(this, x, y, text, withHiDpiTextStyle(style, scale));
  };
  factory[HI_DPI_FACTORY_MARKER] = true;
}

export function configureHiDpiScene(
  scene: Phaser.Scene,
  scale = GAME_RENDER_SCALE
): void {
  scene.cameras.main.setZoom(scale);
  installHiDpiTextFactory(scene, scale);
}
