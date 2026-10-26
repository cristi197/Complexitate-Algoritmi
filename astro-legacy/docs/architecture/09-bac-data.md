# 09 · Date BAC

_Actualizat în: PR0_

![Date BAC](diagrams/bac-data.svg)

| Fișier | Conținut |
|---|---|
| `public/subiecte-bac/<an>/` | PDF-uri subiect + barem (2009–2026) |
| `public/data/subiecte-bac.json` | `[{ year, sessions: [{ name, date, type, subjects: [{ subiect, barem, label? }] }] }]` |
| `public/data/examen-alb/index.json` | `[{ id, year, session, type }]` |
| `public/data/examen-alb/<id>.json` | `pdfUrl`, `baremUrl`, `variant`, `language`, `subiectI/II/III` (grile cu `correctAnswer`) |
| `public/data/variante-2009/` | 100 de variante + `index.json` |
| `public/data/exercises/<capitol>.json` | Întrebările quiz-ului din fiecare capitol |

Scripturi (rulate din `astro-legacy/`): `node scripts/extract-exams.cjs` (PDF → JSON examen-alb), `node scripts/extract-2009-variante.mjs`. Nu descarcă nimic; lucrează pe PDF-urile locale.

Acoperire: 2010–2026; pentru 2026 există doar simularea și modelele.

Planificat (PR2): sesiunile 2026 din sursa oficială, verificare manuală a barem-ului, test de schemă, workflow lunar care deschide PR-uri „de verificat”.
