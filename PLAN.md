# Tempest - Chronik: Offene Aufgaben

Diese Datei enthaelt ausschliesslich noch nicht abgeschlossene Arbeit.
Abgeschlossene Phasen stehen in `docs/PROJECT_KNOWLEDGE.md` und der Git-Historie.

Status:

- `[~]` wird bereits in dem genannten Worktree bearbeitet.
- `[ ]` ist offen und darf gemaess `AGENTS.md` uebernommen werden.

## Laufende Arbeit

- [x] **Phase 246 – Einrichtungen-Kartenlayout**
  - Worktree: `/worktree/tempest-phase-246-facility-card-layout`
  - Die vier Einrichtungskarten teilen sich ein geprüftes Layout und bleiben mit Texten vollständig innerhalb des 960×540-Menüs.
  - Abnahme: `git diff --check`, Typecheck, 854 Unit-Tests, Build und fokussierter Einrichtungen-Browser-Smoke (1/1).

## Integrationswarteschlange

- Keine offenen Integrationen.

## Worktree-Setup

Phasen werden strikt in `/worktree/tempest-phase-<nr>-<kurzname>` auf dem
Branch `phase-<nr>-<kurzname>` umgesetzt. Worktrees werden erst nach Merge,
Sauberkeitspruefung und Archivierung entfernt.
