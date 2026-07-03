using InfoLiceu.Domain.Entities;
using InfoLiceu.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Shouldly;

namespace InfoLiceu.Infrastructure.Tests.Data;

public partial class AppDbContextTests : IDisposable
{
    private readonly AppDbContext _db;

    public AppDbContextTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite("Data Source=:memory:")
            .Options;
        _db = new AppDbContext(options);
        _db.Database.OpenConnection();
        _db.Database.EnsureCreated();
    }

    public void Dispose()
    {
        _db.Database.CloseConnection();
        _db.Dispose();
    }
}

public partial class AppDbContextTests
{
    [Fact]
    public async Task EnsureCreated_Should_CreateAllTables_When_Called()
    {
        // Act — add a chapter to verify writes work
        var chapter = new Chapter { Slug = "test", Title = "Test", OrderIndex = 1, ContentJson = "[]" };
        _db.Chapters.Add(chapter);
        await _db.SaveChangesAsync();

        // Assert
        var saved = await _db.Chapters.FirstOrDefaultAsync(c => c.Slug == "test");
        saved.ShouldNotBeNull();
        saved.Title.ShouldBe("Test");
    }
}

public partial class AppDbContextTests
{
    [Fact]
    public async Task SeedAsync_Should_PopulateChapters_When_DbIsEmpty()
    {
        // Act
        await DbSeeder.SeedAsync(_db);

        // Assert
        var count = await _db.Chapters.CountAsync();
        count.ShouldBe(13);

        var countEx = await _db.Exercises.CountAsync();
        countEx.ShouldBeGreaterThan(0);
    }
}

public partial class AppDbContextTests
{
    [Fact]
    public async Task CanInsert_Should_SaveAllEntityTypes_When_Called()
    {
        // Arrange — need a User for FK constraints
        var userId = Guid.NewGuid();
        var user = new User { Id = userId, Email = "test@test.com", NormalizedEmail = "TEST@TEST.COM", DisplayName = "Test" };
        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var chapter = new Chapter { Slug = "ch1", Title = "Ch1", OrderIndex = 1, ContentJson = "[]" };
        _db.Chapters.Add(chapter);
        await _db.SaveChangesAsync();

        var exercise = new Exercise
        {
            ChapterId = chapter.Id, Type = ExerciseType.MultipleChoice,
            Question = "Q?", CorrectAnswer = "A", Difficulty = Difficulty.Easy
        };
        _db.Exercises.Add(exercise);
        await _db.SaveChangesAsync();

        // Act — add quiz attempt
        var attempt = new QuizAttempt
        {
            UserId = user.Id, ExerciseId = exercise.Id,
            UserAnswer = "A", IsCorrect = true
        };
        _db.QuizAttempts.Add(attempt);
        await _db.SaveChangesAsync();

        // Act — add submission
        var submission = new Submission
        {
            UserId = user.Id, ExerciseId = exercise.Id,
            SourceCode = [1, 2, 3], PassedAllTests = true
        };
        _db.Submissions.Add(submission);
        await _db.SaveChangesAsync();

        // Act — add audit log
        var audit = new AuditLog { Action = "TestAction", EntityType = "Test", UserId = user.Id };
        _db.AuditLogs.Add(audit);
        await _db.SaveChangesAsync();

        // Assert
        (await _db.QuizAttempts.CountAsync()).ShouldBe(1);
        (await _db.Submissions.CountAsync()).ShouldBe(1);
        (await _db.AuditLogs.CountAsync()).ShouldBe(1);
    }
}
