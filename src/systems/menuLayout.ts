import {
  analyzeRects,
  HUD_SAFE_MARGIN_PX,
  type HudLayoutIssue,
  type Rect
} from './mobileLayout';

// Layout-Validierung für die Menüseiten — dieselbe HudLayoutIssue-Logik wie beim
// Overworld-HUD, hier auf die dynamischen Zeilenlisten der MenuScene ausgeweitet.
// Ziel: Listen laufen nicht unter den 960×540-Canvas hinaus und Spalten
// überlappen nicht. Die MenuScene positioniert aus denselben Konstanten, damit
// Test und Darstellung nicht auseinanderlaufen.

export const MENU_VIEWPORT = { width: 960, height: 540 } as const;
export const MENU_LIST_BOTTOM = MENU_VIEWPORT.height - HUD_SAFE_MARGIN_PX;
export const MENU_PAGER_HEIGHT = 44;

export const MENU_TAB_ROW = {
  y: 94,
  buttonWidth: 104,
  buttonGap: 8
} as const;

export const MENU_PARTY_LAYOUT = (() => {
  const activeWidth = 370;
  const reserveWidth = 190;
  const gap = 40;
  const left = (MENU_VIEWPORT.width - activeWidth - gap - reserveWidth) / 2;
  return {
    titleX: MENU_VIEWPORT.width / 2,
    titleY: 124,
    headingY: 150,
    active: {
      left,
      width: activeWidth,
      firstY: 208,
      rowHeight: 96,
      cardHeight: 82
    },
    reserve: {
      left: left + activeWidth + gap,
      width: reserveWidth,
      firstY: 208,
      rowHeight: 54,
      emptyY: 196,
      footnoteY: 512
    }
  };
})();

function centeredRowLeft(count: number, width: number, gap: number): number {
  return (MENU_VIEWPORT.width - (count * width + Math.max(0, count - 1) * gap)) / 2;
}

export function menuTabButtonX(index: number, count: number): number {
  return centeredRowLeft(count, MENU_TAB_ROW.buttonWidth, MENU_TAB_ROW.buttonGap)
    + index * (MENU_TAB_ROW.buttonWidth + MENU_TAB_ROW.buttonGap);
}

export function menuTabRowBounds(count: number): { left: number; right: number; centerX: number } {
  const left = centeredRowLeft(count, MENU_TAB_ROW.buttonWidth, MENU_TAB_ROW.buttonGap);
  const width = count * MENU_TAB_ROW.buttonWidth + Math.max(0, count - 1) * MENU_TAB_ROW.buttonGap;
  return { left, right: left + width, centerX: left + width / 2 };
}

export function menuPartyBounds(): { left: number; right: number; centerX: number } {
  const left = MENU_PARTY_LAYOUT.active.left;
  const right = MENU_PARTY_LAYOUT.reserve.left + MENU_PARTY_LAYOUT.reserve.width;
  return { left, right, centerX: (left + right) / 2 };
}

export interface MenuListColumn {
  readonly id: string;
  readonly left: number; // linke Kante (Buttons/Text sind links verankert)
  readonly top: number; // Oberkante der ersten Zeile
  readonly width: number;
  readonly rowHeight: number;
}

// Anker der scrollbaren Zeilenlisten je Seite. Reihenfolge/Werte spiegeln die
// Zeichenaufrufe der MenuScene.
export const MENU_LIST_COLUMNS = {
  inventoryItems: { id: 'inventory.items', left: 300, top: 160, width: 260, rowHeight: 48 },
  equipUsable: { id: 'equipment.usable', left: 620, top: 160, width: 260, rowHeight: 48 },
  statusSkills: { id: 'status.skills', left: 300, top: 306, width: 380, rowHeight: 32 },
  statusBindings: { id: 'status.bindings', left: 710, top: 306, width: 230, rowHeight: 50 },
  growthNodes: { id: 'growth.nodes', left: 300, top: 196, width: 230, rowHeight: 46 },
  travelPoints: { id: 'travel.points', left: 300, top: 258, width: 238, rowHeight: 44 }
} as const satisfies Record<string, MenuListColumn>;

export function menuListCapacity(
  column: MenuListColumn,
  bottom = MENU_LIST_BOTTOM,
  footerHeight = 0
): number {
  const lastCenter = bottom - footerHeight - column.rowHeight / 2;
  return Math.max(0, Math.floor((lastCenter - column.top) / column.rowHeight) + 1);
}

export interface MenuListPage {
  readonly page: number;
  readonly pageCount: number;
  readonly start: number;
  readonly visible: number;
}

export function paginateMenuList(
  total: number,
  column: MenuListColumn,
  requestedPage: number,
  bottom = MENU_LIST_BOTTOM
): MenuListPage {
  const capacity = menuListCapacity(column, bottom);
  if (total <= capacity) {
    return { page: 0, pageCount: 1, start: 0, visible: total };
  }
  const pageSize = Math.max(1, menuListCapacity(column, bottom, MENU_PAGER_HEIGHT));
  const pageCount = Math.ceil(total / pageSize);
  const page = Math.min(Math.max(0, requestedPage), pageCount - 1);
  const start = page * pageSize;
  return { page, pageCount, start, visible: Math.min(pageSize, total - start) };
}

// Center-Origin-Rechtecke einer Spalte (zum Prüfen via analyzeRects).
export function menuListRects(column: MenuListColumn, count: number): Rect[] {
  const rects: Rect[] = [];
  for (let index = 0; index < count; index += 1) {
    rects.push({
      id: `${column.id}.${index}`,
      x: column.left + column.width / 2,
      y: column.top + index * column.rowHeight,
      width: column.width,
      height: column.rowHeight
    });
  }
  return rects;
}

// Prüft mehrere gleichzeitig sichtbare Spalten einer Seite auf Überlauf und
// Spaltenüberlappung. `counts` ist die (bereits gedeckelte) Zeilenzahl je Spalte.
export function analyzeMenuColumns(
  columns: readonly MenuListColumn[],
  counts: readonly number[]
): HudLayoutIssue[] {
  const rects = columns.flatMap((column, index) => menuListRects(column, counts[index] ?? 0));
  return analyzeRects(rects, MENU_VIEWPORT, 0);
}
