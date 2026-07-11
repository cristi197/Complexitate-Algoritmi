namespace InfoLiceu.Domain.DTOs;

/// <summary>
/// O întrebare dintr-un quiz activ, trimisă către frontend.
/// </summary>
public class QuizQuestionDto
{
    public int ExerciseId { get; set; }
    public int QuestionIndex { get; set; }
    public string Question { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string? OptionsJson { get; set; }
    public int TotalQuestions { get; set; }
}
