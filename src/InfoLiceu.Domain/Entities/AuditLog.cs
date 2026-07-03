namespace InfoLiceu.Domain.Entities;

/// <summary>
/// Jurnal de audit — fiecare acțiune a utilizatorului (login, view chapter, submit answer etc.).
/// </summary>
public class AuditLog
{
    public long Id { get; set; }
    public Guid? UserId { get; set; }

    /// <summary>Ex: 'Login', 'ViewChapter', 'SubmitAnswer', 'SendMessage'</summary>
    public string Action { get; set; } = string.Empty;

    public string? EntityType { get; set; }
    public string? EntityId { get; set; }

    /// <summary>JSON: IP, UserAgent, detalii adiționale.</summary>
    public string? MetadataJson { get; set; }

    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    public User? User { get; set; }
}
