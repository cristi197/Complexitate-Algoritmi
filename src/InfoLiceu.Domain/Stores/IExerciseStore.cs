using InfoLiceu.Domain.Common;

namespace InfoLiceu.Domain.Stores;

public interface IExerciseStore
{
    Task<Result<List<Entities.Exercise>>> GetByChapterAsync(int chapterId, CancellationToken ct = default);
}
