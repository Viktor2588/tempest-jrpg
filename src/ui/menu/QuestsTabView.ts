import type { MenuView } from '../../systems/menu';
import type { IMenuTabView } from './IMenuTabView';
import type { MenuTab, QuestStatusFilter } from './MenuTypes';
import { MenuScene } from '../../scenes/MenuScene';

/**
 * Sub-View for Quests tab. Encapsulates quest page + status filter state.
 * Phase 145: extracted from monolithic MenuScene.
 */
export class QuestsTabView implements IMenuTabView {
  readonly tab: MenuTab = 'quests';

  private page = 0;
  private status: QuestStatusFilter = 'active';
  private filter = '';

  constructor(private readonly scene: MenuScene) {}

  onActivated(): void {
    this.page = 0;
    this.status = 'active';
    this.filter = '';
    (this.scene as any).questPage = 0;
    (this.scene as any).questStatus = 'active';
    (this.scene as any).questFilter = '';
  }

  getPage(): number { return this.page; }
  setPage(p: number) { this.page = p; (this.scene as any).questPage = p; }
  getStatus(): QuestStatusFilter { return this.status; }
  setStatus(s: QuestStatusFilter) { this.status = s; (this.scene as any).questStatus = s; }
  getFilter(): string { return this.filter; }
  setFilter(f: string) { this.filter = f; (this.scene as any).questFilter = f; }
  clearFilter() { this.filter = ''; (this.scene as any).questFilter = ''; }

  draw(_view: MenuView): void {
    // Delegate for incremental extraction.
    (this.scene as any).drawQuestLog(_view);
  }
}
