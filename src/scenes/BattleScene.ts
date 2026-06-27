import Phaser from 'phaser';
import { ITEMS, SKILLS } from '../data';
import type { ItemDefinition, SkillDefinition } from '../data';
import { GAME_WIDTH, GAME_HEIGHT } from '../main';
import { normalizeInventoryStacks } from '../systems/inventory';
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
  applyBattleProgressionRewards,
  calculateProgressionStats,
  calculateStartingTeamMeter,
  createProgressionBattleParty
} from '../systems/progression';
import { autoSave, createNewSave, loadSave, type SaveGameV2 } from '../systems/save';
import { snapshot, diffFeedback, totalDamage } from '../systems/feedback';
import { loadSettings } from '../systems/settings';
import { playSfx, resumeAudio } from '../audio/sfx';
import { fadeIn } from './transition';

type Mode = 'busy' | 'menu' | 'skills' | 'items' | 'target-enemy' | 'target-ally';

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
  private layer!: Phaser.GameObjects.Container;
  private fxLayer!: Phaser.GameObjects.Container;
  private unitPos = new Map<string, { x: number; y: number }>();
  private resultAnnounced = false;
  private rewardsApplied = false;
  private save!: SaveGameV2;

  constructor() {
    super('Battle');
  }

  create(data: { enemyIds?: string[] }): void {
    this.save = loadSave(window.localStorage) ?? createNewSave();
    this.state = startBattle({
      party: createProgressionBattleParty(
        this.save.party.active,
        this.save.progression,
        this.save.flags
      ),
      enemyIds: data?.enemyIds ?? ['forest-slime', 'direwolf-pup', 'spore-moth'],
      inventory: this.save.inventory.stacks,
      teamMeter: calculateStartingTeamMeter(this.save.party.active, this.save.progression),
      seed: (Date.now() & 0x7fffffff) || 1
    });
    this.resultAnnounced = false;
    this.rewardsApplied = false;
    this.unitPos.clear();
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0c1018);
    this.layer = this.add.container(0, 0);
    this.fxLayer = this.add.container(0, 0).setDepth(50); // Effekte überleben refresh()
    fadeIn(this);
    // Audio braucht eine Nutzergeste — bei erster Eingabe freischalten.
    this.input.once('pointerdown', resumeAudio);
    this.input.keyboard?.once('keydown', resumeAudio);
    this.afterAction();
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
    const rect = this.add.rectangle(pos.x, pos.y, 112, 62, color, 0.5).setDepth(55);
    this.fxLayer.add(rect);
    this.tweens.add({ targets: rect, alpha: 0, duration: 220, onComplete: () => rect.destroy() });
  }

  private poof(pos: { x: number; y: number }): void {
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const dot = this.add.circle(pos.x, pos.y, 3, 0xffd6a0).setDepth(60);
      this.fxLayer.add(dot);
      this.tweens.add({ targets: dot, x: pos.x + Math.cos(angle) * 38, y: pos.y + Math.sin(angle) * 38, alpha: 0, duration: 430, onComplete: () => dot.destroy() });
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
      return;
    }

    this.mode = 'busy';
    this.refresh();
    this.time.delayedCall(320, () => {
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
    // Geschoss/Klingenpunkt vom Angreifer zum Ziel
    const bolt = this.add.circle(from.x, from.y, magic ? 6 : 5, color).setDepth(58);
    this.fxLayer.add(bolt);
    this.tweens.add({ targets: bolt, x: to.x, y: to.y, duration: 170, ease: 'Quad.In', onComplete: () => bolt.destroy() });
  }

  private refresh(): void {
    this.layer.removeAll(true);
    const view = renderView(this.state);

    view.enemies.forEach((enemy, index) => this.drawUnit(enemy, this.colX(index, view.enemies.length), 145, 'enemy'));
    view.party.forEach((member, index) => this.drawUnit(member, this.colX(index, view.party.length), 360, 'party'));

    view.log.slice(0, 4).forEach((line, index) => {
      this.layer.add(this.add.text(16, 14 + index * 16, line, {
        fontFamily: 'sans-serif',
        fontSize: '12px',
        color: index === 0 ? '#e9d8a8' : '#7d8aa0'
      }));
    });

    if (this.state.status !== 'active') {
      this.drawResult(view.status, view.rewards);
      return;
    }

    const actor = currentActor(this.state);
    this.layer.add(this.add.text(16, 82, `Team-Leiste ${view.teamMeter}/100`, {
      fontFamily: 'sans-serif',
      fontSize: '12px',
      color: '#e9c56c'
    }));
    this.layer.add(this.add.text(GAME_WIDTH / 2, 250, actor ? `${actor.name} ist am Zug` : '', {
      fontFamily: 'sans-serif',
      fontSize: '15px',
      color: '#cdeaff'
    }).setOrigin(0.5));

    if (this.mode === 'menu') this.drawMenu();
    else if (this.mode === 'skills') this.drawSkillList();
    else if (this.mode === 'items') this.drawItemList();
    else if (this.mode === 'target-enemy') this.drawHint('Ziel-Gegner wählen');
    else if (this.mode === 'target-ally') this.drawHint('Verbündeten wählen');
  }

  private colX(index: number, count: number): number {
    const span = Math.min(GAME_WIDTH - 120, count * 150);
    const start = (GAME_WIDTH - span) / 2 + span / (count * 2);
    return start + (index * span) / count;
  }

  private drawUnit(unit: CombatantView, x: number, y: number, side: 'party' | 'enemy'): void {
    const width = 112;
    const alpha = unit.dead ? 0.35 : 1;
    this.unitPos.set(unit.id, { x, y }); // Position für Trefferzahlen/-effekte
    const box = this.add.rectangle(x, y, width, 62, side === 'enemy' ? 0x3a2230 : 0x223049, 0.9 * alpha)
      .setStrokeStyle(unit.active ? 3 : 1, unit.active ? 0xffe08a : 0x4a5876);
    this.layer.add(box);
    this.layer.add(this.add.text(x, y - 24, `${unit.name}${unit.guarding ? ' 🛡' : ''}`, {
      fontFamily: 'sans-serif',
      fontSize: '12px',
      color: '#e9eef7'
    }).setOrigin(0.5).setAlpha(alpha));
    if (unit.formName) {
      this.layer.add(this.add.text(x, y - 11, unit.formName, {
        fontFamily: 'sans-serif',
        fontSize: '9px',
        color: '#e9c56c'
      }).setOrigin(0.5).setAlpha(alpha));
    }

    this.layer.add(this.add.rectangle(x, y, width - 14, 8, 0x10151f).setOrigin(0.5));
    this.layer.add(this.add.rectangle(
      x - (width - 14) / 2,
      y,
      Math.max(0, (width - 14) * (unit.hp / unit.maxHp)),
      8,
      unit.dead ? 0x555555 : 0x53d98b
    ).setOrigin(0, 0.5));
    this.layer.add(this.add.text(x, y + 16, `${unit.hp}/${unit.maxHp} LP  ${unit.mp}/${unit.maxMp} MP`, {
      fontFamily: 'sans-serif',
      fontSize: '10px',
      color: '#9fb2cc'
    }).setOrigin(0.5).setAlpha(alpha));

    if (unit.statuses.includes('poison')) {
      this.layer.add(this.add.text(x + width / 2 - 8, y - 24, '☠', {
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
        this.refresh();
      }],
      ['✨ Skills', () => {
        this.mode = 'skills';
        this.refresh();
      }],
      ['🎒 Items', () => {
        this.mode = 'items';
        this.refresh();
      }],
      ['🛡 Verteidigen', () => this.doAct({ type: 'guard' })],
      ['🏃 Fliehen', () => this.doAct({ type: 'flee' })]
    ];
    const partner = renderView(this.state).party.find((candidate) =>
      !candidate.dead
      && candidate.id !== actor.id
      && (
        actor.synergyPartnerIds.includes(candidate.sourceId)
        || candidate.synergyPartnerIds.includes(actor.sourceId)
      )
    );
    if (renderView(this.state).teamMeter >= 100 && partner) {
      items.splice(3, 0, ['◆ Team-Angriff', () => {
        this.pendingSkillId = null;
        this.pendingItemId = null;
        this.pendingTeamPartnerId = partner.id;
        this.mode = 'target-enemy';
        this.refresh();
      }]);
    }
    if (!actor.skillIds.length) items.splice(1, 1);
    if (!renderView(this.state).inventory.length) items.splice(actor.skillIds.length ? 2 : 1, 1);

    items.forEach(([label, callback], index) => this.button(GAME_WIDTH - 170, 280 + index * 42, label, callback));
  }

  private drawSkillList(): void {
    const actor = currentActor(this.state)!;
    const skills = actor.skillIds.flatMap((id) => {
      const skill = skillById.get(id);
      return skill ? [skill] : [];
    });

    skills.forEach((skill, index) => {
      this.button(GAME_WIDTH - 190, 260 + index * 40, `${skill.name} (${skill.costMp} MP)`, () => {
        if (actor.mp < skill.costMp) {
          this.flash('Nicht genug MP.');
          return;
        }
        this.pendingSkillId = skill.id;
        this.pendingItemId = null;
        if (skill.target === 'all-enemies' || skill.target === 'self') {
          this.doAct({ type: 'skill', skillId: skill.id });
          return;
        }
        this.mode = skill.target === 'single-ally' ? 'target-ally' : 'target-enemy';
        this.refresh();
      });
    });
    this.button(GAME_WIDTH - 190, 260 + skills.length * 40, '↩ Zurück', () => {
      this.mode = 'menu';
      this.refresh();
    });
  }

  private drawItemList(): void {
    const inventory = renderView(this.state).inventory;
    inventory.forEach((stack, index) => {
      const item = itemById.get(stack.itemId);
      if (!item) return;
      this.button(GAME_WIDTH - 190, 260 + index * 40, `${item.name} ×${stack.quantity}`, () => {
        this.pendingItemId = item.id;
        this.pendingSkillId = null;
        this.mode = 'target-ally';
        this.refresh();
      });
    });
    this.button(GAME_WIDTH - 190, 260 + inventory.length * 40, '↩ Zurück', () => {
      this.mode = 'menu';
      this.refresh();
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
      if (!loadSettings(window.localStorage).reducedMotion) {
        if (won) this.cameras.main.flash(300, 80, 70, 30);
        else this.cameras.main.shake(260, 0.01);
      }
    }
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
    this.button(GAME_WIDTH / 2 - 90, 345, 'Zurück zur Welt', () => this.scene.start('Overworld'));
  }

  private applyBattleResult(status: string): void {
    const view = renderView(this.state);
    const progressionResult = status === 'won'
      ? applyBattleProgressionRewards(
          this.save.party.active,
          this.save.party.reserve,
          this.save.progression,
          view.rewards.experience
        )
      : {
          active: this.save.party.active,
          reserve: this.save.party.reserve,
          state: this.save.progression,
          grantedSkillPoints: 0
        };
    const jobIdsByCharacterId = {
      ...progressionResult.state.jobIdsByCharacterId,
      ...Object.fromEntries(
        view.party.flatMap((combatant) =>
          combatant.jobId ? [[combatant.sourceId, combatant.jobId]] : []
        )
      )
    };
    const progression = {
      ...progressionResult.state,
      jobIdsByCharacterId
    };
    const active = progressionResult.active.map((member) => {
      if (status === 'lost') {
        return member;
      }
      const previous = this.save.party.active.find(
        (candidate) => candidate.characterId === member.characterId
      );
      const combatant = view.party.find((candidate) => candidate.sourceId === member.characterId);
      if (!previous || !combatant) {
        return member;
      }
      const hpGrowth = Math.max(0, member.currentHp - previous.currentHp);
      const mpGrowth = Math.max(0, member.currentMp - previous.currentMp);
      const stats = calculateProgressionStats(
        member,
        progression,
        jobIdsByCharacterId[member.characterId]
      );
      return {
        ...member,
        currentHp: Math.min(stats.maxHp, Math.max(1, combatant.hp + hpGrowth)),
        currentMp: Math.min(stats.maxMp, Math.max(0, combatant.mp + mpGrowth))
      };
    });
    const inventory = status === 'won'
      ? normalizeInventoryStacks([...view.inventory, ...view.rewards.items])
      : normalizeInventoryStacks(view.inventory);

    this.save = autoSave(window.localStorage, {
      ...this.save,
      party: {
        active,
        reserve: progressionResult.reserve,
        gold: this.save.party.gold + (status === 'won' ? view.rewards.gold : 0)
      },
      inventory: { stacks: inventory },
      progression
    });
  }

  private drawHint(text: string): void {
    this.layer.add(this.add.text(GAME_WIDTH / 2, 470, text, {
      fontFamily: 'sans-serif',
      fontSize: '14px',
      color: '#9fe8ff'
    }).setOrigin(0.5));
    this.button(GAME_WIDTH - 170, 300, '↩ Abbrechen', () => {
      this.mode = 'menu';
      this.pendingSkillId = null;
      this.pendingItemId = null;
      this.pendingTeamPartnerId = null;
      this.refresh();
    });
  }

  private button(x: number, y: number, label: string, callback: () => void): void {
    const background = this.add.rectangle(x, y, 190, 36, 0x1b2940, 0.95)
      .setOrigin(0, 0.5)
      .setStrokeStyle(1, 0x68d7ff, 0.6)
      .setInteractive();
    const text = this.add.text(x + 12, y, label, {
      fontFamily: 'sans-serif',
      fontSize: '14px',
      color: '#e9eef7'
    }).setOrigin(0, 0.5);
    background.on('pointerover', () => background.setFillStyle(0x274062, 1));
    background.on('pointerout', () => background.setFillStyle(0x1b2940, 0.95));
    background.on('pointerdown', callback);
    this.layer.add(background);
    this.layer.add(text);
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
