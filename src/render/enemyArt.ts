import type { PlaceholderKind } from './artSpec';

export const KINGDOM_UNIT_TEXTURE_KEY = 'sprite-kingdom-units';

export const KINGDOM_UNIT_ATLAS = {
  columns: 5,
  rows: 4
} as const;

export const KINGDOM_UNIT_FRAMES = {
  slime: { col: 0, row: 0 },
  goblin: { col: 1, row: 0 },
  wolf: { col: 2, row: 0 },
  ogre: { col: 3, row: 0 },
  lizard: { col: 4, row: 0 },
  orc: { col: 0, row: 1 },
  undead: { col: 1, row: 1 },
  demon: { col: 2, row: 1 },
  vampire: { col: 3, row: 1 },
  golem: { col: 4, row: 1 },
  insect: { col: 0, row: 2 },
  dragon: { col: 1, row: 2 },
  spirit: { col: 2, row: 2 },
  griffin: { col: 3, row: 2 },
  treant: { col: 4, row: 2 },
  phoenix: { col: 0, row: 3 },
  kobold: { col: 1, row: 3 },
  rabbitfolk: { col: 2, row: 3 },
  tengu: { col: 3, row: 3 },
  merfolk: { col: 4, row: 3 }
} as const;

export type KingdomUnitFrame = keyof typeof KINGDOM_UNIT_FRAMES;

export interface EnemyArtSpec {
  readonly textureKey?: string;
  readonly frame?: KingdomUnitFrame;
  readonly fallbackKind: PlaceholderKind;
}

const ENEMY_ART_BY_SOURCE: Readonly<Record<string, EnemyArtSpec>> = {
  'forest-slime': kingdomFrame('slime', 'enemy-slime'),
  'direwolf-pup': kingdomFrame('wolf', 'enemy-wolf'),
  'spore-moth': kingdomFrame('insect', 'enemy-moth'),
  'orc-scout': kingdomFrame('orc', 'enemy-orc'),
  'lizardman-acolyte': kingdomFrame('lizard', 'enemy-lizard'),
  'mordrahn-echo': kingdomFrame('spirit', 'enemy-boss'),
  'human-lancer': generatedTexture('sprite-enemy-human-lancer', 'enemy-ogre'),
  'mordrahn-vanguard': kingdomFrame('demon', 'enemy-boss'),
  mordrahn: generatedTexture('sprite-enemy-mordrahn', 'enemy-boss'),
  'bog-terror': kingdomFrame('treant', 'enemy-ogre'),
  'stray-echo': kingdomFrame('spirit', 'enemy-boss'),
  'human-deserter': generatedTexture('sprite-enemy-human-deserter', 'enemy-ogre'),
  'elder-direwolf': kingdomFrame('wolf', 'enemy-wolf')
};

export function enemyArtFor(sourceId: string, name: string): EnemyArtSpec {
  const mapped = ENEMY_ART_BY_SOURCE[sourceId];
  if (mapped) return mapped;

  const normalized = name.toLowerCase();
  if (normalized.includes('wolf')) return kingdomFrame('wolf', 'enemy-wolf');
  if (normalized.includes('motte') || normalized.includes('moth')) return kingdomFrame('insect', 'enemy-moth');
  if (normalized.includes('ork') || normalized.includes('orc')) return kingdomFrame('orc', 'enemy-orc');
  if (normalized.includes('echse') || normalized.includes('lizard')) return kingdomFrame('lizard', 'enemy-lizard');
  if (normalized.includes('ogre') || normalized.includes('oger')) return kingdomFrame('ogre', 'enemy-ogre');
  if (normalized.includes('mordrahn') || normalized.includes('echo')) return kingdomFrame('spirit', 'enemy-boss');
  if (normalized.includes('imp')) return { fallbackKind: 'enemy-imp' };
  return kingdomFrame('slime', 'enemy-slime');
}

function kingdomFrame(frame: KingdomUnitFrame, fallbackKind: PlaceholderKind): EnemyArtSpec {
  return {
    textureKey: KINGDOM_UNIT_TEXTURE_KEY,
    frame,
    fallbackKind
  };
}

function generatedTexture(textureKey: string, fallbackKind: PlaceholderKind): EnemyArtSpec {
  return {
    textureKey,
    fallbackKind
  };
}
