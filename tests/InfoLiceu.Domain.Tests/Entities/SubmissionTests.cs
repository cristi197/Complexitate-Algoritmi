using InfoLiceu.Domain.Entities;
using Shouldly;

namespace InfoLiceu.Domain.Tests.Entities;

public partial class SubmissionTests
{
}

public partial class SubmissionTests
{
    [Fact]
    public void Constructor_Should_CreateSubmission_WithDefaultValues()
    {
        // Act
        var submission = new Submission();

        // Assert
        submission.SourceCode.ShouldBeEmpty();
        submission.PassedAllTests.ShouldBeFalse();
        submission.SubmittedAt.ShouldNotBe(default);
    }
}

public partial class SubmissionTests
{
    [Fact]
    public void SetProperties_Should_StoreValues_When_Assigned()
    {
        // Act
        var submission = new Submission
        {
            UserId = Guid.NewGuid(),
            ExerciseId = 42,
            CompilerOutput = "Compilation successful",
            PassedAllTests = true,
            ExecutionTimeMs = 150,
            MemoryUsedKb = 4096
        };

        // Assert
        submission.UserId.ShouldNotBe(Guid.Empty);
        submission.ExerciseId.ShouldBe(42);
        submission.CompilerOutput.ShouldBe("Compilation successful");
        submission.PassedAllTests.ShouldBeTrue();
        submission.ExecutionTimeMs.ShouldBe(150);
        submission.MemoryUsedKb.ShouldBe(4096);
    }
}
