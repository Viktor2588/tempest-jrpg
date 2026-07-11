import { describe, expect, it } from 'vitest';
import { HEROES } from '../src/data';
import type { CharacterDefinition, ItemDefinition } from '../src/data';
import { ITEMS } from '../src/data/items';
import { createPartyMember } from '../src/systems/party';
import { calculateEquipmentBonus, EQUIPMENT_SLOTS } from '../src/systems/menu';
import { equipmentPerksForMember } from '../src/systems/progression';
import { createNewSave, exportSave, importSave } from '../src/systems/save';

const hero = (id: string): CharacterDefinition => HEROES.find((entry) => entry.id === id)!;

describe('Kern-Slot (Phase 150)', () => {
  it('EQUIPMENT_SLOTS enthält den Kern-Slot und neue Mitglieder haben ihn (leer)', () => {
    expect(EQUIPMENT_SLOTS).toContain('core');
    const member = createPartyMember(hero('gobta'), { level: 6 });
    expect(member.equipment.core).toBeNull();
  });

  it('ein ausgerüsteter Magicule-Kern trägt seine Stat-Boni bei', () => {
    const member = createPartyMember(hero('gobta'), { level: 6 });
    const withCore = { ...member, equipment: { ...member.equipment, core: 'lesser-magicule-core' } };
    const bonus = calculateEquipmentBonus(withCore);
    expect(bonus.maxMp ?? 0).toBeGreaterThanOrEqual(6);
    expect(bonus.spirit ?? 0).toBeGreaterThanOrEqual(2);
    // Ohne Kern kein Kern-Bonus.
    const bare = calculateEquipmentBonus({ ...member, equipment: { ...member.equipment, core: null } });
    expect((bonus.maxMp ?? 0)).toBeGreaterThan(bare.maxMp ?? 0);
  });

  it('der legendäre Seelenkern verleiht seinen Signatur-Perk über die Party-Montage', () => {
    const member = createPartyMember(hero('gobta'), { level: 6 });
    const withCore = { ...member, equipment: { ...member.equipment, core: 'soul-forged-core' } };
    const perks = equipmentPerksForMember(withCore);
    expect(perks.some((perk) => perk.kind === 'status-resist')).toBe(true);
  });

  it('die Kern-Items sind sauber deklariert (Slot/Kategorie/Raritaet, massvolle Boni)', () => {
    const cores = (ITEMS as unknown as readonly ItemDefinition[]).filter((entry) => entry.equipmentSlot === 'core');
    expect(cores.length).toBeGreaterThanOrEqual(3);
    for (const entry of cores) {
      expect(entry.category).toBe('core');
      expect(entry.rarity).toBeDefined();
      expect(entry.stackable).toBe(false);
      // Massvolle Boni: kein einzelner Stat-Bonus über 20.
      for (const value of Object.values(entry.statBonus ?? {})) {
        expect(value).toBeLessThanOrEqual(20);
      }
    }
  });

  it('Save-Roundtrip erhält einen ausgerüsteten Kern; Altstände ohne core migrieren zu null', () => {
    const base = createNewSave();
    // Kern auf das erste aktive Mitglied setzen und roundtrippen.
    const equipped = {
      ...base,
      party: {
        ...base.party,
        active: base.party.active.map((member, index) =>
          index === 0 ? { ...member, equipment: { ...member.equipment, core: 'ember-magicule-core' } } : member
        )
      }
    };
    const loaded = importSave(exportSave(equipped), '2026-07-11T10:00:00.000Z');
    expect(loaded.party.active[0]!.equipment.core).toBe('ember-magicule-core');

    // Altstand ohne `core`-Feld → Migration setzt null (keine Bruchgefahr).
    const raw = JSON.parse(exportSave(base)) as Record<string, unknown>;
    const party = raw.party as { active: Array<{ equipment: Record<string, unknown> }> };
    for (const member of party.active) delete member.equipment.core;
    const migrated = importSave(JSON.stringify(raw), '2026-07-11T10:05:00.000Z');
    expect(migrated.party.active[0]!.equipment.core).toBeNull();
  });
});
