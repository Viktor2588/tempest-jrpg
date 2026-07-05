import { describe, expect, it } from 'vitest';
import { GAME_DATA } from '../src/data';
import { validateGameData } from './dataValidation';
import { ENCOUNTERS, LOCATIONS, NPCS, QUESTS } from '../src/data/world';
import { JURA_FIELD, TEMPEST_CAMP, TEMPEST_CITY, TEMPEST_VILLAGE } from '../src/data/maps';
import { WALL } from '../src/systems/overworld';

describe('Game-Datenintegrität', () => {
  it('hat eindeutige IDs und gültige Referenzen im ersten Content-Set', () => {
    expect(validateGameData(GAME_DATA)).toEqual([]);
  });

  it('meldet kaputte Skill-Referenzen deterministisch', () => {
    const issues = validateGameData({
      ...GAME_DATA,
      heroes: [
        {
          ...GAME_DATA.heroes[0]!,
          initialSkillIds: ['missing-skill']
        }
      ]
    });

    expect(issues).toContainEqual({
      path: 'heroes.rimuru.initialSkillIds.missing-skill',
      message: "Unbekannter Skill 'missing-skill'."
    });
  });

  it('meldet verschlingbare Gegner ohne gültigen Aneignungs-Skill', () => {
    const enemy = GAME_DATA.enemies[0]!;
    const missing = validateGameData({
      ...GAME_DATA,
      enemies: [{ ...enemy, devourable: true, devourSkillId: undefined }, ...GAME_DATA.enemies.slice(1)]
    });
    const unknown = validateGameData({
      ...GAME_DATA,
      enemies: [{ ...enemy, devourable: true, devourSkillId: 'missing-skill' }, ...GAME_DATA.enemies.slice(1)]
    });

    expect(missing).toContainEqual({
      path: `enemies.${enemy.id}.devourSkillId`,
      message: 'Verschlingbare Gegner brauchen einen devourSkillId.'
    });
    expect(unknown).toContainEqual({
      path: `enemies.${enemy.id}.devourSkillId`,
      message: "Devour verweist auf unbekannten Skill 'missing-skill'."
    });
  });

  it('gibt jedem frühen verschlingbaren Gegner eine Fähigkeit außerhalb von Rimurus Startkern', () => {
    const rimuru = GAME_DATA.heroes.find((hero) => hero.id === 'rimuru')!;
    const startingSkills = new Set<string>(rimuru.initialSkillIds);
    const earlyDevourable = GAME_DATA.enemies.filter((enemy) =>
      enemy.level <= 7 && enemy.devourable
    );

    expect(rimuru.initialSkillIds).toEqual([
      'predator', 'great-sage', 'slime-strike', 'water-jet'
    ]);
    expect(GAME_DATA.enemies.find((enemy) => enemy.id === 'forest-slime')?.devourSkillId)
      .toBe('water-blade');
    expect(earlyDevourable.every((enemy) =>
      'devourSkillId' in enemy
      && enemy.devourSkillId !== undefined
      && !startingSkills.has(enemy.devourSkillId)
    )).toBe(true);
  });

  it('meldet Quest-Schritte ohne abschließende Dialog- oder Encounter-Quelle', () => {
    const quest = GAME_DATA.world.quests[0]!;
    const issues = validateGameData({
      ...GAME_DATA,
      world: {
        ...GAME_DATA.world,
        quests: [
          {
            ...quest,
            steps: [
              ...quest.steps,
              {
                id: 'orphan-step',
                title: 'Verwaister Schritt',
                description: 'Dieser Schritt wird absichtlich von keiner Quelle abgeschlossen.',
                locationId: 'tempest-hollow'
              }
            ]
          },
          ...GAME_DATA.world.quests.slice(1)
        ]
      }
    });

    expect(issues).toContainEqual({
      path: `world.quests.${quest.id}.steps.orphan-step.completion`,
      message: `Quest-Schritt '${quest.id}.orphan-step' hat keine Dialog- oder Encounter-Quelle, die ihn abschließt.`
    });
  });

  it('meldet Quests ohne abschließende complete-quest-Quelle', () => {
    const base = GAME_DATA.world.quests[0]!;
    const issues = validateGameData({
      ...GAME_DATA,
      world: {
        ...GAME_DATA.world,
        quests: [
          ...GAME_DATA.world.quests,
          { ...base, id: 'orphan-quest', steps: [] }
        ]
      }
    });

    expect(issues).toContainEqual({
      path: 'world.quests.orphan-quest.completion',
      message: "Quest 'orphan-quest' hat keine Dialog- oder Encounter-Quelle, die sie auf 'completed' setzt (Soft-Lock-Risiko)."
    });
  });

  // tempest-start wechselt sein Wandlayout mit dem Ausbaustand (Jura → Camp → Dorf →
  // Stadt). Feste Objekt-Positionen dürfen in KEINER Stufe in einer Wand landen, sonst
  // ist ein Zielmarker/Kampf-Trigger unerreichbar (Bug: east-route-deserter, (20,5)).
  it('platziert kein tempest-start-Objekt in einer Wand irgendeiner Ausbaustufe', () => {
    const variants = { jura: JURA_FIELD, camp: TEMPEST_CAMP, village: TEMPEST_VILLAGE, city: TEMPEST_CITY };
    const locById = new Map(LOCATIONS.map((l) => [l.id, l]));
    const wallStages = (x: number, y: number): string[] =>
      Object.entries(variants)
        .filter(([, m]) => {
          const row = m.tiles[y];
          return !row || x <= 0 || y <= 0 || x >= m.width - 1 || y >= m.height - 1 || row[x] === WALL;
        })
        .map(([name]) => name);

    const offenders: string[] = [];
    const check = (kind: string, id: string, x: number, y: number): void => {
      const walls = wallStages(x, y);
      if (walls.length > 0) offenders.push(`${kind} '${id}' @(${x},${y}) → Wand in: ${walls.join(',')}`);
    };

    for (const n of NPCS) if (n.mapId === 'tempest-start') check('npc', n.id, n.position.x, n.position.y);
    for (const e of ENCOUNTERS) if (e.mapId === 'tempest-start' && 'position' in e && e.position) check('encounter', e.id, e.position.x, e.position.y);
    for (const l of LOCATIONS) if (l.mapId === 'tempest-start') check('location', l.id, l.position.x, l.position.y);
    for (const q of QUESTS)
      for (const s of q.steps) {
        const l = s.locationId ? locById.get(s.locationId) : undefined;
        if (l && l.mapId === 'tempest-start') check('quest-ziel', `${q.id}/${s.id}`, l.position.x, l.position.y);
      }

    expect(offenders).toEqual([]);
  });
});
