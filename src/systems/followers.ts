// Reine Follower-Logik: Begleiter folgen dem Spieler entlang seiner zuletzt
// betretenen Kacheln (Breadcrumb-Trail), damit sie den Weg nachlaufen statt
// durch Wände zu schneiden. Phaser-/DOM-frei → headless testbar.

import type { Vec2 } from './overworld';

// Abstand (in Trail-Schritten) zwischen aufeinanderfolgenden Akteuren. 1 = jeder
// Begleiter steht genau eine vom Spieler zuletzt betretene Kachel hinter dem
// Vordermann (klassische „Schlange").
export const FOLLOWER_SPACING = 1;

/** Länge der Positionshistorie, die `count` Begleiter bei `spacing` benötigen. */
function trailCapacity(count: number, spacing: number): number {
  return Math.max(1, count) * Math.max(1, spacing) + 1;
}

/** Startet den Trail: alle Akteure stehen zunächst auf der Startkachel. */
export function initFollowerTrail(start: Vec2): Vec2[] {
  return [{ x: start.x, y: start.y }];
}

/** Neue Spielerkachel vorne anhängen und den Trail auf die benötigte Länge
 *  kürzen. Nur bei echter Bewegung aufrufen (eine Kachel pro Schritt). */
export function stepFollowerTrail(
  trail: readonly Vec2[],
  playerTile: Vec2,
  count: number,
  spacing = FOLLOWER_SPACING
): Vec2[] {
  const next = [{ x: playerTile.x, y: playerTile.y }, ...trail];
  return next.slice(0, trailCapacity(count, spacing));
}

/** Zielkachel je Begleiter: `spacing` Schritte hinter dem Vordermann. Solange
 *  der Trail sich füllt, klemmt sie auf die älteste bekannte Kachel (Akteure
 *  starten gestapelt und ziehen sich beim Laufen auseinander). */
export function followerTiles(
  trail: readonly Vec2[],
  count: number,
  spacing = FOLLOWER_SPACING
): Vec2[] {
  const out: Vec2[] = [];
  const last = trail[trail.length - 1] ?? { x: 0, y: 0 };
  for (let k = 0; k < count; k++) {
    const idx = (k + 1) * spacing;
    const tile = trail[Math.min(idx, trail.length - 1)] ?? last;
    out.push({ x: tile.x, y: tile.y });
  }
  return out;
}
