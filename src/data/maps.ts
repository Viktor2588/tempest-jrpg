import { WALL, FLOOR, type TileMap, type Vec2 } from '../systems/overworld';
import { resolveTempestGrowthStage, tempestGrowthLabel, type StoryFlags } from '../systems/tempestGrowth';

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

export const TEMPEST_CAMP: TileMap = buildMap(24, 16, [
  [4, 2, 2, 2], [11, 3, 2, 3], [6, 9, 3, 2], [16, 8, 2, 4], [11, 11, 2, 2], [18, 3, 2, 2]
], { x: 2, y: 2 });

export const TEMPEST_VILLAGE: TileMap = buildMap(24, 16, [
  [4, 2, 2, 3], [11, 2, 3, 3], [6, 9, 4, 2], [16, 8, 2, 4], [10, 11, 3, 2], [18, 3, 3, 2]
], { x: 2, y: 2 });

export const TEMPEST_CITY: TileMap = buildMap(24, 16, [
  [4, 2, 2, 3], [11, 2, 3, 3], [6, 9, 4, 2], [16, 8, 3, 4], [10, 11, 3, 2], [18, 3, 3, 3],
  [14, 4, 2, 2]
], { x: 2, y: 2 });

// Prolog 1: Versiegelte Höhle (16×10, enger Kristallpfad mit zentraler Kammer).
export const SEALED_CAVE: TileMap = buildMap(16, 10, [
  [3, 2, 2, 2], [11, 2, 2, 2], [6, 5, 1, 2], [9, 5, 1, 2]
], { x: 7, y: 7 });

// Prolog 2: Goblindorf (18×12, kleiner Hub mit Hütteninseln und offenem Dorfplatz).
export const GOBLIN_VILLAGE: TileMap = buildMap(18, 12, [
  [3, 2, 3, 2], [12, 2, 3, 2], [3, 8, 3, 2], [12, 8, 3, 2], [8, 3, 2, 2]
], { x: 2, y: 6 });

// Prolog 3: Direwolf-Lichtung (18×12, offene Bossarena mit seitlichen Flankenhindernissen).
export const DIREWOLF_CLEARING: TileMap = buildMap(18, 12, [
  [4, 2, 2, 3], [12, 2, 2, 3], [4, 8, 2, 2], [12, 8, 2, 2], [8, 1, 2, 2]
], { x: 2, y: 6 });

// Region 2: Geistmoor (22×14, offener mit verstreuten Moorinseln).
export const SPIRIT_MARSH: TileMap = buildMap(22, 14, [
  [5, 3, 2, 2], [9, 5, 3, 2], [14, 3, 2, 3], [7, 9, 2, 2], [13, 9, 3, 2], [17, 6, 2, 3]
], { x: 2, y: 2 });

// Region 3: Geisterschrein-Hochland (24×14, kantiger mit Schreinterrassen).
export const SPIRIT_HIGHLANDS: TileMap = buildMap(24, 14, [
  [6, 2, 2, 3], [10, 6, 3, 2], [14, 8, 2, 3], [17, 2, 2, 3], [8, 11, 3, 2], [20, 6, 2, 3]
], { x: 2, y: 7 });

// Band-2-Nebenregion: Dwargon, das Bewaffnete Königreich (24×14, Werkstattviertel
// oben, Thronterrasse zentral, offener Handelsplatz). Sichere Stadt ohne
// Zufallskämpfe — Handel, Gericht und Schmiedehandwerk.
export const DWARGON: TileMap = buildMap(24, 14, [
  [3, 2, 2, 2], [16, 2, 3, 2], [20, 3, 2, 3], [3, 10, 2, 2], [16, 9, 3, 3], [20, 9, 2, 3]
], { x: 2, y: 7 });

// Band-2-Schlachtregion: Jura-Schlachtfeld (24×14, offenes Heerfeld mit verstreuter
// Deckung). Reine Story-/Trigger-Begegnungen (Ork-Vorhut, Orc-Disaster „Geld"),
// keine Zufallskämpfe — ein Set-Piece, kein Grindgebiet.
export const JURA_BATTLEFIELD: TileMap = buildMap(24, 14, [
  [4, 3, 2, 2], [10, 2, 3, 2], [17, 3, 2, 2], [6, 9, 3, 2], [14, 9, 3, 2], [19, 8, 2, 3]
], { x: 2, y: 7 });

// Band-2-Allianzregion: Echsen-Sumpf (22×14, Wasserläufe und Schilfinseln).
// Reine Story-/Trigger-Begegnungen (Echsenkrieger, Gabiru-Duell), keine
// Zufallskämpfe — eine fokussierte Bündnis-Episode, kein Grindgebiet.
export const LIZARDMAN_MARSH: TileMap = buildMap(22, 14, [
  [3, 3, 2, 2], [9, 3, 2, 2], [15, 3, 2, 3], [6, 9, 2, 2], [12, 9, 3, 2], [17, 7, 2, 3]
], { x: 2, y: 7 });

// Band-1-Story-Region: Glutgrotte (20×12, enge Lavakammer mit Felsblöcken).
// Reine Trigger-/Story-Begegnungen (maskierter Majin, Flammengeist Ifrit),
// keine Zufallskämpfe — Shizus Episode als fokussiertes Set-Piece.
export const EMBER_HOLLOW: TileMap = buildMap(20, 12, [
  [4, 2, 2, 2], [10, 2, 3, 2], [14, 3, 2, 2], [5, 7, 3, 2], [12, 7, 3, 2]
], { x: 2, y: 6 });

// Band-1-Diplomatieregion: Blumund (20×14, Menschenstadt mit Gildenhaus und Markt).
// Sichere Stadt ohne Zufallskämpfe — erster geordneter Menschen-/Handelskontakt
// über die Freie Gilde und Gildenmeister Fuze.
export const BLUMUND: TileMap = buildMap(20, 14, [
  [4, 2, 3, 2], [11, 2, 3, 2], [15, 3, 2, 2], [4, 9, 3, 2], [11, 9, 3, 2], [16, 8, 2, 3]
], { x: 2, y: 7 });

// Map-Registry: mapId → TileMap. Die Overworld rendert die Karte des aktuellen
// Save-Standorts statt einer fest verdrahteten Karte.
export const MAPS: Readonly<Record<string, TileMap>> = {
  'sealed-cave': SEALED_CAVE,
  'goblin-village': GOBLIN_VILLAGE,
  'direwolf-den': DIREWOLF_CLEARING,
  'tempest-start': JURA_FIELD,
  'spirit-marsh': SPIRIT_MARSH,
  'spirit-highlands': SPIRIT_HIGHLANDS,
  'dwargon': DWARGON,
  'jura-battlefield': JURA_BATTLEFIELD,
  'lizardman-marsh': LIZARDMAN_MARSH,
  'ember-hollow': EMBER_HOLLOW,
  'blumund': BLUMUND
};

/** Karte zur mapId; Fallback auf das Startgebiet bei unbekannter ID. */
export function getMap(mapId: string, flags: StoryFlags = {}): TileMap {
  if (mapId === 'tempest-start') {
    const stage = resolveTempestGrowthStage(flags);
    if (stage === 'camp') return TEMPEST_CAMP;
    if (stage === 'village') return TEMPEST_VILLAGE;
    if (stage === 'city') return TEMPEST_CITY;
  }
  return MAPS[mapId] ?? JURA_FIELD;
}

// Sichtbare Gebietsnamen für den Orientierungs-Indikator. Tempest existiert zu
// Spielbeginn noch nicht — das Startgebiet ist der Jura-Wald.
const MAP_NAMES: Readonly<Record<string, string>> = {
  'sealed-cave': 'Versiegelte Höhle',
  'goblin-village': 'Goblin-Dorf',
  'direwolf-den': 'Direwolf-Lichtung',
  'tempest-start': 'Jura-Wald',
  'spirit-marsh': 'Geistmoor',
  'spirit-highlands': 'Geisterschrein-Hochland',
  'dwargon': 'Dwargon',
  'jura-battlefield': 'Jura-Schlachtfeld',
  'lizardman-marsh': 'Echsen-Sumpf',
  'ember-hollow': 'Glutgrotte',
  'blumund': 'Blumund'
};

/** Sichtbarer Gebietsname zur mapId (für den Gebietsindikator). */
export function getMapName(mapId: string, flags: StoryFlags = {}): string {
  if (mapId === 'tempest-start') return tempestGrowthLabel(resolveTempestGrowthStage(flags));
  return MAP_NAMES[mapId] ?? 'Unbekanntes Gebiet';
}
