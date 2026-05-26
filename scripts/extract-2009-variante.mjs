/**
 * extract-2009-variante.mjs  — versiunea finală
 * Extrage toate cele 100 variante BAC 2009 din PDF și generează JSON-uri structurate.
 * 3 pagini per variantă (S1, S2, S3), total 300 pagini.
 *
 * Run: node scripts/extract-2009-variante.mjs
 */

import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';
import path from 'path';

const PDF_PATH = './public/subiecte-bac/2009/variante-2009-subiect.pdf';
const OUT_DIR  = './public/data/variante-2009';

// ─── Text extraction ─────────────────────────────────────────────────────────

/** Extrage textul unei pagini folosind coordonate X/Y pentru a evita spații false */
async function getPageText(doc, pageNum) {
  const page    = await doc.getPage(pageNum);
  const content = await page.getTextContent();
  const items   = content.items.filter(it => it.str !== '');

  let text = '';
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (i === 0) { text += item.str; continue; }

    const prev     = items[i - 1];
    const prevY    = Math.round(prev.transform[5]);
    const curY     = Math.round(item.transform[5]);
    const prevEnd  = prev.transform[4] + (prev.width || 0);
    const curStart = item.transform[4];
    const gap      = curStart - prevEnd;

    if (Math.abs(curY - prevY) > 3) {
      if (!text.endsWith(' ')) text += ' ';
    } else if (gap > 2) {
      if (!text.endsWith(' ')) text += ' ';
    }
    text += item.str;
  }

  return text
    .replace(/\s+/g, ' ')
    .replace(/ţ/g, 'ț').replace(/Ţ/g, 'Ț')
    .replace(/ş/g, 'ș').replace(/Ş/g, 'Ș')
    .trim();
}

// ─── Text helpers ────────────────────────────────────────────────────────────

function clean(s) {
  return (s || '').replace(/\s+/g, ' ').replace(/ţ/g,'ț').replace(/Ţ/g,'Ț').replace(/ş/g,'ș').replace(/Ş/g,'Ș').trim();
}

/**
 * Sare header-ul paginii: găsim primul "1. X" la word boundary
 * (\b1\.\s+\S nu se potrivește cu "001 " sau "itemul 1," din header)
 */
function extractContent(text) {
  const idx = text.search(/\b1\.\s+\S/);
  return idx !== -1 ? text.slice(idx) : text;
}

/**
 * Separă blocul de grile de blocul de probleme scrise.
 * Separatorul: "Scrieți pe foaia de examen răspunsul pentru fiecare..."
 */
function splitBlocks(text) {
  const idx = text.search(/Scrieți pe foaia de examen răspunsul pentru fiecare/i);
  if (idx === -1) return { grileBlock: text, writtenBlock: '' };
  return {
    grileBlock:  text.slice(0, idx),
    writtenBlock: text.slice(idx),
  };
}

// ─── Grile parser ─────────────────────────────────────────────────────────────

/**
 * Parsează toate grilele dintr-un bloc de text.
 * Strategia: split pe "(4p.)" — fiecare grila are exact un "(4p.)" care îi marchează punctajul.
 * - Textul ÎNAINTE de "(4p.)_i" = întrebare grila_i (+ eventuale opțiuni ale grila_{i-1})
 * - Textul DUPĂ "(4p.)_i" până la "(4p.)_{i+1}" (sau EOF) = expresie opțională + opțiuni a-d
 */
function parseGrileBlock(block) {
  const grile = [];
  const segments = block.split(/\s*\(4p\.?\)\s*/);
  const numGrile = segments.length - 1;
  if (numGrile === 0) return grile;

  for (let i = 0; i < numGrile; i++) {
    // ── Extrage textul întrebării ──────────────────────────────────────────
    let qSection = segments[i].trim();
    let qText = '';

    if (i === 0) {
      qText = clean(qSection.replace(/^\d+\.\s+/, ''));
    } else {
      // Grile ulterioare: qSection conține opțiunile grilei anterioare + textul noii întrebări
      const dIdx = qSection.search(/\bd\.\s+/);
      if (dIdx !== -1) {
        const afterD = qSection.slice(dIdx + 3);
        const qStartIdx = afterD.search(/\s+[\u0041-\u005A\u00C0-\u024F]/);
        if (qStartIdx !== -1) {
          qText = clean(afterD.slice(qStartIdx));
        }
      }
    }

    // ── Extrage expresia opțională și opțiunile a-d ───────────────────────
    const optSection = (segments[i + 1] || '').trim();
    if (!optSection) continue;

    const aIdx = optSection.search(/\ba\.\s+/);
    if (aIdx === -1) continue;

    const expr = clean(optSection.slice(0, aIdx));
    const optText = optSection.slice(aIdx);

    const om = optText.match(
      /^a\.\s+(.+?)\s+b\.\s+(.+?)\s+c\.\s+(.+?)\s+d\.\s+(.+?)(?:\s+[\u0041-\u005A\u00C0-\u024F][\s\S]*)?$/s
    );
    if (!om) continue;

    const text = expr.length > 0 ? `${qText} ${expr}` : qText;
    grile.push({
      nr: i + 1,
      text,
      options: { a: clean(om[1]), b: clean(om[2]), c: clean(om[3]), d: clean(om[4]) },
      points: 4,
      correctAnswer: null,
    });
  }
  return grile;
}

// ─── Written problem helpers ─────────────────────────────────────────────────

/** Extrage sub-întrebările a), b), c), d) dintr-un bloc */
function parseSubQuestions(block) {
  const subQ = [];
  const re = /([abcd])\)\s+([\s\S]+?)(?=\s+[abcd]\)\s+|\s*$)/g;
  let m;
  while ((m = re.exec(block)) !== null) {
    const ptsM = m[2].match(/\(\s*(\d+)\s*p\.?\s*\)/);
    // Remove pseudocode block that bleeds into the sub-question text
    // (appears as structural chars like Å or ┌)
    let rawText = m[2];
    const structInText = rawText.search(/[\u00C5\u2190\u250C]/);
    if (structInText !== -1) {
      // Walk backwards to find 'cite' that starts the pseudocode
      let pcStart = structInText;
      for (let i = structInText - 1; i >= 0; i--) {
        if (rawText[i] === 'c' && rawText[i+1] === 'i' && rawText[i+2] === 't' && rawText[i+3] === 'e') {
          pcStart = i; break;
        }
      }
      rawText = rawText.slice(0, pcStart);
    }
    // Remove trailing 'Varianta N' noise in sub-question d
    rawText = rawText.replace(/\s*Varianta\s+\d+\s*$/i, '');
    subQ.push({
      id: m[1],
      text: clean(rawText.replace(/\(\s*\d+\s*p\.?\s*\)/g, '').trim()),
      points: ptsM ? parseInt(ptsM[1]) : null,
    });
  }
  return subQ;
}

/**
 * Extrage blocul de pseudocod din item2Text.
 * Strategia:
 *   REVERSE: algoritmul vine înaintea sub-întrebărilor (primul marker structural
 *     apare înaintea primului marker de punctaj)
 *     → luăm textul de la început până la prima sub-întrebare "[abcd]) "
 *   NORMAL: sub-întrebările vin înaintea algoritmului
 *     → găsim ultimul (Np.) după care urmează markeri structurali (Å/←/┌)
 */
function extractPseudocode(text) {
  const firstStructIdx = text.search(/[\u00C5\u2190\u250C]/);
  if (firstStructIdx === -1) return '';

  const firstPtsM = text.match(/\(\s*\d+\s*p\.?\s*\)/);
  const firstPtsIdx = firstPtsM ? text.indexOf(firstPtsM[0]) : Infinity;

  if (firstStructIdx < firstPtsIdx) {
    // REVERSE case: algorithm precedes sub-questions
    const subQIdx = text.search(/\s[abcd]\)\s+[A-ZȘȚĂÂÎ]/);
    const endIdx = subQIdx !== -1 ? subQIdx : text.length;
    return clean(text.slice(0, endIdx));
  }

  // NORMAL case: iterate (Np.) markers from last to first;
  // the pseudocode starts after the last marker whose following text contains
  // structural chars (Å/←/┌)
  const ptsRe = /\(\s*\d+\s*p\.?\s*\)/g;
  const markers = [];
  let m;
  while ((m = ptsRe.exec(text)) !== null) markers.push(m.index + m[0].length);

  for (let i = markers.length - 1; i >= 0; i--) {
    const candidate = text.slice(markers[i]).trimStart();
    // Skip if candidate starts with a sub-question marker (not actual pseudocode)
    if (/^[abcd]\)\s+/i.test(candidate)) continue;
    if (candidate.search(/[\u00C5\u2190\u250C]/) !== -1) {
      // Remove trailing sub-question text (e.g. 'c) Dacă', 'd) Scrieți')
      const trailIdx = candidate.search(/\s[abcd]\)\s+[A-ZȘșȚțĂăÂâÎî\u0218\u021a\u0102\u00c2\u00ce]/);
      const result = trailIdx !== -1 ? candidate.slice(0, trailIdx) : candidate;
      return clean(result.trim());
    }
  }

  // Fallback: walk backwards from first structural char for 'cite'
  let startIdx = -1;
  for (let i = firstStructIdx; i >= 0; i--) {
    if (text[i] === 'c' && text[i+1] === 'i' && text[i+2] === 't' && text[i+3] === 'e') {
      startIdx = i; break;
    }
  }
  return startIdx !== -1 ? clean(text.slice(startIdx)) : '';
}

// ─── Parsare Subiect I ────────────────────────────────────────────────────────

function parseS1(rawText) {
  const text = extractContent(rawText);
  const { grileBlock, writtenBlock } = splitBlocks(text);

  const grile = parseGrileBlock(grileBlock);

  // Item 2: pseudocod
  const item2Start = writtenBlock.search(/\b2\.\s/);
  const item2Text  = item2Start !== -1 ? writtenBlock.slice(item2Start) : writtenBlock;

  const pseudocode   = extractPseudocode(item2Text);
  const subQuestions = parseSubQuestions(item2Text);
  const introPart    = item2Text.split(/\s+a\)\s+/)[0].replace(/^2\.\s*/, '');

  return {
    points: 30,
    grile,
    pseudocode: {
      nr: 2,
      type: 'pseudocode',
      intro: clean(introPart),
      pseudocode,
      subQuestions,
    },
  };
}

// ─── Parsare Subiect II ───────────────────────────────────────────────────────

function parseS2(rawText) {
  const text = extractContent(rawText);
  const { grileBlock, writtenBlock } = splitBlocks(text);

  const grile = parseGrileBlock(grileBlock);

  // Items 3, 4, 5
  const probleme = [];
  const itemRe = /\b([3-5])\.\s+([\s\S]+?)(?=\s+[3-5]\.\s+|\s*$)/g;
  let m;
  while ((m = itemRe.exec(writtenBlock)) !== null) {
    const nr  = parseInt(m[1]);
    const txt = m[2];
    const pts = txt.match(/\(\s*(\d+)\s*p\.?\s*\)/)?.[1];
    probleme.push({
      nr,
      type: nr === 5 ? 'program' : 'written',
      text: clean(txt),
      points: pts ? parseInt(pts) : (nr === 5 ? 10 : 6),
    });
  }

  return { points: 30, grile, probleme };
}

// ─── Parsare Subiect III ──────────────────────────────────────────────────────

function parseS3(rawText) {
  const text = extractContent(rawText);
  const { grileBlock, writtenBlock } = splitBlocks(text);

  const grile = parseGrileBlock(grileBlock);

  const item2Idx = writtenBlock.search(/\b2\.\s/);
  const item3Idx = writtenBlock.search(/\b3\.\s/);
  const item4Idx = writtenBlock.search(/\b4\.\s/);

  const preamble2 = item2Idx > 0 ? clean(writtenBlock.slice(0, item2Idx)) : '';
  const item2Text = item2Idx !== -1
    ? clean(writtenBlock.slice(item2Idx, item3Idx !== -1 ? item3Idx : undefined))
    : '';
  const item3Text = item3Idx !== -1
    ? clean(writtenBlock.slice(item3Idx, item4Idx !== -1 ? item4Idx : undefined))
    : '';
  const item4Text = item4Idx !== -1
    ? clean(writtenBlock.slice(item4Idx))
    : '';

  const subprogram_recursiv = (item2Text || preamble2) ? {
    nr: 2,
    type: 'recursivitate',
    intro: preamble2,
    code: item2Text.replace(/^2\.\s*/, ''),
    points: 6,
  } : null;

  const fisier = item3Text ? {
    nr: 3,
    type: 'fisier',
    text: item3Text.replace(/^3\.\s*/, ''),
    points: 10,
  } : null;

  const sub4text = item4Text.replace(/^4\.\s*/, '');
  const sub4 = item4Text ? {
    nr: 4,
    type: 'subprogram',
    intro: clean(sub4text.split(/\s+a\)\s+/)[0]),
    subQuestions: parseSubQuestions(sub4text),
    points: 10,
  } : null;

  return {
    points: 30,
    grile,
    subprogram_recursiv,
    fisiere: fisier ? [fisier] : [],
    subprograme: sub4 ? [sub4] : [],
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Se citește PDF-ul...');
  const data = new Uint8Array(fs.readFileSync(PDF_PATH));
  const doc  = await pdfjsLib.getDocument({ data }).promise;
  const numPages = doc.numPages;
  console.log(`Total pagini: ${numPages}`);

  console.log('Se extrage textul...');
  const pages = [];
  for (let i = 1; i <= numPages; i++) {
    if (i % 60 === 0) console.log(`  Pagina ${i}/${numPages}`);
    pages.push(await getPageText(doc, i));
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const index = [];
  const numVariants = Math.floor(numPages / 3);

  console.log(`Se parsează ${numVariants} variante...`);
  const stats = { grile_s1: 0, grile_s2: 0, grile_s3: 0, prob_s2: 0 };

  for (let v = 1; v <= numVariants; v++) {
    const s1Raw = pages[(v - 1) * 3];
    const s2Raw = pages[(v - 1) * 3 + 1];
    const s3Raw = pages[(v - 1) * 3 + 2];

    const variantId   = `2009-varianta-${String(v).padStart(3, '0')}`;
    const variantData = {
      id: variantId,
      year: 2009,
      variant: v,
      type: 'varianta',
      language: 'C/C++',
      pdfUrl: '/subiecte-bac/2009/variante-2009-subiect.pdf',
      pdfPage: (v - 1) * 3 + 1,
      subiectI:   parseS1(s1Raw),
      subiectII:  parseS2(s2Raw),
      subiectIII: parseS3(s3Raw),
    };

    stats.grile_s1 += variantData.subiectI.grile.length;
    stats.grile_s2 += variantData.subiectII.grile.length;
    stats.grile_s3 += variantData.subiectIII.grile.length;
    stats.prob_s2  += variantData.subiectII.probleme.length;

    fs.writeFileSync(
      path.join(OUT_DIR, `${variantId}.json`),
      JSON.stringify(variantData, null, 2),
      'utf8'
    );
    index.push({ id: variantId, year: 2009, variant: v, type: 'varianta',
      pdfUrl: '/subiecte-bac/2009/variante-2009-subiect.pdf', pdfPage: (v-1)*3+1 });
  }

  fs.writeFileSync(path.join(OUT_DIR, 'index.json'), JSON.stringify(index, null, 2), 'utf8');

  const s = JSON.parse(fs.readFileSync(path.join(OUT_DIR, '2009-varianta-001.json'), 'utf8'));
  console.log('\n✅ Extragere completă!');
  console.log(`   Variante: ${numVariants}`);
  console.log(`   Grile S1: ${stats.grile_s1}  (avg ${(stats.grile_s1/numVariants).toFixed(1)}/var)`);
  console.log(`   Grile S2: ${stats.grile_s2}  (avg ${(stats.grile_s2/numVariants).toFixed(1)}/var)`);
  console.log(`   Grile S3: ${stats.grile_s3}  (avg ${(stats.grile_s3/numVariants).toFixed(1)}/var)`);
  console.log(`   Prob S2:  ${stats.prob_s2}   (avg ${(stats.prob_s2/numVariants).toFixed(1)}/var)`);
  console.log('\n🔍 Sample varianta 1:');
  console.log('   S1 grila:', s.subiectI.grile[0]?.text?.slice(0, 80));
  console.log('   S1 opts:', JSON.stringify(s.subiectI.grile[0]?.options));
  console.log('   S1 pseudocod sub-q:', s.subiectI.pseudocode?.subQuestions?.length);
  console.log('   S2 grila 1:', s.subiectII.grile[0]?.text?.slice(0, 80));
  console.log('   S2 grila 2:', s.subiectII.grile[1]?.text?.slice(0, 80));
  console.log('   S2 prob3:', s.subiectII.probleme[0]?.text?.slice(0, 80));
  console.log('   S3 grila:', s.subiectIII.grile[0]?.text?.slice(0, 80));
  console.log('   S3 fisier:', s.subiectIII.fisiere[0]?.text?.slice(0, 80));
  console.log('   S3 subprog:', s.subiectIII.subprograme[0]?.intro?.slice(0, 80));
}

main().catch(err => {
  console.error('Eroare:', err);
  process.exit(1);
});
