# Astro UI Regression Tests

Run from `astro-legacy` with Node.js 22.12 or newer:

```sh
npm ci
npx playwright install chromium firefox webkit
npm run build
npm run test:ui
```

Behind a TLS-inspecting proxy, set `NODE_OPTIONS=--use-system-ca` before
`playwright install` so Node trusts the Windows certificate store.

The runner starts the built site's preview on port 4330. On Windows it uses an
installed Chrome when available; other environments use Playwright Chromium.

## Coverage

All thirteen chapters are checked in desktop light, mobile light, and desktop
dark profiles. Each chapter has checks for reading layout, section anchors,
duplicate IDs, quiz interaction, missing local resources, and JavaScript errors.
The accessibility checks reject serious and critical WCAG 2 A/AA and 2.1 AA
violations. These automated checks do not establish full WCAG conformance.

Demonstration tests cover function returns, sorting controls, Euclid's algorithm,
maze cells, vector insertion, matrix diagonals, string case conversion, file
processing, Fibonacci, record sorting, pointer memory, and graph canvas pixels.
Reduced-motion readability and local font loading are also checked.

Shared flows cover catalog filters, search with and without Romanian diacritics,
keyboard navigation, persisted theme, mobile menu focus, clipboard content,
quiz loading errors, formatted C++, skipped-question scores, and retry focus.
An additional narrow-screen check visits every chapter at 320 pixels wide.

The mobile-menu test intentionally skips the two desktop profiles. Tests use a
fresh browser context and block service workers to avoid stale cached builds.

`crawl.spec.mjs` visits every sitemap page in every project and reports console
errors, failed same-origin requests and broken images; a desktop-only test checks
that every internal link resolves. Set `CRAWL_STRICT=0` to record findings as
annotations instead of failures. `visual.spec.mjs` compares ten key pages
against baselines in `__screenshots__/<platform>/<project>/` (Chromium only);
missing baselines are created on first run, and `--update-snapshots` refreshes
them after an intentional visual change.

## Reports And CI

`npm run test:ui:report` opens the HTML report. JSON results and chapter screenshots
are written under `test-results`; failure traces are retained for debugging.
The `Astro UI checks` GitHub workflow runs the suite on changes to Astro sources
and uploads the report and test artifacts.

The suite does not exhaust every algorithm input or test the external C++
compiler, audio provider, or every CDN-dependent feature. Projects `firefox`
(desktop) and `webkit-mobile` (iPhone 13) run the same suites; CI treats them as
informational until the PR1 fixes land.
