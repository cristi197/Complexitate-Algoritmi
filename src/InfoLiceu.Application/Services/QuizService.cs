using System.Text.Json;
using InfoLiceu.Domain.Common;
using InfoLiceu.Domain.DTOs;
using InfoLiceu.Domain.Entities;
using InfoLiceu.Domain.Services;
using InfoLiceu.Domain.Stores;
using Microsoft.Extensions.Logging;
using ZiggyCreatures.Caching.Fusion;

namespace InfoLiceu.Application.Services;

/// <summary>
/// Implementarea serviciului de quiz-uri.
/// Starea quiz-ului este stocată în FusionCache pe durata sesiunii (TTL 30 min).
/// La finalizare, răspunsurile sunt persistate ca QuizAttempt în DB.
/// </summary>
internal sealed class QuizService : IQuizService
{
    private const int DefaultQuestionCount = 5;
    private const int CacheDurationMinutes = 30;

    private readonly IChapterStore _chapterStore;
    private readonly IExerciseStore _exerciseStore;
    private readonly IQuizAttemptStore _quizAttemptStore;
    private readonly IFusionCache _cache;
    private readonly ILogger<QuizService> _logger;

    public QuizService(
        IChapterStore chapterStore,
        IExerciseStore exerciseStore,
        IQuizAttemptStore quizAttemptStore,
        IFusionCache cache,
        ILogger<QuizService> logger)
    {
        _chapterStore = chapterStore ?? throw new ArgumentNullException(nameof(chapterStore));
        _exerciseStore = exerciseStore ?? throw new ArgumentNullException(nameof(exerciseStore));
        _quizAttemptStore = quizAttemptStore ?? throw new ArgumentNullException(nameof(quizAttemptStore));
        _cache = cache ?? throw new ArgumentNullException(nameof(cache));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<QuizStartResponseDto?> StartQuizAsync(
        int chapterId, int questionCount, Guid userId, CancellationToken ct = default)
    {
        if (questionCount <= 0) questionCount = DefaultQuestionCount;

        var exercisesResult = await _exerciseStore.GetByChapterAsync(chapterId, ct);
        if (!exercisesResult.IsSuccess || exercisesResult.Value is null or { Count: 0 })
        {
            _logger.LogWarning("No exercises found for chapter {ChapterId}", chapterId);
            return null;
        }

        var exercises = exercisesResult.Value
            .Where(e => e.Type == ExerciseType.MultipleChoice)
            .ToList();

        if (exercises.Count == 0)
        {
            _logger.LogWarning("No multiple-choice exercises for chapter {ChapterId}", chapterId);
            return null;
        }

        var selected = exercises
            .OrderBy(_ => Random.Shared.Next())
            .Take(Math.Min(questionCount, exercises.Count))
            .Select((e, i) => new QuizSessionItem
            {
                ExerciseId = e.Id,
                QuestionIndex = i + 1,
                CorrectAnswer = e.CorrectAnswer,
                Explanation = e.Explanation,
                UserAnswer = null,
                IsCorrect = null
            })
            .ToList();

        // Get chapter title for the response
        var chaptersResult = await _chapterStore.GetAllAsync(ct);
        var chapterTitle = "Capitol";
        if (chaptersResult.IsSuccess && chaptersResult.Value is not null)
        {
            var chapter = chaptersResult.Value.FirstOrDefault(c => c.Id == chapterId);
            if (chapter is not null) chapterTitle = chapter.Title;
        }

        var quizId = Guid.NewGuid().ToString("N");
        var session = new QuizSession
        {
            QuizId = quizId,
            ChapterId = chapterId,
            ChapterTitle = chapterTitle,
            UserId = userId,
            Items = selected,
            StartedAt = DateTime.UtcNow
        };

        await _cache.SetAsync(GetCacheKey(quizId), session, options => options.SetDuration(TimeSpan.FromMinutes(CacheDurationMinutes)), ct);

        var firstItem = selected[0];
        var firstExercise = exercises.First(e => e.Id == firstItem.ExerciseId);

        _logger.LogInformation("Quiz {QuizId} started for chapter {ChapterId} with {Count} questions",
            quizId, chapterId, selected.Count);

        return new QuizStartResponseDto
        {
            QuizId = quizId,
            ChapterId = chapterId,
            ChapterTitle = chapterTitle,
            TotalQuestions = selected.Count,
            FirstQuestion = MapToQuestionDto(firstExercise, firstItem, selected.Count)
        };
    }

    public async Task<QuizAnswerResultDto?> SubmitAnswerAsync(
        string quizId, int exerciseId, string answer, CancellationToken ct = default)
    {
        var session = await _cache.TryGetAsync<QuizSession>(GetCacheKey(quizId), token: ct);
        if (!session.HasValue || session.Value is null)
        {
            _logger.LogWarning("Quiz session {QuizId} not found in cache", quizId);
            return null;
        }

        var quiz = session.Value;
        var currentItem = quiz.Items.FirstOrDefault(i => i.ExerciseId == exerciseId);
        if (currentItem is null)
        {
            _logger.LogWarning("Exercise {ExerciseId} not found in quiz {QuizId}", exerciseId, quizId);
            return null;
        }

        if (currentItem.UserAnswer is not null)
        {
            _logger.LogWarning("Exercise {ExerciseId} already answered in quiz {QuizId}", exerciseId, quizId);
            return null;
        }

        var isCorrect = string.Equals(
            answer.Trim(),
            currentItem.CorrectAnswer.Trim(),
            StringComparison.OrdinalIgnoreCase);

        currentItem.UserAnswer = answer.Trim();
        currentItem.IsCorrect = isCorrect;
        currentItem.AnsweredAt = DateTime.UtcNow;

        // Update exercise statistics
        var exerciseResult = await _exerciseStore.GetByIdAsync(exerciseId, ct);
        if (exerciseResult is not null && exerciseResult.IsSuccess && exerciseResult.Value is not null)
        {
            var exercise = exerciseResult.Value;
            exercise.TimesAttempted++;
            if (isCorrect) exercise.TimesSolved++;
            await _exerciseStore.SaveChangesAsync(ct);
        }

        // Save updated session back to cache
        await _cache.SetAsync(GetCacheKey(quizId), quiz, options => options.SetDuration(TimeSpan.FromMinutes(CacheDurationMinutes)), ct);

        var answeredCount = quiz.Items.Count(i => i.UserAnswer is not null);
        var nextItem = quiz.Items.FirstOrDefault(i => i.UserAnswer is null);

        QuizQuestionDto? nextQuestion = null;
        if (nextItem is not null)
        {
            var exResult = await _exerciseStore.GetByIdAsync(nextItem.ExerciseId, ct);
            if (exResult is not null && exResult.IsSuccess && exResult.Value is not null)
            {
                nextQuestion = MapToQuestionDto(exResult.Value, nextItem, quiz.Items.Count);
            }
        }

        return new QuizAnswerResultDto
        {
            IsCorrect = isCorrect,
            CorrectAnswer = currentItem.CorrectAnswer,
            Explanation = isCorrect ? null : currentItem.Explanation,
            QuestionsAnswered = answeredCount,
            TotalQuestions = quiz.Items.Count,
            NextQuestion = nextQuestion
        };
    }

    public async Task<QuizResultDto?> GetResultsAsync(string quizId, CancellationToken ct = default)
    {
        var session = await _cache.TryGetAsync<QuizSession>(GetCacheKey(quizId), token: ct);
        if (!session.HasValue || session.Value is null)
        {
            _logger.LogWarning("Quiz session {QuizId} not found in cache", quizId);
            return null;
        }

        var quiz = session.Value;
        var correctCount = quiz.Items.Count(i => i.IsCorrect == true);

        // Persist QuizAttempt records
        var attempts = quiz.Items
            .Where(i => i.UserAnswer is not null)
            .Select(i => new QuizAttempt
            {
                UserId = quiz.UserId,
                ExerciseId = i.ExerciseId,
                UserAnswer = i.UserAnswer ?? string.Empty,
                IsCorrect = i.IsCorrect ?? false,
                AttemptedAt = i.AnsweredAt ?? DateTime.UtcNow
            })
            .ToList();

        var saveResult = await _quizAttemptStore.SaveBatchAsync(attempts, ct);
        if (!saveResult.IsSuccess)
        {
            _logger.LogWarning("Failed to save QuizAttempt records for quiz {QuizId}: {Errors}",
                quizId, string.Join(", ", saveResult.Errors));
        }

        // Remove quiz from cache
        await _cache.RemoveAsync(GetCacheKey(quizId), token: ct);

        _logger.LogInformation("Quiz {QuizId} completed: {Correct}/{Total} correct",
            quizId, correctCount, quiz.Items.Count);

        return new QuizResultDto
        {
            CorrectCount = correctCount,
            TotalQuestions = quiz.Items.Count,
            ScorePercent = quiz.Items.Count > 0
                ? Math.Round((double)correctCount / quiz.Items.Count * 100, 1)
                : 0,
            QuizId = quizId,
            ChapterTitle = quiz.ChapterTitle,
            Answers = quiz.Items.Select(i => new QuizAnswerDetailDto
            {
                ExerciseId = i.ExerciseId,
                Question = $"Întrebarea {i.QuestionIndex}",
                UserAnswer = i.UserAnswer ?? "(fără răspuns)",
                CorrectAnswer = i.CorrectAnswer,
                IsCorrect = i.IsCorrect ?? false
            }).ToList()
        };
    }

    private static string GetCacheKey(string quizId) => $"quiz:{quizId}";

    private static QuizQuestionDto MapToQuestionDto(Exercise exercise, QuizSessionItem item, int total)
    {
        return new QuizQuestionDto
        {
            ExerciseId = exercise.Id,
            QuestionIndex = item.QuestionIndex,
            Question = exercise.Question,
            Type = exercise.Type.ToString(),
            OptionsJson = exercise.OptionsJson,
            TotalQuestions = total
        };
    }

    /// <summary>
    /// Starea internă a unui quiz activ, serializată în cache.
    /// </summary>
    private sealed class QuizSession
    {
        public string QuizId { get; set; } = string.Empty;
        public int ChapterId { get; set; }
        public string ChapterTitle { get; set; } = string.Empty;
        public Guid UserId { get; set; }
        public List<QuizSessionItem> Items { get; set; } = [];
        public DateTime StartedAt { get; set; }
    }

    private sealed class QuizSessionItem
    {
        public int ExerciseId { get; set; }
        public int QuestionIndex { get; set; }
        public string CorrectAnswer { get; set; } = string.Empty;
        public string? Explanation { get; set; }
        public string? UserAnswer { get; set; }
        public bool? IsCorrect { get; set; }
        public DateTime? AnsweredAt { get; set; }
    }
}
