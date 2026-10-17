# Graph Report - movemate  (2026-10-17)

## Corpus Check
- Large corpus: 207 files · ~532,417 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 1110 nodes · 2944 edges · 58 communities (51 shown, 7 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 25 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Web Routing & Shell
- Web Providers & Compare
- Project Docs & Rules
- API Tests & Helpers
- Web Dependencies
- API Dependencies
- Monorepo Tooling
- Photo Upload UI
- Guidance Controller
- Inspection AI Prompts
- Design System Page
- Provider & Summary UI
- Guidance Service
- Error Handling
- App & Routers
- shadcn Config
- Room Check Forms
- Dialogs & Photos
- Inspection Repository
- Settle-in Hooks
- Report Snapshot
- Inspection DB Schema
- Checklist Panels
- Table UI
- Photo Contracts
- Move Service
- Finding Row UI
- Inspection Contracts
- Env & Photo Routes
- Demo Service
- Photos Service
- Phase Stepper
- Checklist Status UI
- Inspection Controller
- Photos Controller
- Discount Badge
- Report View
- TS Base Config
- Guidance Repository
- Checklist Drawer
- Contracts Package
- Inspection Schemas
- Move Repository
- DB Test Setup
- Photos Repository
- OpenRouter Client
- Report Repository
- Web TS Config
- Finding Mutations
- Report Service
- Photo Route Tests
- API TS Config
- Contracts TS Config
- MCP Config
- Demo Lease Key
- Web index.html
- CLAUDE.md
- pnpm Workspace

## God Nodes (most connected - your core abstractions)
1. `Button()` - 55 edges
2. `DesignPage()` - 54 edges
3. `AppError` - 50 edges
4. `lucide-react` - 31 edges
5. `Spinner()` - 29 edges
6. `react` - 27 edges
7. `vitest` - 25 edges
8. `Alert()` - 22 edges
9. `ComparePanel()` - 22 edges
10. `AlertDescription()` - 21 edges

## Surprising Connections (you probably didn't know these)
- `buildSummary()` --calls--> `isHandled()`  [EXTRACTED]
  apps/api/src/contexts/report/report.summary.ts → packages/contracts/src/guidance.ts
- `ChecklistDrawer()` --calls--> `isHandled()`  [EXTRACTED]
  apps/web/src/components/checklist-drawer.tsx → packages/contracts/src/guidance.ts
- `MovePhasePage()` --calls--> `isHandled()`  [EXTRACTED]
  apps/web/src/pages/move-shell/move-phase-page.tsx → packages/contracts/src/guidance.ts
- `Update SPEC and PLAN on logic changes` --references--> `MoveMate Build Plan`  [INFERRED]
  CLAUDE.md → docs/PLAN.md
- `Update SPEC and PLAN on logic changes` --references--> `MoveMate Spec`  [INFERRED]
  CLAUDE.md → docs/SPEC.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Phase transition flow** — docs_spec_phases, docs_spec_domain_events, docs_plan_phase_model [EXTRACTED 1.00]
- **Layered bounded context architecture** — docs_spec_bounded_contexts, docs_spec_layering, claude_md_layering [INFERRED 0.85]

## Communities (58 total, 7 thin omitted)

### Community 0 - "Web Routing & Shell"
Cohesion: 0.09
Nodes (60): AiErrorAlert(), AiErrorAlertProps, HeaderNav(), links, InteractiveBackground(), Logo(), PhotoGrid(), PhotoGridProps (+52 more)

### Community 1 - "Web Providers & Compare"
Cohesion: 0.06
Nodes (32): Providers(), queryClient, router, ComparePanel(), roomList(), findingsKey(), useAddFinding(), useDeleteFinding() (+24 more)

### Community 2 - "Project Docs & Rules"
Cohesion: 0.06
Nodes (43): Fair Ordinary Clauses (non-flags), Eight Lease Flags, React Root Mount, Context Dependency Table, Update SPEC and PLAN on logic changes, End of Slice Checklist, Frontend Rules (tokens, /design), Routes-Controller-Service-Repository (+35 more)

### Community 3 - "API Tests & Helpers"
Cohesion: 0.10
Nodes (26): ai, comparedMove(), oneFinding, app, createMove(), uploadBefore(), uploadPhoto(), ai (+18 more)

### Community 4 - "Web Dependencies"
Cohesion: 0.05
Nodes (41): dependencies, class-variance-authority, cn, lucide-react, @movemate/contracts, radix-ui, react, react-dom (+33 more)

### Community 5 - "API Dependencies"
Cohesion: 0.05
Nodes (39): dependencies, drizzle-orm, express, @movemate/contracts, multer, pg, sharp, zod (+31 more)

### Community 6 - "Monorepo Tooling"
Cohesion: 0.06
Nodes (35): devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, pdfkit, typescript (+27 more)

### Community 7 - "Photo Upload UI"
Cohesion: 0.10
Nodes (20): Point, LogoMark(), LogoProps, Draft, PhotoUploader(), addFiles(), onDrop(), removeDraft() (+12 more)

### Community 8 - "Guidance Controller"
Cohesion: 0.08
Nodes (20): getPrepareGuidance(), getProviders(), getSelection(), listProgress(), setProgress(), setSelection(), progressParamsSchema, selectionParamsSchema (+12 more)

### Community 9 - "Inspection AI Prompts"
Cohesion: 0.12
Nodes (24): BASELINE_SYSTEM_PROMPT, baselineUserText(), COMPARE_SYSTEM_PROMPT, compareUserText(), imageRange(), addCheck(), addFinding(), analyzeRoom() (+16 more)

### Community 10 - "Design System Page"
Cohesion: 0.07
Nodes (26): allHandled, badgeVariants, baseFinding, buttonSizes, buttonVariants, colorTokens, designChecklist, designDiscount (+18 more)

### Community 11 - "Provider & Summary UI"
Cohesion: 0.22
Nodes (16): ProviderCard(), ProviderCardProps, ChosenProvider, Stat(), SummaryView(), SummaryViewProps, TipCard(), Card() (+8 more)

### Community 12 - "Guidance Service"
Cohesion: 0.11
Nodes (12): getSelection(), setProgress(), setSelection(), IF_DISCOUNT, insuranceExplainer, prepareChecklist, prepareTips, providerTemplates (+4 more)

### Community 13 - "Error Handling"
Cohesion: 0.12
Nodes (14): errorHandler(), ErrorResponse, isMalformedJsonBody(), toErrorResponse(), ErrorCode, statusByCode, appThrowing(), fetchMock (+6 more)

### Community 14 - "App & Routers"
Cohesion: 0.16
Nodes (9): createApp(), demoRouter, guidanceRouter, app, inspectionRouter, moveRouter, reportRouter, pingDatabase() (+1 more)

### Community 15 - "shadcn Config"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 16 - "Room Check Forms"
Cohesion: 0.19
Nodes (13): AddFindingForm(), AddFindingFormProps, CreateMoveFields(), CreateMoveFieldsProps, RoomCheckList(), RoomCheckListProps, CardDescription(), Checkbox() (+5 more)

### Community 17 - "Dialogs & Photos"
Cohesion: 0.21
Nodes (15): EnlargeablePhoto(), EnlargeablePhotoProps, StartOverDialog(), StartOverDialogProps, Dialog(), DialogContent(), DialogDescription(), DialogFooter() (+7 more)

### Community 18 - "Inspection Repository"
Cohesion: 0.10
Nodes (6): AiFindingDraft, FindingPhotoLink, FindingRow, RoomCheckRow, CheckSource, Confidence

### Community 19 - "Settle-in Hooks"
Cohesion: 0.11
Nodes (16): selectionKey(), SetSelectionInput, useSetProviderSelection(), checklistItemSchema, checklistStatusSchema, InsuranceExplainer, insuranceExplainerSchema, providerDiscountSchema (+8 more)

### Community 20 - "Report Snapshot"
Cohesion: 0.18
Nodes (12): buildSnapshot(), dueDate(), findingText(), toIssue(), toReportFinding(), toWatchList(), REPORT_DISCLAIMER, WATCH_LIST_DAYS (+4 more)

### Community 21 - "Inspection DB Schema"
Cohesion: 0.13
Nodes (10): findingPhotos, findings, roomChecks, photos, aiStatuses, checkSources, confidences, resolutions (+2 more)

### Community 22 - "Checklist Panels"
Cohesion: 0.21
Nodes (11): ChecklistPanel(), ChecklistPanelProps, groupByCategory(), ChecklistRow(), Rows(), SummaryChecklist(), SummaryChecklistProps, checklistStatusLabels (+3 more)

### Community 23 - "Table UI"
Cohesion: 0.19
Nodes (9): Separator(), Table(), TableBody(), TableCell(), TableRow(), demoListing, bedroom, DemoPage() (+1 more)

### Community 24 - "Photo Contracts"
Cohesion: 0.12
Nodes (15): guidanceProgressSchema, resolutionSchema, Photo, PhotoStage, RelabelPhoto, relabelPhotoSchema, roomSchema, Report (+7 more)

### Community 25 - "Move Service"
Cohesion: 0.23
Nodes (13): advance(), advanceBlockedMessage, applyEvent(), assertPhaseReached(), create(), eventTable, getById(), getCurrent() (+5 more)

### Community 26 - "Finding Row UI"
Cohesion: 0.14
Nodes (11): Editing, FindingRow(), resolve(), submit(), FindingRowProps, PhotoGroup(), resolutionBadge, statusBadge (+3 more)

### Community 27 - "Inspection Contracts"
Cohesion: 0.12
Nodes (15): BaselineResult, checkSourceSchema, CompareResult, compareResultSchema, CreateFinding, createFindingSchema, createRoomCheckSchema, findingSchema (+7 more)

### Community 28 - "Env & Photo Routes"
Cohesion: 0.17
Nodes (9): app, photosRouter, upload, env, envSchema, optionalString, parseEnv(), validEnv (+1 more)

### Community 29 - "Demo Service"
Cohesion: 0.18
Nodes (7): DEMO_ASSETS_DIR, getLeaseFile(), LEASE_FILENAME, app, keyText, ai, tables

### Community 30 - "Photos Service"
Cohesion: 0.26
Nodes (13): acceptedFormats, assertRoomHasSpace(), getFilePath(), getRow(), listByStage(), normalizeImage(), readFile(), relabel() (+5 more)

### Community 31 - "Phase Stepper"
Cohesion: 0.22
Nodes (9): StepperProps, StepState, phaseLabels, CreateMove, createMoveSchema, moveSchema, Phase, phaseOrder (+1 more)

### Community 32 - "Checklist Status UI"
Cohesion: 0.25
Nodes (6): ChecklistRowProps, options, StatusControl(), StatusControlProps, SetStatusInput, ChecklistStatus

### Community 33 - "Inspection Controller"
Cohesion: 0.14
Nodes (5): addFinding(), listFindings(), resolveFinding(), runBaseline(), runCompare()

### Community 34 - "Photos Controller"
Cohesion: 0.18
Nodes (8): relabel(), remove(), sendFile(), upload(), listPhotosQuerySchema, photoIdParamsSchema, uploadFieldsSchema, photoStageSchema

### Community 35 - "Discount Badge"
Cohesion: 0.23
Nodes (7): CopyCodeButton(), DiscountBadge(), DiscountBadgeProps, discountDuration(), Popover(), PopoverContent(), PopoverTrigger()

### Community 36 - "Report View"
Cohesion: 0.34
Nodes (9): ReportIssue(), ReportPhotos(), ReportView(), resolutionLabel, Badge(), badgeVariants, formatDate(), formatDateTime() (+1 more)

### Community 37 - "TS Base Config"
Cohesion: 0.14
Nodes (13): compilerOptions, isolatedModules, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUncheckedIndexedAccess, noUnusedLocals (+5 more)

### Community 38 - "Guidance Repository"
Cohesion: 0.18
Nodes (4): guidanceProgress, providerSelections, checklistStatuses, providerCategories

### Community 39 - "Checklist Drawer"
Cohesion: 0.33
Nodes (10): ChecklistDrawer(), ChecklistDrawerProps, Sheet(), SheetContent(), SheetDescription(), SheetHeader(), SheetOverlay(), SheetPortal() (+2 more)

### Community 40 - "Contracts Package"
Cohesion: 0.15
Nodes (12): dependencies, zod, devDependencies, typescript, exports, typescript, zod, name (+4 more)

### Community 41 - "Inspection Schemas"
Cohesion: 0.17
Nodes (8): baselineOutputSchema, checkIdParamsSchema, CompareOutput, compareOutputSchema, findingIdParamsSchema, aiStatusSchema, confidenceSchema, MAX_CHECK_LENGTH

### Community 43 - "DB Test Setup"
Cohesion: 0.31
Nodes (5): migration, db, pool, drizzle-orm, pg

### Community 45 - "OpenRouter Client"
Cohesion: 0.33
Nodes (9): Attempt, AttemptInput, CompleteJsonInput, extractJson(), httpError(), isRecord(), Message, readContent() (+1 more)

### Community 46 - "Report Repository"
Cohesion: 0.31
Nodes (3): ReportRow, reports, ReportSnapshot

### Community 47 - "Web TS Config"
Cohesion: 0.22
Nodes (8): compilerOptions, jsx, lib, paths, types, extends, include, ../../tsconfig.base.json

### Community 48 - "Finding Mutations"
Cohesion: 0.32
Nodes (7): deleteCheck(), deleteFinding(), getFindingRow(), resolveFinding(), aiFailure(), aiFailure(), AppError

### Community 49 - "Report Service"
Cohesion: 0.50
Nodes (6): generate(), getById(), getLatest(), getSummary(), toReport(), buildSummary()

### Community 50 - "Photo Route Tests"
Cohesion: 0.40
Nodes (5): app, createMove(), png(), post(), sharp

### Community 51 - "API TS Config"
Cohesion: 0.33
Nodes (5): compilerOptions, types, extends, include, ../../tsconfig.base.json

### Community 52 - "Contracts TS Config"
Cohesion: 0.50
Nodes (3): extends, include, ../../tsconfig.base.json

## Knowledge Gaps
- **49 isolated node(s):** `npx`, `@movemate/contracts`, `zod`, `@types/express`, `@types/multer` (+44 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 437 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `lucide-react` connect `Web Routing & Shell` to `Checklist Status UI`, `Web Providers & Compare`, `Discount Badge`, `Web Dependencies`, `Checklist Drawer`, `Photo Upload UI`, `Design System Page`, `Provider & Summary UI`, `Room Check Forms`, `Dialogs & Photos`, `Table UI`, `Finding Row UI`, `Phase Stepper`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **What connects `npx`, `@movemate/contracts`, `zod` to the rest of the system?**
  _49 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Web Routing & Shell` be split into smaller, more focused modules?**
  _Cohesion score 0.0895843287147635 - nodes in this community are weakly interconnected._
- **Should `Web Providers & Compare` be split into smaller, more focused modules?**
  _Cohesion score 0.06265664160401002 - nodes in this community are weakly interconnected._
- **Should `Project Docs & Rules` be split into smaller, more focused modules?**
  _Cohesion score 0.058693244739756366 - nodes in this community are weakly interconnected._
- **Should `API Tests & Helpers` be split into smaller, more focused modules?**
  _Cohesion score 0.09966777408637874 - nodes in this community are weakly interconnected._
- **Should `Web Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.048726467331118496 - nodes in this community are weakly interconnected._