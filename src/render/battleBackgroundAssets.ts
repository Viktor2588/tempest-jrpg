import type Phaser from 'phaser';
import { BATTLE_ARENA_TEXTURES, type BattleArenaKind } from './battleArt';
import tempestGroveBattleUrl from '../assets/backgrounds/battle-tempest-grove.webp';
import whisperingGroveBattleUrl from '../assets/backgrounds/battle-whispering-grove.webp';
import sealedCaveBattleUrl from '../assets/backgrounds/battle-sealed-cave.webp';
import tempestCampBattleUrl from '../assets/backgrounds/battle-tempest-camp.webp';
import tempestVillageBattleUrl from '../assets/backgrounds/battle-tempest-village.webp';
import tempestCityBattleUrl from '../assets/backgrounds/battle-tempest-city.webp';
import direwolfDenBattleUrl from '../assets/backgrounds/battle-direwolf-den.webp';
import ancestorSealBattleUrl from '../assets/backgrounds/battle-ancestor-seal.webp';
import spiritMarshBattleUrl from '../assets/backgrounds/battle-spirit-marsh.webp';
import spiritHighlandsBattleUrl from '../assets/backgrounds/battle-spirit-highlands.webp';
import ogreRuinsBattleUrl from '../assets/backgrounds/battle-ogre-ruins.webp';
import orcBattlefieldBattleUrl from '../assets/backgrounds/battle-orc-battlefield.webp';
import lizardmanMarshBattleUrl from '../assets/backgrounds/battle-lizardman-marsh.webp';
import spiritCaveBattleUrl from '../assets/backgrounds/battle-spirit-cave.webp';
import ramirisLabyrinthBattleUrl from '../assets/backgrounds/battle-ramiris-labyrinth.webp';
import freedomAcademyBattleUrl from '../assets/backgrounds/battle-freedom-academy.webp';
import blumundBattleUrl from '../assets/backgrounds/battle-blumund.webp';
import emberHollowBattleUrl from '../assets/backgrounds/battle-ember-hollow.webp';
import milimArrivalBattleUrl from '../assets/backgrounds/battle-milim-arrival.webp';
import tempestColosseumBattleUrl from '../assets/backgrounds/battle-tempest-colosseum.webp';
import tempestInvasionBattleUrl from '../assets/backgrounds/battle-tempest-invasion.webp';

export const BATTLE_BACKGROUND_URLS: Readonly<Record<BattleArenaKind, string>> = {
  'tempest-grove': tempestGroveBattleUrl,
  'whispering-grove': whisperingGroveBattleUrl,
  'sealed-cave': sealedCaveBattleUrl,
  'tempest-camp': tempestCampBattleUrl,
  'tempest-village': tempestVillageBattleUrl,
  'tempest-city': tempestCityBattleUrl,
  'direwolf-den': direwolfDenBattleUrl,
  'ancestor-seal': ancestorSealBattleUrl,
  'spirit-marsh': spiritMarshBattleUrl,
  'spirit-highlands': spiritHighlandsBattleUrl,
  'ogre-ruins': ogreRuinsBattleUrl,
  'orc-battlefield': orcBattlefieldBattleUrl,
  'lizardman-marsh': lizardmanMarshBattleUrl,
  'spirit-cave': spiritCaveBattleUrl,
  'ramiris-labyrinth': ramirisLabyrinthBattleUrl,
  'freedom-academy': freedomAcademyBattleUrl,
  blumund: blumundBattleUrl,
  'ember-hollow': emberHollowBattleUrl,
  'milim-arrival': milimArrivalBattleUrl,
  'tempest-colosseum': tempestColosseumBattleUrl,
  'tempest-invasion': tempestInvasionBattleUrl
};

// Der Titel führt in die versiegelte Höhle; nur ihr Hintergrund und der
// universelle Wald-Standard gehören zum kritischen Startpfad.
export const INITIAL_BATTLE_BACKGROUND_KINDS = ['sealed-cave', 'tempest-grove'] as const;

export function queueBattleBackground(scene: Phaser.Scene, kind: BattleArenaKind): boolean {
  const textureKey = BATTLE_ARENA_TEXTURES[kind];
  if (scene.textures.exists(textureKey)) return false;
  scene.load.image(textureKey, BATTLE_BACKGROUND_URLS[kind]);
  return true;
}
