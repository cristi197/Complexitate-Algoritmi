# 04 — Autentificare Google + Roluri

> **Faza implementare**: Faza 0 — Setup Auth
> **Dependențe**: ASP.NET Core Identity, Google OAuth 2.0

---

## Configurare Google OAuth

```csharp
// Program.cs
builder.Services.AddAuthentication()
    .AddGoogle(o => {
        o.ClientId = config["Google:ClientId"];
        o.ClientSecret = config["Google:ClientSecret"];
        o.SignInScheme = IdentityConstants.ExternalScheme;
    });

builder.Services.AddAuthorization(o => {
    o.AddPolicy("Teacher", p => p.RequireRole("Teacher", "Admin"));
    o.AddPolicy("Admin",   p => p.RequireRole("Admin"));
});
```

---

## Autorizare per pagină

```csharp
// Simplu, declarativ — direct pe PageModel
[Authorize]                          public class ProfileModel : PageModel { }
[Authorize(Roles = "Teacher,Admin")] public class StudentsModel : PageModel { }
[Authorize(Roles = "Admin")]         public class AuditLogModel : PageModel { }
```

---

## Politici de acces per rol

| Rol | Acces |
|-----|-------|
| **Student** (1) | Capitole, exerciții, quiz-uri, profil propriu, mesagerie |
| **Teacher** (2) | Toate cele de Student + dashboard studenți, rapoarte |
| **Admin** (3) | Tot + gestiune utilizatori, audit log, conținut |

---

## Setup Google Cloud Console

1. Mergi la https://console.cloud.google.com/apis/credentials
2. Creează un OAuth 2.0 Client ID (Web application)
3. Adaugă redirect URI: `https://infolicu.ro/signin-google`
4. Copiază `ClientId` și `ClientSecret` în Azure Key Vault sau `appsettings.Development.json`

---

## Configurare Identity + EF Core

```csharp
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connStr));

builder.Services.AddIdentity<User, IdentityRole<Guid>>(options =>
{
    options.Password.RequireDigit = false;
    options.Password.RequiredLength = 8;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = false;
    options.SignIn.RequireConfirmedAccount = false;
})
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();
```

---

## 🔗 Documente conexe

- [09-diagrams.md](./09-diagrams.md) — Flow autentificare Google OAuth (PlantUML)
- [00-overview.md](./00-overview.md) — Tech stack complet
