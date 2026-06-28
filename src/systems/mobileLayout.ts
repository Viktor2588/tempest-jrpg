import type { Dir } from './overworld';

export interface Rect {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface DpadButtonLayout extends Rect {
  readonly dir: Dir;
  readonly label: string;
}

export interface OverworldHudLayout {
  readonly buttons: {
    readonly menu: Rect;
    readonly interact: Rect;
  };
  readonly dpad: readonly DpadButtonLayout[];
}

export interface HudLayoutIssue {
  readonly path: string;
  readonly message: string;
}

export interface ViewportSize {
  readonly width: number;
  readonly height: number;
}

export const MIN_TOUCH_TARGET_PX = 44;
export const HUD_SAFE_MARGIN_PX = 8;

const ACTION_BUTTON_WIDTH = 150;
const ACTION_BUTTON_HEIGHT = 44;
const ACTION_BUTTON_RIGHT_INSET = 86;
const DPAD_BUTTON_SIZE = 52;
const DPAD_OFFSET = 56;

export function layoutOverworldHud(viewport: ViewportSize): OverworldHudLayout {
  const rightX = viewport.width - ACTION_BUTTON_RIGHT_INSET;
  const dpadGroupHalfSize = DPAD_OFFSET + DPAD_BUTTON_SIZE / 2;
  const dpadBaseX = HUD_SAFE_MARGIN_PX + dpadGroupHalfSize;
  const dpadBaseY = viewport.height - HUD_SAFE_MARGIN_PX - dpadGroupHalfSize;

  return {
    buttons: {
      // Menü unter der Minimap (oben rechts); Interaktion unten rechts gegenüber dem
      // Steuerkreuz (gut mit dem Daumen erreichbar). Kein Demo-„Kampf"-Knopf mehr.
      menu: {
        id: 'menu',
        x: rightX,
        y: 150,
        width: ACTION_BUTTON_WIDTH,
        height: ACTION_BUTTON_HEIGHT
      },
      interact: {
        id: 'interact',
        x: rightX,
        y: viewport.height - HUD_SAFE_MARGIN_PX - ACTION_BUTTON_HEIGHT / 2,
        width: ACTION_BUTTON_WIDTH,
        height: ACTION_BUTTON_HEIGHT
      }
    },
    dpad: [
      { id: 'dpad-up', dir: 'up', label: '▲', x: dpadBaseX, y: dpadBaseY - DPAD_OFFSET, width: DPAD_BUTTON_SIZE, height: DPAD_BUTTON_SIZE },
      { id: 'dpad-down', dir: 'down', label: '▼', x: dpadBaseX, y: dpadBaseY + DPAD_OFFSET, width: DPAD_BUTTON_SIZE, height: DPAD_BUTTON_SIZE },
      { id: 'dpad-left', dir: 'left', label: '◀', x: dpadBaseX - DPAD_OFFSET, y: dpadBaseY, width: DPAD_BUTTON_SIZE, height: DPAD_BUTTON_SIZE },
      { id: 'dpad-right', dir: 'right', label: '▶', x: dpadBaseX + DPAD_OFFSET, y: dpadBaseY, width: DPAD_BUTTON_SIZE, height: DPAD_BUTTON_SIZE }
    ]
  };
}

export function analyzeHudLayout(
  layout: OverworldHudLayout,
  viewport: ViewportSize,
  minTouchTarget = MIN_TOUCH_TARGET_PX
): HudLayoutIssue[] {
  const issues: HudLayoutIssue[] = [];
  const rects = allHudRects(layout);

  for (const rect of rects) {
    if (rect.width < minTouchTarget || rect.height < minTouchTarget) {
      issues.push({
        path: `hud.${rect.id}.touchTarget`,
        message: `Touch-Ziel ist kleiner als ${minTouchTarget}px.`
      });
    }
    if (!rectInsideViewport(rect, viewport, HUD_SAFE_MARGIN_PX)) {
      issues.push({
        path: `hud.${rect.id}.bounds`,
        message: 'HUD-Element liegt außerhalb des sicheren Viewports.'
      });
    }
  }

  for (let i = 0; i < rects.length; i += 1) {
    for (let j = i + 1; j < rects.length; j += 1) {
      const a = rects[i]!;
      const b = rects[j]!;
      if (overlaps(a, b)) {
        issues.push({
          path: `hud.${a.id}.${b.id}`,
          message: 'HUD-Touch-Ziele überlappen.'
        });
      }
    }
  }

  return issues;
}

export function allHudRects(layout: OverworldHudLayout): readonly Rect[] {
  return [
    layout.buttons.menu,
    layout.buttons.interact,
    ...layout.dpad
  ];
}

function rectInsideViewport(rect: Rect, viewport: ViewportSize, margin: number): boolean {
  const left = rect.x - rect.width / 2;
  const right = rect.x + rect.width / 2;
  const top = rect.y - rect.height / 2;
  const bottom = rect.y + rect.height / 2;
  return left >= margin
    && top >= margin
    && right <= viewport.width - margin
    && bottom <= viewport.height - margin;
}

function overlaps(a: Rect, b: Rect): boolean {
  return Math.abs(a.x - b.x) * 2 < a.width + b.width
    && Math.abs(a.y - b.y) * 2 < a.height + b.height;
}
