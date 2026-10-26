import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const pages = [
  '/', '/exercitii', '/editor', '/subiecte-bac', '/variante-2009', '/test-exercitii',
  '/examen-alb', '/streak', '/cheat-sheet', '/greseli-bac', '/debug-live', '/analiza-bac', '/404',
];

for (const route of pages) {
  test(`a11y ${route}: no serious or critical WCAG 2.1 AA violations`, async ({ page }, testInfo) => {
    test.skip(!['desktop', 'dark', 'mobile'].includes(testInfo.project.name), 'axe runs on the Chromium projects.');
    await page.goto(route, { waitUntil: 'load' });
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .exclude('iframe')
      .analyze();
    const violations = results.violations.filter(item => ['critical', 'serious'].includes(item.impact))
      .map(item => ({ id: item.id, nodes: item.nodes.slice(0, 5).map(node => node.target.join(' ')) }));
    expect(violations).toEqual([]);
  });
}
