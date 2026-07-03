using InfoLiceu.Domain.Common;
using InfoLiceu.Domain.Entities;
using InfoLiceu.Domain.Stores;
using InfoLiceu.Infrastructure.Data;
using InfoLiceu.Infrastructure.Extensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace InfoLiceu.Infrastructure.Stores;

internal sealed class ChapterStore : IChapterStore
{
    private readonly AppDbContext _db;
    private readonly ILogger<ChapterStore> _logger;

    public ChapterStore(AppDbContext db, ILogger<ChapterStore> logger)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<Result<List<Chapter>>> GetAllAsync(CancellationToken ct = default)
    {
        var chapters = await _db.Chapters
            .AsNoTracking()
            .OrderBy(c => c.OrderIndex)
            .ToListAsync(ct);

        return ResultBuilder.Ok(chapters);
    }

    public async Task<Result<Chapter?>> GetBySlugAsync(string slug, CancellationToken ct = default)
    {
        var chapter = await _db.Chapters
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Slug == slug, ct);

        if (chapter is null)
        {
            _logger.EntityNotFound(nameof(Chapter), slug);
            return ResultBuilder.NotFound<Chapter?>();
        }

        return ResultBuilder.Ok<Chapter?>(chapter);
    }
}
