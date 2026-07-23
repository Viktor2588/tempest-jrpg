# Tempest - Chronik: Offene Aufgaben

Diese Datei enthaelt ausschliesslich noch nicht abgeschlossene Arbeit.
Abgeschlossene Phasen stehen in `docs/PROJECT_KNOWLEDGE.md` und der Git-Historie.

Status:

- `[~]` wird bereits in dem genannten Worktree bearbeitet.
- `[ ]` ist offen und darf gemaess `AGENTS.md` uebernommen werden.

## Laufende Arbeit

- [x] Phase 282: Kampf-Feedback fuer MP-Aenderungen
  - Worktree: `/worktree/tempest-phase-282-feedback-mp`
  - Reine MP-Aenderungen erzeugen nun Feedback-Events; Verbrauch und
    Regeneration erscheinen als versetzte blaue MP-Anzeige im Kampf.
  - Abnahme: `bun run typecheck`, `bun run test` (874 Tests), `bun run build`
    und mobiler Orientierungssmoke erfolgreich.

## Integrationswarteschlange

- Keine offenen Integrationen.

## Worktree-Setup

Phasen werden strikt in `/worktree/tempest-phase-<nr>-<kurzname>` auf dem
Branch `phase-<nr>-<kurzname>` umgesetzt. Worktrees werden erst nach Merge,
Sauberkeitspruefung und Archivierung entfernt.
