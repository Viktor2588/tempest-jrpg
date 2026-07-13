import type { ElementType, SkillDefinition, StatusEffectId } from '../data';
import { SIGNATURES, SKILLS, type SignatureTarget } from '../data';
import type {
  BattleField,
  BattleRewards,
  BattleState,
  BattleStatus,
  Combatant,
  QueuedReaction,
  Side
} from './battle';
import { calculateDevourSuccessChance, escalationBonus } from './battle';
import { resolveElementFusion } from './fusion';
import type { InventoryStack } from './inventory';
import type { FormationRow } from './party';
import { devourChanceBonus } from './talentPerk';

// Phase 182 — Feld-Reaktion lesbar: aus welchen Fremd-Elementen ein geladenes Feld eine
// Fusions-Reaktion entlaedt (gleiches Element = Verstaerkung, keine Reaktion; neutral = keine).
const REACTION_CANDIDATE_ELEMENTS: readonly ElementType[] = [
  'water',
  'wind',
  'fire',
  'earth',
  'shadow',
  'holy'
];

export function fieldReactionElements(fieldElement: ElementType): ElementType[] {
  if (fieldElement === 'neutral') {
    return [];
  }
  return REACTION_CANDIDATE_ELEMENTS.filter(
    (candidate) => candidate !== fieldElement && resolveElementFusion(fieldElement, candidate) !== null
  );
}

export interface CombatantView {
  readonly id: string;
  readonly sourceId: string;
  readonly name: string;
  readonly formName: string | null;
  readonly side: Side;
  readonly formationRow: FormationRow;
  readonly level: number;
  readonly hp: number;
  readonly maxHp: number;
  readonly mp: number;
  readonly maxMp: number;
  readonly element: ElementType;
  readonly skillIds: readonly string[];
  readonly boss: boolean;
  readonly mimicSkillIds: readonly string[];
  readonly synergyPartnerIds: readonly string[];
  readonly signatureId: string | null;
  readonly signatureName: string | null;
  readonly signatureDescription: string | null;
  readonly signatureTarget: SignatureTarget | null;
  readonly signatureCharge: number;
  readonly signatureChargeMax: number;
  readonly resonanceElement: ElementType | null;
  // Phase 105 — Mimikry: aktives Form-Element (null = Grundform) + verbleibende eigene Züge.
  readonly mimicElement: ElementType | null;
  readonly mimicTurns: number;
  readonly statuses: ReadonlyArray<{ readonly id: StatusEffectId; readonly turns: number }>;
  readonly reaction: QueuedReaction | null;
  readonly breakGauge: number;
  readonly breakGaugeMax: number;
  readonly phaseIndex: number;
  // Phase 80 — Anti-Aussitzen: aktueller Schaden/Runde-Zuschlag in % (0 = keine Eskalation).
  readonly escalationBonusPercent: number;
  // Phase 40 — Großer Weiser: Analysestufe deckt Schwächen + Telegraph für die Anzeige auf.
  readonly analysisLevel: number;
  readonly revealedWeaknesses: readonly ElementType[];
  readonly revealedResistances: readonly ElementType[];
  readonly casterHint: string | null;
  readonly telegraphSkillId: string | null;
  readonly telegraphSkillName: string | null;
  // Phase 81 — der telegraphierte Zug ist ein Big-Hit (grosser Treffer → kontern!).
  readonly telegraphHeavy: boolean;
  readonly devourable: boolean;
  readonly devourSuccessChance: number | null;
  readonly dead: boolean;
  readonly guarding: boolean;
  readonly active: boolean;
}

export interface BattleView {
  readonly status: BattleStatus;
  readonly party: readonly CombatantView[];
  readonly enemies: readonly CombatantView[];
  readonly activeId: string | null;
  readonly teamMeter: number;
  readonly log: readonly string[];
  readonly rewards: BattleRewards;
  readonly inventory: readonly InventoryStack[];
  readonly turn: number;
  readonly round: number;
  // Phase 92 — Bewohner: Quell-IDs der in diesem Kampf verschlungenen Gegner-Arten.
  readonly devouredSourceIds: readonly string[];
  // Phase 94 — Elementarfeld: aktiver Feld-Zustand (null = neutral) für die HUD-Anzeige.
  readonly field: BattleField | null;
  // Phase 182 — Feld-Reaktion lesbar: Fremd-Elemente, die auf dem aktiven Feld eine
  // Fusions-Reaktion entladen (leer, wenn kein Feld geladen ist).
  readonly fieldReactions: readonly ElementType[];
}

export function renderView(state: BattleState): BattleView {
  const devourer = state.combatants.find((combatant) =>
    combatant.side === 'party' && combatant.skillIds.includes('predator')
  );
  const devourBonus = devourChanceBonus(devourer?.perks ?? []);
  return {
    status: state.status,
    party: state.combatants
      .filter((combatant) => combatant.side === 'party')
      .map((combatant) => renderCombatant(combatant, state.activeId)),
    enemies: state.combatants
      .filter((combatant) => combatant.side === 'enemy')
      .map((combatant) => renderCombatant(combatant, state.activeId, devourBonus)),
    activeId: state.activeId,
    teamMeter: state.teamMeter,
    log: [...state.log],
    rewards: {
      experience: state.rewards.experience,
      gold: state.rewards.gold,
      items: [...state.rewards.items]
    },
    inventory: [...state.inventory],
    turn: state.turns,
    round: state.round,
    devouredSourceIds: [...state.devouredSourceIds],
    field: state.field ? { element: state.field.element, turns: state.field.turns } : null,
    fieldReactions: state.field ? fieldReactionElements(state.field.element) : []
  };
}

function renderCombatant(
  combatant: Combatant,
  activeId: string | null,
  devourBonus = 0
): CombatantView {
  const signature = SIGNATURES.find((candidate) => candidate.id === combatant.signatureId);
  return {
    id: combatant.id,
    sourceId: combatant.sourceId,
    name: combatant.name,
    formName: combatant.formName,
    side: combatant.side,
    formationRow: combatant.formationRow,
    level: combatant.level,
    hp: combatant.hp,
    maxHp: combatant.maxHp,
    mp: combatant.mp,
    maxMp: combatant.maxMp,
    element: combatant.element,
    skillIds: [...combatant.skillIds],
    boss: combatant.boss,
    mimicSkillIds: [...combatant.mimicSkillIds],
    synergyPartnerIds: [...combatant.synergyPartnerIds],
    signatureId: combatant.signatureId,
    signatureName: signature?.name ?? null,
    signatureDescription: signature?.description ?? null,
    signatureTarget: signature?.target ?? null,
    signatureCharge: combatant.signatureCharge,
    signatureChargeMax: combatant.signatureChargeMax,
    resonanceElement: combatant.resonanceElement,
    mimicElement: combatant.mimicElement,
    mimicTurns: combatant.mimicTurns,
    statuses: combatant.statuses.map((status) => ({ id: status.id, turns: status.turns })),
    reaction: combatant.reaction,
    breakGauge: combatant.breakGauge,
    breakGaugeMax: combatant.breakGaugeMax,
    phaseIndex: combatant.phaseIndex,
    escalationBonusPercent: Math.round(escalationBonus(combatant) * 100),
    analysisLevel: combatant.analysisLevel,
    revealedWeaknesses: combatant.analysisLevel >= 1 ? [...combatant.weaknesses] : [],
    // Phase 137: Caster note for intel when analyzed
    casterHint: null, // would be set from enemy if high magic, for demo null; real would come from enemy def

    revealedResistances: combatant.analysisLevel >= 2 ? [...combatant.resistances] : [],
    telegraphSkillId: combatant.telegraphSkillId,
    telegraphSkillName: SKILLS.find((skill) => skill.id === combatant.telegraphSkillId)?.name ?? null,
    telegraphHeavy: (SKILLS as readonly SkillDefinition[]).find((skill) => skill.id === combatant.telegraphSkillId)?.heavy === true,
    devourable: combatant.devourable,
    devourSuccessChance: calculateDevourSuccessChance(combatant, devourBonus),
    dead: combatant.dead,
    guarding: combatant.guarding,
    active: combatant.id === activeId
  };
}
