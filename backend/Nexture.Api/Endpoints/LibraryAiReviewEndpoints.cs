using System.Security.Claims;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Nexture.Api.Data;
using Nexture.Api.Models;
using Nexture.Api.Services;

namespace Nexture.Api.Endpoints;

public static class LibraryAiReviewEndpoints
{
    public static IEndpointRouteBuilder MapLibraryAiReviewEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/orgs/{orgId:guid}/library", async (Guid orgId, ClaimsPrincipal user, AppDbContext db, OrganizationAccess access) =>
        {
            if (await access.GetMembershipAsync(user, orgId) is null) return Results.Forbid();
            var media = await db.MediaAssets.AsNoTracking().Where(x => x.OrganizationId == orgId).OrderByDescending(x => x.CreatedAt).ToListAsync();
            var sources = await db.Sources.AsNoTracking().Where(x => x.OrganizationId == orgId).OrderByDescending(x => x.CreatedAt).ToListAsync();
            return Results.Ok(new { media, sources });
        }).RequireAuthorization();

        app.MapPost("/api/orgs/{orgId:guid}/sources/text", async (Guid orgId, TextSourceRequest req, ClaimsPrincipal user, AppDbContext db, OrganizationAccess access) =>
        {
            var m = await access.GetMembershipAsync(user, orgId);
            if (m is null || !OrganizationAccess.CanEdit(m.Role)) return Results.Forbid();
            var source = new SourceRecord
            {
                OrganizationId = orgId, Name = req.Name, TextContent = req.TextContent,
                SourceType = "TEXT", Status = ContentStatus.VERIFIED, Visibility = Visibility.INTERNAL
            };
            db.Sources.Add(source);
            await db.SaveChangesAsync();
            return Results.Ok(source);
        }).RequireAuthorization();

        app.MapPost("/api/orgs/{orgId:guid}/media/upload", async (Guid orgId, IFormFile file, ClaimsPrincipal user, AppDbContext db, OrganizationAccess access, IWebHostEnvironment env) =>
        {
            var m = await access.GetMembershipAsync(user, orgId);
            if (m is null || !OrganizationAccess.CanEdit(m.Role)) return Results.Forbid();
            if (file.Length == 0) return Results.BadRequest("Empty file.");
            if (file.Length > 100 * 1024 * 1024) return Results.BadRequest("File exceeds 100 MB.");

            var ext = Path.GetExtension(file.FileName);
            var safeName = $"{Guid.NewGuid():N}{ext}";
            var uploadDir = Path.Combine(env.ContentRootPath, "uploads", orgId.ToString("N"));
            Directory.CreateDirectory(uploadDir);
            var diskPath = Path.Combine(uploadDir, safeName);
            await using (var stream = File.Create(diskPath)) await file.CopyToAsync(stream);

            var url = $"/uploads/{orgId:N}/{safeName}";
            var media = new MediaAsset
            {
                OrganizationId = orgId, Name = Path.GetFileName(file.FileName),
                MediaType = file.ContentType, FileUrl = url,
                Status = ContentStatus.VERIFIED, Visibility = Visibility.INTERNAL
            };
            var source = new SourceRecord
            {
                OrganizationId = orgId, Name = Path.GetFileName(file.FileName),
                SourceType = "FILE", FileUrl = url, MediaAssetId = media.Id,
                Status = ContentStatus.VERIFIED, Visibility = Visibility.INTERNAL
            };
            db.MediaAssets.Add(media); db.Sources.Add(source);
            await db.SaveChangesAsync();
            return Results.Ok(new { media, source });
        }).DisableAntiforgery().RequireAuthorization();

        app.MapPost("/api/orgs/{orgId:guid}/ai/analyze/{sourceId:guid}", async (Guid orgId, Guid sourceId, ClaimsPrincipal user, AppDbContext db, OrganizationAccess access, IAiStructuringService ai, CancellationToken ct) =>
        {
            var m = await access.GetMembershipAsync(user, orgId);
            if (m is null || !OrganizationAccess.CanEdit(m.Role)) return Results.Forbid();

            var source = await db.Sources.FirstOrDefaultAsync(x => x.OrganizationId == orgId && x.Id == sourceId, ct);
            if (source is null) return Results.NotFound();

            var proposals = await ai.AnalyzeAsync(source, ct);
            var suggestions = proposals.Select(p => new AiSuggestion
            {
                OrganizationId = orgId, SourceId = source.Id, SuggestionType = p.Type,
                PayloadJson = JsonSerializer.Serialize(p.Payload, JsonDefaults.Options),
                Status = ContentStatus.PENDING_REVIEW
            }).ToList();

            db.AiSuggestions.AddRange(suggestions);
            foreach (var s in suggestions)
                db.Reviews.Add(new Review { OrganizationId = orgId, SuggestionId = s.Id, Decision = ReviewDecision.PENDING });
            await db.SaveChangesAsync(ct);
            return Results.Ok(suggestions);
        }).RequireAuthorization();

        app.MapGet("/api/orgs/{orgId:guid}/reviews", async (Guid orgId, ClaimsPrincipal user, AppDbContext db, OrganizationAccess access) =>
        {
            if (await access.GetMembershipAsync(user, orgId) is null) return Results.Forbid();
            var rows = await (from s in db.AiSuggestions.AsNoTracking()
                              join r in db.Reviews.AsNoTracking() on s.Id equals r.SuggestionId
                              where s.OrganizationId == orgId && r.Decision == ReviewDecision.PENDING
                              orderby s.CreatedAt descending
                              select new { s.Id, s.SourceId, suggestionType = s.SuggestionType.ToString(), s.PayloadJson, status = s.Status.ToString(), reviewId = r.Id })
                              .ToListAsync();
            return Results.Ok(rows);
        }).RequireAuthorization();

        app.MapPost("/api/orgs/{orgId:guid}/reviews/{suggestionId:guid}/approve", async (Guid orgId, Guid suggestionId, ClaimsPrincipal user, AppDbContext db, OrganizationAccess access) =>
        {
            var m = await access.GetMembershipAsync(user, orgId);
            if (m is null || !OrganizationAccess.IsAdmin(m.Role)) return Results.Forbid();

            var suggestion = await db.AiSuggestions.FirstOrDefaultAsync(x => x.OrganizationId == orgId && x.Id == suggestionId);
            if (suggestion is null) return Results.NotFound();
            if (suggestion.Status == ContentStatus.VERIFIED) return Results.Conflict("Already approved.");

            Guid entityId;
            switch (suggestion.SuggestionType)
            {
                case EntityType.STORY:
                    var sp = JsonSerializer.Deserialize<StoryProposal>(suggestion.PayloadJson, JsonDefaults.Options) ?? new StoryProposal();
                    var story = new Story { OrganizationId = orgId, Title = sp.Title ?? "Untitled", Summary = sp.Summary, Content = sp.Content, StoryType = sp.StoryType, OccurredAt = sp.OccurredAt, SourceId = suggestion.SourceId, Status = ContentStatus.VERIFIED, Visibility = ParseVisibility(sp.Visibility) };
                    db.Stories.Add(story); entityId = story.Id; break;
                case EntityType.EVENT:
                    var ep = JsonSerializer.Deserialize<EventProposal>(suggestion.PayloadJson, JsonDefaults.Options) ?? new EventProposal();
                    var ev = new CultureEvent { OrganizationId = orgId, Name = ep.Name ?? "Untitled", StartDate = ep.StartDate, Content = ep.Content, EventType = ep.EventType, SourceId = suggestion.SourceId, Status = ContentStatus.VERIFIED, Visibility = ParseVisibility(ep.Visibility) };
                    db.Events.Add(ev); entityId = ev.Id; break;
                default:
                    return Results.BadRequest("This starter currently auto-materializes STORY and EVENT suggestions.");
            }

            suggestion.Status = ContentStatus.VERIFIED;
            suggestion.CreatedEntityId = entityId;
            var review = await db.Reviews.FirstAsync(x => x.SuggestionId == suggestionId);
            review.Decision = ReviewDecision.APPROVED; review.ReviewerUserId = access.GetUserId(user); review.ReviewedAt = DateTimeOffset.UtcNow;
            db.ActivityLogs.Add(new ActivityLog { OrganizationId = orgId, UserId = access.GetUserId(user), Action = "AI_SUGGESTION_APPROVED", EntityType = suggestion.SuggestionType.ToString(), EntityId = entityId });
            await db.SaveChangesAsync();
            return Results.Ok(new { entityId });
        }).RequireAuthorization();

        app.MapPost("/api/orgs/{orgId:guid}/reviews/{suggestionId:guid}/reject", async (Guid orgId, Guid suggestionId, RejectRequest req, ClaimsPrincipal user, AppDbContext db, OrganizationAccess access) =>
        {
            var m = await access.GetMembershipAsync(user, orgId);
            if (m is null || !OrganizationAccess.IsAdmin(m.Role)) return Results.Forbid();

            var suggestion = await db.AiSuggestions.FirstOrDefaultAsync(x => x.OrganizationId == orgId && x.Id == suggestionId);
            if (suggestion is null) return Results.NotFound();
            suggestion.Status = ContentStatus.REJECTED;
            var review = await db.Reviews.FirstAsync(x => x.SuggestionId == suggestionId);
            review.Decision = ReviewDecision.REJECTED; review.Note = req.Note; review.ReviewerUserId = access.GetUserId(user); review.ReviewedAt = DateTimeOffset.UtcNow;
            await db.SaveChangesAsync();
            return Results.Ok();
        }).RequireAuthorization();

        return app;
    }

    private static Visibility ParseVisibility(string? raw) =>
        Enum.TryParse<Visibility>(raw, true, out var v) ? v : Visibility.INTERNAL;

    public record TextSourceRequest(string Name, string TextContent);
    public record RejectRequest(string? Note);
    public class StoryProposal { public string? Title { get; set; } public string? Summary { get; set; } public string? Content { get; set; } public string? StoryType { get; set; } public DateTimeOffset? OccurredAt { get; set; } public string? Visibility { get; set; } }
    public class EventProposal { public string? Name { get; set; } public DateTimeOffset? StartDate { get; set; } public string? Content { get; set; } public string? EventType { get; set; } public string? Visibility { get; set; } }
}
