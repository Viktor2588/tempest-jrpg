import { describe, expect, it } from 'vitest';
import {
  labyrinthLootTableForDepth,
  rollLabyrinthFloorLoot
} from '../src/systems/labyrinth';
import {
  decodeInstanceId,
  isEquipmentInstanceId,
  resolveInstanceItem
} from '../src/systems/lootAffix';
import {
  act,
  createBattlePartyFromMembers,
  renderView,
  startBattle
} from '../src/systems/battle';
import { applyBattleResultToSave } from '../src/systems/battleResult';
import { getItemCount } from '../src/systems/inventory';
import { rarityOf } from '../src/systems/itemRarity';
import { createNewSave } from '../src/systems/save';

// Deterministischer Seed, der auf jeder Tiefe einen Drop auslöst (Chance-Wurf trifft).
function seedThatDrops(depth: number): number {
  for (let seed = 1; seed < 4000; seed += 1) {
    if (rollLabyrinthFloorLoot(seed, depth) !== null) return seed;
  }
  throw new Error(`kein Drop-Seed für Tiefe ${depth} gefunden`);
}

describe('Phase 155 — Labyrinth-Etagen-Loot', () => {
  it('liefert kuratierte, mit der Tiefe steigende Basis-Tische', () => {
    expect(labyrinthLootTableForDepth(1)).toContain('lesser-magicule-core');
    expect(labyrinthLootTableForDepth(2)).toContain('ember-magicule-core');
    expect(labyrinthLootTableForDepth(3)).toContain('soul-forged-core');
    // Tiefe 3 lotet ausschliesslich Legendaeres.
    for (const baseId of labyrinthLootTableForDepth(3)) {
      const item = resolveInstanceItem(`loot|${baseId}|`)!;
      expect(rarityOf(item)).toBe('legendaer');
    }
    // Ausserhalb 1..3 gibt es keinen Tisch (kein Roll).
    expect(labyrinthLootTableForDepth(0)).toHaveLength(0);
    expect(labyrinthLootTableForDepth(9)).toHaveLength(0);
  });

  it('rollt deterministisch aus dem Seed und kodiert eine echte Gear-Instanz', () => {
    const depth = 2;
    const seed = seedThatDrops(depth);
    const id = rollLabyrinthFloorLoot(seed, depth)!;
    // Gleicher Seed → gleiches Ergebnis (deterministisch).
    expect(rollLabyrinthFloorLoot(seed, depth)).toBe(id);
    expect(isEquipmentInstanceId(id)).toBe(true);
    const instance = decodeInstanceId(id)!;
    expect(labyrinthLootTableForDepth(depth)).toContain(instance.baseItemId);
    // Aufgeloest ist es ausruestbares Gear mit den gerollten Affixen (episch → 2 Affixe).
    const item = resolveInstanceItem(id)!;
    expect(item.equipmentSlot).toBeTruthy();
    expect(instance.affixIds.length).toBe(2);
  });

  it('bewahrt eine gedeckelte Drop-Chance (nicht jeder Kampf lotet)', () => {
    let drops = 0;
    for (let seed = 1; seed <= 400; seed += 1) {
      if (rollLabyrinthFloorLoot(seed, 1) !== null) drops += 1;
    }
    // Tiefe 1 hat 15 % Chance — deutlich unter „jeder Kampf".
    expect(drops).toBeGreaterThan(0);
    expect(drops).toBeLessThan(160);
  });

  it('bankt die gerollte Instanz nur bei Labyrinth-Sieg ins Inventar', () => {
    const depth = 3;
    const seed = seedThatDrops(depth);
    const save = createNewSave({ seed, now: '2026-07-12T10:00:00.000Z' });
    const battle = startBattle({
      party: createBattlePartyFromMembers(save.party.active),
      enemyIds: ['spore-moth'],
      inventory: save.inventory.stacks,
      seed
    });
    const rimuru = battle.combatants.find((c) => c.side === 'party')!;
    const foe = battle.combatants.find((c) => c.side === 'enemy')!;
    battle.activeId = rimuru.id;
    rimuru.ct = 100;
    foe.hp = 1;
    expect(act(battle, { type: 'attack', targetId: foe.id }).ok).toBe(true);
    expect(battle.status).toBe('won');
    const view = renderView(battle);

    // Ohne labyrinthLoot-Option: kein gerolltes Item.
    const plain = applyBattleResultToSave(save, view);
    expect(plain.inventory.stacks.some((s) => isEquipmentInstanceId(s.itemId))).toBe(false);

    // Mit Option: die deterministisch gerollte Instanz ist gebankt.
    const expectedId = rollLabyrinthFloorLoot(seed, depth)!;
    const looted = applyBattleResultToSave(save, view, { labyrinthLoot: { seed, depth } });
    expect(getItemCount(looted.inventory.stacks, expectedId)).toBe(1);
  });

  it('bankt nichts bei Niederlage', () => {
    const depth = 3;
    const seed = seedThatDrops(depth);
    const save = createNewSave({ seed, now: '2026-07-12T10:00:00.000Z' });
    const battle = startBattle({
      party: createBattlePartyFromMembers(save.party.active),
      enemyIds: ['spore-moth'],
      inventory: save.inventory.stacks,
      seed
    });
    for (const c of battle.combatants.filter((x) => x.side === 'party')) {
      c.hp = 0;
      c.dead = true;
    }
    battle.status = 'lost';
    const view = renderView(battle);
    const result = applyBattleResultToSave(save, view, { labyrinthLoot: { seed, depth } });
    expect(result.inventory.stacks.some((s) => isEquipmentInstanceId(s.itemId))).toBe(false);
  });
});
