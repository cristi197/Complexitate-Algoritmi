// Builds comparison.html and summary.md (used as PR comment) from two perf report folders.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const arg = name => process.argv.find(item => item.startsWith(`--${name}=`))?.split('=')[1];
const baselineDir = resolve(root, arg('baseline') || 'reports/perf/baseline');
const currentDir = resolve(root, arg('current') || 'reports/perf/current');

const load = (dir, file) => (existsSync(join(dir, file)) ? JSON.parse(readFileSync(join(dir, file), 'utf8')) : null);
const base = { lh: load(baselineDir, 'lighthouse-summary.json'), size: load(baselineDir, 'bundle-size.json') };
const cur = { lh: load(currentDir, 'lighthouse-summary.json'), size: load(currentDir, 'bundle-size.json') };

const budgets = {
  performance: { mobile: 90, desktop: 95, higherIsBetter: true },
  accessibility: { mobile: 95, desktop: 95, higherIsBetter: true },
  lcp: { mobile: 2500, desktop: 2500 },
  tbt: { mobile: 200, desktop: 200 },
  cls: { mobile: 0.1, desktop: 0.1 },
  scriptBytes: { mobile: 150 * 1024, desktop: 150 * 1024 },
};
const metricDefs = [
  ['performance', 'Perf', v => String(v)],
  ['accessibility', 'A11y', v => String(v)],
  ['lcp', 'LCP', v => (v / 1000).toFixed(2) + 's'],
  ['tbt', 'TBT', v => Math.round(v) + 'ms'],
  ['cls', 'CLS', v => v.toFixed(3)],
  ['scriptBytes', 'JS', v => (v / 1024).toFixed(0) + 'KB'],
];

const escape = value => String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);

function withinBudget(key, preset, value) {
  const budget = budgets[key];
  if (!budget || value == null) return true;
  return budget.higherIsBetter ? value >= budget[preset] : value <= budget[preset];
}

function cell(key, preset, now, before, format) {
  if (now == null) return { text: '—', ok: true, delta: '' };
  let delta = '';
  if (before != null && before !== now) {
    const better = budgets[key]?.higherIsBetter ? now > before : now < before;
    delta = `${better ? '▲' : '▼'} ${format(before)}`;
  }
  return { text: format(now), ok: withinBudget(key, preset, now), delta };
}

const md = ['## Raport de performanță', ''];
const htmlSections = [];

for (const preset of Object.keys(cur.lh?.presets || {})) {
  const pages = cur.lh.presets[preset];
  const header = `| Pagină | ${metricDefs.map(([, label]) => label).join(' | ')} |`;
  md.push(`### Lighthouse — ${preset}`, '', header, `|---|${metricDefs.map(() => '---:').join('|')}|`);
  const htmlRows = [];
  for (const [path, now] of Object.entries(pages)) {
    const before = base.lh?.presets?.[preset]?.[path];
    const cells = metricDefs.map(([key, , format]) => cell(key, preset, now[key], before?.[key], format));
    md.push(`| \`${path}\` | ${cells.map(c => `${c.ok ? '' : '⚠️ '}${c.text}${c.delta ? ` (${c.delta})` : ''}`).join(' | ')} |`);
    htmlRows.push(`<tr><td><a href="${escape(now.report)}">${escape(path)}</a></td>${cells.map(c =>
      `<td class="${c.ok ? 'ok' : 'bad'}">${escape(c.text)}${c.delta ? `<small>${escape(c.delta)}</small>` : ''}</td>`).join('')}</tr>`);
  }
  md.push('');
  htmlSections.push(`<h2>Lighthouse — ${escape(preset)}</h2><table><thead><tr><th>Pagină</th>${metricDefs.map(([, label]) => `<th>${label}</th>`).join('')}</tr></thead><tbody>${htmlRows.join('')}</tbody></table>`);
}

if (cur.size) {
  const kb = bytes => (bytes / 1024).toFixed(1);
  md.push('### Mărime pachete (gzip)', '', '| Pagină | JS | CSS | Total |', '|---|---:|---:|---:|');
  const rows = [];
  for (const [route, page] of Object.entries(cur.size.pages).sort((a, b) => b[1].js.gzip - a[1].js.gzip)) {
    const before = base.size?.pages?.[route];
    const diff = (now, prev) => (prev == null || prev === now ? '' : ` (${now > prev ? '+' : ''}${kb(now - prev)})`);
    md.push(`| \`${route}\` | ${page.overJsBudget ? '⚠️ ' : ''}${kb(page.js.gzip)}${diff(page.js.gzip, before?.js.gzip)} | ${kb(page.css.gzip)}${diff(page.css.gzip, before?.css.gzip)} | ${kb(page.total.gzip)}${diff(page.total.gzip, before?.total.gzip)} |`);
    rows.push(`<tr><td>${escape(route)}</td><td class="${page.overJsBudget ? 'bad' : 'ok'}">${kb(page.js.gzip)}${escape(diff(page.js.gzip, before?.js.gzip))}</td><td>${kb(page.css.gzip)}${escape(diff(page.css.gzip, before?.css.gzip))}</td><td>${kb(page.total.gzip)}${escape(diff(page.total.gzip, before?.total.gzip))}</td></tr>`);
  }
  md.push('');
  htmlSections.push(`<h2>Mărime pachete (KB, gzip)</h2><table><thead><tr><th>Pagină</th><th>JS</th><th>CSS</th><th>Total</th></tr></thead><tbody>${rows.join('')}</tbody></table>`);
}

md.push(base.lh || base.size
  ? '▲/▼ = mai bine/mai rău față de baseline (valoarea din paranteză e baseline-ul). ⚠️ = peste buget.'
  : 'Nu există baseline în `reports/perf/baseline/`; sunt afișate doar valorile curente. ⚠️ = peste buget.');

const html = `<!doctype html><html lang="ro"><head><meta charset="utf-8"><title>Comparație performanță</title>
<style>body{font:14px/1.5 system-ui,sans-serif;margin:2rem;color:#1b2b28}table{border-collapse:collapse;margin-bottom:2rem}
th,td{border:1px solid #d5dfdc;padding:.35rem .6rem;text-align:right}th:first-child,td:first-child{text-align:left}
td.ok{background:#e8f6f1}td.bad{background:#fdecea}small{display:block;color:#5b6b68}</style></head>
<body><h1>Comparație performanță</h1><p>Baseline: ${escape(base.lh?.generatedAt || base.size?.generatedAt || 'lipsă')} · Curent: ${escape(cur.lh?.generatedAt || cur.size?.generatedAt || 'lipsă')}</p>
${htmlSections.join('\n')}</body></html>`;

writeFileSync(join(currentDir, 'comparison.html'), html);
writeFileSync(join(currentDir, 'summary.md'), md.join('\n') + '\n');
console.log(md.join('\n'));
