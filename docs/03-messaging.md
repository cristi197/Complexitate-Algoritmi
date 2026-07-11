# 03 — Mesageria (SignalR + DB)

> **Faza implementare**: Faza 3 — Mesagerie
> **Dependențe**: SignalR, EF Core, ASP.NET Core Identity

---

## Flux complet

```
Elev trimite mesaj → MessageService.Save() → INSERT Messages
→ SignalR MessageHub → notifică profesorul real-time
→ Profesorul vede badge + toast → deschide conversația → MarkRead()
```

---

## SignalR Hub

```csharp
public class MessageHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        var userId = Context.UserIdentifier;
        await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}");
    }

    public async Task SendMessage(long conversationId, string body)
    {
        var senderId = Guid.Parse(Context.UserIdentifier);
        var msg = await _messageService.SendAsync(conversationId, senderId, body);
        
        var participants = await _messageService.GetParticipantIds(conversationId);
        foreach (var pid in participants.Where(p => p != senderId))
        {
            await Clients.Group($"user_{pid}").SendAsync("NewMessage", new
            {
                msg.Id, msg.ConversationId,
                SenderName = Context.User.Identity.Name,
                msg.Body, msg.SentAt
            });
        }
    }
}
```

---

## Frontend Razor + HTMX

```html
@* Messages/Inbox.cshtml *@
<div id="inbox" 
     hx-get="/Messages/InboxList" 
     hx-trigger="every 30s, new-message from:body">
    @foreach (var conv in Model.Conversations)
    {
        <a asp-page="Conversation" asp-route-id="@conv.Id"
           class="@(conv.HasUnread ? "font-bold" : "")">
            <span>@conv.OtherParticipant</span>
            <span class="text-muted">@conv.LastPreview</span>
            @if (conv.UnreadCount > 0) { <span class="badge">@conv.UnreadCount</span> }
        </a>
    }
</div>

<script>
const conn = new signalR.HubConnectionBuilder().withUrl("/messageHub").build();
conn.on("NewMessage", msg => {
    htmx.trigger("#inbox", "new-message");
    showToast(`Mesaj de la ${msg.senderName}`);
});
conn.start();
</script>
```

---

## MessageService (semnături)

```csharp
public class MessageService
{
    // Trimite un mesaj într-o conversație
    public async Task<Message> SendAsync(long conversationId, Guid senderId, string body);
    
    // Obține toate mesajele dintr-o conversație (cu paginare)
    public async Task<List<MessageDto>> GetMessagesAsync(long conversationId, int page = 1, int pageSize = 50);
    
    // Obține lista de conversații pentru un user
    public async Task<List<ConversationDto>> GetConversationsAsync(Guid userId);
    
    // Marchează toate mesajele dintr-o conversație ca citite
    public async Task MarkReadAsync(long conversationId, Guid userId);
    
    // Obține ID-urile participanților la o conversație
    public async Task<List<Guid>> GetParticipantIds(long conversationId);
    
    // Creează o conversație nouă
    public async Task<Conversation> StartConversationAsync(Guid startedBy, Guid withUser, string subject);
}
```

---

## Tabele implicate

Vezi [01-database-schema.md](./01-database-schema.md) pentru:
- `Conversations`
- `ConversationParticipants`
- `Messages`

---

## Configurare SignalR în Program.cs

```csharp
builder.Services.AddSignalR();

// ...

app.MapHub<MessageHub>("/messageHub");
app.MapHub<ProgressHub>("/progressHub");
```

### Configurare Azure SignalR (pentru producție)

```csharp
builder.Services.AddSignalR().AddAzureSignalR(options =>
{
    options.ConnectionString = builder.Configuration["Azure:SignalR:ConnectionString"];
});
```

---

## 🔗 Documente conexe

- [01-database-schema.md](./01-database-schema.md) — Tabelele de mesagerie
- [09-diagrams.md](./09-diagrams.md) — Flow mesagerie SignalR (PlantUML)
