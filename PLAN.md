# Tempest - Chronik: Offene Aufgaben

Diese Datei enthaelt ausschliesslich noch nicht abgeschlossene Arbeit.
Abgeschlossene Phasen stehen in `docs/PROJECT_KNOWLEDGE.md` und der Git-Historie.

Status:

- `[~]` wird bereits in dem genannten Worktree bearbeitet.
- `[ ]` ist offen und darf gemaess `AGENTS.md` uebernommen werden.

## Laufende Arbeit

- `[x]` **Phase 274 — Kampf-Balance-Pass (abgeschlossen)**
  - Worktree: `/worktree/tempest-phase-274-balance-pass`
  - Branch: `phase-274-balance-pass`
  - Ziel: Story-Kämpfe fordernder; Benchmark-Guardrails wo sinnvoll.
  - Abnahme: deterministic Carryover-Harness für Predator/Sage/Mimic grün; Ziellevel- und +8-Overgrind-Guardrails für Mordrahn, Geld und Ifrit aktiv.
  - Checks: `bun run typecheck`, `bun run test` (873), `bun run build`; kein E2E nötig (nur Kampf-Daten und Headless-Harness).

- Keine offene oder laufende Phase.

## Integrationswarteschlange

- Keine offenen Integrationen.

## Worktree-Setup

Phasen werden strikt in `/worktree/tempest-phase-<nr>-<kurzname>` auf dem
Branch `phase-<nr>-<kurzname>` umgesetzt. Worktrees werden erst nach Merge,
Sauberkeitspruefung und Archivierung entfernt.
