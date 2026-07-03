using InfoLiceu.Domain.Entities;
using InfoLiceu.Domain.Services;

namespace InfoLiceu.Infrastructure.Extensions;

public static class MapperExtensions
{
    public static AuditLog ToEntity(this AuditEntry entry)
    {
        return new AuditLog
        {
            Action = entry.Action,
            EntityType = entry.BusinessArea,
            MetadataJson = System.Text.Json.JsonSerializer.Serialize(new
            {
                entry.ActionDetails,
                entry.UserDetails,
                entry.ClientDetails,
                entry.MachineDetails,
                Original = entry.Original,
                Modified = entry.Modified
            }),
            Timestamp = entry.EventDate.UtcDateTime
        };
    }
}
