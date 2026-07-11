namespace InfoLiceu.Domain.DTOs;

public class ExerciseResultDto
{
    public bool IsCorrect { get; set; }
    public string? Explanation { get; set; }
    public string CorrectAnswer { get; set; } = string.Empty;
}
