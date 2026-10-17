# MoveMate

Renters document move-in condition: AI compares "before" photos with move-in photos room by room, the user confirms every result, and MoveMate produces a dated report as proof for the landlord. Hackathon project: localhost demo, single user, no auth, no deployment.

- Scope source of truth: `docs/SPEC.md`. Build order and per-slice scope: `docs/PLAN.md`.
- **Only build the current slice. Never build ahead.** No tables, endpoints, env vars, components or dependencies that belong to a later slice. Nothing outside SPEC.md (§12 lists what is out of scope).

## Stack

- Web `apps/web`: React + TypeScript + Vite, Tailwind v4, shadcn/ui, React Router, TanStack Query, lucide-react
- API `apps/api`: Node 24, Express 5, TypeScript run by tsx (no build step)
- Shared `packages/contracts`: Zod schemas + inferred types for everything that crosses HTTP (consumed as TS source)
- DB: PostgreSQL 16 in Docker Compose (host port **5433**, named volume), Drizzle ORM + drizzle-kit migrations
- Uploads: multer (memory storage, size limit) + sharp (rotate, max 1600px, strip EXIF, JPEG)
- AI: OpenRouter chat completions, one vision model from env, output always Zod-validated
- Tests: Vitest + Supertest (API); AI client always mocked
- Package manager: pnpm workspaces

## Commands

| Command                                      | What                                                     |
| -------------------------------------------- | -------------------------------------------------------- |
| `pnpm install` then `cp .env.example .env`   | setup                                                    |
| `pnpm db:up`                                 | start Postgres (docker compose, waits for healthy)       |
| `pnpm db:generate` / `pnpm db:migrate`       | create migration from schema / apply to dev DB           |
| `pnpm dev`                                   | API on :3000 + web on :5173 (Vite proxies `/api`)        |
| `pnpm check`                                 | typecheck + lint + test. Must pass at end of every slice |
| `pnpm typecheck` / `pnpm lint` / `pnpm test` | individually                                             |

## Folder structure

```
apps/api/src/
  app.ts (createApp, /api/health) server.ts env.ts
  db/ client.ts  schema/<context>.ts  migrations/
  shared/ errors.ts error-handler.ts ai/openrouter.client.ts
  contexts/<context>/ <ctx>.routes.ts .controller.ts .service.ts .repository.ts .schemas.ts .types.ts __tests__/
apps/web/src/
  app/ (router, providers)  pages/ (landing, design, move-shell)
  features/ (prepare, before-photos, move-in, report, settle-in)
  components/ (ui/ = shadcn, plus shared custom components)  lib/ (api client, utils)
packages/contracts/src/ (one file per context + index.ts)
docker-compose.yml  docker/postgres-init/  .env.example  docs/
```

## Bounded contexts

| Context                          | Owns                                                                 | May call (service only)  |
| -------------------------------- | -------------------------------------------------------------------- | ------------------------ |
| move                             | `moves`, the phase and its transitions                               | nothing                  |
| guidance                         | `guidance_progress`; checklist/tips/providers templates live in code | move                     |
| photos                           | `photos`, files in `UPLOAD_DIR`                                      | move                     |
| inspection                       | `room_checks`, `findings`, `finding_photos`                          | photos, move             |
| report                           | `reports` (frozen jsonb snapshot)                                    | inspection, photos, guidance, move |
| contract (stretch, slice 8 only) | lease analysis                                                       | move                     |

- Call another context only through its **service**. Never import another context's repository or `db/schema/<other>.ts`.
- No cycles. `move` depends on nothing.
- Domain events are a string union (`MoveEvent`) in `move.types.ts`. The owning service calls `moveService.applyEvent(moveId, event)` after its own write succeeds. The move service validates the event against the current phase (409 if illegal) and unlocks the next phase where the table in `docs/PLAN.md` says so. No event bus, no event table.

## Layering (inside each context)

`routes -> controller -> service -> repository`

- routes: paths and middleware only.
- controller: parse `req` with Zod, call the service, send `{ data }` with the status code. No logic.
- service: business rules, phase guards, events. Throws `AppError`. No `req`/`res`, no Drizzle.
- repository: Drizzle queries only. No rules.
- `*.schemas.ts`: API-only Zod (route params, query, multipart fields, AI output). Wire shapes shared with the web live in `packages/contracts`. Never define a shape twice.
- `*.types.ts`: domain types not inferred from Zod or Drizzle.
- `/api/health` lives in `app.ts`: it is infrastructure, not a context.

## API conventions

- Everything under `/api`. Success `{ data }`. Error `{ error: { code, message } }`.
- Services throw `new AppError(code, message)`. The status comes from the code map in `shared/errors.ts` (400 validation, 404 not found, 409 invalid phase transition, 413 upload too large, 502 AI failure, 500 unexpected). Add a code in the slice that first needs it.
- A `ZodError` thrown by controller parsing becomes 400 in the central handler. Any other Zod use (env, AI output) converts its own failure.
- Never send stack traces, SQL or upstream (OpenRouter) payloads to the client. Never log image data or keys. AI calls log model id and duration only.

## Code quality (SPEC §9)

- TypeScript strict + `noUncheckedIndexedAccess`. No `any`. No `!` unless an `eslint-disable-next-line ... -- reason` explains it.
- Env is parsed with Zod in `env.ts` at startup, and the app refuses to start if it is invalid. Read config only through `env`, never `process.env` elsewhere. Add each var to `env.ts` and `.env.example` in the slice that uses it.
- One central error handler. Small functions, descriptive names. No dead code, no commented-out code, no TODO stubs.
- Files are kebab-case, React components PascalCase. One component per file (shadcn `components/ui` excepted).

## Frontend rules

- **Skills: load `design-taste-frontend` and use the shadcn MCP for frontend work only** (`apps/web`). Do not use them for API work.
- `/design` is the living design system. Every component, shadcn or custom, is added to `/design` in the slice that introduces it, shown in the states that apply (default, hover, disabled, loading, error).
- No one-off styling. Colors, fonts, radii and the type scale come from the tokens in `src/index.css`. No hex or rgb values and no arbitrary Tailwind values (`text-[13px]`, `bg-[#...]`) in components.
- Customize shadcn through tokens. Edit `components/ui/*` only to add a variant used across the app, then show that variant on `/design`.
- Server state goes through TanStack Query hooks in `features/*`. HTTP goes only through `lib/api.ts`.
- Accessible labels, a visible keyboard focus, and `prefers-reduced-motion` respected.

# Add on rule

Any change to a flow, phase rule, data model, endpoint or business logic must also update docs/SPEC.md and docs/PLAN.md in the same session. UI-only tweaks do not need doc updates. Do not change anything else. Do not commit.

## Testing

- Every slice ships tests for its services and routes, in `contexts/<ctx>/__tests__/` (shared code: `shared/__tests__/`).
- Route tests use Supertest against `createApp()`.
- Tests use the `movemate_test` database (`TEST_DATABASE_URL`), never the dev DB. A global setup applies migrations, and tables are truncated between tests.
- The AI client is mocked with `vi.mock`. No network calls in tests.
- The spec requires no web unit tests. Verify UI in a real browser (chrome-devtools MCP), including reduced motion and a narrow viewport.

## End of every slice

1. `pnpm check` passes.
2. Walk the slice's "Done when" from `docs/PLAN.md` in the browser or with curl.
3. Write a short self-review: shortcuts taken (`shortcut:` comments), deviations from the spec, anything deferred. Then stop and wait for approval.
