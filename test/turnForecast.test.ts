import { describe, expect, it } from 'vitest';
import { act, renderView, startBattle, turnForecast } from '../src/systems/battle';
import { fastTank } from './battleHelpers';

const unit = (id: string, agility: number, side: 'party' | 'enemy') => ({
  sourceId: id,
  name: id,
  side,
  level: 5,
  stats: { maxHp: 200, maxMp: 30, attack: 10, defense: 10, magic: 10, spirit: 10, agility },
  element: 'neutral' as const,
  weaknesses: [],
  resistances: [],
  skillIds: []
});

describe('Zeitleisten-Vorschau', () => {
  it('reiht die Schnellen oefter ein als die Langsamen', () => {
    const state = startBattle({
      party: [unit('flink', 60, 'party')],
      enemies: [unit('traege', 20, 'enemy')],
      seed: 7
    });
    state.combatants.forEach((combatant) => { combatant.ct = 0; });

    const forecast = turnForecast(state, 8).map((entry) => entry.name);
    expect(forecast).toHaveLength(8);
    expect(forecast.filter((name) => name === 'flink').length)
      .toBeGreaterThan(forecast.filter((name) => name === 'traege').length);
  });

  it('zieht einen Verbuendeten mit ctDelta in der Vorschau nach vorn', () => {
    const state = startBattle({
      party: [fastTank()[0]!, unit('nachzuegler', 20, 'party')],
      enemies: [unit('gegner', 20, 'enemy')],
      seed: 11
    });
    const late = state.combatants.find((combatant) => combatant.name === 'nachzuegler')!;
    state.combatants.forEach((combatant) => { combatant.ct = 0; });
    late.ct = 0;

    const before = turnForecast(state, 6).findIndex((entry) => entry.id === late.id);
    late.ct += 60;
    const after = turnForecast(state, 6).findIndex((entry) => entry.id === late.id);

    expect(after).toBeGreaterThanOrEqual(0);
    expect(after).toBeLessThan(before);
  });

  it('liefert die Vorschau ueber die View aus', () => {
    const state = startBattle({ party: fastTank(), enemyIds: ['forest-slime'], seed: 3 });
    const view = renderView(state);
    expect(view.turnForecast.length).toBeGreaterThan(0);
    expect(view.turnForecast[0]!.id).toBe(state.activeId ?? view.turnForecast[0]!.id);
    act(state, { type: 'guard' });
    expect(renderView(state).turnForecast.length).toBeGreaterThan(0);
  });
});
