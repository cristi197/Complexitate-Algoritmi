// Runs Lighthouse CI for mobile + desktop, keeps the median run per page and writes summary.json.
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, isAbsolute, join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const outDir = resolve(root, process.env.PERF_OUT || 'reports/perf/current');
const presets = (process.env.LH_PRESETS || 'mobile,desktop').split(',');
const lhci = join(root, 'node_modules/@lhci/cli/src/cli.js');

function run(args, env) {
  const result = spawnSync(process.execPath, [lhci, ...args, '--config=./lighthouserc.cjs'], {
    cwd: root, stdio: 'inherit', env: { ...process.env, ...env },
  });
  return result.status ?? 1;
}

function slug(url) {
  const path = new URL(url).pathname.replace(/^\/|\/$/g, '');
  return path ? path.replace(/\//g, '__') : 'index';
}

function metrics(lhr) {
  const audit = id => lhr.audits[id]?.numericValue ?? null;
  const score = id => lhr.categories[id] ? Math.round(lhr.categories[id].score * 100) : null;
  const scripts = lhr.audits['resource-summary']?.details?.items?.find(item => item.resourceType === 'script');
  return {
    performance: score('performance'),
    accessibility: score('accessibility'),
    bestPractices: score('best-practices'),
    seo: score('seo'),
    fcp: audit('first-contentful-paint'),
    lcp: audit('largest-contentful-paint'),
    tbt: audit('total-blocking-time'),
    cls: audit('cumulative-layout-shift'),
    speedIndex: audit('speed-index'),
    scriptBytes: scripts?.transferSize ?? null,
    failedAccessibility: (lhr.categories.accessibility?.auditRefs || [])
      .filter(ref => ref.weight > 0 && lhr.audits[ref.id]?.score === 0).map(ref => ref.id),
  };
}

let failed = 0;
const summary = { generatedAt: new Date().toISOString(), presets: {} };

for (const preset of presets) {
  const tmp = resolve(root, 'reports/perf/.tmp', preset);
  rmSync(tmp, { recursive: true, force: true });
  const env = { LH_PRESET: preset };
  if (run(['collect'], env) !== 0) { failed = 1; continue; }
  run(['upload'], env);
  failed |= run(['assert'], env) !== 0 ? 1 : 0;

  const manifest = JSON.parse(readFileSync(join(tmp, 'manifest.json'), 'utf8'));
  const target = join(outDir, 'lighthouse', preset);
  rmSync(target, { recursive: true, force: true });
  mkdirSync(target, { recursive: true });
  summary.presets[preset] = {};

  for (const entry of manifest.filter(item => item.isRepresentativeRun)) {
    const locate = file => (isAbsolute(file) && existsSync(file) ? file : join(tmp, basename(file)));
    const lhr = JSON.parse(readFileSync(locate(entry.jsonPath), 'utf8'));
    const name = slug(entry.url);
    cpSync(locate(entry.htmlPath), join(target, name + '.html'));
    summary.presets[preset][new URL(entry.url).pathname] = { report: `lighthouse/${preset}/${name}.html`, ...metrics(lhr) };
  }
}

rmSync(resolve(root, 'reports/perf/.tmp'), { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'lighthouse-summary.json'), JSON.stringify(summary, null, 2));
console.log(`Lighthouse summary written to ${join(outDir, 'lighthouse-summary.json')}`);
process.exit(failed);
