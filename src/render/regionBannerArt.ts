export const REGION_BANNER_TEXTURES: Readonly<Record<string, string>> = {
  'sealed-cave': 'ui-region-sealed-cave',
  'goblin-village': 'ui-region-goblin-village',
  'direwolf-den': 'ui-region-direwolf-den',
  'tempest-start': 'ui-region-jura-forest',
  'spirit-marsh': 'ui-region-spirit-marsh',
  'spirit-highlands': 'ui-region-spirit-highlands',
  'dwargon': 'ui-region-dwargon',
  'jura-battlefield': 'ui-region-jura-battlefield',
  'lizardman-marsh': 'ui-region-lizardman-marsh',
  'ember-hollow': 'ui-region-ember-hollow',
  'blumund': 'ui-region-blumund'
};

export const DEFAULT_REGION_BANNER_TEXTURE_KEY = REGION_BANNER_TEXTURES['tempest-start'];

export function regionBannerTextureForMap(
  mapId: string,
  exists: (textureKey: string) => boolean = () => true
): string | null {
  const key = REGION_BANNER_TEXTURES[mapId] ?? DEFAULT_REGION_BANNER_TEXTURE_KEY;
  return exists(key) ? key : null;
}
