const fs = require('fs');
const c = fs.readFileSync('src/pages/capitole/siruri.astro', 'utf-8');
// Find index of first empty span
const idx = c.indexOf('<span class="slide-icon icon-red"></span>');
console.log('idx:', idx);
// Show surrounding bytes
const slice = c.slice(idx - 5, idx + 60);
console.log('hex bytes:', Buffer.from(slice, 'utf-8').toString('hex'));
console.log('text:', JSON.stringify(slice));
