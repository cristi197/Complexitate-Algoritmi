using InfoLiceu.Domain.Common;
using InfoLiceu.Domain.DTOs;
using InfoLiceu.Domain.Entities;
using InfoLiceu.Domain.Stores;
using InfoLiceu.Application.Services;
using NSubstitute;
using Shouldly;
using ZiggyCreatures.Caching.Fusion;

namespace InfoLiceu.Infrastructure.Tests.Services;

public partial class ChapterServiceTests
{
    private readonly IChapterStore _chapterStore = Substitute.For<IChapterStore>();
    private readonly IFusionCache _cache = new FusionCache(new FusionCacheOptions());
}

public partial class ChapterServiceTests
{
    [Theory]
    [InlineData(1)] // store is null
    [InlineData(2)] // cache is null
    public void Constructor_Should_ThrowArgumentNullException_When_ParameterIsNull(int nullParamIndex)
    {
        var store = nullParamIndex == 1 ? null! : _chapterStore;
        var cache = nullParamIndex == 2 ? null! : new FusionCache(new FusionCacheOptions());

        Should.Throw<ArgumentNullException>(() => new ChapterService(store, cache));
    }
}

public partial class ChapterServiceTests
{
    [Fact]
    public async Task GetBySlugAsync_Should_ReturnChapterDto_When_ChapterExists()
    {
        // Arrange
        var chapter = new Chapter
        {
            Slug = "complexitate-algoritmi", Title = "Complexitate Algoritmi",
            Subtitle = "Introducere", Icon = "📊", OrderIndex = 1,
            ContentJson = """[{"title":"Slide 1","body":"Content"}]""", EstimatedMin = 30
        };
        _chapterStore.GetBySlugAsync("complexitate-algoritmi", Arg.Any<CancellationToken>())
            .Returns(ResultBuilder.Ok<Chapter?>(chapter));
        var sut = new ChapterService(_chapterStore, _cache);

        // Act
        var result = await sut.GetBySlugAsync("complexitate-algoritmi");

        // Assert
        result.ShouldNotBeNull();
        result.Slug.ShouldBe("complexitate-algoritmi");
        result.Title.ShouldBe("Complexitate Algoritmi");
        result.TotalSlides.ShouldBe(1);
    }

    [Fact]
    public async Task GetBySlugAsync_Should_ReturnNull_When_ChapterDoesNotExist()
    {
        // Arrange
        _chapterStore.GetBySlugAsync("nu-exista", Arg.Any<CancellationToken>())
            .Returns(ResultBuilder.NotFound<Chapter?>());
        var sut = new ChapterService(_chapterStore, _cache);

        // Act
        var result = await sut.GetBySlugAsync("nu-exista");

        // Assert
        result.ShouldBeNull();
    }

    [Fact]
    public async Task ListChaptersAsync_Should_ReturnOrderedList_When_ChaptersExist()
    {
        // Arrange
        var chapters = new List<Chapter>
        {
            new() { Slug = "a", Title = "A", OrderIndex = 1 },
            new() { Slug = "b", Title = "B", OrderIndex = 2 },
            new() { Slug = "c", Title = "C", OrderIndex = 3 }
        };
        _chapterStore.GetAllAsync(Arg.Any<CancellationToken>())
            .Returns(ResultBuilder.Ok(chapters));
        var sut = new ChapterService(_chapterStore, _cache);

        // Act
        var result = await sut.ListChaptersAsync();

        // Assert
        result.Count.ShouldBe(3);
        result[0].Title.ShouldBe("A");
        result[1].Title.ShouldBe("B");
        result[2].Title.ShouldBe("C");
    }
}
