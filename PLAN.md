# Tempest - Chronik: Offene Aufgaben

Diese Datei enthaelt ausschliesslich noch nicht abgeschlossene Arbeit.
Abgeschlossene Phasen stehen in `docs/PROJECT_KNOWLEDGE.md` und der Git-Historie.

Status:

- `[~]` wird bereits in dem genannten Worktree bearbeitet.
- `[ ]` ist offen und darf gemaess `AGENTS.md` uebernommen werden.

## Laufende Arbeit

- [x] Phase 262 - Textfreies Boss-Emblem im Kampf
  - Worktree: `/worktree/tempest-phase-262-boss-emblem`
  - Das unverdrahtete Phase-118-Mockup durch ein sauberes projektgeneriertes
    Emblem ersetzen und Boss-Einheiten sichtbar markieren.
  - Abnahme: Boss-Einheiten tragen das textfreie Emblem; das alte Mockup ist
    entfernt und die Bildquelle samt Freistellung ist in `ASSETS.md` belegt.
  - Checks: `git diff --check`; `bun run typecheck`; `bun run test`
    (101 Dateien, 866 Tests); `bun run build`; 2 fokussierte Desktop-Chromium-
    Smokes fuer Asset-Laden und Milim-Bosskampf.

## Integrationswarteschlange

- Keine offenen Integrationen.

## Worktree-Setup

Phasen werden strikt in `/worktree/tempest-phase-<nr>-<kurzname>` auf dem
Branch `phase-<nr>-<kurzname>` umgesetzt. Worktrees werden erst nach Merge,
Sauberkeitspruefung und Archivierung entfernt.
