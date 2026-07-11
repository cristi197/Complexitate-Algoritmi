using InfoLiceu.Domain.Common;
using InfoLiceu.Domain.Entities;
using InfoLiceu.Domain.Stores;
using InfoLiceu.Infrastructure.Data;
using InfoLiceu.Infrastructure.Extensions;
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
            .OrderBy(e => e.Difficulty)
            .ThenBy(e => e.Id)
            .ToListAsync(ct);

        return ResultBuilder.Ok(exercises);
    }

    public async Task<Result<Exercise?>> GetByIdAsync(int exerciseId, CancellationToken ct = default)
    {
        var exercise = await _db.Exercises
            .FirstOrDefaultAsync(e => e.Id == exerciseId, ct);

        if (exercise is null)
        {
            _logger.EntityNotFound(nameof(Exercise), exerciseId.ToString());
            return ResultBuilder.NotFound<Exercise?>();
        }

        return ResultBuilder.Ok<Exercise?>(exercise);
    }

    public async Task SaveChangesAsync(CancellationToken ct = default)
    {
        await _db.SaveChangesAsync(ct);
    }
}
