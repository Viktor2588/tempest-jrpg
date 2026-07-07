import { FACILITIES, ITEMS, RESIDENTS } from '../data';
import type { FacilityDefinition, ItemDefinition, ResidentDefinition, ResidentRole } from '../data';
import { addInventoryItem } from './inventory';
import type { InventoryStack } from './inventory';
import { resolveTempestGrowthStage, type StoryFlags, type TempestGrowthStage } from './tempestGrowth';

// Phase 93 — Einrichtungen & Produktion: reine Regeln ueber die Bewohner-Liste
// (Phase 92), die Tempest-Wachstumsstufe und Inventar/Gold. Keine Scene-/Save-
// Abhaengigkeit, damit sich Produktion + Ansicht headless testen und deterministisch
// balance-simulieren lassen. Kern der Schleife kaempfen/erkunden -> Material+Bewohner
// -> Rast -> Produktion -> Macht.

const residentById = new Map<string, ResidentDefinition>(
  RESIDENTS.map((resident) => [resident.id, resident])
);
const itemById = new Map<string, ItemDefinition>(ITEMS.map((item) => [item.id, item]));

// Produktionsstaerke je Wachstumsstufe: die Wildnis (noch keine Nation) produziert
// nichts, jede Ausbaustufe hebt den Multiplikator um eins. Bewusst linear, damit die
// Ausbeute vorhersehbar mit dem Nationsausbau waechst.
export function facilityLevelForStage(stage: TempestGrowthStage): number {
  switch (stage) {
    case 'camp': return 1;
    case 'village': return 2;
    case 'city': return 3;
    default: return 0;
  }
}

function outputLabel(facility: FacilityDefinition): string {
  return facility.output.kind === 'gold'
    ? 'Gold'
    : itemById.get(facility.output.itemId)?.name ?? facility.output.itemId;
}

// Wie viele rekrutierte Bewohner besetzen diese Einrichtung (Rollen-Match)?
function staffCount(facility: FacilityDefinition, residentIds: readonly string[]): number {
  const roles = new Set(facility.staffRoles);
  let count = 0;
  for (const id of residentIds) {
    const resident = residentById.get(id);
    if (resident && roles.has(resident.role)) {
      count += 1;
    }
  }
  return count;
}

// Produktionsmenge einer Einrichtung fuer genau einen Rast-Zyklus:
// Bewohnerzahl x Stufen-Multiplikator x Basis pro Kopf. Null, solange die Nation
// noch Wildnis ist oder niemand die Einrichtung besetzt.
export function facilityOutputAmount(
  facility: FacilityDefinition,
  residentIds: readonly string[],
  level: number
): number {
  if (level <= 0) {
    return 0;
  }
  return staffCount(facility, residentIds) * level * facility.output.perStaffPerLevel;
}

export interface FacilityYield {
  readonly facilityId: string;
  readonly facilityName: string;
  readonly outputKind: 'item' | 'gold';
  readonly outputItemId: string | null;
  readonly outputLabel: string;
  readonly amount: number;
}

export interface FacilityView {
  readonly facility: FacilityDefinition;
  readonly unlocked: boolean;
  readonly level: number;
  readonly staff: readonly string[];
  readonly outputLabel: string;
  readonly amountPerCycle: number;
}

export interface FacilityOverview {
  readonly stage: TempestGrowthStage;
  readonly level: number;
  readonly facilities: readonly FacilityView[];
  readonly totalPerCycle: number;
}

// Ansicht fuers Menue: alle Einrichtungen mit Ausbau-Status, zugewiesenen Bewohnern
// und erwarteter Ausbeute pro Rast. Die Scene rendert daraus nur Text + Buttons.
export function buildFacilityOverview(
  residentIds: readonly string[],
  flags: StoryFlags = {}
): FacilityOverview {
  const stage = resolveTempestGrowthStage(flags);
  const level = facilityLevelForStage(stage);
  const facilities = FACILITIES.map<FacilityView>((facility) => {
    const roles = new Set<ResidentRole>(facility.staffRoles);
    const staff = residentIds
      .map((id) => residentById.get(id))
      .filter((resident): resident is ResidentDefinition => !!resident && roles.has(resident.role))
      .map((resident) => resident.name);
    return {
      facility,
      unlocked: level > 0,
      level,
      staff,
      outputLabel: outputLabel(facility),
      amountPerCycle: facilityOutputAmount(facility, residentIds, level)
    };
  });
  return {
    stage,
    level,
    facilities,
    totalPerCycle: facilities.reduce((sum, view) => sum + view.amountPerCycle, 0)
  };
}

export interface ProductionCycleInput {
  readonly residentIds: readonly string[];
  readonly flags: StoryFlags;
  readonly inventory: readonly InventoryStack[];
  readonly gold: number;
}

export interface ProductionCycleResult {
  readonly ok: boolean;
  readonly inventory: readonly InventoryStack[];
  readonly gold: number;
  readonly yields: readonly FacilityYield[];
  readonly message: string;
}

// Einen einzelnen Rast-/Produktions-Zyklus abrechnen: deterministisch, ohne RNG.
// Fuegt die Ausbeute jeder besetzten Einrichtung dem Inventar/Gold hinzu. `ok` ist
// false (mit Begruendung), wenn nichts produziert wurde — die Scene zeigt dann eine
// erklaerende Meldung statt einer leeren Rast.
export function runProductionCycle(input: ProductionCycleInput): ProductionCycleResult {
  const overview = buildFacilityOverview(input.residentIds, input.flags);
  if (overview.level <= 0) {
    return {
      ok: false,
      inventory: input.inventory,
      gold: input.gold,
      yields: [],
      message: 'Tempest ist noch Wildnis — es gibt keine Einrichtungen zum Produzieren.'
    };
  }

  const yields: FacilityYield[] = [];
  let inventory = input.inventory;
  let gold = input.gold;

  for (const view of overview.facilities) {
    if (view.amountPerCycle <= 0) {
      continue;
    }
    const facility = view.facility;
    if (facility.output.kind === 'gold') {
      gold += view.amountPerCycle;
    } else {
      inventory = addInventoryItem(inventory, facility.output.itemId, view.amountPerCycle);
    }
    yields.push({
      facilityId: facility.id,
      facilityName: facility.name,
      outputKind: facility.output.kind,
      outputItemId: facility.output.kind === 'item' ? facility.output.itemId : null,
      outputLabel: view.outputLabel,
      amount: view.amountPerCycle
    });
  }

  if (yields.length === 0) {
    return {
      ok: false,
      inventory: input.inventory,
      gold: input.gold,
      yields: [],
      message: 'Noch keine Bewohner besetzen die Einrichtungen — verschlinge und benenne Gegner.'
    };
  }

  const summary = yields.map((entry) => `${entry.outputLabel} +${entry.amount}`).join(', ');
  return {
    ok: true,
    inventory,
    gold,
    yields,
    message: `Rast in Tempest: ${summary}.`
  };
}
