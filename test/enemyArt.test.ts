import { describe, expect, it } from 'vitest';
import { ENEMIES } from '../src/data';
import preloadSource from '../src/scenes/PreloadScene.ts?raw';
import {
  BOG_TERROR_TEXTURE_KEY,
  ACADEMY_WISP_TEXTURE_KEY,
  BLUMUND_BANDIT_TEXTURE_KEY,
  DIREWOLF_ALPHA_TEXTURE_KEY,
  DIREWOLF_PUP_TEXTURE_KEY,
  FOREST_SLIME_TEXTURE_KEY,
  GABIRU_TEXTURE_KEY,
  IFRIT_TEXTURE_KEY,
  KINGDOM_UNIT_ATLAS,
  KINGDOM_UNIT_FRAMES,
  LIZARDMAN_ACOLYTE_TEXTURE_KEY,
  LIZARDMAN_WARRIOR_TEXTURE_KEY,
  MASKED_MAJIN_TEXTURE_KEY,
  MAGIC_COLOSSUS_TEXTURE_KEY,
  MARSH_HEXER_TEXTURE_KEY,
  NAMELESS_ECHO_TEXTURE_KEY,
  OGRE_WARRIOR_TEXTURE_KEY,
  ORC_DISASTER_TEXTURE_KEY,
  ORC_GENERAL_TEXTURE_KEY,
  ORC_SCOUT_TEXTURE_KEY,
  ORC_SOLDIER_TEXTURE_KEY,
  SPORE_MOTH_TEXTURE_KEY,
  STORM_SHARD_TEXTURE_KEY,
  MARSH_THORNBACK_TEXTURE_KEY,
  BLUMUND_BRIGAND_TEXTURE_KEY,
  ACADEMY_REVENANT_TEXTURE_KEY,
  MORDRAHN_VANGUARD_TEXTURE_KEY,
  ELDER_DIREWOLF_TEXTURE_KEY,
  ORC_GRUNT_TEXTURE_KEY,
  ORC_LORD_TEXTURE_KEY,
  enemyArtFor
} from '../src/render/enemyArt';

describe('Gegner-Art-Mapping', () => {
  it('ordnet jedem datengetriebenen Gegner eine echte Textur zu', () => {
    for (const enemy of ENEMIES) {
      expect(enemyArtFor(enemy.id, enemy.name).textureKey).toBeTruthy();
    }
  });

  it('nutzt das grüne Spezialasset für den Waldschleim', () => {
    expect(enemyArtFor('forest-slime', 'Waldschleim')).toMatchObject({
      textureKey: FOREST_SLIME_TEXTURE_KEY,
      fallbackKind: 'enemy-slime'
    });
    expect(enemyArtFor('forest-slime', 'Waldschleim').frame).toBeUndefined();
  });

  it('nutzt hochaufgeloeste Cutouts fuer die letzten Kenney-Gegnerlinien', () => {
    expect(enemyArtFor('direwolf-pup', 'Direwolf-Welpe')).toMatchObject({
      textureKey: DIREWOLF_PUP_TEXTURE_KEY
    });
    expect(enemyArtFor('ogre-warrior', 'Oger-Krieger')).toMatchObject({
      textureKey: OGRE_WARRIOR_TEXTURE_KEY
    });
  });

  it('verdrahtet die regionalen Gegner-Cutouts separat', () => {
    expect(enemyArtFor('spore-moth', 'Sporenmotte')).toMatchObject({
      textureKey: SPORE_MOTH_TEXTURE_KEY,
      fallbackKind: 'enemy-moth'
    });
    expect(enemyArtFor('orc-scout', 'Orkspäher')).toMatchObject({
      textureKey: ORC_SCOUT_TEXTURE_KEY,
      fallbackKind: 'enemy-orc'
    });
    expect(enemyArtFor('lizardman-acolyte', 'Echsenakolyth')).toMatchObject({
      textureKey: LIZARDMAN_ACOLYTE_TEXTURE_KEY,
      fallbackKind: 'enemy-lizard'
    });
    expect(enemyArtFor('bog-terror', 'Sumpfschrecken')).toMatchObject({
      textureKey: BOG_TERROR_TEXTURE_KEY,
      fallbackKind: 'enemy-ogre'
    });
  });

  it('verdrahtet die drei projektspezifisch generierten Gegner separat', () => {
    expect(enemyArtFor('human-lancer', '')).toMatchObject({
      textureKey: 'sprite-enemy-human-lancer'
    });
    expect(enemyArtFor('human-deserter', '')).toMatchObject({
      textureKey: 'sprite-enemy-human-deserter'
    });
    expect(enemyArtFor('mordrahn', '')).toMatchObject({
      textureKey: 'sprite-enemy-mordrahn'
    });
    expect(enemyArtFor('blumund-bandit', '')).toMatchObject({
      textureKey: BLUMUND_BANDIT_TEXTURE_KEY
    });
    expect(enemyArtFor('academy-wisp', '')).toMatchObject({
      textureKey: ACADEMY_WISP_TEXTURE_KEY
    });
  });

  it('verdrahtet Canon-Triggergegner mit dedizierten Cutouts statt Atlas-Frames', () => {
    for (const [id, expectedTexture] of [
      ['direwolf-alpha', DIREWOLF_ALPHA_TEXTURE_KEY],
      ['mordrahn-echo', NAMELESS_ECHO_TEXTURE_KEY],
      ['orc-grunt', ORC_GRUNT_TEXTURE_KEY],
      ['orc-soldier', ORC_SOLDIER_TEXTURE_KEY],
      ['orc-general', ORC_GENERAL_TEXTURE_KEY],
      ['orc-lord', ORC_LORD_TEXTURE_KEY],
      ['orc-disaster', ORC_DISASTER_TEXTURE_KEY],
      ['lizardman-warrior', LIZARDMAN_WARRIOR_TEXTURE_KEY],
      ['gabiru', GABIRU_TEXTURE_KEY],
      ['masked-majin', MASKED_MAJIN_TEXTURE_KEY],
      ['ifrit', IFRIT_TEXTURE_KEY],
      ['magic-colossus', MAGIC_COLOSSUS_TEXTURE_KEY],
      ['bog-warden', MARSH_HEXER_TEXTURE_KEY],
      ['highland-galecaller', STORM_SHARD_TEXTURE_KEY],
      ['marsh-thornback', MARSH_THORNBACK_TEXTURE_KEY],
      ['blumund-brigand', BLUMUND_BRIGAND_TEXTURE_KEY],
      ['academy-revenant', ACADEMY_REVENANT_TEXTURE_KEY],
      ['mordrahn-vanguard', MORDRAHN_VANGUARD_TEXTURE_KEY],
      ['elder-direwolf', ELDER_DIREWOLF_TEXTURE_KEY],
    ] as const) {
      const art = enemyArtFor(id, '');
      expect(art.textureKey).toBe(expectedTexture);
      expect(art.frame).toBeUndefined();
    }
  });

  it('lädt die Canon-Triggergegner-Cutouts in der Preload-Szene', () => {
    for (const file of [
      'enemy-orc-soldier.webp',
      'enemy-orc-general.webp',
      'enemy-orc-disaster.webp',
      'enemy-lizardman-warrior.webp',
      'enemy-gabiru.webp',
      'enemy-masked-majin.webp',
      'enemy-ifrit.webp',
      'enemy-direwolf-alpha.webp',
      'enemy-direwolf-pup.webp',
      'enemy-nameless-echo.webp',
      'enemy-ogre-warrior.webp',
      'enemy-magic-colossus.png',
      'enemy-blumund-bandit.webp',
      'enemy-academy-wisp.webp',
      'enemy-marsh-hexer.png',
      'enemy-storm-shard.png',
      'enemy-marsh-thornback.png',
      'enemy-blumund-brigand.png',
      'enemy-academy-revenant.png',
      'enemy-mordrahn-vanguard.png',
      'enemy-elder-direwolf.png',
      'enemy-orc-grunt.png',
      'enemy-orc-lord.png'
    ]) {
      expect(preloadSource).toContain(`../assets/sprites/${file}`);
    }
  });

  it('hält alle Atlas-Frames innerhalb des 5×4-Rasters', () => {
    expect(Object.keys(KINGDOM_UNIT_FRAMES)).toHaveLength(20);
    for (const frame of Object.values(KINGDOM_UNIT_FRAMES)) {
      expect(frame.col).toBeGreaterThanOrEqual(0);
      expect(frame.col).toBeLessThan(KINGDOM_UNIT_ATLAS.columns);
      expect(frame.row).toBeGreaterThanOrEqual(0);
      expect(frame.row).toBeLessThan(KINGDOM_UNIT_ATLAS.rows);
    }
  });
});
