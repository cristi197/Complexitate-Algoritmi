namespace InfoLiceu.Domain.DTOs;

/// <summary>
/// Rezultatul final al unui quiz.
/// </summary>
public class QuizResultDto
{
    public int CorrectCount { get; set; }
    public int TotalQuestions { get; set; }
    public double ScorePercent { get; set; }
    public string QuizId { get; set; } = string.Empty;
    public string ChapterTitle { get; set; } = string.Empty;
    public List<QuizAnswerDetailDto> Answers { get; set; } = [];
}
