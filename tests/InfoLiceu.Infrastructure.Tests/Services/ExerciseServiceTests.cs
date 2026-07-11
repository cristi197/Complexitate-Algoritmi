using InfoLiceu.Domain.Common;
using InfoLiceu.Domain.Entities;
using InfoLiceu.Domain.Stores;
using InfoLiceu.Application.Services;
using NSubstitute;
using Shouldly;

namespace InfoLiceu.Infrastructure.Tests.Services;

public partial class ExerciseServiceTests
{
    private readonly IExerciseStore _exerciseStore = Substitute.For<IExerciseStore>();

    private static Exercise CreateTestExercise(int id = 1, string correctAnswer = "Răspuns corect")
    {
        return new Exercise
        {
            Id = id,
            ChapterId = 1,
            Type = ExerciseType.MultipleChoice,
            Question = "Întrebare test?",
            OptionsJson = """["Răspuns corect","Răspuns greșit 1","Răspuns greșit 2"]""",
            CorrectAnswer = correctAnswer,
            Explanation = "Explicație test.",
            Difficulty = Difficulty.Easy,
            TimesAttempted = 5,
            TimesSolved = 3
        };
    }
}

public partial class ExerciseServiceTests
{
    [Theory]
    [InlineData(1)] // store is null
    public void Constructor_Should_ThrowArgumentNullException_When_ParameterIsNull(int nullParamIndex)
    {
        var store = nullParamIndex == 1 ? null! : _exerciseStore;

        Should.Throw<ArgumentNullException>(() => new ExerciseService(store));
    }
}

public partial class ExerciseServiceTests
{
    [Fact]
    public async Task GetByChapterAsync_Should_ReturnExerciseList_When_ExercisesExist()
    {
        // Arrange
        var exercises = new List<Exercise>
        {
            CreateTestExercise(1, "A"),
            CreateTestExercise(2, "B")
        };
        _exerciseStore.GetByChapterAsync(1).Returns(ResultBuilder.Ok(exercises));

        var sut = new ExerciseService(_exerciseStore);

        // Act
        var result = await sut.GetByChapterAsync(1);

        // Assert
        result.ShouldNotBeNull();
        result.Count.ShouldBe(2);
        result[0].Id.ShouldBe(1);
        result[0].Type.ShouldBe("MultipleChoice");
        result[0].TimesAttempted.ShouldBe(5);
        result[0].TimesSolved.ShouldBe(3);
    }

    [Fact]
    public async Task GetByChapterAsync_Should_ReturnEmptyList_When_NoExercises()
    {
        // Arrange
        _exerciseStore.GetByChapterAsync(999).Returns(ResultBuilder.Ok(new List<Exercise>()));

        var sut = new ExerciseService(_exerciseStore);

        // Act
        var result = await sut.GetByChapterAsync(999);

        // Assert
        result.ShouldNotBeNull();
        result.ShouldBeEmpty();
    }

    [Fact]
    public async Task GetByChapterAsync_Should_ReturnEmptyList_When_StoreFails()
    {
        // Arrange
        _exerciseStore.GetByChapterAsync(1).Returns(ResultBuilder.Error<List<Exercise>>("DB error"));

        var sut = new ExerciseService(_exerciseStore);

        // Act
        var result = await sut.GetByChapterAsync(1);

        // Assert
        result.ShouldNotBeNull();
        result.ShouldBeEmpty();
    }
}

public partial class ExerciseServiceTests
{
    [Fact]
    public async Task SubmitAnswerAsync_Should_ReturnCorrect_When_AnswerMatches()
    {
        // Arrange
        var exercise = CreateTestExercise(1, "Răspuns corect");
        _exerciseStore.GetByIdAsync(1).Returns(ResultBuilder.Ok<Exercise?>(exercise));

        var sut = new ExerciseService(_exerciseStore);

        // Act
        var result = await sut.SubmitAnswerAsync(1, "Răspuns corect", Guid.NewGuid());

        // Assert
        result.IsCorrect.ShouldBeTrue();
        result.CorrectAnswer.ShouldBe("Răspuns corect");
        result.Explanation.ShouldBeNull();
        exercise.TimesAttempted.ShouldBe(6); // incremented
        exercise.TimesSolved.ShouldBe(4);    // incremented
        await _exerciseStore.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task SubmitAnswerAsync_Should_ReturnIncorrect_When_AnswerDoesNotMatch()
    {
        // Arrange
        var exercise = CreateTestExercise(1, "Răspuns corect");
        _exerciseStore.GetByIdAsync(1).Returns(ResultBuilder.Ok<Exercise?>(exercise));

        var sut = new ExerciseService(_exerciseStore);

        // Act
        var result = await sut.SubmitAnswerAsync(1, "Răspuns greșit", Guid.NewGuid());

        // Assert
        result.IsCorrect.ShouldBeFalse();
        result.CorrectAnswer.ShouldBe("Răspuns corect");
        result.Explanation.ShouldBe("Explicație test.");
        exercise.TimesAttempted.ShouldBe(6); // incremented
        exercise.TimesSolved.ShouldBe(3);    // NOT incremented
        await _exerciseStore.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task SubmitAnswerAsync_Should_HandleWhitespace_When_Trimming()
    {
        // Arrange
        var exercise = CreateTestExercise(1, "Răspuns corect");
        _exerciseStore.GetByIdAsync(1).Returns(ResultBuilder.Ok<Exercise?>(exercise));

        var sut = new ExerciseService(_exerciseStore);

        // Act
        var result = await sut.SubmitAnswerAsync(1, "  răspuns corect  ", Guid.NewGuid());

        // Assert
        result.IsCorrect.ShouldBeTrue();
    }

    [Fact]
    public async Task SubmitAnswerAsync_Should_ReturnNotFound_When_ExerciseDoesNotExist()
    {
        // Arrange
        _exerciseStore.GetByIdAsync(999).Returns(ResultBuilder.NotFound<Exercise?>());

        var sut = new ExerciseService(_exerciseStore);

        // Act
        var result = await sut.SubmitAnswerAsync(999, "oricare", Guid.NewGuid());

        // Assert
        result.IsCorrect.ShouldBeFalse();
        result.Explanation.ShouldBe("Exercițiul nu a fost găsit.");
        result.CorrectAnswer.ShouldBeEmpty();
        await _exerciseStore.DidNotReceive().SaveChangesAsync(Arg.Any<CancellationToken>());
    }
}
