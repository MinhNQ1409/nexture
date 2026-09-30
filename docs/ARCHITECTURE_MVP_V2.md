# NexTure MVP V2 Architecture

## End-to-end flow

```mermaid
flowchart LR
    A[Culture Library / Manual Entry] --> B[AI Structuring]
    B --> C[AI Suggestion]
    C --> D[Admin Review]
    D -->|Approve| E[VERIFIED Hub Entity]
    D -->|Reject| X[REJECTED]
    E --> F[Culture Timeline / Hub]
    E --> G[Set PUBLIC]
    G --> H[Admin Publish]
    H --> I[AtlasPublication Snapshot]
    I --> J[Public Culture Atlas]
    E -->|Edit later| K[Hub New Version]
    K --> L{Snapshot outdated?}
    L -->|Yes| M[Admin Republish]
    M --> I
```

## Data ownership

```mermaid
erDiagram
    ORGANIZATIONS ||--o{ STORIES : owns
    ORGANIZATIONS ||--o{ EVENTS : owns
    ORGANIZATIONS ||--o{ PEOPLE : owns
    ORGANIZATIONS ||--o{ PRODUCTS_PROJECTS : owns
    ORGANIZATIONS ||--o{ MEDIA_ASSETS : owns
    ORGANIZATIONS ||--o{ SOURCES : owns
    ORGANIZATIONS ||--o{ AI_SUGGESTIONS : owns
    ORGANIZATIONS ||--o{ REVIEWS : owns
    ORGANIZATIONS ||--o{ ATLAS_PUBLICATIONS : publishes

    STORIES ||--o| ATLAS_PUBLICATIONS : snapshot_source
    EVENTS ||--o| ATLAS_PUBLICATIONS : snapshot_source
    PEOPLE ||--o| ATLAS_PUBLICATIONS : snapshot_source
    PRODUCTS_PROJECTS ||--o| ATLAS_PUBLICATIONS : snapshot_source
```

`ATLAS_PUBLICATIONS` uses polymorphic `EntityType + EntityId`, so the four lines above are logical relationships rather than database foreign keys.

## Atlas publication state

```mermaid
stateDiagram-v2
    [*] --> PUBLISHED: Admin Publish VERIFIED + PUBLIC
    PUBLISHED --> PUBLISHED: Republish new Hub version
    PUBLISHED --> UNPUBLISHED: Admin Unpublish
    UNPUBLISHED --> PUBLISHED: Admin Publish again
```

## Key invariant

Public Atlas APIs never query mutable Stories/Events/People/Products directly for public content. They only read `AtlasPublications` where `Status = PUBLISHED`.

This preserves explicit human publishing control.
