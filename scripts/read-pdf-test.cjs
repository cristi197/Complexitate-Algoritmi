const fs = require('fs');
const path = require('path');

async function readPdf(filePath) {
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const data = new Uint8Array(fs.readFileSync(filePath));
  const doc = await pdfjsLib.getDocument({ data }).promise;
  let fullText = '';
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map(item => item.str).join(' ');
    fullText += `\n--- PAGE ${i} ---\n` + pageText;
  }
  return fullText;
}

readPdf('public/subiecte-bac/2024/2024-sesiunea-iunie-iulie-subiect.pdf')
  .then(text => {
    console.log('=== TEXT EXTRACTED ===');
    console.log(text.substring(0, 5000));
  })
  .catch(err => console.error(err));
