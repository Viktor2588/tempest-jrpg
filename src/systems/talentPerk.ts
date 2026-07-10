import { SKILL_TREES, type DamageCategory, type ElementType, type SkillTreeNodeDefinition, type TalentPerk } from '../data';

export type { DamageCategory, TalentPerk } from '../data';

// Phase 69 — Talent-Perk-Engine: datengetriebene passive Effekte/Procs, die im
// Kampf ausgewertet werden. Die Perk-Typen leben in data/types; hier stehen die
// reinen Aggregations-Helfer und die Knoten→Perk-Ableitung (Phaser-frei, headless testbar).

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

export function devourChanceBonus(perks: readonly TalentPerk[]): number {
  const percent = perks.reduce(
    (sum, perk) => sum + (perk.kind === 'devour-chance' ? perk.percent : 0),
    0
  );
  return Math.min(0.5, Math.max(0, percent / 100));
}

export function analysisBonusLevels(perks: readonly TalentPerk[]): number {
  return perks.reduce(
    (sum, perk) => sum + (perk.kind === 'analysis-power' ? Math.max(0, perk.levels) : 0),
    0
  );
}

// --- Phase 70: Spec-Baum-Knoten → Perks / Branch-Lock ---
// Knoten-Register über alle Spec-Bäume (nodeId → {branch, perks}).
const specNodeById = new Map<string, { readonly branch?: string; readonly perks: readonly TalentPerk[] }>(
  SKILL_TREES.flatMap((tree) =>
    (tree.nodes as readonly SkillTreeNodeDefinition[]).map(
      (node) => [node.id, { branch: node.branch, perks: node.perks ?? [] }] as const
    )
  )
);

// Von einer Figur gewählte Spezialisierungsrichtung (erster freigeschalteter
// Knoten mit Branch) oder null. Branch-Lock: andere Stränge bleiben gesperrt.
export function committedBranch(unlockedNodeIds: readonly string[]): string | null {
  for (const nodeId of unlockedNodeIds) {
    const branch = specNodeById.get(nodeId)?.branch;
    if (branch !== undefined) return branch;
  }
  return null;
}

// Alle Perks aus den freigeschalteten Knoten einer Figur.
export function talentPerksForNodes(unlockedNodeIds: readonly string[]): TalentPerk[] {
  return unlockedNodeIds.flatMap((nodeId) => [...(specNodeById.get(nodeId)?.perks ?? [])]);
}

// Branch eines Knotens (oder null, wenn strangfrei/unbekannt).
export function branchOfNode(nodeId: string): string | null {
  return specNodeById.get(nodeId)?.branch ?? null;
}

// --- Phase 72: Perk-Vorschau (menschenlesbar, für die Knoten-Vorschau) ---
const ELEMENT_LABEL: Readonly<Record<string, string>> = {
  neutral: 'neutral', water: 'Wasser', wind: 'Wind', fire: 'Feuer',
  earth: 'Erde', shadow: 'Schatten', holy: 'Heilig'
};

function damageScopeLabel(category?: DamageCategory, element?: ElementType): string {
  if (element) return `${ELEMENT_LABEL[element] ?? element}-Schaden`;
  if (category === 'physical') return 'physischer Schaden';
  if (category === 'magical') return 'magischer Schaden';
  return 'Schaden';
}

// Kurze deutsche Beschreibung der Perk-Wirkung (Vorschau vor dem Kauf).
export function describePerk(perk: TalentPerk): string {
  switch (perk.kind) {
    case 'damage-dealt':
      return `+${perk.percent}% ${damageScopeLabel(perk.category, perk.element)}`;
    case 'damage-taken':
      return `-${perk.percent}% erlittener ${damageScopeLabel(perk.category, perk.element)}`;
    case 'max-hp':
      return `+${perk.percent}% max. LP`;
    case 'dodge':
      return `${perk.percent}% Ausweichchance`;
    case 'counter':
      return `${perk.percent}% Konterchance${perk.scale && perk.scale > 1 ? ` (×${perk.scale} Wucht)` : ''}`;
    case 'skill-chain':
      return `${perk.percent}% Chance auf Folgeskill nach Auslöser`;
    case 'buff-power':
      return `Eigene Buffs halten länger (+${Math.floor(perk.percent / 100)} Runde)`;
    case 'devour-chance':
      return `+${perk.percent}% Verschlingen-Chance`;
    case 'analysis-power':
      return `Großer Weiser analysiert +${perk.levels} Stufe`;
  }
}

// Kompakter Sperrgrund für die Knoten-Kachel im Talentbaum — macht aus dem
// nichtssagenden „Gesperrt" einen konkreten Grund (Strang-Bindung, Level, Vorstufe …).
// Nimmt die ausführliche canUnlockSkillNode-Meldung und kürzt sie auf ein Tag.
export function compactLockReason(message: string): string {
  if (message.includes('Spezialisierungsstrang')) return 'Anderer Strang';
  if (message.startsWith('Level')) return message.replace(' erforderlich.', '');
  if (message.includes('Vorgänger')) return 'Vorstufe';
  if (message.includes('Skill-Punkte')) return 'SP fehlt';
  if (message.includes('Entwicklung')) return 'Evolution';
  if (message.includes('Bindung')) return 'Bindung';
  if (message.includes('Region')) return 'Region';
  if (message.includes('Story')) return 'Story';
  return 'Gesperrt';
}

// Alle Perk-Beschreibungen eines Knotens (für die Vorschau).
export function describeNodePerks(perks: readonly TalentPerk[] | undefined): string[] {
  return (perks ?? []).map(describePerk);
}
