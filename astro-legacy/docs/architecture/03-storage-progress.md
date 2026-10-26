# 03 · Stocare, progres și service worker

_Actualizat în: PR0_

## localStorage

![Chei localStorage](diagrams/storage.svg)

| Cheie | Scrisă de | Conținut |
|---|---|---|
| `theme` | `site.js` | `light` / `dark` |
| `infoLiceu_v2` | `progress.js` | Capitole vizitate, quiz, XP |
| `infoXP` | `animations.js` | XP din secțiuni citite |
| `infoVisitedSections` | `animations.js` | Secțiuni citite pe capitol |
| `infoStudyDays` | `progress.js`, `streak`, `examen-alb` | Zile de studiu (`YYYY-MM-DD`) |
| `infoStudyGoals` | `streak` | Obiectivele zilei |
| `infoExamAlbHistory` | `examen-alb` | Ultimele 20 de simulări |
| `v09_visited`, `v09_grile_scor`, `v09_coding_scor` | `variante-2009` | Progres variante 2009 |
| `infoLiceu_analytics` | `analytics.js` | Statistici locale (nu se trimit nicăieri) |
| `pv_<path>` + like-uri | `platform.js` | Contoare locale |

**Problemă cunoscută:** XP-ul are două surse (`infoLiceu_v2` și `infoXP`) care se suprascriu în sidebar. Se repară în PR1; în PR3 toate cheile trec la formatul versionat `infoliceu:v2:*` cu migrare automată.

## Service worker

![Service worker](diagrams/service-worker.svg)

- `public/sw.js`, cache cu nume fix `infoLiceu-v2`.
- `install`: precache pagini cheie, `search.js`, `progress.js`, `platform.js`, exercițiile pe capitole.
- `fetch`: network-first pentru GET same-origin, cache ca rezervă offline.
- În teste, service worker-ul e blocat (`serviceWorkers: 'block'`).

Planificat (PR3): cache pe tipuri (HTML network-first, `/_astro/*` cache-first, JSON stale-while-revalidate, audio LRU 50 MB), nume de cache cu versiunea build-ului și mesaj „Versiune nouă disponibilă”.
