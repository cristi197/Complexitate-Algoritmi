# 10 — Integrare Stripe

> **Faza implementare**: Faza 6 — Monetizare
> **Dependențe**: Stripe.NET SDK, ASP.NET Core Identity

---

## Model de business (tiers)

| Feature | Free | Basic (29 RON/lună) | Premium (59 RON/lună) |
|---|---|---|---|
| Capitole | ✅ 3 capitole | ✅ Toate (13) | ✅ Toate (13) |
| Exerciții | ✅ 50/lună | ✅ Nelimitat | ✅ Nelimitat |
| Demo-uri | ✅ | ✅ | ✅ |
| Quiz-uri | ✅ | ✅ | ✅ |
| Mesagerie profesori | ❌ | ✅ | ✅ |
| Analiză BAC AI | ❌ | ❌ | ✅ |
| C++ Code Runner | ❌ | ✅ 10/zi | ✅ Nelimitat |
| Suport prioritar | ❌ | ❌ | ✅ |

---

## StripeService

```csharp
public class StripeService
{
    private readonly StripeClient _stripe;
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;

    // Prețuri definite în Stripe Dashboard → mapează aici
    private readonly Dictionary<SubscriptionTier, string> _priceIds = new()
    {
        [SubscriptionTier.Basic]   = "price_basic_monthly_ron",
        [SubscriptionTier.Premium] = "price_premium_monthly_ron"
    };

    public async Task<string> CreateCheckoutSession(Guid userId, SubscriptionTier tier)
    {
        var user = await _db.Users.FindAsync(userId);
        var options = new SessionCreateOptions
        {
            Customer = user.StripeCustomerId,
            Mode = "subscription",
            LineItems = new[] {
                new SessionLineItemOptions {
                    Price = _priceIds[tier],
                    Quantity = 1
                }
            },
            SuccessUrl = $"{_config["BaseUrl"]}/Billing/Success?session_id={{CHECKOUT_SESSION_ID}}",
            CancelUrl = $"{_config["BaseUrl"]}/Billing/Cancel",
            Metadata = new Dictionary<string, string> {
                ["UserId"] = userId.ToString(),
                ["Tier"] = tier.ToString()
            }
        };

        var session = await _stripe.Checkout.Sessions.CreateAsync(options);
        return session.Url;
    }

    public async Task ProcessWebhook(string json, string stripeSignature)
    {
        var stripeEvent = EventUtility.ConstructEvent(
            json, stripeSignature, _config["Stripe:WebhookSecret"]);

        switch (stripeEvent.Type)
        {
            case "checkout.session.completed":
                await HandleCheckoutCompleted(stripeEvent);
                break;
            case "invoice.paid":
                await HandleInvoicePaid(stripeEvent);
                break;
            case "customer.subscription.deleted":
                await HandleSubscriptionCanceled(stripeEvent);
                break;
        }
    }

    private async Task HandleCheckoutCompleted(Event stripeEvent)
    {
        var session = stripeEvent.Data.Object as Session;
        var userId = Guid.Parse(session.Metadata["UserId"]);
        var tier = Enum.Parse<SubscriptionTier>(session.Metadata["Tier"]);

        // Creează abonamentul
        var sub = new Subscription
        {
            UserId = userId,
            StripeSubscriptionId = session.SubscriptionId,
            Tier = tier,
            Status = SubscriptionStatus.Active,
            CurrentPeriodEnd = DateTime.UtcNow.AddMonths(1)
        };
        _db.Subscriptions.Add(sub);

        // Înregistrează plata
        var payment = new Payment
        {
            UserId = userId,
            StripePaymentIntentId = session.PaymentIntentId,
            Amount = session.AmountTotal / 100m,
            Currency = session.Currency,
            Status = PaymentStatus.Paid,
            PaidAt = DateTime.UtcNow
        };
        _db.Payments.Add(payment);

        // Upgrade user
        var user = await _db.Users.FindAsync(userId);
        user.SubscriptionTier = tier;

        await _db.SaveChangesAsync();
    }
}
```

---

## Stripe Webhook Controller

```csharp
[Route("api/webhooks/stripe")]
[ApiController]
public class StripeWebhookController : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Index()
    {
        var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
        var signature = Request.Headers["Stripe-Signature"];

        try
        {
            await _stripeService.ProcessWebhook(json, signature);
            return Ok();
        }
        catch (StripeException ex)
        {
            _logger.LogError(ex, "Stripe webhook failed");
            return BadRequest(new { error = ex.Message });
        }
    }
}
```

---

## Feature Gating (acces per abonament)

```csharp
// Atribut custom pentru a restricționa accesul la capitole
public class RequireSubscriptionAttribute : Attribute
{
    public SubscriptionTier MinimumTier { get; }
    public RequireSubscriptionAttribute(SubscriptionTier tier) => MinimumTier = tier;
}

// Middleware / Filter
public class SubscriptionFilter : IAsyncPageFilter
{
    public async Task OnPageHandlerExecutionAsync(
        PageHandlerExecutingContext context, PageHandlerExecutionDelegate next)
    {
        var user = await _userManager.GetUserAsync(context.HttpContext.User);
        var requiredTier = context.HandlerInstance?.GetType()
            .GetCustomAttribute<RequireSubscriptionAttribute>()?.MinimumTier 
            ?? SubscriptionTier.Free;

        if (user.SubscriptionTier < requiredTier)
        {
            context.Result = new RedirectToPageResult("/Billing/Upgrade", new { 
                required = requiredTier, current = user.SubscriptionTier 
            });
            return;
        }

        await next();
    }
}

// Utilizare: restricționează paginile premium
[RequireSubscription(SubscriptionTier.Premium)]
public class BacAnalysisModel : PageModel { }  // Analiza BAC AI — doar Premium

[RequireSubscription(SubscriptionTier.Basic)]
public class CppRunnerModel : PageModel { }     // C++ runner — Basic+
```

---

## Setup Stripe

1. Creează cont pe https://dashboard.stripe.com
2. Creează produse și prețuri (Basic 29 RON, Premium 59 RON)
3. Configurează webhook endpoint: `https://infolicu.ro/api/webhooks/stripe`
4. Evenimente webhook necesare:
   - `checkout.session.completed`
   - `invoice.paid`
   - `customer.subscription.deleted`
5. Copiază `WebhookSigningSecret` și `ApiKey` în Azure Key Vault

```bash
# Configurare locală (appsettings.Development.json)
{
  "Stripe": {
    "ApiKey": "sk_test_...",
    "WebhookSecret": "whsec_..."
  }
}
```

---

## 🔗 Documente conexe

- [01-database-schema.md](./01-database-schema.md) — Tabelele `Subscriptions`, `Payments`
- [09-diagrams.md](./09-diagrams.md) — Flow plată Stripe (PlantUML)
- [08-migration-plan.md](./08-migration-plan.md) — Faza 6
