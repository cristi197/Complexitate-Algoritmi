# 05 · Debugger pas cu pas (`debug-live`)

_Actualizat în: PR0_

![Debugger](diagrams/debugger.svg)

- **Nu e un debugger real**: fiecare algoritm are o funcție JavaScript scrisă de mână (`run(inputs)`) care produce o listă de pași afișată lângă un cod C++ fix.
- Control: anterior/următor, reluare, click pe rândul din tabel, săgeți stânga/dreapta. Fără breakpoints și fără stivă de apeluri.
- Calitatea pașilor variază: unele algoritme au pași detaliați, altele un singur pas cu rezultatul.

## Probleme cunoscute (PR1)

- Valorile din câmpurile `<textarea>` (matrice) sunt ignorate; se folosește matricea de exemplu.
- Textul introdus ajunge în `innerHTML` prin `step.exp` fără escapare (injecție HTML).
- Rândurile din tabel nu sunt accesibile din tastatură; input-urile mari pot bloca pagina.

Planificat (PR6): simulator React, câte un fișier per algoritm, pași reali pentru toate algoritmele, stivă de apeluri pentru recursivitate/backtracking, calcul în Web Worker, pagină publică cu link din meniu.
