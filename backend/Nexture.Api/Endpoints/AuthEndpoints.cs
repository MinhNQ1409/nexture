using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Nexture.Api.Data;
using Nexture.Api.Models;
using Nexture.Api.Services;

namespace Nexture.Api.Endpoints;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/auth/login", async (LoginRequest request, AppDbContext db, JwtService jwt) =>
        {
            var user = await db.Users.FirstOrDefaultAsync(x => x.Email == request.Email.ToLower());
            if (user is null) return Results.Unauthorized();

            var hasher = new PasswordHasher<AppUser>();
            var result = hasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
            if (result == PasswordVerificationResult.Failed) return Results.Unauthorized();

            var memberships = await db.OrganizationMembers
                .Where(x => x.UserId == user.Id)
                .Select(x => new { x.OrganizationId, role = x.Role.ToString() })
                .ToListAsync();

            return Results.Ok(new
            {
                token = jwt.Create(user),
                user = new { user.Id, user.Email, user.DisplayName },
                memberships
            });
        }).AllowAnonymous();

        return app;
    }

    public record LoginRequest(string Email, string Password);
}
