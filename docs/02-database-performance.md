# 02 — Performanță Bază de Date

> **Faza implementare**: Fazele 0-2 — pe măsură ce scrii serviciile
> **Dependențe**: EF Core 9, SQL Server, Redis

---

## 4.1. EF Core — Connection Pooling + Split Queries

```csharp
builder.Services.AddDbContextPool<AppDbContext>(options =>
{
    options.UseSqlServer(connStr, sql =>
    {
        sql.EnableRetryOnFailure(3);
        sql.CommandTimeout(30);
        sql.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery); // evită Cartesian explosion
    });
}, poolSize: 128);
```

---

## 4.2. Query-uri eficiente (Proiecție + AsNoTracking)

```csharp
// ❌ RĂU: Toate coloanele, tracking activ
var chapters = await _db.Chapters.ToListAsync();

// ✅ BUN: Proiecție — doar coloanele necesare, zero tracking
var cards = await _db.Chapters
    .Where(c => c.IsPublished)
    .OrderBy(c => c.OrderIndex)
    .Select(c => new ChapterCardDto {
        Slug = c.Slug, Title = c.Title, Icon = c.Icon, Time = c.EstimatedMin
    })
    .AsNoTracking()
    .ToListAsync();

// ✅ BUN: Compiled queries — interogări pre-compilate, 0 overhead per apel
private static readonly Func<AppDbContext, int, IAsyncEnumerable<Exercise>>
    ExercisesByChapter = EF.CompileAsyncQuery(
        (AppDbContext ctx, int chId) =>
            ctx.Exercises.Where(e => e.ChapterId == chId && e.IsPublished));

// ✅ BUN: Keyset pagination — folosește indexul, nu face OFFSET scan
public async Task<List<Exercise>> GetPage(long? afterId, int take = 20)
{
    var q = _db.Exercises.AsNoTracking().OrderBy(e => e.Id);
    if (afterId.HasValue) q = (IOrderedQueryable<Exercise>)q.Where(e => e.Id > afterId.Value);
    return await q.Take(take).ToListAsync();
}
```

---

## 4.3. Caching pe 2 Nivele

```csharp
// Nivel 1: IMemoryCache (in-process, ~0.01ms) — capitole
public async Task<Chapter> GetChapterBySlug(string slug)
{
    var key = $"ch:{slug}";
    if (_mem.TryGetValue(key, out Chapter ch)) return ch;
    
    ch = await _db.Chapters.AsNoTracking().FirstOrDefaultAsync(c => c.Slug == slug);
    if (ch != null) _mem.Set(key, ch, TimeSpan.FromMinutes(30));
    return ch;
}

// Nivel 2: Redis (distribuit, shared) — liste de exerciții
public async Task<List<ExerciseDto>> GetExercises(int chapterId)
{
    var key = $"ex:ch{chapterId}";
    var cached = await _redis.StringGetAsync(key);
    if (cached.HasValue) return JsonSerializer.Deserialize<List<ExerciseDto>>(cached);
    
    var list = await _db.Exercises.Where(e => e.ChapterId == chapterId)
        .Select(e => new ExerciseDto { ... }).AsNoTracking().ToListAsync();
    
    await _redis.StringSetAsync(key, JsonSerializer.Serialize(list), TimeSpan.FromHours(1));
    return list;
}
```

---

## 4.4. Denormalizare — contoare pre-calculate

```sql
-- În loc de COUNT(*) la fiecare afișare, actualizăm un câmp denormalizat:
-- (deja incluse în schema din 01-database-schema.md)

-- Actualizat după fiecare submit:
UPDATE Exercises 
SET TimesAttempted += 1,
    TimesSolved   += CASE WHEN @passed = 1 THEN 1 ELSE 0 END
WHERE Id = @exerciseId;
```

---

## Strategia de caching

| Ce | Unde | TTL | Motiv |
|----|------|-----|-------|
| Capitole (conținut) | IMemoryCache | 30 min | Citite frecvent, se schimbă rar |
| Liste exerciții | Redis | 1 oră | Shared între instanțe, mai mari |
| Progres utilizator | Redis | 5 min | Se schimbă des, dar toleranță la stale |
| Audit logs | Fără cache | — | Trebuie să fie mereu accurate |
| Mesaje | Fără cache | — | Trebuie să fie real-time |

---

## 🔗 Documente conexe

- [01-database-schema.md](./01-database-schema.md) — Schema SQL completă
- [11-efcore-best-practices.md](./11-efcore-best-practices.md) — Fluent API, migrații, interceptori
