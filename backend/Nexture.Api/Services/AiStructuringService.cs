using System.Text.Json;
using Nexture.Api.Models;

namespace Nexture.Api.Services;

public record AiProposal(EntityType Type, object Payload);

public interface IAiStructuringService
{
    Task<IReadOnlyList<AiProposal>> AnalyzeAsync(SourceRecord source, CancellationToken ct = default);
}

// Runs without any external AI dependency, so the whole MVP workflow works immediately.
// Replace this service with a real provider later without changing review/content endpoints.
public class MockAiStructuringService : IAiStructuringService
{
    public Task<IReadOnlyList<AiProposal>> AnalyzeAsync(SourceRecord source, CancellationToken ct = default)
    {
        var baseName = string.IsNullOrWhiteSpace(source.Name) ? "Nguồn dữ liệu" : source.Name;
        var text = source.TextContent ?? "";

        var story = new
        {
            title = $"Câu chuyện từ {baseName}",
            summary = text.Length > 180 ? text[..180] + "…" : text,
            content = text,
            storyType = "COMPANY_STORY",
            occurredAt = DateTimeOffset.UtcNow,
            visibility = "INTERNAL"
        };

        var ev = new
        {
            name = $"Cột mốc từ {baseName}",
            startDate = DateTimeOffset.UtcNow,
            content = text.Length > 300 ? text[..300] + "…" : text,
            eventType = "MILESTONE",
            visibility = "INTERNAL"
        };

        IReadOnlyList<AiProposal> proposals = new[]
        {
            new AiProposal(EntityType.STORY, story),
            new AiProposal(EntityType.EVENT, ev)
        };
        return Task.FromResult(proposals);
    }
}

public static class JsonDefaults
{
    public static readonly JsonSerializerOptions Options = new(JsonSerializerDefaults.Web)
    {
        PropertyNameCaseInsensitive = true
    };
}
