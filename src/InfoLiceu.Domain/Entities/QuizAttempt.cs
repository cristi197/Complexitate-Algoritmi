namespace InfoLiceu.Domain.Entities;

public class QuizAttempt
{
    public long Id { get; set; }
    public Guid UserId { get; set; }
    public int ExerciseId { get; set; }
    public string UserAnswer { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public DateTime AttemptedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public Exercise Exercise { get; set; } = null!;
}
