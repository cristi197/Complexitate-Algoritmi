# 10 · Testare și performanță

_Actualizat în: PR1_

![Testare](diagrams/testing.svg)

## Playwright (`tests/ui`)

| Proiect | Browser | Rol |
|---|---|---|
| `desktop`, `mobile`, `dark` | Chromium (local: Chrome instalat) | Blocant în CI |
| `firefox` | Firefox desktop | Blocant în CI (din PR1) |
| `webkit-mobile` | WebKit, iPhone 13 | Blocant în CI (din PR1) |

| Suită | Ce verifică |
|---|---|
| `chapters.spec.mjs` | Fiecare capitol: lectură, ancore, quiz, layout responsive, axe (WCAG 2.1 AA), căutare, temă, meniu mobil |
| `demos.spec.mjs` | Demo-urile interactive din capitole |
| `quiz.spec.mjs` | Quiz: formatare, skip, scor, retry |
| `crawl.spec.mjs` | Fiecare pagină din sitemap + paginile `noindex`: erori în consolă, cereri eșuate, imagini stricate, ținta link-ului „Sari la conținut”; o dată, pe desktop: toate linkurile interne și imaginile `og:image`, plus `noindex`/absența din sitemap pentru `test-exercitii` |
| `a11y.spec.mjs` | axe (WCAG 2.1 AA, serious/critical) pe toate paginile de unelte, în desktop, mobil și tema închisă |
| `debug-live.spec.mjs` | Input-ul elevului nu devine HTML; matricea scrisă e folosită; rândurile de trasare merg din tastatură |
| `progress.spec.mjs` | XP are o singură sursă; vechiul `infoXP` e adunat o dată și sidebar-ul arată totalul salvat |
| `overlap.spec.mjs` | Pe toate paginile (desktop și mobil), nicio iconiță decorativă poziționată absolut (`::before`/`::after` sau SVG) nu acoperă textul |
| `data.spec.mjs` | Datele BAC: structura examenelor, grile `a–d` cu răspuns valid, fără antet de pagină, PDF-uri existente, date plauzibile în catalog |
| `visual.spec.mjs` | Capturi pentru 10 pagini cheie, doar Chromium (`__screenshots__/<platform>/<proiect>/`) |

`CRAWL_STRICT=0` transformă problemele găsite de crawler în adnotări, pentru investigații locale; implicit, crawler-ul e strict. Capturile lipsă se generează automat (`updateSnapshots: 'missing'`).

Rezultatul baseline-ului (PR0): 394 de teste trec în cele 5 configurații; în WebKit, focusul nu revenea pe butonul de căutare (Safari nu focusează butoanele la click), reparat în PR1. Testul de clipboard rulează doar în Chromium, singurul browser care permite acordarea permisiunilor.

Rulare locală (din `astro-legacy/`):

```powershell
npm ci
npx playwright install firefox webkit   # în rețeaua firmei: $env:NODE_OPTIONS='--use-system-ca'
npm run build
npm run test:ui
```

## Performanță (`scripts/perf`)

| Script | Rezultat |
|---|---|
| `npm run perf` | Tot fluxul în `reports/perf/current/` (ignorat de git) |
| `npm run perf:baseline` | Același flux în `reports/perf/baseline/` (salvat în repo) |
| `bundle-size.mjs` | JS/CSS/HTML pe fiecare pagină (raw, gzip, brotli), urmărind importurile modulelor |
| `lighthouse.mjs` | LHCI pe 8 pagini × mobil/desktop × 3 rulări; păstrează rularea mediană |
| `compare.mjs` | `comparison.html` + `summary.md` (comentariu pe PR) față de baseline |

Bugete (`lighthouserc.cjs`): performanță ≥ 90 mobil / ≥ 95 desktop, accesibilitate ≥ 95, LCP < 2,5 s, CLS < 0,1, TBT < 200 ms, JS < 150 KB transferat. Sunt **avertismente** până la PR3 (`PERF_ENFORCE=1` le face blocante).
