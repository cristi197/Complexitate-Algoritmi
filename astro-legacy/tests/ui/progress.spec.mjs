import { test, expect } from '@playwright/test';

test('XP has a single source of truth and legacy section XP is merged once', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Storage logic is browser-independent.');
  await page.addInitScript(() => {
    if (sessionStorage.getItem('seeded')) return;
    sessionStorage.setItem('seeded', '1');
    localStorage.setItem('infoLiceu_v2', JSON.stringify({ xp: 20, visited: {}, quizScores: {} }));
    localStorage.setItem('infoXP', '15');
  });
  await page.goto('/capitole/vectori');

  const stored = () => page.evaluate(() => JSON.parse(localStorage.getItem('infoLiceu_v2')).xp);
  await expect.poll(stored).toBeGreaterThanOrEqual(45);
  expect(await page.evaluate(() => localStorage.getItem('infoXP'))).toBeNull();
  await expect.poll(async () => Number(await page.locator('#xp-value').textContent())).toBe(await stored());

  await page.reload();
  const afterReload = await stored();
  expect(afterReload).toBeGreaterThanOrEqual(45);
  await expect.poll(async () => Number(await page.locator('#xp-value').textContent())).toBe(await stored());
});
