# 12 — MVP Budget-Friendly (SQLite + Minimal Hosting)

> **Strategie**: Lansăm cu cost minim ($0-5/lună), validăm ideea, apoi scalăm.

---

## De ce NU direct Azure cu SQL Server?

| Resursă Azure | Cost/lună | Alternativă MVP | Cost MVP |
|---|---|---|---|
| App Service B1 | ~$13 | Azure Free F1 / VPS €4 | $0-5 |
| SQL Server Basic | ~$5 | SQLite (local file) | $0 |
| Redis C0 | ~$17 | IMemoryCache (in-process) | $0 |
| Key Vault | ~$0.03 | appsettings.json + env vars | $0 |
| Blob Storage | ~$2 | wwwroot/uploads/ sau Cloudflare R2 | $0 |
| Application Insights | ~$5 | Serilog + console logging | $0 |
| **TOTAL** | **~$50** | | **$0-5** |

---

## Arhitectura MVP

```
┌─────────────────────────────────────────┐
│         VPS / Azure Free F1              │
│  ┌───────────────────────────────────┐   │
│  │     ASP.NET Core 9 Razor Pages    │   │
│  │  ┌─────────┐  ┌───────────────┐   │   │
│  │  │ Services │  │  ViewComponents│   │   │
│  │  └────┬─────┘  └───────────────┘   │   │
│  │       │                             │   │
│  │  ┌────▼──────────────────────┐     │   │
│  │  │  EF Core + SQLite         │     │   │
│  │  │  (fisier .db local)       │     │   │
│  │  └───────────────────────────┘     │   │
│  │  ┌───────────────────────────┐     │   │
│  │  │  IMemoryCache (in-process)│     │   │
│  │  └───────────────────────────┘     │   │
│  └───────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### Ce tăiem pentru MVP

| Feature | Acțiune MVP |
|---------|-------------|
| Redis | Înlocuit cu `IMemoryCache` (funcționează perfect pe o singură instanță) |
| SQL Server | Înlocuit cu SQLite (EF Core suportă fără schimbări de cod) |
| SignalR Azure | SignalR in-process (funcționează pe o singură instanță) |
| Key Vault | `appsettings.Production.json` + environment variables |
| Blob Storage | `wwwroot/uploads/` local (volum mic la început) |
| Stripe | Gratuit pentru toți (monetizare după validare) |
| Docker Sandbox | Amânat — inițial doar quiz-uri multiple-choice |
| Hangfire | Amânat — nu avem background jobs critice |
| Application Insights | Serilog (logging în fișier) |

---

## Opțiuni de hosting MVP

### Opțiunea A: Azure App Service Free (F1) — $0/lună

```yaml
Pros:
  - Gratuit pe viață
  - SSL gratuit (managed certificate)
  - Custom domain suportat
  - CI/CD ușor cu GitHub Actions
Cons:
  - 60 minute CPU / zi (suficient pentru ~100 utilizatori)
  - 1 GB storage (SQLite .db poate crește)
  - Fără always-on (cold start 3-5 secunde)
  - 165 MB RAM (strâns dar ok pentru Razor Pages)
```

### Opțiunea B: VPS Hetzner CX22 — ~€4/lună

```yaml
Pros:
  - 2 vCPU, 4 GB RAM, 40 GB SSD
  - Resurse mult mai mari
  - Control total (Docker, nginx, etc.)
  - Fără cold start
Cons:
  - €4/lună
  - Trebuie configurat manual (nginx, SSL, etc.)
  - Fără CI/CD built-in
```

### Opțiunea C: Azure Container Apps (Consumption) — ~$0-5/lună

```yaml
Pros:
  - Pay-per-use (poate fi $0 cu trafic mic)
  - Scale-to-zero (0 cost când nu e nimeni)
  - CI/CD cu azd
  - Managed certificate
Cons:
  - Cold start mai lung (5-10 sec)
  - Complexitate mai mare de setup
```

**Recomandare MVP**: Opțiunea A (Azure Free) pentru început, apoi migrare la B sau C dacă prinde.

---

## Cum păstrăm codul compatibil cu SQL Server

EF Core face abstractizare — singura diferență e connection string-ul:

```csharp
// MVP: SQLite
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=infolicu.db"));

// Production: SQL Server (când/dacă scalăm)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connStr));
```

Toate query-urile, migrațiile, Fluent API — identice. Schimbăm doar provider-ul.

---

## Plan de scalare (când avem succes)

```
MVP (Luna 1-3)           → Creștere (Luna 4-6)       → Maturitate (Luna 7+)
SQLite                   → SQL Server Basic           → SQL Server Standard
IMemoryCache             → IMemoryCache               → Redis
SignalR in-process       → SignalR in-process         → Azure SignalR
Azure Free F1            → Azure B1                   → Azure B2 + auto-scale
Fără Stripe              → Stripe Basic               → Stripe Full
Fără Docker C++          → Docker C++                 → Docker C++
0 RON/lună               → ~$30/lună                  → ~$70/lună
```

---

## 🔗 Documente conexe

- [00-overview.md](./00-overview.md) — Arhitectura target (Azure full)
- [08-migration-plan.md](./08-migration-plan.md) — Roadmap implementare
