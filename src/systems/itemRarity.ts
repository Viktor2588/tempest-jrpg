// Phase 149 — Raritaet/Tier-Fundament. Reine Regeln + Metadaten für die
// Ausruestungs-Raritaet (D3-artig): Farbe/Label fürs Menue, Stat-/Enchant-Budgets
// als Grundlage für kuratiertes Loot (Phase 151/152). Ändert bestehende Items NICHT
// (Retrofit ist reine Klassifizierung); die Budgets sind vorwärtsgerichtet für
// generierte/neue Ausruestung.
import type { ItemDefinition, ItemRarity } from '../data/types';

export interface ItemRarityMeta {
  readonly id: ItemRarity;
  readonly label: string;
  readonly color: string;
  // Rang in der Raritaets-Leiter (0 = niedrigste).
  readonly order: number;
  // Vorwärtsgerichtete Loot-Budgets: Multiplikator auf Basis-statBonus und
  // maximaler Verzauberungs-Level für generierte Ausruestung dieser Raritaet.
  readonly statMultiplier: number;
  readonly enchantCap: number;
}

// Reihenfolge = aufsteigende Leiter.
export const ITEM_RARITIES: readonly ItemRarityMeta[] = [
  { id: 'gewoehnlich', label: 'Gewöhnlich', color: '#b8c0cc', order: 0, statMultiplier: 1, enchantCap: 3 },
  { id: 'selten', label: 'Selten', color: '#4aa3ff', order: 1, statMultiplier: 1.15, enchantCap: 4 },
  { id: 'episch', label: 'Episch', color: '#b46bff', order: 2, statMultiplier: 1.35, enchantCap: 5 },
  { id: 'legendaer', label: 'Legendär', color: '#ff9d3c', order: 3, statMultiplier: 1.6, enchantCap: 6 },
  { id: 'legendaer-set', label: 'Legendär-Set', color: '#46c771', order: 4, statMultiplier: 1.5, enchantCap: 5 }
];

const RARITY_BY_ID = new Map<ItemRarity, ItemRarityMeta>(ITEM_RARITIES.map((meta) => [meta.id, meta]));

export const DEFAULT_ITEM_RARITY: ItemRarity = 'gewoehnlich';

export function rarityMeta(rarity: ItemRarity): ItemRarityMeta {
  return RARITY_BY_ID.get(rarity) ?? RARITY_BY_ID.get(DEFAULT_ITEM_RARITY)!;
}

// Effektive Raritaet eines Items (fehlt → gewoehnlich).
export function rarityOf(item: Pick<ItemDefinition, 'rarity'>): ItemRarity {
  return item.rarity ?? DEFAULT_ITEM_RARITY;
}

export function rarityColor(rarity: ItemRarity): string {
  return rarityMeta(rarity).color;
}

export function rarityLabel(rarity: ItemRarity): string {
  return rarityMeta(rarity).label;
}

export function rarityOrder(rarity: ItemRarity): number {
  return rarityMeta(rarity).order;
}

export function rarityStatMultiplier(rarity: ItemRarity): number {
  return rarityMeta(rarity).statMultiplier;
}

export function rarityEnchantCap(rarity: ItemRarity): number {
  return rarityMeta(rarity).enchantCap;
}

// D3-Legendary: einzigartig mit genau einem Signatur-Perk.
export function isLegendaryUnique(rarity: ItemRarity): boolean {
  return rarity === 'legendaer';
}

// Ein `legendaer`-Item muss genau EINEN Signatur-Perk tragen.
export function legendaryHasSignaturePerk(item: ItemDefinition): boolean {
  return rarityOf(item) !== 'legendaer' || (item.perks?.length ?? 0) === 1;
}
