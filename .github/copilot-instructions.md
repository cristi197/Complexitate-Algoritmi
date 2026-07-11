# InfoLiceu v3 — Copilot Instructions

## Project Overview

Migrare de la Astro (SSG pe GitHub Pages) la **ASP.NET Core 10 Razor Pages + HTMX**.
MVP: SQLite + hosting minimal ($0-5/lună), fără Stripe, fără Docker.

## Tech Stack

- **.NET 10** (latest SDK)
- **ASP.NET Core Razor Pages** + HTMX + Tailwind CSS v4
- **EF Core 10** + SQLite (MVP)
- **FusionCache** (hybrid memory cache)
- **Serilog** (logging)
- **xUnit + NSubstitute + Shouldly** (testing)

## Architecture — Clean Architecture

```
src/
├── InfoLiceu.Domain/         Entities, DTOs, Service/Store interfaces
├── InfoLiceu.Application/    Service implementations (internal sealed)
├── InfoLiceu.Infrastructure/ DbContext, Store implementations, EF Configs
└── InfoLiceu.Web/            Razor Pages, Program.cs
```

## Key Patterns

- **No CQRS / No MediatR** — simple services
- **No Repository pattern** — EF Core IS the repository
- **Fluent API** for EF Core configurations (not Data Annotations)
- **DTOs in Domain** (returned by service interfaces)
- **Result<T> pattern** for operation results
- **IAuditService** for audit trail

## Testing Conventions

- Naming: `Method_Should_ExpectedResult_When_Condition`
- `partial class` with `[Theory]` + `[InlineData]` for constructor null checks
- NSubstitute for mocking, Shouldly for assertions
- SQLite in-memory for DB tests

## Key Files

- Solution: `InfoLiceu.slnx`
- Entry point: `src/InfoLiceu.Web/Program.cs`
- DB Context: `src/InfoLiceu.Infrastructure/Data/AppDbContext.cs`
- Docs: `docs/README.md` (index), `docs/13-pbis.md` (PBI list)

## Current State

- 7 entities: User, Chapter, Exercise, UserProgress, QuizAttempt, Submission, AuditLog
- 13 chapters + 10 exercises seeded
- 25 tests passing
- Razor Pages: only default template pages (no custom UI yet)
