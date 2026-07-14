import { describe, expect, it } from 'vitest';
import {
  BATTLE_ARENA_TEXTURES,
  PARTY_BATTLE_ART,
  battleArenaForMap,
  partyBattleTextureFor
} from '../src/render/battleArt';
import { HEROES } from '../src/data/characters';
import preloadSource from '../src/scenes/PreloadScene.ts?raw';

describe('Battle-Art-Zuordnung', () => {
  it('liefert für alle spielbaren Figuren eigene Kampfillustrationen', () => {
    expect(Object.keys(PARTY_BATTLE_ART).sort()).toEqual(HEROES.map((hero) => hero.id).sort());
    for (const hero of HEROES) {
      expect(partyBattleTextureFor(hero.id)).toBe(PARTY_BATTLE_ART[hero.id]);
      expect(preloadSource).toContain(`../assets/sprites/party-${hero.id}.webp`);
    }
    expect(partyBattleTextureFor('unknown')).toBeNull();
  });

  it('ordnet jeder Region ihre Arena zu', () => {
    expect(battleArenaForMap('sealed-cave').textureKey).toBe(BATTLE_ARENA_TEXTURES['sealed-cave']);
    expect(battleArenaForMap('direwolf-den').textureKey).toBe(BATTLE_ARENA_TEXTURES['direwolf-den']);
    expect(battleArenaForMap('goblin-village').textureKey).toBe(BATTLE_ARENA_TEXTURES['tempest-grove']);
    expect(battleArenaForMap('tempest-start').textureKey).toBe(BATTLE_ARENA_TEXTURES['tempest-grove']);
    expect(battleArenaForMap('spirit-marsh').textureKey).toBe(BATTLE_ARENA_TEXTURES['spirit-marsh']);
    expect(battleArenaForMap('spirit-highlands').textureKey).toBe(BATTLE_ARENA_TEXTURES['spirit-highlands']);
    expect(battleArenaForMap('ogre-village-ruins').textureKey).toBe(BATTLE_ARENA_TEXTURES['ogre-ruins']);
    expect(battleArenaForMap('jura-battlefield').textureKey).toBe(BATTLE_ARENA_TEXTURES['orc-battlefield']);
    expect(battleArenaForMap('lizardman-marsh').textureKey).toBe(BATTLE_ARENA_TEXTURES['lizardman-marsh']);
    expect(battleArenaForMap('spirit-cave').textureKey).toBe(BATTLE_ARENA_TEXTURES['spirit-cave']);
    expect(battleArenaForMap('ember-hollow').textureKey).toBe(BATTLE_ARENA_TEXTURES['ember-hollow']);
    expect(battleArenaForMap('milim-clearing').textureKey).toBe(BATTLE_ARENA_TEXTURES['milim-arrival']);
    expect(battleArenaForMap('tempest-colosseum').textureKey).toBe(BATTLE_ARENA_TEXTURES['tempest-colosseum']);
    expect(battleArenaForMap('ramiris-labyrinth').textureKey).toBe(BATTLE_ARENA_TEXTURES['ramiris-labyrinth']);
    expect(battleArenaForMap('freedom-academy').textureKey).toBe(BATTLE_ARENA_TEXTURES['freedom-academy']);
    expect(battleArenaForMap('blumund').textureKey).toBe(BATTLE_ARENA_TEXTURES['blumund']);
  });

  it('kann Story-Encounter auf eine spezifische Arena abbilden', () => {
    expect(battleArenaForMap('tempest-start', 'whispering-grove-ambush').textureKey)
      .toBe(BATTLE_ARENA_TEXTURES['whispering-grove']);
    expect(battleArenaForMap('tempest-start', 'shrine-approach').textureKey)
      .toBe(BATTLE_ARENA_TEXTURES['ancestor-seal']);
    expect(battleArenaForMap('tempest-start', 'ogre-vanguard').textureKey)
      .toBe(BATTLE_ARENA_TEXTURES['ogre-ruins']);
    expect(battleArenaForMap('tempest-start', 'geld-disaster').textureKey)
      .toBe(BATTLE_ARENA_TEXTURES['orc-battlefield']);
    expect(battleArenaForMap('tempest-start', 'lizard-alliance').textureKey)
      .toBe(BATTLE_ARENA_TEXTURES['lizardman-marsh']);
    expect(battleArenaForMap('tempest-start', 'ifrit').textureKey)
      .toBe(BATTLE_ARENA_TEXTURES['spirit-cave']);
    expect(battleArenaForMap('ramiris-labyrinth', 'magic-colossus').textureKey)
      .toBe(BATTLE_ARENA_TEXTURES['ramiris-labyrinth']);
    for (const encounterId of ['masked-majin-ambush', 'ifrit-boss', 'emberforge-hunt-battle']) {
      expect(battleArenaForMap('ember-hollow', encounterId).textureKey)
        .toBe(BATTLE_ARENA_TEXTURES['ember-hollow']);
    }
    expect(battleArenaForMap('tempest-start', 'milim-arrives').textureKey)
      .toBe(BATTLE_ARENA_TEXTURES['milim-arrival']);
    expect(battleArenaForMap('tempest-start', 'arena-gold-wave').textureKey)
      .toBe(BATTLE_ARENA_TEXTURES['tempest-colosseum']);
    expect(battleArenaForMap('jura-battlefield', 'tempest-invasion-command').textureKey)
      .toBe(BATTLE_ARENA_TEXTURES['tempest-invasion']);
    expect(battleArenaForMap('tempest-start', 'unknown').kind).toBe('tempest-grove');
  });

  it('fällt für alte oder unbekannte Karten auf den Tempest-Hain zurück', () => {
    expect(battleArenaForMap(undefined).kind).toBe('tempest-grove');
    expect(battleArenaForMap('legacy-map').kind).toBe('tempest-grove');
  });

  it('lädt die kommenden Canon-Arenen in der Preload-Szene', () => {
    for (const file of [
      'battle-whispering-grove.webp',
      'battle-ogre-ruins.webp',
      'battle-orc-battlefield.webp',
      'battle-lizardman-marsh.webp',
      'battle-spirit-cave.webp',
      'battle-ramiris-labyrinth.webp',
      'battle-freedom-academy.webp',
      'battle-blumund.webp',
      'battle-ember-hollow.webp',
      'battle-milim-arrival.webp',
      'battle-tempest-colosseum.webp',
      'battle-tempest-invasion.webp'
    ]) {
      expect(preloadSource).toContain(`../assets/backgrounds/${file}`);
    }
  });
});
