import type { MenuView } from '../../systems/menu';
import type { MenuTab } from './MenuTypes';
import type { IMenuTabView } from './IMenuTabView';
import { MenuScene } from '../../scenes/MenuScene';  // for access to helpers if needed

/**
 * Base class for menu tab views.
 * Provides common utilities and default implementations.
 */
export abstract class BaseMenuTabView implements IMenuTabView {
  abstract readonly tab: MenuTab;

  constructor(protected readonly scene: MenuScene) {}

  onActivated(): void {
    // default: do nothing, subclasses can override
  }

  abstract draw(view: MenuView): void;

  // Helper to access protected methods from MenuScene if needed
  protected get layer() {
    return (this.scene as any).layer;  // internal access for now
  }

  protected addText(...args: any[]) {
    return (this.scene as any).layer.add((this.scene as any).add.text(...args));
  }

  // etc. - in real refactor we'd expose better APIs
}
