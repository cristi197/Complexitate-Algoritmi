# InfoLiceu — Algoritmi & Structuri de Date

[![Astro](https://img.shields.io/badge/Astro-5.x-FF5D01?logo=astro&logoColor=white)](https://astro.build)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-deployed-22c55e?logo=github)](https://cristi197.github.io/Complexitate-Algoritmi)
[![License: MIT](https://img.shields.io/badge/License-MIT-6366f1)](LICENSE)

> Platformă educațională modernă pentru informatică de liceu și bacalaureat (România · C++)

---

## Despre proiect

**InfoLiceu** este un ghid interactiv complet, destinat elevilor de liceu care se pregătesc pentru **Bacalaureatul de Informatică**. Cuprinde 12 capitole structurate cu teorie, exemple de cod C++, animații interactive, quizuri, grafice comparative și un sistem de progres cu XP.

---

## Funcționalități

| Funcționalitate | Detalii |
|---|---|
| 📚 12 capitole complete | Complexitate, Vectori, Matrici, Șiruri, Recursivitate, Backtracking, Fișiere, Programare dinamică + altele |
| 📊 Grafice interactive | Chart.js — Big-O comparativ (slider n) + comparație algoritmi de sortare |
| 🔍 Căutare rapidă | Modal Ctrl+K cu index complet de capitole și unelte |
| 🏆 Sistem XP | Progres persistent (localStorage) — câștigă XP la fiecare capitol vizitat |
| 🎬 Animații | Scroll-reveal, vizualizare Bubble Sort pas cu pas |
| 📝 Quiz interactiv | Întrebări cu dificultate Ușor / Mediu / Dificil per capitol |
| 🔊 Player Audiobook | Sincronizare text–audio pe secțiuni, din fișiere JSON |
| 🌙 Dark / Light mode | Temă persistentă în localStorage, fără flash |
| ↑ Reading progress bar | Progres de citire per pagină |
| 📱 Responsive + PWA | Manifest + favicon SVG, sidebar overlay pe mobil |
| 🤖 Analiză BAC | Pagină dedicată pentru analiza variantelor de bacalaureat |

---

## Stack tehnic

| Layer | Tehnologie |
|---|---|
| Framework | [Astro 5.x](https://astro.build) — build static, fișiere `.astro` |
| Fonturi | Syne (display) · DM Sans (body) · JetBrains Mono (cod) via Google Fonts |
| Stiluri | CSS custom properties — design system în `src/styles/global.css` |
| Grafice | [Chart.js 4.4](https://www.chartjs.org) — încărcat CDN doar pe pagina Complexitate |
| Quiz | Motor propriu (`public/js/quiz.js`) + date JSON per capitol |
| Progres | `public/js/progress.js` — XP system cu localStorage (`infoLiceu_v2`) |
| Căutare | `public/js/search.js` — index static client-side, modal Ctrl+K |
| Deploy | GitHub Pages via `astro build` + `base: '/Complexitate-Algoritmi'` |

---

## Setup local

```bash
# 1. Clonează repo-ul
git clone https://github.com/cristi197/Complexitate-Algoritmi.git
cd Complexitate-Algoritmi

# 2. Instalează dependențele
npm install

# 3. Server de dezvoltare (localhost:4321)
npm run dev

# 4. Build de producție
npm run build

# 5. Preview build local
npm run preview
```

---

## Structura proiectului

```
src/
├── layouts/
│   ├── BaseLayout.astro       # HTML shell: fonts, dark mode, search modal, XP toast
│   └── ChapterLayout.astro    # Layout capitol: sidebar, breadcrumbs, prev/next nav
├── pages/
│   ├── index.astro            # Pagina principală — hero + card-uri capitole
│   ├── exercitii.astro        # Exerciții centralizate
│   ├── analiza-bac.astro      # Analiză variante BAC
│   ├── 404.astro              # Pagina 404 custom
│   └── capitole/              # Un fișier .astro per capitol
│       ├── complexitate.astro
│       ├── vectori.astro
│       └── ...
├── components/
│   ├── Header.astro           # Navbar glass + SVG logo + buton căutare
│   ├── Sidebar.astro          # Sidebar cu overlay mobil
│   └── ...
└── styles/
    └── global.css             # Design system complet (tokens, utilities, animații)

public/
├── js/                        # JS rulat în browser (copiat și din js/)
│   ├── platform.js
│   ├── quiz.js
│   ├── search.js
│   ├── progress.js
│   ├── charts.js
│   └── audiobook.js
├── data/exercises/            # JSON-uri cu întrebările de quiz per capitol
├── favicon.svg
└── manifest.json
```

---

## Capitole

| # | Capitol | Teme principale |
|---|---|---|
| 1 | Complexitate | Big-O, Ω, Θ, clase de complexitate, sortare, grafice interactive |
| 2 | Vectori | Declarare, parcurgere, sortare, căutare binară |
| 3 | Matrici | Operații, transpusă, diagonale, spirală |
| 4 | Șiruri | Caractere, operații, palindrom, anagrame |
| 5 | Recursivitate | Stivă de apeluri, divide et impera, memoizare |
| 6 | Backtracking | Permutări, combinări, subseturi, N-Regine |
| 7 | Fișiere | Citire/scriere fișiere text în C++ |
| + | Introducere | Algoritm, pseudocod, primul program C++ |

---

## Licență

MIT — proiect educațional open-source pentru elevii români.