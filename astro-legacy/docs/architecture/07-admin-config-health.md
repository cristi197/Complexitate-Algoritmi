# 07 · Admin, configurare globală și health checks

_Actualizat în: PR0_

**Nu există încă.** Site-ul nu are configurare globală și nici pagină de admin.

Planificat (PR9):
- `site-config.json` pe branch-ul `site-config`, citit de la `raw.githubusercontent.com`, cu secțiunile `voice` și `analizaBac` (`enabled`, `reason`, `changedAt`, `changedBy`).
- Health checks în GitHub Actions: starea Space-ului la 30 de minute, generare de test la 6 ore; după 2 eșecuri consecutive, dezactivare automată + issue. Reactivarea e doar manuală.
- Pagina `/admin` (fără indexare): stare, motiv, ora ultimei verificări, butoane prin `workflow_dispatch` cu un token GitHub limitat ținut în `sessionStorage`, plus link direct la workflow.
