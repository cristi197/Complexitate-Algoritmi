using System.Text.Json.Serialization;

namespace InfoLiceu.Domain.DTOs;

/// <summary>
/// Un slide dintr-un capitol, deserializat din ContentJson.
/// </summary>
public sealed class SlideDto
{
    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;

    [JsonPropertyName("body")]
    public string Body { get; set; } = string.Empty;

    [JsonPropertyName("code")]
    public string? Code { get; set; }

    [JsonPropertyName("language")]
    public string? Language { get; set; }
}
