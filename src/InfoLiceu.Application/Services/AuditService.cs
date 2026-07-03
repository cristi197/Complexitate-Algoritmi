using System.Text.Json;
using InfoLiceu.Domain.Common;
using InfoLiceu.Domain.Entities;
using InfoLiceu.Domain.Services;
using InfoLiceu.Domain.Stores;
using Microsoft.Extensions.Logging;

namespace InfoLiceu.Application.Services;

internal sealed class AuditService : IAuditService
{
    private readonly IAuditStore _auditStore;
    private readonly ILogger<AuditService> _logger;

    public AuditService(IAuditStore auditStore, ILogger<AuditService> logger)
    {
        _auditStore = auditStore ?? throw new ArgumentNullException(nameof(auditStore));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<Result> StoreAsync(AuditEntry entry, CancellationToken ct = default)
    {
        if (entry is null)
        {
            _logger.LogWarning("Audit entry is null");
            return ResultBuilder.Error("Audit entry is null");
        }

        var entity = new AuditLog
        {
            Action = entry.Action,
            EntityType = entry.BusinessArea,
            MetadataJson = JsonSerializer.Serialize(new
            {
                entry.ActionDetails,
                entry.UserDetails,
                entry.ClientDetails,
                entry.MachineDetails,
                Original = entry.Original,
                Modified = entry.Modified
            }),
            Timestamp = entry.EventDate.UtcDateTime
        };

        var result = await _auditStore.StoreAsync(entity, ct);
        if (!result.IsSuccess)
        {
            return ResultBuilder.Error("Failed to save audit entry");
        }

        return ResultBuilder.Ok();
    }
}
