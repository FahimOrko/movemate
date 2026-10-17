# MoveMate build plan

One slice per session. Each slice lists only what it adds. Where a later slice extends a file, it says so. Scope source of truth: `docs/SPEC.md`.

## Cross-cutting: phase model (move context)
- Phase order: `prepare < before_photos < move_in < report < settle_in`. `moves.phase` is the **furthest phase unlocked**. The stepper lets the user open any phase up to it.
- `advance(moveId)`: the user's "Continue". Allowed from `prepare`, `before_photos` (also the manual path when AI fails) and `report`. From `move_in` it returns 409 "Generate the report to continue". From `settle_in` it returns 409.
- `applyEvent(moveId, event)`: one table, with a row added in the slice that raises the event:

  | Event | Raised by | Requires phase ≥ | Unlocks |
  |---|---|---|---|
  | MoveCreated | move (create) | (none) | prepare |
  | BeforePhotosAnalyzed | inspection baseline | before_photos | move_in |
  | MoveInCompared | inspection compare | move_in | (none) |
  | FindingResolved | inspection resolve | move_in | (none) |
  | ReportGenerated | report | move_in | report |

  A failed requirement is 409 `invalid_phase_transition`. Unlocking never moves the phase backwards.
- `assertPhaseReached(moveId, phase)` guards actions, for example uploading move-in photos.
- Guards that need another context's data live in that context. Examples: inspection returns 409 when comparing without move-in photos; report returns 409 while findings are still pending.

---

## Slice 0: Foundation + /design + landing
**Root:** `package.json` (scripts: dev, check, typecheck, lint, test, db:up, db:generate, db:migrate), `pnpm-workspace.yaml`, `tsconfig.base.json`, `eslint.config.js` (typescript-eslint strict, react-hooks, react-refresh), `docker-compose.yml` (postgres:16-alpine, `5433:5432`, named volume, healthcheck), `docker/postgres-init/01-test-db.sql` (creates `movemate_test`), `.env.example`, `CLAUDE.md`, `docs/PLAN.md`.
**Contracts:** `packages/contracts/{package.json,tsconfig.json,src/index.ts,src/api.ts}`: error envelope and health schemas.
**API:** `src/env.ts` (`parseEnv` + `env`; vars NODE_ENV, PORT, DATABASE_URL), `src/db/client.ts` (pg Pool + drizzle, `pingDatabase()`), `src/shared/errors.ts` (`AppError`, code→status map: validation_error, not_found, db_unavailable(503), internal_error), `src/shared/error-handler.ts` (AppError → its status; ZodError → 400; else 500 with a generic message, logged), `src/app.ts` (`createApp`: json, `/api/health`, `/api` 404, error handler), `src/server.ts`, `drizzle.config.ts`, `vitest.config.ts`.
**Tables / migrations:** none. Drizzle is wired; the first migration comes in Slice 1.
**Endpoints:** `GET /api/health` returns `200 { data: { status: "ok", db: "connected" } }`, or 503 `db_unavailable`.
**Web:** Vite + React + TS + Tailwind v4 + shadcn init; `vite.config.ts` (alias `@`, proxy `/api` to `PORT`); `src/app/router.tsx` (`/`, `/design`, `/move`); `src/index.css` (tokens: color, type scale, radius, fonts); `pages/design/design-page.tsx`; `pages/landing/landing-page.tsx`; `pages/move-shell/move-shell-page.tsx` (empty state only); `components/interactive-background.tsx` (2D canvas, cursor-reactive, static frame under reduced motion, DPR-aware, rAF only while animating).
**shadcn components:** button, input, label, card, badge, alert, skeleton, spinner, empty. /design shows tokens, type scale, spacing, each component in its states, and the background preview.
**Tests:** `shared/__tests__/error-handler.test.ts` (AppError, ZodError, unknown error without leaking the message or stack), `__tests__/env.test.ts` (rejects missing or invalid vars, coerces PORT), `__tests__/app.test.ts` (health connected against the test DB, 503 when the ping is mocked to fail, unknown `/api` route returns a 404 envelope).
**Done when:** /design shows the component set; the landing CTA opens the empty move shell; `GET /api/health` shows `db: "connected"`; `pnpm check` is green.

## Slice 1: Move + Phase 1 Prepare
**Contracts:** `move.ts` (phase enum, Move DTO, CreateMove `{ address 1..200, moveDate? ISO date }`), `guidance.ts` (checklist item, tip, progress, `{ completed: boolean }`).
**DB:** `db/schema/move.ts` (moves), `db/schema/guidance.ts` (guidance_progress, FK cascade, unique (move_id, item_key)); migration `0000`.
**API:** `contexts/move/*` (create, getCurrent, getById, advance, applyEvent with the MoveCreated row, assertPhaseReached); `contexts/guidance/*` + `guidance.templates.ts` (about 8 checklist items, about 4 tips); errors.ts adds `invalid_phase_transition` (409); test infra `src/test/global-setup.ts` (migrate the test DB) and `src/test/db.ts` (`truncateAll`); lint rule `no-restricted-imports` blocking `../*/*.repository`.
**Endpoints:** `POST /moves` 201; `GET /moves/current` (`{ data: null }` when there is no move); `POST /moves/:id/advance`; `GET /guidance/prepare`; `GET /moves/:id/guidance`; `PATCH /moves/:id/guidance/:itemKey` (upsert; 404 for an unknown key or move).
**Web:** `app/providers.tsx` (QueryClient), `lib/api.ts` (unwraps `{ data }`, throws `ApiError` for `{ error }`), routes `/move` and `/move/:phase` (a locked phase redirects to the current one), `components/stepper.tsx`, `pages/move-shell` (CreateMoveForm when there is no move, otherwise stepper + outlet), `features/prepare/*` (checklist with persisted ticks, tips, Continue). Add Checkbox, Stepper and the form fields to /design.
**Tests:** move.service (create, getCurrent returns the latest, advance rules incl. 409s, applyEvent never moves backwards); move routes (201/400/null/409); guidance routes (templates, toggle persists, 404 for an unknown key).
**Done when:** create a move, tick items, refresh, and the ticks remain.

## Slice 2: Photo upload + labeling
**Contracts:** `photos.ts` (room enum, stage enum, Photo DTO with `url`, relabel `{ room }`).
**DB:** `db/schema/photos.ts`; migration `0001`.
**API:** `contexts/photos/*`; multer (memory, `fileSize = MAX_UPLOAD_MB`, one file per request; jpeg/png/webp); sharp pipeline (`rotate()`, fit inside 1600, JPEG; metadata dropped by default); file at `UPLOAD_DIR/<moveId>/<uuid>.jpg`, relative path stored, file unlinked if the insert fails; `sendFile` limited to UPLOAD_DIR; stage guard via `move.assertPhaseReached` (before needs ≥ before_photos, move_in needs ≥ move_in); delete returns 409 once phase ≥ report (protects the frozen report). env: UPLOAD_DIR, MAX_UPLOAD_MB. errors: `payload_too_large` (413), multer's limit error mapped in the handler.
**Endpoints:** `POST /moves/:id/photos`, `GET /moves/:id/photos?stage=`, `PATCH /photos/:id`, `DELETE /photos/:id`, `GET /photos/:id/file`.
**Web:** `components/photo-uploader.tsx` (per-room add, multi-file parallel upload, thumbnails with a room select and delete, `stage` prop), `components/photo-thumbnail.tsx`. Mounted in `features/before-photos` (upload only for now). Add Select, PhotoUploader and PhotoThumbnail to /design.
**Tests:** service (an EXIF-rotated test image comes out upright, ≤1600, no EXIF); routes (201, 400 bad room/stage/non-image, 413 over the limit, list by stage, relabel, delete removes the file, file streams `image/jpeg`, 404s, 409 stage guard). The test UPLOAD_DIR is a temp dir.
**Done when:** upload 5 photos, label them, refresh, and all are there.

## Slice 3: Phase 2 baseline analysis
**Contracts:** `inspection.ts` (RoomCheck DTO, add check `{ room, text 1..300 }`).
**DB:** `db/schema/inspection.ts` (room_checks); migration `0002`.
**API:** `shared/ai/openrouter.client.ts` (`completeJson({ system, text, images, schema })`: base64 JPEG data URLs, `response_format: json_schema` from `z.toJSONSchema`, `provider.require_parameters: true`, `AbortSignal.timeout`, one retry on invalid JSON, otherwise `AppError('ai_failure')` 502, logs model and duration). `contexts/inspection/*` + `inspection.prompts.ts` (rules from SPEC §8). Baseline: before photos grouped by room (first 4 each), rooms analyzed one after another, rooms that succeed are kept and failed rooms are returned; replaces `source=ai` checks and keeps user checks; raises BeforePhotosAnalyzed. env: OPENROUTER_API_KEY and OPENROUTER_VISION_MODEL (both optional; without them AI routes return 503 `ai_not_configured`), OPENROUTER_TIMEOUT_MS. No `provider.require_parameters`, no base URL var. photos.service exposes `listByStage` and `readFile`.
**Endpoints:** `POST /moves/:id/inspection/baseline`, `GET /moves/:id/room-checks`, `POST /moves/:id/room-checks`, `DELETE /room-checks/:id`.
**Web:** `features/before-photos` (uploader, Analyze button with long-running loading state, checks per room, add-check form, 502 Alert explaining manual fallback, Continue). Add RoomCheckList and the error and loading states to /design.
**Tests:** openrouter.client with fetch stubbed (valid; invalid then valid; invalid twice gives 502; timeout gives 502; no image data in logs); inspection.service with the client mocked (grouping, max 4, keeps user checks, no partial writes on failure, raises event); routes (200, 409 before phase, 502, add check 201/400).
**Done when:** before photos produce a per-room check list.

## Slice 4: Phase 3 compare + resolve
**Contracts:** Finding DTO (with before and move-in photo urls), resolve schema (discriminated: `ok` | `issue` with optional note | `custom` with a required note).
**DB:** `findings`, `finding_photos` (cascade on both FKs) in `db/schema/inspection.ts`; migration `0003`.
**API:** compare in inspection.service: assert ≥ move_in; 409 when no room has both before and move-in photos; per room (max 4 + 4, plus that room's checks) the AI returns findings with photo indexes, which are mapped to ids and out-of-range indexes dropped; findings for the move are replaced in one transaction; raises MoveInCompared. Resolve raises FindingResolved.
**Endpoints:** `POST /moves/:id/inspection/compare`, `GET /moves/:id/findings`, `PATCH /findings/:id`.
**Web:** `features/move-in` (uploader for stage move_in, a Compare button labeled "Re-run comparison (clears your answers)" once findings exist, `components/finding-row.tsx` with before/after thumbnails, status badge, confidence and resolve controls, a resolved counter). Add FindingRow and the status badges to /design.
**Tests:** compare (index mapping, 409 without move-in photos, replaces old findings, 502 leaves findings untouched); resolve (custom needs a note, 404, sets updated_at); routes.
**Done when:** the planted difference in the demo photos is flagged and can be resolved.

## Slice 5: Phase 4 report
**Contracts:** `report.ts` (ReportSnapshot: move info, generatedAt, issues with before/after photo refs + upload times + notes, all findings by room, watch list, disclaimer).
**DB:** `db/schema/report.ts` (reports); migration `0004`.
**API:** `contexts/report/*`. Generate: zero issues is allowed (no findings, or all `ok`, gives a report that says "No issues recorded"); 409 only while any finding is pending or the move has no move-in photos; builds the snapshot through the inspection, photos and move services; inserts; raises ReportGenerated. Watch list = `unclear` findings + `custom` notes + 5 templated items (heating, leaks, ventilation/mold, windows/doors, appliances), due at moveDate (or generatedAt) + 30 days.
**Endpoints:** `POST /moves/:id/reports`, `GET /reports/:id`, `GET /moves/:id/reports/latest` (added; see risk 3).
**Web:** the Move-in screen gets a "Generate report" button, enabled when no findings are pending; it calls `POST /moves/:id/reports` and opens the Report phase. `features/report` (Generate/Regenerate, report view, "Print / Save as PDF" calling `window.print()`, Continue), print CSS (`@media print`: hide app chrome, `break-inside: avoid` per issue, sized images). Add the ReportIssue block to /design.
**Tests:** snapshot builder (only issue/custom in issues, watch-list date math, disclaimer present); the snapshot stays the same after a finding is edited; 409 while findings are pending; GET 404; latest; zero-issue report works; 409 without move-in photos; photo delete 409 after the report.
**Done when:** browser print produces a clean PDF.

## Slice 6: Phase 5 settle in
**Contracts:** providers (category: electricity, internet or home_insurance; provider name, highlighted, url?). No price fields.
**API:** `guidance.templates.ts` gains providers and the insurance explainer; `GET /guidance/providers` (If highlighted, `url = env.IF_INSURANCE_URL`). env: IF_INSURANCE_URL (URL).
**Web:** `features/settle-in` (insurance explainer, `components/provider-card.tsx` with a highlighted variant, the discount line, and a button that is an `<a target="_blank" rel="noopener noreferrer">`; other providers listed by name). Add ProviderCard to /design.
**Tests:** providers route (If is highlighted with the env URL, only If is highlighted, no price-like fields).
**Done when:** the If button opens the configured URL.

## Checklist upgrade
**Contracts:** `guidance.ts`: `checklistStatuses` (`pending | done | no | na`), `isHandled(status)` (done or na); `guidanceProgressSchema` is now the template item plus `status`; `setProgressSchema` is `{ status }`. `reportSummarySchema` gains `checklist: { open, handled }`.
**DB:** `guidance_progress.completed` replaced by `status` (text, default `pending`). Migration `0006_checklist_status` adds `status`, backfills `completed = true` to `done` (false stays `pending`), then drops `completed`.
**API:** `GET /moves/:id/guidance` returns every template item with its status (pending when there is no row). `PATCH /moves/:id/guidance/:itemKey` takes `{ status }` (upsert; 404 unknown move or key; 400 invalid status). `report.getSummary` reads the live checklist through `guidance.service` (new dependency report to guidance) and `buildSummary` splits open (pending, no) from handled (done, na).
**Web:** the checklist leaves the Prepare page and lives in the move shell (`features/checklist`): side panel on lg+, "Checklist (n of m)" Sheet drawer below lg, one `useChecklist` query shared by the panel, stepper and Summary. New components: `status-control`, `checklist-row` (info icon expands the description), `checklist-panel`, `checklist-drawer`, `summary-checklist`, shadcn `sheet`. `checklist-item` is removed. The stepper takes explicit `steps` (complete, attention, locked, upcoming) from `phase-steps.ts`; only Prepare is wired to attention. Summary shows "Still open" first and a collapsed "Handled" group; print lists all items with their status. All registered on /design.
**Tests:** migration backfill mapping (temp-table run of the 0006 SQL), PATCH each status 200, invalid status 400, unknown key and move 404, GET defaults to pending, `isHandled`, summary builder open and handled split, summary route includes the live checklist.
**Done when:** answering items in any phase updates the panel, the stepper's Prepare marker and the Summary reminder together; `pnpm check` is green.

## Settle in checklist link
**Contracts:** `linkedItemKeys` (category to item key), `linkedCategory` on template items, `locked` and `providerName` on `guidanceProgressSchema`, `countOpenPrepare(entries)` (ignores linked items). No migration.
**API:** `guidance.templates.ts` adds `get-home-insurance` and a "Settle in" group (Utilities becomes "Admin"). `listProgress` computes `locked` from `moveService.getById(...).phase`; `setProgress` returns 409 on a locked item; `setSelection` syncs the linked item (provider saved: done, also over N/A; cleared: pending only from done). `setProgress` with `na` on a linked item clears that category's selection. Prepare tips gain `tip-home-insurance`.
**Web:** `checklist-row` gets locked / linked / provider states, `status-control` sets `aria-disabled`, the "Choose in Settle in" link is hidden on the Settle in screen; the stepper's Prepare uses `countOpenPrepare`; selection changes invalidate the checklist and summary. All states on /design.
**Tests:** `guidance.linked.test.ts` (locked by phase, 409, works after settle_in, sync both ways, provider over N/A sets done, N/A clears the selection, Prepare ignores linked items, existing keys kept).
**Done when:** choosing a provider ticks the Move checklist item; `pnpm check` is green.

## Slice 7: Demo hardening
**Files:** `apps/api/src/db/seed.ts` + `pnpm db:seed` (resets the dev DB and creates a demo move with before and move-in photos from `demo-assets/` through photos.service), `demo-assets/*.jpg`.
**Work:** audit loading, empty and error states on every page (all registered on /design); visual polish; rehearse the recording (fallback: if AI is slow, use the manual-check path).
**Tests:** a seed smoke test against the test DB (photos created, phase correct).
**Done when:** a fresh `db:seed` lets you record the full flow end to end without manual fixes.

## Stretch Slice 8: Contract analysis (only after 0–7 work)
Contract analysis is an **optional step the user can skip**; the move flow works the same without it. Own `contract` context: PDF upload, text extraction, one AI job flagging deposit, damage-responsibility, inspection-waiver, entry and notice-period clauses; table `contracts (id, move_id, file_path, analysis jsonb, created_at)`. Test it with the demo lease `apps/api/demo-assets/demo-lease.pdf` (served at `GET /api/demo/contract`; the private answer key stays out of the repo's served files). Flags use cautious "worth confirming with the landlord" wording and never state legal conclusions or say a clause is illegal or invalid. Plan it in detail only when Slice 7 is done.

---

## Risks and recommendations

1. **Blocker: Docker is down and port 5432 is taken.** On the dev machine, `docker` crashes with a bus error, and a native Postgres 16 already holds 5432. → Start Docker Desktop with WSL integration enabled. Compose publishes **5433** and `.env.example` uses 5433.
2. **Phase/event model is underspecified.** `move` can't read photos or findings without breaking the dependency rule, so it can't check those guards itself. → Use the phase model above: an event table in move, data guards in the owning context, and `/advance` for prepare, before_photos (also the AI-failure path) and report.
3. **The report can't be found after a refresh.** No endpoint returns a move's report id. → Add `GET /moves/:id/reports/latest`. This is the only addition to the API list.
4. **A frozen report can break.** The snapshot points at photo files, so deleting a photo later breaks old reports. → `DELETE /photos/:id` returns 409 once the phase is ≥ report.
5. **"Timestamps" are upload times.** EXIF is stripped, so capture time is lost. → Label them "Uploaded at …" honestly and don't add EXIF parsing. iPhone HEIC won't decode with prebuilt sharp. → Accept JPEG, PNG and WebP with a clear 400.
6. **The 30-day watch list is undefined.** → Unclear findings + custom notes + 5 templated items, due at move date + 30 days.
7. **Overbuilt, dropped:**
   - the `ProviderLinkOpened` event: it has no endpoint or table, and nothing reads it. A plain external link replaces it.
   - `shared/validate.ts`: the central handler already maps ZodError to 400.
   - `FRONTEND_ORIGIN`/CORS: the Vite proxy makes `/api`, including `<img src="/api/photos/:id/file">`, same-origin.
8. **Two homes for Zod schemas.** `packages/contracts` and `*.schemas.ts` overlap. → Wire shapes go in contracts; API-only shapes go in `*.schemas.ts`.
9. **Stock photos vs. "hero only" landing.** §11's landing-page stock photos conflict with §3. → No photos on the landing page; the canvas is the visual.
10. **AI behavior:**
    - The model must support images + `json_schema`. → Set `provider.require_parameters: true` and choose the model in env.
    - Baseline: a failed room does not undo the others; the response lists `failedRooms` and the manual fallback always applies.
    - Re-running compare replaces findings and clears the user's answers. → The button label says so.
11. **Demo photos block Slice 4's DoD.** They need the same room shot twice with one planted change. → Shoot them before Slice 4.
12. **Smaller gaps:**
    - The test DB isn't specified. → `movemate_test` via a compose init script + `TEST_DATABASE_URL`.
    - The photos context's dependency isn't listed. → photos → move.
    - `GET /moves/current` with no move. → `200 { data: null }`, since that's the normal first visit.
    - The spec asks for no web unit tests. → Browser verification instead.

## Settle in redesign
**Web:** `features/settle-in` is three flat lists (Home insurance, Electricity, Internet) from `provider-category-list` and `provider-row`, each ending in "Not needed (N/A)" (selected when the linked item is `na`; it goes through the checklist PATCH). `insurance-info-popover` holds the explainer; `discount-badge` carries the offer; `settle-in-progress` shows "n of 3 handled". Hero card, offer block and N/A note are removed. All states on /design.
**Done when:** N/A and provider choices keep the Move checklist in sync; `pnpm check` is green.
