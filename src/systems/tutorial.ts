// Steuerungs-Onboarding für die Oberwelt: erklärt einmalig Laufen, Interagieren
// und Menü. Reine Daten/Logik (Phaser-frei) → die Szene rendert nur das Modell.

export const OVERWORLD_TUTORIAL_FLAG = 'tutorial.overworld.seen';
export type OverworldOnboardingStep = 'move' | 'interact' | 'menu';

export const OVERWORLD_ONBOARDING_FLAGS: Readonly<Record<OverworldOnboardingStep, string>> = {
  move: 'tutorial.overworld.move',
  interact: 'tutorial.overworld.interact',
  menu: 'tutorial.overworld.menu'
};

export interface TutorialHint {
  readonly step: OverworldOnboardingStep;
  readonly icon: string;
  readonly title: string;
  readonly body: string;
  readonly arrow: string;
}

export const OVERWORLD_TUTORIAL_HINTS: readonly TutorialHint[] = [
  {
    step: 'move',
    icon: '🚶',
    title: 'Bewegen',
    body: 'WASD oder Pfeiltasten — auf dem Handy das Steuerkreuz unten links.',
    arrow: '↙'
  },
  {
    step: 'interact',
    icon: '◆',
    title: 'Interagieren',
    body: 'E / Leertaste oder der ◆-Knopf: mit Figuren sprechen und Übergänge nutzen.',
    arrow: '↘'
  },
  {
    step: 'menu',
    icon: '☰',
    title: 'Menü',
    body: 'M oder der ☰-Knopf: Party, Quests, Codex und Ausrüstung.',
    arrow: '↗'
  }
];

/** Zeigt Oberwelt-Hinweise nur, solange nicht alle Onboarding-Schritte erledigt sind. */
export function shouldShowOverworldTutorial(flags: Readonly<Record<string, boolean>>): boolean {
  return getPendingOverworldTutorialHints(flags).length > 0;
}

export function getPendingOverworldTutorialHints(
  flags: Readonly<Record<string, boolean>>
): readonly TutorialHint[] {
  if (flags[OVERWORLD_TUTORIAL_FLAG] === true) return [];
  return OVERWORLD_TUTORIAL_HINTS.filter((hint) => flags[OVERWORLD_ONBOARDING_FLAGS[hint.step]] !== true);
}

export function completeOverworldOnboardingStep(
  flags: Readonly<Record<string, boolean>>,
  step: OverworldOnboardingStep
): Readonly<Record<string, boolean>> {
  if (flags[OVERWORLD_TUTORIAL_FLAG] === true) return flags;
  const stepFlag = OVERWORLD_ONBOARDING_FLAGS[step];
  const next = flags[stepFlag] === true ? flags : { ...flags, [stepFlag]: true };
  const complete = (Object.keys(OVERWORLD_ONBOARDING_FLAGS) as OverworldOnboardingStep[])
    .every((candidate) => next[OVERWORLD_ONBOARDING_FLAGS[candidate]] === true);
  return complete ? { ...next, [OVERWORLD_TUTORIAL_FLAG]: true } : next;
}
