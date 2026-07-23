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

- `[ ]` **Phase 275 — Bond-Szenen & Beziehungspfade erweitern**
  - Ziel: mehr Bond-Szenen pro Kern-Paar, Unlock-Signale.

- `[ ]` **Phase 277 — Mobile- & Touch-UX-Polish**
  - Ziel: 44px-Targets, lesbare Dichte auf 390×844 (nach 271 mergen).

- `[ ]` **Phase 279 — Overworld-Party-Präsenz (Follower/Companions)**
  - Ziel: 1–2 sichtbare Begleiter (nach 272 mergen).

- `[~]` **Phase 282 — Nebeninhalte & optionale Regionen (in Bearbeitung)**
  - Worktree: `/worktree/tempest-phase-282-side-content`
  - Branch: `phase-282-side-content`
  - Ziel: 2–4 lohnende Nebenpfade.

- `[x]` **Phase 283 — Post-Game / New-Game+-Grundlage**
  - Worktree: `/worktree/tempest-phase-283-postgame`
  - Branch: `phase-283-postgame`
  - Ziel: leichte Post-Game-Schleife / NG+-Gerüst.
  - Umsetzung: NG+-Kern (EndingScene + Profil + `startNewGamePlus`) existierte bereits;
    diese Phase macht den Zyklus im Save persistent und wirksam. Neues Feld
    `progression.newGamePlusCycle` (0 = Erstdurchgang), von `startNewGamePlus` je
    Durchgang +1 hochgezählt und über den mitgetragenen Progression-Zustand akkumuliert.
    `enemyScaling` eskaliert Ziel + Deckel der Gegner-Skalierung um 5 Level je Zyklus
    (Post-Game-Schleife: Replay bleibt fordernd, hochstufiges Team trivialisiert nicht;
    Erstdurchgang unverändert). Reines Add-Feld → rückwärtskompatible Save-Migration.
  - Abnahme: `bun run typecheck` grün, `bun run test` grün, `bun run build` grün.
    Neue Tests `test/newGamePlus.test.ts` (Save-Feld/Migration/Roundtrip, NG+-Increment,
    Gegner-Eskalation inkl. Zyklus-0-Regression).

- `[ ]` **Phase 284 — Performance & Asset-Budget-Nachzug**
  - Ziel: stabile 960×540 auf Desktop/Mobile.

## Integrationswarteschlange

- Keine offenen Integrationen.

## Worktree-Setup

Phasen werden strikt in `/worktree/tempest-phase-<nr>-<kurzname>` auf dem
Branch `phase-<nr>-<kurzname>` umgesetzt. Worktrees werden erst nach Merge,
Sauberkeitspruefung und Archivierung entfernt.
