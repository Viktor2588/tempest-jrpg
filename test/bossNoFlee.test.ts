import { describe, expect, it } from 'vitest';
import { act, enemyTurn, isPlayerTurn, renderView, startBattle } from '../src/systems/battle';
import { fastTank } from './battleHelpers';

describe('Flucht aus dem Bosskampf', () => {
  it('scheitert gegen einen Boss und kostet nur den Zug', () => {
    const state = startBattle({ party: fastTank(), enemyIds: ['orc-disaster'], seed: 4242 });
    expect(renderView(state).enemies.some((enemy) => enemy.boss)).toBe(true);

    let guard = 0;
    while (state.status === 'active' && guard++ < 60) {
      if (isPlayerTurn(state)) act(state, { type: 'flee' });
      else enemyTurn(state);
      expect(state.status).not.toBe('fled');
    }
  });

  it('bleibt gegen gewoehnliche Gegner moeglich', () => {
    let fled = false;
    for (let seed = 1; seed <= 40 && !fled; seed += 1) {
      const state = startBattle({ party: fastTank(), enemyIds: ['forest-slime'], seed });
      let guard = 0;
      while (state.status === 'active' && guard++ < 20) {
        if (isPlayerTurn(state)) act(state, { type: 'flee' });
        else enemyTurn(state);
      }
      fled = state.status === 'fled';
    }
    expect(fled).toBe(true);
  });
});
