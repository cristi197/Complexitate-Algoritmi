using InfoLiceu.Domain.Common;

namespace InfoLiceu.Domain.Services;

/// <summary>
/// Contract pentru audit. Implementarea în Infrastructure folosește EF Core.
/// </summary>
public interface IAuditService
{
    Task<Result> StoreAsync(AuditEntry entry, CancellationToken ct = default);
}

