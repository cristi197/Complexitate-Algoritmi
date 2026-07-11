$env:Path = "C:\Program Files\GitHub CLI;" + $env:Path
$r = "cristi197/Complexitate-Algoritmi"

function New-PBI($title, $body, $labels) {
    Write-Host "Creating: $title"
    gh issue create --repo $r --title $title --body $body --label $labels 2>&1
    Write-Host "---"
}

New-PBI "✨ PBI-003: Tailwind CSS v4" "Setup Tailwind CSS v4. Migreaza global.css din proiectul Astro.`n`n### Acceptance Criteria`n- Tailwind v4 functional`n- CSS compilat inclus in _Layout.cshtml`n- Design de baza migrat`n- Dark mode support`n- All unit tests pass`n`n### Dev Notes`n- Foloseste standalone CLI: npx @tailwindcss/cli" "pbi,faza-1"

New-PBI "✨ PBI-004: Layout de baza" "Layout-ul principal Razor cu header, sidebar, footer. Responsive mobile-first.`n`n### Acceptance Criteria`n- _Layout.cshtml cu header, main, footer`n- Header cu logo, navigare, dark mode toggle`n- Sidebar cu lista de capitole`n- Footer cu link-uri`n- Responsive mobile first`n- All unit tests pass" "pbi,faza-1"

New-PBI "✨ PBI-005: ChapterService complet" "Serviciul care gestioneaza capitolele: listare, cautare dupa slug, cache FusionCache.`n`n### Acceptance Criteria`n- IChapterService in Domain/Services/`n- ChapterService in Application/Services/ (internal sealed)`n- IChapterStore in Domain/Stores/`n- Cache cu FusionCache (TTL 30 min)`n- Proiectie DTO`n- Teste xUnit + NSubstitute + Shouldly`n- All unit tests pass`n`n### Dev Notes`n- NU foloseste AppDbContext direct" "pbi,faza-1"

New-PBI "✨ PBI-006: ExerciseService" "Serviciul pentru exercitii: listare per capitol, submit raspuns, tracking progres.`n`n### Acceptance Criteria`n- IExerciseService in Domain/Services/`n- ExerciseService in Application/Services/`n- Suporta MultipleChoice, CodeSubmit, FreeText`n- Actualizare TimesAttempted / TimesSolved`n- Teste xUnit + NSubstitute + Shouldly`n- All unit tests pass" "pbi,faza-1"

New-PBI "✨ PBI-007: QuizService" "Serviciul pentru quiz-uri: start quiz, submit raspuns, rezultat final.`n`n### Acceptance Criteria`n- IQuizService in Domain/Services/`n- QuizService in Application/Services/`n- Metode: StartQuiz, SubmitAnswer, GetResults`n- Stare quiz in cache (nu DB)`n- Teste xUnit + NSubstitute + Shouldly`n- All unit tests pass" "pbi,faza-4"

New-PBI "✨ PBI-008: Pagina principala (Index + grid capitole)" "Landing page cu hero section si grid de capitole.`n`n### Acceptance Criteria`n- / afiseaza hero + grid de capitole`n- Fiecare card: icon, titlu, subtitlu, timp estimat`n- Click -> /capitole/{slug}`n- Datele vin din ChapterService.ListChaptersAsync()`n- Responsive grid`n- All unit tests pass" "pbi,faza-2"

New-PBI "✨ PBI-009: Pagina de capitol (Chapter/Detail)" "Pagina unui capitol cu slide-uri, navigare, sidebar progres.`n`n### Acceptance Criteria`n- /capitole/{slug} afiseaza slide-urile`n- Navigare next/prev (HTMX)`n- Sidebar cu cuprins`n- Progres bar`n- Code blocks cu syntax highlighting`n- 404 daca slug-ul nu exista`n- All unit tests pass" "pbi,faza-2"

New-PBI "✨ PBI-010: Demo Bubble Sort (ViewComponent + HTMX)" "Primul demo interactiv.`n`n### Acceptance Criteria`n- ViewComponents/BubbleSortDemo.cs`n- Template Razor cu controale (play, pause, speed)`n- HTMX pentru fiecare pas`n- Functional pe mobile`n- Teste pentru logica de calcul`n- All unit tests pass" "pbi,faza-3"

New-PBI "✨ PBI-011: Demo-uri ramase (16 demo-uri)" "Implementeaza restul de 16 demo-uri ca ViewComponent + HTMX.`n`n### Acceptance Criteria`n- Fiecare demo are ViewComponent dedicat`n- Acelasi pattern (speed control, step display)`n- Teste pentru logica de calcul`n- All unit tests pass`n`n### Dev Notes`n- Vezi docs/07-interactive-demos.md pentru lista completa" "pbi,faza-3"

New-PBI "✨ PBI-012: Quiz player UI" "Pagina de quiz cu intrebari, optiuni, timer, scor.`n`n### Acceptance Criteria`n- /quiz/{chapterSlug} porneste un quiz`n- Intrebari multiple choice random`n- Timer per intrebare`n- Scor final + explicatii`n- Salveaza QuizAttempts in DB`n- All unit tests pass" "pbi,faza-4"

New-PBI "✨ PBI-013: Pagina de exercitii (lista + filtre)" "Pagina cu lista de exercitii, filtre dupa dificultate si capitol.`n`n### Acceptance Criteria`n- /exercitii cu filtre`n- Fiecare exercitiu: enunt, dificultate, nr. incercari`n- Click -> rezolva exercitiul`n- All unit tests pass" "pbi,faza-4"

New-PBI "✨ PBI-014: Google OAuth autentificare" "Login cu Google folosind ASP.NET Core Identity.`n`n### Acceptance Criteria`n- Buton Conecteaza-te cu Google in header`n- Flow OAuth complet`n- Creare user automat la prima logare`n- Roluri: Student, Teacher, Admin`n- All unit tests pass`n`n### Dev Notes`n- Configureaza Google Cloud Console credentials`n- ClientId/ClientSecret in appsettings" "pbi,faza-5"

New-PBI "✨ PBI-015: Pagina de profil utilizator" "Profil utilizator cu statistici: XP, streak, capitole completate.`n`n### Acceptance Criteria`n- /profil afiseaza statisticile`n- Grafic progres (Chart.js)`n- Necesita autentificare [Authorize]`n- All unit tests pass" "pbi,faza-5"

New-PBI "✨ PBI-016: Deploy Azure App Service Free (F1)" "Deploy automat cu GitHub Actions pe Azure Free tier.`n`n### Acceptance Criteria`n- GitHub Actions pipeline: build -> test -> publish -> deploy`n- Aplicatia functionala la URL-ul de Azure`n- Custom domain configurat`n- SSL functional`n- All unit tests pass" "pbi,faza-6"

New-PBI "✨ PBI-017: Setup Serilog logging" "Inlocuieste logarea default cu Serilog.`n`n### Acceptance Criteria`n- Serilog configurat in Program.cs`n- Logare in logs/infolicu-.txt (rolling file)`n- Logare in consola`n- Nivel minim: Information`n- All unit tests pass" "pbi,faza-6"

Write-Host "`n=== ALL 17 PBIs CREATED ==="
