namespace InfoLiceu.Domain.Services;

public sealed class AuditMachine
{
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public string? MachineName { get; set; }
}
