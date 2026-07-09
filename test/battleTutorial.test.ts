import { describe, expect, it } from 'vitest';
import { BATTLE_TEACHING_STEPS, getBattleTutorial, type BattleTeachingVerb } from '../src/systems/battleTutorial';

describe('adaptive Kampftutorials', () => {
  it('zeigt Trainings-, Direwolf-, Hain- und Echo-Hinweise nur beim passenden Encounter', () => {
    expect(getBattleTutorial('training-clearing', {})?.title).toContain('Analyse');
    expect(getBattleTutorial('direwolf-pack-leader', {})?.title).toContain('Rudeldruck');
    expect(getBattleTutorial('whispering-grove-ambush', {})?.title).toContain('Sporen');
    expect(getBattleTutorial('shrine-approach', {})?.title).toContain('Namenloses Echo');
    expect(getBattleTutorial('east-grass', {})).toBeNull();
  });

  it('blendet einen bereits gesehenen Hinweis aus', () => {
    const tutorial = getBattleTutorial('shrine-approach', {})!;
    expect(getBattleTutorial('shrine-approach', { [tutorial.flag]: true })).toBeNull();
  });

  it('führt die Canon-Bosse mit deutschen Telegraph- und Antworttipps ein', () => {
    expect(getBattleTutorial('geld-disaster-boss', {})?.tips.join(' ')).toContain('Fusionskombo');
    expect(getBattleTutorial('gabiru-duel', {})?.body).toContain('Kriegsschrei');
    expect(getBattleTutorial('ifrit-boss', {})?.tips.join(' ')).toContain('Inferno-Telegraph');
  });

  it('staffelt die fruehen Kampfverben statt sie in einem Encounter zu dumpen', () => {
    const expectedOrder: readonly BattleTeachingVerb[] = [
      'analyze',
      'break',
      'ct',
      'reaction',
      'status',
      'devour',
      'telegraph',
      'signature',
      'fusion'
    ];

    expect(BATTLE_TEACHING_STEPS.map((step) => step.encounterId)).toEqual([
      'training-clearing',
      'direwolf-pack-leader',
      'whispering-grove-ambush',
      'shrine-approach',
      'geld-disaster-boss'
    ]);
    expect(BATTLE_TEACHING_STEPS.every((step) => step.verbs.length <= 2)).toBe(true);
    expect(BATTLE_TEACHING_STEPS.every((step) => getBattleTutorial(step.encounterId, {}) !== null)).toBe(true);
    expect(BATTLE_TEACHING_STEPS.flatMap((step) => [...step.verbs])).toEqual(expectedOrder);
  });
});
