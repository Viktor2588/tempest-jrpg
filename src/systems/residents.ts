import { ENEMIES, RESIDENTS } from '../data';
import type { ResidentDefinition, ResidentRole } from '../data';

// Phase 92 — Bewohner (Residents): reine Regeln über die persistente Bewohner-ID-
// Liste (in der Progression gespeichert). Keine Scene-/BattleState-Abhängigkeit,
// damit sich Rekrutierung + Roster headless testen lassen.

const residentByOriginEnemyId = new Map<string, ResidentDefinition>(
  RESIDENTS.map((resident) => [resident.originEnemyId, resident])
);
const residentById = new Map<string, ResidentDefinition>(
  RESIDENTS.map((resident) => [resident.id, resident])
);
const enemyNameById = new Map<string, string>(ENEMIES.map((enemy) => [enemy.id, enemy.name]));

export interface RecruitResult {
  readonly residentIds: readonly string[];
  readonly newlyRecruited: readonly ResidentDefinition[];
}

// Welche Gegner-Art schaltet einen Bewohner frei?
export function residentForEnemy(enemyId: string): ResidentDefinition | undefined {
  return residentByOriginEnemyId.get(enemyId);
}

export function getResident(residentId: string): ResidentDefinition | undefined {
  return residentById.get(residentId);
}

// Aus einer Menge verschlungener Gegner-Arten die neuen Bewohner rekrutieren.
// Idempotent: bereits vorhandene Bewohner werden nicht doppelt aufgenommen, die
// Reihenfolge bleibt stabil (bestehende zuerst, neue in RESIDENTS-Reihenfolge).
export function recruitResidentsFromDevour(
  existingResidentIds: readonly string[],
  devouredEnemyIds: readonly string[]
): RecruitResult {
  const owned = new Set(existingResidentIds.filter((id) => residentById.has(id)));
  const devoured = new Set(devouredEnemyIds);
  const newlyRecruited: ResidentDefinition[] = [];
  for (const resident of RESIDENTS) {
    if (owned.has(resident.id) || !devoured.has(resident.originEnemyId)) {
      continue;
    }
    owned.add(resident.id);
    newlyRecruited.push(resident);
  }
  return {
    residentIds: RESIDENTS.filter((resident) => owned.has(resident.id)).map(
      (resident) => resident.id
    ),
    newlyRecruited
  };
}

export interface ResidentRosterEntry {
  readonly resident: ResidentDefinition;
  readonly recruited: boolean;
  readonly originEnemyName: string;
}

export interface ResidentRosterView {
  readonly entries: readonly ResidentRosterEntry[];
  readonly recruitedCount: number;
  readonly totalCount: number;
  readonly countsByRole: Readonly<Record<ResidentRole, number>>;
}

// Roster-Ansicht fürs Menü: alle bekannten Bewohner-Plätze mit Rekrutierungs-
// Status, plus Zählung je Rolle (nur rekrutierte). Die Scene rendert daraus Text.
export function buildResidentRoster(residentIds: readonly string[]): ResidentRosterView {
  const owned = new Set(residentIds.filter((id) => residentById.has(id)));
  const countsByRole: Record<ResidentRole, number> = {
    Wache: 0,
    Späher: 0,
    Handwerk: 0,
    Heilung: 0,
    Bau: 0
  };
  const entries = RESIDENTS.map<ResidentRosterEntry>((resident) => {
    const recruited = owned.has(resident.id);
    if (recruited) {
      countsByRole[resident.role] += 1;
    }
    return {
      resident,
      recruited,
      originEnemyName: enemyNameById.get(resident.originEnemyId) ?? resident.species
    };
  });
  return {
    entries,
    recruitedCount: owned.size,
    totalCount: RESIDENTS.length,
    countsByRole
  };
}
