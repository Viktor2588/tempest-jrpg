# Tempest - Chronik: Offene Aufgaben

Diese Datei enthaelt ausschliesslich noch nicht abgeschlossene Arbeit.
Abgeschlossene Phasen stehen in `docs/PROJECT_KNOWLEDGE.md` und der Git-Historie.

Status:

- `[~]` wird bereits in dem genannten Worktree bearbeitet.
- `[ ]` ist offen und darf gemaess `AGENTS.md` uebernommen werden.

## Laufende Arbeit

- [x] **Phase 254 – Redundante Gegner-Texturaliase entfernen**
  - Worktree: `/worktree/tempest-phase-254-legacy-enemy-aliases`
  - Vier doppelt geladene Legacy-Aliasse entfallen; dedizierte Gegner-, Kingdom- und Placeholder-Fallbacks bleiben erhalten.
  - Abnahme: Asset-/Battle-Art-Tests (38), Typecheck, vollständige Tests (859), Build und vollständiger Battle-Browser-Smoke bestanden.

## Integrationswarteschlange

- Keine offenen Integrationen.

## Worktree-Setup

Phasen werden strikt in `/worktree/tempest-phase-<nr>-<kurzname>` auf dem
Branch `phase-<nr>-<kurzname>` umgesetzt. Worktrees werden erst nach Merge,
Sauberkeitspruefung und Archivierung entfernt.
