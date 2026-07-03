using InfoLiceu.Domain.Entities;
using Shouldly;

namespace InfoLiceu.Domain.Tests.Entities;

public partial class AuditLogTests
{
}

public partial class AuditLogTests
{
    [Fact]
    public void Constructor_Should_CreateAuditLog_WithDefaultValues()
    {
        // Act
        var log = new AuditLog();

        // Assert
        log.Action.ShouldBe(string.Empty);
        log.Timestamp.ShouldNotBe(default);
        log.UserId.ShouldBeNull();
    }
}

public partial class AuditLogTests
{
    [Fact]
    public void SetProperties_Should_StoreValues_When_Assigned()
    {
        // Act
        var log = new AuditLog
        {
            UserId = Guid.NewGuid(),
            Action = "ViewChapter",
            EntityType = "Chapter",
            EntityId = "5",
            MetadataJson = """{"ip":"127.0.0.1"}"""
        };

        // Assert
        log.Action.ShouldBe("ViewChapter");
        log.EntityType.ShouldBe("Chapter");
        log.EntityId.ShouldBe("5");
        log.MetadataJson.ShouldContain("127.0.0.1");
    }
}
