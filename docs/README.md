# InfoLiceu v3 — Documentație de Arhitectură

> **Context**: Migrare de la Astro (SSG pe GitHub Pages) la ASP.NET Core 10 Razor Pages + HTMX.
> Fiecare document de mai jos acoperă un domeniu specific și poate fi folosit independent ca prompt de implementare.
>
> **🎯 MVP Budget**: Vezi [12-budget-mvp.md](./12-budget-mvp.md) — începem cu SQLite + hosting minimal ($0-5/lună).

## 📋 Index documente

### 🏗️ Arhitectură & Planificare

| # | Document | Conținut |
|---|----------|----------|
| 00 | [00-overview.md](./00-overview.md) | De ce NU CQRS, Tech Stack, Structura proiectului, GitHub Pages → Azure |
| 12 | [12-budget-mvp.md](./12-budget-mvp.md) | **🎯 MVP Budget**: SQLite, hosting $0-5, ce tăiem, plan de scalare |
| 08 | [08-migration-plan.md](./08-migration-plan.md) | Plan complet de migrare (12 săpt.), CI/CD, GitHub Actions |
| 13 | [13-pbis.md](./13-pbis.md) | **📋 PBIs pentru GitHub Projects** — 17 task-uri gata de implementat |
| 14 | [14-dotnet-skills.md](./14-dotnet-skills.md) | **🔧 Skills .NET** — reguli de cod, testing cu xUnit+NSubstitute+Shouldly |

### 💾 Date & Performanță

| # | Document | Conținut |
|---|----------|----------|
| 01 | [01-database-schema.md](./01-database-schema.md) | Schema SQL completă (toate tabelele, indecși, enum-uri) |
| 02 | [02-database-performance.md](./02-database-performance.md) | EF Core: pooling, query patterns, caching 2 nivele |
| 11 | [11-efcore-best-practices.md](./11-efcore-best-practices.md) | EF Core: Fluent API, migrații, seed data, interceptori |

### 🔐 Auth & Securitate

| # | Document | Conținut |
|---|----------|----------|
| 04 | [04-authentication.md](./04-authentication.md) | Google OAuth 2.0, roluri, autorizare per pagină |
| 05 | [05-encryption.md](./05-encryption.md) | Criptare AES-256-GCM, Key Vault |

### ⚡ Features

| # | Document | Conținut |
|---|----------|----------|
| 03 | [03-messaging.md](./03-messaging.md) | Mesagerie SignalR: Hub, Service, frontend HTMX |
| 06 | [06-cpp-testing.md](./06-cpp-testing.md) | C++ Docker Sandbox: compilare, execuție, securitate |
| 07 | [07-interactive-demos.md](./07-interactive-demos.md) | 17 demo-uri interactive: View Components + HTMX |
| 10 | [10-stripe-integration.md](./10-stripe-integration.md) | Stripe: tiers, checkout, webhooks, feature gating |

### 📐 Diagrame

| # | Document | Conținut |
|---|----------|----------|
| 09 | [09-diagrams.md](./09-diagrams.md) | 6 diagrame PlantUML: arhitectură, ERD, fluxuri OAuth/SignalR/Stripe/C++ |

## 🚀 MVP — Quick Start

```bash
# 1. Clone + build
cd InfoLiceu.Web
dotnet build

# 2. Run tests
dotnet test

# 3. Run app (SQLite auto-creates on first run)
dotnet run

# 4. Open https://localhost:5001
```

## 🗺️ Ordine implementare MVP (recomandată)

```
1. 📖 Citește 12-budget-mvp.md (strategia de cost)
2. 📖 Citește 14-dotnet-skills.md (convențiile de cod)
3. 📋 Ia PBIs din 13-pbis.md în ordine (001 → 017)
4. 🏗️ Configurează GitHub Project cu PBIs
5. 💻 Implementează PBI cu PBI, folosind documentele relevante
```

## 📐 Diagrame rapide

Toate diagramele PlantUML sunt centralizate în [09-diagrams.md](./09-diagrams.md):
- Arhitectura generală a sistemului
- Database ERD (Entity-Relationship Diagram)
- Flow autentificare Google OAuth
- Flow mesagerie SignalR
- Flow plată Stripe
- Flow execuție C++ Docker
