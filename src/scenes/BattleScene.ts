import Phaser from 'phaser';
import { ITEMS, SKILLS } from '../data';
import type { ItemDefinition, SkillDefinition } from '../data';
import { GAME_WIDTH, GAME_HEIGHT } from '../main';
import {
  act,
  currentActor,
  enemyTurn,
  isPlayerTurn,
  renderView,
  startBattle,
  type BattleState,
  type CombatantView
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
import { applyBattleResultToSave } from '../systems/battleResult';
import { autoSave, createNewSave, loadSave, type SaveGameV2 } from '../systems/save';
import { snapshot, diffFeedback, totalDamage } from '../systems/feedback';
import { enemyDamageMultiplier, loadSettings, playerDamageMultiplier } from '../systems/settings';
import { playSfx, resumeAudio } from '../audio/sfx';
import { playMusic, resumeMusic } from '../audio/music';
import { idleBobSpec, type VfxKind } from '../render/artSpec';
import { vfxKey } from '../render/vfxAtlas';
import { addUiTextButton } from '../render/uiSkin';
import { addUiPanel } from '../render/uiSkin';
import { enemyArtFor, type EnemyArtSpec } from '../render/enemyArt';
import { battleArenaForMap, partyBattleTextureFor } from '../render/battleArt';
import { fadeIn } from './transition';
import { chooseAutoAction, prepareAutoReaction } from '../systems/autoBattle';
import { getBattleTutorial } from '../systems/battleTutorial';
import { resolveElementFusion } from '../systems/fusion';
import { buildEnemyIntel, formatStatusSummary } from '../systems/battlePresentation';

type Mode = 'busy' | 'menu' | 'skills' | 'items' | 'team-partners' | 'target-enemy' | 'target-ally';

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
  private layer!: Phaser.GameObjects.Container;
  private fxLayer!: Phaser.GameObjects.Container;
  private idleTweens: Phaser.Tweens.Tween[] = [];
  private unitPos = new Map<string, { x: number; y: number }>();
  private resultAnnounced = false;
  private rewardsApplied = false;
  private auto = false;
  private save!: SaveGameV2;
  private encounterId: string | null = null;

  constructor() {
    super('Battle');
  }

  create(data: { enemyIds?: string[]; encounterId?: string }): void {
    this.save = loadSave(window.localStorage) ?? createNewSave();
    const settings = loadSettings(window.localStorage);
    this.encounterId = data?.encounterId ?? null;
    this.state = startBattle({
      party: createProgressionBattleParty(
        this.save.party.active,
        this.save.progression
      ),
      // Phase 67: Gegner skalieren nach oben mit dem Partylevel (Anti-Overgrind).
      enemies: createScaledEnemyBattleUnits(
        data?.enemyIds ?? ['forest-slime', 'direwolf-pup', 'spore-moth'],
        averagePartyLevel(this.save.party.active.map((member) => member.level)),
        scalingKindForEncounter(this.encounterId)
      ),
      inventory: this.save.inventory.stacks,
      teamMeter: calculateStartingTeamMeter(this.save.party.active, this.save.progression),
      damageMultipliers: {
        party: playerDamageMultiplier(settings),
        enemy: enemyDamageMultiplier(settings)
      },
      seed: (Date.now() & 0x7fffffff) || 1
    });
    this.resultAnnounced = false;
    this.rewardsApplied = false;
    this.auto = false; // Phaser nutzt die Instanz wieder → transienten Zustand zurücksetzen
    this.pendingSignature = false;
    this.unitPos.clear();
    this.drawArena();
    this.layer = this.add.container(0, 0);
    this.fxLayer = this.add.container(0, 0).setDepth(50); // Effekte überleben refresh()
    fadeIn(this);
    playMusic('battle');
    // Audio braucht eine Nutzergeste — bei erster Eingabe freischalten.
    const unlockAudio = () => { resumeAudio(); resumeMusic(); };
    this.input.once('pointerdown', unlockAudio);
    this.input.keyboard?.once('keydown', unlockAudio);
    this.afterAction();
    this.showEncounterTutorial();
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
    const arena = battleArenaForMap(this.save.location.mapId, this.encounterId);
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
    if (dmg > 0) playSfx('hit');
    if (healed) playSfx('heal');
    if (!reduced && dmg > 0) {
      this.cameras.main.shake(Math.min(220, 70 + dmg * 4), Math.min(0.012, 0.003 + dmg * 0.0004));
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
        this.time.delayedCall(260, () => {
          if (!this.auto || !isPlayerTurn(this.state)) return;
          const action = chooseAutoAction(this.state);
          if (action) this.doAct(action);
        });
      }
      return;
    }

    this.mode = 'busy';
    this.refresh();
    this.time.delayedCall(320, () => {
      if (this.auto) prepareAutoReaction(this.state);
      const before = snapshot(this.allViews());
      enemyTurn(this.state);
      this.playFeedback(diffFeedback(before, snapshot(this.allViews())));
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
    this.attackStreak(actor?.id, action);
    this.pendingTeamPartnerId = null;
    this.playFeedback(diffFeedback(before, snapshot(this.allViews())));
    this.afterAction();
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
    view.party.forEach((member, index) => this.drawUnit(member, this.colX(index, view.party.length), 345, 'party'));

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
    else if (this.mode === 'skills') this.drawSkillList();
    else if (this.mode === 'items') this.drawItemList();
    else if (this.mode === 'team-partners') this.drawTeamPartnerList();
    else if (this.mode === 'target-enemy') this.drawHint('Ziel-Gegner wählen');
    else if (this.mode === 'target-ally') this.drawHint('Verbündeten wählen');
  }

  private colX(index: number, count: number): number {
    const span = Math.min(GAME_WIDTH - 120, count * 150);
    const start = (GAME_WIDTH - span) / 2 + span / (count * 2);
    return start + (index * span) / count;
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
      this.layer.add(this.add.text(x, y + 63, `${intel.breakText} · ${intel.weaknessText}`, {
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

    if (unit.statuses.includes('poison')) {
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
        if (this.pendingTeamPartnerId) {
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
        this.refresh();
      }],
      ['✨ Skills', () => {
        this.pendingSignature = false;
        this.mode = 'skills';
        this.refresh();
      }],
      ['🎒 Items', () => {
        this.pendingSignature = false;
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
    const skills = actor.skillIds.flatMap((id) => {
      const skill = skillById.get(id);
      return skill ? [skill] : [];
    });

    const choices: Array<[string, () => void]> = skills.map((skill) => [
      `${skill.name} (${skill.costMp} MP)`,
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
      if (!item) return [];
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
      playSfx(won ? 'victory' : status === 'fled' ? 'cancel' : 'defeat');
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

    // Sichtbare Ergebnis-Dialogbox hinter dem Resultat (statt frei schwebendem Text).
    const boxTop = 224;
    const boxBottom = pactMessage ? 432 : (won ? 408 : 372);
    this.layer.add(this.add.rectangle(
      GAME_WIDTH / 2, (boxTop + boxBottom) / 2, 480, boxBottom - boxTop, 0x0a0f18, 0.94
    ).setStrokeStyle(2, won ? 0xe9c56c : 0xff7b8a, 0.85));

    const title = won ? '🏆 Sieg!' : status === 'fled' ? '🏃 Entkommen' : '💀 Niederlage';
    this.layer.add(this.add.text(GAME_WIDTH / 2, 250, title, {
      fontFamily: 'serif',
      fontSize: '34px',
      color: won ? '#e9c56c' : '#ff7b8a'
    }).setOrigin(0.5));

    if (won) {
      const drops = rewards.items
        .map((stack) => `${itemById.get(stack.itemId)?.name ?? stack.itemId} ×${stack.quantity}`)
        .join(', ');
      this.layer.add(this.add.text(GAME_WIDTH / 2, 290, `+${rewards.experience} EP   +${rewards.gold} Gold`, {
        fontFamily: 'sans-serif',
        fontSize: '16px',
        color: '#cbd6e8'
      }).setOrigin(0.5));
      if (drops.length > 0) {
        this.layer.add(this.add.text(GAME_WIDTH / 2, 314, `Beute: ${drops}`, {
          fontFamily: 'sans-serif',
          fontSize: '13px',
          color: '#9fb2cc'
        }).setOrigin(0.5));
      }
    }
    if (pactMessage) {
      this.layer.add(this.add.text(GAME_WIDTH / 2, 338, pactMessage, {
        fontFamily: 'sans-serif',
        fontSize: '14px',
        color: '#ffd6de'
      }).setOrigin(0.5));
    }
    this.button(GAME_WIDTH / 2 - 90, pactMessage ? 382 : 345, 'Zurück zur Welt', () => this.scene.start('Overworld'));
  }

  private applyBattleResult(status: string): void {
    const view = renderView(this.state);
    this.save = autoSave(window.localStorage, applyBattleResultToSave(this.save, view, {
      encounterId: status === 'won' ? this.encounterId : null
    }));
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
