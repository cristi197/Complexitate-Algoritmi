using InfoLiceu.Domain.Common;
using InfoLiceu.Domain.DTOs;
using InfoLiceu.Domain.Entities;
using InfoLiceu.Domain.Stores;
using InfoLiceu.Application.Services;
using Microsoft.Extensions.Logging;
using NSubstitute;
using Shouldly;
using ZiggyCreatures.Caching.Fusion;

namespace InfoLiceu.Infrastructure.Tests.Services;

public partial class QuizServiceTests
{
    private readonly IChapterStore _chapterStore = Substitute.For<IChapterStore>();
    private readonly IExerciseStore _exerciseStore = Substitute.For<IExerciseStore>();
    private readonly IQuizAttemptStore _quizAttemptStore = Substitute.For<IQuizAttemptStore>();
    private readonly IFusionCache _cache = new FusionCache(new FusionCacheOptions());
    private readonly ILogger<QuizService> _logger = Substitute.For<ILogger<QuizService>>();

    private static List<Chapter> CreateTestChapters()
    {
        return
        [
            new Chapter
            {
                Id = 1, Slug = "test-chapter", Title = "Capitol Test",
                Subtitle = "Subtitlu", Icon = "🧪", OrderIndex = 1,
                ContentJson = """[{"title":"S1","body":"B1"}]""", EstimatedMin = 15
            }
        ];
    }

    private static List<Exercise> CreateTestExercises(int chapterId = 1, int count = 5)
    {
        var exercises = new List<Exercise>();
        for (int i = 0; i < count; i++)
        {
            exercises.Add(new Exercise
            {
                Id = i + 1,
                ChapterId = chapterId,
                Type = ExerciseType.MultipleChoice,
                Question = $"Întrebarea {i + 1}?",
                OptionsJson = """["A","B","C","D"]""",
                CorrectAnswer = $"Răspuns {i + 1}",
                Explanation = $"Explicație {i + 1}",
                Difficulty = Difficulty.Easy,
                TimesAttempted = 0,
                TimesSolved = 0
            });
        }
        return exercises;
    }
}

public partial class QuizServiceTests
{
    [Theory]
    [InlineData(1)] // chapterStore null
    [InlineData(2)] // exerciseStore null
    [InlineData(3)] // quizAttemptStore null
    [InlineData(4)] // cache null
    [InlineData(5)] // logger null
    public void Constructor_Should_ThrowArgumentNullException_When_ParameterIsNull(int nullParamIndex)
    {
        var chapterStore = nullParamIndex == 1 ? null! : _chapterStore;
        var exerciseStore = nullParamIndex == 2 ? null! : _exerciseStore;
        var quizAttemptStore = nullParamIndex == 3 ? null! : _quizAttemptStore;
        var cache = nullParamIndex == 4 ? null! : _cache;
        var logger = nullParamIndex == 5 ? null! : _logger;

        Should.Throw<ArgumentNullException>(() =>
            new QuizService(chapterStore, exerciseStore, quizAttemptStore, cache, logger));
    }
}

public partial class QuizServiceTests
{
    [Fact]
    public async Task StartQuizAsync_Should_ReturnQuiz_When_ExercisesExist()
    {
        // Arrange
        var exercises = CreateTestExercises();
        _exerciseStore.GetByChapterAsync(1).Returns(ResultBuilder.Ok(exercises));
        _chapterStore.GetAllAsync().Returns(ResultBuilder.Ok(CreateTestChapters()));

        var sut = new QuizService(_chapterStore, _exerciseStore, _quizAttemptStore, _cache, _logger);

        // Act
        var result = await sut.StartQuizAsync(1, 3, Guid.NewGuid());

        // Assert
        result.ShouldNotBeNull();
        result.TotalQuestions.ShouldBe(3);
        result.ChapterId.ShouldBe(1);
        result.ChapterTitle.ShouldBe("Capitol Test");
        result.FirstQuestion.ShouldNotBeNull();
        result.FirstQuestion!.TotalQuestions.ShouldBe(3);
        result.FirstQuestion.QuestionIndex.ShouldBe(1);
        result.QuizId.ShouldNotBeNullOrEmpty();
    }

    [Fact]
    public async Task StartQuizAsync_Should_ReturnNull_When_NoExercises()
    {
        // Arrange
        _exerciseStore.GetByChapterAsync(1).Returns(ResultBuilder.Ok(new List<Exercise>()));
        var sut = new QuizService(_chapterStore, _exerciseStore, _quizAttemptStore, _cache, _logger);

        // Act
        var result = await sut.StartQuizAsync(1, 3, Guid.NewGuid());

        // Assert
        result.ShouldBeNull();
    }

    [Fact]
    public async Task StartQuizAsync_Should_ReturnNull_When_StoreFails()
    {
        // Arrange
        _exerciseStore.GetByChapterAsync(1).Returns(ResultBuilder.Error<List<Exercise>>("DB error"));
        var sut = new QuizService(_chapterStore, _exerciseStore, _quizAttemptStore, _cache, _logger);

        // Act
        var result = await sut.StartQuizAsync(1, 3, Guid.NewGuid());

        // Assert
        result.ShouldBeNull();
    }

    [Fact]
    public async Task StartQuizAsync_Should_DefaultToFiveQuestions_When_CountIsZero()
    {
        // Arrange
        var exercises = CreateTestExercises(count: 10);
        _exerciseStore.GetByChapterAsync(1).Returns(ResultBuilder.Ok(exercises));
        _chapterStore.GetAllAsync().Returns(ResultBuilder.Ok(CreateTestChapters()));

        var sut = new QuizService(_chapterStore, _exerciseStore, _quizAttemptStore, _cache, _logger);

        // Act
        var result = await sut.StartQuizAsync(1, 0, Guid.NewGuid());

        // Assert
        result.ShouldNotBeNull();
        result.TotalQuestions.ShouldBe(5);
    }
}

public partial class QuizServiceTests
{
    [Fact]
    public async Task SubmitAnswerAsync_Should_ReturnCorrect_When_AnswerMatches()
    {
        // Arrange
        var exercises = CreateTestExercises();
        _exerciseStore.GetByChapterAsync(1).Returns(ResultBuilder.Ok(exercises));
        _chapterStore.GetAllAsync().Returns(ResultBuilder.Ok(CreateTestChapters()));
        foreach (var ex in exercises)
            _exerciseStore.GetByIdAsync(ex.Id).Returns(ResultBuilder.Ok<Exercise?>(ex));

        var sut = new QuizService(_chapterStore, _exerciseStore, _quizAttemptStore, _cache, _logger);
        var startResult = await sut.StartQuizAsync(1, 3, Guid.NewGuid());
        var quizId = startResult!.QuizId;
        var firstExerciseId = startResult.FirstQuestion!.ExerciseId;
        // Use the actual correct answer from the selected exercise
        var correctAnswer = exercises.First(e => e.Id == firstExerciseId).CorrectAnswer;

        // Act
        var result = await sut.SubmitAnswerAsync(quizId, firstExerciseId, correctAnswer);

        // Assert
        result.ShouldNotBeNull();
        result.IsCorrect.ShouldBeTrue();
        result.CorrectAnswer.ShouldNotBeEmpty();
        result.Explanation.ShouldBeNull();
        result.QuestionsAnswered.ShouldBe(1);
        result.TotalQuestions.ShouldBe(3);
    }

    [Fact]
    public async Task SubmitAnswerAsync_Should_ReturnIncorrect_When_AnswerDoesNotMatch()
    {
        // Arrange
        var exercises = CreateTestExercises();
        _exerciseStore.GetByChapterAsync(1).Returns(ResultBuilder.Ok(exercises));
        _chapterStore.GetAllAsync().Returns(ResultBuilder.Ok(CreateTestChapters()));
        foreach (var ex in exercises)
            _exerciseStore.GetByIdAsync(ex.Id).Returns(ResultBuilder.Ok<Exercise?>(ex));

        var sut = new QuizService(_chapterStore, _exerciseStore, _quizAttemptStore, _cache, _logger);
        var startResult = await sut.StartQuizAsync(1, 3, Guid.NewGuid());
        var quizId = startResult!.QuizId;
        var firstExerciseId = startResult.FirstQuestion!.ExerciseId;

        _exerciseStore.GetByIdAsync(firstExerciseId).Returns(
            ResultBuilder.Ok<Exercise?>(exercises.First(e => e.Id == firstExerciseId)));

        // Act
        var result = await sut.SubmitAnswerAsync(quizId, firstExerciseId, "Răspuns greșit");

        // Assert
        result.ShouldNotBeNull();
        result.IsCorrect.ShouldBeFalse();
        result.Explanation.ShouldNotBeNull();
    }

    [Fact]
    public async Task SubmitAnswerAsync_Should_ReturnNull_When_QuizNotFound()
    {
        // Arrange
        var sut = new QuizService(_chapterStore, _exerciseStore, _quizAttemptStore, _cache, _logger);

        // Act
        var result = await sut.SubmitAnswerAsync("nonexistent", 1, "answer");

        // Assert
        result.ShouldBeNull();
    }

    [Fact]
    public async Task SubmitAnswerAsync_Should_ReturnNull_When_AlreadyAnswered()
    {
        // Arrange
        var exercises = CreateTestExercises();
        _exerciseStore.GetByChapterAsync(1).Returns(ResultBuilder.Ok(exercises));
        _chapterStore.GetAllAsync().Returns(ResultBuilder.Ok(CreateTestChapters()));
        foreach (var ex in exercises)
            _exerciseStore.GetByIdAsync(ex.Id).Returns(ResultBuilder.Ok<Exercise?>(ex));

        var sut = new QuizService(_chapterStore, _exerciseStore, _quizAttemptStore, _cache, _logger);
        var startResult = await sut.StartQuizAsync(1, 3, Guid.NewGuid());
        var quizId = startResult!.QuizId;
        var firstExerciseId = startResult.FirstQuestion!.ExerciseId;
        var correctAnswer = exercises.First(e => e.Id == firstExerciseId).CorrectAnswer;

        // Answer once
        await sut.SubmitAnswerAsync(quizId, firstExerciseId, correctAnswer);

        // Act - answer again
        var result = await sut.SubmitAnswerAsync(quizId, firstExerciseId, "Alt răspuns");

        // Assert
        result.ShouldBeNull();
    }

    [Fact]
    public async Task SubmitAnswerAsync_Should_ReturnNextQuestion_When_MoreQuestionsRemain()
    {
        // Arrange
        var exercises = CreateTestExercises(count: 5);
        _exerciseStore.GetByChapterAsync(1).Returns(ResultBuilder.Ok(exercises));
        _chapterStore.GetAllAsync().Returns(ResultBuilder.Ok(CreateTestChapters()));
        // Set up GetByIdAsync for all possible exercise IDs
        foreach (var ex in exercises)
            _exerciseStore.GetByIdAsync(ex.Id).Returns(ResultBuilder.Ok<Exercise?>(ex));

        var sut = new QuizService(_chapterStore, _exerciseStore, _quizAttemptStore, _cache, _logger);
        var startResult = await sut.StartQuizAsync(1, 3, Guid.NewGuid());
        var quizId = startResult!.QuizId;
        var firstExerciseId = startResult.FirstQuestion!.ExerciseId;
        var correctAnswer = exercises.First(e => e.Id == firstExerciseId).CorrectAnswer;

        // Act
        var result = await sut.SubmitAnswerAsync(quizId, firstExerciseId, correctAnswer);

        // Assert
        result.ShouldNotBeNull();
        result.NextQuestion.ShouldNotBeNull();
        result.NextQuestion!.QuestionIndex.ShouldBe(2);
        result.QuestionsAnswered.ShouldBe(1);
    }

    [Fact]
    public async Task SubmitAnswerAsync_Should_ReturnNullNext_When_LastQuestion()
    {
        // Arrange
        var exercises = CreateTestExercises(count: 5);
        _exerciseStore.GetByChapterAsync(1).Returns(ResultBuilder.Ok(exercises));
        _chapterStore.GetAllAsync().Returns(ResultBuilder.Ok(CreateTestChapters()));
        foreach (var ex in exercises)
            _exerciseStore.GetByIdAsync(ex.Id).Returns(ResultBuilder.Ok<Exercise?>(ex));

        var sut = new QuizService(_chapterStore, _exerciseStore, _quizAttemptStore, _cache, _logger);
        var startResult = await sut.StartQuizAsync(1, 2, Guid.NewGuid());
        var quizId = startResult!.QuizId;
        var firstExerciseId = startResult.FirstQuestion!.ExerciseId;
        var correctAnswer1 = exercises.First(e => e.Id == firstExerciseId).CorrectAnswer;

        // Answer first
        var r1 = await sut.SubmitAnswerAsync(quizId, firstExerciseId, correctAnswer1);
        r1.ShouldNotBeNull();

        // Answer second (last)
        var secondExerciseId = r1!.NextQuestion!.ExerciseId;
        _exerciseStore.GetByIdAsync(secondExerciseId).Returns(
            ResultBuilder.Ok<Exercise?>(exercises.First(e => e.Id == secondExerciseId)));
        var r2 = await sut.SubmitAnswerAsync(quizId, secondExerciseId, "Răspuns greșit");

        // Assert
        r2.ShouldNotBeNull();
        r2.NextQuestion.ShouldBeNull();
        r2.QuestionsAnswered.ShouldBe(2);
    }
}

public partial class QuizServiceTests
{
    [Fact]
    public async Task GetResultsAsync_Should_ReturnResults_When_QuizExists()
    {
        // Arrange
        var exercises = CreateTestExercises();
        _exerciseStore.GetByChapterAsync(1).Returns(ResultBuilder.Ok(exercises));
        _chapterStore.GetAllAsync().Returns(ResultBuilder.Ok(CreateTestChapters()));
        _quizAttemptStore.SaveBatchAsync(Arg.Any<List<QuizAttempt>>()).Returns(ResultBuilder.Ok());
        foreach (var ex in exercises)
            _exerciseStore.GetByIdAsync(ex.Id).Returns(ResultBuilder.Ok<Exercise?>(ex));

        var sut = new QuizService(_chapterStore, _exerciseStore, _quizAttemptStore, _cache, _logger);
        var startResult = await sut.StartQuizAsync(1, 3, Guid.NewGuid());
        var quizId = startResult!.QuizId;
        var firstId = startResult.FirstQuestion!.ExerciseId;
        var correctAnswer = exercises.First(e => e.Id == firstId).CorrectAnswer;

        await sut.SubmitAnswerAsync(quizId, firstId, correctAnswer);

        // Act
        var result = await sut.GetResultsAsync(quizId);

        // Assert
        result.ShouldNotBeNull();
        result.CorrectCount.ShouldBe(1);
        result.TotalQuestions.ShouldBe(3);
        result.ScorePercent.ShouldBeGreaterThan(0);
        result.Answers.Count.ShouldBe(3); // includes unanswered
        await _quizAttemptStore.Received(1).SaveBatchAsync(
            Arg.Is<List<QuizAttempt>>(a => a.Count == 1), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetResultsAsync_Should_ReturnNull_When_QuizNotFound()
    {
        // Arrange
        var sut = new QuizService(_chapterStore, _exerciseStore, _quizAttemptStore, _cache, _logger);

        // Act
        var result = await sut.GetResultsAsync("nonexistent");

        // Assert
        result.ShouldBeNull();
    }

    [Fact]
    public async Task GetResultsAsync_Should_ReturnZeroScore_When_AllWrong()
    {
        // Arrange
        var exercises = CreateTestExercises(count: 3);
        _exerciseStore.GetByChapterAsync(1).Returns(ResultBuilder.Ok(exercises));
        _chapterStore.GetAllAsync().Returns(ResultBuilder.Ok(CreateTestChapters()));
        _quizAttemptStore.SaveBatchAsync(Arg.Any<List<QuizAttempt>>()).Returns(ResultBuilder.Ok());
        foreach (var ex in exercises)
            _exerciseStore.GetByIdAsync(ex.Id).Returns(ResultBuilder.Ok<Exercise?>(ex));

        var sut = new QuizService(_chapterStore, _exerciseStore, _quizAttemptStore, _cache, _logger);
        var startResult = await sut.StartQuizAsync(1, 3, Guid.NewGuid());
        var quizId = startResult!.QuizId;
        var firstId = startResult.FirstQuestion!.ExerciseId;

        await sut.SubmitAnswerAsync(quizId, firstId, "Complet greșit");

        // Act
        var result = await sut.GetResultsAsync(quizId);

        // Assert
        result.ShouldNotBeNull();
        result.CorrectCount.ShouldBe(0);
        result.ScorePercent.ShouldBe(0);
    }
}
