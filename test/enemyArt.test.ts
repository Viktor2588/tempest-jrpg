import { describe, expect, it } from 'vitest';
import { ENEMIES } from '../src/data';
import {
  FOREST_SLIME_TEXTURE_KEY,
  KINGDOM_UNIT_ATLAS,
  KINGDOM_UNIT_FRAMES,
  KINGDOM_UNIT_TEXTURE_KEY,
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

  it('nutzt den Kingdom-Atlas für die wiederkehrenden Kreaturenlinien', () => {
    expect(enemyArtFor('spore-moth', 'Sporenmotte')).toMatchObject({
      textureKey: KINGDOM_UNIT_TEXTURE_KEY,
      frame: 'insect'
    });
    expect(enemyArtFor('bog-terror', 'Sumpfschrecken')).toMatchObject({
      textureKey: KINGDOM_UNIT_TEXTURE_KEY,
      frame: 'treant'
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
