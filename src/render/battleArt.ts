import { resolveTempestGrowthStage, type StoryFlags } from '../systems/tempestGrowth';

export const PARTY_BATTLE_ART = {
  rimuru: 'sprite-party-rimuru',
  gobta: 'sprite-party-gobta',
  rigurd: 'sprite-party-rigurd',
  ranga: 'sprite-party-ranga',
  shuna: 'sprite-party-shuna',
  benimaru: 'sprite-party-benimaru',
  shion: 'sprite-party-shion',
  hakurou: 'sprite-party-hakurou',
  souei: 'sprite-party-souei'
} as const;

export type BattleArenaKind =
  | 'tempest-grove'
  | 'whispering-grove'
  | 'sealed-cave'
  | 'tempest-settlement'
  | 'direwolf-den'
  | 'ancestor-seal'
  | 'spirit-marsh'
  | 'spirit-highlands'
  | 'ogre-ruins'
  | 'orc-battlefield'
  | 'lizardman-marsh'
  | 'spirit-cave'
  | 'ramiris-labyrinth'
  | 'freedom-academy'
  | 'blumund'
  | 'ember-hollow'
  | 'milim-arrival'
  | 'tempest-colosseum'
  | 'tempest-invasion';

export const BATTLE_ARENA_TEXTURES = {
  'tempest-grove': 'battle-bg-tempest-grove',
  'whispering-grove': 'battle-bg-whispering-grove',
  'sealed-cave': 'battle-bg-sealed-cave',
  'tempest-settlement': 'battle-bg-tempest-settlement',
  'direwolf-den': 'battle-bg-direwolf-den',
  'ancestor-seal': 'battle-bg-ancestor-seal',
  'spirit-marsh': 'battle-bg-spirit-marsh',
  'spirit-highlands': 'battle-bg-spirit-highlands',
  'ogre-ruins': 'battle-bg-ogre-ruins',
  'orc-battlefield': 'battle-bg-orc-battlefield',
  'lizardman-marsh': 'battle-bg-lizardman-marsh',
  'spirit-cave': 'battle-bg-spirit-cave',
  'ramiris-labyrinth': 'battle-bg-ramiris-labyrinth',
  'freedom-academy': 'battle-bg-freedom-academy',
  'blumund': 'battle-bg-blumund',
  'ember-hollow': 'battle-bg-ember-hollow',
  'milim-arrival': 'battle-bg-milim-arrival',
  'tempest-colosseum': 'battle-bg-tempest-colosseum',
  'tempest-invasion': 'battle-bg-tempest-invasion'
} as const satisfies Record<BattleArenaKind, string>;

const MAP_ARENAS: Readonly<Record<string, BattleArenaKind>> = {
  'sealed-cave': 'sealed-cave',
  'goblin-village': 'tempest-grove',
  'direwolf-den': 'direwolf-den',
  'tempest-start': 'tempest-grove',
  'spirit-marsh': 'spirit-marsh',
  'spirit-highlands': 'spirit-highlands',
  'ogre-ruins': 'ogre-ruins',
  'ogre-village-ruins': 'ogre-ruins',
  'jura-battlefield': 'orc-battlefield',
  'orc-battlefield': 'orc-battlefield',
  'lizardman-marsh': 'lizardman-marsh',
  'spirit-cave': 'spirit-cave',
  'ember-hollow': 'ember-hollow',
  'milim-clearing': 'milim-arrival',
  'tempest-colosseum': 'tempest-colosseum',
  'ramiris-labyrinth': 'ramiris-labyrinth',
  'freedom-academy': 'freedom-academy',
  'blumund': 'blumund'
};

const ENCOUNTER_ARENAS: Readonly<Record<string, BattleArenaKind>> = {
  'whispering-grove-ambush': 'whispering-grove',
  'shrine-approach': 'ancestor-seal',
  'ogre-vanguard': 'ogre-ruins',
  'ogre-naming': 'ogre-ruins',
  'march-of-orcs': 'orc-battlefield',
  'geld-disaster': 'orc-battlefield',
  'orc-disaster': 'orc-battlefield',
  'lizard-alliance': 'lizardman-marsh',
  'lizardman-skirmish': 'lizardman-marsh',
  'spirit-trial': 'spirit-cave',
  ifrit: 'spirit-cave',
  'magic-colossus': 'ramiris-labyrinth',
  'milim-arrives': 'milim-arrival',
  'milim-spar': 'milim-arrival',
  'arena-bronze-wave': 'tempest-colosseum',
  'arena-silver-wave': 'tempest-colosseum',
  'arena-gold-wave': 'tempest-colosseum',
  'tempest-invasion-vanguard': 'tempest-invasion',
  'tempest-invasion-command': 'tempest-invasion'
};

export function partyBattleTextureFor(sourceId: string): string | null {
  return PARTY_BATTLE_ART[sourceId as keyof typeof PARTY_BATTLE_ART] ?? null;
}

export function battleArenaForMap(
  mapId: string | undefined,
  encounterId?: string | null,
  flags: StoryFlags = {}
): {
  kind: BattleArenaKind;
  textureKey: string;
} {
  const kind = ENCOUNTER_ARENAS[encounterId ?? '']
    ?? (mapId === 'tempest-start' && resolveTempestGrowthStage(flags) !== 'wilderness'
      ? 'tempest-settlement'
      : null)
    ?? MAP_ARENAS[mapId ?? '']
    ?? 'tempest-grove';
  return { kind, textureKey: BATTLE_ARENA_TEXTURES[kind] };
}
