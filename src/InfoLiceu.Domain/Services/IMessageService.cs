using InfoLiceu.Domain.DTOs;

namespace InfoLiceu.Domain.Services;

/// <summary>
/// Interfață pentru mesagerie. MVP: implementare in-memory.
/// Când scalăm: înlocuim cu SignalR + DB.
/// </summary>
public interface IMessageService
{
    Task<MessageDto> SendAsync(long conversationId, Guid senderId, string body, CancellationToken ct = default);
    Task<List<MessageDto>> GetMessagesAsync(long conversationId, int page = 1, int pageSize = 50, CancellationToken ct = default);
    Task<List<ConversationDto>> GetConversationsAsync(Guid userId, CancellationToken ct = default);
    Task MarkReadAsync(long conversationId, Guid userId, CancellationToken ct = default);
    Task<List<Guid>> GetParticipantIdsAsync(long conversationId, CancellationToken ct = default);
    Task<ConversationDto> StartConversationAsync(Guid startedBy, Guid withUser, string subject, CancellationToken ct = default);
}
