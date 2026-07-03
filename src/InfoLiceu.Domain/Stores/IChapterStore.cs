using InfoLiceu.Domain.Common;

namespace InfoLiceu.Domain.Stores;

public interface IChapterStore
{
    Task<Result<List<Entities.Chapter>>> GetAllAsync(CancellationToken ct = default);
    Task<Result<Entities.Chapter?>> GetBySlugAsync(string slug, CancellationToken ct = default);
}
