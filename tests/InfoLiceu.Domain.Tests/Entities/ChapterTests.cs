using InfoLiceu.Domain.Entities;
using Shouldly;

namespace InfoLiceu.Domain.Tests.Entities;

public partial class ChapterTests
{
}

public partial class ChapterTests
{
    [Fact]
    public void Constructor_Should_CreateChapter_WithDefaultValues()
    {
        // Act
        var chapter = new Chapter();

        // Assert
        chapter.Slug.ShouldBe(string.Empty);
        chapter.ContentJson.ShouldBe("[]");
        chapter.IsPublished.ShouldBeTrue();
        chapter.EstimatedMin.ShouldBe(30);
        chapter.Exercises.ShouldNotBeNull();
        chapter.Exercises.ShouldBeEmpty();
    }
}

public partial class ChapterTests
{
    [Fact]
    public void SetSlug_Should_StoreValue_When_Assigned()
    {
        // Arrange
        var chapter = new Chapter();

        // Act
        chapter.Slug = "test-slug";

        // Assert
        chapter.Slug.ShouldBe("test-slug");
    }
}
