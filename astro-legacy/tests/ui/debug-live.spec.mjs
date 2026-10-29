import { test, expect } from '@playwright/test';

test.describe('debug-live', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Behavioural checks run once, on desktop Chromium.');
    await page.goto('/debug-live');
  });

  test('user input is never interpreted as HTML in explanations, trace table or result', async ({ page }) => {
    await page.locator('[data-algo-id="lungime-sir"]').click();
    await page.locator('#inp-s').fill('<img src=x onerror="window.__xss=1">');
    await page.locator('#start-btn').click();
    const next = page.locator('#next-btn');
    while (await next.isEnabled()) await next.click();
    await expect(page.locator('#done-card')).toBeVisible();
    expect(await page.evaluate(() => window.__xss)).toBeUndefined();
    await expect(page.locator('#tracer-exp img, #trace-table img, #done-msg img')).toHaveCount(0);
  });

  test('matrix sum uses the matrix typed by the student', async ({ page }) => {
    await page.locator('[data-algo-id="suma-matrice"]').click();
    await page.locator('#inp-n').fill('2');
    await page.locator('#inp-m').fill('2');
    await page.locator('#inp-a').fill('10 20\n30 40');
    await page.locator('#start-btn').click();
    const next = page.locator('#next-btn');
    while (await next.isEnabled()) await next.click();
    await expect(page.locator('#tracer-exp')).toContainText('100');
  });

  test('trace table rows can be activated from the keyboard', async ({ page }) => {
    await page.locator('[data-algo-id="suma-matrice"]').click();
    await page.locator('#start-btn').click();
    const row = page.locator('#t-row-2');
    await row.focus();
    await page.keyboard.press('Enter');
    await expect(row).toHaveClass(/active-row/);
  });
});
