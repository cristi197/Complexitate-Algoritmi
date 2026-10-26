# 01 · Build și deploy

_Actualizat în: PR0_

![Build și deploy](diagrams/build-deploy.svg)

## Build

- Proiectul Astro e în `astro-legacy/`; `srcDir: '.'` face ca `pages/`, `layouts/`, `components/` să stea direct în rădăcina proiectului.
- `astro build` generează HTML static în `dist/` (`build.format: 'file'` → `/editor.html`, `trailingSlash: 'ignore'`).
- `site` și `base` vin din `PUBLIC_SITE` (implicit `https://learnbac.ro`) și `PUBLIC_BASE` (implicit `/`).
- Integrări: `@astrojs/sitemap`; Tailwind v4 prin plugin Vite. Cu `ANALYZE=1`, `rollup-plugin-visualizer` scrie `bundle-treemap.html`.
- Node ≥ 22.12 (CI folosește 22).

## Workflow-uri

| Workflow | Când | Ce face |
|---|---|---|
| [deploy.yml](../../../.github/workflows/deploy.yml) | push pe `main`, manual | `npm ci` → `astro build` → `upload-pages-artifact` → `deploy-pages` |
| [ui.yml](../../../.github/workflows/ui.yml) | PR/push care ating `astro-legacy/` | Playwright: Chromium blocant, Firefox + WebKit informativ (până la PR1) |
| [perf.yml](../../../.github/workflows/perf.yml) | PR care ating `astro-legacy/`, manual | Bundle size + Lighthouse + comparație cu baseline, comentariu pe PR |
| [diagrams.yml](../../../.github/workflows/diagrams.yml) | `.puml` modificate | PlantUML → SVG; commit automat pe branch, pe PR doar validează că diagramele se pot genera |

## Probleme cunoscute

- `CNAME` și `.nojekyll` sunt în `astro-legacy/`, nu în `public/`, deci nu ajung în `dist/`. Domeniul custom depinde doar de setarea din GitHub Pages. **Se repară în PR1.**
