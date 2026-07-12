import { describe, expect, it } from 'vitest';
import { GAME_DATA } from '../src/data';
import { validateGameData } from './dataValidation';
import { ENCOUNTERS } from '../src/data/world';
import { ENEMIES } from '../src/data/enemies';
import { SKILLS } from '../src/data/skills';
import { enemyArtFor } from '../src/render/enemyArt';
import type { EncounterDefinition, EnemyDefinition } from '../src/data';

const ALL_ENEMIES = ENEMIES as readonly EnemyDefinition[];
const ALL_ENCOUNTERS = ENCOUNTERS as readonly EncounterDefinition[];
const enemyById = new Map(ALL_ENEMIES.map((e) => [e.id, e]));
const skillIds = new Set<string>(SKILLS.map((s) => s.id));
const levelOf = (id: string): number => enemyById.get(id)?.level ?? 0;

// Phase 146 — neue Normalgegner-Archetypen fuer duenne Encounter-Pools.
const NEW_ENEMY_IDS = [
  'marsh-thornback',
  'bog-warden',
  'highland-galecaller',
  'blumund-brigand',
  'academy-revenant'
] as const;

const NEW_RANDOM_ENCOUNTER_IDS = [
  'marsh-brackenhollow',
  'highlands-stormroost',
  'blumund-backalley',
  'academy-revenant-haunt'
] as const;

describe('Phase 146 — neue Gegner-Archetypen', () => {
  it('bricht die Spieldaten-Integritaet nicht', () => {
    expect(validateGameData(GAME_DATA)).toEqual([]);
  });

  it('definiert jeden neuen Gegner mit gueltigen Skill-/Devour-Referenzen und Textur', () => {
    for (const id of NEW_ENEMY_IDS) {
      const enemy = enemyById.get(id);
      expect(enemy, id).toBeDefined();
      for (const skillId of enemy!.skillIds) {
        expect(skillIds.has(skillId), `${id}:${skillId}`).toBe(true);
      }
      if (enemy!.devourSkillId) {
        expect(skillIds.has(enemy!.devourSkillId), `${id} devour`).toBe(true);
      }
      // Echte (ggf. wiederverwendete) Textur, kein leerer Key.
      expect(enemyArtFor(enemy!.id, enemy!.name).textureKey, id).toBeTruthy();
    }
  });

  it('zeigt distinkte Engine-Archetypen (Reflektor/Mender/CC/Rudel/Kategorie-Resistenz)', () => {
    expect(enemyById.get('marsh-thornback')!.reflectsElement).toBe('wind');
    expect(enemyById.get('bog-warden')!.healsAllies).toBe(true);
    expect(enemyById.get('highland-galecaller')!.skillIds).toContain('paralytic-howl');
    expect(enemyById.get('blumund-brigand')!.enrageOnAllyDeath).toBe(true);
    expect(enemyById.get('academy-revenant')!.resistsCategory).toBe('magical');
  });

  it('haelt jeden neuen Gegner im bestehenden Ambient-Band seiner Region (floor/ceil unveraendert)', () => {
    // Fuer jede Region: das [min,max]-Band der VORBESTEHENDEN Zufallsgegner (ohne die
    // neuen Encounter) — ein neuer Gegner darf es nicht verlassen, sonst kippt die
    // Monotonie in analyzeEncounterBalance.
    const newIds = new Set<string>(NEW_RANDOM_ENCOUNTER_IDS);
    const bandByMap = new Map<string, { floor: number; ceil: number }>();
    for (const enc of ALL_ENCOUNTERS) {
      if (enc.kind !== 'random' || newIds.has(enc.id)) continue;
      const levels = enc.enemyIds.map(levelOf);
      const prev = bandByMap.get(enc.mapId);
      bandByMap.set(enc.mapId, {
        floor: Math.min(prev?.floor ?? Infinity, ...levels),
        ceil: Math.max(prev?.ceil ?? -Infinity, ...levels)
      });
    }
    for (const encId of NEW_RANDOM_ENCOUNTER_IDS) {
      const enc = ALL_ENCOUNTERS.find((e) => e.id === encId)!;
      const band = bandByMap.get(enc.mapId)!;
      for (const enemyId of enc.enemyIds) {
        const level = levelOf(enemyId);
        expect(level, `${encId}:${enemyId}`).toBeGreaterThanOrEqual(band.floor);
        expect(level, `${encId}:${enemyId}`).toBeLessThanOrEqual(band.ceil);
      }
    }
  });

  it('haelt die neuen Zufalls-Encounter off-route (in keiner region.encounterIds-Liste)', () => {
    const newIds = new Set<string>(NEW_RANDOM_ENCOUNTER_IDS);
    for (const region of GAME_DATA.progression.regions) {
      for (const encounterId of region.encounterIds) {
        expect(newIds.has(encounterId)).toBe(false);
      }
    }
  });
});
