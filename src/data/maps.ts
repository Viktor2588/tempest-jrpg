import { WALL, FLOOR, type TileMap, type Vec2 } from '../systems/overworld';

// Testgebiet (Phase 1): voller Wandrand + einige Innenhindernisse, freier Spawn.
// Programmatisch erzeugt → garantiert einheitliche Breite und geschlossener Rand.
const W = 24;
const H = 16;

function buildField(): TileMap {
  const tiles: number[][] = [];
  for (let y = 0; y < H; y++) {
    const row: number[] = [];
    for (let x = 0; x < W; x++) {
      const border = x === 0 || y === 0 || x === W - 1 || y === H - 1;
      row.push(border ? WALL : FLOOR);
    }
    tiles.push(row);
  }
  // Innenhindernisse als Blöcke [x, y, breite, höhe] (lassen den Spawn frei).
  const blocks: ReadonlyArray<readonly [number, number, number, number]> = [
    [4, 2, 2, 3], [11, 3, 2, 3], [6, 9, 4, 2], [16, 8, 2, 4], [10, 11, 3, 2], [18, 3, 2, 2]
  ];
  for (const [bx, by, bw, bh] of blocks) {
    for (let y = by; y < by + bh && y < H - 1; y++) {
      for (let x = bx; x < bx + bw && x < W - 1; x++) tiles[y]![x] = WALL;
    }
  }
  const spawn: Vec2 = { x: 2, y: 2 };
  return { width: W, height: H, tiles, spawn };
}

export const JURA_FIELD: TileMap = buildField();
