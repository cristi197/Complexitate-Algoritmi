const fs = require('fs');
let c = fs.readFileSync('src/pages/capitole/siruri.astro', 'utf-8');

// Replace PUA chars inside slide-icon spans based on adjacent h2 heading
const pat = /(<span class="slide-icon (icon-\w+)">)[^\x00-\x7F\u00A0-\uD7FF\uF900-\uFFFD]*(<\/span>)([\s\S]{0,100}?<h2>([^<]+)<\/h2>)/g;

c = c.replace(pat, (match, spanOpen, cls, spanClose, rest, heading) => {
  const h = heading.trim();
  let emoji = '📌';
  if (h.includes('char') || h.toLowerCase().includes('string')) emoji = '🔤';
  else if (h.includes('Func') || h.includes('func'))  emoji = '🔣';
  else if (h.includes('Metode'))    emoji = '📜';
  else if (h.includes('Algoritmi')) emoji = '⚙️';
  else if (h.includes('Conversii')) emoji = '🔄';
  else if (h.includes('Demo'))      emoji = '🎬';
  else if (h.includes('Exerci'))    emoji = '💪';
  else if (h.includes('BAC') || h.includes('Probleme')) emoji = '📝';
  return `${spanOpen}${emoji}${spanClose}${rest}`;
});

fs.writeFileSync('src/pages/capitole/siruri.astro', c, 'utf-8');

// Verify
const pat2 = /<span class="slide-icon[^"]*">([^<]*)<\/span>/g;
let m;
while ((m = pat2.exec(c)) !== null) {
  const hex = Buffer.from(m[1], 'utf-8').toString('hex');
  console.log(`content: ${JSON.stringify(m[1])} hex:${hex}`);
}
