import Phaser from 'phaser';
import { JURA_FIELD } from '../data/maps';
import { NPCS, SHOPS, type EncounterDefinition } from '../data/world';
import { autoSave, createNewSave, loadSave, type SaveGameV2 } from '../systems/save';
import { tryStep, WALL, type Dir, type Vec2 } from '../systems/overworld';
import { makeRng } from '../systems/rng';
import {
  applyWorldState,
  createWorldState,
  getAdjacentNpc,
  getAdjacentShop,
  getMapLocations,
  getVisibleMapEncounters,
  resolveEncounter
} from '../systems/world';
import { battleWipe, fadeIn } from './transition';

const TILE = 48;
const MOVE_MS = 130;
const MAP_ID = 'tempest-start';

// Oberwelt: rendert das Kachelraster, bewegt den Spieler rasterweise (Tastatur +
// Touch-Steuerkreuz) und folgt mit der Kamera. Bewegung/Kollision kommt aus
// der reinen systems/overworld-Logik.
export class OverworldScene extends Phaser.Scene {
  private pos: Vec2 = { x: 0, y: 0 };
  private player!: Phaser.GameObjects.Rectangle;
  private moving = false;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd?: Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
  private touchDir: Dir | null = null;
  private save!: SaveGameV2;
  private stepCount = 0;

  constructor() {
    super('Overworld');
  }

  create(): void {
    const map = JURA_FIELD;
    this.save = loadSave(window.localStorage) ?? createNewSave();
    fadeIn(this); // sanftes Einblenden (auch beim Rückkehren aus dem Kampf)
    // WICHTIG: Phaser nutzt dieselbe Szenen-Instanz wieder; Klassenfeld-Initialwerte
    // laufen bei scene.start NICHT erneut. Daher transiente Zustände hier zurücksetzen,
    // sonst bleibt nach einem Kampf `moving=true` hängen → Bewegung blockiert.
    this.moving = false;
    this.touchDir = null;

    // Kacheln zeichnen.
    const g = this.add.graphics();
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const wall = map.tiles[y]![x] === WALL;
        g.fillStyle(wall ? 0x2f3b52 : 0x161d2a, 1);
        g.fillRect(x * TILE, y * TILE, TILE, TILE);
        g.lineStyle(1, 0x0c111b, 0.6);
        g.strokeRect(x * TILE, y * TILE, TILE, TILE);
      }
    }

    // Spieler.
    this.pos = this.save.location.mapId === MAP_ID
      ? { x: this.save.location.x, y: this.save.location.y }
      : { ...map.spawn };
    this.player = this.add.rectangle(this.cx(this.pos.x), this.cy(this.pos.y), TILE * 0.62, TILE * 0.62, 0x68d7ff)
      .setStrokeStyle(2, 0xcdeaff);

    this.drawWorldObjects();

    // Kamera folgt, begrenzt auf die Kartengröße.
    this.cameras.main.setBounds(0, 0, map.width * TILE, map.height * TILE);
    this.cameras.main.startFollow(this.player, true, 0.18, 0.18);

    // Tastatur.
    const kb = this.input.keyboard;
    if (kb) {
      this.cursors = kb.createCursorKeys();
      this.wasd = kb.addKeys('W,A,S,D') as Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
    }

    // Touch-Steuerkreuz (mobil).
    this.buildDpad();

    // NPC/Shop-Interaktion.
    const interact = () => this.interact();
    this.input.keyboard?.on('keydown-E', interact);
    this.input.keyboard?.on('keydown-SPACE', interact);
    const interactBtn = this.add.rectangle(this.scale.width - 86, 132, 150, 44, 0x1f3a2f, 0.9)
      .setScrollFactor(0).setDepth(10).setStrokeStyle(2, 0x75ffab, 0.7).setInteractive();
    this.add.text(this.scale.width - 86, 132, '◆ Interaktion', { fontFamily: 'sans-serif', fontSize: '14px', color: '#d9ffe7' })
      .setOrigin(0.5).setScrollFactor(0).setDepth(11);
    interactBtn.on('pointerdown', interact);

    // Kampf auslösen (Demo: Enter-Taste oder Knopf) → bindet Phase 3 an.
    const toBattle = () => battleWipe(this, 'Battle');
    this.input.keyboard?.on('keydown-ENTER', toBattle);
    const btn = this.add.rectangle(this.scale.width - 86, 30, 150, 38, 0x3a2230, 0.9)
      .setScrollFactor(0).setDepth(10).setStrokeStyle(2, 0xff8aa0, 0.7).setInteractive();
    this.add.text(this.scale.width - 86, 30, '⚔ Kampf (Enter)', { fontFamily: 'sans-serif', fontSize: '13px', color: '#ffd6de' })
      .setOrigin(0.5).setScrollFactor(0).setDepth(11);
    btn.on('pointerdown', toBattle);

    // Menü-Overlay (Phase 4): pausiert die Oberwelt, Szene rendert über ihr.
    const openMenu = () => {
      if (this.scene.isActive('Menu')) return;
      this.scene.launch('Menu');
      this.scene.pause();
    };
    this.input.keyboard?.on('keydown-M', openMenu);
    const menuBtn = this.add.rectangle(this.scale.width - 86, 80, 150, 44, 0x223049, 0.9)
      .setScrollFactor(0).setDepth(10).setStrokeStyle(2, 0x68d7ff, 0.7).setInteractive();
    this.add.text(this.scale.width - 86, 80, '☰ Menü (M)', { fontFamily: 'sans-serif', fontSize: '14px', color: '#d8ecff' })
      .setOrigin(0.5).setScrollFactor(0).setDepth(11);
    menuBtn.on('pointerdown', openMenu);
  }

  override update(): void {
    if (this.moving) return;
    const dir = this.readDir();
    if (dir) this.step(dir);
  }

  private readDir(): Dir | null {
    if (this.touchDir) return this.touchDir;
    const c = this.cursors, w = this.wasd;
    if (c?.left.isDown || w?.A.isDown) return 'left';
    if (c?.right.isDown || w?.D.isDown) return 'right';
    if (c?.up.isDown || w?.W.isDown) return 'up';
    if (c?.down.isDown || w?.S.isDown) return 'down';
    return null;
  }

  private step(dir: Dir): void {
    const next = tryStep(JURA_FIELD, this.pos, dir);
    if (next.x === this.pos.x && next.y === this.pos.y) return; // blockiert
    this.pos = next;
    this.moving = true;
    this.persistPosition(dir);
    this.tweens.add({
      targets: this.player,
      x: this.cx(next.x),
      y: this.cy(next.y),
      duration: MOVE_MS,
      onComplete: () => {
        this.moving = false;
        this.resolveEncounterAtCurrentPosition();
      }
    });
  }

  private drawWorldObjects(): void {
    const world = createWorldState(this.save);
    for (const location of getMapLocations(MAP_ID, world)) {
      const color = location.kind === 'city'
        ? 0x476bff
        : location.kind === 'outpost'
          ? 0x4f8a55
          : location.kind === 'dungeon'
            ? 0x7350a8
            : 0xd2b35f;
      this.add.rectangle(this.cx(location.position.x), this.cy(location.position.y), TILE * 0.86, TILE * 0.86, color, 0.28)
        .setStrokeStyle(2, color, 0.85);
      this.add.text(this.cx(location.position.x), this.cy(location.position.y) + 31, location.name, {
        fontFamily: 'sans-serif',
        fontSize: '10px',
        color: '#e9eef7'
      }).setOrigin(0.5);
    }

    const triggerEncounters = getVisibleMapEncounters(MAP_ID, world).filter(isTriggerEncounterForMap);
    for (const encounter of triggerEncounters) {
      this.add.rectangle(this.cx(encounter.position.x), this.cy(encounter.position.y), TILE * 0.72, TILE * 0.72, 0x633050, 0.55)
        .setStrokeStyle(2, 0xff8aa0, 0.8);
      this.add.text(this.cx(encounter.position.x), this.cy(encounter.position.y), '!', {
        fontFamily: 'sans-serif',
        fontSize: '20px',
        color: '#ffd6de'
      }).setOrigin(0.5);
    }

    for (const npc of NPCS.filter((item) => item.mapId === MAP_ID)) {
      this.add.rectangle(this.cx(npc.position.x), this.cy(npc.position.y), TILE * 0.62, TILE * 0.62, npc.color, 0.95)
        .setStrokeStyle(2, 0xfff1aa, 0.9);
      this.add.text(this.cx(npc.position.x), this.cy(npc.position.y) - 34, npc.name, {
        fontFamily: 'sans-serif',
        fontSize: '11px',
        color: '#e9eef7'
      }).setOrigin(0.5);
    }

    for (const shop of SHOPS.filter((item) => item.mapId === MAP_ID)) {
      this.add.rectangle(this.cx(shop.position.x), this.cy(shop.position.y), TILE * 0.7, TILE * 0.7, 0x2f6f55, 0.95)
        .setStrokeStyle(2, 0x8affc1, 0.9);
      this.add.text(this.cx(shop.position.x), this.cy(shop.position.y), '店', {
        fontFamily: 'sans-serif',
        fontSize: '18px',
        color: '#e9eef7'
      }).setOrigin(0.5);
    }
  }

  private interact(): void {
    if (this.moving) return;
    const npc = getAdjacentNpc(MAP_ID, this.pos);
    if (npc) {
      this.scene.launch('Dialogue', { npcId: npc.id });
      this.scene.pause();
      return;
    }
    const shop = getAdjacentShop(MAP_ID, this.pos);
    if (shop) {
      this.scene.launch('Shop', { shopId: shop.id });
      this.scene.pause();
    }
  }

  private resolveEncounterAtCurrentPosition(): void {
    this.stepCount += 1;
    this.save = loadSave(window.localStorage) ?? this.save;
    const result = resolveEncounter(
      createWorldState(this.save),
      MAP_ID,
      this.pos,
      makeRng((this.save.seed + this.stepCount * 101 + this.pos.x * 17 + this.pos.y * 31) >>> 0)
    );
    this.save = applyWorldState(this.save, result.state.world);
    autoSave(window.localStorage, this.save);

    if (result.state.encounter) {
      battleWipe(this, 'Battle', {
        enemyIds: [...result.state.encounter.enemyIds],
        encounterId: result.state.encounter.id
      });
    }
  }

  private persistPosition(facing: Dir): void {
    this.save = {
      ...this.save,
      location: {
        mapId: MAP_ID,
        x: this.pos.x,
        y: this.pos.y,
        facing: facing === 'up' || facing === 'down' || facing === 'left' || facing === 'right' ? facing : 'down'
      }
    };
    autoSave(window.localStorage, this.save);
  }

  private cx(tileX: number): number { return tileX * TILE + TILE / 2; }
  private cy(tileY: number): number { return tileY * TILE + TILE / 2; }

  private buildDpad(): void {
    const r = 30, gap = 4, baseX = r + 18, baseY = this.scale.height - r - 18;
    const layout: Array<{ dir: Dir; dx: number; dy: number; label: string }> = [
      { dir: 'up', dx: 0, dy: -(r + gap), label: '▲' },
      { dir: 'down', dx: 0, dy: r + gap, label: '▼' },
      { dir: 'left', dx: -(r + gap), dy: 0, label: '◀' },
      { dir: 'right', dx: r + gap, dy: 0, label: '▶' }
    ];
    for (const b of layout) {
      const btn = this.add.rectangle(baseX + b.dx, baseY + b.dy, r * 1.7, r * 1.7, 0x223049, 0.55)
        .setScrollFactor(0).setDepth(10).setStrokeStyle(2, 0x68d7ff, 0.6).setInteractive();
      this.add.text(baseX + b.dx, baseY + b.dy, b.label, { fontFamily: 'sans-serif', fontSize: '20px', color: '#cdeaff' })
        .setOrigin(0.5).setScrollFactor(0).setDepth(11);
      btn.on('pointerdown', () => { this.touchDir = b.dir; });
      btn.on('pointerup', () => { if (this.touchDir === b.dir) this.touchDir = null; });
      btn.on('pointerout', () => { if (this.touchDir === b.dir) this.touchDir = null; });
    }
  }
}

function isTriggerEncounterForMap(
  encounter: EncounterDefinition
): encounter is EncounterDefinition & { readonly position: Vec2 } {
  return encounter.mapId === MAP_ID && encounter.kind === 'trigger' && !!encounter.position;
}
