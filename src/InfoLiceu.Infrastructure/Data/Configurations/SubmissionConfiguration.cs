using InfoLiceu.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InfoLiceu.Infrastructure.Data.Configurations;

public class SubmissionConfiguration : IEntityTypeConfiguration<Submission>
{
    public void Configure(EntityTypeBuilder<Submission> builder)
    {
        builder.ToTable("Submissions");
        builder.HasKey(s => s.Id);

        builder.Property(s => s.SourceCode).IsRequired();
        builder.Property(s => s.SubmittedAt).IsRequired();

        builder.HasOne(s => s.User)
            .WithMany(u => u.Submissions)
            .HasForeignKey(s => s.UserId);

        builder.HasOne(s => s.Exercise)
            .WithMany(e => e.Submissions)
            .HasForeignKey(s => s.ExerciseId);

        builder.HasIndex(s => new { s.UserId, s.ExerciseId });
    }
}
