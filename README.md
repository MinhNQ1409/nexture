# NexTure MVP V2 — Culture Hub + Culture Atlas

MVP V2 extends the original Culture Hub pilot into the complete controlled publishing flow:

**Login → Culture Hub → Source/Upload → AI Analyze → Admin Review → VERIFIED content → Culture Timeline → Mark PUBLIC → Publish snapshot → Public Culture Atlas**

## What is included

### Culture Hub
- JWT login
- Organization / Culture Hub
- Admin / Editor / Viewer membership model
- Culture Library: text source + binary upload
- Stories
- Events
- People
- Products / Projects
- Generic relationships
- Mock AI structuring service behind `IAiStructuringService`
- Pending Review: Approve / Reject
- Culture Timeline (VERIFIED events)
- Activity log
- Dashboard

### Publishing Layer — new in V2
- `AtlasPublication` snapshot model
- Only `VERIFIED + PUBLIC` Hub content is publishable
- Admin-only **Prepare for Atlas** action for pilot testing
- Publish / republish / unpublish
- Immutable-ish publication snapshot separated from mutable Hub records
- Publication version number
- Detect when Hub content is newer than the currently published snapshot (`isOutdated`)
- Atlas publication activity logging

### Public Culture Atlas — new in V2
- Public Atlas home
- Search companies by name / industry
- Public company culture profile
- Published Culture Stories
- Published Timeline
- Published People
- Published Products / Projects
- Public APIs require no login

## Core publishing rule

`visibility = PUBLIC` does **not** mean the content is already on Culture Atlas.

A record must satisfy:

```text
Hub record
  status = VERIFIED
  visibility = PUBLIC
        ↓
Admin clicks Publish
        ↓
atlas_publications snapshot
  status = PUBLISHED
        ↓
Public Culture Atlas
```

If the Hub record changes later, the public snapshot remains unchanged until Admin explicitly publishes a new version.

## Stack
- React 18 + TypeScript + Vite
- ASP.NET Core 8 Minimal API
- PostgreSQL 16
- EF Core / Npgsql
- Docker Compose

## Run with Docker

Requirements: Docker Desktop.

### Important when upgrading from MVP V1
V1 used `EnsureCreated()`. V2 adds new columns/tables, so remove the old pilot database volume once before first V2 run:

```bash
docker compose down -v
docker compose up --build
```

For a fresh clone:

```bash
docker compose up --build
```

Open:
- Culture Hub: http://localhost:5173
- Public Culture Atlas: http://localhost:5173/atlas
- Swagger: http://localhost:8080/swagger
- Health: http://localhost:8080/health

Demo account:
- Email: `admin@example.com`
- Password: `ChangeMe123!`

The seed also creates one public Story and one public Event so Culture Atlas is not empty on first run.

## Demo V2 flow

1. Sign in to Culture Hub.
2. Add a source in **Culture Library**.
3. Click **AI Analyze**.
4. Approve suggestions in **Pending Review**.
5. Open **Culture Atlas** in the Hub sidebar.
6. For content not yet public, click **Chuẩn bị Atlas** (Admin confirmation in this pilot).
7. Click **Publish**.
8. Open **Public Culture Atlas**.
9. Edit the Hub record later: Atlas shows the previous snapshot and Hub management marks it `OUTDATED`.
10. Click **Publish bản mới** to create the next public version, or **Gỡ Atlas** to unpublish it.

## Main API additions in V2

Authenticated Hub APIs:

```text
GET  /api/orgs/{orgId}/atlas
POST /api/orgs/{orgId}/content/{entityType}/{id}/prepare-atlas
POST /api/orgs/{orgId}/atlas/publish
POST /api/orgs/{orgId}/atlas/publications/{publicationId}/unpublish
```

Public Atlas APIs:

```text
GET /api/atlas/organizations?q=
GET /api/atlas/{organizationSlug}
GET /api/atlas/{organizationSlug}/{entityType}/{publicationSlug}
```

## Data model added in V2

`AtlasPublication` stores:
- `OrganizationId`
- `EntityType`
- `EntityId`
- `Status`
- `Slug`
- published title / summary / content / media
- event date
- complete `SnapshotJson`
- source record `UpdatedAt`
- publication `Version`
- `PublishedByUserId`
- `PublishedAt`
- `UnpublishedAt`

Unique publication source key:

```text
(OrganizationId, EntityType, EntityId)
```

This makes one Atlas publication identity per Hub entity while preserving successive versions through snapshot replacement + version increment for MVP speed.

## Known pilot limitations

The project is intentionally optimized for fastest Pilot delivery, not production completeness:
- `EnsureCreated()` instead of EF migrations.
- Local uploaded-file storage instead of object storage.
- Mock AI instead of a live AI provider.
- Binary PDF/DOCX text extraction not implemented yet.
- `Prepare for Atlas` combines verification + public visibility into one Admin action for pilot speed.
- Publication version history is not retained as separate rows yet; V2 keeps the latest snapshot + version number.
- No semantic search, recommendation engine, social features, analytics, map visualization, or mobile app.

Before production: add EF migrations, object storage, malware scanning, rate limiting, real AI provider, source evidence/citations, separate verification/publishing permissions, publication version history, backups and audit hardening.

## AI replacement

Implement a real provider without changing Review/Atlas code:

```csharp
public class RealAiStructuringService : IAiStructuringService
{
    public Task<IReadOnlyList<AiProposal>> AnalyzeAsync(SourceRecord source, CancellationToken ct = default)
    {
        // Call provider and return typed proposals.
    }
}
```

Then replace DI registration in `Program.cs`.
