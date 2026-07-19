# Tempest - Chronik: Offene Aufgaben

Diese Datei enthaelt ausschliesslich noch nicht abgeschlossene Arbeit.
Abgeschlossene Phasen stehen in `docs/PROJECT_KNOWLEDGE.md` und der Git-Historie.

Status:

- `[~]` wird bereits in dem genannten Worktree bearbeitet.
- `[ ]` ist offen und darf gemaess `AGENTS.md` uebernommen werden.

## Laufende Arbeit

- [x] **Phase 266 – Uebergrosse Kampf-Hintergruende normalisieren**
  - Worktree: `/worktree/tempest-phase-266-battle-backgrounds`
  - Die zwei 1672×941-Ausreisser fuer Kolosseum und Invasion wurden auf das
    bestehende 1280×720-Format aller anderen Kampf-Hintergruende verkleinert:
    zusammen 692.966 -> 411.896 Bytes (-40,6 %).
  - Abnahme: Sichtpruefung beider WebPs; `npm run typecheck`; `npm test`
    (870/870); `npm run build`; Desktop-Chromium-Smokes fuer Kolosseum und
    Tempest-Invasion (2/2).

## Integrationswarteschlange

- Keine offenen Integrationen.

## Worktree-Setup

Phasen werden strikt in `/worktree/tempest-phase-<nr>-<kurzname>` auf dem
Branch `phase-<nr>-<kurzname>` umgesetzt. Worktrees werden erst nach Merge,
Sauberkeitspruefung und Archivierung entfernt.
