using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Nexture.Api.Data;
using Nexture.Api.Models;
using Nexture.Api.Services;

namespace Nexture.Api.Endpoints;

public static class ContentEndpoints
{
    public static IEndpointRouteBuilder MapContentEndpoints(this IEndpointRouteBuilder app)
    {
        // 1. Stories
        app.MapGet("/api/orgs/{orgId:guid}/stories", async (Guid orgId, ClaimsPrincipal user, AppDbContext db, OrganizationAccess access) =>
        {
            if (await access.GetMembershipAsync(user, orgId) is null) return Results.Forbid();
            var items = await db.Stories.AsNoTracking().Where(x => x.OrganizationId == orgId).OrderByDescending(x => x.UpdatedAt).ToListAsync();
            var publishedIds = await db.AtlasPublications.AsNoTracking()
                .Where(x => x.OrganizationId == orgId && x.EntityType == EntityType.STORY && x.Status == AtlasPublicationStatus.PUBLISHED)
                .Select(x => x.EntityId)
                .ToListAsync();

            var rows = items.Select(x => new
            {
                x.Id, x.Title, x.Summary, x.Content, x.CoverImageUrl, x.OccurredAt, x.StoryType,
                status = x.Status.ToString(), visibility = x.Visibility.ToString(), x.CoreValueTag,
                x.CreatedAt, x.UpdatedAt,
                isAtlasPublished = publishedIds.Contains(x.Id)
            });
            return Results.Ok(rows);
        }).RequireAuthorization();

        app.MapPost("/api/orgs/{orgId:guid}/stories", async (Guid orgId, Story req, ClaimsPrincipal user, AppDbContext db, OrganizationAccess access) =>
        {
            var m = await access.GetMembershipAsync(user, orgId);
            if (m is null || !OrganizationAccess.CanEdit(m.Role)) return Results.Forbid();
            req.Id = Guid.NewGuid();
            req.OrganizationId = orgId;
            if (req.Status != ContentStatus.DRAFT) req.Status = ContentStatus.VERIFIED;
            if (req.Visibility == 0) req.Visibility = Visibility.PUBLIC;
            var autoPublish = req.Status == ContentStatus.VERIFIED && req.Visibility == Visibility.PUBLIC;
            req.CreatedAt = req.UpdatedAt = DateTimeOffset.UtcNow;
            db.Stories.Add(req);
            await db.SaveChangesAsync();

            if (autoPublish)
            {
                await AtlasEndpoints.PublishOrUpdateSnapshotAsync(db, orgId, EntityType.STORY, req.Id, access.GetUserId(user));
                await db.SaveChangesAsync();
            }

            await LogAndSave(db, access.GetUserId(user), orgId, "STORY_CREATED", "STORY", req.Id);
            return Results.Created($"/api/orgs/{orgId}/stories/{req.Id}", req);
        }).RequireAuthorization();

        app.MapPut("/api/orgs/{orgId:guid}/stories/{id:guid}", async (Guid orgId, Guid id, Story req, ClaimsPrincipal user, AppDbContext db, OrganizationAccess access) =>
        {
            var m = await access.GetMembershipAsync(user, orgId);
            if (m is null || !OrganizationAccess.CanEdit(m.Role)) return Results.Forbid();
            var row = await db.Stories.FirstOrDefaultAsync(x => x.OrganizationId == orgId && x.Id == id);
            if (row is null) return Results.NotFound();
            row.Title = req.Title; row.Summary = req.Summary; row.Content = req.Content; row.CoverImageUrl = req.CoverImageUrl;
            row.OccurredAt = req.OccurredAt; row.StoryType = req.StoryType; row.Visibility = req.Visibility;
            row.CoreValueTag = req.CoreValueTag;
            if (OrganizationAccess.IsAdmin(m.Role)) row.Status = req.Status;
            row.UpdatedAt = DateTimeOffset.UtcNow;
            await db.SaveChangesAsync();

            if (row.Status == ContentStatus.VERIFIED && row.Visibility == Visibility.PUBLIC)
            {
                await AtlasEndpoints.PublishOrUpdateSnapshotAsync(db, orgId, EntityType.STORY, id, access.GetUserId(user));
                await db.SaveChangesAsync();
            }

            await LogAndSave(db, access.GetUserId(user), orgId, "STORY_UPDATED", "STORY", row.Id);
            return Results.Ok(row);
        }).RequireAuthorization();

        app.MapDelete("/api/orgs/{orgId:guid}/stories/{id:guid}", async (Guid orgId, Guid id, ClaimsPrincipal user, AppDbContext db, OrganizationAccess access) =>
        {
            var m = await access.GetMembershipAsync(user, orgId);
            if (m is null || !OrganizationAccess.CanEdit(m.Role)) return Results.Forbid();
            var row = await db.Stories.FirstOrDefaultAsync(x => x.OrganizationId == orgId && x.Id == id);
            if (row is null) return Results.NotFound();

            var pubs = await db.AtlasPublications.Where(x => x.OrganizationId == orgId && x.EntityType == EntityType.STORY && x.EntityId == id).ToListAsync();
            if (pubs.Count > 0) db.AtlasPublications.RemoveRange(pubs);

            var rels = await db.Relationships.Where(x => x.OrganizationId == orgId && ((x.SourceType == EntityType.STORY && x.SourceId == id) || (x.TargetType == EntityType.STORY && x.TargetId == id))).ToListAsync();
            if (rels.Count > 0) db.Relationships.RemoveRange(rels);

            db.Stories.Remove(row);
            await db.SaveChangesAsync();

            await LogAndSave(db, access.GetUserId(user), orgId, "STORY_DELETED", "STORY", id);
            return Results.NoContent();
        }).RequireAuthorization();

        // 2. Events
        app.MapGet("/api/orgs/{orgId:guid}/events", async (Guid orgId, ClaimsPrincipal user, AppDbContext db, OrganizationAccess access) =>
        {
            if (await access.GetMembershipAsync(user, orgId) is null) return Results.Forbid();
            var items = await db.Events.AsNoTracking().Where(x => x.OrganizationId == orgId).OrderByDescending(x => x.StartDate).ToListAsync();
            var publishedIds = await db.AtlasPublications.AsNoTracking()
                .Where(x => x.OrganizationId == orgId && x.EntityType == EntityType.EVENT && x.Status == AtlasPublicationStatus.PUBLISHED)
                .Select(x => x.EntityId)
                .ToListAsync();

            var rows = items.Select(x => new
            {
                x.Id, x.Name, x.EventType, x.StartDate, x.EndDate, x.Content,
                status = x.Status.ToString(), visibility = x.Visibility.ToString(), x.CoreValueTag,
                x.CreatedAt, x.UpdatedAt,
                isAtlasPublished = publishedIds.Contains(x.Id)
            });
            return Results.Ok(rows);
        }).RequireAuthorization();

        app.MapPost("/api/orgs/{orgId:guid}/events", async (Guid orgId, CultureEvent req, ClaimsPrincipal user, AppDbContext db, OrganizationAccess access) =>
        {
            var m = await access.GetMembershipAsync(user, orgId);
            if (m is null || !OrganizationAccess.CanEdit(m.Role)) return Results.Forbid();
            req.Id = Guid.NewGuid();
            req.OrganizationId = orgId;
            if (req.Status != ContentStatus.DRAFT) req.Status = ContentStatus.VERIFIED;
            if (req.Visibility == 0) req.Visibility = Visibility.PUBLIC;
            var autoPublish = req.Status == ContentStatus.VERIFIED && req.Visibility == Visibility.PUBLIC;
            req.CreatedAt = req.UpdatedAt = DateTimeOffset.UtcNow;
            db.Events.Add(req);
            await db.SaveChangesAsync();

            if (autoPublish)
            {
                await AtlasEndpoints.PublishOrUpdateSnapshotAsync(db, orgId, EntityType.EVENT, req.Id, access.GetUserId(user));
                await db.SaveChangesAsync();
            }

            await LogAndSave(db, access.GetUserId(user), orgId, "EVENT_CREATED", "EVENT", req.Id);
            return Results.Created($"/api/orgs/{orgId}/events/{req.Id}", req);
        }).RequireAuthorization();

        app.MapPut("/api/orgs/{orgId:guid}/events/{id:guid}", async (Guid orgId, Guid id, CultureEvent req, ClaimsPrincipal user, AppDbContext db, OrganizationAccess access) =>
        {
            var m = await access.GetMembershipAsync(user, orgId);
            if (m is null || !OrganizationAccess.CanEdit(m.Role)) return Results.Forbid();
            var row = await db.Events.FirstOrDefaultAsync(x => x.OrganizationId == orgId && x.Id == id);
            if (row is null) return Results.NotFound();
            row.Name = req.Name; row.StartDate = req.StartDate; row.EndDate = req.EndDate; row.Content = req.Content; row.EventType = req.EventType; row.Visibility = req.Visibility;
            row.CoreValueTag = req.CoreValueTag;
            if (OrganizationAccess.IsAdmin(m.Role)) row.Status = req.Status;
            row.UpdatedAt = DateTimeOffset.UtcNow;
            await db.SaveChangesAsync();

            if (row.Status == ContentStatus.VERIFIED && row.Visibility == Visibility.PUBLIC)
            {
                await AtlasEndpoints.PublishOrUpdateSnapshotAsync(db, orgId, EntityType.EVENT, id, access.GetUserId(user));
                await db.SaveChangesAsync();
            }

            await LogAndSave(db, access.GetUserId(user), orgId, "EVENT_UPDATED", "EVENT", row.Id);
            return Results.Ok(row);
        }).RequireAuthorization();

        app.MapDelete("/api/orgs/{orgId:guid}/events/{id:guid}", async (Guid orgId, Guid id, ClaimsPrincipal user, AppDbContext db, OrganizationAccess access) =>
        {
            var m = await access.GetMembershipAsync(user, orgId);
            if (m is null || !OrganizationAccess.CanEdit(m.Role)) return Results.Forbid();
            var row = await db.Events.FirstOrDefaultAsync(x => x.OrganizationId == orgId && x.Id == id);
            if (row is null) return Results.NotFound();

            var pubs = await db.AtlasPublications.Where(x => x.OrganizationId == orgId && x.EntityType == EntityType.EVENT && x.EntityId == id).ToListAsync();
            if (pubs.Count > 0) db.AtlasPublications.RemoveRange(pubs);

            var rels = await db.Relationships.Where(x => x.OrganizationId == orgId && ((x.SourceType == EntityType.EVENT && x.SourceId == id) || (x.TargetType == EntityType.EVENT && x.TargetId == id))).ToListAsync();
            if (rels.Count > 0) db.Relationships.RemoveRange(rels);

            db.Events.Remove(row);
            await db.SaveChangesAsync();

            await LogAndSave(db, access.GetUserId(user), orgId, "EVENT_DELETED", "EVENT", id);
            return Results.NoContent();
        }).RequireAuthorization();

        // 3. People
        app.MapGet("/api/orgs/{orgId:guid}/people", async (Guid orgId, ClaimsPrincipal user, AppDbContext db, OrganizationAccess access) =>
        {
            if (await access.GetMembershipAsync(user, orgId) is null) return Results.Forbid();
            var items = await db.People.AsNoTracking().Where(x => x.OrganizationId == orgId).OrderBy(x => x.FullName).ToListAsync();
            var publishedIds = await db.AtlasPublications.AsNoTracking()
                .Where(x => x.OrganizationId == orgId && x.EntityType == EntityType.PERSON && x.Status == AtlasPublicationStatus.PUBLISHED)
                .Select(x => x.EntityId)
                .ToListAsync();

            var rows = items.Select(x => new
            {
                x.Id, x.FullName, x.RoleTitle, x.AvatarUrl, x.JoinedAt, x.Bio, x.NotableContribution,
                status = x.Status.ToString(), visibility = x.Visibility.ToString(), x.CoreValueTag,
                x.CreatedAt, x.UpdatedAt,
                isAtlasPublished = publishedIds.Contains(x.Id)
            });
            return Results.Ok(rows);
        }).RequireAuthorization();

        app.MapPost("/api/orgs/{orgId:guid}/people", async (Guid orgId, Person req, ClaimsPrincipal user, AppDbContext db, OrganizationAccess access) =>
        {
            var m = await access.GetMembershipAsync(user, orgId);
            if (m is null || !OrganizationAccess.CanEdit(m.Role)) return Results.Forbid();
            req.Id = Guid.NewGuid();
            req.OrganizationId = orgId;
            if (req.Status != ContentStatus.DRAFT) req.Status = ContentStatus.VERIFIED;
            if (req.Visibility == 0) req.Visibility = Visibility.PUBLIC;
            var autoPublish = req.Status == ContentStatus.VERIFIED && req.Visibility == Visibility.PUBLIC;
            req.CreatedAt = req.UpdatedAt = DateTimeOffset.UtcNow;
            db.People.Add(req);
            await db.SaveChangesAsync();

            if (autoPublish)
            {
                await AtlasEndpoints.PublishOrUpdateSnapshotAsync(db, orgId, EntityType.PERSON, req.Id, access.GetUserId(user));
                await db.SaveChangesAsync();
            }

            await LogAndSave(db, access.GetUserId(user), orgId, "PERSON_CREATED", "PERSON", req.Id);
            return Results.Ok(req);
        }).RequireAuthorization();

        app.MapPut("/api/orgs/{orgId:guid}/people/{id:guid}", async (Guid orgId, Guid id, Person req, ClaimsPrincipal user, AppDbContext db, OrganizationAccess access) =>
        {
            var m = await access.GetMembershipAsync(user, orgId);
            if (m is null || !OrganizationAccess.CanEdit(m.Role)) return Results.Forbid();
            var row = await db.People.FirstOrDefaultAsync(x => x.OrganizationId == orgId && x.Id == id);
            if (row is null) return Results.NotFound();
            row.FullName = req.FullName; row.AvatarUrl = req.AvatarUrl; row.RoleTitle = req.RoleTitle; row.JoinedAt = req.JoinedAt;
            row.Bio = req.Bio; row.NotableContribution = req.NotableContribution; row.Visibility = req.Visibility;
            row.CoreValueTag = req.CoreValueTag;
            if (OrganizationAccess.IsAdmin(m.Role)) row.Status = req.Status;
            row.UpdatedAt = DateTimeOffset.UtcNow;
            await db.SaveChangesAsync();

            if (row.Status == ContentStatus.VERIFIED && row.Visibility == Visibility.PUBLIC)
            {
                await AtlasEndpoints.PublishOrUpdateSnapshotAsync(db, orgId, EntityType.PERSON, id, access.GetUserId(user));
                await db.SaveChangesAsync();
            }

            await LogAndSave(db, access.GetUserId(user), orgId, "PERSON_UPDATED", "PERSON", row.Id);
            return Results.Ok(row);
        }).RequireAuthorization();

        app.MapDelete("/api/orgs/{orgId:guid}/people/{id:guid}", async (Guid orgId, Guid id, ClaimsPrincipal user, AppDbContext db, OrganizationAccess access) =>
        {
            var m = await access.GetMembershipAsync(user, orgId);
            if (m is null || !OrganizationAccess.CanEdit(m.Role)) return Results.Forbid();
            var row = await db.People.FirstOrDefaultAsync(x => x.OrganizationId == orgId && x.Id == id);
            if (row is null) return Results.NotFound();

            var pubs = await db.AtlasPublications.Where(x => x.OrganizationId == orgId && x.EntityType == EntityType.PERSON && x.EntityId == id).ToListAsync();
            if (pubs.Count > 0) db.AtlasPublications.RemoveRange(pubs);

            var rels = await db.Relationships.Where(x => x.OrganizationId == orgId && ((x.SourceType == EntityType.PERSON && x.SourceId == id) || (x.TargetType == EntityType.PERSON && x.TargetId == id))).ToListAsync();
            if (rels.Count > 0) db.Relationships.RemoveRange(rels);

            db.People.Remove(row);
            await db.SaveChangesAsync();

            await LogAndSave(db, access.GetUserId(user), orgId, "PERSON_DELETED", "PERSON", id);
            return Results.NoContent();
        }).RequireAuthorization();

        // 4. Products
        app.MapGet("/api/orgs/{orgId:guid}/products", async (Guid orgId, ClaimsPrincipal user, AppDbContext db, OrganizationAccess access) =>
        {
            if (await access.GetMembershipAsync(user, orgId) is null) return Results.Forbid();
            var items = await db.ProductsProjects.AsNoTracking().Where(x => x.OrganizationId == orgId).OrderBy(x => x.Name).ToListAsync();
            var publishedIds = await db.AtlasPublications.AsNoTracking()
                .Where(x => x.OrganizationId == orgId && x.EntityType == EntityType.PRODUCT && x.Status == AtlasPublicationStatus.PUBLISHED)
                .Select(x => x.EntityId)
                .ToListAsync();

            var rows = items.Select(x => new
            {
                x.Id, x.Name, x.Kind, x.StartedAt, x.Description,
                status = x.Status.ToString(), visibility = x.Visibility.ToString(), x.CoreValueTag,
                x.CreatedAt, x.UpdatedAt,
                isAtlasPublished = publishedIds.Contains(x.Id)
            });
            return Results.Ok(rows);
        }).RequireAuthorization();

        app.MapPost("/api/orgs/{orgId:guid}/products", async (Guid orgId, ProductProject req, ClaimsPrincipal user, AppDbContext db, OrganizationAccess access) =>
        {
            var m = await access.GetMembershipAsync(user, orgId);
            if (m is null || !OrganizationAccess.CanEdit(m.Role)) return Results.Forbid();
            req.Id = Guid.NewGuid();
            req.OrganizationId = orgId;
            if (req.Status != ContentStatus.DRAFT) req.Status = ContentStatus.VERIFIED;
            if (req.Visibility == 0) req.Visibility = Visibility.PUBLIC;
            var autoPublish = req.Status == ContentStatus.VERIFIED && req.Visibility == Visibility.PUBLIC;
            req.CreatedAt = req.UpdatedAt = DateTimeOffset.UtcNow;
            db.ProductsProjects.Add(req);
            await db.SaveChangesAsync();

            if (autoPublish)
            {
                await AtlasEndpoints.PublishOrUpdateSnapshotAsync(db, orgId, EntityType.PRODUCT, req.Id, access.GetUserId(user));
                await db.SaveChangesAsync();
            }

            await LogAndSave(db, access.GetUserId(user), orgId, "PRODUCT_CREATED", "PRODUCT", req.Id);
            return Results.Ok(req);
        }).RequireAuthorization();

        app.MapPut("/api/orgs/{orgId:guid}/products/{id:guid}", async (Guid orgId, Guid id, ProductProject req, ClaimsPrincipal user, AppDbContext db, OrganizationAccess access) =>
        {
            var m = await access.GetMembershipAsync(user, orgId);
            if (m is null || !OrganizationAccess.CanEdit(m.Role)) return Results.Forbid();
            var row = await db.ProductsProjects.FirstOrDefaultAsync(x => x.OrganizationId == orgId && x.Id == id);
            if (row is null) return Results.NotFound();
            row.Name = req.Name; row.Kind = req.Kind; row.StartedAt = req.StartedAt; row.Description = req.Description; row.Visibility = req.Visibility;
            row.CoreValueTag = req.CoreValueTag;
            if (OrganizationAccess.IsAdmin(m.Role)) row.Status = req.Status;
            row.UpdatedAt = DateTimeOffset.UtcNow;
            await db.SaveChangesAsync();

            if (row.Status == ContentStatus.VERIFIED && row.Visibility == Visibility.PUBLIC)
            {
                await AtlasEndpoints.PublishOrUpdateSnapshotAsync(db, orgId, EntityType.PRODUCT, id, access.GetUserId(user));
                await db.SaveChangesAsync();
            }

            await LogAndSave(db, access.GetUserId(user), orgId, "PRODUCT_UPDATED", "PRODUCT", row.Id);
            return Results.Ok(row);
        }).RequireAuthorization();

        app.MapDelete("/api/orgs/{orgId:guid}/products/{id:guid}", async (Guid orgId, Guid id, ClaimsPrincipal user, AppDbContext db, OrganizationAccess access) =>
        {
            var m = await access.GetMembershipAsync(user, orgId);
            if (m is null || !OrganizationAccess.CanEdit(m.Role)) return Results.Forbid();
            var row = await db.ProductsProjects.FirstOrDefaultAsync(x => x.OrganizationId == orgId && x.Id == id);
            if (row is null) return Results.NotFound();

            var pubs = await db.AtlasPublications.Where(x => x.OrganizationId == orgId && x.EntityType == EntityType.PRODUCT && x.EntityId == id).ToListAsync();
            if (pubs.Count > 0) db.AtlasPublications.RemoveRange(pubs);

            var rels = await db.Relationships.Where(x => x.OrganizationId == orgId && ((x.SourceType == EntityType.PRODUCT && x.SourceId == id) || (x.TargetType == EntityType.PRODUCT && x.TargetId == id))).ToListAsync();
            if (rels.Count > 0) db.Relationships.RemoveRange(rels);

            db.ProductsProjects.Remove(row);
            await db.SaveChangesAsync();

            await LogAndSave(db, access.GetUserId(user), orgId, "PRODUCT_DELETED", "PRODUCT", id);
            return Results.NoContent();
        }).RequireAuthorization();

        // 5. Prepare & Publish directly to Atlas in 1 click
        app.MapPost("/api/orgs/{orgId:guid}/content/{entityType}/{id:guid}/prepare-atlas", async (Guid orgId, string entityType, Guid id, ClaimsPrincipal user, AppDbContext db, OrganizationAccess access) =>
        {
            var m = await access.GetMembershipAsync(user, orgId);
            if (m is null || !OrganizationAccess.IsAdmin(m.Role)) return Results.Forbid();
            var type = entityType.Trim().ToUpperInvariant();
            var now = DateTimeOffset.UtcNow;
            EntityType entityTypeEnum;
            switch (type)
            {
                case "STORY":
                    entityTypeEnum = EntityType.STORY;
                    var story = await db.Stories.FirstOrDefaultAsync(x => x.OrganizationId == orgId && x.Id == id);
                    if (story is null) return Results.NotFound();
                    story.Status = ContentStatus.VERIFIED; story.Visibility = Visibility.PUBLIC; story.UpdatedAt = now; break;
                case "EVENT":
                    entityTypeEnum = EntityType.EVENT;
                    var ev = await db.Events.FirstOrDefaultAsync(x => x.OrganizationId == orgId && x.Id == id);
                    if (ev is null) return Results.NotFound();
                    ev.Status = ContentStatus.VERIFIED; ev.Visibility = Visibility.PUBLIC; ev.UpdatedAt = now; break;
                case "PERSON":
                    entityTypeEnum = EntityType.PERSON;
                    var person = await db.People.FirstOrDefaultAsync(x => x.OrganizationId == orgId && x.Id == id);
                    if (person is null) return Results.NotFound();
                    person.Status = ContentStatus.VERIFIED; person.Visibility = Visibility.PUBLIC; person.UpdatedAt = now; break;
                case "PRODUCT":
                    entityTypeEnum = EntityType.PRODUCT;
                    var product = await db.ProductsProjects.FirstOrDefaultAsync(x => x.OrganizationId == orgId && x.Id == id);
                    if (product is null) return Results.NotFound();
                    product.Status = ContentStatus.VERIFIED; product.Visibility = Visibility.PUBLIC; product.UpdatedAt = now; break;
                default: return Results.BadRequest("Supported types: STORY, EVENT, PERSON, PRODUCT.");
            }
            await db.SaveChangesAsync();

            // Automatically publish or update snapshot to Culture Atlas immediately!
            var pub = await AtlasEndpoints.PublishOrUpdateSnapshotAsync(db, orgId, entityTypeEnum, id, access.GetUserId(user));
            db.ActivityLogs.Add(new ActivityLog { OrganizationId = orgId, UserId = access.GetUserId(user), Action = "CONTENT_PREPARED_AND_PUBLISHED_TO_ATLAS", EntityType = type, EntityId = id });
            await db.SaveChangesAsync();

            return Results.Ok(new
            {
                status = "VERIFIED",
                visibility = "PUBLIC",
                isAtlasPublished = true,
                publicationSlug = pub?.Slug,
                message = "Nội dung đã được xác minh và xuất bản trực tiếp lên Culture Atlas."
            });
        }).RequireAuthorization();

        app.MapPost("/api/orgs/{orgId:guid}/relationships", async (Guid orgId, Relationship req, ClaimsPrincipal user, AppDbContext db, OrganizationAccess access) =>
        {
            var m = await access.GetMembershipAsync(user, orgId);
            if (m is null || !OrganizationAccess.CanEdit(m.Role)) return Results.Forbid();
            req.Id = Guid.NewGuid(); req.OrganizationId = orgId;
            db.Relationships.Add(req);
            await db.SaveChangesAsync();
            return Results.Ok(req);
        }).RequireAuthorization();

        return app;
    }

    private static async Task LogAndSave(AppDbContext db, Guid? userId, Guid orgId, string action, string entityType, Guid entityId)
    {
        db.ActivityLogs.Add(new ActivityLog { OrganizationId = orgId, UserId = userId, Action = action, EntityType = entityType, EntityId = entityId });
        await db.SaveChangesAsync();
    }
}
