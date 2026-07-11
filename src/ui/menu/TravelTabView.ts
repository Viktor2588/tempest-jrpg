import type { MenuView } from '../../systems/menu';
import type { IMenuTabView } from './IMenuTabView';
import type { MenuTab } from './MenuTypes';
import { MenuScene } from '../../scenes/MenuScene';

export class TravelTabView implements IMenuTabView {
  readonly tab: MenuTab = 'travel';

  constructor(private readonly scene: MenuScene) {}

  onActivated(): void {}

  draw(_view: MenuView): void {
    (this.scene as any).drawRangaTravel();
  }
}
