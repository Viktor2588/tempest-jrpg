# Tempest - Chronik: Offene Aufgaben

Diese Datei enthaelt ausschliesslich noch nicht abgeschlossene Arbeit.
Abgeschlossene Phasen stehen in `docs/PROJECT_KNOWLEDGE.md` und der Git-Historie.

Status:

- `[~]` wird bereits in dem genannten Worktree bearbeitet.
- `[ ]` ist offen und darf gemaess `AGENTS.md` uebernommen werden.

## Laufende Arbeit

- [x] Phase 264 - GitHub Actions auf Node 24 aktualisieren
  - Worktree: `/worktree/tempest-phase-264-node24-actions`
  - Die offiziellen Action-Majors in Deploy, CI und Motivationsworkflow auf
    ihre Node-24-Versionen heben und den Deprecation-Hinweis beseitigen.
  - Abnahme: Alle drei Workflows verwenden die aktuellen Node-24-Majors; der
    Release-Test deckt die gemeinsamen und Pages-spezifischen Referenzen ab.
  - Checks: `git diff --check`; Release-Test (5/5); `bun run typecheck`;
    `bun run test` (101 Dateien, 868 Tests); `bun run build`.

## Integrationswarteschlange

- Keine offenen Integrationen.

## Worktree-Setup

Phasen werden strikt in `/worktree/tempest-phase-<nr>-<kurzname>` auf dem
Branch `phase-<nr>-<kurzname>` umgesetzt. Worktrees werden erst nach Merge,
Sauberkeitspruefung und Archivierung entfernt.
