using InfoLiceu.Domain.Stores;
using InfoLiceu.Infrastructure.Data;
using InfoLiceu.Infrastructure.Stores;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace InfoLiceu.Infrastructure.Extensions;

public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Înregistrează DbContext + store-urile (implementări EF Core pentru Domain store interfaces).
    /// </summary>
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, string connectionString)
    {
        // Database
        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlite(connectionString));

        // Stores (repository implementations)
        services.AddScoped<IChapterStore, ChapterStore>();
        services.AddScoped<IExerciseStore, ExerciseStore>();
        services.AddScoped<IAuditStore, AuditStore>();
        services.AddScoped<IQuizAttemptStore, QuizAttemptStore>();

        return services;
    }
}
