# Graph Report - movemate  (2026-10-18)

## Corpus Check
- Large corpus: 253 files · ~551,053 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 1364 nodes · 3918 edges · 78 communities (68 shown, 10 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 30 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Guidance API
- Open Items Status UI
- Guidance/Findings Tests
- Web Dependencies
- API Dependencies
- Answer Controls
- Inspection Prompts & Photo Strips
- Add Finding Form
- Demo Lease Contract
- Findings Tab & Move-in Board
- Tooling & ESLint
- Insurance & Settle-in
- Room Dialog & Photos
- Report Problems
- Move Controller
- Inspection Repository
- Design Page & Badges
- Report Snapshot
- App & Demo Routes
- AI Prompts
- Report Service
- Photo Attach Field
- Compare Tests
- Error Handler
- Demo Service
- shadcn Config
- Header Nav & Alerts
- Problem Source
- Summary Checklist
- Inspection Contracts
- Move Hook & Report Phase
- Inspection Controller
- Add Room Card
- Move Service
- Providers & Router
- Discount Badge
- Report Appendix Tables
- Move Repository
- Inspection Schema
- AI Error Alert
- Report Photo Appendix
- Before-Photos Phase
- Baseline Panel
- TS Base Config
- Guidance Repository
- Photo Grid & Cards
- Summary Actions
- Contracts Package
- Env & Drizzle Config
- Inspection Schemas
- Migration Tests
- Provider List
- Checkbox & Demo Data
- Photos Repository
- OpenRouter Client
- Landing Visuals
- Web tsconfig
- Photo Contracts
- Room Check Repo
- Finding Repo
- Report Repository
- API tsconfig
- Photo Uploader
- Move Contracts
- Move-in Defect Photos
- Contracts tsconfig
- Stock Demo Photos
- Frontend Rules
- MCP Config
- Lease Flags
- Lease Answer Key
- Web index.html
- CLAUDE.md
- Doc Update Rule
- Layering Rule
- Slice Rule
- Out of Scope
- pnpm Workspace

## God Nodes (most connected - your core abstractions)
1. `Button()` - 71 edges
2. `DesignPage()` - 60 edges
3. `AppError` - 54 edges
4. `lucide-react` - 43 edges
5. `react` - 41 edges
6. `Spinner()` - 31 edges
7. `Room` - 31 edges
8. `vitest` - 28 edges
9. `Skeleton()` - 25 edges
10. `Badge()` - 24 edges

## Surprising Connections (you probably didn't know these)
- `Lease clause 9: as-is, waived move-in inspection, tenant liable for all damage` --semantically_similar_to--> `MoveMate product (renter move-in proof)`  [INFERRED] [semantically similar]
  apps/api/demo-assets/demo-lease.pdf → docs/SPEC.md
- `MoveMate favicon (house with checkmark)` --conceptually_related_to--> `MoveMate product (renter move-in proof)`  [INFERRED]
  apps/web/public/favicon.svg → docs/SPEC.md
- `Lease clause 9: as-is, waived move-in inspection, tenant liable for all damage` --conceptually_related_to--> `Phase 4 Report (frozen versioned snapshot)`  [INFERRED]
  apps/api/demo-assets/demo-lease.pdf → docs/SPEC.md
- `Stretch Slice 8 contract analysis` --references--> `Demo lease PDF (Nordhaven Rentals, invented)`  [EXTRACTED]
  docs/PLAN.md → apps/api/demo-assets/demo-lease.pdf
- `Bedroom stock photo (web demo): modern bedroom with pink tufted headboard, wall-mounted TV, wooden desk, sheer curtains, hardwood floor` --semantically_similar_to--> `Bedroom stock photo (demo-assets copy): modern bedroom with pink tufted headboard`  [INFERRED] [semantically similar]
  apps/web/public/demo/bed_room_stock_original.jpg → demo-assets/bed_room_stock_original.jpg

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **MoveMate five-phase flow** — docs_spec_prepare_checklist, docs_spec_before_photos, docs_spec_move_in_photos, docs_spec_report, docs_spec_settle_in [EXTRACTED 1.00]
- **Phase transition mechanism** — docs_plan_phase_model, docs_spec_moveevent, docs_spec_bounded_contexts [INFERRED 0.85]
- **MoveMate demo room photos** — demo_assets_kitchen_stock_original, demo_assets_bedroom_movein_defects, demo_assets_living_room_movein_defects [INFERRED 0.75]

## Communities (78 total, 10 thin omitted)

### Community 0 - "Guidance API"
Cohesion: 0.05
Nodes (41): getPrepareGuidance(), getProviders(), getSelection(), listProgress(), setProgress(), setSelection(), progressParamsSchema, selectionParamsSchema (+33 more)

### Community 1 - "Open Items Status UI"
Cohesion: 0.08
Nodes (32): OpenItemsStatus(), OpenItemsStatusProps, openItemsText(), plural(), RoomChecksSectionProps, StepperProps, StepState, Tabs() (+24 more)

### Community 2 - "Guidance/Findings Tests"
Cohesion: 0.10
Nodes (25): ai, comparedMove(), oneFinding, app, createMove(), uploadBefore(), uploadPhoto(), kitchenMove() (+17 more)

### Community 3 - "Web Dependencies"
Cohesion: 0.05
Nodes (42): dependencies, class-variance-authority, cn, lucide-react, @movemate/contracts, radix-ui, react, react-dom (+34 more)

### Community 4 - "API Dependencies"
Cohesion: 0.05
Nodes (39): dependencies, drizzle-orm, express, @movemate/contracts, multer, pg, sharp, zod (+31 more)

### Community 5 - "Answer Controls"
Cohesion: 0.10
Nodes (28): AnswerControl(), AnswerControlProps, AnswerOption, ChecklistDrawer(), ChecklistDrawerProps, ChecklistPanel(), ChecklistPanelProps, groupByCategory() (+20 more)

### Community 6 - "Inspection Prompts & Photo Strips"
Cohesion: 0.13
Nodes (21): COMPARED_PHOTOS_PER_ROOM, Marker, markers(), MoveInPhotoStrips(), MoveInPhotoStripsProps, MoveInRoomCard(), MoveInRoomCardProps, plural() (+13 more)

### Community 7 - "Add Finding Form"
Cohesion: 0.11
Nodes (23): AddFindingForm(), AddFindingFormProps, CreateMoveFields(), CreateMoveFieldsProps, Editing, FindingRow(), resolve(), submit() (+15 more)

### Community 8 - "Demo Lease Contract"
Cohesion: 0.07
Nodes (35): Demo lease PDF (Nordhaven Rentals, invented), Lease clause 9: as-is, waived move-in inspection, tenant liable for all damage, Lease clause 5: deposit 1780 EUR, deductions at landlord discretion, Lease clause 10: landlord entry, notice where possible, Lease notice and termination clauses (3, 4.2, 11), React Root Mount, MoveMate favicon (house with checkmark), Context Dependency Table (+27 more)

### Community 9 - "Findings Tab & Move-in Board"
Cohesion: 0.13
Nodes (20): FindingsTab(), FindingsTabProps, MoveInBoard(), Body(), BodyProps, MoveInRoomDialog(), MoveInRoomDialogProps, RoomTab (+12 more)

### Community 10 - "Tooling & ESLint"
Cohesion: 0.07
Nodes (31): devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, pdfkit, typescript (+23 more)

### Community 11 - "Insurance & Settle-in"
Cohesion: 0.12
Nodes (19): InsuranceExplainer(), points, SettleInProgress(), Skeleton(), checklistKey(), SetStatusInput, useSetChecklistStatus(), categoryOrder (+11 more)

### Community 12 - "Room Dialog & Photos"
Cohesion: 0.18
Nodes (23): EnlargeablePhoto(), EnlargeablePhotoProps, BodyProps, RoomDialog(), RoomDialogBody(), RoomDialogProps, RoomDialogShell(), RoomDialogShellProps (+15 more)

### Community 13 - "Report Problems"
Cohesion: 0.11
Nodes (19): ReportProblem(), ReportRoomSection(), SummaryProblemsProps, problemParts, roomSectionId(), aiCustomProblem, aiIssueProblem, baseReport (+11 more)

### Community 14 - "Move Controller"
Cohesion: 0.09
Nodes (17): advance(), create(), getCurrent(), moveIdParamsSchema, relabel(), remove(), sendFile(), upload() (+9 more)

### Community 15 - "Inspection Repository"
Cohesion: 0.09
Nodes (12): AiFindingDraft, answerCheck(), FindingPhotoLink, FindingRow, insertUserFinding(), insertUserFindingIn(), ProblemInput, RoomCheckRow (+4 more)

### Community 16 - "Design Page & Badges"
Cohesion: 0.08
Nodes (24): PARTNER_TAG, allHandled, badgeVariants, baseFinding, buttonSizes, buttonVariants, colorTokens, designChecklist (+16 more)

### Community 17 - "Report Snapshot"
Cohesion: 0.12
Nodes (17): buildSnapshot(), dueDate(), findingText(), hasContent(), problemSource(), toProblem(), toRoom(), toWatchList() (+9 more)

### Community 18 - "App & Demo Routes"
Cohesion: 0.14
Nodes (12): createApp(), demoRouter, guidanceRouter, app, inspectionRouter, moveRouter, photosRouter, upload (+4 more)

### Community 19 - "AI Prompts"
Cohesion: 0.13
Nodes (19): BASELINE_SYSTEM_PROMPT, baselineUserText(), COMPARE_SYSTEM_PROMPT, compareUserText(), imageRange(), analyzeRoom(), compareRoom(), cutSummary() (+11 more)

### Community 20 - "Report Service"
Cohesion: 0.13
Nodes (15): generate(), getById(), getLatest(), getSummary(), toReport(), buildSummary(), checklist, photo() (+7 more)

### Community 21 - "Photo Attach Field"
Cohesion: 0.13
Nodes (16): PhotoAttachField(), PhotoAttachFieldProps, Thumb(), CheckAnswer, options, RoomCheckAnswer(), onChange(), save() (+8 more)

### Community 22 - "Compare Tests"
Cohesion: 0.17
Nodes (19): ai, aiFailure(), applyEvent, RawFinding, acceptedFormats, assertAttachable(), assertRoomHasSpace(), getFilePath() (+11 more)

### Community 23 - "Error Handler"
Cohesion: 0.12
Nodes (14): errorHandler(), ErrorResponse, isMalformedJsonBody(), toErrorResponse(), ErrorCode, statusByCode, appThrowing(), fetchMock (+6 more)

### Community 24 - "Demo Service"
Cohesion: 0.12
Nodes (14): DEMO_ASSETS_DIR, getLeaseFile(), LEASE_FILENAME, app, keyText, app, createMove(), png() (+6 more)

### Community 25 - "shadcn Config"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 26 - "Header Nav & Alerts"
Cohesion: 0.22
Nodes (13): HeaderNav(), links, Alert(), AlertDescription(), AlertTitle(), alertVariants, PhotosPanel(), PreparePhase() (+5 more)

### Community 27 - "Problem Source"
Cohesion: 0.10
Nodes (17): ProblemSourceBadge(), guidanceProgressSchema, checkSourceSchema, roomCheckStatusSchema, checkAnswerLabels, ProblemSource, problemSourceLabels, problemSources (+9 more)

### Community 28 - "Summary Checklist"
Cohesion: 0.19
Nodes (14): Rows(), SummaryChecklist(), SummaryChecklistProps, SummaryProblems(), SummaryRoomChecks(), SummarySection(), problemThumbnails(), SummaryView() (+6 more)

### Community 29 - "Inspection Contracts"
Cohesion: 0.10
Nodes (20): AnswerRoomCheck, BaselineResult, baselineResultSchema, CompareResult, compareResultSchema, CreateFinding, CreateRoomCheck, createRoomCheckSchema (+12 more)

### Community 30 - "Move Hook & Report Phase"
Cohesion: 0.22
Nodes (11): currentMoveKey, useAdvanceMove(), ReportPhase(), latestReportKey(), useGenerateReport(), useLatestReport(), api, ApiError (+3 more)

### Community 31 - "Inspection Controller"
Cohesion: 0.11
Nodes (7): addFinding(), listFindings(), resolveFinding(), runBaseline(), runCompare(), answerRoomCheckSchema, createFindingSchema

### Community 32 - "Add Room Card"
Cohesion: 0.28
Nodes (11): AddRoomCard(), AddRoomCardProps, RoomSelect(), RoomSelectProps, Select(), SelectContent(), SelectItem(), SelectScrollDownButton() (+3 more)

### Community 33 - "Move Service"
Cohesion: 0.23
Nodes (13): advance(), advanceBlockedMessage, applyEvent(), assertPhaseReached(), create(), eventTable, getById(), getCurrent() (+5 more)

### Community 34 - "Providers & Router"
Cohesion: 0.17
Nodes (9): Providers(), queryClient, router, StartOverButton(), useReset(), rootElement, react-dom, react-router (+1 more)

### Community 35 - "Discount Badge"
Cohesion: 0.20
Nodes (7): CopyCodeButton(), DiscountBadge(), DiscountBadgeProps, Popover(), PopoverContent(), PopoverTrigger(), discountDuration()

### Community 36 - "Report Appendix Tables"
Cohesion: 0.34
Nodes (9): ReportChecksAppendix(), ReportProblemsTable(), Table(), TableBody(), TableCell(), TableHead(), TableHeader(), TableRow() (+1 more)

### Community 37 - "Move Repository"
Cohesion: 0.21
Nodes (3): MoveRow, moves, drizzle-orm

### Community 38 - "Inspection Schema"
Cohesion: 0.13
Nodes (8): findingPhotos, findings, roomChecks, aiStatuses, checkSources, confidences, resolutions, roomCheckStatuses

### Community 39 - "AI Error Alert"
Cohesion: 0.31
Nodes (10): AiErrorAlert(), AiErrorAlertProps, AlertAction(), Spinner(), CompareControls(), CompareControlsProps, roomList(), GenerateReportButton() (+2 more)

### Community 40 - "Report Photo Appendix"
Cohesion: 0.28
Nodes (10): ReportPhotoAppendix(), caption(), ReportPhotoGrid(), ReportPhotoGridProps, ReportView(), StatCard(), StatCardProps, formatDate() (+2 more)

### Community 41 - "Before-Photos Phase"
Cohesion: 0.30
Nodes (9): Stepper(), BeforePhotosPhase(), useRoomChecks(), ChecklistSidebar(), useChecklist(), useStoredFlag(), MovePhasePage(), countOpenPrepare() (+1 more)

### Community 42 - "Baseline Panel"
Cohesion: 0.21
Nodes (6): BaselinePanel(), checksKey(), useAddRoomCheck(), useAnswerRoomCheck(), useDeleteRoomCheck(), useRunBaseline()

### Community 43 - "TS Base Config"
Cohesion: 0.14
Nodes (13): compilerOptions, isolatedModules, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUncheckedIndexedAccess, noUnusedLocals (+5 more)

### Community 44 - "Guidance Repository"
Cohesion: 0.18
Nodes (4): guidanceProgress, providerSelections, checklistStatuses, providerCategories

### Community 45 - "Photo Grid & Cards"
Cohesion: 0.35
Nodes (11): PhotoGrid(), CardDescription(), CardFooter(), Empty(), EmptyDescription(), EmptyHeader(), EmptyMedia(), emptyMediaVariants (+3 more)

### Community 46 - "Summary Actions"
Cohesion: 0.45
Nodes (8): SummaryActions(), SummarySectionProps, TipCard(), Card(), CardContent(), CardHeader(), CardTitle(), DemoPage()

### Community 47 - "Contracts Package"
Cohesion: 0.15
Nodes (12): dependencies, zod, devDependencies, typescript, exports, typescript, zod, name (+4 more)

### Community 48 - "Env & Drizzle Config"
Cohesion: 0.23
Nodes (6): app, env, envSchema, optionalString, parseEnv(), validEnv

### Community 49 - "Inspection Schemas"
Cohesion: 0.17
Nodes (8): baselineOutputSchema, checkIdParamsSchema, CompareOutput, compareOutputSchema, findingIdParamsSchema, aiStatusSchema, confidenceSchema, MAX_CHECK_LENGTH

### Community 50 - "Migration Tests"
Cohesion: 0.24
Nodes (5): migration, migration, db, pool, pg

### Community 51 - "Provider List"
Cohesion: 0.31
Nodes (7): ProviderCategoryList(), ProviderCategoryListProps, ProviderOption, ProviderRow(), ProviderRowProps, RadioGroup(), RadioGroupItem()

### Community 52 - "Checkbox & Demo Data"
Cohesion: 0.22
Nodes (6): Checkbox(), Separator(), demoListing, bedroom, kitchen, radix-ui

### Community 53 - "Photos Repository"
Cohesion: 0.20
Nodes (3): NewPhoto, PhotoRow, photos

### Community 54 - "OpenRouter Client"
Cohesion: 0.33
Nodes (9): Attempt, AttemptInput, CompleteJsonInput, extractJson(), httpError(), isRecord(), Message, readContent() (+1 more)

### Community 55 - "Landing Visuals"
Cohesion: 0.36
Nodes (6): InteractiveBackground(), Point, Logo(), LogoMark(), LogoProps, LandingPage()

### Community 56 - "Web tsconfig"
Cohesion: 0.22
Nodes (8): compilerOptions, jsx, lib, paths, types, extends, include, ../../tsconfig.base.json

### Community 57 - "Photo Contracts"
Cohesion: 0.29
Nodes (6): photoSchema, PhotoStage, photoStages, RelabelPhoto, relabelPhotoSchema, rooms

### Community 58 - "Room Check Repo"
Cohesion: 0.40
Nodes (6): addCheck(), answerCheck(), linkedPhotos(), listChecks(), listFindings(), toRoomCheck()

### Community 59 - "Finding Repo"
Cohesion: 0.40
Nodes (6): addFinding(), assertNotCheckProblem(), deleteFinding(), findingById(), getFindingRow(), resolveFinding()

### Community 60 - "Report Repository"
Cohesion: 0.33
Nodes (3): insertReport(), ReportRow, reports

### Community 61 - "API tsconfig"
Cohesion: 0.33
Nodes (5): compilerOptions, types, extends, include, ../../tsconfig.base.json

### Community 62 - "Photo Uploader"
Cohesion: 0.47
Nodes (5): PhotoUploader(), addFiles(), onDrop(), removeDraft(), uploadAll()

### Community 63 - "Move Contracts"
Cohesion: 0.40
Nodes (4): CreateMove, createMoveSchema, moveSchema, phaseSchema

### Community 64 - "Move-in Defect Photos"
Cohesion: 0.67
Nodes (4): Bedroom move-in photo with synthetic defects (ceiling water stain, floor scratches, wall scuff, bed stain), Kitchen stock original photo (clean white cabinets, stainless appliances, granite counters, wood floor), Living room move-in photo with synthetic defects (ceiling water stain, wall crack and hole, carpet stain), Move-in defect documentation demo (before vs move-in photo comparison)

### Community 65 - "Contracts tsconfig"
Cohesion: 0.50
Nodes (3): extends, include, ../../tsconfig.base.json

### Community 66 - "Stock Demo Photos"
Cohesion: 0.67
Nodes (3): Bedroom stock photo (web demo): modern bedroom with pink tufted headboard, wall-mounted TV, wooden desk, sheer curtains, hardwood floor, Kitchen stock photo (web demo): white cabinets, stainless steel fridge, gas range and microwave, granite countertop, dark wood floor, Bedroom stock photo (demo-assets copy): modern bedroom with pink tufted headboard

### Community 67 - "Frontend Rules"
Cohesion: 0.67
Nodes (3): Frontend Rules (tokens, /design), /design living design system, Landing page (hero with interactive canvas)

## Knowledge Gaps
- **56 isolated node(s):** `npx`, `@movemate/contracts`, `zod`, `@types/express`, `@types/multer` (+51 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 530 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `pdfkit` connect `Demo Service` to `Tooling & ESLint`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **What connects `npx`, `@movemate/contracts`, `zod` to the rest of the system?**
  _56 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Guidance API` be split into smaller, more focused modules?**
  _Cohesion score 0.05141242937853107 - nodes in this community are weakly interconnected._
- **Why does `react` connect `Add Finding Form` to `Open Items Status UI`, `Web Dependencies`, `Answer Controls`, `Inspection Prompts & Photo Strips`, `Findings Tab & Move-in Board`, `Room Dialog & Photos`, `Design Page & Badges`, `Photo Attach Field`, `Header Nav & Alerts`, `Move Hook & Report Phase`, `Add Room Card`, `Providers & Router`, `Discount Badge`, `Report Appendix Tables`, `Before-Photos Phase`, `Summary Actions`, `Provider List`, `Checkbox & Demo Data`, `Landing Visuals`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Should `Open Items Status UI` be split into smaller, more focused modules?**
  _Cohesion score 0.0786308973172988 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `AI Error Alert` to `Add Room Card`, `Open Items Status UI`, `Discount Badge`, `Web Dependencies`, `Answer Controls`, `Inspection Prompts & Photo Strips`, `Add Finding Form`, `Insurance & Settle-in`, `Room Dialog & Photos`, `Report Problems`, `Summary Actions`, `Design Page & Badges`, `Provider List`, `Checkbox & Demo Data`, `Photo Attach Field`, `Landing Visuals`, `Header Nav & Alerts`, `Move Hook & Report Phase`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Should `Guidance/Findings Tests` be split into smaller, more focused modules?**
  _Cohesion score 0.09830866807610994 - nodes in this community are weakly interconnected._