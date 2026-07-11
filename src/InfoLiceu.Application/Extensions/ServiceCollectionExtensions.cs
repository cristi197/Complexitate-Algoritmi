using InfoLiceu.Domain.Services;
using InfoLiceu.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace InfoLiceu.Application.Extensions;

public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Înregistrează toate serviciile din layerul Application (implementări pentru Domain interfaces).
    /// </summary>
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IChapterService, ChapterService>();
        services.AddScoped<IExerciseService, ExerciseService>();
        services.AddSingleton<IMessageService, InMemoryMessageService>();
        services.AddScoped<IAuditService, AuditService>();
        services.AddScoped<IQuizService, QuizService>();

        return services;
    }
}
