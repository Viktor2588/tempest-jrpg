# Tempest - Chronik: Offene Aufgaben

Diese Datei enthaelt ausschliesslich noch nicht abgeschlossene Arbeit.
Abgeschlossene Phasen stehen in `docs/PROJECT_KNOWLEDGE.md` und der Git-Historie.

Status:

- `[~]` wird bereits in dem genannten Worktree bearbeitet.
- `[ ]` ist offen und darf gemaess `AGENTS.md` uebernommen werden.

## Laufende Arbeit

- `[~]` **Phase 271 — Menü entschlacken / UX-Überarbeitung (in Bearbeitung)** ⭐ HUD/UX
  - Worktree: `/worktree/tempest-phase-271-menu-declutter`
  - Branch: `phase-271-menu-declutter`
  - Ziel: klarere Tab-Hierarchie, weniger gleichzeitige Dichte.

- `[x]` **Phase 272 — Visuelle Bugs beim Laufen**
  - Worktree: `/worktree/tempest-phase-272-walk-bugs`
  - Branch: `phase-272-walk-bugs`
  - Ziel: saubere Walk-Darstellung (Facing, Bob, Depth).
  - Umsetzung: Spieler wird jetzt als Container (Schatten + Sprite) gezeichnet.
    Facing spiegelt das Slime-Sprite nur bei Linkslauf (`overworldPlayerFlipX`),
    ein Walk-Bob (`OVERWORLD_WALK_BOB_PX`) hebt Sprite/Schatten pro Schritt, und
    `overworldActorDepth` hält den Akteur über dem Terrain (worldLayer=Depth 0)
    und unter Tint/HUD, nach Kartenzeile sortiert.
  - Abnahme: `bun run typecheck` sauber; `bun run test` 895/895 grün (inkl.
    neuer Facing/Bob/Depth-Assertions in `test/overworld.test.ts` +
    `test/overworldArt.test.ts`); `bun run build` erfolgreich. origin/main
    (Phase 281 Facility-Districts, Phase 282 Side-Content) konfliktfrei gemerged.

- `[~]` **Phase 276 — Audio-Erweiterung (Musik & SFX) (in Bearbeitung)**
  - Worktree: `/worktree/tempest-phase-276-audio`
  - Branch: `phase-276-audio`
  - Hinweis: parallel von anderem Agenten (Codex) übernommen.

- `[ ]` **Phase 275 — Bond-Szenen & Beziehungspfade erweitern**
  - Ziel: mehr Bond-Szenen pro Kern-Paar, Unlock-Signale.

- `[ ]` **Phase 277 — Mobile- & Touch-UX-Polish**
  - Ziel: 44px-Targets, lesbare Dichte auf 390×844 (nach 271 mergen).

- `[ ]` **Phase 279 — Overworld-Party-Präsenz (Follower/Companions)**
  - Ziel: 1–2 sichtbare Begleiter (nach 272 mergen).

- `[ ]` **Phase 284 — Performance & Asset-Budget-Nachzug**
  - Ziel: stabile 960×540 auf Desktop/Mobile.

## Integrationswarteschlange

- Keine offenen Integrationen.

## Worktree-Setup

Phasen werden strikt in `/worktree/tempest-phase-<nr>-<kurzname>` auf dem
Branch `phase-<nr>-<kurzname>` umgesetzt. Worktrees werden erst nach Merge,
Sauberkeitspruefung und Archivierung entfernt.
