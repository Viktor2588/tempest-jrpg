import { describe, expect, it } from 'vitest';
import { getSortedInventory } from '../src/systems/menu';
import {
  encodeInstanceId,
  instanceAffixLabels,
  resolveInstanceDefinition
} from '../src/systems/lootAffix';

describe('Phase 156 — Instanz-Anzeige im Menue', () => {
  it('schluesselt die gerollten Affix-Labels einer Instanz-Id auf', () => {
    const id = encodeInstanceId({ baseItemId: 'ward-talisman', affixIds: ['keen', 'vital'] });
    expect(instanceAffixLabels(id)).toEqual(['scharf', 'vital']);
    // Statische Item-Ids / Unbekanntes → keine Affixe.
    expect(instanceAffixLabels('ward-talisman')).toEqual([]);
    expect(instanceAffixLabels('loot|ward-talisman|')).toEqual([]);
  });

  it('haelt den Instanz-Namen sauber (Basis-Name, Affixe getrennt)', () => {
    const def = resolveInstanceDefinition({ baseItemId: 'ward-talisman', affixIds: ['keen', 'vital'] })!;
    // Kein Affix-Suffix mehr im Namen — die Affixe kommen als eigene Detailzeile.
    expect(def.name).toBe('Schutztalisman');
    expect(def.name).not.toContain('(');
  });

  it('reicht Raritaet + Affix-Labels an Instanz-Inventar-Eintraegen durch', () => {
    const id = encodeInstanceId({ baseItemId: 'ward-talisman', affixIds: ['keen', 'vital'] });
    const view = getSortedInventory([{ itemId: id, quantity: 1 }]);
    expect(view).toHaveLength(1);
    const entry = view[0]!;
    // ward-talisman ist legendaer → die Instanz erbt die Basis-Raritaet.
    expect(entry.rarity).toBe('legendaer');
    expect(entry.affixLabels).toEqual(['scharf', 'vital']);
    expect(entry.equipSlot).toBe('accessory');
  });

  it('laesst statische Items unveraendert (Raritaet gesetzt, Affixe leer)', () => {
    const view = getSortedInventory([{ itemId: 'healing-herb', quantity: 3 }]);
    const herb = view.find((entry) => entry.item.id === 'healing-herb')!;
    expect(herb.rarity).toBe('gewoehnlich');
    expect(herb.affixLabels).toEqual([]);
    // Ein statisches Ausruestungsteil traegt seine deklarierte Raritaet, aber keine Affixe.
    const gear = getSortedInventory([{ itemId: 'orc-cleaver', quantity: 1 }])[0]!;
    expect(gear.rarity).toBe('selten');
    expect(gear.affixLabels).toEqual([]);
  });
});
