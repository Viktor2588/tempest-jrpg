# Tempest - Chronik: Offene Aufgaben

Diese Datei enthaelt ausschliesslich noch nicht abgeschlossene Arbeit.
Abgeschlossene Phasen stehen in `docs/PROJECT_KNOWLEDGE.md` und der Git-Historie.

Status:

- `[~]` wird bereits in dem genannten Worktree bearbeitet.
- `[ ]` ist offen und darf gemaess `AGENTS.md` uebernommen werden.

## Laufende Arbeit

- [x] **Phase 268 – UI-Quellenbudget**
  - Worktree: `/worktree/tempest-phase-268-ui-source-budget`
  - Zwei nur klein gerenderte UI-WebPs auf eine passende 512×256-Quelle
    verkleinern und das Quellenbudget per Test absichern.
  - Abnahme: zusammen 204.514 → 35.812 Bytes (-82,5 %), `git diff --check`,
    Asset-Test (27/27), Typecheck, 872 Unit-Tests, Build und fokussierter
    Desktop-Chromium-Smoke (2/2).

## Integrationswarteschlange

- Keine offenen Integrationen.

## Worktree-Setup

Phasen werden strikt in `/worktree/tempest-phase-<nr>-<kurzname>` auf dem
Branch `phase-<nr>-<kurzname>` umgesetzt. Worktrees werden erst nach Merge,
Sauberkeitspruefung und Archivierung entfernt.
