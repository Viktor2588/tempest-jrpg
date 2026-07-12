// Phase 151 — Loot mit FESTEN Affix-Pools pro Raritaet (Labyrinth-Loot).
// Statt freier Zufalls-Rolls hat JEDE Raritaet einen festen, kuratierten Affix-Pool;
// ein Drop waehlt daraus DETERMINISTISCH (aus dem Run-Seed) die zur Raritaet passende
// Anzahl Affixe. Ein Affix ist ein wiederverwendeter `statBonus`-/`TalentPerk`-Baustein
// aus einem endlichen Katalog — KEIN freies Stat-Rollen. Eine leichte, NICHT-stapelbare
// Ausruestungs-Instanz speichert nur Basis-Item-Id + gewaehlte Affix-Ids (als String-Id
// kodiert), damit sie ohne Save-Migration in `equipment[slot]`/Inventar leben kann.
// Rein/funktional, Phaser-frei, headless testbar.
import type { ItemDefinition, ItemRarity, StatBlock, TalentPerk } from '../data/types';
import { ITEMS } from '../data';
import { addPartialStats } from './stats';
import { rarityOf } from './itemRarity';
import { makeRng } from './rng';

export interface AffixDefinition {
  readonly id: string;
  readonly label: string;
  readonly statBonus?: Partial<StatBlock>;
  readonly perk?: TalentPerk;
}

// Endlicher, kuratierter Affix-Katalog (Stat-Bausteine + wenige Perk-Bausteine).
export const AFFIXES: readonly AffixDefinition[] = [
  { id: 'keen', label: 'scharf', statBonus: { attack: 4 } },
  { id: 'guarded', label: 'gehärtet', statBonus: { defense: 4 } },
  { id: 'arcane', label: 'arkan', statBonus: { magic: 4 } },
  { id: 'vital', label: 'vital', statBonus: { maxHp: 10 } },
  { id: 'swift', label: 'flink', statBonus: { agility: 4 } },
  { id: 'spirited', label: 'beseelt', statBonus: { spirit: 4 } },
  { id: 'mana-rich', label: 'manareich', statBonus: { maxMp: 6 } },
  // Perk-Affixe (Signatur-Bausteine fuer hoehere Raritaeten).
  { id: 'reactive', label: 'reaktiv', perk: { kind: 'counter', percent: 6 } },
  { id: 'evasive', label: 'ausweichend', perk: { kind: 'dodge', percent: 5 } },
  { id: 'warding', label: 'schirmend', perk: { kind: 'status-resist', percent: 15 } }
];

const AFFIX_BY_ID = new Map<string, AffixDefinition>(AFFIXES.map((affix) => [affix.id, affix]));

export function affixById(id: string): AffixDefinition | undefined {
  return AFFIX_BY_ID.get(id);
}

const STAT_AFFIX_IDS = AFFIXES.filter((affix) => affix.statBonus).map((affix) => affix.id);
const PERK_AFFIX_IDS = AFFIXES.filter((affix) => affix.perk).map((affix) => affix.id);

interface RarityAffixPlan {
  readonly poolAffixIds: readonly string[];
  readonly count: number;
}

// Feste Pools + Anzahl je Raritaet. `gewoehnlich` = keine Affixe (Basis-Item);
// hoehere Raritaeten ziehen mehr, `legendaer` mischt Perk-Bausteine in den Pool
// (Signatur-Perk kommt so mit ins Roll).
const RARITY_PLAN: Readonly<Record<ItemRarity, RarityAffixPlan>> = {
  gewoehnlich: { poolAffixIds: [], count: 0 },
  selten: { poolAffixIds: STAT_AFFIX_IDS, count: 1 },
  episch: { poolAffixIds: STAT_AFFIX_IDS, count: 2 },
  legendaer: { poolAffixIds: [...PERK_AFFIX_IDS, ...STAT_AFFIX_IDS], count: 2 },
  'legendaer-set': { poolAffixIds: STAT_AFFIX_IDS, count: 1 }
};

export function affixPoolFor(rarity: ItemRarity): readonly AffixDefinition[] {
  return RARITY_PLAN[rarity].poolAffixIds.flatMap((id) => {
    const affix = AFFIX_BY_ID.get(id);
    return affix ? [affix] : [];
  });
}

export function affixCountFor(rarity: ItemRarity): number {
  return RARITY_PLAN[rarity].count;
}

export interface EquipmentInstance {
  readonly baseItemId: string;
  readonly affixIds: readonly string[];
}

// Deterministische, NICHT-wiederholende Auswahl der zur Raritaet passenden Zahl Affixe
// aus ihrem festen Pool (aus dem Seed). Reihenfolge der gewaehlten Ids ist deterministisch.
export function rollEquipmentInstance(
  seed: number,
  baseItemId: string,
  itemDefinitions: readonly ItemDefinition[] = ITEMS
): EquipmentInstance {
  const base = itemDefinitions.find((item) => item.id === baseItemId);
  const rarity = base ? rarityOf(base) : 'gewoehnlich';
  const plan = RARITY_PLAN[rarity];
  const pool = [...plan.poolAffixIds];
  const count = Math.min(plan.count, pool.length);
  const rng = makeRng(seed);
  const affixIds: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const index = Math.floor(rng() * pool.length);
    affixIds.push(pool.splice(index, 1)[0]!);
  }
  return { baseItemId, affixIds };
}

const INSTANCE_PREFIX = 'loot|';

// Kodierung: `loot|<baseId>|<affix1>,<affix2>` — baseId/affixIds sind kebab-case
// ([a-z0-9-]), daher kollidieren die Trenner `|`/`,` nie mit den Ids.
export function encodeInstanceId(instance: EquipmentInstance): string {
  return `${INSTANCE_PREFIX}${instance.baseItemId}|${instance.affixIds.join(',')}`;
}

export function isEquipmentInstanceId(id: string): boolean {
  return id.startsWith(INSTANCE_PREFIX);
}

export function decodeInstanceId(id: string): EquipmentInstance | null {
  if (!isEquipmentInstanceId(id)) return null;
  const rest = id.slice(INSTANCE_PREFIX.length);
  const sep = rest.indexOf('|');
  if (sep < 0) return null;
  const baseItemId = rest.slice(0, sep);
  if (baseItemId.length === 0) return null;
  const affixPart = rest.slice(sep + 1);
  const affixIds = affixPart.length > 0 ? affixPart.split(',') : [];
  return { baseItemId, affixIds };
}

// Synthetisiert die ItemDefinition einer Instanz: Basis-Item + Affix-Boni/-Perks.
// Instanzen gehoeren KEINEM Set an (Set-Boni kommen aus festen Set-Teilen) und sind
// nicht stapelbar. Gibt null zurueck, wenn das Basis-Item unbekannt oder kein Gear ist.
export function resolveInstanceDefinition(
  instance: EquipmentInstance,
  itemDefinitions: readonly ItemDefinition[] = ITEMS
): ItemDefinition | null {
  const base = itemDefinitions.find((item) => item.id === instance.baseItemId);
  if (!base?.equipmentSlot) return null;
  const affixes = instance.affixIds.flatMap((id) => {
    const affix = AFFIX_BY_ID.get(id);
    return affix ? [affix] : [];
  });
  const statBonus = affixes.reduce<Partial<StatBlock>>(
    (bonus, affix) => addPartialStats(bonus, affix.statBonus ?? {}),
    { ...(base.statBonus ?? {}) }
  );
  const perks: TalentPerk[] = [
    ...(base.perks ?? []),
    ...affixes.flatMap((affix) => (affix.perk ? [affix.perk] : []))
  ];
  const affixSuffix = affixes.length > 0 ? ` (${affixes.map((a) => a.label).join(', ')})` : '';
  return {
    ...base,
    id: encodeInstanceId(instance),
    name: `${base.name}${affixSuffix}`,
    stackable: false,
    // Instanzen zaehlen nicht fuer Set-Boni und tragen keine eigene Verzauberung.
    equipmentSetId: undefined,
    enchantment: undefined,
    statBonus,
    perks: perks.length > 0 ? perks : undefined
  };
}

// Zentraler Resolver: statisches Item ODER (bei einer kodierten Instanz-Id) die
// synthetisierte Instanz-Definition. Fuer bestehende Ids identisch zum Direktzugriff.
export function resolveInstanceItem(
  id: string,
  itemDefinitions: readonly ItemDefinition[] = ITEMS
): ItemDefinition | undefined {
  if (!isEquipmentInstanceId(id)) return undefined;
  const instance = decodeInstanceId(id);
  return instance ? resolveInstanceDefinition(instance, itemDefinitions) ?? undefined : undefined;
}

// Deterministischer Labyrinth-Drop: waehlt aus dem Run-Seed + Etage eine Basis-Gear-Id
// aus dem uebergebenen Loot-Tisch und rollt ihre Affixe → kodierte Instanz-Id (als
// Inventar-Item nutzbar). Rein; die tatsaechliche Vergabe im Kampf-/Etagen-Fluss wird
// separat angebunden.
export function rollLabyrinthLootItemId(
  seed: number,
  lootTable: readonly string[],
  itemDefinitions: readonly ItemDefinition[] = ITEMS
): string | null {
  if (lootTable.length === 0) return null;
  const rng = makeRng(seed);
  const baseItemId = lootTable[Math.floor(rng() * lootTable.length)]!;
  // Affix-Roll nutzt einen abgeleiteten, aber deterministischen Seed.
  const instance = rollEquipmentInstance((seed ^ 0x9e3779b9) >>> 0, baseItemId, itemDefinitions);
  return encodeInstanceId(instance);
}
