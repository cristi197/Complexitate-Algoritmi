import { test, expect } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';

const publicDir = new URL('../../public/', import.meta.url);
const read = path => JSON.parse(readFileSync(new URL(path, publicDir), 'utf8'));
const exists = url => existsSync(new URL('.' + url, publicDir));

test.describe('BAC data', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Data checks are browser-independent; run once.');
  });

  test('every exam in examen-alb has a valid structure and answer key', () => {
    const index = read('data/examen-alb/index.json');
    const problems = [];
    expect(new Set(index.map(e => e.id)).size).toBe(index.length);
    for (const entry of index) {
      const file = `data/examen-alb/${entry.id}.json`;
      if (!exists('/' + file)) { problems.push(`${entry.id}: missing JSON`); continue; }
      const exam = read(file);
      if (exam.id !== entry.id || exam.year !== entry.year) problems.push(`${entry.id}: index mismatch`);
      if (!exists(exam.pdfUrl)) problems.push(`${entry.id}: missing PDF ${exam.pdfUrl}`);
      if (exam.baremUrl && !exists(exam.baremUrl)) problems.push(`${entry.id}: missing barem ${exam.baremUrl}`);
      const questions = exam.subiectI?.questions ?? [];
      // From 2019 Subiectul I has five grid questions; earlier exams have one (2010–2018).
      const expected = exam.year >= 2019 ? 5 : 1;
      if (questions.length !== expected) problems.push(`${entry.id}: ${questions.length} grile (expected ${expected})`);
      for (const q of questions) {
        const letters = Object.keys(q.options ?? {});
        if (letters.join('') !== 'abcd') problems.push(`${entry.id} q${q.nr}: options ${letters.join('')}`);
        if (!letters.includes(q.correctAnswer)) problems.push(`${entry.id} q${q.nr}: answer ${q.correctAnswer}`);
        if (Object.values(q.options ?? {}).some(v => /Ministerul|Pagina \d+ din/.test(v))) problems.push(`${entry.id} q${q.nr}: page header in options`);
      }
    }
    expect(problems).toEqual([]);
  });

  test('every PDF referenced by the subjects catalogue exists', () => {
    const missing = [];
    for (const year of read('data/subiecte-bac.json')) {
      for (const session of year.sessions) {
        if (!/\d{4}/.test(session.date) || (session.type !== 'model' && !session.date.includes(String(year.year)))) {
          missing.push(`${year.year} ${session.name}: suspicious date "${session.date}"`);
        }
        for (const subject of session.subjects) {
          for (const url of [subject.subiect, subject.barem].filter(Boolean)) if (!exists(url)) missing.push(url);
        }
      }
    }
    expect(missing).toEqual([]);
  });
});
