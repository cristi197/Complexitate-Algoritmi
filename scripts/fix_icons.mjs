import { readFileSync, writeFileSync } from 'fs';

const file = 'src/pages/capitole/siruri.astro';
const content = readFileSync(file, 'utf-8');
const lines = content.split('\n');

const result = lines.map((line, i) => {
  if (!line.includes('slide-icon') || !line.includes('></span>')) return line;
  // peek at next few lines for the h2
  for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
    const h = lines[j].trim();
    if (!h.startsWith('<h2>')) continue;
    if ((h.includes('char') || h.includes('string')) && line.includes('icon-red'))   return line.replace('></span>', '>🔤</span>');
    if (h.includes('Func') && line.includes('icon-purple'))   return line.replace('></span>', '>🔣</span>');
    if (h.includes('Metode') && line.includes('icon-teal'))   return line.replace('></span>', '>📜</span>');
    if (h.includes('Algoritmi') && line.includes('icon-teal'))return line.replace('></span>', '>⚙️</span>');
    if (h.includes('Conversii') && line.includes('icon-purple'))return line.replace('></span>', '>🔄</span>');
    if (h.includes('Demo') && line.includes('icon-red'))      return line.replace('></span>', '>🎬</span>');
    if (h.includes('Exerci') && line.includes('icon-purple')) return line.replace('></span>', '>💪</span>');
    if (h.includes('BAC') && line.includes('icon-orange'))    return line.replace('></span>', '>📝</span>');
    break;
  }
  return line;
});

writeFileSync(file, result.join('\n'), 'utf-8');
console.log('Icons fixed!');
