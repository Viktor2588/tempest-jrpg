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

export interface BattleUnitInput {
  readonly sourceId: string;
  readonly name: string;
  readonly side: Side;
  readonly level: number;
  readonly stats: StatBlock;
  readonly currentHp?: number;
  readonly currentMp?: number;
  readonly element: ElementType;
  readonly weaknesses: readonly ElementType[];
  readonly resistances: readonly ElementType[];
  readonly skillIds: readonly string[];
  readonly experienceReward?: number;
  readonly goldReward?: number;
  readonly drops?: readonly EnemyDrop[];
}

export interface Combatant {
  readonly id: string;
  readonly sourceId: string;
  readonly name: string;
  readonly side: Side;
  readonly level: number;
  hp: number;
  readonly maxHp: number;
  mp: number;
  readonly maxMp: number;
  readonly attack: number;
  readonly defense: number;
  readonly magic: number;
  readonly spirit: number;
  readonly agility: number;
  readonly element: ElementType;
  readonly weaknesses: readonly ElementType[];
  readonly resistances: readonly ElementType[];
  readonly skillIds: readonly string[];
  readonly statuses: StatusInstance[];
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

export interface BattleState {
  combatants: Combatant[];
  inventory: InventoryStack[];
  status: BattleStatus;
  activeId: string | null;
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
  | { type: 'guard' }
  | { type: 'flee' };

export interface StartBattleOptions {
  readonly party?: readonly BattleUnitInput[];
  readonly enemyIds?: readonly string[];
  readonly enemies?: readonly BattleUnitInput[];
  readonly inventory?: readonly InventoryStack[];
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
  overrides: Partial<Pick<BattleUnitInput, 'currentHp' | 'currentMp' | 'level' | 'skillIds'>> = {}
): BattleUnitInput {
  const level = overrides.level ?? hero.initialLevel;
  const stats = scaleStats(hero.baseStats, hero.growthPerLevel, level);

  return {
    sourceId: hero.id,
    name: hero.name,
    side: 'party',
    level,
    stats,
    currentHp: overrides.currentHp,
    currentMp: overrides.currentMp,
    element: 'neutral',
    weaknesses: [],
    resistances: [],
    skillIds: overrides.skillIds ?? hero.initialSkillIds
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

export function enemyTurn(state: BattleState): ActionResult {
  const actor = currentActor(state);
  if (state.status !== 'active' || !actor || actor.side !== 'enemy') {
    return { ok: false, reason: 'Kein Gegnerzug.' };
  }

  const foes = livingCombatants(state, 'party');
  if (foes.length === 0) {
    checkEnd(state);
    return { ok: true };
  }

  const usableSkills = actor.skillIds
    .map(getSkill)
    .filter((skill): skill is SkillDefinition => !!skill && canUseSkill(actor, skill))
    .filter((skill) => !isHealingSkill(skill));

  if (usableSkills.length > 0 && state.rng() < 0.65) {
    const scored = usableSkills
      .flatMap((skill) => aiTargetsForSkill(state, actor, skill).map((target) => ({
        skill,
        target,
        score: elementMultiplier(skill.element, target) + (target.hp / target.maxHp)
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

  const target = foes[Math.floor(state.rng() * foes.length)]!;
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
  return {
    id,
    sourceId: unit.sourceId,
    name: unit.name,
    side: unit.side,
    level: unit.level,
    hp: clamp(unit.currentHp ?? unit.stats.maxHp, 0, unit.stats.maxHp),
    maxHp: unit.stats.maxHp,
    mp: clamp(unit.currentMp ?? unit.stats.maxMp, 0, unit.stats.maxMp),
    maxMp: unit.stats.maxMp,
    attack: unit.stats.attack,
    defense: unit.stats.defense,
    magic: unit.stats.magic,
    spirit: unit.stats.spirit,
    agility: Math.max(1, unit.stats.agility),
    element: unit.element,
    weaknesses: unit.weaknesses,
    resistances: unit.resistances,
    skillIds: [...unit.skillIds],
    statuses: [],
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

  const rawDamage = (actor.attack * 1.8 - target.defense * 0.8) * variance(state.rng);
  const damage = applyDamage(target, rawDamage);
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

  if (isHealingSkill(skill)) {
    for (const target of targets) {
      const amount = Math.max(1, Math.round(skill.power + actor.magic * 1.1));
      target.hp = Math.min(target.maxHp, target.hp + amount);
      pushLog(state, `${actor.name} heilt ${target.name} um ${amount} LP.`);
    }
    endTurn(state, actor);
    return { ok: true };
  }

  for (const target of targets) {
    const usesPhysicalScaling = skill.tags.includes('physical') && !skill.tags.includes('magical');
    const offense = usesPhysicalScaling ? actor.attack : actor.magic;
    const mitigation = usesPhysicalScaling ? target.defense : target.spirit;
    const rawDamage = (skill.power + offense * 1.35 - mitigation * 0.55)
      * elementMultiplier(skill.element, target)
      * variance(state.rng);
    const damage = applyDamage(target, rawDamage);
    const weaknessText = target.weaknesses.includes(skill.element) ? ' (Schwäche!)' : '';
    pushLog(state, `${actor.name} nutzt ${skill.name}: ${damage} Schaden${weaknessText}.`);
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

function canUseSkill(actor: Combatant, skill: SkillDefinition): boolean {
  return actor.mp >= skill.costMp;
}

function isHealingSkill(skill: SkillDefinition): boolean {
  return skill.tags.includes('heal');
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
  if (!skill.statusEffect || target.dead || target.statuses.some((status) => status.id === skill.statusEffect?.id)) {
    return;
  }
  if (state.rng() > skill.statusEffect.chance) {
    return;
  }

  target.statuses.push({ id: skill.statusEffect.id, turns: skill.statusEffect.turns });
  pushLog(state, `${target.name} wird vergiftet.`);
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
      state.activeId = actor.id;
      return;
    }

    for (const combatant of livingCombatants(state)) {
      combatant.ct += combatant.agility;
    }
    state.round += 1;
  }

  resolveByTurnCap(state);
}

function startTurn(state: BattleState, actor: Combatant): void {
  actor.guarding = false;

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

function applyDamage(target: Combatant, rawDamage: number): number {
  const guardedDamage = target.guarding ? rawDamage * 0.5 : rawDamage;
  const damage = Math.max(1, Math.round(guardedDamage));
  target.hp = Math.max(0, target.hp - damage);
  return damage;
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

export interface CombatantView {
  readonly id: string;
  readonly sourceId: string;
  readonly name: string;
  readonly side: Side;
  readonly level: number;
  readonly hp: number;
  readonly maxHp: number;
  readonly mp: number;
  readonly maxMp: number;
  readonly element: ElementType;
  readonly skillIds: readonly string[];
  readonly statuses: readonly StatusEffectId[];
  readonly dead: boolean;
  readonly guarding: boolean;
  readonly active: boolean;
}

export interface BattleView {
  readonly status: BattleStatus;
  readonly party: readonly CombatantView[];
  readonly enemies: readonly CombatantView[];
  readonly activeId: string | null;
  readonly log: readonly string[];
  readonly rewards: BattleRewards;
  readonly inventory: readonly InventoryStack[];
  readonly turn: number;
  readonly round: number;
}

export function renderView(state: BattleState): BattleView {
  return {
    status: state.status,
    party: state.combatants
      .filter((combatant) => combatant.side === 'party')
      .map((combatant) => renderCombatant(combatant, state.activeId)),
    enemies: state.combatants
      .filter((combatant) => combatant.side === 'enemy')
      .map((combatant) => renderCombatant(combatant, state.activeId)),
    activeId: state.activeId,
    log: [...state.log],
    rewards: {
      experience: state.rewards.experience,
      gold: state.rewards.gold,
      items: [...state.rewards.items]
    },
    inventory: [...state.inventory],
    turn: state.turns,
    round: state.round
  };
}

function renderCombatant(combatant: Combatant, activeId: string | null): CombatantView {
  return {
    id: combatant.id,
    sourceId: combatant.sourceId,
    name: combatant.name,
    side: combatant.side,
    level: combatant.level,
    hp: combatant.hp,
    maxHp: combatant.maxHp,
    mp: combatant.mp,
    maxMp: combatant.maxMp,
    element: combatant.element,
    skillIds: [...combatant.skillIds],
    statuses: combatant.statuses.map((status) => status.id),
    dead: combatant.dead,
    guarding: combatant.guarding,
    active: combatant.id === activeId
  };
}
