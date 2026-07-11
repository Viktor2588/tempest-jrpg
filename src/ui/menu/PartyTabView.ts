import type { MenuView } from '../../systems/menu';
import type { IMenuTabView } from './IMenuTabView';
import type { MenuTab } from './MenuTypes';
import { MenuScene } from '../../scenes/MenuScene';

/**
 * Party tab view owning roster + DnD logic (Phase 145).
 * Future: fully move drawParty + drag handlers here.
 */
export class PartyTabView implements IMenuTabView {
  readonly tab: MenuTab = 'party';

  constructor(private readonly scene: MenuScene) {}

  onActivated(): void {}

  draw(view: MenuView): void {
    const selected = view.members[(this.scene as any).selectedMemberIndex] ?? view.members[0];
    if (selected) (this.scene as any).drawParty(selected.character.name, view);
  }
}
