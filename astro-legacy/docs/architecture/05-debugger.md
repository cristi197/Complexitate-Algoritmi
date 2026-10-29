# 05 · Debugger pas cu pas (`debug-live`)

_Actualizat în: PR1_

![Debugger](diagrams/debugger.svg)

- **Nu e un debugger real**: fiecare algoritm are o funcție JavaScript scrisă de mână (`run(inputs)`) care produce o listă de pași afișată lângă un cod C++ fix.
- Control: anterior/următor, reluare, click pe rândul din tabel, săgeți stânga/dreapta. Fără breakpoints și fără stivă de apeluri.
- Calitatea pașilor variază: unele algoritme au pași detaliați, altele un singur pas cu rezultatul.

## Reparații din PR1

- Se citesc toate câmpurile (`input`, `textarea`, `select`), deci matricea scrisă de elev e folosită.
- Explicațiile trec printr-un sanitizer care păstrează doar etichete de formatare (`b`, `strong`, `em`, `code`, `span`, …) fără atribute în afară de `class`; valorile din tabel și din vizualizarea vectorului sunt escapate.
- Rândurile tabelului de trasare au `tabindex="0"` și răspund la Enter/Spațiu.
- Rămas pentru PR6: input-urile mari pot bloca pagina; unele algoritme (rotire, transpunere, …) au un singur pas și ignoră input-ul.

Planificat (PR6): simulator React, câte un fișier per algoritm, pași reali pentru toate algoritmele, stivă de apeluri pentru recursivitate/backtracking, calcul în Web Worker, pagină publică cu link din meniu.
