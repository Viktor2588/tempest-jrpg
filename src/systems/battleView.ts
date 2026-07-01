import type { ElementType, StatusEffectId } from '../data';
import { SIGNATURES, type SignatureTarget } from '../data';
import type {
  BattleRewards,
  BattleState,
  BattleStatus,
  Combatant,
  QueuedReaction,
  Side
} from './battle';
import type { InventoryStack } from './inventory';

export interface CombatantView {
  readonly id: string;
  readonly sourceId: string;
  readonly name: string;
  readonly formName: string | null;
  readonly side: Side;
  readonly level: number;
  readonly hp: number;
  readonly maxHp: number;
  readonly mp: number;
  readonly maxMp: number;
  readonly element: ElementType;
  readonly skillIds: readonly string[];
  readonly mimicSkillIds: readonly string[];
  readonly synergyPartnerIds: readonly string[];
  readonly signatureId: string | null;
  readonly signatureName: string | null;
  readonly signatureDescription: string | null;
  readonly signatureTarget: SignatureTarget | null;
  readonly signatureCharge: number;
  readonly signatureChargeMax: number;
  readonly resonanceElement: ElementType | null;
  readonly statuses: readonly StatusEffectId[];
  readonly reaction: QueuedReaction | null;
  readonly breakGauge: number;
  readonly breakGaugeMax: number;
  readonly phaseIndex: number;
  // Phase 40 — Großer Weiser: Analysestufe deckt Schwächen + Telegraph für die Anzeige auf.
  readonly analysisLevel: number;
  readonly revealedWeaknesses: readonly ElementType[];
  readonly telegraphSkillId: string | null;
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
    teamMeter: state.teamMeter,
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
  const signature = SIGNATURES.find((candidate) => candidate.id === combatant.signatureId);
  return {
    id: combatant.id,
    sourceId: combatant.sourceId,
    name: combatant.name,
    formName: combatant.formName,
    side: combatant.side,
    level: combatant.level,
    hp: combatant.hp,
    maxHp: combatant.maxHp,
    mp: combatant.mp,
    maxMp: combatant.maxMp,
    element: combatant.element,
    skillIds: [...combatant.skillIds],
    mimicSkillIds: [...combatant.mimicSkillIds],
    synergyPartnerIds: [...combatant.synergyPartnerIds],
    signatureId: combatant.signatureId,
    signatureName: signature?.name ?? null,
    signatureDescription: signature?.description ?? null,
    signatureTarget: signature?.target ?? null,
    signatureCharge: combatant.signatureCharge,
    signatureChargeMax: combatant.signatureChargeMax,
    resonanceElement: combatant.resonanceElement,
    statuses: combatant.statuses.map((status) => status.id),
    reaction: combatant.reaction,
    breakGauge: combatant.breakGauge,
    breakGaugeMax: combatant.breakGaugeMax,
    phaseIndex: combatant.phaseIndex,
    analysisLevel: combatant.analysisLevel,
    revealedWeaknesses: combatant.analysisLevel >= 1 ? [...combatant.weaknesses] : [],
    telegraphSkillId: combatant.telegraphSkillId,
    dead: combatant.dead,
    guarding: combatant.guarding,
    active: combatant.id === activeId
  };
}
