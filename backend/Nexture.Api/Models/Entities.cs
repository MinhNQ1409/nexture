using System.Text.Json.Serialization;

namespace Nexture.Api.Models;

public enum MemberRole { ADMIN, EDITOR, VIEWER }
public enum ContentStatus { DRAFT, AI_SUGGESTED, PENDING_REVIEW, VERIFIED, REJECTED }
public enum Visibility { PRIVATE, INTERNAL, PUBLIC }
public enum EntityType { STORY, EVENT, PERSON, PRODUCT, MEDIA, SOURCE }
public enum ReviewDecision { PENDING, APPROVED, REJECTED }
public enum AtlasPublicationStatus { DRAFT, READY, PUBLISHED, UNPUBLISHED }

public abstract class EntityBase
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}

public class Organization : EntityBase
{
    public string Name { get; set; } = "";
    public string Slug { get; set; } = "";
    public string? LogoUrl { get; set; }
    public int? FoundedYear { get; set; }
    public string? Industry { get; set; }
    public string? EmployeeScale { get; set; }
    public string? Website { get; set; }
    public string? ShortDescription { get; set; }
    public string? FounderName { get; set; }
    public string? CoreValues { get; set; }
    public string? CultureManifesto { get; set; }
    public string? Location { get; set; }
    public string? CoreValuesListJson { get; set; }
    public bool AtlasEnabled { get; set; } = true;
}

public class AppUser : EntityBase
{
    public string Email { get; set; } = "";
    [JsonIgnore] public string PasswordHash { get; set; } = "";
    public string DisplayName { get; set; } = "";
}

public class OrganizationMember : EntityBase
{
    public Guid OrganizationId { get; set; }
    public Guid UserId { get; set; }
    public MemberRole Role { get; set; }
}

public abstract class OrgEntityBase : EntityBase
{
    public Guid OrganizationId { get; set; }
    public Visibility Visibility { get; set; } = Visibility.INTERNAL;
    public ContentStatus Status { get; set; } = ContentStatus.DRAFT;
    public string? CoreValueTag { get; set; }
}

public class Story : OrgEntityBase
{
    public string Title { get; set; } = "";
    public string? Summary { get; set; }
    public string? Content { get; set; }
    public string? CoverImageUrl { get; set; }
    public DateTimeOffset? OccurredAt { get; set; }
    public string? StoryType { get; set; }
    public Guid? SourceId { get; set; }
}

public class CultureEvent : OrgEntityBase
{
    public string Name { get; set; } = "";
    public DateTimeOffset? StartDate { get; set; }
    public DateTimeOffset? EndDate { get; set; }
    public string? Content { get; set; }
    public string? EventType { get; set; }
    public Guid? SourceId { get; set; }
}

public class Person : OrgEntityBase
{
    public string FullName { get; set; } = "";
    public string? AvatarUrl { get; set; }
    public string? RoleTitle { get; set; }
    public DateTimeOffset? JoinedAt { get; set; }
    public string? Bio { get; set; }
    public string? NotableContribution { get; set; }
}

public class ProductProject : OrgEntityBase
{
    public string Name { get; set; } = "";
    public string Kind { get; set; } = "PRODUCT";
    public DateTimeOffset? StartedAt { get; set; }
    public string? Description { get; set; }
}

public class MediaAsset : OrgEntityBase
{
    public string Name { get; set; } = "";
    public string MediaType { get; set; } = "";
    public string FileUrl { get; set; } = "";
    public string? SourceName { get; set; }
    public string? ProviderName { get; set; }
    public string? Tags { get; set; }
    public DateTimeOffset? OccurredAt { get; set; }
}

public class SourceRecord : OrgEntityBase
{
    public string Name { get; set; } = "";
    public string SourceType { get; set; } = "TEXT";
    public string? TextContent { get; set; }
    public string? FileUrl { get; set; }
    public Guid? MediaAssetId { get; set; }
}

public class Relationship : EntityBase
{
    public Guid OrganizationId { get; set; }
    public EntityType SourceType { get; set; }
    public Guid SourceId { get; set; }
    public string RelationshipType { get; set; } = "RELATED_TO";
    public EntityType TargetType { get; set; }
    public Guid TargetId { get; set; }
}

public class AiSuggestion : EntityBase
{
    public Guid OrganizationId { get; set; }
    public Guid SourceId { get; set; }
    public EntityType SuggestionType { get; set; }
    public string PayloadJson { get; set; } = "{}";
    public ContentStatus Status { get; set; } = ContentStatus.PENDING_REVIEW;
    public Guid? CreatedEntityId { get; set; }
}

public class Review : EntityBase
{
    public Guid OrganizationId { get; set; }
    public Guid SuggestionId { get; set; }
    public Guid? ReviewerUserId { get; set; }
    public ReviewDecision Decision { get; set; } = ReviewDecision.PENDING;
    public string? Note { get; set; }
    public DateTimeOffset? ReviewedAt { get; set; }
}

// Publishing snapshot. Atlas reads this table, not mutable Hub records.
public class AtlasPublication : EntityBase
{
    public Guid OrganizationId { get; set; }
    public EntityType EntityType { get; set; }
    public Guid EntityId { get; set; }
    public AtlasPublicationStatus Status { get; set; } = AtlasPublicationStatus.DRAFT;
    public string Slug { get; set; } = "";
    public string PublishedTitle { get; set; } = "";
    public string? PublishedSummary { get; set; }
    public string? PublishedContent { get; set; }
    public string? CoverMediaUrl { get; set; }
    public string? CoreValueTag { get; set; }
    public DateTimeOffset? OccurredAt { get; set; }
    public string SnapshotJson { get; set; } = "{}";
    public DateTimeOffset SourceUpdatedAt { get; set; }
    public int Version { get; set; } = 1;
    public Guid? PublishedByUserId { get; set; }
    public DateTimeOffset? PublishedAt { get; set; }
    public DateTimeOffset? UnpublishedAt { get; set; }
}

public class ActivityLog : EntityBase
{
    public Guid OrganizationId { get; set; }
    public Guid? UserId { get; set; }
    public string Action { get; set; } = "";
    public string EntityType { get; set; } = "";
    public Guid? EntityId { get; set; }
    public string? MetadataJson { get; set; }
}
