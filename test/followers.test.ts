import { describe, it, expect } from 'vitest';
import {
  FOLLOWER_SPACING,
  followerTiles,
  initFollowerTrail,
  stepFollowerTrail
} from '../src/systems/followers';
import type { Vec2 } from '../src/systems/overworld';

describe('follower trail', () => {
  it('startet mit allen Begleitern auf der Startkachel', () => {
    const trail = initFollowerTrail({ x: 3, y: 4 });
    expect(followerTiles(trail, 2)).toEqual([
      { x: 3, y: 4 },
      { x: 3, y: 4 }
    ]);
  });

  it('lässt Begleiter dem Pfad des Spielers folgen (nicht durch Wände)', () => {
    // Spieler läuft eine L-Kurve: rechts, rechts, runter.
    const path: Vec2[] = [
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 3, y: 1 },
      { x: 3, y: 2 }
    ];
    let trail = initFollowerTrail(path[0]!);
    for (const tile of path.slice(1)) trail = stepFollowerTrail(trail, tile, 2);

    // Spieler steht auf dem letzten Pfadpunkt; die zwei Begleiter besetzen die
    // beiden zuvor betretenen Kacheln → exakt der Weg, keine Diagonale/Wand.
    expect(followerTiles(trail, 2)).toEqual([
      { x: 3, y: 1 },
      { x: 2, y: 1 }
    ]);
  });

  it('kürzt den Trail auf die für die Begleiterzahl nötige Länge', () => {
    let trail = initFollowerTrail({ x: 0, y: 0 });
    for (let x = 1; x <= 10; x++) trail = stepFollowerTrail(trail, { x, y: 0 }, 1);
    // count=1, spacing=1 → Kapazität 2 (aktuelle + eine hintere Kachel).
    expect(trail.length).toBe(2);
    expect(followerTiles(trail, 1)).toEqual([{ x: 9, y: 0 }]);
  });

  it('respektiert größeren Abstand (spacing)', () => {
    let trail = initFollowerTrail({ x: 0, y: 0 });
    for (let x = 1; x <= 5; x++) trail = stepFollowerTrail(trail, { x, y: 0 }, 1, 2);
    // Spieler bei x=5, Begleiter zwei Schritte dahinter bei x=3.
    expect(followerTiles(trail, 1, 2)).toEqual([{ x: 3, y: 0 }]);
  });

  it('Standardabstand ist eine Kachel', () => {
    expect(FOLLOWER_SPACING).toBe(1);
  });
});
