import type { MenuView } from '../../systems/menu';
import type { MenuTab } from './MenuTypes';

/**
 * Interface for a tab-specific view in the Menu.
 * Each tab (Party, Inventory, etc.) gets its own implementation.
 * This breaks the monolithic MenuScene.
 */
export interface IMenuTabView {
  /** Unique tab id */
  readonly tab: MenuTab;

  /**
   * Called when the tab becomes active.
   * Can reset internal pagination or state.
   */
  onActivated(): void;

  /**
   * Draw the content of this tab into the provided layer.
   * The MenuScene handles common header, tabs, member list, etc.
   */
  draw(view: MenuView): void;

  /**
   * Optional: handle tab-specific keyboard or input if needed.
   * Currently MenuScene centralizes most input.
   */
  handleInput?(): void;
}
