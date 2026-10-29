// Lists informatics archives on the official Ministry site (subiecte.edu.ro) that are not in known-official.json.
// Usage: node scripts/bac/check-official.mjs [--years=2026,2027] [--remember]
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';

const knownFile = new URL('./known-official.json', import.meta.url);
const yearArg = process.argv.find(arg => arg.startsWith('--years='))?.slice(8);
const now = new Date();
const years = yearArg ? yearArg.split(',').map(Number) : [now.getFullYear(), now.getFullYear() + 1];
const folders = ['Subiecte_si_bareme/', 'modeledesubiecte/probescrise/'];

const known = new Set(JSON.parse(readFileSync(knownFile, 'utf8')));
const found = [];
const unreachable = [];

for (const year of years) {
  for (const folder of folders) {
    const page = `https://subiecte.edu.ro/${year}/bacalaureat/${folder}`;
    try {
      const response = await fetch(page, { signal: AbortSignal.timeout(30000) });
      if (response.status === 404) continue;
      if (!response.ok) { unreachable.push(`${page} (${response.status})`); continue; }
      const html = await response.text();
      for (const [, href] of html.matchAll(/href="([^"]+\.(?:zip|rar|pdf))"/gi)) {
        if (/informatic/i.test(decodeURIComponent(href))) found.push(new URL(href, page).href);
      }
    } catch (error) {
      unreachable.push(`${page} (${error.cause?.code ?? error.message})`);
    }
  }
}

const fresh = [...new Set(found)].filter(url => !known.has(url));
console.log(`Arhive informatică găsite: ${found.length}, noi: ${fresh.length}`);
fresh.forEach(url => console.log('  NOU ' + url));
unreachable.forEach(page => console.log('  INACCESIBIL ' + page));

if (process.argv.includes('--remember')) {
  writeFileSync(knownFile, JSON.stringify([...known, ...fresh].sort(), null, 2) + '\n');
}
if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `count=${fresh.length}\nunreachable=${unreachable.length}\n`);
  appendFileSync(process.env.GITHUB_OUTPUT, `list<<EOF\n${fresh.map(url => `- ${url}`).join('\n')}\nEOF\n`);
}
