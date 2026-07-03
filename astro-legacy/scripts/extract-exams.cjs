/**
 * extract-exams.cjs
 * Reads all BAC exam PDFs and produces structured JSON files.
 * Run: node scripts/extract-exams.cjs
 */

const fs   = require('fs');
const path = require('path');

/* ── helpers ──────────────────────────────────────────────── */

function clean(s) {
  return s
    .replace(/\s+/g, ' ')
    .replace(/ț/g, 'ț').replace(/ș/g, 'ș').replace(/ă/g, 'ă')
    .replace(/â/g, 'â').replace(/î/g, 'î')
    .replace(/Ț/g, 'Ț').replace(/Ș/g, 'Ș').replace(/Ă/g, 'Ă')
    .trim();
}

async function pdfToText(filePath) {
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const data     = new Uint8Array(fs.readFileSync(filePath));
  const doc      = await pdfjsLib.getDocument({ data }).promise;
  let text = '';
  for (let i = 1; i <= doc.numPages; i++) {
    const page    = await doc.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map(it => it.str).join(' ') + '\n';
  }
  return text;
}

/* ── parsers ──────────────────────────────────────────────── */

/**
 * Parse Subiectul I – multiple-choice questions.
 * Format: each question starts with a digit+. then (a. b. c. d.)
 */
function parseSubiectI(block) {
  const questions = [];
  // Split on question numbers: "1. " "2. " ... "5. "
  const qParts = block.split(/(?=\b[1-5]\.\s)/);
  for (const part of qParts) {
    const numMatch = part.match(/^([1-5])\.\s+(.*)/s);
    if (!numMatch) continue;
    const num  = parseInt(numMatch[1]);
    const body = numMatch[2];

    // Extract options a b c d
    const opts = {};
    const optRe = /([abcd])\.\s+(.*?)(?=\s+[abcd]\.\s|$)/gs;
    let m;
    const beforeOpts = body.split(/\s+a\./)[0];
    while ((m = optRe.exec(body)) !== null) {
      opts[m[1]] = clean(m[2]);
    }
    const text = clean(beforeOpts);

    if (text && Object.keys(opts).length >= 2) {
      questions.push({ nr: num, text, options: opts, correctAnswer: null });
    }
  }
  return questions;
}

/**
 * Parse Subiectul II – pseudocode + written problems.
 */
function parseSubiectII(block) {
  const problems = [];
  // Problem 1 typically contains "pseudocod"
  const p1Match = block.match(/1\.\s+(Algoritmul[\s\S]*?)(?=2\.\s)/i);
  if (p1Match) {
    const p1body = p1Match[1];
    // Extract pseudocode block (between citeste..scrie)
    const pseudoMatch = p1body.match(/(cite[şș]te[\s\S]*?scrie[^\n]*)/i);
    const pseudocode  = pseudoMatch ? clean(pseudoMatch[1]) : '';

    // Extract sub-questions a, b, c, d
    const subQuestions = [];
    const subRe = /([abcd])\.\s+(.*?)(?=\s+[abcd]\.\s|\s*$)/gs;
    let sm;
    while ((sm = subRe.exec(p1body)) !== null) {
      const pts   = sm[2].match(/\((\d+)p\.\)/)?.[1] || null;
      const qText = clean(sm[2].replace(/\(\d+p\.\)/, '').trim());
      subQuestions.push({
        id: sm[1],
        text: qText,
        points: pts ? parseInt(pts) : null,
        type: sm[1] === 'c' ? 'code' : 'written',
        correctAnswer: null
      });
    }
    problems.push({
      nr: 1,
      type: 'pseudocode',
      pseudocode,
      subQuestions,
      correctAnswer: null
    });
  }

  // Problems 2, 3 – written / matrix / graph questions
  const p23Re = /([23])\.\s+(.*?)(?=(?:[23])\.\s|SUBIECTUL|$)/gs;
  let pm;
  while ((pm = p23Re.exec(block)) !== null) {
    if (parseInt(pm[1]) === 1) continue;
    const pts   = pm[2].match(/\((\d+)p\.\)/)?.[1] || null;
    const qText = clean(pm[2].replace(/\(\d+p\.\)/, '').trim());
    problems.push({
      nr: parseInt(pm[1]),
      type: 'problem',
      text: qText,
      points: pts ? parseInt(pts) : null,
      type2: 'written',
      correctAnswer: null
    });
  }

  return problems;
}

/**
 * Parse Subiectul III – full code problems.
 */
function parseSubiectIII(block) {
  const problems = [];
  const pRe = /([123])\.\s+(.*?)(?=(?:[123])\.\s|$)/gs;
  let m;
  while ((m = pRe.exec(block)) !== null) {
    const nr    = parseInt(m[1]);
    const body  = m[2];
    const pts   = body.match(/\((\d+)p\.\)/)?.[1] || '10';
    const qText = clean(body.replace(/\(\d+p\.\)/, '').trim());

    // Extract example input/output
    const exIn  = body.match(/dac[ăa]\s+(.*?)\s+(?:atunci|se afi[şș]eaz[ăa])/i)?.[1] || null;
    const exOut = body.match(/(?:se afi[şș]eaz[ăa]|returneaz[ăa])\s+(.*?)(?:\s|$)/i)?.[1] || null;

    problems.push({
      nr,
      text: qText,
      points: parseInt(pts),
      type: 'code',
      exampleInput: exIn ? clean(exIn) : null,
      exampleOutput: exOut ? clean(exOut) : null,
      testCases: [],
      functionSignature: null,
      correctAnswer: null
    });
  }
  return problems;
}

/**
 * Parse barem (answer key) to fill correct answers for Subject I.
 * Typically looks like: "1a 2d 3c 4d 5b"
 */
function parseBarem(baremText) {
  const answers = {};
  const re = /([1-5])([abcd])/g;
  let m;
  while ((m = re.exec(baremText)) !== null) {
    answers[parseInt(m[1])] = m[2];
  }
  return answers;
}

/* ── main exam parser ─────────────────────────────────────── */

function parseExamText(fullText, baremText) {
  // Split into subjects
  const s1Match = fullText.match(/SUBIECTUL\s+I[^I]([\s\S]*?)(?=SUBIECTUL\s+al\s+II|$)/i);
  const s2Match = fullText.match(/SUBIECTUL\s+al\s+II[\s\S]*?lea([\s\S]*?)(?=SUBIECTUL\s+al\s+III|$)/i);
  const s3Match = fullText.match(/SUBIECTUL\s+al\s+III[\s\S]*?lea([\s\S]*?)$/i);

  const s1Text = s1Match?.[1] || '';
  const s2Text = s2Match?.[1] || '';
  const s3Text = s3Match?.[1] || '';

  // Parse each subject
  const q1 = parseSubiectI(s1Text);
  const q2 = parseSubiectII(s2Text);
  const q3 = parseSubiectIII(s3Text);

  // Apply barem answers to Subject I
  if (baremText) {
    const answers = parseBarem(baremText);
    q1.forEach(q => {
      if (answers[q.nr]) q.correctAnswer = answers[q.nr];
    });
  }

  // Extract variant info
  const variantMatch = fullText.match(/Varianta\s+(\d+)/i);
  const langMatch    = fullText.match(/Limbajul\s+(C\/C\+\+|Pascal)/i);

  return {
    variant:   variantMatch?.[1] ? parseInt(variantMatch[1]) : null,
    language:  langMatch?.[1] || 'C/C++',
    subiectI:  { points: 20, questions: q1 },
    subiectII: { points: 40, problems: q2 },
    subiectIII:{ points: 30, problems: q3 },
  };
}

/* ── file walking + output ────────────────────────────────── */

const SUBIECTE_DIR = path.join(__dirname, '..', 'public', 'subiecte-bac');
const OUT_DIR      = path.join(__dirname, '..', 'public', 'data', 'examen-alb');

function sessionLabel(filename) {
  if (/simulare/i.test(filename))          return 'Simulare';
  if (/modele/i.test(filename))            return 'Modele de subiecte';
  if (/special/i.test(filename))           return 'Sesiunea specială';
  if (/august.*septembrie|aug/i.test(filename)) return 'Sesiunea august-septembrie';
  if (/august/i.test(filename))            return 'Sesiunea august';
  if (/iunie.*iulie|iun/i.test(filename))  return 'Sesiunea iunie-iulie';
  if (/iunie/i.test(filename))             return 'Sesiunea iunie';
  if (/rezerv/i.test(filename))            return 'Subiect de rezervă';
  if (/mec.*test/i.test(filename))         return filename.match(/mec.*test[- ](\d+)/i)?.[0] || 'Test MEC';
  if (/antrenament.*test/i.test(filename)) return filename.match(/antrenament.*test[- ](\d+)/i)?.[0] || 'Test antrenament';
  return 'Sesiunea necunoscută';
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const years = fs.readdirSync(SUBIECTE_DIR)
    .filter(d => /^\d{4}$/.test(d))
    .sort();

  const index = []; // master index written to examen-alb/index.json

  for (const year of years) {
    const yearDir = path.join(SUBIECTE_DIR, year);
    const files   = fs.readdirSync(yearDir).filter(f => f.endsWith('.pdf'));
    const subjectFiles = files.filter(f => /subiect(?!-barem)/.test(f) && !/barem/.test(f));

    for (const subFile of subjectFiles) {
      const id      = subFile.replace('.pdf', '');
      const outFile = path.join(OUT_DIR, id + '.json');

      if (fs.existsSync(outFile)) {
        console.log(`  SKIP (exists): ${id}`);
        const existing = JSON.parse(fs.readFileSync(outFile, 'utf8'));
        index.push({ id, year: parseInt(year), session: existing.session, type: existing.type });
        continue;
      }

      try {
        console.log(`Processing: ${id}`);
        const subjectPath = path.join(yearDir, subFile);

        // Find matching barem
        const baremFile = subFile.replace('-subiect.pdf', '-barem.pdf');
        const baremPath = path.join(yearDir, baremFile);

        const subjectText = await pdfToText(subjectPath);
        const baremText   = fs.existsSync(baremPath) ? await pdfToText(baremPath) : null;

        const parsed = parseExamText(subjectText, baremText);

        const session = sessionLabel(id);
        const examType = /simulare/i.test(id)  ? 'simulare' :
                         /modele/i.test(id)     ? 'model'    :
                         /special/i.test(id)    ? 'special'  :
                         /august/i.test(id)     ? 'august'   :
                         /iunie/i.test(id)      ? 'iunie'    :
                         /mec.*test/i.test(id)  ? 'test-mec' :
                         /antrenament/i.test(id)? 'antrenament' : 'oficial';

        const exam = {
          id,
          year: parseInt(year),
          session,
          type: examType,
          pdfUrl: `/subiecte-bac/${year}/${subFile}`,
          baremUrl: fs.existsSync(baremPath) ? `/subiecte-bac/${year}/${baremFile}` : null,
          ...parsed
        };

        fs.writeFileSync(outFile, JSON.stringify(exam, null, 2), 'utf8');
        index.push({ id, year: parseInt(year), session, type: examType });
        console.log(`  ✓ Written: ${outFile}`);
      } catch (err) {
        console.error(`  ✗ Error with ${id}: ${err.message}`);
      }
    }
  }

  // Write master index
  fs.writeFileSync(
    path.join(OUT_DIR, 'index.json'),
    JSON.stringify(index.sort((a, b) => b.year - a.year || a.id.localeCompare(b.id)), null, 2),
    'utf8'
  );
  console.log('\nDone! Index written.');
}

main().catch(console.error);
