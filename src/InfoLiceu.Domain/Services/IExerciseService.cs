using InfoLiceu.Domain.DTOs;

namespace InfoLiceu.Domain.Services;

public interface IExerciseService
{
    Task<List<ExerciseDto>> GetByChapterAsync(int chapterId, CancellationToken ct = default);
    Task<ExerciseResultDto> SubmitAnswerAsync(int exerciseId, string answer, Guid userId, CancellationToken ct = default);
}
