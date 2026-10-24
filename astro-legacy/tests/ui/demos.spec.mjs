import { test, expect } from '@playwright/test';

async function fastest(page, selector) {
  const slider = page.locator(selector);
  await slider.focus();
  await slider.press('End');
}

test('Introducere: examples and quiz remain readable without animation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/capitole/introducere');
  await expect(page.locator('.slide').first()).toBeVisible();
  await expect(page.locator('.code-block pre').first()).toBeVisible();
  expect(await page.evaluate(() => document.fonts.check('16px "Inter Variable"'))).toBe(true);
});

test('Funcții: returned sum follows the supplied parameters', async ({ page }) => {
  await page.goto('/capitole/functii');
  await fastest(page, '#fn-step-speed');
  await page.locator('#fn-d2-a').fill('8');
  await page.locator('#fn-d2-b').fill('12');
  await page.locator('#fn-d2-run').click();
  await expect(page.locator('#fn-d2-out')).toContainText('RETURNeaza 20', { timeout: 15000 });
});

test('Complexitate: bubble-sort shuffle redraws bars and reset restores input', async ({ page }) => {
  await page.goto('/capitole/complexitate');
  const bars = page.locator('#bubble-demo .sort-bar');
  await expect(bars).toHaveCount(10);
  const original = await bars.evaluateAll(nodes => nodes.map(node => node.style.height));
  await page.locator('#bubble-demo [data-action="shuffle"]').click();
  await expect.poll(() => bars.evaluateAll(nodes => nodes.map(node => node.style.height))).not.toEqual(original);
  await page.locator('#bubble-demo [data-action="reset"]').click();
  await expect.poll(() => bars.evaluateAll(nodes => nodes.map(node => node.style.height))).toEqual(original);
});

test('Recursivitate: Euclid reaches the correct base case', async ({ page }) => {
  await page.goto('/capitole/recursivitate');
  await fastest(page, '#rec-step-speed');
  await page.locator('#rec-d3-a').fill('48');
  await page.locator('#rec-d3-b').fill('18');
  await page.locator('#rec-d3-run').click();
  await expect(page.locator('#rec-d3-out')).toContainText('rezultat = 6', { timeout: 15000 });
});

test('Backtracking: maze cells toggle walls with an accessible state', async ({ page }) => {
  await page.goto('/capitole/backtracking');
  const cell = page.getByRole('button', { name: 'Celula 2, 2', exact: true });
  await expect(cell).toHaveAttribute('aria-pressed', 'false');
  await cell.click();
  await expect(cell).toHaveAttribute('aria-pressed', 'true');
  await cell.click();
  await expect(cell).toHaveAttribute('aria-pressed', 'false');
});

test('Vectori: insertion updates the vector and reset restores its six elements', async ({ page }) => {
  await page.goto('/capitole/vectori');
  await page.locator('[data-vec="ins-pos"]').fill('3');
  await page.locator('[data-vec="ins-val"]').fill('99');
  await page.locator('button[data-vec="insert"]').click();
  await expect(page.locator('#vector-demo .vec-block').nth(2)).toHaveText('99', { timeout: 15000 });
  await page.locator('button[data-vec="reset"]').click();
  await expect(page.locator('#vector-demo .vec-block').nth(2)).toHaveText('3');
});

test('Matrici: main diagonal highlights five cells and computes their sum', async ({ page }) => {
  await page.goto('/capitole/matrici');
  await page.locator('button[data-md="principala"]').click();
  const diagonal = page.locator('#mtx-diag-viz .diag-p');
  await expect(diagonal).toHaveCount(5);
  const sum = (await diagonal.allTextContents()).reduce((total, value) => total + Number(value), 0);
  await expect(page.locator('[data-md="sum"]')).toHaveText(String(sum));
});

test('Șiruri: changing tabs and letter case updates the output', async ({ page }) => {
  await page.goto('/capitole/siruri');
  await page.locator('[data-tab="case"]').click();
  await page.locator('#sd-case-in').fill('InfoLiceu 123');
  await page.locator('#sd-toupper').click();
  await expect(page.locator('#sd-case-out')).toHaveText('INFOLICEU 123');
  await page.locator('#sd-tolower').click();
  await expect(page.locator('#sd-case-out')).toHaveText('infoliceu 123');
});

test('Fișiere: processing input produces the expected sum', async ({ page }) => {
  await page.goto('/capitole/fisiere');
  await page.locator('button[data-file="sum"]').click();
  await expect(page.locator('#file-output-display')).toHaveText('31', { timeout: 15000 });
  await page.locator('button[data-file="reset"]').click();
  await expect(page.locator('#file-output-display')).toContainText('Aștept');
});

test('Programare dinamică: Fibonacci table returns 8 for n=6', async ({ page }) => {
  await page.goto('/capitole/programare-dinamica');
  await page.locator('#fib-dp-n').fill('6');
  await page.locator('#fib-dp-go').click();
  await expect(page.locator('#fib-dp-table > div').last()).toContainText('8', { timeout: 15000 });
  await expect(page.locator('#fib-dp-ops')).toHaveText('5');
});

test('Structuri: six generated records can be sorted by average', async ({ page }) => {
  await page.goto('/capitole/structuri');
  await page.locator('button[data-struct="gen"]').click();
  await expect(page.locator('#struct-table tbody tr')).toHaveCount(6);
  await page.locator('button[data-struct="sort-medie"]').click();
  await expect(page.locator('#struct-demo .anim-status')).toContainText('completă', { timeout: 20000 });
  const averages = await page.locator('#struct-table tbody tr td:nth-child(3)').allTextContents();
  expect(averages.map(Number)).toEqual(averages.map(Number).sort((a, b) => a - b));
});

test('Pointeri: creating a pointer draws memory and reset clears it', async ({ page }) => {
  await page.goto('/capitole/pointeri');
  await page.locator('button[data-ptr="var-ptr"]').click();
  await expect(page.locator('#ptr-code')).toContainText('&a', { timeout: 15000 });
  await expect(page.locator('#ptr-explanation')).toContainText('Pas 2');
  await expect(page.locator('#ptr-memory')).toContainText('0x');
  await page.locator('button[data-ptr="reset"]').click();
  await expect(page.locator('#ptr-code')).toBeEmpty();
});

test('Grafuri: graph preset renders a nonblank canvas and reset empties it', async ({ page }) => {
  await page.goto('/capitole/grafuri');
  await page.locator('#graph-preset').click();
  await expect(page.locator('#graph-start option')).toHaveCount(6);
  const coloredPixels = await page.locator('#graph-canvas').evaluate(canvas => {
    const pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
    let count = 0;
    for (let i = 0; i < pixels.length; i += 4) if (pixels[i + 3] > 0 && Math.max(pixels[i], pixels[i + 1], pixels[i + 2]) - Math.min(pixels[i], pixels[i + 1], pixels[i + 2]) > 40) count++;
    return count;
  });
  expect(coloredPixels).toBeGreaterThan(100);
  await page.locator('#graph-clear').click();
  await expect(page.locator('#graph-start option')).toHaveCount(1);
});
