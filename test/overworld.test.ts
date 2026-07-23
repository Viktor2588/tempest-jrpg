import { describe, it, expect } from 'vitest';
import { parseMap, isWalkable, overworldActorDepth, tileKey, tryStep, WALL, FLOOR } from '../src/systems/overworld';
import {
  JURA_FIELD,
  TEMPEST_CAMP,
  TEMPEST_CITY,
  TEMPEST_VILLAGE,
  getMap,
  getMapName
} from '../src/data/maps';
import {
  TEMPEST_FACILITY_DISTRICTS,
  tempestFacilityDistrictScale
} from '../src/render/tempestFacilityArt';
import overworldSceneSource from '../src/scenes/OverworldScene.ts?raw';

const MAP = parseMap([
  '#####',
  '#...#',
  '#.#.#',
  '#...#',
  '#####'
], { x: 1, y: 1 });

describe('overworld grid', () => {
  it('parseMap erkennt Wände und Boden und füllt Breite auf', () => {
    expect(MAP.width).toBe(5);
    expect(MAP.height).toBe(5);
    expect(MAP.tiles[0]![0]).toBe(WALL);
    expect(MAP.tiles[1]![1]).toBe(FLOOR);
    expect(MAP.tiles[2]![2]).toBe(WALL); // Innenhindernis
  });

  it('isWalkable: Boden begehbar, Wand und außerhalb nicht', () => {
    expect(isWalkable(MAP, 1, 1)).toBe(true);
    expect(isWalkable(MAP, 0, 0)).toBe(false); // Wand
    expect(isWalkable(MAP, 2, 2)).toBe(false); // Innenhindernis
    expect(isWalkable(MAP, -1, 1)).toBe(false); // außerhalb
    expect(isWalkable(MAP, 5, 1)).toBe(false); // außerhalb
  });

  it('tryStep bewegt auf Boden und blockiert an Wänden', () => {
    expect(tryStep(MAP, { x: 1, y: 1 }, 'right')).toEqual({ x: 2, y: 1 });
    expect(tryStep(MAP, { x: 1, y: 1 }, 'up')).toEqual({ x: 1, y: 1 });   // Wand oben → blockiert
    expect(tryStep(MAP, { x: 1, y: 1 }, 'left')).toEqual({ x: 1, y: 1 }); // Wand links → blockiert
    // gegen das Innenhindernis (2,2) von (1,2) nach rechts → blockiert
    expect(tryStep(MAP, { x: 1, y: 2 }, 'right')).toEqual({ x: 1, y: 2 });
  });

  it('tryStep blockiert von Entitäten besetzte Kacheln (NPC-Kollision)', () => {
    const blocked = new Set([tileKey(2, 1)]); // NPC steht auf (2,1)
    // Ziel (2,1) ist begehbarer Boden, aber von einem NPC besetzt → man bleibt stehen.
    expect(tryStep(MAP, { x: 1, y: 1 }, 'right', blocked)).toEqual({ x: 1, y: 1 });
    // Freie Richtung bleibt begehbar.
    expect(tryStep(MAP, { x: 1, y: 1 }, 'down', blocked)).toEqual({ x: 1, y: 2 });
    // Ohne Blockierset verhält sich tryStep wie zuvor.
    expect(tryStep(MAP, { x: 1, y: 1 }, 'right')).toEqual({ x: 2, y: 1 });
  });

  it('ordnet Oberwelt-Akteure über dem Terrain und nach ihrer Kartenzeile', () => {
    const near = overworldActorDepth(0, 10);
    const far = overworldActorDepth(9, 10);
    expect(near).toBeGreaterThan(1);
    expect(far).toBeGreaterThan(near);
    expect(far).toBeLessThan(2);
  });

  it('das Spielfeld JURA_FIELD ist umrandet und hat einen begehbaren Spawn', () => {
    expect(JURA_FIELD.tiles[0]!.every((t) => t === WALL)).toBe(true); // obere Randwand
    expect(isWalkable(JURA_FIELD, JURA_FIELD.spawn.x, JURA_FIELD.spawn.y)).toBe(true);
  });

  it('getMapName liefert sichtbare Gebietsnamen (Start = Jura-Wald, nicht Tempest)', () => {
    expect(getMapName('tempest-start')).toBe('Jura-Wald');
    expect(getMapName('tempest-start', { 'story.tempest.named': true })).toBe('Tempest-Lager');
    expect(getMapName('tempest-start', { 'story.council.ready': true })).toBe('Tempest-Dorf');
    expect(getMapName('tempest-start', {
      'story.kijin.named': true,
      'faction.dwargon.allied': true
    })).toBe('Jura-Tempest');
    expect(getMapName('goblin-village')).toBe('Goblin-Dorf');
    expect(getMapName('spirit-marsh')).toBe('Geistmoor');
  });

  it('liefert für Tempest drei eigene, flag-gesteuerte Kartenvarianten', () => {
    expect(getMap('tempest-start', { 'story.tempest.named': true })).toBe(TEMPEST_CAMP);
    expect(getMap('tempest-start', { 'story.council.ready': true })).toBe(TEMPEST_VILLAGE);
    expect(getMap('tempest-start', {
      'story.kijin.named': true,
      'faction.dwargon.allied': true
    })).toBe(TEMPEST_CITY);
    // Wachstum wird über Bodentexturen + verteilte Distrikt-POIs gezeigt, nicht über
    // Hindernis-Wände: alle drei Stufen sind offene Flächen (nur Randmauer, kein Innenwerk).
    for (const map of [TEMPEST_CAMP, TEMPEST_VILLAGE, TEMPEST_CITY]) {
      const interiorWalls = map.tiles
        .slice(1, map.tiles.length - 1)
        .flatMap((row) => row.slice(1, row.length - 1))
        .filter((tile) => tile === WALL);
      expect(interiorWalls).toHaveLength(0);
    }
  });

  it('zeichnet alle Facility-Distrikte größer mit jeder Tempest-Ausbaustufe', () => {
    const districts = Object.values(TEMPEST_FACILITY_DISTRICTS);
    expect(districts).toHaveLength(4);
    expect(new Set(districts.map((district) => `${district.x},${district.y}`)).size).toBe(districts.length);
    expect(tempestFacilityDistrictScale('wilderness').level).toBe(0);
    expect(tempestFacilityDistrictScale('village').width).toBeGreaterThan(tempestFacilityDistrictScale('camp').width);
    expect(tempestFacilityDistrictScale('city').width).toBeGreaterThan(tempestFacilityDistrictScale('village').width);
    expect(overworldSceneSource).toContain('this.drawTempestFacilityDistricts()');
    expect(overworldSceneSource).toContain('detail.title');
  });

  it('setzt eine gehaltene Touch-Richtung auch beim Loslassen neben dem Steuerkreuz zurück', () => {
    expect(overworldSceneSource).toContain("this.input.on('pointerup', releaseTouchDirection)");
    expect(overworldSceneSource).toContain("this.input.off('pointerup', releaseTouchDirection)");
  });
});
