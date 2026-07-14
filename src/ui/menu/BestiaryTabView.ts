import type { MenuView } from '../../systems/menu';
import type { IMenuTabView } from './IMenuTabView';
import type { MenuTab } from './MenuTypes';
import { MenuScene } from '../../scenes/MenuScene'; // for helpers, in real would be injected

/**
 * Example Sub-View for Bestiary tab as part of full MenuScene modularization (Phase 142).
 */
export class BestiaryTabView implements IMenuTabView {
  readonly tab: MenuTab = 'codex'; // sub mode + bestiary handled inside

  private bestiaryFilter = '';
  private codexFilter = '';

  constructor(private readonly scene: MenuScene) {}

  onActivated(): void {
    this.bestiaryFilter = '';
    this.codexFilter = '';
    (this.scene as any).bestiaryFilter = '';
    (this.scene as any).codexFilter = '';
  }

  getBestiaryFilter(): string { return this.bestiaryFilter; }
  setBestiaryFilter(f: string) { this.bestiaryFilter = f; (this.scene as any).bestiaryFilter = f; }

  getCodexFilter(): string { return this.codexFilter; }
  setCodexFilter(f: string) { this.codexFilter = f; (this.scene as any).codexFilter = f; }

  draw(_view: MenuView): void {
    // Delegate (full move of drawCodex/drawBestiary in follow-up steps).
    (this.scene as any).drawCodex();
  }
}
