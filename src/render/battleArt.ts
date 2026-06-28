export const PARTY_BATTLE_ART = {
  rimuru: 'sprite-party-rimuru',
  gobta: 'sprite-party-gobta',
  ranga: 'sprite-party-ranga',
  shuna: 'sprite-party-shuna'
} as const;

export type BattleArenaKind =
  | 'tempest-grove'
  | 'sealed-cave'
  | 'direwolf-den'
  | 'ancestor-seal'
  | 'spirit-marsh'
  | 'spirit-highlands';

export const BATTLE_ARENA_TEXTURES = {
  'tempest-grove': 'battle-bg-tempest-grove',
  'sealed-cave': 'battle-bg-sealed-cave',
  'direwolf-den': 'battle-bg-direwolf-den',
  'ancestor-seal': 'battle-bg-ancestor-seal',
  'spirit-marsh': 'battle-bg-spirit-marsh',
  'spirit-highlands': 'battle-bg-spirit-highlands'
} as const satisfies Record<BattleArenaKind, string>;

const MAP_ARENAS: Readonly<Record<string, BattleArenaKind>> = {
  'sealed-cave': 'sealed-cave',
  'goblin-village': 'tempest-grove',
  'direwolf-den': 'direwolf-den',
  'tempest-start': 'tempest-grove',
  'spirit-marsh': 'spirit-marsh',
  'spirit-highlands': 'spirit-highlands'
};

const ENCOUNTER_ARENAS: Readonly<Record<string, BattleArenaKind>> = {
  'shrine-approach': 'ancestor-seal'
};

export function partyBattleTextureFor(sourceId: string): string | null {
  return PARTY_BATTLE_ART[sourceId as keyof typeof PARTY_BATTLE_ART] ?? null;
}

export function battleArenaForMap(mapId: string | undefined, encounterId?: string | null): {
  kind: BattleArenaKind;
  textureKey: string;
} {
  const kind = ENCOUNTER_ARENAS[encounterId ?? '']
    ?? MAP_ARENAS[mapId ?? '']
    ?? 'tempest-grove';
  return { kind, textureKey: BATTLE_ARENA_TEXTURES[kind] };
}
