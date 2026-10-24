# Astro UI Regression Tests

Run from `astro-legacy` with Node.js 22.12 or newer:

```sh
npm ci
npx playwright install chromium
npm run build
npm run test:ui
```

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

## Reports And CI

`npm run test:ui:report` opens the HTML report. JSON results and chapter screenshots
are written under `test-results`; failure traces are retained for debugging.
The `Astro UI checks` GitHub workflow runs the suite on changes to Astro sources
and uploads the report and test artifacts.

The suite does not exhaust every algorithm input or test the external C++
compiler, audio provider, or every CDN-dependent feature. Firefox, WebKit, and
real-device assistive technology testing remain separate follow-up work.
