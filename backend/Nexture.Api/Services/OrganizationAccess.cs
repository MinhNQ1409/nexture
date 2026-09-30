using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Nexture.Api.Data;
using Nexture.Api.Models;

namespace Nexture.Api.Services;

public class OrganizationAccess(AppDbContext db)
{
    public Guid? GetUserId(ClaimsPrincipal user)
    {
        var raw = user.FindFirstValue(ClaimTypes.NameIdentifier) ?? user.FindFirstValue("sub");
        return Guid.TryParse(raw, out var id) ? id : null;
    }

    public async Task<OrganizationMember?> GetMembershipAsync(ClaimsPrincipal user, Guid organizationId)
    {
        var userId = GetUserId(user);
        if (userId is null) return null;
        return await db.OrganizationMembers.AsNoTracking()
            .FirstOrDefaultAsync(x => x.OrganizationId == organizationId && x.UserId == userId);
    }

    public static bool CanEdit(MemberRole role) => role is MemberRole.ADMIN or MemberRole.EDITOR;
    public static bool IsAdmin(MemberRole role) => role == MemberRole.ADMIN;
}
