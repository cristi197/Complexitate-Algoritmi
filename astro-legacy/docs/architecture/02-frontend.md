# 02 · Frontend

_Actualizat în: PR0_

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

- **Globale (BaseLayout):** `search.js`, `progress.js`, `analytics.js` sunt încărcate **sincron** în `<head>` (blochează parsarea); `site.js` cu `defer`.
- **Capitole (ChapterLayout):** `animations.js`, `quiz.js`, `platform.js`.
- **Pe pagină:** multe pagini au `<script is:inline>` mari (de ex. `debug-live` ~5.000 linii, `variante-2009`, `test-exercitii`, `examen-alb`).
- **CDN:** Chart.js (jsDelivr) în `complexitate`, pdf.js (cdnjs) în `analiza-bac`, fără `integrity` (SRI).
- **Insule interactive:** niciuna. `components/Quiz.tsx` (Preact) nu e folosit și nu există integrare Preact/React.

## Stiluri și UI (constatări)

- Tailwind v4 e importat, dar nu e folosit ca sistem de design (fără `@theme`).
- ~400 de atribute `style=` în pagini și 8 blocuri `<style>` mari.
- Emoji și Lucide amestecate; fonturi diferite pe unele pagini (Fira Code, Courier).
- `manifest.json` are încă tema indigo.

Planificat: React 19 + MDX (PR3), sistem de design unic și structură comună a paginilor (PR3), modulele globale în React (PR4).
