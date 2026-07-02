import { describe, expect, it } from 'vitest';
import { ENEMIES } from '../src/data';
import {
  ENEMY_SCALING,
  averagePartyLevel,
  createScaledEnemyBattleUnits,
  effectiveEnemyLevel,
  experienceFalloffMultiplier,
  scaleEnemyStatsToLevel,
  scalingKindForEncounter
} from '../src/systems/enemyScaling';

const forestSlime = ENEMIES.find((enemy) => enemy.id === 'forest-slime')!;
const mordrahn = ENEMIES.find((enemy) => enemy.id === 'mordrahn')!;

describe('Phase 67 — Mitwachsende Gegner', () => {
  it('skaliert nur nach oben, nie unter das Basislevel', () => {
    // Party unter Basis → Gegner bleibt auf Basis (kein Voll-Level-Sync nach unten).
    expect(effectiveEnemyLevel(10, 4, 'trigger')).toBe(10);
    expect(effectiveEnemyLevel(10, 4, 'random')).toBe(10);
    // Party über Basis → Trigger zieht leicht über, Zufall bleibt knapp darunter.
    expect(effectiveEnemyLevel(10, 14, 'trigger')).toBe(15);
    expect(effectiveEnemyLevel(10, 14, 'random')).toBe(13);
  });

  it('kappt den Anstieg (Trigger Basis+6, Zufall Basis+8)', () => {
    expect(effectiveEnemyLevel(10, 40, 'trigger')).toBe(16);
    expect(effectiveEnemyLevel(10, 40, 'random')).toBe(18);
  });

  it('skaliert Werte prozentual pro Level über Basis und lässt Basiswerte unangetastet', () => {
    expect(scaleEnemyStatsToLevel(mordrahn.stats, mordrahn.level, mordrahn.level)).toEqual(mordrahn.stats);
    const scaled = scaleEnemyStatsToLevel(mordrahn.stats, mordrahn.level, mordrahn.level + 5);
    expect(scaled.maxHp).toBe(Math.round(mordrahn.stats.maxHp * (1 + ENEMY_SCALING.growthPerLevel.maxHp * 5)));
    expect(scaled.attack).toBe(Math.round(mordrahn.stats.attack * (1 + ENEMY_SCALING.growthPerLevel.attack * 5)));
    expect(scaled.agility).toBe(Math.round(mordrahn.stats.agility * (1 + ENEMY_SCALING.growthPerLevel.agility * 5)));
    // Alle Werte wachsen monoton.
    for (const key of Object.keys(scaled) as (keyof typeof scaled)[]) {
      expect(scaled[key]).toBeGreaterThanOrEqual(mordrahn.stats[key]);
    }
  });

  it('schwächt XP gegen deutlich schwächere Basislevel ab (Anti-Grind)', () => {
    expect(experienceFalloffMultiplier(10, 13)).toBe(1);
    expect(experienceFalloffMultiplier(10, 15)).toBe(0.5);
    expect(experienceFalloffMultiplier(10, 18)).toBe(0.25);
  });

  it('baut skalierte Kampfeinheiten: Stats hoch, XP fällt ab, Gold bleibt', () => {
    const [unit] = createScaledEnemyBattleUnits(['forest-slime'], 10, 'trigger');
    expect(unit).toBeDefined();
    // Basis L1, Party L10, Trigger → Kappe Basis+6 = 7.
    expect(unit!.level).toBe(7);
    expect(unit!.stats.maxHp).toBeGreaterThan(forestSlime.stats.maxHp);
    // Gap 9 ≥ 8 → XP ×0.25; Gold skaliert nicht.
    expect(unit!.experienceReward).toBe(Math.round(forestSlime.experienceReward * 0.25));
    expect(unit!.goldReward).toBe(forestSlime.goldReward);
    expect(unit!.drops).toEqual(forestSlime.drops);
  });

  it('lässt Gegner auf dem normalen Pfad unverändert (Party ≤ Basis)', () => {
    const [unit] = createScaledEnemyBattleUnits(['mordrahn'], 8, 'trigger');
    expect(unit!.level).toBe(mordrahn.level);
    expect(unit!.stats).toEqual(mordrahn.stats);
    expect(unit!.experienceReward).toBe(mordrahn.experienceReward);
  });

  it('ignoriert unbekannte Gegner-IDs und mittelt Partylevel abgerundet', () => {
    expect(createScaledEnemyBattleUnits(['does-not-exist'], 10, 'random')).toEqual([]);
    expect(averagePartyLevel([3, 4, 4])).toBe(3);
    expect(averagePartyLevel([])).toBe(1);
  });

  it('ordnet Encountern die richtige Scaling-Art zu', () => {
    expect(scalingKindForEncounter('mordrahn-confrontation')).toBe('trigger');
    expect(scalingKindForEncounter('east-grass')).toBe('random');
    expect(scalingKindForEncounter(null)).toBe('random');
    expect(scalingKindForEncounter('unknown-id')).toBe('random');
  });
});
