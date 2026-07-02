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
  readonly menu: Rect;
}

export interface OverworldTouchControlsLayout {
  readonly interact: Rect;
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

const MENU_BUTTON_WIDTH = 132;
const MENU_BUTTON_HEIGHT = 44;
const MINIMAP_RIGHT_INSET = 14;
const MINIMAP_TOP = 14;
const MINIMAP_MAX_SIZE = 132;
const REGION_BANNER_HEIGHT = 34;
const MENU_GAP = 40;
const DPAD_BUTTON_SIZE = 52;
const DPAD_OFFSET = 56;

export function layoutOverworldHud(viewport: ViewportSize): OverworldHudLayout {
  const minimapCenterX = viewport.width - MINIMAP_RIGHT_INSET - MINIMAP_MAX_SIZE / 2;
  const menuY = MINIMAP_TOP + MINIMAP_MAX_SIZE + REGION_BANNER_HEIGHT + MENU_GAP + MENU_BUTTON_HEIGHT / 2;
  return {
    menu: {
      id: 'menu',
      x: minimapCenterX,
      y: menuY,
      width: MENU_BUTTON_WIDTH,
      height: MENU_BUTTON_HEIGHT
    }
  };
}

export function layoutOverworldTouchControls(viewport: ViewportSize): OverworldTouchControlsLayout {
  const dpadGroupHalfSize = DPAD_OFFSET + DPAD_BUTTON_SIZE / 2;
  const dpadBaseX = HUD_SAFE_MARGIN_PX + dpadGroupHalfSize;
  const dpadBaseY = viewport.height - HUD_SAFE_MARGIN_PX - dpadGroupHalfSize;
  const interactHalfSize = DPAD_BUTTON_SIZE / 2;

  return {
    interact: {
      id: 'interact',
      x: viewport.width - HUD_SAFE_MARGIN_PX - interactHalfSize,
      y: viewport.height - HUD_SAFE_MARGIN_PX - interactHalfSize,
      width: DPAD_BUTTON_SIZE,
      height: DPAD_BUTTON_SIZE
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
  return analyzeRects(allHudRects(layout), viewport, minTouchTarget);
}

export function analyzeTouchControlLayout(
  layout: OverworldTouchControlsLayout,
  viewport: ViewportSize,
  minTouchTarget = MIN_TOUCH_TARGET_PX
): HudLayoutIssue[] {
  return analyzeRects(allTouchControlRects(layout), viewport, minTouchTarget);
}

export function allHudRects(layout: OverworldHudLayout): readonly Rect[] {
  return [layout.menu];
}

export function allTouchControlRects(layout: OverworldTouchControlsLayout): readonly Rect[] {
  return [layout.interact, ...layout.dpad];
}

export function analyzeRects(
  rects: readonly Rect[],
  viewport: ViewportSize,
  minTouchTarget: number
): HudLayoutIssue[] {
  const issues: HudLayoutIssue[] = [];

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
