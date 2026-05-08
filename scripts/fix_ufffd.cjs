const fs = require('fs');
let c = fs.readFileSync('src/pages/capitole/siruri.astro', 'utf-8');

// Replace replacement characters (U+FFFD = \uFFFD) in slide-icon spans
// with correct emoji based on adjacent h2 heading
const pat = /<span class="slide-icon (icon-\w+)">\uFFFD<\/span>([\s\S]{0,200}?<h2>([^<]+)<\/h2>)/g;

c = c.replace(pat, (match, cls, rest, heading) => {
  const h = heading.trim();
  let emoji = '📌';
  if (h.includes('Metode'))      emoji = '\u{1F4DC}'; // 📜
  else if (h.includes('Citir'))  emoji = '\u{1F4E5}'; // 📥
  return `<span class="slide-icon ${cls}">${emoji}</span>${rest}`;
});

fs.writeFileSync('src/pages/capitole/siruri.astro', c, 'utf-8');
console.log('Fixed!');

// Verify
const pat2 = /<span class="slide-icon[^"]*">([^<]*)<\/span>/g;
let m;
while ((m = pat2.exec(c)) !== null) {
  const hex = Buffer.from(m[1], 'utf-8').toString('hex');
  console.log(`  ${JSON.stringify(m[1])} hex:${hex}`);
}
