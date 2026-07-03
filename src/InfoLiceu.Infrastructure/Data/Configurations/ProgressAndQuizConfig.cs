using InfoLiceu.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InfoLiceu.Infrastructure.Data.Configurations;

public class UserProgressConfiguration : IEntityTypeConfiguration<UserProgress>
{
    public void Configure(EntityTypeBuilder<UserProgress> builder)
    {
        builder.ToTable("UserProgress");
        builder.HasKey(up => new { up.UserId, up.ChapterId });
        builder.HasOne(up => up.User).WithMany(u => u.Progress).HasForeignKey(up => up.UserId);
        builder.HasOne(up => up.Chapter).WithMany(c => c.Progress).HasForeignKey(up => up.ChapterId);
        builder.HasIndex(up => up.UserId);
    }
}

public class QuizAttemptConfiguration : IEntityTypeConfiguration<QuizAttempt>
{
    public void Configure(EntityTypeBuilder<QuizAttempt> builder)
    {
        builder.ToTable("QuizAttempts");
        builder.HasKey(qa => qa.Id);
        builder.HasOne(qa => qa.User).WithMany(u => u.QuizAttempts).HasForeignKey(qa => qa.UserId);
        builder.HasOne(qa => qa.Exercise).WithMany(e => e.QuizAttempts).HasForeignKey(qa => qa.ExerciseId);
        builder.HasIndex(qa => new { qa.UserId, qa.ExerciseId });
    }
}
