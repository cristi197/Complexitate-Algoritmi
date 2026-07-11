using InfoLiceu.Domain.Common;

namespace InfoLiceu.Domain.Stores;

public interface IExerciseStore
{
    Task<Result<List<Entities.Exercise>>> GetByChapterAsync(int chapterId, CancellationToken ct = default);
    Task<Result<Entities.Exercise?>> GetByIdAsync(int exerciseId, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
}
