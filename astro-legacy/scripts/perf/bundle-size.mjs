// Measures the JS/CSS/HTML each built page loads (raw, gzip, brotli), following static module imports.
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { brotliCompressSync, gzipSync } from 'node:zlib';

const root = resolve(import.meta.dirname, '../..');
const dist = join(root, 'dist');
const outDir = resolve(root, process.env.PERF_OUT || 'reports/perf/current');
const jsBudget = 150 * 1024;

if (!existsSync(dist)) {
  console.error('dist/ not found — run `npm run build` first.');
  process.exit(1);
}

const sizeCache = new Map();
function sizes(buffer) {
  return { raw: buffer.length, gzip: gzipSync(buffer, { level: 9 }).length, brotli: brotliCompressSync(buffer).length };
}
function fileSizes(file) {
  if (!sizeCache.has(file)) sizeCache.set(file, sizes(readFileSync(file)));
  return sizeCache.get(file);
}

function htmlFiles(dir) {
  return readdirSync(dir).flatMap(name => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return htmlFiles(full);
    return name.endsWith('.html') ? [full] : [];
  });
}

function toFile(url, fromFile) {
  if (/^(https?:)?\/\//.test(url) || url.startsWith('data:')) return null;
  const clean = url.split(/[?#]/)[0];
  const file = clean.startsWith('/') ? join(dist, clean) : resolve(dirname(fromFile), clean);
  return existsSync(file) && statSync(file).isFile() ? file : null;
}

function moduleGraph(entry, seen) {
  if (seen.has(entry)) return;
  seen.add(entry);
  const source = readFileSync(entry, 'utf8');
  const imports = /(?:import|export)\s*(?:[^'"()]*?from\s*)?["']([^"']+\.m?js)["']|import\(\s*["']([^"']+\.m?js)["']\s*\)/g;
  for (const match of source.matchAll(imports)) {
    const file = toFile(match[1] || match[2], entry);
    if (file) moduleGraph(file, seen);
  }
}

function sum(list) {
  return list.reduce((acc, item) => ({ raw: acc.raw + item.raw, gzip: acc.gzip + item.gzip, brotli: acc.brotli + item.brotli }), { raw: 0, gzip: 0, brotli: 0 });
}

const pages = {};
for (const file of htmlFiles(dist).sort()) {
  const html = readFileSync(file, 'utf8');
  const route = '/' + relative(dist, file).replace(/\\/g, '/').replace(/(^|\/)index\.html$/, '').replace(/\.html$/, '');
  const scripts = new Set();
  const styles = new Set();
  const inline = { js: [], css: [] };
  const external = [];

  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const src = match[1].match(/\bsrc=["']([^"']+)["']/i)?.[1];
    if (/type=["']application\/(ld\+)?json["']/i.test(match[1])) continue;
    if (!src) { if (match[2].trim()) inline.js.push(sizes(Buffer.from(match[2]))); continue; }
    const target = toFile(src, file);
    if (target) moduleGraph(target, scripts); else external.push(src);
  }
  for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
    const tag = match[0];
    const href = tag.match(/\bhref=["']([^"']+)["']/i)?.[1];
    if (!href) continue;
    const target = toFile(href, file);
    if (/rel=["']stylesheet["']/i.test(tag)) { if (target) styles.add(target); else external.push(href); }
    else if (/rel=["']modulepreload["']/i.test(tag) && target) moduleGraph(target, scripts);
  }
  for (const match of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) inline.css.push(sizes(Buffer.from(match[1])));

  const js = sum([...[...scripts].map(fileSizes), ...inline.js]);
  const css = sum([...[...styles].map(fileSizes), ...inline.css]);
  const doc = sizes(Buffer.from(html));
  pages[route] = {
    js, css, html: doc,
    total: sum([js, css, doc]),
    files: {
      js: [...scripts].map(item => '/' + relative(dist, item).replace(/\\/g, '/')),
      css: [...styles].map(item => '/' + relative(dist, item).replace(/\\/g, '/')),
      inlineScripts: inline.js.length,
      inlineStyles: inline.css.length,
      external,
    },
    overJsBudget: js.gzip > jsBudget,
  };
}

const kb = bytes => (bytes / 1024).toFixed(1);
const rows = Object.entries(pages).sort((a, b) => b[1].total.gzip - a[1].total.gzip).map(([route, page]) =>
  `| \`${route}\` | ${kb(page.js.gzip)}${page.overJsBudget ? ' ⚠️' : ''} | ${kb(page.css.gzip)} | ${kb(page.html.gzip)} | ${kb(page.total.gzip)} | ${page.files.inlineScripts} | ${page.files.external.length} |`);
const markdown = [
  '| Pagină | JS gz (KB) | CSS gz (KB) | HTML gz (KB) | Total gz (KB) | Scripturi inline | Resurse externe |',
  '|---|---:|---:|---:|---:|---:|---:|',
  ...rows,
  '',
  `⚠️ = JS peste bugetul de ${kb(jsBudget)} KB gzip.`,
].join('\n');

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'bundle-size.json'), JSON.stringify({ generatedAt: new Date().toISOString(), jsBudget, pages }, null, 2));
writeFileSync(join(outDir, 'bundle-size.md'), markdown + '\n');
console.log(markdown);
