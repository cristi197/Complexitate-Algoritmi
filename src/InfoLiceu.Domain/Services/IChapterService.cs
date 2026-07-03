using InfoLiceu.Domain.DTOs;

namespace InfoLiceu.Domain.Services;

public interface IChapterService
{
    Task<ChapterDto?> GetBySlugAsync(string slug, CancellationToken ct = default);
    Task<List<ChapterCardDto>> ListChaptersAsync(Guid? userId = null, CancellationToken ct = default);
}
