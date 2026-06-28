import { describe, expect, it } from 'vitest';
import {
  BATTLE_ARENA_TEXTURES,
  PARTY_BATTLE_ART,
  battleArenaForMap,
  partyBattleTextureFor
} from '../src/render/battleArt';

describe('Battle-Art-Zuordnung', () => {
  it('liefert für alle spielbaren Figuren eigene Kampfillustrationen', () => {
    expect(partyBattleTextureFor('rimuru')).toBe(PARTY_BATTLE_ART.rimuru);
    expect(partyBattleTextureFor('gobta')).toBe(PARTY_BATTLE_ART.gobta);
    expect(partyBattleTextureFor('shuna')).toBe(PARTY_BATTLE_ART.shuna);
    expect(partyBattleTextureFor('unknown')).toBeNull();
  });

  it('ordnet jeder Region ihre Arena zu', () => {
    expect(battleArenaForMap('sealed-cave').textureKey).toBe(BATTLE_ARENA_TEXTURES['sealed-cave']);
    expect(battleArenaForMap('direwolf-den').textureKey).toBe(BATTLE_ARENA_TEXTURES['direwolf-den']);
    expect(battleArenaForMap('goblin-village').textureKey).toBe(BATTLE_ARENA_TEXTURES['tempest-grove']);
    expect(battleArenaForMap('tempest-start').textureKey).toBe(BATTLE_ARENA_TEXTURES['tempest-grove']);
    expect(battleArenaForMap('spirit-marsh').textureKey).toBe(BATTLE_ARENA_TEXTURES['spirit-marsh']);
    expect(battleArenaForMap('spirit-highlands').textureKey).toBe(BATTLE_ARENA_TEXTURES['spirit-highlands']);
  });

  it('fällt für alte oder unbekannte Karten auf den Tempest-Hain zurück', () => {
    expect(battleArenaForMap(undefined).kind).toBe('tempest-grove');
    expect(battleArenaForMap('legacy-map').kind).toBe('tempest-grove');
  });
});
