namespace InfoLiceu.Domain.DTOs;

public class ConversationDto
{
    public long Id { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string OtherParticipant { get; set; } = string.Empty;
    public string LastPreview { get; set; } = string.Empty;
    public bool HasUnread { get; set; }
    public int UnreadCount { get; set; }
    public DateTime LastMessageAt { get; set; }
}
