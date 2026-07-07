import type { SkillTier } from './types';

// Phase 111 — Anzeige-Metadaten der Skill-Rang-Leiter (s. IDEE.md, Abschnitt 1).
// `rank` ordnet die Leiter (0 = niedrigster). `unlock` beschreibt, WORAUS ein Rang
// im Canon entsteht — die spätere Gating-Umsetzung (112 Raub/Fusion, 104 Erwachen)
// liest denselben Rang, statt eigene Schwellen zu erfinden.
export interface SkillTierMeta {
  readonly rank: number;
  readonly label: string;
  readonly badge: string;
  readonly color: string;
  readonly unlock: string;
}

export const SKILL_TIER_META: Readonly<Record<SkillTier, SkillTierMeta>> = {
  skill: {
    rank: 0,
    label: 'Fähigkeit',
    badge: '',
    color: '#cbd6e8',
    unlock: 'Durch Training, Natur oder Evolution erlernbar.'
  },
  'extra-skill': {
    rank: 1,
    label: 'Extra-Skill',
    badge: '✦',
    color: '#8fd3ff',
    unlock: 'Verfeinerte oder elementare Form einer Fähigkeit.'
  },
  'unique-skill': {
    rank: 2,
    label: 'Unique-Skill',
    badge: '★',
    color: '#e9c56c',
    unlock: 'Einzigartig — aus starkem Willen (Story/Namensgebung).'
  },
  'ultimate-skill': {
    rank: 3,
    label: 'Ultimate-Skill',
    badge: '❖',
    color: '#ff9de2',
    unlock: 'Der Gipfel — Evolution beim Erwachen (Erntefest).'
  }
};

export function skillTierRank(tier: SkillTier): number {
  return SKILL_TIER_META[tier].rank;
}

// Vorsatz für Listen/Buttons: Rang-Glyphe + Leerzeichen (leer für Grundfähigkeiten).
export function skillTierBadge(tier: SkillTier): string {
  const badge = SKILL_TIER_META[tier].badge;
  return badge ? `${badge} ` : '';
}
