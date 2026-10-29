# 09 · Date BAC

_Actualizat în: PR2_

![Date BAC](diagrams/bac-data.svg)

| Fișier | Conținut |
|---|---|
| `public/subiecte-bac/<an>/` | PDF-uri subiect + barem (2009–2026), varianta C/C++ |
| `public/data/subiecte-bac.json` | `[{ year, sessions: [{ name, date, type, subjects: [{ subiect, barem, label? }] }] }]` |
| `public/data/examen-alb/index.json` | `[{ id, year, session, type }]` |
| `public/data/examen-alb/<id>.json` | `pdfUrl`, `baremUrl`, `variant`, `language`, `subiectI/II/III` (grile cu `correctAnswer`) |
| `public/data/variante-2009/` | 100 de variante + `index.json` |
| `public/data/exercises/<capitol>.json` | Întrebările quiz-ului din fiecare capitol |

## Extragere (`scripts/extract-exams.cjs`, rulat din `astro-legacy/`)

| Comandă | Ce face |
|---|---|
| `node scripts/extract-exams.cjs` | Generează JSON doar pentru examenele noi |
| `node scripts/extract-exams.cjs --fix-answers` | Re-extrage doar Subiectul I (grile + răspunsuri din barem) pentru JSON-urile existente; Subiectele II/III rămân neatinse |
| `node scripts/extract-exams.cjs --force` | Regenerează tot |

- Antetul/subsolul repetat pe fiecare pagină („Ministerul … Pagina x din y”) e eliminat înainte de parsare.
- Literele variantelor (`a.` … `d.`) sunt recunoscute doar la început de cuvânt (nu „c.” din „arc.”).
- Răspunsurile se citesc doar din secțiunea „SUBIECTUL I” a baremului, în ambele formate: `1d 2c 3b 4b 5a` (din 2019) și `1. d 4p.` (2010–2018). Înainte de 2019, Subiectul I are o singură grilă; itemii de pseudocod (`a.`, `b.`, …) nu mai sunt luați drept grile.
- `2009` e exclus: un singur PDF cu 100 de variante, procesat de `extract-2009-variante.mjs`.

Verificare: `tests/ui/data.spec.mjs` cere 5 grile (din 2019) sau 1 (2010–2018), variante `a–d`, răspuns valid, fără antet în variante, PDF-uri existente și date plauzibile în catalog.

## Subiecte noi

- `scripts/bac/check-official.mjs` citește `subiecte.edu.ro/<an>/bacalaureat/Subiecte_si_bareme/` și `.../modeledesubiecte/probescrise/` și listează arhivele de informatică absente din `scripts/bac/known-official.json`.
- Workflow-ul [bac-watcher.yml](../../../.github/workflows/bac-watcher.yml) rulează lunar (și manual) și deschide/actualizează issue-ul „Subiecte BAC noi de importat”. Nu publică nimic automat.
- Importul e manual: arhivele se pun în `scripts/bac/inbox/` (ignorat de git), PDF-urile C/C++ în `public/subiecte-bac/<an>/`, sesiunea în `subiecte-bac.json`, apoi extragere, verificare după barem și `check-official.mjs --remember`.
- `subiecte.edu.ro` nu e accesibil din rețeaua firmei; pe GitHub Actions merge.

Acoperire: 2010–2026; pentru 2026 există simularea și modelele. Sesiunile 2026 (iunie, august, specială) urmează să fie importate.
