namespace InfoLiceu.Domain.DTOs;

/// <summary>
/// Răspunsul primit după inițierea unui quiz.
/// </summary>
public class QuizStartResponseDto
{
    public string QuizId { get; set; } = string.Empty;
    public int ChapterId { get; set; }
    public string ChapterTitle { get; set; } = string.Empty;
    public int TotalQuestions { get; set; }
    public QuizQuestionDto? FirstQuestion { get; set; }
}
