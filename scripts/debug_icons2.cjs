const fs = require('fs');
const c = fs.readFileSync('src/pages/capitole/siruri.astro', 'utf-8');
// Find all slide-icon spans
const pat = /<span class="slide-icon[^"]*">[^<]*<\/span>/g;
let m;
while ((m = pat.exec(c)) !== null) {
  console.log(JSON.stringify(m[0]));
}
