import { describe, expect, it } from 'vitest';
import { HEROES, SIGNATURES } from '../src/data';
import {
  act,
  createHeroBattleUnit,
  renderView,
  startBattle,
  type BattleState,
  type BattleUnitInput,
  type Combatant
} from '../src/systems/battle';

function heroUnit(characterId: string, agility: number): BattleUnitInput {
  const hero = HEROES.find((candidate) => candidate.id === characterId);
  if (!hero) throw new Error(`Unbekannter Held: ${characterId}`);
  const unit = createHeroBattleUnit(hero);
  return {
    ...unit,
    stats: { ...unit.stats, maxHp: 240, maxMp: 100, agility }
  };
}

function enemyUnit(id = 'signature-dummy'): BattleUnitInput {
  return {
    sourceId: id,
    name: 'Signatur-Dummy',
    side: 'enemy',
    level: 10,
    stats: {
      maxHp: 2000,
      maxMp: 100,
      attack: 20,
      defense: 20,
      magic: 20,
      spirit: 20,
      agility: 1
    },
    element: 'neutral',
    weaknesses: ['fire', 'wind', 'earth'],
    resistances: [],
    skillIds: ['slime-strike']
  };
}

function signatureBattle(
  characterId: string,
  allies: readonly string[] = [],
  enemyCount = 1
): {
  state: BattleState;
  actor: Combatant;
  allies: Combatant[];
  enemies: Combatant[];
} {
  const state = startBattle({
    party: [
      heroUnit(characterId, 99),
      ...allies.map((id) => heroUnit(id, 1))
    ],
    enemies: Array.from({ length: enemyCount }, (_, index) => enemyUnit(`signature-dummy-${index}`)),
    seed: 43
  });
  const actor = state.combatants.find((unit) => unit.sourceId === characterId)!;
  actor.signatureCharge = actor.signatureChargeMax;
  actor.ct = 100;
  state.activeId = actor.id;
  return {
    state,
    actor,
    allies: state.combatants.filter((unit) => unit.side === 'party' && unit.id !== actor.id),
    enemies: state.combatants.filter((unit) => unit.side === 'enemy')
  };
}

describe('Phase 43 – Signaturaktionen', () => {
  it('bindet alle elf spielbaren Kämpfer datengetrieben an', () => {
    expect(SIGNATURES.map((signature) => signature.characterId)).toEqual([
      'rimuru',
      'ranga',
      'shuna',
      'benimaru',
      'shion',
      'hakurou',
      'souei',
      'gobta',
      'rigurd',
      'kurobe',
      'kaijin'
    ]);
    expect(SIGNATURES.every((signature) =>
      HEROES.some((hero) => hero.id === signature.characterId)
    )).toBe(true);
  });

  it('Kaijin stärkt die Gruppe und setzt alle Gegner unter Break-Druck', () => {
    const { state, actor, allies, enemies } = signatureBattle('kaijin', ['rimuru'], 2);

    expect(act(state, { type: 'signature' }).ok).toBe(true);

    expect(actor.statuses.map((status) => status.id)).toEqual(
      expect.arrayContaining(['attack-up', 'defense-up'])
    );
    expect(allies[0]!.statuses.map((status) => status.id)).toEqual(
      expect.arrayContaining(['attack-up', 'defense-up'])
    );
    expect(enemies.every((enemy) => enemy.breakGauge === enemy.breakGaugeMax - 1)).toBe(true);
  });

  it('lädt die Signaturleiste über reguläre Aktionen und zeigt sie im View-Modell', () => {
    const { state, actor } = signatureBattle('rimuru');
    actor.signatureCharge = 0;

    expect(act(state, { type: 'guard' }).ok).toBe(true);

    const view = renderView(state).party.find((unit) => unit.id === actor.id)!;
    expect(view.signatureName).toBe('Weiser Horizont');
    expect(view.signatureCharge).toBe(25);
    expect(view.signatureChargeMax).toBe(100);
  });

  it('Rimuru analysiert alle Gegner und erzeugt Break-Druck', () => {
    const { state, enemies } = signatureBattle('rimuru', [], 2);

    expect(act(state, { type: 'signature' }).ok).toBe(true);

    for (const enemy of enemies) {
      expect(enemy.analysisLevel).toBe(2);
      expect(enemy.breakGauge).toBe(enemy.breakGaugeMax - 1);
    }
  });

  it('Ranga verursacht Schaden, verzögert das Ziel und erhält Tempo', () => {
    const { state, actor, enemies: [enemy] } = signatureBattle('ranga');
    enemy!.ct = 90;
    const hp = enemy!.hp;

    expect(act(state, { type: 'signature', targetId: enemy!.id }).ok).toBe(true);

    expect(enemy!.hp).toBeLessThan(hp);
    expect(enemy!.ct).toBeLessThan(90);
    expect(actor.statuses.map((status) => status.id)).toContain('haste');
  });

  it('Shuna heilt und schützt die gesamte Gruppe', () => {
    const { state, actor, allies: [ally] } = signatureBattle('shuna', ['gobta']);
    actor.hp = 80;
    ally!.hp = 60;

    expect(act(state, { type: 'signature' }).ok).toBe(true);

    expect(actor.hp).toBeGreaterThan(80);
    expect(ally!.hp).toBeGreaterThan(60);
    expect(actor.statuses.map((status) => status.id)).toEqual(
      expect.arrayContaining(['defense-up', 'magic-up'])
    );
    expect(ally!.statuses.map((status) => status.id)).toEqual(
      expect.arrayContaining(['defense-up', 'magic-up'])
    );
  });

  it('Benimaru trifft und bricht die Formation aller Gegner', () => {
    const { state, enemies } = signatureBattle('benimaru', [], 2);
    const hp = enemies.map((enemy) => enemy.hp);

    expect(act(state, { type: 'signature' }).ok).toBe(true);

    enemies.forEach((enemy, index) => {
      expect(enemy.hp).toBeLessThan(hp[index]!);
      expect(enemy.breakGauge).toBe(enemy.breakGaugeMax - 2);
    });
  });

  it('Shion erzwingt mit ihrem Einzelschlag einen Guard-Break', () => {
    const { state, enemies: [enemy] } = signatureBattle('shion');

    expect(act(state, { type: 'signature', targetId: enemy!.id }).ok).toBe(true);

    expect(enemy!.statuses.map((status) => status.id)).toContain('guard-break');
  });

  it('Hakurou nimmt eine perfekte Konterhaltung ein', () => {
    const { state, actor } = signatureBattle('hakurou');

    expect(act(state, { type: 'signature' }).ok).toBe(true);

    expect(actor.reaction).toEqual({ kind: 'counter', timing: 'perfect' });
    expect(actor.statuses.map((status) => status.id)).toContain('haste');
  });

  it('Souei vergiftet, verstummt und verzögert sein Ziel', () => {
    const { state, enemies: [enemy] } = signatureBattle('souei');
    enemy!.ct = 90;

    expect(act(state, { type: 'signature', targetId: enemy!.id }).ok).toBe(true);

    expect(enemy!.statuses.map((status) => status.id)).toEqual(
      expect.arrayContaining(['poison', 'silence'])
    );
    expect(enemy!.ct).toBeLessThan(90);
  });

  it('Gobta blendet das Ziel und springt auf der Zeitleiste vor', () => {
    const { state, actor, enemies: [enemy] } = signatureBattle('gobta');

    expect(act(state, { type: 'signature', targetId: enemy!.id }).ok).toBe(true);

    expect(enemy!.statuses.map((status) => status.id)).toContain('blind');
    expect(actor.ct).toBeGreaterThanOrEqual(70);
  });

  it('Rigurd schützt Verbündete und füllt die Team-Leiste', () => {
    const { state, actor, allies: [ally] } = signatureBattle('rigurd', ['rimuru']);
    state.teamMeter = 0;

    expect(act(state, { type: 'signature' }).ok).toBe(true);

    expect(state.teamMeter).toBe(50);
    expect(actor.statuses.map((status) => status.id)).toContain('defense-up');
    expect(ally!.statuses.map((status) => status.id)).toContain('defense-up');
  });

  it('Kurobe verstärkt Angriff und Verteidigung eines Verbündeten', () => {
    const { state, allies: [ally] } = signatureBattle('kurobe', ['rimuru']);

    expect(act(state, { type: 'signature', targetId: ally!.id }).ok).toBe(true);

    expect(ally!.statuses.map((status) => status.id)).toEqual(
      expect.arrayContaining(['attack-up', 'defense-up'])
    );
  });
});
