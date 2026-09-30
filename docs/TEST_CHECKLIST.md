# MVP V2 Smoke Test Checklist

1. Start clean database: `docker compose down -v && docker compose up --build`.
2. Open `http://localhost:5173/atlas` and confirm seeded NexTure Demo SME appears.
3. Open its public profile; confirm one Story and one Timeline event.
4. Log in with `admin@example.com / ChangeMe123!`.
5. Open Culture Library and create a text source.
6. Run AI Analyze.
7. Open Pending Review and approve STORY + EVENT.
8. Open Culture Atlas management.
9. Confirm approved AI content is VERIFIED but INTERNAL.
10. Click `Chuẩn bị Atlas`; confirm content becomes VERIFIED + PUBLIC.
11. Click `Publish`; confirm publication is PUBLISHED v1.
12. Open Public Atlas; confirm content appears.
13. Edit source Hub entity through API/Swagger or content UI; confirm management marks publication OUTDATED.
14. Click `Publish bản mới`; confirm version increments.
15. Click `Gỡ Atlas`; confirm public content disappears while Hub record remains intact.
16. Confirm `/health` returns OK and Swagger loads.
