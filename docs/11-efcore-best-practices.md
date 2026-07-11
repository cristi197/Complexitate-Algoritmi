# 11 — EF Core Best Practices

> **Faza implementare**: Fazele 0-2 — Data layer
> **Dependențe**: EF Core 9, SQL Server

---

## 15.1. Configurare entități (Fluent API)

```csharp
// ❌ RĂU: Data annotations în entități (poluează domain model)
public class User {
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public Guid Id { get; set; }
}

// ✅ BUN: Fluent API în fișiere separate de configurare
public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("Users");
        builder.HasKey(u => u.Id);
        builder.Property(u => u.Id).HasDefaultValueSql("NEWID()");
        
        builder.Property(u => u.Email).IsRequired().HasMaxLength(256);
        builder.HasIndex(u => u.NormalizedEmail).IsUnique();
        
        builder.Property(u => u.DisplayName).IsRequired().HasMaxLength(100);
        builder.Property(u => u.Role).HasConversion<int>(); // enum → int
        
        // Owned entity: adresă (value object)
        builder.OwnsOne(u => u.Address, addr => {
            addr.Property(a => a.City).HasMaxLength(100);
            addr.Property(a => a.Country).HasMaxLength(50);
        });

        // Query filter: nu returna utilizatori șterși logic
        builder.HasQueryFilter(u => u.IsActive);
    }
}

// Program.cs
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
}
```

---

## 15.2. Migrații inteligente

```bash
# Creează migrația
dotnet ef migrations add AddStripeSubscriptionTables

# Generează script SQL idempotent (pentru deploy manual)
dotnet ef migrations script --idempotent -o deploy/YYYY-MM-DD.sql

# În Program.cs: aplică automat migrațiile la startup (dev/staging doar!)
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
}
```

---

## 15.3. Seed Data

```csharp
public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        if (await db.Chapters.AnyAsync()) return; // deja populat

        var jsonPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "SeedData", "chapters.json");
        var chaptersJson = await File.ReadAllTextAsync(jsonPath);
        var chapters = JsonSerializer.Deserialize<List<Chapter>>(chaptersJson);

        db.Chapters.AddRange(chapters);
        await db.SaveChangesAsync();
    }
}

// Program.cs
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    await DbSeeder.SeedAsync(scope.ServiceProvider.GetRequiredService<AppDbContext>());
}
```

---

## 15.4. Interceptors (audit, soft delete)

```csharp
// Interceptor pentru audit automat
public class AuditInterceptor : SaveChangesInterceptor
{
    private readonly IHttpContextAccessor _http;

    public override async ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData, InterceptionResult<int> result, CancellationToken ct)
    {
        var db = eventData.Context as AppDbContext;
        var userId = _http.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        
        foreach (var entry in db.ChangeTracker.Entries()
            .Where(e => e.State is EntityState.Added or EntityState.Modified or EntityState.Deleted))
        {
            var audit = new AuditLog
            {
                UserId = userId != null ? Guid.Parse(userId) : null,
                Action = entry.State.ToString(),
                EntityType = entry.Entity.GetType().Name,
                EntityId = entry.Properties.FirstOrDefault(p => p.Metadata.IsPrimaryKey())?.CurrentValue?.ToString(),
                MetadataJson = JsonSerializer.Serialize(new {
                    Ip = _http.HttpContext?.Connection.RemoteIpAddress?.ToString(),
                    entry.State,
                    Changes = entry.Properties.Where(p => p.IsModified)
                        .ToDictionary(p => p.Metadata.Name, p => new { Old = p.OriginalValue, New = p.CurrentValue })
                }),
                Timestamp = DateTime.UtcNow
            };
            db.AuditLogs.Add(audit);
        }

        return await base.SavingChangesAsync(eventData, result, ct);
    }
}
```

---

## Configurare DbContext completă

```csharp
// Program.cs
builder.Services.AddDbContextPool<AppDbContext>(options =>
{
    options.UseSqlServer(connStr, sql =>
    {
        sql.EnableRetryOnFailure(3);
        sql.CommandTimeout(30);
        sql.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery);
    });
}, poolSize: 128);

// Adaugă interceptorul de audit
builder.Services.AddSingleton<AuditInterceptor>();
builder.Services.AddDbContext<AppDbContext>((sp, options) =>
{
    options.UseSqlServer(connStr)
           .AddInterceptors(sp.GetRequiredService<AuditInterceptor>());
});
```

---

## 🔗 Documente conexe

- [01-database-schema.md](./01-database-schema.md) — Schema SQL completă
- [02-database-performance.md](./02-database-performance.md) — Performanță: pooling, caching, query patterns
