import type { PlaceholderKind } from './artSpec';

export const KINGDOM_UNIT_TEXTURE_KEY = 'sprite-kingdom-units';
export const FOREST_SLIME_TEXTURE_KEY = 'sprite-enemy-forest-slime';
export const SPORE_MOTH_TEXTURE_KEY = 'sprite-enemy-spore-moth';
export const ORC_SCOUT_TEXTURE_KEY = 'sprite-enemy-orc-scout';
export const LIZARDMAN_ACOLYTE_TEXTURE_KEY = 'sprite-enemy-lizardman-acolyte';
export const BOG_TERROR_TEXTURE_KEY = 'sprite-enemy-bog-terror';
export const ORC_SOLDIER_TEXTURE_KEY = 'sprite-enemy-orc-soldier';
export const ORC_GENERAL_TEXTURE_KEY = 'sprite-enemy-orc-general';
export const ORC_DISASTER_TEXTURE_KEY = 'sprite-enemy-orc-disaster';
export const LIZARDMAN_WARRIOR_TEXTURE_KEY = 'sprite-enemy-lizardman-warrior';
export const GABIRU_TEXTURE_KEY = 'sprite-enemy-gabiru';
export const MASKED_MAJIN_TEXTURE_KEY = 'sprite-enemy-masked-majin';
export const IFRIT_TEXTURE_KEY = 'sprite-enemy-ifrit';
export const DIREWOLF_ALPHA_TEXTURE_KEY = 'sprite-enemy-direwolf-alpha';
export const DIREWOLF_PUP_TEXTURE_KEY = 'sprite-enemy-direwolf-pup';
export const NAMELESS_ECHO_TEXTURE_KEY = 'sprite-enemy-nameless-echo';
export const OGRE_WARRIOR_TEXTURE_KEY = 'sprite-enemy-ogre-warrior';
export const MAGIC_COLOSSUS_TEXTURE_KEY = 'sprite-enemy-magic-colossus';

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
  'forest-slime': generatedTexture(FOREST_SLIME_TEXTURE_KEY, 'enemy-slime'),
  'direwolf-pup': generatedTexture(DIREWOLF_PUP_TEXTURE_KEY, 'enemy-wolf'),
  'direwolf-alpha': generatedTexture(DIREWOLF_ALPHA_TEXTURE_KEY, 'enemy-wolf'),
  'spore-moth': generatedTexture(SPORE_MOTH_TEXTURE_KEY, 'enemy-moth'),
  'orc-scout': generatedTexture(ORC_SCOUT_TEXTURE_KEY, 'enemy-orc'),
  'lizardman-acolyte': generatedTexture(LIZARDMAN_ACOLYTE_TEXTURE_KEY, 'enemy-lizard'),
  'mordrahn-echo': generatedTexture(NAMELESS_ECHO_TEXTURE_KEY, 'enemy-boss'),
  'human-lancer': generatedTexture('sprite-enemy-human-lancer', 'enemy-ogre'),
  'mordrahn-vanguard': generatedTexture(NAMELESS_ECHO_TEXTURE_KEY, 'enemy-boss'),
  mordrahn: generatedTexture('sprite-enemy-mordrahn', 'enemy-boss'),
  'bog-terror': generatedTexture(BOG_TERROR_TEXTURE_KEY, 'enemy-ogre'),
  'stray-echo': generatedTexture(NAMELESS_ECHO_TEXTURE_KEY, 'enemy-boss'),
  'human-deserter': generatedTexture('sprite-enemy-human-deserter', 'enemy-ogre'),
  'elder-direwolf': generatedTexture(DIREWOLF_ALPHA_TEXTURE_KEY, 'enemy-wolf'),
  'orc-grunt': generatedTexture(ORC_SOLDIER_TEXTURE_KEY, 'enemy-orc'),
  'orc-soldier': generatedTexture(ORC_SOLDIER_TEXTURE_KEY, 'enemy-orc'),
  'orc-general': generatedTexture(ORC_GENERAL_TEXTURE_KEY, 'enemy-orc'),
  'orc-lord': generatedTexture(ORC_DISASTER_TEXTURE_KEY, 'enemy-boss'),
  'orc-disaster': generatedTexture(ORC_DISASTER_TEXTURE_KEY, 'enemy-boss'),
  'lizardman-warrior': generatedTexture(LIZARDMAN_WARRIOR_TEXTURE_KEY, 'enemy-lizard'),
  gabiru: generatedTexture(GABIRU_TEXTURE_KEY, 'enemy-lizard'),
  'masked-majin': generatedTexture(MASKED_MAJIN_TEXTURE_KEY, 'enemy-boss'),
  ifrit: generatedTexture(IFRIT_TEXTURE_KEY, 'enemy-boss'),
  'ogre-warrior': generatedTexture(OGRE_WARRIOR_TEXTURE_KEY, 'enemy-ogre'),
  'magic-colossus': generatedTexture(MAGIC_COLOSSUS_TEXTURE_KEY, 'enemy-boss')
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
