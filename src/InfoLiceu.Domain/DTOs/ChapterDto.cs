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

public class ChapterDto
{
    public int Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Subtitle { get; set; }
    public string? Icon { get; set; }
    public string ContentJson { get; set; } = "[]";
    public string? Tags { get; set; }
    public int EstimatedMin { get; set; }
    public int TotalSlides { get; set; }
}
