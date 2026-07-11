using InfoLiceu.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InfoLiceu.Infrastructure.Data.Configurations;

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
