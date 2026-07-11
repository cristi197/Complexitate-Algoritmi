namespace InfoLiceu.Domain.DTOs;

public class MessageDto
{
    public long Id { get; set; }
    public string SenderName { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public DateTime SentAt { get; set; }
}
