using System.Reflection;
using InfoLiceu.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace InfoLiceu.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Chapter> Chapters => Set<Chapter>();
    public DbSet<Exercise> Exercises => Set<Exercise>();
    public DbSet<UserProgress> UserProgress => Set<UserProgress>();
    public DbSet<QuizAttempt> QuizAttempts => Set<QuizAttempt>();
    public DbSet<Submission> Submissions => Set<Submission>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
    }
}
