import { WALL, FLOOR, type TileMap, type Vec2 } from '../systems/overworld';

// Programmatisch erzeugte Karten: voller Wandrand + Innenhindernis-Blöcke,
// garantiert geschlossener Rand und einheitliche Breite. Block = [x, y, w, h].
type Block = readonly [number, number, number, number];

function buildMap(width: number, height: number, blocks: readonly Block[], spawn: Vec2): TileMap {
  const tiles: number[][] = [];
  for (let y = 0; y < height; y++) {
    const row: number[] = [];
    for (let x = 0; x < width; x++) {
      const border = x === 0 || y === 0 || x === width - 1 || y === height - 1;
      row.push(border ? WALL : FLOOR);
    }
    tiles.push(row);
  }
  for (const [bx, by, bw, bh] of blocks) {
    for (let y = by; y < by + bh && y < height - 1; y++) {
      for (let x = bx; x < bx + bw && x < width - 1; x++) tiles[y]![x] = WALL;
    }
  }
  return { width, height, tiles, spawn };
}

// Region 1: Tempest-Hain (Startgebiet, 24×16).
export const JURA_FIELD: TileMap = buildMap(24, 16, [
  [4, 2, 2, 3], [11, 3, 2, 3], [6, 9, 4, 2], [16, 8, 2, 4], [10, 11, 3, 2], [18, 3, 2, 2]
], { x: 2, y: 2 });

// Region 2: Geistmoor (22×14, offener mit verstreuten Moorinseln).
export const SPIRIT_MARSH: TileMap = buildMap(22, 14, [
  [5, 3, 2, 2], [9, 5, 3, 2], [14, 3, 2, 3], [7, 9, 2, 2], [13, 9, 3, 2], [17, 6, 2, 3]
], { x: 2, y: 2 });

// Map-Registry: mapId → TileMap. Die Overworld rendert die Karte des aktuellen
// Save-Standorts statt einer fest verdrahteten Karte.
export const MAPS: Readonly<Record<string, TileMap>> = {
  'tempest-start': JURA_FIELD,
  'spirit-marsh': SPIRIT_MARSH
};

/** Karte zur mapId; Fallback auf das Startgebiet bei unbekannter ID. */
export function getMap(mapId: string): TileMap {
  return MAPS[mapId] ?? JURA_FIELD;
}
