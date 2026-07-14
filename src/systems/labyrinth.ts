import { ENEMIES, ITEMS } from '../data';
import type { EnemyDefinition, ItemDefinition } from '../data';
import { experienceFalloffMultiplier, scaleEnemyStatsToLevel } from './enemyScaling';
import { createEnemyBattleUnit, type BattleUnitInput } from './battle';
import { clampLevel } from './stats';
import { addInventoryItem, type InventoryStack } from './inventory';
import { rollLabyrinthLootItemId } from './lootAffix';
import { makeRng } from './rng';

export type LabyrinthModifier = 'crystal-fog' | 'hungry-corridor' | 'spirit-updraft';

export interface LabyrinthReward {
  readonly gold: number;
  readonly items: readonly { readonly itemId: string; readonly quantity: number }[];
}

export interface LabyrinthFloor {
  readonly depth: number;
  readonly enemyIds: readonly string[];
  readonly modifier: LabyrinthModifier;
  readonly reward: LabyrinthReward;
}

export interface LabyrinthRun {
  readonly seed: number;
  readonly floors: readonly LabyrinthFloor[];
  readonly carryRule: 'hp-mp-carry-no-rest';
}

// Phase 146 — die neuen Archetypen bereichern auch die Labyrinth-Pools (off-route;
// party-relativ skaliert via Phase 147). Mender/CC/Reflektor machen tiefere Etagen
// abwechslungsreicher, ohne eine neue Mechanik einzufuehren.
const ENEMY_POOLS: readonly (readonly string[])[] = [
  ['spore-moth', 'lizardman-acolyte', 'marsh-thornback'],
  ['ogre-warrior', 'orc-soldier', 'highland-galecaller'],
  ['orc-general', 'lizardman-warrior', 'academy-revenant'],
  ['magic-colossus']
];

const MODIFIERS: readonly LabyrinthModifier[] = ['crystal-fog', 'hungry-corridor', 'spirit-updraft'];

export function createLabyrinthRun(seed: number, floorCount = 3): LabyrinthRun {
  const rng = makeRng(seed);
  const floors = Array.from({ length: floorCount }, (_, index): LabyrinthFloor => {
    const depth = index + 1;
    const pool = ENEMY_POOLS[Math.min(index, ENEMY_POOLS.length - 1)]!;
    const rotate = Math.floor(rng() * pool.length);
    const enemyIds = [...pool.slice(rotate), ...pool.slice(0, rotate)];
    return {
      depth,
      enemyIds,
      modifier: MODIFIERS[Math.floor(rng() * MODIFIERS.length)]!,
      reward: rewardForDepth(depth)
    };
  });
  return { seed, floors, carryRule: 'hp-mp-carry-no-rest' };
}

export function collectLabyrinthReward(
  inventory: readonly InventoryStack[],
  gold: number,
  reward: LabyrinthReward
): { readonly inventory: readonly InventoryStack[]; readonly gold: number } {
  return {
    gold: Math.max(0, gold + reward.gold),
    inventory: reward.items.reduce(
      (stacks, item) => addInventoryItem(stacks, item.itemId, item.quantity),
      [...inventory]
    )
  };
}

// Phase 147 — Labyrinth skaliert party-relativ: tiefere Etagen führen die Party
// um einen kleinen Level-Vorsprung an (Floor 1 < 2 < 3), damit tiefer = härter.
// Die Party-relative Grundskalierung liefert bereits `effectiveEnemyLevel`
// (`kind: 'trigger'`, nie unter Basis); der Tiefen-Lead legt nur noch etwas drauf.
const LABYRINTH_ENCOUNTER_DEPTH: Readonly<Record<string, number>> = {
  'labyrinth-floor-1': 1,
  'labyrinth-floor-2': 2,
  'labyrinth-floor-3': 3
};

export function labyrinthEncounterDepth(encounterId: string | null | undefined): number | null {
  return (encounterId && LABYRINTH_ENCOUNTER_DEPTH[encounterId]) || null;
}

export function labyrinthFloorLevelLead(depth: number): number {
  return Math.max(0, Math.floor(depth) - 1);
}

const enemyById = new Map<string, EnemyDefinition>(ENEMIES.map((enemy) => [enemy.id, enemy]));

// Anders als reguläre Trigger-Encounter (gedeckelt auf Basis + 6) verfolgt das
// Labyrinth das VOLLE Party-Level (plus Tiefen-Lead), damit ein Lauf auch nach
// vielen Leveln fordernd bleibt — nie unter Basis (`Math.max`). Der XP-Falloff
// aus `enemyScaling` greift weiter → Overgrind bringt nichts.
export function labyrinthFloorEnemyLevel(baseLevel: number, partyLevel: number, depth: number): number {
  const target = clampLevel(partyLevel) + labyrinthFloorLevelLead(depth);
  return clampLevel(Math.max(clampLevel(baseLevel), target));
}

// Party-relative, tiefenskalierte Kampfeinheiten für eine Labyrinth-Etage.
export function createScaledLabyrinthFloorUnits(
  enemyIds: readonly string[],
  partyLevel: number,
  depth: number
): BattleUnitInput[] {
  return enemyIds.flatMap((enemyId): BattleUnitInput[] => {
    const enemy = enemyById.get(enemyId);
    if (!enemy) {
      return [];
    }
    const level = labyrinthFloorEnemyLevel(enemy.level, partyLevel, depth);
    return [{
      ...createEnemyBattleUnit(enemy),
      level,
      stats: scaleEnemyStatsToLevel(enemy.stats, enemy.level, level),
      experienceReward: Math.round(
        enemy.experienceReward * experienceFalloffMultiplier(enemy.level, partyLevel)
      )
    }];
  });
}

// Phase 148 — Boss-Echos: Ramiris beschwört ein skaliertes Echo eines Bosses, den der
// Spieler BESIEGT, aber NICHT verschlungen hat — die verpasste Devour-Belohnung wird
// so ein zweites Mal greifbar (kanonisch: Ramiris beschwört Geister/Echos).
export interface LabyrinthEchoProgress {
  readonly defeatedEnemyCountsByEnemyId: Readonly<Record<string, number>>;
  readonly devouredSourceIds: readonly string[];
}

// Verschlingbare Bosse, die besiegt, aber noch nicht verschlungen wurden (stabile Reihenfolge).
export function eligibleBossEchoIds(progress: LabyrinthEchoProgress): string[] {
  const devoured = new Set(progress.devouredSourceIds);
  return [...enemyById.values()]
    .filter((enemy) =>
      enemy.boss === true
      && enemy.devourable === true
      && (progress.defeatedEnemyCountsByEnemyId[enemy.id] ?? 0) > 0
      && !devoured.has(enemy.id))
    .map((enemy) => enemy.id);
}

// Wählt deterministisch das „wertvollste" Echo (höchstes Basislevel, dann Id).
export function selectLabyrinthBossEcho(progress: LabyrinthEchoProgress): string | null {
  const candidates = eligibleBossEchoIds(progress)
    .map((id) => enemyById.get(id)!)
    .sort((a, b) => (b.level - a.level) || a.id.localeCompare(b.id));
  return candidates[0]?.id ?? null;
}

// Skaliertes, verschlingbares Echo als Kampfeinheit (Party-relativ via Phase 147);
// per Break gibt es erneut +Devour-Chance auf die ursprüngliche Belohnung.
export function createLabyrinthBossEchoUnit(
  enemyId: string,
  partyLevel: number,
  depth = 3
): BattleUnitInput | null {
  return createScaledLabyrinthFloorUnits([enemyId], partyLevel, depth)[0] ?? null;
}

// Phase 155 — Labyrinth-Etagen-Loot: kuratierte Basis-Gear-Tische je Tiefe
// (Raritaet steigt mit der Etage/dem Tiefen-Lead aus Phase 147). Ein Etagensieg
// rollt daraus DETERMINISTISCH aus dem Kampf-Seed mit gedeckelter, tiefenabhaengiger
// Chance eine gerollte Ausruestungs-Instanz (Phase 151) — bewusst niedrig, damit
// kein offenes Farmen entsteht, aber tiefere (riskantere) Etagen oefter/besser loten.
const LABYRINTH_LOOT_TABLES: Readonly<Record<number, readonly string[]>> = {
  1: ['orc-cleaver', 'spirit-oak-staff', 'swiftwind-boots', 'lesser-magicule-core'],
  2: ['warded-brigandine', 'famine-charm', 'ember-signet', 'resonant-core', 'ember-magicule-core'],
  3: ['stormfang-blade', 'veldora-scale-ward', 'ward-talisman', 'soul-forged-core']
};

const LABYRINTH_LOOT_CHANCE: Readonly<Record<number, number>> = { 1: 0.15, 2: 0.25, 3: 0.4 };

// Nur die drei realen Labyrinth-Etagen (1..3) haben einen Loot-Tisch; alles andere
// lotet nicht (die Aufrufer leiten die Tiefe ohnehin aus `labyrinthEncounterDepth` ab).
export function labyrinthLootTableForDepth(depth: number): readonly string[] {
  return LABYRINTH_LOOT_TABLES[Math.floor(depth)] ?? [];
}

// Deterministischer Etagen-Loot-Drop: gedeckelte, mit der Tiefe steigende Chance;
// bei Erfolg eine kodierte, gerollte Ausruestungs-Instanz aus dem Tiefen-Tisch,
// sonst null. Rein/funktional (Seed rein → Ergebnis raus), headless testbar.
export function rollLabyrinthFloorLoot(
  seed: number,
  depth: number,
  itemDefinitions: readonly ItemDefinition[] = ITEMS
): string | null {
  const table = labyrinthLootTableForDepth(depth);
  if (table.length === 0) return null;
  const chance = LABYRINTH_LOOT_CHANCE[Math.floor(depth)] ?? 0;
  if (makeRng((seed ^ 0x0155ade) >>> 0)() >= chance) return null;
  return rollLabyrinthLootItemId((seed ^ 0x5eed155) >>> 0, table, itemDefinitions);
}

function rewardForDepth(depth: number): LabyrinthReward {
  if (depth >= 3) {
    return { gold: 120, items: [{ itemId: 'magisteel', quantity: 1 }, { itemId: 'spirit-ember', quantity: 1 }] };
  }
  if (depth === 2) {
    return { gold: 70, items: [{ itemId: 'magic-ore', quantity: 2 }] };
  }
  return { gold: 35, items: [{ itemId: 'healing-herb', quantity: 1 }] };
}
