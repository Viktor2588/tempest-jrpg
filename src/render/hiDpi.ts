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

// Fixe HUD-Elemente (setScrollFactor(0)) unter Kamera-Zoom mit Ursprung 0.5
// landen um diesen Betrag nach links-oben verschoben; wer solche Elemente in
// einer folgenden Kamera (Overworld) nutzt, muss sie hierum versetzen.
export function hudZoomOffset(scale = GAME_RENDER_SCALE): { readonly x: number; readonly y: number } {
  return {
    x: (LOGICAL_GAME_WIDTH * (scale - 1)) / 2,
    y: (LOGICAL_GAME_HEIGHT * (scale - 1)) / 2
  };
}

export function configureHiDpiScene(
  scene: Phaser.Scene,
  scale = GAME_RENDER_SCALE
): void {
  const cam = scene.cameras.main;
  cam.setZoom(scale);
  // Backing-Größe ist logical×scale. Bei Ursprung 0.5 (Default) zoomt die Kamera
  // um die Backing-Mitte und schöbe alle Inhalte um die halbe Logikbreite nach
  // links-oben (auf HiDPI, scale>1). Ursprung (0,0) mappt logische Koordinaten
  // [0..logical] linear auf den Backing-Store [0..logical*scale] – korrekt für
  // scrollende UND fixierte Inhalte. Kameras mit Bounds/Follow (Overworld) setzen
  // den Ursprung danach zurück auf 0.5, weil Phasers clampX/Follow das annehmen.
  cam.setOrigin(0, 0);
  installHiDpiTextFactory(scene, scale);
}
