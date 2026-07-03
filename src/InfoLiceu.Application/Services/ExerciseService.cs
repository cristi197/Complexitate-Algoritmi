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

    public Task<List<ExerciseDto>> GetByChapterAsync(int chapterId, CancellationToken ct = default)
    {
        // TODO: PBI-006
        throw new NotImplementedException();
    }

    public Task<ExerciseResultDto> SubmitAnswerAsync(int exerciseId, string answer, Guid userId, CancellationToken ct = default)
    {
        // TODO: PBI-006
        throw new NotImplementedException();
    }
}
