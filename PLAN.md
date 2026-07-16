# Tempest - Chronik: Offene Aufgaben

Diese Datei enthaelt ausschliesslich noch nicht abgeschlossene Arbeit.
Abgeschlossene Phasen stehen in `docs/PROJECT_KNOWLEDGE.md` und der Git-Historie.

Status:

- `[~]` wird bereits in dem genannten Worktree bearbeitet.
- `[ ]` ist offen und darf gemaess `AGENTS.md` uebernommen werden.

## Laufende Arbeit

- [x] **Phase 240 – UI-Browser-Audit**
  - Worktree: `/worktree/tempest-phase-240-ui-browser-audit`
  - Abnahme: Hochkant-Handys erhalten einen lesbaren Querformat-Hinweis; die
    Talentbaum-Maske beschneidet beim Wechsel zu Ranga keine spaeteren Tabs.
  - Checks: `git diff --check`, Typecheck, 852 Unit-Tests, Build, visueller
    Desktop-/Mobile-Clickthrough sowie Kernfluss-, Hochkant-, Masken- und
    HiDPI-Browser-Smokes.

## Integrationswarteschlange

- Keine offenen Integrationen.

## Worktree-Setup

Phasen werden strikt in `/worktree/tempest-phase-<nr>-<kurzname>` auf dem
Branch `phase-<nr>-<kurzname>` umgesetzt. Worktrees werden erst nach Merge,
Sauberkeitspruefung und Archivierung entfernt.
