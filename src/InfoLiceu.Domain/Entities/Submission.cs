namespace InfoLiceu.Domain.Entities;

/// <summary>
/// Stochează submisia de cod C++ a unui elev.
/// Codul sursă este criptat cu AES-256 (vezi EncryptionService).
/// </summary>
public class Submission
{
    public long Id { get; set; }
    public Guid UserId { get; set; }
    public int ExerciseId { get; set; }

    /// <summary>Codul sursă C++ criptat (AES-256-GCM).</summary>
    public byte[] SourceCode { get; set; } = [];

    public string? CompilerOutput { get; set; }
    public string? TestResultsJson { get; set; }
    public bool PassedAllTests { get; set; }
    public int? ExecutionTimeMs { get; set; }
    public int? MemoryUsedKb { get; set; }
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public Exercise Exercise { get; set; } = null!;
}
