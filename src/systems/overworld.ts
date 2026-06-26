// Reine Oberwelt-Logik: Kachelraster, Begehbarkeit, rasterbasierte Bewegung.
// Phaser-/DOM-frei → headless testbar. Die Szene rendert nur das Ergebnis.

export type Dir = 'up' | 'down' | 'left' | 'right';

export const DIR_VEC: Record<Dir, { x: number; y: number }> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

export const FLOOR = 0;
export const WALL = 1;

export interface Vec2 {
  x: number;
  y: number;
}

export interface TileMap {
  width: number;
  height: number;
  tiles: number[][]; // [y][x]
  spawn: Vec2;
}

/** true, wenn die Kachel im Raster liegt und keine Wand ist. */
export function isWalkable(map: TileMap, x: number, y: number): boolean {
  if (x < 0 || y < 0 || x >= map.width || y >= map.height) return false;
  return map.tiles[y]![x] !== WALL;
}

/** Ein Rasterschritt in eine Richtung. Liefert die Zielkachel, oder die
 *  Ausgangskachel (unverändert), wenn der Weg blockiert/außerhalb ist. */
export function tryStep(map: TileMap, pos: Vec2, dir: Dir): Vec2 {
  const v = DIR_VEC[dir];
  const nx = pos.x + v.x;
  const ny = pos.y + v.y;
  return isWalkable(map, nx, ny) ? { x: nx, y: ny } : { x: pos.x, y: pos.y };
}

/** Baut eine TileMap aus ASCII-Zeilen: '#' = Wand, alles andere = Boden. */
export function parseMap(rows: readonly string[], spawn: Vec2): TileMap {
  const tiles = rows.map((row) => Array.from(row, (c) => (c === '#' ? WALL : FLOOR)));
  const width = tiles.reduce((m, r) => Math.max(m, r.length), 0);
  // Zeilen auf einheitliche Breite mit Boden auffüllen.
  for (const r of tiles) while (r.length < width) r.push(FLOOR);
  return { width, height: tiles.length, tiles, spawn };
}
