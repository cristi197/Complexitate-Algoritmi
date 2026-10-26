import { test, expect } from '@playwright/test';

const pages = [
  '/',
  '/capitole/vectori',
  '/capitole/grafuri',
  '/capitole/backtracking',
  '/exercitii',
  '/editor',
  '/subiecte-bac',
  '/examen-alb',
  '/streak',
  '/cheat-sheet',
];

test.describe('visual regression', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(!['desktop', 'mobile', 'dark'].includes(testInfo.project.name), 'Visual baselines are Chromium-only.');
    await page.clock.setFixedTime(new Date('2026-01-15T10:00:00'));
  });

  for (const route of pages) {
    test(`visual ${route}`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'load' });
      await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
      await page.evaluate(() => document.fonts.ready);
      const name = (route === '/' ? 'index' : route.slice(1).replace(/\//g, '__')) + '.png';
      await expect(page).toHaveScreenshot(name, {
        fullPage: false,
        mask: [page.locator('iframe'), page.locator('[data-visual-mask]')],
      });
    });
  }
});
