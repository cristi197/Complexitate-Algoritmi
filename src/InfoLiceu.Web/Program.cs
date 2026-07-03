using InfoLiceu.Application.Extensions;
using InfoLiceu.Infrastructure.Data;
using InfoLiceu.Infrastructure.Extensions;
using Serilog;
using ZiggyCreatures.Caching.Fusion;

var builder = WebApplication.CreateBuilder(args);

// Logging
builder.Host.UseSerilog((ctx, lc) => lc
    .ReadFrom.Configuration(ctx.Configuration)
    .WriteTo.Console()
    .WriteTo.File("logs/infolicu-.txt", rollingInterval: RollingInterval.Day));

// FusionCache (hybrid: memory + fail-safe)
builder.Services.AddFusionCache()
    .WithOptions(o => o.DefaultEntryOptions = new FusionCacheEntryOptions
    {
        Duration = TimeSpan.FromMinutes(10),
        FailSafeMaxDuration = TimeSpan.FromHours(1)
    });

// Application (services)
builder.Services.AddApplication();

// Infrastructure (EF Core + SQLite + stores)
var connStr = builder.Configuration.GetConnectionString("Default")!;
builder.Services.AddInfrastructure(connStr);

builder.Services.AddRazorPages();

var app = builder.Build();

// Auto-migrate + seed DB in development
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.EnsureCreatedAsync();
    await DbSeeder.SeedAsync(db);
}

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseAuthorization();
app.MapRazorPages();

app.Run();

app.Run();
