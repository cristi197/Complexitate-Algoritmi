# 02 · Frontend

_Actualizat în: PR1_

![Încărcarea unei pagini](diagrams/page-load.svg)

## Structură

| Zonă | Fișiere | Rol |
|---|---|---|
| Layout de bază | `layouts/BaseLayout.astro` | Meta/SEO, manifest PWA, script inline pentru temă, dialog de căutare, toast XP, înregistrare service worker |
| Layout de capitol | `layouts/ChapterLayout.astro` | Header + Sidebar + Footer, breadcrumb, cuprins sticky, navigare anterior/următor |
| Componente | `components/*.astro`, `components/ui/*`, `components/chapter/*` | Header, Sidebar, Footer, DarkModeToggle, Button, Card, Badge, Callout, ComplexityTable, TheorySlide |
| Pagini | `pages/*.astro`, `pages/capitole/*.astro` | 13 pagini de unelte + 13 capitole |
| Date capitole | `data/chapters.ts` | Ordinea, titlul, grupa, dificultatea și timpul fiecărui capitol |
| Stiluri | `styles/global.css`, `styles/learning.css` | Două straturi de tokeni; `learning.css` (teal) suprascrie `global.css` (indigo) |

## Scripturi

- **Globale (BaseLayout):** `search.js`, `progress.js`, `analytics.js`, `site.js` — toate cu `defer` (din PR1), deci nu mai blochează afișarea.
- **Capitole (ChapterLayout):** `animations.js`, `quiz.js`, `platform.js`, tot cu `defer`. Inițializările rămân în `DOMContentLoaded`, care pornește după scripturile `defer`.
- **Pe pagină:** multe pagini au `<script is:inline>` mari (de ex. `debug-live` ~5.000 linii, `variante-2009`, `test-exercitii`, `examen-alb`).
- **CDN:** Chart.js (jsDelivr) în `complexitate`, pdf.js (cdnjs) în `analiza-bac`, cu `integrity` (SRI) și `crossorigin` din PR1.
- **Insule interactive:** niciuna încă (React vine în PR3). `Quiz.tsx` și dependența `preact` au fost șterse în PR1.

## Stiluri și UI

- Tailwind v4 e importat, dar nu e folosit ca sistem de design (fără `@theme`). Vine în PR3.
- `learning.css` definește tokenii temei: culori de bază, `--on-primary` (text pe butoane primare), culori semantice AA (`--c-blue`, `--c-green`, `--c-red`), culori pentru cod (`--code-kw`, `--code-st`, …) și alias-uri `--color-*` pentru paginile de unelte, care înainte cădeau pe culori doar pentru tema închisă.
- Titlurile din hero-urile închise (`.chapter-hero`, `.v09-hero`, `.ea-hero`, …) sunt albe; regula globală `h1 { color: var(--text) }` le făcea ilizibile pe tema deschisă.
- Fonturile Inter și Manrope (latin) sunt încărcate cu `preload`; un fallback Arial ajustat la metricile Inter reduce săritura textului la încărcarea fontului (CLS).
- Încă rămase pentru PR3: ~400 de atribute `style=`, blocuri `<style>` mari, emoji amestecate cu Lucide, CSS ~41 KB comprimat pe fiecare pagină.

Planificat: React 19 + MDX (PR3), sistem de design unic și structură comună a paginilor (PR3), modulele globale în React (PR4).
