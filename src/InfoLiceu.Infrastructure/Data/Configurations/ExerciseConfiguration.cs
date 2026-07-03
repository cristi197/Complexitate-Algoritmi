using InfoLiceu.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InfoLiceu.Infrastructure.Data.Configurations;

public class ExerciseConfiguration : IEntityTypeConfiguration<Exercise>
{
    public void Configure(EntityTypeBuilder<Exercise> builder)
    {
        builder.ToTable("Exercises");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Question).IsRequired();
        builder.Property(e => e.CorrectAnswer).IsRequired().HasMaxLength(500);
        builder.Property(e => e.Type).HasConversion<int>();
        builder.Property(e => e.Difficulty).HasConversion<int>();
        builder.HasIndex(e => new { e.ChapterId, e.Difficulty });
        builder.HasQueryFilter(e => e.IsPublished);
    }
}
