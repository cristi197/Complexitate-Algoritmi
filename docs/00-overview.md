# 00 — Overview: Decizii Arhitecturale & Tech Stack

> **Context**: Migrare de la Astro (SSG pe GitHub Pages) la ASP.NET Core 9 Razor Pages + HTMX.
> **Hosting țintă**: Azure App Service (Linux) + SQL Server + Redis.

---

## De ce NU CQRS?

**CQRS** (Command Query Responsibility Segregation) separă operațiile de citire de cele de scriere — folosești modele diferite pentru `GET /chapters` vs `POST /exercises/submit`. E util când:

- Ai milioane de citiri și puține scrieri (ex: Twitter timeline)
- Modelul de citire e radical diferit de cel de scriere (ex: search engine)
- Ai event sourcing (fiecare modificare e un eveniment imutabil)
- Lucrezi cu microservicii și ai nevoie de proiecții separate

**Pentru InfoLiceu, CQRS e overkill.** Avem operații CRUD simple (capitole, exerciții, quiz-uri). CQRS ar adăuga:
- 2-3× clase pentru fiecare operație (Command + Handler + Query + Handler + Validator)
- MediatR dependency + pipeline behaviors
- Complexitate de debugging („unde se procesează SubmitAnswer?")
- Zero beneficii reale la scara acestui proiect

**Alternativa**: servicii simple cu metode async directe. Un PageModel cheamă un serviciu, serviciul lucrează cu EF Core. Clar, ușor de testat, ușor de înțeles.

---

## Comparație: cu CQRS vs fără

| | Cu CQRS (MediatR) | Fără CQRS (direct) |
|---|---|---|
| **Fișiere per operație** | ~3 (Command+Handler+Validator) | 1 metodă |
| **Timp învățare** | ~2 săptămâni | 0 — C# standard |
| **Debugging** | Pipeline → Handler (indirect) | Direct în metodă |
| **Testare** | Testezi handler izolat | Testezi serviciul direct |
| **Overhead** | Reflection + DI resolution | Zero |
| **Când are sens** | Event sourcing, microservicii | CRUD, aplicații standard |

**Pentru InfoLiceu: fără CQRS e decizia corectă.**

---

## Tech Stack

| Strat | Tehnologie | Justificare |
|-------|-----------|-------------|
| **Frontend** | ASP.NET Core Razor Pages + HTMX + Tailwind CSS v4 | Server-side rendering (ca Astro), fără SPA heavy. HTMX pentru interactivitate fără JS masiv |
| **Backend** | ASP.NET Core 9 (același proiect cu frontend-ul) | Un singur proiect = simplu de deploy și dezvoltat |
| **ORM** | Entity Framework Core 9 + SQL Server | Migrații, LINQ, change tracking |
| **Auth** | ASP.NET Core Identity + Google OAuth 2.0 | Standard Microsoft, pagini de login/register integrate |
| **Real-time** | SignalR | Mesaje profesor-elev, notificări progres, quiz-uri live |
| **Cache** | Redis + IMemoryCache (2 nivele) | Cele mai accesate capitole și exerciții stau în cache |
| **File Storage** | Azure Blob Storage | PDF-uri BAC, avatar-uri |
| **Background Jobs** | Hangfire | Procesare subiecte, email-uri, cleanup |
| **Testing** | xUnit + Moq + Playwright (E2E) | Unit + integration + E2E |
| **CI/CD** | GitHub Actions → Azure App Service | Deploy automat |

---

## Structura Proiectului

```
InfoLiceu/
├── InfoLiceu.Web/                  # Proiect unic: Razor Pages + API + EF Core
│   ├── Pages/                      # Razor Pages (server-side rendering)
│   │   ├── Index.cshtml            # Landing page
│   │   ├── Chapters/
│   │   │   └── Detail.cshtml       # /Chapters/{slug} — o pagină per capitol
│   │   ├── Exercises/
│   │   │   ├── Index.cshtml        # Listă exerciții cu filtre
│   │   │   └── Solve.cshtml        # Rezolvă un exercițiu cu Monaco Editor
│   │   ├── Bac/
│   │   │   └── Analysis.cshtml     # Analiză BAC
│   │   ├── Auth/
│   │   │   ├── Login.cshtml
│   │   │   ├── Register.cshtml
│   │   │   └── ExternalLogin.cshtml
│   │   ├── Profile/
│   │   │   └── Index.cshtml
│   │   ├── Messages/
│   │   │   ├── Inbox.cshtml
│   │   │   └── Conversation.cshtml
│   │   ├── Admin/
│   │   │   ├── Dashboard.cshtml
│   │   │   ├── Users.cshtml
│   │   │   └── AuditLog.cshtml
│   │   └── Teacher/
│   │       ├── Students.cshtml
│   │       └── Reports.cshtml
│   │
│   ├── Services/                   # Logică de business — simplu, fără CQRS
│   │   ├── ChapterService.cs       # GetBySlug, ListChapters, UpdateProgress
│   │   ├── ExerciseService.cs      # GetById, ListByChapter, SubmitAnswer, RunCppTests
│   │   ├── QuizService.cs          # StartQuiz, SubmitAnswer, GetResults
│   │   ├── UserService.cs          # Register, Login, UpdateProfile
│   │   ├── AuditService.cs         # LogAction, QueryLogs
│   │   ├── MessageService.cs       # SendMessage, GetConversation, MarkRead
│   │   ├── EncryptionService.cs    # Encrypt, Decrypt (AES-256-GCM)
│   │   └── CppTestRunner.cs        # Compilează și rulează C++ în Docker sandbox
│   │
│   ├── Data/
│   │   ├── AppDbContext.cs
│   │   ├── Configurations/         # Fluent API per entitate
│   │   └── Migrations/
│   │
│   ├── Hubs/
│   │   ├── MessageHub.cs           # SignalR pentru mesaje real-time
│   │   └── ProgressHub.cs          # Notificări progres live
│   │
│   ├── ViewComponents/             # Demo-uri interactive (server-side components)
│   │   ├── BubbleSortDemo.cs
│   │   ├── FibonacciDPDemo.cs
│   │   ├── NQueensDemo.cs
│   │   ├── GraphBuilder.cs
│   │   ├── MemoryPointerDemo.cs
│   │   ├── FileIODemo.cs
│   │   └── StructSorter.cs
│   │
│   └── wwwroot/
│       ├── css/
│       ├── js/                     # HTMX + Chart.js + Monaco Editor + SignalR client
│       └── lib/                    # Biblioteci statice
│
└── tests/
    ├── InfoLiceu.UnitTests/
    │   ├── Services/
    │   │   ├── ExerciseServiceTests.cs
    │   │   ├── CppTestRunnerTests.cs
    │   │   ├── EncryptionServiceTests.cs
    │   │   └── MessageServiceTests.cs
    │   └── PageModels/
    │       └── SolvePageModelTests.cs
    └── InfoLiceu.E2ETests/
        ├── login.spec.ts
        ├── chapter-flow.spec.ts
        └── messaging.spec.ts
```

---

## 🔄 De la GitHub Pages la Azure — Ce se schimbă

| Aspect | GitHub Pages (acum) | Azure App Service (viitor) |
|--------|---------------------|---------------------------|
| **Tip hosting** | Static (HTML/CSS/JS) | Dinamic (ASP.NET Core) |
| **Backend** | Nu există (doar JSON static) | ASP.NET Core 9 complet |
| **Bază de date** | Fișiere JSON statice | SQL Server + Redis |
| **Auth** | Nu există | ASP.NET Core Identity + Google OAuth |
| **Real-time** | Nu există | SignalR (WebSocket) |
| **SSL** | Gratuit (Let's Encrypt via GitHub) | Gratuit (Azure managed cert) |
| **Deploy** | Git push → GitHub Pages | GitHub Actions → `azd up` |
| **Cost lunar** | $0 | ~$50-100 (App Service Basic + SQL + Redis) |
| **Scalare** | CDN global automat | Scale up/down manual sau auto-scale |
| **Cold start** | Nu există (static) | ~1-3 sec (App Service always-on) |
| **Custom domain** | CNAME DNS | CNAME + TXT validation |

### Resurse Azure necesare

```
Resource Group: InfoLiceu
├── App Service Plan (B1: 1 core, 1.75 GB RAM)     ~$13/lună
├── App Service (Linux, .NET 9)                       
├── SQL Server + SQL Database (Basic, 5 DTU)        ~$5/lună
├── Redis Cache (Basic C0, 250 MB)                  ~$17/lună
├── Key Vault (Standard)                            ~$0.03/lună
├── Storage Account (Blob, LRS)                     ~$2/lună
├── Application Insights (5 GB logs)               ~$5/lună
└── Container Registry (dacă folosim Docker)        ~$5/lună
```

---

## 🔗 Documente conexe

- [08-migration-plan.md](./08-migration-plan.md) — Planul complet de migrare, pas cu pas
- [09-diagrams.md](./09-diagrams.md) — Diagrama arhitecturii generale
