import { test, expect } from '@playwright/test';

const questions = [
  { q: 'Ce afișează?<br><code>vector<int> v; cout &lt;&lt; v.size();</code>', opts: ['0', '1', '2', '3'], ans: 0, exp: 'Un <code>vector<int></code> gol are zero elemente.' },
  { q: 'Alege prima variantă.', opts: ['Corect', 'B', 'C', 'D'], ans: 0, exp: 'Prima variantă este corectă.' },
  { q: 'Alege a doua variantă.', opts: ['A', 'Corect', 'C', 'D'], ans: 1, exp: 'A doua variantă este corectă.' },
];

async function openQuiz(page, data = questions) {
  await page.addInitScript(() => { Math.random = () => 0.999; });
  await page.route('**/data/exercises/vectori.json', route => route.fulfill({ json: data }));
  await page.goto('/capitole/vectori');
  await page.getByRole('link', { name: 'Testează-te', exact: true }).click();
  await expect(page.locator('.quiz-q')).toBeVisible();
}

test('quiz preserves formatted C++ and treats unapproved HTML as text', async ({ page }) => {
  await openQuiz(page, [{ ...questions[0], q: questions[0].q + '<img src=x onerror="alert(1)">' }]);
  await expect(page.locator('.quiz-q code')).toHaveText('vector<int> v; cout << v.size();');
  await expect(page.locator('.quiz-q br')).toHaveCount(1);
  await expect(page.locator('.quiz-q img')).toHaveCount(0);
  await expect(page.locator('.quiz-q')).toContainText('<img');
  await page.locator('.quiz-opt').first().click();
  await expect(page.locator('.quiz-exp code')).toHaveText('vector<int>');
});

test('quiz skip, score and retry retain keyboard focus and honest totals', async ({ page }) => {
  await openQuiz(page);
  await page.getByRole('button', { name: /Sări/ }).click();
  await expect(page.locator('.quiz-q')).toContainText('Alege prima');
  await expect(page.locator('.quiz-q')).toBeFocused();
  await page.locator('.quiz-opt').first().click();
  await page.getByRole('button', { name: /Următoarea/ }).click();
  await page.locator('.quiz-opt').first().click();
  await page.getByRole('button', { name: /Vezi scorul/ }).click();
  await expect(page.locator('.qf-score')).toHaveText('1 / 2');
  await expect(page.locator('.qf-pct')).toHaveText('50%');
  await expect(page.locator('.quiz-finish')).toBeFocused();
  await page.getByRole('button', { name: /Încearcă din nou/ }).click();
  await expect(page.locator('.quiz-q')).toBeFocused();
  await expect(page.locator('.quiz-opt:enabled')).toHaveCount(4);
});
