namespace InfoLiceu.Domain.DTOs;

/// <summary>
/// Rezultatul trimiterii unui răspuns la o întrebare din quiz.
/// </summary>
public class QuizAnswerResultDto
{
    public bool IsCorrect { get; set; }
    public string CorrectAnswer { get; set; } = string.Empty;
    public string? Explanation { get; set; }
    public int QuestionsAnswered { get; set; }
    public int TotalQuestions { get; set; }
    public QuizQuestionDto? NextQuestion { get; set; }
}
