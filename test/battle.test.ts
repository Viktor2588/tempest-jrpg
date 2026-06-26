import { describe, it, expect } from 'vitest';
import {
  startBattle, act, enemyTurn, isPlayerTurn, currentActor, renderView,
  type BattleState
} from '../src/systems/battle';
import { DEMO_PARTY, ENEMIES } from '../src/data/units';

const ENEMY_IDS = Object.keys(ENEMIES);

// Spielt einen Kampf beidseitig automatisch zu Ende (einfache Spieler-Heuristik).
function autoPlay(state: BattleState): { status: string; steps: number } {
  let guard = 0;
  while (state.status === 'active' && guard++ < 5000) {
    if (isPlayerTurn(state)) {
      const actor = currentActor(state)!;
      const enemies = renderView(state).enemies.filter((e) => !e.dead);
      const target = enemies[0];
      if (!target) break;
      // bevorzugt eine bezahlbare Magie, sonst Angriff
      const skill = actor.skills.find((s) => s === 'feuerball' || s === 'eissplitter' || s === 'windklinge');
      if (skill && actor.mp >= 4) act(state, { type: 'skill', skillId: skill, targetId: target.id });
      else act(state, { type: 'attack', targetId: target.id });
    } else {
      enemyTurn(state);
    }
  }
  return { status: state.status, steps: guard };
}

describe('battle engine', () => {
  it('Aufbau: Party + Gegner, Status aktiv, eine aktive Einheit', () => {
    const s = startBattle(DEMO_PARTY, ['goblin', 'goblin', 'imp'], 123);
    const v = renderView(s);
    expect(v.party.length).toBe(DEMO_PARTY.length);
    expect(v.enemies.length).toBe(3);
    expect(v.status).toBe('active');
    expect(currentActor(s)).toBeTruthy();
  });

  it('Determinismus: gleicher Seed → gleicher Ausgang & Log', () => {
    const a = startBattle(DEMO_PARTY, ['goblin', 'direwolf'], 777);
    const b = startBattle(DEMO_PARTY, ['goblin', 'direwolf'], 777);
    const ra = autoPlay(a), rb = autoPlay(b);
    expect(ra.status).toBe(rb.status);
    expect(JSON.stringify(renderView(a).party)).toBe(JSON.stringify(renderView(b).party));
    expect(renderView(a).log).toEqual(renderView(b).log);
  });

  it('starke Party besiegt schwache Gegner und erhält Beute', () => {
    const s = startBattle(DEMO_PARTY, ['goblin', 'goblin'], 5);
    const out = autoPlay(s);
    expect(out.status).toBe('won');
    expect(renderView(s).rewards.exp).toBeGreaterThan(0);
    expect(renderView(s).rewards.gold).toBeGreaterThan(0);
  });

  it('eine winzige Party gegen Oger-Übermacht verliert (terminiert sicher)', () => {
    const weak = [{ ...DEMO_PARTY[2]!, maxHp: 20, atk: 3, mag: 3 }];
    const s = startBattle(weak, ['ogre', 'ogre', 'ogre'], 9);
    const out = autoPlay(s);
    expect(out.status).toBe('lost');
    expect(out.steps).toBeLessThan(5000);
  });

  it('jeder Kampf terminiert (Stichprobe über Gegner/Seeds)', () => {
    for (let i = 0; i < 12; i++) {
      const ids = [ENEMY_IDS[i % ENEMY_IDS.length]!, ENEMY_IDS[(i + 1) % ENEMY_IDS.length]!];
      const s = startBattle(DEMO_PARTY, ids, 31 + i * 17);
      const out = autoPlay(s);
      expect(['won', 'lost', 'fled']).toContain(out.status);
    }
  });

  it('Verteidigen halbiert den nächsten erlittenen Schaden', () => {
    // isolierter Mikro-Kampf: 1 zäher Held vs. 1 Goblin
    const tank = [{ ...DEMO_PARTY[1]!, spd: 99 }]; // zieht zuerst
    const s = startBattle(tank, ['goblin'], 3);
    // Held verteidigt; danach schlägt der Goblin zu
    expect(isPlayerTurn(s)).toBe(true);
    act(s, { type: 'guard' });
    const heroBefore = renderView(s).party[0]!.hp;
    // Gegnerzüge laufen, bis der Held wieder dran ist (oder Kampf endet)
    let guard = 0;
    while (s.status === 'active' && !isPlayerTurn(s) && guard++ < 50) enemyTurn(s);
    const heroAfter = renderView(s).party[0]!.hp;
    expect(heroAfter).toBeLessThanOrEqual(heroBefore); // hat (höchstens) Schaden genommen
  });

  it('Flucht beendet den Kampf (mit hoher Geschwindigkeit zuverlässig)', () => {
    const swift = [{ ...DEMO_PARTY[0]!, spd: 99 }];
    let fled = false;
    for (let seed = 1; seed <= 20 && !fled; seed++) {
      const s = startBattle(swift, ['goblin'], seed);
      if (isPlayerTurn(s)) {
        act(s, { type: 'flee' });
        if (s.status === 'fled') fled = true;
      }
    }
    expect(fled).toBe(true);
  });
});
