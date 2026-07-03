using InfoLiceu.Domain.Common;

namespace InfoLiceu.Domain.Stores;

public interface IAuditStore
{
    Task<Result> StoreAsync(Entities.AuditLog entry, CancellationToken ct = default);
}
