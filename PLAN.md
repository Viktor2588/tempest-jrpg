# Tempest - Chronik: Offene Aufgaben

Diese Datei enthaelt ausschliesslich noch nicht abgeschlossene Arbeit.
Abgeschlossene Phasen stehen in `docs/PROJECT_KNOWLEDGE.md` und der Git-Historie.

Status:

- `[~]` wird bereits in dem genannten Worktree bearbeitet.
- `[ ]` ist offen und darf gemaess `AGENTS.md` uebernommen werden.

## Laufende Arbeit

- [x] Phase 239 — Speicherstand-Touchziele auf 44 px (abgeschlossen im
  isolierten Worktree). Der gemeinsame lokale Slot-Button ist nun 44 px hoch;
  Fortsetzen, Löschen, Neues Spiel und Zurück profitieren ohne neuen Renderpfad.
  Akzeptanz: Randklick startet einen leeren Slot im Desktop-/Mobile-Chromium-
  Smoke 2/2 ✓, Typecheck ✓, 852 Unit-Tests inklusive Balance-Harness ✓, Build ✓.

## Integrationswarteschlange

- Keine offenen Integrationen.

## Worktree-Setup

Phasen werden strikt in `/worktree/tempest-phase-<nr>-<kurzname>` auf dem
Branch `phase-<nr>-<kurzname>` umgesetzt. Worktrees werden erst nach Merge,
Sauberkeitspruefung und Archivierung entfernt.
