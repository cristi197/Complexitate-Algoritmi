namespace InfoLiceu.Domain.DTOs;

public class ExerciseDto
{
    public int Id { get; set; }
    public int ChapterId { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Question { get; set; } = string.Empty;
    public string? OptionsJson { get; set; }
    public string Difficulty { get; set; } = string.Empty;
    public int TimesAttempted { get; set; }
    public int TimesSolved { get; set; }
}

public class ExerciseResultDto
{
    public bool IsCorrect { get; set; }
    public string? Explanation { get; set; }
    public string CorrectAnswer { get; set; } = string.Empty;
}
