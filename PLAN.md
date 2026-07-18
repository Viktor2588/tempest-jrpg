# Tempest - Chronik: Offene Aufgaben

Diese Datei enthaelt ausschliesslich noch nicht abgeschlossene Arbeit.
Abgeschlossene Phasen stehen in `docs/PROJECT_KNOWLEDGE.md` und der Git-Historie.

Status:

- `[~]` wird bereits in dem genannten Worktree bearbeitet.
- `[ ]` ist offen und darf gemaess `AGENTS.md` uebernommen werden.

## Laufende Arbeit

- [x] **Phase 255 – Kampfitems im Menü nicht verbrauchen**
  - Worktree: `/worktree/tempest-phase-255-menu-item-guard`
  - Nur Heilung, MP und Nebel-Ward gelten im Menü als nutzbar; Kampf-only-Effekte bleiben erhalten und unverbraucht.
  - Abnahme: Menü-Tests (10), Typecheck, Tests (860), Build und Inventar-Browser-Smoke bestanden.

## Integrationswarteschlange

- Keine offenen Integrationen.

## Worktree-Setup

Phasen werden strikt in `/worktree/tempest-phase-<nr>-<kurzname>` auf dem
Branch `phase-<nr>-<kurzname>` umgesetzt. Worktrees werden erst nach Merge,
Sauberkeitspruefung und Archivierung entfernt.
