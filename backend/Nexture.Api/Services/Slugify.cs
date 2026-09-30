using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace Nexture.Api.Services;

public static class Slugify
{
    public static string From(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return "item";
        var normalized = value.Trim().ToLowerInvariant().Normalize(NormalizationForm.FormD);
        var sb = new StringBuilder();
        foreach (var c in normalized)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
                sb.Append(c);
        }
        var raw = sb.ToString().Normalize(NormalizationForm.FormC)
            .Replace('đ', 'd');
        raw = Regex.Replace(raw, "[^a-z0-9]+", "-").Trim('-');
        return string.IsNullOrWhiteSpace(raw) ? "item" : raw;
    }
}
