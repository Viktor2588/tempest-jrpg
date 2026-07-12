import { describe, expect, it } from 'vitest';
import {
  act,
  createBattlePartyFromMembers,
  renderView,
  startBattle,
  type BattleView
} from '../src/systems/battle';
import { applyBattleResultToSave, rollBossLoot } from '../src/systems/battleResult';
import { getItemCount } from '../src/systems/inventory';
import {
  decodeInstanceId,
  isEquipmentInstanceId,
  resolveInstanceItem
} from '../src/systems/lootAffix';
import { rarityOf } from '../src/systems/itemRarity';
import { createNewSave } from '../src/systems/save';

// Minimaler BattleView-Stub für die reine Gate-/Determinismus-Prüfung.
function view(overrides: Partial<BattleView>): BattleView {
  return {
    status: 'won',
    party: [],
    enemies: [],
    activeId: null,
    teamMeter: 0,
    log: [],
    rewards: { experience: 0, gold: 0, items: [] },
    inventory: [],
    turn: 0,
    round: 0,
    devouredSourceIds: [],
    field: null,
    ...overrides
  } as BattleView;
}

const boss = (dead: boolean) => ({ boss: true, dead } as unknown as BattleView['enemies'][number]);
const mook = () => ({ boss: false, dead: true } as unknown as BattleView['enemies'][number]);

// Seed, der bei einem Boss-Sieg garantiert einen Drop auslöst (Chance-Wurf trifft).
function seedThatDrops(): number {
  const won = view({ enemies: [boss(true)] });
  for (let seed = 1; seed < 4000; seed += 1) {
    if (rollBossLoot(won, seed) !== null) return seed;
  }
  throw new Error('kein Boss-Drop-Seed gefunden');
}

describe('Phase 157 — Boss-Drops: gerolltes Kern-/Endgame-Loot', () => {
  it('dropt nur bei einem erlegten Boss (nicht bei Trash/Flucht/Niederlage)', () => {
    const seed = seedThatDrops();
    // Erlegter Boss → Drop möglich.
    expect(rollBossLoot(view({ enemies: [boss(true)] }), seed)).not.toBeNull();
    // Kein Boss unter den Gegnern → nie.
    expect(rollBossLoot(view({ enemies: [mook(), mook()] }), seed)).toBeNull();
    // Boss lebt noch (nicht erlegt) → nie.
    expect(rollBossLoot(view({ enemies: [boss(false)] }), seed)).toBeNull();
    // Nicht gewonnen → nie.
    expect(rollBossLoot(view({ status: 'lost', enemies: [boss(true)] }), seed)).toBeNull();
    expect(rollBossLoot(view({ status: 'fled', enemies: [boss(true)] }), seed)).toBeNull();
  });

  it('rollt deterministisch ein kern-lastiges Endgame-Loot hoher Raritaet', () => {
    const seed = seedThatDrops();
    const won = view({ enemies: [boss(true)] });
    const id = rollBossLoot(won, seed)!;
    expect(rollBossLoot(won, seed)).toBe(id); // gleicher Seed → gleiches Ergebnis
    expect(isEquipmentInstanceId(id)).toBe(true);
    const item = resolveInstanceItem(id)!;
    // Tisch ist kern-lastig und ausschliesslich episch/legendaer.
    expect(['episch', 'legendaer']).toContain(rarityOf(item));
    expect(item.equipmentSlot).toBeTruthy();
  });

  it('bewahrt eine gegatete Chance (nicht jeder Boss-Sieg dropt)', () => {
    const won = view({ enemies: [boss(true)] });
    let drops = 0;
    for (let seed = 1; seed <= 400; seed += 1) {
      if (rollBossLoot(won, seed) !== null) drops += 1;
    }
    // 50 % Chance → grob die Hälfte, aber weder 0 noch „immer".
    expect(drops).toBeGreaterThan(120);
    expect(drops).toBeLessThan(280);
  });

  it('bankt das gerollte Boss-Loot nur mit Option und nur bei Boss-Sieg', () => {
    const seed = seedThatDrops();
    const save = createNewSave({ seed, now: '2026-07-12T12:00:00.000Z' });
    // Boss-Kampf: ifrit ist ein echter Boss-Gegner (boss: true).
    const battle = startBattle({
      party: createBattlePartyFromMembers(save.party.active),
      enemyIds: ['ifrit'],
      inventory: save.inventory.stacks,
      seed
    });
    const rimuru = battle.combatants.find((c) => c.side === 'party')!;
    for (const foe of battle.combatants.filter((c) => c.side === 'enemy')) {
      foe.hp = 1;
    }
    battle.activeId = rimuru.id;
    rimuru.ct = 100;
    // Alle Boss-Gegner erledigen, bis der Kampf gewonnen ist.
    let guard = 0;
    while (battle.status === 'active' && guard < 12) {
      const foe = battle.combatants.find((c) => c.side === 'enemy' && !c.dead);
      if (!foe) break;
      battle.activeId = rimuru.id;
      rimuru.ct = 100;
      foe.hp = 1;
      act(battle, { type: 'attack', targetId: foe.id });
      guard += 1;
    }
    expect(battle.status).toBe('won');
    const v = renderView(battle);
    expect(v.enemies.some((e) => e.boss && e.dead)).toBe(true);

    const expectedId = rollBossLoot(v, seed)!;
    // Ohne Option: kein gerolltes Item.
    const plain = applyBattleResultToSave(save, v);
    expect(plain.inventory.stacks.some((s) => isEquipmentInstanceId(s.itemId))).toBe(false);
    // Mit Option: die deterministisch gerollte Instanz ist gebankt.
    const looted = applyBattleResultToSave(save, v, { bossLoot: { seed } });
    expect(getItemCount(looted.inventory.stacks, expectedId)).toBe(1);
    // Und es ist eine echte, ausruestbare Gear-Instanz aus dem Boss-Tisch.
    expect(decodeInstanceId(expectedId)).not.toBeNull();
  });
});
