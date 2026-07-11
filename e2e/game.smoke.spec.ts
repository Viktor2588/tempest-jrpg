import { expect, test, type Page } from '@playwright/test';
import { inflateSync } from 'node:zlib';
import { MENU_PARTY_LAYOUT } from '../src/systems/menuLayout';
import { layoutOverworldTouchControls } from '../src/systems/mobileLayout';

const GAME_WIDTH = 960;
const GAME_HEIGHT = 540;

/**
 * Wait a bit for the game loop to advance. Intentionally does NOT screenshot —
 * per-step canvas pixel checks (page.screenshot) drove the smoke suite into CI
 * timeouts via software-GL ReadPixels stalls (~65 settle() calls). Render is
 * still verified at key points via explicit expectCanvasContent().
 */
async function settle(page: Page, ms = 150): Promise<void> {
  await page.waitForTimeout(ms);
}

test('Title → Overworld → Menü → Battle rendert ohne Browserfehler', async ({ page }) => {
  test.setTimeout(45_000);
  const browserErrors: string[] = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text());
  });

  await page.goto('./');
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();
  await expectCanvasContent(page);

  // Frisches Browserprofil: Tutorial schließen, dann das Spiel starten.
  await clickGamePoint(page, 480, 370);
  await clickGamePoint(page, 480, 280);
  await settle(page, 400);  // allow initial scene + tutorial
  await dismissOverworldTutorial(page);
  await expectCanvasContent(page);

  // Menü-Overlay samt Resume-Pfad prüfen.
  await clickOverworldMenuButton(page);
  await settle(page, 120);
  await clickGamePoint(page, 636, 94); // Quest-/Story-Tab mit Kapitel-Summary
  await expectCanvasContent(page);
  await page.keyboard.press('Escape');
  await settle(page, 120);

  // Demo-Kampf über den echten Overworld-Shortcut starten.
  await page.keyboard.press('Enter');
  await settle(page, 450);
  expect(browserErrors).toEqual([]);
});

test('Prologstart → Sturmdrachen-Schwur setzt Storyflags im Browser', async ({ page }) => {
  const browserErrors: string[] = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text());
  });

  await page.addInitScript(() => {
    window.localStorage.setItem('tempest-settings-v1', JSON.stringify({
      masterVolume: 0,
      musicVolume: 0,
      sfxVolume: 0,
      reducedMotion: true,
      seenTutorial: true,
      difficulty: 'normal',
      textSpeed: 'sofort',
      highContrast: false,
      colorblind: 'aus'
    }));
    window.localStorage.removeItem('tempest-chronik.save.v3');
  });

  await page.goto('./');
  await expect(page.locator('canvas')).toBeVisible();
  await clickGamePoint(page, 480, 280);
  await settle(page, 400);
  await dismissOverworldTutorial(page);
  await focusGame(page);

  await tapMovementKey(page, 'ArrowUp');
  await tapMovementKey(page, 'ArrowUp');
  await page.keyboard.press('Space');
  await settle(page, 100);
  await clickGamePoint(page, 150, 398); // Schleimform ordnen
  await settle(page, 100);
  await clickGamePoint(page, 150, 398); // Schwur annehmen
  await settle(page, 100);
  await clickGamePoint(page, 150, 398); // Zur Oberfläche / Dialog schließen
  await settle(page, 100);

  const save = await page.evaluate(() => JSON.parse(window.localStorage.getItem('tempest-chronik.save.v3') ?? '{}'));
  expect(save).toHaveProperty('location');
  expect(save.location.mapId).toBe('sealed-cave');
  expect(save.flags['story.slime.awakened']).toBe(true);
  expect(save.flags['story.storm-dragon.oath']).toBe(true);
  expect(save.quests['slime-awakening'].completedStepIds).toEqual(['cave-awakening', 'storm-dragon-oath']);
  await expectCanvasContent(page);
  expect(browserErrors).toEqual([]);
});

test('Oberwelt-Onboarding markiert Bewegung, Menü und Interaktion im Browser', async ({ page }) => {
  const browserErrors: string[] = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text());
  });

  await page.addInitScript(() => {
    window.localStorage.setItem('tempest-settings-v1', JSON.stringify({
      masterVolume: 0,
      musicVolume: 0,
      sfxVolume: 0,
      reducedMotion: true,
      seenTutorial: true,
      difficulty: 'normal',
      textSpeed: 'sofort',
      highContrast: false,
      colorblind: 'aus'
    }));
    window.localStorage.removeItem('tempest-chronik.save.v3');
  });

  await page.goto('./');
  await expect(page.locator('canvas')).toBeVisible();
  await clickGamePoint(page, 480, 280);
  await settle(page, 400);
  await focusGame(page);

  await tapMovementKey(page, 'ArrowUp');
  await clickOverworldMenuButton(page);
  await settle(page, 100);
  await page.keyboard.press('Escape');
  await settle(page, 100);
  await tapMovementKey(page, 'ArrowUp');
  await page.keyboard.press('Space');
  await settle(page, 100);

  const save = await page.evaluate(() => JSON.parse(window.localStorage.getItem('tempest-chronik.save.v3') ?? '{}'));
  expect(save.flags['tutorial.overworld.move']).toBe(true);
  expect(save.flags['tutorial.overworld.menu']).toBe(true);
  expect(save.flags['tutorial.overworld.interact']).toBe(true);
  expect(save.flags['tutorial.overworld.seen']).toBe(true);
  await expectCanvasContent(page);
  expect(browserErrors).toEqual([]);
});

test('Abgeschlossener Prolog → erster Band-2-Dialog setzt Rigurd-Awakening im Browser', async ({ page }) => {
  const browserErrors: string[] = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text());
  });

  await page.addInitScript(() => {
    window.localStorage.setItem('tempest-settings-v1', JSON.stringify({
      masterVolume: 0,
      musicVolume: 0,
      sfxVolume: 0,
      reducedMotion: true,
      seenTutorial: true,
      difficulty: 'normal',
      textSpeed: 'sofort',
      highContrast: false,
      colorblind: 'aus'
    }));
    window.localStorage.setItem('tempest-chronik.save.v3', JSON.stringify({
      schemaVersion: 3,
      createdAt: '2026-06-28T00:00:00.000Z',
      updatedAt: '2026-06-28T00:00:00.000Z',
      seed: 12,
      playtimeSeconds: 0,
      location: { mapId: 'tempest-start', x: 9, y: 7, facing: 'right' },
      party: {
        active: [
          { characterId: 'rimuru' },
          { characterId: 'gobta' },
          { characterId: 'ranga' }
        ],
        reserve: [],
        gold: 220
      },
      inventory: { stacks: [{ itemId: 'wolf-fang-token', quantity: 1 }] },
      flags: {
        'story.slime.awakened': true,
        'story.storm-dragon.oath': true,
        'story.goblin.plea': true,
        'story.direwolf.defeated': true,
        'story.direwolf.pact': true,
        'story.slime-prologue.completed': true,
        'story.tempest.named': true,
        'bond.rigurd.trust-prologue': true,
        'progression.gobta.wolf-fang-token': true,
        'milestone.gobta-joins.shown': true,
        'milestone.direwolf-victory.shown': true,
        'milestone.ranga-joins.shown': true,
        'milestone.band-one-complete.shown': true,
        'scene.cave-awakening.played': true,
        'scene.direwolf-pact.played': true,
        'scene.tempest-naming.played': true,
        'scene.geld-victory.played': true,
        'tutorial.overworld.seen': true
      },
      quests: {
        'slime-awakening': {
          status: 'completed',
          completedStepIds: ['cave-awakening', 'storm-dragon-oath', 'goblin-plea', 'direwolf-pack', 'name-the-village']
        },
        'binding-of-ancestors': {
          status: 'active',
          completedStepIds: []
        }
      },
      progression: {
        evolutionIdsByCharacterId: {},
        relationshipPoints: {},
        discoveredRegionIds: [],
        skillPointsByCharacterId: {},
        unlockedSkillNodeIdsByCharacterId: {},
        enchantmentLevelsByEquipmentKey: {}
      }
    }));
  });

  await page.goto('./');
  await expect(page.locator('canvas')).toBeVisible();
  await clickGamePoint(page, 480, 280);
  await settle(page, 400);
  await focusGame(page);

  await page.keyboard.press('Space');
  await settle(page, 100);
  await clickGamePoint(page, 150, 398);
  await settle(page, 100);

  const save = await page.evaluate(() => JSON.parse(window.localStorage.getItem('tempest-chronik.save.v3') ?? '{}'));
  expect(save.flags['story.intro.seen']).toBe(true);
  expect(save.flags['bond.rigurd.act1-met']).toBe(true);
  expect(save.quests['binding-of-ancestors'].completedStepIds).toContain('awakening');
  await expectCanvasContent(page);
  expect(browserErrors).toEqual([]);
});

test('Band 2 → erster Flüsterhain-Kampf rendert im Browser', async ({ page }) => {
  const browserErrors: string[] = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text());
  });

  await installBrowserSave(page, bandTwoBrowserSave({
    location: { mapId: 'tempest-start', x: 13, y: 8, facing: 'right' },
    flags: {
      'story.intro.seen': true,
      'story.shuna.ready': true,
      'story.vael.ready': true,
      'story.gobta.ready': true,
      'story.ranga.ready': true,
      'story.lyrre.ready': true,
      'story.council.ready': true,
      'scout.whispering-grove': true,
      'scout.border-route': true,
      'scout.ambush.whispering-grove': true,
      'milestone.first-council.shown': true
    },
    quests: {
      'slime-awakening': {
        status: 'completed',
        completedStepIds: ['cave-awakening', 'storm-dragon-oath', 'goblin-plea', 'direwolf-pack', 'name-the-village']
      },
      'binding-of-ancestors': {
        status: 'active',
        completedStepIds: ['awakening', 'gather-council']
      }
    }
  }));

  await page.goto('./');
  await expect(page.locator('canvas')).toBeVisible();
  await clickGamePoint(page, 480, 280);
  await settle(page, 400);
  await focusGame(page);

  await tapMovementKey(page, 'ArrowRight');
  await settle(page, 500);

  const save = await page.evaluate(() => JSON.parse(window.localStorage.getItem('tempest-chronik.save.v3') ?? '{}'));
  expect(save.location.mapId).toBe('tempest-start');
  expect(save.location.y).toBe(8);
  expect(save.location.x).toBeGreaterThanOrEqual(14);
  expect(save.quests['binding-of-ancestors'].completedStepIds).not.toContain('clear-grove');
  await expectCanvasContent(page);
  expect(browserErrors).toEqual([]);
});

test('Band 2 → Abschlussdialog schließt binding-of-ancestors im Browser', async ({ page }) => {
  const browserErrors: string[] = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text());
  });

  await installBrowserSave(page, bandTwoBrowserSave({
    location: { mapId: 'tempest-start', x: 9, y: 7, facing: 'right' },
    inventory: { stacks: [{ itemId: 'wolf-fang-token', quantity: 1 }, { itemId: 'ancestor-seal-fragment', quantity: 1 }] },
    flags: {
      'story.intro.seen': true,
      'story.shuna.ready': true,
      'story.vael.ready': true,
      'story.gobta.ready': true,
      'story.ranga.ready': true,
      'story.lyrre.ready': true,
      'story.council.ready': true,
      'story.grove.cleared': true,
      'story.boss.echo-defeated': true,
      'scout.whispering-grove': true,
      'scout.border-route': true,
      'codex.binding-of-ancestors': true,
      'codex.ancestor-seal-warning': true,
      'codex.mordrahn': true,
      'milestone.first-council.shown': true,
      'milestone.nameless-echo-defeated.shown': true
    },
    quests: {
      'slime-awakening': {
        status: 'completed',
        completedStepIds: ['cave-awakening', 'storm-dragon-oath', 'goblin-plea', 'direwolf-pack', 'name-the-village']
      },
      'binding-of-ancestors': {
        status: 'active',
        completedStepIds: ['awakening', 'gather-council', 'clear-grove', 'defeat-mordrahn-echo']
      }
    }
  }));

  await page.goto('./');
  await expect(page.locator('canvas')).toBeVisible();
  await clickGamePoint(page, 480, 280);
  await settle(page, 400);
  await focusGame(page);

  await page.keyboard.press('Space');
  await settle(page, 100);
  await clickGamePoint(page, 150, 398);
  await settle(page, 100);

  const save = await page.evaluate(() => JSON.parse(window.localStorage.getItem('tempest-chronik.save.v3') ?? '{}'));
  expect(save.quests['binding-of-ancestors'].status).toBe('completed');
  expect(save.flags['story.act1.completed']).toBe(true);
  expect(save.inventory.stacks.some((stack: { itemId: string }) => stack.itemId === 'tempest-charm')).toBe(true);
  await expectCanvasContent(page);
  expect(browserErrors).toEqual([]);
});

test('Band-2-Abschluss zeigt ein einmaliges Kapitel-Meilenstein-Overlay', async ({ page }) => {
  const browserErrors: string[] = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text());
  });

  await installBrowserSave(page, bandTwoBrowserSave({
    flags: {
      'story.intro.seen': true,
      'story.council.ready': true,
      'story.grove.cleared': true,
      'story.boss.echo-defeated': true,
      'story.act1.completed': true
    },
    quests: {
      'slime-awakening': {
        status: 'completed',
        completedStepIds: ['cave-awakening', 'storm-dragon-oath', 'goblin-plea', 'direwolf-pack', 'name-the-village']
      },
      'binding-of-ancestors': {
        status: 'completed',
        completedStepIds: ['awakening', 'gather-council', 'clear-grove', 'defeat-mordrahn-echo', 'report-sora']
      }
    }
  }));

  await page.goto('./');
  await expect(page.locator('canvas')).toBeVisible();
  await clickGamePoint(page, 480, 280);
  await settle(page, 400);
  await expectCanvasContent(page);

  const save = await page.evaluate(() => JSON.parse(window.localStorage.getItem('tempest-chronik.save.v3') ?? '{}'));
  expect(save.flags['milestone.band-two-complete.shown']).toBe(true);
  await page.keyboard.press('Space');
  await settle(page, 100);
  await expectCanvasContent(page);
  expect(browserErrors).toEqual([]);
});

test('Ranga-Schnellreise zeigt Reisebild und optionalen Fund', async ({ page }) => {
  const browserErrors: string[] = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text());
  });

  await installBrowserSave(page, bandTwoBrowserSave({
    flags: {
      'travel.ranga.discovered.goblin-village': true,
      'travel.ranga.discovered.tempest-hollow': true
    }
  }));

  await page.goto('./');
  await expect(page.locator('canvas')).toBeVisible();
  await clickGamePoint(page, 480, 280);
  await settle(page, 400);
  await focusGame(page);
  await page.keyboard.press('m');
  await settle(page, 100);
  await clickGamePoint(page, 840, 94); // Ranga-Tab
  await clickGamePoint(page, 410, 322); // Goblindorf
  await settle(page, 400);
  await expectCanvasContent(page);
  await clickGamePoint(page, 560, 360); // optionale Kräuterspur untersuchen
  await settle(page, 250);

  const save = await page.evaluate(() => JSON.parse(window.localStorage.getItem('tempest-chronik.save.v3') ?? '{}'));
  expect(save.location.mapId).toBe('goblin-village');
  expect(save.flags['travel.ranga.discovery.herb-trail']).toBe(true);
  expect(save.inventory.stacks.some((stack: { itemId: string }) => stack.itemId === 'healing-herb')).toBe(true);
  await expectCanvasContent(page);
  expect(browserErrors).toEqual([]);
});

test('Party-Menü tauscht aktive Figur mit der Reserve', async ({ page }) => {
  const browserErrors: string[] = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text());
  });

  await installBrowserSave(page, bandTwoBrowserSave({
    party: {
      active: [
        { characterId: 'rimuru' },
        { characterId: 'gobta' },
        { characterId: 'ranga' }
      ],
      reserve: [{ characterId: 'shuna' }],
      gold: 220
    }
  }));

  await page.goto('./');
  await expect(page.locator('canvas')).toBeVisible();
  await clickGamePoint(page, 480, 280);
  await settle(page, 400);
  await focusGame(page);
  await page.keyboard.press('m');
  await settle(page, 100);
  const { active, reserve } = MENU_PARTY_LAYOUT;
  await clickGamePoint(page, active.left + active.width / 2, active.firstY + active.rowHeight);
  await clickGamePoint(page, reserve.left + reserve.width / 2, reserve.firstY);
  await settle(page, 100);

  const save = await page.evaluate(() => JSON.parse(window.localStorage.getItem('tempest-chronik.save.v3') ?? '{}'));
  expect(save.party.active.map((member: { characterId: string }) => member.characterId))
    .toEqual(['rimuru', 'shuna', 'ranga']);
  expect(save.party.reserve.map((member: { characterId: string }) => member.characterId))
    .toEqual(['gobta']);
  await expectCanvasContent(page);
  expect(browserErrors).toEqual([]);
});

test('Spec-Baum bestätigt die Strangwahl und sperrt andere Richtungen', async ({ page }) => {
  test.setTimeout(45_000);
  const browserErrors: string[] = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text());
  });
  const save = bandTwoBrowserSave({
    party: {
      active: [{ characterId: 'benimaru', level: 9 }],
      reserve: [],
      gold: 220
    }
  });
  save.progression = {
    evolutionIdsByCharacterId: {},
    relationshipPoints: {},
    discoveredRegionIds: [],
    skillPointsByCharacterId: { benimaru: 3 },
    unlockedSkillNodeIdsByCharacterId: {},
    enchantmentLevelsByEquipmentKey: {}
  };
  await installBrowserSave(page, save);
  page.on('dialog', async (dialog) => {
    expect(dialog.message()).toContain('sperrt die anderen Richtungen');
    await dialog.accept();
  });

  await page.goto('./');
  await expect(page.locator('canvas')).toBeVisible();
  await clickGamePoint(page, 480, 280);
  await settle(page, 400);
  await focusGame(page);
  await page.keyboard.press('m');
  await settle(page, 100);
  await clickGamePoint(page, 530, 94); // Talente
  await clickGamePoint(page, 398, 269); // Klingenfokus auswählen
  await clickGamePoint(page, 884, 180); // Vorschau-Aktion: freischalten
  await settle(page, 100);
  await clickGamePoint(page, 610, 269); // Flammenfokus auswählen (nun gesperrt)
  await clickGamePoint(page, 884, 180);

  const stored = await page.evaluate(() => JSON.parse(window.localStorage.getItem('tempest-chronik.save.v3') ?? '{}'));
  expect(stored.progression.unlockedSkillNodeIdsByCharacterId.benimaru).toEqual(['benimaru-blade-focus']);
  expect(stored.progression.skillPointsByCharacterId.benimaru).toBe(2);
  await expectCanvasContent(page);
  expect(browserErrors).toEqual([]);
});

test('Kijin-Kampfparty und Schmiede-NPCs laden ihre vorgesehenen Assets', async ({ page }) => {
  const browserErrors: string[] = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text());
  });

  await installBrowserSave(page, bandTwoBrowserSave({
    party: {
      active: [
        { characterId: 'benimaru' },
        { characterId: 'shion' },
        { characterId: 'souei' }
      ],
      reserve: [
        { characterId: 'hakurou' }
      ],
      gold: 220
    }
  }));

  await page.goto('./');
  await expect(page.locator('canvas')).toBeVisible();
  await clickGamePoint(page, 480, 280);
  await settle(page, 400);
  await focusGame(page);
  await page.keyboard.press('m');
  await page.waitForTimeout(300);
  await expectCanvasContent(page);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  await page.keyboard.press('Enter');
  await settle(page, 450);

  const loadedAssets = await page.evaluate(() => (
    performance.getEntriesByType('resource').map((entry) => entry.name)
  ));
  for (const hero of ['benimaru', 'shion', 'hakurou', 'souei']) {
    expect(loadedAssets.some((name) => name.includes(`party-${hero}`))).toBe(true);
    expect(loadedAssets.some((name) => name.includes(`portrait-${hero}`))).toBe(true);
  }
  for (const smith of ['kurobe', 'kaijin']) {
    expect(loadedAssets.some((name) => name.includes(`party-${smith}`))).toBe(false);
    expect(loadedAssets.some((name) => name.includes(`portrait-${smith}`))).toBe(true);
  }
  await expectCanvasContent(page);
  expect(browserErrors).toEqual([]);
});

test('Canon- und Regions-NPCs laden dedizierte Storyportraits', async ({ page }) => {
  const browserErrors: string[] = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text());
  });

  await installBrowserSave(page, bandTwoBrowserSave());
  await page.goto('./');
  await expect(page.locator('canvas')).toBeVisible();
  await clickGamePoint(page, 480, 280);
  await settle(page, 400);

  const loadedAssets = await page.evaluate(() => (
    performance.getEntriesByType('resource').map((entry) => entry.name)
  ));
  for (const file of [
    'portrait-eir',
    'portrait-kael',
    'portrait-gazel',
    'portrait-blumund-adventurers',
    'portrait-treyni',
    'portrait-milim',
    'portrait-souka'
  ]) {
    expect(loadedAssets.some((name) => name.includes(file))).toBe(true);
  }
  await expectCanvasContent(page);
  expect(browserErrors).toEqual([]);
});

test('Canon-Hauptpfad lädt dedizierte Boss-Cutouts und Arenen', async ({ page }) => {
  const browserErrors: string[] = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text());
  });

  await installBrowserSave(page, bandTwoBrowserSave());
  await page.goto('./');
  await expect(page.locator('canvas')).toBeVisible();
  await clickGamePoint(page, 480, 280);
  await settle(page, 400);

  const loadedAssets = await page.evaluate(() => (
    performance.getEntriesByType('resource').map((entry) => entry.name)
  ));
  for (const file of [
    'enemy-direwolf-alpha',
    'enemy-nameless-echo',
    'battle-whispering-grove',
    'enemy-orc-soldier',
    'enemy-orc-general',
    'enemy-orc-disaster',
    'enemy-lizardman-warrior',
    'enemy-gabiru',
    'enemy-masked-majin',
    'enemy-ifrit'
  ]) {
    expect(loadedAssets.some((name) => name.includes(file))).toBe(true);
  }
  await expectCanvasContent(page);
  expect(browserErrors).toEqual([]);
});

test('Föderations-Save reist nach Blumund und lädt neue Regionsassets', async ({ page }) => {
  const browserErrors: string[] = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text());
  });

  await installBrowserSave(page, bandTwoBrowserSave({
    location: { mapId: 'tempest-start', x: 2, y: 2, facing: 'left' },
    flags: {
      'faction.orcs.joined': true
    }
  }));

  await page.goto('./');
  await expect(page.locator('canvas')).toBeVisible();
  await clickGamePoint(page, 480, 280);
  await settle(page, 400);
  await focusGame(page);

  await tapMovementKey(page, 'ArrowLeft');
  await page.keyboard.press('Space');
  await settle(page, 400);

  const save = await page.evaluate(() => JSON.parse(window.localStorage.getItem('tempest-chronik.save.v3') ?? '{}'));
  expect(save.location.mapId).toBe('blumund');
  expect(save.location.x).toBe(2);
  expect(save.location.y).toBe(7);

  const loadedAssets = await page.evaluate(() => (
    performance.getEntriesByType('resource').map((entry) => entry.name)
  ));
  expect(loadedAssets.some((name) => name.includes('tile-blumund-floor'))).toBe(true);
  expect(loadedAssets.some((name) => name.includes('tile-blumund-wall'))).toBe(true);
  expect(loadedAssets.some((name) => name.includes('portrait-shizu'))).toBe(true);
  expect(loadedAssets.some((name) => name.includes('portrait-fuze'))).toBe(true);
  expect(loadedAssets.some((name) => name.includes('enemy-blumund-bandit'))).toBe(true);
  for (const file of [
    'tile-dwargon-floor',
    'tile-dwargon-wall',
    'tile-jura-battlefield-floor',
    'tile-jura-battlefield-wall',
    'tile-lizardman-marsh-floor',
    'tile-lizardman-marsh-wall',
    'tile-ember-hollow-floor',
    'tile-ember-hollow-wall'
  ]) {
    expect(loadedAssets.some((name) => name.includes(file))).toBe(true);
  }
  for (const file of [
    'region-dwargon',
    'region-jura-battlefield',
    'region-lizardman-marsh',
    'region-ember-hollow',
    'region-blumund'
  ]) {
    expect(loadedAssets.some((name) => name.includes(file))).toBe(true);
  }
  await expectCanvasContent(page);
  expect(browserErrors).toEqual([]);
});

test('Shizu-Schwur-Save lädt Freiheitsakademie und Schülerassets', async ({ page }) => {
  const browserErrors: string[] = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text());
  });

  await installBrowserSave(page, bandTwoBrowserSave({
    location: { mapId: 'freedom-academy', x: 2, y: 7, facing: 'right' },
    flags: {
      'story.shizu.vow': true
    }
  }));

  await page.goto('./');
  await expect(page.locator('canvas')).toBeVisible();
  await clickGamePoint(page, 480, 280);
  await settle(page, 400);

  const save = await page.evaluate(() => JSON.parse(window.localStorage.getItem('tempest-chronik.save.v3') ?? '{}'));
  expect(save.location.mapId).toBe('freedom-academy');

  const loadedAssets = await page.evaluate(() => (
    performance.getEntriesByType('resource').map((entry) => entry.name)
  ));
  expect(loadedAssets.some((name) => name.includes('region-freedom-academy'))).toBe(true);
  expect(loadedAssets.some((name) => name.includes('portrait-shizu-children'))).toBe(true);
  expect(loadedAssets.some((name) => name.includes('enemy-academy-wisp'))).toBe(true);
  await expectCanvasContent(page);
  expect(browserErrors).toEqual([]);
});

test('Kolosseum-Save lädt Arena-Region und Kampf-Hintergrund', async ({ page }) => {
  const browserErrors: string[] = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text());
  });

  await installBrowserSave(page, bandTwoBrowserSave({
    location: { mapId: 'tempest-colosseum', x: 5, y: 6, facing: 'right' },
    flags: {
      'story.kijin.named': true,
      'arena.run.active': true
    }
  }));

  await page.goto('./');
  await expect(page.locator('canvas')).toBeVisible();
  await clickGamePoint(page, 480, 280);
  await settle(page, 400);

  const save = await page.evaluate(() => JSON.parse(window.localStorage.getItem('tempest-chronik.save.v3') ?? '{}'));
  expect(save.location.mapId).toBe('tempest-colosseum');

  const loadedAssets = await page.evaluate(() => (
    performance.getEntriesByType('resource').map((entry) => entry.name)
  ));
  expect(loadedAssets.some((name) => name.includes('region-tempest-colosseum'))).toBe(true);
  expect(loadedAssets.some((name) => name.includes('battle-tempest-colosseum'))).toBe(true);
  await expectCanvasContent(page);
  expect(browserErrors).toEqual([]);
});

test('Tempest-Invasion-Save lädt den Verteidigungs-Kampfhintergrund', async ({ page }) => {
  const browserErrors: string[] = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text());
  });

  await installBrowserSave(page, bandTwoBrowserSave({
    location: { mapId: 'jura-battlefield', x: 9, y: 7, facing: 'left' },
    flags: {
      'story.geld.devoured': true,
      'story.tempest-invasion.active': true
    },
    quests: {
      'tempest-invasion': {
        status: 'active',
        completedStepIds: ['council']
      }
    }
  }));

  await page.goto('./');
  await expect(page.locator('canvas')).toBeVisible();
  await clickGamePoint(page, 480, 280);
  await settle(page, 400);

  const loadedAssets = await page.evaluate(() => (
    performance.getEntriesByType('resource').map((entry) => entry.name)
  ));
  expect(loadedAssets.some((name) => name.includes('battle-tempest-invasion'))).toBe(true);
  await expectCanvasContent(page);
  expect(browserErrors).toEqual([]);
});

test('Ramiris-Labyrinth-Save lädt Banner und Magiekoloss-Assets', async ({ page }) => {
  const browserErrors: string[] = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text());
  });

  await installBrowserSave(page, bandTwoBrowserSave({
    location: { mapId: 'ramiris-labyrinth', x: 2, y: 7, facing: 'right' },
    flags: {
      'story.shizu.vow': true,
      'story.children.first-core': true,
      'story.ramiris.met': true
    },
    quests: {
      'ramiris-labyrinth': {
        status: 'active',
        completedStepIds: ['meet-ramiris']
      }
    }
  }));

  await page.goto('./');
  await expect(page.locator('canvas')).toBeVisible();
  await clickGamePoint(page, 480, 280);
  await settle(page, 400);

  const save = await page.evaluate(() => JSON.parse(window.localStorage.getItem('tempest-chronik.save.v3') ?? '{}'));
  expect(save.location.mapId).toBe('ramiris-labyrinth');

  const loadedAssets = await page.evaluate(() => (
    performance.getEntriesByType('resource').map((entry) => entry.name)
  ));
  expect(loadedAssets.some((name) => name.includes('region-ramiris-labyrinth'))).toBe(true);
  expect(loadedAssets.some((name) => name.includes('enemy-magic-colossus'))).toBe(true);
  await expectCanvasContent(page);
  expect(browserErrors).toEqual([]);
});

test('Einrichtungen-Menü schließt Geistkern-Forschung im Browser ab', async ({ page }) => {
  // Belt-and-suspenders: settle() screenshotet nicht mehr (systemischer Fix),
  // aber dieser menu-schwere Pfad behaelt viele explizite expectCanvasContent()-
  // Screenshots; auf headless Software-GL bleibt der ReadPixels-Readback teuer.
  // 60s Budget haelt den Testgruen, ohne gruene Laeufe zu bremsen.
  test.setTimeout(60_000);
  const browserErrors: string[] = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text());
  });

  const save = bandTwoBrowserSave({
    inventory: {
      stacks: [
        { itemId: 'spirit-ember', quantity: 1 },
        { itemId: 'mana-drop', quantity: 2 }
      ]
    },
    flags: {
      'story.children.first-core': true
    }
  });
  save.progression = {
    ...(save.progression as Record<string, unknown>),
    magicules: 20
  };

  await installBrowserSave(page, save);
  await page.goto('./');
  await expect(page.locator('canvas')).toBeVisible();
  await clickGamePoint(page, 480, 280);
  await settle(page, 400);
  await focusGame(page);

  await page.keyboard.press('m');
  await settle(page, 100);
  await clickGamePoint(page, 760, 94); // Codex
  await clickGamePoint(page, 620, 155); // Einrichtungen (Codex-Modusleiste, Phase 122 neu angeordnet)
  await settle(page, 100);
  await expectCanvasContent(page);
  await clickGamePoint(page, 810, 448); // Forschen
  await settle(page, 100);

  const stored = await page.evaluate(() => JSON.parse(window.localStorage.getItem('tempest-chronik.save.v3') ?? '{}'));
  expect(stored.flags['research.spirit-cores.stabilized']).toBe(true);
  expect(stored.progression.magicules).toBe(0);
  expect(stored.inventory.stacks.some((stack: { itemId: string }) => stack.itemId === 'spirit-ember')).toBe(false);
  await expectCanvasContent(page);

  // Phase 122 — Lebendiges Bestiarium: der neue siebte Codex-Modus rendert fehlerfrei.
  await clickGamePoint(page, 892, 155); // 🐾 Bestiarium
  await settle(page, 100);
  await expectCanvasContent(page);
  expect(browserErrors).toEqual([]);
});

test('Band 3 → Nachkampf an der Sumpfgrenze deeskaliert im Browser', async ({ page }) => {
  const browserErrors: string[] = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text());
  });

  await installBrowserSave(page, bandTwoBrowserSave({
    location: { mapId: 'spirit-marsh', x: 5, y: 11, facing: 'right' },
    flags: {
      'story.act1.completed': true,
      'story.act2.started': true,
      'story.border.cleared': true,
      'milestone.band-two-complete.shown': true,
      'travel.ranga.discovered.spirit-marsh': true
    },
    quests: {
      'slime-awakening': {
        status: 'completed',
        completedStepIds: ['cave-awakening', 'storm-dragon-oath', 'goblin-plea', 'direwolf-pack', 'name-the-village']
      },
      'binding-of-ancestors': {
        status: 'completed',
        completedStepIds: ['awakening', 'gather-council', 'clear-grove', 'defeat-mordrahn-echo', 'report-sora']
      },
      'border-escalation': {
        status: 'active',
        completedStepIds: ['muster']
      }
    }
  }));

  await page.goto('./');
  await expect(page.locator('canvas')).toBeVisible();
  await clickGamePoint(page, 480, 280);
  await settle(page, 400);
  await focusGame(page);

  await clickOverworldInteractButton(page);
  await settle(page, 100);
  await clickGamePoint(page, 180, 398);
  await page.waitForTimeout(300);

  const save = await page.evaluate(() => JSON.parse(window.localStorage.getItem('tempest-chronik.save.v3') ?? '{}'));
  expect(save.location.mapId).toBe('spirit-marsh');
  expect(save.flags['story.border.deescalated']).toBe(true);
  expect(save.quests['border-escalation'].completedStepIds).toContain('border-clash');
  await expectCanvasContent(page);
  expect(browserErrors).toEqual([]);
});

for (const ending of [
  { label: 'Freiheit', flag: 'ending.freedom', choiceX: 180, choiceY: 398 },
  { label: 'Ordnung', flag: 'ending.order', choiceX: 800, choiceY: 398 },
  { label: 'Geteilte Last', flag: 'ending.true', choiceX: 180, choiceY: 462 }
] as const) {
  test(`Band 4 → Endwahl ${ending.label} persistiert im Browser`, async ({ page }) => {
    const browserErrors: string[] = [];
    page.on('pageerror', (error) => browserErrors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') browserErrors.push(message.text());
    });

    await installBrowserSave(page, bandFourDecisionBrowserSave());

    await page.goto('./');
    await expect(page.locator('canvas')).toBeVisible();
    await clickGamePoint(page, 480, 280);
    await settle(page, 400);
    await focusGame(page);

    await clickOverworldInteractButton(page);
    await settle(page, 100);
    await clickGamePoint(page, ending.choiceX, ending.choiceY);
    await page.waitForTimeout(300);

    const save = await page.evaluate(() => JSON.parse(window.localStorage.getItem('tempest-chronik.save.v3') ?? '{}'));
    expect(save.flags[ending.flag]).toBe(true);
    expect(save.flags['story.act3.completed']).toBe(true);
    expect(save.quests['ancestors-choice'].status).toBe('completed');
    expect(save.quests['ancestors-choice'].completedStepIds).toContain('choose');
    await expectCanvasContent(page);
    expect(browserErrors).toEqual([]);
  });
}

async function installBrowserSave(page: Page, save: Record<string, unknown>): Promise<void> {
  await page.addInitScript((initialSave) => {
    window.localStorage.setItem('tempest-settings-v1', JSON.stringify({
      masterVolume: 0,
      musicVolume: 0,
      sfxVolume: 0,
      reducedMotion: true,
      seenTutorial: true,
      difficulty: 'normal',
      textSpeed: 'sofort',
      highContrast: false,
      colorblind: 'aus'
    }));
    window.localStorage.setItem('tempest-chronik.save.v3', JSON.stringify(initialSave));
  }, save);
}

function bandTwoBrowserSave(overrides: {
  readonly location?: Record<string, unknown>;
  readonly flags?: Record<string, boolean>;
  readonly quests?: Record<string, unknown>;
  readonly inventory?: Record<string, unknown>;
  readonly party?: Record<string, unknown>;
} = {}): Record<string, unknown> {
  const baseFlags = {
    'story.slime.awakened': true,
    'story.storm-dragon.oath': true,
    'story.goblin.plea': true,
    'story.direwolf.defeated': true,
    'story.direwolf.pact': true,
    'story.slime-prologue.completed': true,
    'story.tempest.named': true,
    'bond.rigurd.trust-prologue': true,
    'progression.gobta.wolf-fang-token': true,
    'faction.direwolves.respected': true,
    'mount.direwolf.seed': true,
    'milestone.gobta-joins.shown': true,
    'milestone.direwolf-victory.shown': true,
    'milestone.ranga-joins.shown': true,
    'milestone.band-one-complete.shown': true,
    'scene.cave-awakening.played': true,
    'scene.direwolf-pact.played': true,
    'scene.tempest-naming.played': true,
    'scene.geld-victory.played': true,
    'tutorial.overworld.seen': true
  };
  return {
    schemaVersion: 3,
    createdAt: '2026-06-28T00:00:00.000Z',
    updatedAt: '2026-06-28T00:00:00.000Z',
    seed: 22,
    playtimeSeconds: 0,
    location: overrides.location ?? { mapId: 'tempest-start', x: 9, y: 7, facing: 'right' },
    party: overrides.party ?? {
      active: [
        { characterId: 'rimuru' },
        { characterId: 'gobta' },
        { characterId: 'ranga' }
      ],
      reserve: [],
      gold: 220
    },
    inventory: overrides.inventory ?? { stacks: [{ itemId: 'wolf-fang-token', quantity: 1 }] },
    flags: { ...baseFlags, ...(overrides.flags ?? {}) },
    quests: overrides.quests ?? {
      'slime-awakening': {
        status: 'completed',
        completedStepIds: ['cave-awakening', 'storm-dragon-oath', 'goblin-plea', 'direwolf-pack', 'name-the-village']
      },
      'binding-of-ancestors': {
        status: 'active',
        completedStepIds: []
      }
    },
    progression: {
      evolutionIdsByCharacterId: {},
      relationshipPoints: {},
      discoveredRegionIds: [],
      skillPointsByCharacterId: {},
      unlockedSkillNodeIdsByCharacterId: {},
      enchantmentLevelsByEquipmentKey: {}
    }
  };
}

function bandFourDecisionBrowserSave(): Record<string, unknown> {
  return bandTwoBrowserSave({
    location: { mapId: 'tempest-start', x: 9, y: 7, facing: 'right' },
    flags: {
      'story.act1.completed': true,
      'story.act2.completed': true,
      'story.act3.started': true,
      'bond.rigurd.founder-supplies': true,
      'story.border.deescalated': true,
      'story.vanguard.trace-read': true,
      'story.alliance.shuna-ready': true,
      'story.alliance.gobta-ready': true,
      'story.alliance.ranga-ready': true,
      'story.alliance.council-ready': true,
      'story.breach.cleared': true,
      'story.mordrahn.defeated': true,
      'codex.mordrahn-keeper': true,
      'milestone.first-council.shown': true,
      'milestone.nameless-echo-defeated.shown': true,
      'milestone.band-two-complete.shown': true,
      'travel.ranga.discovered.tempest-hollow': true,
      'travel.ranga.discovered.spirit-marsh': true
    },
    quests: {
      'slime-awakening': {
        status: 'completed',
        completedStepIds: ['cave-awakening', 'storm-dragon-oath', 'goblin-plea', 'direwolf-pack', 'name-the-village']
      },
      'binding-of-ancestors': {
        status: 'completed',
        completedStepIds: ['awakening', 'gather-council', 'clear-grove', 'defeat-mordrahn-echo', 'report-sora']
      },
      'border-escalation': {
        status: 'completed',
        completedStepIds: ['muster', 'border-clash', 'read-fracture', 'break-vanguard', 'report-act2']
      },
      'ancestors-choice': {
        status: 'active',
        completedStepIds: ['rally', 'breach', 'confront']
      }
    }
  });
}

test('Phase 90 — Speicherstände rendern, „Neues Spiel" setzt den Slot aktiv', async ({ page }) => {
  const browserErrors: string[] = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text());
  });

  await page.addInitScript(() => {
    window.localStorage.setItem('tempest-settings-v1', JSON.stringify({
      masterVolume: 0, musicVolume: 0, sfxVolume: 0, reducedMotion: true, seenTutorial: true,
      difficulty: 'normal', textSpeed: 'sofort', highContrast: false, colorblind: 'aus'
    }));
    for (const key of [
      'tempest-chronik.save.v3',
      'tempest-chronik.save.v3.slot2',
      'tempest-chronik.save.v3.slot3',
      'tempest-chronik.activeSlot'
    ]) window.localStorage.removeItem(key);
  });

  await page.goto('./');
  await expect(page.locator('canvas')).toBeVisible();
  await clickGamePoint(page, 480, 392); // Titel: „🗂 Speicherstände"
  await page.waitForTimeout(400);
  await expectCanvasContent(page); // Slot-Auswahl rendert

  // Slot 2 ist leer → „✚ Neues Spiel" (x = 160 + 640 − 170 = 630, y-Mitte der 2. Karte).
  await clickGamePoint(page, 630, 274);
  await settle(page, 400);

  const activeSlot = await page.evaluate(() => window.localStorage.getItem('tempest-chronik.activeSlot'));
  expect(activeSlot).toBe('2');
  const slot2 = await page.evaluate(() => window.localStorage.getItem('tempest-chronik.save.v3.slot2'));
  expect(slot2).not.toBeNull();
  await expectCanvasContent(page); // in der Overworld angekommen
  expect(browserErrors).toEqual([]);
});

test('Phase 84 — Verschlingen-Kompendium rendert im Codex ohne Browserfehler', async ({ page }) => {
  const browserErrors: string[] = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text());
  });
  await installBrowserSave(page, bandTwoBrowserSave());

  await page.goto('./');
  await expect(page.locator('canvas')).toBeVisible();
  await clickGamePoint(page, 480, 280);
  await settle(page, 400);
  await focusGame(page);
  await page.keyboard.press('m');
  await settle(page, 100);
  await clickGamePoint(page, 760, 94); // Codex-Tab
  await page.waitForTimeout(200);
  await expectCanvasContent(page);
  await clickGamePoint(page, 422, 140); // Umschalter „🍴 Verschlingen"
  await settle(page, 100);
  await expectCanvasContent(page);
  expect(browserErrors).toEqual([]);
});

test('Phase 93 — Einrichtungen produzieren bei der Tempest-Rast im Browser', async ({ page }) => {
  test.setTimeout(45_000);
  const browserErrors: string[] = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text());
  });
  const base = bandTwoBrowserSave();
  const save = {
    ...base,
    progression: {
      ...(base.progression as Record<string, unknown>),
      // Ein Bewohner je Rolle → jede Einrichtung ist besetzt (Wache: Wache + Späher).
      residentIds: ['kohleschuppe', 'flossreiter', 'gobkyu', 'sturmzahn', 'seidenschwinge'],
      magicules: 45
    }
  };
  await installBrowserSave(page, save);

  await page.goto('./');
  await expect(page.locator('canvas')).toBeVisible();
  await clickGamePoint(page, 480, 280);
  await settle(page, 400);
  await focusGame(page);
  await page.keyboard.press('m');
  await settle(page, 100);
  await clickGamePoint(page, 760, 94); // Codex-Tab
  await page.waitForTimeout(200);
  await clickGamePoint(page, 520, 140); // Umschalter „🏛️ Bewohner"
  await settle(page, 100);
  await clickGamePoint(page, 810, 219); // Sturmzahn zum Offizier befördern
  await settle(page, 100);
  await clickGamePoint(page, 620, 140); // Umschalter „🏭 Einrichtungen"
  await settle(page, 100);
  await expectCanvasContent(page);
  await clickGamePoint(page, 450, 508); // „🏕️ Tempest-Rast halten"
  await page.waitForTimeout(300);
  await expectCanvasContent(page);

  const stored = await page.evaluate(() =>
    JSON.parse(window.localStorage.getItem('tempest-chronik.save.v3') ?? '{}')
  );
  // Wache (Offizier Sturmzahn zählt doppelt + Seidenschwinge = 3 × Stufe 1 × 8) trägt 24 Gold bei.
  expect(stored.party.gold).toBe(244);
  expect(stored.progression.magicules).toBe(5);
  expect(stored.progression.promotedResidentIds).toEqual(['sturmzahn']);
  expect(stored.progression.productionCycles).toBe(1);
  const ore = stored.inventory.stacks.find((stack: { itemId: string }) => stack.itemId === 'magic-ore');
  expect(ore?.quantity).toBeGreaterThanOrEqual(1);
  expect(browserErrors).toEqual([]);
});

test('Phase 100 — Diplomatie-Tab rendert die Reputationsstände im Browser', async ({ page }) => {
  test.setTimeout(45_000);
  const browserErrors: string[] = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text());
  });
  await installBrowserSave(page, bandTwoBrowserSave());

  await page.goto('./');
  await expect(page.locator('canvas')).toBeVisible();
  await clickGamePoint(page, 480, 280);
  await settle(page, 400);
  await focusGame(page);
  await page.keyboard.press('m');
  await settle(page, 100);
  await clickGamePoint(page, 760, 94); // Codex-Tab
  await page.waitForTimeout(200);
  await clickGamePoint(page, 804, 140); // Umschalter „🤝 Politik"
  await settle(page, 100);
  await expectCanvasContent(page);
  expect(browserErrors).toEqual([]);
});

async function clickGamePoint(page: Page, x: number, y: number): Promise<void> {
  const box = await page.locator('canvas').boundingBox();
  if (!box) throw new Error('Game canvas not found');
  await page.mouse.click(
    box.x + (x / GAME_WIDTH) * box.width,
    box.y + (y / GAME_HEIGHT) * box.height
  );
  await page.waitForTimeout(150);
}

async function focusGame(page: Page): Promise<void> {
  await page.locator('canvas').click();
  await page.waitForTimeout(100);
}

async function clickOverworldMenuButton(page: Page): Promise<void> {
  await clickGamePoint(page, 880, 242);
}

async function clickOverworldInteractButton(page: Page): Promise<void> {
  const { interact } = layoutOverworldTouchControls({ width: GAME_WIDTH, height: GAME_HEIGHT });
  await clickGamePoint(page, interact.x, interact.y);
}

async function dismissOverworldTutorial(page: Page): Promise<void> {
  await settle(page, 100);
}

async function tapMovementKey(page: Page, key: string): Promise<void> {
  await page.keyboard.down(key);
  await page.waitForTimeout(90);
  await page.keyboard.up(key);
  await page.waitForTimeout(180);
}

async function expectCanvasContent(page: Page): Promise<void> {
  const canvas = page.locator('canvas');
  const content = await canvas.evaluate((node) => {
    const canvasNode = node as HTMLCanvasElement;
    return { width: canvasNode.width, height: canvasNode.height };
  });
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Game canvas not found');
  const screenshot = await page.screenshot({
    animations: 'disabled',
    clip: {
      x: box.x,
      y: box.y,
      width: box.width,
      height: box.height
    }
  });
  const visibleRatio = getVisiblePixelRatio(screenshot);

  expect(content.width).toBe(GAME_WIDTH);
  expect(content.height).toBe(GAME_HEIGHT);
  expect(visibleRatio).toBeGreaterThan(0.03);
}

function getVisiblePixelRatio(png: Buffer): number {
  const { width, height, data, channels } = decodePng(png);
  let visible = 0;
  for (let index = 0; index < data.length; index += channels) {
    const alpha = channels === 4 ? data[index + 3]! : 255;
    if (alpha > 5 && data[index]! + data[index + 1]! + data[index + 2]! > 18) visible++;
  }
  return visible / (width * height);
}

function decodePng(png: Buffer): { width: number; height: number; data: Uint8Array; channels: 3 | 4 } {
  const signature = '89504e470d0a1a0a';
  if (png.subarray(0, 8).toString('hex') !== signature) throw new Error('Canvas screenshot is not a PNG');

  let offset = 8;
  let width = 0;
  let height = 0;
  let channels: 3 | 4 | null = null;
  const idat: Buffer[] = [];

  while (offset < png.length) {
    const length = png.readUInt32BE(offset);
    const type = png.subarray(offset + 4, offset + 8).toString('ascii');
    const data = png.subarray(offset + 8, offset + 8 + length);
    offset += 12 + length;

    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      const bitDepth = data[8];
      const colorType = data[9];
      if (bitDepth !== 8 || (colorType !== 2 && colorType !== 6)) {
        throw new Error(`Unsupported PNG format: bitDepth=${bitDepth}, colorType=${colorType}`);
      }
      channels = colorType === 6 ? 4 : 3;
    } else if (type === 'IDAT') {
      idat.push(Buffer.from(data));
    } else if (type === 'IEND') {
      break;
    }
  }

  if (!width || !height || !channels) throw new Error('PNG metadata missing');

  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const pixels = new Uint8Array(width * height * channels);
  let rawOffset = 0;
  let outOffset = 0;
  let previous = new Uint8Array(stride);

  for (let y = 0; y < height; y++) {
    const filter = raw[rawOffset++];
    const row = new Uint8Array(raw.subarray(rawOffset, rawOffset + stride));
    rawOffset += stride;
    unfilterRow(row, previous, channels, filter);
    pixels.set(row, outOffset);
    outOffset += stride;
    previous = row;
  }

  return { width, height, data: pixels, channels };
}

function unfilterRow(row: Uint8Array, previous: Uint8Array, channels: number, filter: number): void {
  for (let index = 0; index < row.length; index++) {
    const left = index >= channels ? row[index - channels]! : 0;
    const up = previous[index] ?? 0;
    const upLeft = index >= channels ? previous[index - channels]! : 0;

    switch (filter) {
      case 0:
        break;
      case 1:
        row[index] = (row[index]! + left) & 0xff;
        break;
      case 2:
        row[index] = (row[index]! + up) & 0xff;
        break;
      case 3:
        row[index] = (row[index]! + Math.floor((left + up) / 2)) & 0xff;
        break;
      case 4:
        row[index] = (row[index]! + paeth(left, up, upLeft)) & 0xff;
        break;
      default:
        throw new Error(`Unsupported PNG filter: ${filter}`);
    }
  }
}

function paeth(left: number, up: number, upLeft: number): number {
  const estimate = left + up - upLeft;
  const leftDistance = Math.abs(estimate - left);
  const upDistance = Math.abs(estimate - up);
  const upLeftDistance = Math.abs(estimate - upLeft);
  if (leftDistance <= upDistance && leftDistance <= upLeftDistance) return left;
  if (upDistance <= upLeftDistance) return up;
  return upLeft;
}
