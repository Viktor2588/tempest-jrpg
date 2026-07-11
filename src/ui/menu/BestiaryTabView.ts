import { buildBestiary } from '../../systems/bestiary';
import { summarizeHuntingGrounds } from '../../systems/bestiaryMastery';
import { elementLabel } from '../../systems/battlePresentation';
import type { MenuView } from '../../systems/menu';
import type { IMenuTabView } from './IMenuTabView';
import type { MenuTab } from './MenuTypes';
import { MenuScene } from '../../scenes/MenuScene'; // for helpers, in real would be injected

/**
 * Example Sub-View for Bestiary tab as part of full MenuScene modularization (Phase 142).
 */
export class BestiaryTabView implements IMenuTabView {
  readonly tab: MenuTab = 'codex'; // sub mode handled inside for now

  private filter = '';

  constructor(private readonly scene: MenuScene) {}

  onActivated(): void {
    this.filter = '';
  }

  draw(_view: MenuView): void {
    // For simplicity, delegate to the original drawBestiary logic in scene for this demo.
    // In full refactor, move all drawing here.
    (this.scene as any).drawBestiaryWithFilter(this.filter); // temporary bridge
  }

  // Additional methods for filter etc.
}
