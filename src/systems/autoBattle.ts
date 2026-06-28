// Auto-Kampf: wählt eine sinnvolle Aktion für die aktive Party-Einheit.
// Phaser-/DOM-frei → headless testbar. Heuristik: erst Heilung bei niedrigem LP,
// dann volle Team-Leisten, danach wirkungsvolle Schadensfähigkeiten und zuletzt
// normaler Angriff.
import { act, currentActor, renderView, type BattleState } from './battle';
import { ITEMS, SKILLS } from '../data';
import type { ItemDefinition, SkillDefinition } from '../data';
import { getItemCount } from './inventory';

export type BattleAction = Parameters<typeof act>[1];

const HEAL_THRESHOLD = 0.4;
const MP_RESTORE_THRESHOLD = 0.35;
const TEAM_ATTACK_THRESHOLD = 100;
const itemDefinitions: readonly ItemDefinition[] = ITEMS;

function skillsOf(ids: readonly string[]): SkillDefinition[] {
  return ids.flatMap((id) => {
    const s = SKILLS.find((sk) => sk.id === id);
    return s ? [s] : [];
  });
}

/** Liefert die nächste Auto-Aktion oder null (nicht am Zug / kein Ziel). */
export function chooseAutoAction(state: BattleState): BattleAction | null {
  const actor = currentActor(state);
  if (!actor || actor.side !== 'party') return null;

  const view = renderView(state);
  const enemies = view.enemies.filter((e) => !e.dead);
  const allies = view.party.filter((p) => !p.dead);
  const enemyStates = state.combatants.filter((combatant) => combatant.side === 'enemy' && !combatant.dead);
  if (!enemies.length) return null;

  const known = skillsOf(actor.skillIds).filter((s) => actor.mp >= s.costMp);
  const allKnownSkills = skillsOf(actor.skillIds);

  // 1) Heilung, wenn ein Verbündeter unter der Schwelle liegt.
  const heal = known.find((s) => s.tags.includes('heal'));
  const lowAlly = allies.slice().sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
  if (heal && lowAlly && lowAlly.hp / lowAlly.maxHp < HEAL_THRESHOLD) {
    return { type: 'skill', skillId: heal.id, targetId: lowAlly.id };
  }
  const healItem = consumableItem(state, 'heal-hp');
  if (healItem && lowAlly && lowAlly.hp / lowAlly.maxHp < HEAL_THRESHOLD) {
    return { type: 'item', itemId: healItem.id, targetId: lowAlly.id };
  }

  const target = chooseTarget(enemyStates) ?? enemies.slice().sort((a, b) => a.hp - b.hp)[0]!;

  const synergyPartner = allies.find((candidate) =>
    candidate.id !== actor.id
    && (
      actor.synergyPartnerIds.includes(candidate.sourceId)
      || candidate.synergyPartnerIds.includes(actor.sourceId)
    )
  );
  if (view.teamMeter >= TEAM_ATTACK_THRESHOLD && synergyPartner) {
    return { type: 'team-attack', partnerId: synergyPartner.id, targetId: target.id };
  }

  // 2) Wirkungsvollste Schadensfähigkeit, gewichtet nach Schwäche/Resistenz und AoE-Wert.
  const damage = chooseDamageSkill(
    known.filter((s) => !s.tags.includes('heal') && s.target !== 'self' && s.target !== 'single-ally'),
    enemyStates
  );
  if (damage) {
    if (damage.skill.target === 'all-enemies') return { type: 'skill', skillId: damage.skill.id };
    return { type: 'skill', skillId: damage.skill.id, targetId: damage.targetId ?? target.id };
  }

  const nextDamageSkill = allKnownSkills
    .filter((s) => !s.tags.includes('heal') && s.target !== 'self' && s.target !== 'single-ally')
    .sort((a, b) => a.costMp - b.costMp)[0];
  const mpItem = consumableItem(state, 'restore-mp');
  if (mpItem
    && nextDamageSkill
    && actor.mp < nextDamageSkill.costMp
    && actor.mp / Math.max(1, actor.maxMp) < MP_RESTORE_THRESHOLD) {
    return { type: 'item', itemId: mpItem.id, targetId: actor.id };
  }

  // 3) Standardangriff.
  return { type: 'attack', targetId: target.id };
}

function chooseTarget(enemies: BattleState['combatants']): BattleState['combatants'][number] | undefined {
  return enemies.slice().sort((a, b) => {
    const aBroken = a.statuses.some((status) => status.id === 'guard-break') ? 1 : 0;
    const bBroken = b.statuses.some((status) => status.id === 'guard-break') ? 1 : 0;
    return bBroken - aBroken
      || b.phaseIndex - a.phaseIndex
      || (a.hp / a.maxHp) - (b.hp / b.maxHp);
  })[0];
}

function chooseDamageSkill(
  skills: readonly SkillDefinition[],
  enemies: BattleState['combatants']
): { skill: SkillDefinition; targetId?: string } | null {
  let best: { skill: SkillDefinition; targetId?: string; score: number } | null = null;

  for (const skill of skills) {
    if (skill.target === 'all-enemies') {
      const score = enemies.reduce((sum, enemy) => sum + scoreSkillTarget(skill, enemy), 0);
      best = keepBest(best, { skill, score });
      continue;
    }

    for (const enemy of enemies) {
      best = keepBest(best, {
        skill,
        targetId: enemy.id,
        score: scoreSkillTarget(skill, enemy)
      });
    }
  }

  return best ? { skill: best.skill, targetId: best.targetId } : null;
}

function keepBest<T extends { score: number }>(current: T | null, candidate: T): T {
  if (!current || candidate.score > current.score) {
    return candidate;
  }
  return current;
}

function scoreSkillTarget(
  skill: SkillDefinition,
  enemy: BattleState['combatants'][number]
): number {
  const element = enemy.weaknesses.includes(skill.element)
    ? 1.85
    : (enemy.resistances.includes(skill.element) || enemy.element === skill.element ? 0.45 : 1);
  const breakPressure = enemy.weaknesses.includes(skill.element)
    ? Math.max(0, enemy.breakGaugeMax - enemy.breakGauge + 1) * 6
    : 0;
  const phasePressure = enemy.phaseIndex > 0 ? 10 : 0;
  const woundPressure = (1 - enemy.hp / enemy.maxHp) * 8;

  return skill.power * element + breakPressure + phasePressure + woundPressure - skill.costMp * 1.5;
}

function consumableItem(
  state: BattleState,
  kind: NonNullable<ItemDefinition['effect']>['kind']
): ItemDefinition | undefined {
  return itemDefinitions
    .filter((item) =>
      item.category === 'consumable'
      && item.effect?.kind === kind
      && getItemCount(state.inventory, item.id) > 0
    )
    .sort((a, b) => (a.effect?.amount ?? 0) - (b.effect?.amount ?? 0))[0];
}
