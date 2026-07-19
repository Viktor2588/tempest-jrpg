# Tempest - Chronik: Offene Aufgaben

Diese Datei enthaelt ausschliesslich noch nicht abgeschlossene Arbeit.
Abgeschlossene Phasen stehen in `docs/PROJECT_KNOWLEDGE.md` und der Git-Historie.

Status:

- `[~]` wird bereits in dem genannten Worktree bearbeitet.
- `[ ]` ist offen und darf gemaess `AGENTS.md` uebernommen werden.

## Laufende Arbeit

- [x] Phase 263 - Unverdrahtete UI-Mockups entfernen
  - Worktree: `/worktree/tempest-phase-263-dead-ui-assets`
  - Die ungenutzten Mockups fuer Charibdis, Story-Reihenfolge und
    Gebietswechsel samt veralteten Provenienzeilen entfernen.
  - Abnahme: Alle drei Dateien und Ledgerzeilen sind entfernt; der Asset-Test
    verhindert ihre versehentliche Rueckkehr ohne Laufzeit-Wiring.
  - Checks: `git diff --check`; `bun run typecheck`; `bun run test`
    (101 Dateien, 867 Tests); `bun run build`; Desktop-Chromium-Smoke fuer
    Titel, Oberwelt, Menue und Kampf (1/1).

## Integrationswarteschlange

- Keine offenen Integrationen.

## Worktree-Setup

Phasen werden strikt in `/worktree/tempest-phase-<nr>-<kurzname>` auf dem
Branch `phase-<nr>-<kurzname>` umgesetzt. Worktrees werden erst nach Merge,
Sauberkeitspruefung und Archivierung entfernt.
