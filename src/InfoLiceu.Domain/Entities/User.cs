namespace InfoLiceu.Domain.Entities;

public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string NormalizedEmail { get; set; } = string.Empty;
    public string? GoogleId { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public UserRole Role { get; set; } = UserRole.Student;
    public int XP { get; set; }
    public int StreakDays { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;

    public List<UserProgress> Progress { get; set; } = [];
    public List<QuizAttempt> QuizAttempts { get; set; } = [];
    public List<Submission> Submissions { get; set; } = [];
    public List<AuditLog> AuditLogs { get; set; } = [];
}

public enum UserRole
{
    Student = 1,
    Teacher = 2,
    Admin = 3
}
