// Reine Ableitung von Kampf-Feedback aus zwei Zustands-Schnappschüssen
// (vorher/nachher). Phaser-/DOM-frei → headless testbar. Die Szene nutzt das
// Ergebnis nur, um Schadens-/Heilzahlen, Treffer-Flash, Shake und Tod-Effekte
// auszulösen — ohne die Kampf-Engine zu verändern.

export interface UnitSnap {
  id: string;
  hp: number;
  mp: number;
  dead: boolean;
}

export interface FeedbackEvent {
  id: string;
  hpDelta: number; // negativ = Schaden, positiv = Heilung
  mpDelta: number;
  died: boolean;
}

/** Minimal-Schnappschuss aus beliebigen Einheiten-Views (id/hp/mp/dead). */
export function snapshot(units: readonly { id: string; hp: number; mp: number; dead: boolean }[]): UnitSnap[] {
  return units.map((u) => ({ id: u.id, hp: u.hp, mp: u.mp, dead: u.dead }));
}

/** Differenz zweier Schnappschüsse → nur Einheiten mit LP-Änderung oder Tod. */
export function diffFeedback(before: readonly UnitSnap[], after: readonly UnitSnap[]): FeedbackEvent[] {
  const prev = new Map(before.map((u) => [u.id, u]));
  const events: FeedbackEvent[] = [];
  for (const now of after) {
    const was = prev.get(now.id);
    if (!was) continue;
    const hpDelta = now.hp - was.hp;
    const mpDelta = now.mp - was.mp;
    const died = !was.dead && now.dead;
    if (hpDelta !== 0 || died) events.push({ id: now.id, hpDelta, mpDelta, died });
  }
  return events;
}

/** Gesamtschaden (für Shake-Stärke etc.). */
export function totalDamage(events: readonly FeedbackEvent[]): number {
  return events.reduce((sum, e) => sum + (e.hpDelta < 0 ? -e.hpDelta : 0), 0);
}
