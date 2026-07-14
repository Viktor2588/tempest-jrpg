import { expect, test } from '@playwright/test';
import { createNewSave } from '../src/systems/save';

test('Tempests Jungstadt lädt Kijin-/Dwargon-Banner und Stadtboden', async ({ page }) => {
  const browserErrors: string[] = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text());
  });

  const fresh = createNewSave();
  const save = {
    ...fresh,
    location: { mapId: 'tempest-start', x: 3, y: 5, facing: 'down' as const },
    flags: {
      ...fresh.flags,
      'story.tempest.named': true,
      'story.slime-prologue.completed': true,
      'story.council.ready': true,
      'story.kijin.named': true,
      'faction.dwargon.allied': true,
      'tutorial.overworld.seen': true
    }
  };
  await page.addInitScript((serializedSave) => {
    window.localStorage.setItem('tempest-chronik.save.v3', JSON.stringify(serializedSave));
  }, save);

  await page.goto('./');
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Game canvas not found');
  await canvas.click({ position: { x: box.width / 2, y: box.height * 280 / 540 } });
  await page.waitForTimeout(350); // reduced; stabilization via canvas checks elsewhere

  const loadedAssets = await page.evaluate(() => (
    performance.getEntriesByType('resource').map((entry) => entry.name)
  ));
  expect(loadedAssets.some((name) => name.includes('region-tempest-city'))).toBe(true);
  expect(loadedAssets.some((name) => name.includes('tile-tempest-city-floor'))).toBe(true);
  expect(browserErrors).toEqual([]);
});
