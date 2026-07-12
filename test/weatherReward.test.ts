import { describe, expect, it } from 'vitest';
import { renderView, startBattle } from '../src/systems/battle';
import {
  applyBattleResultToSave,
  newlyRewardedWeatherConditions,
  weatherConditionRewards
} from '../src/systems/battleResult';
import { createNewSave } from '../src/systems/save';
import type { WorldClock } from '../src/systems/worldClock';
import { autoPlay, fastTank, lootEnemy } from './battleHelpers';

// Phase 174 — Wechselnde Bedingungen belohnen: der ERSTE Sieg unter je einer Welt-Uhr-
// Bedingung (Nacht/Nebel/Regen) zahlt EINMALIG einen Magicule-Fund (nicht farmbar).

const clock = (partial: Partial<WorldClock>): WorldClock => ({
  day: 0,
  timeOfDay: 'day',
  weather: 'clear',
  ...partial
});

describe('Welt-Uhr: Bedingungsbelohnung (Phase 174)', () => {
  it('zahlt je erstmaliger Bedingung; mehrere gleichzeitig möglich', () => {
    const rewards = weatherConditionRewards(clock({ timeOfDay: 'night', weather: 'rain' }), {});
    const flags = rewards.map((reward) => reward.flag).sort();
    expect(flags).toEqual(['worldclock.first.night', 'worldclock.first.rain']);
    expect(rewards.every((reward) => reward.magicules > 0)).toBe(true);
  });

  it('klarer Tag zahlt gar nichts', () => {
    expect(weatherConditionRewards(clock({}), {})).toHaveLength(0);
  });

  it('bereits gesetzte Flags werden nicht erneut gezahlt (nicht farmbar)', () => {
    const rewards = weatherConditionRewards(clock({ weather: 'fog' }), {
      'worldclock.first.fog': true
    });
    expect(rewards).toHaveLength(0);
  });

  it('newlyRewardedWeatherConditions liest den Flag-Diff aus', () => {
    const before = {};
    const after = { 'worldclock.first.fog': true };
    expect(newlyRewardedWeatherConditions(before, after)).toEqual(['Erster Sieg im Nebel']);
    // Bereits vorher gesetzt → kein neuer Fund.
    expect(newlyRewardedWeatherConditions(after, after)).toHaveLength(0);
  });

  it('ein Nebel-Sieg zahlt Magicules und setzt das Flag genau einmal', () => {
    const save = createNewSave({ seed: 7, now: '2026-07-12T10:00:00.000Z' });
    const battle = startBattle({
      party: fastTank(),
      enemies: lootEnemy(),
      inventory: save.inventory.stacks,
      seed: 7
    });
    expect(autoPlay(battle).status).toBe('won');
    const view = renderView(battle);

    const foggy = clock({ weather: 'fog' });
    const after = applyBattleResultToSave(save, view, { clock: foggy });
    expect(after.flags['worldclock.first.fog']).toBe(true);
    const firstDelta = after.progression.magicules - save.progression.magicules;
    expect(newlyRewardedWeatherConditions(save.flags, after.flags)).toEqual(['Erster Sieg im Nebel']);

    // Zweiter, identischer Sieg unter Nebel: NUR die Basis-Magicules, KEIN Wetter-Bonus mehr
    // (Flag bereits gesetzt → nicht farmbar). Die Differenz der Deltas ist der einmalige Bonus.
    const battle2 = startBattle({ party: fastTank(), enemies: lootEnemy(), inventory: after.inventory.stacks, seed: 8 });
    expect(autoPlay(battle2).status).toBe('won');
    const again = applyBattleResultToSave(after, renderView(battle2), { clock: foggy });
    const secondDelta = again.progression.magicules - after.progression.magicules;
    expect(firstDelta - secondDelta).toBe(8);
    expect(newlyRewardedWeatherConditions(after.flags, again.flags)).toHaveLength(0);
  });

  it('ohne Uhr-Option bleibt der Reward-Pfad unberührt (off-route/Harness)', () => {
    const save = createNewSave({ seed: 9, now: '2026-07-12T10:00:00.000Z' });
    const battle = startBattle({ party: fastTank(), enemies: lootEnemy(), inventory: save.inventory.stacks, seed: 9 });
    expect(autoPlay(battle).status).toBe('won');
    const after = applyBattleResultToSave(save, renderView(battle), {});
    expect(after.flags['worldclock.first.night']).toBeUndefined();
    expect(after.flags['worldclock.first.fog']).toBeUndefined();
    expect(after.flags['worldclock.first.rain']).toBeUndefined();
  });
});
