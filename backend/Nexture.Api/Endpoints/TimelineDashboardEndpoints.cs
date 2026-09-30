using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Nexture.Api.Data;
using Nexture.Api.Models;
using Nexture.Api.Services;

namespace Nexture.Api.Endpoints;

public static class TimelineDashboardEndpoints
{
    public static IEndpointRouteBuilder MapTimelineDashboardEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/orgs/{orgId:guid}/timeline", async (Guid orgId, ClaimsPrincipal user, AppDbContext db, OrganizationAccess access) =>
        {
            if (await access.GetMembershipAsync(user, orgId) is null) return Results.Forbid();
            var events = await db.Events.AsNoTracking()
                .Where(x => x.OrganizationId == orgId && x.Status == ContentStatus.VERIFIED)
                .OrderByDescending(x => x.StartDate)
                .Select(x => new { x.Id, x.Name, x.StartDate, x.EndDate, x.Content, x.EventType, visibility = x.Visibility.ToString() })
                .ToListAsync();
            return Results.Ok(events);
        }).RequireAuthorization();

        app.MapGet("/api/orgs/{orgId:guid}/dashboard", async (Guid orgId, ClaimsPrincipal user, AppDbContext db, OrganizationAccess access) =>
        {
            if (await access.GetMembershipAsync(user, orgId) is null) return Results.Forbid();
            var data = new
            {
                stories = await db.Stories.CountAsync(x => x.OrganizationId == orgId),
                events = await db.Events.CountAsync(x => x.OrganizationId == orgId),
                people = await db.People.CountAsync(x => x.OrganizationId == orgId),
                products = await db.ProductsProjects.CountAsync(x => x.OrganizationId == orgId),
                media = await db.MediaAssets.CountAsync(x => x.OrganizationId == orgId),
                pendingReview = await db.Reviews.CountAsync(x => x.OrganizationId == orgId && x.Decision == ReviewDecision.PENDING),
                publicContent = await db.Stories.CountAsync(x => x.OrganizationId == orgId && x.Visibility == Visibility.PUBLIC)
                              + await db.Events.CountAsync(x => x.OrganizationId == orgId && x.Visibility == Visibility.PUBLIC),
                atlasPublished = await db.AtlasPublications.CountAsync(x => x.OrganizationId == orgId && x.Status == AtlasPublicationStatus.PUBLISHED),
                recentActivity = await db.ActivityLogs.AsNoTracking().Where(x => x.OrganizationId == orgId).OrderByDescending(x => x.CreatedAt).Take(10).ToListAsync()
            };
            return Results.Ok(data);
        }).RequireAuthorization();

        app.MapGet("/health", () => Results.Ok(new { status = "ok" })).AllowAnonymous();
        return app;
    }
}
