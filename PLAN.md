# Tempest - Chronik: Offene Aufgaben

Diese Datei enthaelt ausschliesslich noch nicht abgeschlossene Arbeit.
Abgeschlossene Phasen stehen in `docs/PROJECT_KNOWLEDGE.md` und der Git-Historie.

Status:

- `[~]` wird bereits in dem genannten Worktree bearbeitet.
- `[ ]` ist offen und darf gemaess `AGENTS.md` uebernommen werden.

## Laufende Arbeit

- `[~]` **Phase 276 — Audio-Erweiterung (Musik & SFX) (in Bearbeitung)**
  - Worktree: `/worktree/tempest-phase-276-audio`
  - Branch: `phase-276-audio`
  - Hinweis: parallel von anderem Agenten (Codex) übernommen.

- `[~]` **Phase 275 — Bond-Szenen & Beziehungspfade erweitern (in Bearbeitung)**
  - Worktree: `/worktree/tempest-phase-275-bond-expansion`
  - Branch: `phase-275-bond-expansion`
  - Ziel: mehr Bond-Szenen pro Kern-Paar, Unlock-Signale.

- `[~]` **Phase 277 — Mobile- & Touch-UX-Polish (in Bearbeitung)**
  - Worktree: `/worktree/tempest-phase-277-mobile-touch`
  - Branch: `phase-277-mobile-touch`
  - Ziel: 44px-Targets, lesbare Dichte auf 390×844 (nach 271 mergen).

- `[~]` **Phase 279 — Overworld-Party-Präsenz (Follower/Companions) (in Bearbeitung)**
  - Worktree: `/worktree/tempest-phase-279-followers`
  - Branch: `phase-279-followers`
  - Ziel: 1–2 sichtbare Begleiter (nach 272 mergen).

- `[x]` **Phase 284 — Performance & Asset-Budget-Nachzug**
  - Worktree: `/worktree/tempest-phase-284-performance-budget`
  - Branch: `phase-284-performance-budget`
  - Ziel: stabile 960×540 auf Desktop/Mobile.
  - Umsetzung: Kampfhintergründe aus dem eager Preload gelöst; nur die zwei
    Einstiegs-Arenen (`sealed-cave`, `tempest-grove`) im Startpfad, alle übrigen
    19 laden bedarfsgerecht in `BattleScene` (`src/render/battleBackgroundAssets.ts`,
    `loadArenaBackground`). Die zwei größten Hintergründe (`tempest-city` 308 KB,
    `ramiris-labyrinth` 305 KB) fallen damit vom kritischen Startpfad.
  - Abnahme: `bun run typecheck` grün · `bun run test` 900/900 grün (inkl. neuer
    `test/performanceBudget.test.ts`, angepasste `battleArt`/`invasion`-Tests) ·
    `bun run build` grün (Hintergründe als separate Lazy-Chunks) ·
    hidpi-Smoke (Desktop + Mobile) grün: Startpfad lädt keine späteren Arenen.

## Integrationswarteschlange

- Keine offenen Integrationen.

## Worktree-Setup

Phasen werden strikt in `/worktree/tempest-phase-<nr>-<kurzname>` auf dem
Branch `phase-<nr>-<kurzname>` umgesetzt. Worktrees werden erst nach Merge,
Sauberkeitspruefung und Archivierung entfernt.
