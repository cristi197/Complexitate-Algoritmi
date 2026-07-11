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
