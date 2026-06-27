import { describe, expect, it } from 'vitest';
import { createInitialInventory, getItemCount } from '../src/systems/inventory';
import { createInitialParty } from '../src/systems/party';
import {
  buildMenuView,
  calculateMemberStats,
  equipItem,
  getMemberSkillDefinitions,
  MENU_TOUCH_TARGET_PX,
  unequipItem,
  useItem,
  type MenuGameState
} from '../src/systems/menu';

function stateWithInventory(itemId: string): MenuGameState {
  return {
    party: createInitialParty(),
    inventory: [...createInitialInventory(), { itemId, quantity: 1 }],
    gold: 120
  };
}

describe('menu system', () => {
  it('berechnet Ausrüstungswerte und tauscht Items zwischen Inventar und Slot', () => {
    const initial = stateWithInventory('tempest-training-sword');
    const rimuruBefore = initial.party.find((member) => member.characterId === 'rimuru')!;
    const attackBefore = calculateMemberStats(rimuruBefore).attack;

    const equipped = equipItem(initial, 'rimuru', 'tempest-training-sword');

    expect(equipped.ok).toBe(true);
    const rimuruAfter = equipped.state.party.find((member) => member.characterId === 'rimuru')!;
    expect(rimuruAfter.equipment.weapon).toBe('tempest-training-sword');
    expect(calculateMemberStats(rimuruAfter).attack).toBe(attackBefore + 4);
    expect(getItemCount(equipped.state.inventory, 'tempest-training-sword')).toBe(0);

    const unequipped = unequipItem(equipped.state, 'rimuru', 'weapon');
    expect(unequipped.ok).toBe(true);
    expect(getItemCount(unequipped.state.inventory, 'tempest-training-sword')).toBe(1);
  });

  it('verbraucht Heilitems und begrenzt LP am berechneten Maximum', () => {
    const [rimuru, ...rest] = createInitialParty();
    const damaged = { ...rimuru!, currentHp: 10 };
    const state: MenuGameState = {
      party: [damaged, ...rest],
      inventory: createInitialInventory(),
      gold: 0
    };

    const result = useItem(state, 'healing-herb', 'rimuru');

    expect(result.ok).toBe(true);
    const healed = result.state.party.find((member) => member.characterId === 'rimuru')!;
    expect(healed.currentHp).toBe(50);
    expect(getItemCount(result.state.inventory, 'healing-herb')).toBe(4);
  });

  it('sortiert Inventar nach Nutzbarkeit/Ausrüstung und Namen für schnelle Menüwege', () => {
    const view = buildMenuView({
      party: createInitialParty(),
      inventory: [
        { itemId: 'tempest-charm', quantity: 1 },
        { itemId: 'mana-drop', quantity: 1 },
        { itemId: 'healing-herb', quantity: 1 },
        { itemId: 'traveler-cloak', quantity: 1 }
      ],
      gold: 0
    });

    expect(view.inventory.map((entry) => entry.item.id)).toEqual([
      'healing-herb',
      'mana-drop',
      'traveler-cloak',
      'tempest-charm'
    ]);
  });

  it('berechnet gefaltete Klassenwerte und innewohnenden Skillzugriff deterministisch', () => {
    const gobta = createInitialParty().find((member) => member.characterId === 'gobta')!;
    const stats = calculateMemberStats(gobta);
    const skills = getMemberSkillDefinitions(gobta).map((skill) => skill.id);

    // gefaltete Frontkämpfer-Basis (Lv.1: maxHp 99, agility 16) + Ausrüstung
    expect(stats.maxHp).toBeGreaterThanOrEqual(99);
    expect(stats.agility).toBeGreaterThanOrEqual(16);
    // ehemaliger Vorhut-Klassenskill ist jetzt Teil des Startkits
    expect(skills).toContain('battle-cry');
    expect(skills).toContain('goblin-feint');
  });

  it('erzwingt mindestens 44px Touch-Ziele für Menübuttons', () => {
    expect(MENU_TOUCH_TARGET_PX).toBeGreaterThanOrEqual(44);
  });
});
