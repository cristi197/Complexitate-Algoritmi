using InfoLiceu.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InfoLiceu.Infrastructure.Data.Configurations;

public class ChapterConfiguration : IEntityTypeConfiguration<Chapter>
{
    public void Configure(EntityTypeBuilder<Chapter> builder)
    {
        builder.ToTable("Chapters");
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Slug).IsRequired().HasMaxLength(100);
        builder.HasIndex(c => c.Slug).IsUnique();
        builder.Property(c => c.Title).IsRequired().HasMaxLength(200);
        builder.Property(c => c.OrderIndex).IsRequired();
        builder.Property(c => c.ContentJson).IsRequired();
        builder.HasMany(c => c.Exercises).WithOne(e => e.Chapter).HasForeignKey(e => e.ChapterId);
        builder.HasQueryFilter(c => c.IsPublished);
    }
}
