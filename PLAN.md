# Tempest - Chronik: Offene Aufgaben

Diese Datei enthaelt ausschliesslich noch nicht abgeschlossene Arbeit.
Abgeschlossene Phasen stehen in `docs/PROJECT_KNOWLEDGE.md` und der Git-Historie.

Status:

- `[~]` wird bereits in dem genannten Worktree bearbeitet.
- `[ ]` ist offen und darf gemaess `AGENTS.md` uebernommen werden.

## Laufende Arbeit

- [x] **Phase 248 – Regionsasset in Questdetails**
  - Worktree: `/worktree/tempest-phase-248-quest-detail-art`
  - Die Quest-Detailansicht behält das Banner des aktuellen beziehungsweise letzten verorteten Schritts bei.
  - Abnahme: `git diff --check`, Asset-Test (10/10), Typecheck, 855 Unit-Tests, Build und fokussierter Liste-zu-Details-Browser-Smoke (1/1).

## Integrationswarteschlange

- Keine offenen Integrationen.

## Worktree-Setup

Phasen werden strikt in `/worktree/tempest-phase-<nr>-<kurzname>` auf dem
Branch `phase-<nr>-<kurzname>` umgesetzt. Worktrees werden erst nach Merge,
Sauberkeitspruefung und Archivierung entfernt.
