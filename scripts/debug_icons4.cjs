const fs = require('fs');
const c = fs.readFileSync('src/pages/capitole/siruri.astro', 'utf-8');
// Find all slide-icon spans with their full content
const pat = /<span class="slide-icon[^"]*">([^<]*)<\/span>/g;
let m;
while ((m = pat.exec(c)) !== null) {
  const inner = m[1];
  const hex = Buffer.from(inner, 'utf-8').toString('hex');
  console.log(`inner: ${JSON.stringify(inner)} | hex: ${hex} | len: ${inner.length}`);
}
