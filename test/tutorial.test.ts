import { describe, expect, it } from 'vitest';
import {
  completeOverworldOnboardingStep,
  getPendingOverworldTutorialHints,
  OVERWORLD_ONBOARDING_FLAGS,
  OVERWORLD_TUTORIAL_FLAG,
  OVERWORLD_TUTORIAL_HINTS,
  shouldShowOverworldTutorial
} from '../src/systems/tutorial';

describe('Steuerungs-Tutorial', () => {
  it('zeigt das Tutorial nur, solange das Flag nicht gesetzt ist', () => {
    expect(shouldShowOverworldTutorial({})).toBe(true);
    expect(shouldShowOverworldTutorial({ [OVERWORLD_TUTORIAL_FLAG]: true })).toBe(false);
  });

  it('erklärt Laufen, Interagieren und Menü', () => {
    expect(OVERWORLD_TUTORIAL_HINTS.map((hint) => hint.title)).toEqual(['Bewegen', 'Interagieren', 'Menü']);
    expect(OVERWORLD_TUTORIAL_HINTS.every((hint) => hint.arrow.length > 0)).toBe(true);
  });

  it('blendet erledigte Onboarding-Schritte einzeln aus und setzt danach das Gesamtflag', () => {
    let flags: Readonly<Record<string, boolean>> = {};
    expect(getPendingOverworldTutorialHints(flags).map((hint) => hint.step)).toEqual(['move', 'interact', 'menu']);

    flags = completeOverworldOnboardingStep(flags, 'move');
    expect(flags[OVERWORLD_ONBOARDING_FLAGS.move]).toBe(true);
    expect(flags[OVERWORLD_TUTORIAL_FLAG]).toBeUndefined();
    expect(getPendingOverworldTutorialHints(flags).map((hint) => hint.step)).toEqual(['interact', 'menu']);
    expect(completeOverworldOnboardingStep(flags, 'move')).toBe(flags);

    flags = completeOverworldOnboardingStep(flags, 'interact');
    expect(getPendingOverworldTutorialHints(flags).map((hint) => hint.step)).toEqual(['menu']);

    flags = completeOverworldOnboardingStep(flags, 'menu');
    expect(flags[OVERWORLD_TUTORIAL_FLAG]).toBe(true);
    expect(shouldShowOverworldTutorial(flags)).toBe(false);
    expect(getPendingOverworldTutorialHints(flags)).toEqual([]);
  });
});
