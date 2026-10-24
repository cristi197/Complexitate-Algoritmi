import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readdirSync } from 'node:fs';

const chapters = readdirSync(new URL('../../pages/capitole/', import.meta.url))
  .filter(file => file.endsWith('.astro')).map(file => file.replace('.astro', ''));

async function expectNoOverflow(page) {
  const overflow = await page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    return { width, content: document.documentElement.scrollWidth };
  });
  expect(overflow.content, JSON.stringify(overflow)).toBeLessThanOrEqual(overflow.width + 1);
}

for (const chapter of chapters) {
  test(chapter + ': reading, section links, quiz and responsive layout', async ({ page }, testInfo) => {
    const errors = [];
    const missing = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => {
      if (response.url().startsWith('http://127.0.0.1:4330/') && response.status() >= 400) missing.push(response.url());
    });
    const response = await page.goto('/capitole/' + chapter);
    expect(response.status()).toBe(200);
    await expect(page.locator('main h1')).toBeVisible();
    await expect(page.locator('main .slide').first()).toBeVisible();
    await expect(page.locator('#sidebar .sidebar-link.active')).toHaveCount(1);
    const missingAnchors = await page.locator('.chapter-outline a').evaluateAll(links =>
      links.filter(link => !document.getElementById(link.hash.slice(1))).map(link => link.hash));
    expect(missingAnchors).toEqual([]);
    const duplicateIds = await page.evaluate(() => {
      const ids = Array.from(document.querySelectorAll('[id]'), node => node.id);
      return ids.filter((id, index) => ids.indexOf(id) !== index);
    });
    expect(duplicateIds).toEqual([]);
    await expectNoOverflow(page);
    await page.screenshot({ path: testInfo.outputPath(chapter + '.png') });
    await page.getByRole('link', { name: 'Testează-te', exact: true }).click();
    await expect(page.locator('.quiz-section .quiz-q')).toBeVisible();
    await expect(page.locator('.quiz-opt')).toHaveCount(4);
    const firstQuestion = await page.locator('.quiz-q').innerText();
    await page.locator('.quiz-opt').first().click();
    await expect(page.locator('.quiz-exp')).toBeVisible();
    await expect(page.locator('.quiz-exp')).toBeFocused();
    await page.getByRole('button', { name: /Următoarea/ }).click();
    await expect(page.locator('.quiz-q')).not.toHaveText(firstQuestion);
    await expect(page.locator('.quiz-q')).toBeFocused();
    await expectNoOverflow(page);
    expect(missing).toEqual([]);
    expect(errors).toEqual([]);
  });

  test(chapter + ': accessibility of chapter controls', async ({ page }) => {
    await page.goto('/capitole/' + chapter);
    await expect(page.locator('.quiz-q')).toBeAttached();
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    const violations = results.violations.filter(item => ['critical', 'serious'].includes(item.impact))
      .map(item => ({ id: item.id, impact: item.impact, nodes: item.nodes.map(node => ({ target: node.target, summary: node.failureSummary })) }));
    expect(violations).toEqual([]);
  });
}

test('all chapters fit a narrow 320-pixel viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 760 });
  for (const chapter of chapters) {
    await page.goto('/capitole/' + chapter);
    await page.evaluate(() => document.fonts.ready);
    await expectNoOverflow(page);
  }
});

test('catalogue filters all thirteen chapters and has an empty state', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.catalog-card:visible')).toHaveCount(13);
  await page.getByRole('button', { name: 'Algoritmi', exact: true }).click();
  await expect(page.locator('.catalog-card:visible')).toHaveCount(4);
  await page.getByRole('button', { name: 'Toate', exact: true }).click();
  await page.getByLabel('Caută un capitol', { exact: true }).fill('siruri');
  await expect(page.locator('.catalog-card:visible')).toHaveCount(1);
  await page.getByLabel('Caută un capitol', { exact: true }).fill('xyznoresults');
  await expect(page.locator('#catalog-empty')).toBeVisible();
  await page.getByLabel('Caută un capitol', { exact: true }).fill('');
  await expect(page.locator('.catalog-card:visible')).toHaveCount(13);
  await expectNoOverflow(page);
});

test('search supports diacritics, empty results, keyboard selection and focus return', async ({ page }) => {
  await page.goto('/capitole/vectori');
  const trigger = page.getByRole('button', { name: 'Caută capitole și instrumente', exact: true });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Caută capitol', exact: true });
  const input = dialog.getByRole('searchbox');
  await expect(input).toBeFocused();
  await input.fill('siruri');
  await expect(dialog.locator('#searchResults a')).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await input.fill('xyznoresults');
  await expect(dialog).toContainText('Niciun rezultat');
  await input.press('ArrowDown');
  await input.fill('grafuri');
  await input.press('ArrowDown');
  await input.press('Enter');
  await expect(page).toHaveURL(/capitole\/grafuri/);
});

test('theme preference survives navigation', async ({ page }) => {
  await page.goto('/');
  const before = await page.locator('html').getAttribute('data-theme');
  await page.getByRole('button', { name: 'Comută tema' }).click();
  const after = before === 'dark' ? 'light' : 'dark';
  await expect(page.locator('html')).toHaveAttribute('data-theme', after);
  await page.goto('/capitole/vectori');
  await expect(page.locator('html')).toHaveAttribute('data-theme', after);
});

test('mobile menu closes with Escape and traps keyboard focus', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile');
  await page.goto('/capitole/vectori');
  const toggle = page.getByRole('button', { name: 'Deschide meniul' });
  await toggle.click();
  await expect(page.locator('#sidebar')).toHaveClass(/open/);
  await expect(page.locator('#sidebar .active')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('#sidebar a').filter({ hasText: 'Matrici' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toBeFocused();
  await expect(page.locator('main')).not.toHaveAttribute('inert');
});

test('quiz shows a retry action after a data error', async ({ page }) => {
  await page.route('**/data/exercises/vectori.json', route => route.fulfill({ status: 503, body: 'Unavailable' }));
  await page.goto('/capitole/vectori');
  await page.getByRole('link', { name: 'Testează-te', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('nu au putut fi încărcate');
  await page.unroute('**/data/exercises/vectori.json');
  await page.getByRole('button', { name: 'Reîncearcă', exact: true }).click();
  await expect(page.locator('.quiz-q')).toBeVisible();
});

test('code copy controls stay outside the copied text', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/capitole/vectori');
  const code = page.locator('.code-block pre').first();
  const text = (await code.textContent()).trim();
  await page.getByRole('button', { name: 'Copiază codul', exact: true }).first().click();
  await expect.poll(async () => (await page.evaluate(() => navigator.clipboard.readText())).replace(/\r\n/g, '\n')).toBe(text);
});
