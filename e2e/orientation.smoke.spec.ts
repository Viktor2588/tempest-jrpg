import { expect, test } from '@playwright/test';

test('Hochkant-Handys erhalten einen lesbaren Querformat-Hinweis', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');

  await expect(page.getByRole('status')).toContainText('Bitte ins Querformat drehen');
  await expect(page.getByRole('status')).toBeVisible();
  await expect(page.locator('#game')).toBeHidden();

  await page.setViewportSize({ width: 844, height: 390 });
  await expect(page.getByRole('status')).toBeHidden();
  await expect(page.locator('canvas')).toBeVisible();
});
