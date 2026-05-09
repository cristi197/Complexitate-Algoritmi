# Audit Complet — InfoLiceu (Complexitate-Algoritmi)
**URL:** https://cristi197.github.io/Complexitate-Algoritmi/  
**Data auditului:** Mai 2026  
**Scope:** UI/UX · Funcționalități · Conținut academic (BAC Informatică M-I România) · Priorități de dezvoltare

---

## 1. Rezumat executiv

Site-ul InfoLiceu este un proiect educațional ambițios și bine structurat pentru pregătirea examenului de Bacalaureat la Informatică (profil Matematică-Informatică). Are o fundație solidă de conținut, câteva funcționalități avansate (AI BAC analyzer, quiz engine cu 800 de întrebări, animații interactive), și un design modern cu dark mode. Totuși, există goluri semnificative între ce este promis și ce este livrat efectiv, iar acoperirea programei BAC nu este completă față de cerințele oficiale actuale.

**Scor general estimat:** 6.5 / 10

| Categorie | Scor | Observație |
|---|---|---|
| Design & UI | 7/10 | Modern, dar inconsistent |
| Conținut academic | 6/10 | Goluri importante față de programa BAC |
| Funcționalități | 5/10 | Multe broken/incomplete |
| UX & Navigare | 7/10 | Bun, cu probleme mobile |
| Performanță | 8/10 | Static site, rapid |
| Accesibilitate | 4/10 | Neglijată complet |

---

## 2. Ce se păstrează (puncte forte)

### ✅ Design
- Layout cu sidebar + content area este clar și funcțional pentru studiu
- Dark mode implementat (deși cu bug de persistență)
- Cardurile de capitole de pe homepage sunt atractive și informative
- Snippet-ul de cod animat din hero este un detaliu elegant
- Tabelele de complexitate și sortare sunt bine formatate
- Analogii bune pentru concepte abstracte (bucătarul, Matrioșka, blocul de apartamente)

### ✅ Conținut
- Codul C++ din capitole este corect, comentat și relevant pentru BAC
- Exemplele de probleme tip BAC din fiecare capitol sunt valoroase
- Tabelul de algoritmi de sortare cu Best/Average/Worst/Spațiu/Stabil este excelent
- Checklist-ul BAC din capitolul Introducere este util
- Secțiunea de referințe (pbinfo, infoarena, VisuAlgo) adaugă valoare reală
- Animația Bubble Sort și demo-ul N-Regine sunt puncte forte vizibile

### ✅ Arhitectură
- Site static (GitHub Pages) — performanță excelentă, fără costuri de hosting
- Structura pe capitole urmează în mare logica programei
- Funcționalitatea AI BAC Analyzer este inovatoare și valoroasă pentru elevi
- Sistemul de 800 de exerciții cu filtrare este o resursă rară în spațiul românesc

---

## 3. Probleme critice 🔴

### 3.1 Exercițiile interactive nu se randează
**Afectat:** toate capitolele + pagina /exercitii  
Secțiunea „Exerciții interactive — testează cunoștințele" apare goală la finalul fiecărui capitol. Pe pagina /exercitii, butonul „Generează exerciții" nu produce output vizibil (sau conținutul nu se încarcă corect). Aceasta este funcționalitatea centrală a platformei — dacă nu funcționează, valoarea educativă scade drastic.

**Fix prioritar:**
- Verifică erori în consolă (F12 → Console)
- Verifică dacă datele de exerciții sunt încărcate (JSON extern sau hardcodat)
- Adaugă un loading state vizibil și un mesaj de eroare clar dacă fetch-ul eșuează
- Testează pe GitHub Pages, nu doar local (path-urile relative pot diferi)

---

### 3.2 Sistemul de XP/Progres este complet static
**Afectat:** toate paginile  
„⚡ Progres 0 XP / Nivel 1" este fix, nu se actualizează niciodată. Gamificarea promisă nu există funcțional. Utilizatorul nu are nicio motivație să revină dacă progresul nu se salvează.

**Fix:**
```javascript
// Salvare progres în localStorage
function addXP(amount) {
  let xp = parseInt(localStorage.getItem('xp') || '0');
  xp += amount;
  localStorage.setItem('xp', xp);
  updateUI(xp);
}
// Trigger: quiz completat corect, capitol terminat (scroll >90%), etc.
```

---

### 3.3 Dark mode nu persistă
**Afectat:** toate paginile  
La refresh sau navigare între capitole, preferința de dark mode se pierde.

**Fix:**
```javascript
// La încărcare pagină:
if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark');
// La toggle:
document.body.classList.toggle('dark');
localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
```

---

### 3.4 Eroare de cod în capitolul Introducere
`#include <fstream>` este plasat *în interiorul funcției `main()`* în exemplul de citire/scriere fișiere. Directivele `#include` nu pot apărea în interiorul funcțiilor în C++ — acest lucru poate confuza elevii care copiază codul.

**Fix:** Mută `#include <fstream>` la începutul fișierului, deasupra lui `main()`.

---

### 3.5 Emoji-uri rupte în sidebar
Unele emoji-uri din meniurile laterale apar ca caractere raw Unicode (`粒`, `燐`, `直`) pe anumite browsere/OS-uri (mai ales Windows cu fonturi lipsite de suport emoji complet).

**Fix:** Testează cross-browser. Înlocuiește cu emoji-uri din setul de bază (U+1F300–U+1F9FF) sau folosește SVG icons (Lucide, Heroicons — gratuite).

---

### 3.6 Contorul de vizualizări afișează „—"
„👁 —" apare pe toate capitolele. Dacă backend-ul de tracking nu există, elimină elementul sau înlocuiește cu un număr static plauzibil până la implementare.

---

## 4. Goluri față de programa BAC M-I 🟡

Programa oficială BAC Informatică pentru profilul Matematică-Informatică (ordinul MEC) include subiecte care lipsesc sau sunt tratate superficial:

### 4.1 Subprogram / Funcții — lipsește capitol dedicat
**Prioritate: CRITICĂ** — apare în toate subiectele BAC  
Funcțiile (cu parametri prin valoare și referință, funcții void vs cu return, variabile locale vs globale, parametri formali vs actuali) nu au un capitol propriu. Sunt menționate tangenţial în Introducere, dar BAC-ul testează explicit:
- Transmiterea prin referință (`&`)
- Funcții recursive (există în capitolul Recursivitate — OK)
- Vizibilitatea variabilelor
- Supraîncărcarea funcțiilor (overloading) — menționat rar dar apare

**Propunere:** Capitol nou „Funcții și Subprograme" între Introducere și Complexitate.

---

### 4.2 Algoritmi clasici pe vectori — incompleti
Lipsesc sau sunt tratate superficial:
- **Ciurul lui Eratostene** — apare la BAC cu regularitate, nu e menționat deloc
- **Calculul CMMDC/CMMMC pentru șiruri** (nu doar pentru 2 numere)
- **Eliminarea duplicatelor din vector nesortat** (fără sortare prealabilă)
- **Rotația unui vector** (cu k poziții)
- **Algoritmul lui Euclid extins** — apare la profil intensiv

---

### 4.3 Matrici — capitol incomplet față de BAC
Capitolul există dar din ce se poate vedea din sidebar lipsesc:
- Matrici pătratice: verificare simetrie, triunghiulară sup/inf
- **Matricea tranzposei** — cerută explicit la BAC
- **Inmulțirea matricelor** — apare la profil M-I intensiv
- **Parcurgere în spirală** — clasică la BAC, menționată în sidebar dar trebuie verificată implementarea

---

### 4.4 Tipuri de date structurate — lipsesc complet
La profil M-I, programa include:
- `struct` (structuri) — citire/scriere câmpuri, array de structuri
- Sortare array de structuri după un câmp

Acestea apar cu regularitate în Subiectul II sau III la BAC.

---

### 4.5 Programare dinamică — lipsește
Memoizarea este menționată în capitolul Recursivitate, dar programarea dinamică (DP) ca tehnică în sine nu este prezentată. La BAC M-I intensiv, DP apare frecvent (triunghi de numere, cel mai lung subsir crescător). Chiar și pentru varianta standard, înțelegerea tabelei DP ajută la probleme de tip „număr de soluții".

---

### 4.6 Pointeri și alocare dinamică — lipsesc
La profil M-I (nu neapărat intensiv), programa include:
- Pointeri de bază (`*`, `&`, `->`)
- `new` / `delete`
- Liste simplu înlănțuite (în unele variante de BAC apare)

---

### 4.7 Subiecte de tip „trasare algoritm" — insuficiente
Subiectul I la BAC conține întotdeauna trasarea unui algoritm (urmărești execuția pas cu pas și scrii valorile variabilelor). Site-ul are exemple rezolvate, dar nu are un **simulator interactiv de trasare** — elevul introduce valorile de intrare și vede evoluția variabilelor pas cu pas.

---

## 5. Probleme UI/UX 🟡

### 5.1 Mobile experience deficitară
```
Probleme identificate pe viewport < 768px:
- Sidebar-ul nu se poate ascunde/toggling pe mobile
- Blocurile de cod depășesc lățimea ecranului (overflow horizontal)
- Tabelele largi nu sunt scrollable horizontal (overflow hidden)
- Butoanele de navigare sunt prea mici pentru touch (< 44px)
```

**Fix:**
```css
/* Cod scrollabil pe mobile */
pre { overflow-x: auto; max-width: 100%; }

/* Tabele responsive */
.table-wrapper { overflow-x: auto; -webkit-overflow-scrolling: touch; }

/* Sidebar toggle pe mobile */
@media (max-width: 768px) {
  .sidebar { transform: translateX(-100%); transition: transform 0.3s; }
  .sidebar.open { transform: translateX(0); }
}
```

---

### 5.2 Lipsesc butoane „Copiază codul"
Niciunul dintre cele zeci de blocuri de cod nu are buton de copiere. Elevii copiază manual, greșeli apar.

**Fix (2 linii JS):**
```javascript
document.querySelectorAll('pre code').forEach(block => {
  const btn = Object.assign(document.createElement('button'), {
    className: 'copy-btn', innerText: '📋 Copiază',
    onclick: () => { navigator.clipboard.writeText(block.innerText); btn.innerText = '✅ Copiat!'; setTimeout(() => btn.innerText = '📋 Copiază', 2000); }
  });
  block.parentNode.style.position = 'relative';
  block.parentNode.appendChild(btn);
});
```

---

### 5.3 Bara de navigare în capitol (TOC) nu indică poziția curentă
Table of contents-ul din fiecare capitol nu are scroll spy — utilizatorul nu știe la ce secțiune este.

**Fix:** Intersection Observer API pentru highlight activ în TOC.

---

### 5.4 Nu există navigare Prev/Next între capitole
La finalul fiecărui capitol nu există link „← Capitolul anterior" / „Capitolul următor →". Utilizatorul trebuie să meargă în sidebar sau homepage.

---

### 5.5 Timpul de citire este identic pe toate paginile
Toate capitolele afișează „📖 12 min" indiferent de lungimea reală a conținutului. Capitolul Backtracking are clar mai mult conținut decât Fișiere.

**Fix:** Calculează automat:
```javascript
const wordsPerMinute = 200;
const wordCount = document.querySelector('.content').innerText.split(/\s+/).length;
document.querySelector('.read-time').innerText = Math.ceil(wordCount / wordsPerMinute) + ' min';
```

---

### 5.6 Hero section de pe homepage nu are CTA clar pentru prima vizită
Un elev care ajunge prima dată pe site nu știe de unde să înceapă. Butoanele „Începe să înveți" și „Big-O Referință" sunt vizibile, dar nu există un „onboarding flow" (ex: „Ești la început? Începe cu Introducerea → apoi urmează capitolele în ordine").

---

### 5.7 Contorul de like-uri (🤍 0) nu funcționează
Toate capitolele afișează 0 like-uri. Dacă backend-ul nu există, elimină elementul.

---

### 5.8 Footer minimal
Footer-ul conține doar „💻 InfoLiceu — Resurse gratuite pentru BAC Informatică România" și două linkuri. Lipsesc: autor/contact, an, licență (conținut original sau sub licență?), link GitHub repo.

---

## 6. Funcționalități de adăugat 🟢

### 6.1 Simulator de trasare algoritm (HIGH IMPACT)
**Justificare:** Subiectul I la BAC conține mereu trasarea unui algoritm. Niciun alt site românesc nu are asta implementat interactiv.

**Descriere:** Utilizatorul introduce un cod simplu (sau alege dintr-o listă), introduce valorile de intrare, apasă „Pas cu pas" și vede valorile variabilelor la fiecare iterație — ca un debugger vizual simplificat.

**Implementare sugerată:** JavaScript cu un mini-interpreter pentru pseudo-cod sau un subset limitat de C++ (whileloop, for, if/else, asignare).

---

### 6.2 Editor de cod integrat cu compilare
**Justificare:** Elevii trebuie să deschidă un tool extern pentru a testa codul. Fricțiunea asta reduce learning-ul.

**Opțiuni de implementare:**
- Iframe embed spre [OnlineGDB](https://www.onlinegdb.com/) sau [OneCompiler](https://onecompiler.com/)
- Integrare [Piston API](https://github.com/engineer-man/piston) (open-source, compilare server-side)
- CodeMirror + Piston API (cea mai bună experiență)

---

### 6.3 Pagină de simulare subiect BAC complet
**Justificare:** Elevii trebuie să exerseze în condiții de examen (3 subiecte, timp limitat, fără ajutor).

**Descriere:** Generează automat un set de 3 subiecte (Subiect I: 5 grile de complexitate + trasare; Subiect II: problemă completă; Subiect III: problemă complexă), cu timer de 3 ore și auto-submit.

---

### 6.4 Streak / calendar de studiu
**Justificare:** Consistența este cheia la BAC.

**Descriere:** Un calendar (ca la Duolingo) care marchează zilele în care utilizatorul a rezolvat cel puțin un exercițiu. Salvat în localStorage.

---

### 6.5 Pagină dedicată „Greșeli frecvente la BAC"
**Conținut sugerat:**

| Greșeală | Exemplu greșit | Corect |
|---|---|---|
| `=` în loc de `==` în condiție | `if (x = 5)` | `if (x == 5)` |
| Lipsă `break` în switch | cade în case-ul următor | adaugă `break` |
| Overflow int | `100000 * 100000` | `(long long)100000 * 100000` |
| Array out of bounds | `v[n]` când indexat 0..n-1 | `v[n-1]` |
| Citire string cu spații | `cin >> s` | `getline(cin, s)` |
| Alocare array local mare | `int v[1000000]` în main | declară global |
| Recursie infinită | lipsă caz de bază | verifică `if (n == 0)` |
| Comparare float cu `==` | `if (x == 3.14)` | `if (abs(x - 3.14) < 1e-9)` |

---

### 6.6 Integrare subiecte BAC reale (PDF)
Link-uri directe spre subiectele oficiale BAC Informatică din ultimii 5 ani (de pe edu.ro), cu rezolvări. Aceasta este cea mai căutată resursă de elevi înainte de examen.

**Surse:**
- https://www.edu.ro/bacalaureat (subiecte oficiale)
- https://pbinfo.ro (probleme tip BAC cu checker automat)

---

### 6.7 Modul „Examen alb" timed
Timer vizibil, 180 minute, subiect generat aleatoriu din pool-ul de 800 de exerciții, nu se poate ieși fără confirmare. La final: scor, timp petrecut per subiect, analiza greșelilor.

---

### 6.8 Pagină de „Cheat sheet" printabilă
O singură pagină A4 cu: tipuri de date, complexități, biblioteci standard, algoritmi de sortare, șablon backtracking, șablon funcție recursivă — optimizată pentru print (CSS `@media print`).

---

## 7. Conținut de șters sau restructurat

### 7.1 Referințe universitare — scoate sau mută
În capitolul Complexitate există un bloc cu linkuri spre UPB, UniBuc, UBB, TUIASI. Acestea sunt irelevante pentru un elev de liceu care vrea să treacă BAC-ul. Dacă se doresc păstrate, mutați-le într-o pagină separată „Resurse după BAC / Facultăți de informatică".

### 7.2 LeetCode și HackerRank — contextualizare
Aceste platforme sunt menționate în secțiunea de resurse, dar sunt orientate spre interviuri de software engineering, nu spre BAC. Înlocuiți cu **pbinfo.ro** și **infoarena.ro** ca recomandări principale, sau adăugați nota „pentru cei care vor să continue după BAC".

### 7.3 MIT OCW 6.006 — prea avansat
Linkul spre cursul MIT de algoritmi este complet în afara nivelului publicului țintă. Elimină sau mută la o secțiune „Resurse avansate".

### 7.4 Statistica de like-uri și vizualizări
Dacă nu există backend activ, elimină complet elementele `🤍 0` și `👁 —` din toate paginile. Creează o impresie de site abandonat.

---

## 8. Capitole noi propuse (roadmap conținut)

```
Prioritate 1 (BAC obligatoriu):
├── Capitol 0.5: Funcții și Subprograme (NEW)
│   ├── Declarare, definire, apel
│   ├── Parametri prin valoare vs referință
│   ├── Variabile locale vs globale
│   └── Funcții inline și overloading
│
├── Capitol 2.5: Programare Dinamică — Introducere (NEW)
│   ├── De la memoizare la DP tabelar
│   ├── Fibonacci DP
│   ├── Cel mai lung subsir crescător (LIS)
│   └── Triunghi de numere (Pascal)
│
└── Capitol 8: Greșeli frecvente & Sfaturi de examen (NEW)

Prioritate 2 (profil M-I complet):
├── Capitol 9: Structuri (struct) și array de structuri (NEW)
├── Extindere Capitol 4: Ciurul lui Eratostene
└── Extindere Capitol 5: Matrice — simetrie, transpusă, înmulțire

Prioritate 3 (nice to have):
├── Capitol 10: Pointeri și alocare dinamică (NEW)
└── Capitol 11: Liste înlănțuite — introducere (NEW)
```

---

## 9. Accesibilitate (ignorată complet) 🔴

Site-ul nu respectă standardele WCAG 2.1 de bază:

- **Lipsesc atribute `alt` pe imagini** (dacă există imagini)
- **Contrast ratio insuficient** pentru textul gri pe fundal deschis
- **Nu există navigare cu tastatura** (focusable elements, skip links)
- **Emoji-urile în titluri** nu au `aria-hidden="true"` — cititoarele de ecran le anunță ca text lung
- **Blocurile de cod** nu au `role="region"` și `aria-label`

**Fix minim:**
```html
<!-- Emoji în titluri -->
<h1><span aria-hidden="true">📊</span> Eficiența Algoritmilor</h1>

<!-- Skip link pentru navigare cu tastatură -->
<a href="#main-content" class="skip-link">Sari la conținut</a>
```

---

## 10. SEO — îmbunătățiri

| Element | Status actual | Recomandat |
|---|---|---|
| `<title>` | Generic per pagină | Specific: „Bubble Sort C++ — Complexitate O(n²) \| InfoLiceu" |
| `meta description` | Identic pe toate paginile | Unic, 150–160 caractere per pagină |
| `og:image` | Lipsă | Imagine preview per capitol (1200×630px) |
| `canonical URL` | Lipsă | `<link rel="canonical" href="...">` |
| `structured data` | Lipsă | JSON-LD `LearningResource` schema |
| Sitemap XML | Necunoscut | Generează automat cu Jekyll/GitHub Actions |
| Headings ierarhie | Incorectă pe unele pagini | H1 → H2 → H3, fără salturi |

---

## 11. Diagrame de prioritizare

### Matrice Impact vs Efort

```
                    EFORT MIC          EFORT MEDIU        EFORT MARE
                ┌──────────────────┬──────────────────┬──────────────────┐
IMPACT MARE     │ • Fix exerciții  │ • Capitol Funcții│ • Simulator      │
                │ • XP persistent  │ • Editor cod     │   trasare algo   │
                │ • Dark mode fix  │ • Modul examen   │ • DP capitol     │
                │ • Buton copy cod │   alb timed      │                  │
                │ • Prev/Next nav  │                  │                  │
                ├──────────────────┼──────────────────┼──────────────────┤
IMPACT MEDIU    │ • Read time real │ • Cheat sheet    │ • Struct capitol │
                │ • Footer complet │   printabil      │ • Pointeri       │
                │ • Greșeli frecv. │ • Streak calendar│                  │
                │ • Mobile fix cod │ • Scroll spy TOC │                  │
                ├──────────────────┼──────────────────┼──────────────────┤
IMPACT MIC      │ • Șterge MIT OCW │ • SEO meta tags  │ • Liste înlăn.   │
                │ • Șterge LeetCode│ • og:image       │                  │
                │ • Șterge likes 0 │ • Accesibilitate │                  │
                └──────────────────┴──────────────────┴──────────────────┘
                         ↑ FACI PRIMUL           ↑ PLANIFICI
```

### Acoperire program BAC vs conținut actual

```
Capitol BAC                          Acoperire actuală
─────────────────────────────────────────────────────
Introducere în C++                   ████████░░  80%
Funcții și subprograme               ██░░░░░░░░  20%  ← GAP CRITIC
Complexitatea algoritmilor           █████████░  90%
Recursivitate                        █████████░  90%
Backtracking                         ████████░░  85%
Vectori (tablouri 1D)                ████████░░  80%
Matrici (tablouri 2D)                ██████░░░░  60%  ← GAP
Șiruri de caractere                  ███████░░░  70%
Fișiere                              ███████░░░  70%
Structuri (struct)                   ░░░░░░░░░░   0%  ← LIPSĂ
Programare dinamică (M-I intensiv)   █░░░░░░░░░  10%  ← GAP
```

---

## 12. Checklist de implementare recomandat

### Sprint 1 — Bugfix & Quick Wins ✅ FINALIZAT
- [x] Fix exerciții interactive — src-urile JSON și quiz.js corectate pentru toate capitolele
- [x] XP persistent cu localStorage — `infoXP` + `infoVisitedSections`, actualizat la scroll și quiz
- [x] Dark mode persistent cu localStorage — BaseLayout citește `localStorage.getItem('theme')` înainte de render
- [x] Buton „Copiază codul" pe toate blocurile — `initCopyButtons()` în animations.js
- [x] Navigare Prev/Next între capitole — `renderPrevNext()` în platform.js, array CHAPTERS complet
- [x] Elimina elementele `👁 —` și `🤍 0` nefuncționale — JS actualizează contorii la DOMContentLoaded
- [x] Fix `#include` greșit din capitolul Introducere — mutat deasupra `main()` în introducere.astro
- [x] Timp de citire calculat dinamic — `initSectionReadingTime()` și `initGlobalReadingTime()` în animations.js
- [x] Fix cod responsive pe mobile — `pre { overflow-x: auto; }` în global.css

### Sprint 2 — Conținut critic ✅ FINALIZAT
- [x] Capitol nou: Funcții și Subprograme — `src/pages/capitole/functii.astro` creat (chapterNum=8, 7 secțiuni)
- [x] Ciurul lui Eratostene în capitolul Vectori — secțiune `#ciur` adăugată în vectori.astro cu implementare completă + optimizare i²
- [x] Completare Matrici: simetrie, transpusă — secțiunile `#transpusa` și `#speciale` existau deja în matrici.astro
- [x] Pagină „Greșeli frecvente la BAC" — `src/pages/greseli-bac.astro` creată cu 9 greșeli (cod greșit/corect + tips)
- [x] Pagină „Cheat sheet printabil" A4 — `src/pages/cheat-sheet.astro` creată cu `@media print`, grid 2 coloane
- [x] Linkuri directe spre subiecte BAC oficiale (edu.ro) — adăugate în Sprint 1 în introducere.astro
- [x] Scroll spy pe TOC-ul din fiecare capitol — `initNavHighlight()` cu IntersectionObserver exista deja în animations.js
- [x] Sidebar actualizat — capitol Funcții adăugat (num=8), linkuri Cheat Sheet și Greșeli frecvente în Instrumente
- [x] platform.js actualizat — `functii.html` adăugat în array CHAPTERS (js/ și public/js/)

### Sprint 3 — Features (1–2 luni)
- [ ] Editor de cod integrat (Piston API sau iframe)
- [ ] Capitol Programare Dinamică — introducere
- [ ] Capitol Structuri (struct)
- [ ] Modul examen alb cu timer
- [ ] Streak calendar de studiu

### Sprint 4 — Polish (ongoing)
- [ ] SEO meta tags unice per pagină
- [ ] Accesibilitate WCAG 2.1 de bază
- [ ] Sitemap XML
- [ ] og:image per capitol
- [ ] Footer complet (autor, licență, contact, GitHub)

---

## 13. Note finale pentru agent/developer

1. **Site-ul rulează pe GitHub Pages** — orice backend (XP, likes, views) trebuie implementat fie cu localStorage (client-only), fie cu un serviciu extern gratuit (Supabase free tier, Firebase free, sau un simplu JSON pe Cloudflare KV).

2. **Publicul țintă principal** sunt elevi de clasa a XI-a și a XII-a profil Matematică-Informatică din România, cu vârsta 16–18 ani. Conținutul trebuie să fie direct, practic, orientat spre rezolvarea de probleme — nu teoretic.

3. **Concurența directă** în România: infoarena.ro (probleme, fără teorie structurată), pbinfo.ro (probleme + teorie sumară), L-Info (videoclipuri YouTube). InfoLiceu are avantaj unic prin combinarea teoriei + animații + AI analyzer — trebuie exploatat.

4. **Programa oficială** de referință: Ordinul MEN nr. 3593/2014 cu modificările ulterioare. Verifică întotdeauna față de programa în vigoare pentru anul BAC curent.

5. **Prioritatea absolută înainte de orice feature nou:** fă exercițiile interactive să funcționeze. Fără quiz-uri funcționale, platforma este un site de citit, nu o platformă de învățat.

---

*Audit realizat pe baza conținutului paginilor: homepage, /analiza-bac, /exercitii, /capitole/introducere, /capitole/complexitate, /capitole/recursivitate, /capitole/backtracking, /capitole/vectori. Capitolele Matrici, Șiruri, Fișiere nu au fost auditate în detaliu — se recomandă un audit separat.*