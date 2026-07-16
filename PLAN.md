# Tempest - Chronik: Offene Aufgaben

Diese Datei enthaelt ausschliesslich noch nicht abgeschlossene Arbeit.
Abgeschlossene Phasen stehen in `docs/PROJECT_KNOWLEDGE.md` und der Git-Historie.

Status:

- `[~]` wird bereits in dem genannten Worktree bearbeitet.
- `[ ]` ist offen und darf gemaess `AGENTS.md` uebernommen werden.

## Laufende Arbeit

- [x] **Phase 244 – Talentbaum-Grenzen**
  - Worktree: `/worktree/tempest-phase-244-talent-tree-bounds`
  - Runtime und Tests verwenden dieselbe `DEFAULT_SPEC_LAYOUT`-Geometrie; der
    tiefste Knoten endet nun innerhalb der bestehenden Maskenunterkante.
  - Abnahme: Typecheck, 853 Unit-Tests, Build, kompakter Desktop-/Mobile-
    Clickthrough ohne Browserfehler und Talentbaum-/Ranga-Smoke (2/2).

## Integrationswarteschlange

- Keine offenen Integrationen.

## Worktree-Setup

Phasen werden strikt in `/worktree/tempest-phase-<nr>-<kurzname>` auf dem
Branch `phase-<nr>-<kurzname>` umgesetzt. Worktrees werden erst nach Merge,
Sauberkeitspruefung und Archivierung entfernt.
