# MoveMate: Project Spec

Hackathon project. Demo is a recorded video running on localhost. Single user, no auth, no deployment.

## 1. The problem

Renters can't prove what condition an apartment was in when they moved in, so they risk being blamed (and losing deposit) for pre-existing damage when they move out.

## 2. The product

MoveMate guides a renter through the move in five phases, shown as a stepper. AI compares "before" photos (listing or viewing) with "move-in" photos room by room, the user confirms or corrects every result, and MoveMate produces a dated report the user can give the landlord as proof.

Business goal: the final phase connects the user to providers they need after moving. If home insurance is highlighted, with a discount for MoveMate users.

## 3. User flow

- **/design page** (built first, before any other UI)
  - Living design system: color tokens, typography scale, spacing, and every shadcn component and custom component the app uses (buttons, inputs, cards, badges, stepper, photo uploader, finding row, provider card, empty/loading/error states)
  - Shows each component in its states (default, hover, disabled, loading, error)
  - Every new component gets added here in the same slice it is built
  - Purpose: one place to review what the frontend is using and spot inconsistencies
- **Landing page**: hero only, nothing else
  - Creative interactive background (e.g. canvas that reacts to the cursor), lightweight, respects `prefers-reduced-motion`, no heavy 3D libraries
  - One clear, compact headline + one short line explaining what MoveMate does (document your move-in, get proof for your landlord)
  - One CTA ("Start my move") to the main app
  - The main app after the landing page uses shadcn components styled with the tokens from /design
- **Phase 1: Prepare** (templated, no AI)
  - Common move-in checklist. Each item gets an answer: Yes, No or N/A (persisted; no answer is "pending"). Handled = Yes or N/A. Pressing the active answer again resets it to pending.
  - The checklist is a side panel in every phase (a "Checklist (5 of 8)" drawer below the lg breakpoint). It never blocks a phase or the Continue button.
  - **Linked items**: electricity, internet and home insurance are checklist items linked to the provider categories (`linkedCategory`; one constant map category to item key, `linkedItemKeys`). They sit in a "Settle in" group at the bottom ("Utilities" is now "Admin"). Existing keys `set-up-electricity` and `set-up-internet` are reused, so saved answers survive; `get-home-insurance` is new.
  - **Locked rule**: while `moves.phase` is before `settle_in`, linked items are `locked`. The server rejects PATCH on them with 409 `invalid_phase_transition` ("Available once you reach Settle in"). Locked rows are greyed with disabled answers and the visible hint "You can choose this later in Settle in"; saved answers still show. Once unlocked, a linked row shows a "Choose in Settle in" link and the chosen provider name. The user may still answer N/A manually (for example electricity included in the rent).
  - Move planning tips
- **Stepper completion**: a phase shows complete (green check), attention (amber warning with an accessible label), locked or upcoming, derived from data. Prepare is complete only when every non-linked checklist item is handled (linked items are ignored, since they are only answerable in Settle in; the panel counter, collapsed bar and drawer badge still count all items). If the user moved past it with items still pending or answered No, it shows attention ("3 items still open"). Attention never blocks navigation. Other phases keep their order-based behavior for now.
- **Phase 2: Before photos**
  - Upload listing/viewing photos in one place, label each by room
  - AI analyzes them per room and produces "what to check on move-in day"
  - User can add their own checks
- **Phase 3: Move-in photos**
  - Upload photos again, labeled by room
  - AI compares before vs move-in per room, producing findings: `looks_good` / `changed` / `unclear`
  - User resolves each finding: confirm OK, confirm issue, or write a custom answer
- **Phase 4: Report** (main user value)
  - Issues with before/after photos, timestamps, user notes, plus a 30-day watch list
  - Print-friendly page, saved as PDF via browser print
  - Report is a frozen snapshot at generation time
- **Phase 5: Settle in** (business value, templated)
  - Providers by category: electricity, internet, home insurance
  - Short explanation of why home insurance matters when moving in
  - If highlighted: "MoveMate users get a discount with If." Button links to `IF_INSURANCE_URL`
  - Other providers listed by name only. No prices anywhere.
  - **Sync with the Move checklist** (in guidance): saving a provider sets the linked item to `done`; clearing it sets the item back to `pending` only if it is `done` (N/A and No stay). A manual answer wins: if the item is N/A, selecting a provider still saves the choice but the item stays N/A, and Settle in shows "Marked N/A in your Move checklist" on that category.
- **Summary**: shows a checklist reminder first. "Still open" lists pending and No items with the same Yes / No / N/A control so the user can answer there. "Handled" (Yes and N/A) is a collapsed group. Print shows every item with its status and no controls.

## 4. Stack

- Frontend: React + TypeScript + Vite, Tailwind, shadcn/ui, React Router, TanStack Query, lucide-react
- Backend: Node.js + Express + TypeScript
- Validation: Zod (requests, env, AI output)
- DB: PostgreSQL 16 in Docker Compose (named volume), Drizzle ORM + drizzle-kit migrations
- Uploads: multer (memory storage, size limit) + sharp (rotate, resize max 1600px, strip EXIF, re-encode to JPEG)
- AI: OpenRouter chat completions, one vision model from env, JSON schema output where supported, always Zod-validated
- Tests: Vitest + Supertest (backend), AI client mocked

## 5. Architecture

DDD for modeling and naming. Layered code inside each context.

### Bounded contexts

- **move**: the move (address, date) and its current phase
- **guidance**: templated checklist, planning tips, providers. Templates live in code, only progress is stored.
- **photos**: upload, room label, stage (before / move_in), private storage, file streaming
- **inspection**: baseline analysis (room checks), comparison (findings), user resolutions
- **report**: builds a frozen snapshot from resolved findings + photos
- **contract** (STRETCH, not built until all phases work): lease analysis

### Layering per context

`routes -> controller -> service -> repository`, plus `schemas.ts` (Zod) and `types.ts`.

- Routes: wire paths and middleware only
- Controllers: parse with Zod, call service, shape response. No business logic.
- Services: business rules and domain events
- Repositories: Drizzle queries only

### Rules

- A context may call another context's **service**, never its repository or tables
- Dependencies flow one way: `inspection -> photos, move` and `report -> inspection, photos, guidance, move`. `guidance` depends on `move` only.
- Domain events are names for state changes (`MoveCreated`, `BeforePhotosAnalyzed`, `MoveInCompared`, `FindingResolved`, `ReportGenerated`, `ProviderLinkOpened`). They drive phase transitions on the move. No event bus.
- Phase transitions are validated in `move` service (e.g. cannot compare without move-in photos). Stepper allows going back to any reached phase.

### Folder structure

```
movemate/
  apps/
    api/src/
      app.ts, server.ts, env.ts
      db/ (client.ts, schema/ per context, migrations/)
      shared/ (errors.ts, error-handler.ts, validate.ts, ai/openrouter.client.ts)
      contexts/
        move/ guidance/ photos/ inspection/ report/
          *.routes.ts *.controller.ts *.service.ts *.repository.ts *.schemas.ts *.types.ts
          __tests__/
    web/src/
      app/ (router, providers)
      pages/ (landing, design, move shell)
      features/ (prepare, before-photos, move-in, report, settle-in)
      components/ (shared ui, stepper, photo-uploader)
      lib/ (api client)
  packages/contracts/ (shared Zod schemas + inferred types)
  docker-compose.yml, .env.example, docs/
```

## 6. Data model

- **moves**: id, address, move_date (nullable), phase (`prepare | before_photos | move_in | report | settle_in`), created_at, updated_at
- **guidance_progress**: id, move_id, item_key, status (`pending | done | no | na`; a missing row means `pending`), updated_at
- **photos**: id, move_id, stage (`before | move_in`), room, file_path, width, height, created_at
- **room_checks**: id, move_id, room, text, source (`ai | user`), created_at
- **findings**: id, move_id, room, room_check_id (nullable), ai_status (`looks_good | changed | unclear`), ai_summary, confidence (`low | medium | high`), resolution (`pending | ok | issue | custom`), user_note, created_at, updated_at
- **finding_photos**: finding_id, photo_id
- **reports**: id, move_id, snapshot (jsonb), generated_at

Rooms enum: `kitchen | living_room | bedroom | bathroom | hallway | balcony | other`.

Single user: the app works on the most recent move (`GET /api/moves/current`).

## 7. API

All under `/api`. Success `{ data }`, error `{ error: { code, message } }`.

- `GET /health`
- move: `POST /moves`, `GET /moves/current`, `POST /moves/:id/advance`
- guidance: `GET /guidance/prepare`, `GET /guidance/providers`, `GET /moves/:id/guidance` (every template item with its status, `linkedCategory`, `locked` and `providerName` for linked items), `PATCH /moves/:id/guidance/:itemKey` (body `{ status }`, upsert; 404 unknown move or key, 400 invalid status, 409 for a locked linked item). `PUT /moves/:id/providers/selection/:category` also updates the linked checklist item (sync rule above)
- photos: `POST /moves/:id/photos` (multipart: file, stage, room), `GET /moves/:id/photos?stage=`, `PATCH /photos/:id` (relabel), `DELETE /photos/:id`, `GET /photos/:id/file`
- inspection: `POST /moves/:id/inspection/baseline`, `GET /moves/:id/room-checks`, `POST /moves/:id/room-checks`, `POST /moves/:id/inspection/compare`, `GET /moves/:id/findings`, `PATCH /findings/:id`
- report: `POST /moves/:id/reports`, `GET /reports/:id`, `GET /moves/:id/summary` (also returns the live checklist split into open and handled)

Status codes: 400 validation, 404 missing, 409 invalid phase transition, 413 upload too large, 502 AI failure, 500 unexpected. Never return stack traces or upstream payloads.

## 8. AI

Two jobs, both with the vision model.

- **Baseline**: before photos of one room (max 4) -> list of checks for move-in day
- **Compare**: before + move-in photos of one room (max 4 each) + that room's checks -> findings

Rules for both prompts:

- Describe only what is visible. Cautious language ("a mark may be visible", "check whether").
- Never claim the room is safe, clean, or damage-free. Never infer fault, liability, or insurance coverage.
- Different angles and lighting are expected. Prefer `unclear` over guessing `changed`.
- Return only JSON matching the schema.

Reliability: timeout from env, one retry on invalid JSON, then fail with 502 and let the user add checks / resolve findings manually. Log model id and duration, never image data.

## 9. Code quality rules

- TypeScript strict, no `any`, no unexplained `!` assertions
- Env validated with Zod at startup, app refuses to start if invalid
- One central error handler, services throw typed `AppError`s
- Small functions, descriptive names, no dead code, no commented-out code
- Every slice ships with tests for its services and routes
- Only build the current slice. Never build ahead.
- Frontend: no one-off styling. Use tokens and components from /design, and register any new component there.
- End of every slice: typecheck, lint, tests pass, then a short self-review listing shortcuts taken

## 10. Slices

- **Slice 0: Foundation + /design + landing**
  - Monorepo, Docker Postgres, Drizzle, env validation, error handler, `/health`
  - /design page with tokens and base shadcn components (built before the landing page)
  - Landing page: interactive background, hero line, CTA
  - Done when: /design shows the component set, landing CTA opens an empty move shell, health shows DB connected
- **Slice 1: Move + Phase 1 Prepare**
  - Create move, stepper shell, templated checklist + tips, persisted ticks
  - Done when: create move, tick items, refresh, ticks remain
- **Slice 2: Photo upload + labeling**
  - Multi-upload, room label per photo, relabel, delete, private file route. Reusable for both stages.
  - Done when: upload 5 photos, label them, refresh, all there
- **Slice 3: Phase 2 baseline analysis**
  - AI checks per room, user can add checks, manual fallback on failure
  - Done when: before photos produce a per-room check list
- **Slice 4: Phase 3 compare + resolve**
  - Move-in photos, AI findings per room, resolve with OK / issue / custom note
  - Done when: the planted difference is flagged and resolvable
- **Slice 5: Phase 4 report**
  - Snapshot, report page, print CSS, 30-day watch list
  - Done when: browser print produces a clean PDF
- **Slice 6: Phase 5 settle in**
  - Providers page, If highlight + discount line + external link, no prices
  - Done when: If button opens the configured URL
- **Slice 7: Demo hardening**
  - Seed script with demo move + photos, loading/error states, visual polish, rehearse recording
- **Stretch Slice 8: Contract analysis**
  - Upload lease PDF, AI flags clauses about deposit, damage responsibility, notice periods. Own `contract` context.

## 11. Demo data

- Stock photos from free-license sources for the landing page
- Before/after room photos must show the **same room**, which stock sites don't provide. Shoot one real room twice with one planted change (moved item, removable mark), or edit a copy of a stock photo.

## 12. Out of scope

Auth, deployment, mover marketplace, real insurance quotes or prices, legal or coverage determinations, event bus, vector DB, agent frameworks, mobile app.

## 13. Env

```
NODE_ENV=development
PORT=3000
FRONTEND_ORIGIN=http://localhost:5173
DATABASE_URL=postgresql://movemate:change_me@localhost:5432/movemate
POSTGRES_PASSWORD=change_me
OPENROUTER_API_KEY=replace_me
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_VISION_MODEL=provider/model-id
OPENROUTER_TIMEOUT_MS=45000
UPLOAD_DIR=./private-uploads
MAX_UPLOAD_MB=8
IF_INSURANCE_URL=replace_me
```
