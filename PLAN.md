# Tempest - Chronik: Offene Aufgaben

Diese Datei enthaelt ausschliesslich noch nicht abgeschlossene Arbeit.
Abgeschlossene Phasen stehen in `docs/PROJECT_KNOWLEDGE.md` und der Git-Historie.

Status:

- `[~]` wird bereits in dem genannten Worktree bearbeitet.
- `[ ]` ist offen und darf gemaess `AGENTS.md` uebernommen werden.

## Laufende Arbeit

- [x] Phase 238 — Options-Touchziele auf 44 px (abgeschlossen im isolierten
  Worktree). Pfeil-/Toggle-Buttons sind 44×44 px; „Zurück“ nutzt statt des
  lokalen 40-px-Duplikats den vorhandenen `addUiTextButton` mit 44 px Höhe.
  Das Neuzeilenraster verhindert Überlappungen. Akzeptanz: Randklick am Touchziel
  im Desktop-/Mobile-Chromium-Smoke 2/2 ✓, Typecheck ✓, 852 Unit-Tests inklusive
  Balance-Harness ✓, Build ✓.

## Integrationswarteschlange

- Keine offenen Integrationen.

## Worktree-Setup

Phasen werden strikt in `/worktree/tempest-phase-<nr>-<kurzname>` auf dem
Branch `phase-<nr>-<kurzname>` umgesetzt. Worktrees werden erst nach Merge,
Sauberkeitspruefung und Archivierung entfernt.
