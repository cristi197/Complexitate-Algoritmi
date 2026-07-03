using InfoLiceu.Domain.Common;
using InfoLiceu.Domain.Stores;
using InfoLiceu.Infrastructure.Data;
using InfoLiceu.Infrastructure.Extensions;
using Microsoft.Extensions.Logging;

namespace InfoLiceu.Infrastructure.Stores;

internal sealed class AuditStore : IAuditStore
{
    private readonly AppDbContext _db;
    private readonly ILogger<AuditStore> _logger;

    public AuditStore(AppDbContext db, ILogger<AuditStore> logger)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<Result> StoreAsync(Domain.Entities.AuditLog entry, CancellationToken ct = default)
    {
        _db.AuditLogs.Add(entry);
        var saved = await _db.SaveChangesAsync(ct);

        if (saved == 0)
        {
            return ResultBuilder.Error("Failed to save audit entry");
        }

        _logger.EntitySaved(nameof(Domain.Entities.AuditLog), entry.Id);
        return ResultBuilder.Ok();
    }
}
