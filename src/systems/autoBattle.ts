// Auto-Kampf: wählt eine sinnvolle Aktion für die aktive Party-Einheit.
// Phaser-/DOM-frei → headless testbar. Heuristik: erst Heilung bei niedrigem LP,
// dann volle Team-Leisten, danach wirkungsvolle Schadensfähigkeiten und zuletzt
// normaler Angriff.
import { act, currentActor, queueReaction, renderView, type BattleState } from './battle';
import { ITEMS, SIGNATURES, SKILLS } from '../data';
import type { ItemDefinition, SkillDefinition, StatusEffectId } from '../data';
import { getItemCount } from './inventory';
import { resolveElementFusion } from './fusion';

export type BattleAction = Parameters<typeof act>[1];

const HEAL_THRESHOLD = 0.4;
const MP_RESTORE_THRESHOLD = 0.35;
const TEAM_ATTACK_THRESHOLD = 100;
const ANALYSIS_DURABLE_HP = 90;
const CT_THRESHOLD = 100;
const itemDefinitions: readonly ItemDefinition[] = ITEMS;
const CONTROL_OR_DEBUFF_STATUSES: readonly StatusEffectId[] = [
  'guard-break',
  'stun',
  'sleep',
  'freeze',
  'paralyze',
  'petrify',
  'blind',
  'silence',
  'confuse',
  'charm',
  'weaken',
  'spirit-down',
  'poison'
];

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
  const allyStates = state.combatants.filter((combatant) => combatant.side === 'party' && !combatant.dead);
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

  const signature = SIGNATURES.find((candidate) => candidate.id === actor.signatureId);
  if (signature && actor.signatureCharge >= actor.signatureChargeMax) {
    if (signature.target === 'single-enemy') {
      return { type: 'signature', targetId: target.id };
    }
    if (signature.target === 'single-ally') {
      return { type: 'signature', targetId: lowAlly?.id ?? actor.id };
    }
    return { type: 'signature' };
  }

  const devourTarget = chooseDevourTarget(actor, enemyStates);
  if (devourTarget) {
    return { type: 'devour', targetId: devourTarget.id };
  }

  const synergyPartners = allies.filter((candidate) =>
    candidate.id !== actor.id
    && (
      actor.synergyPartnerIds.includes(candidate.sourceId)
      || candidate.synergyPartnerIds.includes(actor.sourceId)
    )
  );
  const synergyPartner = synergyPartners.find((candidate) =>
    resolveElementFusion(actor.resonanceElement, candidate.resonanceElement)
  ) ?? synergyPartners[0];
  if (view.teamMeter >= TEAM_ATTACK_THRESHOLD && synergyPartner) {
    return { type: 'team-attack', partnerId: synergyPartner.id, targetId: target.id };
  }

  const analysisTarget = chooseAnalysisTarget(actor, enemyStates);
  if (analysisTarget) {
    return { type: 'analyze', targetId: analysisTarget.id };
  }

  const support = chooseSupportSkill(known, allyStates, actor);
  if (support) {
    return {
      type: 'skill',
      skillId: support.skill.id,
      targetId: support.targetId
    };
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

/** Bereitet im Auto-Kampf eine Reaktion vor, wenn ein analysierter Gegner seinen nächsten Skill telegraphiert. */
export function prepareAutoReaction(state: BattleState): boolean {
  const actor = currentActor(state);
  if (!actor || actor.side !== 'enemy' || actor.analysisLevel <= 0 || !actor.telegraphSkillId) {
    return false;
  }

  const skill = SKILLS.find((candidate) => candidate.id === actor.telegraphSkillId) as SkillDefinition | undefined;
  if (!skill || skill.power <= 0 && !skill.statusEffect && !skill.ctDelta) {
    return false;
  }

  const allies = state.combatants
    .filter((combatant) => combatant.side === 'party' && !combatant.dead && !combatant.reaction);
  if (allies.length === 0) {
    return false;
  }

  const target = chooseReactionTarget(skill, allies);
  const shouldCounter = skill.target === 'single-enemy'
    && skill.power <= 18
    && target.hp / target.maxHp > 0.55;
  return queueReaction(state, target.id, {
    kind: shouldCounter ? 'counter' : 'timing-block',
    timing: 'success'
  }).ok;
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

function chooseAnalysisTarget(
  actor: BattleState['combatants'][number],
  enemies: BattleState['combatants']
): BattleState['combatants'][number] | null {
  if (!actor.skillIds.includes('great-sage')) {
    return null;
  }

  return enemies
    .filter((enemy) =>
      enemy.analysisLevel < 1
      && (
        enemy.maxHp >= ANALYSIS_DURABLE_HP
        || enemy.skillIds.length > 1
        || enemy.phaseIndex > 0
      )
    )
    .sort((a, b) =>
      b.maxHp - a.maxHp
      || b.skillIds.length - a.skillIds.length
      || (a.hp / a.maxHp) - (b.hp / b.maxHp)
    )[0] ?? null;
}

function chooseDevourTarget(
  actor: BattleState['combatants'][number],
  enemies: BattleState['combatants']
): BattleState['combatants'][number] | null {
  if (!actor.skillIds.includes('predator')) {
    return null;
  }

  return enemies
    .filter((enemy) =>
      enemy.devourable
      && !!enemy.devourSkillId
      && (
        enemy.hp / enemy.maxHp <= 0.35
        || enemy.statuses.some((status) => status.id === 'guard-break')
        || enemy.statuses.some((status) => CONTROL_OR_DEBUFF_STATUSES.includes(status.id) && status.id !== 'guard-break')
      )
    )
    .sort((a, b) =>
      (a.hp / a.maxHp) - (b.hp / b.maxHp)
      || b.analysisLevel - a.analysisLevel
    )[0] ?? null;
}

function chooseSupportSkill(
  skills: readonly SkillDefinition[],
  allies: BattleState['combatants'],
  actor: BattleState['combatants'][number]
): { skill: SkillDefinition; targetId?: string } | null {
  let best: { skill: SkillDefinition; targetId?: string; score: number } | null = null;

  for (const skill of skills) {
    if (skill.tags.includes('heal') || (skill.target !== 'self' && skill.target !== 'single-ally')) {
      continue;
    }

    const targets = skill.target === 'self' ? [actor] : allies;
    for (const target of targets) {
      let score = 0;
      if (skill.ctDelta && skill.ctDelta > 0 && target.ct < CT_THRESHOLD) {
        score += skill.ctDelta / 20 * (1 + (CT_THRESHOLD - target.ct) / CT_THRESHOLD);
      }
      if (skill.statusEffect && !target.statuses.some((status) => status.id === skill.statusEffect!.id)) {
        score += skill.statusEffect.id === 'haste' ? 2.6 : 1.8;
      }
      if (score > 0) {
        best = keepBest(best, { skill, targetId: target.id, score });
      }
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
  const ctPressure = skill.ctDelta && skill.ctDelta < 0
    ? Math.abs(skill.ctDelta) * Math.max(0, enemy.ct) / CT_THRESHOLD * 0.2
    : 0;
  const statusPressure = skill.statusEffect && !enemy.statuses.some((status) => status.id === skill.statusEffect!.id)
    ? scoreStatusPressure(skill.statusEffect.id, enemy)
    : 0;

  return skill.power * element + breakPressure + phasePressure + woundPressure + ctPressure + statusPressure - skill.costMp * 1.5;
}

function scoreStatusPressure(statusId: StatusEffectId, enemy: BattleState['combatants'][number]): number {
  switch (statusId) {
    case 'guard-break':
      return 28;
    case 'stun':
    case 'sleep':
    case 'freeze':
    case 'petrify':
      return 35;
    case 'paralyze':
    case 'confuse':
    case 'charm':
      return 26;
    case 'silence':
      return enemy.magic >= enemy.attack ? 20 : 8;
    case 'blind':
      return enemy.attack >= enemy.magic ? 20 : 8;
    case 'weaken':
    case 'spirit-down':
      return 16;
    case 'poison':
      return enemy.hp / enemy.maxHp > 0.35 ? 14 : 3;
    case 'attack-up':
    case 'defense-up':
    case 'magic-up':
    case 'haste':
      return 0;
  }
}

function chooseReactionTarget(
  skill: SkillDefinition,
  allies: BattleState['combatants']
): BattleState['combatants'][number] {
  if (skill.target === 'all-enemies') {
    return allies.slice().sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0]!;
  }
  return allies.slice().sort((a, b) =>
    a.hp / a.maxHp - b.hp / b.maxHp
    || (b.statuses.some((status) => status.id === 'guard-break') ? 1 : 0)
      - (a.statuses.some((status) => status.id === 'guard-break') ? 1 : 0)
  )[0]!;
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
