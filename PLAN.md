# Tempest - Chronik: Offene Aufgaben

Diese Datei enthaelt ausschliesslich noch nicht abgeschlossene Arbeit.
Abgeschlossene Phasen stehen in `docs/PROJECT_KNOWLEDGE.md` und der Git-Historie.

Status:

- `[~]` wird bereits in dem genannten Worktree bearbeitet.
- `[ ]` ist offen und darf gemaess `AGENTS.md` uebernommen werden.

## Laufende Arbeit

- [x] **Phase 241 – UI-Kartenlayout**
  - Worktree: `/worktree/tempest-phase-241-ui-card-layout`
  - Abnahme: Shop-Zeile, Formationsschalter und Bewohneraktionen bleiben auf
    Desktop und Mobile innerhalb ihrer jeweiligen Panels.
  - Checks: `git diff --check`, Typecheck, 852 Unit-Tests, Build, erneuter
    46-Zustaende-Clickthrough und Party-/Shop-/Bewohner-Browser-Smokes (6/6;
    Desktop-Party nach parallelem Screenshot-Timeout isoliert bestaetigt).

## Integrationswarteschlange

- Keine offenen Integrationen.

## Worktree-Setup

Phasen werden strikt in `/worktree/tempest-phase-<nr>-<kurzname>` auf dem
Branch `phase-<nr>-<kurzname>` umgesetzt. Worktrees werden erst nach Merge,
Sauberkeitspruefung und Archivierung entfernt.
