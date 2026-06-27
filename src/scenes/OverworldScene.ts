import Phaser from 'phaser';
import { JURA_FIELD } from '../data/maps';
import { NPCS, SHOPS, type EncounterDefinition } from '../data/world';
import { autoSave, createNewSave, loadSave, type SaveGameV2 } from '../systems/save';
import { layoutOverworldHud } from '../systems/mobileLayout';
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
import { playMusic, resumeMusic } from '../audio/music';
import { resumeAudio } from '../audio/sfx';
import { battleWipe, fadeIn } from './transition';

const TILE = 48;
const MOVE_MS = 130;
const MAP_ID = 'tempest-start';

// Oberwelt: rendert das Kachelraster, bewegt den Spieler rasterweise (Tastatur +
// Touch-Steuerkreuz) und folgt mit der Kamera. Bewegung/Kollision kommt aus
// der reinen systems/overworld-Logik.
export class OverworldScene extends Phaser.Scene {
  private pos: Vec2 = { x: 0, y: 0 };
  private player!: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle;
  private worldLayer?: Phaser.GameObjects.Container;
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
    playMusic('overworld');
    // WICHTIG: Phaser nutzt dieselbe Szenen-Instanz wieder; Klassenfeld-Initialwerte
    // laufen bei scene.start NICHT erneut. Daher transiente Zustände hier zurücksetzen,
    // sonst bleibt nach einem Kampf `moving=true` hängen → Bewegung blockiert.
    this.moving = false;
    this.touchDir = null;
    // Nach scene.start (z. B. Rückkehr aus dem Kampf) zeigt das Feld auf den
    // ZERSTÖRTEN Container der vorigen Sitzung → zurücksetzen, sonst zeichnet
    // drawWorldObjects in einen toten Container und die Story-Marker (z. B. der
    // Schrein nach dem Hain-Sieg) verschwinden → Spieler bleibt stecken.
    this.worldLayer = undefined;

    // Kacheln: echte CC0-Kenney-Kacheln bevorzugt → Platzhalter → Rechteck-Fallback.
    const tileKey = (wall: boolean): string | null => {
      const real = wall ? 'tile-wall' : 'tile-grass';
      if (this.textures.exists(real)) return real;
      const ph = wall ? 'ph-tile-wall' : 'ph-tile-grass';
      return this.textures.exists(ph) ? ph : null;
    };
    const g = this.add.graphics();
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const wall = map.tiles[y]![x] === WALL;
        const key = tileKey(wall);
        if (key) {
          this.add.image(x * TILE + TILE / 2, y * TILE + TILE / 2, key).setDisplaySize(TILE, TILE);
        } else {
          g.fillStyle(wall ? 0x2f3b52 : 0x161d2a, 1);
          g.fillRect(x * TILE, y * TILE, TILE, TILE);
          g.lineStyle(1, 0x0c111b, 0.6);
          g.strokeRect(x * TILE, y * TILE, TILE, TILE);
        }
      }
    }

    // Spieler — echtes CC0-Sprite → Platzhalter → Rechteck.
    this.pos = this.save.location.mapId === MAP_ID
      ? { x: this.save.location.x, y: this.save.location.y }
      : { ...map.spawn };
    const heroKey = this.textures.exists('sprite-hero') ? 'sprite-hero'
      : (this.textures.exists('ph-hero') ? 'ph-hero' : null);
    this.player = heroKey
      ? this.add.image(this.cx(this.pos.x), this.cy(this.pos.y), heroKey).setDisplaySize(TILE * 0.82, TILE * 0.82)
      : this.add.rectangle(this.cx(this.pos.x), this.cy(this.pos.y), TILE * 0.62, TILE * 0.62, 0x68d7ff).setStrokeStyle(2, 0xcdeaff);

    this.drawWorldObjects();

    // Nach Rückkehr aus Dialog/Shop/Menü (scene.resume) den Save neu laden und die
    // Story-Marker neu zeichnen, damit freigeschaltete Encounter sofort sichtbar sind.
    // off vor on: create() läuft bei jedem scene.start erneut → sonst sammeln sich
    // Listener auf der (wiederverwendeten) Szenen-Instanz an.
    this.events.off(Phaser.Scenes.Events.RESUME, this.onResume, this);
    this.events.on(Phaser.Scenes.Events.RESUME, this.onResume, this);

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

    // Audio nach erster Nutzergeste erneut freigeben (falls Autoplay geblockt war).
    const unlockAudio = () => { resumeAudio(); resumeMusic(); };
    this.input.once('pointerdown', unlockAudio);
    this.input.keyboard?.once('keydown', unlockAudio);

    // NPC/Shop-Interaktion.
    const interact = () => this.interact();
    this.input.keyboard?.on('keydown-E', interact);
    this.input.keyboard?.on('keydown-SPACE', interact);
    const hud = layoutOverworldHud({ width: this.scale.width, height: this.scale.height });
    const interactRect = hud.buttons.interact;
    const interactBtn = this.add.rectangle(interactRect.x, interactRect.y, interactRect.width, interactRect.height, 0x1f3a2f, 0.9)
      .setScrollFactor(0).setDepth(10).setStrokeStyle(2, 0x75ffab, 0.7).setInteractive();
    this.add.text(interactRect.x, interactRect.y, '◆ Interaktion', { fontFamily: 'sans-serif', fontSize: '14px', color: '#d9ffe7' })
      .setOrigin(0.5).setScrollFactor(0).setDepth(11);
    interactBtn.on('pointerdown', interact);

    // Kampf auslösen (Demo: Enter-Taste oder Knopf) → bindet Phase 3 an.
    const toBattle = () => battleWipe(this, 'Battle');
    this.input.keyboard?.on('keydown-ENTER', toBattle);
    const battleRect = hud.buttons.battle;
    const btn = this.add.rectangle(battleRect.x, battleRect.y, battleRect.width, battleRect.height, 0x3a2230, 0.9)
      .setScrollFactor(0).setDepth(10).setStrokeStyle(2, 0xff8aa0, 0.7).setInteractive();
    this.add.text(battleRect.x, battleRect.y, '⚔ Kampf (Enter)', { fontFamily: 'sans-serif', fontSize: '13px', color: '#ffd6de' })
      .setOrigin(0.5).setScrollFactor(0).setDepth(11);
    btn.on('pointerdown', toBattle);

    // Menü-Overlay (Phase 4): pausiert die Oberwelt, Szene rendert über ihr.
    const openMenu = () => {
      if (this.scene.isActive('Menu')) return;
      this.scene.launch('Menu');
      this.scene.pause();
    };
    this.input.keyboard?.on('keydown-M', openMenu);
    const menuRect = hud.buttons.menu;
    const menuBtn = this.add.rectangle(menuRect.x, menuRect.y, menuRect.width, menuRect.height, 0x223049, 0.9)
      .setScrollFactor(0).setDepth(10).setStrokeStyle(2, 0x68d7ff, 0.7).setInteractive();
    this.add.text(menuRect.x, menuRect.y, '☰ Menü (M)', { fontFamily: 'sans-serif', fontSize: '14px', color: '#d8ecff' })
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

  private onResume(): void {
    this.save = loadSave(window.localStorage) ?? this.save;
    this.drawWorldObjects();
  }

  private drawWorldObjects(): void {
    // In einen Layer zeichnen, damit gated Story-Marker beim Resume (nach Dialog/
    // Shop/Menü) mit frischem Save neu gezeichnet werden können — sonst erscheinen
    // freigeschaltete „!"-Encounter erst nach einem Szenenneustart.
    if (this.worldLayer) this.worldLayer.removeAll(true);
    else this.worldLayer = this.add.container(0, 0);
    const layer = this.worldLayer;
    const world = createWorldState(this.save);
    for (const location of getMapLocations(MAP_ID, world)) {
      const color = location.kind === 'city'
        ? 0x476bff
        : location.kind === 'outpost'
          ? 0x4f8a55
          : location.kind === 'dungeon'
            ? 0x7350a8
            : 0xd2b35f;
      layer.add(this.add.rectangle(this.cx(location.position.x), this.cy(location.position.y), TILE * 0.86, TILE * 0.86, color, 0.28)
        .setStrokeStyle(2, color, 0.85));
      layer.add(this.add.text(this.cx(location.position.x), this.cy(location.position.y) + 31, location.name, {
        fontFamily: 'sans-serif',
        fontSize: '10px',
        color: '#e9eef7'
      }).setOrigin(0.5));
    }

    const triggerEncounters = getVisibleMapEncounters(MAP_ID, world).filter(isTriggerEncounterForMap);
    for (const encounter of triggerEncounters) {
      layer.add(this.add.rectangle(this.cx(encounter.position.x), this.cy(encounter.position.y), TILE * 0.72, TILE * 0.72, 0x633050, 0.55)
        .setStrokeStyle(2, 0xff8aa0, 0.8));
      layer.add(this.add.text(this.cx(encounter.position.x), this.cy(encounter.position.y), '!', {
        fontFamily: 'sans-serif',
        fontSize: '20px',
        color: '#ffd6de'
      }).setOrigin(0.5));
    }

    for (const npc of NPCS.filter((item) => item.mapId === MAP_ID)) {
      layer.add(this.add.rectangle(this.cx(npc.position.x), this.cy(npc.position.y), TILE * 0.62, TILE * 0.62, npc.color, 0.95)
        .setStrokeStyle(2, 0xfff1aa, 0.9));
      layer.add(this.add.text(this.cx(npc.position.x), this.cy(npc.position.y) - 34, npc.name, {
        fontFamily: 'sans-serif',
        fontSize: '11px',
        color: '#e9eef7'
      }).setOrigin(0.5));
    }

    for (const shop of SHOPS.filter((item) => item.mapId === MAP_ID)) {
      layer.add(this.add.rectangle(this.cx(shop.position.x), this.cy(shop.position.y), TILE * 0.7, TILE * 0.7, 0x2f6f55, 0.95)
        .setStrokeStyle(2, 0x8affc1, 0.9));
      layer.add(this.add.text(this.cx(shop.position.x), this.cy(shop.position.y), '店', {
        fontFamily: 'sans-serif',
        fontSize: '18px',
        color: '#e9eef7'
      }).setOrigin(0.5));
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
    const hud = layoutOverworldHud({ width: this.scale.width, height: this.scale.height });
    for (const b of hud.dpad) {
      const btn = this.add.rectangle(b.x, b.y, b.width, b.height, 0x223049, 0.55)
        .setScrollFactor(0).setDepth(10).setStrokeStyle(2, 0x68d7ff, 0.6).setInteractive();
      this.add.text(b.x, b.y, b.label, { fontFamily: 'sans-serif', fontSize: '20px', color: '#cdeaff' })
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
