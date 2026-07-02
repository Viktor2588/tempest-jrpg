import type { ElementType, StatusEffectId } from '../data';
import { BATTLE_BALANCE } from './battle';
import type { CombatantView } from './battleView';

const ELEMENT_LABELS: Readonly<Record<ElementType, string>> = {
  neutral: 'Neutral',
  water: 'Wasser',
  wind: 'Wind',
  fire: 'Feuer',
  earth: 'Erde',
  shadow: 'Schatten',
  holy: 'Heilig'
};

const STATUS_LABELS: Readonly<Record<StatusEffectId, string>> = {
  poison: 'Gift',
  'attack-up': 'ANG↑',
  'defense-up': 'ABW↑',
  'magic-up': 'MAG↑',
  'spirit-down': 'GEI↓',
  haste: 'Eile',
  'guard-break': 'Break',
  stun: 'Stun',
  sleep: 'Schlaf',
  freeze: 'Eis',
  paralyze: 'Paralyse',
  petrify: 'Stein',
  blind: 'Blind',
  silence: 'Stumm',
  confuse: 'Wirr',
  charm: 'Bann',
  weaken: 'Schwach'
};

export interface EnemyIntelPresentation {
  readonly breakText: string;
  readonly weaknessText: string;
  readonly telegraphText: string | null;
  readonly devourText: string | null;
}

export function elementLabel(element: ElementType): string {
  return ELEMENT_LABELS[element];
}

export function formatStatusSummary(statuses: readonly StatusEffectId[]): string | null {
  if (statuses.length === 0) return null;
  return statuses.slice(0, 3).map((status) => STATUS_LABELS[status]).join(' · ');
}

export function buildEnemyIntel(unit: CombatantView): EnemyIntelPresentation {
  const weaknessText = unit.analysisLevel >= 1
    ? `SCHW ${unit.revealedWeaknesses.map(elementLabel).join('/') || 'keine'}`
    : 'SCHW ? (Analyse)';
  const telegraphText = unit.analysisLevel >= 1 && unit.telegraphSkillName
    ? `NÄCHSTES: ${unit.telegraphSkillName}`
    : null;
  const devourText = unit.devourable && unit.devourSuccessChance !== null
    ? unit.devourSuccessChance > 0
      ? `DEVOUR ${Math.round(unit.devourSuccessChance * 100)}%`
      : unit.boss
        ? 'DEVOUR: Phase 2 + Break'
        : `DEVOUR ab ${Math.round(BATTLE_BALANCE.devourHpThreshold * 100)}% LP/Break`
    : null;

  return {
    breakText: `BRK ${unit.breakGauge}/${unit.breakGaugeMax}`,
    weaknessText,
    telegraphText,
    devourText
  };
}
