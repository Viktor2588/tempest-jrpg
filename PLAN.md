# Tempest - Chronik: Offene Aufgaben

Diese Datei enthaelt ausschliesslich noch nicht abgeschlossene Arbeit.
Abgeschlossene Phasen stehen in `docs/PROJECT_KNOWLEDGE.md` und der Git-Historie.

Status:

- `[~]` wird bereits in dem genannten Worktree bearbeitet.
- `[ ]` ist offen und darf gemaess `AGENTS.md` uebernommen werden.

## Laufende Arbeit

- [x] **Phase 259 – Items ohne Wirkung nicht verbrauchen**
  - Worktree: `/worktree/tempest-phase-259-no-effect-items`
  - Heil- und MP-Items bei bereits vollen Ressourcen in Menü und Kampf ablehnen.
  - Abnahme: Menü-/Kampftests (77), Typecheck, Tests (865), Build und fokussierter Browser-Smoke bestanden.

## Integrationswarteschlange

- Keine offenen Integrationen.

## Worktree-Setup

Phasen werden strikt in `/worktree/tempest-phase-<nr>-<kurzname>` auf dem
Branch `phase-<nr>-<kurzname>` umgesetzt. Worktrees werden erst nach Merge,
Sauberkeitspruefung und Archivierung entfernt.
