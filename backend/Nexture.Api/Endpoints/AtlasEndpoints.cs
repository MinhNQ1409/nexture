using System.Security.Claims;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Nexture.Api.Data;
using Nexture.Api.Models;
using Nexture.Api.Services;

namespace Nexture.Api.Endpoints;

public static class AtlasEndpoints
{
    public static IEndpointRouteBuilder MapAtlasEndpoints(this IEndpointRouteBuilder app)
    {
        // Hub-side publishing management.
        app.MapGet("/api/orgs/{orgId:guid}/atlas", async (Guid orgId, ClaimsPrincipal user, AppDbContext db, OrganizationAccess access) =>
        {
            var membership = await access.GetMembershipAsync(user, orgId);
            if (membership is null) return Results.Forbid();

            var org = await db.Organizations.AsNoTracking().FirstOrDefaultAsync(x => x.Id == orgId);
            if (org is null) return Results.NotFound();

            var candidates = new List<AtlasCandidate>();
            candidates.AddRange(await db.Stories.AsNoTracking().Where(x => x.OrganizationId == orgId)
                .Select(x => new AtlasCandidate(EntityType.STORY, x.Id, x.Title, x.Status, x.Visibility, x.UpdatedAt, x.CoreValueTag)).ToListAsync());
            candidates.AddRange(await db.Events.AsNoTracking().Where(x => x.OrganizationId == orgId)
                .Select(x => new AtlasCandidate(EntityType.EVENT, x.Id, x.Name, x.Status, x.Visibility, x.UpdatedAt, x.CoreValueTag)).ToListAsync());
            candidates.AddRange(await db.People.AsNoTracking().Where(x => x.OrganizationId == orgId)
                .Select(x => new AtlasCandidate(EntityType.PERSON, x.Id, x.FullName, x.Status, x.Visibility, x.UpdatedAt, x.CoreValueTag)).ToListAsync());
            candidates.AddRange(await db.ProductsProjects.AsNoTracking().Where(x => x.OrganizationId == orgId)
                .Select(x => new AtlasCandidate(EntityType.PRODUCT, x.Id, x.Name, x.Status, x.Visibility, x.UpdatedAt, x.CoreValueTag)).ToListAsync());

            var publications = await db.AtlasPublications.AsNoTracking()
                .Where(x => x.OrganizationId == orgId)
                .OrderByDescending(x => x.UpdatedAt)
                .ToListAsync();

            var candidateLookup = candidates.ToDictionary(x => (x.EntityType, x.EntityId));
            var rows = publications.Select(x => new
            {
                x.Id,
                entityType = x.EntityType.ToString(),
                x.EntityId,
                status = x.Status.ToString(),
                x.Slug,
                x.PublishedTitle,
                x.PublishedSummary,
                x.Version,
                x.PublishedAt,
                x.UnpublishedAt,
                x.SourceUpdatedAt,
                isOutdated = candidateLookup.TryGetValue((x.EntityType, x.EntityId), out var current) && current.UpdatedAt > x.SourceUpdatedAt
            });

            return Results.Ok(new
            {
                organization = new { org.Id, org.Name, org.Slug, org.AtlasEnabled },
                candidates = candidates.OrderByDescending(x => x.UpdatedAt),
                publications = rows
            });
        }).RequireAuthorization();

        app.MapPost("/api/orgs/{orgId:guid}/atlas/publish", async (Guid orgId, PublishRequest req, ClaimsPrincipal user, AppDbContext db, OrganizationAccess access) =>
        {
            var membership = await access.GetMembershipAsync(user, orgId);
            if (membership is null || !OrganizationAccess.IsAdmin(membership.Role)) return Results.Forbid();

            if (!Enum.TryParse<EntityType>(req.EntityType, true, out var type) || type is EntityType.MEDIA or EntityType.SOURCE)
                return Results.BadRequest("Supported Atlas types: STORY, EVENT, PERSON, PRODUCT.");

            var snapshot = await GetSnapshot(db, orgId, type, req.EntityId);
            if (snapshot is null) return Results.NotFound();
            if (snapshot.Status != ContentStatus.VERIFIED || snapshot.Visibility != Visibility.PUBLIC)
                return Results.BadRequest("Only VERIFIED + PUBLIC content can be published to Culture Atlas.");

            var publication = await PublishOrUpdateSnapshotAsync(db, orgId, type, req.EntityId, access.GetUserId(user));
            await db.SaveChangesAsync();
            return Results.Ok(publication);
        }).RequireAuthorization();

        app.MapPost("/api/orgs/{orgId:guid}/atlas/publications/{publicationId:guid}/unpublish", async (Guid orgId, Guid publicationId, ClaimsPrincipal user, AppDbContext db, OrganizationAccess access) =>
        {
            var membership = await access.GetMembershipAsync(user, orgId);
            if (membership is null || !OrganizationAccess.IsAdmin(membership.Role)) return Results.Forbid();
            var publication = await db.AtlasPublications.FirstOrDefaultAsync(x => x.OrganizationId == orgId && x.Id == publicationId);
            if (publication is null) return Results.NotFound();
            publication.Status = AtlasPublicationStatus.UNPUBLISHED;
            publication.UnpublishedAt = DateTimeOffset.UtcNow;
            publication.UpdatedAt = DateTimeOffset.UtcNow;
            db.ActivityLogs.Add(new ActivityLog { OrganizationId = orgId, UserId = access.GetUserId(user), Action = "ATLAS_UNPUBLISHED", EntityType = publication.EntityType.ToString(), EntityId = publication.EntityId });
            await db.SaveChangesAsync();
            return Results.Ok(publication);
        }).RequireAuthorization();

        // Public Culture Atlas discovery.
        app.MapGet("/api/atlas/organizations", async (string? q, AppDbContext db) =>
        {
            var publishedOrgIds = db.AtlasPublications.AsNoTracking()
                .Where(x => x.Status == AtlasPublicationStatus.PUBLISHED)
                .Select(x => x.OrganizationId)
                .Distinct();

            var query = db.Organizations.AsNoTracking()
                .Where(x => x.AtlasEnabled && publishedOrgIds.Contains(x.Id));
            if (!string.IsNullOrWhiteSpace(q))
            {
                var term = q.Trim().ToLower();
                query = query.Where(x => x.Name.ToLower().Contains(term) || (x.Industry != null && x.Industry.ToLower().Contains(term)));
            }

            var rows = await query.OrderBy(x => x.Name).Select(x => new
            {
                x.Name, x.Slug, x.LogoUrl, x.FoundedYear, x.Industry, x.EmployeeScale, x.ShortDescription, x.CoreValues
            }).ToListAsync();
            return Results.Ok(rows);
        }).AllowAnonymous();

        app.MapGet("/api/atlas/{organizationSlug}", async (string organizationSlug, AppDbContext db) =>
        {
            var org = await db.Organizations.AsNoTracking().FirstOrDefaultAsync(x => x.Slug == organizationSlug && x.AtlasEnabled);
            if (org is null) return Results.NotFound();
            var pubs = await db.AtlasPublications.AsNoTracking()
                .Where(x => x.OrganizationId == org.Id && x.Status == AtlasPublicationStatus.PUBLISHED)
                .OrderByDescending(x => x.OccurredAt)
                .ToListAsync();
            if (pubs.Count == 0) return Results.NotFound();

            object? coreValuesList = null;
            if (!string.IsNullOrEmpty(org.CoreValuesListJson))
            {
                try { coreValuesList = JsonSerializer.Deserialize<object>(org.CoreValuesListJson); } catch {}
            }

            return Results.Ok(new
            {
                organization = new
                {
                    org.Name, org.Slug, org.LogoUrl, org.FoundedYear, org.Industry, org.EmployeeScale,
                    org.Website, org.ShortDescription, org.FounderName, org.CoreValues,
                    cultureManifesto = org.CultureManifesto,
                    location = org.Location,
                    coreValuesList
                },
                coreValuesList,
                stories = PublicRows(pubs.Where(x => x.EntityType == EntityType.STORY)),
                timeline = PublicRows(pubs.Where(x => x.EntityType == EntityType.EVENT).OrderByDescending(x => x.OccurredAt)),
                people = PublicRows(pubs.Where(x => x.EntityType == EntityType.PERSON)),
                products = PublicRows(pubs.Where(x => x.EntityType == EntityType.PRODUCT))
            });
        }).AllowAnonymous();

        app.MapGet("/api/atlas/{organizationSlug}/{entityType}/{publicationSlug}", async (string organizationSlug, string entityType, string publicationSlug, AppDbContext db) =>
        {
            var org = await db.Organizations.AsNoTracking().FirstOrDefaultAsync(x => x.Slug == organizationSlug && x.AtlasEnabled);
            if (org is null) return Results.NotFound();
            if (!Enum.TryParse<EntityType>(entityType, true, out var type)) return Results.NotFound();
            var pub = await db.AtlasPublications.AsNoTracking().FirstOrDefaultAsync(x => x.OrganizationId == org.Id && x.EntityType == type && x.Slug == publicationSlug && x.Status == AtlasPublicationStatus.PUBLISHED);
            return pub is null ? Results.NotFound() : Results.Ok(PublicRow(pub));
        }).AllowAnonymous();

        return app;
    }

    private static object PublicRow(AtlasPublication x) => new
    {
        x.Id,
        entityType = x.EntityType.ToString(),
        x.Slug,
        title = x.PublishedTitle,
        summary = x.PublishedSummary,
        content = x.PublishedContent,
        coverMediaUrl = x.CoverMediaUrl,
        coreValueTag = x.CoreValueTag,
        x.OccurredAt,
        x.PublishedAt,
        x.Version
    };

    private static IEnumerable<object> PublicRows(IEnumerable<AtlasPublication> rows) => rows.Select(PublicRow);

    public static async Task<AtlasPublication?> PublishOrUpdateSnapshotAsync(AppDbContext db, Guid orgId, EntityType type, Guid entityId, Guid? userId)
    {
        var snapshot = await GetSnapshot(db, orgId, type, entityId);
        if (snapshot is null) return null;

        var publication = await db.AtlasPublications.FirstOrDefaultAsync(x => x.OrganizationId == orgId && x.EntityType == type && x.EntityId == entityId);
        if (publication is null)
        {
            var slugBase = Slugify.From(snapshot.Title);
            var slug = slugBase;
            var suffix = 2;
            while (await db.AtlasPublications.AnyAsync(x => x.OrganizationId == orgId && x.Slug == slug))
            {
                slug = $"{slugBase}-{suffix++}";
            }
            publication = new AtlasPublication
            {
                OrganizationId = orgId,
                EntityType = type,
                EntityId = entityId,
                Slug = slug,
                Version = 1
            };
            db.AtlasPublications.Add(publication);
        }
        else
        {
            publication.Version += 1;
        }

        ApplySnapshot(publication, snapshot, userId);
        db.ActivityLogs.Add(new ActivityLog
        {
            OrganizationId = orgId,
            UserId = userId,
            Action = publication.Version == 1 ? "ATLAS_PUBLISHED" : "ATLAS_REPUBLISHED",
            EntityType = type.ToString(),
            EntityId = entityId,
            MetadataJson = JsonSerializer.Serialize(new { publication.Id, publication.Version })
        });
        return publication;
    }

    public static void ApplySnapshot(AtlasPublication publication, AtlasSnapshot snapshot, Guid? userId)
    {
        publication.PublishedTitle = snapshot.Title;
        publication.PublishedSummary = snapshot.Summary;
        publication.PublishedContent = snapshot.Content;
        publication.CoverMediaUrl = snapshot.CoverUrl;
        publication.CoreValueTag = snapshot.CoreValueTag;
        publication.OccurredAt = snapshot.OccurredAt;
        publication.SnapshotJson = snapshot.SnapshotJson;
        publication.SourceUpdatedAt = snapshot.UpdatedAt;
        publication.PublishedByUserId = userId;
        publication.PublishedAt = DateTimeOffset.UtcNow;
        publication.UnpublishedAt = null;
        publication.Status = AtlasPublicationStatus.PUBLISHED;
        publication.UpdatedAt = DateTimeOffset.UtcNow;
    }

    public static async Task<AtlasSnapshot?> GetSnapshot(AppDbContext db, Guid orgId, EntityType type, Guid id)
    {
        switch (type)
        {
            case EntityType.STORY:
                var story = await db.Stories.AsNoTracking().FirstOrDefaultAsync(x => x.OrganizationId == orgId && x.Id == id);
                return story is null ? null : new AtlasSnapshot(story.Title, story.Summary, story.Content, story.CoverImageUrl, story.OccurredAt, story.UpdatedAt, story.Status, story.Visibility, JsonSerializer.Serialize(story), story.CoreValueTag);
            case EntityType.EVENT:
                var ev = await db.Events.AsNoTracking().FirstOrDefaultAsync(x => x.OrganizationId == orgId && x.Id == id);
                return ev is null ? null : new AtlasSnapshot(ev.Name, ev.EventType, ev.Content, null, ev.StartDate, ev.UpdatedAt, ev.Status, ev.Visibility, JsonSerializer.Serialize(ev), ev.CoreValueTag);
            case EntityType.PERSON:
                var person = await db.People.AsNoTracking().FirstOrDefaultAsync(x => x.OrganizationId == orgId && x.Id == id);
                return person is null ? null : new AtlasSnapshot(person.FullName, person.RoleTitle, person.Bio ?? person.NotableContribution, person.AvatarUrl, person.JoinedAt, person.UpdatedAt, person.Status, person.Visibility, JsonSerializer.Serialize(person), person.CoreValueTag);
            case EntityType.PRODUCT:
                var product = await db.ProductsProjects.AsNoTracking().FirstOrDefaultAsync(x => x.OrganizationId == orgId && x.Id == id);
                return product is null ? null : new AtlasSnapshot(product.Name, product.Kind, product.Description, null, product.StartedAt, product.UpdatedAt, product.Status, product.Visibility, JsonSerializer.Serialize(product), product.CoreValueTag);
            default:
                return null;
        }
    }

    public record PublishRequest(string EntityType, Guid EntityId);
    public record AtlasCandidate(EntityType EntityType, Guid EntityId, string Title, ContentStatus Status, Visibility Visibility, DateTimeOffset UpdatedAt, string? CoreValueTag = null);
    public record AtlasSnapshot(string Title, string? Summary, string? Content, string? CoverUrl, DateTimeOffset? OccurredAt, DateTimeOffset UpdatedAt, ContentStatus Status, Visibility Visibility, string SnapshotJson, string? CoreValueTag = null);
}
