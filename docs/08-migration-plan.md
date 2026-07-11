# 08 — Plan de Migrare din Astro (GitHub Pages) → .NET (Azure)

> **Roadmap complet**: Toate fazele de implementare
> **Context**: Proiectul e momentan găzduit pe GitHub Pages ca site static (Astro).
> Se migrează la ASP.NET Core 9 Razor Pages + SQL Server pe Azure App Service.

---

## Cronologie generală

| Faza | Durată | Conținut |
|------|--------|----------|
| 0. Setup proiect | 2 zile | Proiect .NET 9 Razor Pages, EF Core, Tailwind, Identity |
| 1. Shell + Navigare | 3 zile | Layout, header, sidebar, theming, responsive |
| 2. Capitole (conversie conținut) | 2 săpt. | 13 capitole + componente teorie |
| 3. Demo-uri interactive | 2 săpt. | 17 ViewComponents + HTMX |
| 4. Quiz + Exerciții | 1.5 săpt. | Quiz player, Monaco Editor, C++ Docker |
| 5. Auth + Profil + Mesagerie | 1 săpt. | Google login, profil, SignalR chat |
| 6. Stripe + Monetizare | 1 săpt. | Checkout, webhooks, subscriptions, feature gating |
| 7. Admin + Profesor | 1 săpt. | Dashboard-uri, gestiune, rapoarte |
| 8. Testing + Deploy | 1.5 săpt. | Unit/E2E tests, CI/CD, Azure deploy |
| **TOTAL** | **~12 săptămâni** | |

---

## Ce păstrăm, ce rescriem (din Astro)

| Resursă Astro | Destinație .NET | Strategie |
|---|---|---|
| `src/pages/capitole/*.astro` | `Pages/Chapters/Detail.cshtml` | Rescriere HTML → Razor, structură slide-urilor păstrată |
| `public/js/animations.js` | `ViewComponents/` + HTMX | Fiecare `init*Demo()` devine View Component |
| `src/components/Quiz.tsx` | `ViewComponents/Quiz.cs` | Preact → Razor + HTMX |
| `public/js/charts.js` | Chart.js rămâne (JS interop) | Se păstrează ca bibliotecă statică |
| `src/styles/global.css` | `wwwroot/css/site.css` | Migrare 1:1, Tailwind v4 păstrat |
| `public/data/*.json` | EF Core Seed Data | JSON-urile devin migrații EF Core |
| `src/components/Header.astro` | `Pages/Shared/_Layout.cshtml` | Componentă Razor + ViewComponent |
| `src/components/Sidebar.astro` | `Pages/Shared/_Sidebar.cshtml` | Partial View |
| `public/sw.js` | Service Worker păstrat ca static | Copiat în `wwwroot/` |
| `CNAME` | Azure custom domain | Configurare DNS + Azure |

---

## Plan detaliat pe faze

### Faza 0: Setup (2 zile)

```
├── Creează proiect ASP.NET Core Razor Pages
├── Configurează EF Core + SQL Server (local cu Docker sau LocalDB)
├── Migrează global.css → wwwroot/css/
├── Configurează Tailwind v4 prin Vite sau CDN
├── Configurează Identity + Google Auth
├── Setup Azure resources (vezi mai jos)
└── Configurează CI/CD pipeline inițial (build + test)
```

### Faza 1: Shell + Navigare (3 zile)

```
├── _Layout.cshtml (Header + Sidebar + Footer)
├── ChapterLayout.cshtml (hero, nav-bar, wrapper)
├── Theme toggle (dark/light)
├── Search modal
└── Responsive design (mobile first)
```

### Faza 2: Capitole — conversie conținut (2 săptămâni)

```
├── Script: parsează fiecare .astro → extrage slide-uri → JSON
├── Creează ChapterService + seed data din JSON
├── Chapter/Detail.cshtml: render-ează slide-uri din JSON
├── Migrează componentele de teorie:
│   ├── TheorySlide → ViewComponent
│   ├── Callout → ViewComponent
│   ├── ComplexityTable → ViewComponent
│   └── CodeBlock (cu syntax highlighting) → TagHelper
└── Testează fiecare capitol (13 capitole)
```

### Faza 3: Demo-uri interactive (2 săptămâni)

```
├── Bubble Sort → ViewComponent + HTMX
├── N-Queens → ViewComponent + HTMX
├── Fibonacci DP → ViewComponent + HTMX
├── Pointer Memory → ViewComponent + HTMX
├── File I/O → ViewComponent + HTMX
├── Struct Sorter → ViewComponent + HTMX
├── Graph Builder → ViewComponent + Canvas JS interop
├── Restul demo-urilor matrici, căutări, etc.
└── Unifică speed control + status display
```

### Faza 4: Quiz + Exerciții (1.5 săptămâni)

```
├── ExerciseService + seed data
├── Quiz player ViewComponent
├── Monaco Editor integrare (JS interop)
├── CppTestRunner + Docker sandbox
└── Submissions history page
```

### Faza 5: Auth + Profil + Mesagerie (1 săptămână)

```
├── Login/Register cu Google
├── Profil utilizator (XP, streak, progres)
├── MessageService + SignalR Hub
├── Inbox + Conversation pages
└── Notification system (toast + badge)
```

### Faza 6: Stripe + Monetizare (1 săptămână)

```
├── StripeService (checkout, webhooks)
├── Billing pages (pricing, checkout)
├── Subscription management
├── Feature gating per tier (Premium = BAC AI, toate capitolele)
└── Webhook handler + retry logic
```

### Faza 7: Admin + Profesor (1 săptămână)

```
├── Admin dashboard (user management)
├── Audit log viewer
├── Teacher dashboard (student progress)
├── Exercise creator/editor
└── Reports (export CSV/PDF)
```

### Faza 8: Testing + Deploy (1.5 săptămâni)

```
├── xUnit unit tests (services)
├── xUnit integration tests (API)
├── Playwright E2E tests
├── CI/CD pipeline (GitHub Actions)
├── Azure deploy (App Service + SQL + Redis)
└── Load testing + performance tuning
```

---

## 🔄 De la GitHub Pages la Azure

### Ce se schimbă

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
Resource Group: InfoLiceu-Prod
├── App Service Plan (B1: 1 core, 1.75 GB RAM)     ~$13/lună
├── App Service (Linux, .NET 9)                       0
├── SQL Server + SQL Database (Basic, 5 DTU)        ~$5/lună
├── Redis Cache (Basic C0, 250 MB)                  ~$17/lună
├── Key Vault (Standard)                            ~$0.03/lună
├── Storage Account (Blob, LRS)                     ~$2/lună
├── Application Insights (5 GB logs)               ~$5/lună
└── Container Registry (dacă folosim Docker)        ~$5/lună
```

---

## 🚀 Setup Azure (cu `azd`)

### 1. Instalare uneltelor

```bash
winget install Microsoft.Azd
winget install Microsoft.AzureCLI
```

### 2. Inițializare proiect azd

```bash
cd InfoLiceu.Web
azd init --template "https://github.com/Azure-Samples/azd-template-razor-pages"
```

### 3. Configurare `azure.yaml`

```yaml
name: infolicu
metadata:
  template: aspnet-razor@0.0.1
services:
  web:
    project: ./InfoLiceu.Web
    language: csharp
    host: appservice
```

### 4. Deploy

```bash
azd auth login
azd up
```

---

## GitHub Actions CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Azure

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup .NET 9
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '9.0.x'
      
      - name: Restore
        run: dotnet restore
      
      - name: Build
        run: dotnet build --configuration Release --no-restore
      
      - name: Test
        run: dotnet test --no-build --configuration Release
      
      - name: Publish
        run: dotnet publish InfoLiceu.Web/InfoLiceu.Web.csproj -c Release -o publish
      
      - name: Deploy to Azure
        uses: azure/webapps-deploy@v3
        with:
          app-name: infolicu
          package: ./publish
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
```

---

## Script de conversie Astro → JSON Seed Data

```csharp
// Tools/AstroChapterParser.cs — rulează o singură dată
public class AstroChapterParser
{
    public static ChapterSeedData ParseChapter(string astroFilePath)
    {
        var html = File.ReadAllText(astroFilePath);
        var doc = new HtmlDocument();
        doc.LoadHtml(html);

        var sections = new List<SlideData>();
        foreach (var section in doc.DocumentNode.SelectNodes("//section"))
        {
            var slide = section.SelectSingleNode(".//div[contains(@class,'slide')]");
            if (slide == null) continue;

            sections.Add(new SlideData
            {
                SectionId = section.GetAttributeValue("id", ""),
                Title = slide.SelectSingleNode(".//h2")?.InnerText ?? "",
                Icon = slide.SelectSingleNode(".//span[contains(@class,'slide-icon')]")?.InnerText ?? "",
                HtmlContent = slide.SelectSingleNode(".//div[contains(@class,'slide-body')]")?.InnerHtml ?? ""
            });
        }

        return new ChapterSeedData
        {
            Slug = Path.GetFileNameWithoutExtension(astroFilePath),
            Title = ExtractTitle(html),
            Subtitle = ExtractSubtitle(html),
            Icon = ExtractIcon(html),
            Slides = sections,
            Tags = ExtractTags(html)
        };
    }
}
```

---

## 🔗 Documente conexe

- [00-overview.md](./00-overview.md) — Tech stack și structura proiectului
- [01-database-schema.md](./01-database-schema.md) — Schema SQL completă
- [10-stripe-integration.md](./10-stripe-integration.md) — Monetizare Stripe
