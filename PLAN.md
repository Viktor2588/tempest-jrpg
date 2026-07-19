# Tempest - Chronik: Offene Aufgaben

Diese Datei enthaelt ausschliesslich noch nicht abgeschlossene Arbeit.
Abgeschlossene Phasen stehen in `docs/PROJECT_KNOWLEDGE.md` und der Git-Historie.

Status:

- `[~]` wird bereits in dem genannten Worktree bearbeitet.
- `[ ]` ist offen und darf gemaess `AGENTS.md` uebernommen werden.

## Laufende Arbeit

- [x] **Phase 265 – Regionsbanner-Ladegewicht reduzieren**
  - Worktree: `/worktree/tempest-phase-265-region-banners`
  - Die drei uebergrossen Regionsbanner wurden mit unveraendertem
    Seitenverhaeltnis auf maximal 1024 px Breite verkleinert: zusammen
    1.076.116 -> 374.510 Bytes (-65,2 %).
  - Abnahme: Sichtpruefung aller drei WebPs; `npm run typecheck`;
    `npm test` (869 Tests); `npm run build`; Desktop-Chromium-Smoke fuer
    Freiheitsakademie, Kolosseum und Ramiris-Labyrinth (3/3).

## Integrationswarteschlange

- Keine offenen Integrationen.

## Worktree-Setup

Phasen werden strikt in `/worktree/tempest-phase-<nr>-<kurzname>` auf dem
Branch `phase-<nr>-<kurzname>` umgesetzt. Worktrees werden erst nach Merge,
Sauberkeitspruefung und Archivierung entfernt.
