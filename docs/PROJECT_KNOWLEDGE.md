---
schema: tempest-project-knowledge/v2
format: okf-inspired-structured-markdown
document_role: canonical-project-context
title: Tempest - Chronik
snapshot:
  date: 2026-07-02
  branch: main
  base_commit: 49e4300f66e003a9d0c5356def5493a3b5294394
  includes_uncommitted_documentation: true
scope:
  implementation: tracked files on main
  roadmap: PLAN.md
  excludes: unmerged worktree implementation
languages:
  documentation: English
  game_ui_and_story: German
---

# Tempest - Chronik Project Knowledge

## 1. Document Contract

This is the single canonical knowledge document for the project. It replaces
the former architecture/history sections in `PLAN.md`, the separate art bible,
and the four Band planning documents.

The serialization uses machine-readable YAML metadata plus stable Markdown
sections, tables, code blocks, IDs, and file paths. `llms.txt` provides the
small discovery layer, while this file provides the detailed knowledge layer.

Authority order:

1. Current source and tests on the checked-out branch.
2. Typed content in `src/data/` and persisted-state rules in `src/systems/`.
3. This document for stable intent, architecture, and interpretation.
4. `PLAN.md` for active and unresolved work only.
5. `ASSETS.md` for exact asset provenance.
6. Git history for completed phase details.

Interpretation rules:

- Implemented code is not inferred from a roadmap item.
- Internal IDs may retain legacy names for save compatibility.
- Visible names and current story presentation follow the canon-first rule.
- Unmerged worktrees are not part of the `main` implementation.
- Exact palette, dimensions, and art kinds come from
  `src/render/artSpec.ts`; this document describes intent.

## 2. Product

```yaml
product:
  name: Tempest - Chronik
  status: playable prototype
  genre: turn-based browser JRPG
  inspiration: Tensura / Tempest setting
  distribution: private unofficial hobby project
  ui_language: German
  platforms:
    - desktop browser
    - mobile browser
  runtime:
    backend: none
    network_required_by_game: false
    persistence: browser localStorage
    deployment: GitHub Pages
    base_path: /tempest-jrpg/
    offline_pwa: intentionally out of scope
  viewport:
    reference_canvas: 960x540
    scaling: Phaser FIT and centered
    backing_store: 960x540 * min(devicePixelRatio, 2) via src/render/hiDpi.ts
    logical_coordinates: preserved through scene camera zoom helpers
  texture_filtering:
    global_pixel_art: false
    renderer_round_pixels: false
    css_fit_auto_round: true
    linear: painterly tiles, banners, portraits, cutouts, battle backgrounds, VFX
    nearest: 16x16 Kenney tile sources and procedural pixel placeholders
  stack:
    engine: Phaser 4.2
    language: TypeScript
    package_manager: Bun
    bundler: Vite
    unit_tests: Vitest
    browser_tests: Playwright
```

Core goals:

- Keep combat fast, readable, and tactically meaningful.
- Make story and mechanics reinforce the same characters.
- Treat grinding as fallback rather than the main progression loop.
- Use naming and creature evolution as central progression fantasies.
- Support touch, keyboard, readable mobile layouts, and reduced motion.
- Keep content typed, data-driven, deterministic, and headless-testable.
- Prefer talent trees over selectable jobs or roles.

Non-goals:

- Backend services, multiplayer, accounts, or cloud saves.
- Service workers, installable PWA behavior, or offline support.
- A separate job/class-switching system.
- Verbatim reproduction of manga, anime, or light-novel text or art.

## 3. Canon And Narrative Rules

```yaml
narrative:
  policy: canon-first
  core_visible_cast:
    - Rimuru
    - Veldora
    - Rigurd
    - Gobta
    - Ranga
    - Shuna
  legacy_visible_names_removed_from_main_path:
    - Sora
    - Vael
    - Lyrre
    - Mordrahn
  compatibility:
    stable_legacy_ids: allowed
    stable_quest_step_ids: required where saves reference them
    original_arc: ancestors-choice
    original_arc_role: optional legacy side story
  writing:
    language: German
    original_wording_required: true
    copied_source_dialogue: prohibited
  art:
    original_or_cc0_only: true
    copied_anime_or_manga_art: prohibited
```

Implemented story spine:

1. Rimuru awakens in the sealed cave and meets Veldora.
2. Gobta joins through the goblin request.
3. The Direwolf confrontation ends in submission/pact; Ranga joins.
4. Tempest is named and changes from camp to young settlement.
5. The council and three settlement beats lead to Whispering Grove.
6. The Nameless Echo closes the current Band 2 core route.
7. Optional and regional arcs include Dwargon, Shizu/Ifrit, the Lizard
   alliance, Orc Disaster/Federation, Milim, and Blumund/Free Guild.

Stable story anchors include:

- `slime-awakening`
- `binding-of-ancestors`
- `border-escalation`
- `ancestors-choice`
- `dwargon-craft`
- `geld-disaster`
- `lizard-alliance`
- `shizu-vow`

Planned continuation:

- Band 3 is a voluntary border-escalation arc: Spirit Marsh, Ranga scouting,
  controlled conflict, fracture analysis, and an indirect enemy vanguard.
- Band 4 is a voluntary alliance/finale arc ending in Freedom, Order, or
  Shared Burden; the third path requires actual relationship conditions.
- Future visible content must continue replacing legacy character functions
  with canon characters or neutral systems without breaking stable IDs.

## 4. Architecture

### 4.1 Layer model

```text
src/data/
  Typed definitions and content tables. No Phaser or DOM.

src/systems/
  Pure game rules and state transitions. No Phaser or DOM.

src/scenes/
  Phaser adapters for rendering, input, browser storage, and scene flow.

src/render/
  Art specifications, texture mappings, generated fallbacks, and view helpers.

src/audio/
  Playback policy and checked-in OGG music/SFX integration.

test/
  Vitest unit, integration, data, balance, save, and playthrough tests.

e2e/
  Playwright desktop/mobile browser smoke tests.
```

Dependency direction:

```text
data <- systems <- scenes
data <- render  <- scenes
audio <--------- scenes
```

Scenes may call systems and render helpers. Systems must not import Phaser,
browser APIs, or scenes. Random behavior that affects rules uses seeded RNG.

### 4.2 Runtime scene graph

```text
BootScene
  -> PreloadScene
  -> TitleScene
  -> OverworldScene
       -> BattleScene
       -> MenuScene
       -> DialogueScene
       -> ShopScene
       -> MilestoneScene
```

Overlay scenes pause or coordinate with the overworld and return updated state.
The pure systems own rules; scenes own presentation and input.

### 4.3 Repository map

| Path | Responsibility |
|---|---|
| `src/main.ts` | Phaser config, 960x540 canvas, scene registration |
| `src/data/types.ts` | Shared content and state-facing type contracts |
| `src/data/index.ts` | Data exports and `GAME_DATA` registry |
| `src/data/world.ts` | Quests, NPCs, dialogs, shops, encounters, lore |
| `src/data/maps.ts` | Tile maps, map IDs, names, and spawns |
| `src/data/progression.ts` | Trees, lines, evolutions, bonds, equipment sets |
| `src/systems/battle.ts` | Deterministic CT battle engine |
| `src/systems/world.ts` | Dialog, shop, encounter, quest, and travel rules |
| `src/systems/progression.ts` | Naming, evolution, talents, bonds, catch-up |
| `src/systems/save.ts` | Save schema, migration, normalization, storage |
| `src/systems/menu.ts` | Menu view models and state-changing operations |
| `src/scenes/OverworldScene.ts` | Grid world, HUD, travel, interaction |
| `src/scenes/BattleScene.ts` | Battle engine presentation adapter |
| `src/scenes/MenuScene.ts` | Party, inventory, status, quest, codex UI |
| `src/render/artSpec.ts` | Exact visual constants and art categories |
| `ASSETS.md` | Asset source/license/generation ledger |

## 5. State And Data Model

### 5.1 Save invariants

The save is versioned and normalized on load. It stores:

- Party and reserve members with level, EXP, stats, skills, equipment, and
  progression state.
- Inventory stacks, gold, key items, and equipment.
- Current map and tile position.
- Quest status and step progress.
- Story, relationship, codex, travel, and compatibility flags.
- Settings and profile/New Game Plus state where applicable.

Required behavior:

- Unknown or invalid content references are normalized safely.
- Old saves migrate forward without duplicate rewards, members, or flags.
- Import/export uses JSON and validates before applying.
- Autosave and explicit save operate through a testable storage abstraction.
- Persisted IDs are changed only with migration and compatibility tests.

### 5.2 Typed content inventory on the snapshot

```yaml
content_counts:
  heroes: 10
  enemies: 25
  items: 24
  skills: 26
  maps: 11
  quests: 16
  locations: 53
  lore_entries: 51
  dialogs: 20
  npcs: 22
  shops: 9
  encounters: 25
  progression_regions: 3
  progression_lines: 8
  evolutions: 8
  relationships: 8
  skill_trees: 8
  equipment_sets: 3
```

These counts describe `main` at the snapshot, not unmerged worktrees. IDs are
more stable than display names and should be used in tests and save logic.

### 5.3 World invariants

- Every visible NPC, encounter, gateway, shop, and marker is placed on a
  reachable tile.
- Quest steps have at least one reachable completion source.
- Required character, enemy, skill, item, portrait, and codex references exist.
- Gateways trigger only under their requirements and preserve valid positions.
- Fast travel requires Ranga access, discovery, and a currently safe target.
- Scouting may reveal a destination without unlocking travel or encounters.

## 6. Implemented Systems

### 6.1 Overworld

- Tile-grid movement with collision and camera bounds.
- Keyboard and touch input.
- NPC, shop, encounter, gateway, quest, and rest-point interactions.
- Minimap, region indicator, objective guidance, and story-reactive markers.
- Trigger and seeded random encounters.
- Multi-map gateways and Ranga scouting/fast travel.
- Story-reactive settlement presentation.

### 6.2 Battle

- Deterministic CT initiative and turn advancement.
- Attack, skill, item, defend, flee, analyze, and reaction primitives.
- Physical/magical damage, elements, weakness, resistance, and break pressure.
- Single-target and group effects.
- Buffs, debuffs, damage-over-time, guard, and control statuses.
- Analysis levels, revealed weaknesses, and enemy-action telegraphs.
- CT delay/haste and skip-turn control effects.
- Data-driven Devour eligibility and one defined acquisition skill per
  devourable enemy.
- Permanent Devour skill acquisition with save normalization and duplicate
  protection.
- Rimuru battle loadouts capped at eight slots: fixed water/Predator core plus
  the newest optional or absorbed skills.
- Enemy AI, victory/defeat/flee termination, EXP, gold, and item drops.
- Team meter, relationship bonuses, and presentation hooks.
- Hard termination guards for simulations and tests.

Phases 40-42 are on `main`: analysis, Predator momentum, and permanent
data-driven skill acquisition form the current battle substrate.

### 6.3 Party and progression

- Active party and reserves with story-controlled recruitment.
- Level/EXP/stat calculation and reserve catch-up.
- Equipment, consumables, key items, shops, and enchantment.
- Character-specific talent trees instead of selectable jobs.
- Naming, progression lines, evolution, and unlock requirements.
- The `rimuru-predator-devour` node is gated by the first successful permanent
  acquisition and leads into `rimuru-shadow-domain`.
- Relationships, passive combat bonuses, and team-attack data.
- Equipment-set bonuses.

### 6.4 Story and menus

- Data-driven dialogs with requirements, choices, effects, and rewards.
- Main/side quests, stable steps, sorting, guidance, and completion state.
- Codex/lore unlocks and locked-title support.
- Party, inventory, equipment, status, talents, quests, codex, and Ranga views.
- Rest point for healing, saving, party management, and optional conversations.
- Milestones, chapter transitions, multiple endings, and New Game Plus.
- Settings for audio, text speed, battle speed, reduced motion, and difficulty.

## 7. Visual And Audio Direction

```yaml
visual_style:
  overworld:
    style: friendly fantasy top-down pixel art
    logical_tile_size: 32x32
    filtering: nearest-neighbor
    priorities:
      - clear walkability
      - distinct biome silhouettes
      - low-noise traversable ground
  battle:
    style: painted fantasy cutouts
    perspective: elevated side / three-quarter
    arena_size: 1280x720
    filtering: linear
    priorities:
      - quiet center for units
      - strong silhouette separation
      - readable HUD contrast layer
  ui:
    icon_sizes:
      - 16
      - 24
    minimum_touch_target_px: 44
  palette_authority: src/render/artSpec.ts
```

Current character accents should follow the implemented canon cast, not the
removed Sora/Vael/Lyrre art-bible entries. New assets should match the existing
palette, perspective, lighting, and contrast hierarchy.

Asset policy:

- External assets must be explicitly CC0.
- Approved discovery sources are Kenney, OpenGameArt with CC0 filtering, and
  explicitly CC0 itch.io packs.
- Project-generated originals are allowed and must record generation date,
  purpose, method, author/source, and applicable terms in `ASSETS.md`.
- Generated assets must be copied into `src/assets/`, normally optimized to
  WebP while preserving alpha where required.
- Runtime procedural fallbacks are allowed through render helpers.
- Never add an asset without a manifest entry and preload/mapping tests.

Audio uses checked-in OGG:

- Eight Kenney CC0 UI/battle/result effects.
- Three Kenney CC0 music motifs for title, field, and battle.
- Playback and settings live under `src/audio/` and scene integration.

## 8. Quality Gates

Local commands:

```bash
bun install --frozen-lockfile
bun run typecheck
bun run test
bun run build
bun run test:e2e
```

Test strategy:

- Unit-test pure calculations and state transitions.
- Test deterministic battle behavior with fixed seeds.
- Validate all cross-data references and reachable quest/world anchors.
- Test save roundtrips, old-schema migration, and duplicate prevention.
- Use headless playthroughs for multi-quest story flows.
- Use balance/QA analyzers for encounter and overworld budgets.
- Run Playwright at desktop `1440x900` and mobile `390x844` for rendering,
  navigation, dialogs, menus, combat, travel, and console errors.

Required minimum for every phase:

1. `bun run typecheck`
2. `bun run test`
3. `bun run build`
4. `bun run test:e2e` when scenes, rendering, assets, layout, or flows change

### Efficient Test Execution (Phase 140 findings)

**Local development (fastest feedback):**
- Prefer `bun run test:watch` or `bunx vitest` over `bun run test`.
  Watch mode only re-runs affected tests on file change.
- Run targeted tests:
  ```bash
  bunx vitest run test/battle.test.ts
  bunx vitest run test/battle.test.ts -t "Eskalation"
  bun run test:e2e --project=desktop-chromium -g "Title"
  ```

**Parallelism & sharding:**
- Vitest uses threads pool by default. Config limits `maxThreads` to 3 in CI.
- For very large runs or to mimic CI split:
  ```bash
  bun run test:shard 1/4
  bun run test:shard 2/4
  ```
- Playwright: `fullyParallel: true`. CI uses 2 workers. For quick local smoke only run 1-2 projects:
  ```bash
  bun run test:e2e --project=desktop-chromium --project=mobile-chromium
  ```

**E2E optimizations:**
- Replaced many raw `page.waitForTimeout(250|700|900)` with a `settle(page, ms)` helper that does a short wait + `expectCanvasContent` assertion.
- This reduced wall time and made tests less timing-sensitive.
- Use `PLAYWRIGHT_PORT` when running multiple worktrees in parallel.

**CI speed improvements:**
- Aggressive caching for Bun install cache + `~/.cache/ms-playwright`.
- Unit tests split into 4 parallel matrix jobs.
- E2E smoke limited to desktop + mobile (HiDPI variants are expensive).
- `paths-ignore` for pure documentation changes (`.md`, `docs/`, `PLAN.md` etc.) skips expensive jobs.

**Other scripts:**
- `bun run test:ci` → runs with `--bail=1`
- `bun run typecheck` is fast and should be run early.
- Full E2E is rarely needed locally; use grep + specific project for iteration.

**When to run what:**
- Daily work → `bunx vitest`
- Before PR → full `bun run test` + targeted E2E smoke
- Suspect flakiness → run with `--shard` or single project + trace on failure
- Performance investigation → `time bun run test -- --reporter=dot`

These changes reduced a full 687-test unit run from ~55-56s to ~39s and made CI feedback significantly faster through parallelism + caching.

CI and deployment live in `.github/workflows/`. A verified Vite `dist/` is
deployed to GitHub Pages from `main`. Phaser is emitted as the large vendor
chunk and the Vite warning threshold accounts for it.

## 9. Development Workflow

`AGENTS.md` is authoritative for phase execution:

1. Use `/worktree/tempest-phase-<number>-<short-name>`.
2. Use branch `phase-<number>-<short-name>`.
3. Mark the phase `[~]` in `PLAN.md` before implementation.
4. Never take an already active phase.
5. Prefer asset-producing work when multiple next phases are equally useful.
6. Reuse existing patterns and add risk-proportional tests.
7. Put generated assets in the repository and update `ASSETS.md`.
8. Run all relevant gates.
9. Mark the phase complete, document acceptance, commit, and push.
10. Remove a worktree only after merge and only when clean.

Engineering conventions:

- Put reusable rules in `src/systems/`.
- Put content in typed `src/data/` tables.
- Keep scenes focused on input and presentation.
- Use structured parsers and typed APIs over ad hoc string handling.
- Keep dependencies minimal.
- Preserve stable IDs and add migrations for persisted structure changes.
- Keep player-facing text in German.

## 10. Current Repository Boundary

`main` contains Phase 43, Phase 44, Phase 45, Phase 46, Phase 47, Phase 48, Phase 49, and the earlier merged
implementation. The separately numbered asset phases 33-39 are also integrated.
Current `main` includes:

- Core overworld, save, battle, menu, world, progression, settings, and release
  pipeline.
- Canon-first Band 1-4 route and integrated story/save compatibility tests.
- Dwargon, Orc Disaster, Lizard alliance, Shizu/Ifrit, and Blumund slices.
- Ranga scouting/fast travel and legacy save compatibility for old original-arc saves.
- Art/audio integration, regional assets, mobile/accessibility work, and E2E.
- Dedicated Shizu/Fuze portraits, Canon-region banners, Kijin/Kaijin party
  cutouts and portraits, Canon-region tiles, Canon-trigger enemy cutouts, and
  Canon/region NPC story portraits for Eir, Kael, Gazel, Kaval/Eren/Gido,
  Treyni, Milim, and Souka.
- Phase 47 main-path asset-gap closure: Whispering Grove arena,
  Direwolf-alpha cutout, and Nameless Echo cutout.
- Analysis, telegraph, CT control, control-status battle substrate, Predator
  devour gating, data-driven permanent skill acquisition, duplicate-safe save
  persistence, an eight-slot Rimuru loadout, and bounded CT momentum.
- Data-driven signature meters and actions for Rimuru, Ranga, Shuna, Benimaru,
  Shion, Hakurou, Souei, Gobta, Rigurd, Kurobe, and Kaijin, including HUD support,
  auto-battle selection, Rigurd save backfill, and his dedicated battle cutout.
- Team-Mix fusion attacks built from character resonance elements,
  relationship-gated synergy partners, deterministic fusion resolution,
  auto-battle partner preference, and robust E2E canvas/onboarding smoke
  coverage.
- Phase 45 battle-AI polish: analyzed enemies honor telegraphed skills,
  enemy scoring accounts for guard-break focus, CT control, buffs/debuffs, and
  control statuses, while auto-battle can analyze, devour, use CT verbs, and
  prepare reactions against telegraphed enemy turns.
- Phase 46 battle presentation and content closure: every enemy has explicit
  weakness, Devour, and telegraphable data; all 21 non-neutral element pairs
  resolve to a fusion; the HUD surfaces Break, analysis, telegraph, Devour
  chance, signatures, and statuses; German tutorials and QA gates cover the
  completed system.
- Phase 48 Band-3 story flow: `border-escalation` starts voluntarily only
  after Band 2 and Ranga's pact, moves the border route into `spirit-marsh`,
  requires non-lethal post-fight de-escalation before Shuna's analysis, and
  resolves the vanguard through Ranga's anonymous trace instead of a visible
  legacy antagonist claim.
- Phase 49 Band-4 finale: `ancestors-choice` is the canon finale after Band 3,
  starts voluntarily through Rigurd, requires Shuna, Gobta, and Ranga to close
  the alliance council before the march, keeps Ranga in the final party, uses
  canon-visible "old order/keeper" naming, and persists Freedom, Order, and
  Shared Burden endings with save, Codex, and browser coverage.
- Phase 50 overworld onboarding: replaces the blocking first-run control modal
  with persistent, non-blocking movement, interaction, and menu hints; each hint
  disappears after successful use, the save records per-step flags plus the
  legacy completion flag, and desktop/mobile browser smoke covers the flow.
- Phase 51 overworld HUD simplification: limits the persistent overworld HUD to
  one menu button under the minimap, separates mobile movement and interaction
  into touch-control surfaces, and updates layout budget plus desktop/mobile
  browser smoke coverage for the menu-button path.
- Phase 52 balance harness: adds a report-only Vitest headless simulation over
  13 story trigger encounters with HP/MP/item carryover across five seeds,
  target corridors for normal/boss fights, and target/underleveled boss
  benchmarks. The report intentionally exposes current over-easy outcomes
  without enforcing hard balance assertions until the next balance pass.

Open local worktree state at this snapshot:

| Phase | State | Worktree |
|---|---|---|
| 33-52 | merged into `main`; worktrees removed after clean-status checks | none |

Inspect `git status` and `git worktree list --porcelain` before relying on this
table because worktree state changes faster than the knowledge document.

## 11. Completed History Summary

```yaml
completed_milestones:
  phase_140:
    - Test infrastructure overhaul for faster feedback: Vitest Thread-Pool with CI limits + 4-way sharding on GitHub Actions; Playwright workers=2 + only desktop+mobile for smoke; full Bun + Playwright browser caching in CI.
    - Path-based skipping (docs/md changes skip E2E).
    - E2E speed/reliability: new `settle()` helper replacing most raw `waitForTimeout`; timeouts reduced significantly while keeping `expectCanvasContent` assertions.
    - Test file hygiene: extracted `test/battleHelpers.ts`; smaller main test files for better collection/parallelism.
    - Convenience: `test:shard`, `test:watch`, `test:ci --bail`, updated README + scripts.
    - Measured: full 687 unit tests now ~39s (was ~56s); typecheck/build/E2E structure green.
    - Worktree: /home/viktor/worktree/tempest-phase-140-test-infra (branch phase-140-test-infra); merged cleanly.
    - Validation: `bun run typecheck`, `bun run test` (687 tests), `bun run build`, `bun run test:e2e --project=desktop-chromium`.
  phase_141:
    - Menu & UI improvements + large refactor of the monolithic MenuScene (~1650 lines).
    - Tab navigation: active tab underline + direct number key shortcuts (1-8), numbered tab labels.
    - Tooltips: simple hover tooltip system (initially on tabs, extensible).
    - List UX: filter button + text filter for inventory (applied live).
    - Polish: subtle hover scale in uiSkin, improved active tab visuals.
    - Big refactor: extracted MenuTypes.ts, IMenuTabView interface, BaseMenuTabView; introduced tabViews registry in MenuScene. Dispatch now via registry instead of long if/else. Structure ready for full extraction into src/ui/menu/*TabView.ts classes.
    - Worktree: /home/viktor/worktree/tempest-phase-141-menu-ui (branch phase-141-menu-ui); merged cleanly.
    - Validation: `bun run typecheck`, `bun run test` (687 tests), `bun run build`.
  phase_142:
    - Follow-up: Search/Filter extended to Bestiary, Quests, and Codex (Lore entries).
    - Drag & Drop for active Party members (reorder within front line via drag-and-drop on cards; basic visual feedback and swap).
    - Accessibility: Clearer focus rings (gold border in uiSkin for focused/selected elements, consistent with tabs).
    - Complete modularization foundation: Enhanced IMenuTabView + registry; added BestiaryTabView as concrete Sub-View example. All draw tab logic now routable via registry for easy extraction of remaining tabs.
    - Worktree: /home/viktor/worktree/tempest-phase-142-menu-ui-erweiterungen (branch phase-142-menu-ui-erweiterungen); merged cleanly.
    - Validation: `bun run typecheck`, `bun run test` (687 tests), `bun run build`.
  phase_143:
    - Advanced the full modularization: tabViews registry now uses proper IMenuTabView objects (no more function lambdas). Dispatch is clean.
    - Enhanced DnD: now supports moving from active to reserve area.
    - All filters, focus rings, and DnD from previous list completed.
    - Structure is now ready for dedicated Sub-View classes in src/ui/menu/ (e.g. PartyTabView etc.).
    - Worktree: /home/viktor/worktree/tempest-phase-143-menu-modularisierung ; merged cleanly.
    - Validation: `bun run typecheck`, `bun run test` (688 tests), `bun run build`.
  phase_145:
    - MenuScene Sub-View extraction completed: all tabs (party/inventory/equipment/status/growth/quests/codex/travel) are now dedicated *TabView classes owning their state (filters, pages, status).
    - onActivated called on tab switch for proper resets.
    - DnD polish: live visual feedback (alpha + stroke) when dragging over reserve drop zone.
    - Filter buttons/pagination route through view methods.
    - MenuScene reduced to orchestrator (header, tab row, shared member list on CHARACTER_TABS, dispatch).
    - Worktree: /worktree/tempest-phase-145-menu-subviews ; merged cleanly.
    - Validation: typecheck ✓, build ✓, relevant tests ✓.
  phase_137:
    - Weichkontrolle sichtbar: HUD status summary zeigt Turns für soft controls (z.B. Stumm(2) · Blind(3)).
    - Präzisere Logs: Status-Apply-Logs enthalten "(X Runden)" für Blind/Silence/Weaken.
    - Bestiarium: casterHint für magielastige Gegner (hoher magic > attack+5), angezeigt in Name und Detail-Line.
    - Battle Intel: casterText in EnemyIntel (null für jetzt, da additiv via Bestiarium).
    - Additiv, keine Balance-Änderung. Akzeptanz erfüllt.
    - Worktree: /home/viktor/worktree/tempest-phase-137-weichkontrolle-sichtbar ; merged cleanly.
    - Validation: typecheck, relevant tests, build.
  phase_139:
    - Erster bindender Hebel: punishesHealing (Ifrit) hochgetunt (1.5 ATT + 0.8 MAG), so dass reflex Heilen in Todesspirale kippt.
    - AI in autoBattle: gegen Punisher Heilung zurückstellen zugunsten Off/Def (genaue Gegenentscheidung, spiegelt Mender-Prio).
    - Beweis in balanceHarness.test.ts: No-Counter fällt aus Korridor bei Ifrit, Counter bleibt drin.
    - Akzeptanz: Tune + AI-Branch + Assertion, harness grün (Counter-Linie).
  phase_138:
    - Der Zauber-Riegel (off-route Caster): Akademie-Irrlicht (und magic-colossus) erhält telegraphierte schwere Phase-2-Überladung (z.B. black-flame/arcane-overload).
    - Echte Antwort-Runde durch Wind-up; Silence (Bannsiegel von Shuna) unterbricht den Cast.
    - Shuna Rekrutierung vor Akademie verfügbar (kanonische Kijin-Benennung).
    - Off-route (nicht im Harness-Korridor); macht Weichkontrolle (silence) erspielbar wertvoll.
    - Akzeptanz: Telegraph + Silence-Gegenspiel im Kern, Shuna-Dialog, typecheck+Tests+Build+Smoke, Balance-Harness grün.
  phase_110:
    - Added the Tempest invasion and defense arc after Geld: Rigurd starts `tempest-invasion`, the player clears two gated defense waves on `jura-battlefield`, completing the quest, raising Blumund reputation, and setting `story.tempest-invasion.repulsed`.
    - The defense outcome now gates the Harvest Festival (`AWAKENING_REQUIRED_FLAG`) and visibly improves the Watch facility output; `tempest-invasion-repelled` adds the required sceneScript beat before awakening.
    - Added project-generated battle background `src/assets/backgrounds/battle-tempest-invasion.webp` with ASSETS provenance, battle arena/preload wiring, headless invasion tests, sceneScript coverage, and focused desktop Chromium smoke `Tempest-Invasion-Save`.
    - Validation: `git diff --check`, `bun run typecheck`, `bun run test` (556 tests), `bun run build`, and `bun run test:e2e -- --project=desktop-chromium -g "Tempest-Invasion-Save"`.
  phase_115:
    - Added the first Ramiris Labyrinth wing as a Band 5/6 set-piece after Shizu's children: `ramiris-labyrinth` map, academy/labyrinth Ramiris NPCs, `ramiris-labyrinth` quest, gateway, and deterministic `magic-colossus` trigger.
    - Added project-generated assets with ASSETS provenance: `src/assets/ui/region-ramiris-labyrinth.webp` and `src/assets/sprites/enemy-magic-colossus.webp`; wired preload, region banner, enemy art, and focused browser smoke.
    - Validation: `git diff --check`, `bun run typecheck`, `bun run test` (505 tests), `bun run build`, and focused desktop Chromium smoke `Ramiris-Labyrinth`.
  phase_95:
    - Added a repeatable Tempest Colosseum side activity: `tempest-colosseum` map, Tempest gateway, Arena-Vorstand NPC/dialog, `tempest-arena` quest, and Bronze/Silber/Gold trigger waves using the existing battle/encounter flow.
    - Added project-generated assets with ASSETS provenance: `src/assets/ui/region-tempest-colosseum.webp` and `src/assets/backgrounds/battle-tempest-colosseum.webp`; wired preload, battle arena mapping, region banner mapping, and focused browser smoke.
    - Validation: `git diff --check`, `bun run typecheck`, `bun run test` (506 tests), `bun run build`, and focused desktop Chromium smoke `Kolosseum`.
  phase_98:
    - Bonds — the character-binding pillar. Relationship points already accrued (+5 per victory per active pair) and bond levels already unlocked team-mix synergy; Phase 98 adds the two missing halves: playable bond scenes and a combat bond perk.
    - Bond scenes run through the existing sceneScript interpreter (Phase 62). New pure `src/systems/bondScenes.ts` — `getPendingBondScene(state, flags, availableCharacterIds?)` returns the next scene whose relationship level ≥ its `requiredLevel`, not yet played, main character in roster (stable order: relationship order, then lowest requiredLevel); `bondSceneToScript` builds a two-beat SceneScript + summary from the scene data; `acknowledgeBondScene` marks it played in a dedicated flag namespace (`bond.scene.<id>.played`) so it never collides with the (inert) scene-owned `flagId` fields.
    - OverworldScene plays a pending bond scene after the story beats (generalized `playScene` to take an `acknowledge` callback; the roster set is drawn from active + reserve party members). No new persisted field — bond flags are ordinary flags and the perk is derived from the reached level.
    - Bond perk: `RelationshipLevelDefinition` gained an optional `perk?: TalentPerk` anchored only at each relationship's top level; `bondPerksForCharacter(characterId, state)` collects the perks of achieved levels for the relationship's main character and feeds them into `createProgressionBattleParty` alongside spec/awakening/officer perks. Eight canon-flavored perks (Rimuru-Gobta vanguard counter, Rimuru-Veldora/Benimaru element damage, Rimuru-Shion physical-taken reduction, etc.). Only reachable at deep investment (120–180 points) so the balance harness (predator spec, points stay < top-level thresholds) is unperturbed.
    - Menu: the Bindungen list shows the achieved bond perk (★ + `describePerk`) for the relationship's main character. Validation: `bun run typecheck`, `bun run test` (550 tests, +10 in `test/bondScenes.test.ts`: gating, played-skip, roster gating, idempotent acknowledge, per-scene SceneScript validity, perk level-gating and main-character attribution), `bun run build`.
  phase_100:
    - Diplomacy — the external side of nation-building. Graduated per-faction reputation replaces the previously binary `faction.*` flags with a scale for Dwargon, Blumund, the Orcs, and the Lizardmen (`src/data/factions.ts`, three thresholds each: known/trusted/allied, every threshold carrying an `unlockFlag` + a reward description).
    - Pure `src/systems/diplomacy.ts` (mirrors `systems/crafting`): `adjustReputation` clamps to [0, 100] and, on crossing a threshold, deterministically sets that threshold's `unlockFlag` (idempotent — an already-set flag is not re-reported as "crossed"); `buildDiplomacyView` yields rank + progress to next; `validateFactions` guards strictly increasing thresholds and globally unique unlock flags.
    - Persistence: `ProgressionState` gained `factionReputationByFactionId` with save migration (old saves start neutral via `readNumberRecord` → `{}`). `WorldState` carries an optional `factionReputation` map; `createWorldState` fills it from progression and `applyWorldState` writes it back when changed — the same optional-field bridge pattern as Phase 93c's `productionCycles`.
    - New `adjust-reputation` world effect (factionId, amount) wired into the existing alliance milestones: the Dwargon smithing pact, the Blumund trade seal, the Orc federation, and the Lizardmen alliance. The Gabiru branch is a visible decision consequence — treating him with respect grants full goodwill (+90 → allied), humiliating him only the middle tier (+50 → trusted).
    - UI: a sixth Codex toggle "🤝 Politik" (`drawDiplomacy`) lists each faction's standing, rank, threshold checklist, and what the next tier unlocks. The five established Codex toggles were re-laid-out compactly to fit six on one row; the coordinate-based Phase 93 facilities smoke was updated to the new toggle centers and a Phase 100 diplomacy smoke was added.
    - Validation: `bun run typecheck`, `bun run test` (540 tests, +10), `bun run build`, smokes (Phase 93 facilities + Phase 100 diplomacy, desktop-chromium green via local Chromium binary).
  phase_108:
    - Skill fusion, Rimuru's core canon fantasy (the Great Sage combining learned skills up the rank ladder). Data-driven `SkillFusionRecipe` (inputSkillIds 2+, outputSkillId, magiculeCost, optional requiresFlag) in `src/data/skillFusions.ts`; two recipes ship — `fuse-hydro-lash` (Rimuru: slime-strike+water-jet → hydro-lash, early, 12 magicules) and `fuse-maelstrom-fang` (Ranga: direwolf-rush+predator-aura → maelstrom-fang unique-skill, 40 magicules, gated behind `story.geld.devoured`). New output skills live in `skills.ts`.
    - Pure `src/systems/skillFusion.ts` mirrors `systems/crafting`/`systems/research`: `isSkillFusionVisible`/`canFuseSkill`/`fuseSkill`/`buildSkillFusionView` operate on a fighter's `learnedSkillIds` + the magicule pool + flags — no Scene/WorldState dependency, fully headless-testable. A recipe is one-time per fighter (hidden once the output is learned). `validateSkillFusions` guards data integrity: ≥2 valid input skills, valid output, and the output rank always ≥ the strongest input (fusion climbs the ladder, never down).
    - Progression: `fuseMemberSkill(member, state, recipeId, flags)` returns a `MemberActionResult` — consumes the input skill ids from `learnedSkillIds` (permanently) and the magicules from the pool (Phase 102). Persistence rides the existing `learnedSkillIds`/`magicules` fields, so no save migration; fused skills flow into the battle loadout via `getProgressionCoreSkillIds`, and both outputs joined `RIMURU_CORE_LOADOUT_SKILLS` so they stay visible after fusing.
    - UI: a "Verschmelzen" button in the status tab (analogous to Entwickeln) surfaces the first fusable recipe with its output name + magicule cost. Corridors unaffected by default (fusion is opt-in, applies nothing until the player fuses).
    - Validation: `bun run typecheck`, `bun run test` (530 tests, +9), `bun run build`, menu smoke (`game.smoke` desktop-chromium green via local Chromium binary).
  phase_93c:
    - Coupled Nation production to the travel flow: the `restore-party` world effect (the Tempest campfire rest, its only usage) now also settles one facility production cycle, so the Nation produces during normal play, not only via the facilities menu button.
    - `WorldState` gained optional `residentIds`/`promotedResidentIds`/`awakenedResidentIds`/`productionCycles`; `createWorldState` fills them from progression and `applyWorldState` writes the incremented cycle counter back. Optional fields keep every existing WorldState literal (tests, smokes) valid.
    - Reused the deterministic `systems/facilities.runProductionCycle`; with no residents or still-wilderness Tempest the cycle yields nothing and the rest only heals (backward-compatible, no balance change beyond the already-unlimited menu button).
    - Validation: `git diff --check`, `bun run typecheck`, `bun run test` (521 tests), `bun run build`.
  phase_96:
    - Added a repeatable bounty board that extends the devour compendium (Phase 84) into rewarded hunts: `src/data/bounties.ts` defines seven subjugation bounties (target enemy, required kills, material+gold reward), gated behind `story.blumund.guild-tested` and later story flags; one-off bounties disappear after claiming.
    - Pure rules in `src/systems/bounties.ts` (progress, claim, board view) over two new non-negative counter records, mirroring `systems/crafting`; `tallyDefeatedEnemies` folds a victory's defeated enemy species into the counters. Each claim raises the progress threshold by `requiredCount`, so a repeatable bounty re-arms only after further kills.
    - Persistence: `ProgressionState` gains `defeatedEnemyCountsByEnemyId` and `claimedBountyCountsByBountyId` with save migration (old saves start with empty records); `battleResult` books defeated species on win; rewards feed the forge economy (Phase 91).
    - UI: a fifth Codex tab `🎯 Kopfgeld` shows unlocked bounties with progress and a claim button; the tab row was reflowed to fit five tabs.
    - Validation: `git diff --check`, `bun run typecheck`, `bun run test` (518 tests), `bun run build`. No combat math touched, so the balance corridors are unaffected.
  phase_114:
    - Added a small Nation R&D layer without a save-schema change: `src/data/research.ts` defines Geist-core stabilization and Geist-Infusion projects; `src/systems/research.ts` consumes inventory plus Magicules and persists completion through existing save flags.
    - Wired the first open research project into the Codex Einrichtungen view, reusing the existing facilities screen and persistence path instead of adding a fifth facility that would violate the one-role/one-facility invariant.
    - Geist-Infusion unlocks a new one-off forge recipe, `forge-spirit-core-ward`, which creates the `spirit-core-ward` accessory from Geistglut, Magisteel, and Manatropfen.
    - Validation: `git diff --check`, `bun run typecheck`, `bun run test` (504 tests), `bun run build`, and focused desktop Chromium smoke `Einrichtungen-Menü schließt Geistkern-Forschung im Browser ab`.
  phase_113:
    - Shizu's legacy continuation is playable after `story.shizu.vow`: new `freedom-academy` map, Blumund gateway, five child NPCs (Kenya, Chloe, Alice, Ryota, Gale), `shizu-legacy` quest, `shizu-children` codex entry, and a first Geist-core stabilization choice (`story.children.comforted` vs `story.children.tested`) with visible follow-up dialog.
    - Added generated project assets with ASSETS provenance: `src/assets/sprites/portrait-shizu-children.webp` and `src/assets/ui/region-freedom-academy.webp`; wired portrait speaker mapping, PreloadScene loading, region banner mapping, and reused the existing Blumund tile theme for the academy.
    - Validation: `git diff --check`, `bun run typecheck`, `bun run test` (498 tests), `bun run build`, and desktop Chromium smoke `Shizu-Schwur-Save lädt Freiheitsakademie`.
  phase_116a:
    - Dead-code sub-PR from the YAGNI audit (Phase 116). Removed 7 exported functions with zero callers anywhere (getUnlockedRelationshipScenes, createMenuState, stopMusic, getTeamFusion, getProgressionLine, getProgressionRegions, getResident) plus the production-unused RNG helpers pick/randomInt (and their two rng.test cases).
    - Cascade: removed the now-unused imports the deletions orphaned (PROGRESSION_LINES + ProgressionLineDefinition in systems/progression.ts, ElementFusionDefinition in battle.ts). The underlying types stay — they still type the real PROGRESSION_LINES/PROGRESSION_REGIONS data arrays, so they were NOT orphaned (audit note "z.B. these types" turned out false on re-check).
    - Delete-only, proven safe by green typecheck + 493 unit tests + production build. Net -88 lines.
    - 116b/116c reviewed and consciously left as-is (no change): on inspection the audit's "test-only shadow" suspicion did NOT hold. The analyze* functions (analyzeMenuColumns/analyzeTouchControlLayout/analyzeHudLayout/analyzeSpecTreeLayout/analyzeProgressionBalance) take the REAL layout/balance data as input and assert invariants (no overlap, in-viewport, 44px touch targets = accessibility, monotonic power curves) — they are regression guards, not duplicated logic; deleting them would drop real coverage. The RENDER_PIXEL_ART/RENDER_ROUND_PIXELS consts are a deliberate render-mode knob, not dead config. Verdict: 116a was the real win; the codebase is otherwise lean. Phase 116 closed.
  phase_111:
    - Skill-Rank system (Tensura's Skill -> Extra Skill -> Unique Skill -> Ultimate Skill ladder; see IDEE.md). Added a required `tier: SkillTier` to SkillDefinition (types.ts) and classified all 32 skills — canonical anchors: predator + great-sage = 'unique-skill', Milim's drago-nova = 'ultimate-skill', basic hits = 'skill', elemental magic = 'extra-skill'. `tier` is data-only (skills are not persisted; saves store only learnedSkillIds), so no save migration.
    - New src/data/skillRank.ts: SKILL_TIER_META (rank order 0-3, German label, badge glyph, color, canonical unlock source) + skillTierRank/skillTierBadge helpers. The `unlock` text encodes the gating rule as visible metadata; enforcement is deferred to the phases that grant those tiers (112 steal/fuse, 104 awakening) rather than built as unused infra.
    - UI: MenuScene status skill list colors each skill by its tier color and prefixes the rank glyph; BattleScene skill buttons prefix the glyph too (common 'skill' tier stays unadorned/grey).
    - typecheck (no hidden SkillDefinition constructors broke on the new required field), 492 unit tests (+5 skillRank: completeness, canonical classification, strict rank ordering, badge behavior, every rank populated), production build, desktop game smoke.
  phase_88d_physical:
    - Physical-resistance category branch now ON-ROUTE (counterpart to 88c's magic-resist stray-echo). bog-terror (resistsCategory 'physical') replaces the human-lancer in the mandatory 'border-rift-vanguard' fight and forces magical damage; its XP is matched to the lancer (280) so the level/resource arc into the late bosses holds.
    - border-rift-vanguard recategorized boss→normal in qaGates STORY_ENCOUNTERS — it has no boss:true enemy (mordrahn-vanguard + bog-terror), plays like its twin alliance-breach, sits at the ~0.87 sustain equilibrium (over the strict 0.85 boss ceiling, under the 0.9 normal ceiling), and the old boss label spuriously generated boss-scaling benchmarks for a non-boss.
    - Deliberately narrow cut (per the phase's "small cut" rule): only the physical-resister was placed. Measured findings recorded in PLAN.md — a 2nd on-route category enemy on the same border/alliance pair pushes the sage HP-carryover into the late masked-majin corridor (>0.9), and adding it as a 3rd combatant inflates the XP/level arc (training-clearing/geld fall out). The rally-cry support-check therefore needs its own placement + rebalance and stays open.
    - Regression guard extended: a new balanceHarness test anchors bog-terror.resistsCategory==='physical' in border-rift-vanguard and asserts BOTH categories (magical ⇒ physical, physical ⇒ magical) are forced somewhere on the mandatory route.
    - Balance harness green for all three Rimuru specs (predator/sage/mimic), 487 unit tests, typecheck, production build.
  phase_85:
    - Reactions as a visible, teachable active defense: the timing-block windows existed in the engine (perfect=0.25x / success=0.5x / miss=full) but queueReaction was only reachable from tests + autoBattle — the player could never earn a perfect block. Wired into the BattleScene "Reagieren" action.
    - Engine: BattleAction 'brace' gains an optional timing (ReactionTiming); resolveBrace applies it party-wide, defaulting to 'success' when absent — so autoBattle/sim/old callers and every balance harness stay byte-for-byte unchanged. Only the manual UI path can now MISS (risk) or hit PERFECT (reward).
    - UI: picking "Reagieren" opens a sweeping timing bar (gold center zone = perfect, green band = success, else miss; Space or click to lock). A one-time tutorial overlay (flag tutorial.battle.reaction.seen) teaches the zones first. Auto-battle skips the window and plays the guaranteed block.
    - typecheck, 486 unit tests (added a brace-timing perfect/miss test), production build, and desktop game smoke verified.
  phases_0_8:
    - project setup and release pipeline
    - grid overworld
    - typed data and versioned saves
    - deterministic turn combat
    - menus, world interactions, and progression
    - audio, tutorial, options, and deployment
  phases_9_17:
    - game feel and battle depth
    - naming, evolution, relationships, and talent trees
    - story/quest expansion
    - art/audio production
    - accessibility, balance, mobile QA, and browser CI
  phases_18_23:
    - story-controlled party
    - Band 1 and Band 2 canon-first conversion
    - Ranga travel and legacy isolation
    - integration gates and experience polish
  phases_24_32:
    - generated hero, enemy, portrait, tile, banner, and arena assets
    - Dwargon, Orc Disaster, Lizard, Shizu/Ifrit, and Blumund content
  phases_33_38:
    - Shizu and Fuze story portraits
    - Canon-region banners
    - Kijin and Kaijin party battle cutouts and roster portraits
    - Canon-region overworld tiles
    - Canon boss and trigger-enemy cutouts
  phase_106:
    - Haupthandlungsstrang / Laufweg-Gating: the tempest-start hub used to open four regional gateways from one Kijin beat — `story.kijin.named` opened gate-to-dwargon AND gate-to-ember-hollow (Ifrit); `faction.kijin.sworn` opened gate-to-battlefield (Geld) AND gate-to-lizard-marsh, both flags set in the same kijin-naming dialog (which itself only requires story.slime-prologue.completed). Result: the high-level Orc-Disaster and Ifrit set-pieces were reachable almost immediately.
    - fix (data-only, src/data/world.ts): re-gated the regional gateways into a linear chain reusing existing completion flags — gate-to-dwargon keeps `story.kijin.named` (harmless smith city = entry), gate-to-lizard-marsh ← `faction.dwargon.allied`, gate-to-battlefield ← `story.lizard.allied`, gate-to-ember-hollow ← `faction.orcs.joined` (gate-to-blumund already ← faction.orcs.joined). Chain: Dwargon → Echsen → Geld → Blumund/Ifrit — canon-correct (lizard ally before orcs; Ifrit, highest level, last).
    - quest-side: reordered the regional QUESTS (lizard-alliance now before geld-disaster, blumund-guild after) so getTrackedQuestObjective — which preserves QUESTS order within the main group — always points at the next ACTUALLY reachable region.
    - no new flags and no save migration needed: gating reuses flags a save already holds if it progressed, so mid-game saves self-heal (return gateways are ungated, so no hard soft-lock). Balance harness is unaffected — qaGates resolves encounters by hardcoded mapId/position and never walks the gateway graph.
    - deliberate scope cut (ponytail): did NOT strip `main: true` from any regional quest (plan item d) — reordering the array already gives the tracker a single clean next-region, and reclassifying main-vs-optional is a larger semantic change (chapter banners/endings) with unclear payoff. Map graph/layouts untouched; only the unlock flags were wrong.
    - tests: 3 gateway tests updated (orcDisaster/lizardAlliance/shizuIfrit now assert the new prerequisite flag AND that the old kijin flag no longer opens the gate) + new test/gatewayChain.test.ts as a holistic regression guard on the full flag chain. typecheck, 475 unit tests (59 files) green, production build verified. e2e skipped: pure data-gating change with no scene/render/layout surface, and the smokes don't walk regional gateways (plus the known env browser-build mismatch from phases 92/93); the changed flow is covered directly by getTravelAtTile reachability tests.
  phase_107:
    - Karten-Lesbarkeit / Marker-Entstoerung: drawWorldObjects (OverworldScene) rendered every location/gateway/encounter/discovery/NPC as a filled translucent rectangle (+ bounds boxes + always-on name labels), so the overworld read as a field of coloured squares — worst at the tempest-start gateway cluster the player flagged.
    - fix (presentation-only, no data/save/flag change): filled squares → small round dots (this.add.circle, ~TILE*0.24–0.26) in the same kind-colour with a legibility-stroked glyph (⇄ gateway / ! encounter / ✦ discovery); location `bounds` → faint outline only (fill alpha 0, 1px stroke @0.22) instead of a filled region box; the tracked objective's dot is brighter and keeps the strong ◆ Ziel label.
    - de-clutter labels: location name labels now render only near the player or at the tracked objective, via a new PURE helper markerLabelVisible(player, target, isObjective, radius=3) in systems/overworld (Chebyshev grid distance) — the gateway cluster no longer paints every name at once; walk within 3 tiles (or track it) to see a name.
    - deliberate scope (ponytail): NPC and shop tokens (interactive entities that already carry their own glyph) left as-is — the plan targeted the gateway/encounter/discovery map clutter, and NPC sprites double as the scene-script actor registry.
    - tests: new test/markerLabel.test.ts (objective always labelled regardless of distance; non-objective only within the radius incl. diagonal; custom radius). typecheck, 478 unit tests (60 files) green, production build verified. e2e/screenshot skipped: browser e2e is env-broken (Playwright build mismatch, as in phases 92/93) and the gateway-cluster scenario needs a progressed save at tempest-start, so a fresh-save shot would not show it; the change is a conservative, strictly-quieter render (same information, less fill) covered by the pure-helper test + build. Final marker size/alpha tuning is best judged in-game by the user.
  phase_87:
    - normal-enemy archetypes: extends the boss-only tactical-depth flags (Phase 82) to everyday fights, data-driven via two new EnemyDefinition flags wired through BattleUnitInput/Combatant
    - healsAllies (Mender): the enemy AI filtered out healing skills entirely (line in enemyTurn), so no enemy ever healed; menders now keep their heal skills, and scoreEnemySkillTarget scores healing the most-wounded ally (~0 at full HP, so a mender attacks when nobody is hurt). Applied to lizardman-acolyte (already had soothing-prayer)
    - party auto-battle now focuses menders (chooseTarget priority just under guard-break + a menderPressure term in scoreSkillTarget) so the mender is fair AND the balance harness plays it the way a human would (kill the healer)
    - enrageOnAllyDeath (pack): a surviving flagged ally enrages once (attack-up, +25 % attack) via a hook in checkDeath — the single death chokepoint, so every lethal path routes through it exactly once (guarded by an `enraged` flag). Applied to direwolf-pup + direwolf-alpha
    - balance lesson: enrage was first attack-up + haste, which flipped the fragile chapter-1 wolf fight (direwolf-pack-leader) and cascaded into a Geld carryover loss; reduced to attack-up-only, then all corridors green for every Rimuru spec
    - player feedback via existing paths only (status icon + battle log), no scene/render/asset change → E2E not required
    - typecheck, 426 unit tests (5 new: mender heals wounded ally, non-mender never heals, enrage fires + fires once, party AI focuses mender), balance harness green for all three Rimuru specs, and production build verified
  phase_88:
    - build-relevant encounters, increment 1 (damage-category resistance) — makes the branch-locked spec choice matter in combat instead of being cosmetic
    - new data-driven EnemyDefinition flag resistsCategory ('physical' | 'magical'): the enemy takes an entire damage category at 0.55× (soft-check, not a wall), so the wrong damage type is clearly worse and the player switches to the matching build/skill; wired via categoryResistMultiplier in applyDamage plus BattleUnitInput/Combatant plumbing
    - legibility via the battle log ("wehrt körperliche/magische Angriffe ab — stark reduziert") on each resisted hit, so no HUD/scene/render change
    - party auto-battle discounts skills of the resisted category in scoreSkillTarget (penalty = power*element*0.45, mirroring the 0.55× resist) so the AI — and the balance harness — bring the counter damage type, consistent with how element weaknesses are already used without an analysis gate
    - applied to two OFF-ROUTE enemies to avoid corridor churn: bog-terror (physical-resistant tank → burn it with magic) and stray-echo (magical-resistant echo → hit it with weapons)
    - deferred to a follow-up increment (Phase 88b): category-wide magic reflect, an explicit support-check add that flips the fight without control, and on-route placement once the harness party reliably carries both damage types
    - typecheck, 429 unit tests (3 new: physical-/magical-resist reduces only its own category, AI picks the counter type), balance harness green for all three Rimuru specs, and production build verified
  phase_88b:
    - build-relevant encounters, follow-up increment: two more data-driven combat archetypes on top of Phase 88
    - reflectsCategory ('physical' | 'magical'): the wrong damage type (whole category) reflects 0.3× back onto the party attacker (mirrors the Phase-82 reflectsElement block), punishing single-damage-type spam. Applied to ogre-warrior (physical / spiked hide, off-route in grieving-ogres)
    - support-check: new rally-cry skill (single-ally attack-up) makes an enemy a rallyer that keeps buffing its allies' attack — the party must control it (silence/CT-delay/focus) rather than out-sustain it. Applied to human-deserter (off-route, replacing its self-only battle-cry)
    - autoBattle scoreSkillTarget now avoids both reflected and resisted categories via one wrongCategoryPenalty (resisted: power*element*0.45; reflected: power*element*0.5 + 5), so the AI/harness bring the counter damage type
    - legibility via the battle log only, no scene/render/asset change → E2E not required
    - follow-ups 88c/88d placed the category and rallyer mechanics on-route once the fixed harness party reliably carried both damage types plus control
    - typecheck, 433 unit tests (4 new: reflector bounces only its own category, rallyer buffs an ally, a silenced rallyer buffs no one, AI avoids the reflected category), balance harness green for all three Rimuru specs, and production build verified
  phase_88c:
    - closes the "no corridor risk" gap from Phase 88/88b: the category-resistance mechanic now sits on the MANDATORY story route, not just in off-route side-quests/optional triggers — a player can no longer clear the main path without ever engaging the damage-category system
    - data-only change: the mandatory fight `marsh-frontier-clash` (ch. 3, spirit-marsh) swaps its spore-moth for `stray-echo` (resistsCategory 'magical'), so magic-only play is throttled and physical damage becomes the answer; keeps the XP-heavy human-lancer in the slot so the level/resource arc to the late bosses is preserved (dropping the lancer instead underlevels the party and Geld becomes unwinnable)
    - balance compensation: the tankier on-route echo adds a little Act-4 attrition, so the harness' modelled player restocks healing-herb 6→8 before the Federation/Geld double-boss (a reasonable player adaptation, not a corridor cheat) — with it, all three Rimuru specs (predator/sage/mimic) stay inside every story + boss corridor and Geld wins on all 5 seeds again (predator seed 1503 was the single razor-thin loss without it)
    - regression guard: new balanceHarness test asserts at least one mandatory STORY_ENCOUNTER carries a resists/reflects-category enemy and that marsh-frontier-clash specifically contains stray-echo, so a future edit cannot silently revert the on-route risk
    - deliberately scoped small (keep complexity low): only the magical-resist (→ forces physical) is placed on-route this increment; placing the physical-resist/reflect (→ forces magical) and the rally-cry support-check on-route is deferred to Phase 88d, because each tanky/low-XP addition before the razor-thin Geld boss needs its own measured rebalance
    - typecheck, 473 unit tests (1 new on-route-category guard), balance harness green for all three Rimuru specs, and production build verified; battle log-only legibility (no scene/render/asset change) → E2E not required
  phase_88d:
    - closes the remaining on-route build-check gap from Phase 88c without adding encounters: `border-rift-vanguard` already carries `bog-terror` (resistsCategory 'physical') as the mandatory magical-damage answer, and `orc-vanguard` now turns its existing `orc-soldier` into the support-check by replacing `war-cry` with `rally-cry`
    - deliberate balance scope: no new enemy slots, rewards, XP, route order, save fields, scenes, or assets; moving `rally-cry` onto the existing Ork-Soldat keeps the lesson mandatory while avoiding the Border/Alliance pair that previously pushed late-corridor carryover and level curves out of range
    - regression guard: balanceHarness asserts that `orc-soldier` carries `rally-cry`, that `orc-vanguard` contains the soldier, and that `orc-vanguard` is a mandatory STORY_ENCOUNTER
    - `git diff --check`, focused balance+battle tests, typecheck, full test suite, and production build verified; no E2E required because the change is combat data/test coverage only
  phase_89:
    - Teaching-curve audit for battle verbs: instead of adding a new tutorial system, `src/systems/battleTutorial.ts` now exposes `BATTLE_TEACHING_STEPS` as the single regression-checked order for the early verb ramp
    - the ramp introduces at most two new combat verbs per step: `training-clearing` teaches analyze/break, `direwolf-pack-leader` teaches CT/reaction, `whispering-grove-ambush` teaches status/devour, `shrine-approach` teaches telegraph, and `geld-disaster-boss` teaches signature/fusion
    - UI copy change is deliberately narrow: `training-clearing` gained the first battle overlay, Direwolf copy names CT/reaction, and Grove copy names the Devour setup window; no data rewards, save migration, assets, or battle rules changed
    - tests guard both the presence of tutorial overlays and the exact staged verb order; `git diff --check`, typecheck, full unit suite, production build, and `e2e/game.smoke.spec.ts` passed
  phase_86:
    - Out-of-combat depth, smallest useful slice: no new exploration system; reused the existing map discovery layer to make a story consequence visible on the overworld
    - after `story.direwolf.pact`, `tempest-start` shows `Rangas Rudelspur` at a free walkable tile near Tempest; it is a one-time discovery (`discovery.tempest-start.ranga-pack-trail`) rewarding `healing-herb`
    - regression test covers hidden-before-pact, visible-after-pact, one-time collection hiding, real item reward, and walkable placement through the existing discovery integrity loop
    - `git diff --check`, typecheck, full unit suite, production build, and full desktop/mobile `e2e/game.smoke.spec.ts` (54 passed) verified the visible Overworld change
  phase_90:
    - multiple save slots + in-game delete/new-game (previously a single fixed localStorage key with no UI way to reset)
    - slot layer in save.ts: slot 1 = existing base key (an existing single save becomes slot 1 with no migration), slots 2/3 suffixed; active slot in its own key (`tempest-chronik.activeSlot`); loadSave/writeSave/autoSave/resetSave now default their key to activeSaveKey(storage), so every game scene reads/writes the active slot without changes
    - listSaveSlots/getActiveSlot/setActiveSlot/slotSaveKey/activeSaveKey helpers; new SaveSlotScene (per slot: Fortsetzen / Neues Spiel / Löschen with a confirm overlay; cards show chapter banner + lead name/level + date)
    - Title keeps "▶ Spiel starten" (continues the active slot — existing e2e flow unchanged) and adds a "🗂 Speicherstände" button; slot selection sets the active slot then enters the Overworld
    - typecheck, 415 unit tests (6 new slot tests: isolation, active-slot default/clamp, defaults follow active slot, delete scoping), production build, and a new desktop e2e smoke (slots render, New Game sets the slot active) verified
  phase_91:
    - die Schmiede (crafting): closes the long-dead material loop — magic-ore/magisteel/orc-tusk drops and the unique boss cores (geld-core, spirit-ember) were consumed by nothing; now they are forge inputs, making them devour/hunt targets with a payoff
    - data-driven CraftingRecipe (data/crafting.ts): inputs = materials + gold → output = equipment/upgrade, gated by a story flag (all recipes require craft.smithing.unlocked, i.e. Gazel's verdict) with a repeatable flag; six recipes: refine-magisteel (2 magic-ore→magisteel), forge magisteel-blade/dwarf-plate/forge-band from magisteel(+orc-tusk), and two ONE-TIME boss-core recipes (geld-core→famine-charm, spirit-ember→new ember-signet accessory)
    - pure engine (systems/crafting.ts): isRecipeUnlocked (flag gate + one-time recipes vanish once crafted), canCraftRecipe (materials/gold with a reason string), craftRecipe (consumes inputs, adds output via the existing inventory helpers, records one-time IDs), buildForgeView (menu rows with owned/required, affordable, craftable) — no scene/WorldState dependency so it is fully headless-testable
    - persistence: new ProgressionState.craftedRecipeIds (uniqueStrings, defaults []) so one-time recipes stay consumed; save migration is automatic — readProgressionState reads raw.craftedRecipeIds via readStringArray, old saves default to [] (nothing forged yet)
    - UI reuses the smith gating: the Ausrüstung tab (which already gates enchant on canEnchantEquipment/near a smith) gets a "Schmieden ▸ / ◂ Ausrüstung" toggle that swaps the equipment panels for a forge recipe list; craft updates inventory+gold and persists progression.craftedRecipeIds
    - typecheck, 444 unit tests (11 new: data integrity, consume+produce, flag gating, insufficient material/gold no-op, one-time vanishes / repeatable persists, forge-view affordability, save roundtrip + migration), production build, and the desktop menu e2e smoke verified
  phase_93b:
    - Facility effects beyond raw resources, smallest useful slice: the Kitchen now turns a Tempest rest into a one-fight battle buff instead of only producing healing herbs
    - `restore-party` production sets `facility.kitchen.rest-buff.ready` only when the kitchen yields; `createProgressionBattleParty(..., flags)` maps that flag to a 3-turn `defense-up` opening status for the active party; `applyBattleResultToSave` consumes the flag after the next battle
    - no new facility type, save field, scene overlay, or balance model was added; it reuses boolean save flags plus the existing opening-status path
    - tests cover rest flag creation, opening-status application, and consumption after battle; `git diff --check`, typecheck, full unit suite, production build, and full desktop/mobile `e2e/game.smoke.spec.ts` (54 passed) verified it
  phase_92:
    - Bewohner (residents), first Nation-Arc layer: closes the dead loop "devoured enemy → nothing" — devouring a monster species now lets Rimuru name a survivor (Tensura naming = evolution + binding) and take them into Tempest as a resident with a role. Bestand only; no production yet (Phase 93 builds facilities on top)
    - data-driven ResidentDefinition (data/residents.ts, type in data/types.ts): seven residents, each coupling one devourable non-boss enemy species (originEnemyId) to a named resident with species + role (Wache/Späher/Handwerk/Heilung/Bau) + origin flavor; canon-first German wording, no copied dialog
    - pure engine (systems/residents.ts): recruitResidentsFromDevour(existing, devouredEnemyIds) is idempotent and returns residentIds in stable RESIDENTS order + newlyRecruited; buildResidentRoster(residentIds) returns entries (recruited flag + originEnemyName) + recruitedCount/totalCount + countsByRole; residentForEnemy/getResident lookups — no scene/BattleState dependency, fully headless-testable
    - recruitment signal: added devouredSourceIds:string[] to BattleState (populated in resolveDevour with target.sourceId) and surfaced on BattleView; battleResult only recruits on a won battle from that unambiguous list (not from shared devourSkillIds, which would false-positive across species that teach the same skill)
    - persistence: new ProgressionState.residentIds (uniqueStrings, defaults []); save migration automatic — readProgressionState reads raw.residentIds via readStringArray, old saves default to [] (no residents yet)
    - UI: a third Codex mode "🏛️ Bewohner" alongside Wissen/Verschlingen (reuses codexPage paging + codexFooter); recruited residents show name/species/role + origin, unrecruited show the enemy to devour; role-count summary header; footer "N/M Bewohner"
    - typecheck, 457 unit tests (13 new: data coupling/uniqueness, recruit idempotency/ordering/unknown-ignore, roster counts, persistence roundtrip + v1 migration, battle-result recruit on win + no-recruit on loss), production build verified; e2e not runnable in this environment (Playwright expects browser build 1228, only 1194 present — pre-existing version mismatch)
  phase_93:
    - Einrichtungen & Produktion, second Nation-Arc layer: closes the loop kämpfen/erkunden → Material+Bewohner → Rast → Produktion → Macht. The Phase-92 residents now do something — each rest cycle turns their labor into resources that feed the Phase-91 forge and survival supplies
    - data-driven FacilityDefinition (data/facilities.ts, types in data/types.ts): four facilities, each staffed automatically by resident role (NO manual assignment UI — deliberately low complexity) and producing one output per cycle: Schmiede←Handwerk→magic-ore, Küche←Heilung→healing-herb, Trainingshalle←Bau→mana-drop, Wache←[Wache,Späher]→gold. Every one of the five roles maps to exactly one facility (asserted in tests)
    - pure engine (systems/facilities.ts): facilityLevelForStage couples output strength to tempestGrowth (wilderness=0 → locked, camp=1, village=2, city=3); facilityOutputAmount = staffCount × level × perStaffPerLevel; buildFacilityOverview(residentIds, flags) returns per-facility view (unlocked/level/staff names/amountPerCycle) + totalPerCycle; runProductionCycle(input) is deterministic (no RNG), pure (does not mutate input inventory/gold), and returns ok=false with a reason in wilderness or when unstaffed — no scene/save dependency, fully headless-testable + balance-simmable
    - persistence: new ProgressionState.productionCycles counter (clampNonNegativeInteger, defaults 0); save migration automatic — readProgressionState reads raw.productionCycles via readNonNegativeInteger, old saves default to 0. The yield itself flows straight into world inventory/gold (already persisted); the counter is display/stats + a clean migration surface
    - UI: a fourth Codex mode "🏭 Einrichtungen" alongside Wissen/Verschlingen/Bewohner (mode buttons reflowed to fit 960px); shows stage/level/cycle summary, each facility's staff + yield-per-cycle, and a "🏕️ Tempest-Rast halten" button that runs one cycle, adds outputs to inventory/gold, increments productionCycles, persists (mirrors the Phase-91 forge persist pattern)
    - typecheck, 472 unit tests (15 new: data integrity/role-coverage, level scaling, overview locking/staffing, output monotonicity, cycle determinism/purity/failure-modes, migration roundtrip + v1 default), production build; e2e smoke ADDED and verified against the locally-present Chromium (build 1194) via a throwaway executablePath config — navigates Codex→Einrichtungen→Rast and asserts gold+16, productionCycles=1, magic-ore produced, zero browser errors (the committed playwright.config still expects build 1228, so `bun run test:e2e` stays red in this environment as before)
  phase_104:
    - Das Erwachen / Erntefest: added a one-time story- and magicule-gated awakening after `story.geld.devoured`; it consumes 160 magicules, marks `ProgressionState.awakeningCompleted`, stores the currently promoted residents as `awakenedResidentIds`, and raises the `story.harvest-festival.awakened` scene flag.
    - Payoff is deliberately reused through existing systems: Rimuru receives awakened combat perks/form naming in `createProgressionBattleParty`, awakened officers further boost facility output and resident/officer HP perks, and the facilities Codex view exposes the `Erntefest` button instead of adding a separate endgame scene.
    - Persistence/migration covers `awakeningCompleted` and `awakenedResidentIds`; tests cover awakening gates, one-time behavior, save roundtrip/migration, facility multipliers, resident labels, battle form naming, and the harvest-festival scene trigger.
    - Validation from the phase branch: `git diff --check`, `bun run typecheck`, `bun run test`, `bun run build`, and focused desktop Chromium smoke `Phase 93`.
  phase_102:
    - Magicule-/Seelen-Oekonomie, first Tensura-specific meta-resource layer: battles now award a pooled ProgressionState.magicules counter for later naming/evolution/awakening systems. Trash gives a small amount, unique devoured source IDs give a larger bonus, and defeated bosses give the largest bonus.
    - persistence: new ProgressionState.magicules counter (clampNonNegativeInteger, defaults 0); save migration automatic — readProgressionState reads raw.magicules via readNonNegativeInteger, old saves default to 0.
    - UI: Battle victory rewards include the Magicules gained, and the Menu header shows the current Gold + Magicules pool. No spending UI yet; Phase 103/104 consume the pool.
    - typecheck, 480 unit tests (5 battleResult tests cover reward formula, battle-result hook, save roundtrip + migration), production build, and desktop/mobile Title→Menu→Battle smoke verified.
  phase_103:
    - Named officers: recruited residents can be promoted with Magicules in the Bewohner Codex view. Promotion persists in ProgressionState.promotedResidentIds and spends the pooled ProgressionState.magicules resource.
    - Facility payoff: promoted residents count double for facility output, and facility staff labels show a star marker for officers.
    - Combat payoff: promoted residents grant the active battle party a small global max-HP TalentPerk via createProgressionBattleParty. This keeps the first increment passive and avoids a separate deploy/ally UI.
    - typecheck, 485 unit tests (promotion rules, persistence/migration, facility multiplier, battle max-HP effect), production build, and desktop/mobile Codex→Bewohner→Offizier→Einrichtungen smoke verified.
  phase_84:
    - devour as a directed hunt: buildDevourCompendium(WorldState) in world.ts lists every devourable enemy with the skill it teaches Rimuru (name resolved via SKILLS), sorted by level, flagged learned/open against Rimuru's learnedSkillIds — turns grind into a "which enemy do I hunt for which power" checklist
    - surfaced as a toggle inside the existing Codex tab ("Wissen" ↔ "🍴 Verschlingen") rather than a new top-level tab (the 8-tab row is full and menuTabButtonX/menuLayout test fix tabCount=8); drawCodex split into drawLoreEntries + drawDevourCompendium + shared codexFooter, lore rows nudged 170→194 to clear the toggle
    - progress note "N/M erbeutet"; entries show "✓/○ EnemyName (Lv X) — 🍴 Verschlingen lehrt: Skill"
    - typecheck, 421 unit tests (2 new compendium tests), production build, and a new desktop e2e (open Codex → toggle Verschlingen renders without browser errors) verified
  phase_83:
    - resource arc, increment 1 (MP as a scarcer cross-fight resource). Finding correction: HP/MP already carry between fights and there is NO auto full-restore (restore-party fires at one story beat only); recovery is item-driven and there are no shops mid-dungeon, so each dungeon is already a ration — items were just too cheap/potent for it to bite
    - mana-drop tightened 15→13 MP, price 35→40 (kept starting qty 2); deliberately mild — an aggressive MP nerf (10–12) destabilised the escalating high-HP bosses (Geld's Phase-80 escalation + MP starvation compound into seed-specific losses), so a gentle notch that keeps the harness green for every Rimuru spec
    - made the attrition measurable + guarded: BalanceEncounterAggregate now surfaces averagePartyHpFractionBefore/averagePartyMpFractionBefore (was captured per-run, not aggregated); new balanceHarness test asserts MP entering the late story fights is meaningfully below the early fights and no fight is entered at full MP (party enters late bosses at ~0.42–0.56 MP → real "burst or conserve" rationing)
    - a deeper economy rework (healing-item scarcity, retreat/rest budgets) is deferred — it needs the escalating-boss balance reworked in tandem, out of scope for this increment
    - typecheck, 419 unit tests (1 new attrition guardrail), production build verified; no scene/render change
  phase_82:
    - enemy archetypes that punish the standard "analyze weakness → exploit → sustain" tactic, all data-driven flags on EnemyDefinition wired through BattleUnitInput/Combatant like Phase 80's escalation
    - armoredUntilBreak (gabiru): takes ×0.65 damage until broken (guard-break) — and armored enemies now build +1 break pressure on ANY hit (not just weakness) so the break loop is reachable by every build, weakness just breaks faster; forces the Break loop instead of raw chipping
    - reflectsElement (masked-majin → 'holy', its apparent weakness): reflects 50% of that element's damage onto the party attacker — a thorns/false-weakness trap that punishes blind weakness-spam and pushes element variety
    - punishesHealing (ifrit): a living punisher retaliates on the healer whenever the party heals, so pure sustain costs HP
    - each archetype is one defining trait per boss (gabiru dropped its Phase-80 escalation so armor + escalation don't compound into an unwinnable drag); harness driver already brackets via Phase 81 reactions, tuned so all corridors stay green for every Rimuru spec while the archetype bosses' profiles shift measurably (masked-majin/sage 0.89→~0.76–0.89, ifrit rest ~0.4)
    - splitter/summoner deferred (needs mid-fight combatant spawning); feedback is via battle log + existing break-gauge HUD (no scene render change)
    - typecheck, 418 unit tests (3 new archetype tests), production build verified
  phase_81:
    - telegraph → counter-decision: the read→react loop already existed in the engine (prepareAutoReaction queues a block/counter on the predicted victim, applyDamage mitigates perfect 0.25×/success 0.5×/counter reflect) but was auto-battle-only and had no stakes; Phase 81 gives it stakes and a player path
    - data-driven `heavy` flag on big boss skills (black-flame, drago-nova, ogre-smash, famished-bite, ifrit-inferno); heavy hits ALWAYS telegraph (even un-analyzed, via refreshEnemyTelegraph) and deal ×1.6 against an unbraced party target — braced = a timely block/counter OR guard
    - new player `brace` action (BattleAction 'brace' → resolveBrace): spends the turn to queue a team-wide timing-block against the announced hit (tempo vs. safety); surfaced as a "🛡 Reagieren" button whenever an enemy telegraphs, plus a red "⚡ GROSSER TREFFER — kontern!" HUD warning (CombatantView.telegraphHeavy)
    - the balance harness driver (autoPlayBattleToEnd) now calls prepareAutoReaction before enemy turns, and prepareAutoReaction is gated to heavy hits only (good play braces big hits, not every poke) — so optimal play nets neutral and all corridors stay green for every Rimuru spec; synergises with Phase 80 (escalation makes the pressure real, so reacting finally pays)
    - typecheck, 409 unit tests across 55 files, production build, and desktop battle-render e2e smokes verified
  phase_80:
    - anti-turtle escalation: data-driven `escalationPercentPerTurn` on the seven story bosses; an escalating enemy's dealt damage ramps with its own action count (a consistent clock, independent of party size/speed), so drawn-out fights become lethal instead of a safe attrition race
    - escalationBonus grows only after a 5-action grace (efficient kills untouched → all balance-harness corridors stay green for every Rimuru spec), then +percent per action, capped at +200%; only direct hits are multiplied (DoT ticks are not)
    - player-visible pressure: a "wird rasend" battle-log line once the grace is passed, plus a red "⚠ rasend +X%" enemy HUD indicator (CombatantView.escalationBonusPercent) so the ramp reads as a decision to push for the kill
    - previously faceroll bosses (geld/gabiru/masked-majin ~0.92 rest-HP) now land mid-corridor (~0.64–0.82) without any becoming unwinnable; masked-majin/sage stays at 0.891 under its existing Phase-71 corridor override
    - typecheck, 406 unit tests across 55 files, production build, and desktop/mobile e2e smokes verified
  phase_40:
    - analysis and weakness reveal
    - enemy telegraph
    - CT delay and haste
    - control and impairment statuses
  phases_41_42:
    - Predator devour gating and bounded CT momentum
    - data-driven enemy acquisition skills
    - permanent duplicate-safe learned skills and save normalization
    - Rimuru water and Predator core with an eight-slot battle loadout
    - Codex unlock and rimuru-predator-devour talent gate
  phase_43:
    - generic signature meter and effect framework
    - ten distinct data-driven character signature actions
    - analysis, CT, status, reaction, team-meter, and break primitive reuse
    - battle HUD and auto-battle integration
    - Rigurd recruitment, save backfill, and generated battle cutout
  phase_44:
    - data-driven element fusion table and symmetric resolver
    - character resonance elements from skills and signature actions
    - relationship-gated Team-Mix partner selection in battle UI and auto-battle
    - fusion damage, break pressure, status effects, and deterministic tests
    - Playwright canvas screenshot and first-run onboarding smoke hardening
  phase_45:
    - analyzed enemies refresh and honor telegraphed skills
    - enemy skill scoring for CT control, guard-break focus, buffs, debuffs, and control statuses
    - auto-battle use of analyze, devour, support tempo, CT-delay, and telegraph reactions
    - deterministic battle and auto-battle coverage plus full browser smoke
  phase_46:
    - explicit enemy weakness, Devour, and telegraphable-action coverage
    - corrected decimal Devour success-rate calculation and visible chance
    - Kaijin signature and complete 21-pair non-neutral fusion matrix
    - Break, weakness, telegraph, Devour, signature, and status HUD presentation
    - German boss tutorials, Codex guidance, data validation, and full browser smoke
  phase_48:
    - voluntary Band-3 border-escalation start after Band 2 and Ranga's pact
    - `spirit-marsh` route, border clash, return gate, and rift coordinates
    - non-lethal Sumpfgrenze de-escalation with survivor aid and Codex lore
    - Shuna analysis based on indirect foreign seal traces, not a Tempest traitor claim
    - anonymous vanguard aftermath resolved through Ranga's trace before Gobta's report
    - headless save roundtrip, unit, build, and desktop/mobile browser smoke coverage
  phase_49:
    - voluntary Band-4 `ancestors-choice` start after completed Band 3
    - alliance council contributions from Shuna, Gobta, and Ranga before the march unlocks
    - breach and Bindungsherz finale with canon-visible old-order keeper naming
    - Freedom, Order, and Shared Burden endings persisted through stable flags and saves
    - Shared Burden gated by Band-3 de-escalation, Ranga's trace, and the closed alliance council
    - chapter summary, Ranga scout guidance, Codex, save roundtrip, and desktop/mobile browser coverage
  phase_50:
    - non-blocking overworld onboarding hints for movement, interaction, and menu use
    - per-step save flags that hide completed hints and set the legacy tutorial flag at completion
    - desktop and mobile Playwright smoke coverage for the onboarding flow
  phase_51:
    - overworld HUD reduced to a single menu button under the minimap
    - mobile D-pad and interaction preserved as separate touch-control surfaces
    - layout budget tests and desktop/mobile browser smoke updated for the menu-button path
  phase_52:
    - report-only balance harness over 13 story trigger encounters and five seeds
    - HP, MP, inventory, battle rewards, talent spending, and recovery carried through the route
    - normal, target-boss, and underleveled-boss corridor data exposed for Phase 53 assertions
  phase_53:
    - stronger boss attack and magic with shorter, more dangerous normal enemies
    - reduced healing scaling and increased MP costs for core healing skills
    - active five-seed story-route corridors for normal encounters and story bosses
    - target-level and underleveled boss benchmarks retained as report-only inputs for Phase 54
    - typecheck, 318 unit tests across 45 files, and production build verified
  phase_67:
    - upward-only enemy scaling with party level (triggers to party+1 capped at base+6, random to party-1 capped at base+8)
    - percentage stat growth per level above base without per-enemy growth tables
    - experience falloff against much lower base levels (gap 5 halves, gap 8 quarters) with unscaled gold
    - BattleScene and balance harness fight scaled units; boss benchmarks gained report-only overleveled +4/+8 modes
    - typecheck, 326 unit tests across 46 files, and production build verified
  phase_68:
    - Kaijin and Kurobe removed from the combat roster per user direction; both stay as story/smith NPCs with portraits
    - Kijin naming still names Kurobe without recruiting him; Kaijin founds the forge via flags and quest completion only
    - smith signatures, Kurobe evolution line, and Kurobe talent tree removed; party battle cutouts no longer loaded
    - old saves shed smith party members automatically on load, covered by a migration regression test
    - typecheck, 325 unit tests across 46 files, and production build verified
  phase_54:
    - boss: true flag on the seven story bosses (mordrahn, orc-disaster, ifrit, elder-direwolf, gabiru, masked-majin, milim)
    - devour against bosses capped at 5% max-hp and non-lethal outside the phase-2 guard-break window
    - bosses gain dedicated phase-2 skill sets (AoE/debuff) instead of only a higher skill chance
    - five-seed main-path sim keeps all 13 mandatory fights inside active corridors; underlevel boss benchmarks stay report-only pending Phase 55
    - typecheck, 332 unit tests across 46 files, production build, and 34 desktop/mobile e2e smokes verified
  phase_70:
    - spec-tree mechanics on top of the Phase 69 perk engine: TalentPerk type moved to data/types so SkillTreeNodeDefinition nodes carry `branch` + `perks`; canUnlockSkillNode enforces branch-lock (first branch chosen locks the others via committedBranch)
    - unlocked-node perks flow into battle through createProgressionBattleParty (talentPerksForNodes), so a fighter's chosen strand measurably shapes combat
    - six fighters converted to 3 exclusive 4-node branches (benimaru Klingensturm/Schwarzflamme/Flammenkommandant; shion, hakurou, souei; new trees for rigurd and ranga); structural-integrity test asserts 3 branches, one strand-free entry each, non-empty perks and real damaging chain-skills
    - the story/evolution/relationship-gated trees (gobta, shuna) are deferred to Phase 70b and rimuru's strands to Phase 71 to avoid regressing their gated content; typecheck, 382 unit tests, build and an in-browser battle smoke verified
  phase_69:
    - data-driven TalentPerk union (systems/talentPerk): damage-dealt/-taken by category+element, max-hp %, dodge, counter, skill-chain, buff-power — with pure aggregation helpers
    - wired into battle.ts at applyDamage (dealt/taken multipliers, dodge negation, independent counter proc), createCombatant (max-hp), resolveSkill (on-cast chain follow-up without turn/MP cost, no recursion) and applySkillStatus (buff duration extension)
    - perk-less units are behaviorally unchanged and draw no extra RNG (short-circuited), so existing deterministic battles are untouched; perks flow via createBattlePartyFromMembers(perksByCharacterId) for the Phase 70 spec trees
    - headless per-perk seed tests plus pure aggregation tests; typecheck, 375 unit tests, production build and an in-browser battle smoke verified
  phase_65:
    - RangaJourney discovery pattern generalized to walkable maps (systems/mapDiscovery): data-driven sparkle points carry lore + a reward item, claimed once via a flag
    - requiresFlag gates a discovery behind a story flag so the world visibly reacts — a healed Siegelhain in the spirit marsh appears only after the nameless echo is defeated (post-boss change)
    - DiscoveryScene presents the find as a modal over the paused overworld and grants the item; OverworldScene renders markers and launches it on step-onto with priority over random encounters
    - headless test covers tile gating, requiresFlag visibility, tile walkability and reward-item validity; typecheck, 364 unit tests, production build, and serial desktop/mobile e2e (38/38) verified
  phase_62:
    - data-driven, Phaser-free "cutscene-light" scene interpreter (systems/sceneScript) with move/face/emote/camera/text/give/wait steps, a headless runner and a validator against real actors/items
    - four biggest beats scripted (cave awakening, direwolf pact, Tempest naming, Geld victory) in data/scenes; flag-triggered and played once via a milestone-parity trigger (latest beat only, acknowledge all prior) so pre-existing saves do not replay old cutscenes
    - OverworldScene plays scenes in-world (input locked, actor-sprite registry, camera pan, emote bubbles) then shows the summary after; the existing milestone banner follows — moments are shown, not told beforehand
    - typecheck, 359 unit tests, production build, and serial desktop/mobile e2e (37/38; the one is a pre-existing timing-flaky milestone auto-show, passes ~5/6) verified
  phase_61:
    - last 16x16 Kenney placeholder sprites (hero, slime, wolf, imp, ogre) replaced by high-res generated WebP cutouts; new enemy-direwolf-pup and enemy-ogre-warrior assets with ASSETS.md provenance
    - legacy sprite texture keys aliased to the generated art and dropped from the NEAREST pixel list so only Kenney tiles keep nearest-neighbor filtering
    - typecheck, 352 unit tests across 50 files, production build, and desktop/mobile Chromium smokes (34/34 serial) verified
  phase_63:
    - tempest-start grows by story flags from Jura wilderness to camp, named village, and young Jura-Tempest city
    - three dedicated map layouts, generated ground textures, and generated region banners make each stage visually distinct
    - Rigurd changes position while Kijin and Dwargon quarters add Kurobe and Kaijin as visible smith NPCs in the city stage
    - generated-asset provenance recorded in ASSETS.md with deterministic texture and banner fallback coverage
    - typecheck, 336 unit tests across 46 files, production build, and dedicated desktop/mobile Chromium smokes verified
  phase_55:
    - mandatory-encounter experience raised so the grind-free harness path reaches the design levels (~L9 pre-Mordrahn, ~L11-12 pre-Geld, ~L13 pre-Ifrit) from required fights alone
    - mandatory bosses buffed to cost real party HP at those levels (mordrahn ~50%, ifrit ~65%, geld ~88% rest-HP) instead of ~0% filler; HP bloat avoided since it lets the party out-heal
    - the four random encounters widened to 2-3 enemy groups with rare drops (magic-ore, full-potion) so optional fights pay off
    - balance harness rebaselined to the leveled reality (story-boss rest-HP ceiling 0.8->0.95, normal 0.96->0.99) and now asserts the grind-free level targets via averagePartyLevelBefore; the tight "knapp" band and normal-fight relevance are deferred to Phase 56 (systemic healing/action-economy overhang)
    - typecheck, 336 unit tests across 46 files, production build, and 36 desktop/mobile e2e smokes verified
  phase_57:
    - Phaser 4.2 local source spike found no native renderer/canvas DPR switch for the required layout-preserving mode
    - game canvas backing store now uses 960x540 * min(devicePixelRatio, 2) while Phaser FIT keeps the CSS-scaled viewport centered
    - every scene installs a shared HiDPI helper that applies camera zoom for logical 960x540 coordinates and defaults text objects to DPR-aware resolution
    - canvas diagnostic data attributes and a dedicated Playwright HiDPI smoke assert logical size, capped backing size, and desktop/mobile DPR behavior
    - typecheck, 340 unit tests across 47 files, production build, HiDPI desktop/mobile smokes, and 36 existing desktop/mobile smokes verified
  phase_58:
    - global Phaser pixelArt and renderer roundPixels disabled so painterly generated/WebP art is no longer forced through nearest-neighbor filtering
    - PreloadScene applies explicit LINEAR filters to painterly tiles, region banners, portraits, enemy and party cutouts, battle backgrounds, and VFX
    - NEAREST is retained only for 16x16 Kenney pixel sources and procedural pixel placeholders
    - placeholderArt, portraitAtlas, vfxAtlas, and battleBackgroundAtlas generate DPR-sized runtime textures while scenes keep logical display sizes
    - typecheck, 343 unit tests across 48 files, production build, HiDPI desktop/mobile smokes, and 36 existing desktop/mobile smokes verified
  phase_56:
    - post-Phase-55 corridors retightened into the "knapp" band: normal rest-HP 0.65-0.99 -> 0.3-0.9, story-boss 0.2-0.95 -> 0.15-0.85, turn floor 4 -> 2
    - trash enemies given low HP but high attack/magic so weaknesses must be broken fast or the party takes real damage (filler 100%-HP wins removed)
    - shadow bosses (geld, masked-majin, orc-general) rebalanced off guard-break stacking onto reliable AoE via new umbral-burst skill; a few boss stat/skill knobs retuned
    - balance harness now buys healing-herb/mana-drop along the story route so the tighter band reflects played resource management, not attrition
    - typecheck, 343 unit tests across 48 files verified
  phase_73:
    - the four enemies with no encounter (orc-grunt, ogre-warrior, orc-lord, milim) are now reachable via optional flag-gated trigger encounters, reusing the existing ENCOUNTERS data pattern (no new systems)
    - orc-scout-patrol/grieving-ogres/orc-lord-remnant sit on jura-battlefield gated by story.treyni.met / story.orc.engaged / story.geld.devoured; milim-duel sits on tempest-start gated by story.ifrit.subdued
    - milim is an optional L20 duel wall far above target level, so it is deliberately NOT wired into the balance corridors and cannot soft-lock (losing just withholds story.milim.duel)
    - phase73Enemies.test asserts each is reachable on a walkable tile with its gate flag set and blocked without it; typecheck, 344 unit tests across 49 files, production build verified
  phase_59:
    - new Phaser-free menuLayout.ts generalizes the mobileLayout HudLayoutIssue pattern to the menu pages (shared analyzeRects, exported from mobileLayout); menuLayout.test asserts every dynamic list page stays inside 960x540 and every entry stays reachable across pages
    - overflowing menu lists (inventory, equippable, status skills/bindings, growth nodes, travel points) are now touch-safe paginated via paginateMenuList + a shared pager, instead of running off the canvas; growth page tightened so Rimuru's 7 talent nodes fit one page
    - quest log gained an active/completed status filter with its own paging and detail view; codex was already paged/filtered
    - party tab no longer double-lists the group: the left member selector is dropped there and the active-group cards are themselves clickable selectors (game.smoke party-swap updated to click the card)
    - fixed a tsc-only regression from phase 73 (phase73Enemies.test read position on the encounter union before narrowing to trigger); vitest/vite skip typecheck so it slipped through
    - typecheck, 349 unit tests across 50 files, production build, and the desktop menu smoke verified (two full-suite battle-transition smokes are timing-flaky in parallel but pass in isolation)
  phase_60:
    - target-tile world interaction was already in place from earlier work (getTravelAtTile matches the exact gateway tile, NPCs block their own tile so you stop in front and interact when adjacent); getAdjacentTravel now only survives in tests documenting that shift
    - victory presentation gained a level-up line: new pure summarizeBattleLevelUps(before, after) diffs active-party levels and BattleScene captures the pre-apply save to render "Stufenaufstieg: Name Lv.N"
    - the result dialog box and its button now grow with the number of reward/level-up/pact lines (cursor-based layout) instead of fixed coordinates
    - return to the overworld uses fadeToScene instead of scene.start; OverworldScene already fades in on create, so the transition is smooth both ways
    - typecheck, 351 unit tests across 50 files, production build verified (no existing e2e drives a full battle to the victory screen, so drawResult was validated by unit-tested logic + typecheck rather than in-browser)
  phase_74:
    - MenuScene tab and party geometry moved into the existing Phaser-free menuLayout.ts instead of local per-tab pixel shifts
    - menuTabButtonX/menuTabRowBounds center the full tab row on the 960x540 canvas; MENU_PARTY_LAYOUT centers the active-card plus reserve group as one unit
    - MenuScene now consumes the shared geometry for tab buttons, the party title, active cards, reserve buttons, hit areas, and labels
    - menuLayout.test gained a regression that locks the tab row and party group to the canvas center and checks their visible rectangles stay in-bounds
    - typecheck, 352 unit tests across 50 files, production build, desktop/mobile Party-Menue Playwright smoke, and visual desktop screenshot verified
  phase_75:
    - the Party-Menue swap smoke now derives active-card and reserve-button clicks from MENU_PARTY_LAYOUT instead of duplicating coordinates
    - PLAYWRIGHT_PORT lets parallel worktrees use separate Vite ports instead of silently reusing another phase's server
    - typecheck, 352 unit tests across 50 files, production build, and an isolated desktop/mobile Party-Menue Playwright smoke verified
  phase_72:
    - Talentbaum renders branched fighter specs as three columns with parent-child edges, active/available/locked states, and the exact unlock failure in the selected-node preview
    - perk effects are described before purchase; choosing the first node of a branch requires confirmation because the other two branches become locked
    - pure specTreeLayout helpers cover placement, overlap checks, and bounded touch/wheel panning; unbranched legacy trees keep the paginated list
    - typecheck, 387 unit tests, production build, and isolated desktop/mobile Spec-Baum Playwright smokes verified

Git history is the source for exact acceptance notes and historical test counts.

## 12. Task-Oriented Context Loading

### Battle

```text
src/data/types.ts
src/data/characters.ts
src/data/skills.ts
src/data/enemies.ts
src/systems/battle.ts
src/systems/battleResult.ts
src/systems/battleView.ts
src/systems/autoBattle.ts
src/scenes/BattleScene.ts
test/battle.test.ts
test/battleResult.test.ts
test/autoBattle.test.ts
```

### World and story

```text
src/data/world.ts
src/data/maps.ts
src/systems/world.ts
src/scenes/OverworldScene.ts
src/scenes/DialogueScene.ts
test/world.test.ts
test/playthrough.test.ts
test/dataValidation.ts
```

### Party and progression

```text
src/data/characters.ts
src/data/progression.ts
src/systems/party.ts
src/systems/progression.ts
src/systems/menu.ts
src/scenes/MenuScene.ts
test/progression.test.ts
test/menu.test.ts
```

### Saves

```text
src/systems/save.ts
src/systems/profile.ts
test/save.test.ts
test/profile.test.ts
test/phase22Integration.test.ts
```

### Assets and rendering

```text
ASSETS.md
src/render/artSpec.ts
src/render/hiDpi.ts
src/render/textureSharpness.ts
src/render/*Art.ts
src/scenes/PreloadScene.ts
src/assets/
test/assets.test.ts
test/artSpec.test.ts
test/*Art.test.ts
e2e/game.smoke.spec.ts
```

### Build and release

```text
package.json
bun.lock
tsconfig.json
vite.config.ts
playwright.config.ts
index.html
.github/workflows/
test/release.test.ts
```

## 13. Phase Notes

### Phase 282 - Nebeninhalte & optionale Regionen

- 3 optionale off-route Loot-Quests (Phase-154-Muster: Annahme-Dialog → Jagd-Encounter → Report-Dialog mit Gear-Belohnung), je in eine bestehende Nebenregion gelegt statt neuer Karte (vermeidet den von `regionBannerArt.test.ts` erzwungenen Banner-WebP + Preload). Rein datengetrieben in `src/data/world.ts`.
- `stormpeak-hunt` (Geisterschrein-Hochland, Gate `story.act1.completed`), `blumund-raiders-hunt` (Blumund, Gate `faction.orcs.joined`), `academy-cleansing-hunt` (Freiheitsakademie, Gate `story.shizu.vow`). Jagd-Encounter reuse bestehende Regionsgegner, off-route (kein `region.encounterIds`) → Balance-Harness unberührt.
- Validierung: `bun run typecheck`, `bun run test` (893 nach Merge), `bun run build`; neue `test/sideContent282.test.ts` (Datenintegrität, Gear-Reward, begehbare Jagd-Kachel, Flag/Quest-Wiring, Off-route-Garantie).

### Phase 283 - Post-Game / New-Game+ Zyklus

- NG+-Kern (EndingScene + Profil `endingsSeen`/`newGamePlusCount` + `startNewGamePlus`) existierte bereits; diese Phase macht den Zyklus im Save persistent und wirksam. Neues Feld `progression.newGamePlusCycle` (0 = Erstdurchgang), von `startNewGamePlus` je Durchgang +1 hochgezählt und über den mitgetragenen Progression-Zustand akkumuliert.
- `enemyScaling` nimmt optional `newGamePlusCycle` (Default 0 → Erstdurchgang und Alt-Saves unverändert) und eskaliert Ziellevel + Deckel um 5 je Zyklus; BattleScene reicht `save.progression.newGamePlusCycle` durch. Rückwärtskompatible Add-Feld-Migration. Deckt Feedback „overgrind darf nicht trivialisieren" auf der Post-Game-Schleife ab.
- Validierung: `bun run typecheck`, `bun run test` (888 Tests nach Merge), `bun run build`; neue `test/newGamePlus.test.ts` (Migration/Roundtrip, Increment, Eskalation + Zyklus-0-Regression).

### Phase 281 - Siedlungs-/Facility-Wachstum sichtbar

- Facility-Ausbaustufen und begehbare Distrikt-Silhouetten für Lager/Dorf/Stadt; `tempestFacilityArt` rendert Wachstumsstufen, Menü- und Overworld-Szene spiegeln den Fortschritt.
- Validierung: `bun run typecheck`, `bun run test` (882 Unit-Tests nach Merge), `bun run build`; Desktop-Chromium-Tempest-Smoke.

### Phase 280 - Kampf-Präsentation & Feedback

- Treffer zeigen signierte Schadens- und Treffer-/K.-o.-Labels; Großtreffer warnen mit sichtbarer Block-Aufforderung ohne unbekannte Skillnamen zu spoilern; benannte Signaturen erhalten beim Auslösen Banner, Flash und VFX.
- Validierung: `bun run typecheck`, `bun run test`, `bun run build`; Chromium-Kampf-Smoke (Titel → Overworld → Kampf).

### Phase 273 - Mehr Story-Content

- 5 neue Zwischenbeats im Hauptpfad (Rat, Hain, Ahnensiegel, Grenze, Vorhutspur) plus 5 Abschlussmomente auf Nebenpfaden; getrennte Szenen-Tracks verhindern, dass ein Nebenauftrag ungespielte Beats verwirft.
- Validierung: `bun run typecheck`, `bun run test`, `bun run build`.

### Phase 177 - Arena-Vorstand-Porträt

- Branch/Worktree wurde vor den parallelen Welt-Uhr-Phasen als `phase-172-arena-vorstand` in `/worktree/tempest-phase-172-arena-vorstand` angelegt; die Archivnummer wurde nach deren Push kollisionsfrei auf 177 gesetzt.
- Asset-only: Der wiederkehrende Arena-Vorstand nutzt im Kolosseum und in seinen Dialogen ein eigenes repo-generiertes 512×512-WebP-Porträt statt einer portraitlosen Darstellung; Daten und Balance bleiben unverändert.
- Provenienz steht in `ASSETS.md`; Portrait-Mapping, Preload und der bestehende Kolosseum-Smoke prüfen das sichtbare Asset.
- Validierung: `git diff --check`, 22 fokussierte Tests, `bun run typecheck`, 769 Unit-Tests inklusive Balance-Harness, `bun run build` und fokussierter Desktop-Chromium-Smoke.

### Phase 176 - Zeit-/wettergebundene Discovery-Funde

- `MapDiscoveryDefinition` unterstützt optionale Tageszeit-/Wetterbedingungen; Overworld- und Discovery-Szene reichen die persistierte Welt-Uhr an Sichtbarkeits- und Fundprüfungen weiter.
- Ein einmaliger Nebelfund im Flüsterhain und ein Nachtfund im Geisterhochland nutzen den bestehenden Discovery-Belohnungspfad; Kampf und Balance bleiben unberührt.
- Validierung: `test/mapDiscovery.test.ts`, Datenintegrität, Typecheck, 784 Unit-Tests, Build und Oberwelt-Browser-Smoke grün.

### Phase 175 - Tag-/Nacht-Tint der Oberwelt

- `overworldTint(clock)` liefert dezente Tageszeit-/Wetter-Tints; `OverworldScene` aktualisiert ein nicht-interaktives Overlay unter dem HUD beim Start und nach Schritten.
- Die Änderung ist rein kosmetisch und berührt weder Save noch Kampf oder Balance.
- Validierung: `test/worldClock.test.ts`, Typecheck, 782 Unit-Tests, Build und Oberwelt-Browser-Smoke grün.

### Phase 174 - Wetter-/Nacht-Funde

- `weatherConditionRewards` vergibt je erstem Sieg bei Nacht, Nebel und Regen einmalig 8 Magicules und persistiert die drei Bedingungen über `worldclock.first.*`-Flags.
- `BattleScene` reicht die Encounter-Uhr nur bei regulären Siegen weiter und zeigt neu verdiente Wetter-Funde im Ergebnis; ohne Uhr bleibt der Pfad unverändert.
- Validierung: 779 Unit-Tests inklusive `test/weatherReward.test.ts`, Typecheck, Build, Balance-Harness und Flüsterhain-Browser-Smoke grün.

### Phase 173 - Welt-Uhr im Kampf-HUD

- Reguläre Encounter reichen `clockHudLabel(clock)` an `BattleScene`; die Zeit-/Wetterzeile erscheint rechts oben im HUD und bleibt für Demo-/Altpfade optional.
- Validierung: `test/worldClock.test.ts`, Typecheck, 773 Unit-Tests, Build und Battle-Browser-Smoke grün.

### Phase 172 - Nebel-Eroeffnungsstatus

- `openingStatuses(clock)` liefert bei Nebel symmetrisches `blind` für alle Kämpfer; `startBattle` wendet optionale Umweltstatus einmalig an und protokolliert sie.
- Klar, Regen und Nacht ohne Nebel bleiben statusfrei; der bestehende Balance-Harness-Pfad ohne Uhr ist unverändert.
- Validierung: `test/worldClock.test.ts`, Typecheck, 773 Unit-Tests, Build und Balance-Harness grün.

### Phase 163 - Milim-Kampf-Cutout

- Branch/Worktree: `phase-163-milim-cutout` in `/worktree/tempest-phase-163-milim-cutout`.
- Asset-only: `milim` war der letzte Gegner ohne dedizierte Kampf-Textur (Kingdom-Atlas-Slime-Fallback); jetzt eigenes repo-generiertes 512×512-RGBA-Cutout (xAI Imagine, Chroma-Key lokal entfernt). Daten und Balance unveraendert.
- Provenienz steht in `ASSETS.md`; Preload-, Art-Mapping- und Browser-Asset-Checks decken Milim ab. Damit haben ALLE 33 Gegner-Arten dedizierte Texturen.
- Validierung: `bun run typecheck`, 764 Unit-Tests inklusive Balance-Harness, `bun run build` und fokussierter Desktop-Chromium-Smoke.

### Phase 162 - Kanon-Varianten-Cutouts

- Branch/Worktree: `phase-162-kanon-cutouts` in `/worktree/tempest-phase-162-kanon-cutouts`.
- Asset-only: `mordrahn-vanguard`, `elder-direwolf`, `orc-grunt` und `orc-lord` ersetzen geteilte Bestandstexturen durch eigene repo-generierte 512×512-RGBA-Cutouts (xAI Imagine, Chroma-Key lokal entfernt); `stray-echo` bleibt bewusst geteilte Echo-Textur. Daten und Balance unveraendert.
- Provenienz steht in `ASSETS.md`; Preload-, Art-Mapping- und Browser-Asset-Checks decken die vier Kanon-Varianten ab.
- Validierung: `bun run typecheck`, 764 Unit-Tests inklusive Balance-Harness, `bun run build` und fokussierter Desktop-Chromium-Smoke.

### Phase 161 - Archetypen-Cutouts

- Branch/Worktree: `phase-161-archetypen-cutouts` in `/worktree/tempest-phase-161-archetypen-cutouts`.
- Asset-only: `marsh-thornback`, `blumund-brigand` und `academy-revenant` ersetzen geteilte Bestandstexturen durch eigene repo-generierte 512×512-RGBA-Cutouts; Daten und Balance bleiben unveraendert.
- Provenienz steht in `ASSETS.md`; Preload-, Art-Mapping- und Browser-Asset-Checks decken alle fünf Phase-146-Archetypen ab.
- Validierung: `git diff --check`, `bun run typecheck`, 764 Unit-Tests inklusive Balance-Harness, `bun run build` und fokussierter Desktop-Chromium-Smoke.

### Phase 146 - Content-Vielfalt

- Canonicaler Parallelstand: fuenf neue Normalgegner aus vorhandenen Mechaniken in optionalen Regions- und Labyrinth-Pools; der Story-Trigger-Korridor bleibt unveraendert.
- Asset-Ergaenzung: `bog-warden` und `highland-galecaller` nutzen zwei repo-eigene 512×512-Cutouts aus OpenAI Built-in-Imagegen, lokal vom Chroma-Key freigestellt und in `ASSETS.md` dokumentiert.
- Validierung nach Parallel-Merge: `git diff --check`, Typecheck, Unit-Tests inklusive Balance-Harness, Build und fokussierter Desktop-Chromium-Asset-Smoke.

### Phase 121 - Shunas Einstiegstempo

- Branch/Worktree: `phase-121-shuna-tempo` in `/worktree/tempest-phase-121-shuna-tempo`.
- Entscheidung: Shuna bleibt bewusst frueher Band-2-Ratsschritt direkt nach dem Prolog; kein neuer Band-Content davor.
- Umsetzung: Band-2-Kapitelziel nennt zuerst Shunas Siegeldeutung, danach Gobtas Grenzplan und Rangas Scoutbericht; Questtext spiegelt diese Reihenfolge.
- Validiert mit `git diff --check`, `bun run typecheck`, `bun run test`, `bun run build`; fokussiert `test/chapterBanner.test.ts`.

### Phase 120 - Content-Gegnerassets

- Branch/Worktree: `phase-120-content-assets` in `/worktree/tempest-phase-120-content-assets`.
- Scope: zwei repo-eigene, generierte Battle-Cutouts fuer Region-Gegner: `enemy-blumund-bandit.webp` und `enemy-academy-wisp.webp`; Provenienz in `ASSETS.md`.
- Daten/Encounter: neue Gegner `blumund-bandit` und `academy-wisp`; Random-Encounter `blumund-road-ambush` in Blumund und `academy-spirit-flare` in der Freiheitsakademie.
- Validiert mit `git diff --check`, `bun run typecheck`, `bun run test`, `bun run build` und fokussiertem Desktop-Chromium-Smoke fuer die Blumund-/Akademie-Asset-Saves.

### Phase 112 - Praedator-Perversion

- Branch/Worktree: `phase-112-praedator-perversion` in `/home/viktor/worktree/tempest-phase-112-praedator-perversion`; sauber auf main rekonstruiert, weil die Branch-Historie fremde Phase-Commits enthielt.
- Scope: Rimuru bekommt nach `story.shizu.vow` die aktive Kampfaktion `steal`. Sie verlangt Verschlinger + Großen Weisen, ein analysiertes verschlingbares Ziel und nutzt `predatorStealSkillId` oder `devourSkillId` statt beliebiger gegnerischer `skillIds`.
- Soulbound-Regel: Bosse, Ultimate-Skills, Unique-Verb-Skills (`predator`, `great-sage`) und explizite `soulboundSkillIds` sind nicht raubbar. Geraubte Skills landen wie Verschlinger-Imitate in `mimicSkillIds` und können nach Sieg dauerhaft gebankt werden.
- Daten/UI: neues Unique-Skill-Rezept `fuse-predator-perversion`, Skill `predator-perversion`, Rauben-HUD-Asset `ui-praedator-steal-hud`, Preload-Key `ui-praedator-steal-hud`.
- Validierung: Typecheck, Unit-Tests, Build und Playwright-E2E sind Phase-Abnahmegates; Playwright nutzt wegen paralleler Server einen expliziten `PLAYWRIGHT_PORT`.

### Phase 97 - Formation/Reihen

- Branch/Worktree: `phase-97-formation` in `/worktree/tempest-phase-97-formation`.
- Scope: aktive Party-Mitglieder tragen optional `formationRow` (`front`/`back`); alte Saves normalisieren auf Front.
- UI: Party-Menue setzt Front/Hinterreihe, laedt `ui/formation-rows.webp` und zeigt Row-Badges; Battle-HUD positioniert und beschriftet Party-Units nach Row.
- Battle-Regel: Gegner priorisieren lebende Frontziele; Hinterreihe wird erst angegriffen, wenn keine Front mehr steht. Keine Schadenszahlen geaendert, damit die Balance-Harness stabil bleibt.
- Validiert mit `git diff --check`, `bun run typecheck`, `bun run test`, `bun run build` und gezieltem Desktop-Chromium-Smoke fuer Title/Menu/Battle.

### Phase 94 - Schlachtfeld-Zustand (Elementarfelder)

- Scope: `BattleState.field` (`BattleField = { element, turns }`, ein Feld gleichzeitig).
  Eine `chargesField`-Fähigkeit lädt das Feld auf ihr Element; gleichelementige Treffer
  werden verstärkt (×1.25), ein Fusions-Partner-Element (`resolveElementFusion`) löst eine
  Reaktion aus (Zusatz-Break-Druck + Fusions-Status, verbraucht das Feld), das Feld klingt
  pro Runde ab (`FIELD_DURATION_ROUNDS = 3`).
- Daten: neue Feld-Skills `ember-field` (Feuer/Benimaru), `gale-field` (Wind/Ranga),
  `tide-field` (Wasser/Souei) — reine Aufbau-Skills (power 0, target self), daher NICHT
  auto-gewählt → Balance-Harness bleibt unverändert grün.
- HUD: `renderView().field` liefert Element+Runden; `BattleScene` zeigt „Feld: <Element> (n)"
  unter der Team-Leiste, solange ein Feld geladen ist.
- Validiert mit `bun run typecheck`, `bun run test` (inkl. `test/elementalField.test.ts` +
  Balance-Harness), `bun run build` und einem Battle-Render-Smoke (desktop-chromium).

### Phase 105 - Mimikry als aktive Kampf-Form

- Scope: neue Kampf-Aktion `{ type: 'mimic', element }`. Rimuru (Verschlinger) nimmt on-demand
  das Element einer in diesem Kampf verschlungenen Gegner-Art an (`availableMimicElements` liest
  `devouredSourceIds` → Enemy-Element). Die Form haelt `MIMIC_FORM_TURNS = 3` eigene Zuege und
  klingt in `startTurn` ab; sie setzt `mimicElement`/`mimicTurns` + Resonanz.
- Effekt: der sonst elementneutrale Grundangriff kanalisiert das Form-Element und wirkt damit
  Schwaeche/Resistenz (`elementMultiplier` nur bei aktiver Form) — On-Demand-Schadenselement gegen
  reflectsElement/Schwaechen. Basiselement/Defensive bleiben unveraendert.
- Harness: Auto-Battle waehlt `mimic` nie → `mimicElement` bleibt in der Balance-Harness immer null,
  Grundangriffe unveraendert → Korridore gruen.
- UI/HUD: Kampfmenue zeigt „⟳ Mimik" (wenn Formen verfuegbar) → Element-Auswahl (`mimic-forms`);
  die aktive Form steht ueber der Einheit. `renderView().party[].mimicElement/mimicTurns` headless.
- Validiert mit `bun run typecheck`, `bun run test` (`test/mimicForm.test.ts` + Balance-Harness),
  `bun run build` und Battle-Render-Smoke (desktop-chromium).

### Phase 109 - Skript-Bosse & Adds (mid-fight Beschwoerung)

- Scope: neue Grundfaehigkeit — ein Boss beschwoert beim Wechsel in Phase 2 einmalig
  zusaetzliche Combatants in den `BattleState`. Datengetrieben ueber
  `EnemyDefinition.summonEnemyId`/`summonCount`; `spawnSummons` haengt in `updateEnemyPhase`
  am bestehenden Phasen-Trigger.
- Hard-Termination: `Combatant.summonsUsed` erlaubt genau eine Beschwoerung je Boss; endliche
  Zahl -> keine Endlos-Spawns/Soft-Lock in Sims/Tests. Auto-Battle behandelt beliebige
  Gegnerzahlen (zielt auf alle Lebenden), Siegbedingung schliesst Adds ein.
- Content: `magic-colossus` (Ramiris-Labyrinth, ausserhalb der Balance-Harness-Story) beschwoert
  2× `stray-echo` — thematisches Set-Piece ohne neue Assets. Harness/Story-Bosse bleiben
  unberuehrt -> Korridore gruen.
- HUD: die Adds erscheinen ueber `renderView().enemies` automatisch als weitere Gegner.
- Validiert mit `bun run typecheck`, `bun run test` (`test/scriptBoss.test.ts`: Spawn/
  Einmaligkeit/Termination + Balance-Harness), `bun run build` und Battle-Render-Smoke.

### Phase 164 - Sichtbares Skill-Raub-Banner

- Scope: Das vorhandene `ui/predator-perversion-skillsteal.webp` erscheint nur in der
  Rauben-Zielwahl; das nie gerenderte, textfehlerhafte JPG-Duplikat wurde entfernt.
- Wiring: `PreloadScene` lädt `ui-predator-steal`; `BattleScene` rendert es nur bei
  `pendingSteal` im Gegner-Zielmodus. Kampfregeln und Balance bleiben unverändert.
- Validiert mit `git diff --check`, Typecheck, 765 Unit-Tests inklusive Balance-Harness,
  Build und fokussiertem Desktop-Chromium-Smoke.

### Phase 165 - Grosse Rasterassets als WebP

- Scope: Sieben global vorgeladene 2-3-MB-PNGs (Akademie, Kolosseum, Invasion,
  Ramiris-Labyrinth, Magiekoloss und Shizus Kinder) wurden bei gleicher Aufloesung
  als WebP verdrahtet; der Magiekoloss behaelt seinen Alpha-Kanal.
- Wirkung: 18.541.022 -> 2.410.884 Bytes (-87 %) fuer diese sieben Assets, ohne
  Art-, Layout-, Gameplay- oder Balance-Aenderung.
- Validiert mit Format-/Wiring-Tests, `git diff --check`, Typecheck, 766 Unit-Tests
  inklusive Balance-Harness, Build und vier fokussierten Desktop-Chromium-Smokes.

### Phase 169 - Ultimate Gift

- Branch/Worktree: `phase-169-ultimate-gift` in `/worktree/tempest-phase-169-ultimate-gift`.
- Canon-Feature (IDEE.md §1): nach dem Erntefest erhaelt jeder der acht Party-Gefaehrten EIN massvolles Ultimate-Geschenk als TalentPerk ueber den bestehenden `awakenedPerksForMember`-Pfad (`ULTIMATE_GIFT_PERKS_BY_CHARACTER` in `systems/progression.ts`); Rimuru behaelt seine eigenen Erwachen-Perks. Reine Datenergaenzung, kein Motor-Eingriff.
- Balance: die Auto-Battle-Harness laeuft ohne `awakeningCompleted` → Korridore strukturell unberuehrt; Harness gruen gefahren.
- Validierung: `bun run typecheck`, 768 Unit-Tests inklusive Balance-Harness, `bun run build`.

### Phase 168 - Ende-Key-Arts

- Branch/Worktree: `phase-168-ende-keyart` in `/worktree/tempest-phase-168-ende-keyart`.
- Asset-only: die EndingScene erhaelt je Ende ein repo-generiertes 1280×720-Key-Art (`backgrounds/ending-{freedom,order,true}.webp`, je ~120 KB) mit 0.72-Abdunkelungs-Overlay; ohne Ende-Flag bleibt das alte Voll-Schwarz-Layout (Fallback). Keine Daten-/Balance-Aenderung.
- Provenienz steht in `ASSETS.md`; der E2E-Asset-Check deckt alle drei Key-Arts ab.
- Validierung: `bun run typecheck`, 767 Unit-Tests inklusive Balance-Harness, `bun run build`, Desktop-Chromium-Smoke (Asset-Preload).

### Phase 167 - Titelbildschirm-Key-Art

- Branch/Worktree: `phase-167-titel-keyart` in `/worktree/tempest-phase-167-titel-keyart`.
- Asset-only: der Titelbildschirm (einzige Szene ohne Art-Layer) erhaelt ein repo-generiertes 1280×720-Key-Art (`backgrounds/title-keyart.webp`, 90 KB) hinter Titel/Menue mit 0.45-Abdunkelungs-Overlay; kanontreuer gesichtsloser Slime, Tempest-Stadt, Drachensilhouette im Sturmhimmel. Keine Daten-/Balance-Aenderung.
- Provenienz steht in `ASSETS.md`; der E2E-Asset-Check deckt das Key-Art ab.
- Validierung: `bun run typecheck`, 767 Unit-Tests inklusive Balance-Harness, `bun run build`, Desktop-Chromium-Smokes (Title-Flow + Asset-Preload).

### Phase 166 - Generierte Gegner-Cutouts als WebP

- Scope: Die zehn verbleibenden generierten 512x512-Gegner-PNGs wurden bei gleicher
  Aufloesung als WebP verdrahtet; alle zehn behalten ihren Alpha-Kanal. Nur die drei
  winzigen 16x16-CC0-Tiles bleiben PNG.
- Wirkung: 2.166.404 -> 374.642 Bytes (-83 %) fuer diese zehn Cutouts, ohne Art-,
  Layout-, Gameplay- oder Balance-Aenderung.
- Validiert mit Format-/Wiring-Tests, `git diff --check`, Typecheck, 767 Unit-Tests
  inklusive Balance-Harness, Build und fokussiertem Desktop-Chromium-Smoke.

### Phase 171 - Mechanik-Handbuch im Codex

- Branch/Worktree: `phase-171-handbuch` in `/worktree/tempest-phase-171-handbuch`.
- Nutzeranforderung „ingame Mechaniken sauber erklaeren": achter Codex-Modus „📖 Handbuch" mit 18 knappen Mechanik-Eintraegen (`systems/handbook.ts`, `buildHandbook(flags)`); spoiler-sensible Eintraege hinter bestehenden Story-Flags (shizu.vow/council.ready/smithing.unlocked), Fusszeile zaehlt gesperrte Eintraege. Ergaenzt die Kampf-Teaching-Curve (Phase 89) um die Meta-Systeme.
- Codex-Modusleiste startet bei x=24 statt 300 (acht Modi in einer Zeile); alle E2E-Modusklick-Koordinaten angepasst.
- Validierung: `bun run typecheck`, 773 Unit-Tests inklusive Balance-Harness, `bun run build`, volle E2E-Suite (alle Projekte).

### Phase 170 - Mimik-HUD als WebP

- Scope: Das letzte grosse Nicht-WebP-HUD-Asset `mimic-form-indicator` wurde bei
  gleicher Aufloesung auf WebP umgestellt; der bestehende Phaser-Texture-Key bleibt
  stabil. Die drei winzigen Pixel-Tiles bleiben PNG.
- Wirkung: 209.448 -> 68.256 Bytes (-67 %), ohne Art-, Layout-, Gameplay- oder
  Balance-Aenderung.
- Validiert mit Format-/Wiring-Test, `git diff --check`, Typecheck, 769 Unit-Tests
  inklusive Balance-Harness, Build und fokussiertem Desktop-Chromium-Smoke.

### Phase 171 - Ramiris-Portrait

- Asset: `sprites/portrait-ramiris.webp`, 512x512, 96 KB; per Built-in-Imagegen
  aus den Projektstilreferenzen Milim/Treyni erzeugt und in `ASSETS.md` dokumentiert.
- Wiring: `ramiris` ist ein echter `PortraitKind`, `portraitKindForSpeaker('Ramiris')`
  liefert ihn; `PreloadScene` lädt das WebP unter dem bestehenden Portrait-Key. Damit
  nutzen Dialog und Overworld-NPC automatisch das echte Bild statt ohne Portrait.
- Validiert mit Mapping-/Asset-Tests, `git diff --check`, Typecheck, 769 Unit-Tests
  inklusive Balance-Harness, Build und fokussiertem Desktop-Chromium-Smoke.

### Phase 184 - Eigene Tiles fuer die Versiegelte Hoehle

- Branch/Worktree: `phase-184-sealed-cave-tiles` in
  `/home/viktor/worktree/tempest-phase-184-sealed-cave-tiles`.
- Assets: `tiles/tile-sealed-cave-{floor,wall}.webp`, 128x128, zusammen 11,4 KB;
  per Built-in-Imagegen erzeugt und in `ASSETS.md` dokumentiert.
- Wiring: `sealed-cave` nutzt die beiden Texturen ueber das bestehende
  `OVERWORLD_TILE_THEMES`-/Preload-Wiring mit unveraenderter Default-Fallbackkette.
- Validiert mit `git diff --check`, Theme-/Asset-Tests, Typecheck, 808 Unit-Tests
  inklusive Balance-Harness, Build und fokussiertem Desktop-Chromium-Smoke.

### Phase 185 - Eigene Tiles fuer das Goblin-Dorf

- Branch/Worktree: `phase-185-goblin-village-tiles` in
  `/home/viktor/worktree/tempest-phase-185-goblin-village-tiles`.
- Assets: `tiles/tile-goblin-village-{floor,wall}.webp`, 128x128, zusammen
  11,1 KB; per Built-in-Imagegen erzeugt und in `ASSETS.md` dokumentiert.
- Wiring: `goblin-village` nutzt die beiden Texturen ueber das bestehende
  `OVERWORLD_TILE_THEMES`-/Preload-Wiring mit unveraenderter Default-Fallbackkette.
- Validiert mit `git diff --check`, Theme-/Asset-Tests, Typecheck, 808 Unit-Tests
  inklusive Balance-Harness, Build und fokussiertem Ranga-Reise-Browser-Smoke.

### Phase 186 - Eigene Tiles fuer Ramiris' Labyrinth

- Branch/Worktree: `phase-186-ramiris-labyrinth-tiles` in
  `/home/viktor/worktree/tempest-phase-186-ramiris-labyrinth-tiles`.
- Assets: `tiles/tile-ramiris-labyrinth-{floor,wall}.webp`, 128x128, zusammen
  11,4 KB; per Built-in-Imagegen erzeugt und in `ASSETS.md` dokumentiert.
- Wiring: `ramiris-labyrinth` nutzt die beiden Texturen ueber das bestehende
  `OVERWORLD_TILE_THEMES`-/Preload-Wiring mit unveraenderter Default-Fallbackkette.
- Validiert mit `git diff --check`, Theme-/Asset-Tests, Typecheck, 808 Unit-Tests
  inklusive Balance-Harness, Build und fokussiertem Ramiris-Browser-Smoke.

### Phase 187 - Eigene Tiles fuer das Tempest-Kolosseum

- Branch/Worktree: `phase-187-tempest-colosseum-tiles` in
  `/home/viktor/worktree/tempest-phase-187-tempest-colosseum-tiles`.
- Assets: `tiles/tile-tempest-colosseum-{floor,wall}.webp`, 128x128, zusammen
  11,6 KB; per Built-in-Imagegen erzeugt und in `ASSETS.md` dokumentiert.
- Wiring: `tempest-colosseum` nutzt die beiden Texturen ueber das bestehende
  `OVERWORLD_TILE_THEMES`-/Preload-Wiring mit unveraenderter Default-Fallbackkette.
- Validiert mit `git diff --check`, Theme-/Asset-Tests, Typecheck, 808 Unit-Tests
  inklusive Balance-Harness, Build und fokussiertem Kolosseum-Browser-Smoke.

### Phase 188 - Vorhandener Dialog-Tastaturhinweis

- Branch/Worktree: `phase-188-dialog-keyboard-hint` in
  `/home/viktor/worktree/tempest-phase-188-dialog-keyboard-hint`.
- Asset-Reuse: `ui/dialog-keyboard-hint.webp` wird jetzt vorgeladen; aus dem
  bestehenden 1280x720-Bild wird per Phaser-Frame nur der 500x500-Tastenbereich
  verwendet, ohne eine neue oder duplizierte Asset-Datei.
- Wiring: `DialogueScene` zeigt den 150x150-Hinweis oberhalb des Dialogpanels; der
  vorhandene Tastaturpfad bleibt unveraendert.
- Validiert mit `git diff --check`, Asset-/Scene-Test, Typecheck, 809 Unit-Tests
  inklusive Balance-Harness, Build und fokussiertem Prolog-Dialog-Browser-Smoke.

### Phase 189 - Eigene Tiles fuer die Direwolf-Lichtung

- Direkt auf `main` (geplanter Lauf, per Auftrag autorisiert statt Phase-Worktree).
- Assets: `tiles/tile-direwolf-den-{floor,wall}.webp`, 128x128, zusammen ~3,6 KB;
  projektintern prozedural erzeugt (Python/Pillow, nahtlose Tileable-Value-Noise)
  und in `ASSETS.md` als projektgenerierte Originale dokumentiert.
- Wiring: `direwolf-den` nutzt jetzt eigene `DIREWOLF_DEN_FLOOR/WALL`-Keys statt der
  geliehenen `LIZARDMAN_MARSH_*`-Tiles, ueber das bestehende
  `OVERWORLD_TILE_THEMES`-/Preload-Wiring mit unveraenderter Default-Fallbackkette;
  kein neuer Renderpfad, keine Balance-Beruehrung (rein kosmetisch, off-combat).
- Validiert mit Theme-/Preload-Tests, Typecheck, Unit-Tests inklusive
  Balance-Harness, Build und Desktop-Chromium-Smoke der geladenen Direwolf-Tiles.

### Phase 190 - Eigene Tiles fuer die Freiheitsakademie

- Direkt auf `main` (geplanter Lauf, per Auftrag autorisiert statt Phase-Worktree).
- Assets: `tiles/tile-freedom-academy-{floor,wall}.webp`, 128x128, zusammen ~3,9 KB;
  projektintern prozedural erzeugt (Python/Pillow, nahtlose Tileable-Value-Noise)
  und in `ASSETS.md` als projektgenerierte Originale dokumentiert.
- Wiring: `freedom-academy` nutzt jetzt eigene `FREEDOM_ACADEMY_FLOOR/WALL`-Keys statt
  der geliehenen `BLUMUND_*`-Tiles, ueber das bestehende
  `OVERWORLD_TILE_THEMES`-/Preload-Wiring mit unveraenderter Default-Fallbackkette;
  kein neuer Renderpfad, keine Balance-Beruehrung (rein kosmetisch, off-combat).
- Validiert mit Theme-/Preload-Tests, Typecheck, Unit-Tests inklusive
  Balance-Harness, Build und dem erweiterten Freiheitsakademie-Desktop-Chromium-Smoke.
- Damit hat jede der 14 Karten ein eigenes Tile-Set; verbleibende Leihe ist nur noch
  die `tempest-start`-Wildnis-Basis (an die Wachstums-Tile-Umschaltung gekoppelt).

### Phase 191 - Eigener Jura-Wald-Boden & -Wand fuer die tempest-start-Wildnis

- Direkt auf `main` (geplanter Lauf, per Auftrag autorisiert statt Phase-Worktree).
- Assets: `tiles/tile-tempest-wilderness-{floor,wall}.webp`, 128x128, zusammen ~2,7 KB;
  projektintern prozedural erzeugt (Python/Pillow, nahtlose Tileable-Value-Noise),
  in `ASSETS.md` als projektgenerierte Originale dokumentiert.
- Wiring: Das `tempest-start`-Theme (`OVERWORLD_TILE_THEMES`) traegt jetzt die neuen
  `TEMPEST_WILDERNESS_FLOOR/WALL`-Keys statt der geliehenen `LIZARDMAN_MARSH_*`; die
  `wilderness`-Wachstumsstufe rendert dadurch eigenen Jura-Waldboden statt Echsen-Sumpf.
  Camp/Village/City-Boeden (eigene Keys) bleiben unveraendert; `lizardman-marsh` behaelt
  seine Tiles. Neue Keys zusaetzlich in `linearTextureKeys` (gleiche Filterung wie die
  Wachstums-Boeden). Kein neuer Renderpfad, keine Balance-Beruehrung (kosmetisch).
- Validiert mit Theme-/Preload-Tests, Typecheck, Unit-Tests inklusive Balance-Harness,
  Build und Desktop-Chromium-Smoke der wilderness-Stufe (geladene Wildnis-Tiles).

### Phase 192 - Die Siedlungsmauer waechst mit (stufenabhaengige tempest-start-Waende)

- Direkt auf `main` (geplanter Lauf, per Auftrag autorisiert statt Phase-Worktree).
- Assets: `tiles/tile-tempest-{camp,village,city}-wall.webp`, 128x128, zusammen ~5,5 KB;
  projektintern prozedural erzeugt (Python/Pillow, nahtlose Tileable-Value-Noise),
  in `ASSETS.md` als projektgenerierte Originale dokumentiert. Progression: grobe
  Palisade (camp) -> Holz-/Flechtwerk mit Steinsockeln (village) -> Quader-Steinmauer
  (city).
- Wiring: `overworldTileTextureCandidates` waehlt fuer `tempest-start` die Wand jetzt
  symmetrisch zur bestehenden stufenabhaengigen Boden-Auswahl (`tempestWallKey` spiegelt
  `tempestFloorKey`); die `wilderness`-Stufe faellt auf die eigene Wildnis-Wand (Phase
  191, `theme.wallKey`) zurueck. Andere Karten unberuehrt (Nicht-tempest-start-Maps
  laufen weiter ueber `theme.wallKey`). Preload-Wiring analog inkl. `linearTextureKeys`.
  Kein neuer Renderpfad, keine Balance-Beruehrung (kosmetisch, off-combat).
- Damit reift Tempest sichtbar in Boden UND Wand; das Regionen-Identitaets-Projekt ist
  abgeschlossen — jede Karte inkl. aller vier tempest-start-Stufen hat ein eigenes
  Boden+Wand-Set.
- Validiert mit Theme-/Preload-Tests, Typecheck, Unit-Tests inklusive Balance-Harness,
  Build und Desktop-Chromium-Smoke der camp-Stufe (geladene Lager-Wand-Textur).

### Phase 193 - Eigene Kampfarena fuer die Glutgrotte

- Urspruenglich parallel als Phase 189 umgesetzt; beim Merge nach den bereits
  archivierten Phasen 189-192 konfliktfrei auf Phase 193 fortgeschrieben.
- Branch/Worktree: `phase-189-ember-hollow-arena` in
  `/home/viktor/worktree/tempest-phase-189-ember-hollow-arena`.
- Asset: `backgrounds/battle-ember-hollow.webp`, 1280x720, 212,9 KB; per
  Built-in-Imagegen erzeugt und in `ASSETS.md` dokumentiert.
- Wiring: `ember-hollow` nutzt die Textur ueber das bestehende Map-Arena-/Preload-
  Wiring; damit teilen `masked-majin-ambush`, `ifrit-boss` und
  `emberforge-hunt-battle` ohne Encounter-Sonderfaelle dieselbe Arena.
- Validiert mit `git diff --check`, Arena-/Preload-Test, Typecheck, 809 Unit-Tests
  inklusive Balance-Harness, Build und fokussiertem Ember-Hollow-Browser-Smoke.

### Phase 194 - Imagegen-Refresh fuer die Direwolf-Lichtungs-Tiles

- Urspruenglich parallel als Phase 190 umgesetzt; beim Merge nach den bereits
  archivierten Phasen 189-193 auf Phase 194 fortgeschrieben.
- Branch/Worktree: `phase-190-direwolf-den-tiles` in
  `/worktree/tempest-phase-190-direwolf-den-tiles`.
- Assets: `tiles/tile-direwolf-den-{floor,wall}.webp`, 128x128, zusammen 11,5 KB;
  per Built-in-Imagegen erzeugt und in `ASSETS.md` dokumentiert. Sie ersetzen die
  prozeduralen Schnee-/Steinplatten durch trockene mondhelle Walderde sowie eine
  klar blockierende Kiefernwurzel-/Felskante passend zu Banner und Kampfarena.
- Wiring und Tests aus der bereits gelandeten Phase 189 blieben unveraendert;
  der Merge uebernahm ausschliesslich den sichtbar besseren Asset-Satz samt
  korrigierter Provenienz.
- Validiert mit `git diff --check`, Typecheck, 814 Unit-Tests inklusive
  Balance-Harness, Build und fokussiertem Direwolf-Lichtungs-Desktop-Chromium-Smoke
  inklusive beider separat geladener Texturen.

### Phase 195 - Imagegen-Refresh fuer die Freiheitsakademie-Tiles

- Branch/Worktree: `phase-195-freedom-academy-tiles` in
  `/worktree/tempest-phase-195-freedom-academy-tiles`.
- Assets: `tiles/tile-freedom-academy-{floor,wall}.webp`, 128x128, zusammen
  17,0 KB; per Built-in-Imagegen erzeugt und in `ASSETS.md` dokumentiert. Sie
  ersetzen die prozeduralen Fliesen-/Ziegelraster durch warmes Natursteinpflaster
  und eine klar blockierende gotische Schieferdach-/Natursteinkante passend zum
  vorhandenen Regionsbanner.
- Bestehende Texture-Keys, Theme-/Preload-Wiring, Fallbackkette und Tests blieben
  unveraendert; kein neuer Renderpfad und keine neue Abhaengigkeit.
- Validiert mit `git diff --check`, Theme-/Preload-Test (6/6), Typecheck,
  814 Unit-Tests inklusive Balance-Harness, Build und vorhandenem
  Freiheitsakademie-Desktop-Chromium-Smoke inklusive beider geladener Texturen.

### Phase 196 - Gefaehrtennamen erst nach der Benennung

- Branch/Worktree: `phase-196-companion-names` in
  `/worktree/tempest-phase-196-companion-names`.
- Der gemeinsame NPC-/Dialog-Anzeigepfad maskiert Gobta, Ranga, Hakurou und Shuna
  bis zu ihren bestehenden Story-Flags als Goblin, Schattenwolf, Oger oder Ogerin.
  Die statischen Weltdaten und gespeicherten Charakter-IDs bleiben unveraendert.
- Die vorhandenen Entscheidungen schlagen Gobta, Ranga und die Kijin-Namen explizit
  vor; nach Bestaetigung setzen die bestehenden Effekte weiterhin die kanonischen
  Namen und Flags. Es gibt keinen neuen Dialogzustand und keine Save-Migration.
- Validiert mit `git diff --check`, Welt-Test (46/46), Typecheck, 815 Unit-Tests
  inklusive Balance-Harness, Build und fokussiertem Desktop-Chromium-Smoke vom
  Schattenwolf zur dauerhaft gespeicherten Ranga-Benennung.

### Phase 197 - Hakurou-Hauptstory-Marker abgesichert

- Branch/Worktree: `phase-197-hakurou-marker` in
  `/worktree/tempest-phase-197-hakurou-marker`.
- Die Live-Diagnose bestaetigte, dass der bestehende datengetriebene
  `npcHasQuestMarker`-Pfad Hakurou bereits korrekt markiert, solange die sichtbare
  Kijin-Benennungsoption `story.kijin.named` setzen kann, und danach automatisch
  erlischt. Deshalb wurde kein redundanter Hakurou-Sonderfall eingefuehrt.
- Der exakte Uebergang `Marker an -> Kijin benennen -> Marker aus` ist nun im
  szenentreuen Durchspieltest festgehalten; ein fokussierter Desktop-Chromium-Smoke
  bestaetigt den sichtbaren Canvas- und Dialogpfad bis zur persistierten Benennung.
- Validiert mit `git diff --check`, Story-Test (22/22), Typecheck, 815 Unit-Tests
  inklusive Balance-Harness, Build und fokussiertem Desktop-Chromium-Smoke.

### Phase 198 - Overworld-Viereck durch runden NPC-Fallback ersetzt

- Branch/Worktree: `phase-198-overworld-artifact` in
  `/worktree/tempest-phase-198-overworld-artifact`.
- Die Desktop-/Mobile-Reproduktion identifizierte das beige Viereck bei etwa zwei
  Dritteln der Breite als generischen Rechteck-Fallback eines NPCs ohne Portraet;
  an der gemeldeten Stelle war dies `tempest-camp`, kein GPU- oder Skalierungsfehler.
- Der gemeinsame Fallback in `OverworldScene` zeichnet bei gleicher Groesse, Farbe,
  Kontur, Position und Interaktion nun einen Kreis. Portraet-NPCs bleiben unveraendert;
  es gibt keinen neuen Renderpfad und keine neue Abhaengigkeit.
- Der Pixel-Smoke scheitert gegen unveraendertes `main` am gefuellten Quadrateck und
  besteht mit dem Fix auf Desktop und Mobile. Zusaetzlich gruen: `git diff --check`,
  Typecheck, 815 Unit-Tests inklusive Balance-Harness und Build.

### Phase 199 - Echtes Mordrahn-Antagonistenportraet

- Branch/Worktree: `phase-199-mordrahn-portrait` in
  `/worktree/tempest-phase-199-mordrahn-portrait`.
- Asset: `sprites/portrait-mordrahn.webp`, 512x512, 88,2 KB; per
  Built-in-Imagegen aus dem vorhandenen Mordrahn-Kampfdesign und bestehenden
  Portrait-Stilreferenzen erzeugt und in `ASSETS.md` dokumentiert.
- Der bestehende `portrait-mordrahn`-Key laedt nun das repo-gebundene WebP statt
  des prozeduralen Laufzeit-Fallbacks; Sprecherzuordnung, Dialog-/Welt-Renderer und
  Fallbackkette bleiben unveraendert.
- Validiert mit `git diff --check`, Portrait-/Asset-Tests, Typecheck, 816 Unit-Tests
  inklusive Balance-Harness, Build sowie Desktop-/Mobile-Chromium-Smoke inklusive
  geladenem Mordrahn-Portrait.

### Phase 200 - Gemeinsames Werkstattportraet fuer Kurobe und Kaijin

- Branch/Worktree: `phase-200-smiths-portrait` in
  `/worktree/tempest-phase-200-smiths-portrait`.
- Asset: `sprites/portrait-kurobe-kaijin.webp`, 512x512, 66,1 KB; per
  Built-in-Imagegen aus den beiden vorhandenen Einzelportraets erzeugt und in
  `ASSETS.md` dokumentiert.
- Der erreichbare Sprecher `Kurobe & Kaijin` nutzt nun ueber die bestehende
  Portraitzuordnung, Preloadkette und Dialogdarstellung einen eigenen Duo-Key;
  Einzelportraets und Dialogdaten bleiben unveraendert.
- Validiert mit `git diff --check`, Portrait-/ArtSpec-/Asset-Tests, Typecheck,
  817 Unit-Tests inklusive Balance-Harness, Build sowie Desktop-/Mobile-Chromium-
  Smoke am echten Kurobe-Welt-NPC inklusive geladenem Duo-Portrait.

### Phase 201 - Eigene Kampfarena fuer Ramiris' Labyrinth

- Branch/Worktree: `phase-201-ramiris-arena` in
  `/worktree/tempest-phase-201-ramiris-arena`.
- Asset: `backgrounds/battle-ramiris-labyrinth.webp`, 1280x720, 305,4 KB; per
  Built-in-Imagegen aus vorhandenem Labyrinth-Banner, Bodentile, Magiekoloss und
  der bisherigen Geisterhoehlen-Kompositionsreferenz erzeugt und in `ASSETS.md`
  dokumentiert.
- Der bestehende Map- und Encounter-Arenapfad ordnet `ramiris-labyrinth` sowie
  `magic-colossus` nun dem eigenen Texture-Key statt der generischen Geisterhoehle
  zu; Kampfmechanik und Labyrinthsystem bleiben unveraendert.
- Validiert mit `git diff --check`, Arena-/Asset-Tests, Typecheck, 817 Unit-Tests
  inklusive Balance-Harness, Build sowie Desktop-/Mobile-Chromium-Smoke bis in den
  echten Magiekoloss-Kampf inklusive geladener Labyrinth-Arena.

### Phase 202 - Eigene Kampfarena fuer die Freiheitsakademie

- Branch/Worktree: `phase-202-academy-arena` in
  `/worktree/tempest-phase-202-academy-arena`.
- Asset: `backgrounds/battle-freedom-academy.webp`, 1280x720, 244,3 KB; per
  Built-in-Imagegen aus vorhandenem Akademie-Banner, Bodentile,
  Wiedergänger-Farbwelt und der Ramiris-Arena als Kompositionsreferenz erzeugt
  und in `ASSETS.md` dokumentiert.
- Der bestehende Map-Arenapfad ordnet `freedom-academy` nun dem eigenen
  Texture-Key statt dem generischen Tempest-Hain zu; die erreichbaren
  Geistflammen- und Wiedergänger-Kaempfe sowie ihre Kampfmechanik bleiben
  unveraendert.
- Validiert mit `git diff --check`, Arena-/Asset-Tests, Typecheck, 817 Unit-Tests
  inklusive Balance-Harness, Build sowie Desktop-/Mobile-Chromium-Smoke mit
  geladener Akademie-Arena.

### Phase 203 - Eigene Kampfarena fuer Blumund

- Branch/Worktree: `phase-203-blumund-arena` in
  `/worktree/tempest-phase-203-blumund-arena`.
- Asset: `backgrounds/battle-blumund.webp`, 1280x720, 279,6 KB; per
  Built-in-Imagegen aus vorhandenem Blumund-Banner, Bodentile, Banditen-Designs
  und der Freiheitsakademie-Arena als Kompositionsreferenz erzeugt und in
  `ASSETS.md` dokumentiert.
- Der bestehende Map-Arenapfad ordnet `blumund` nun dem eigenen Texture-Key
  statt dem generischen Tempest-Hain zu; die erreichbaren Strassenraub- und
  Hintergassen-Kaempfe sowie ihre Kampfmechanik bleiben unveraendert.
- Validiert mit `git diff --check`, Arena-/Asset-Tests, Typecheck, 817 Unit-Tests
  inklusive Balance-Harness, Build sowie Desktop-/Mobile-Chromium-Smoke mit
  geladener Blumund-Arena.

### Phase 204 - Drei bereits implementierte Plan-Bugs revalidiert

- Branch/Worktree: `phase-204-plan-reconciliation` in
  `/worktree/tempest-phase-204-plan-reconciliation`.
- Ein paralleler Commit hatte die in Phasen 196–198 bereits erledigten Punkte zu
  Gefaehrtennamen, Hakurous Hauptstory-Marker und dem rechteckigen NPC-Fallback
  erneut als offen in `PLAN.md` eingetragen. Aktueller Code und die bestehenden
  gezielten Tests bestaetigten alle drei Fixes; es war kein Produktcode noetig.
- Die doppelten offenen Eintraege wurden entfernt. Validiert mit `git diff --check`,
  68 fokussierten World-/Story-Tests, allen sechs fokussierten Desktop-/Mobile-
  Chromium-Smokes, Typecheck, 817 Unit-Tests inklusive Balance-Harness und Build.
- Der erste parallele Browserlauf brachte den Hakurou-Mobile-Smoke beim finalen
  Screenshot ins 30-Sekunden-Timeout; der isolierte Wiederholungslauf bestand in
  12,8 Sekunden. Das war Lastkonkurrenz, keine Codeaenderung.

### Phase 205 - Eigenes Portraet fuer die verwundete Grenzspaeherin

- Branch/Worktree: `phase-205-border-scout-portrait` in
  `/worktree/tempest-phase-205-border-scout-portrait`.
- Asset: `sprites/portrait-border-scout.webp`, 512x512, 61,9 KB; per
  Built-in-Imagegen aus vorhandenen Grenzpatrouillen-, Portrait- und
  Geistmoor-Referenzen erzeugt und in `ASSETS.md` dokumentiert.
- Die Sprecher `Grenzspäherin` und `Verwundete Grenzspäherin` nutzen nun ueber
  die bestehende Portraitzuordnung, Preloadkette und Texturfilterung dasselbe
  echte Portrait statt des generischen Welt-NPC-Kreises; Dialog- und
  Questlogik bleiben unveraendert.
- Validiert mit `git diff --check`, 26 fokussierten Portrait-/Asset-Tests,
  Typecheck, 818 Unit-Tests inklusive Balance-Harness, Build sowie
  Desktop-/Mobile-Chromium-Smoke am echten Sumpfgrenz-Deeskalationsdialog
  inklusive geladenem Portrait und ohne Browserfehler.

### Phase 113 - Milim-Kampf repariert und belohnt

- Branch/Worktree: `phase-113-milim-fight` in
  `/worktree/tempest-phase-113-milim-fight`; vor Abschluss auf den aktuellen
  `main`-Stand gebracht.
- Das optionale Tempest-Duell wird erst nach dem Honig-Buendnis
  (`story.milim.met`) freigeschaltet statt schon nach Ifrit. Milims unveraenderter
  Level-20-Kampf zahlt nun 1000 EP, 300 Gold, Magisteel und Vollheiltrank; Rimuru
  lernt beim ersten Sieg idempotent Drago Nova.
- Das vorhandene `ui/milim-fight-banner.webp` ist mit dokumentierter xAI-Imagine-
  Provenienz repo-gebunden und erscheint ausschliesslich im Milim-Siegspanel.
- Validiert mit `git diff --check`, 32 fokussierten Reward-/Asset-/Integritaets-
  Tests, Balance-Harness fuer Predator/Sage/Mimik, Typecheck, 830 Unit-Tests,
  Build sowie Desktop-/Mobile-Chromium-Smoke des echten Duells inklusive
  persistierter Belohnungen und ohne Browserfehler.

### Phase 209 - CI-Browser-Smoke stabilisiert

- Branch/Worktree: `phase-209-ci-smoke` in
  `/worktree/tempest-phase-209-ci-smoke`.
- Der fehlgeschlagene `main`-Workflow `29339950032` verlor unter paralleler
  Software-GL-Last Titelbildschirm-Klicks, weil das Canvas bereits existierte,
  Phaser aber noch Assets lud. `TitleScene` markiert das Canvas nun erst nach
  vollstaendig aufgebautem Titel als bereit; der gemeinsame Playwright-
  Klickhelfer wartet auf dieses Signal. Die asynchronen Milestone- und Slot-
  Storage-Effekte werden ereignisbasiert gepollt statt nach festen 400 ms
  abgelesen.
- Validiert mit einer reproduzierenden 12-fachen CI-Parallelrunde, danach 12/12
  fokussierten Regressionen ohne Retry, `git diff --check`, Typecheck, 830
  Unit-Tests, Build und dem exakten CI-Smoke mit 74/74 Desktop-/Mobile-Tests
  ohne Flake.

### Phase 210 - Eigenes Portrait fuer den geretteten Grenzgaenger

- Branch/Worktree: `phase-210-border-traveler-portrait` in
  `/worktree/tempest-phase-210-border-traveler-portrait`.
- Asset: `sprites/portrait-border-traveler.webp`, 512x512, 37,9 KB; per
  Built-in-Imagegen aus vorhandenen Portraitreferenzen erzeugt und in
  `ASSETS.md` dokumentiert.
- Der sichtbare Sprecher `Geretteter Grenzgänger` nutzt nun ueber die bestehende
  Sprecherzuordnung, Preloadkette und lineare Texturfilterung ein eigenes
  Portrait; Dialog- und Questlogik bleiben unveraendert.
- Validiert mit `git diff --check`, 19 fokussierten Portrait-/Asset-Tests,
  Typecheck, 831 Unit-Tests inklusive Balance-Harness, Build sowie
  Desktop-/Mobile-Chromium-Smoke mit geladenem Portrait und ohne Browserfehler.

### Phase 211 - Akademieschueler nutzen ihr Gruppenportrait in der Welt

- Branch/Worktree: `phase-211-academy-student-portraits` in
  `/worktree/tempest-phase-211-academy-student-portraits`.
- Das bereits geladene `portrait-shizu-children.webp` zeigt alle fuenf Schueler
  und wird nun auch fuer die sichtbaren Welt-NPCs Kenya, Chloe, Alice, Ryota und
  Gale verwendet statt der generischen Farbkreise. Dialog- und Storylogik
  bleiben unveraendert; kein neues Asset war noetig.
- Validiert mit `git diff --check`, 11 fokussierten Portrait-Tests, Typecheck,
  832 Unit-Tests inklusive Balance-Harness, Build sowie Desktop-/Mobile-
  Chromium-Smoke am echten Freiheitsakademie-Ort ohne Browserfehler.

### Phase 212 - Rigurd-Portrait fuer die Ratsversammlung

- Branch/Worktree: `phase-212-council-rigurd-portrait` in
  `/worktree/tempest-phase-212-council-rigurd-portrait`.
- Der temporaere Welt-NPC `Ratsversammlung` nutzt nun Rigurds bereits geladenes
  Portrait statt eines generischen Farbkreises, passend zum ausschliesslichen
  Dialogsprecher Rigurd. Abstrakte Ortsdienste behalten den neutralen Fallback;
  Dialog-, Wahl- und Storylogik bleiben unveraendert.
- Validiert mit `git diff --check`, 12 fokussierten Portrait-Tests, Typecheck,
  833 Unit-Tests inklusive Balance-Harness, Build sowie Desktop-/Mobile-
  Chromium-Smoke am echten Ratsdialog ohne Browserfehler.

### Phase 213 - Tempest-Lager bekommt ein eigenes Versorgungs-Portrait

- Branch/Worktree: `phase-213-tempest-camp-portrait` in
  `/worktree/tempest-phase-213-tempest-camp-portrait`.
- Asset: `sprites/portrait-tempest-camp.webp`, 512x512, 68 KB; per
  Built-in-Imagegen aus dem vorhandenen Rigurd-Portrait und Tempest-Camp-Banner
  erzeugt und in `ASSETS.md` dokumentiert.
- Der zuvor einzige unbebilderte Dialogsprecher `Tempest-Lager` nutzt nun eine
  Rastplatz-Vignette ueber die vorhandene Sprecher-/Portrait-/Preload-Kette;
  Dialog-, Rast- und Storylogik bleiben unveraendert.
- Validiert mit `git diff --check`, Typecheck, 834 Unit-Tests inklusive
  Balance-Harness, Build sowie Desktop-/Mobile-Chromium-Smoke am echten
  Tempest-Lager ohne Browserfehler.

### Phase 214 - Tempests Wachstum bleibt im Kampf sichtbar

- Branch/Worktree: `phase-214-tempest-battle-growth` in
  `/worktree/tempest-phase-214-tempest-battle-growth`.
- Assets: `backgrounds/battle-tempest-{camp,village,city}.webp`, jeweils
  1280x720; per Built-in-Imagegen aus den vorhandenen Tempest-Bannern,
  Wachstumstiles und Kampfkompositionen erzeugt und in `ASSETS.md`
  dokumentiert.
- Regulaere Encounter auf `tempest-start` waehlen ueber den bestehenden
  `resolveTempestGrowthStage`-Stand die passende Lager-, Dorf- oder Stadtarena;
  spezielle Story-Arenen behalten Vorrang.
- Validiert mit `git diff --check`, Typecheck, 835 Unit-Tests inklusive
  Balance-Harness, Build sowie sechs fokussierten Desktop-/Mobile-Chromium-
  Smokes in echten Trainingskaempfen.

### Phase 215 - Gegner-Cutouts im Bestiarium

- Branch/Worktree: `phase-215-bestiary-cutouts` in
  `/worktree/tempest-phase-215-bestiary-cutouts`.
- Die vorhandenen, vorgeladenen Gegnertexturen aus `enemyArtFor` erscheinen nun
  auch in der vierteiligen Bestiarium-Ansicht. Analysierte Gegner werden farbig
  gezeigt, nur besiegte und noch nicht analysierte Arten als abgedunkelte
  Silhouette; Daten-, Kampf- und Balancelogik bleiben unveraendert.
- Validiert mit `git diff --check`, Typecheck, 836 Unit-Tests inklusive
  Balance-Harness, Build sowie fokussiertem Desktop-/Mobile-Chromium-Smoke mit
  gefuelltem Bestiarium und ohne Browserfehler.

### Phase 216 - Herkunfts-Cutouts im Bewohner-Roster

- Branch/Worktree: `phase-216-resident-cutouts` in
  `/worktree/tempest-phase-216-resident-cutouts`.
- Die bereits vorgeladenen Gegnertexturen der jeweiligen `originEnemyId`
  erscheinen nun auch im Bewohner-Roster. Benannte Bewohner werden farbig
  gezeigt, noch unbekannte Plaetze als abgedunkelte Herkunfts-Silhouette;
  Daten-, Kampf- und Balancelogik bleiben unveraendert.
- Validiert mit `git diff --check`, Typecheck, 837 Unit-Tests inklusive
  Balance-Harness, Build sowie fokussiertem Desktop-/Mobile-Chromium-Smoke mit
  gefuelltem Bewohner-Roster und ohne Browserfehler.

### Phase 217 - Wachstumsbanner in der Einrichtungen-Ansicht

- Branch/Worktree: `phase-217-facility-growth-banner` in
  `/worktree/tempest-phase-217-facility-growth-banner`.
- Die Einrichtungen-Ansicht verwendet nun ueber den bestehenden
  `regionBannerTextureForMap`-Pfad das zum Tempest-Wachstumsstand passende,
  bereits vorgeladene Gebietsbild. Daten- und Balancelogik bleiben unveraendert.
- Validiert mit `git diff --check`, Typecheck, 838 Unit-Tests inklusive
  Balance-Harness, Build sowie fokussiertem Desktop-/Mobile-Chromium-Smoke.

### Phase 218 - Gebiets-Banner in den Diplomatiekarten

- Branch/Worktree: `phase-218-diplomacy-banners` in
  `/worktree/tempest-phase-218-diplomacy-banners`.
- Dwargon, Blumund, Orks und Echsenmenschen verwenden nun ihre vorhandenen
  Gebiets-Banner in den Diplomatiekarten; Daten und Balance bleiben unveraendert.
- Validiert mit `git diff --check`, Typecheck, 839 Unit-Tests inklusive
  Balance-Harness, Build sowie Desktop-/Mobile-Chromium-Smoke.

### Phase 219 - Gegner-Cutouts auf dem Kopfgeldbrett

- Branch/Worktree: `phase-219-bounty-cutouts` in
  `/worktree/tempest-phase-219-bounty-cutouts`.
- Jede sichtbare Kopfgeldkarte verwendet nun ueber ihre vorhandene
  `targetEnemyId` und `enemyArtFor` das bereits vorgeladene Ziel-Cutout.
- Validiert mit `git diff --check`, Typecheck, 840 Unit-Tests inklusive
  Balance-Harness, Build sowie Desktop-/Mobile-Chromium-Smoke.

### Phase 220 - Gegner-Cutouts im Verschlingen-Kompendium

- Branch/Worktree: `phase-220-devour-cutouts` in
  `/worktree/tempest-phase-220-devour-cutouts`.
- Das Kompendium verwendet nun `enemyId`, `enemyName` und `enemyArtFor` fuer die
  vorhandenen Cutouts; noch nicht erbeutete Quellen erscheinen als Silhouette.
- Validiert mit `git diff --check`, Typecheck, 841 Unit-Tests inklusive
  Balance-Harness, Build sowie Desktop-/Mobile-Chromium-Smoke.

### Phase 221 - Gebiets-Banner in der Ranga-Reiseliste

- Branch/Worktree: `phase-221-ranga-banners` in
  `/worktree/tempest-phase-221-ranga-banners`.
- Rangas Reiseziele verwenden nun ihre vorhandene `mapId` mit
  `regionBannerTextureForMap`; unbekannte und gesperrte Ziele bleiben abgedunkelt.
- Validiert mit `git diff --check`, Typecheck, 842 Unit-Tests inklusive
  Balance-Harness, Build sowie Desktop-/Mobile-Chromium-Smoke.

### Phase 222 - Portraits in der Charakter-Seitenleiste

- Branch/Worktree: `phase-222-member-list-portraits` in
  `/worktree/tempest-phase-222-member-list-portraits`.
- Die Charakterwahl in Inventar, Ausruestung, Status und Talenten zeigt nun ueber
  die vorhandene `characterId` und das bestehende Mapping die Gruppenportraits.
- Validiert mit `git diff --check`, Typecheck, 843 Unit-Tests inklusive
  Balance-Harness, Build sowie Desktop-/Mobile-Chromium-Smoke.

### Phase 223 - Neutrale Haendler-Vignette im Shopkopf

- Branch/Worktree: `phase-223-shop-vignette` in
  `/worktree/tempest-phase-223-shop-vignette`.
- Asset: `ui/shop-merchant-vignette.webp`, 512x256, 21 KB; per OpenAI Built-in
  Imagegen erzeugt, als WebP optimiert und in `ASSETS.md` dokumentiert.
- Alle vorhandenen Shoptypen zeigen das neutrale Stillleben aus Tasche, Trank,
  Kraeutern, Gold und Magieerz; Shopdaten und Balance bleiben unveraendert.
- Validiert mit `git diff --check`, Typecheck, 844 Unit-Tests inklusive
  Balance-Harness, Build sowie Desktop-/Mobile-Chromium-Smoke.

### Phase 224 - Haendler-Vignette im Inventarkopf

- Branch/Worktree: `phase-224-inventory-vignette` in
  `/worktree/tempest-phase-224-inventory-vignette`.
- Das vorhandene 21-KB-Shopasset visualisiert nun auch den Inventarkopf; kein
  zweites Asset, kein Item-Icon-System und keine Daten- oder Balance-Aenderung.
- Validiert mit `git diff --check`, Typecheck, 844 Unit-Tests inklusive
  Balance-Harness, Build sowie Desktop-/Mobile-Chromium-Smoke.

### Phase 225 - Key-Art-Karten in der Ende-Galerie

- Branch/Worktree: `phase-225-ending-gallery-art` in
  `/worktree/tempest-phase-225-ending-gallery-art`.
- Die drei vorhandenen Ende-Hintergruende erscheinen nun als Galerie-Karten;
  ungesehene Enden bleiben abgedunkelt und behalten ihren `???`-Titel.
- Validiert mit `git diff --check`, Typecheck, 845 Unit-Tests inklusive
  Balance-Harness, Build sowie Desktop-/Mobile-Chromium-Smoke ueber den echten
  EndingScene-Start.

### Phase 226 - Gruppenleiter-Portrait in Speicherkarten

- Branch/Worktree: `phase-226-save-slot-portraits` in
  `/worktree/tempest-phase-226-save-slot-portraits`.
- Belegte Speicherslots zeigen nun ueber die vorhandene `characterId` das
  Portrait des ersten aktiven Gruppenmitglieds; leere Slots und fehlende
  Texturen behalten ihren bisherigen Text-Fallback.
- Validiert mit `git diff --check`, Typecheck, 846 Unit-Tests inklusive
  Balance-Harness, Build sowie Desktop-/Mobile-Chromium-Smoke.

### Phase 227 - Veralteten Fallbackmarker-Smoke entfernen

- Branch/Worktree: `phase-227-fallback-smoke` in
  `/worktree/tempest-phase-227-fallback-smoke`.
- Der entfernte Pixeltest erwartete beim NPC `Tempest-Lager` noch einen runden
  Fallback, obwohl dieser bereits die dedizierte Rastplatz-Vignette verwendet;
  der bestehende Vignetten-Smoke deckt das aktuelle Sollverhalten ab.
- Validiert mit `git diff --check`, Typecheck, 846 Unit-Tests inklusive
  Balance-Harness, Build sowie 3 fokussierten Desktop-Chromium-Smokes.

### Phase 228 - Eigene Portraits fuer die fuenf Akademieschueler

- Branch/Worktree: `phase-228-academy-student-portraits` in
  `/worktree/tempest-phase-228-academy-student-portraits`.
- Assets: `sprites/portrait-{kenya,chloe,alice,ryota,gale}.webp`, jeweils
  512x512; projektinterne Ausschnitte aus dem vorhandenen, projektgenerierten
  Gruppenportrait `portrait-shizu-children.webp`, in `ASSETS.md` dokumentiert.
- Kenya, Chloe, Alice, Ryota und Gale verwenden nun auf der Weltkarte und im
  Dialog ihr eigenes Portrait statt fuenfmal dasselbe Gruppenmotiv; der
  Gruppen-Key bleibt fuer echte Gruppensprecher erhalten. Story und Balance
  bleiben unveraendert.
- Validiert mit `git diff --check`, Typecheck, 846 Unit-Tests inklusive
  Balance-Harness, Build sowie fokussiertem Desktop-/Mobile-Chromium-Smoke am
  echten Freiheitsakademie-Save ohne Browserfehler.

### Phase 229 - Haendler-Vignette auf der Weltkarte

- Branch/Worktree: `phase-229-overworld-shop-art` in
  `/worktree/tempest-phase-229-overworld-shop-art`.
- Der gemeinsame Overworld-Shopmarker verwendet nun einen quadratischen
  Ausschnitt der bereits vorgeladenen `ui/shop-merchant-vignette.webp` im
  bestehenden UI-Rahmen statt des generischen gruenen Quadrats. Fehlt die
  Textur, bleibt der alte Marker als Fallback erhalten.
- Kein neues Asset, keine neuen Daten und keine Balance-Aenderung; dieselbe
  Haendler-Identitaet verbindet Weltkarte, Shopkopf und Inventar.
- Validiert mit `git diff --check`, Typecheck, 846 Unit-Tests inklusive
  Balance-Harness, Build sowie fokussiertem Desktop-/Mobile-Chromium-Smoke an
  einem echten Tempest-Shop ohne Browserfehler.

### Phase 230 - Titel-Key-Art hinter der Speicherverwaltung

- Branch/Worktree: `phase-230-save-slot-keyart` in
  `/worktree/tempest-phase-230-save-slot-keyart`.
- Die Speicherverwaltung verwendet nun das bereits vorgeladene
  `backgrounds/title-keyart.webp` hinter einem staerkeren Lesbarkeits-Overlay;
  Slotkarten, Portraits und Interaktionen bleiben unveraendert.
- Kein neues Asset, keine neue Renderabstraktion und keine Speicherlogik-
  Aenderung; die Einstiegsszenen erhalten eine gemeinsame visuelle Identitaet.
- Validiert mit `git diff --check`, Typecheck, 847 Unit-Tests inklusive
  Balance-Harness, Build sowie fokussiertem Desktop-/Mobile-Chromium-Smoke der
  echten Speicherverwaltung ohne Browserfehler.

### Phase 231 - Titel-Key-Art hinter den Optionen

- Branch/Worktree: `phase-231-options-keyart` in
  `/worktree/tempest-phase-231-options-keyart`.
- Die eigenstaendige Optionenszene verwendet nun das bereits vorgeladene
  `backgrounds/title-keyart.webp` hinter einem starken Lesbarkeits-Overlay;
  Layout, Einstellungen und Accessibility-Bedienung bleiben unveraendert.
- Kein neues Asset und keine neue Renderabstraktion. Der neue Browser-Smoke
  deckt erstmals den echten Optionen-Pfad ab und prueft eine persistierte
  Lautstaerkeaenderung statt nur Canvas-Sichtbarkeit.
- Validiert mit `git diff --check`, Typecheck, 848 Unit-Tests inklusive
  Balance-Harness, Build sowie Desktop-/Mobile-Chromium-Smoke ohne
  Browserfehler.

### Phase 232 - Regionsmotiv fuer Fundstellen

- Branch/Worktree: `phase-232-discovery-region-art` in
  `/worktree/tempest-phase-232-discovery-region-art`.
- Die erreichbare `DiscoveryScene` verwendet ihre bereits vorhandene `mapId`
  mit der zentralen `regionBannerTextureForMap`-Zuordnung. Fundstellen zeigen
  dadurch das Motiv ihrer Region; fuer Tempest wird auch die aktuelle
  Wachstumsstufe beruecksichtigt, fehlende Texturen behalten den bisherigen
  textbasierten Fallback.
- Kein neues Asset, keine neue Abstraktion und keine Gameplay-Aenderung; die
  bereits vollstaendig geladenen Regionsmotive erhalten einen weiteren
  passenden sichtbaren Einsatz.
- Validiert mit `git diff --check`, Typecheck, 849 Unit-Tests inklusive
  Balance-Harness, Build sowie Desktop-/Mobile-Chromium-Smoke, der die echte
  Moor-Fundstelle betritt, rendert und ihre Belohnung nimmt.

### Phase 233 - Regionsmotive ohne Verzerrung

- Branch/Worktree: `phase-233-banner-aspect-ratio` in
  `/worktree/tempest-phase-233-banner-aspect-ratio`.
- Der gemeinsame `addRegionBannerImage`-Renderer verwendet einen mittigen
  Cover-Ausschnitt statt `setDisplaySize`-Streckung. Damit behalten sowohl die
  4:1-Banner als auch die 2:1-/2,5:1-Quellen ihr Seitenverhaeltnis in Minimap,
  Fundstellen, Einrichtungen, Diplomatie und Rangas Reiseliste.
- Bestehende Motive und Layoutgroessen bleiben unveraendert; es wurden weder
  neue Assets noch eine Abhaengigkeit hinzugefuegt.
- Validiert mit `git diff --check`, Typecheck, 850 Unit-Tests inklusive
  Balance-Harness, Build sowie Desktop-/Mobile-Chromium-Smoke an der echten
  Akademie-Fundstelle mit ihrem 2:1-Quellmotiv.

### Phase 234 - Kaijin-Portrait in der Schmiede

- Branch/Worktree: `phase-234-forge-portrait` in
  `/worktree/tempest-phase-234-forge-portrait`.
- Die erreichbare Rezept- und Werkbankansicht zeigt nun Kaijins bereits
  geladenes, kanonisches Portrait ueber den vorhandenen `drawPortrait`-Helfer.
- Kein neues Asset und kein neuer Renderer; die bewusst aus dem Kampfroster
  entfernten Kaijin-/Kurobe-Kampf-Cutouts bleiben weiterhin ungeladen.
- Validiert mit `git diff --check`, Typecheck, 851 Unit-Tests inklusive
  Balance-Harness, Build sowie Desktop-/Mobile-Chromium-Smoke, der die echte
  Dwargon-Schmiede oeffnet und Magisteel herstellt.

### Phase 235 - Party-Art fuer Beitritts-Meilensteine

- Branch/Worktree: `phase-235-join-milestone-art` in
  `/worktree/tempest-phase-235-join-milestone-art`.
- Die eindeutigen Gruppenbeitritte `gobta-joins` und `ranga-joins` zeigen nun
  den jeweils bereits geladenen Party-Cutout. Allgemeine Kapitel- und
  Boss-Meilensteine bleiben bewusst unveraendert.
- Kein neues Asset, keine neue Datenstruktur und keine Gameplay-Aenderung.
- Validiert mit `git diff --check`, Typecheck, 852 Unit-Tests inklusive
  Balance-Harness, Build sowie Desktop-/Mobile-Chromium-Smoke des echten
  Gobta-Beitritts-Meilensteins.

### Phase 236 - Waehlbares Kampftempo

- Branch/Worktree: `phase-236-kampftempo` in
  `/worktree/tempest-phase-236-kampftempo`.
- Die persistente Option `Kampftempo: Normal/Schnell` lebt im vorhandenen
  Settings-System. Schnell reduziert nur die Zugpausen von 260 auf 91 ms und
  von 320 auf 112 ms; Animationen, Entscheidungen und Kampfwerte bleiben gleich.
- Alte und teilweise gespeicherte Optionen migrieren auf Normal. Das erweiterte
  Optionslayout bleibt auf Desktop und Mobil bedienbar.
- Validiert mit `git diff --check`, Typecheck, 852 Unit-Tests inklusive
  Balance-Harness, Build sowie Desktop-/Mobile-Chromium-Smoke fuer Optionslayout
  und echten Battle-Pfad (4/4).

### Phase 237 - PLAN-Hygiene

- Branch/Worktree: `phase-237-plan-hygiene` in
  `/worktree/tempest-phase-237-plan-hygiene`.
- `PLAN.md` enthaelt auf `main` nur noch offene/laufende Arbeit, Statusregeln,
  Integrationswarteschlange und das verbindliche Worktree-Schema. 44 erledigte
  Phasenkarten wurden entfernt; ihre Historie bleibt hier und in Git erhalten.
- Die Datei schrumpfte von 1324 auf 23 Zeilen und entspricht damit wieder ihrer
  eigenen Offenheitsregel sowie `AGENTS.md`.
- Validiert mit `git diff --check`, Typecheck, 852 Unit-Tests inklusive
  Balance-Harness und Build. Renderingneutral, daher kein Browser-Smoke.

### Phase 238 - Mobile Options-Touchziele

- Branch/Worktree: `phase-238-options-touch-targets` in
  `/worktree/tempest-phase-238-options-touch-targets`.
- Alle Pfeil-/Toggle-Ziele im Optionsbildschirm sind nun 44 x 44 px. Das
  44-px-Zeilenraster hält sie getrennt und innerhalb des 960 x 540 Layouts.
- Der lokale 40-px-Zurueck-Button entfiel; `addUiTextButton` liefert das bereits
  projektweit verwendete 44-px-Ziel und reduziert dabei Duplikation.
- Validiert mit `git diff --check`, Typecheck, 852 Unit-Tests inklusive
  Balance-Harness, Build und Desktop-/Mobile-Chromium-Randklick-Smoke (2/2).

### Phase 239 - Mobile Speicherstand-Touchziele

- Branch/Worktree: `phase-239-save-touch-targets` in
  `/worktree/tempest-phase-239-save-touch-targets`.
- Der gemeinsame lokale Button-Pfad der Speicherverwaltung ist nun 44 px hoch;
  damit erfüllen Fortsetzen, Löschen, Neues Spiel und Zurück die Touch-Invariante.
- Die bestehende zentrierte Layer-/Farbvarianten-Logik blieb unverändert; die
  Korrektur ist eine einzelne Höhenänderung statt eines neuen Renderpfads.
- Validiert mit `git diff --check`, Typecheck, 852 Unit-Tests inklusive
  Balance-Harness, Build und Desktop-/Mobile-Chromium-Randklick-Smoke (2/2).

### Phase 240 - UI-Browser-Audit

- Branch/Worktree: `phase-240-ui-browser-audit` in
  `/worktree/tempest-phase-240-ui-browser-audit`.
- Kleine Hochkant-Handys zeigen nun einen lesbaren Querformat-Hinweis, statt
  das feste 960-x-540-Spiel auf unbedienbare 390 x 219 CSS-Pixel zu verkleinern.
  Die regulaeren Mobile- und HiDPI-Smokes laufen deshalb im Querformat.
- Die Geometriemaske des Talentbaums wird innerhalb der Menue-Scene
  wiederverwendet, beim Tabwechsel explizit geloest und erst beim Shutdown
  zerstoert. Dadurch beschneidet sie den spaeteren Ranga-Tab nicht mehr und
  hinterlaesst auch keinen schwarzen WebGL-Frame.
- Validiert mit `git diff --check`, Typecheck, 852 Unit-Tests inklusive
  Balance-Harness, Build, visuellem Desktop-/Mobile-Clickthrough sowie
  Kernfluss-, Hochkant-, Masken- und HiDPI-Chromium-Smokes (10/10).

### Phase 241 - UI-Kartenlayout

- Branch/Worktree: `phase-241-ui-card-layout` in
  `/worktree/tempest-phase-241-ui-card-layout`.
- Die sechs Shop-Zeilen nutzen den vorhandenen Panelraum ohne Ueberlauf; die
  letzte Kaufen-/Verkaufen-Zeile bleibt auf Desktop und Mobil innerhalb des
  Vorratsfensters.
- Front-/Hinten-Schalter sitzen innerhalb ihrer Party-Karten. Das
  Bewohner-Roster zeigt drei Eintraege pro Seite, sodass Erntefest- und
  Offiziersaktionen weder Codex-Leiste noch Nachbarkarten ueberdecken.
- Validiert mit `git diff --check`, Typecheck, 852 Unit-Tests inklusive
  Balance-Harness, Build, erneutem 46-Zustaende-Clickthrough ohne Browserfehler
  sowie Desktop-/Mobile-Smokes fuer Party, Shop und Bewohner (6/6).

### Phase 242 - Ausruestungskarten-Layout

- Branch/Worktree: `phase-242-equipment-layout` in
  `/worktree/tempest-phase-242-equipment-layout`.
- Die vier Ausruestungsslots verwenden eine gemeinsame, getestete Geometrie.
  Slot, Seltenheit und Affixe stehen kompakt in der Kopfzeile; Itemname und
  44-px-Aktionen bleiben getrennt innerhalb der 82-px-Karte.
- Die zuvor auf der Kartenunterkante und in Folgezeilen liegenden Ablegen-/
  Verzaubern-Flaechen sind auf Desktop und im mobilen Querformat vollstaendig
  innerhalb ihres Panels und weiterhin bedienbar.
- Vor der Auswahl wurde der sichtbare Assetbestand geprueft. Die verbleibenden
  prozeduralen Sora-/Vael-/Lyrre-Portraits gehoeren laut Kanonregel nur zum
  optionalen Legacy-Pfad; deshalb wurde kein neues Asset fuer den Hauptpfad
  erzeugt.
- Validiert mit `git diff --check`, Typecheck, 853 Unit-Tests inklusive
  Balance-Harness, Build, visueller Mobile-Abnahme und fokussiertem Desktop-/
  Mobile-Chromium-Smoke fuer das echte Ablegen samt Save-Persistenz (2/2).

### Phase 243 - Diplomatie-Kartenlayout

- Branch/Worktree: `phase-243-diplomacy-layout` in
  `/worktree/tempest-phase-243-diplomacy-layout`.
- Der Politik-Codex zeigt zwei statt vier Fraktionskarten pro Seite und nutzt
  dafuer den vorhandenen Codex-Pager. Alle vier Fraktionen bleiben erreichbar.
- Die 124-px-Karten bieten auch im Maximalzustand Platz fuer Titel, drei
  Schwellen, drei aktive Boni und den umbrechenden Folgetext, ohne goldene
  Kartentrenner oder die naechste Fraktion zu ueberdecken.
- Gefunden und belegt durch einen erneuten 46-Zustaende-Clickthrough ohne
  Browserfehler; visuell auf Desktop und Mobile mit 100 Ruf und allen Boni
  abgenommen.
- Validiert mit `git diff --check`, Typecheck, 853 Unit-Tests inklusive
  Balance-Harness, Build und fokussiertem Desktop-/Mobile-Chromium-Smoke samt
  Vor-/Zurueck-Pager (2/2).

### Phase 244 - Talentbaum-Grenzen

- Branch/Worktree: `phase-244-talent-tree-bounds` in
  `/worktree/tempest-phase-244-talent-tree-bounds`.
- `DEFAULT_SPEC_LAYOUT` ist nun die gemeinsame Geometriequelle fuer Runtime
  und Headless-Test; die abweichende Inline-Kopie in `MenuScene` entfiel.
- Ein Startwert von y=242 und 57 px Zeilenabstand halten auch Rimurus fuenften
  Verschlinger-Knoten vollstaendig innerhalb der vorhandenen Maskenunterkante
  bei y=520, ohne die 50-px-Karten zu verkleinern.
- Validiert mit `git diff --check`, Typecheck, 853 Unit-Tests inklusive
  Balance-Harness, Build, visuellem Desktop-/Mobile-Clickthrough ohne
  Browserfehler und Talentbaum-/Ranga-Chromium-Smoke (2/2).

### Phase 245 - Handbuch-Kartenlayout

- Branch/Worktree: `phase-245-handbook-layout` in
  `/worktree/tempest-phase-245-handbook-layout`.
- Das Mechanik-Handbuch zeigt drei 90-px-Karten pro Seite statt vier
  62-px-Karten. Alle 18 Eintraege bleiben ueber den vorhandenen Codex-Pager
  erreichbar.
- Lange dreizeilige Texte wie `Elemente & Resistenz-Leiter` bleiben nun auf
  Desktop und im mobilen Querformat vollstaendig innerhalb der goldenen
  Kartenkante, ohne die Schrift zu verkleinern.
- Validiert mit `git diff --check`, Typecheck, 853 Unit-Tests inklusive
  Balance-Harness, Build, visueller Desktop-/Mobile-Worst-Case-Abnahme und
  erweitertem Handbuch-Pager-Chromium-Smoke.

### Phase 246 - Einrichtungen-Kartenlayout

- Branch/Worktree: `phase-246-facility-card-layout` in
  `/worktree/tempest-phase-246-facility-card-layout`.
- Die vier Einrichtungskarten, der Forschungsblock und die Rast-Aktion nutzen
  eine gemeinsame, getestete Geometrie statt verteilter Positionswerte.
- Die etwas hoeheren Karten halten auch umbrechende Beschreibungen innerhalb
  ihrer Panels; Forschung und Aktion bleiben getrennt im 960-x-540-Canvas.
- Das vorhandene Tempest-Wachstumsbanner blieb unveraendert; ein neues Asset
  haette fuer diesen Layoutfehler keinen sichtbaren Mehrwert geliefert.
- Validiert mit `git diff --check`, Typecheck, 854 Unit-Tests inklusive
  Balance-Harness, Build und fokussiertem Einrichtungen-Chromium-Smoke (1/1).

### Phase 247 - Regionsassets im Questlog

- Branch/Worktree: `phase-247-quest-region-art` in
  `/worktree/tempest-phase-247-quest-region-art`.
- Questschritte tragen neben der Orts-ID nun auch die zugehoerige Karten-ID in
  die bestehende Questansicht. Aktive Quests verwenden den aktuellen,
  abgeschlossene Quests ihren letzten verorteten Schritt.
- Das Questlog zeigt links in jeder verorteten Karte das bereits vorhandene
  Regionsbanner. Text-Quests ohne Kartenanker behalten das bisherige Layout.
- Es wurden keine neuen Bilddateien erzeugt: Der vollstaendige, bereits in
  `ASSETS.md` dokumentierte Regionsbestand deckt alle Overworld-Karten ab.
- Validiert mit `git diff --check`, fokussierten Daten-/Asset-Tests (56/56),
  Typecheck, 855 Unit-Tests inklusive Balance-Harness, Build und fokussiertem
  Questlog-Chromium-Smoke (1/1).

### Phase 248 - Regionsasset in Questdetails

- Branch/Worktree: `phase-248-quest-detail-art` in
  `/worktree/tempest-phase-248-quest-detail-art`.
- Die Quest-Detailansicht zeigt nun dasselbe vorhandene Regionsbanner wie die
  zugehoerige Listenkarte: bei aktiven Quests fuer den aktuellen, im Archiv
  fuer den letzten verorteten Schritt.
- Der Beschreibungstext nutzt bei sichtbarem Banner die verbleibende Breite;
  Quests ohne Kartenanker behalten unveraendert die volle Textbreite.
- Es wurden keine neuen Bilddateien erzeugt; die bereits dokumentierten
  Regionsassets decken den Zielort ab.
- Validiert mit `git diff --check`, Asset-Test (10/10), Typecheck, 855
  Unit-Tests inklusive Balance-Harness, Build und fokussiertem
  Liste-zu-Details-Chromium-Smoke (1/1).

### Phase 249 - Codex-Archivvignette

- Branch/Worktree: `phase-249-codex-vignette` in
  `/worktree/tempest-phase-249-codex-vignette`.
- Der bisher rein textbasierte Wissens-Codex zeigt links im freien Kopfbereich
  ein projektgeneriertes, textfreies Archivstillleben aus Chronikband, Feder,
  Slime-Praegung und cyanfarbenen Magicule-Kristallen.
- Das WebP liegt projektgebunden unter
  `src/assets/ui/codex-archive-vignette.webp`; Generierung und Provenienz sind
  in `ASSETS.md` dokumentiert.
- Validiert mit `git diff --check`, Asset-Test (17/17), Typecheck, 856
  Unit-Tests inklusive Balance-Harness, Build und fokussiertem
  Codex-Wissen-Chromium-Smoke (1/1).

### Phase 250 - Archivvignette im Mechanik-Handbuch

- Branch/Worktree: `phase-250-handbook-vignette` in
  `/worktree/tempest-phase-250-handbook-vignette`.
- Wissen und Mechanik-Handbuch zeichnen das vorhandene Codex-Archivmotiv nun
  zentral im freien linken Kopfbereich; andere Codex-Modi bleiben unveraendert.
- Es entstand keine neue Bilddatei: Das in Phase 249 erzeugte und bereits in
  `ASSETS.md` dokumentierte WebP deckt beide Archivansichten ab.
- Validiert mit `git diff --check`, Asset-/Handbuch-Tests (21/21), Typecheck,
  856 Unit-Tests inklusive Balance-Harness, Build und fokussiertem
  Handbuch-Chromium-Smoke (1/1); Screenshot visuell geprueft.

### Phase 251 - Boss-Art in Meilensteinen

- Branch/Worktree: `phase-251-boss-milestone-art` in
  `/worktree/tempest-phase-251-boss-milestone-art`.
- Die Sieg-Meilensteine fuer Direwolf-Anfuehrer und namenloses Echo zeigen nun
  deren bereits vorhandene Gegner-Cutouts; Beitritts-Meilensteine behalten
  unveraendert ihre Gobta-/Ranga-Art.
- Es entstanden keine neuen Bilddateien oder Asset-Mappings: Die kanonischen
  Texturschluessel aus `enemyArt.ts` werden direkt wiederverwendet.
- Validiert mit `git diff --check`, Asset-/Meilenstein-Tests (21/21),
  Typecheck, 857 Unit-Tests inklusive Balance-Harness, Build und fokussiertem
  Direwolf-Meilenstein-Chromium-Smoke (1/1).

### Phase 252 - Schmied-Cutouts im Forge-Menue

- Branch/Worktree: `phase-252-forge-smith-art` in
  `/worktree/tempest-phase-252-forge-smith-art`.
- Das Forge-Menue zeigt Kurobe und Kaijin nun mit ihren bereits vorhandenen,
  bislang nicht geladenen transparenten Cutouts im freien Kopfbereich.
- Die Cutouts bleiben reine Schmiede-NPC-Art und erweitern bewusst nicht die
  spielbare `PARTY_BATTLE_ART`-Zuordnung.
- Validiert mit `git diff --check`, Asset-Test (18/18), Typecheck, 857
  Unit-Tests inklusive Balance-Harness, Build und fokussierten
  Forge-/Asset-Chromium-Smokes (2/2).

### Phase 253 - Regionsart in Kapitel-Meilensteinen

- Branch/Worktree: `phase-253-chapter-milestone-art` in
  `/worktree/tempest-phase-253-chapter-milestone-art`.
- Band 1 und der erste Rat zeigen das vorhandene Tempest-Dorfbanner; der
  Band-2-Abschluss zeigt das vorhandene Stadtbanner im freien Bildbereich.
- Die gemeinsame Crop-Hilfe aus `regionBannerArt.ts` wird wiederverwendet;
  es entstanden keine neuen Bilddateien oder Asset-Mappings.
- Validiert mit `git diff --check`, Asset-/Meilenstein-Tests (22/22),
  Typecheck, 858 Unit-Tests inklusive Balance-Harness, Build und fokussiertem
  Band-1-Meilenstein-Chromium-Smoke (1/1).

### Phase 254 - Redundante Gegner-Texturaliase entfernt

- Branch/Worktree: `phase-254-legacy-enemy-aliases` in
  `/worktree/tempest-phase-254-legacy-enemy-aliases`.
- Vier Legacy-Keys luden vorhandene Gegner-WebPs ein zweites Mal in Phaser;
  sie entfielen aus Loader und Readiness-Liste.
- Dedizierte Gegnertexturen, Kingdom-Atlas, prozedurale Placeholder und der
  weiterhin benoetigte Party-Hero-Fallback bleiben unveraendert.
- Validiert mit `git diff --check`, Asset-/Battle-Art-Tests (38/38),
  Typecheck, 859 Unit-Tests inklusive Balance-Harness, Build und vollstaendigem
  Title-zu-Battle-Chromium-Smoke (1/1).

### Phase 255 - Kampfitems im Menue nicht verbrauchen

- Branch/Worktree: `phase-255-menu-item-guard` in
  `/worktree/tempest-phase-255-menu-item-guard`.
- Ein zentraler Menue-Guard erlaubt dort nur Heilung, MP-Regeneration und
  Nebel-Ward; Kampf-only-Effekte werden als unbenutzbar angezeigt.
- `cure-status` und `revive` bleiben Kampfmechaniken und koennen im Menue nicht
  mehr wirkungslos verbraucht werden.
- Validiert mit `git diff --check`, Menue-Tests (10/10), Typecheck, 860
  Unit-Tests inklusive Balance-Harness, Build und fokussiertem
  Inventar-Chromium-Smoke (1/1).

### Phase 256 - Toten Skill-Item-Effekt entfernt

- Branch/Worktree: `phase-256-dead-skill-item` in
  `/worktree/tempest-phase-256-dead-skill-item`.
- Der unbelegte `grant-skill`-Effekt, sein ungenutztes `skillId`-Feld, die
  unerreichbare Kampfablehnung und der tote Datenvalidator wurden entfernt.
- Es gab weder eine Item-Definition noch einen Erzeuger fuer diesen Effekt;
  bestehende Item-Mechaniken bleiben unveraendert.
- Validiert mit `git diff --check`, vollstaendigem Quellreferenz-Audit,
  Datenintegritaet (7/7), Typecheck, 860 Unit-Tests inklusive Balance-Harness
  und Build.

### Phase 257 - Veldora-Hoehlenbild bei der Rueckkehr

- Branch/Worktree: `phase-257-veldora-discovery-art` in
  `/worktree/tempest-phase-257-veldora-discovery-art`.
- Das bereits projektgenerierte, textfreie `veldora-cave-revisit.webp` wurde
  aus dem alten Phase-114-Assetstand ins Repo uebernommen und in `ASSETS.md`
  mit seiner vorhandenen xAI-Imagine-Provenienz dokumentiert.
- Die bestehende Fundstelle `Nachhall des Sturmdrachen` zeigt nun diese
  Hoehlenillustration; alle anderen Fundstellen behalten ihre Regionsbanner.
- Validiert mit `git diff --check`, Asset-/Discovery-Tests (32/32), Typecheck,
  861 Unit-Tests inklusive Balance-Harness, Build und fokussiertem
  Veldora-Discovery-Chromium-Smoke (1/1).

### Phase 258 - Menue-Ward im Kampf nicht verbrauchen

- Branch/Worktree: `phase-258-battle-item-guard` in
  `/worktree/tempest-phase-258-battle-item-guard`.
- Ein gemeinsamer Kampfitem-Guard erlaubt nur Heilung, MP-Regeneration,
  Wiederbelebung und Statusreinigung; die UI-Liste und der Resolver nutzen
  dieselbe Regel.
- `clearsight-drops` bleibt damit ein reines Vorbereitungsitem, erscheint nicht
  in der Kampfliste und kann dort auch ueber direkte Actions nicht verbraucht
  werden.
- Validiert mit `git diff --check`, Kampftests (64/64), Typecheck, 862
  Unit-Tests inklusive Balance-Harness, Build und fokussiertem
  Kampfitem-Chromium-Smoke (1/1).

### Phase 259 - Items ohne Wirkung nicht verbrauchen

- Branch/Worktree: `phase-259-no-effect-items` in
  `/worktree/tempest-phase-259-no-effect-items`.
- Heil- und MP-Items werden bei bereits vollen Ressourcen in Menue und Kampf
  abgelehnt und nicht verbraucht.
- Der Kampf protokolliert bei teilweiser Auffuellung nun den tatsaechlich
  wiederhergestellten Wert statt des nominellen Itemwerts.
- Validiert mit `git diff --check`, Menue-/Kampftests (77/77), Typecheck, 865
  Unit-Tests inklusive Balance-Harness, Build und fokussiertem
  Inventar-Chromium-Smoke (1/1).

### Phase 260 - E2E-Timeout unter Parallel-Last stabilisieren

- Branch/Worktree: `phase-260-e2e-timeout` in
  `/worktree/tempest-phase-260-e2e-timeout`.
- Zwei korrekt gerenderte Asset-Smokes benoetigten unter den CI-konformen zwei
  Workern 33,7 beziehungsweise 35,4 Sekunden und ueberschritten dadurch das
  Playwright-Standardlimit von 30 Sekunden.
- Das zentrale Testlimit betraegt nun 45 Sekunden; Testlogik und Produktcode
  bleiben unveraendert.
- Validiert mit `git diff --check`, parallelem Asset-Chromium-Smoke (2/2),
  Typecheck, 865 Unit-Tests inklusive Balance-Harness und Build.

### Phase 261 - Boss-Add-Banner im Kampf

- Branch/Worktree: `phase-261-boss-add-banner` in
  `/worktree/tempest-phase-261-boss-add-banner`.
- Das bereits projektgenerierte `boss-add-spawn.webp` wird global geladen und
  beim Hinzukommen der einmaligen Boss-Verstaerkung kurz ueber der Arena
  eingeblendet; Spieler- und Gegneraktionen laufen ueber denselben Feedbackpfad.
- Validiert mit `git diff --check`, Typecheck, 865 Unit-Tests inklusive
  Balance-Harness, Build und fokussiertem Desktop-Chromium-Smoke (1/1).

### Phase 262 - Textfreies Boss-Emblem im Kampf

- Branch/Worktree: `phase-262-boss-emblem` in
  `/worktree/tempest-phase-262-boss-emblem`.
- Ein neues projektgeneriertes, transparentes Emblem markiert Boss-Einheiten
  direkt auf ihrer Kampfkarte; das unverdrahtete beschriftete Phase-118-Mockup
  wurde entfernt und seine 197 KB durch das 56-KB-Laufzeitasset ersetzt.
- Die OpenAI-Bildgenerierung und lokale Chroma-Key-Freistellung sind in
  `ASSETS.md` dokumentiert.
- Validiert mit `git diff --check`, Typecheck, 866 Unit-Tests inklusive
  Balance-Harness, Build sowie Desktop-Chromium-Smokes fuer Asset-Laden und
  Milim-Bosskampf (2/2).

### Phase 263 - Unverdrahtete UI-Mockups entfernen

- Branch/Worktree: `phase-263-dead-ui-assets` in
  `/worktree/tempest-phase-263-dead-ui-assets`.
- Die nie geladene Charibdis-, Story-Reihenfolge- und Gebietswechsel-Grafik
  samt ihren Ledgerzeilen wurde entfernt. Charibdis hat keinen Spielcontent;
  Gebietswechsel nutzen bereits Regionsbanner, und ein eigener Story-Timeline-
  Screen existiert nicht.
- Dadurch entfallen 581.004 Byte spekulative Binärassets; ein Asset-Test
  verhindert ihre versehentliche Rueckkehr ohne Laufzeit-Wiring.
- Validiert mit `git diff --check`, Typecheck, 867 Unit-Tests inklusive
  Balance-Harness, Build und Desktop-Chromium-Smoke fuer Titel, Oberwelt,
  Menue und Kampf (1/1).

### Phase 264 - GitHub Actions auf Node 24 aktualisieren

- Branch/Worktree: `phase-264-node24-actions` in
  `/worktree/tempest-phase-264-node24-actions`.
- Deploy, CI und Motivationsworkflow verwenden nun die offiziellen
  Node-24-Majors: `checkout@v7`, `cache@v6`, `configure-pages@v6`,
  `upload-pages-artifact@v5` und `deploy-pages@v5`; `setup-bun@v2` war bereits
  Node-24-faehig.
- Der Release-Test prueft die gemeinsamen und Pages-spezifischen Referenzen.
- Validiert mit `git diff --check`, Release-Test (5/5), Typecheck, 868
  Unit-Tests inklusive Balance-Harness, Build und warning-freiem Branch-CI:
  Typecheck, vier Unit-Shards und 126 Browser-Smokes.

### Phase 265 - Regionsbanner-Ladegewicht reduzieren

- Branch/Worktree: `phase-265-region-banners` in
  `/worktree/tempest-phase-265-region-banners`.
- Die drei uebergrossen Regionsbanner fuer Tempest-Kolosseum,
  Freiheitsakademie und Ramiris-Labyrinth wurden seitenverhaeltnistreu auf
  maximal 1024 px Breite verkleinert. Ihr Gesamtgewicht sank von 1.076.116 auf
  374.510 Bytes (-65,2 %), ohne bestehende quadratische, 2:1- oder
  4:1-Laufzeit-Crops zu veraendern.
- Ein Asset-Budget sichert die drei WebPs gemeinsam unter 400 kB ab;
  `ASSETS.md` dokumentiert die neuen Abmessungen.
- Validiert mit Sichtpruefung aller drei Assets, `git diff --check`, Typecheck,
  869 Unit-Tests inklusive Balance-Harness, Build, fokussiertem
  Desktop-Chromium-Smoke (3/3) und vollstaendig gruenem Branch-CI.

### Phase 266 - Uebergrosse Kampf-Hintergruende normalisieren

- Branch/Worktree: `phase-266-battle-backgrounds` in
  `/worktree/tempest-phase-266-battle-backgrounds`.
- Die beiden 1672×941-Ausreisser fuer Tempest-Kolosseum und Tempest-Invasion
  wurden auf das bestehende 1280×720-Format aller anderen Kampf-Hintergruende
  verkleinert. Ihr Gesamtgewicht sank von 692.966 auf 411.896 Bytes (-40,6 %),
  Komposition und freie Kampfmitte blieben erhalten.
- Ein Asset-Budget sichert beide WebPs gemeinsam unter 420 kB ab;
  `ASSETS.md` dokumentiert Standardformat und Optimierungsphase.
- Validiert mit Sichtpruefung beider Assets, `git diff --check`, Typecheck,
  870 Unit-Tests inklusive Balance-Harness, Build, fokussiertem
  Desktop-Chromium-Smoke (2/2) und vollstaendig gruenem Branch-CI.

### Phase 267 - Uebergrosse Sprite-Quellen verkleinern

- Branch/Worktree: `phase-267-large-sprites` in
  `/worktree/tempest-phase-267-large-sprites`.
- Kingdom-Kampfatlas, Shizu-Schuelerportrait, Magiekoloss und Mordrahn wurden
  seitenverhaeltnistreu auf maximal 1024 px verkleinert. Ihr Gesamtgewicht
  sank von 1.177.454 auf 759.012 Bytes (-35,5 %); Alpha-Kanten, Atlas-Zellen
  und Bildkomposition blieben erhalten.
- Ein gemeinsames Asset-Budget sichert die vier WebPs unter 780 kB ab;
  `ASSETS.md` dokumentiert die neuen Abmessungen.
- Validiert mit Sichtpruefung aller vier Assets, `git diff --check`, Typecheck,
  871 Unit-Tests inklusive Balance-Harness, Build, fokussiertem
  Desktop-Chromium-Smoke (3/3) und vollstaendig gruenem Branch-CI.

### Phase 268 - UI-Quellenbudget

- Branch/Worktree: `phase-268-ui-source-budget` in
  `/worktree/tempest-phase-268-ui-source-budget`.
- Codex-Archivvignette und Mimik-Form-Banner wurden von 1774x887 bzw.
  1408x704 auf 512x256 verkleinert. Bei Rendergroessen von 240x120 bzw.
  224x112 bleibt mehr als die doppelte Quelldichte erhalten; das gemeinsame
  Gewicht sank von 204.514 auf 35.812 Bytes (-82,5 %).
- Ein gemeinsames Asset-Budget sichert die klein gerenderten UI-Quellen unter
  50 kB ab; `ASSETS.md` dokumentiert die neuen Abmessungen und Verarbeitung.
- Validiert mit Sichtpruefung beider Assets, `git diff --check`, Asset-Test
  (27/27), Typecheck, 872 Unit-Tests inklusive Balance-Harness, Build,
  fokussiertem Desktop-Chromium-Smoke (2/2) und vollstaendig gruener
  Branch-CI inklusive 126 Browser-Smokes.

### Phase 269 - HUD-Quellenbudget

- Branch/Worktree: `phase-269-hud-source-budget` in
  `/worktree/tempest-phase-269-hud-source-budget`.
- Formation, Praedator-Skill-Raub und Boss-Verstaerkungsbanner wurden von
  1280x720 auf 640x360 verkleinert. Bei maximalen Rendergroessen von 132x74,
  224x126 und 320x180 bleibt mindestens die doppelte Quelldichte erhalten;
  das gemeinsame Gewicht sank von 366.432 auf 130.014 Bytes (-64,5 %).
- Ein gemeinsames Asset-Budget sichert die kompakten HUD-Banner unter 140 kB
  ab; `ASSETS.md` dokumentiert die neuen Abmessungen und Verarbeitung.
- Validiert mit Sichtpruefung aller drei Assets, `git diff --check`, Asset-Test
  (28/28), Typecheck, 873 Unit-Tests inklusive Balance-Harness, Build,
  fokussiertem Desktop-Chromium-Smoke (2/2) und vollstaendig gruener
  Branch-CI inklusive 126 Browser-Smokes.

### Phase 270 - Dialog-Hinweis zuschneiden

- Branch/Worktree: `phase-270-dialog-hint-crop` in
  `/worktree/tempest-phase-270-dialog-hint-crop`.
- Vom 1280x720-Dialog-Hinweis wurde nur der tatsaechlich verwendete
  500x500-Frame uebernommen und auf die doppelte Rendergroesse 300x300
  verkleinert. Das Asset sank von 97.816 auf 16.664 Bytes (-83,0 %).
- `DialogueScene` nutzt die Quelle direkt; die nur fuer den alten Ausschnitt
  benoetigte Frame-Registrierung in `PreloadScene` entfaellt. `ASSETS.md` und
  der bestehende Asset-Test dokumentieren und sichern Quelle sowie Wiring.
- Validiert mit Sichtpruefung, `git diff --check`, Asset-Test (28/28),
  Typecheck, 873 Unit-Tests inklusive Balance-Harness, Build, fokussiertem
  Desktop-Chromium-Smoke (1/1) und vollstaendig gruener Branch-CI inklusive
  126 Browser-Smokes.

### Phase 276 - Audio-Erweiterung

- Branch/Worktree: `phase-276-audio` in
  `/worktree/tempest-phase-276-audio`.
- Vier CC0-Motive aus Kenney Music Jingles ergänzen Siedlung, Wildnis, Menü
  und Boss. Die bestehende Audio-Pipeline behält Master×Musik-Lautstärke,
  Mute-Verhalten und UI-/Kampf-SFX bei.
- Die Track-Auswahl bleibt bewusst klein: Karte und Boss-Status wählen direkt
  den passenden Eintrag aus der vorhandenen Map, ohne eine zweite Audio-Schicht.
- Validiert mit `git diff --check`, Typecheck, 875 Unit-Tests, Build und
  fokussiertem Desktop-Chromium-Smoke (Title → Overworld → Menü → Battle).

### Phase 281 - Eingabe-Resilienz

- Branch/Worktree: `phase-281-input-resilience` in
  `/worktree/tempest-phase-281-input-resilience`.
- Das Touch-Steuerkreuz setzt eine gehaltene Bewegungsrichtung jetzt bei jedem
  globalen `pointerup` zurück und entfernt seinen Listener beim Szenenende.
- Validiert mit Typecheck, 874 Unit-Tests, Build und mobilem
  Orientierungs-Browser-Smoke. Der umfassende mobile Game-Smoke erreichte sein
  bestehendes 45-Sekunden-Limit ohne fachliche Fehlermeldung.

### Phase 282 - Kampf-Feedback fuer MP-Aenderungen

- Branch/Worktree: `phase-282-feedback-mp` in
  `/worktree/tempest-phase-282-feedback-mp`.
- Reine MP-Aenderungen erzeugen jetzt Feedback-Events. Verbrauch und
  Regeneration erhalten im Kampf eine versetzte blaue MP-Anzeige.
- Validiert mit Typecheck, 874 Unit-Tests, Build und mobilem
  Orientierungs-Browser-Smoke.

### Phase 124 - Sammel-Meisterschaft

- Der aus `backup/diverged-main-commits` wiederhergestellte, aeltere
  `PROGRESSION_REGIONS`-Ansatz wurde beim Merge nicht parallel aktiviert: Er
  haette zusammen mit dem heutigen Jagdgrund-System denselben Analyseabschluss
  doppelt belohnt.
- Kanonisch bleibt `bestiaryMastery.ts`: kuratierte Jagdgruende zahlen ihren
  Magicule-Fund einmalig aus und persistieren ihn ueber
  `bestiary.mastery.<groundId>`-Flags.
- Ein fokussierter Merge-Test belegte die Doppelzahlung; nach der Aufloesung
  blieben Bestiarium-, Kampfergebnis- und Save-Tests unveraendert gruen.

## 14. Change Checklist

Before editing:

- Check branch, status, active worktrees, and phase ownership.
- Confirm whether behavior exists on `main` or only in another worktree.
- Read relevant tests and identify persisted IDs/state.

While editing:

- Keep data, pure rules, and presentation in their established layers.
- Add normalization/migration for persisted changes.
- Update asset file, mapping, preload, manifest, and tests together.
- Verify mobile landscape layout, the portrait orientation gate, and
  44-pixel minimum logical touch targets.

Before completion:

- Run the required quality gates.
- Verify desktop, `844x390` gameplay, and the `390x844` orientation gate when
  presentation changes.
- Update only unresolved task state in `PLAN.md`.
- Commit and push the phase branch.
- Do not delete unmerged worktrees or branches.
