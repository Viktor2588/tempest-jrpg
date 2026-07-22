import Phaser from 'phaser';
import { ITEMS, SKILLS, skillTierBadge } from '../data';
import { instanceAffixLabels, resolveInstanceItem } from '../systems/lootAffix';
import type { WorldClock } from '../systems/worldClock';
import type { ElementType, ItemDefinition, SkillDefinition, StatusEffectId } from '../data';
import { GAME_WIDTH, GAME_HEIGHT } from '../main';
import { configureHiDpiScene } from '../render/hiDpi';
import {
  act,
  availableMimicElements,
  currentActor,
  enemyTurn,
  isBattleUsableItem,
  isPlayerTurn,
  renderView,
  startBattle,
  stealableSkillFrom,
  type BattleState,
  type CombatantView,
  type ReactionTiming
} from '../systems/battle';
import {
  calculateStartingTeamMeter,
  createProgressionBattleParty
} from '../systems/progression';
import {
  averagePartyLevel,
  createScaledEnemyBattleUnits,
  scalingKindForEncounter
} from '../systems/enemyScaling';
import {
  createLabyrinthBossEchoUnit,
  createScaledLabyrinthFloorUnits,
  labyrinthEncounterDepth,
  rollLabyrinthFloorLoot,
  selectLabyrinthBossEcho
} from '../systems/labyrinth';
import { applyBattleResultToSave, newlyRewardedWeatherConditions, rollBossLoot, summarizeBattleLevelUps, type LevelUpSummary } from '../systems/battleResult';
import { newlyMasteredHuntingGrounds } from '../systems/bestiaryMastery';
import { autoSave, createNewSave, loadSave, type SaveGameV2 } from '../systems/save';
import { snapshot, diffFeedback, totalDamage } from '../systems/feedback';
import { elementLabel } from '../systems/battlePresentation';
import { battleTurnDelayMs, enemyDamageMultiplier, loadSettings, playerDamageMultiplier, type BattleSpeed } from '../systems/settings';
import { playSfx, resumeAudio } from '../audio/sfx';
import { playSfxProcedural } from '../audio/sfxProcedural';
import { battleMusicTrack, playMusic, resumeMusic } from '../audio/music';
import { idleBobSpec, type VfxKind } from '../render/artSpec';
import { vfxKey } from '../render/vfxAtlas';
import { addUiTextButton } from '../render/uiSkin';
import { addUiPanel } from '../render/uiSkin';
import { enemyArtFor, type EnemyArtSpec } from '../render/enemyArt';
import { battleArenaForMap, partyBattleTextureFor } from '../render/battleArt';
import { fadeIn, fadeToScene } from './transition';
import { chooseAutoAction, prepareAutoReaction } from '../systems/autoBattle';
import { getBattleTutorial } from '../systems/battleTutorial';
import { resolveElementFusion } from '../systems/fusion';
import { buildEnemyIntel, formatStatusSummary } from '../systems/battlePresentation';

type Mode = 'busy' | 'menu' | 'skills' | 'items' | 'team-partners' | 'mimic-forms' | 'target-enemy' | 'target-ally';

const skillById = new Map<string, SkillDefinition>(SKILLS.map((skill) => [skill.id, skill]));
const itemById = new Map<string, ItemDefinition>(ITEMS.map((item) => [item.id, item]));

// Darstellung des Rundenkampfs. Die Szene treibt nur die reine Battle-Engine an
// und rendert deren View-Modell; Zuglogik, Schaden und Beute bleiben headless.
export class BattleScene extends Phaser.Scene {
  private state!: BattleState;
  private mode: Mode = 'busy';
  private pendingSkillId: string | null = null;
  private pendingItemId: string | null = null;
  private pendingTeamPartnerId: string | null = null;
  private pendingSignature = false;
  // Phase 112 — Praedator-Perversion: nächste Ziel-Wahl ist ein „Rauben".
  private pendingSteal = false;
  // Unique-Verb (Großer Weiser/Verschlinger): nächste Ziel-Wahl löst Analyse/Verschlingen aus.
  private pendingVerb: 'analyze' | 'devour' | null = null;
  private layer!: Phaser.GameObjects.Container;
  private fxLayer!: Phaser.GameObjects.Container;
  private idleTweens: Phaser.Tweens.Tween[] = [];
  private unitPos = new Map<string, { x: number; y: number }>();
  private resultAnnounced = false;
  private rewardsApplied = false;
  private levelUps: LevelUpSummary[] = [];
  private magiculeGain = 0;
  private masteredGrounds: string[] = [];
  // Phase 174 — in diesem Kampf neu verdiente Welt-Uhr-Bedingungsfunde (Sieg-Zeile).
  private weatherFinds: string[] = [];
  // Phase 155 — gerollte Labyrinth-Etagen-Beute (kodierte Instanz-Id) für die Sieg-Zeile.
  private labyrinthLoot: string | null = null;
  // Phase 157 — gerolltes Boss-Endgame-Loot (kodierte Instanz-Id) für die Sieg-Zeile.
  private bossLoot: string | null = null;
  private auto = false;
  private battleSpeed: BattleSpeed = 'normal';
  private save!: SaveGameV2;
  private encounterId: string | null = null;
  // Phase 173 — Welt-Uhr im Kampf lesbar: Zeit/Wetter-Zeile aus dem Encounter (Phase 101).
  private clockLabel: string | null = null;
  // Phase 174 — Welt-Uhr: die Uhr des Encounters fuer die Erst-Sieg-Bedingungsbelohnung.
  private battleClock: WorldClock | null = null;
  private reacting = false; // Phase 85 — Timing-Fenster aktiv, Menü blockiert

  constructor() {
    super('Battle');
  }

  create(data: {
    enemyIds?: string[];
    encounterId?: string;
    openingField?: ElementType | null;
    openingStatuses?: readonly { readonly id: StatusEffectId; readonly turns: number }[];
    clockLabel?: string | null;
    clock?: WorldClock | null;
  }): void {
    configureHiDpiScene(this);
    this.save = loadSave(window.localStorage) ?? createNewSave();
    const settings = loadSettings(window.localStorage);
    this.battleSpeed = settings.battleSpeed;
    this.encounterId = data?.encounterId ?? null;
    this.clockLabel = data?.clockLabel ?? null;
    this.battleClock = data?.clock ?? null;
    this.state = startBattle({
      openingField: data?.openingField ?? null,
      openingStatuses: data?.openingStatuses ?? [],
      party: createProgressionBattleParty(
        this.save.party.active,
        this.save.progression,
        this.save.flags
      ),
      // Phase 67: Gegner skalieren nach oben mit dem Partylevel (Anti-Overgrind).
      // Phase 147: Labyrinth-Etagen skalieren party-relativ mit Tiefen-Lead (tiefer = härter).
      enemies: this.buildEncounterEnemies(data?.enemyIds),
      inventory: this.save.inventory.stacks,
      teamMeter: calculateStartingTeamMeter(this.save.party.active, this.save.progression),
      damageMultipliers: {
        party: playerDamageMultiplier(settings),
        enemy: enemyDamageMultiplier(settings)
      },
      flags: this.save.flags,
      // Phase 123 — Bestiarium-Wissen im Kampf: bekannte (studierte) Gegner starten
      // mit aufgedeckten Schwächen; Bosse/Neue müssen frisch analysiert werden.
      analyzedEnemyIds: this.save.progression.analyzedEnemyIds,
      seed: (Date.now() & 0x7fffffff) || 1
    });
    this.resultAnnounced = false;
    this.rewardsApplied = false;
    this.levelUps = [];
    this.magiculeGain = 0;
    this.labyrinthLoot = null;
    this.bossLoot = null;
    this.auto = false; // Phaser nutzt die Instanz wieder → transienten Zustand zurücksetzen
    this.pendingSignature = false;
    this.reacting = false;
    this.unitPos.clear();
    this.drawArena();
    this.layer = this.add.container(0, 0);
    this.fxLayer = this.add.container(0, 0).setDepth(50); // Effekte überleben refresh()
    fadeIn(this);
    playMusic(battleMusicTrack(this.state.combatants.some((unit) => unit.side === 'enemy' && unit.boss)));
    // Audio braucht eine Nutzergeste — bei erster Eingabe freischalten.
    const unlockAudio = () => { resumeAudio(); resumeMusic(); };
    this.input.once('pointerdown', unlockAudio);
    this.input.keyboard?.once('keydown', unlockAudio);
    this.afterAction();
    this.showEncounterTutorial();
  }

  // Phase 147 — Labyrinth-Etagen skalieren party-relativ mit Tiefen-Lead; alle
  // übrigen Encounter behalten die reguläre Party-relative Skalierung (Phase 67).
  private buildEncounterEnemies(enemyIds: string[] | undefined) {
    const ids = enemyIds ?? ['forest-slime', 'direwolf-pup', 'spore-moth'];
    const partyLevel = averagePartyLevel(this.save.party.active.map((member) => member.level));
    const depth = labyrinthEncounterDepth(this.encounterId);
    if (depth !== null) {
      const floor = createScaledLabyrinthFloorUnits(ids, partyLevel, depth);
      // Phase 148 — die tiefste Etage beschwört ein skaliertes Echo eines besiegten,
      // aber nicht verschlungenen Bosses (erneut verschlingbar). Nur wenn eins existiert.
      if (depth >= 3) {
        const echoId = selectLabyrinthBossEcho(this.save.progression);
        const echo = echoId ? createLabyrinthBossEchoUnit(echoId, partyLevel, depth) : null;
        if (echo) {
          return [...floor, echo];
        }
      }
      return floor;
    }
    return createScaledEnemyBattleUnits(ids, partyLevel, scalingKindForEncounter(this.encounterId));
  }

  private showEncounterTutorial(): void {
    const tutorial = getBattleTutorial(this.encounterId, this.save.flags);
    if (!tutorial) return;

    this.save = autoSave(window.localStorage, {
      ...this.save,
      flags: { ...this.save.flags, [tutorial.flag]: true }
    });
    const overlay = this.add.container(0, 0).setDepth(120);
    const blocker = this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      GAME_WIDTH,
      GAME_HEIGHT,
      0x05070c,
      0.78
    ).setInteractive();
    overlay.add(blocker);
    overlay.add(addUiPanel(this, 180, 108, 600, 330, { originY: 0 }));
    overlay.add(this.add.text(GAME_WIDTH / 2, 145, tutorial.title, {
      fontFamily: 'serif',
      fontSize: '27px',
      color: '#e9c56c'
    }).setOrigin(0.5));
    overlay.add(this.add.text(GAME_WIDTH / 2, 198, tutorial.body, {
      fontFamily: 'sans-serif',
      fontSize: '14px',
      color: '#cbd6e8',
      align: 'center',
      wordWrap: { width: 500 }
    }).setOrigin(0.5));
    tutorial.tips.forEach((tip, index) => {
      overlay.add(this.add.text(245, 255 + index * 34, `◆ ${tip}`, {
        fontFamily: 'sans-serif',
        fontSize: '14px',
        color: '#cdeaff'
      }));
    });
    overlay.add(addUiTextButton(this, 380, 393, 200, 'Verstanden', () => {
      overlay.destroy();
    }, { height: 46, fill: 0x1b2940, fontSize: '15px' }));
  }

  private drawArena(): void {
    const arena = battleArenaForMap(this.save.location.mapId, this.encounterId, this.save.flags);
    if (this.textures.exists(arena.textureKey)) {
      this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, arena.textureKey)
        .setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
    } else {
      this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0c1018);
    }

    // Ruhige Kontrastflächen lassen Log, Werte und Befehle auf allen Arenen lesbar.
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x081019, 0.18);
    this.add.rectangle(GAME_WIDTH / 2, 30, GAME_WIDTH, 60, 0x071019, 0.78);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 58, GAME_WIDTH, 116, 0x071019, 0.88);
  }

  private allViews(): CombatantView[] {
    const view = renderView(this.state);
    return [...view.party, ...view.enemies];
  }

  // Wirkt sich nur auf die Darstellung aus: Schadens-/Heilzahlen, Treffer-Flash,
  // Tod-Partikel, Kamera-Shake und SFX — alles über die Bewegungsoption gedämpft.
  private playFeedback(events: ReturnType<typeof diffFeedback>): void {
    if (!events.length) return;
    const reduced = loadSettings(window.localStorage).reducedMotion;
    let healed = false;
    for (const event of events) {
      const pos = this.unitPos.get(event.id);
      if (!pos) continue;
      if (event.hpDelta < 0) {
        this.floatNumber(pos, String(-event.hpDelta), '#ff6f83');
        if (!reduced) this.flashBox(pos, 0xff5a5a);
      } else if (event.hpDelta > 0) {
        healed = true;
        this.floatNumber(pos, '+' + event.hpDelta, '#8dffc2');
        if (!reduced) this.healSpark(pos);
      }
      if (event.died && !reduced) this.poof(pos);
    }
    const dmg = totalDamage(events);
    if (dmg > 0) playSfxProcedural('hit');
    if (healed) playSfxProcedural('heal');
    if (!reduced && dmg > 0) {
      this.cameras.main.shake(Math.min(220, 70 + dmg * 4), Math.min(0.012, 0.003 + dmg * 0.0004));
    }
  }

  private playStateFeedback(before: ReturnType<typeof snapshot>): void {
    const after = snapshot(this.allViews());
    this.playFeedback(diffFeedback(before, after));
    if (after.length > before.length && this.textures.exists('ui-boss-add-spawn')) {
      const banner = this.add.image(GAME_WIDTH / 2, 170, 'ui-boss-add-spawn')
        .setDisplaySize(320, 180).setDepth(70);
      this.fxLayer.add(banner);
      this.tweens.add({
        targets: banner,
        alpha: 0,
        duration: 1400,
        hold: 500,
        onComplete: () => banner.destroy()
      });
    }
  }

  private floatNumber(pos: { x: number; y: number }, text: string, color: string): void {
    const label = this.add.text(pos.x, pos.y - 12, text, {
      fontFamily: 'sans-serif', fontSize: '18px', fontStyle: 'bold', color, stroke: '#05070c', strokeThickness: 3
    }).setOrigin(0.5).setDepth(60);
    this.fxLayer.add(label);
    this.tweens.add({ targets: label, y: pos.y - 52, alpha: 0, duration: 850, ease: 'Cubic.Out', onComplete: () => label.destroy() });
  }

  private flashBox(pos: { x: number; y: number }, color: number): void {
    const burst = this.vfxSprite('hit-burst', pos.x, pos.y, 88);
    if (burst) {
      burst.setAlpha(0.9).setDepth(55);
      this.tweens.add({
        targets: burst,
        scaleX: burst.scaleX * 1.45,
        scaleY: burst.scaleY * 1.45,
        alpha: 0,
        duration: 240,
        ease: 'Quad.Out',
        onComplete: () => burst.destroy()
      });
      return;
    }
    const rect = this.add.rectangle(pos.x, pos.y, 112, 62, color, 0.5).setDepth(55);
    this.fxLayer.add(rect);
    this.tweens.add({ targets: rect, alpha: 0, duration: 220, onComplete: () => rect.destroy() });
  }

  private healSpark(pos: { x: number; y: number }): void {
    const spark = this.vfxSprite('heal-spark', pos.x, pos.y - 6, 42);
    if (!spark) return;
    spark.setAlpha(0.9).setDepth(56);
    this.tweens.add({
      targets: spark,
      y: pos.y - 30,
      angle: 45,
      alpha: 0,
      duration: 520,
      ease: 'Cubic.Out',
      onComplete: () => spark.destroy()
    });
  }

  private poof(pos: { x: number; y: number }): void {
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const puff = this.vfxSprite('death-poof', pos.x, pos.y, 20);
      if (puff) {
        puff.setDepth(60);
        this.tweens.add({
          targets: puff,
          x: pos.x + Math.cos(angle) * 38,
          y: pos.y + Math.sin(angle) * 38,
          angle: Phaser.Math.RadToDeg(angle),
          alpha: 0,
          duration: 430,
          onComplete: () => puff.destroy()
        });
      } else {
        const dot = this.add.circle(pos.x, pos.y, 3, 0xffd6a0).setDepth(60);
        this.fxLayer.add(dot);
        this.tweens.add({ targets: dot, x: pos.x + Math.cos(angle) * 38, y: pos.y + Math.sin(angle) * 38, alpha: 0, duration: 430, onComplete: () => dot.destroy() });
      }
    }
  }

  private afterAction(): void {
    if (this.state.status !== 'active') {
      this.mode = 'busy';
      this.refresh();
      return;
    }

    if (isPlayerTurn(this.state)) {
      this.mode = 'menu';
      this.refresh();
      if (this.auto) {
        this.time.delayedCall(battleTurnDelayMs({ battleSpeed: this.battleSpeed }, 260), () => {
          if (!this.auto || !isPlayerTurn(this.state)) return;
          const action = chooseAutoAction(this.state);
          if (action) this.doAct(action);
        });
      }
      return;
    }

    this.mode = 'busy';
    this.refresh();
    this.time.delayedCall(battleTurnDelayMs({ battleSpeed: this.battleSpeed }, 320), () => {
      if (this.auto) prepareAutoReaction(this.state);
      const before = snapshot(this.allViews());
      enemyTurn(this.state);
      this.playStateFeedback(before);
      this.afterAction();
    });
  }

  private doAct(action: Parameters<typeof act>[1]): void {
    const before = snapshot(this.allViews());
    const actor = currentActor(this.state); // Angreifer für die Angriffsbewegung
    const result = act(this.state, action);
    if (!result.ok) {
      this.flash(result.reason ?? 'Geht nicht.');
      return;
    }

    this.pendingSkillId = null;
    this.pendingItemId = null;
    this.pendingSignature = false;
    this.pendingSteal = false;
    this.pendingVerb = null;
    this.attackStreak(actor?.id, action);
    this.pendingTeamPartnerId = null;
    this.playStateFeedback(before);
    this.afterAction();
  }

  // Phase 85 — Reaktion als Könnens-Moment: das erste Mal erklärt ein kurzer
  // Tutorial-Beat das Timing-Fenster, danach folgt es sofort. Auto-Kampf spielt
  // den garantierten Block (kein Timing) und umgeht das Fenster ganz.
  private beginReaction(): void {
    if (this.reacting) return;
    if (this.auto) {
      this.doAct({ type: 'brace' });
      return;
    }
    const seen = this.save.flags['tutorial.battle.reaction.seen'] === true;
    if (!seen) {
      this.save = autoSave(window.localStorage, {
        ...this.save,
        flags: { ...this.save.flags, 'tutorial.battle.reaction.seen': true }
      });
      this.showReactionTutorial(() => this.runReactionWindow());
    } else {
      this.runReactionWindow();
    }
  }

  // Sweep-Balken mit zentraler Perfekt-Zone und breiterem Erfolgsband. Ein Druck
  // (Klick/Leertaste) friert den Marker ein; ohne Druck bis zum Rand = verpasst.
  private runReactionWindow(): void {
    this.reacting = true;
    this.mode = 'busy';
    this.refresh();

    const overlay = this.add.container(0, 0).setDepth(130);
    const cx = GAME_WIDTH / 2;
    const cy = 430;
    const trackW = 360;
    const left = cx - trackW / 2;

    overlay.add(this.add.rectangle(cx, cy - 40, trackW + 60, 120, 0x05080f, 0.82));
    overlay.add(this.add.text(cx, cy - 78, 'JETZT blocken!', {
      fontFamily: 'serif', fontSize: '20px', color: '#e9c56c'
    }).setOrigin(0.5));
    overlay.add(this.add.rectangle(cx, cy, trackW, 22, 0x24344d).setStrokeStyle(1, 0x4a5f80));
    // Erfolgsband (0.5×) und darin die Perfekt-Zone (0.25×).
    overlay.add(this.add.rectangle(cx, cy, trackW * 0.46, 22, 0x2f6f4a));
    overlay.add(this.add.rectangle(cx, cy, trackW * 0.14, 22, 0xe9c56c));
    const marker = this.add.rectangle(left, cy, 5, 30, 0xffffff);
    overlay.add(marker);
    overlay.add(this.add.text(cx, cy + 30, 'Leertaste / Klick', {
      fontFamily: 'sans-serif', fontSize: '12px', color: '#9cabc0'
    }).setOrigin(0.5));

    let done = false;
    const sweep = this.tweens.add({
      targets: marker,
      x: left + trackW,
      duration: 950,
      ease: 'Linear',
      onComplete: () => finish('miss')
    });

    const finish = (timing: ReactionTiming) => {
      if (done) return;
      done = true;
      sweep.remove();
      this.input.off('pointerdown', onPress);
      spaceKey?.off('down', onPress);
      overlay.destroy();
      this.reacting = false;
      this.doAct({ type: 'brace', timing });
    };
    const onPress = () => {
      const v = (marker.x - left) / trackW; // 0..1 über den Track
      const d = Math.abs(v - 0.5);
      finish(d < 0.07 ? 'perfect' : d < 0.23 ? 'success' : 'miss');
    };

    this.input.on('pointerdown', onPress);
    const spaceKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    spaceKey?.on('down', onPress);
  }

  private showReactionTutorial(onClose: () => void): void {
    const overlay = this.add.container(0, 0).setDepth(140);
    overlay.add(this.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x05070c, 0.8
    ).setInteractive());
    overlay.add(addUiPanel(this, 200, 130, 560, 280, { originY: 0 }));
    overlay.add(this.add.text(GAME_WIDTH / 2, 168, 'Reaktion: aktives Blocken', {
      fontFamily: 'serif', fontSize: '25px', color: '#e9c56c'
    }).setOrigin(0.5));
    overlay.add(this.add.text(GAME_WIDTH / 2, 232,
      'Ein angekündigter Großangriff öffnet ein Timing-Fenster. Triff mit '
      + 'Leertaste oder Klick die Mitte des Balkens:',
      { fontFamily: 'sans-serif', fontSize: '14px', color: '#cbd6e8', align: 'center', wordWrap: { width: 480 } }
    ).setOrigin(0.5));
    ['Goldene Zone = perfekt: nur ¼ Schaden.',
     'Grünes Band = rechtzeitig: halber Schaden.',
     'Daneben/zu spät = voller Treffer.'
    ].forEach((tip, i) => {
      overlay.add(this.add.text(255, 285 + i * 26, `◆ ${tip}`, {
        fontFamily: 'sans-serif', fontSize: '14px', color: '#cdeaff'
      }));
    });
    overlay.add(addUiTextButton(this, GAME_WIDTH / 2 - 100, 372, 200, 'Bereit', () => {
      overlay.destroy();
      onClose();
    }, { height: 44, fill: 0x1b2940, fontSize: '15px' }));
  }

  // Kurze gerichtete Angriffsbewegung (Lunge/Geschoss) vom Angreifer zum Ziel.
  private attackStreak(actorId: string | undefined, action: Parameters<typeof act>[1]): void {
    if (loadSettings(window.localStorage).reducedMotion) return;
    if (!actorId || !('targetId' in action) || !action.targetId) return;
    const from = this.unitPos.get(actorId);
    const to = this.unitPos.get(action.targetId);
    if (!from || !to) return;
    const magic = action.type === 'skill';
    const color = magic ? 0x9fe8ff : 0xfff0b0;
    const key: VfxKind = magic ? 'magic-bolt' : 'physical-bolt';
    const sprite = this.vfxSprite(key, from.x, from.y, magic ? 26 : 22);
    if (sprite) {
      sprite.setDepth(58);
      sprite.rotation = Phaser.Math.Angle.Between(from.x, from.y, to.x, to.y);
      this.tweens.add({
        targets: sprite,
        x: to.x,
        y: to.y,
        duration: 170,
        ease: 'Quad.In',
        onComplete: () => sprite.destroy()
      });
      return;
    }
    // Geschoss/Klingenpunkt vom Angreifer zum Ziel
    const bolt = this.add.circle(from.x, from.y, magic ? 6 : 5, color).setDepth(58);
    this.fxLayer.add(bolt);
    this.tweens.add({ targets: bolt, x: to.x, y: to.y, duration: 170, ease: 'Quad.In', onComplete: () => bolt.destroy() });
  }

  private vfxSprite(kind: VfxKind, x: number, y: number, displaySize: number): Phaser.GameObjects.Image | null {
    const key = vfxKey(kind);
    if (!this.textures.exists(key)) return null;
    const sprite = this.add.image(x, y, key).setDisplaySize(displaySize, displaySize).setDepth(55);
    this.fxLayer.add(sprite);
    return sprite;
  }

  private refresh(): void {
    // Idle-Bobs (repeat:-1) gezielt beenden, bevor ihre Sprites zerstört werden.
    this.idleTweens.forEach((tween) => tween.remove());
    this.idleTweens = [];
    this.layer.removeAll(true);
    const view = renderView(this.state);

    view.enemies.forEach((enemy, index) => this.drawUnit(enemy, this.colX(index, view.enemies.length), 137, 'enemy'));
    view.party.forEach((member, index) => this.drawUnit(member, this.colX(index, view.party.length), this.partyRowY(member), 'party'));

    view.log.slice(0, 2).forEach((line, index) => {
      this.layer.add(this.add.text(16, 11 + index * 19, line, {
        fontFamily: 'sans-serif',
        fontSize: '13px',
        color: index === 0 ? '#f7e5b5' : '#9cabc0'
      }));
    });

    if (this.state.status !== 'active') {
      this.drawResult(view.status, view.rewards);
      return;
    }

    const actor = currentActor(this.state);
    this.layer.add(this.add.text(GAME_WIDTH - 194, 9, 'TEAM', {
      fontFamily: 'sans-serif',
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#f0cf72'
    }));
    this.layer.add(this.add.rectangle(GAME_WIDTH - 110, 31, 168, 10, 0x101827)
      .setOrigin(0.5)
      .setStrokeStyle(1, 0xa68742, 0.75));
    this.layer.add(this.add.rectangle(
      GAME_WIDTH - 194,
      31,
      168 * (view.teamMeter / 100),
      8,
      view.teamMeter >= 100 ? 0xffdf74 : 0x4dd7bb
    ).setOrigin(0, 0.5));
    this.layer.add(this.add.text(GAME_WIDTH - 15, 31, `${view.teamMeter}`, {
      fontFamily: 'sans-serif',
      fontSize: '11px',
      color: '#f7e5b5'
    }).setOrigin(1, 0.5));

    // Phase 94 — Elementarfeld-Anzeige: nur sichtbar, solange ein Feld geladen ist.
    // Phase 173/182 — darunter reihen sich Reaktions-Hinweis und Welt-Uhr; wir fuehren
    // einen laufenden y-Versatz, damit sich die Zeilen nie ueberlappen.
    let hudLineY = 46;
    if (view.field) {
      this.layer.add(this.add.text(
        GAME_WIDTH - 15,
        hudLineY,
        `Feld: ${elementLabel(view.field.element)} (${view.field.turns})`,
        { fontFamily: 'sans-serif', fontSize: '11px', fontStyle: 'bold', color: '#7fd4ff' }
      ).setOrigin(1, 0.5));
      hudLineY += 15;

      // Phase 182 — Feld-Reaktion lesbar: telegraphiert, welche Fremd-Elemente auf dem
      // geladenen Feld eine Fusions-Reaktion entladen (und es raeumen) — das Gegenspiel
      // gegen ein feindliches Feld wie gegen das eigene.
      if (view.fieldReactions.length > 0) {
        // Deckt die Reaktion jedes andere Element ab, bleibt der Hinweis kompakt; sonst
        // werden die konkreten Fremd-Elemente aufgezaehlt.
        const trigger = view.fieldReactions.length >= 5
          ? 'jedes Fremd-Element'
          : view.fieldReactions.map((element) => elementLabel(element)).join('/');
        this.layer.add(this.add.text(
          GAME_WIDTH - 15,
          hudLineY,
          `↯ ${trigger} → Reaktion`,
          { fontFamily: 'sans-serif', fontSize: '11px', color: '#ffcf7a' }
        ).setOrigin(1, 0.5));
        hudLineY += 15;
      }
    }

    // Phase 173 — Welt-Uhr im Kampf lesbar: Zeit/Wetter-Zeile macht die Kausalitaet
    // (Nacht/Regen/Nebel → diese Eroeffnung) sichtbar. Unter Feld + Reaktions-Hinweis.
    if (this.clockLabel) {
      this.layer.add(this.add.text(
        GAME_WIDTH - 15,
        hudLineY,
        this.clockLabel,
        { fontFamily: 'sans-serif', fontSize: '11px', color: '#b9c6d8' }
      ).setOrigin(1, 0.5));
    }

    this.layer.add(this.add.rectangle(GAME_WIDTH / 2, 248, 300, 34, 0x091521, 0.86)
      .setStrokeStyle(1, 0x6b91b2, 0.75));
    this.layer.add(this.add.text(GAME_WIDTH / 2, 248, actor ? `${actor.name} ist am Zug` : '', {
      fontFamily: 'sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#e6f4ff'
    }).setOrigin(0.5));
    this.drawEncounterTutorialHint(view.teamMeter);

    if (this.mode === 'menu') this.drawMenu();
    else if (this.mode === 'mimic-forms') this.drawMimicFormList();
    else if (this.mode === 'skills') this.drawSkillList();
    else if (this.mode === 'items') this.drawItemList();
    else if (this.mode === 'team-partners') this.drawTeamPartnerList();
    else if (this.mode === 'target-enemy') {
      this.drawHint('Ziel-Gegner wählen');
      if (this.pendingSteal && this.textures.exists('ui-predator-steal')) {
        this.layer.add(this.add.image(GAME_WIDTH / 2, 90, 'ui-predator-steal')
          .setDisplaySize(224, 126).setDepth(45));
      }
    }
    else if (this.mode === 'target-ally') this.drawHint('Verbündeten wählen');
  }

  private colX(index: number, count: number): number {
    const span = Math.min(GAME_WIDTH - 120, count * 150);
    const start = (GAME_WIDTH - span) / 2 + span / (count * 2);
    return start + (index * span) / count;
  }

  private partyRowY(unit: CombatantView): number {
    return unit.formationRow === 'front' ? 326 : 370;
  }

  private textureFor(unit: CombatantView, side: 'party' | 'enemy'): {
    key: string;
    frame?: string;
  } | null {
    const partyTextureKey = side === 'party' ? partyBattleTextureFor(unit.sourceId) : null;
    const art: EnemyArtSpec = side === 'party'
      ? { textureKey: partyTextureKey ?? 'sprite-hero', fallbackKind: 'hero' }
      : enemyArtFor(unit.sourceId, unit.name);

    if (art.textureKey && this.textures.exists(art.textureKey)) {
      const texture = this.textures.get(art.textureKey);
      if (!art.frame || texture.has(art.frame)) {
        return { key: art.textureKey, frame: art.frame };
      }
    }

    const legacyKey = 'sprite-' + art.fallbackKind;
    if (this.textures.exists(legacyKey)) return { key: legacyKey };

    const placeholderKey = 'ph-' + art.fallbackKind;
    return this.textures.exists(placeholderKey) ? { key: placeholderKey } : null;
  }

  private drawUnit(unit: CombatantView, x: number, y: number, side: 'party' | 'enemy'): void {
    const width = 136;
    const height = 156;
    const alpha = unit.dead ? 0.35 : 1;
    this.unitPos.set(unit.id, { x, y }); // Position für Trefferzahlen/-effekte
    const box = this.add.rectangle(x, y + 8, width, height, side === 'enemy' ? 0x281520 : 0x122338, 0.58 * alpha)
      .setStrokeStyle(unit.active ? 3 : 1, unit.active ? 0xffdc78 : 0x6a7891, unit.active ? 1 : 0.72);
    this.layer.add(box);
    // Proportional skalierte Illustration → Legacy-Sprite → Platzhalter.
    const texture = this.textureFor(unit, side);
    if (texture) {
      const sprite = this.add.image(x, y - 2, texture.key, texture.frame).setAlpha(alpha);
      const fitWidth = side === 'enemy' ? 96 : 82;
      const fitHeight = side === 'enemy' ? 72 : 76;
      sprite.setScale(Math.min(fitWidth / sprite.width, fitHeight / sprite.height));
      sprite.setFlipX(side === 'enemy'); // Gegner blicken zur Party
      const bob = idleBobSpec(unit.id, {
        reducedMotion: loadSettings(window.localStorage).reducedMotion,
        dead: unit.dead
      });
      if (bob) {
        this.idleTweens.push(this.tweens.add({
          targets: sprite,
          y: y - 2 - bob.amplitudePx,
          duration: bob.durationMs,
          delay: bob.delayMs,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.InOut'
        }));
      }
      this.layer.add(sprite);
    }
    this.layer.add(this.add.text(x, y - 53, `${unit.name}${unit.guarding ? '  ◆' : ''}`, {
      fontFamily: 'sans-serif',
      fontSize: unit.name.length > 22 ? '10px' : '12px',
      fontStyle: unit.active ? 'bold' : 'normal',
      color: '#e9eef7',
      align: 'center',
      wordWrap: { width: width - 10, useAdvancedWrap: true }
    }).setOrigin(0.5).setAlpha(alpha));
    if (unit.formName) {
      this.layer.add(this.add.text(x, y - 39, unit.formName, {
        fontFamily: 'sans-serif',
        fontSize: '9px',
        color: '#f0cf72'
      }).setOrigin(0.5).setAlpha(alpha));
    }
    // Phase 105 — aktive Mimik-Form (angenommenes Element) über der Einheit anzeigen.
    if (unit.mimicElement) {
      this.layer.add(this.add.text(x, y - 28, `⟳ ${elementLabel(unit.mimicElement)}-Form (${unit.mimicTurns})`, {
        fontFamily: 'sans-serif',
        fontSize: '9px',
        fontStyle: 'bold',
        color: '#c39bff'
      }).setOrigin(0.5).setAlpha(alpha));
    }
    if (side === 'party') {
      this.layer.add(this.add.text(x + width / 2 - 10, y - height / 2 + 10, unit.formationRow === 'front' ? 'FRONT' : 'HINTEN', {
        fontFamily: 'sans-serif',
        fontSize: '8px',
        fontStyle: 'bold',
        color: unit.formationRow === 'front' ? '#ffd27a' : '#8fe7ff'
      }).setOrigin(1, 0.5).setAlpha(alpha));
    }
    if (unit.boss && this.textures.exists('ui-boss-emblem')) {
      this.layer.add(this.add.image(x - width / 2 + 14, y - height / 2 + 14, 'ui-boss-emblem')
        .setDisplaySize(28, 28).setAlpha(alpha));
    }

    this.layer.add(this.add.rectangle(x, y + 38, width - 14, 9, 0x0a0f18, 0.96).setOrigin(0.5));
    this.layer.add(this.add.rectangle(
      x - (width - 14) / 2,
      y + 38,
      Math.max(0, (width - 14) * (unit.hp / unit.maxHp)),
      9,
      unit.dead ? 0x555555 : 0x53d98b
    ).setOrigin(0, 0.5));
    this.layer.add(this.add.text(x, y + 51, `${unit.hp}/${unit.maxHp} LP  ·  ${unit.mp}/${unit.maxMp} MP`, {
      fontFamily: 'sans-serif',
      fontSize: '10px',
      color: '#d1deef'
    }).setOrigin(0.5).setAlpha(alpha));

    const statusSummary = formatStatusSummary(unit.statuses);
    if (statusSummary) {
      this.layer.add(this.add.text(x, y + 23, statusSummary, {
        fontFamily: 'sans-serif',
        fontSize: '8px',
        fontStyle: 'bold',
        color: '#ffcf70'
      }).setOrigin(0.5).setAlpha(alpha));
    }

    if (side === 'enemy') {
      const intel = buildEnemyIntel(unit);
      let weaknessLine = `${intel.breakText} · ${intel.weaknessText}`;
      if (intel.casterText) weaknessLine += ` · ${intel.casterText}`;
      this.layer.add(this.add.text(x, y + 63, weaknessLine, {
        fontFamily: 'sans-serif',
        fontSize: '8px',
        fontStyle: 'bold',
        color: unit.analysisLevel >= 1 ? '#8fe7ff' : '#91a1b8'
      }).setOrigin(0.5).setAlpha(alpha));
      const actionText = [intel.telegraphText, intel.devourText].filter(Boolean).join(' · ');
      if (actionText) {
        this.layer.add(this.add.text(x, y + 74, actionText, {
          fontFamily: 'sans-serif',
          fontSize: '7px',
          color: intel.telegraphText ? '#ffd27a' : '#b8c8dc',
          align: 'center',
          wordWrap: { width: width - 10, useAdvancedWrap: true }
        }).setOrigin(0.5).setAlpha(alpha));
      }
      // Phase 80 — Anti-Aussitzen: sichtbarer Druck. Je länger der Kampf, desto
      // tödlicher — der Spieler soll das lesen und aufs Beenden drängen.
      if (unit.escalationBonusPercent > 0) {
        this.layer.add(this.add.text(x, y + 85, `⚠ rasend +${unit.escalationBonusPercent}% Schaden`, {
          fontFamily: 'sans-serif',
          fontSize: '8px',
          fontStyle: 'bold',
          color: '#ff8a7a'
        }).setOrigin(0.5).setAlpha(alpha));
      }
      // Phase 81 — angekündigter Big-Hit: klare Warnung, kontern (Deckung/Verzögern/Bursten).
      if (unit.telegraphHeavy) {
        this.layer.add(this.add.text(x, y + 96, `⚡ GROSSER TREFFER — kontern!`, {
          fontFamily: 'sans-serif',
          fontSize: '9px',
          fontStyle: 'bold',
          color: '#ff5a5a'
        }).setOrigin(0.5).setAlpha(alpha));
      }
    }

    if (side === 'party' && unit.signatureId) {
      const barWidth = width - 22;
      const ready = unit.signatureCharge >= unit.signatureChargeMax;
      this.layer.add(this.add.rectangle(x, y + 60, barWidth, 5, 0x0a0f18, 0.96).setOrigin(0.5));
      this.layer.add(this.add.rectangle(
        x - barWidth / 2,
        y + 60,
        barWidth * (unit.signatureCharge / unit.signatureChargeMax),
        5,
        ready ? 0xffda68 : 0x9f6bff
      ).setOrigin(0, 0.5));
      this.layer.add(this.add.text(x, y + 63, ready ? 'SIGNATUR BEREIT' : `${unit.signatureCharge}%`, {
        fontFamily: 'sans-serif',
        fontSize: '8px',
        fontStyle: 'bold',
        color: ready ? '#ffe9a8' : '#cbb9ff'
      }).setOrigin(0.5, 0));
    }

    if (unit.statuses.some((s) => s.id === 'poison')) {
      this.layer.add(this.add.text(x + width / 2 - 8, y - height / 2 + 10, '☠', {
        fontSize: '12px',
        color: '#b06bff'
      }).setOrigin(0.5));
    }

    const wantsEnemy = this.mode === 'target-enemy' && side === 'enemy';
    const wantsAlly = this.mode === 'target-ally' && side === 'party';
    if (!unit.dead && (wantsEnemy || wantsAlly)) {
      box.setInteractive().setStrokeStyle(2, 0x68ff9a);
      box.on('pointerdown', () => {
        if (this.pendingVerb) {
          this.doAct({ type: this.pendingVerb, targetId: unit.id });
        } else if (this.pendingSteal) {
          this.doAct({ type: 'steal', targetId: unit.id });
        } else if (this.pendingTeamPartnerId) {
          this.doAct({
            type: 'team-attack',
            partnerId: this.pendingTeamPartnerId,
            targetId: unit.id
          });
        } else if (this.pendingSignature) {
          this.doAct({ type: 'signature', targetId: unit.id });
        } else if (this.pendingSkillId) {
          this.doAct({ type: 'skill', skillId: this.pendingSkillId, targetId: unit.id });
        } else if (this.pendingItemId) {
          this.doAct({ type: 'item', itemId: this.pendingItemId, targetId: unit.id });
        } else {
          this.doAct({ type: 'attack', targetId: unit.id });
        }
      });
    }
  }

  private drawMenu(): void {
    const actor = currentActor(this.state)!;
    const items: Array<[string, () => void]> = [
      ['⚔ Angriff', () => {
        this.mode = 'target-enemy';
        this.pendingSkillId = null;
        this.pendingItemId = null;
        this.pendingTeamPartnerId = null;
        this.pendingSignature = false;
        this.pendingSteal = false;
        this.pendingVerb = null;
        this.refresh();
      }],
      ['✨ Skills', () => {
        this.pendingSignature = false;
        this.pendingSteal = false;
        this.pendingVerb = null;
        this.mode = 'skills';
        this.refresh();
      }],
      ['🎒 Items', () => {
        this.pendingSignature = false;
        this.pendingSteal = false;
        this.pendingVerb = null;
        this.mode = 'items';
        this.refresh();
      }],
      ['🛡 Verteidigen', () => this.doAct({ type: 'guard' })],
      ['🏃 Fliehen', () => this.doAct({ type: 'flee' })]
    ];
    const partners = renderView(this.state).party.filter((candidate) =>
      !candidate.dead
      && candidate.id !== actor.id
      && (
        actor.synergyPartnerIds.includes(candidate.sourceId)
        || candidate.synergyPartnerIds.includes(actor.sourceId)
      )
    );
    if (renderView(this.state).teamMeter >= 100 && partners.length > 0) {
      items.splice(3, 0, ['◆ Team-Mix', () => {
        this.pendingSkillId = null;
        this.pendingItemId = null;
        this.pendingTeamPartnerId = null;
        this.pendingSignature = false;
        this.pendingSteal = false;
        this.pendingVerb = null;
        this.mode = 'team-partners';
        this.refresh();
      }]);
    }
    const actorView = renderView(this.state).party.find((candidate) => candidate.id === actor.id);
    if (actorView?.signatureName
      && actorView.signatureTarget
      && actorView.signatureCharge >= actorView.signatureChargeMax) {
      items.splice(3, 0, ['★ Signatur', () => {
        this.pendingSkillId = null;
        this.pendingItemId = null;
        this.pendingTeamPartnerId = null;
        this.pendingSignature = true;
        this.pendingSteal = false;
        this.pendingVerb = null;
        if (actorView.signatureTarget === 'self'
          || actorView.signatureTarget === 'all-allies'
          || actorView.signatureTarget === 'all-enemies') {
          this.doAct({ type: 'signature' });
          return;
        }
        this.mode = actorView.signatureTarget === 'single-ally' ? 'target-ally' : 'target-enemy';
        this.refresh();
      }]);
    }
    if (!actor.skillIds.length) items.splice(1, 1);
    if (!renderView(this.state).inventory.length) items.splice(actor.skillIds.length ? 2 : 1, 1);

    // Großer Weiser (Analysieren) und Verschlinger (Verschlingen) sind Unique-Verben,
    // keine wirkbaren Skills — sie brauchen eigene Befehle statt eines toten Skill-Eintrags.
    const livingEnemy = this.state.combatants.some((foe) => foe.side === 'enemy' && !foe.dead);
    if (actor.skillIds.includes('predator')
      && this.state.combatants.some((foe) => foe.side === 'enemy' && !foe.dead && foe.devourable)) {
      items.splice(2, 0, ['🍴 Verschlingen', () => {
        this.pendingSkillId = null;
        this.pendingItemId = null;
        this.pendingTeamPartnerId = null;
        this.pendingSignature = false;
        this.pendingSteal = false;
        this.pendingVerb = 'devour';
        this.mode = 'target-enemy';
        this.refresh();
      }]);
    }
    if (actor.skillIds.includes('great-sage') && livingEnemy) {
      items.splice(2, 0, ['🔍 Analysieren', () => {
        this.pendingSkillId = null;
        this.pendingItemId = null;
        this.pendingTeamPartnerId = null;
        this.pendingSignature = false;
        this.pendingSteal = false;
        this.pendingVerb = 'analyze';
        this.mode = 'target-enemy';
        this.refresh();
      }]);
    }

    // Phase 105 — Mimikry: nur anbieten, wenn Rimuru in diesem Kampf schon eine Form
    // verschlungen hat (Verschlinger + verfügbare Elemente).
    if (actor.skillIds.includes('predator') && availableMimicElements(this.state).length > 0) {
      items.splice(3, 0, ['⟳ Mimik', () => {
        this.pendingSkillId = null;
        this.pendingItemId = null;
        this.pendingTeamPartnerId = null;
        this.pendingSignature = false;
        this.pendingSteal = false;
        this.pendingVerb = null;
        this.mode = 'mimic-forms';
        this.refresh();
      }]);
    }

    // Phase 112 — Praedator-Perversion: „Rauben" anbieten, sobald die Shizu-Absorption
    // (story.shizu.vow) freigeschaltet ist und ein analysierter, nicht-seelengebundener
    // Gegner mit einer noch nicht bekannten, raubbaren Fertigkeit im Kampf steht.
    if (actor.skillIds.includes('predator') && this.save.flags['story.shizu.vow']
      && this.state.combatants.some((foe) =>
        foe.side === 'enemy' && !foe.dead && !foe.boss
        && foe.analysisLevel >= 1 && stealableSkillFrom(foe, actor.skillIds) !== null)) {
      items.splice(3, 0, ['⊗ Rauben', () => {
        this.pendingSkillId = null;
        this.pendingItemId = null;
        this.pendingTeamPartnerId = null;
        this.pendingSignature = false;
        this.pendingSteal = true;
        this.pendingVerb = null;
        this.mode = 'target-enemy';
        this.refresh();
      }]);
    }

    // Phase 81 — Deckung anbieten, sobald ein Gegner einen Zug telegraphiert
    // (v.a. Big-Hits): die Party blockt den vorhergesagten Treffer, statt ihn
    // ungedeckt zu fressen. Kostet den Zug — Tempo gegen Sicherheit.
    if (renderView(this.state).enemies.some((foe) => !foe.dead && foe.telegraphSkillId)) {
      items.push(['🛡 Reagieren', () => this.beginReaction()]);
    }

    // Auto-Kampf: schaltet automatische Zugwahl an/aus (siehe systems/autoBattle).
    items.push([this.auto ? '⏸ Auto: AN' : '⚡ Auto: aus', () => { this.auto = !this.auto; this.afterAction(); }]);

    const gap = 6;
    const width = Math.floor((GAME_WIDTH - 32 - gap * (items.length - 1)) / items.length);
    items.forEach(([label, callback], index) => {
      this.button(16 + index * (width + gap), 496, label, callback, width, '12px');
    });
  }

  private drawSkillList(): void {
    const actor = currentActor(this.state)!;
    // Unique-Verben (Großer Weiser/Verschlinger) haben eigene Befehle — nicht als tote Skills listen.
    const skills = actor.skillIds.flatMap((id) => {
      if (id === 'great-sage' || id === 'predator') return [];
      const skill = skillById.get(id);
      return skill ? [skill] : [];
    });

    const choices: Array<[string, () => void]> = skills.map((skill) => [
      `${skillTierBadge(skill.tier)}${skill.name} (${skill.costMp} MP)`,
      () => {
        if (actor.mp < skill.costMp) {
          this.flash('Nicht genug MP.');
          return;
        }
        this.pendingSkillId = skill.id;
        this.pendingItemId = null;
        this.pendingSignature = false;
        if (skill.target === 'all-enemies' || skill.target === 'self') {
          this.doAct({ type: 'skill', skillId: skill.id });
          return;
        }
        this.mode = skill.target === 'single-ally' ? 'target-ally' : 'target-enemy';
        this.refresh();
      }
    ]);
    choices.push(['↩ Zurück', () => {
      this.mode = 'menu';
      this.refresh();
    }]);
    this.drawChoiceGrid(choices);
  }

  private drawItemList(): void {
    const inventory = renderView(this.state).inventory;
    const choices = inventory.flatMap((stack): Array<[string, () => void]> => {
      const item = itemById.get(stack.itemId);
      if (!isBattleUsableItem(item)) return [];
      return [[`${item.name} ×${stack.quantity}`, () => {
        this.pendingItemId = item.id;
        this.pendingSkillId = null;
        this.pendingSignature = false;
        this.mode = 'target-ally';
        this.refresh();
      }]];
    });
    choices.push(['↩ Zurück', () => {
      this.mode = 'menu';
      this.refresh();
    }]);
    this.drawChoiceGrid(choices);
  }

  private drawTeamPartnerList(): void {
    const actor = currentActor(this.state)!;
    const partners = renderView(this.state).party.filter((candidate) =>
      !candidate.dead
      && candidate.id !== actor.id
      && (
        actor.synergyPartnerIds.includes(candidate.sourceId)
        || candidate.synergyPartnerIds.includes(actor.sourceId)
      )
    );
    const choices: Array<[string, () => void]> = partners.map((partner) => {
      const fusion = resolveElementFusion(actor.resonanceElement, partner.resonanceElement);
      return [
        fusion ? `${partner.name}: ${fusion.name}` : `${partner.name}: Teamdruck`,
        () => {
          this.pendingSkillId = null;
          this.pendingItemId = null;
          this.pendingSignature = false;
          this.pendingTeamPartnerId = partner.id;
          this.mode = 'target-enemy';
          this.refresh();
        }
      ];
    });
    choices.push(['↩ Zurück', () => {
      this.pendingTeamPartnerId = null;
      this.mode = 'menu';
      this.refresh();
    }]);
    this.drawChoiceGrid(choices);
  }

  // Phase 105 — Mimikry: wähle das Element einer verschlungenen Form.
  private drawMimicFormList(): void {
    // Phase 105 — dekorativer „Mimik"-Banner als Kopf der Form-Auswahl (ui-mimic-form-indicator).
    // ponytail: rein dekorativ; die konkrete aktive Form/Restdauer steht als Textmarker über der Einheit.
    if (this.textures.exists('ui-mimic-form-indicator')) {
      this.layer.add(this.add.image(GAME_WIDTH / 2, 70, 'ui-mimic-form-indicator')
        .setDisplaySize(224, 112).setDepth(45));
    }
    const actorView = renderView(this.state).party.find((candidate) => candidate.active);
    const choices: Array<[string, () => void]> = availableMimicElements(this.state).map((element) => [
      actorView?.mimicElement === element
        ? `${elementLabel(element)} (aktiv)`
        : `${elementLabel(element)}-Form`,
      () => this.doAct({ type: 'mimic', element })
    ]);
    choices.push(['↩ Zurück', () => {
      this.mode = 'menu';
      this.refresh();
    }]);
    this.drawChoiceGrid(choices);
  }

  private drawChoiceGrid(choices: ReadonlyArray<readonly [string, () => void]>): void {
    const columns = 5;
    const gap = 8;
    const width = Math.floor((GAME_WIDTH - 32 - gap * (columns - 1)) / columns);
    choices.slice(0, columns * 2).forEach(([label, callback], index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      this.button(16 + col * (width + gap), 449 + row * 48, label, callback, width, '12px');
    });
  }

  private drawResult(status: string, rewards: { experience: number; gold: number; items: readonly { itemId: string; quantity: number }[] }): void {
    const won = status === 'won';
    if (!this.rewardsApplied) {
      this.rewardsApplied = true;
      this.applyBattleResult(status);
    }
    if (!this.resultAnnounced) {
      this.resultAnnounced = true;
      playSfxProcedural(won ? 'victory' : status === 'fled' ? 'menu' : 'hit'); // fallback for defeat/fled
      if (won && this.encounterId === 'direwolf-pack-leader') {
        this.time.delayedCall(220, () => playSfx('magic'));
      }
      if (!loadSettings(window.localStorage).reducedMotion) {
        if (won) this.cameras.main.flash(300, 80, 70, 30);
        else this.cameras.main.shake(260, 0.01);
      }
    }
    const pactMessage = won && this.encounterId === 'direwolf-pack-leader'
      ? 'Das Rudel senkt die Köpfe. Der Sieg endet als Pakt, nicht als Auslöschung.'
      : null;

    // Ergebniszeilen als Daten sammeln, damit Dialogbox und Button mit dem
    // Inhalt mitwachsen (EP/Gold, Beute, Stufenaufstiege, optionaler Pakt).
    const title = won ? '🏆 Sieg!' : status === 'fled' ? '🏃 Entkommen' : '💀 Niederlage';
    const lines: { text: string; size: number; color: string }[] = [];
    if (won) {
      lines.push({
        text: `+${rewards.experience} EP   +${rewards.gold} Gold   +${this.magiculeGain} Magicules`,
        size: 16,
        color: '#cbd6e8'
      });
      const drops = rewards.items
        .map((stack) => `${itemById.get(stack.itemId)?.name ?? stack.itemId} ×${stack.quantity}`)
        .join(', ');
      if (drops.length > 0) {
        lines.push({ text: `Beute: ${drops}`, size: 13, color: '#9fb2cc' });
      }
      if (this.levelUps.length > 0) {
        const ups = this.levelUps.map((up) => `${up.name} Lv.${up.toLevel}`).join(' · ');
        lines.push({ text: `Stufenaufstieg: ${ups}`, size: 14, color: '#8dffc2' });
      }
      if (this.masteredGrounds.length > 0) {
        lines.push({
          text: `🐾 Jagdgrund gemeistert: ${this.masteredGrounds.join(' · ')}`,
          size: 14,
          color: '#e9c56c'
        });
      }
      // Phase 174 — Welt-Uhr: neu verdiente Bedingungsfunde (Nacht/Nebel/Regen).
      if (this.weatherFinds.length > 0) {
        lines.push({
          text: `☾ ${this.weatherFinds.join(' · ')}`,
          size: 14,
          color: '#9fd0ff'
        });
      }
      // Phase 155 — gerollte Labyrinth-Beute sichtbar machen (Basis + Affixe).
      if (this.labyrinthLoot) {
        const loot = resolveInstanceItem(this.labyrinthLoot);
        const affixes = instanceAffixLabels(this.labyrinthLoot);
        const suffix = affixes.length > 0 ? ` (${affixes.join(', ')})` : '';
        lines.push({
          text: `✦ Labyrinth-Fund: ${loot?.name ?? this.labyrinthLoot}${suffix}`,
          size: 14,
          color: '#ffd98a'
        });
      }
      // Phase 157 — gerolltes Boss-Endgame-Loot sichtbar machen (Basis + Affixe).
      if (this.bossLoot) {
        const loot = resolveInstanceItem(this.bossLoot);
        const affixes = instanceAffixLabels(this.bossLoot);
        const suffix = affixes.length > 0 ? ` (${affixes.join(', ')})` : '';
        lines.push({
          text: `★ Boss-Beute: ${loot?.name ?? this.bossLoot}${suffix}`,
          size: 14,
          color: '#ffcf6b'
        });
      }
      if (this.encounterId === 'milim-duel') {
        lines.push({ text: '✦ Skill gelernt: Drago Nova', size: 14, color: '#ff9fdf' });
      }
    }
    if (pactMessage) {
      lines.push({ text: pactMessage, size: 14, color: '#ffd6de' });
    }

    const titleY = 250;
    const firstLineY = 292;
    const lineGap = 26;
    const contentBottom = lines.length > 0 ? firstLineY + (lines.length - 1) * lineGap + 12 : titleY + 20;
    const buttonY = contentBottom + 20;
    const boxTop = 224;
    const boxBottom = buttonY + 42;
    this.layer.add(this.add.rectangle(
      GAME_WIDTH / 2, (boxTop + boxBottom) / 2, 480, boxBottom - boxTop, 0x0a0f18, 0.94
    ).setStrokeStyle(2, won ? 0xe9c56c : 0xff7b8a, 0.85));

    if (won && this.encounterId === 'milim-duel' && this.textures.exists('ui-milim-fight-banner')) {
      this.layer.add(this.add.image(GAME_WIDTH / 2, (boxTop + boxBottom) / 2, 'ui-milim-fight-banner')
        .setDisplaySize(480, 270)
        .setAlpha(0.22));
    }

    this.layer.add(this.add.text(GAME_WIDTH / 2, titleY, title, {
      fontFamily: 'serif',
      fontSize: '34px',
      color: won ? '#e9c56c' : '#ff7b8a'
    }).setOrigin(0.5));
    lines.forEach((line, index) => {
      this.layer.add(this.add.text(GAME_WIDTH / 2, firstLineY + index * lineGap, line.text, {
        fontFamily: 'sans-serif',
        fontSize: `${line.size}px`,
        color: line.color,
        align: 'center',
        wordWrap: { width: 448 }
      }).setOrigin(0.5));
    });
    this.button(GAME_WIDTH / 2 - 90, buttonY, 'Zurück zur Welt', () => fadeToScene(this, 'Overworld'));
  }

  private applyBattleResult(status: string): void {
    const view = renderView(this.state);
    const before = this.save;
    // Phase 155 — auf Labyrinth-Etagen deterministisch (Kampf-Seed + Tiefe) eine
    // gerollte Ausruestungs-Instanz droppen; der Reward-Fluss bankt sie ins Inventar.
    const depth = status === 'won' ? labyrinthEncounterDepth(this.encounterId) : null;
    this.labyrinthLoot = depth !== null ? rollLabyrinthFloorLoot(this.state.seed, depth) : null;
    // Phase 157 — Boss-Sieg rollt (deterministisch, gegatet) kern-lastiges Endgame-Loot.
    this.bossLoot = status === 'won' ? rollBossLoot(view, this.state.seed) : null;
    const after = applyBattleResultToSave(before, view, {
      encounterId: status === 'won' ? this.encounterId : null,
      labyrinthLoot: depth !== null ? { seed: this.state.seed, depth } : undefined,
      bossLoot: status === 'won' ? { seed: this.state.seed } : undefined,
      // Phase 174 — Welt-Uhr: Erst-Sieg-Bedingungsbelohnung (nur bei vorhandener Uhr).
      clock: status === 'won' && this.battleClock ? this.battleClock : undefined
    });
    this.levelUps = summarizeBattleLevelUps(before, after);
    this.magiculeGain = after.progression.magicules - before.progression.magicules;
    // Phase 124 — neu gemeisterte Jagdgruende fuer die Sieg-Zusammenfassung.
    this.masteredGrounds = newlyMasteredHuntingGrounds(before.flags, after.flags).map((ground) => ground.name);
    // Phase 174 — neu verdiente Welt-Uhr-Bedingungsfunde (Nacht/Nebel/Regen).
    this.weatherFinds = newlyRewardedWeatherConditions(before.flags, after.flags);
    this.save = autoSave(window.localStorage, after);
  }

  private drawHint(text: string): void {
    this.layer.add(this.add.text(24, 450, text, {
      fontFamily: 'sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#b9f1ff'
    }).setOrigin(0, 0.5));
    this.button(GAME_WIDTH - 196, 496, '↩ Abbrechen', () => {
      this.mode = 'menu';
      this.pendingSkillId = null;
      this.pendingItemId = null;
      this.pendingTeamPartnerId = null;
      this.pendingSignature = false;
      this.refresh();
    }, 180, '13px');
  }

  private drawEncounterTutorialHint(teamMeter: number): void {
    if (this.encounterId !== 'direwolf-pack-leader') return;
    const teamText = teamMeter >= 100 ? 'Team-Angriff bereit' : `Teamleiste ${teamMeter}/100`;
    this.layer.add(this.add.text(
      GAME_WIDTH / 2,
      70,
      `Boss-Tutorial: Schwächen mit Skills prüfen, bei Rudeldruck verteidigen, Buffs/Items nutzen · ${teamText}`,
      {
        fontFamily: 'sans-serif',
        fontSize: '13px',
        color: '#ffd6de'
      }
    ).setOrigin(0.5));
  }

  private button(
    x: number,
    y: number,
    label: string,
    callback: () => void,
    width = 190,
    fontSize = '14px'
  ): void {
    this.layer.add(addUiTextButton(this, x, y, width, label, callback, {
      idleAlpha: 0.95,
      fontSize,
      textOffsetX: width < 150 ? 8 : 12
    }));
  }

  private flash(message: string): void {
    const text = this.add.text(GAME_WIDTH / 2, 500, message, {
      fontFamily: 'sans-serif',
      fontSize: '14px',
      color: '#ffb86b'
    }).setOrigin(0.5);
    this.layer.add(text);
    this.tweens.add({ targets: text, alpha: 0, duration: 1100, onComplete: () => text.destroy() });
  }
}
