namespace InfoLiceu.Domain.Entities;

public class Exercise
{
    public int Id { get; set; }
    public int ChapterId { get; set; }
    public ExerciseType Type { get; set; }
    public string Question { get; set; } = string.Empty;
    public string? OptionsJson { get; set; }
    public string CorrectAnswer { get; set; } = string.Empty;
    public string? Explanation { get; set; }
    public Difficulty Difficulty { get; set; } = Difficulty.Easy;
    public string? CppTestCode { get; set; }
    public string? ExpectedOutput { get; set; }
    public int TimeLimitMs { get; set; } = 1000;
    public int MemoryLimitKb { get; set; } = 65536;
    public int TimesAttempted { get; set; }
    public int TimesSolved { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsPublished { get; set; } = true;

    public Chapter Chapter { get; set; } = null!;
    public List<QuizAttempt> QuizAttempts { get; set; } = [];
    public List<Submission> Submissions { get; set; } = [];
}

public enum ExerciseType
{
    MultipleChoice = 1,
    CodeSubmit = 2,
    FreeText = 3
}

public enum Difficulty
{
    Easy = 1,
    Medium = 2,
    Hard = 3
}
