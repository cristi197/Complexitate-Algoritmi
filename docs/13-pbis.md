# PBIs — InfoLiceu v3 MVP (GitHub Projects)

> **Cum se folosește**: Creează un GitHub Project (Kanban) și importă fiecare PBI ca Issue.
> Fiecare PBI e self-contained — un AI agent poate să-l implementeze cu îndrumare minimă.
>
> **Format**: `PBI-XXX: Titlu` → descriere, acceptance criteria, fișiere atinse.

---

## Backlog: Faza 0 — Fundația (~2 zile)

### PBI-001: Creează proiectul ASP.NET Core 9 Razor Pages

**Descriere**: Inițializează soluția .NET cu proiectul web, configurează SQLite, EF Core, și structura de foldere.

**Acceptance Criteria**:
- [ ] Soluția `InfoLiceu.sln` creată cu `dotnet new`
- [ ] Proiect `InfoLiceu.Web` de tip Razor Pages
- [ ] Proiect `InfoLiceu.Tests` de tip xUnit
- [ ] Folderele: `Services/`, `Data/`, `Hubs/`, `ViewComponents/`, `wwwroot/`
- [ ] `appsettings.Development.json` cu connection string SQLite
- [ ] Rularea `dotnet build` trece fără erori

**Fișiere cheie**:
- `InfoLiceu.sln`
- `InfoLiceu.Web/InfoLiceu.Web.csproj`
- `InfoLiceu.Web/Program.cs`
- `InfoLiceu.Tests/InfoLiceu.Tests.csproj`

---

### PBI-002: Configurează EF Core + SQLite + entitățile de bază

**Descriere**: Setup DbContext, entitățile (Users, Chapters, Exercises), Fluent API configurations, migrația inițială.

**Acceptance Criteria**:
- [ ] `AppDbContext.cs` cu `DbSet<>` pentru Users, Chapters, Exercises
- [ ] Entități POCO în `Data/Entities/`
- [ ] Configurări Fluent API separate (`Data/Configurations/`)
- [ ] Migrația inițială (`dotnet ef migrations add InitialCreate`)
- [ ] SQLite database se creează automat la startup
- [ ] Seed data: 13 capitole încărcate din JSON

**Fișiere cheie**:
- `Data/AppDbContext.cs`
- `Data/Entities/User.cs`, `Chapter.cs`, `Exercise.cs`, `UserProgress.cs`, `QuizAttempt.cs`
- `Data/Configurations/UserConfiguration.cs`, etc.

---

### PBI-003: Configurează Tailwind CSS v4

**Descriere**: Setup Tailwind CSS v4 cu Vite sau standalone CLI. Migrează `global.css` din proiectul Astro.

**Acceptance Criteria**:
- [ ] Tailwind v4 funcțional (`npx tailwindcss -i input.css -o wwwroot/css/site.css`)
- [ ] Fișierul CSS compilat inclus în `_Layout.cshtml`
- [ ] Design-ul de bază (culori, fonturi, spacing) migrat din Astro
- [ ] Dark mode support via `class` strategy

**Fișiere cheie**:
- `wwwroot/css/site.css`
- `tailwind.config.js` sau `@theme` în CSS

---

### PBI-004: Creează Layout-ul de bază (_Layout + Header + Footer)

**Descriere**: Layout-ul principal Razor cu header, sidebar, footer. Responsive design.

**Acceptance Criteria**:
- [ ] `_Layout.cshtml` cu header, main content, footer
- [ ] Header cu logo, navigare, dark mode toggle
- [ ] Sidebar cu lista de capitole (collapsible pe mobile)
- [ ] Footer cu link-uri
- [ ] Responsive: mobile first, desktop sidebar

**Fișiere cheie**:
- `Pages/Shared/_Layout.cshtml`
- `Pages/Shared/_Header.cshtml`
- `Pages/Shared/_Sidebar.cshtml`
- `Pages/Shared/_Footer.cshtml`

---

## Backlog: Faza 1 — Servicii (~1 săptămână)

### PBI-005: Implementează ChapterService

**Descriere**: Serviciul care gestionează capitolele: listare, căutare după slug, cache în memorie.

**Acceptance Criteria**:
- [ ] `ChapterService.cs` cu metode: `GetBySlug()`, `ListChapters()`, `GetProgress()`
- [ ] Cache cu `IMemoryCache` (TTL 30 min)
- [ ] Proiecție DTO (nu returnează entități EF direct)
- [ ] Teste xUnit + NSubstitute + Shouldly

**Fișiere cheie**:
- `Services/ChapterService.cs`
- `Services/DTOs/ChapterCardDto.cs`
- `Tests/Services/ChapterServiceTests.cs`

---

### PBI-006: Implementează ExerciseService

**Descriere**: Serviciul pentru exerciții: listare per capitol, submit răspuns, tracking progres.

**Acceptance Criteria**:
- [ ] `ExerciseService.cs` cu: `GetByChapter()`, `SubmitAnswer()`, `GetUserStats()`
- [ ] Validare răspuns (multiple choice, free text)
- [ ] Actualizare `TimesAttempted` / `TimesSolved`
- [ ] Teste xUnit + NSubstitute + Shouldly

**Fișiere cheie**:
- `Services/ExerciseService.cs`
- `Tests/Services/ExerciseServiceTests.cs`

---

### PBI-007: Implementează QuizService

**Descriere**: Serviciul pentru quiz-uri: start quiz, submit răspuns per întrebare, rezultat final.

**Acceptance Criteria**:
- [ ] `QuizService.cs` cu: `StartQuiz()`, `SubmitAnswer()`, `GetResults()`
- [ ] Stocare stare quiz în cache (nu în DB)
- [ ] Calcul scor la final
- [ ] Teste xUnit + NSubstitute + Shouldly

---

## Backlog: Faza 2 — Capitole UI (~1 săptămână)

### PBI-008: Pagina principală (Index + capitole)

**Descriere**: Landing page cu hero section și grid de capitole.

**Acceptance Criteria**:
- [ ] `/` afișează hero + grid de capitole
- [ ] Fiecare card are: icon, titlu, subtitlu, timp estimat
- [ ] Click → `/capitole/{slug}`
- [ ] Paginare sau infinite scroll (dacă sunt multe capitole)

---

### PBI-009: Pagina de capitol (Chapter/Detail)

**Descriere**: Pagina unui capitol cu slide-uri de teorie, navigare între slide-uri, sidebar progres.

**Acceptance Criteria**:
- [ ] `/capitole/{slug}` afișează slide-urile capitolului
- [ ] Navigare next/prev între slide-uri (HTMX)
- [ ] Sidebar cu cuprinsul capitolului
- [ ] Progres bar (câte slide-uri văzute)
- [ ] Code blocks cu syntax highlighting

---

## Backlog: Faza 3 — Demo-uri (~1 săptămână)

### PBI-010: Demo Bubble Sort (ViewComponent + HTMX)

**Descriere**: Primul demo interactiv — Bubble Sort cu animație step-by-step.

**Acceptance Criteria**:
- [ ] `ViewComponents/BubbleSortDemo.cs` generează array și pași
- [ ] Template Razor cu controale (play, pause, speed)
- [ ] HTMX pentru fiecare pas (fără reload)
- [ ] Funcționează pe mobile

---

### PBI-011: Demo-uri rămase (Fibonacci, N-Queens, etc.)

**Descriere**: Implementează restul de 16 demo-uri ca ViewComponent + HTMX.

**Acceptance Criteria**:
- [ ] Fiecare demo are ViewComponent dedicat
- [ ] Toate folosesc același pattern (speed control, step display)
- [ ] Teste pentru logica de calcul (nu UI)

---

## Backlog: Faza 4 — Quiz + Exerciții (~1 săptămână)

### PBI-012: Quiz player

**Descriere**: Pagina de quiz cu întrebări, opțiuni, timer, scor.

**Acceptance Criteria**:
- [ ] `/quiz/{chapterSlug}` pornește un quiz
- [ ] Întrebări multiple choice rand() din capitol
- [ ] Timer per întrebare (opțional)
- [ ] Scor final + explicații
- [ ] Se salvează `QuizAttempts` în DB

---

### PBI-013: Pagina de exerciții (listă + filtre)

**Descriere**: Pagina cu lista de exerciții, filtre după dificultate și capitol.

**Acceptance Criteria**:
- [ ] `/exercitii` cu filtre (capitol, dificultate, tip)
- [ ] Fiecare exercițiu: enunț, dificultate, nr. încercări
- [ ] Click → rezolvă exercițiul

---

## Backlog: Faza 5 — Auth + Profil (~3 zile)

### PBI-014: Autentificare Google OAuth

**Descriere**: Login cu Google folosind ASP.NET Core Identity.

**Acceptance Criteria**:
- [ ] Buton "Conectează-te cu Google" pe pagină
- [ ] Flow OAuth complet: redirect → aprobare → callback
- [ ] Creare user automat la prima logare
- [ ] Roluri funcționale: Student (default), Teacher, Admin

---

### PBI-015: Pagina de profil

**Descriere**: Profil utilizator cu statistici: XP, streak, capitole completate, progres.

**Acceptance Criteria**:
- [ ] `/profil` afișează statisticile utilizatorului
- [ ] Grafic progres (Chart.js)
- [ ] Badge-uri / realizări (opțional)
- [ ] Necesită autentificare

---

## Backlog: Faza 6 — Deploy MVP (~2 zile)

### PBI-016: Deploy pe Azure App Service Free (F1)

**Descriere**: Deploy automat cu GitHub Actions pe Azure Free tier.

**Acceptance Criteria**:
- [ ] GitHub Actions pipeline: build → test → publish → deploy
- [ ] Aplicația funcțională la URL-ul de Azure
- [ ] Custom domain configurat (dacă există)
- [ ] SSL funcțional
- [ ] Health check endpoint (`/health`)

---

### PBI-017: Setup Serilog logging

**Descriere**: Înlocuiește logarea default cu Serilog (fișier + console).

**Acceptance Criteria**:
- [ ] Serilog configurat în `Program.cs`
- [ ] Logare în `logs/infolicu-.txt` (rolling file)
- [ ] Logare în consolă (pentru Azure log stream)
- [ ] Nivel minim: Information (Warning în producție)

---

## 📊 Sumar PBIs

| PBI | Durată estimată | Dificultate |
|-----|----------------|-------------|
| 001 - Setup proiect | 2h | ⭐ |
| 002 - EF Core + SQLite | 4h | ⭐⭐ |
| 003 - Tailwind CSS | 2h | ⭐ |
| 004 - Layout de bază | 4h | ⭐⭐ |
| 005 - ChapterService | 3h | ⭐⭐ |
| 006 - ExerciseService | 3h | ⭐⭐ |
| 007 - QuizService | 2h | ⭐⭐ |
| 008 - Index + Capitole | 4h | ⭐⭐ |
| 009 - Chapter Detail | 6h | ⭐⭐⭐ |
| 010 - Bubble Sort demo | 4h | ⭐⭐⭐ |
| 011 - Restul demo-urilor | 10h | ⭐⭐⭐ |
| 012 - Quiz player | 6h | ⭐⭐⭐ |
| 013 - Exerciții listă | 3h | ⭐⭐ |
| 014 - Google Auth | 4h | ⭐⭐⭐ |
| 015 - Profil | 3h | ⭐⭐ |
| 016 - Deploy Azure | 3h | ⭐⭐ |
| 017 - Serilog | 1h | ⭐ |
| **TOTAL** | **~60 ore** | **~3-4 săptămâni** |

---

## 🔗 Cum creezi GitHub Project

```bash
# 1. Creează proiectul
gh project create "InfoLiceu v3 MVP" --owner=<username> --format=json

# 2. Creează issue-uri din PBIs (poți automatiza cu scriptul de mai jos)
# 3. Adaugă etichete: pbi, faza-0, faza-1, ..., bug, enhancement
# 4. Configurează workflow: To Do → In Progress → In Review → Done
```

Sau manual: GitHub → Projects → New Project → Kanban → importă PBIs ca Issues.

---

## 🔗 Documente conexe

- [12-budget-mvp.md](./12-budget-mvp.md) — Arhitectura MVP cu SQLite
- [00-overview.md](./00-overview.md) — Arhitectura completă (Azure)
- [13-dotnet-skills.md](./13-dotnet-skills.md) — Skills pentru AI agent
