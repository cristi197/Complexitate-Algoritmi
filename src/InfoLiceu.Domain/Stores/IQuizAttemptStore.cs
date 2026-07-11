using InfoLiceu.Domain.Common;

namespace InfoLiceu.Domain.Stores;

/// <summary>
/// Store pentru salvarea încercărilor de quiz (QuizAttempt).
/// </summary>
public interface IQuizAttemptStore
{
    /// <summary>
    /// Salvează o listă de QuizAttempt în DB.
    /// </summary>
    Task<Result> SaveBatchAsync(List<Entities.QuizAttempt> attempts, CancellationToken ct = default);
}
