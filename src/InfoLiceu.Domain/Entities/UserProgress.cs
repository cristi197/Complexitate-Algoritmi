namespace InfoLiceu.Domain.Entities;

public class UserProgress
{
    public Guid UserId { get; set; }
    public int ChapterId { get; set; }
    public int ProgressPercent { get; set; }
    public DateTime? CompletedAt { get; set; }
    public int? QuizBestScore { get; set; }
    public int TimeSpentMin { get; set; }
    public DateTime LastVisitedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public Chapter Chapter { get; set; } = null!;
}
