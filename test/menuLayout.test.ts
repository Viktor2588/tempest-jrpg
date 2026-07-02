import { describe, expect, it } from 'vitest';
import { analyzeRects } from '../src/systems/mobileLayout';
import {
  analyzeMenuColumns,
  MENU_LIST_COLUMNS,
  MENU_PARTY_LAYOUT,
  MENU_TAB_ROW,
  MENU_VIEWPORT,
  menuPartyBounds,
  menuListCapacity,
  menuListRects,
  menuTabButtonX,
  menuTabRowBounds,
  paginateMenuList
} from '../src/systems/menuLayout';

const COLUMNS = Object.values(MENU_LIST_COLUMNS);

describe('Phase 59 — Menü-Layout-Validierung (HudLayoutIssue-Muster auf Menüseiten)', () => {
  it('hält jede Seite jeder Liste im 960×540-Canvas und macht jeden Eintrag erreichbar', () => {
    for (const column of COLUMNS) {
      const total = 100;
      const first = paginateMenuList(total, column, 0);
      expect(first.pageCount, column.id).toBeGreaterThan(1); // Überlauf wird geblättert, nicht abgeschnitten

      let covered = 0;
      for (let page = 0; page < first.pageCount; page += 1) {
        const view = paginateMenuList(total, column, page);
        expect(analyzeRects(menuListRects(column, view.visible), MENU_VIEWPORT, 0), `${column.id} p${page}`).toEqual([]);
        expect(view.start, `${column.id} p${page} lückenlos`).toBe(covered);
        covered += view.visible;
      }
      expect(covered, column.id).toBe(total); // kein Eintrag geht verloren
    }
  });

  it('zeigt kurze Listen ohne Pager (eine Seite)', () => {
    expect(paginateMenuList(3, MENU_LIST_COLUMNS.inventoryItems, 0)).toEqual({
      page: 0,
      pageCount: 1,
      start: 0,
      visible: 3
    });
  });

  it('fasst Rimurus 7 Talentknoten ohne Blättern auf einer Seite', () => {
    expect(paginateMenuList(7, MENU_LIST_COLUMNS.growthNodes, 0).pageCount).toBe(1);
  });

  it('fasst die entdeckbaren Reiseziele ohne Blättern auf einer Seite', () => {
    expect(paginateMenuList(6, MENU_LIST_COLUMNS.travelPoints, 0).pageCount).toBe(1);
  });

  it('lässt die gleichzeitig sichtbaren Status-Spalten (Skills + Bindungen) nicht überlappen', () => {
    expect(
      analyzeMenuColumns(
        [MENU_LIST_COLUMNS.statusSkills, MENU_LIST_COLUMNS.statusBindings],
        [menuListCapacity(MENU_LIST_COLUMNS.statusSkills), menuListCapacity(MENU_LIST_COLUMNS.statusBindings)]
      )
    ).toEqual([]);
  });

  it('verankert Tab-Leiste und Party-Ansicht auf der Canvas-Mitte', () => {
    const tabCount = 8;
    const tabs = menuTabRowBounds(tabCount);
    const party = menuPartyBounds();
    const active = MENU_PARTY_LAYOUT.active;
    const reserve = MENU_PARTY_LAYOUT.reserve;

    expect(tabs.centerX).toBe(MENU_VIEWPORT.width / 2);
    expect(menuTabButtonX(0, tabCount)).toBe(tabs.left);
    expect(menuTabButtonX(tabCount - 1, tabCount) + MENU_TAB_ROW.buttonWidth).toBe(tabs.right);
    expect(party.centerX).toBe(MENU_VIEWPORT.width / 2);
    expect(active.left + active.width).toBeLessThanOrEqual(reserve.left);
    expect(analyzeRects([
      {
        id: 'party.active',
        x: active.left + active.width / 2,
        y: active.firstY,
        width: active.width,
        height: active.cardHeight
      },
      {
        id: 'party.reserve',
        x: reserve.left + reserve.width / 2,
        y: reserve.firstY,
        width: reserve.width,
        height: MENU_TOUCH_TARGET_HEIGHT
      }
    ], MENU_VIEWPORT, 0)).toEqual([]);
  });
});

const MENU_TOUCH_TARGET_HEIGHT = 44;
