using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Nexture.Api.Data;
using Nexture.Api.Models;
using Nexture.Api.Services;

namespace Nexture.Api.Endpoints;

public static class OrganizationEndpoints
{
    public static IEndpointRouteBuilder MapOrganizationEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/organizations", async (CreateOrganizationRequest req, ClaimsPrincipal user, AppDbContext db, OrganizationAccess access) =>
        {
            var userId = access.GetUserId(user);
            if (userId is null) return Results.Unauthorized();

            var slugBase = Slugify.From(req.Name);
            var slug = slugBase;
            var suffix = 2;
            while (await db.Organizations.AnyAsync(x => x.Slug == slug)) slug = $"{slugBase}-{suffix++}";

            var org = new Organization
            {
                Name = req.Name,
                Slug = slug,
                FoundedYear = req.FoundedYear,
                Industry = req.Industry,
                EmployeeScale = req.EmployeeScale,
                Website = req.Website,
                ShortDescription = req.ShortDescription,
                FounderName = req.FounderName,
                CoreValues = req.CoreValues,
                AtlasEnabled = true
            };
            db.Organizations.Add(org);
            db.OrganizationMembers.Add(new OrganizationMember
            {
                OrganizationId = org.Id,
                UserId = userId.Value,
                Role = MemberRole.ADMIN
            });
            db.ActivityLogs.Add(new ActivityLog
            {
                OrganizationId = org.Id, UserId = userId, Action = "ORGANIZATION_CREATED",
                EntityType = "ORGANIZATION", EntityId = org.Id
            });
            await db.SaveChangesAsync();
            return Results.Created($"/api/organizations/{org.Id}", org);
        }).RequireAuthorization();

        app.MapGet("/api/organizations/{orgId:guid}", async (Guid orgId, ClaimsPrincipal user, AppDbContext db, OrganizationAccess access) =>
        {
            var membership = await access.GetMembershipAsync(user, orgId);
            if (membership is null) return Results.Forbid();
            var org = await db.Organizations.AsNoTracking().FirstOrDefaultAsync(x => x.Id == orgId);
            return org is null ? Results.NotFound() : Results.Ok(org);
        }).RequireAuthorization();

        app.MapPut("/api/organizations/{orgId:guid}", async (Guid orgId, UpdateOrganizationRequest req, ClaimsPrincipal user, AppDbContext db, OrganizationAccess access) =>
        {
            var membership = await access.GetMembershipAsync(user, orgId);
            if (membership is null || !OrganizationAccess.IsAdmin(membership.Role)) return Results.Forbid();
            var org = await db.Organizations.FirstOrDefaultAsync(x => x.Id == orgId);
            if (org is null) return Results.NotFound();

            org.Name = req.Name ?? org.Name;
            org.LogoUrl = req.LogoUrl ?? org.LogoUrl;
            org.FoundedYear = req.FoundedYear ?? org.FoundedYear;
            org.Industry = req.Industry ?? org.Industry;
            org.EmployeeScale = req.EmployeeScale ?? org.EmployeeScale;
            org.Website = req.Website ?? org.Website;
            org.ShortDescription = req.ShortDescription ?? org.ShortDescription;
            org.FounderName = req.FounderName ?? org.FounderName;
            org.CoreValues = req.CoreValues ?? org.CoreValues;
            if (req.AtlasEnabled.HasValue) org.AtlasEnabled = req.AtlasEnabled.Value;
            org.UpdatedAt = DateTimeOffset.UtcNow;
            await db.SaveChangesAsync();
            return Results.Ok(org);
        }).RequireAuthorization();

        app.MapGet("/api/organizations/{orgId:guid}/members", async (Guid orgId, ClaimsPrincipal user, AppDbContext db, OrganizationAccess access) =>
        {
            var membership = await access.GetMembershipAsync(user, orgId);
            if (membership is null) return Results.Forbid();

            var rows = await (from m in db.OrganizationMembers
                              join u in db.Users on m.UserId equals u.Id
                              where m.OrganizationId == orgId
                              select new { m.Id, u.Email, u.DisplayName, role = m.Role.ToString() })
                              .ToListAsync();
            return Results.Ok(rows);
        }).RequireAuthorization();

        app.MapPost("/api/organizations/{orgId:guid}/members", async (Guid orgId, AddMemberRequest req, ClaimsPrincipal user, AppDbContext db, OrganizationAccess access) =>
        {
            var membership = await access.GetMembershipAsync(user, orgId);
            if (membership is null || !OrganizationAccess.IsAdmin(membership.Role)) return Results.Forbid();

            var email = req.Email.Trim().ToLowerInvariant();
            var target = await db.Users.FirstOrDefaultAsync(x => x.Email == email);
            if (target is null)
            {
                target = new AppUser { Email = email, DisplayName = req.DisplayName ?? email };
                var hasher = new PasswordHasher<AppUser>();
                target.PasswordHash = hasher.HashPassword(target, req.TemporaryPassword ?? "ChangeMe123!");
                db.Users.Add(target);
            }

            if (!Enum.TryParse<MemberRole>(req.Role, true, out var role)) role = MemberRole.VIEWER;
            var exists = await db.OrganizationMembers.AnyAsync(x => x.OrganizationId == orgId && x.UserId == target.Id);
            if (!exists)
                db.OrganizationMembers.Add(new OrganizationMember { OrganizationId = orgId, UserId = target.Id, Role = role });

            await db.SaveChangesAsync();
            return Results.Ok();
        }).RequireAuthorization();

        return app;
    }

    public record CreateOrganizationRequest(
        string Name, int? FoundedYear, string? Industry, string? EmployeeScale,
        string? Website, string? ShortDescription, string? FounderName, string? CoreValues);
    public record UpdateOrganizationRequest(
        string? Name, string? LogoUrl, int? FoundedYear, string? Industry, string? EmployeeScale,
        string? Website, string? ShortDescription, string? FounderName, string? CoreValues, bool? AtlasEnabled);
    public record AddMemberRequest(string Email, string Role, string? DisplayName, string? TemporaryPassword);
}
