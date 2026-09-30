using Microsoft.EntityFrameworkCore;
using Nexture.Api.Models;

namespace Nexture.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Organization> Organizations => Set<Organization>();
    public DbSet<AppUser> Users => Set<AppUser>();
    public DbSet<OrganizationMember> OrganizationMembers => Set<OrganizationMember>();
    public DbSet<Story> Stories => Set<Story>();
    public DbSet<CultureEvent> Events => Set<CultureEvent>();
    public DbSet<Person> People => Set<Person>();
    public DbSet<ProductProject> ProductsProjects => Set<ProductProject>();
    public DbSet<MediaAsset> MediaAssets => Set<MediaAsset>();
    public DbSet<SourceRecord> Sources => Set<SourceRecord>();
    public DbSet<Relationship> Relationships => Set<Relationship>();
    public DbSet<AiSuggestion> AiSuggestions => Set<AiSuggestion>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<AtlasPublication> AtlasPublications => Set<AtlasPublication>();
    public DbSet<ActivityLog> ActivityLogs => Set<ActivityLog>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<AppUser>().HasIndex(x => x.Email).IsUnique();
        b.Entity<Organization>().HasIndex(x => x.Slug).IsUnique();
        b.Entity<OrganizationMember>().HasIndex(x => new { x.OrganizationId, x.UserId }).IsUnique();
        b.Entity<Relationship>().HasIndex(x => new { x.OrganizationId, x.SourceType, x.SourceId, x.RelationshipType, x.TargetType, x.TargetId }).IsUnique();
        b.Entity<AtlasPublication>().HasIndex(x => new { x.OrganizationId, x.EntityType, x.EntityId }).IsUnique();
        b.Entity<AtlasPublication>().HasIndex(x => new { x.OrganizationId, x.Slug }).IsUnique();

        b.Entity<Story>().Property(x => x.Status).HasConversion<string>();
        b.Entity<Story>().Property(x => x.Visibility).HasConversion<string>();
        b.Entity<CultureEvent>().Property(x => x.Status).HasConversion<string>();
        b.Entity<CultureEvent>().Property(x => x.Visibility).HasConversion<string>();
        b.Entity<Person>().Property(x => x.Status).HasConversion<string>();
        b.Entity<Person>().Property(x => x.Visibility).HasConversion<string>();
        b.Entity<ProductProject>().Property(x => x.Status).HasConversion<string>();
        b.Entity<ProductProject>().Property(x => x.Visibility).HasConversion<string>();
        b.Entity<MediaAsset>().Property(x => x.Status).HasConversion<string>();
        b.Entity<MediaAsset>().Property(x => x.Visibility).HasConversion<string>();
        b.Entity<SourceRecord>().Property(x => x.Status).HasConversion<string>();
        b.Entity<SourceRecord>().Property(x => x.Visibility).HasConversion<string>();
        b.Entity<OrganizationMember>().Property(x => x.Role).HasConversion<string>();
        b.Entity<Relationship>().Property(x => x.SourceType).HasConversion<string>();
        b.Entity<Relationship>().Property(x => x.TargetType).HasConversion<string>();
        b.Entity<AiSuggestion>().Property(x => x.SuggestionType).HasConversion<string>();
        b.Entity<AiSuggestion>().Property(x => x.Status).HasConversion<string>();
        b.Entity<Review>().Property(x => x.Decision).HasConversion<string>();
        b.Entity<AtlasPublication>().Property(x => x.EntityType).HasConversion<string>();
        b.Entity<AtlasPublication>().Property(x => x.Status).HasConversion<string>();
    }
}
