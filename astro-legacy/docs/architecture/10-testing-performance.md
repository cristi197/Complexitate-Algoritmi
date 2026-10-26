# 10 · Testare și performanță

_Actualizat în: PR0_

![Testare](diagrams/testing.svg)

## Playwright (`tests/ui`)

| Proiect | Browser | Rol |
|---|---|---|
| `desktop`, `mobile`, `dark` | Chromium (local: Chrome instalat) | Blocant în CI |
| `firefox` | Firefox desktop | Informativ până la PR1 |
| `webkit-mobile` | WebKit, iPhone 13 | Informativ până la PR1 |

| Suită | Ce verifică |
|---|---|
| `chapters.spec.mjs` | Fiecare capitol: lectură, ancore, quiz, layout responsive, axe (WCAG 2.1 AA), căutare, temă, meniu mobil |
| `demos.spec.mjs` | Demo-urile interactive din capitole |
| `quiz.spec.mjs` | Quiz: formatare, skip, scor, retry |
| `crawl.spec.mjs` | Fiecare pagină din sitemap: erori în consolă, cereri eșuate, imagini stricate; o dată, pe desktop: toate linkurile interne |
| `visual.spec.mjs` | Capturi pentru 10 pagini cheie, doar Chromium (`__screenshots__/<platform>/<proiect>/`) |

`CRAWL_STRICT=0` transformă problemele găsite de crawler în adnotări, pentru investigații locale; implicit, crawler-ul e strict. Capturile lipsă se generează automat (`updateSnapshots: 'missing'`).

Rezultatul baseline-ului (PR0): 394 de teste trec în cele 5 configurații. Crawler-ul nu găsește erori, cereri eșuate, imagini sau linkuri stricate. În WebKit, focusul nu revine pe butonul de căutare după închiderea dialogului (bug, PR1). Testul de clipboard rulează doar în Chromium, singurul browser care permite acordarea permisiunilor.

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
