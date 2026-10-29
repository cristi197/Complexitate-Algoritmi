import { test, expect } from '@playwright/test';

const pages = [
  '/', '/exercitii', '/editor', '/subiecte-bac', '/variante-2009', '/test-exercitii', '/examen-alb', '/streak',
  '/cheat-sheet', '/greseli-bac', '/debug-live', '/analiza-bac',
  '/capitole/introducere', '/capitole/complexitate', '/capitole/recursivitate', '/capitole/backtracking',
  '/capitole/vectori', '/capitole/matrici', '/capitole/siruri', '/capitole/fisiere', '/capitole/functii',
  '/capitole/pointeri', '/capitole/programare-dinamica', '/capitole/structuri', '/capitole/grafuri',
];

// Finds absolutely positioned decorations (::before/::after or icon children) that cover their container's text.
function findOverlaps() {
  const visible = el => {
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return s.visibility !== 'hidden' && s.display !== 'none' && r.width > 0 && r.height > 0;
  };
  const textRects = el => {
    const rects = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (!node.textContent.trim()) continue;
      const parent = node.parentElement;
      if (!parent || getComputedStyle(parent).position === 'absolute') continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      rects.push(...[...range.getClientRects()].filter(r => r.width > 1 && r.height > 1));
      if (rects.length > 40) break;
    }
    return rects;
  };
  const hit = (a, b) => a.left < b.right - 2 && b.left < a.right - 2 && a.top < b.bottom - 2 && b.top < a.bottom - 2;
  const label = el => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.classList.length ? '.' + [...el.classList].slice(0, 2).join('.') : '');
  const issues = [];

  for (const el of document.querySelectorAll('main *, .chapter-hero *, body > div *')) {
    if (!visible(el)) continue;
    for (const pseudo of ['::before', '::after']) {
      const s = getComputedStyle(el, pseudo);
      if (s.position !== 'absolute' || !s.content || s.content === 'none' || s.content === '""' || s.content === "''") continue;
      const box = el.getBoundingClientRect();
      const width = parseFloat(s.width) || parseFloat(s.fontSize);
      const height = parseFloat(s.height) || parseFloat(s.fontSize);
      if (!(width > 4 && height > 4)) continue;
      const left = box.left + (parseFloat(s.left) || 0);
      const top = box.top + (parseFloat(s.top) || 0);
      const rect = { left, top, right: left + width, bottom: top + height };
      if (textRects(el).some(r => hit(rect, r))) issues.push(`${label(el)}${pseudo} ${JSON.stringify(s.content).slice(0, 12)}`);
    }
  }
  for (const icon of document.querySelectorAll('main svg, main .icon, main [class*="icon"]')) {
    if (!visible(icon) || getComputedStyle(icon).position !== 'absolute') continue;
    const container = icon.parentElement;
    const rect = icon.getBoundingClientRect();
    if (container && textRects(container).some(r => hit(rect, r))) issues.push(`${label(icon)} in ${label(container)}`);
  }
  return [...new Set(issues)];
}

for (const route of pages) {
  test(`overlap ${route}: decorative icons never cover text`, async ({ page }, testInfo) => {
    test.skip(!['desktop', 'mobile'].includes(testInfo.project.name), 'Layout check runs on desktop and mobile Chromium.');
    await page.goto(route, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(findOverlaps)).toEqual([]);
  });
}
