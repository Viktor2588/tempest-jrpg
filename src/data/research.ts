import type { ResearchProject } from './types';

export const RESEARCH_PROJECTS = [
  {
    id: 'stabilize-spirit-cores',
    name: 'Geist-Kerne stabilisieren',
    description: 'Vesta bündelt Shunas Schutzkreise und Ifrits Restglut, damit die Kinder-Kerne nicht weiter ausfransen.',
    inputs: [
      { itemId: 'spirit-ember', quantity: 1 },
      { itemId: 'mana-drop', quantity: 2 }
    ],
    magiculeCost: 20,
    requiresFlag: 'story.children.first-core',
    unlockFlag: 'research.spirit-cores.stabilized'
  },
  {
    id: 'spirit-infusion',
    name: 'Geist-Infusion',
    description: 'Magisteel nimmt die stabilisierte Geistfrequenz auf und macht sie als Ausruestungsritual schmiedbar.',
    inputs: [
      { itemId: 'magic-ore', quantity: 2 },
      { itemId: 'magisteel', quantity: 1 }
    ],
    magiculeCost: 30,
    requiresFlag: 'research.spirit-cores.stabilized',
    unlockFlag: 'research.spirit-infusion.unlocked'
  }
] as const satisfies readonly ResearchProject[];
