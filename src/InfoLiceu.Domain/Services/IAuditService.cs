using InfoLiceu.Domain.Common;

namespace InfoLiceu.Domain.Services;

/// <summary>
/// Contract pentru audit. Implementarea în Infrastructure folosește EF Core.
/// </summary>
public interface IAuditService
{
    Task<Result> StoreAsync(AuditEntry entry, CancellationToken ct = default);
}

/// <summary>
/// O intrare în jurnalul de audit — ce s-a întâmplat, cine a făcut-o, de pe ce mașină.
/// </summary>
public sealed class AuditEntry
{
    public string Action { get; set; } = string.Empty;
    public string? ActionDetails { get; set; }
    public string BusinessArea { get; set; } = string.Empty;
    public DateTimeOffset EventDate { get; set; } = DateTimeOffset.UtcNow;

    public AuditUser UserDetails { get; set; } = new();
    public AuditClient ClientDetails { get; set; } = new();
    public AuditMachine MachineDetails { get; set; } = new();

    public object? Original { get; set; }
    public object? Modified { get; set; }
}

public sealed class AuditUser
{
    public string? UserId { get; set; }
    public string? UserName { get; set; }
    public string? Email { get; set; }
}

public sealed class AuditClient
{
    public string? ClientId { get; set; }
    public string? ClientName { get; set; }
}

public sealed class AuditMachine
{
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public string? MachineName { get; set; }
}
