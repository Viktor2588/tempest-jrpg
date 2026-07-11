import type { MenuView } from '../../systems/menu';
import type { IMenuTabView } from './IMenuTabView';
import type { MenuTab } from './MenuTypes';
import { MenuScene } from '../../scenes/MenuScene';

export class EquipmentTabView implements IMenuTabView {
  readonly tab: MenuTab = 'equipment';

  constructor(private readonly scene: MenuScene) {}

  onActivated(): void {}

  draw(view: MenuView): void {
    const selected = view.members[(this.scene as any).selectedMemberIndex] ?? view.members[0];
    if (selected) (this.scene as any).drawEquipment(view, selected.member.characterId);
  }
}
