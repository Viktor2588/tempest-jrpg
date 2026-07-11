import { describe, expect, it } from 'vitest';
import {
  BESTIARY_REGION_MASTERY_MAGICULES,
  buildBestiary,
  collectBestiaryRegionMasteries,
  isEnemyAnalyzed,
  tallyAnalyzedEnemies,
  tallyClaimedBestiaryRegions
} from '../src/systems/bestiary';
import { createProgressionState } from '../src/systems/progression';

describe('tallyAnalyzedEnemies', () => {
  it('fügt neue Arten hinzu und dedupliziert bestehende', () => {
    const next = tallyAnalyzedEnemies(['forest-slime'], ['spore-moth', 'forest-slime', 'orc-scout']);
    expect(next).toEqual(['forest-slime', 'spore-moth', 'orc-scout']);
  });

  it('gibt bei leerer Eingabe die Original-Referenz zurück (keine Neu-Allokation)', () => {
    const base = ['forest-slime'];
    expect(tallyAnalyzedEnemies(base, [])).toBe(base);
  });

  it('gibt bei reiner Wiederholung die Original-Referenz zurück', () => {
    const base = ['forest-slime', 'spore-moth'];
    expect(tallyAnalyzedEnemies(base, ['forest-slime', ''])).toBe(base);
  });

  it('isEnemyAnalyzed spiegelt den Wissensstand', () => {
    expect(isEnemyAnalyzed(['forest-slime'], 'forest-slime')).toBe(true);
    expect(isEnemyAnalyzed(['forest-slime'], 'spore-moth')).toBe(false);
  });
});

describe('buildBestiary', () => {
  it('listet nur begegnete Arten und verbirgt Kampfdaten unstudierter Gegner', () => {
    const bestiary = buildBestiary({
      defeatedEnemyCountsByEnemyId: { 'forest-slime': 3, 'spore-moth': 1 },
      analyzedEnemyIds: ['forest-slime']
    });

    expect(bestiary.entries.map((entry) => entry.enemyId)).toEqual(['forest-slime', 'spore-moth']);
    expect(bestiary.encounteredCount).toBe(2);
    expect(bestiary.analyzedCount).toBe(1);
    expect(bestiary.totalCount).toBeGreaterThan(2);

    const slime = bestiary.entries.find((entry) => entry.enemyId === 'forest-slime')!;
    expect(slime.analyzed).toBe(true);
    expect(slime.defeatedCount).toBe(3);
    // Studiert → echte Kampfdaten sichtbar.
    expect(slime.weaknesses).toEqual(['wind']);
    expect(slime.resistances).toEqual(['water']);
    expect(slime.element).not.toBeNull();

    const moth = bestiary.entries.find((entry) => entry.enemyId === 'spore-moth')!;
    expect(moth.analyzed).toBe(false);
    expect(moth.defeatedCount).toBe(1);
    // Nicht studiert → Kampfdaten verborgen (Anreiz zum Analysieren).
    expect(moth.weaknesses).toEqual([]);
    expect(moth.resistances).toEqual([]);
    expect(moth.element).toBeNull();
  });

  it('nimmt studierte, aber (noch) nicht erlegte Arten auf und sortiert nach Level', () => {
    const bestiary = buildBestiary({
      defeatedEnemyCountsByEnemyId: { 'lizardman-acolyte': 1 },
      analyzedEnemyIds: ['forest-slime']
    });
    // forest-slime (Lv 1) vor lizardman-acolyte (Lv 5).
    expect(bestiary.entries.map((entry) => entry.enemyId)).toEqual(['forest-slime', 'lizardman-acolyte']);
    const slime = bestiary.entries[0];
    expect(slime.defeatedCount).toBe(0); // studiert, aber nie erlegt
    expect(slime.analyzed).toBe(true);
  });

  it('ignoriert Zähler von 0 und unbekannte Ids', () => {
    const bestiary = buildBestiary({
      defeatedEnemyCountsByEnemyId: { 'forest-slime': 0, 'does-not-exist': 4 },
      analyzedEnemyIds: []
    });
    expect(bestiary.entries).toEqual([]);
  });

  it('leerer Frischstart hat keine Einträge, aber ein Gesamtziel', () => {
    const state = createProgressionState();
    const bestiary = buildBestiary(state);
    expect(bestiary.entries).toEqual([]);
    expect(bestiary.encounteredCount).toBe(0);
    expect(bestiary.totalCount).toBeGreaterThan(0);
  });
});

describe('Bestiarium-Meisterschaft', () => {
  const tempestGroveEnemies = [
    'forest-slime',
    'direwolf-pup',
    'direwolf-alpha',
    'spore-moth',
    'orc-scout'
  ];

  it('erkennt vollstaendig analysierte Regionen und markiert sie einmalig', () => {
    const masteries = collectBestiaryRegionMasteries({
      discoveredRegionIds: ['tempest-grove'],
      analyzedEnemyIds: tempestGroveEnemies,
      claimedBestiaryRegionIds: []
    });

    expect(masteries).toEqual([
      {
        regionId: 'tempest-grove',
        name: 'Tempest-Hain',
        magicules: BESTIARY_REGION_MASTERY_MAGICULES
      }
    ]);
    expect(tallyClaimedBestiaryRegions([], masteries)).toEqual(['tempest-grove']);
  });

  it('vergibt keine Belohnung bei fehlender Art oder bereits abgeholter Region', () => {
    expect(collectBestiaryRegionMasteries({
      discoveredRegionIds: ['tempest-grove'],
      analyzedEnemyIds: tempestGroveEnemies.slice(0, -1),
      claimedBestiaryRegionIds: []
    })).toEqual([]);
    expect(collectBestiaryRegionMasteries({
      discoveredRegionIds: ['tempest-grove'],
      analyzedEnemyIds: tempestGroveEnemies,
      claimedBestiaryRegionIds: ['tempest-grove']
    })).toEqual([]);
  });

  it('ignoriert noch nicht entdeckte Regionen', () => {
    expect(collectBestiaryRegionMasteries({
      discoveredRegionIds: [],
      analyzedEnemyIds: tempestGroveEnemies,
      claimedBestiaryRegionIds: []
    })).toEqual([]);
  });
});
