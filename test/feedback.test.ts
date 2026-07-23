import { describe, it, expect } from 'vitest';
import { snapshot, diffFeedback, totalDamage } from '../src/systems/feedback';
import battleSceneSource from '../src/scenes/BattleScene.ts?raw';

const A = { id: 'a', hp: 100, mp: 10, dead: false };
const B = { id: 'b', hp: 50, mp: 5, dead: false };

describe('feedback diff', () => {
  it('snapshot reduziert auf id/hp/mp/dead', () => {
    expect(snapshot([{ id: 'x', hp: 1, mp: 2, dead: false, name: 'egal' } as never])).toEqual([{ id: 'x', hp: 1, mp: 2, dead: false }]);
  });

  it('erkennt Schaden (negativ) und Heilung (positiv)', () => {
    const before = snapshot([A, B]);
    const after = snapshot([{ ...A, hp: 70 }, { ...B, hp: 60 }]);
    const ev = diffFeedback(before, after);
    expect(ev).toContainEqual({ id: 'a', hpDelta: -30, mpDelta: 0, died: false });
    expect(ev).toContainEqual({ id: 'b', hpDelta: 10, mpDelta: 0, died: false });
  });

  it('markiert Tod nur beim Übergang lebendig→tot', () => {
    const before = snapshot([A]);
    const after = snapshot([{ ...A, hp: 0, dead: true }]);
    expect(diffFeedback(before, after)[0]).toMatchObject({ id: 'a', died: true });
    // bereits tot → kein erneutes Event
    expect(diffFeedback(snapshot([{ ...A, hp: 0, dead: true }]), snapshot([{ ...A, hp: 0, dead: true }]))).toEqual([]);
  });

  it('ignoriert unveränderte Einheiten und erfasst MP-Verbrauch auch ohne LP-Änderung', () => {
    expect(diffFeedback(snapshot([A]), snapshot([A]))).toEqual([]);
    const ev = diffFeedback(snapshot([A]), snapshot([{ ...A, hp: 90, mp: 6 }]));
    expect(ev[0]).toMatchObject({ hpDelta: -10, mpDelta: -4 });
    expect(diffFeedback(snapshot([A]), snapshot([{ ...A, mp: 6 }]))).toEqual([
      { id: 'a', hpDelta: 0, mpDelta: -4, died: false }
    ]);
  });

  it('erfasst MP-Regeneration und reicht MP-Feedback an die Battle-Szene weiter', () => {
    expect(diffFeedback(snapshot([A]), snapshot([{ ...A, mp: 14 }]))).toEqual([
      { id: 'a', hpDelta: 0, mpDelta: 4, died: false }
    ]);
    expect(battleSceneSource).toContain('if (event.mpDelta !== 0)');
    expect(battleSceneSource).toContain("this.floatNumber({ x: pos.x + 26, y: pos.y + 22 }, label, '#78c7ff')");
  });

  it('totalDamage summiert nur negative LP-Deltas', () => {
    const ev = diffFeedback(snapshot([A, B]), snapshot([{ ...A, hp: 80 }, { ...B, hp: 70 }]));
    expect(totalDamage(ev)).toBe(20);
  });
});
