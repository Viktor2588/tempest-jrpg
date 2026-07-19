# Tempest - Chronik: Offene Aufgaben

Diese Datei enthaelt ausschliesslich noch nicht abgeschlossene Arbeit.
Abgeschlossene Phasen stehen in `docs/PROJECT_KNOWLEDGE.md` und der Git-Historie.

Status:

- `[~]` wird bereits in dem genannten Worktree bearbeitet.
- `[ ]` ist offen und darf gemaess `AGENTS.md` uebernommen werden.

## Laufende Arbeit

- [x] **Phase 269 – HUD-Quellenbudget**
  - Worktree: `/worktree/tempest-phase-269-hud-source-budget`
  - Drei höchstens 320×180 gerenderte HUD-WebPs auf passende 640×360-Quellen
    verkleinern und das Budget per Asset-Test absichern.
  - Abnahme: zusammen 366.432 → 130.014 Bytes (-64,5 %), `git diff --check`,
    Asset-Test (28/28), Typecheck, 873 Unit-Tests, Build und fokussierter
    Desktop-Chromium-Smoke (2/2).

## Integrationswarteschlange

- Keine offenen Integrationen.

## Worktree-Setup

Phasen werden strikt in `/worktree/tempest-phase-<nr>-<kurzname>` auf dem
Branch `phase-<nr>-<kurzname>` umgesetzt. Worktrees werden erst nach Merge,
Sauberkeitspruefung und Archivierung entfernt.
