# Tempest - Chronik: Offene Aufgaben

Diese Datei enthaelt ausschliesslich noch nicht abgeschlossene Arbeit.
Abgeschlossene Phasen stehen in `docs/PROJECT_KNOWLEDGE.md` und der Git-Historie.

Status:

- `[~]` wird bereits in dem genannten Worktree bearbeitet.
- `[ ]` ist offen und darf gemaess `AGENTS.md` uebernommen werden.

## Laufende Arbeit

- `[~]` **Phase 278 — Quest-Tracker & Zielklarheit (in Bearbeitung)** ⭐ HUD-Priorität
  - Worktree: `/worktree/tempest-phase-278-quest-tracker`
  - Branch: `phase-278-quest-tracker`
  - Ziel: dediziertes Overworld-HUD „aktuelles Ziel“ + Nebenquest-Liste.

- `[~]` **Phase 271 — Menü entschlacken / UX-Überarbeitung (in Bearbeitung)** ⭐ HUD/UX
  - Worktree: `/worktree/tempest-phase-271-menu-declutter`
  - Branch: `phase-271-menu-declutter`
  - Ziel: klarere Tab-Hierarchie, weniger gleichzeitige Dichte.

- `[x]` **Phase 280 — Kampf-Präsentation & Feedback (abgeschlossen)** ⭐ HUD
  - Worktree: `/worktree/tempest-phase-280-battle-feedback`
  - Branch: `phase-280-battle-feedback`
  - Abnahme: Treffer zeigen signierte Schadens- und Treffer-/K.-o.-Labels; Großtreffer
    warnen mit einer sichtbaren Block-Aufforderung ohne unbekannte Skillnamen zu spoilern;
    Signaturen sind auf der Karte benannt und erhalten beim Auslösen Banner, Flash und VFX.
  - Checks: `npm run typecheck`, `npm run test` (102 Dateien / 879 Tests),
    `npm run build`; manueller Chromium-Kampf-Smoke (Titel → Overworld → Kampf) erfolgreich.

- `[~]` **Phase 274 — Kampf-Balance-Pass (in Bearbeitung)**
  - Worktree: `/worktree/tempest-phase-274-balance-pass`
  - Branch: `phase-274-balance-pass`
  - Ziel: Story-Kämpfe fordernder; Benchmark-Guardrails wo sinnvoll.

- `[~]` **Phase 272 — Visuelle Bugs beim Laufen (in Bearbeitung)**
  - Worktree: `/worktree/tempest-phase-272-walk-bugs`
  - Branch: `phase-272-walk-bugs`
  - Ziel: saubere Walk-Darstellung (Facing, Bob, Depth).

- `[~]` **Phase 276 — Audio-Erweiterung (Musik & SFX) (in Bearbeitung)**
  - Worktree: `/worktree/tempest-phase-276-audio`
  - Branch: `phase-276-audio`
  - Hinweis: parallel von anderem Agenten (Codex) übernommen.

- `[x]` **Phase 273 — Mehr Story-Content**
  - Worktree: `/worktree/tempest-phase-273-story-content`
  - Branch: `phase-273-story-content`
  - Problem: Story-Dichte und Zwischenbeats sind dünn.
  - Ziel: mehr Dialoge/Szenen auf Haupt- und Nebenpfaden.
  - Abnahme: 5 neue Zwischenbeats im Hauptpfad (Rat, Hain, Ahnensiegel, Grenze,
    Vorhutspur) sowie 5 Abschlussmomente auf Nebenpfaden; getrennte Szenen-Tracks
    verhindern, dass ein Nebenauftrag ungespielte Haupt- oder andere Nebenbeats verwirft.
  - Checks: `bun run typecheck`, `bun run test` (102 Dateien, 878 Tests) und
    `bun run build` erfolgreich. Browser-Smoke (`game.smoke.spec.ts`, Desktop,
    1 Worker) lief bis zum 45-s-Timeout beim Phaser-Interaktionsklick
    und war daher nicht erfolgreich.

- `[ ]` **Phase 275 — Bond-Szenen & Beziehungspfade erweitern**
  - Ziel: mehr Bond-Szenen pro Kern-Paar, Unlock-Signale.

- `[ ]` **Phase 277 — Mobile- & Touch-UX-Polish**
  - Ziel: 44px-Targets, lesbare Dichte auf 390×844 (nach 271 mergen).

- `[ ]` **Phase 279 — Overworld-Party-Präsenz (Follower/Companions)**
  - Ziel: 1–2 sichtbare Begleiter (nach 272 mergen).

- `[ ]` **Phase 281 — Siedlungs-/Facility-Wachstum spürbar machen**
  - Ziel: sichtbare Fortschrittsstufen für Tempest-Wachstum.

- `[ ]` **Phase 282 — Nebeninhalte & optionale Regionen**
  - Ziel: 2–4 lohnende Nebenpfade.

- `[ ]` **Phase 283 — Post-Game / New-Game+-Grundlage**
  - Ziel: leichte Post-Game-Schleife / NG+-Gerüst.

- `[ ]` **Phase 284 — Performance & Asset-Budget-Nachzug**
  - Ziel: stabile 960×540 auf Desktop/Mobile.

## Integrationswarteschlange

- Keine offenen Integrationen.

## Worktree-Setup

Phasen werden strikt in `/worktree/tempest-phase-<nr>-<kurzname>` auf dem
Branch `phase-<nr>-<kurzname>` umgesetzt. Worktrees werden erst nach Merge,
Sauberkeitspruefung und Archivierung entfernt.
