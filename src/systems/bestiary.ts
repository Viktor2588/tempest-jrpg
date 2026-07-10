import { ENEMIES } from '../data';
import type { DamageCategory, ElementType, EnemyDefinition } from '../data';

// Phase 122 — Lebendiges Bestiarium: reine Regeln ueber die persistierten Felder
// (progression.defeatedEnemyCountsByEnemyId aus Phase 96 + progression.analyzedEnemyIds).
// Keine Scene-/Save-Abhaengigkeit, damit sich Tally + Aufdeck-Logik headless und
// deterministisch pruefen lassen (analog systems/bounties). Belohnt die Analyse-
// Mechanik (Grosser Weiser) dauerhaft: Kampfdaten werden erst nach dem Studium
// sichtbar, Besiegt-Zaehler immer.

const enemyById = new Map<string, EnemyDefinition>(
  (ENEMIES as readonly EnemyDefinition[]).map((enemy) => [enemy.id, enemy])
);

// Merkt sich neu analysierte Gegner-Arten (Set-Semantik, stabile Reihenfolge:
// bestehende zuerst, dann neu hinzukommende). Gibt bei Nulländerung die
// Original-Referenz zurueck (kein unnoetiges Neu-Allozieren im Save-Pfad).
export function tallyAnalyzedEnemies(
  analyzedEnemyIds: readonly string[],
  newlyAnalyzedIds: readonly string[]
): readonly string[] {
  if (newlyAnalyzedIds.length === 0) {
    return analyzedEnemyIds;
  }
  const known = new Set(analyzedEnemyIds);
  const added: string[] = [];
  for (const enemyId of newlyAnalyzedIds) {
    if (enemyId && !known.has(enemyId)) {
      known.add(enemyId);
      added.push(enemyId);
    }
  }
  return added.length === 0 ? analyzedEnemyIds : [...analyzedEnemyIds, ...added];
}

// Ist eine Gegner-Art bereits studiert? (Grundlage fuers Kampf-Bootstrapping in
// Phase 123 und fuers Aufdecken im Codex.)
export function isEnemyAnalyzed(
  analyzedEnemyIds: readonly string[],
  enemyId: string
): boolean {
  return analyzedEnemyIds.includes(enemyId);
}

export interface BestiaryEntryView {
  readonly enemyId: string;
  readonly name: string;
  readonly level: number;
  readonly boss: boolean;
  readonly defeatedCount: number;
  readonly analyzed: boolean;
  // Kampfdaten nur bei `analyzed === true` gefuellt (sonst leer / null → „???").
  readonly element: ElementType | null;
  readonly weaknesses: readonly ElementType[];
  readonly resistances: readonly ElementType[];
  readonly reflectsElement: ElementType | null;
  readonly resistsCategory: DamageCategory | null;
  readonly reflectsCategory: DamageCategory | null;
}

export interface BestiaryView {
  readonly entries: readonly BestiaryEntryView[];
  // Arten, denen der Spieler schon begegnet ist (mindestens einmal erlegt oder studiert).
  readonly encounteredCount: number;
  // Davon studierte Arten (Kampfdaten sichtbar).
  readonly analyzedCount: number;
  // Gesamtzahl definierter Gegner-Arten (weiches Vervollstaendigungsziel).
  readonly totalCount: number;
}

export interface BestiaryProgressState {
  readonly defeatedEnemyCountsByEnemyId: Readonly<Record<string, number>>;
  readonly analyzedEnemyIds: readonly string[];
}

// Baut das Bestiarium aus den persistierten Zaehlern. Es erscheinen nur Arten, denen
// der Spieler begegnet ist (kein Boss-Spoiler); studierte Arten decken ihre Kampfdaten
// auf, nur-erlegte zeigen „???" (Anreiz zum Analysieren). Sortierung: Level, dann Name.
export function buildBestiary(state: BestiaryProgressState): BestiaryView {
  const analyzed = new Set(state.analyzedEnemyIds);
  const encounteredIds = new Set<string>();
  for (const [enemyId, count] of Object.entries(state.defeatedEnemyCountsByEnemyId)) {
    if (count > 0) {
      encounteredIds.add(enemyId);
    }
  }
  for (const enemyId of state.analyzedEnemyIds) {
    encounteredIds.add(enemyId);
  }

  const entries: BestiaryEntryView[] = [];
  for (const enemyId of encounteredIds) {
    const enemy = enemyById.get(enemyId);
    if (!enemy) {
      continue;
    }
    const isAnalyzed = analyzed.has(enemyId);
    entries.push({
      enemyId,
      name: enemy.name,
      level: enemy.level,
      boss: enemy.boss === true,
      defeatedCount: Math.max(0, Math.trunc(state.defeatedEnemyCountsByEnemyId[enemyId] ?? 0)),
      analyzed: isAnalyzed,
      element: isAnalyzed ? enemy.element : null,
      weaknesses: isAnalyzed ? enemy.weaknesses : [],
      resistances: isAnalyzed ? enemy.resistances : [],
      reflectsElement: isAnalyzed ? enemy.reflectsElement ?? null : null,
      resistsCategory: isAnalyzed ? enemy.resistsCategory ?? null : null,
      reflectsCategory: isAnalyzed ? enemy.reflectsCategory ?? null : null
    });
  }

  entries.sort((a, b) => (a.level - b.level) || a.name.localeCompare(b.name, 'de'));

  return {
    entries,
    encounteredCount: entries.length,
    analyzedCount: entries.filter((entry) => entry.analyzed).length,
    totalCount: enemyById.size
  };
}
