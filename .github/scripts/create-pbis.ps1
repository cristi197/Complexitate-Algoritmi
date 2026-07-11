# Run this after: gh auth login
# Creates all PBI issues for InfoLiceu v3 MVP

$repo = "cristi197/Complexitate-Algoritmi"

$pbis = @(
    @{
        title = "✨ PBI-001: Setup proiect ASP.NET Core 10 Razor Pages"
        body = @"
### Description
Initializează soluția .NET cu proiectul web, configurează SQLite, EF Core, și structura de foldere Clean Architecture.

### Acceptance Criteria
- [ ] Soluția ` + "`InfoLiceu.slnx`" + @` creată cu ` + "`dotnet new`" + @`
- [ ] Proiecte: Domain, Application, Infrastructure, Web
- [ ] Folderele: ` + "`Services/`" + @`, ` + "`Data/`" + @`, ` + "`Stores/`" + @`, ` + "`Extensions/`" + @`
- [ ] ` + "`appsettings.Development.json`" + @` cu connection string SQLite
- [ ] ` + "`dotnet build`" + @` trece fără erori
- [ ] All unit tests pass (` + "`dotnet test`" + @`)

### Dev Notes
- Use Directory.Build.props for centralized package management
- Follow Clean Architecture from ` + "`docs/14-dotnet-skills.md`" + @`
- Target ` + "`net10.0`" + @`
"@
    },
    @{
        title = "✨ PBI-002: Configurează EF Core + SQLite + entitățile de bază"
        body = @"
### Description
Setup AppDbContext, entitățile (Users, Chapters, Exercises, UserProgress, QuizAttempts, Submissions, AuditLogs), Fluent API configurations, migrația inițială.

### Acceptance Criteria
- [ ] ` + "`AppDbContext.cs`" + @` cu ` + "`DbSet<>`" + @` pentru toate cele 7 entități
- [ ] Entități POCO în ` + "`Domain/Entities/`" + @`
- [ ] Configurări Fluent API separate (` + "`Infrastructure/Data/Configurations/`" + @`)
- [ ] Migrația ` + "`InitialCreate`" + @` (` + "`dotnet ef migrations add`" + @`)
- [ ] SQLite database se creează automat la startup
- [ ] Seed data: 13 capitole + 10 exerciții
- [ ] All unit tests pass

### Dev Notes
- Use Fluent API (not Data Annotations)
- Add indexes on frequently queried columns
- Use query filters for ` + "`IsPublished`" + @` and ` + "`IsActive`" + @`
"@
    },
    @{
        title = "✨ PBI-003: Configurează Tailwind CSS v4"
        body = @"
### Description
Setup Tailwind CSS v4 cu standalone CLI. Migrează ` + "`global.css`" + @` din proiectul Astro.

### Acceptance Criteria
- [ ] Tailwind v4 funcțional
- [ ] Fișierul CSS compilat inclus în ` + "`_Layout.cshtml`" + @`
- [ ] Design-ul de bază (culori, fonturi, spacing) migrat din Astro
- [ ] Dark mode support via ` + "`class`" + @` strategy
- [ ] All unit tests pass

### Dev Notes
- Păstrează culorile și fonturile din proiectul Astro (în ` + "`astro-legacy/`" + @`)
- Folosește standalone CLI: ` + "`npx @tailwindcss/cli`" + @`
"@
    },
    @{
        title = "✨ PBI-004: Creează Layout-ul de bază (_Layout + Header + Sidebar + Footer)"
        body = @"
### Description
Layout-ul principal Razor cu header, sidebar, footer. Responsive design mobile-first.

### Acceptance Criteria
- [ ] ` + "`_Layout.cshtml`" + @` cu header, main content, footer
- [ ] Header cu logo, navigare, dark mode toggle
- [ ] Sidebar cu lista de capitole (collapsible pe mobile)
- [ ] Footer cu link-uri
- [ ] Responsive: mobile first, desktop sidebar
- [ ] All unit tests pass

### Dev Notes
- Folosește Tailwind CSS v4 classes
- Header și Sidebar ca Partial Views
- Inspiră-te din structura existentă în ` + "`astro-legacy/src/components/`" + @`
"@
    },
    @{
        title = "✨ PBI-005: Implementează ChapterService complet"
        body = @"
### Description
Serviciul care gestionează capitolele: listare, căutare după slug, cache cu FusionCache.

### Acceptance Criteria
- [ ] ` + "`IChapterService`" + @` în ` + "`Domain/Services/`" + @`
- [ ] ` + "`ChapterService`" + @` în ` + "`Application/Services/`" + @` (internal sealed)
- [ ] ` + "`IChapterStore`" + @` în ` + "`Domain/Stores/`" + @`
- [ ] ` + "`ChapterStore`" + @` în ` + "`Infrastructure/Stores/`" + @`
- [ ] Cache cu FusionCache (TTL 30 min)
- [ ] Proiecție DTO (nu returnează entități EF direct)
- [ ] Teste xUnit + NSubstitute + Shouldly (partial class cu Theory constructor tests)
- [ ] All unit tests pass

### Dev Notes
- ChapterService NU folosește AppDbContext direct — folosește IChapterStore
- Constructor test: ` + "`[Theory] [InlineData(1)] [InlineData(2)]`" + @` pentru null checks
"@
    },
    @{
        title = "✨ PBI-006: Implementează ExerciseService"
        body = @"
### Description
Serviciul pentru exerciții: listare per capitol, submit răspuns, tracking progres.

### Acceptance Criteria
- [ ] ` + "`IExerciseService`" + @` în ` + "`Domain/Services/`" + @`
- [ ] ` + "`ExerciseService`" + @` în ` + "`Application/Services/`" + @` (internal sealed)
- [ ] ` + "`IExerciseStore`" + @` în ` + "`Domain/Stores/`" + @`
- [ ] ` + "`ExerciseStore`" + @` în ` + "`Infrastructure/Stores/`" + @`
- [ ] Validare răspuns (multiple choice, free text)
- [ ] Actualizare ` + "`TimesAttempted`" + @` / ` + "`TimesSolved`" + @`
- [ ] Teste xUnit + NSubstitute + Shouldly
- [ ] All unit tests pass

### Dev Notes
- ExerciseService NU folosește AppDbContext direct — folosește IExerciseStore
- Suportă cele 3 tipuri: MultipleChoice, CodeSubmit, FreeText
"@
    },
    @{
        title = "✨ PBI-007: Implementează QuizService"
        body = @"
### Description
Serviciul pentru quiz-uri: start quiz, submit răspuns per întrebare, rezultat final.

### Acceptance Criteria
- [ ] ` + "`IQuizService`" + @` în ` + "`Domain/Services/`" + @`
- [ ] ` + "`QuizService`" + @` în ` + "`Application/Services/`" + @` (internal sealed)
- [ ] Metode: ` + "`StartQuiz()`" + @`, ` + "`SubmitAnswer()`" + @`, ` + "`GetResults()`" + @`
- [ ] Stocare stare quiz în cache (nu în DB)
- [ ] Calcul scor la final
- [ ] Teste xUnit + NSubstitute + Shouldly
- [ ] All unit tests pass
"@
    },
    @{
        title = "✨ PBI-008: Pagina principală (Index + grid de capitole)"
        body = @"
### Description
Landing page cu hero section și grid de capitole.

### Acceptance Criteria
- [ ] ` + "`/`" + @` afișează hero + grid de capitole
- [ ] Fiecare card are: icon, titlu, subtitlu, timp estimat
- [ ] Click → ` + "`/capitole/{slug}`" + @`
- [ ] Datele vin din ChapterService.ListChaptersAsync()
- [ ] Responsive grid (1 col mobile, 3 cols desktop)
- [ ] All unit tests pass
"@
    },
    @{
        title = "✨ PBI-009: Pagina de capitol (Chapter/Detail)"
        body = @"
### Description
Pagina unui capitol cu slide-uri de teorie, navigare între slide-uri, sidebar progres.

### Acceptance Criteria
- [ ] ` + "`/capitole/{slug}`" + @` afișează slide-urile capitolului
- [ ] Navigare next/prev între slide-uri (HTMX)
- [ ] Sidebar cu cuprinsul capitolului
- [ ] Progres bar (câte slide-uri văzute)
- [ ] Code blocks cu syntax highlighting
- [ ] 404 dacă slug-ul nu există
- [ ] All unit tests pass

### Dev Notes
- Slide-urile sunt stocate ca JSON în ` + "`Chapters.ContentJson`" + @`
- Folosește HTMX pentru navigare fără reload
"@
    },
    @{
        title = "✨ PBI-010: Demo Bubble Sort (ViewComponent + HTMX)"
        body = @"
### Description
Primul demo interactiv — Bubble Sort cu animație step-by-step.

### Acceptance Criteria
- [ ] ` + "`ViewComponents/BubbleSortDemo.cs`" + @` generează array și pași
- [ ] Template Razor cu controale (play, pause, speed)
- [ ] HTMX pentru fiecare pas (fără reload)
- [ ] Funcționează pe mobile
- [ ] Teste pentru logica de calcul (nu UI)
- [ ] All unit tests pass
"@
    },
    @{
        title = "✨ PBI-011: Demo-uri rămase (Fibonacci, N-Queens, etc.)"
        body = @"
### Description
Implementează restul de 16 demo-uri ca ViewComponent + HTMX.

### Acceptance Criteria
- [ ] Fiecare demo are ViewComponent dedicat
- [ ] Toate folosesc același pattern (speed control, step display)
- [ ] Teste pentru logica de calcul (nu UI)
- [ ] All unit tests pass

### Dev Notes
- Vezi ` + "`docs/07-interactive-demos.md`" + @` pentru lista completă
- Pattern: ViewComponent.cs + Default.cshtml + endpoint HTMX
"@
    },
    @{
        title = "✨ PBI-012: Quiz player UI"
        body = @"
### Description
Pagina de quiz cu întrebări, opțiuni, timer, scor.

### Acceptance Criteria
- [ ] ` + "`/quiz/{chapterSlug}`" + @` pornește un quiz
- [ ] Întrebări multiple choice random din capitol
- [ ] Timer per întrebare (opțional)
- [ ] Scor final + explicații
- [ ] Se salvează ` + "`QuizAttempts`" + @` în DB
- [ ] All unit tests pass
"@
    },
    @{
        title = "✨ PBI-013: Pagina de exerciții (listă + filtre)"
        body = @"
### Description
Pagina cu lista de exerciții, filtre după dificultate și capitol.

### Acceptance Criteria
- [ ] ` + "`/exercitii`" + @` cu filtre (capitol, dificultate, tip)
- [ ] Fiecare exercițiu: enunț, dificultate, nr. încercări
- [ ] Click → rezolvă exercițiul
- [ ] All unit tests pass
"@
    },
    @{
        title = "✨ PBI-014: Autentificare Google OAuth"
        body = @"
### Description
Login cu Google folosind ASP.NET Core Identity.

### Acceptance Criteria
- [ ] Buton "Conectează-te cu Google" în header
- [ ] Flow OAuth complet: redirect → aprobare → callback
- [ ] Creare user automat la prima logare
- [ ] Roluri funcționale: Student (default), Teacher, Admin
- [ ] Pagini Login/Register/ExternalLogin
- [ ] All unit tests pass

### Dev Notes
- Nu uita să configurezi Google Cloud Console credentials
- ClientId și ClientSecret în appsettings (sau user secrets)
"@
    },
    @{
        title = "✨ PBI-015: Pagina de profil utilizator"
        body = @"
### Description
Profil utilizator cu statistici: XP, streak, capitole completate, progres.

### Acceptance Criteria
- [ ] ` + "`/profil`" + @` afișează statisticile utilizatorului
- [ ] Grafic progres (Chart.js)
- [ ] Necesită autentificare ` + "`[Authorize]`" + @`
- [ ] All unit tests pass
"@
    },
    @{
        title = "✨ PBI-016: Deploy pe Azure App Service Free (F1)"
        body = @"
### Description
Deploy automat cu GitHub Actions pe Azure Free tier.

### Acceptance Criteria
- [ ] GitHub Actions pipeline: build → test → publish → deploy
- [ ] Aplicația funcțională la URL-ul de Azure
- [ ] Custom domain configurat
- [ ] SSL funcțional
- [ ] All unit tests pass

### Dev Notes
- Folosește ` + "`azd up`" + @` sau direct GitHub Actions
- Configurare ` + "`azure.yaml`" + @` la rădăcină
"@
    },
    @{
        title = "✨ PBI-017: Setup Serilog logging"
        body = @"
### Description
Înlocuiește logarea default cu Serilog (fișier + console).

### Acceptance Criteria
- [ ] Serilog configurat în ` + "`Program.cs`" + @`
- [ ] Logare în ` + "`logs/infolicu-.txt`" + @` (rolling file)
- [ ] Logare în consolă (pentru Azure log stream)
- [ ] Nivel minim: Information (Warning în producție)
- [ ] All unit tests pass
"@
    }
)

foreach ($pbi in $pbis) {
    Write-Host "Creating: $($pbi.title)"
    $escapedBody = $pbi.body -replace '"', '\"'
    gh issue create --repo $repo --title $pbi.title --body $pbi.body --label "pbi" 2>&1
    Write-Host "---"
}

Write-Host "`nDone! Created all PBIs."
Write-Host "Run: gh issue list --repo $repo --label pbi"
