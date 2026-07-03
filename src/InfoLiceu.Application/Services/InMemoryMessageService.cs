using System.Collections.Concurrent;
using InfoLiceu.Domain.DTOs;
using InfoLiceu.Domain.Services;

namespace InfoLiceu.Application.Services;

/// <summary>
/// MVP: Mesagerie locală in-memory. Funcționează fără SignalR/Azure.
/// Când scalăm: înlocuim cu SignalR Hub + DB pentru multi-instance.
/// </summary>
internal sealed class InMemoryMessageService : IMessageService
{
    private long _messageId;
    private long _conversationId;

    private readonly ConcurrentDictionary<long, List<MessageDto>> _messages = new();
    private readonly ConcurrentDictionary<long, ConversationDto> _conversations = new();
    private readonly ConcurrentDictionary<long, List<Guid>> _participants = new();
    private readonly ConcurrentDictionary<(long, Guid), DateTime> _lastRead = new();

    public InMemoryMessageService()
    {
        // Seed: creează o conversație demo pentru testare
        var convId = Interlocked.Increment(ref _conversationId);
        _conversations[convId] = new ConversationDto
        {
            Id = convId, Subject = "Demo Conversation",
            OtherParticipant = "profesor@infolicu.ro", LastPreview = "Salut!",
            LastMessageAt = DateTime.UtcNow
        };
        _participants[convId] = [Guid.Empty, Guid.Empty];
        _messages[convId] = [
            new() { Id = 1, SenderName = "Profesor", Body = "Salut! Cum te pot ajuta?", SentAt = DateTime.UtcNow.AddMinutes(-5) }
        ];
    }

    public Task<MessageDto> SendAsync(long conversationId, Guid senderId, string body, CancellationToken ct = default)
    {
        var msg = new MessageDto
        {
            Id = Interlocked.Increment(ref _messageId),
            SenderName = senderId.ToString(),
            Body = body,
            SentAt = DateTime.UtcNow
        };

        _messages.AddOrUpdate(conversationId,
            _ => [msg],
            (_, list) => { list.Add(msg); return list; });

        if (_conversations.TryGetValue(conversationId, out var conv))
        {
            conv.LastPreview = body[..Math.Min(body.Length, 50)];
            conv.LastMessageAt = msg.SentAt;
        }

        return Task.FromResult(msg);
    }

    public Task<List<MessageDto>> GetMessagesAsync(long conversationId, int page = 1, int pageSize = 50, CancellationToken ct = default)
    {
        var msgs = _messages.GetValueOrDefault(conversationId, []);
        var paged = msgs.Skip((page - 1) * pageSize).Take(pageSize).ToList();
        return Task.FromResult(paged);
    }

    public Task<List<ConversationDto>> GetConversationsAsync(Guid userId, CancellationToken ct = default)
    {
        var result = _conversations.Values.ToList();
        return Task.FromResult(result);
    }

    public Task MarkReadAsync(long conversationId, Guid userId, CancellationToken ct = default)
    {
        _lastRead[(conversationId, userId)] = DateTime.UtcNow;
        return Task.CompletedTask;
    }

    public Task<List<Guid>> GetParticipantIdsAsync(long conversationId, CancellationToken ct = default)
    {
        var ids = _participants.GetValueOrDefault(conversationId, []);
        return Task.FromResult(ids);
    }

    public Task<ConversationDto> StartConversationAsync(Guid startedBy, Guid withUser, string subject, CancellationToken ct = default)
    {
        var convId = Interlocked.Increment(ref _conversationId);
        var conv = new ConversationDto
        {
            Id = convId, Subject = subject,
            OtherParticipant = withUser.ToString(),
            LastMessageAt = DateTime.UtcNow
        };
        _conversations[convId] = conv;
        _participants[convId] = [startedBy, withUser];
        _messages[convId] = [];
        return Task.FromResult(conv);
    }
}
