const preset = process.env.LH_PRESET === 'desktop' ? 'desktop' : 'mobile';
const level = process.env.PERF_ENFORCE === '1' ? 'error' : 'warn';
const port = process.env.LH_PORT || '4331';
const origin = `http://127.0.0.1:${port}`;

const pages = [
  '/',
  '/exercitii',
  '/editor',
  '/capitole/grafuri',
  '/capitole/backtracking',
  '/variante-2009',
  '/test-exercitii',
  '/subiecte-bac',
];

module.exports = {
  pages,
  ci: {
    collect: {
      url: pages.map(path => origin + path),
      numberOfRuns: Number(process.env.LH_RUNS || 3),
      startServerCommand: `node node_modules/astro/bin/astro.mjs preview --host 127.0.0.1 --port ${port}`,
      startServerReadyPattern: String(port),
      startServerReadyTimeout: 60000,
      settings: {
        ...(preset === 'desktop' ? { preset: 'desktop' } : {}),
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        // Local preview has no HTTP/2 or CDN; GitHub Pages does.
        skipAudits: ['uses-http2', 'uses-long-cache-ttl'],
        chromeFlags: '--headless=new --no-sandbox',
      },
    },
    assert: {
      assertions: {
        'categories:performance': [level, { minScore: preset === 'desktop' ? 0.95 : 0.9, aggregationMethod: 'median-run' }],
        'categories:accessibility': [level, { minScore: 0.95, aggregationMethod: 'median-run' }],
        'largest-contentful-paint': [level, { maxNumericValue: 2500, aggregationMethod: 'median-run' }],
        'cumulative-layout-shift': [level, { maxNumericValue: 0.1, aggregationMethod: 'median-run' }],
        'total-blocking-time': [level, { maxNumericValue: 200, aggregationMethod: 'median-run' }],
        'resource-summary:script:size': [level, { maxNumericValue: 150 * 1024, aggregationMethod: 'median-run' }],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: `reports/perf/.tmp/${preset}`,
    },
  },
};
