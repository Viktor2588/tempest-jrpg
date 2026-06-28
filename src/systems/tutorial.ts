// Steuerungs-Onboarding für die Oberwelt: erklärt einmalig Laufen, Interagieren
// und Menü. Reine Daten/Logik (Phaser-frei) → die Szene rendert nur das Modell.

export const OVERWORLD_TUTORIAL_FLAG = 'tutorial.overworld.seen';

export interface TutorialHint {
  readonly icon: string;
  readonly title: string;
  readonly body: string;
}

export const OVERWORLD_TUTORIAL_HINTS: readonly TutorialHint[] = [
  { icon: '🚶', title: 'Bewegen', body: 'WASD oder Pfeiltasten — auf dem Handy das Steuerkreuz unten links.' },
  { icon: '◆', title: 'Interagieren', body: 'E / Leertaste oder der ◆-Knopf: mit Figuren sprechen und auf einem Übergang ins nächste Gebiet wechseln.' },
  { icon: '☰', title: 'Menü', body: 'M oder der ☰-Knopf: Party, Quests, Codex und Ausrüstung.' }
];

/** Zeigt das Oberwelt-Steuerungs-Tutorial nur, solange das Flag nicht gesetzt ist. */
export function shouldShowOverworldTutorial(flags: Readonly<Record<string, boolean>>): boolean {
  return flags[OVERWORLD_TUTORIAL_FLAG] !== true;
}
