---
schema: tempest-project-knowledge/v2
format: okf-inspired-structured-markdown
document_role: canonical-project-context
title: Tempest - Chronik
snapshot:
  date: 2026-06-30
  branch: main
  base_commit: 227a0f4a05c38442648520e7204fb5a35db3a121
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

`main` contains Phase 42, Phase 47, and the earlier merged implementation. The
separately numbered asset phases 33-39 are also integrated.
Current `main` includes:

- Core overworld, save, battle, menu, world, progression, settings, and release
  pipeline.
- Canon-first Band 1/2 route and integrated story/save compatibility tests.
- Dwargon, Orc Disaster, Lizard alliance, Shizu/Ifrit, and Blumund slices.
- Ranga scouting/fast travel and optional legacy-arc isolation.
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

Open local worktree state at this snapshot:

| Phase | State | Worktree |
|---|---|---|
| 33-42, 47 | merged into `main`; worktrees removed after clean-status checks | none |

Inspect `git status` and `git worktree list --porcelain` before relying on this
table because worktree state changes faster than the knowledge document.

## 11. Completed History Summary

```yaml
completed_milestones:
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
```

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

## 13. Change Checklist

Before editing:

- Check branch, status, active worktrees, and phase ownership.
- Confirm whether behavior exists on `main` or only in another worktree.
- Read relevant tests and identify persisted IDs/state.

While editing:

- Keep data, pure rules, and presentation in their established layers.
- Add normalization/migration for persisted changes.
- Update asset file, mapping, preload, manifest, and tests together.
- Verify mobile layout and 44-pixel minimum touch targets.

Before completion:

- Run the required quality gates.
- Verify desktop and `390x844` when presentation changes.
- Update only unresolved task state in `PLAN.md`.
- Commit and push the phase branch.
- Do not delete unmerged worktrees or branches.
