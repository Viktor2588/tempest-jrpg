# Tempest - Chronik: Offene Aufgaben

Diese Datei enthaelt ausschliesslich noch nicht abgeschlossene Arbeit.
Abgeschlossene Phasen stehen in `docs/PROJECT_KNOWLEDGE.md` und der Git-Historie.

Status:

- `[~]` wird bereits in dem genannten Worktree bearbeitet.
- `[ ]` ist offen und darf gemaess `AGENTS.md` uebernommen werden.

## Laufende Arbeit

- `[x]` **Phase 276 — Audio-Erweiterung (Musik & SFX)**
  - Worktree: `/worktree/tempest-phase-276-audio`
  - Problem: Nur wenige Kenney-Motive (Title/Field/Battle); Szenen und UI
    wirken klanglich dünn.
  - Ziel: mehr stimmungsvolle Loops pro Region/Boss/Menü plus knappe UI-/
    Combat-SFX, ohne die Settings-Pipeline zu brechen.
  - Scope: OGG-Assets, `src/audio/`-Mapping, Options-Lautstärke und
    Mute-Pfade prüfen.
  - Abnahme: vier neue CC0-Motive für Siedlung, Wildnis, Menü und Boss;
    bestehende UI-/Combat-SFX und die Master×Musik-Lautstärke werden weiterverwendet.
    `bun run typecheck`, 875 Unit-Tests, Build und Desktop-Chromium-Smoke
    (Title → Overworld → Menü → Battle) grün.

## Integrationswarteschlange

- Keine offenen Integrationen.

## Worktree-Setup

Phasen werden strikt in `/worktree/tempest-phase-<nr>-<kurzname>` auf dem
Branch `phase-<nr>-<kurzname>` umgesetzt. Worktrees werden erst nach Merge,
Sauberkeitspruefung und Archivierung entfernt.
