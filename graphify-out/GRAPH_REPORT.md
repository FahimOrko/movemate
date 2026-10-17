# Graph Report - movemate  (2026-10-17)

## Corpus Check
- 180 files · ~295,827 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: .example 1, (none) 1, .css 1)

## Summary
- 1022 nodes · 2616 edges · 56 communities (50 shown, 6 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 27 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Web App Shell
- API Bootstrap & Routes
- Web Dependencies
- API Dependencies
- Guidance & Findings Tests
- Project Rules & Spec
- Root Tooling Config
- Finding & Move Forms
- Guidance Service
- Inspection Service
- Inspection Tests & AI Client
- Provider & Room Checks UI
- Design Page
- Inspection Repository
- Move Service & Findings
- shadcn Config
- Report Snapshot
- Photo Contracts
- DB Schema
- Photos Service
- Guidance Controller
- Discount Badge
- Inspection Contracts
- Inspection Controller
- Move Repository
- Checklist & Background UI
- Report View
- Room Select
- Settle-in Hooks
- TS Base Config
- Photos Controller
- Photo Dialog
- Stepper & Phases
- Contracts Package
- Photo Grid & Empty
- Guidance Repository
- Inspection Schemas
- Report Service
- Photos Route Tests
- Guidance Contracts
- Photos Repository
- Report Repository
- Web TS Config
- Inspection Prompts
- Prepare Hooks
- Compare Tests
- API TS Config
- Photo Uploader
- Spec & Plan Docs
- Demo Photos
- Contracts TS Config
- Test Global Setup
- MCP Config
- Checklist & Quality Rules
- Favicon
- Slice 7 Demo Hardening

## God Nodes (most connected - your core abstractions)
1. `AppError` - 48 edges
2. `Button()` - 45 edges
3. `DesignPage()` - 44 edges
4. `Spinner()` - 29 edges
5. `lucide-react` - 27 edges
6. `react` - 24 edges
7. `vitest` - 23 edges
8. `Alert()` - 22 edges
9. `ComparePanel()` - 22 edges
10. `AlertDescription()` - 21 edges

## Surprising Connections (you probably didn't know these)
- `Code quality rules (SPEC section 9)` --semantically_similar_to--> `End-of-slice checklist`  [INFERRED] [semantically similar]
  docs/SPEC.md → CLAUDE.md
- `Slice 0: Foundation + /design + landing` --conceptually_related_to--> `Web app HTML entry (MoveMate, mounts src/main.tsx)`  [INFERRED]
  docs/PLAN.md → apps/web/index.html
- `Layering routes-controller-service-repository` --implements--> `Bounded contexts: move, guidance, photos, inspection, report, contract`  [EXTRACTED]
  CLAUDE.md → docs/SPEC.md
- `Cross-context calls only through service` --implements--> `Bounded contexts: move, guidance, photos, inspection, report, contract`  [EXTRACTED]
  CLAUDE.md → docs/SPEC.md
- `Testing rules (Vitest, Supertest, mocked AI, movemate_test DB)` --references--> `MoveMate build plan`  [INFERRED]
  CLAUDE.md → docs/PLAN.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **MoveMate build slices 0-8** — docs_plan_slice_0, docs_plan_slice_1, docs_plan_slice_2, docs_plan_slice_3, docs_plan_slice_4, docs_plan_slice_5, docs_plan_slice_6, docs_plan_slice_7, docs_plan_slice_8 [EXTRACTED 1.00]
- **Architecture and layering rules** — claude_layering, claude_context_boundary_rule, docs_spec_bounded_contexts, claude_move_event [INFERRED 0.85]
- **Infrastructure and workspace setup** — docker_compose_db, pnpm_workspace_packages, apps_web_index_html [INFERRED 0.75]

## Communities (56 total, 6 thin omitted)

### Community 0 - "Web App Shell"
Cohesion: 0.05
Nodes (85): Providers(), queryClient, router, AddFindingForm(), AiErrorAlert(), AiErrorAlertProps, InteractiveBackground(), StartOverDialog() (+77 more)

### Community 1 - "API Bootstrap & Routes"
Cohesion: 0.05
Nodes (37): createApp(), guidanceRouter, app, app, inspectionRouter, advance(), create(), getCurrent() (+29 more)

### Community 2 - "Web Dependencies"
Cohesion: 0.05
Nodes (41): dependencies, class-variance-authority, cn, lucide-react, @movemate/contracts, radix-ui, react, react-dom (+33 more)

### Community 3 - "API Dependencies"
Cohesion: 0.05
Nodes (38): dependencies, drizzle-orm, express, @movemate/contracts, multer, pg, sharp, zod (+30 more)

### Community 4 - "Guidance & Findings Tests"
Cohesion: 0.12
Nodes (21): ai, comparedMove(), oneFinding, app, createMove(), uploadBefore(), uploadPhoto(), ai (+13 more)

### Community 5 - "Project Rules & Spec"
Cohesion: 0.07
Nodes (31): Web app HTML entry (MoveMate, mounts src/main.tsx), API conventions ({data}/{error} envelope, AppError), Cross-context calls only through service, Frontend rules (tokens, /design, TanStack Query), Layering routes-controller-service-repository, MoveEvent domain events via applyEvent, Tech stack (React, Express, Drizzle, Postgres, OpenRouter, pnpm), Postgres 16 db service (host port 5433, named volume) (+23 more)

### Community 6 - "Root Tooling Config"
Cohesion: 0.07
Nodes (30): devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, typescript, typescript-eslint (+22 more)

### Community 7 - "Finding & Move Forms"
Cohesion: 0.12
Nodes (18): AddFindingFormProps, CreateMoveFields(), CreateMoveFieldsProps, Editing, FindingRow(), resolve(), submit(), FindingRowProps (+10 more)

### Community 8 - "Guidance Service"
Cohesion: 0.11
Nodes (13): getSelection(), setProgress(), setSelection(), IF_DISCOUNT, insuranceExplainer, prepareChecklist, prepareTips, providerTemplates (+5 more)

### Community 9 - "Inspection Service"
Cohesion: 0.14
Nodes (17): baselineUserText(), addCheck(), addFinding(), analyzeRoom(), findingById(), forEachRoom(), groupByRoom(), listChecks() (+9 more)

### Community 10 - "Inspection Tests & AI Client"
Cohesion: 0.12
Nodes (17): ai, aiFailure(), Attempt, AttemptInput, completeJson(), CompleteJsonInput, extractJson(), httpError() (+9 more)

### Community 11 - "Provider & Room Checks UI"
Cohesion: 0.22
Nodes (16): ProviderCard(), ProviderCardProps, RoomCheckList(), RoomCheckListProps, ChosenProvider, Stat(), SummaryView(), SummaryViewProps (+8 more)

### Community 12 - "Design Page"
Cohesion: 0.09
Nodes (22): badgeVariants, baseFinding, buttonSizes, buttonVariants, colorTokens, designDiscount, designSummary, radiusScale (+14 more)

### Community 13 - "Inspection Repository"
Cohesion: 0.09
Nodes (7): AiFindingDraft, FindingPhotoLink, FindingRow, RoomCheckRow, CheckSource, Confidence, Resolution

### Community 14 - "Move Service & Findings"
Cohesion: 0.18
Nodes (18): deleteCheck(), deleteFinding(), getFindingRow(), resolveFinding(), advance(), advanceBlockedMessage, applyEvent(), assertPhaseReached() (+10 more)

### Community 15 - "shadcn Config"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 16 - "Report Snapshot"
Cohesion: 0.18
Nodes (12): buildSnapshot(), dueDate(), findingText(), toIssue(), toReportFinding(), toWatchList(), REPORT_DISCLAIMER, WATCH_LIST_DAYS (+4 more)

### Community 17 - "Photo Contracts"
Cohesion: 0.12
Nodes (17): aiStatusSchema, resolutionSchema, MAX_PHOTOS_PER_ROOM, Photo, photoSchema, photoStageSchema, RelabelPhoto, relabelPhotoSchema (+9 more)

### Community 18 - "DB Schema"
Cohesion: 0.13
Nodes (10): findingPhotos, findings, roomChecks, photos, aiStatuses, checkSources, confidences, resolutions (+2 more)

### Community 19 - "Photos Service"
Cohesion: 0.23
Nodes (13): acceptedFormats, assertRoomHasSpace(), getFilePath(), getRow(), listByStage(), normalizeImage(), readFile(), relabel() (+5 more)

### Community 20 - "Guidance Controller"
Cohesion: 0.15
Nodes (10): getPrepareGuidance(), getProviders(), getSelection(), listProgress(), setProgress(), setSelection(), progressParamsSchema, selectionParamsSchema (+2 more)

### Community 21 - "Discount Badge"
Cohesion: 0.21
Nodes (8): CopyCodeButton(), DiscountBadge(), DiscountBadgeProps, discountDuration(), Popover(), PopoverContent(), PopoverTrigger(), radix-ui

### Community 22 - "Inspection Contracts"
Cohesion: 0.13
Nodes (14): BaselineResult, checkSourceSchema, CompareResult, compareResultSchema, CreateFinding, createFindingSchema, createRoomCheckSchema, findingSchema (+6 more)

### Community 23 - "Inspection Controller"
Cohesion: 0.14
Nodes (5): addFinding(), listFindings(), resolveFinding(), runBaseline(), runCompare()

### Community 24 - "Move Repository"
Cohesion: 0.21
Nodes (4): MoveRow, db, moves, drizzle-orm

### Community 25 - "Checklist & Background UI"
Cohesion: 0.22
Nodes (7): ChecklistItem(), ChecklistItemProps, Point, Draft, PhotoUploaderProps, Checkbox(), react

### Community 26 - "Report View"
Cohesion: 0.34
Nodes (9): ReportIssue(), ReportPhotos(), ReportView(), resolutionLabel, Badge(), badgeVariants, formatDate(), formatDateTime() (+1 more)

### Community 27 - "Room Select"
Cohesion: 0.27
Nodes (9): RoomSelect(), RoomSelectProps, Select(), SelectContent(), SelectItem(), SelectScrollDownButton(), SelectScrollUpButton(), SelectTrigger() (+1 more)

### Community 28 - "Settle-in Hooks"
Cohesion: 0.16
Nodes (8): selectionKey(), SetSelectionInput, useSetProviderSelection(), providerCategoryLabels, ProviderCategory, ProviderSelection, providerSelectionSchema, settleInGuidanceSchema

### Community 29 - "TS Base Config"
Cohesion: 0.14
Nodes (13): compilerOptions, isolatedModules, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUncheckedIndexedAccess, noUnusedLocals (+5 more)

### Community 30 - "Photos Controller"
Cohesion: 0.19
Nodes (7): relabel(), remove(), sendFile(), upload(), listPhotosQuerySchema, photoIdParamsSchema, uploadFieldsSchema

### Community 31 - "Photo Dialog"
Cohesion: 0.31
Nodes (9): EnlargeablePhoto(), EnlargeablePhotoProps, Dialog(), DialogContent(), DialogDescription(), DialogOverlay(), DialogPortal(), DialogTitle() (+1 more)

### Community 32 - "Stepper & Phases"
Cohesion: 0.21
Nodes (8): StepperProps, phaseLabels, CreateMove, createMoveSchema, moveSchema, Phase, phaseOrder, phaseSchema

### Community 33 - "Contracts Package"
Cohesion: 0.15
Nodes (12): dependencies, zod, devDependencies, typescript, exports, typescript, zod, name (+4 more)

### Community 34 - "Photo Grid & Empty"
Cohesion: 0.41
Nodes (9): PhotoGrid(), PhotoGridProps, Empty(), EmptyDescription(), EmptyHeader(), EmptyMedia(), emptyMediaVariants, EmptyTitle() (+1 more)

### Community 35 - "Guidance Repository"
Cohesion: 0.22
Nodes (3): guidanceProgress, providerSelections, providerCategories

### Community 36 - "Inspection Schemas"
Cohesion: 0.18
Nodes (7): baselineOutputSchema, checkIdParamsSchema, CompareOutput, compareOutputSchema, findingIdParamsSchema, confidenceSchema, MAX_CHECK_LENGTH

### Community 37 - "Report Service"
Cohesion: 0.36
Nodes (7): generate(), getById(), getLatest(), getSummary(), toReport(), buildSummary(), ReportSummary

### Community 38 - "Photos Route Tests"
Cohesion: 0.24
Nodes (5): app, createMove(), png(), post(), sharp

### Community 39 - "Guidance Contracts"
Cohesion: 0.20
Nodes (9): checklistItemSchema, insuranceExplainerSchema, PrepareGuidance, providerDiscountSchema, providerSchema, SetProgress, setProgressSchema, SetProviderSelection (+1 more)

### Community 41 - "Report Repository"
Cohesion: 0.31
Nodes (3): ReportRow, reports, ReportSnapshot

### Community 42 - "Web TS Config"
Cohesion: 0.22
Nodes (8): compilerOptions, jsx, lib, paths, types, extends, include, ../../tsconfig.base.json

### Community 43 - "Inspection Prompts"
Cohesion: 0.29
Nodes (7): BASELINE_SYSTEM_PROMPT, COMPARE_SYSTEM_PROMPT, compareUserText(), imageRange(), compareRoom(), cutSummary(), toDrafts()

### Community 44 - "Prepare Hooks"
Cohesion: 0.25
Nodes (4): SetProgressInput, GuidanceProgress, guidanceProgressSchema, prepareGuidanceSchema

### Community 45 - "Compare Tests"
Cohesion: 0.29
Nodes (5): ai, aiFailure(), applyEvent, kitchenMove(), RawFinding

### Community 46 - "API TS Config"
Cohesion: 0.33
Nodes (5): compilerOptions, types, extends, include, ../../tsconfig.base.json

### Community 47 - "Photo Uploader"
Cohesion: 0.47
Nodes (5): PhotoUploader(), addFiles(), onDrop(), removeDraft(), uploadAll()

### Community 48 - "Spec & Plan Docs"
Cohesion: 0.40
Nodes (5): MoveMate project instructions, Testing rules (Vitest, Supertest, mocked AI, movemate_test DB), MoveMate build plan, MoveMate Project Spec, Out of scope list (section 12)

### Community 49 - "Demo Photos"
Cohesion: 0.50
Nodes (5): Demo before/move-in photo comparison with AI-detectable defects, Bedroom stock photo (clean 'before' baseline): beige walls, pink tufted headboard, grey bedspread, wood floor, desk and wall TV, no defects, Bedroom move-in photo with planted defects: ceiling water stain, scratch marks on wall by headboard, dark stain on bedspread, floor scratches, Kitchen stock photo (clean 'before' baseline): white cabinets, stainless fridge, gas range, microwave, granite counters, no defects, Living room move-in photo with planted defects: ceiling water stain, wall crack and hole, dark carpet stain, two sofas, TV

### Community 50 - "Contracts TS Config"
Cohesion: 0.50
Nodes (3): extends, include, ../../tsconfig.base.json

## Knowledge Gaps
- **41 isolated node(s):** `npx`, `@movemate/contracts`, `zod`, `@types/express`, `@types/multer` (+36 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 398 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AppError` connect `Move Service & Findings` to `API Bootstrap & Routes`, `Guidance & Findings Tests`, `Report Service`, `Guidance Service`, `Inspection Service`, `Inspection Tests & AI Client`, `Compare Tests`, `Photos Service`, `Photos Controller`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **What connects `npx`, `@movemate/contracts`, `zod` to the rest of the system?**
  _41 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Web App Shell` be split into smaller, more focused modules?**
  _Cohesion score 0.052929085303186026 - nodes in this community are weakly interconnected._
- **Why does `drizzle-orm` connect `Move Repository` to `API Bootstrap & Routes`, `Guidance Repository`, `API Dependencies`, `Guidance & Findings Tests`, `Photos Repository`, `Report Repository`, `Inspection Repository`, `DB Schema`, `Test Global Setup`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Should `API Bootstrap & Routes` be split into smaller, more focused modules?**
  _Cohesion score 0.05384615384615385 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `Web App Shell` to `Stepper & Phases`, `Web Dependencies`, `Photo Grid & Empty`, `Finding & Move Forms`, `Provider & Room Checks UI`, `Design Page`, `Discount Badge`, `Checklist & Background UI`, `Room Select`, `Photo Dialog`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Should `Web Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.048726467331118496 - nodes in this community are weakly interconnected._