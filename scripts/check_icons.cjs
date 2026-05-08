const fs = require('fs');

// Fix siruri - show current state
{
  const c = fs.readFileSync('src/pages/capitole/siruri.astro', 'utf-8');
  const pat = /<span class="slide-icon[^"]*">([^<]*)<\/span>/g;
  let m;
  console.log('=== siruri.astro icons ===');
  while ((m = pat.exec(c)) !== null) {
    const hex = Buffer.from(m[1], 'utf-8').toString('hex');
    console.log(`  ${JSON.stringify(m[1])} (hex:${hex})`);
  }
}

// Fix matrici - show current state
{
  const c = fs.readFileSync('src/pages/capitole/matrici.astro', 'utf-8');
  const pat = /<span class="slide-icon[^"]*">([^<]*)<\/span>/g;
  let m;
  console.log('=== matrici.astro icons ===');
  while ((m = pat.exec(c)) !== null) {
    const hex = Buffer.from(m[1], 'utf-8').toString('hex');
    console.log(`  ${JSON.stringify(m[1])} (hex:${hex})`);
  }
}
