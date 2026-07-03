#!/usr/bin/env node
/**
 * Converts existing capitole/*.html → src/pages/capitole/*.astro
 * Extracts: wrapper content, quiz data, nav sections, page-cover meta
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const root  = join(__dir, '..');

const chapters = [
  {
    file: 'introducere',
    chapterNum: 0,
    icon: '🖥️',
    gradient: 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#1d4ed8 100%)',
    tags: ['Programa BAC 2026','Ce este informatica','Primul program C++','Tipuri de date','Structuri de control'],
  },
  {
    file: 'complexitate',
    chapterNum: 1,
    icon: '📊',
    gradient: 'linear-gradient(135deg,#0c4a6e 0%,#0369a1 50%,#0ea5e9 100%)',
    tags: ['Big-O','Bubble Sort','Căutare binară','Sortare','Complexitate spațiu'],
  },
  {
    file: 'recursivitate',
    chapterNum: 2,
    icon: '🔄',
    gradient: 'linear-gradient(135deg,#064e3b 0%,#065f46 50%,#059669 100%)',
    tags: ['Recursivitate','Factorial','Fibonacci','Stivă de apeluri','Memoizare'],
  },
  {
    file: 'backtracking',
    chapterNum: 3,
    icon: '🌳',
    gradient: 'linear-gradient(135deg,#2e1065 0%,#4c1d95 50%,#7c3aed 100%)',
    tags: ['Backtracking','N-Regine','Permutări','Labirint','Combinări'],
  },
  {
    file: 'vectori',
    chapterNum: 4,
    icon: '📦',
    gradient: 'linear-gradient(135deg,#7c2d12 0%,#c2410c 50%,#f97316 100%)',
    tags: ['Vectori','Sortare','Căutare binară','Interclasare','Counting sort'],
  },
  {
    file: 'matrici',
    chapterNum: 5,
    icon: '🔲',
    gradient: 'linear-gradient(135deg,#134e4a 0%,#0f766e 50%,#14b8a6 100%)',
    tags: ['Matrici','Diagonale','Transpusă','Spirală','Tablouri 2D'],
  },
  {
    file: 'siruri',
    chapterNum: 6,
    icon: '🔤',
    gradient: 'linear-gradient(135deg,#7f1d1d 0%,#b91c1c 50%,#ef4444 100%)',
    tags: ['Șiruri de caractere','Palindrom','Anagramă','strlen / strcpy','Caesar'],
  },
  {
    file: 'fisiere',
    chapterNum: 7,
    icon: '📁',
    gradient: 'linear-gradient(135deg,#831843 0%,#be185d 50%,#ec4899 100%)',
    tags: ['Fișiere','fstream','ifstream','ofstream','EOF'],
  },
];

function extractWrapper(html) {
  // Find opening <div class="wrapper">
  const startTag = '<div class="wrapper">';
  const startIdx = html.indexOf(startTag);
  if (startIdx === -1) return '';
  let depth = 0;
  let i = startIdx;
  while (i < html.length) {
    if (html.startsWith('<div', i)) depth++;
    if (html.startsWith('</div>', i)) {
      depth--;
      if (depth === 0) {
        // Return inner content (not including the wrapper div itself)
        return html.slice(startIdx + startTag.length, i).trim();
      }
      i += 6; continue;
    }
    i++;
  }
  return '';
}

function extractNavSections(html) {
  const navStart = html.indexOf('<nav class="nav-bar">');
  if (navStart === -1) return [];
  const navEnd   = html.indexOf('</nav>', navStart);
  const navHtml  = html.slice(navStart, navEnd);
  const re       = /href="#([^"]+)"[^>]*>([^<]+)</g;
  const sections = [];
  let m;
  while ((m = re.exec(navHtml)) !== null) {
    sections.push({ id: m[1], label: m[2].replace(/&#\d+;/g, '').trim() });
  }
  return sections;
}

function extractQuizScript(html) {
  // Find inline script that sets window.QUIZ_DATA
  const re = /<script[^>]*>\s*(window\.QUIZ_DATA[\s\S]+?)<\/script>/g;
  let m;
  let found = '';
  while ((m = re.exec(html)) !== null) {
    if (m[1].includes('window.QUIZ_DATA')) {
      found = m[1].trim();
    }
  }
  return found;
}

function extractTitle(html) {
  const m = html.match(/<title>([^<]+)<\/title>/);
  if (!m) return 'Capitol';
  // Clean HTML entities
  return m[1].replace(/&[a-z]+;/g, c => {
    const map = { '&icirc;': 'î', '&acirc;': 'â', '&scedil;': 'ș', '&tcedil;': 'ț', '&mdash;': '—', '&amp;': '&', '&quot;': '"' };
    return map[c] || c;
  }).split('—')[0].trim();
}

function extractSubtitle(html) {
  const m = html.match(/<p>Capitol\s*\d+[^<]*<\/p>/);
  if (m) {
    return m[0].replace(/<[^>]+>/g, '').replace(/&#\d+;/g, ' ').trim();
  }
  // Try the page-cover paragraph
  const m2 = html.match(/class="page-cover[^"]*"[\s\S]+?<p>([^<]+)<\/p>/);
  return m2 ? m2[1].trim() : '';
}

function decodeEntities(str) {
  return str
    .replace(/&icirc;/g, 'î')
    .replace(/&acirc;/g, 'â')
    .replace(/&Icirc;/g, 'Î')
    .replace(/&Acirc;/g, 'Â')
    .replace(/&scedil;/g, 'ș')
    .replace(/&Scedil;/g, 'Ș')
    .replace(/&tcedil;/g, 'ț')
    .replace(/&Tcedil;/g, 'Ț')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, '\u00a0')
    .replace(/&rarr;/g, '→')
    .replace(/&larr;/g, '←')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)));
}

const outDir = join(root, 'src', 'pages', 'capitole');
mkdirSync(outDir, { recursive: true });

for (const ch of chapters) {
  const htmlPath = join(root, 'capitole', `${ch.file}.html`);
  let html;
  try {
    html = readFileSync(htmlPath, 'utf8');
  } catch (e) {
    console.warn(`Skipping ${ch.file}: not found`);
    continue;
  }

  const title    = extractTitle(html);
  const subtitle = extractSubtitle(html);
  const sections = extractNavSections(html);
  const content  = decodeEntities(extractWrapper(html));
  const quizScript = extractQuizScript(html);

  const sectionsJson = JSON.stringify(sections);
  const tagsJson     = JSON.stringify(ch.tags);

  const astro = `---
import ChapterLayout from '../../layouts/ChapterLayout.astro';

const sections = ${sectionsJson};
---
<ChapterLayout
  title="${title}"
  subtitle="${subtitle.replace(/"/g, '&quot;')}"
  icon="${ch.icon}"
  gradient="${ch.gradient}"
  tags={${tagsJson}}
  sections={sections}
  chapterNum={${ch.chapterNum}}
  description="${title} — informatică pentru liceu și bacalaureat"
>
${content}
${quizScript ? `\n<script is:inline>\n${quizScript}\n</script>` : ''}
</ChapterLayout>
`;

  const outPath = join(outDir, `${ch.file}.astro`);
  writeFileSync(outPath, astro, 'utf8');
  console.log(`✅ ${ch.file}.astro  (${content.length} chars, ${sections.length} sections)`);
}

console.log('\nDone! All chapter pages generated.');
