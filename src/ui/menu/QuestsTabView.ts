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

  constructor(private readonly scene: MenuScene) {}

  onActivated(): void {
    // reset pagination when switching to tab (as before)
    this.page = 0;
  }

  // Public for MenuScene bridge if needed (selectedQuest etc remains on scene for now)
  getPage(): number { return this.page; }
  setPage(p: number) { this.page = p; }
  getStatus(): QuestStatusFilter { return this.status; }
  setStatus(s: QuestStatusFilter) { this.status = s; }

  draw(_view: MenuView): void {
    // Delegate for incremental extraction (full draw+input move in follow-ups).
    (this.scene as any).drawQuestLog(_view);
  }
}
