# 14 — .NET Development Skills (for AI Agent)

> **Context**: Aceste reguli definesc cum scriem cod .NET în proiectul InfoLiceu v3.
> Un AI agent trebuie să respecte aceste convenții când generează sau modifică cod.
>
> **Arhitectură**: Clean Architecture — Domain → Application → Infrastructure → Web

---

## ⚙️ Tech Stack & Versiuni

| Componentă | Versiune | Note |
|---|---|---|
| .NET SDK | 10.0.x | `net10.0` |
| C# | 14 | Latest |
| EF Core | 10.0.x | SQLite provider for MVP |
| ASP.NET Core | 10.0.x | Razor Pages + HTMX |
| FusionCache | 2.x | Hybrid cache (memory + fail-safe) |
| Serilog | 10.x | Structured logging |
| xUnit | 2.x | Unit testing |
| NSubstitute | 5.x | Mocking |
| Shouldly | 4.x | Assertions |

---

## 🏗️ Clean Architecture

```
src/
├── InfoLiceu.Domain/           # Entities, Enums (NO dependencies)
├── InfoLiceu.Application/      # Interfaces (ports), DTOs (→ Domain)
├── InfoLiceu.Infrastructure/   # EF Core, Services, FusionCache (→ Application)
└── InfoLiceu.Web/             # Razor Pages, Program.cs (→ Infrastructure)

tests/
├── InfoLiceu.Domain.Tests/
├── InfoLiceu.Application.Tests/
├── InfoLiceu.Infrastructure.Tests/
└── InfoLiceu.Web.Tests/
```

**Regula de aur**: Domain nu depinde de nimic. Application depinde DOAR de Domain. Infrastructure implementează interfețele din Application. Web cunoaște doar Infrastructure.

---

## 🧪 Testing (xUnit + NSubstitute + Shouldly)

### Naming convention

```
Method_Should_ExpectedResult_When_Condition
```

Exemple:
- `GetBySlugAsync_Should_ReturnChapterDto_When_ChapterExists`
- `Constructor_Should_ThrowArgumentNullException_When_ParameterIsNull`
- `SendAsync_Should_ReturnMessage_When_Called`
- `ListChaptersAsync_Should_ReturnOrderedList_When_ChaptersExist`

### Partial test classes (constructor tests with Theory)

```csharp
public partial class ChapterServiceTests : IDisposable
{
    private readonly AppDbContext _db = CreateInMemoryDb();
    private readonly IFusionCache _cache = new FusionCache(new FusionCacheOptions());
}

// Constructor tests — partial separată
public partial class ChapterServiceTests
{
    [Theory]
    [InlineData(1)] // db is null
    [InlineData(2)] // cache is null
    public void Constructor_Should_ThrowArgumentNullException_When_ParameterIsNull(int nullParamIndex)
    {
        // Arrange
        var db = nullParamIndex == 1 ? null! : _db;
        var cache = nullParamIndex == 2 ? null! : new FusionCache(new FusionCacheOptions());

        // Act & Assert
        Should.Throw<ArgumentNullException>(() => new ChapterService(db, cache));
    }
}

// Business logic tests — partial separată
public partial class ChapterServiceTests
{
    [Fact]
    public async Task GetBySlugAsync_Should_ReturnChapterDto_When_ChapterExists()
    {
        // ...test body...
    }
}
```

### Structură test standard

```csharp
[Fact]
public async Task Action_Should_Expected_When_Condition()
{
    // Arrange
    // ...setup...

    // Act
    var result = await _sut.MethodAsync();

    // Assert
    result.ShouldNotBeNull();
    result.Property.ShouldBe(expected);
}
```

### Reguli de testare

| Regulă | Exemplu |
|--------|---------|
| Nume: `Action_Should_Result_When_Condition` | `GetBySlugAsync_Should_ReturnNull_When_ChapterDoesNotExist` |
| Constructor test cu `[Theory]` + `[InlineData]` | Testează fiecare parametru null |
| Partial classes: câte o partială per grup de teste | Constructor / Business Logic / Edge Cases |
| `_sut` = System Under Test | Convenție pentru instanța testată |
| Arrange / Act / Assert | Secțiuni clare, separate prin linii goale |
| Shouldly pentru aserțiuni | `result.ShouldBe(x)`, `result.ShouldNotBeNull()` |
| NSubstitute pentru mock-uri | `Substitute.For<IInterface>()` |
| SQLite in-memory pentru teste DB | `Data Source=:memory:` |
| FusionCache real (nu mock) | `new FusionCache(new FusionCacheOptions())` |

---

## 🏗️ Structură cod C#

### Servicii

```csharp
namespace InfoLiceu.Web.Services;

public interface IChapterService
{
    Task<ChapterDto?> GetBySlug(string slug);
    Task<List<ChapterCardDto>> ListChapters();
    Task UpdateProgress(Guid userId, int chapterId, int percent);
}

public class ChapterService : IChapterService
{
    private readonly AppDbContext _db;
    private readonly IMemoryCache _cache;

    public ChapterService(AppDbContext db, IMemoryCache cache)
    {
        _db = db;
        _cache = cache;
    }

    public async Task<ChapterDto?> GetBySlug(string slug)
    {
        var key = $"ch:{slug}";
        if (_cache.TryGetValue(key, out ChapterDto? cached))
            return cached;

        var chapter = await _db.Chapters
            .AsNoTracking()
            .Where(c => c.Slug == slug && c.IsPublished)
            .Select(c => new ChapterDto
            {
                Id = c.Id,
                Slug = c.Slug,
                Title = c.Title,
                ContentJson = c.ContentJson
            })
            .FirstOrDefaultAsync();

        if (chapter is not null)
            _cache.Set(key, chapter, TimeSpan.FromMinutes(30));

        return chapter;
    }
    // ...
}
```

### Reguli servicii

- Fiecare serviciu are interfață (`IChapterService`) — testabilitate
- Injectează `AppDbContext` direct (nu repository pattern — overkill cu EF Core)
- DTO-uri separate de entități (nu returna entități EF)
- `AsNoTracking()` pe toate query-urile de citire
- `CancellationToken` opțional în MVP, adăugat la scalare

---

## 📄 Razor Pages

### PageModel

```csharp
public class DetailModel : PageModel
{
    private readonly IChapterService _chapters;

    public DetailModel(IChapterService chapters)
    {
        _chapters = chapters;
    }

    public ChapterDto? Chapter { get; set; }
    public int CurrentSlide { get; set; }

    public async Task<IActionResult> OnGet(string slug, int slide = 0)
    {
        Chapter = await _chapters.GetBySlug(slug);
        if (Chapter is null) return NotFound();

        CurrentSlide = Math.Clamp(slide, 0, Chapter.TotalSlides - 1);
        return Page();
    }
}
```

### View (Razor + HTMX)

```html
@page "/capitole/{slug}"
@model InfoLiceu.Web.Pages.Chapters.DetailModel

<div class="chapter-container">
    <aside class="chapter-sidebar">
        @foreach (var slide in Model.Chapter.Slides)
        {
            <button hx-get="/capitole/@Model.Chapter.Slug?handler=Slide&index=@slide.Index"
                    hx-target="#slide-content"
                    class="sidebar-item">
                @slide.Title
            </button>
        }
    </aside>

    <main id="slide-content" class="chapter-content">
        @await Html.PartialAsync("_Slide", Model.Chapter.Slides[Model.CurrentSlide])
    </main>
</div>
```

### Reguli Razor Pages

- Fiecare pagină e un folder: `Pages/Chapters/Detail.cshtml` + `Detail.cshtml.cs`
- Handler-e pentru acțiuni: `OnGet`, `OnPost`, `OnGetSlide`
- HTMX pentru interactivitate parțială
- View Components pentru componente reutilizabile

---

## 🗄️ EF Core + SQLite

### AppDbContext

```csharp
public class AppDbContext : DbContext
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Chapter> Chapters => Set<Chapter>();
    public DbSet<Exercise> Exercises => Set<Exercise>();
    public DbSet<UserProgress> UserProgress => Set<UserProgress>();
    public DbSet<QuizAttempt> QuizAttempts => Set<QuizAttempt>();

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
    }
}
```

### Entitate POCO

```csharp
public class Chapter
{
    public int Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Subtitle { get; set; }
    public string? Icon { get; set; }
    public int OrderIndex { get; set; }
    public string ContentJson { get; set; } = "[]";
    public string? Tags { get; set; }
    public int EstimatedMin { get; set; } = 30;
    public bool IsPublished { get; set; } = true;

    // Navigation
    public List<Exercise> Exercises { get; set; } = [];
    public List<UserProgress> Progress { get; set; } = [];
}
```

### Fluent API Configuration

```csharp
public class ChapterConfiguration : IEntityTypeConfiguration<Chapter>
{
    public void Configure(EntityTypeBuilder<Chapter> builder)
    {
        builder.ToTable("Chapters");
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Slug).IsRequired().HasMaxLength(100);
        builder.HasIndex(c => c.Slug).IsUnique();
        builder.Property(c => c.Title).IsRequired().HasMaxLength(200);
        builder.Property(c => c.OrderIndex).IsRequired();
        builder.Property(c => c.ContentJson).IsRequired();
        builder.HasQueryFilter(c => c.IsPublished);
    }
}
```

---

## 📦 Structură proiect (MVP)

```
InfoLiceu/
├── InfoLiceu.sln
├── InfoLiceu.Web/
│   ├── InfoLiceu.Web.csproj
│   ├── Program.cs
│   ├── appsettings.json
│   ├── appsettings.Development.json
│   ├── Pages/
│   │   ├── Index.cshtml / Index.cshtml.cs
│   │   ├── Chapters/
│   │   │   └── Detail.cshtml / Detail.cshtml.cs
│   │   ├── Exercises/
│   │   │   └── Index.cshtml / Index.cshtml.cs
│   │   ├── Quiz/
│   │   │   └── Index.cshtml / Index.cshtml.cs
│   │   ├── Auth/
│   │   │   └── Login.cshtml / Login.cshtml.cs
│   │   ├── Profile/
│   │   │   └── Index.cshtml / Index.cshtml.cs
│   │   └── Shared/
│   │       ├── _Layout.cshtml
│   │       ├── _Header.cshtml
│   │       ├── _Sidebar.cshtml
│   │       └── _Footer.cshtml
│   ├── Services/
│   │   ├── IChapterService.cs / ChapterService.cs
│   │   ├── IExerciseService.cs / ExerciseService.cs
│   │   └── IQuizService.cs / QuizService.cs
│   ├── Services/DTOs/
│   │   ├── ChapterDto.cs
│   │   ├── ChapterCardDto.cs
│   │   └── ExerciseDto.cs
│   ├── Data/
│   │   ├── AppDbContext.cs
│   │   ├── Entities/
│   │   │   ├── User.cs
│   │   │   ├── Chapter.cs
│   │   │   ├── Exercise.cs
│   │   │   ├── UserProgress.cs
│   │   │   └── QuizAttempt.cs
│   │   ├── Configurations/
│   │   │   ├── UserConfiguration.cs
│   │   │   ├── ChapterConfiguration.cs
│   │   │   └── ExerciseConfiguration.cs
│   │   └── Migrations/
│   ├── ViewComponents/
│   │   ├── BubbleSortDemo.cs / Default.cshtml
│   │   └── FibonacciDPDemo.cs / Default.cshtml
│   └── wwwroot/
│       ├── css/
│       │   └── site.css
│       ├── js/
│       │   └── site.js
│       └── favicon.ico
├── InfoLiceu.Tests/
│   ├── InfoLiceu.Tests.csproj
│   ├── Services/
│   │   ├── ChapterServiceTests.cs
│   │   └── ExerciseServiceTests.cs
│   └── TestHelpers/
│       └── DbSetMockExtensions.cs
└── docs/
    └── ... (documentația)
```

---

## 📋 Package References (.csproj)

```xml
<!-- InfoLiceu.Web.csproj -->
<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net9.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.EntityFrameworkCore.Sqlite" Version="9.*" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="9.*" />
    <PackageReference Include="Microsoft.AspNetCore.Identity.EntityFrameworkCore" Version="9.*" />
    <PackageReference Include="Microsoft.AspNetCore.Authentication.Google" Version="9.*" />
    <PackageReference Include="Serilog.AspNetCore" Version="8.*" />
  </ItemGroup>
</Project>
```

```xml
<!-- InfoLiceu.Tests.csproj -->
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net9.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="xunit" Version="2.*" />
    <PackageReference Include="NSubstitute" Version="5.*" />
    <PackageReference Include="Shouldly" Version="4.*" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Sqlite" Version="9.*" />
    <PackageReference Include="Microsoft.NET.Test.Sdk" Version="17.*" />
    <PackageReference Include="xunit.runner.visualstudio" Version="2.*" />
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="..\InfoLiceu.Web\InfoLiceu.Web.csproj" />
  </ItemGroup>
</Project>
```

---

## 🎯 Principii de cod

| Principiu | Aplicare |
|-----------|----------|
| **No magic strings** | Folosește `nameof()`, constante, sau enum-uri |
| **DTO-uri, nu entități** | Serviciile returnează DTO-uri, nu entități EF |
| **AsNoTracking** | Toate query-urile de citire folosesc `.AsNoTracking()` |
| **Fără repository pattern** | EF Core E DEJA un repository + unit of work |
| **Fără CQRS / MediatR** | Servicii simple, directe |
| **Interfețe pentru servicii** | `IChapterService` — testabilitate |
| **Primary constructors** | Unde e clar și concis |
| **File-scoped namespaces** | `namespace Foo.Bar;` (o linie) |
