using InfoLiceu.Domain.Common;
using InfoLiceu.Domain.Entities;
using InfoLiceu.Domain.Stores;
using InfoLiceu.Infrastructure.Data;
using InfoLiceu.Infrastructure.Extensions;
using Microsoft.Extensions.Logging;

namespace InfoLiceu.Infrastructure.Stores;

internal sealed class QuizAttemptStore : IQuizAttemptStore
{
    private readonly AppDbContext _db;
    private readonly ILogger<QuizAttemptStore> _logger;

    public QuizAttemptStore(AppDbContext db, ILogger<QuizAttemptStore> logger)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<Result> SaveBatchAsync(List<QuizAttempt> attempts, CancellationToken ct = default)
    {
        if (attempts.Count == 0) return ResultBuilder.Ok();

        try
        {
            _db.QuizAttempts.AddRange(attempts);
            var saved = await _db.SaveChangesAsync(ct);
            _logger.EntitySaved(nameof(QuizAttempt), $"{saved} records");
            return ResultBuilder.Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to save QuizAttempt batch: {Count} records", attempts.Count);
            return ResultBuilder.Error($"Failed to save quiz attempts: {ex.Message}");
        }
    }
}
