# Tempest - Chronik: Offene Aufgaben

Diese Datei enthaelt ausschliesslich noch nicht abgeschlossene Arbeit.
Abgeschlossene Phasen stehen in `docs/PROJECT_KNOWLEDGE.md` und der Git-Historie.

Status:

- `[~]` wird bereits in dem genannten Worktree bearbeitet.
- `[ ]` ist offen und darf gemaess `AGENTS.md` uebernommen werden.

## Laufende Arbeit

- [x] Phase 281: Eingabe-Resilienz und Smoke-Abdeckung
  - Worktree: `/worktree/tempest-phase-281-input-resilience`
  - Touch-Steuerkreuz setzt eine gehaltene Richtung jetzt bei jedem Loslassen
    innerhalb der Spielflaeche zurueck und entfernt den Listener beim
    Szenenende.
  - Abnahme: `bun run typecheck`, `bun run test` (874 Tests) und `bun run build`
    erfolgreich; mobiler Orientierungssmoke erfolgreich. Der bestehende
    umfassende mobile Game-Smoke erreichte ohne Fachfehler sein 45-Sekunden-Limit.

## Integrationswarteschlange

- Keine offenen Integrationen.

## Worktree-Setup

Phasen werden strikt in `/worktree/tempest-phase-<nr>-<kurzname>` auf dem
Branch `phase-<nr>-<kurzname>` umgesetzt. Worktrees werden erst nach Merge,
Sauberkeitspruefung und Archivierung entfernt.
