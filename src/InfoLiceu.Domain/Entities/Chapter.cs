namespace InfoLiceu.Domain.Entities;

public class Chapter
{
    public int Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Subtitle { get; set; }
    public string? Icon { get; set; }
    public int OrderIndex { get; set; }
    public string ContentJson { get; set; } = "[]";
    public string? Tags { get; set; }
    public int EstimatedMin { get; set; } = 30;
    public bool IsPublished { get; set; } = true;

    public List<Exercise> Exercises { get; set; } = [];
    public List<UserProgress> Progress { get; set; } = [];
}
