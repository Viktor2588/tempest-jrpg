import { describe, expect, it } from 'vitest';
import {
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
  });
});
