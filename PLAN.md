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

- `[x]` **Phase 277 — Mobile- & Touch-UX-Polish**
  - Worktree: `/worktree/tempest-phase-277-mobile-touch`
  - Branch: `phase-277-mobile-touch`
  - Ziel: 44px-Targets, lesbare Dichte auf 390×844 (nach 271 mergen).
  - Umsetzung: Overworld-Touchflächen (D-Pad/Interakt) von 52→62 logische px,
    Offset 56→64. Grund: Scale.FIT skaliert das 960×540-Canvas höhenbegrenzt
    aufs Referenz-Handy (844×390, ×0.722) → 52px rendern nur ~37.6 CSS-px,
    62px ≈ 44.8 CSS-px (über der 44px-Marke). Neue Helfer `mobileFitScale`/
    `logicalToScreenPx` in `mobileLayout.ts` machen die physische Größe prüfbar.
    Menü-Buttons bleiben bei 44 logisch (Projektkonvention; 61px würden die
    dichten Tab-/Listenraster sprengen — Rewrite statt Polish). Dichte der
    Menüspalten ist bereits über analyzeMenuColumns (Phase 59/271) abgesichert.
  - Abnahme: typecheck grün; `bun run test` 901 Tests/106 Files grün
    (inkl. neuer `test/mobileTouch.test.ts`, 3 Tests); build grün;
    e2e `orientation.smoke.spec.ts` 2/2 grün (desktop + mobile-chromium).

- `[~]` **Phase 279 — Overworld-Party-Präsenz (Follower/Companions) (in Bearbeitung)**
  - Worktree: `/worktree/tempest-phase-279-followers`
  - Branch: `phase-279-followers`
  - Ziel: 1–2 sichtbare Begleiter (nach 272 mergen).

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
