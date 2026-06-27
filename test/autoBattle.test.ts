import { describe, it, expect } from 'vitest';
import { chooseAutoAction } from '../src/systems/autoBattle';
import {
  act, enemyTurn, isPlayerTurn, renderView, startBattle, createDefaultBattleParty
} from '../src/systems/battle';
import { ENEMIES } from '../src/data';

const ENEMY_IDS = ENEMIES.map((e) => e.id);

// Spielt einen Kampf vollautomatisch: Spielerzüge via chooseAutoAction, Gegner via enemyTurn.
function autoRun(seed: number, enemyIds: string[]) {
  const state = startBattle({ party: createDefaultBattleParty(), enemyIds, seed });
  let guard = 0;
  while (renderView(state).status === 'active' && guard++ < 5000) {
    if (isPlayerTurn(state)) {
      const action = chooseAutoAction(state);
      if (!action) break;
      act(state, action);
    } else {
      enemyTurn(state);
    }
  }
  return { status: renderView(state).status, steps: guard };
}

describe('autoBattle', () => {
  it('liefert für die aktive Party-Einheit eine gültige Aktion', () => {
    const state = startBattle({ party: createDefaultBattleParty(), enemyIds: ['forest-slime'], seed: 7 });
    if (isPlayerTurn(state)) {
      const action = chooseAutoAction(state);
      expect(action).toBeTruthy();
      expect(['attack', 'skill']).toContain(action!.type);
    }
  });

  it('nutzt Heilitems automatisch, wenn kein Heilskill verfügbar ist', () => {
    const state = startBattle({
      party: createDefaultBattleParty(),
      enemyIds: ['forest-slime'],
      inventory: [{ itemId: 'healing-herb', quantity: 1 }],
      seed: 8
    });
    const hero = state.combatants.find((combatant) => combatant.side === 'party')!;
    hero.hp = Math.floor(hero.maxHp * 0.25);
    state.activeId = hero.id;

    expect(chooseAutoAction(state)).toEqual({
      type: 'item',
      itemId: 'healing-herb',
      targetId: hero.id
    });
  });

  it('beendet Kämpfe deterministisch und gewinnt gegen schwache Gegner', () => {
    const a = autoRun(5, ['forest-slime', 'forest-slime']);
    const b = autoRun(5, ['forest-slime', 'forest-slime']);
    expect(a.status).toBe('won');
    expect(a.status).toBe(b.status);
    expect(a.steps).toBe(b.steps); // deterministisch
  });

  it('terminiert über eine Stichprobe ohne Hänger', () => {
    for (let i = 0; i < ENEMY_IDS.length; i++) {
      const out = autoRun(11 + i * 7, [ENEMY_IDS[i]!, ENEMY_IDS[(i + 1) % ENEMY_IDS.length]!]);
      expect(['won', 'lost', 'fled']).toContain(out.status);
      expect(out.steps).toBeLessThan(5000);
    }
  });
});
