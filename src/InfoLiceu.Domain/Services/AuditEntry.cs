namespace InfoLiceu.Domain.Services;

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
