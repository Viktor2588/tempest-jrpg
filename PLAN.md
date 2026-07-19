# Tempest - Chronik: Offene Aufgaben

Diese Datei enthaelt ausschliesslich noch nicht abgeschlossene Arbeit.
Abgeschlossene Phasen stehen in `docs/PROJECT_KNOWLEDGE.md` und der Git-Historie.

Status:

- `[~]` wird bereits in dem genannten Worktree bearbeitet.
- `[ ]` ist offen und darf gemaess `AGENTS.md` uebernommen werden.

## Laufende Arbeit

- [x] **Phase 270 – Dialog-Hinweis zuschneiden**
  - Worktree: `/worktree/tempest-phase-270-dialog-hint-crop`
  - Nur den tatsächlich gerenderten Tastatur-Hinweis als 300×300-WebP behalten
    und den dadurch überflüssigen Phaser-Frame entfernen.
  - Abnahme: 97.816 → 16.664 Bytes (-83,0 %), `git diff --check`, Asset-Test
    (28/28), Typecheck, 873 Unit-Tests, Build und fokussierter
    Desktop-Chromium-Smoke (1/1).

## Integrationswarteschlange

- Keine offenen Integrationen.

## Worktree-Setup

Phasen werden strikt in `/worktree/tempest-phase-<nr>-<kurzname>` auf dem
Branch `phase-<nr>-<kurzname>` umgesetzt. Worktrees werden erst nach Merge,
Sauberkeitspruefung und Archivierung entfernt.
