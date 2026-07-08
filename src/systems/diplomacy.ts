import { FACTIONS } from '../data';
import type { FactionDefinition, FactionThreshold } from '../data';

// Phase 100 — Diplomatie: reine Regeln über eine Reputationskarte (factionId ->
// Punkte) + Story-Flags. Keine Scene-/WorldState-Abhängigkeit, damit sich
// Reputationsübergänge + Schwellen-Unlocks headless testen lassen (analog
// systems/crafting). Reputation ist auf [0, max] geklemmt; das Überschreiten einer
// Schwelle setzt deterministisch deren `unlockFlag`.

const factionById = new Map<string, FactionDefinition>(FACTIONS.map((faction) => [faction.id, faction]));

export const MAX_REPUTATION = 100;

export type ReputationMap = Readonly<Record<string, number>>;
export type FlagMap = Readonly<Record<string, boolean>>;

export interface FactionThresholdView extends FactionThreshold {
  readonly reached: boolean;
}

export interface FactionStandingView {
  readonly faction: FactionDefinition;
  readonly points: number;
  readonly rankTitle: string;
  readonly nextThreshold: FactionThreshold | null;
  readonly pointsToNext: number;
  readonly thresholds: readonly FactionThresholdView[];
}

export interface ReputationChange {
  readonly reputation: ReputationMap;
  readonly flags: FlagMap;
  // Schwellen, die durch diese Änderung NEU erreicht wurden (für Toasts/Log).
  readonly crossed: readonly FactionThreshold[];
}

export function getFaction(factionId: string): FactionDefinition | undefined {
  return factionById.get(factionId);
}

export function clampReputation(points: number): number {
  if (!Number.isFinite(points)) return 0;
  return Math.max(0, Math.min(MAX_REPUTATION, Math.round(points)));
}

export function getReputation(reputation: ReputationMap, factionId: string): number {
  return clampReputation(reputation[factionId] ?? 0);
}

// Höchste erreichte Schwelle bei `points` (oder null, solange keine erreicht ist).
export function currentThreshold(
  faction: FactionDefinition,
  points: number
): FactionThreshold | null {
  let reached: FactionThreshold | null = null;
  for (const threshold of faction.thresholds) {
    if (points >= threshold.points) {
      reached = threshold;
    }
  }
  return reached;
}

export function nextThreshold(
  faction: FactionDefinition,
  points: number
): FactionThreshold | null {
  return faction.thresholds.find((threshold) => points < threshold.points) ?? null;
}

// Reputation einer Faktion um `amount` (kann negativ sein) verschieben. Setzt die
// `unlockFlag`s aller nun erreichten, zuvor ungesetzten Schwellen. Deterministisch.
export function adjustReputation(
  reputation: ReputationMap,
  flags: FlagMap,
  factionId: string,
  amount: number
): ReputationChange {
  const faction = factionById.get(factionId);
  if (!faction) {
    return { reputation, flags, crossed: [] };
  }
  const before = getReputation(reputation, factionId);
  const after = clampReputation(before + amount);
  const nextReputation = { ...reputation, [factionId]: after };

  const crossed: FactionThreshold[] = [];
  let nextFlags = flags;
  for (const threshold of faction.thresholds) {
    if (after >= threshold.points && flags[threshold.unlockFlag] !== true) {
      nextFlags = { ...nextFlags, [threshold.unlockFlag]: true };
      crossed.push(threshold);
    }
  }
  return { reputation: nextReputation, flags: nextFlags, crossed };
}

// Ansicht fürs Menü: alle Faktionen mit Rang, Fortschritt zur nächsten Stufe und
// dem Schwellen-Status. Die Scene rendert daraus nur Text.
export function buildDiplomacyView(reputation: ReputationMap): FactionStandingView[] {
  return FACTIONS.map<FactionStandingView>((faction) => {
    const points = getReputation(reputation, faction.id);
    const reached = currentThreshold(faction, points);
    const next = nextThreshold(faction, points);
    return {
      faction,
      points,
      rankTitle: reached?.title ?? 'Fremd',
      nextThreshold: next,
      pointsToNext: next ? Math.max(0, next.points - points) : 0,
      thresholds: faction.thresholds.map((threshold) => ({
        ...threshold,
        reached: points >= threshold.points
      }))
    };
  });
}

// Datenintegrität: streng aufsteigende Schwellen in [1, MAX_REPUTATION], eindeutige
// Unlock-Flags über alle Faktionen.
export function validateFactions(): string[] {
  const issues: string[] = [];
  const seenFlags = new Set<string>();
  const seenIds = new Set<string>();
  for (const faction of FACTIONS as readonly FactionDefinition[]) {
    if (seenIds.has(faction.id)) {
      issues.push(`factions.${faction.id}: doppelte ID.`);
    }
    seenIds.add(faction.id);
    if (faction.thresholds.length === 0) {
      issues.push(`factions.${faction.id}: braucht mindestens eine Schwelle.`);
    }
    let previousPoints: number = 0;
    for (const threshold of faction.thresholds as readonly FactionThreshold[]) {
      if (threshold.points <= previousPoints || threshold.points > MAX_REPUTATION) {
        issues.push(`factions.${faction.id}: Schwellen müssen streng steigen und ≤ ${MAX_REPUTATION} sein.`);
      }
      previousPoints = threshold.points;
      if (seenFlags.has(threshold.unlockFlag)) {
        issues.push(`factions.${faction.id}: Unlock-Flag '${threshold.unlockFlag}' ist mehrfach vergeben.`);
      }
      seenFlags.add(threshold.unlockFlag);
    }
  }
  return issues;
}
