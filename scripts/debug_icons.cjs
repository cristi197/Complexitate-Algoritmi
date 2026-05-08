const fs = require('fs');
const c = fs.readFileSync('src/pages/capitole/siruri.astro', 'utf-8');
const pat = /<span class="slide-icon (icon-\w+)"><\/span>(\r?\n\s*<h2>([^<]+)<\/h2>)/g;
let m;
while ((m = pat.exec(c)) !== null) {
  console.log('FOUND:', JSON.stringify(m[0].slice(0, 100)));
}
console.log('total remaining empty spans:');
const empty = (c.match(/<span class="slide-icon icon-\w+"><\/span>/g) || []);
console.log(empty.length, empty);
