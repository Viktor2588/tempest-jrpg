import { describe, expect, it } from 'vitest';
import { HEROES } from '../src/data';
import { createPartyMember } from '../src/systems/party';
import { equipmentStatDelta } from '../src/systems/menu';
import { encodeInstanceId } from '../src/systems/lootAffix';

function rimuru() {
  const hero = HEROES.find((h) => h.id === 'rimuru')!;
  const base = createPartyMember(hero);
  return { ...base, equipment: { weapon: null, armor: null, accessory: null, core: null } };
}

describe('Phase 158 — Ausruestungs-Vergleich (Stat-Delta)', () => {
  it('bei leerem Slot ist das Delta der volle Kandidaten-Bonus', () => {
    // orc-cleaver: attack +11.
    const deltas = equipmentStatDelta(rimuru(), 'orc-cleaver');
    const attack = deltas.find((d) => d.stat === 'attack')!;
    expect(attack.delta).toBe(11);
    // Nur geaenderte Stats werden gelistet.
    expect(deltas.every((d) => d.delta !== 0)).toBe(true);
  });

  it('vergleicht Kandidat gegen das aktuell getragene Teil (Vorzeichen korrekt)', () => {
    // Getragen: spirit-oak-staff (magic +9, maxMp +6). Kandidat: orc-cleaver (attack +11).
    const member = { ...rimuru(), equipment: { weapon: 'spirit-oak-staff', armor: null, accessory: null, core: null } };
    const deltas = equipmentStatDelta(member, 'orc-cleaver');
    const byStat = Object.fromEntries(deltas.map((d) => [d.stat, d.delta]));
    expect(byStat.attack).toBe(11);   // 11 - 0
    expect(byStat.magic).toBe(-9);    // 0 - 9 (Verlust)
    expect(byStat.maxMp).toBe(-6);    // 0 - 6 (Verlust)
  });

  it('gibt fuer nicht-ausruestbare Items ein leeres Delta', () => {
    expect(equipmentStatDelta(rimuru(), 'healing-herb')).toEqual([]);
    expect(equipmentStatDelta(rimuru(), 'unbekannt')).toEqual([]);
  });

  it('loest Loot-Instanzen korrekt auf (Basis + Affixe)', () => {
    // ward-talisman (spirit +4, maxHp +8) + Affixe keen(attack+4), vital(maxHp+10).
    const id = encodeInstanceId({ baseItemId: 'ward-talisman', affixIds: ['keen', 'vital'] });
    const deltas = equipmentStatDelta(rimuru(), id);
    const byStat = Object.fromEntries(deltas.map((d) => [d.stat, d.delta]));
    expect(byStat.attack).toBe(4);
    expect(byStat.spirit).toBe(4);
    expect(byStat.maxHp).toBe(18); // Basis 8 + Affix 10
  });
});
