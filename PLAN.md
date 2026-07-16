# Tempest - Chronik: Offene Aufgaben

Diese Datei enthaelt ausschliesslich noch nicht abgeschlossene Arbeit.
Abgeschlossene Phasen stehen in `docs/PROJECT_KNOWLEDGE.md` und der Git-Historie.

Status:

- `[~]` wird bereits in dem genannten Worktree bearbeitet.
- `[ ]` ist offen und darf gemaess `AGENTS.md` uebernommen werden.

## Laufende Arbeit

- [x] **Phase 242 – Ausrüstungskarten-Layout**
  - Worktree: `/worktree/tempest-phase-242-equipment-layout`
  - Ausrüstungsmetadaten in eine kompakte Kopfzeile gezogen und vier 82-px-Karten
    mit getrennten 44-px-Aktionsflächen in ein gemeinsames Layout überführt.
  - Abnahme: Typecheck, 853 Unit-Tests, Produktions-Build sowie fokussierter
    Playwright-Smoke auf Desktop und Mobile; zusätzlich visuell auf Mobile geprüft.

## Integrationswarteschlange

- Keine offenen Integrationen.

## Worktree-Setup

Phasen werden strikt in `/worktree/tempest-phase-<nr>-<kurzname>` auf dem
Branch `phase-<nr>-<kurzname>` umgesetzt. Worktrees werden erst nach Merge,
Sauberkeitspruefung und Archivierung entfernt.
