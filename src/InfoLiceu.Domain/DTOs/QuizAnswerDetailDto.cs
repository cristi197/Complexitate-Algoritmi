namespace InfoLiceu.Domain.DTOs;

/// <summary>
/// Detaliu per răspuns dintr-un quiz finalizat.
/// </summary>
public class QuizAnswerDetailDto
{
    public int ExerciseId { get; set; }
    public string Question { get; set; } = string.Empty;
    public string UserAnswer { get; set; } = string.Empty;
    public string CorrectAnswer { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
}
