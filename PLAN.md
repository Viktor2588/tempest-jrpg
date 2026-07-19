# Tempest - Chronik: Offene Aufgaben

Diese Datei enthaelt ausschliesslich noch nicht abgeschlossene Arbeit.
Abgeschlossene Phasen stehen in `docs/PROJECT_KNOWLEDGE.md` und der Git-Historie.

Status:

- `[~]` wird bereits in dem genannten Worktree bearbeitet.
- `[ ]` ist offen und darf gemaess `AGENTS.md` uebernommen werden.

## Laufende Arbeit

- [x] **Phase 267 – Uebergrosse Sprite-Quellen verkleinern**
  - Worktree: `/worktree/tempest-phase-267-large-sprites`
  - Die vier verbliebenen 1254- bis 1536-px-Sprite-Ausreisser wurden bei
    unveraendertem Seitenverhaeltnis auf maximal 1024 px verkleinert: zusammen
    1.177.454 -> 759.012 Bytes (-35,5 %).
  - Abnahme: Sichtpruefung aller vier WebPs; `npm run typecheck`; `npm test`
    (871/871); `npm run build`; Desktop-Chromium-Smokes fuer Start/Kampf,
    Freiheitsakademie und Ramiris-Labyrinth (3/3).

## Integrationswarteschlange

- Keine offenen Integrationen.

## Worktree-Setup

Phasen werden strikt in `/worktree/tempest-phase-<nr>-<kurzname>` auf dem
Branch `phase-<nr>-<kurzname>` umgesetzt. Worktrees werden erst nach Merge,
Sauberkeitspruefung und Archivierung entfernt.
