# 04 · Rulare C++

_Actualizat în: PR0_

![Rulare C++](diagrams/cpp-run.svg)

| Loc | Mecanism | Limitări |
|---|---|---|
| `editor.astro` | `<textarea>` + OneCompiler în iframe (lazy) | Cod copiat manual; fără erori pe linie; fără fișiere (`bac.txt`); fără salvare |
| `capitole/introducere.astro` | OneCompiler în iframe + link OnlineGDB | La fel ca editorul |
| `examen-alb.astro` | Copiază codul și deschide OnlineGDB | Din PR1: mesajul „copiat” apare doar dacă a reușit; altfel codul e selectat pentru Ctrl+C |
| `variante-2009.astro` | `transpileCppToJs` (regex) + `new Function` | Rulează pe thread-ul principal, fără timeout; teste fixe 5/10/3 pentru toate problemele |

Planificat (PR5): editor CodeMirror 6, compilare prin Wandbox (fișier `bac.txt` real) cu Compiler Explorer ca rezervă, erori subliniate pe linie cu explicații în română; același mecanism în `variante-2009`, `examen-alb` și `introducere`.
