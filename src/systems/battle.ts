// Rundenkampf-Engine — rein, deterministisch, ohne Phaser/DOM.
// Phase 3 nutzt bewusst die Phase-2-Datenmodelle statt eigener Demo-Daten:
// Charaktere, Gegner, Skills, Items und Inventar bleiben datengetrieben.
import {
  ENEMIES,
  HEROES,
  ITEMS,
  SKILLS,
  type CharacterDefinition,
  type ElementType,
  type EnemyDefinition,
  type EnemyDrop,
  type ItemDefinition,
  type SkillDefinition,
  type StatBlock,
  type StatusEffectId
} from '../data';
import { getItemCount, normalizeInventoryStacks, type InventoryStack } from './inventory';
import type { PartyMemberState } from './party';
import { makeRng, type Rng } from './rng';
import { scaleStats } from './stats';

export type Side = 'party' | 'enemy';
export type BattleStatus = 'active' | 'won' | 'lost' | 'fled';

export interface StatusInstance {
  readonly id: StatusEffectId;
  turns: number;
}

export type ReactionKind = 'timing-block' | 'counter';
export type ReactionTiming = 'perfect' | 'success' | 'miss';

export interface QueuedReaction {
  readonly kind: ReactionKind;
  readonly timing: ReactionTiming;
}

export interface BattleUnitInput {
  readonly sourceId: string;
  readonly name: string;
  readonly formName?: string;
  readonly side: Side;
  readonly level: number;
  readonly stats: StatBlock;
  readonly currentHp?: number;
  readonly currentMp?: number;
  readonly element: ElementType;
  readonly weaknesses: readonly ElementType[];
  readonly resistances: readonly ElementType[];
  readonly skillIds: readonly string[];
  readonly synergyPartnerIds?: readonly string[];
  readonly openingStatusIds?: readonly StatusEffectId[];
  readonly experienceReward?: number;
  readonly goldReward?: number;
  readonly drops?: readonly EnemyDrop[];
}

export interface Combatant {
  readonly id: string;
  readonly sourceId: string;
  readonly name: string;
  readonly formName: string | null;
  readonly side: Side;
  readonly level: number;
  readonly baseStats: StatBlock;
  baseSkillIds: string[];
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attack: number;
  defense: number;
  magic: number;
  spirit: number;
  agility: number;
  readonly element: ElementType;
  readonly weaknesses: readonly ElementType[];
  readonly resistances: readonly ElementType[];
  skillIds: string[];
  readonly synergyPartnerIds: readonly string[];
  readonly statuses: StatusInstance[];
  reaction: QueuedReaction | null;
  breakGauge: number;
  readonly breakGaugeMax: number;
  phaseIndex: number;
  readonly phaseThreshold: number;
  ct: number;
  guarding: boolean;
  dead: boolean;
  readonly experienceReward: number;
  readonly goldReward: number;
  readonly drops: readonly EnemyDrop[];
}

export interface BattleRewards {
  experience: number;
  gold: number;
  items: InventoryStack[];
}

export type BattleDamageMultipliers = Readonly<Record<Side, number>>;

export interface BattleState {
  combatants: Combatant[];
  inventory: InventoryStack[];
  status: BattleStatus;
  activeId: string | null;
  teamMeter: number;
  readonly damageMultipliers: BattleDamageMultipliers;
  round: number;
  turns: number;
  readonly seed: number;
  readonly rng: Rng;
  log: string[];
  rewards: BattleRewards;
}

export type BattleAction =
  | { type: 'attack'; targetId: string }
  | { type: 'skill'; skillId: string; targetId?: string }
  | { type: 'item'; itemId: string; targetId?: string }
  | { type: 'team-attack'; partnerId: string; targetId: string }
  | { type: 'guard' }
  | { type: 'flee' };

export interface StartBattleOptions {
  readonly party?: readonly BattleUnitInput[];
  readonly enemyIds?: readonly string[];
  readonly enemies?: readonly BattleUnitInput[];
  readonly inventory?: readonly InventoryStack[];
  readonly teamMeter?: number;
  readonly damageMultipliers?: Partial<BattleDamageMultipliers>;
  readonly seed: number;
}

export interface ActionResult {
  readonly ok: boolean;
  readonly reason?: string;
}

export const CT_THRESHOLD = 100;
export const MAX_TURNS = 300;

const POISON_DAMAGE_FRACTION = 0.06;
const MAX_ADVANCE_STEPS = 100_000;
const BREAK_GAUGE_MAX = 4;
const TEAM_METER_MAX = 100;
const TEAM_METER_BREAK_GAIN = 35;
const TEAM_ATTACK_COST = 100;

const skillById = new Map<string, SkillDefinition>(SKILLS.map((skill) => [skill.id, skill]));
const itemById = new Map<string, ItemDefinition>(ITEMS.map((item) => [item.id, item]));
const heroById = new Map<string, CharacterDefinition>(HEROES.map((hero) => [hero.id, hero]));
const enemyById = new Map<string, EnemyDefinition>(ENEMIES.map((enemy) => [enemy.id, enemy]));

export function createDefaultBattleParty(): BattleUnitInput[] {
  return HEROES.filter((hero) => hero.startsInParty).map((hero) => createHeroBattleUnit(hero));
}

export function createBattlePartyFromMembers(members: readonly PartyMemberState[]): BattleUnitInput[] {
  return members.flatMap((member): BattleUnitInput[] => {
    const hero = heroById.get(member.characterId);
    if (!hero) {
      return [];
    }

    return [
      createHeroBattleUnit(hero, {
        name: member.name,
        level: member.level,
        currentHp: member.currentHp,
        currentMp: member.currentMp,
        skillIds: member.learnedSkillIds
      })
    ];
  });
}

export function createHeroBattleUnit(
  hero: CharacterDefinition,
  overrides: Partial<Pick<
    BattleUnitInput,
    'currentHp'
    | 'currentMp'
    | 'formName'
    | 'level'
    | 'name'
    | 'openingStatusIds'
    | 'skillIds'
    | 'synergyPartnerIds'
  >> = {}
): BattleUnitInput {
  const level = overrides.level ?? hero.initialLevel;
  const stats = scaleStats(hero.baseStats, hero.growthPerLevel, level);

  return {
    sourceId: hero.id,
    name: overrides.name ?? hero.name,
    formName: overrides.formName,
    side: 'party',
    level,
    stats,
    currentHp: overrides.currentHp,
    currentMp: overrides.currentMp,
    element: 'neutral',
    weaknesses: [],
    resistances: [],
    skillIds: overrides.skillIds ?? hero.initialSkillIds,
    synergyPartnerIds: overrides.synergyPartnerIds,
    openingStatusIds: overrides.openingStatusIds
  };
}

export function createEnemyBattleUnits(enemyIds: readonly string[]): BattleUnitInput[] {
  return enemyIds.flatMap((enemyId): BattleUnitInput[] => {
    const enemy = enemyById.get(enemyId);
    return enemy ? [createEnemyBattleUnit(enemy)] : [];
  });
}

export function createEnemyBattleUnit(enemy: EnemyDefinition): BattleUnitInput {
  return {
    sourceId: enemy.id,
    name: enemy.name,
    side: 'enemy',
    level: enemy.level,
    stats: enemy.stats,
    element: enemy.element,
    weaknesses: enemy.weaknesses,
    resistances: enemy.resistances,
    skillIds: enemy.skillIds,
    experienceReward: enemy.experienceReward,
    goldReward: enemy.goldReward,
    drops: enemy.drops
  };
}

export function startBattle(options: StartBattleOptions): BattleState {
  const rng = makeRng(options.seed);
  const party = options.party ?? createDefaultBattleParty();
  const enemies = options.enemies ?? createEnemyBattleUnits(options.enemyIds ?? ['forest-slime']);
  const combatants = [
    ...party.map((unit, index) => createCombatant(unit, `p${index}-${unit.sourceId}`)),
    ...enemies.map((unit, index) => createCombatant(unit, `e${index}-${unit.sourceId}`))
  ];

  for (const combatant of combatants) {
    combatant.ct = Math.floor(combatant.agility * (0.35 + rng() * 0.3));
  }

  const state: BattleState = {
    combatants,
    inventory: normalizeInventoryStacks(options.inventory ?? []),
    status: 'active',
    activeId: null,
    teamMeter: clamp(options.teamMeter ?? 0, 0, TEAM_METER_MAX),
    damageMultipliers: normalizeDamageMultipliers(options.damageMultipliers),
    round: 1,
    turns: 0,
    seed: options.seed,
    rng,
    log: ['Ein Kampf beginnt!'],
    rewards: { experience: 0, gold: 0, items: [] }
  };

  advanceToNextActor(state);
  return state;
}

export function currentActor(state: BattleState): Combatant | undefined {
  return getCombatant(state, state.activeId);
}

export function isPlayerTurn(state: BattleState): boolean {
  const actor = currentActor(state);
  return state.status === 'active' && actor?.side === 'party';
}

export function act(state: BattleState, action: BattleAction): ActionResult {
  const actor = currentActor(state);
  if (state.status !== 'active' || !actor || actor.side !== 'party') {
    return { ok: false, reason: 'Nicht am Zug.' };
  }

  return resolveAction(state, actor, action);
}

export function queueReaction(
  state: BattleState,
  combatantId: string,
  reaction: QueuedReaction
): ActionResult {
  const combatant = getCombatant(state, combatantId);
  if (state.status !== 'active' || !combatant || combatant.side !== 'party' || combatant.dead) {
    return { ok: false, reason: 'Reaktion nicht möglich.' };
  }

  combatant.reaction = reaction;
  pushLog(state, `${combatant.name} bereitet ${reaction.kind === 'counter' ? 'Konter' : 'Block-Timing'} vor.`);
  return { ok: true };
}

export function enemyTurn(state: BattleState): ActionResult {
  const actor = currentActor(state);
  if (state.status !== 'active' || !actor || actor.side !== 'enemy') {
    return { ok: false, reason: 'Kein Gegnerzug.' };
  }
  updateEnemyPhase(state, actor);

  const foes = livingCombatants(state, 'party');
  if (foes.length === 0) {
    checkEnd(state);
    return { ok: true };
  }

  const usableSkills = actor.skillIds
    .map(getSkill)
    .filter((skill): skill is SkillDefinition => !!skill && canUseSkill(actor, skill))
    .filter((skill) => !isHealingSkill(skill));

  const skillChance = actor.phaseIndex >= 1 ? 0.9 : 0.65;
  if (usableSkills.length > 0 && state.rng() < skillChance) {
    const scored = usableSkills
      .flatMap((skill) => aiTargetsForSkill(state, actor, skill).map((target) => ({
        skill,
        target,
        score: scoreEnemySkillTarget(actor, skill, target)
      })))
      .sort((a, b) => b.score - a.score);

    const choice = scored[0];
    if (choice) {
      return resolveAction(state, actor, {
        type: 'skill',
        skillId: choice.skill.id,
        targetId: choice.target.id
      });
    }
  }

  const target = actor.phaseIndex >= 1
    ? foes.sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp))[0]!
    : foes[Math.floor(state.rng() * foes.length)]!;
  return resolveAction(state, actor, { type: 'attack', targetId: target.id });
}

function aiTargetsForSkill(state: BattleState, actor: Combatant, skill: SkillDefinition): Combatant[] {
  if (skill.target === 'single-enemy' || skill.target === 'all-enemies') {
    return livingCombatants(state, actor.side === 'party' ? 'enemy' : 'party');
  }
  if (skill.target === 'single-ally') {
    return livingCombatants(state, actor.side);
  }
  return [actor];
}

function createCombatant(unit: BattleUnitInput, id: string): Combatant {
  const stats = unit.stats;
  const baseSkillIds = [...unit.skillIds];
  const breakGaugeMax = unit.side === 'enemy' ? BREAK_GAUGE_MAX : Math.max(3, BREAK_GAUGE_MAX - 1);

  return {
    id,
    sourceId: unit.sourceId,
    name: unit.name,
    formName: unit.formName ?? null,
    side: unit.side,
    level: unit.level,
    baseStats: unit.stats,
    baseSkillIds,
    hp: clamp(unit.currentHp ?? stats.maxHp, 0, stats.maxHp),
    maxHp: stats.maxHp,
    mp: clamp(unit.currentMp ?? stats.maxMp, 0, stats.maxMp),
    maxMp: stats.maxMp,
    attack: stats.attack,
    defense: stats.defense,
    magic: stats.magic,
    spirit: stats.spirit,
    agility: Math.max(1, stats.agility),
    element: unit.element,
    weaknesses: unit.weaknesses,
    resistances: unit.resistances,
    skillIds: uniqueStrings([...baseSkillIds]),
    synergyPartnerIds: [...(unit.synergyPartnerIds ?? [])],
    statuses: uniqueStrings(unit.openingStatusIds ?? []).map((statusId) => ({
      id: statusId,
      turns: 3
    })),
    reaction: null,
    breakGauge: breakGaugeMax,
    breakGaugeMax,
    phaseIndex: 0,
    phaseThreshold: 0.5,
    ct: 0,
    guarding: false,
    dead: false,
    experienceReward: unit.experienceReward ?? 0,
    goldReward: unit.goldReward ?? 0,
    drops: unit.drops ?? []
  };
}

function resolveAction(state: BattleState, actor: Combatant, action: BattleAction): ActionResult {
  if (actor.dead) {
    return { ok: false, reason: 'Ein besiegter Kämpfer kann nicht handeln.' };
  }

  switch (action.type) {
    case 'guard':
      actor.guarding = true;
      pushLog(state, `${actor.name} verteidigt.`);
      endTurn(state, actor);
      return { ok: true };

    case 'flee':
      return resolveFlee(state, actor);

    case 'attack':
      return resolveAttack(state, actor, action.targetId);

    case 'skill':
      return resolveSkill(state, actor, action.skillId, action.targetId);

    case 'item':
      return resolveItem(state, actor, action.itemId, action.targetId);

    case 'team-attack':
      return resolveTeamAttack(state, actor, action.partnerId, action.targetId);
  }
}

function resolveFlee(state: BattleState, actor: Combatant): ActionResult {
  if (actor.side !== 'party') {
    endTurn(state, actor);
    return { ok: true };
  }

  const averageEnemyAgility = average(livingCombatants(state, 'enemy').map((enemy) => enemy.agility));
  const chance = clamp(0.35 + (actor.agility - averageEnemyAgility) * 0.025, 0.15, 0.85);
  if (state.rng() < chance) {
    state.status = 'fled';
    state.activeId = null;
    pushLog(state, `${actor.name} flieht aus dem Kampf.`);
    return { ok: true };
  }

  pushLog(state, `${actor.name} kann nicht fliehen.`);
  endTurn(state, actor);
  return { ok: true };
}

function resolveAttack(state: BattleState, actor: Combatant, targetId: string): ActionResult {
  const target = getCombatant(state, targetId);
  if (!target || target.dead || target.side === actor.side) {
    return { ok: false, reason: 'Ungültiges Ziel.' };
  }

  const rawDamage = (effectiveStat(actor, 'attack') * 1.8 - effectiveStat(target, 'defense') * 0.8) * variance(state.rng);
  const damage = applyDamage(state, actor, target, rawDamage);
  pushLog(state, `${actor.name} greift ${target.name} an: ${damage} Schaden.`);
  checkDeath(state, target);
  endTurn(state, actor);
  return { ok: true };
}

function resolveSkill(
  state: BattleState,
  actor: Combatant,
  skillId: string,
  targetId: string | undefined
): ActionResult {
  const skill = getSkill(skillId);
  if (!skill || !actor.skillIds.includes(skill.id)) {
    return { ok: false, reason: 'Fähigkeit nicht verfügbar.' };
  }
  if (!canUseSkill(actor, skill)) {
    return { ok: false, reason: 'Nicht genug MP.' };
  }

  const targets = targetsForSkill(state, actor, skill, targetId);
  if (targets.length === 0) {
    return { ok: false, reason: 'Ungültiges Ziel.' };
  }

  actor.mp -= skill.costMp;

  if (isStatusOnlySkill(skill)) {
    for (const target of targets) {
      applySkillStatus(state, target, skill);
    }
    endTurn(state, actor);
    return { ok: true };
  }

  if (isHealingSkill(skill)) {
    for (const target of targets) {
      const amount = Math.max(1, Math.round(skill.power + effectiveStat(actor, 'magic') * 1.1));
      target.hp = Math.min(target.maxHp, target.hp + amount);
      pushLog(state, `${actor.name} heilt ${target.name} um ${amount} LP.`);
      applySkillStatus(state, target, skill);
    }
    endTurn(state, actor);
    return { ok: true };
  }

  for (const target of targets) {
    const usesPhysicalScaling = skill.tags.includes('physical') && !skill.tags.includes('magical');
    const offense = usesPhysicalScaling ? effectiveStat(actor, 'attack') : effectiveStat(actor, 'magic');
    const mitigation = usesPhysicalScaling ? effectiveStat(target, 'defense') : effectiveStat(target, 'spirit');
    const rawDamage = (skill.power + offense * 1.35 - mitigation * 0.55)
      * elementMultiplier(skill.element, target)
      * variance(state.rng);
    const damage = applyDamage(state, actor, target, rawDamage);
    const weaknessText = target.weaknesses.includes(skill.element) ? ' (Schwäche!)' : '';
    pushLog(state, `${actor.name} nutzt ${skill.name}: ${damage} Schaden${weaknessText}.`);
    applyBreakPressure(state, target, skill.element, skill.tags.includes('debuff') ? 1 : 0);
    applySkillStatus(state, target, skill);
    checkDeath(state, target);
  }

  endTurn(state, actor);
  return { ok: true };
}

function resolveItem(
  state: BattleState,
  actor: Combatant,
  itemId: string,
  targetId: string | undefined
): ActionResult {
  const item = itemById.get(itemId);
  if (!item || item.category !== 'consumable' || !item.effect) {
    return { ok: false, reason: 'Item nicht im Kampf nutzbar.' };
  }
  if (getItemCount(state.inventory, itemId) <= 0) {
    return { ok: false, reason: 'Item nicht vorhanden.' };
  }

  const target = getCombatant(state, targetId) ?? actor;
  if (target.side !== actor.side) {
    return { ok: false, reason: 'Ungültiges Ziel.' };
  }

  const amount = item.effect.amount ?? 0;
  switch (item.effect.kind) {
    case 'heal-hp':
      if (target.dead) {
        return { ok: false, reason: 'Ziel ist kampfunfähig.' };
      }
      target.hp = Math.min(target.maxHp, target.hp + amount);
      pushLog(state, `${actor.name} nutzt ${item.name}: ${target.name} erhält ${amount} LP.`);
      break;

    case 'restore-mp':
      if (target.dead) {
        return { ok: false, reason: 'Ziel ist kampfunfähig.' };
      }
      target.mp = Math.min(target.maxMp, target.mp + amount);
      pushLog(state, `${actor.name} nutzt ${item.name}: ${target.name} erhält ${amount} MP.`);
      break;

    case 'revive':
      if (!target.dead) {
        return { ok: false, reason: 'Ziel ist nicht kampfunfähig.' };
      }
      target.dead = false;
      target.hp = Math.max(1, Math.min(target.maxHp, amount));
      pushLog(state, `${actor.name} belebt ${target.name} wieder.`);
      break;

    case 'grant-skill':
      return { ok: false, reason: 'Skill-Items sind im Kampf noch nicht nutzbar.' };
  }

  consumeItem(state, itemId);
  endTurn(state, actor);
  return { ok: true };
}

function resolveTeamAttack(
  state: BattleState,
  actor: Combatant,
  partnerId: string,
  targetId: string
): ActionResult {
  if (state.teamMeter < TEAM_ATTACK_COST) {
    return { ok: false, reason: 'Team-Leiste ist nicht voll.' };
  }
  const partner = getCombatant(state, partnerId);
  const target = getCombatant(state, targetId);
  if (!partner || partner.dead || partner.side !== actor.side || partner.id === actor.id) {
    return { ok: false, reason: 'Ungültiger Synergiepartner.' };
  }
  if (!target || target.dead || target.side === actor.side) {
    return { ok: false, reason: 'Ungültiges Ziel.' };
  }
  if (!hasSynergyLink(actor, partner)) {
    return { ok: false, reason: 'Keine aktive Beziehung für einen Team-Angriff.' };
  }

  state.teamMeter = Math.max(0, state.teamMeter - TEAM_ATTACK_COST);
  const rawDamage = (
    effectiveStat(actor, 'attack')
    + effectiveStat(actor, 'magic')
    + effectiveStat(partner, 'attack')
    + effectiveStat(partner, 'magic')
    - effectiveStat(target, 'defense') * 0.65
  ) * 1.35 * variance(state.rng);
  const damage = applyDamage(state, actor, target, rawDamage, false);
  applyBreakPressure(state, target, 'neutral', 2);
  pushLog(state, `${actor.name} und ${partner.name} entfesseln Teamdruck: ${damage} Schaden.`);
  checkDeath(state, target);
  endTurn(state, actor);
  return { ok: true };
}

function canUseSkill(actor: Combatant, skill: SkillDefinition): boolean {
  return actor.mp >= skill.costMp;
}

function isHealingSkill(skill: SkillDefinition): boolean {
  return skill.tags.includes('heal');
}

function isStatusOnlySkill(skill: SkillDefinition): boolean {
  return skill.power <= 0 && !!skill.statusEffect && (skill.tags.includes('buff') || skill.tags.includes('debuff'));
}

function targetsForSkill(
  state: BattleState,
  actor: Combatant,
  skill: SkillDefinition,
  targetId: string | undefined
): Combatant[] {
  switch (skill.target) {
    case 'self':
      return [actor].filter((target) => !target.dead);

    case 'single-ally': {
      const target = getCombatant(state, targetId) ?? actor;
      return target.side === actor.side && !target.dead ? [target] : [];
    }

    case 'single-enemy': {
      const target = getCombatant(state, targetId);
      return target && target.side !== actor.side && !target.dead ? [target] : [];
    }

    case 'all-enemies':
      return livingCombatants(state, actor.side === 'party' ? 'enemy' : 'party');
  }
}

function applySkillStatus(state: BattleState, target: Combatant, skill: SkillDefinition): void {
  if (!skill.statusEffect || target.dead) {
    return;
  }
  if (state.rng() > skill.statusEffect.chance) {
    return;
  }

  applyStatus(target, skill.statusEffect.id, skill.statusEffect.turns);
  pushLog(state, `${target.name}: ${statusLabel(skill.statusEffect.id)}.`);
}

function advanceToNextActor(state: BattleState): void {
  let guard = 0;
  state.activeId = null;

  while (guard++ < MAX_ADVANCE_STEPS) {
    if (checkEnd(state)) {
      return;
    }

    const ready = livingCombatants(state)
      .filter((combatant) => combatant.ct >= CT_THRESHOLD)
      .sort((a, b) => b.ct - a.ct || sideTieBreaker(a.side, b.side));

    if (ready.length > 0) {
      const actor = ready[0]!;
      startTurn(state, actor);
      if (checkEnd(state)) {
        return;
      }
      if (actor.dead) {
        continue;
      }
      updateEnemyPhase(state, actor);
      state.activeId = actor.id;
      return;
    }

    for (const combatant of livingCombatants(state)) {
      combatant.ct += effectiveStat(combatant, 'agility');
    }
    state.round += 1;
  }

  resolveByTurnCap(state);
}

function startTurn(state: BattleState, actor: Combatant): void {
  actor.guarding = false;
  updateEnemyPhase(state, actor);

  const poison = actor.statuses.find((status) => status.id === 'poison');
  if (poison) {
    const damage = Math.max(1, Math.round(actor.maxHp * POISON_DAMAGE_FRACTION));
    actor.hp = Math.max(0, actor.hp - damage);
    pushLog(state, `${actor.name} erleidet ${damage} Giftschaden.`);
    checkDeath(state, actor);
  }

  for (const status of actor.statuses) {
    status.turns -= 1;
  }
  removeExpiredStatuses(actor);
}

function endTurn(state: BattleState, actor: Combatant): void {
  actor.ct = Math.max(0, actor.ct - CT_THRESHOLD);
  state.turns += 1;

  if (state.turns >= MAX_TURNS) {
    resolveByTurnCap(state);
    return;
  }

  if (!checkEnd(state)) {
    advanceToNextActor(state);
  }
}

function checkEnd(state: BattleState): boolean {
  if (state.status !== 'active') {
    return true;
  }
  if (livingCombatants(state, 'enemy').length === 0) {
    state.status = 'won';
    state.activeId = null;
    pushLog(state, 'Sieg!');
    return true;
  }
  if (livingCombatants(state, 'party').length === 0) {
    state.status = 'lost';
    state.activeId = null;
    pushLog(state, 'Niederlage …');
    return true;
  }
  return false;
}

function resolveByTurnCap(state: BattleState): void {
  const partyFraction = hpFraction(livingCombatants(state, 'party'));
  const enemyFraction = hpFraction(livingCombatants(state, 'enemy'));
  state.status = partyFraction >= enemyFraction ? 'won' : 'lost';
  state.activeId = null;
  pushLog(state, `Der Kampf endet nach ${MAX_TURNS} Zügen.`);
}

function checkDeath(state: BattleState, target: Combatant): void {
  if (target.hp > 0 || target.dead) {
    return;
  }

  target.dead = true;
  target.hp = 0;
  target.guarding = false;
  target.ct = 0;
  target.statuses.splice(0, target.statuses.length);
  pushLog(state, `${target.name} fällt.`);

  if (target.side === 'enemy') {
    awardEnemyRewards(state, target);
  }
}

function awardEnemyRewards(state: BattleState, enemy: Combatant): void {
  state.rewards.experience += enemy.experienceReward;
  state.rewards.gold += enemy.goldReward;

  for (const drop of enemy.drops) {
    if (state.rng() <= drop.chance) {
      state.rewards.items = normalizeInventoryStacks([
        ...state.rewards.items,
        { itemId: drop.itemId, quantity: 1 }
      ]);
      pushLog(state, `${enemy.name} lässt ${drop.itemId} fallen.`);
    }
  }
}

function applyDamage(
  state: BattleState,
  attacker: Combatant,
  target: Combatant,
  rawDamage: number,
  allowReaction = true
): number {
  let adjustedDamage = rawDamage
    * state.damageMultipliers[attacker.side]
    * damageTakenMultiplier(target);
  const reaction = allowReaction ? target.reaction : null;
  target.reaction = null;

  if (reaction && target.side === 'party') {
    if (reaction.timing === 'perfect') {
      adjustedDamage *= reaction.kind === 'counter' ? 0.45 : 0.25;
      state.teamMeter = clamp(state.teamMeter + 10, 0, TEAM_METER_MAX);
      pushLog(state, `${target.name} trifft das perfekte Reaktionsfenster.`);
    } else if (reaction.timing === 'success') {
      adjustedDamage *= reaction.kind === 'counter' ? 0.65 : 0.5;
      pushLog(state, `${target.name} blockt im Timing.`);
    } else {
      pushLog(state, `${target.name} verpasst das Reaktionsfenster.`);
    }
  }

  const guardedDamage = target.guarding ? adjustedDamage * 0.5 : adjustedDamage;
  const damage = Math.max(1, Math.round(guardedDamage));
  target.hp = Math.max(0, target.hp - damage);

  if (reaction?.kind === 'counter' && reaction.timing !== 'miss' && !attacker.dead) {
    const counterDamage = Math.max(
      1,
      Math.round(
        (effectiveStat(target, 'attack') * 1.15 - effectiveStat(attacker, 'defense') * 0.45)
        * state.damageMultipliers[target.side]
      )
    );
    attacker.hp = Math.max(0, attacker.hp - counterDamage);
    pushLog(state, `${target.name} kontert ${attacker.name}: ${counterDamage} Schaden.`);
    checkDeath(state, attacker);
  }

  return damage;
}

function applyBreakPressure(
  state: BattleState,
  target: Combatant,
  element: ElementType,
  bonusPressure = 0
): void {
  if (target.dead || target.side !== 'enemy') {
    return;
  }
  const weaknessPressure = target.weaknesses.includes(element) ? 2 : 0;
  const pressure = weaknessPressure + bonusPressure;
  if (pressure <= 0) {
    return;
  }

  target.breakGauge = Math.max(0, target.breakGauge - pressure);
  if (target.breakGauge > 0) {
    pushLog(state, `${target.name}s Break-Leiste sinkt auf ${target.breakGauge}/${target.breakGaugeMax}.`);
    return;
  }

  target.breakGauge = target.breakGaugeMax;
  applyStatus(target, 'guard-break', 2);
  target.ct = 0;
  state.teamMeter = clamp(state.teamMeter + TEAM_METER_BREAK_GAIN, 0, TEAM_METER_MAX);
  pushLog(state, `${target.name} ist gebrochen! Team-Leiste ${state.teamMeter}/${TEAM_METER_MAX}.`);
}

function updateEnemyPhase(state: BattleState, combatant: Combatant): void {
  if (combatant.side !== 'enemy' || combatant.dead || combatant.phaseIndex >= 1) {
    return;
  }
  if (combatant.hp / combatant.maxHp <= combatant.phaseThreshold) {
    combatant.phaseIndex = 1;
    combatant.ct = Math.max(combatant.ct, CT_THRESHOLD);
    pushLog(state, `${combatant.name} wechselt in Phase 2.`);
  }
}

function scoreEnemySkillTarget(actor: Combatant, skill: SkillDefinition, target: Combatant): number {
  const vulnerability = elementMultiplier(skill.element, target);
  const woundedPriority = actor.phaseIndex >= 1 ? 1 - (target.hp / target.maxHp) : target.hp / target.maxHp;
  const breakPriority = target.breakGauge <= 1 ? 0.4 : 0;
  return vulnerability + woundedPriority + breakPriority;
}

function effectiveStat(combatant: Combatant, stat: keyof StatBlock): number {
  let value = combatant[stat];
  for (const status of combatant.statuses) {
    if (status.id === 'attack-up' && stat === 'attack') value *= 1.25;
    else if (status.id === 'defense-up' && stat === 'defense') value *= 1.25;
    else if (status.id === 'magic-up' && stat === 'magic') value *= 1.25;
    else if (status.id === 'spirit-down' && stat === 'spirit') value *= 0.75;
    else if (status.id === 'haste' && stat === 'agility') value *= 1.3;
    else if (status.id === 'guard-break' && (stat === 'defense' || stat === 'spirit')) value *= 0.65;
  }
  return Math.max(1, Math.round(value));
}

function damageTakenMultiplier(target: Combatant): number {
  return target.statuses.some((status) => status.id === 'guard-break') ? 1.25 : 1;
}

function applyStatus(target: Combatant, statusId: StatusEffectId, turns: number): void {
  const existing = target.statuses.find((status) => status.id === statusId);
  if (existing) {
    existing.turns = Math.max(existing.turns, turns);
    return;
  }
  target.statuses.push({ id: statusId, turns });
}

function statusLabel(statusId: StatusEffectId): string {
  switch (statusId) {
    case 'poison':
      return 'vergiftet';
    case 'attack-up':
      return 'Angriff erhöht';
    case 'defense-up':
      return 'Verteidigung erhöht';
    case 'magic-up':
      return 'Magie erhöht';
    case 'spirit-down':
      return 'Geist gesenkt';
    case 'haste':
      return 'Tempo erhöht';
    case 'guard-break':
      return 'gebrochen';
  }
}

function hasSynergyLink(a: Combatant, b: Combatant): boolean {
  return a.synergyPartnerIds.includes(b.sourceId) || b.synergyPartnerIds.includes(a.sourceId);
}

function consumeItem(state: BattleState, itemId: string): void {
  state.inventory = normalizeInventoryStacks(
    state.inventory.map((stack) =>
      stack.itemId === itemId ? { ...stack, quantity: stack.quantity - 1 } : stack
    )
  );
}

function getCombatant(state: BattleState, id: string | null | undefined): Combatant | undefined {
  return id ? state.combatants.find((combatant) => combatant.id === id) : undefined;
}

function getSkill(id: string): SkillDefinition | undefined {
  return skillById.get(id);
}

function livingCombatants(state: BattleState, side?: Side): Combatant[] {
  return state.combatants.filter((combatant) => !combatant.dead && (!side || combatant.side === side));
}

function elementMultiplier(element: ElementType, target: Combatant): number {
  if (target.weaknesses.includes(element)) {
    return 1.75;
  }
  if (target.resistances.includes(element) || target.element === element) {
    return 0.5;
  }
  return 1;
}

function variance(rng: Rng): number {
  return 0.9 + rng() * 0.2;
}

function sideTieBreaker(a: Side, b: Side): number {
  if (a === b) {
    return 0;
  }
  return a === 'party' ? -1 : 1;
}

function hpFraction(combatants: readonly Combatant[]): number {
  const maxHp = combatants.reduce((sum, combatant) => sum + combatant.maxHp, 0);
  if (maxHp <= 0) {
    return 0;
  }
  return combatants.reduce((sum, combatant) => sum + Math.max(0, combatant.hp), 0) / maxHp;
}

function removeExpiredStatuses(combatant: Combatant): void {
  for (let index = combatant.statuses.length - 1; index >= 0; index -= 1) {
    if (combatant.statuses[index]!.turns <= 0) {
      combatant.statuses.splice(index, 1);
    }
  }
}

function pushLog(state: BattleState, message: string): void {
  state.log = [message, ...state.log].slice(0, 10);
}

function average(values: readonly number[]): number {
  return values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.trunc(value)));
}

function normalizeDamageMultipliers(
  multipliers: Partial<BattleDamageMultipliers> | undefined
): BattleDamageMultipliers {
  return {
    party: positiveFinite(multipliers?.party, 1),
    enemy: positiveFinite(multipliers?.enemy, 1)
  };
}

function positiveFinite(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : fallback;
}

function uniqueStrings<T extends string>(values: readonly T[]): T[] {
  return [...new Set(values)];
}

export type { BattleView, CombatantView } from './battleView';
export { renderView } from './battleView';
