import type { MenuView } from '../../systems/menu';
import type { IMenuTabView } from './IMenuTabView';
import type { MenuTab } from './MenuTypes';
import { MenuScene } from '../../scenes/MenuScene';

/**
 * Extracted Sub-View for Inventory tab (Phase 145).
 * Owns the inventory filter state. Resets on tab activation.
 */
export class InventoryTabView implements IMenuTabView {
  readonly tab: MenuTab = 'inventory';

  private filter = '';

  constructor(private readonly scene: MenuScene) {}

  onActivated(): void {
    this.filter = '';
    (this.scene as any).inventoryFilter = '';
  }

  getFilter(): string {
    return this.filter;
  }

  setFilter(f: string): void {
    this.filter = f;
    (this.scene as any).inventoryFilter = f;
  }

  clearFilter(): void {
    this.filter = '';
    (this.scene as any).inventoryFilter = '';
  }

  draw(view: MenuView): void {
    // Delegate drawing to scene (which can read filter via this view) for incremental refactor.
    // The scene's drawInventory will call back into the active view for filter.
    const selected = view.members[(this.scene as any).selectedMemberIndex] ?? view.members[0];
    if (selected) {
      (this.scene as any).drawInventory(view, selected.member.characterId);
    }
  }
}
