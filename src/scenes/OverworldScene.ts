import Phaser from 'phaser';
import { getMap, getMapName } from '../data/maps';
import { SHOPS, type EncounterDefinition } from '../data/world';
import { autoSave, createNewSave, loadSave, type SaveGameV2 } from '../systems/save';
import { layoutOverworldHud } from '../systems/mobileLayout';
import { buildMinimap, type MinimapMarker, type MinimapMarkerKind } from '../systems/minimap';
import { OVERWORLD_TUTORIAL_FLAG, OVERWORLD_TUTORIAL_HINTS, shouldShowOverworldTutorial } from '../systems/tutorial';
import { isWalkable, tileKey, tryStep, WALL, type Dir, type TileMap, type Vec2 } from '../systems/overworld';
import { discoverRangaTravelFlags } from '../systems/rangaTravel';
import { makeRng } from '../systems/rng';
import {
  applyWorldState,
  createWorldState,
  getAdjacentNpc,
  getAdjacentShop,
  getActiveEnding,
  getMapLocations,
  getMapNpcs,
  getTravelAtTile,
  getTrackedQuestObjective,
  getVisibleMapEncounters,
  npcHasQuestMarker,
  resolveEncounter
} from '../systems/world';
import { playMusic, resumeMusic } from '../audio/music';
import { resumeAudio } from '../audio/sfx';
import { battleWipe, fadeIn, fadeToScene } from './transition';

const TILE = 48;
const MOVE_MS = 130;

// Oberwelt: rendert das Kachelraster, bewegt den Spieler rasterweise (Tastatur +
// Touch-Steuerkreuz) und folgt mit der Kamera. Bewegung/Kollision kommt aus
// der reinen systems/overworld-Logik.
export class OverworldScene extends Phaser.Scene {
  private pos: Vec2 = { x: 0, y: 0 };
  private mapId = 'tempest-start';
  private map!: TileMap;
  private player!: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle;
  private worldLayer?: Phaser.GameObjects.Container;
  private moving = false;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd?: Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
  private touchDir: Dir | null = null;
  private save!: SaveGameV2;
  private stepCount = 0;
  private minimapLayer?: Phaser.GameObjects.Container;
  private minimapPlayerDot?: Phaser.GameObjects.Arc;
  private minimapOriginX = 0;
  private minimapOriginY = 0;
  private minimapCell = 4;

  constructor() {
    super('Overworld');
  }

  create(): void {
    this.save = loadSave(window.localStorage) ?? createNewSave();
    this.save = this.withCurrentRangaTravelDiscovery(this.save);
    this.mapId = this.save.location.mapId;
    const map = this.map = getMap(this.mapId);
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
    // Gespeicherte Position nur übernehmen, wenn sie auf der aktuellen Karte begehbar ist.
    const saved = { x: this.save.location.x, y: this.save.location.y };
    this.pos = isWalkable(map, saved.x, saved.y) ? saved : { ...map.spawn };
    const heroKey = this.textures.exists('sprite-hero') ? 'sprite-hero'
      : (this.textures.exists('ph-hero') ? 'ph-hero' : null);
    this.player = heroKey
      ? this.add.image(this.cx(this.pos.x), this.cy(this.pos.y), heroKey).setDisplaySize(TILE * 0.82, TILE * 0.82)
      : this.add.rectangle(this.cx(this.pos.x), this.cy(this.pos.y), TILE * 0.62, TILE * 0.62, 0x68d7ff).setStrokeStyle(2, 0xcdeaff);

    this.drawWorldObjects();
    this.minimapLayer = undefined; // wiederverwendete Instanz: alter Container ist zerstört.
    this.drawMinimap();

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

    // Demo-Kampf nur noch unsichtbar per Enter (kein HUD-Knopf mehr — oben rechts
    // gehört der Übersicht/Minimap); echte Kämpfe laufen über Begegnungen.
    this.input.keyboard?.on('keydown-ENTER', () => battleWipe(this, 'Battle'));

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

    // Einmaliges Steuerungs-Tutorial beim allerersten Spielstart (Save-Flag-gegated).
    if (shouldShowOverworldTutorial(this.save.flags)) this.showControlTutorial();
  }

  // Erklärt Laufen/Interagieren/Menü direkt im Spiel und merkt sich den Abschluss.
  private showControlTutorial(): void {
    const cx = this.scale.width / 2;
    const overlay = this.add.container(0, 0).setScrollFactor(0).setDepth(40);
    overlay.add(this.add.rectangle(cx, this.scale.height / 2, this.scale.width, this.scale.height, 0x05070c, 0.82));
    overlay.add(this.add.rectangle(cx, 250, 520, 320, 0x0a0f18, 0.96).setStrokeStyle(2, 0x68d7ff, 0.7));
    overlay.add(this.add.text(cx, 130, 'Steuerung', { fontFamily: 'serif', fontSize: '28px', color: '#e9c56c' }).setOrigin(0.5));

    OVERWORLD_TUTORIAL_HINTS.forEach((hint, index) => {
      const y = 172 + index * 80;
      overlay.add(this.add.text(cx - 232, y, hint.icon, { fontFamily: 'sans-serif', fontSize: '26px', color: '#cdeaff' }).setOrigin(0, 0.5));
      overlay.add(this.add.text(cx - 188, y - 16, hint.title, { fontFamily: 'sans-serif', fontSize: '16px', color: '#e9c56c' }));
      overlay.add(this.add.text(cx - 188, y + 4, hint.body, {
        fontFamily: 'sans-serif', fontSize: '12px', color: '#cbd6e8', wordWrap: { width: 400 }
      }));
    });

    const btn = this.add.rectangle(cx, 372, 220, 44, 0x1b2940, 1).setStrokeStyle(1, 0x68d7ff, 0.7).setInteractive();
    overlay.add(btn);
    overlay.add(this.add.text(cx, 372, 'Verstanden', { fontFamily: 'sans-serif', fontSize: '18px', color: '#e9eef7' }).setOrigin(0.5));

    const dismiss = (): void => {
      this.save = { ...this.save, flags: { ...this.save.flags, [OVERWORLD_TUTORIAL_FLAG]: true } };
      autoSave(window.localStorage, this.save);
      overlay.destroy();
    };
    btn.on('pointerdown', dismiss);
    this.input.keyboard?.once('keydown-ESC', dismiss); // ESC ist sonst nicht belegt
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
    // Sichtbare NPCs blockieren ihre Kachel (Kollision) — man bleibt davor stehen
    // und kann sie von dort ansprechen, statt durch sie hindurchzulaufen.
    const blocked = new Set(
      getMapNpcs(this.mapId, createWorldState(this.save)).map((npc) => tileKey(npc.position.x, npc.position.y))
    );
    const next = tryStep(this.map, this.pos, dir, blocked);
    if (next.x === this.pos.x && next.y === this.pos.y) return; // blockiert
    this.pos = next;
    this.moving = true;
    this.updateMinimapPlayer();
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
    this.save = this.withCurrentRangaTravelDiscovery(this.save);
    this.drawWorldObjects();
    this.drawMinimap(); // freigeschaltete Gateways/Marker auf der Minimap aktualisieren
    this.maybeShowEnding();
  }

  // Fixierte Minimap oben rechts: Marker-Radar (Spieler/Gateway/NPC/Landmark) zur
  // Orientierung, da die Karten größer als der Bildschirm sind und die Kamera folgt.
  private drawMinimap(): void {
    if (this.minimapLayer) this.minimapLayer.removeAll(true);
    else this.minimapLayer = this.add.container(0, 0).setScrollFactor(0).setDepth(20);
    const layer = this.minimapLayer;
    const world = createWorldState(this.save);

    const markers: MinimapMarker[] = [];
    for (const location of getMapLocations(this.mapId, world)) {
      markers.push({
        x: location.position.x,
        y: location.position.y,
        kind: location.kind === 'gateway' ? 'gateway' : 'landmark'
      });
    }
    for (const npc of getMapNpcs(this.mapId, world)) {
      markers.push({ x: npc.position.x, y: npc.position.y, kind: 'npc' });
    }
    const objective = getTrackedQuestObjective(world);
    if (objective?.status === 'visible' && objective.mapId === this.mapId && objective.position) {
      markers.push({ x: objective.position.x, y: objective.position.y, kind: 'objective' });
    }

    const model = buildMinimap(this.map.width, this.map.height, markers, 132);
    const pad = 8;
    this.minimapOriginX = this.scale.width - model.width - 14;
    this.minimapOriginY = 14;
    this.minimapCell = model.cell;

    layer.add(this.add.rectangle(
      this.minimapOriginX - pad / 2, this.minimapOriginY - pad / 2,
      model.width + pad, model.height + pad, 0x0c121d, 0.72
    ).setOrigin(0, 0).setStrokeStyle(2, 0x3a4a66, 0.9));

    const dotColor: Record<MinimapMarkerKind, number> = {
      player: 0x9ff0ff, gateway: 0x68d7ff, npc: 0xffe08a, landmark: 0xd2b35f, objective: 0xff4fd8
    };
    for (const dot of model.dots) {
      const size = dot.kind === 'gateway' || dot.kind === 'objective' ? model.cell + 1 : model.cell;
      layer.add(this.add.rectangle(
        this.minimapOriginX + dot.px, this.minimapOriginY + dot.py, size, size, dotColor[dot.kind], 0.95
      ).setOrigin(0.5).setAngle(dot.kind === 'objective' ? 45 : 0));
    }

    this.minimapPlayerDot = this.add.circle(0, 0, Math.max(2, model.cell * 0.7), 0x9ff0ff).setStrokeStyle(1, 0xffffff, 0.9);
    layer.add(this.minimapPlayerDot);
    this.updateMinimapPlayer();

    // Gebietsindikator direkt unter der Minimap.
    layer.add(this.add.text(
      this.minimapOriginX + model.width / 2,
      this.minimapOriginY + model.height + 9,
      getMapName(this.mapId),
      { fontFamily: 'sans-serif', fontSize: '13px', color: '#cdeaff' }
    ).setOrigin(0.5, 0));
    if (objective) {
      const objectiveMap = objective.mapId ? getMapName(objective.mapId) : 'unbekannt';
      const location = objective.locationName ?? objective.stepTitle;
      const suffix = objective.status === 'visible'
        ? objective.mapId === this.mapId ? '◆' : objectiveMap
        : 'noch gesperrt';
      layer.add(this.add.text(
        this.minimapOriginX + model.width / 2,
        this.minimapOriginY + model.height + 27,
        `Ziel: ${location} · ${suffix}`,
        { fontFamily: 'sans-serif', fontSize: '11px', color: objective.status === 'visible' ? '#ffd6ff' : '#9fb2cc' }
      ).setOrigin(0.5, 0));
    }
  }

  private updateMinimapPlayer(): void {
    this.minimapPlayerDot?.setPosition(
      this.minimapOriginX + this.pos.x * this.minimapCell + this.minimapCell / 2,
      this.minimapOriginY + this.pos.y * this.minimapCell + this.minimapCell / 2
    );
  }

  // Nach der finalen Wahl (ending.*-Flag gesetzt) einmalig den Ende-Bildschirm zeigen.
  private maybeShowEnding(): void {
    if (!getActiveEnding(createWorldState(this.save)) || this.save.flags['ending.shown']) return;
    this.save = { ...this.save, flags: { ...this.save.flags, 'ending.shown': true } };
    autoSave(window.localStorage, this.save);
    this.scene.launch('Ending');
    this.scene.pause();
  }

  private drawWorldObjects(): void {
    // In einen Layer zeichnen, damit gated Story-Marker beim Resume (nach Dialog/
    // Shop/Menü) mit frischem Save neu gezeichnet werden können — sonst erscheinen
    // freigeschaltete „!"-Encounter erst nach einem Szenenneustart.
    if (this.worldLayer) this.worldLayer.removeAll(true);
    else this.worldLayer = this.add.container(0, 0);
    const layer = this.worldLayer;
    const world = createWorldState(this.save);
    const objective = getTrackedQuestObjective(world);
    for (const location of getMapLocations(this.mapId, world)) {
      const color = location.kind === 'city'
        ? 0x476bff
        : location.kind === 'outpost'
          ? 0x4f8a55
          : location.kind === 'dungeon'
            ? 0x7350a8
            : location.kind === 'gateway'
              ? 0x68d7ff
              : 0xd2b35f;
      if (location.bounds) {
        layer.add(this.add.rectangle(
          this.cx(location.bounds.x) - TILE / 2,
          this.cy(location.bounds.y) - TILE / 2,
          location.bounds.width * TILE,
          location.bounds.height * TILE,
          color,
          0.12
        ).setOrigin(0, 0).setStrokeStyle(2, color, 0.42));
      }
      layer.add(this.add.rectangle(this.cx(location.position.x), this.cy(location.position.y), TILE * 0.86, TILE * 0.86, color, 0.28)
        .setStrokeStyle(2, color, 0.85));
      layer.add(this.add.text(this.cx(location.position.x), this.cy(location.position.y) + 31, location.name, {
        fontFamily: 'sans-serif',
        fontSize: '10px',
        color: '#e9eef7'
      }).setOrigin(0.5));
      // Gateways bekommen ein Reise-Symbol, damit klar ist, dass man hier die Region wechselt.
      if (location.kind === 'gateway') {
        layer.add(this.add.text(this.cx(location.position.x), this.cy(location.position.y), '⇄', {
          fontFamily: 'sans-serif', fontSize: '20px', color: '#cdeeff'
        }).setOrigin(0.5));
      }
      if (objective?.status === 'visible' && objective.locationId === location.id) {
        layer.add(this.add.text(this.cx(location.position.x), this.cy(location.position.y) - 25, '◆ Ziel', {
          fontFamily: 'sans-serif',
          fontSize: '13px',
          color: '#ffd6ff'
        }).setOrigin(0.5).setStroke('#3a1234', 3));
      }
    }

    const triggerEncounters = getVisibleMapEncounters(this.mapId, world).filter(isPlacedTrigger);
    for (const encounter of triggerEncounters) {
      layer.add(this.add.rectangle(this.cx(encounter.position.x), this.cy(encounter.position.y), TILE * 0.72, TILE * 0.72, 0x633050, 0.55)
        .setStrokeStyle(2, 0xff8aa0, 0.8));
      layer.add(this.add.text(this.cx(encounter.position.x), this.cy(encounter.position.y), '!', {
        fontFamily: 'sans-serif',
        fontSize: '20px',
        color: '#ffd6de'
      }).setOrigin(0.5));
    }

    for (const npc of getMapNpcs(this.mapId, world)) {
      layer.add(this.add.rectangle(this.cx(npc.position.x), this.cy(npc.position.y), TILE * 0.62, TILE * 0.62, npc.color, 0.95)
        .setStrokeStyle(2, 0xfff1aa, 0.9));
      layer.add(this.add.text(this.cx(npc.position.x), this.cy(npc.position.y) - 34, npc.name, {
        fontFamily: 'sans-serif',
        fontSize: '11px',
        color: '#e9eef7'
      }).setOrigin(0.5));
      // Quest-Marker: goldenes „!" über NPCs, bei denen ein Gespräch JETZT die
      // Story voranbringt (unterscheidet sich vom pinken Encounter-„!" auf der Kachel).
      // Statisch gehalten, damit beim worldLayer-Neuzeichnen keine Tweens lecken.
      if (npcHasQuestMarker(world, npc.id)) {
        layer.add(this.add.text(this.cx(npc.position.x), this.cy(npc.position.y) - 52, '❗', {
          fontFamily: 'sans-serif',
          fontSize: '20px',
          color: '#ffd34d'
        }).setOrigin(0.5));
      }
    }

    for (const shop of SHOPS.filter((item) => item.mapId === this.mapId)) {
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
    const npc = getAdjacentNpc(this.mapId, this.pos, createWorldState(this.save));
    if (npc) {
      this.scene.launch('Dialogue', { npcId: npc.id });
      this.scene.pause();
      return;
    }
    const shop = getAdjacentShop(this.mapId, this.pos);
    if (shop) {
      this.scene.launch('Shop', { shopId: shop.id });
      this.scene.pause();
      return;
    }
    const gate = getTravelAtTile(this.mapId, this.pos, createWorldState(this.save));
    if (gate?.travelTo) {
      // Region wechseln: Standort im Save setzen und die Szene mit der Zielkarte neu starten.
      this.save = this.withCurrentRangaTravelDiscovery({
        ...this.save,
        location: { mapId: gate.travelTo.mapId, x: gate.travelTo.x, y: gate.travelTo.y, facing: 'down' }
      });
      autoSave(window.localStorage, this.save);
      fadeToScene(this, 'Overworld');
    }
  }

  private resolveEncounterAtCurrentPosition(): void {
    this.stepCount += 1;
    this.save = loadSave(window.localStorage) ?? this.save;
    const result = resolveEncounter(
      createWorldState(this.save),
      this.mapId,
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
    this.save = this.withCurrentRangaTravelDiscovery({
      ...this.save,
      location: {
        mapId: this.mapId,
        x: this.pos.x,
        y: this.pos.y,
        facing: facing === 'up' || facing === 'down' || facing === 'left' || facing === 'right' ? facing : 'down'
      }
    });
    autoSave(window.localStorage, this.save);
  }

  private withCurrentRangaTravelDiscovery(save: SaveGameV2): SaveGameV2 {
    const flags = discoverRangaTravelFlags(createWorldState(save), save.location);
    return flags === save.flags ? save : autoSave(window.localStorage, { ...save, flags });
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

// Eingabe ist bereits map-gefiltert (getVisibleMapEncounters(mapId)) → nur noch
// auf platzierte Trigger prüfen.
function isPlacedTrigger(
  encounter: EncounterDefinition
): encounter is EncounterDefinition & { readonly position: Vec2 } {
  return encounter.kind === 'trigger' && !!encounter.position;
}
