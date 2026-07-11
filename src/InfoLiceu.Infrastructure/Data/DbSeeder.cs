using System.Text.Json;
using InfoLiceu.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace InfoLiceu.Infrastructure.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        if (await db.Chapters.AnyAsync()) return;

        var chapters = GetSeedChapters();
        db.Chapters.AddRange(chapters);
        await db.SaveChangesAsync();

        var exercises = GetSeedExercises(chapters);
        db.Exercises.AddRange(exercises);
        await db.SaveChangesAsync();
    }

    private static List<Chapter> GetSeedChapters()
    {
        return
        [
            new() { Slug = "introducere", Title = "Introducere în Algoritmi", Subtitle = "Ce este un algoritm?", Icon = "🧠", OrderIndex = 1, EstimatedMin = 20,
                ContentJson = JsonSerializer.Serialize(new object[]
                {
                    new { title = "Ce este un algoritm?", body = "Un algoritm este o **succesiune finită și bine definită** de operații elementare care, executate într-o ordine precisă, rezolvă o anumită problemă." },
                    new { title = "Proprietățile algoritmilor", body = "**Finitudine** — se termină după un număr finit de pași.\n**Claritate** — fiecare pas este lipsit de ambiguitate.\n**Generalitate** — rezolvă o clasă de probleme, nu doar un caz particular.\n**Intrare/Ieșire** — primește date de intrare și produce rezultate." },
                    new { title = "Exemplu: Algoritmul lui Euclid", body = "Cel mai vechi algoritm cunoscut (~300 î.Hr.) — calculează CMMDC a două numere.", code = "int cmmdc(int a, int b) {\n    while (b != 0) {\n        int r = a % b;\n        a = b;\n        b = r;\n    }\n    return a;\n}", language = "cpp" },
                    new { title = "De la problemă la algoritm", body = "1. **Înțelegi** problema\n2. **Identifici** datele de intrare și ieșire\n3. **Elaborezi** pașii algoritmului (pseudocod)\n4. **Implementezi** în limbajul ales\n5. **Testezi** pe cazuri diverse" }
                }) },
            new() { Slug = "complexitate-algoritmi", Title = "Complexitatea Algoritmilor", Subtitle = "Eficiență și notații asimptotice", Icon = "📊", OrderIndex = 2, EstimatedMin = 30,
                ContentJson = JsonSerializer.Serialize(new object[]
                {
                    new { title = "De ce măsurăm complexitatea?", body = "Pentru a compara algoritmi **independent de hardware**. Doi algoritmi care rezolvă aceeași problemă pot avea performanțe radical diferite la date mari." },
                    new { title = "Notația O (Big-O) — limita superioară", body = "O(f(n)) descrie **cel mai rău caz** — cât de mult crește timpul de execuție în funcție de dimensiunea datelor n.", code = "// O(n) — liniar\nfor (int i = 0; i < n; i++) {\n    // operație constantă\n}", language = "cpp" },
                    new { title = "Clase comune de complexitate", body = "| Notație | Nume | Exemplu |\n|---------|------|--------|\n| O(1) | Constant | Acces element vector |\n| O(log n) | Logaritmic | Căutare binară |\n| O(n) | Liniar | Parcurgere vector |\n| O(n log n) | Log-liniar | Merge Sort |\n| O(n²) | Pătratic | Bubble Sort |\n| O(2ⁿ) | Exponențial | Backtracking |" },
                    new { title = "Spațiu vs Timp", body = "Complexitatea **temporală** măsoară numărul de operații.\nComplexitatea **spațială** măsoară memoria utilizată.\n\nAdesea există un **trade-off**: poți folosi mai multă memorie pentru a reduce timpul (memoizare)." }
                }) },
            new() { Slug = "vectori", Title = "Vectori (Tablouri Unidimensionale)", Subtitle = "Operații și parcurgeri", Icon = "📋", OrderIndex = 3, EstimatedMin = 25,
                ContentJson = JsonSerializer.Serialize(new object[]
                {
                    new { title = "Declarare și inițializare", body = "Un vector este o colecție de elemente de același tip, stocate în zone de memorie consecutive.", code = "// Declarare\nint v[100];           // static, 100 elemente\nint* v = new int[n]; // dinamic, n elemente\n\n// Inițializare\nint v[] = {1, 2, 3, 4, 5};", language = "cpp" },
                    new { title = "Parcurgerea vectorilor", body = "Parcurgerea se face cel mai frecvent cu o buclă `for`. Indexarea începe de la 0.", code = "for (int i = 0; i < n; i++) {\n    cout << v[i] << \" \";\n}", language = "cpp" },
                    new { title = "Operații fundamentale", body = "**Căutare secvențială** — O(n)\n**Căutare binară** — O(log n) (necesită vector sortat)\n**Inserare/Ștergere** — O(n) (deplasare elemente)\n**Sortare** — O(n log n) cu algoritmi eficienți" }
                }) },
            new() { Slug = "matrici", Title = "Matrici (Tablouri Bidimensionale)", Subtitle = "Operații pe linii și coloane", Icon = "🔲", OrderIndex = 4, EstimatedMin = 30,
                ContentJson = JsonSerializer.Serialize(new object[]
                {
                    new { title = "Declararea matricilor", body = "O matrice este un tablou bidimensional: linii × coloane.", code = "int a[100][100];              // static\nint** a = new int*[n];        // dinamic\nfor (int i = 0; i < n; i++)\n    a[i] = new int[m];", language = "cpp" },
                    new { title = "Parcurgerea pe linii", body = "Cea mai eficientă metodă (cache-friendly):", code = "for (int i = 0; i < n; i++)\n    for (int j = 0; j < m; j++)\n        cout << a[i][j] << \" \";", language = "cpp" },
                    new { title = "Parcurgerea pe coloane", body = "Mai puțin eficientă (cache misses):", code = "for (int j = 0; j < m; j++)\n    for (int i = 0; i < n; i++)\n        cout << a[i][j] << \" \";", language = "cpp" }
                }) },
            new() { Slug = "siruri", Title = "Șiruri de Caractere", Subtitle = "Stringuri și prelucrări", Icon = "🔤", OrderIndex = 5, EstimatedMin = 25,
                ContentJson = JsonSerializer.Serialize(new object[]
                {
                    new { title = "Char arrays vs std::string", body = "În C++ poți folosi **char[]** (stil C) sau **std::string** (recomandat).", code = "#include <string>\nstring s = \"Hello\";\ns += \" World\";  // concatenare\nint len = s.length();", language = "cpp" },
                    new { title = "Operații utile", body = "- `s.length()` — lungimea\n- `s.substr(start, len)` — subșir\n- `s.find(\"text\")` — căutare\n- `s[i]` — acces caracter", code = "string s = \"informatica\";\nstring sub = s.substr(0, 4); // \"info\"\nsize_t pos = s.find(\"mat\"); // 6", language = "cpp" }
                }) },
            new() { Slug = "functii", Title = "Funcții și Proceduri", Subtitle = "Modularizare și parametri", Icon = "⚙️", OrderIndex = 6, EstimatedMin = 20,
                ContentJson = JsonSerializer.Serialize(new object[]
                {
                    new { title = "Definirea funcțiilor", body = "Funcțiile încapsulează logică reutilizabilă. O funcție are: tip returnat, nume, parametri, corp.", code = "int suma(int a, int b) {\n    return a + b;\n}\n\nvoid afiseaza(int x) {\n    cout << x << endl;\n}", language = "cpp" },
                    new { title = "Transmiterea parametrilor", body = "**Prin valoare** — se copiază (nu modifică originalul)\n**Prin referință (&)** — modifică variabila originală\n**const referință** — acces rapid, fără copiere, fără modificare" }
                }) },
            new() { Slug = "recursivitate", Title = "Recursivitate", Subtitle = "Funcții care se autoapelează", Icon = "🔄", OrderIndex = 7, EstimatedMin = 35,
                ContentJson = JsonSerializer.Serialize(new object[]
                {
                    new { title = "Ce este recursivitatea?", body = "O funcție **recursivă** se apelează pe sine direct sau indirect. Are nevoie de o **condiție de oprire** (caz de bază).", code = "int factorial(int n) {\n    if (n <= 1) return 1;       // caz bază\n    return n * factorial(n-1); // pas recursiv\n}", language = "cpp" },
                    new { title = "Exemplu: Fibonacci", body = "Șirul Fibonacci: 0, 1, 1, 2, 3, 5, 8, ...", code = "int fib(int n) {\n    if (n <= 1) return n;\n    return fib(n-1) + fib(n-2);\n}", language = "cpp" },
                    new { title = "Atenție la performanță!", body = "Recursivitatea naivă poate duce la **complexitate exponențială** (ex: Fibonacci). Soluții:\n- **Memoizare** — salvezi rezultatele deja calculate\n- **Programare dinamică** — construiești de jos în sus\n- **Eliminare recursie coadă** — compilatorul optimizează" }
                }) },
            new() { Slug = "fisiere", Title = "Fișiere Text", Subtitle = "Citire și scriere în C++", Icon = "📁", OrderIndex = 8, EstimatedMin = 20,
                ContentJson = JsonSerializer.Serialize(new object[]
                {
                    new { title = "Citire din fișier", body = "Folosește `ifstream` pentru a citi date.", code = "#include <fstream>\nifstream fin(\"date.in\");\nint n; fin >> n;\nfin.close();", language = "cpp" },
                    new { title = "Scriere în fișier", body = "Folosește `ofstream` pentru a scrie rezultate.", code = "#include <fstream>\nofstream fout(\"date.out\");\nfout << rezultat << endl;\nfout.close();", language = "cpp" }
                }) },
            new() { Slug = "structuri", Title = "Structuri de Date", Subtitle = "Stive, cozi, liste", Icon = "🏗️", OrderIndex = 9, EstimatedMin = 40,
                ContentJson = JsonSerializer.Serialize(new object[]
                {
                    new { title = "Stiva (Stack) — LIFO", body = "Last In, First Out. Operații: push, pop, top.", code = "#include <stack>\nstack<int> s;\ns.push(10); s.push(20);\nint top = s.top(); // 20\ns.pop();", language = "cpp" },
                    new { title = "Coada (Queue) — FIFO", body = "First In, First Out. Operații: push, pop, front.", code = "#include <queue>\nqueue<int> q;\nq.push(10); q.push(20);\nint front = q.front(); // 10\nq.pop();", language = "cpp" }
                }) },
            new() { Slug = "pointeri", Title = "Pointeri și Alocare Dinamică", Subtitle = "Gestiunea memoriei în C++", Icon = "👉", OrderIndex = 10, EstimatedMin = 35,
                ContentJson = JsonSerializer.Serialize(new object[]
                {
                    new { title = "Ce este un pointer?", body = "Un pointer este o variabilă care **stochează o adresă de memorie**." },
                    new { title = "new și delete", body = "Alocarea dinamică se face cu `new` și eliberarea cu `delete`.", code = "int* p = new int(42);\ncout << *p;  // 42\ndelete p;\n\nint* arr = new int[100];\ndelete[] arr;", language = "cpp" }
                }) },
            new() { Slug = "backtracking", Title = "Backtracking", Subtitle = "Generarea soluțiilor prin încercări", Icon = "🔙", OrderIndex = 11, EstimatedMin = 40,
                ContentJson = JsonSerializer.Serialize(new object[]
                {
                    new { title = "Ce este backtrackingul?", body = "Backtrackingul este o tehnică de **căutare exhaustivă** care construiește incremental soluția și **renunță** (backtrack) când o cale nu duce la o soluție validă." },
                    new { title = "Structura tipică", body = "Toți algoritmii de backtracking urmează acest șablon:", code = "void back(int k) {\n    if (k > n) { afiseaza(); return; }\n    for (int i = 1; i <= n; i++) {\n        x[k] = i;\n        if (valid(k)) back(k+1);\n    }\n}", language = "cpp" }
                }) },
            new() { Slug = "programare-dinamica", Title = "Programare Dinamică", Subtitle = "Optimizare prin memoizare", Icon = "📈", OrderIndex = 12, EstimatedMin = 40,
                ContentJson = JsonSerializer.Serialize(new object[]
                {
                    new { title = "Principiul optimalității", body = "**O soluție optimă conține subsoluții optime.** Dacă știi răspunsul pentru subprobleme, poți construi răspunsul pentru problema mare." },
                    new { title = "Rucsacul (Knapsack) — PD clasică", body = "Avem n obiecte cu greutate și valoare. Vrem să umplem un rucsac de capacitate G cu valoare maximă.", code = "for (int i = 1; i <= n; i++)\n    for (int j = 1; j <= G; j++)\n        if (w[i] <= j)\n            dp[i][j] = max(dp[i-1][j],\n                dp[i-1][j-w[i]] + v[i]);\n        else\n            dp[i][j] = dp[i-1][j];", language = "cpp" }
                }) },
            new() { Slug = "grafuri", Title = "Grafuri și Arbori", Subtitle = "Parcurgeri și algoritmi fundamentali", Icon = "🕸️", OrderIndex = 13, EstimatedMin = 45,
                ContentJson = JsonSerializer.Serialize(new object[]
                {
                    new { title = "Reprezentarea grafurilor", body = "Două metode principale:\n- **Matrice de adiacență** — O(n²) memorie, bună pentru grafuri dense\n- **Liste de adiacență** — O(n+m) memorie, recomandată pentru grafuri rare" },
                    new { title = "Parcurgerea BFS (Lățime)", body = "Folosește o **coadă**. Vizitează nodurile nivel cu nivel.", code = "queue<int> q;\nq.push(start);\nwhile (!q.empty()) {\n    int node = q.front(); q.pop();\n    for (int vecin : adj[node])\n        if (!viz[vecin]) {\n            viz[vecin] = true;\n            q.push(vecin);\n        }\n}", language = "cpp" },
                    new { title = "Parcurgerea DFS (Adâncime)", body = "Folosește **recursivitate**. Explorează cât de adânc posibil înainte de a reveni.", code = "void dfs(int node) {\n    viz[node] = true;\n    for (int vecin : adj[node])\n        if (!viz[vecin])\n            dfs(vecin);\n}", language = "cpp" }
                }) },
        ];
    }

    private static List<Exercise> GetSeedExercises(List<Chapter> chapters)
    {
        var bySlug = chapters.ToDictionary(c => c.Slug);
        return
        [
            // Introducere
            new() { ChapterId = bySlug["introducere"].Id, Type = ExerciseType.MultipleChoice, Difficulty = Difficulty.Easy,
                Question = "Ce este un algoritm?", CorrectAnswer = "O succesiune finită de pași",
                OptionsJson = """["O succesiune finită de pași","Un program C++","O funcție matematică","Un tip de date"]""",
                Explanation = "Un algoritm este o succesiune finită și bine definită de operații care rezolvă o problemă." },
            new() { ChapterId = bySlug["introducere"].Id, Type = ExerciseType.MultipleChoice, Difficulty = Difficulty.Easy,
                Question = "Care este criteriul principal de evaluare a unui algoritm?", CorrectAnswer = "Eficiența (timp + spațiu)",
                OptionsJson = """["Eficiența (timp + spațiu)","Lungimea codului","Numărul de variabile","Limbajul de programare"]""" },

            // Complexitate
            new() { ChapterId = bySlug["complexitate-algoritmi"].Id, Type = ExerciseType.MultipleChoice, Difficulty = Difficulty.Medium,
                Question = "Ce reprezintă notația O (Big-O)?", CorrectAnswer = "Limita superioară a timpului de execuție",
                OptionsJson = """["Limita superioară a timpului de execuție","Timpul exact de execuție","Memoria utilizată","Numărul de linii de cod"]""",
                Explanation = "O(f(n)) descrie cel mai rău caz — limita superioară asimptotică." },
            new() { ChapterId = bySlug["complexitate-algoritmi"].Id, Type = ExerciseType.MultipleChoice, Difficulty = Difficulty.Medium,
                Question = "Care este complexitatea căutării binare?", CorrectAnswer = "O(log n)",
                OptionsJson = """["O(log n)","O(n)","O(n²)","O(1)"]""" },

            // Vectori
            new() { ChapterId = bySlug["vectori"].Id, Type = ExerciseType.MultipleChoice, Difficulty = Difficulty.Easy,
                Question = "Care este indexul primului element într-un vector C++?", CorrectAnswer = "0",
                OptionsJson = """["0","1","Depinde de declarare","-1"]""" },
            new() { ChapterId = bySlug["vectori"].Id, Type = ExerciseType.MultipleChoice, Difficulty = Difficulty.Medium,
                Question = "Ce face algoritmul de căutare secvențială?", CorrectAnswer = "Parcurge toate elementele până găsește valoarea",
                OptionsJson = """["Parcurge toate elementele până găsește valoarea","Sare la jumătate","Sortează vectorul","Folosește divide et impera"]""" },

            // Matrici
            new() { ChapterId = bySlug["matrici"].Id, Type = ExerciseType.MultipleChoice, Difficulty = Difficulty.Easy,
                Question = "Cum accesezi elementul de pe linia i, coloana j într-o matrice?", CorrectAnswer = "matrice[i][j]",
                OptionsJson = """["matrice[i][j]","matrice[i,j]","matrice(j,i)","matrice{i,j}"]""" },

            // Recursivitate
            new() { ChapterId = bySlug["recursivitate"].Id, Type = ExerciseType.MultipleChoice, Difficulty = Difficulty.Medium,
                Question = "Ce condiție este esențială într-o funcție recursivă?", CorrectAnswer = "Condiția de oprire (cazul de bază)",
                OptionsJson = """["Condiția de oprire (cazul de bază)","Un loop for","O variabilă globală","Un fișier extern"]""" },

            // Backtracking
            new() { ChapterId = bySlug["backtracking"].Id, Type = ExerciseType.MultipleChoice, Difficulty = Difficulty.Hard,
                Question = "Ce problemă clasică se rezolvă prin backtracking?", CorrectAnswer = "Problema celor N regine",
                OptionsJson = """["Problema celor N regine","Căutarea binară","Sortarea rapidă","Cel mai scurt drum"]""" },

            // Programare dinamică
            new() { ChapterId = bySlug["programare-dinamica"].Id, Type = ExerciseType.MultipleChoice, Difficulty = Difficulty.Hard,
                Question = "Care este diferența dintre recursivitate simplă și PD?", CorrectAnswer = "PD memorează rezultatele intermediare (memoizare)",
                OptionsJson = """["PD memorează rezultatele intermediare (memoizare)","PD este mai lentă","PD nu folosește recursivitate","PD folosește doar vectori"]""" },
        ];
    }
}
