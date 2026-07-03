using Microsoft.Extensions.Logging;

namespace InfoLiceu.Infrastructure.Extensions;

public static class LoggerExtensions
{
    public static void EntityNotFound(this ILogger logger, string entityName, string? id = null)
    {
        logger.LogWarning("Entity {EntityName} was not found. Id: {EntityId}", entityName, id ?? "N/A");
    }

    public static void EntitySaved(this ILogger logger, string entityName, object id)
    {
        logger.LogInformation("Entity {EntityName} saved with id {EntityId}", entityName, id);
    }
}
