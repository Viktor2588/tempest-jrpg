// Rundenkampf-Engine — rein, deterministisch, ohne Phaser/DOM.
// Phase 3 nutzt bewusst die Phase-2-Datenmodelle statt eigener Demo-Daten:
// Charaktere, Gegner, Skills, Items und Inventar bleiben datengetrieben.
import {
  ENEMIES,
  HEROES,
  ITEMS,
  SIGNATURES,
  SKILLS,
  type CharacterDefinition,
  type ElementFusionDefinition,
  type ElementType,
  type EnemyDefinition,
  type EnemyDrop,
  type ItemDefinition,
  type SignatureDefinition,
  type SignatureEffectScope,
  type SkillDefinition,
  type StatBlock,
  type StatusEffectId
} from '../data';
import { getItemCount, normalizeInventoryStacks, type InventoryStack } from './inventory';
import type { FormationRow, PartyMemberState } from './party';
import { makeRng, type Rng } from './rng';
import {
  analysisBonusLevels,
  buffBonusTurns,
  counterProc,
  damageDealtMultiplier,
  damageTakenMultiplierFromPerks,
  devourChanceBonus,
  dodgeChance,
  maxHpMultiplier,
  skillChainFor,
  type DamageCategory,
  type TalentPerk
} from './talentPerk';
import { scaleStats } from './stats';
import { resolveElementFusion } from './fusion';

export type Side = 'party' | 'enemy';
export type BattleStatus = 'active' | 'won' | 'lost' | 'fled';

export interface StatusInstance {
  readonly id: StatusEffectId;
  turns: number;
}

// Phase 94 — Elementarfeld: der elementare Zustand des Schlachtfelds. Ein Feld
// verstärkt gleichelementige Treffer, öffnet Fusions-Reaktionen und klingt pro
// Runde ab. Nur ein Feld gleichzeitig (einfachste tragfähige Lösung).
export interface BattleField {
  readonly element: ElementType;
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
  readonly formationRow?: FormationRow;
  readonly level: number;
  readonly stats: StatBlock;
  readonly currentHp?: number;
  readonly currentMp?: number;
  readonly element: ElementType;
  readonly weaknesses: readonly ElementType[];
  readonly resistances: readonly ElementType[];
  readonly skillIds: readonly string[];
  readonly boss?: boolean;
  readonly phase2SkillIds?: readonly string[];
  readonly escalationPercentPerTurn?: number;
  readonly armoredUntilBreak?: boolean;
  readonly reflectsElement?: ElementType;
  readonly punishesHealing?: boolean;
  readonly healsAllies?: boolean;
  readonly enrageOnAllyDeath?: boolean;
  readonly resistsCategory?: DamageCategory;
  readonly reflectsCategory?: DamageCategory;
  readonly devourable?: boolean;
  readonly devourSkillId?: string;
  readonly synergyPartnerIds?: readonly string[];
  readonly openingStatusIds?: readonly StatusEffectId[];
  readonly experienceReward?: number;
  readonly goldReward?: number;
  readonly drops?: readonly EnemyDrop[];
  // Phase 69 — Talent-Perks aus freigeschalteten Spec-Knoten (Phase 70 speist sie ein).
  readonly perks?: readonly TalentPerk[];
}

export interface Combatant {
  readonly id: string;
  readonly sourceId: string;
  readonly name: string;
  readonly formName: string | null;
  readonly side: Side;
  readonly formationRow: FormationRow;
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
  readonly boss: boolean;
  readonly phase2SkillIds: readonly string[];
  // Phase 80 — Anti-Aussitzen: Schaden-Zuschlag je eigener Aktion (0 = keine Eskalation).
  readonly escalationPercentPerTurn: number;
  // Zählt die eigenen Aktionen dieses Gegners (konsistenter Takt, unabhängig von
  // Partygröße/Tempo) — je länger er lebt und zuschlägt, desto tödlicher.
  escalationStacks: number;
  escalationAnnounced: boolean;
  // Phase 82 — Archetyp-Merkmale (0/false = kein Archetyp).
  readonly armoredUntilBreak: boolean;
  readonly reflectsElement: ElementType | null;
  readonly punishesHealing: boolean;
  // Phase 87 — Normalgegner-Archetypen.
  readonly healsAllies: boolean;
  readonly enrageOnAllyDeath: boolean;
  enraged: boolean;
  // Phase 88 — build-relevante Encounter: abgewehrte Schadenskategorie (null = keine).
  readonly resistsCategory: DamageCategory | null;
  // Phase 88b — reflektierte Schadenskategorie (null = keine).
  readonly reflectsCategory: DamageCategory | null;
  // Phase 41 — Verschlinger: in diesem Kampf per Mimik angeeignete Skills (Phase 42 bankt sie dauerhaft).
  mimicSkillIds: string[];
  // Phase 105 — Mimikry als aktive Kampf-Form: nimmt für einige Züge das Element einer
  // in diesem Kampf verschlungenen Gegner-Art an (On-Demand-Wechsel des Angriffs-Elements).
  // null/0 = eigene Grundform.
  mimicElement: ElementType | null;
  mimicTurns: number;
  readonly devourable: boolean;
  readonly devourSkillId: string | null;
  readonly synergyPartnerIds: readonly string[];
  readonly signatureId: string | null;
  signatureCharge: number;
  readonly signatureChargeMax: number;
  resonanceElement: ElementType | null;
  readonly statuses: StatusInstance[];
  reaction: QueuedReaction | null;
  breakGauge: number;
  readonly breakGaugeMax: number;
  phaseIndex: number;
  readonly phaseThreshold: number;
  // Phase 40 — Großer Weiser: Analysestufe (0 = unbekannt) deckt Schwächen + Telegraph auf.
  analysisLevel: number;
  telegraphSkillId: string | null;
  ct: number;
  guarding: boolean;
  dead: boolean;
  readonly perks: readonly TalentPerk[];
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
  // Phase 92 — Bewohner: Quell-IDs der in diesem Kampf verschlungenen Gegner-Arten
  // (für die Rekrutierung nach dem Sieg). Nur erfolgreiche Verschlinger-Finisher.
  devouredSourceIds: string[];
  // Phase 94 — Elementarfeld: der aktive Feld-Zustand (null = neutrales Feld).
  field: BattleField | null;
}

export type BattleAction =
  | { type: 'attack'; targetId: string }
  | { type: 'skill'; skillId: string; targetId?: string }
  | { type: 'item'; itemId: string; targetId?: string }
  | { type: 'team-attack'; partnerId: string; targetId: string }
  | { type: 'analyze'; targetId: string }
  | { type: 'devour'; targetId: string }
  // Phase 105 — Mimikry: nimmt on-demand das Element einer verschlungenen Gegner-Art an.
  | { type: 'mimic'; element: ElementType }
  | { type: 'signature'; targetId?: string }
  | { type: 'guard' }
  // Phase 85 — optionales Reaktions-Timing: die UI liefert das im Timing-Fenster
  // erspielte Ergebnis. Fehlt es (Auto/Sim/Alt-Save), gilt der garantierte Block.
  | { type: 'brace'; timing?: ReactionTiming }
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
export const SIGNATURE_CHARGE_MAX = 100;

const POISON_DAMAGE_FRACTION = 0.06;
const MAX_ADVANCE_STEPS = 100_000;
export const BATTLE_BALANCE = {
  analysisMax: 2,
  breakGaugeMax: 4,
  devourBaseChance: 0.1,
  devourBrokenBonus: 0.45,
  devourDebuffBonus: 0.2,
  devourHpThreshold: 0.35,
  devourLowHpBonus: 0.3,
  devourMaxRoll: 0.95,
  devourWhiffFloor: 0.05,
  bossDevourDamageFraction: 0.05,
  bossPhaseCtSurge: 110,
  teamMeterBreakGain: 35,
  teamMeterMax: 100
} as const;
const BREAK_GAUGE_MAX = BATTLE_BALANCE.breakGaugeMax;
const TEAM_METER_MAX = BATTLE_BALANCE.teamMeterMax;
const TEAM_METER_BREAK_GAIN = BATTLE_BALANCE.teamMeterBreakGain;
const TEAM_ATTACK_COST = 100;
const ANALYSIS_MAX = BATTLE_BALANCE.analysisMax;
const CT_MAX = CT_THRESHOLD * 3;
// Aussetz-Status, die einen Zug hart überspringen (Schlaf/Eis enden zusätzlich bei Schaden).
const HARD_SKIP_STATUSES = ['stun', 'sleep', 'freeze', 'petrify'] as const satisfies readonly StatusEffectId[];
const WAKE_ON_DAMAGE_STATUSES: readonly StatusEffectId[] = ['sleep', 'freeze', 'charm'];
// Phase 41 — Verschlinger + Momentum
const MOMENTUM_CT_SURGE = 35;
// Phase 80 — Anti-Aussitzen: Gnadenfrist (Runden ohne Eskalation) + Deckel des
// Zuschlags. Der Deckel verhindert One-Shots, zwingt aber lange Kämpfe zum Ende.
// Gnadenfrist in eigenen Aktionen: effizient beendete Kämpfe (Boss handelt nur
// wenige Male) bleiben unberührt; erst ein in die Länge gezogenes Aussitzen
// überschreitet die Frist und wird zunehmend tödlich.
const ESCALATION_GRACE_TURNS = 5;
const ESCALATION_MAX_BONUS = 2;
// Phase 81 — ungedeckter Big-Hit: Schadensschwung, damit das Lesen/Kontern des
// Telegraphs eine echte Entscheidung wird (gedeckt via Block/Konter/Verteidigen).
const HEAVY_UNBRACED_BONUS = 1.6;
// Phase 82 — Archetypen: gepanzert-bis-Break senkt Schaden, solange nicht gebrochen;
// Element-Reflektor wirft einen Bruchteil zurück.
const ARMOR_UNBROKEN_MULTIPLIER = 0.65;
const ELEMENT_REFLECT_FRACTION = 0.5;
// Phase 87 — Rudel-Raserei hält praktisch den ganzen Kampf (attack-up, einmalig).
const ENRAGE_TURNS = 99;
// Phase 87 — Mender-Heilabsicht: skaliert mit den fehlenden LP des Verbündeten. Hoch genug,
// dass ein stark verwundeter Verbündeter über einen Angriff gewählt wird, aber ~0 bei vollen
// LP (dann greift der Mender an, statt sinnlos zu heilen).
const MENDER_HEAL_INTENT = 4.2;
// Phase 88 — build-relevante Encounter: eine abgewehrte Schadenskategorie trifft nur
// gemindert (soft-check, kein harter Wall) → der Spieler soll auf den passenden
// Damage-Typ umschalten, nicht komplett ausgesperrt werden.
const CATEGORY_RESIST_MULTIPLIER = 0.55;
// Phase 88b — Kategorie-Reflektor: Anteil des zurückgeworfenen Kategorie-Schadens (breiter
// als ein Element-Reflektor, daher milder pro Treffer).
const CATEGORY_REFLECT_FRACTION = 0.3;
// Phase 94 — Elementarfeld: Dauer (Runden) eines frisch geladenen Feldes, Schadensbonus
// für gleichelementige Treffer und der Zusatzdruck einer Fusions-Reaktion. Bewusst klein
// gehalten (Board-Control, kein Alles-Overkill).
const FIELD_DURATION_ROUNDS = 3;
const FIELD_MATCH_AMPLIFY = 1.25;
const FIELD_REACTION_BREAK_PRESSURE = 2;
// Phase 105 — Mimikry: wie viele eigene Züge eine angenommene Form hält, bevor Rimuru in
// seine Grundform zurückfällt.
const MIMIC_FORM_TURNS = 3;
// Unique-Verben (Analysieren/Verschlingen) sind keine direkt wirkbaren Fähigkeiten.
const UNIQUE_VERB_SKILL_IDS = new Set<string>(['predator', 'great-sage']);
const RIMURU_BATTLE_LOADOUT_LIMIT = 8;
const RIMURU_CORE_LOADOUT_SKILLS = [
  'predator',
  'great-sage',
  'slime-strike',
  'water-jet',
  'predator-aura',
  // Phase 108 — verschmolzene Skills bleiben im Loadout sichtbar.
  'hydro-lash',
  'maelstrom-fang'
] as const;
const DEBUFF_STATUSES: readonly StatusEffectId[] = [
  'poison', 'spirit-down', 'guard-break', 'stun', 'sleep', 'freeze',
  'paralyze', 'petrify', 'blind', 'silence', 'confuse', 'charm', 'weaken'
];

const skillById = new Map<string, SkillDefinition>(SKILLS.map((skill) => [skill.id, skill]));
const itemById = new Map<string, ItemDefinition>(ITEMS.map((item) => [item.id, item]));
const heroById = new Map<string, CharacterDefinition>(HEROES.map((hero) => [hero.id, hero]));
const enemyById = new Map<string, EnemyDefinition>(ENEMIES.map((enemy) => [enemy.id, enemy]));
const signatureByCharacterId = new Map<string, SignatureDefinition>(
  SIGNATURES.map((signature) => [signature.characterId, signature])
);

export function createDefaultBattleParty(): BattleUnitInput[] {
  return HEROES.filter((hero) => hero.startsInParty).map((hero) => createHeroBattleUnit(hero));
}

export function createBattlePartyFromMembers(
  members: readonly PartyMemberState[],
  perksByCharacterId: Readonly<Record<string, readonly TalentPerk[]>> = {}
): BattleUnitInput[] {
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
        formationRow: member.formationRow ?? 'front',
        skillIds: battleLoadoutSkillIds(member),
        perks: perksByCharacterId[member.characterId]
      })
    ];
  });
}

export function battleLoadoutSkillIds(member: PartyMemberState): string[] {
  const known = uniqueStrings(member.learnedSkillIds);
  if (member.characterId !== 'rimuru' || known.length <= RIMURU_BATTLE_LOADOUT_LIMIT) {
    return known;
  }

  const core = RIMURU_CORE_LOADOUT_SKILLS.filter((skillId) => known.includes(skillId));
  const coreSet = new Set<string>(core);
  const optional = known.filter((skillId) => !coreSet.has(skillId));
  const optionalSlots = Math.max(0, RIMURU_BATTLE_LOADOUT_LIMIT - core.length);
  return [...core, ...(optionalSlots > 0 ? optional.slice(-optionalSlots) : [])];
}

export function createHeroBattleUnit(
  hero: CharacterDefinition,
  overrides: Partial<Pick<
    BattleUnitInput,
    'currentHp'
    | 'formationRow'
    | 'currentMp'
    | 'formName'
    | 'level'
    | 'name'
    | 'openingStatusIds'
    | 'perks'
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
    formationRow: overrides.formationRow,
    level,
    stats,
    currentHp: overrides.currentHp,
    currentMp: overrides.currentMp,
    element: 'neutral',
    weaknesses: [],
    resistances: [],
    skillIds: overrides.skillIds ?? hero.initialSkillIds,
    synergyPartnerIds: overrides.synergyPartnerIds,
    openingStatusIds: overrides.openingStatusIds,
    perks: overrides.perks
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
    formationRow: 'front',
    level: enemy.level,
    stats: enemy.stats,
    element: enemy.element,
    weaknesses: enemy.weaknesses,
    resistances: enemy.resistances,
    skillIds: enemy.skillIds,
    boss: enemy.boss,
    phase2SkillIds: enemy.phase2SkillIds,
    escalationPercentPerTurn: enemy.escalationPercentPerTurn,
    armoredUntilBreak: enemy.armoredUntilBreak,
    reflectsElement: enemy.reflectsElement,
    punishesHealing: enemy.punishesHealing,
    healsAllies: enemy.healsAllies,
    enrageOnAllyDeath: enemy.enrageOnAllyDeath,
    resistsCategory: enemy.resistsCategory,
    reflectsCategory: enemy.reflectsCategory,
    devourable: enemy.devourable,
    devourSkillId: enemy.devourSkillId,
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
    ...party.map((unit, index) => createCombatant({
      ...unit,
      formationRow: unit.formationRow ?? 'front'
    }, `p${index}-${unit.sourceId}`)),
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
    rewards: { experience: 0, gold: 0, items: [] },
    devouredSourceIds: [],
    field: null
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

  if (actor.escalationPercentPerTurn > 0) {
    actor.escalationStacks += 1;
    if (!actor.escalationAnnounced && actor.escalationStacks > ESCALATION_GRACE_TURNS) {
      actor.escalationAnnounced = true;
      pushLog(state, `${actor.name} wird rasend — sein Schaden steigt mit jeder Runde.`);
    }
  }

  const foes = livingCombatants(state, 'party');
  if (foes.length === 0) {
    checkEnd(state);
    return { ok: true };
  }

  const usableSkills = isSilenced(actor)
    ? []
    : actor.skillIds
      .map(getSkill)
      .filter((skill): skill is SkillDefinition => !!skill && canUseSkill(actor, skill))
      // Phase 87 — Mender dürfen ihre Heil-Skills behalten; alle anderen Gegner heilen nie.
      .filter((skill) => actor.healsAllies || !isHealingSkill(skill));

  if (actor.analysisLevel > 0) {
    actor.telegraphSkillId = predictTelegraph(state, actor);
  }
  const telegraphedSkill = actor.telegraphSkillId
    ? usableSkills.find((skill) => skill.id === actor.telegraphSkillId)
    : undefined;
  if (telegraphedSkill) {
    const plan = chooseEnemySkillPlan(state, actor, [telegraphedSkill]);
    if (plan) {
      return resolveEnemyAction(state, actor, {
        type: 'skill',
        skillId: plan.skill.id,
        targetId: plan.target.id
      });
    }
  }

  const skillChance = actor.phaseIndex >= 1 ? 0.9 : 0.65;
  if (usableSkills.length > 0 && state.rng() < skillChance) {
    const choice = chooseEnemySkillPlan(state, actor, usableSkills);
    if (choice) {
      return resolveEnemyAction(state, actor, {
        type: 'skill',
        skillId: choice.skill.id,
        targetId: choice.target.id
      });
    }
  }

  const target = chooseEnemyAttackTarget(state, actor, foes);
  return resolveEnemyAction(state, actor, { type: 'attack', targetId: target.id });
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

interface EnemySkillPlan {
  readonly skill: SkillDefinition;
  readonly target: Combatant;
  readonly score: number;
}

function chooseEnemySkillPlan(
  state: BattleState,
  actor: Combatant,
  skills: readonly SkillDefinition[]
): EnemySkillPlan | null {
  let best: EnemySkillPlan | null = null;

  for (const skill of skills) {
    const targets = aiTargetsForSkill(state, actor, skill);
    if (targets.length === 0) {
      continue;
    }

    if (skill.target === 'all-enemies') {
      const score = targets.reduce((sum, target) => sum + scoreEnemySkillTarget(state, actor, skill, target), 0);
      best = keepBestEnemyPlan(best, { skill, target: targets[0]!, score });
      continue;
    }

    for (const target of targets) {
      best = keepBestEnemyPlan(best, {
        skill,
        target,
        score: scoreEnemySkillTarget(state, actor, skill, target)
      });
    }
  }

  return best;
}

function keepBestEnemyPlan(current: EnemySkillPlan | null, candidate: EnemySkillPlan): EnemySkillPlan {
  if (!current || candidate.score > current.score) {
    return candidate;
  }
  return current;
}

function chooseEnemyAttackTarget(
  state: BattleState,
  actor: Combatant,
  foes: readonly Combatant[]
): Combatant {
  const vulnerable = foes
    .filter((foe) => hasStatus(foe, 'guard-break') || foe.statuses.some((status) => status.id === 'spirit-down' || status.id === 'weaken'))
    .sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp))[0];
  if (vulnerable) {
    return vulnerable;
  }
  if (actor.phaseIndex >= 1) {
    return foes.slice().sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp))[0]!;
  }
  const frontLine = foes.filter((foe) => foe.formationRow === 'front');
  const pool = frontLine.length > 0 ? frontLine : foes;
  return pool[Math.floor(state.rng() * pool.length)]!;
}

function resolveEnemyAction(state: BattleState, actor: Combatant, action: BattleAction): ActionResult {
  const result = resolveAction(state, actor, action);
  refreshEnemyTelegraph(state, actor);
  return result;
}

function createCombatant(unit: BattleUnitInput, id: string): Combatant {
  const stats = unit.stats;
  const perks = unit.perks ?? [];
  // +HP%-Perks erhöhen die maximale LP zur Build-Zeit.
  const maxHp = Math.max(1, Math.round(stats.maxHp * maxHpMultiplier(perks)));
  const baseSkillIds = [...unit.skillIds];
  const breakGaugeMax = unit.side === 'enemy' ? BREAK_GAUGE_MAX : Math.max(3, BREAK_GAUGE_MAX - 1);
  const signature = unit.side === 'party' ? signatureByCharacterId.get(unit.sourceId) : undefined;

  return {
    id,
    sourceId: unit.sourceId,
    name: unit.name,
    formName: unit.formName ?? null,
    side: unit.side,
    formationRow: unit.formationRow ?? (unit.side === 'party' ? 'back' : 'front'),
    level: unit.level,
    baseStats: unit.stats,
    baseSkillIds,
    hp: clamp(unit.currentHp ?? maxHp, 0, maxHp),
    maxHp,
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
    boss: unit.boss ?? false,
    phase2SkillIds: uniqueStrings(unit.phase2SkillIds ?? []),
    escalationPercentPerTurn: Math.max(0, unit.escalationPercentPerTurn ?? 0),
    escalationStacks: 0,
    escalationAnnounced: false,
    armoredUntilBreak: unit.armoredUntilBreak ?? false,
    reflectsElement: unit.reflectsElement ?? null,
    punishesHealing: unit.punishesHealing ?? false,
    healsAllies: unit.healsAllies ?? false,
    enrageOnAllyDeath: unit.enrageOnAllyDeath ?? false,
    enraged: false,
    resistsCategory: unit.resistsCategory ?? null,
    reflectsCategory: unit.reflectsCategory ?? null,
    mimicSkillIds: [],
    mimicElement: null,
    mimicTurns: 0,
    devourable: unit.devourable ?? false,
    devourSkillId: unit.devourSkillId ?? null,
    synergyPartnerIds: [...(unit.synergyPartnerIds ?? [])],
    signatureId: signature?.id ?? null,
    signatureCharge: 0,
    signatureChargeMax: SIGNATURE_CHARGE_MAX,
    resonanceElement: null,
    statuses: uniqueStrings(unit.openingStatusIds ?? []).map((statusId) => ({
      id: statusId,
      turns: 3
    })),
    reaction: null,
    breakGauge: breakGaugeMax,
    breakGaugeMax,
    phaseIndex: 0,
    phaseThreshold: 0.5,
    analysisLevel: 0,
    telegraphSkillId: null,
    ct: 0,
    guarding: false,
    dead: false,
    perks,
    experienceReward: unit.experienceReward ?? 0,
    goldReward: unit.goldReward ?? 0,
    drops: unit.drops ?? []
  };
}

// Phase 81 — Deckung: der handelnde Kämpfer gibt seinen Zug auf, um die ganze Party
// gegen den telegraphierten (Big-)Hit zu decken — ein rechtzeitiger Block halbiert den
// nächsten Treffer je Verbündeten. Die bewusste Antwort auf einen angekündigten
// Großangriff: Tempo gegen Sicherheit.
// Phase 85 — das Timing wird jetzt im HUD-Fenster erspielt: `perfect` (0.25×) belohnt
// exaktes Lesen, `miss` lässt den Treffer voll durch. Ohne UI-Timing (Auto/Sim) bleibt
// der garantierte `success`-Block (0.5×) erhalten — Balance-Sims unverändert.
function resolveBrace(
  state: BattleState,
  actor: Combatant,
  timing: ReactionTiming = 'success'
): ActionResult {
  for (const ally of livingCombatants(state, 'party')) {
    ally.reaction = { kind: 'timing-block', timing };
  }
  const outcome =
    timing === 'perfect'
      ? 'im perfekten Fenster'
      : timing === 'miss'
        ? '— zu spät!'
        : 'rechtzeitig';
  pushLog(state, `${actor.name} ruft die Party in Deckung ${outcome}.`);
  endTurn(state, actor);
  return { ok: true };
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

    case 'brace':
      return resolveBrace(state, actor, action.timing);

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

    case 'analyze':
      return resolveAnalyze(state, actor, action.targetId);

    case 'devour':
      return resolveDevour(state, actor, action.targetId);

    case 'mimic':
      return resolveMimicForm(state, actor, action.element);

    case 'signature':
      return resolveSignature(state, actor, action.targetId);
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

  // Phase 105 — eine angenommene Mimik-Form kanalisiert ihr Element in den Grundangriff:
  // erst dann wirkt die Element-Schwäche/-Resistenz auf den sonst elementneutralen Schlag.
  const elementFactor = actor.mimicElement ? elementMultiplier(actor.mimicElement, target) : 1;
  const rawDamage = (effectiveStat(actor, 'attack') * 1.8 - effectiveStat(target, 'defense') * 0.8)
    * elementFactor
    * variance(state.rng);
  const damage = applyDamage(state, actor, target, rawDamage, true, { category: 'physical', element: attackElement(actor) });
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
  if (UNIQUE_VERB_SKILL_IDS.has(skill.id)) {
    return { ok: false, reason: 'Unique-Skill über eigenes Kampfverb nutzen.' };
  }
  if (isSilenced(actor)) {
    return { ok: false, reason: 'Verstummt — keine Fähigkeiten möglich.' };
  }
  if (!canUseSkill(actor, skill)) {
    return { ok: false, reason: 'Nicht genug MP.' };
  }

  const targets = targetsForSkill(state, actor, skill, targetId);
  if (targets.length === 0) {
    return { ok: false, reason: 'Ungültiges Ziel.' };
  }

  actor.mp -= skill.costMp;
  if (skill.element !== 'neutral') {
    actor.resonanceElement = skill.element;
  }
  // Phase 94 — Board-Control: die Fähigkeit lädt (bei chargesField) das Feld auf.
  chargeField(state, actor, skill);

  if (isHealingSkill(skill)) {
    for (const target of targets) {
      const amount = Math.max(1, Math.round(skill.power + effectiveStat(actor, 'magic') * 0.6));
      target.hp = Math.min(target.maxHp, target.hp + amount);
      pushLog(state, `${actor.name} heilt ${target.name} um ${amount} LP.`);
      applySkillStatus(state, actor, target, skill);
      applyCtDelta(target, skill.ctDelta);
    }
    punishHealingIfNeeded(state, actor);
    endTurn(state, actor);
    return { ok: true };
  }

  // Unterstützungs-/Status-/Zeitkontroll-Fähigkeiten ohne Schaden: Buffs, reine Debuffs, delay/hasten.
  if (skill.power <= 0) {
    for (const target of targets) {
      applySkillStatus(state, actor, target, skill);
      applyCtDelta(target, skill.ctDelta);
    }
    endTurn(state, actor);
    return { ok: true };
  }

  // Phase 94 — Feld-Zustand bei Cast-Beginn: bestimmt Verstärkung + Reaktion für ALLE
  // Ziele dieses Skills (die Reaktion breitet sich über die Ziele aus und verbraucht das
  // Feld danach einmalig).
  const castField = state.field;
  const fieldAmplify = fieldMatchMultiplier(castField, skill.element);
  const reaction = fieldReaction(castField, skill.element);

  let momentumGranted = false;
  for (const target of targets) {
    const usesPhysicalScaling = skill.tags.includes('physical') && !skill.tags.includes('magical');
    const offense = usesPhysicalScaling ? effectiveStat(actor, 'attack') : effectiveStat(actor, 'magic');
    const mitigation = usesPhysicalScaling ? effectiveStat(target, 'defense') : effectiveStat(target, 'spirit');
    const rawDamage = (skill.power + offense * 1.35 - mitigation * 0.55)
      * elementMultiplier(skill.element, target)
      * fieldAmplify
      * variance(state.rng);
    const damage = applyDamage(state, actor, target, rawDamage, true, {
      category: usesPhysicalScaling ? 'physical' : 'magical',
      element: skill.element,
      heavy: skill.heavy
    });
    const weaknessText = target.weaknesses.includes(skill.element) ? ' (Schwäche!)' : '';
    pushLog(state, `${actor.name} nutzt ${skill.name}: ${damage} Schaden${weaknessText}.`);
    applyBreakPressure(state, target, skill.element, skill.tags.includes('debuff') ? 1 : 0);
    if (reaction && !target.dead) {
      triggerFieldReaction(state, target, reaction);
    }
    if (!momentumGranted && damage > 0 && target.weaknesses.includes(skill.element)) {
      grantMomentum(state, actor, 'Schwächentreffer');
      momentumGranted = true;
    }
    applySkillStatus(state, actor, target, skill);
    applyCtDelta(target, skill.ctDelta);
    checkDeath(state, target);
  }
  // Die Fusions-Reaktion verbraucht das Feld (Board-Control wird eingelöst).
  if (reaction && state.field === castField) {
    state.field = null;
  }

  // Perk skill-chain: nach diesem Skill mit Chance einen Folge-Skill ohne Zugkosten.
  const chain = skillChainFor(actor.perks, skill.id);
  if (chain && state.rng() < chain.chance) {
    resolveChainSkill(state, actor, chain.followUpSkillId, targets);
  }

  endTurn(state, actor);
  return { ok: true };
}

// Perk-Kettenskill: ein Folge-Skill wird ohne MP-/Zugkosten und ohne weitere
// Ketten als reiner Zusatztreffer aufgelöst (verhindert Endlos-Rekursion).
function resolveChainSkill(
  state: BattleState,
  actor: Combatant,
  followUpSkillId: string,
  triggerTargets: readonly Combatant[]
): void {
  const skill = getSkill(followUpSkillId);
  if (!skill || skill.power <= 0) {
    return;
  }
  const living = triggerTargets.filter((target) => !target.dead && target.side !== actor.side);
  const targets = living.length > 0
    ? living
    : livingCombatants(state).filter((combatant) => combatant.side !== actor.side).slice(0, 1);
  if (targets.length === 0) {
    return;
  }
  pushLog(state, `${actor.name} löst Kettenskill ${skill.name} aus.`);
  for (const target of targets) {
    const usesPhysicalScaling = skill.tags.includes('physical') && !skill.tags.includes('magical');
    const offense = usesPhysicalScaling ? effectiveStat(actor, 'attack') : effectiveStat(actor, 'magic');
    const mitigation = usesPhysicalScaling ? effectiveStat(target, 'defense') : effectiveStat(target, 'spirit');
    const rawDamage = (skill.power + offense * 1.35 - mitigation * 0.55)
      * elementMultiplier(skill.element, target)
      * variance(state.rng);
    const damage = applyDamage(state, actor, target, rawDamage, true, {
      category: usesPhysicalScaling ? 'physical' : 'magical',
      element: skill.element,
      heavy: skill.heavy
    });
    pushLog(state, `${skill.name} trifft ${target.name}: ${damage} Schaden.`);
    applyBreakPressure(state, target, skill.element, 0);
    checkDeath(state, target);
  }
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

  const fusion = resolveElementFusion(actor.resonanceElement, partner.resonanceElement);
  state.teamMeter = Math.max(0, state.teamMeter - TEAM_ATTACK_COST);
  const rawDamage = (
    effectiveStat(actor, 'attack')
    + effectiveStat(actor, 'magic')
    + effectiveStat(partner, 'attack')
    + effectiveStat(partner, 'magic')
    - effectiveStat(target, 'defense') * 0.65
  )
    * (fusion?.powerMultiplier ?? 1.35)
    * (fusion ? elementMultiplier(fusion.damageElement, target) : 1)
    * variance(state.rng);
  const damage = applyDamage(state, actor, target, rawDamage, false, { element: fusion?.damageElement });
  applyBreakPressure(
    state,
    target,
    fusion?.damageElement ?? 'neutral',
    fusion?.breakPressure ?? 2
  );
  if (fusion?.statusEffect && target.hp > 0) {
    applyStatus(target, fusion.statusEffect.id, fusion.statusEffect.turns);
    pushLog(state, `${target.name}: ${statusLabel(fusion.statusEffect.id)}.`);
  }
  pushLog(
    state,
    fusion
      ? `${actor.name} und ${partner.name} fusionieren ${fusion.name}: ${damage} Schaden.`
      : `${actor.name} und ${partner.name} entfesseln Teamdruck: ${damage} Schaden.`
  );
  if (fusion) {
    actor.resonanceElement = null;
    partner.resonanceElement = null;
  }
  checkDeath(state, target);
  endTurn(state, actor);
  return { ok: true };
}

// Phase 40 — Großer Weiser: deckt Schwächen auf, erhöht die Analysestufe und liest den
// nächsten Zug des Gegners (Telegraph). Höhere Stufen verstärken später den Break-Druck.
function resolveAnalyze(state: BattleState, actor: Combatant, targetId: string): ActionResult {
  if (!actor.skillIds.includes('great-sage')) {
    return { ok: false, reason: 'Großer Weiser nicht verfügbar.' };
  }

  const target = getCombatant(state, targetId);
  if (!target || target.dead || target.side === actor.side) {
    return { ok: false, reason: 'Ungültiges Ziel.' };
  }

  target.analysisLevel = Math.min(
    ANALYSIS_MAX,
    target.analysisLevel + 1 + analysisBonusLevels(actor.perks)
  );
  target.telegraphSkillId = predictTelegraph(state, target);
  const weaknessText = target.weaknesses.length > 0 ? target.weaknesses.join(', ') : 'keine bekannten';
  pushLog(state, `Großer Weiser analysiert ${target.name} (Stufe ${target.analysisLevel}): Schwächen ${weaknessText}.`);
  endTurn(state, actor);
  return { ok: true };
}

function resolveDevour(state: BattleState, actor: Combatant, targetId: string): ActionResult {
  if (!actor.skillIds.includes('predator')) {
    return { ok: false, reason: 'Verschlinger nicht verfügbar.' };
  }

  const target = getCombatant(state, targetId);
  if (!target || target.dead || target.side === actor.side) {
    return { ok: false, reason: 'Ungültiges Ziel.' };
  }

  if (!target.devourable || !target.devourSkillId) {
    return { ok: false, reason: 'Ziel kann nicht verschlungen werden.' };
  }

  if (target.boss && !isBossDevourFinisherWindow(target)) {
    return resolveBossDevourPressure(state, actor, target);
  }

  const successChance = calculateDevourSuccessChance(target, devourChanceBonus(actor.perks));
  if (successChance === 0) {
    return { ok: false, reason: 'Ziel ist noch nicht verwundbar genug.' };
  }

  const chanceCeiling = BATTLE_BALANCE.devourWhiffFloor + (successChance ?? 0);
  const roll = state.rng();
  if (roll < BATTLE_BALANCE.devourWhiffFloor || roll > chanceCeiling) {
    if (target.boss) {
      return resolveBossDevourPressure(state, actor, target);
    }
    pushLog(state, `${actor.name} setzt Verschlinger an, aber ${target.name} widersteht.`);
    endTurn(state, actor);
    return { ok: true };
  }

  const learnedSkill = chooseDevourSkill(actor, target);
  target.hp = 0;
  // Phase 92 — den verschlungenen Gegner für die Bewohner-Rekrutierung merken.
  state.devouredSourceIds = uniqueStrings([...state.devouredSourceIds, target.sourceId]);
  checkDeath(state, target);
  if (learnedSkill) {
    actor.mimicSkillIds = uniqueStrings([...actor.mimicSkillIds, learnedSkill.id]);
    actor.skillIds = uniqueStrings([...actor.skillIds, learnedSkill.id]);
    pushLog(state, `${actor.name} verschlingt ${target.name} und imitiert ${learnedSkill.name}.`);
  } else {
    pushLog(state, `${actor.name} verschlingt ${target.name}.`);
  }
  grantMomentum(state, actor, 'Verschlingen');
  endTurn(state, actor);
  return { ok: true };
}

export function calculateDevourSuccessChance(
  target: Pick<
    Combatant,
    'analysisLevel' | 'boss' | 'devourable' | 'devourSkillId' | 'hp' | 'maxHp'
    | 'phaseIndex' | 'statuses'
  >,
  perkBonus = 0
): number | null {
  if (!target.devourable || !target.devourSkillId) {
    return null;
  }

  const broken = target.statuses.some((status) => status.id === 'guard-break');
  if (target.boss && !isBossDevourFinisherWindow(target)) {
    return 0;
  }
  const lowHp = target.hp / target.maxHp <= BATTLE_BALANCE.devourHpThreshold;
  const debuffed = target.statuses.some((status) =>
    status.id !== 'guard-break' && DEBUFF_STATUSES.includes(status.id)
  );
  if (!broken && !lowHp && !debuffed) {
    return 0;
  }

  const chanceCeiling = Math.min(
    BATTLE_BALANCE.devourMaxRoll,
    Math.max(
      BATTLE_BALANCE.devourBaseChance,
      BATTLE_BALANCE.devourBaseChance
      + (broken ? BATTLE_BALANCE.devourBrokenBonus : 0)
      + (lowHp ? BATTLE_BALANCE.devourLowHpBonus : 0)
      + (debuffed ? BATTLE_BALANCE.devourDebuffBonus : 0)
      + Math.min(0.3, target.analysisLevel * 0.1)
      + Math.max(0, perkBonus)
    )
  );
  return chanceCeiling - BATTLE_BALANCE.devourWhiffFloor;
}

function isBossDevourFinisherWindow(
  target: Pick<Combatant, 'boss' | 'phaseIndex' | 'statuses'>
): boolean {
  return !target.boss || (
    target.phaseIndex >= 1
    && target.statuses.some((status) => status.id === 'guard-break')
  );
}

function resolveBossDevourPressure(
  state: BattleState,
  actor: Combatant,
  target: Combatant
): ActionResult {
  const pressure = Math.max(1, Math.round(target.maxHp * BATTLE_BALANCE.bossDevourDamageFraction));
  const damage = Math.min(pressure, Math.max(0, target.hp - 1));
  target.hp -= damage;
  if (damage > 0) {
    wakeOnDamage(target);
    updateEnemyPhase(state, target);
  }
  pushLog(
    state,
    `${actor.name}s Verschlinger setzt ${target.name} unter Druck: ${damage} Schaden, aber kein Finisher.`
  );
  endTurn(state, actor);
  return { ok: true };
}

// Phase 105 — die Elemente der in diesem Kampf verschlungenen Gegner-Arten, die Rimuru als
// Form annehmen kann (nicht-neutral, dedupliziert).
export function availableMimicElements(state: BattleState): ElementType[] {
  const elements: ElementType[] = [];
  for (const sourceId of state.devouredSourceIds) {
    const element = enemyById.get(sourceId)?.element;
    if (element && element !== 'neutral' && !elements.includes(element)) {
      elements.push(element);
    }
  }
  return elements;
}

// Das wirksame Angriffs-Element eines Kämpfers: die angenommene Mimik-Form überschreibt die
// Grundform (nur offensiv — Grundangriff/Resonanz).
function attackElement(combatant: Combatant): ElementType {
  return combatant.mimicElement ?? combatant.element;
}

// Phase 105 — Mimikry als aktive Kampf-Form: Rimuru nimmt on-demand das Element einer
// verschlungenen Gegner-Art an. Gegated über den Verschlinger + eine tatsächlich in diesem
// Kampf verschlungene Form (wiederverwendet devouredSourceIds).
function resolveMimicForm(state: BattleState, actor: Combatant, element: ElementType): ActionResult {
  if (!actor.skillIds.includes('predator')) {
    return { ok: false, reason: 'Mimikry braucht den Verschlinger.' };
  }
  if (!availableMimicElements(state).includes(element)) {
    return { ok: false, reason: 'Diese Form wurde noch nicht verschlungen.' };
  }
  if (attackElement(actor) === element) {
    return { ok: false, reason: 'Diese Form ist bereits aktiv.' };
  }

  actor.mimicElement = element;
  actor.mimicTurns = MIMIC_FORM_TURNS;
  actor.resonanceElement = element;
  pushLog(state, `${actor.name} nimmt die ${FIELD_ELEMENT_LABEL[element]}-Form an.`);
  endTurn(state, actor);
  return { ok: true };
}

function tickMimicForm(state: BattleState, actor: Combatant): void {
  if (actor.mimicTurns <= 0) {
    return;
  }
  actor.mimicTurns -= 1;
  if (actor.mimicTurns <= 0) {
    actor.mimicElement = null;
    pushLog(state, `${actor.name} kehrt in die Grundform zurück.`);
  }
}

function resolveSignature(
  state: BattleState,
  actor: Combatant,
  targetId: string | undefined
): ActionResult {
  const signature = signatureByCharacterId.get(actor.sourceId);
  if (!signature || actor.signatureId !== signature.id) {
    return { ok: false, reason: 'Keine Signaturaktion verfügbar.' };
  }
  if (actor.signatureCharge < actor.signatureChargeMax) {
    return { ok: false, reason: 'Signaturleiste ist noch nicht voll.' };
  }

  const targets = signatureTargets(state, actor, signature, targetId);
  if (targets.length === 0) {
    return { ok: false, reason: 'Ungültiges Ziel.' };
  }

  actor.signatureCharge = 0;
  if (signature.element !== 'neutral') {
    actor.resonanceElement = signature.element;
  }
  pushLog(state, `${actor.name} entfesselt ${signature.name}!`);
  for (const effect of signature.effects) {
    const effectTargets = signatureEffectTargets(state, actor, targets, effect.scope);
    switch (effect.kind) {
      case 'damage':
        for (const target of effectTargets) {
          if (target.dead || target.side === actor.side) continue;
          const offense = effect.scaling === 'attack'
            ? effectiveStat(actor, 'attack')
            : effect.scaling === 'magic'
              ? effectiveStat(actor, 'magic')
              : (effectiveStat(actor, 'attack') + effectiveStat(actor, 'magic')) / 2;
          const mitigation = effect.scaling === 'attack'
            ? effectiveStat(target, 'defense')
            : effect.scaling === 'magic'
              ? effectiveStat(target, 'spirit')
              : (effectiveStat(target, 'defense') + effectiveStat(target, 'spirit')) / 2;
          const rawDamage = (effect.power + offense * 1.45 - mitigation * 0.55)
            * elementMultiplier(effect.element, target)
            * variance(state.rng);
          const damage = applyDamage(state, actor, target, rawDamage, true, {
            category: effect.scaling === 'attack' ? 'physical' : effect.scaling === 'magic' ? 'magical' : undefined,
            element: effect.element
          });
          pushLog(state, `${signature.name} trifft ${target.name}: ${damage} Schaden.`);
          checkDeath(state, target);
        }
        break;

      case 'heal':
        for (const target of effectTargets) {
          if (target.dead || target.side !== actor.side) continue;
          const amount = Math.max(1, Math.round(target.maxHp * effect.maxHpFraction));
          target.hp = Math.min(target.maxHp, target.hp + amount);
          pushLog(state, `${signature.name} heilt ${target.name} um ${amount} LP.`);
        }
        break;

      case 'status':
        for (const target of effectTargets) {
          if (target.dead) continue;
          applyStatus(target, effect.statusId, effect.turns);
          pushLog(state, `${target.name}: ${statusLabel(effect.statusId)}.`);
        }
        break;

      case 'ct':
        for (const target of effectTargets) {
          applyCtDelta(target, effect.delta);
        }
        break;

      case 'break':
        for (const target of effectTargets) {
          applyBreakPressure(state, target, 'neutral', effect.pressure);
        }
        break;

      case 'analyze':
        for (const target of effectTargets) {
          if (target.dead || target.side === actor.side) continue;
          target.analysisLevel = Math.min(ANALYSIS_MAX, target.analysisLevel + effect.levels);
          target.telegraphSkillId = predictTelegraph(state, target);
          pushLog(state, `${target.name} ist vollständig analysiert.`);
        }
        break;

      case 'reaction':
        for (const target of effectTargets) {
          if (target.dead || target.side !== actor.side) continue;
          target.reaction = { kind: effect.reaction, timing: effect.timing };
        }
        break;

      case 'team-meter':
        state.teamMeter = clamp(state.teamMeter + effect.amount, 0, TEAM_METER_MAX);
        break;
    }
  }

  endTurn(state, actor, false);
  return { ok: true };
}

function signatureTargets(
  state: BattleState,
  actor: Combatant,
  signature: SignatureDefinition,
  targetId: string | undefined
): Combatant[] {
  switch (signature.target) {
    case 'self':
      return [actor];
    case 'all-allies':
      return livingCombatants(state, actor.side);
    case 'all-enemies':
      return livingCombatants(state, actor.side === 'party' ? 'enemy' : 'party');
    case 'single-ally': {
      const target = getCombatant(state, targetId);
      return target && !target.dead && target.side === actor.side ? [target] : [];
    }
    case 'single-enemy': {
      const target = getCombatant(state, targetId);
      return target && !target.dead && target.side !== actor.side ? [target] : [];
    }
  }
}

function signatureEffectTargets(
  state: BattleState,
  actor: Combatant,
  actionTargets: Combatant[],
  scope: SignatureEffectScope | undefined
): Combatant[] {
  switch (scope ?? 'targets') {
    case 'targets':
      return actionTargets;
    case 'self':
      return [actor];
    case 'allies':
      return livingCombatants(state, actor.side);
    case 'enemies':
      return livingCombatants(state, actor.side === 'party' ? 'enemy' : 'party');
  }
}

function chooseDevourSkill(actor: Combatant, target: Combatant): SkillDefinition | null {
  const definedSkill = target.devourSkillId ? getSkill(target.devourSkillId) : null;
  if (definedSkill && !UNIQUE_VERB_SKILL_IDS.has(definedSkill.id) && !actor.skillIds.includes(definedSkill.id)) {
    return definedSkill;
  }
  return null;
}

// Telegraph: die wahrscheinlich nächste Gegneraktion nach derselben deterministischen
// Skillwertung wie die Gegner-KI. Analysierte Gegner halten diesen Skill im nächsten
// Zug ein, solange Status/MP ihn nicht verhindern.
function predictTelegraph(state: BattleState, enemy: Combatant): string | null {
  if (enemy.side !== 'enemy' || enemy.dead || isSilenced(enemy)) {
    return null;
  }

  const skills = enemy.skillIds
    .map(getSkill)
    .filter((skill): skill is SkillDefinition => !!skill && canUseSkill(enemy, skill) && !isHealingSkill(skill))
    .filter((skill) => aiTargetsForSkill(state, enemy, skill).length > 0);
  return chooseEnemySkillPlan(state, enemy, skills)?.skill.id ?? null;
}

function refreshEnemyTelegraph(state: BattleState, enemy: Combatant): void {
  if (enemy.dead || state.status !== 'active') {
    enemy.telegraphSkillId = null;
    return;
  }
  const predicted = predictTelegraph(state, enemy);
  // Analyse deckt jeden Telegraph auf; Big-Hits werden IMMER angekündigt (auch ohne
  // Analyse), damit der grosse Treffer fair gelesen und gekontert werden kann.
  const predictedHeavy = predicted ? getSkill(predicted)?.heavy === true : false;
  enemy.telegraphSkillId = enemy.analysisLevel > 0 || predictedHeavy ? predicted : null;
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

function applySkillStatus(state: BattleState, actor: Combatant, target: Combatant, skill: SkillDefinition): void {
  if (!skill.statusEffect || target.dead) {
    return;
  }
  if (state.rng() > skill.statusEffect.chance) {
    return;
  }

  // Perk buff-power: von dieser Figur gewirkte Buffs auf Verbündete halten länger.
  const bonusTurns = target.side === actor.side ? buffBonusTurns(actor.perks) : 0;
  applyStatus(target, skill.statusEffect.id, skill.statusEffect.turns + bonusTurns);
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
      const disabled = startTurn(state, actor);
      if (checkEnd(state)) {
        return;
      }
      if (actor.dead) {
        continue;
      }
      if (disabled) {
        // Aussetzen verbraucht den Zug, ohne dass der Kämpfer handelt.
        actor.ct = Math.max(0, actor.ct - CT_THRESHOLD);
        state.turns += 1;
        if (state.turns >= MAX_TURNS) {
          resolveByTurnCap(state);
          return;
        }
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
    // Phase 94 — das Elementarfeld klingt pro Runde ab.
    tickField(state);
  }

  resolveByTurnCap(state);
}

// Liefert true, wenn der Kämpfer diesen Zug wegen eines Aussetz-Status verliert.
function startTurn(state: BattleState, actor: Combatant): boolean {
  actor.guarding = false;
  updateEnemyPhase(state, actor);

  // Aussetz-Status VOR dem Abklingen prüfen, damit z. B. eine 1-Zug-Betäubung genau einmal greift.
  const disabledBy = computeDisabled(state, actor);

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
  // Phase 105 — die angenommene Mimik-Form klingt über die eigenen Züge ab.
  tickMimicForm(state, actor);

  if (disabledBy && !actor.dead) {
    pushLog(state, `${actor.name} ist ${statusLabel(disabledBy)} und setzt aus.`);
    return true;
  }
  return false;
}

function endTurn(state: BattleState, actor: Combatant, gainSignatureCharge = true): void {
  if (gainSignatureCharge && actor.side === 'party' && !actor.dead) {
    const signature = signatureByCharacterId.get(actor.sourceId);
    if (signature) {
      actor.signatureCharge = clamp(
        actor.signatureCharge + signature.chargePerAction,
        0,
        actor.signatureChargeMax
      );
    }
  }
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

  triggerEnrageOnAllyDeath(state, target);
}

// Phase 87 — Rudel-Raserei: fällt ein Verbündeter, geraten noch lebende Rudeltiere
// (enrageOnAllyDeath) einmalig in Raserei (attack-up, +25 % Angriff). Einen Einzelnen zu
// zerlegen macht den Rest gefährlich → der Spieler muss die Kill-Reihenfolge bedenken.
function triggerEnrageOnAllyDeath(state: BattleState, fallen: Combatant): void {
  for (const ally of livingCombatants(state, fallen.side)) {
    if (ally === fallen || !ally.enrageOnAllyDeath || ally.enraged) {
      continue;
    }
    ally.enraged = true;
    applyStatus(ally, 'attack-up', ENRAGE_TURNS);
    pushLog(state, `${ally.name} gerät in Raserei!`);
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

// Phase 80 — Anti-Aussitzen: zeitabhängiger Schadenszuschlag eines eskalierenden
// Gegners. Wächst pro Runde nach der Gnadenfrist, gedeckelt. 0 für alle nicht
// eskalierenden Kämpfer (Party, Trash) → universell multiplizierbar.
// Phase 82 — gepanzert bis Break: solange der Gegner nicht gebrochen (guard-break)
// ist, nimmt er stark reduzierten Schaden → der Spieler muss erst die Break-Leiste
// aufreißen (Schwächentreffer) statt stumpf zu chippen.
// Phase 82 — Heiler-Bestrafer: sobald die Party heilt, schlägt ein solcher Gegner
// gegen den Heiler zurück → reines Aussitzen/Sustain wird teuer.
function punishHealingIfNeeded(state: BattleState, healer: Combatant): void {
  if (healer.side !== 'party' || healer.dead) {
    return;
  }
  const punisher = livingCombatants(state, 'enemy').find((foe) => foe.punishesHealing);
  if (!punisher) {
    return;
  }
  const raw = (effectiveStat(punisher, 'attack') * 0.7 + effectiveStat(punisher, 'magic') * 0.4) * variance(state.rng);
  const dealt = applyDamage(state, punisher, healer, raw, false, { category: 'magical', element: punisher.element });
  pushLog(state, `${punisher.name} bestraft die Heilung — ${dealt} Schaden an ${healer.name}.`);
  checkDeath(state, healer);
}

function armorMultiplier(target: Combatant): number {
  if (target.side !== 'enemy' || !target.armoredUntilBreak) {
    return 1;
  }
  const broken = target.statuses.some((status) => status.id === 'guard-break');
  return broken ? 1 : ARMOR_UNBROKEN_MULTIPLIER;
}

// Phase 88 — build-relevante Encounter: ein Gegner kann eine ganze Schadenskategorie
// (physisch ODER magisch) teils abwehren → der falsche Damage-Typ trifft nur gemindert.
function categoryResistMultiplier(target: Combatant, category: DamageCategory | undefined): number {
  return category && target.resistsCategory === category ? CATEGORY_RESIST_MULTIPLIER : 1;
}

export function escalationBonus(attacker: Combatant): number {
  if (attacker.escalationPercentPerTurn <= 0) return 0;
  const activeTurns = Math.max(0, attacker.escalationStacks - ESCALATION_GRACE_TURNS);
  return Math.min(ESCALATION_MAX_BONUS, (attacker.escalationPercentPerTurn / 100) * activeTurns);
}

function applyDamage(
  state: BattleState,
  attacker: Combatant,
  target: Combatant,
  rawDamage: number,
  allowReaction = true,
  context: { readonly category?: DamageCategory; readonly element?: ElementType; readonly heavy?: boolean } = {}
): number {
  // Perk: Ausweichchance negiert den Treffer (vor allem anderen).
  if (rawDamage > 0 && dodgeChance(target.perks) > 0 && state.rng() < dodgeChance(target.perks)) {
    target.reaction = null;
    pushLog(state, `${target.name} weicht ${attacker.name} aus.`);
    return 0;
  }

  // Perk: ausgeteilter (+X %) und erlittener (-X %) Schaden nach Kategorie/Element.
  const dealtMult = damageDealtMultiplier(attacker.perks, context.category, context.element);
  const takenMult = damageTakenMultiplierFromPerks(target.perks, context.category, context.element);
  // Phase 88 — abgewehrte Schadenskategorie: gemindert + einmalige Log-Rückmeldung pro Treffer,
  // damit der Spieler den falschen Damage-Typ erkennt (Legibilität ohne HUD-/Render-Änderung).
  const categoryResist = categoryResistMultiplier(target, context.category);
  if (categoryResist < 1 && rawDamage > 0) {
    pushLog(state, `${target.name} wehrt ${context.category === 'physical' ? 'körperliche' : 'magische'} Angriffe ab — stark reduziert.`);
  }
  let adjustedDamage = rawDamage
    * dealtMult
    * takenMult
    * state.damageMultipliers[attacker.side]
    * damageTakenMultiplier(target)
    * (1 + escalationBonus(attacker))
    * armorMultiplier(target)
    * categoryResist;
  const reaction = allowReaction ? target.reaction : null;
  target.reaction = null;

  // Phase 81 — "gedeckt": ein rechtzeitiger Block/Konter ODER Verteidigen fängt den
  // (Big-)Hit ab. Nur ein ungedeckter Big-Hit schlägt mit Bonus durch.
  let braced = target.guarding;
  if (reaction && target.side === 'party') {
    if (reaction.timing === 'perfect') {
      adjustedDamage *= reaction.kind === 'counter' ? 0.45 : 0.25;
      state.teamMeter = clamp(state.teamMeter + 10, 0, TEAM_METER_MAX);
      pushLog(state, `${target.name} trifft das perfekte Reaktionsfenster.`);
      braced = true;
    } else if (reaction.timing === 'success') {
      adjustedDamage *= reaction.kind === 'counter' ? 0.65 : 0.5;
      pushLog(state, `${target.name} blockt im Timing.`);
      braced = true;
    } else {
      pushLog(state, `${target.name} verpasst das Reaktionsfenster.`);
    }
  }

  const guardedDamage = target.guarding ? adjustedDamage * 0.5 : adjustedDamage;
  const unbracedHeavy = context.heavy === true && target.side === 'party' && !braced;
  const heavyDamage = unbracedHeavy ? guardedDamage * HEAVY_UNBRACED_BONUS : guardedDamage;
  const damage = Math.max(1, Math.round(heavyDamage));
  if (unbracedHeavy) {
    pushLog(state, `${target.name} wird vom ungedeckten Großangriff voll getroffen!`);
  }
  target.hp = Math.max(0, target.hp - damage);
  if (target.hp > 0 && target.boss) {
    updateEnemyPhase(state, target);
  }
  // Schaden weckt aus Schlaf/Eis und bricht Bezauberung.
  if (damage > 0) {
    wakeOnDamage(target);
  }
  // Phase 82 — Element-Reflektor: das reflektierte Element prallt anteilig auf den
  // (Party-)Angreifer zurück → bestraft stures Schwäche-Spam, zwingt zum Umschalten.
  if (
    damage > 0
    && target.side === 'enemy'
    && attacker.side === 'party'
    && target.reflectsElement !== null
    && context.element === target.reflectsElement
  ) {
    const reflected = Math.max(1, Math.round(damage * ELEMENT_REFLECT_FRACTION));
    attacker.hp = Math.max(0, attacker.hp - reflected);
    pushLog(state, `${target.name} wirft ${reflected} Schaden auf ${attacker.name} zurück.`);
    checkDeath(state, attacker);
  }
  // Phase 88b — Kategorie-Reflektor: der falsche Damage-Typ (ganze physische/magische
  // Kategorie) prallt anteilig zurück → bestraft stures Spammen einer Schadensart.
  if (
    damage > 0
    && target.side === 'enemy'
    && attacker.side === 'party'
    && target.reflectsCategory !== null
    && context.category === target.reflectsCategory
  ) {
    const reflected = Math.max(1, Math.round(damage * CATEGORY_REFLECT_FRACTION));
    attacker.hp = Math.max(0, attacker.hp - reflected);
    pushLog(state, `${target.name} wirft ${reflected} ${context.category === 'physical' ? 'körperlichen' : 'magischen'} Schaden auf ${attacker.name} zurück.`);
    checkDeath(state, attacker);
  }

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

  // Perk: Konterchance bei erlittenem Angriff (unabhängig vom Reaktions-Timing).
  const perkCounter = counterProc(target.perks);
  if (damage > 0 && target.hp > 0 && !attacker.dead && perkCounter.chance > 0 && state.rng() < perkCounter.chance) {
    const counterDamage = Math.max(
      1,
      Math.round(
        (effectiveStat(target, 'attack') * 1.15 * perkCounter.scale - effectiveStat(attacker, 'defense') * 0.45)
        * state.damageMultipliers[target.side]
      )
    );
    attacker.hp = Math.max(0, attacker.hp - counterDamage);
    pushLog(state, `${target.name} kontert ${attacker.name} (Talent): ${counterDamage} Schaden.`);
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
  const weaknessHit = target.weaknesses.includes(element);
  const weaknessPressure = weaknessHit ? 2 : 0;
  // Großer Weiser: analysierte Schwächen reißen die Deckung schneller auf (+1 Druck ab Stufe 1).
  const analysisPressure = weaknessHit && target.analysisLevel >= 1 ? 1 : 0;
  // Phase 82 — gepanzert bis Break: JEDER Treffer baut etwas Druck auf, damit die
  // Rüstung für jeden Build aufreißbar ist (Schwächentreffer brechen schneller);
  // sonst wäre ein Build ohne die passende Schwäche gegen den Panzer chancenlos.
  const armorBasePressure = target.armoredUntilBreak ? 1 : 0;
  const pressure = weaknessPressure + analysisPressure + bonusPressure + armorBasePressure;
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

function grantMomentum(state: BattleState, actor: Combatant, reason: string): void {
  if (actor.dead) {
    return;
  }
  const before = actor.ct;
  actor.ct = clamp(actor.ct + MOMENTUM_CT_SURGE, 0, CT_MAX);
  const gained = actor.ct - before;
  if (gained > 0) {
    pushLog(state, `${actor.name} gewinnt Momentum durch ${reason} (+${gained} CT).`);
  }
}

function updateEnemyPhase(state: BattleState, combatant: Combatant): void {
  if (combatant.side !== 'enemy' || combatant.dead || combatant.phaseIndex >= 1) {
    return;
  }
  if (combatant.hp / combatant.maxHp <= combatant.phaseThreshold) {
    combatant.phaseIndex = 1;
    combatant.skillIds = uniqueStrings([...combatant.skillIds, ...combatant.phase2SkillIds]);
    combatant.ct = Math.max(
      combatant.ct,
      combatant.boss ? BATTLE_BALANCE.bossPhaseCtSurge : CT_THRESHOLD
    );
    pushLog(state, `${combatant.name} wechselt in Phase 2.`);
  }
}

function scoreEnemySkillTarget(
  _state: BattleState,
  actor: Combatant,
  skill: SkillDefinition,
  target: Combatant
): number {
  const targetIsOpponent = target.side !== actor.side;
  let score = 0;

  if (skill.power > 0 && targetIsOpponent) {
    const vulnerability = elementMultiplier(skill.element, target);
    const woundedPriority = actor.phaseIndex >= 1
      ? 1 - (target.hp / target.maxHp)
      : target.hp / target.maxHp;
    const breakPriority = hasStatus(target, 'guard-break') ? 2.2 : 0;
    const disabledPenalty = hasAnyControlStatus(target) && target.hp / target.maxHp > 0.35 ? -1.2 : 0;
    const rowPriority = target.side === 'party' && target.formationRow === 'front' ? 0.35 : 0;
    score += (skill.power / 12) * vulnerability + woundedPriority + breakPriority + disabledPenalty + rowPriority;
  }

  // Phase 87 — Mender: heilt am liebsten den am stärksten verwundeten Verbündeten;
  // volle Verbündete lohnen nicht (Score ~0 → er greift stattdessen an).
  if (isHealingSkill(skill) && !targetIsOpponent) {
    score += (1 - target.hp / target.maxHp) * MENDER_HEAL_INTENT;
  }

  if (skill.tags.includes('buff') && !targetIsOpponent) {
    score += 1.1 + (target === actor && actor.phaseIndex >= 1 ? 0.7 : 0);
  }

  if (skill.statusEffect) {
    score += scoreEnemyStatusIntent(skill.statusEffect.id, target, targetIsOpponent);
  }

  if (skill.ctDelta) {
    score += scoreEnemyCtIntent(skill.ctDelta, target, targetIsOpponent);
  }

  if (skill.tags.includes('debuff') && targetIsOpponent && !skill.statusEffect) {
    score += 1.1;
  }

  return score - skill.costMp * 0.03;
}

function scoreEnemyStatusIntent(
  statusId: StatusEffectId,
  target: Combatant,
  targetIsOpponent: boolean
): number {
  if (hasStatus(target, statusId)) {
    return -1.2;
  }

  if (!targetIsOpponent) {
    return statusId === 'attack-up' || statusId === 'defense-up' || statusId === 'magic-up' || statusId === 'haste'
      ? 2.4
      : 0.2;
  }

  switch (statusId) {
    case 'stun':
    case 'sleep':
    case 'freeze':
    case 'petrify':
      return 5.5 + clamp(target.ct, 0, CT_MAX) / CT_THRESHOLD;
    case 'paralyze':
    case 'confuse':
    case 'charm':
      return 4.2 + clamp(target.ct, 0, CT_MAX) / (CT_THRESHOLD * 2);
    case 'guard-break':
      return 3.7;
    case 'silence':
      return target.magic >= target.attack ? 3.2 : 1.4;
    case 'blind':
      return target.attack >= target.magic ? 3.0 : 1.2;
    case 'weaken':
      return 2.8;
    case 'spirit-down':
      return 2.5;
    case 'poison':
      return target.hp / target.maxHp > 0.35 ? 2.2 : 0.6;
    case 'attack-up':
    case 'defense-up':
    case 'magic-up':
    case 'haste':
      return -0.8;
  }
}

function scoreEnemyCtIntent(delta: number, target: Combatant, targetIsOpponent: boolean): number {
  if (delta < 0 && targetIsOpponent) {
    const readiness = clamp(target.ct, 0, CT_MAX) / CT_THRESHOLD;
    return Math.abs(delta) / 18 * (0.45 + readiness);
  }
  if (delta > 0 && !targetIsOpponent) {
    const missing = Math.max(0, CT_THRESHOLD - target.ct) / CT_THRESHOLD;
    return delta / 28 * (0.65 + missing);
  }
  return -1;
}

function hasAnyControlStatus(target: Combatant): boolean {
  return target.statuses.some((status) =>
    status.id === 'stun'
    || status.id === 'sleep'
    || status.id === 'freeze'
    || status.id === 'petrify'
    || status.id === 'paralyze'
    || status.id === 'confuse'
    || status.id === 'charm'
  );
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
    else if (status.id === 'weaken' && (stat === 'attack' || stat === 'magic')) value *= 0.7;
    else if (status.id === 'blind' && stat === 'attack') value *= 0.6;
  }
  return Math.max(1, Math.round(value));
}

function damageTakenMultiplier(target: Combatant): number {
  return target.statuses.some((status) => status.id === 'guard-break') ? 1.25 : 1;
}

function isSilenced(actor: Combatant): boolean {
  return actor.statuses.some((status) => status.id === 'silence');
}

function hasStatus(combatant: Combatant, statusId: StatusEffectId): boolean {
  return combatant.statuses.some((status) => status.id === statusId);
}

// Phase 40 — Aussetz-Status: liefert den aktiven Behinderungs-Status dieses Zugs (oder null).
// Chance-basierte Status (Lähmung/Verwirrung/Bezauberung) ziehen NUR dann RNG, wenn sie anliegen,
// damit bestehende deterministische Abläufe ohne diese Status unverändert bleiben.
function computeDisabled(state: BattleState, actor: Combatant): StatusEffectId | null {
  for (const id of HARD_SKIP_STATUSES) {
    if (actor.statuses.some((status) => status.id === id)) {
      return id;
    }
  }
  if (actor.statuses.some((status) => status.id === 'paralyze') && state.rng() < 0.5) {
    return 'paralyze';
  }
  if (actor.statuses.some((status) => status.id === 'confuse') && state.rng() < 0.4) {
    return 'confuse';
  }
  if (actor.statuses.some((status) => status.id === 'charm') && state.rng() < 0.5) {
    return 'charm';
  }
  return null;
}

function wakeOnDamage(target: Combatant): void {
  for (let index = target.statuses.length - 1; index >= 0; index -= 1) {
    if (WAKE_ON_DAMAGE_STATUSES.includes(target.statuses[index]!.id)) {
      target.statuses.splice(index, 1);
    }
  }
}

// Zeitkontrolle: verschiebt ein Ziel auf der CT-Leiste (positiv = vorziehen, negativ = zurückwerfen).
function applyCtDelta(target: Combatant, delta: number | undefined): void {
  if (!delta || target.dead) {
    return;
  }
  target.ct = clamp(target.ct + delta, 0, CT_MAX);
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
    case 'stun':
      return 'betäubt';
    case 'sleep':
      return 'eingeschläfert';
    case 'freeze':
      return 'eingefroren';
    case 'paralyze':
      return 'gelähmt';
    case 'petrify':
      return 'versteinert';
    case 'blind':
      return 'geblendet';
    case 'silence':
      return 'verstummt';
    case 'confuse':
      return 'verwirrt';
    case 'charm':
      return 'bezaubert';
    case 'weaken':
      return 'geschwächt';
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

// Phase 94 — Elementarfeld (Board-Control).
const FIELD_ELEMENT_LABEL: Readonly<Record<ElementType, string>> = {
  neutral: 'Neutral', water: 'Wasser', wind: 'Wind', fire: 'Feuer',
  earth: 'Erde', shadow: 'Schatten', holy: 'Heilig'
};

// Lädt das Schlachtfeld auf das Element der Fähigkeit auf (nur mit chargesField-Flag).
function chargeField(state: BattleState, actor: Combatant, skill: SkillDefinition): void {
  if (!skill.chargesField || skill.element === 'neutral') {
    return;
  }
  state.field = { element: skill.element, turns: FIELD_DURATION_ROUNDS };
  pushLog(state, `${actor.name} lädt das Schlachtfeld mit ${FIELD_ELEMENT_LABEL[skill.element]} auf.`);
}

// Gleichelementiger Treffer auf dem Feld schlägt verstärkt zu.
function fieldMatchMultiplier(field: BattleField | null, element: ElementType): number {
  return field && element !== 'neutral' && field.element === element ? FIELD_MATCH_AMPLIFY : 1;
}

// Trifft ein anderes Element auf ein geladenes Feld und bilden beide ein Fusions-Paar,
// entsteht eine Reaktion (z. B. Glutfeld + Wind = Feuersturm). Gleiches Element = keine
// Reaktion (das ist der Verstärkungs-Fall).
function fieldReaction(
  field: BattleField | null,
  element: ElementType
): ElementFusionDefinition | null {
  if (!field || element === 'neutral' || field.element === element) {
    return null;
  }
  return resolveElementFusion(field.element, element);
}

// Eine Fusions-Reaktion entlädt sich auf ein Ziel: Zusatz-Break-Druck + der Status
// der Fusion (verzahnt mit der 21-Paar-Fusionstabelle).
function triggerFieldReaction(
  state: BattleState,
  target: Combatant,
  fusion: ElementFusionDefinition
): void {
  pushLog(state, `Feldreaktion: ${fusion.name} entlädt sich auf ${target.name}!`);
  applyBreakPressure(state, target, fusion.damageElement, FIELD_REACTION_BREAK_PRESSURE);
  if (fusion.statusEffect) {
    applyStatus(target, fusion.statusEffect.id, fusion.statusEffect.turns);
  }
}

// Runden-Abklingen des Feldes.
function tickField(state: BattleState): void {
  if (!state.field) {
    return;
  }
  state.field.turns -= 1;
  if (state.field.turns <= 0) {
    state.field = null;
    pushLog(state, 'Das Elementarfeld verweht.');
  }
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
