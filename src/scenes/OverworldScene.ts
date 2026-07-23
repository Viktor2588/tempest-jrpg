import Phaser from 'phaser';
import { getMap, getMapName } from '../data/maps';
import { SHOPS, type EncounterDefinition } from '../data/world';
import { autoSave, createNewSave, loadSave, type SaveGameV2 } from '../systems/save';
import { layoutOverworldHud, layoutOverworldTouchControls } from '../systems/mobileLayout';
import { buildMinimap, type MinimapMarker, type MinimapMarkerKind } from '../systems/minimap';
import {
  completeOverworldOnboardingStep,
  getPendingOverworldTutorialHints,
  shouldShowOverworldTutorial,
  type OverworldOnboardingStep
} from '../systems/tutorial';
import {
  isWalkable,
  markerLabelVisible,
  overworldActorDepth,
  tileKey,
  tryStep,
  WALL,
  type Dir,
  type TileMap,
  type Vec2
} from '../systems/overworld';
import {
  firstAvailableOverworldPlayerTexture,
  OVERWORLD_WALK_BOB_PX,
  overworldPlayerFlipX
} from '../render/overworldArt';
import { firstAvailableOverworldTileTexture } from '../render/overworldTileArt';
import { addRegionBannerImage, regionBannerTextureForMap } from '../render/regionBannerArt';
import { portraitKindForSpeaker, portraitKey } from '../render/portraitAtlas';
import { addUiPortraitFrame } from '../render/uiSkin';
import {
  configureHiDpiScene,
  hudZoomOffset,
  LOGICAL_GAME_HEIGHT as GAME_HEIGHT,
  LOGICAL_GAME_WIDTH as GAME_WIDTH
} from '../render/hiDpi';
import { discoverRangaTravelFlags } from '../systems/rangaTravel';
import { acknowledgeMilestone, getPendingMilestone } from '../systems/milestones';
import { getMapDiscoveries, getMapDiscoveryAt } from '../systems/mapDiscovery';
import { createSceneRunner, type SceneScript, type SceneStep } from '../systems/sceneScript';
import { acknowledgeScene, getPendingScene } from '../data/scenes';
import { acknowledgeBondScene, bondSceneToScript, getPendingBondScene } from '../systems/bondScenes';
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
import { clockAt, clockHudLabel, openingFieldElement, openingStatusesWarded, overworldTint, FOG_WARD_FLAG } from '../systems/worldClock';
import { overworldMusicTrack, playMusic, resumeMusic } from '../audio/music';
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
  private player!: Phaser.GameObjects.Container;
  private playerVisual!: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle;
  private playerShadow!: Phaser.GameObjects.Ellipse;
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
  private onboardingLayer?: Phaser.GameObjects.Container;
  // Phase 101 — Welt-Uhr: HUD-Zeile mit Tageszeit + Wetter.
  private clockHud?: Phaser.GameObjects.Text;
  // Phase 175 — Tag/Nacht faerbt die Oberwelt: kosmetischer Tint-Overlay (ueber den
  // Kacheln, unter dem HUD). Rein visuell, keine Kampf-/Save-/Balance-Beruehrung.
  private clockTint?: Phaser.GameObjects.Rectangle;
  // Zoom-Kompensation für fixe HUD-Elemente (0 bei DPR 1). Siehe hudZoomOffset.
  private hudOffset = { x: 0, y: 0 };
  // Cutscene-light: aktive Szene sperrt Bewegung/Interaktion; Akteur-Sprites
  // werden pro Zeichnung registriert, damit Schritte sie ansprechen koennen.
  private cutsceneActive = false;
  private actorSprites = new Map<string, Phaser.GameObjects.GameObject & { x: number; y: number }>();

  constructor() {
    super('Overworld');
  }

  create(): void {
    configureHiDpiScene(this);
    // Diese Kamera folgt dem Spieler und nutzt Bounds; Phasers clampX/Follow
    // erwarten den Standard-Ursprung 0.5, daher hier zurücksetzen. Fixe HUD-
    // Elemente werden stattdessen per hudOffset gegen den Zoom kompensiert.
    this.cameras.main.setOrigin(0.5, 0.5);
    this.hudOffset = hudZoomOffset();
    this.save = loadSave(window.localStorage) ?? createNewSave();
    this.save = this.withCurrentRangaTravelDiscovery(this.save);
    this.mapId = this.save.location.mapId;
    const map = this.map = getMap(this.mapId, this.save.flags);
    fadeIn(this); // sanftes Einblenden (auch beim Rückkehren aus dem Kampf)
    playMusic(overworldMusicTrack(this.mapId));
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

    // Kacheln: regionale Imagegen-Tiles → echte CC0-Kenney-Kacheln → Platzhalter → Rechteck-Fallback.
    const tileKey = (wall: boolean): string | null => {
      return firstAvailableOverworldTileTexture(
        this.mapId,
        wall,
        (textureKey) => this.textures.exists(textureKey),
        this.save.flags
      );
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

    // Spieler — Rimuru-Schleim-Asset → Legacy-CC0-Sprite → Platzhalter → Rechteck.
    // Gespeicherte Position nur übernehmen, wenn sie auf der aktuellen Karte begehbar ist.
    const saved = { x: this.save.location.x, y: this.save.location.y };
    this.pos = isWalkable(map, saved.x, saved.y) ? saved : { ...map.spawn };
    const heroKey = firstAvailableOverworldPlayerTexture((textureKey) => this.textures.exists(textureKey));
    this.playerShadow = this.add.ellipse(0, 1, TILE * 0.56, TILE * 0.16, 0x06111f, 0.3);
    this.playerVisual = heroKey
      ? this.add.image(0, 0, heroKey).setDisplaySize(TILE * 0.82, TILE * 0.82)
      : this.add.rectangle(0, 0, TILE * 0.62, TILE * 0.62, 0x68d7ff).setStrokeStyle(2, 0xcdeaff);
    this.playerVisual.setOrigin(0.5, 1);
    this.player = this.add.container(this.cx(this.pos.x), this.cy(this.pos.y), [this.playerShadow, this.playerVisual])
      .setSize(TILE, TILE)
      .setDepth(overworldActorDepth(this.pos.y, this.map.height));
    this.setPlayerFacing(this.save.location.facing);

    this.drawWorldObjects();
    this.minimapLayer = undefined; // wiederverwendete Instanz: alter Container ist zerstört.
    this.drawMinimap();

    // Nach Rückkehr aus Dialog/Shop/Menü (scene.resume) den Save neu laden und die
    // Story-Marker neu zeichnen, damit freigeschaltete Encounter sofort sichtbar sind.
    // off vor on: create() läuft bei jedem scene.start erneut → sonst sammeln sich
    // Listener auf der (wiederverwendeten) Szenen-Instanz an.
    this.events.off(Phaser.Scenes.Events.RESUME, this.onResume, this);
    this.events.on(Phaser.Scenes.Events.RESUME, this.onResume, this);

    // Kamera folgt, begrenzt auf die Kartengröße. Karten, die kleiner als der
    // Viewport sind (z.B. die Starthöhle 768×480 < 960×540), würde Phaser sonst
    // links-oben verankern statt zu zentrieren → Bounds auf mind. Viewport-Größe
    // erweitern und auf der Karte zentrieren, dann klemmt die Kamera mittig.
    const worldW = map.width * TILE;
    const worldH = map.height * TILE;
    const boundW = Math.max(worldW, GAME_WIDTH);
    const boundH = Math.max(worldH, GAME_HEIGHT);
    this.cameras.main.setBounds((worldW - boundW) / 2, (worldH - boundH) / 2, boundW, boundH);
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
    const touchControls = layoutOverworldTouchControls({ width: GAME_WIDTH, height: GAME_HEIGHT });
    const interactRect = touchControls.interact;
    const interactX = interactRect.x + this.hudOffset.x;
    const interactY = interactRect.y + this.hudOffset.y;
    const interactBtn = this.add.rectangle(interactX, interactY, interactRect.width, interactRect.height, 0x1f3a2f, 0.68)
      .setScrollFactor(0).setDepth(10).setStrokeStyle(2, 0x75ffab, 0.7).setInteractive();
    this.add.text(interactX, interactY, '◆', { fontFamily: 'sans-serif', fontSize: '24px', color: '#d9ffe7' })
      .setOrigin(0.5).setScrollFactor(0).setDepth(11);
    interactBtn.on('pointerdown', interact);

    // Demo-Kampf nur noch unsichtbar per Enter (kein HUD-Knopf mehr — oben rechts
    // gehört der Übersicht/Minimap); echte Kämpfe laufen über Begegnungen.
    this.input.keyboard?.on('keydown-ENTER', () => battleWipe(this, 'Battle'));

    // Menü-Overlay (Phase 4): pausiert die Oberwelt, Szene rendert über ihr.
    const openMenu = () => {
      if (this.scene.isActive('Menu')) return;
      this.completeOnboardingStep('menu');
      this.scene.launch('Menu');
      this.scene.pause();
    };
    this.input.keyboard?.on('keydown-M', openMenu);
    const hud = layoutOverworldHud({ width: GAME_WIDTH, height: GAME_HEIGHT });
    const menuRect = hud.menu;
    const menuX = menuRect.x + this.hudOffset.x;
    const menuY = menuRect.y + this.hudOffset.y;
    const menuBtn = this.add.rectangle(menuX, menuY, menuRect.width, menuRect.height, 0x223049, 0.9)
      .setScrollFactor(0).setDepth(10).setStrokeStyle(2, 0x68d7ff, 0.7).setInteractive();
    this.add.text(menuX, menuY, '☰ Menü (M)', { fontFamily: 'sans-serif', fontSize: '14px', color: '#d8ecff' })
      .setOrigin(0.5).setScrollFactor(0).setDepth(11);
    menuBtn.on('pointerdown', openMenu);

    // Phase 175 — Tag/Nacht-Tint: bildschirmfuellender Overlay ueber den Kacheln (Depth 5),
    // aber unter dem HUD (Depth 10+); fixiert an der Kamera, nicht interaktiv.
    this.clockTint = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(5);
    this.clockTint.disableInteractive();

    // Phase 101 — Welt-Uhr: Tageszeit/Wetter-Anzeige unter dem Menüknopf.
    this.clockHud = this.add.text(menuX, menuY + menuRect.height / 2 + 12, '', {
      fontFamily: 'sans-serif', fontSize: '12px', color: '#bfe0ff'
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(11);
    this.refreshClockHud();

    this.drawOnboardingHints();
    this.time.delayedCall(180, () => {
      if (!this.maybePlayScene()) this.maybeShowMilestone();
    });
  }

  // Nicht blockierendes Onboarding: offene Schritte bleiben sichtbar, erledigte
  // Schritte verschwinden nach erfolgreicher Nutzung (Bewegung/Interaktion/Menü).
  private drawOnboardingHints(): void {
    if (this.onboardingLayer) this.onboardingLayer.removeAll(true);
    else this.onboardingLayer = this.add.container(this.hudOffset.x, this.hudOffset.y).setScrollFactor(0).setDepth(35);
    const layer = this.onboardingLayer;
    const hints = getPendingOverworldTutorialHints(this.save.flags);
    if (hints.length === 0) {
      layer.setVisible(false);
      return;
    }
    layer.setVisible(true);

    const hud = layoutOverworldHud({ width: GAME_WIDTH, height: GAME_HEIGHT });
    const touchControls = layoutOverworldTouchControls({ width: GAME_WIDTH, height: GAME_HEIGHT });
    const panelX = 16;
    const panelW = 330;
    const panelH = 44 + hints.length * 44;
    // Oben-links verankern: die Touch-Controls (Steuerkreuz unten links,
    // Interaktions-Button unten rechts) bleiben frei statt vom Panel verdeckt.
    const panelY = 112;
    layer.add(this.add.rectangle(panelX, panelY, panelW, panelH, 0x0b1220, 0.88)
      .setOrigin(0, 0).setStrokeStyle(2, 0x68d7ff, 0.7));
    layer.add(this.add.text(panelX + 14, panelY + 10, 'Onboarding', {
      fontFamily: 'serif',
      fontSize: '18px',
      color: '#e9c56c'
    }));

    hints.forEach((hint, index) => {
      const y = panelY + 42 + index * 44;
      layer.add(this.add.text(panelX + 16, y, `${hint.arrow} ${hint.icon}`, {
        fontFamily: 'sans-serif',
        fontSize: '16px',
        color: '#cdeaff'
      }));
      layer.add(this.add.text(panelX + 72, y - 2, hint.title, {
        fontFamily: 'sans-serif',
        fontSize: '13px',
        color: '#f4e4a8'
      }));
      layer.add(this.add.text(panelX + 150, y - 2, hint.body, {
        fontFamily: 'sans-serif',
        fontSize: '11px',
        color: '#cbd6e8',
        wordWrap: { width: 160 }
      }));
    });

    if (hints.some((hint) => hint.step === 'interact')) {
      const rect = touchControls.interact;
      // Rechtsbündig am Button-Rand: das Label lief sonst über den rechten
      // Viewport-Rand (Button sitzt am äußersten rechten HUD-Rand).
      layer.add(this.add.text(rect.x + rect.width / 2, rect.y - rect.height / 2 - 18, '↘ Interaktion nutzen', {
        fontFamily: 'sans-serif',
        fontSize: '12px',
        color: '#d9ffe7'
      }).setOrigin(1, 0.5).setStroke('#082012', 3));
    }
    if (hints.some((hint) => hint.step === 'menu')) {
      const rect = hud.menu;
      layer.add(this.add.text(rect.x, rect.y + rect.height / 2 + 18, '↗ Menü öffnen', {
        fontFamily: 'sans-serif',
        fontSize: '12px',
        color: '#d8ecff'
      }).setOrigin(0.5).setStroke('#06111f', 3));
    }
    if (hints.some((hint) => hint.step === 'move')) {
      const first = touchControls.dpad[0];
      const centerX = first ? first.x + 44 : 92;
      const centerY = first ? first.y - 58 : GAME_HEIGHT - 118;
      layer.add(this.add.text(centerX, centerY, '↙ Bewegen', {
        fontFamily: 'sans-serif',
        fontSize: '12px',
        color: '#cdeaff'
      }).setOrigin(0.5).setStroke('#06111f', 3));
    }
  }

  private completeOnboardingStep(step: OverworldOnboardingStep): void {
    if (!shouldShowOverworldTutorial(this.save.flags)) return;
    const flags = completeOverworldOnboardingStep(this.save.flags, step);
    if (flags === this.save.flags) return;
    this.save = { ...this.save, flags };
    autoSave(window.localStorage, this.save);
    this.drawOnboardingHints();
  }

  override update(): void {
    if (this.moving || this.cutsceneActive) return;
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
    this.setPlayerFacing(dir);
    // Sichtbare NPCs blockieren ihre Kachel (Kollision) — man bleibt davor stehen
    // und kann sie von dort ansprechen, statt durch sie hindurchzulaufen.
    const blocked = new Set(
      getMapNpcs(this.mapId, createWorldState(this.save)).map((npc) => tileKey(npc.position.x, npc.position.y))
    );
    const next = tryStep(this.map, this.pos, dir, blocked);
    if (next.x === this.pos.x && next.y === this.pos.y) return; // blockiert
    this.pos = next;
    this.moving = true;
    this.player.setDepth(overworldActorDepth(next.y, this.map.height));
    this.updateMinimapPlayer();
    this.persistPosition(dir);
    this.completeOnboardingStep('move');
    this.playWalkBob();
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
    this.drawOnboardingHints();
    if (this.maybePlayScene()) return;
    if (this.maybeShowMilestone()) return;
    this.maybeShowEnding();
  }

  private maybeShowMilestone(): boolean {
    if (this.scene.isActive('Milestone') || this.scene.isActive('Ending')) return false;
    const milestone = getPendingMilestone(this.save);
    if (!milestone) return false;

    this.save = {
      ...this.save,
      flags: acknowledgeMilestone(this.save.flags, milestone.id)
    };
    autoSave(window.localStorage, this.save);
    this.scene.launch('Milestone', { milestoneId: milestone.id });
    this.scene.pause();
    return true;
  }

  // Cutscene-light: spielt den naechsten ausgeloesten Beat visuell in der
  // Oberwelt ab (Text/Emote/Kamera/Face/Warten). Danach folgt die Zusammenfassung
  // als Toast plus ggf. der bestehende Meilenstein — der Moment wird gezeigt,
  // nicht mehr vorab erzaehlt.
  private maybePlayScene(): boolean {
    if (this.cutsceneActive) return false;
    if (this.scene.isActive('Milestone') || this.scene.isActive('Ending')) return false;
    const script = getPendingScene(this.save.flags);
    if (script) {
      this.playScene(script, (flags) => acknowledgeScene(flags, script.id));
      return true;
    }
    // Phase 98 — Bande: faellige Bindungs-Szene (nach den Story-Beats) spielen. Gegatet
    // ueber die erreichte Bindungsstufe (Punkte aus Kampf-Siegen) + Verfuegbarkeit im
    // Roster; sie erscheinen bei Gelegenheit im normalen Reisefluss.
    const rosterIds = new Set<string>([
      ...this.save.party.active.map((member) => member.characterId),
      ...this.save.party.reserve.map((member) => member.characterId)
    ]);
    const pending = getPendingBondScene(this.save.progression, this.save.flags, rosterIds);
    if (pending) {
      const bondScript = bondSceneToScript(pending.relationship, pending.scene);
      this.playScene(bondScript, (flags) => acknowledgeBondScene(flags, pending.scene.id));
      return true;
    }
    return false;
  }

  private playScene(
    script: SceneScript,
    acknowledge: (flags: Readonly<Record<string, boolean>>) => Readonly<Record<string, boolean>>
  ): void {
    this.cutsceneActive = true;
    this.cameras.main.stopFollow(); // Kamera waehrend der Szene selbst fuehren.
    const runner = createSceneRunner(script);

    const layer = this.add.container(this.hudOffset.x, this.hudOffset.y).setScrollFactor(0).setDepth(60);
    layer.add(this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x05070d, 0.34).setOrigin(0, 0));
    const boxH = 116;
    const box = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - boxH / 2 - 16, GAME_WIDTH - 40, boxH, 0x0b1220, 0.94)
      .setStrokeStyle(2, 0x68d7ff, 0.8);
    const speaker = this.add.text(box.x - box.width / 2 + 18, box.y - boxH / 2 + 12, '', {
      fontFamily: 'serif', fontSize: '16px', color: '#e9c56c'
    });
    const line = this.add.text(box.x - box.width / 2 + 18, box.y - boxH / 2 + 40, '', {
      fontFamily: 'sans-serif', fontSize: '15px', color: '#e9eef7', wordWrap: { width: box.width - 36 }
    });
    const hint = this.add.text(box.x + box.width / 2 - 16, box.y + boxH / 2 - 18, '▸ Weiter (Leertaste / Tippen)', {
      fontFamily: 'sans-serif', fontSize: '11px', color: '#9fb2cc'
    }).setOrigin(1, 0);
    layer.add([box, speaker, line, hint]);
    const textUi = { box, speaker, line, hint };

    const finish = (): void => {
      layer.destroy();
      this.cameras.main.startFollow(this.player, true, 0.18, 0.18);
      this.save = { ...this.save, flags: acknowledge(this.save.flags) };
      autoSave(window.localStorage, this.save);
      this.cutsceneActive = false;
      if (script.summary) this.showSceneSummary(script.summary.title, script.summary.body);
      // Zusammenfassung kurz stehen lassen, dann bestehende Meilenstein-/Ende-Kette.
      this.time.delayedCall(script.summary ? 1500 : 0, () => {
        if (!this.maybeShowMilestone()) this.maybeShowEnding();
      });
    };

    const advance = (step: SceneStep | null): void => {
      if (!step) { finish(); return; }
      this.renderSceneStep(step, textUi, () => advance(runner.advance()));
    };
    advance(runner.current());
  }

  private renderSceneStep(
    step: SceneStep,
    ui: {
      box: Phaser.GameObjects.Rectangle;
      speaker: Phaser.GameObjects.Text;
      line: Phaser.GameObjects.Text;
      hint: Phaser.GameObjects.Text;
    },
    next: () => void
  ): void {
    const setTextVisible = (visible: boolean): void => {
      ui.box.setVisible(visible);
      ui.speaker.setVisible(visible);
      ui.line.setVisible(visible);
      ui.hint.setVisible(visible);
    };
    switch (step.kind) {
      case 'text': {
        setTextVisible(true);
        ui.speaker.setText(step.speaker ?? '');
        ui.line.setText(step.line);
        // Auf die naechste Eingabe warten (Tastatur oder Tippen), dann weiter.
        const onAdvance = (): void => {
          this.input.keyboard?.off('keydown-SPACE', onAdvance);
          this.input.keyboard?.off('keydown-ENTER', onAdvance);
          this.input.off('pointerdown', onAdvance);
          next();
        };
        this.input.keyboard?.once('keydown-SPACE', onAdvance);
        this.input.keyboard?.once('keydown-ENTER', onAdvance);
        this.input.once('pointerdown', onAdvance);
        return;
      }
      case 'emote': {
        setTextVisible(false);
        const at = this.actorSprites.get(step.actor);
        const bx = at?.x ?? this.player.x;
        const by = (at?.y ?? this.player.y) - 34;
        const bubble = this.add.text(bx, by, step.emote, {
          fontFamily: 'sans-serif', fontSize: '26px', color: '#fff1aa'
        }).setOrigin(0.5).setDepth(61).setStroke('#06111f', 4);
        this.time.delayedCall(650, () => { bubble.destroy(); next(); });
        return;
      }
      case 'camera': {
        setTextVisible(false);
        this.cameras.main.pan(this.cx(step.to.x), this.cy(step.to.y), 420, 'Sine.easeInOut', false,
          (_cam, progress) => { if (progress >= 1) next(); });
        return;
      }
      case 'move': {
        setTextVisible(false);
        const at = this.actorSprites.get(step.actor);
        if (!at) { next(); return; }
        this.tweens.add({ targets: at, x: this.cx(step.to.x), y: this.cy(step.to.y), duration: 320, onComplete: next });
        return;
      }
      case 'give': {
        // ponytail: keine der aktuellen 4 Szenen nutzt `give`; als Toast quittieren
        // statt still zu schlucken. Echte Inventar-Uebergabe nachziehen, falls Szenen sie brauchen.
        this.showSceneSummary('Erhalten', `${step.quantity}× ${step.itemId}`);
        next();
        return;
      }
      case 'wait': {
        setTextVisible(false);
        this.time.delayedCall(Math.max(0, step.ms), next);
        return;
      }
      case 'face': {
        // ponytail: Akteure sind Rechteck-Marker ohne Blickrichtung → keine Darstellung.
        next();
        return;
      }
    }
  }

  private showSceneSummary(title: string, body: string): void {
    const layer = this.add.container(this.hudOffset.x, this.hudOffset.y).setScrollFactor(0).setDepth(58);
    const w = Math.min(GAME_WIDTH - 40, 560);
    const panel = this.add.rectangle(GAME_WIDTH / 2, 70, w, 78, 0x0b1220, 0.94).setStrokeStyle(2, 0xe9c56c, 0.8);
    layer.add(panel);
    layer.add(this.add.text(panel.x, panel.y - 22, title, {
      fontFamily: 'serif', fontSize: '17px', color: '#e9c56c'
    }).setOrigin(0.5));
    layer.add(this.add.text(panel.x, panel.y + 8, body, {
      fontFamily: 'sans-serif', fontSize: '12px', color: '#cbd6e8', align: 'center', wordWrap: { width: w - 28 }
    }).setOrigin(0.5));
    this.tweens.add({ targets: layer, alpha: 0, delay: 2600, duration: 600, onComplete: () => layer.destroy() });
  }

  // Fixierte Minimap oben rechts: Marker-Radar (Spieler/Gateway/NPC/Landmark) zur
  // Orientierung, da die Karten größer als der Bildschirm sind und die Kamera folgt.
  private drawMinimap(): void {
    if (this.minimapLayer) this.minimapLayer.removeAll(true);
    else this.minimapLayer = this.add.container(this.hudOffset.x, this.hudOffset.y).setScrollFactor(0).setDepth(20);
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
    this.minimapOriginX = GAME_WIDTH - model.width - 14;
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
    const areaName = getMapName(this.mapId, this.save.flags);
    const bannerW = Math.max(118, model.width + 8);
    const bannerH = Math.round(bannerW / 4);
    const bannerX = this.minimapOriginX + model.width / 2;
    const bannerY = this.minimapOriginY + model.height + 8;
    const bannerKey = regionBannerTextureForMap(
      this.mapId,
      (textureKey) => this.textures.exists(textureKey),
      this.save.flags
    );
    if (bannerKey) {
      layer.add(addRegionBannerImage(this, bannerX, bannerY, bannerKey, bannerW, bannerH).setOrigin(0.5, 0));
      layer.add(this.add.rectangle(bannerX, bannerY, bannerW, bannerH, 0x030812, 0.28).setOrigin(0.5, 0));
    } else {
      layer.add(this.add.rectangle(bannerX, bannerY, bannerW, bannerH, 0x101827, 0.86)
        .setOrigin(0.5, 0).setStrokeStyle(1, 0x3a4a66, 0.9));
    }
    layer.add(this.add.text(
      bannerX,
      bannerY + bannerH / 2,
      areaName,
      {
        fontFamily: 'sans-serif',
        fontSize: areaName.length > 16 ? '10px' : '12px',
        color: '#f5fbff'
      }
    ).setOrigin(0.5).setStroke('#04111d', 3));
    if (objective) {
      const objectiveMap = objective.mapId ? getMapName(objective.mapId, this.save.flags) : 'unbekannt';
      const location = objective.locationName ?? objective.stepTitle;
      const suffix = objective.status === 'visible'
        ? objective.mapId === this.mapId ? '◆' : objectiveMap
        : 'noch gesperrt';
      layer.add(this.add.text(
        this.minimapOriginX + model.width / 2,
        bannerY + bannerH + 5,
        `Ziel: ${location} · ${suffix}`,
        {
          fontFamily: 'sans-serif',
          fontSize: '10px',
          color: objective.status === 'visible' ? '#ffd6ff' : '#9fb2cc',
          wordWrap: { width: Math.max(144, model.width + 28) }
        }
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
    // Akteur-Register fuer Szenen-Skripte neu aufbauen (Sprites werden neu gezeichnet).
    this.actorSprites.clear();
    if (this.player) this.actorSprites.set('rimuru', this.player);
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
      const isObjective = objective?.status === 'visible' && objective.locationId === location.id;
      // Phase 107 — Region nur dezent umranden statt gefuellt zukleistern.
      if (location.bounds) {
        layer.add(this.add.rectangle(
          this.cx(location.bounds.x) - TILE / 2,
          this.cy(location.bounds.y) - TILE / 2,
          location.bounds.width * TILE,
          location.bounds.height * TILE,
          color,
          0
        ).setOrigin(0, 0).setStrokeStyle(1, color, 0.22));
      }
      // Punkt-Marker entstoeren: nur zeichnen, wenn er JETZT etwas bedeutet — ein
      // Gateway (Regionswechsel), das aktuelle Ziel oder eine Ortschaft nahe am
      // Spieler. Sonst bleibt der Boden frei von verstreuten Farbkreisen.
      const isGateway = location.kind === 'gateway';
      const nearPlayer = markerLabelVisible(this.pos, location.position, isObjective);
      if (isGateway || isObjective || nearPlayer) {
        layer.add(this.add.circle(this.cx(location.position.x), this.cy(location.position.y), TILE * 0.26, color, isObjective ? 0.5 : 0.3)
          .setStrokeStyle(2, color, isObjective ? 0.95 : 0.6));
      }
      // Gateways bekommen ein Reise-Symbol, damit klar ist, dass man hier die Region wechselt.
      if (isGateway) {
        layer.add(this.add.text(this.cx(location.position.x), this.cy(location.position.y), '⇄', {
          fontFamily: 'sans-serif', fontSize: '18px', color: '#cdeeff'
        }).setOrigin(0.5).setStroke('#0a1a24', 3));
      }
      // Ortsname nahe Spieler/am Ziel — Gateways (Reiseziele) IMMER, damit klar ist,
      // wohin ein Übergang führt (vorher flackerten die Namen je nach Nähe).
      if (isGateway || nearPlayer) {
        layer.add(this.add.text(this.cx(location.position.x), this.cy(location.position.y) + 28, location.name, {
          fontFamily: 'sans-serif',
          fontSize: '10px',
          color: '#e9eef7'
        }).setOrigin(0.5).setStroke('#0a0f1a', 3));
      }
      if (isObjective) {
        layer.add(this.add.text(this.cx(location.position.x), this.cy(location.position.y) - 25, '◆ Ziel', {
          fontFamily: 'sans-serif',
          fontSize: '13px',
          color: '#ffd6ff'
        }).setOrigin(0.5).setStroke('#3a1234', 3));
      }
    }

    const triggerEncounters = getVisibleMapEncounters(this.mapId, world).filter(isPlacedTrigger);
    for (const encounter of triggerEncounters) {
      layer.add(this.add.circle(this.cx(encounter.position.x), this.cy(encounter.position.y), TILE * 0.24, 0x9c2f57, 0.42)
        .setStrokeStyle(2, 0xff8aa0, 0.7));
      layer.add(this.add.text(this.cx(encounter.position.x), this.cy(encounter.position.y), '!', {
        fontFamily: 'sans-serif',
        fontSize: '18px',
        color: '#ffd6de'
      }).setOrigin(0.5).setStroke('#3a0a1c', 3));
    }

    // Entdeckungen: Glitzerpunkte mit Lore + Belohnung (Erkundungsanreiz); nur
    // sichtbar, solange nicht eingesammelt (und ggf. erst nach Weltveraenderung).
    for (const discovery of getMapDiscoveries(
      this.mapId,
      this.save.flags,
      clockAt(this.save.clockStep ?? 0, this.save.seed)
    )) {
      layer.add(this.add.circle(this.cx(discovery.x), this.cy(discovery.y), TILE * 0.24, 0x1f6f66, 0.36)
        .setStrokeStyle(2, 0x8affe4, 0.7));
      layer.add(this.add.text(this.cx(discovery.x), this.cy(discovery.y), '✦', {
        fontFamily: 'sans-serif',
        fontSize: '18px',
        color: '#b7ffe9'
      }).setOrigin(0.5).setStroke('#08201c', 3));
    }

    for (const npc of getMapNpcs(this.mapId, world)) {
      const npcX = this.cx(npc.position.x);
      const npcY = this.cy(npc.position.y);
      // Porträt-Token für benannte Figuren (aus dem Porträt-Atlas, per Name gemappt);
      // ersetzt die alten einfarbigen Quadrate. Für abstrakte Ortsdienste ohne
      // Figur bleibt ein dezentes Farb-Token als Fallback.
      const portraitKind = portraitKindForSpeaker(npc.name);
      const portraitTexture = portraitKind ? portraitKey(portraitKind) : null;
      let npcSprite: Phaser.GameObjects.GameObject & { x: number; y: number };
      if (portraitTexture && this.textures.exists(portraitTexture)) {
        const size = TILE * 0.62;
        layer.add(addUiPortraitFrame(this, npcX, npcY, size));
        npcSprite = this.add.image(npcX, npcY, portraitTexture).setDisplaySize(size, size);
        layer.add(npcSprite);
      } else {
        npcSprite = this.add.circle(npcX, npcY, TILE * 0.29, npc.color, 0.92)
          .setStrokeStyle(2, 0x15100a, 0.55);
        layer.add(npcSprite);
      }
      this.actorSprites.set(npc.id, npcSprite);
      // Name normalerweise über dem Marker; bei NPCs in den obersten Reihen nach
      // unten kippen, sonst wird der Name (und der Quest-Marker darüber) am oberen
      // Kartenrand abgeschnitten (z. B. „König Gazel Dwargo" im Dwargon-Thronsaal).
      const flipDown = npc.position.y <= 1;
      const nameY = this.cy(npc.position.y) + (flipDown ? 34 : -34);
      // Namens-Label nur nahe am Spieler oder bei aktivem Quest-Marker zeigen —
      // sonst überlappen auf dichten Karten (Tempest) ~10 NPC-Namen zu einem Brei.
      const hasQuestMarker = npcHasQuestMarker(world, npc.id);
      if (hasQuestMarker || markerLabelVisible(this.pos, npc.position, false)) {
        layer.add(this.add.text(this.cx(npc.position.x), nameY, npc.name, {
          fontFamily: 'sans-serif',
          fontSize: '11px',
          color: '#e9eef7'
        }).setOrigin(0.5).setStroke('#0a0f1a', 3));
      }
      // Quest-Marker: goldenes „!" bei NPCs, bei denen ein Gespräch JETZT die
      // Story voranbringt (unterscheidet sich vom pinken Encounter-„!" auf der Kachel).
      // Statisch gehalten, damit beim worldLayer-Neuzeichnen keine Tweens lecken.
      if (hasQuestMarker) {
        layer.add(this.add.text(this.cx(npc.position.x), nameY + (flipDown ? 18 : -18), '❗', {
          fontFamily: 'sans-serif',
          fontSize: '20px',
          color: '#ffd34d'
        }).setOrigin(0.5));
      }
    }

    for (const shop of SHOPS.filter((item) => item.mapId === this.mapId)) {
      const x = this.cx(shop.position.x);
      const y = this.cy(shop.position.y);
      if (this.textures.exists('ui-shop-merchant-vignette')) {
        const size = TILE * 0.7;
        layer.add(addUiPortraitFrame(this, x, y, size));
        layer.add(this.add.image(x, y, 'ui-shop-merchant-vignette')
          .setCrop(64, 0, 256, 256)
          .setDisplaySize(size, size));
      } else {
        layer.add(this.add.rectangle(x, y, TILE * 0.7, TILE * 0.7, 0x2f6f55, 0.95)
          .setStrokeStyle(2, 0x8affc1, 0.9));
        layer.add(this.add.text(x, y, '店', {
          fontFamily: 'sans-serif',
          fontSize: '18px',
          color: '#e9eef7'
        }).setOrigin(0.5));
      }
    }
  }

  private interact(): void {
    if (this.moving || this.cutsceneActive) return;
    const npc = getAdjacentNpc(this.mapId, this.pos, createWorldState(this.save));
    if (npc) {
      this.completeOnboardingStep('interact');
      this.scene.launch('Dialogue', { npcId: npc.id });
      this.scene.pause();
      return;
    }
    const shop = getAdjacentShop(this.mapId, this.pos);
    if (shop) {
      this.completeOnboardingStep('interact');
      this.scene.launch('Shop', { shopId: shop.id });
      this.scene.pause();
      return;
    }
    const gate = getTravelAtTile(this.mapId, this.pos, createWorldState(this.save));
    if (gate?.travelTo) {
      this.completeOnboardingStep('interact');
      // Region wechseln: Standort im Save setzen und die Szene mit der Zielkarte neu starten.
      this.save = this.withCurrentRangaTravelDiscovery({
        ...this.save,
        location: { mapId: gate.travelTo.mapId, x: gate.travelTo.x, y: gate.travelTo.y, facing: 'down' }
      });
      autoSave(window.localStorage, this.save);
      fadeToScene(this, 'Overworld');
    }
  }

  // Phase 101 — Welt-Uhr: HUD-Zeile aus dem aktuellen clockStep + Seed neu setzen.
  // Phase 175 — dabei den Tag/Nacht-Tint der Oberwelt aktualisieren.
  private refreshClockHud(): void {
    const clock = clockAt(this.save.clockStep ?? 0, this.save.seed);
    if (this.clockHud) {
      this.clockHud.setText(clockHudLabel(clock));
    }
    if (this.clockTint) {
      const tint = overworldTint(clock);
      if (tint) {
        this.clockTint.setFillStyle(tint.color, tint.alpha).setVisible(true);
      } else {
        this.clockTint.setVisible(false);
      }
    }
  }

  private resolveEncounterAtCurrentPosition(): void {
    this.stepCount += 1;
    this.save = loadSave(window.localStorage) ?? this.save;
    // Phase 101 — Welt-Uhr: jeder Schritt lässt die Zeit voranschreiten. Persistiert,
    // damit Tageszeit/Wetter über Speichern/Laden hinweg konsistent bleiben.
    this.save = { ...this.save, clockStep: (this.save.clockStep ?? 0) + 1 };
    autoSave(window.localStorage, this.save);
    this.refreshClockHud();
    // Entdeckung auf der Kachel hat Vorrang vor einem Zufallskampf: als Modal
    // zeigen, Belohnung/Flag setzt die Discovery-Szene; danach neu zeichnen.
    if (getMapDiscoveryAt(
      this.mapId,
      this.pos.x,
      this.pos.y,
      this.save.flags,
      clockAt(this.save.clockStep ?? 0, this.save.seed)
    )) {
      this.scene.launch('Discovery', { mapId: this.mapId, x: this.pos.x, y: this.pos.y });
      this.scene.pause();
      return;
    }
    const result = resolveEncounter(
      createWorldState(this.save),
      this.mapId,
      this.pos,
      makeRng((this.save.seed + this.stepCount * 101 + this.pos.x * 17 + this.pos.y * 31) >>> 0)
    );
    this.save = applyWorldState(this.save, result.state.world);
    autoSave(window.localStorage, this.save);

    if (result.state.encounter) {
      // Phase 101 — Welt-Uhr: Zeit/Wetter des Encounters bestimmen das Eröffnungs-
      // Elementarfeld (Regen=Wasser, Nacht=Schatten); tagsüber/klar bleibt es neutral.
      const clock = clockAt(this.save.clockStep ?? 0, this.save.seed);
      // Phase 178 — Nebelsicht: ein geladener Nebel-Ward (Klarsichttropfen) hebt die
      // Nebel-Eroeffnungsblendung dieses Kampfes auf und verbraucht sich dabei einmalig
      // (nur bei Nebel — sonst bleibt der Ward geladen). Off-Harness (Auto-Battle nutzt keine Uhr).
      const warded = openingStatusesWarded(clock, this.save.flags);
      if (warded.wardConsumed) {
        this.save = { ...this.save, flags: { ...this.save.flags, [FOG_WARD_FLAG]: false } };
        autoSave(window.localStorage, this.save);
      }
      battleWipe(this, 'Battle', {
        enemyIds: [...result.state.encounter.enemyIds],
        encounterId: result.state.encounter.id,
        openingField: openingFieldElement(clock),
        // Phase 171 — Nebel verhuellt das Schlachtfeld: symmetrischer Eroeffnungs-Status
        // aus der Welt-Uhr (Nebel→Blind auf beide Seiten). Phase 178: ggf. per Ward aufgehoben.
        openingStatuses: warded.statuses,
        // Phase 173 — Welt-Uhr im Kampf lesbar: kompakte Zeit/Wetter-Zeile fuer das HUD.
        clockLabel: clockHudLabel(clock),
        // Phase 174 — Welt-Uhr: Uhr fuer die Erst-Sieg-Bedingungsbelohnung (Nacht/Nebel/Regen).
        clock
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

  private setPlayerFacing(facing: Dir): void {
    if (this.playerVisual instanceof Phaser.GameObjects.Image) {
      this.playerVisual.setFlipX(overworldPlayerFlipX(facing));
    }
  }

  private playWalkBob(): void {
    this.tweens.add({
      targets: this.playerVisual,
      y: -OVERWORLD_WALK_BOB_PX,
      duration: MOVE_MS / 2,
      ease: 'Sine.easeOut',
      yoyo: true
    });
    this.tweens.add({
      targets: this.playerShadow,
      scaleX: 0.76,
      scaleY: 0.72,
      duration: MOVE_MS / 2,
      ease: 'Sine.easeOut',
      yoyo: true
    });
  }

  private buildDpad(): void {
    const releaseTouchDirection = () => { this.touchDir = null; };
    this.input.on('pointerup', releaseTouchDirection);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.off('pointerup', releaseTouchDirection);
    });

    const touchControls = layoutOverworldTouchControls({ width: GAME_WIDTH, height: GAME_HEIGHT });
    for (const b of touchControls.dpad) {
      const bx = b.x + this.hudOffset.x;
      const by = b.y + this.hudOffset.y;
      const btn = this.add.rectangle(bx, by, b.width, b.height, 0x223049, 0.55)
        .setScrollFactor(0).setDepth(10).setStrokeStyle(2, 0x68d7ff, 0.6).setInteractive();
      this.add.text(bx, by, b.label, { fontFamily: 'sans-serif', fontSize: '20px', color: '#cdeaff' })
        .setOrigin(0.5).setScrollFactor(0).setDepth(11);
      btn.on('pointerdown', () => { this.touchDir = b.dir; });
      btn.on('pointerup', releaseTouchDirection);
      btn.on('pointerout', releaseTouchDirection);
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
