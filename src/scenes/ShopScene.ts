import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../main';
import { autoSave, createNewSave, loadSave, type SaveGameV2 } from '../systems/save';
import {
  applyWorldState,
  buildShopView,
  buyItem,
  createWorldState,
  sellItem,
  type ShopView,
  type WorldState
} from '../systems/world';
import { addUiButtonBackground, addUiPanel } from '../render/uiSkin';

export class ShopScene extends Phaser.Scene {
  private save!: SaveGameV2;
  private world!: WorldState;
  private shopId = 'tempest-supply';
  private view!: ShopView;
  private layer!: Phaser.GameObjects.Container;
  private message = 'Kaufen oder verkaufen.';

  constructor() {
    super('Shop');
  }

  create(data: { shopId?: string }): void {
    this.shopId = data.shopId ?? this.shopId;
    this.save = loadSave(window.localStorage) ?? createNewSave();
    this.world = createWorldState(this.save);
    this.view = buildShopView(this.world, this.shopId);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x05070d, 0.72);
    this.layer = this.add.container(0, 0);
    this.input.keyboard?.on('keydown-ESC', () => this.close());
    this.refresh();
  }

  private refresh(): void {
    this.view = buildShopView(this.world, this.shopId);
    this.layer.removeAll(true);
    this.panel(76, 74, GAME_WIDTH - 152, GAME_HEIGHT - 148);
    this.layer.add(this.add.text(104, 96, this.view.name, {
      fontFamily: 'serif',
      fontSize: '28px',
      color: '#e9c56c'
    }));
    this.layer.add(this.add.text(104, 132, `${this.view.gold} Gold · ${this.message}`, {
      fontFamily: 'sans-serif',
      fontSize: '13px',
      color: '#9fb2cc'
    }));
    this.button(GAME_WIDTH - 188, 112, 104, 'Schließen', () => this.close(), 0x3a2230);

    this.view.items.forEach((item, index) => {
      const y = 182 + index * 58;
      this.layer.add(this.add.text(104, y - 10, `${item.name} · Besitz: ${item.quantity}`, {
        fontFamily: 'sans-serif',
        fontSize: '15px',
        color: '#e9eef7'
      }));
      this.button(460, y, 130, `Kaufen ${item.buyPrice}`, () => {
        const result = buyItem(this.world, this.shopId, item.itemId);
        this.apply(result);
      });
      this.button(610, y, 130, `Verkaufen ${item.sellPrice}`, () => {
        const result = sellItem(this.world, this.shopId, item.itemId);
        this.apply(result);
      }, item.quantity > 0 ? 0x1f3a2f : 0x242b38);
    });
  }

  private apply(result: { ok: boolean; state: WorldState; message: string }): void {
    this.world = result.state;
    this.message = result.message;
    if (result.ok) {
      this.save = applyWorldState(this.save, this.world);
      autoSave(window.localStorage, this.save);
    }
    this.refresh();
  }

  private close(): void {
    this.scene.resume('Overworld');
    this.scene.stop();
  }

  private panel(x: number, y: number, width: number, height: number): void {
    this.layer.add(addUiPanel(this, x, y, width, height, { originY: 0, alpha: 0.96 }));
  }

  private button(x: number, y: number, width: number, label: string, callback: () => void, color = 0x1b2940): void {
    const bg = addUiButtonBackground(this, x, y, width, 44, color);
    const text = this.add.text(x + 10, y, label, {
      fontFamily: 'sans-serif',
      fontSize: '13px',
      color: '#e9eef7'
    }).setOrigin(0, 0.5);
    bg.on('pointerover', () => bg.setFillStyle(0x274062, 1));
    bg.on('pointerout', () => bg.setFillStyle(color, 0.98));
    bg.on('pointerdown', callback);
    this.layer.add(bg);
    this.layer.add(text);
  }
}
