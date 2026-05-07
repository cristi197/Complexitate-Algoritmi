# InfoLiceu — Algoritmi & Structuri de Date

> Platformă educațională web pentru informatică de liceu și bacalaureat (România · C++)

---

## Descriere

**InfoLiceu** este un ghid interactiv complet, destinat elevilor de liceu care se pregătesc pentru **Bacalaureatul de Informatică**. Conține 8 capitole cu teorie, exemple de cod C++, animații interactive, quizuri și lecții audio.

---

## Funcționalități

| Funcționalitate | Detalii |
|---|---|
| 📚 8 capitole structurate | De la introducere până la backtracking și fișiere |
| 🎬 Animații interactive | Scroll-reveal și vizualizări ale algoritmilor |
| 📝 Quiz interactiv | Întrebări cu dificultate Facil / Mediu / Dificil per capitol |
| 🔊 Player Audiobook | Sincronizare text–audio pe secțiuni, din fișiere JSON + MP3 |
| 📊 Referință Big-O | Tabel comparativ complexitate timp & spațiu |
| ↑ Go-to-Top & progress bar | Navigare facilă în paginile lungi |
| 🤖 Analiză BAC cu AI | Încarcă varianta de BAC (PDF/imagine), AI-ul parsează și explică fiecare exercițiu cu teorie și linkuri spre capitole |
| 🌐 Pur static | Fără framework-uri, fără dependențe externe — rulează direct din browser |

---

## Structura proiectului

```
├── index.html                  # Pagina principală (hero, capitole, Big-O)
├── analiza-bac.html            # Analiză variantă BAC cu AI (PDF/imagine → explicații)
├── css/
│   └── style.css               # Stiluri globale
├── js/
│   ├── platform.js             # Go-to-top, navigare capitole, viteză animații
│   ├── animations.js           # Scroll-reveal și animații partajate
│   ├── quiz.js                 # Motor quiz interactiv
│   └── audiobook.js            # Player audio cu sincronizare text
├── data/
│   └── complexitate.json       # Date tabel Big-O
└── capitole/
    ├── introducere.html        # Capitol 0 — Introducere în informatică
    ├── complexitate.html       # Capitol 1 — Complexitatea algoritmilor
    ├── vectori.html            # Capitol 2 — Vectori
    ├── matrici.html            # Capitol 3 — Matrici
    ├── siruri.html             # Capitol 4 — Șiruri de caractere
    ├── recursivitate.html      # Capitol 5 — Recursivitate
    ├── backtracking.html       # Capitol 6 — Backtracking
    └── fisiere.html            # Capitol 7 — Fișiere
```

---

## Utilizare

Nu necesită instalare sau build. Deschide `index.html` direct în browser sau servește folderul cu orice server HTTP static:

```bash
# Python 3
python -m http.server 8080

# Node.js (npx)
npx serve .
```

Apoi accesează `http://localhost:8080`.

---

## Capitole

| # | Capitol | Conținut principal |
|---|---|---|
| 0 | Introducere | Ce este informatica, calculator, algoritm, primul program C++, tipuri de date, BAC 2026 |
| 1 | Complexitate | Notația Big-O, timp & spațiu, clase de complexitate |
| 2 | Vectori | Declarare, parcurgere, sortare, căutare binară |
| 3 | Matrici | Operații pe matrice, transpusa, spirală |
| 4 | Șiruri | Caractere, operații pe șiruri, palindrom |
| 5 | Recursivitate | Stivă de apeluri, divide et impera, memoizare |
| 6 | Backtracking | Generare permutări, combinări, subseturi |
| 7 | Fișiere | Citire/scriere fișiere text în C++ |

---

## Tehnologii

- **HTML5** / **CSS3** / **JavaScript** (ES5+, fără framework)
- **Intersection Observer API** — scroll-reveal
- **Web Audio / `<audio>`** — player audiobook
- **JSON** — date Big-O și configurare lecții audio

---

## Licență

Proiect educațional open-source. Conținutul este destinat elevilor români care se pregătesc pentru bacalaureat.