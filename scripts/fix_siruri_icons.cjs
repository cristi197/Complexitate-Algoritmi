const fs = require('fs');
let c = fs.readFileSync('src/pages/capitole/siruri.astro', 'utf-8');

const emptyIcon = /<span class="slide-icon (icon-\w+)"><\/span>(\r?\n\s*<h2>([^<]+)<\/h2>)/g;
c = c.replace(emptyIcon, (match, cls, rest, heading) => {
  const h = heading.trim();
  let emoji = '📌';
  if (h.includes('char') || h.toLowerCase().includes('string')) emoji = '🔤';
  else if (h.includes('Func') || h.includes('func'))  emoji = '🔣';
  else if (h.includes('Metode'))   emoji = '📜';
  else if (h.includes('Algoritmi'))emoji = '⚙️';
  else if (h.includes('Conversii'))emoji = '🔄';
  else if (h.includes('Demo'))     emoji = '🎬';
  else if (h.includes('Exerci'))   emoji = '💪';
  else if (h.includes('BAC') || h.includes('Probleme')) emoji = '📝';
  return `<span class="slide-icon ${cls}">${emoji}</span>${rest}`;
});

fs.writeFileSync('src/pages/capitole/siruri.astro', c, 'utf-8');
console.log('Done');
