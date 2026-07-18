# Tempest - Chronik: Offene Aufgaben

Diese Datei enthaelt ausschliesslich noch nicht abgeschlossene Arbeit.
Abgeschlossene Phasen stehen in `docs/PROJECT_KNOWLEDGE.md` und der Git-Historie.

Status:

- `[~]` wird bereits in dem genannten Worktree bearbeitet.
- `[ ]` ist offen und darf gemaess `AGENTS.md` uebernommen werden.

## Laufende Arbeit

- [x] **Phase 258 – Menü-Ward im Kampf nicht verbrauchen**
  - Worktree: `/worktree/tempest-phase-258-battle-item-guard`
  - `clearsight-drops` aus der Kampfliste ausblenden und im zentralen Kampfresolver ablehnen.
  - Abnahme: Kampftests (64), Typecheck, Tests (862), Build und fokussierter Browser-Smoke bestanden.

## Integrationswarteschlange

- Keine offenen Integrationen.

## Worktree-Setup

Phasen werden strikt in `/worktree/tempest-phase-<nr>-<kurzname>` auf dem
Branch `phase-<nr>-<kurzname>` umgesetzt. Worktrees werden erst nach Merge,
Sauberkeitspruefung und Archivierung entfernt.
