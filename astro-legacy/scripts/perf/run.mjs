// Full perf pipeline: analyzed build -> bundle sizes -> Lighthouse -> comparison. Usage: node scripts/perf/run.mjs [--out=reports/perf/current] [--skip-build]
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const out = process.argv.find(arg => arg.startsWith('--out='))?.slice(6) || 'reports/perf/current';
const env = { ...process.env, PERF_OUT: out, ANALYZE: '1', ANALYZE_OUT: `${out}/bundle-treemap.html` };

function step(label, args) {
  console.log(`\n▶ ${label}`);
  const result = spawnSync(process.execPath, args, { cwd: root, stdio: 'inherit', env });
  return result.status ?? 1;
}

if (!process.argv.includes('--skip-build') && step('astro build (analyze)', ['node_modules/astro/bin/astro.mjs', 'build']) !== 0) process.exit(1);
if (step('bundle size', ['scripts/perf/bundle-size.mjs']) !== 0) process.exit(1);
const lighthouse = step('lighthouse', ['scripts/perf/lighthouse.mjs']);
step('comparison', ['scripts/perf/compare.mjs', `--current=${out}`]);
process.exit(lighthouse);
