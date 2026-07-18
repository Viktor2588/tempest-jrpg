# Tempest - Chronik: Offene Aufgaben

Diese Datei enthaelt ausschliesslich noch nicht abgeschlossene Arbeit.
Abgeschlossene Phasen stehen in `docs/PROJECT_KNOWLEDGE.md` und der Git-Historie.

Status:

- `[~]` wird bereits in dem genannten Worktree bearbeitet.
- `[ ]` ist offen und darf gemaess `AGENTS.md` uebernommen werden.

## Laufende Arbeit

- [x] **Phase 247 – Regionsassets im Questlog**
  - Worktree: `/worktree/tempest-phase-247-quest-region-art`
  - Aktuelle Questziele zeigen das bereits vorhandene Banner ihrer Karte; abgeschlossene Quests verwenden ihren letzten verorteten Schritt.
  - Abnahme: `git diff --check`, Daten-/Asset-Tests (56/56), Typecheck, 855 Unit-Tests, Build und fokussierter Questlog-Browser-Smoke (1/1).

## Integrationswarteschlange

- Keine offenen Integrationen.

## Worktree-Setup

Phasen werden strikt in `/worktree/tempest-phase-<nr>-<kurzname>` auf dem
Branch `phase-<nr>-<kurzname>` umgesetzt. Worktrees werden erst nach Merge,
Sauberkeitspruefung und Archivierung entfernt.
