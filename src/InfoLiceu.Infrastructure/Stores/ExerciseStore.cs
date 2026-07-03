using InfoLiceu.Domain.Common;
using InfoLiceu.Domain.Entities;
using InfoLiceu.Domain.Stores;
using InfoLiceu.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace InfoLiceu.Infrastructure.Stores;

internal sealed class ExerciseStore : IExerciseStore
{
    private readonly AppDbContext _db;
    private readonly ILogger<ExerciseStore> _logger;

    public ExerciseStore(AppDbContext db, ILogger<ExerciseStore> logger)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<Result<List<Exercise>>> GetByChapterAsync(int chapterId, CancellationToken ct = default)
    {
        var exercises = await _db.Exercises
            .AsNoTracking()
            .Where(e => e.ChapterId == chapterId)
            .ToListAsync(ct);

        return ResultBuilder.Ok(exercises);
    }
}
