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

- `[x]` **Phase 279 — Overworld-Party-Präsenz (Follower/Companions)**
  - Worktree: `/worktree/tempest-phase-279-followers`
  - Branch: `phase-279-followers`
  - Ziel: 1–2 sichtbare Begleiter (nach 272 mergen).
  - Umsetzung: bis zu 2 Begleiter (aktive Party ohne Anführer) folgen dem
    Spieler entlang seiner zuletzt betretenen Kacheln — reine Breadcrumb-Trail-
    Logik in `src/systems/followers.ts` (`stepFollowerTrail`/`followerTiles`,
    keine Pfadsuche → kein Wand-Clipping). Gerendert als Container mit dem
    272er-Muster: Schatten + Porträt-Textur (`portraitKey(characterId)`),
    Flip-Facing, Walk-Bob (`walkBobActor`), Tiefe via `overworldActorDepth`
    (Begleiter minimal hinter dem Spieler). Roster-Wechsel im Menü baut die
    Begleiter beim Resume neu auf.
  - Abnahme: `bun run typecheck` sauber; `bun run test` 106 Dateien / 903 Tests
    grün (inkl. neuer `test/followers.test.ts`, 5 Tests); `bun run build` ok;
    Desktop-Smoke (`e2e/game.smoke.spec.ts`, desktop-chromium).

- `[~]` **Phase 284 — Performance & Asset-Budget-Nachzug (in Bearbeitung)**
  - Worktree: `/worktree/tempest-phase-284-performance-budget`
  - Branch: `phase-284-performance-budget`
  - Ziel: stabile 960×540 auf Desktop/Mobile.

## Integrationswarteschlange

- Keine offenen Integrationen.

## Worktree-Setup

Phasen werden strikt in `/worktree/tempest-phase-<nr>-<kurzname>` auf dem
Branch `phase-<nr>-<kurzname>` umgesetzt. Worktrees werden erst nach Merge,
Sauberkeitspruefung und Archivierung entfernt.
