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
            new() { Slug = "introducere",            Title = "Introducere în Algoritmi",         Subtitle = "Ce este un algoritm?",                Icon = "🧠", OrderIndex = 1,  EstimatedMin = 20,
                ContentJson = JsonSerializer.Serialize(new[] { new { title = "Ce este un algoritm?", body = "Un algoritm este o succesiune finită de pași care rezolvă o problemă." } }) },
            new() { Slug = "complexitate-algoritmi",  Title = "Complexitatea Algoritmilor",       Subtitle = "Eficiență și notații asimptotice",    Icon = "📊", OrderIndex = 2,  EstimatedMin = 30,
                ContentJson = JsonSerializer.Serialize(new[] { new { title = "Notații asimptotice", body = "O, Ω, Θ — cum măsurăm eficiența." } }) },
            new() { Slug = "vectori",                 Title = "Vectori (Tablouri Unidimensionale)", Subtitle = "Operații și parcurgeri",           Icon = "📋", OrderIndex = 3,  EstimatedMin = 25,
                ContentJson = JsonSerializer.Serialize(new[] { new { title = "Declarare și parcurgere", body = "Vectorii sunt structuri de date fundamentale." } }) },
            new() { Slug = "matrici",                 Title = "Matrici (Tablouri Bidimensionale)", Subtitle = "Operații pe linii și coloane",        Icon = "🔲", OrderIndex = 4,  EstimatedMin = 30,
                ContentJson = JsonSerializer.Serialize(new[] { new { title = "Parcurgerea matricilor", body = "Matricile sunt vectori de vectori." } }) },
            new() { Slug = "siruri",                  Title = "Șiruri de Caractere",              Subtitle = "Stringuri și prelucrări",             Icon = "🔤", OrderIndex = 5,  EstimatedMin = 25,
                ContentJson = JsonSerializer.Serialize(new[] { new { title = "Operații cu stringuri", body = "Lungime, concatenare, subșiruri." } }) },
            new() { Slug = "functii",                 Title = "Funcții și Proceduri",             Subtitle = "Modularizare și parametri",            Icon = "⚙️", OrderIndex = 6,  EstimatedMin = 20,
                ContentJson = JsonSerializer.Serialize(new[] { new { title = "Definirea funcțiilor", body = "Funcțiile încapsulează logică reutilizabilă." } }) },
            new() { Slug = "recursivitate",           Title = "Recursivitate",                    Subtitle = "Funcții care se autoapelează",        Icon = "🔄", OrderIndex = 7,  EstimatedMin = 35,
                ContentJson = JsonSerializer.Serialize(new[] { new { title = "Ce este recursivitatea?", body = "O funcție recursivă se apelează pe sine." } }) },
            new() { Slug = "fisiere",                 Title = "Fișiere Text",                     Subtitle = "Citire și scriere în C++",             Icon = "📁", OrderIndex = 8,  EstimatedMin = 20,
                ContentJson = JsonSerializer.Serialize(new[] { new { title = "Operații cu fișiere", body = "ifstream, ofstream — citire și scriere." } }) },
            new() { Slug = "structuri",               Title = "Structuri de Date",                Subtitle = "Stive, cozi, liste",                  Icon = "🏗️", OrderIndex = 9,  EstimatedMin = 40,
                ContentJson = JsonSerializer.Serialize(new[] { new { title = "Tipuri abstracte de date", body = "Stiva (LIFO), coada (FIFO)." } }) },
            new() { Slug = "pointeri",                Title = "Pointeri și Alocare Dinamică",     Subtitle = "Gestiunea memoriei în C++",            Icon = "👉", OrderIndex = 10, EstimatedMin = 35,
                ContentJson = JsonSerializer.Serialize(new[] { new { title = "Pointeri", body = "Un pointer stochează o adresă de memorie." } }) },
            new() { Slug = "backtracking",            Title = "Backtracking",                     Subtitle = "Generarea soluțiilor prin încercări",  Icon = "🔙", OrderIndex = 11, EstimatedMin = 40,
                ContentJson = JsonSerializer.Serialize(new[] { new { title = "Ce este backtrackingul?", body = "Algoritmul încearcă toate soluțiile posibile." } }) },
            new() { Slug = "programare-dinamica",     Title = "Programare Dinamică",              Subtitle = "Optimizare prin memoizare",            Icon = "📈", OrderIndex = 12, EstimatedMin = 40,
                ContentJson = JsonSerializer.Serialize(new[] { new { title = "Principiul optimalității", body = "O soluție optimă conține subsoluții optime." } }) },
            new() { Slug = "grafuri",                 Title = "Grafuri și Arbori",                Subtitle = "Parcurgeri și algoritmi fundamentali",  Icon = "🕸️", OrderIndex = 13, EstimatedMin = 45,
                ContentJson = JsonSerializer.Serialize(new[] { new { title = "Reprezentarea grafurilor", body = "Matrice de adiacență, liste de adiacență." } }) },
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
