import type { ElementType } from '../data';

// Phase 69 — Talent-Perk-Engine: datengetriebene passive Effekte/Procs, die im
// Kampf ausgewertet werden. Die Spezialisierungs-Baeume (Phase 70) fuellen die
// Knoten→Perk-Zuordnung; hier stehen nur die Perk-Typen und reine
// Aggregations-Helfer (Phaser-frei, headless testbar).

export type DamageCategory = 'physical' | 'magical';

export type TalentPerk =
  // +percent% ausgeteilter Schaden (optional gefiltert nach Kategorie/Element).
  | { readonly kind: 'damage-dealt'; readonly percent: number; readonly category?: DamageCategory; readonly element?: ElementType }
  // -percent% erlittener Schaden (optional gefiltert nach Kategorie/Element).
  | { readonly kind: 'damage-taken'; readonly percent: number; readonly category?: DamageCategory; readonly element?: ElementType }
  // +percent% maximale LP (Build-Zeit).
  | { readonly kind: 'max-hp'; readonly percent: number }
  // Ausweichchance gegen erlittene Angriffe (percent%).
  | { readonly kind: 'dodge'; readonly percent: number }
  // Konterchance bei erlittenem Angriff (percent%); scale skaliert den Konterschaden.
  | { readonly kind: 'counter'; readonly percent: number; readonly scale?: number }
  // On-Cast-Kette: nach triggerSkillId mit percent% Chance followUpSkillId ohne Zugkosten.
  | { readonly kind: 'skill-chain'; readonly triggerSkillId: string; readonly followUpSkillId: string; readonly percent: number }
  // Von dieser Figur gewirkte Buffs halten laenger (Wirkung verstaerkt).
  | { readonly kind: 'buff-power'; readonly percent: number };

function matches(
  perkCategory: DamageCategory | undefined,
  perkElement: ElementType | undefined,
  category: DamageCategory | undefined,
  element: ElementType | undefined
): boolean {
  if (perkCategory !== undefined && perkCategory !== category) return false;
  if (perkElement !== undefined && perkElement !== element) return false;
  return true;
}

// Multiplikator auf ausgeteilten Schaden (Produkt aller passenden Perks).
export function damageDealtMultiplier(
  perks: readonly TalentPerk[],
  category?: DamageCategory,
  element?: ElementType
): number {
  let mult = 1;
  for (const perk of perks) {
    if (perk.kind === 'damage-dealt' && matches(perk.category, perk.element, category, element)) {
      mult *= 1 + perk.percent / 100;
    }
  }
  return mult;
}

// Multiplikator auf erlittenen Schaden; jede Reduktion multipliziert (1 - p/100),
// Ergebnis auf mind. 0.1 begrenzt (keine völlige Immunität durch Stapeln).
export function damageTakenMultiplierFromPerks(
  perks: readonly TalentPerk[],
  category?: DamageCategory,
  element?: ElementType
): number {
  let mult = 1;
  for (const perk of perks) {
    if (perk.kind === 'damage-taken' && matches(perk.category, perk.element, category, element)) {
      mult *= 1 - perk.percent / 100;
    }
  }
  return Math.max(0.1, mult);
}

// Faktor auf maximale LP (Build-Zeit).
export function maxHpMultiplier(perks: readonly TalentPerk[]): number {
  let percent = 0;
  for (const perk of perks) {
    if (perk.kind === 'max-hp') percent += perk.percent;
  }
  return 1 + percent / 100;
}

// Ausweichchance [0,0.9]: additiv über alle dodge-Perks.
export function dodgeChance(perks: readonly TalentPerk[]): number {
  let percent = 0;
  for (const perk of perks) {
    if (perk.kind === 'dodge') percent += perk.percent;
  }
  return Math.min(0.9, Math.max(0, percent / 100));
}

// Konterchance [0,1] und Schadensskalierung (höchste Skalierung gewinnt).
export function counterProc(perks: readonly TalentPerk[]): { chance: number; scale: number } {
  let percent = 0;
  let scale = 1;
  for (const perk of perks) {
    if (perk.kind === 'counter') {
      percent += perk.percent;
      scale = Math.max(scale, perk.scale ?? 1);
    }
  }
  return { chance: Math.min(1, Math.max(0, percent / 100)), scale };
}

// Kettenskill für einen gerade gewirkten Skill (erster Treffer gewinnt) oder null.
export function skillChainFor(
  perks: readonly TalentPerk[],
  castSkillId: string
): { followUpSkillId: string; chance: number } | null {
  for (const perk of perks) {
    if (perk.kind === 'skill-chain' && perk.triggerSkillId === castSkillId) {
      return { followUpSkillId: perk.followUpSkillId, chance: Math.min(1, Math.max(0, perk.percent / 100)) };
    }
  }
  return null;
}

// Zusätzliche Buff-Dauer (in Runden), abgeleitet aus buff-power-Perks.
export function buffBonusTurns(perks: readonly TalentPerk[]): number {
  let percent = 0;
  for (const perk of perks) {
    if (perk.kind === 'buff-power') percent += perk.percent;
  }
  return Math.floor(percent / 100);
}
