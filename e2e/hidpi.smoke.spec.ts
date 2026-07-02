import { expect, test, type Page } from '@playwright/test';

test('HiDPI-Canvas behält 960×540-Layout mit begrenztem scharfem Backing Store', async ({ page }) => {
  const browserErrors: string[] = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text());
  });

  await page.goto('./');
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();

  const metrics = await canvas.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      backingWidth: element.width,
      backingHeight: element.height,
      cssWidth: rect.width,
      cssHeight: rect.height,
      logicalWidth: Number(element.dataset.logicalWidth),
      logicalHeight: Number(element.dataset.logicalHeight),
      renderScale: Number(element.dataset.renderScale),
      devicePixelRatio: window.devicePixelRatio
    };
  });
  const expectedScale = Math.min(metrics.devicePixelRatio, 2);

  expect(metrics.logicalWidth).toBe(960);
  expect(metrics.logicalHeight).toBe(540);
  expect(metrics.renderScale).toBe(expectedScale);
  expect(metrics.backingWidth).toBe(960 * expectedScale);
  expect(metrics.backingHeight).toBe(540 * expectedScale);
  expect(metrics.backingWidth * metrics.backingHeight).toBeLessThanOrEqual(1920 * 1080);
  expect(metrics.cssWidth / metrics.cssHeight).toBeCloseTo(16 / 9, 2);

  await clickLogicalPoint(page, 480, 370);
  await clickLogicalPoint(page, 480, 280);
  await page.waitForTimeout(700);
  const screenshot = await canvas.screenshot();
  expect(screenshot.byteLength).toBeGreaterThan(10_000);
  expect(browserErrors).toEqual([]);
});

async function clickLogicalPoint(page: Page, x: number, y: number): Promise<void> {
  const canvas = page.locator('canvas');
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Game canvas not found');
  await page.mouse.click(
    box.x + (x / 960) * box.width,
    box.y + (y / 540) * box.height
  );
}
