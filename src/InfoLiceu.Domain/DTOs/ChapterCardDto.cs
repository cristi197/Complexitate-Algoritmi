namespace InfoLiceu.Domain.DTOs;

public class ChapterCardDto
{
    public string Slug { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Subtitle { get; set; }
    public string? Icon { get; set; }
    public int EstimatedMin { get; set; }
    public int? ProgressPercent { get; set; }
}
