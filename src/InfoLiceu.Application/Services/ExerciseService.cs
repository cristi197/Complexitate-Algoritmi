using InfoLiceu.Domain.DTOs;
using InfoLiceu.Domain.Services;
using InfoLiceu.Domain.Stores;

namespace InfoLiceu.Application.Services;

internal sealed class ExerciseService : IExerciseService
{
    private readonly IExerciseStore _exerciseStore;

    public ExerciseService(IExerciseStore exerciseStore)
    {
        _exerciseStore = exerciseStore ?? throw new ArgumentNullException(nameof(exerciseStore));
    }

    public async Task<List<ExerciseDto>> GetByChapterAsync(int chapterId, CancellationToken ct = default)
    {
        var result = await _exerciseStore.GetByChapterAsync(chapterId, ct);
        if (!result.IsSuccess || result.Value is null) return [];

        return result.Value.Select(e => new ExerciseDto
        {
            Id = e.Id,
            ChapterId = e.ChapterId,
            Type = e.Type.ToString(),
            Question = e.Question,
            OptionsJson = e.OptionsJson,
            Difficulty = e.Difficulty.ToString(),
            TimesAttempted = e.TimesAttempted,
            TimesSolved = e.TimesSolved
        }).ToList();
    }

    public async Task<ExerciseResultDto> SubmitAnswerAsync(int exerciseId, string answer, Guid userId, CancellationToken ct = default)
    {
        var result = await _exerciseStore.GetByIdAsync(exerciseId, ct);
        if (!result.IsSuccess || result.Value is null)
        {
            return new ExerciseResultDto
            {
                IsCorrect = false,
                Explanation = "Exercițiul nu a fost găsit.",
                CorrectAnswer = string.Empty
            };
        }

        var exercise = result.Value;
        var isCorrect = string.Equals(
            answer.Trim(),
            exercise.CorrectAnswer.Trim(),
            StringComparison.OrdinalIgnoreCase);

        exercise.TimesAttempted++;
        if (isCorrect)
        {
            exercise.TimesSolved++;
        }

        await _exerciseStore.SaveChangesAsync(ct);

        return new ExerciseResultDto
        {
            IsCorrect = isCorrect,
            Explanation = isCorrect ? null : exercise.Explanation,
            CorrectAnswer = exercise.CorrectAnswer
        };
    }
}
