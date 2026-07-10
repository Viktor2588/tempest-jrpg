import { describe, expect, it } from 'vitest';
import {
  act,
  createBattlePartyFromMembers,
  currentActor,
  enemyTurn,
  isPlayerTurn,
  renderView,
  startBattle,
  type BattleState
} from '../src/systems/battle';
import { applyBattleResultToSave } from '../src/systems/battleResult';
import {
  HUNTING_GROUNDS,
  collectHuntingGroundRewards,
  evaluateHuntingGrounds,
  huntingGroundMasteryFlag,
  newlyMasteredHuntingGrounds,
  summarizeHuntingGrounds
} from '../src/systems/bestiaryMastery';
import { createNewSave, exportSave, importSave } from '../src/systems/save';

// Blumund-Umland = kleinste Region (blumund-bandit + human-deserter) → guenstig zum Testen.
const BLUMUND = HUNTING_GROUNDS.find((ground) => ground.id === 'blumund')!;
const BLUMUND_FLAG = huntingGroundMasteryFlag('blumund');

describe('evaluateHuntingGrounds', () => {
  it('meldet Teilfortschritt und Vollstaendigkeit je Jagdgrund', () => {
    const progress = evaluateHuntingGrounds(['blumund-bandit'], {});
    const blumund = progress.find((entry) => entry.id === 'blumund')!;
    expect(blumund.total).toBe(2);
    expect(blumund.analyzedCount).toBe(1);
    expect(blumund.complete).toBe(false);
    expect(blumund.rewarded).toBe(false);

    const full = evaluateHuntingGrounds(['blumund-bandit', 'human-deserter'], {});
    expect(full.find((entry) => entry.id === 'blumund')!.complete).toBe(true);
  });

  it('spiegelt das Belohnungs-Flag als bereits ausgezahlt', () => {
    const progress = evaluateHuntingGrounds(['blumund-bandit', 'human-deserter'], { [BLUMUND_FLAG]: true });
    expect(progress.find((entry) => entry.id === 'blumund')!.rewarded).toBe(true);
  });

  it('jeder Jagdgrund referenziert nur reale, doublettenfreie Gegner-Arten', () => {
    for (const ground of HUNTING_GROUNDS) {
      expect(ground.enemyIds.length).toBeGreaterThanOrEqual(2);
      expect(new Set(ground.enemyIds).size).toBe(ground.enemyIds.length);
      expect(ground.magiculeReward).toBeGreaterThan(0);
    }
  });
});

describe('collectHuntingGroundRewards', () => {
  it('gibt neu vollstaendige, noch nicht belohnte Jagdgruende zurueck', () => {
    const rewards = collectHuntingGroundRewards(['blumund-bandit', 'human-deserter'], {});
    const blumund = rewards.find((reward) => reward.groundId === 'blumund')!;
    expect(blumund.magicules).toBe(BLUMUND.magiculeReward);
    expect(blumund.flag).toBe(BLUMUND_FLAG);
  });

  it('zahlt einen bereits belohnten Jagdgrund nicht erneut aus', () => {
    const rewards = collectHuntingGroundRewards(['blumund-bandit', 'human-deserter'], { [BLUMUND_FLAG]: true });
    expect(rewards.some((reward) => reward.groundId === 'blumund')).toBe(false);
  });

  it('gibt fuer unvollstaendige Jagdgruende keine Belohnung aus', () => {
    expect(collectHuntingGroundRewards(['blumund-bandit'], {})).toEqual([]);
  });
});

describe('newlyMasteredHuntingGrounds / summarizeHuntingGrounds', () => {
  it('erkennt nur frisch gesetzte Meisterschafts-Flags', () => {
    const before = {};
    const after = { [BLUMUND_FLAG]: true };
    expect(newlyMasteredHuntingGrounds(before, after).map((g) => g.id)).toEqual(['blumund']);
    // Bereits vorher gesetzt → nicht mehr „neu".
    expect(newlyMasteredHuntingGrounds(after, after)).toEqual([]);
  });

  it('zaehlt gemeisterte / gesamte Jagdgruende', () => {
    const summary = summarizeHuntingGrounds(['blumund-bandit', 'human-deserter'], {});
    expect(summary.total).toBe(HUNTING_GROUNDS.length);
    expect(summary.mastered).toBe(1);
  });
});

// --- Integration durch den Kampf-Ergebnis-Pfad -----------------------------

function winAnalyzed(enemyIds: readonly string[], seed: number): BattleState {
  const save = createNewSave({ seed });
  const battle = startBattle({
    party: createBattlePartyFromMembers(save.party.active),
    enemyIds,
    inventory: save.inventory.stacks,
    seed
  });
  const rimuru = battle.combatants.find((combatant) => combatant.side === 'party')!;
  for (const foe of battle.combatants.filter((combatant) => combatant.side === 'enemy')) {
    foe.analysisLevel = 1; // im Kampf studiert
  }
  let guard = 0;
  while (battle.status === 'active' && guard++ < 400) {
    rimuru.hp = rimuru.maxHp; // Rimuru am Leben halten, Fokus liegt auf dem Sieg
    if (isPlayerTurn(battle)) {
      const actor = currentActor(battle)!;
      if (actor.side !== 'party') {
        enemyTurn(battle);
        continue;
      }
      const target = renderView(battle).enemies.find((enemy) => !enemy.dead);
      if (!target) break;
      const foe = battle.combatants.find((combatant) => combatant.id === target.id)!;
      foe.hp = 1; // garantierter Kill
      act(battle, { type: 'attack', targetId: target.id });
    } else {
      enemyTurn(battle);
    }
  }
  return battle;
}

describe('Phase 124 — Sammel-Meisterschaft im Kampf-Ergebnis', () => {
  it('zahlt den Jagdgrund-Fund genau einmal aus und setzt das Flag', () => {
    const battle = winAnalyzed(['blumund-bandit', 'human-deserter'], 5);
    expect(battle.status).toBe('won');

    const save = createNewSave({ seed: 5 });
    const before = save.progression.magicules;
    const after = applyBattleResultToSave(save, renderView(battle));

    // Beide Arten studiert → Blumund-Umland vollstaendig → Flag gesetzt.
    expect(after.progression.analyzedEnemyIds).toEqual(
      expect.arrayContaining(['blumund-bandit', 'human-deserter'])
    );
    expect(after.flags[BLUMUND_FLAG]).toBe(true);
    // Magicule-Gewinn enthaelt den Meisterschafts-Fund (zzgl. Kampf-Magicules).
    expect(after.progression.magicules).toBe(
      before + 2 /* zwei Gegner */ + BLUMUND.magiculeReward
    );

    // Erneut anwenden (z. B. Wiederholungskampf) → keine zweite Auszahlung.
    const repeated = applyBattleResultToSave(after, renderView(battle));
    expect(repeated.progression.magicules).toBe(after.progression.magicules + 2);
    expect(repeated.flags[BLUMUND_FLAG]).toBe(true);
  });

  it('haelt das Meisterschafts-Flag ueber einen Save-Roundtrip', () => {
    const battle = winAnalyzed(['blumund-bandit', 'human-deserter'], 9);
    const save = applyBattleResultToSave(createNewSave({ seed: 9 }), renderView(battle));
    const roundtrip = importSave(exportSave(save));
    expect(roundtrip.flags[BLUMUND_FLAG]).toBe(true);
    expect(summarizeHuntingGrounds(roundtrip.progression.analyzedEnemyIds, roundtrip.flags).mastered).toBe(1);
  });
});
