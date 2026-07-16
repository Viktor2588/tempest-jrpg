# Tempest - Chronik: Offene Aufgaben

Diese Datei enthaelt ausschliesslich noch nicht abgeschlossene Arbeit.
Abgeschlossene Phasen stehen in `docs/PROJECT_KNOWLEDGE.md` und der Git-Historie.

Status:

- `[~]` wird bereits in dem genannten Worktree bearbeitet.
- `[ ]` ist offen und darf gemaess `AGENTS.md` uebernommen werden.

## Laufende Arbeit

- [x] Phase 237 — PLAN auf offene Arbeit reduziert (abgeschlossen im isolierten
  Worktree). 44 historische Abschlusskarten entfernt, Datei von 1324 auf unter
  30 Zeilen reduziert;
  `docs/PROJECT_KNOWLEDGE.md` und Git-Historie bleiben das Archiv. Akzeptanz:
  `git diff --check` ✓, Typecheck ✓, 852 Unit-Tests inklusive Balance-Harness ✓,
  Build ✓; renderingneutral, daher kein Browser-Smoke erforderlich.

## Integrationswarteschlange

- Keine offenen Integrationen.

## Worktree-Setup

Phasen werden strikt in `/worktree/tempest-phase-<nr>-<kurzname>` auf dem
Branch `phase-<nr>-<kurzname>` umgesetzt. Worktrees werden erst nach Merge,
Sauberkeitspruefung und Archivierung entfernt.
