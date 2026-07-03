using InfoLiceu.Domain.Services;
using InfoLiceu.Application.Services;
using Shouldly;

namespace InfoLiceu.Infrastructure.Tests.Services;

public partial class InMemoryMessageServiceTests
{
    private readonly IMessageService _sut = new InMemoryMessageService();
}

public partial class InMemoryMessageServiceTests
{
    [Fact]
    public void Constructor_Should_NotThrow_When_Called()
    {
        Should.NotThrow(() => new InMemoryMessageService());
    }
}

public partial class InMemoryMessageServiceTests
{
    [Fact]
    public async Task SendAsync_Should_ReturnMessage_When_Called()
    {
        // Arrange
        var conversationId = 1L;
        var senderId = Guid.NewGuid();

        // Act
        var result = await _sut.SendAsync(conversationId, senderId, "Hello!");

        // Assert
        result.ShouldNotBeNull();
        result.Body.ShouldBe("Hello!");
        result.Id.ShouldBeGreaterThan(0);
    }

    [Fact]
    public async Task GetConversationsAsync_Should_ReturnSeedConversation_When_Called()
    {
        // Act
        var result = await _sut.GetConversationsAsync(Guid.NewGuid());

        // Assert
        result.ShouldNotBeNull();
        result.Count.ShouldBeGreaterThanOrEqualTo(1);
        result[0].Subject.ShouldBe("Demo Conversation");
    }

    [Fact]
    public async Task SendAsync_Should_AddMessageToConversation_When_Called()
    {
        // Arrange
        var convId = 1L;
        var sender = Guid.NewGuid();

        // Act
        await _sut.SendAsync(convId, sender, "Mesaj 1");
        await _sut.SendAsync(convId, sender, "Mesaj 2");
        var messages = await _sut.GetMessagesAsync(convId);

        // Assert
        messages.Count.ShouldBeGreaterThanOrEqualTo(2);
    }

    [Fact]
    public async Task StartConversationAsync_Should_CreateNewConversation_When_Called()
    {
        // Act
        var result = await _sut.StartConversationAsync(Guid.NewGuid(), Guid.NewGuid(), "Test");

        // Assert
        result.ShouldNotBeNull();
        result.Subject.ShouldBe("Test");
        result.Id.ShouldBeGreaterThan(0);
    }
}
