using System.Text.Json;
using InfoLiceu.Domain.Common;
using InfoLiceu.Domain.DTOs;
using InfoLiceu.Domain.Services;
using InfoLiceu.Domain.Stores;
using ZiggyCreatures.Caching.Fusion;

namespace InfoLiceu.Application.Services;

internal sealed class ChapterService : IChapterService
{
    private readonly IChapterStore _chapterStore;
    private readonly IFusionCache _cache;

    public ChapterService(IChapterStore chapterStore, IFusionCache cache)
    {
        _chapterStore = chapterStore ?? throw new ArgumentNullException(nameof(chapterStore));
        _cache = cache ?? throw new ArgumentNullException(nameof(cache));
    }

    public async Task<ChapterDto?> GetBySlugAsync(string slug, CancellationToken ct = default)
    {
        return await _cache.GetOrSetAsync<ChapterDto?>(
            $"ch:{slug}",
            async (ctx, ct2) =>
            {
                var result = await _chapterStore.GetBySlugAsync(slug, ct2);
                if (!result.IsSuccess || result.Value is null) return null;

                var chapter = result.Value;
                var slides = JsonSerializer.Deserialize<JsonElement[]>(chapter.ContentJson) ?? [];
                return new ChapterDto
                {
                    Id = chapter.Id, Slug = chapter.Slug, Title = chapter.Title,
                    Subtitle = chapter.Subtitle, Icon = chapter.Icon,
                    ContentJson = chapter.ContentJson, Tags = chapter.Tags,
                    EstimatedMin = chapter.EstimatedMin, TotalSlides = slides.Length
                };
            },
            options => options.SetDuration(TimeSpan.FromMinutes(30))
        );
    }

    public async Task<List<ChapterCardDto>> ListChaptersAsync(Guid? userId = null, CancellationToken ct = default)
    {
        var result = await _chapterStore.GetAllAsync(ct);
        if (!result.IsSuccess || result.Value is null) return [];

        return result.Value.Select(c => new ChapterCardDto
        {
            Slug = c.Slug, Title = c.Title, Subtitle = c.Subtitle,
            Icon = c.Icon, EstimatedMin = c.EstimatedMin
        }).ToList();
    }
}
