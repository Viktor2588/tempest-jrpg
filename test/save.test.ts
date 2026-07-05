import { describe, expect, it } from 'vitest';
import { HEROES } from '../src/data';
import {
  autoSave,
  createNewSave,
  exportSave,
  importSave,
  LEGACY_SAVE_STORAGE_KEYS,
  loadSave,
  migrate,
  normalize,
  resetSave,
  SAVE_STORAGE_KEY,
  startNewGamePlus,
  type StorageLike
} from '../src/systems/save';
import { getItemCount } from '../src/systems/inventory';
import { createPartyMember } from '../src/systems/party';

class MemoryStorage implements StorageLike {
  readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }
}

describe('save.ts', () => {
  it('roundtript einen aktuellen Spielstand über Export und Import', () => {
    const save = createNewSave({ now: '2026-06-26T10:00:00.000Z', seed: 42 });
    const changed = {
      ...save,
      playtimeSeconds: 90,
      party: {
        ...save.party,
        gold: 250
      },
      inventory: {
        stacks: [
          ...save.inventory.stacks,
          { itemId: 'healing-herb', quantity: 2 },
          { itemId: 'mana-drop', quantity: 0 }
        ]
      },
      flags: {
        metVillageGuide: true
      },
      progression: {
        ...save.progression,
        relationshipPoints: { 'rimuru-gobta': 75 },
        skillPointsByCharacterId: { rimuru: 2 },
        unlockedSkillNodeIdsByCharacterId: { rimuru: ['rimuru-predator-focus'] }
      }
    };

    const loaded = importSave(exportSave(changed), '2026-06-26T10:05:00.000Z');

    expect(loaded.schemaVersion).toBe(3);
    expect(loaded.location).toEqual({
      mapId: 'sealed-cave',
      x: 7,
      y: 6,
      facing: 'up'
    });
    expect(loaded.party.gold).toBe(250);
    expect(loaded.playtimeSeconds).toBe(90);
    expect(getItemCount(loaded.inventory.stacks, 'healing-herb')).toBe(7);
    expect(getItemCount(loaded.inventory.stacks, 'mana-drop')).toBe(2);
    expect(loaded.flags.metVillageGuide).toBe(true);
    expect(loaded.progression.relationshipPoints['rimuru-gobta']).toBe(75);
    expect(loaded.progression.unlockedSkillNodeIdsByCharacterId.rimuru)
      .toEqual(['rimuru-predator-focus']);
  });

  it('migriert einen alten v1-Spielstand auf das aktuelle Schema', () => {
    const migrated = migrate(
      {
        schemaVersion: 1,
        createdAt: '2026-06-01T00:00:00.000Z',
        seed: 7,
        mapId: 'old-field',
        x: 3,
        y: 9,
        facing: 'left',
        gold: 77,
        activeParty: [
          {
            id: 'rimuru',
            level: 3,
            xp: 240,
            learnedSkillIds: ['water-blade']
          },
          {
            id: 'unknown-character',
            level: 99
          }
        ],
        inventory: {
          'healing-herb': 4,
          'mana-drop': 1,
          broken: -2
        },
        flags: {
          introComplete: true,
          invalid: 'yes'
        }
      },
      '2026-06-26T12:00:00.000Z'
    );

    expect(migrated.schemaVersion).toBe(3);
    expect(migrated.createdAt).toBe('2026-06-01T00:00:00.000Z');
    expect(migrated.updatedAt).toBe('2026-06-26T12:00:00.000Z');
    expect(migrated.location).toEqual({
      mapId: 'old-field',
      x: 3,
      y: 9,
      facing: 'left'
    });
    expect(migrated.party.active).toHaveLength(1);
    expect(migrated.party.active[0]!.characterId).toBe('rimuru');
    expect(migrated.party.active[0]!.level).toBe(3);
    expect(migrated.party.gold).toBe(77);
    expect(getItemCount(migrated.inventory.stacks, 'healing-herb')).toBe(4);
    expect(getItemCount(migrated.inventory.stacks, 'broken')).toBe(0);
    expect(migrated.flags).toEqual({ introComplete: true });
    expect(migrated.progression).toEqual(createNewSave().progression);
  });

  it('migriert v2-Fortschritt und lädt den bisherigen Storage-Key automatisch', () => {
    const storage = new MemoryStorage();
    const oldSave = createNewSave({ now: '2026-06-26T10:00:00.000Z', seed: 8 });
    const { progression: _progression, ...withoutProgression } = oldSave;
    storage.setItem(LEGACY_SAVE_STORAGE_KEYS[0], JSON.stringify({
      ...withoutProgression,
      schemaVersion: 2
    }));

    const loaded = loadSave(storage);

    expect(loaded?.schemaVersion).toBe(3);
    expect(loaded?.seed).toBe(8);
    expect(loaded?.progression).toEqual(createNewSave().progression);
    expect(storage.getItem(SAVE_STORAGE_KEY)).not.toBeNull();
  });

  it('speichert, lädt und löscht Auto-Saves über eine Storage-Abstraktion', () => {
    const storage = new MemoryStorage();
    const save = createNewSave({ now: '2026-06-26T10:00:00.000Z', seed: 3 });

    const written = autoSave(storage, save, '2026-06-26T10:01:00.000Z');
    const loaded = loadSave(storage);

    expect(storage.getItem(SAVE_STORAGE_KEY)).not.toBeNull();
    expect(written.updatedAt).toBe('2026-06-26T10:01:00.000Z');
    expect(loaded?.updatedAt).toBe('2026-06-26T10:01:00.000Z');

    resetSave(storage);
    expect(loadSave(storage)).toBeNull();
  });

  it('trägt bei New Game+ Fortschritt mit, setzt aber die Story zurück und heilt die Party', () => {
    const base = createNewSave({ now: '2026-06-26T10:00:00.000Z', seed: 7 });
    const leveled = {
      ...base,
      party: {
        ...base.party,
        active: base.party.active.map((member) => ({ ...member, level: 12, currentHp: 1, currentMp: 0 })),
        gold: 999
      },
      flags: { 'story.act1.completed': true, 'ending.true': true },
      quests: { 'binding-of-ancestors': { status: 'completed' as const, completedStepIds: ['gather-council'] } },
      location: { mapId: 'spirit-highlands', x: 5, y: 5, facing: 'up' as const },
      progression: { ...base.progression, skillPointsByCharacterId: { rimuru: 4 } }
    };

    const ng = startNewGamePlus(leveled, '2026-06-27T00:00:00.000Z');

    // Mitgetragen: Level, Gold, Progression.
    expect(ng.party.active[0]!.level).toBe(12);
    expect(ng.party.gold).toBe(999);
    expect(ng.progression.skillPointsByCharacterId.rimuru).toBe(4);
    // Voll geheilt.
    expect(ng.party.active[0]!.currentHp).toBeGreaterThan(1);
    // Story zurückgesetzt.
    expect(ng.flags).toEqual({});
    expect(ng.quests).toEqual({});
    expect(ng.location.mapId).toBe('sealed-cave');
  });

  it('enthält in einem frischen Spielstand ausschließlich Rimuru', () => {
    const save = createNewSave();
    expect(save.party.active.map((member) => member.characterId)).toEqual(['rimuru']);
    expect(save.flags['compat.legacyArc.visible']).toBeUndefined();
  });

  it('trägt Story-Rekruten aus Flags nach, ohne Bestehende zu entfernen (Rückwärtskompat)', () => {
    const base = createNewSave();
    const migrated = normalize({
      ...base,
      flags: {
        'story.goblin.plea': true,
        'story.direwolf.pact': true,
        'story.council.ready': true
      }
    });

    const ids = migrated.party.active.map((member) => member.characterId);
    expect(ids).toContain('rimuru');
    expect(ids).toContain('gobta');
    expect(ids).toContain('ranga');
    expect(migrated.party.reserve.map((member) => member.characterId)).toContain('rigurd');
  });

  it('dupliziert einen bereits vorhandenen Rekruten nicht (z. B. Gobta in der Reserve)', () => {
    const base = createNewSave();
    const gobta = createPartyMember(HEROES.find((hero) => hero.id === 'gobta')!);
    const migrated = normalize({
      ...base,
      party: { ...base.party, reserve: [gobta] },
      flags: { 'story.goblin.plea': true }
    });

    const all = [...migrated.party.active, ...migrated.party.reserve].map((member) => member.characterId);
    expect(all.filter((id) => id === 'gobta')).toHaveLength(1);
  });

  it('normalisiert dauerhaft angeeignete Skills ohne Dubletten oder unbekannte IDs', () => {
    const base = createNewSave();
    const rimuru = base.party.active[0]!;
    const migrated = normalize({
      ...base,
      party: {
        ...base.party,
        active: [{
          ...rimuru,
          learnedSkillIds: [...rimuru.learnedSkillIds, 'venom-spit', 'venom-spit', 'unknown-skill']
        }]
      }
    });
    const learned = migrated.party.active[0]!.learnedSkillIds;

    expect(learned.filter((skillId) => skillId === 'venom-spit')).toHaveLength(1);
    expect(learned).not.toContain('unknown-skill');
  });

  it('markiert alte Originalbogen-Saves für Legacy-Kompatibilität', () => {
    const base = createNewSave();
    const migrated = normalize({
      ...base,
      flags: { 'story.act3.started': true },
      quests: {
        'ancestors-choice': { status: 'active', completedStepIds: ['rally'] }
      }
    });

    expect(migrated.flags['compat.legacyArc.visible']).toBe(true);
    expect(migrated.flags['story.original-arc.optional']).toBe(true);
  });

  it('markiert neue Band-4-Saves nach Grenzeskalation nicht als Legacy-Bogen', () => {
    const base = createNewSave();
    const migrated = normalize({
      ...base,
      flags: {
        'story.act2.completed': true,
        'story.border.deescalated': true,
        'story.vanguard.trace-read': true,
        'story.act3.started': true
      },
      quests: {
        'ancestors-choice': { status: 'active', completedStepIds: ['rally'] }
      }
    });

    expect(migrated.flags['compat.legacyArc.visible']).toBeUndefined();
    expect(migrated.flags['story.original-arc.optional']).toBeUndefined();
  });

  it('löst die Schmiede (Kaijin/Kurobe) aus Altständen sauber aus der Party (Phase 68)', () => {
    const base = createNewSave();
    const smithLike = (characterId: string) => ({
      ...createPartyMember(HEROES[0]!),
      characterId
    });
    const raw = JSON.parse(exportSave(base)) as Record<string, unknown>;
    const party = raw.party as { active: unknown[]; reserve: unknown[] };
    party.active = [...(party.active as unknown[]), smithLike('kurobe')];
    party.reserve = [smithLike('kaijin')];

    const migrated = importSave(JSON.stringify(raw), '2026-07-02T10:00:00.000Z');
    const ids = [...migrated.party.active, ...migrated.party.reserve].map((member) => member.characterId);
    expect(ids).not.toContain('kaijin');
    expect(ids).not.toContain('kurobe');
    // Die restliche Party bleibt spielbar.
    expect(migrated.party.active.length).toBeGreaterThan(0);
  });
});
