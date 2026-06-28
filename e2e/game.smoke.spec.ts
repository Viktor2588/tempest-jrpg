import { expect, test, type Page } from '@playwright/test';
import { inflateSync } from 'node:zlib';

const GAME_WIDTH = 960;
const GAME_HEIGHT = 540;

test('Title → Overworld → Menü → Battle rendert ohne Browserfehler', async ({ page }) => {
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
  await page.waitForTimeout(700);
  await expectCanvasContent(page);

  // Menü-Overlay samt Resume-Pfad prüfen.
  await page.keyboard.press('m');
  await page.waitForTimeout(250);
  await expectCanvasContent(page);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(250);

  // Demo-Kampf über den echten Overworld-Shortcut starten.
  await page.keyboard.press('Enter');
  await page.waitForTimeout(900);
  await expectCanvasContent(page);
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
  await page.waitForTimeout(700);
  await focusGame(page);

  await tapMovementKey(page, 'ArrowUp');
  await tapMovementKey(page, 'ArrowUp');
  await page.keyboard.press('Space');
  await page.waitForTimeout(250);
  await clickGamePoint(page, 150, 398); // Schleimform ordnen
  await page.waitForTimeout(250);
  await clickGamePoint(page, 150, 398); // Schwur annehmen
  await page.waitForTimeout(250);
  await clickGamePoint(page, 150, 398); // Zur Oberfläche / Dialog schließen
  await page.waitForTimeout(250);

  const save = await page.evaluate(() => JSON.parse(window.localStorage.getItem('tempest-chronik.save.v3') ?? '{}'));
  expect(save).toHaveProperty('location');
  expect(save.location.mapId).toBe('sealed-cave');
  expect(save.flags['story.slime.awakened']).toBe(true);
  expect(save.flags['story.storm-dragon.oath']).toBe(true);
  expect(save.quests['slime-awakening'].completedStepIds).toEqual(['cave-awakening', 'storm-dragon-oath']);
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
      location: { mapId: 'tempest-start', x: 3, y: 4, facing: 'left' },
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
        'progression.gobta.wolf-fang-token': true
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
  await page.waitForTimeout(700);
  await focusGame(page);

  await page.keyboard.press('Space');
  await page.waitForTimeout(250);
  await clickGamePoint(page, 150, 398);
  await page.waitForTimeout(250);

  const save = await page.evaluate(() => JSON.parse(window.localStorage.getItem('tempest-chronik.save.v3') ?? '{}'));
  expect(save.flags['story.intro.seen']).toBe(true);
  expect(save.flags['bond.rigurd.act1-met']).toBe(true);
  expect(save.quests['binding-of-ancestors'].completedStepIds).toContain('awakening');
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
  const screenshot = await canvas.screenshot();
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
