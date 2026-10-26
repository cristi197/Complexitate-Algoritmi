import { test, expect } from '@playwright/test';
import { existsSync, readFileSync, readdirSync } from 'node:fs';

// CRAWL_STRICT=0 records issues as annotations instead of failing (baseline mode).
const strict = process.env.CRAWL_STRICT !== '0';
const dist = new URL('../../dist/', import.meta.url);

// Pages deliberately excluded from the sitemap (noindex) but still published.
const unlisted = ['/test-exercitii'];

function routes() {
  const sitemap = new URL('sitemap-0.xml', dist);
  if (existsSync(sitemap)) {
    const paths = [...readFileSync(sitemap, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)]
      .map(match => new URL(match[1]).pathname.replace(/\.html$/, '').replace(/\/index$/, '/'));
    return [...new Set(['/', ...paths, ...unlisted, '/404'])];
  }
  const pages = readdirSync(new URL('../../pages/', import.meta.url), { recursive: true })
    .map(String).filter(file => file.endsWith('.astro'))
    .map(file => '/' + file.replace(/\\/g, '/').replace(/\.astro$/, '').replace(/(^|\/)index$/, ''));
  return [...new Set(pages)];
}

function report(testInfo, issues) {
  const list = Object.entries(issues).filter(([, items]) => items.length);
  if (!list.length) return;
  testInfo.annotations.push(...list.map(([type, items]) => ({ type: 'crawl:' + type, description: items.join('\n') })));
  if (strict) expect(Object.fromEntries(list)).toEqual({});
}

const allRoutes = routes();

for (const route of allRoutes) {
  test(`crawl ${route}: no console errors, failed requests or broken images`, async ({ page, baseURL }, testInfo) => {
    const origin = new URL(baseURL).origin;
    const issues = { consoleErrors: [], pageErrors: [], failedRequests: [], externalFailures: [], brokenImages: [] };
    page.on('console', msg => {
      if (msg.type() !== 'error') return;
      if (route === '/404' && msg.text().includes('404')) return;
      issues.consoleErrors.push(msg.text().slice(0, 300));
    });
    page.on('pageerror', error => issues.pageErrors.push(error.message.slice(0, 300)));
    page.on('requestfailed', request => {
      const bucket = request.url().startsWith(origin) ? issues.failedRequests : issues.externalFailures;
      bucket.push(`${request.failure()?.errorText ?? 'failed'} ${request.url()}`);
    });
    page.on('response', response => {
      if (response.status() >= 400 && response.url().startsWith(origin) && !response.url().endsWith('/404')) {
        issues.failedRequests.push(`${response.status()} ${response.url()}`);
      }
    });

    const response = await page.goto(route, { waitUntil: 'load' });
    if (route !== '/404') expect(response?.status(), `HTTP status for ${route}`).toBeLessThan(400);
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

    issues.brokenImages = await page.$$eval('img', images => images
      .filter(img => img.complete && img.naturalWidth === 0 && !img.loading?.includes('lazy'))
      .map(img => img.currentSrc || img.src));
    issues.missingSkipTarget = await page.$$eval('a.skip-link[href^="#"]', links => links
      .filter(link => !document.getElementById(link.hash.slice(1))).map(link => link.hash));

    // External CDN hiccups are reported but never fail the build.
    if (issues.externalFailures.length) {
      testInfo.annotations.push({ type: 'crawl:externalFailures', description: issues.externalFailures.join('\n') });
    }
    delete issues.externalFailures;
    report(testInfo, issues);
  });
}

test('crawl: every internal link resolves', async ({ page, request, baseURL }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Link check runs once, on desktop Chromium.');
  test.setTimeout(180000);
  const origin = new URL(baseURL).origin;
  const links = new Map();
  for (const route of allRoutes) {
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    const hrefs = await page.$$eval('a[href]', anchors => anchors.map(a => a.href));
    // Social preview images point at the production origin; resolve them against the local build.
    const meta = await page.$$eval('meta[property="og:image"], meta[name="twitter:image"]', tags => tags.map(tag => tag.content));
    for (const content of meta) {
      const local = new URL(new URL(content).pathname, origin).href;
      if (!links.has(local)) links.set(local, route + ' (og:image)');
    }
    for (const href of hrefs) {
      const url = new URL(href);
      if (url.origin !== origin) continue;
      url.hash = '';
      if (!links.has(url.href)) links.set(url.href, route);
    }
  }
  const broken = [];
  for (const [href, from] of links) {
    const response = await request.get(href, { maxRedirects: 5 });
    if (response.status() >= 400) broken.push(`${response.status()} ${href} (din ${from})`);
  }
  report(testInfo, { brokenLinks: broken });
});

test('crawl: unlisted pages are noindex and absent from the sitemap', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Runs once.');
  const sitemap = readFileSync(new URL('sitemap-0.xml', dist), 'utf8');
  for (const route of unlisted) {
    expect(sitemap).not.toContain(route);
    await page.goto(route);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  }
});
