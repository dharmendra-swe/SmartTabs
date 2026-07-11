# SmartTabs Delivery Roadmap

**Method:** One bounded module at a time, with a gate before dependent work begins  
**Release strategy:** Local-first core MVP, then automation/productivity, then cloud/intelligence  
**Canonical scope:** `PRD.md`

## 1. Delivery rules

1. Each phase starts only when its entry criteria are met.
2. Every phase produces code/artifacts, tests, documentation, and a review note—not code alone.
3. Security, accessibility, performance, data migration, and failure states are designed with each module rather than postponed to a final cleanup sprint.
4. “Complete” means production build verified in Chrome. A component rendering in development is intermediate progress.
5. Scope changes update PRD and relevant architecture decisions before implementation.
6. Exact dates are set after Phase 1 estimates and team capacity are known; sequence and gates are authoritative meanwhile.

## 2. Stage map

| Stage | Outcome | Release |
| --- | --- | --- |
| 0. Product foundation | Approved product/architecture/design/engineering contracts | Planning |
| 1. Platform foundation | Buildable, testable MV3 extension shell | 1.0 |
| 2. Data foundation | Versioned repositories, migrations, recovery, import/export core | 1.0 |
| 3. Design foundation | Accessible primitives and application shell | 1.0 |
| 4. Workspace management | Complete workspace and site CRUD | 1.0 |
| 5. Launch engine | Reliable sequential, duplicate-aware tab orchestration | 1.0 |
| 6. User surfaces | Onboarding, dashboard, popup, search, settings | 1.0 |
| 7. Insights and resilience | Local analytics, backup UX, recovery/error experience | 1.0 |
| 8. Release hardening | Performance, QA, security, packaging, store assets | 1.0 |
| 9. Automation | Schedules, startup, commands, context menu | 1.x |
| 10. Expansion | Templates, sync/cloud, teams, AI, cross-browser | Later |

## 3. Phase 0 — Product foundation

**Status:** Documentation drafted; stakeholder decisions remain.

### Deliverables

- `PRD.md`
- `ARCHITECTURE.md`
- `UI_GUIDELINES.md`
- `CODING_STANDARDS.md`
- `ROADMAP.md`
- Raw source vision retained in `WorkingFlow.md` for provenance

### Gate P0

- MVP scope and explicit non-goals approved.
- Notification permission decision assigned.
- Workspace storage remains local-first; sync boundary approved or deferred.
- Schedule/startup release placement confirmed.
- Duplicate canonicalization ADR scheduled before launch engine.
- Product/store name availability checked before brand asset production.

## 4. Phase 1 — Platform foundation

### Modules

1. Initialize package metadata, exact dependency versions, lockfile, and supported Node version.
2. Configure strict TypeScript, Vite multi-entry build, React, Tailwind tokens, lint, format, Vitest, and extension E2E harness.
3. Create popup, options, and background entry points with error boundaries.
4. Create minimal MV3 manifest with only 1.0-approved permissions.
5. Add path/boundary lint rules and environment-safe Chrome adapter types.
6. Add CI checks, deterministic production build, archive inspection, and bundle budgets.

### Verification

- Clean install builds from documented commands.
- Unpacked extension loads without manifest/runtime errors.
- Popup, options, and worker each execute a smoke test.
- Production CSP contains no unsafe/remote code allowance.
- CI `check` passes with zero warnings.

### Gate P1

A tagged scaffold build loads on the pinned minimum and current stable Chrome; entry-point bundle budgets and permission list are recorded.

## 5. Phase 2 — Domain and storage foundation

### Modules

1. Define schemas/types for settings, workspaces, sites, schedules, activities, jobs, backup envelope, and errors.
2. Implement pure URL validation/normalization and record invariants.
3. Implement Chrome storage adapters and sharded repositories.
4. Implement journaled multi-key mutations, indexes/projections, quarantine, and recovery snapshots.
5. Implement schema version metadata and migration runner with fixtures.
6. Implement popup projection and bounded activity retention.
7. Implement export serialization and import preview/validation (commit UX comes later).

### Verification

- Round-trip property/fixture tests cover all records.
- CRUD cannot leave orphaned index entries under injected write failures.
- Previous, corrupt, empty, oversized, and future schemas produce defined outcomes.
- Popup projection can be fully rebuilt from canonical records.
- No domain record is persisted through Zustand.

### Gate P2

Storage contract and ADR-001 are approved; recovery drill restores the last known-good dataset after a simulated mid-mutation failure.

## 6. Phase 3 — Design system and application shell

### Modules

1. Implement semantic light/dark tokens, typography, spacing, radius, shadow, and reduced motion.
2. Build shared primitives: Button, IconButton, Input, Textarea, Select, Checkbox, Radio, Switch, Badge, Card, Tabs, Tooltip, Menu.
3. Build overlays/feedback: Dialog, Drawer, Toast, Alert, Progress, Skeleton, EmptyState, ErrorState.
4. Build application components: SearchField, Sidebar, TopBar, Breadcrumbs, WorkspaceCard, WebsiteRow, StatCard, LaunchProgress.
5. Build responsive options shell and minimal popup shell.
6. Add an internal component gallery route available only in development.

### Verification

- Keyboard and accessible-name component tests pass.
- Both themes, reduced motion, high contrast, long content, and 200% zoom pass visual/manual checks.
- No raw color/radius/shadow values exist outside token sources.
- Popup shell meets its initial render budget.

### Gate P3

Component API and visual QA checklist are approved before feature screens create presentation variants.

## 7. Phase 4 — Workspace and website management

### Modules

1. Workspace application use cases and message contracts.
2. Workspace list, create, edit, duplicate, reorder, favorite, archive, delete, and recovery behavior.
3. Website add/edit/enable/pin/reorder/delete with inline validation.
4. Multi-URL paste parser and duplicate-within-workspace warnings.
5. Category/tag presentation, advanced launch settings, unsaved-change protection.
6. Search index/query behavior for workspaces and saved sites.

### Verification

- CRUD behavior and injected storage failures have integration tests.
- 500-site list remains usable and keyboard accessible.
- Reorder works without pointer drag-and-drop.
- Invalid URL, long text, empty workspace, and duplicate names/sites have explicit UX.

### Gate P4

A user can manage all 1.0 workspace/site fields in the options UI without direct storage access from React.

## 8. Phase 5 — Open workspace engine

### Precondition decisions

- Approve ADR-002 worker-suspension checkpoint strategy.
- Approve ADR-003 duplicate canonicalization fixtures.
- Confirm notification permission or use in-app completion only.

### Modules

1. Typed Tabs/Windows adapters and fake implementations.
2. Launch planner: validation, filtering, stable order, default resolution, and duplicate classification.
3. Durable job repository, workspace lock, operation idempotency, progress, cancellation, and reconnect.
4. Sequential tab creation, delay resolution, window modes, pinning, and focus policy.
5. Per-site typed outcomes and partial-failure aggregation.
6. Recent activity/analytics update and optional notification adapter.
7. Recovery/reconciliation for interrupted `opening` tasks.

### Verification

- Unit matrix covers exact/origin-path/open-new duplicate modes and URL edge cases.
- 100-site real-browser launch remains responsive and produces one terminal outcome per enabled site.
- Cancel, UI close, worker restart, tab API rejection, missing window, and repeated launch are tested.
- The engine snapshots open tabs once per launch and updates its index in memory.

### Gate P5

The core engine passes reliability, idempotency, recovery, and performance budgets before any automation can invoke it.

## 9. Phase 6 — Onboarding, dashboard, popup, and settings

### Modules

1. First-run routing and four-step onboarding.
2. Dashboard with quick launch, recent, favorites, and compact local statistics.
3. Popup projection loader, search, recent/favorites, quick launch, live job progress, and options link.
4. Settings for theme, animation, default delay, duplicate strategy, notification preference, language foundation, and data controls.
5. Theme bootstrap that avoids a flash and follows system changes.
6. Keyboard navigation and shortcuts within UI (Chrome commands remain Phase 9).

### Verification

- New-user journey completes in under 60 seconds during usability test.
- Warm popup target is under 100 ms on the reference machine and p95 target under 200 ms.
- Popup works from projection when the worker is cold and reconnects to active jobs.
- All settings persist, validate, and recover from corrupt values.

### Gate P6

All primary 1.0 journeys are usable end to end with no hidden editor functionality in the popup.

## 10. Phase 7 — Analytics, backup, and resilience UX

### Modules

1. Privacy-bounded activity aggregates and analytics use cases.
2. Analytics dashboard: totals, activity trend, most-used saved sites/workspaces, average launch time, recent outcomes.
3. Accessible chart/table fallbacks and range selection.
4. Export download and import preview/merge/replace commit workflows.
5. Pre-import/reset recovery snapshots, restore UI, corruption notice, and quarantine export.
6. Global/local error boundaries, permission guidance, favicon fallback, retry and partial-success details.
7. Reset, analytics disable/clear, retention enforcement, and local-data explanation.

### Verification

- Analytics-disabled mode performs no analytics writes.
- Export/import round trip preserves supported records and excludes transient jobs/caches.
- Invalid/future/oversized imports cannot mutate canonical data.
- Recovery works after forced failure at every commit stage.
- Charts pass keyboard/screen-reader checks through equivalent textual data.

### Gate P7

The 1.0 feature set is functionally complete, recoverable, and privacy review has approved stored fields and retention.

## 11. Phase 8 — Release hardening and Chrome Web Store

### Quality workstreams

- Functional regression: all PRD journeys.
- Edge cases: invalid URLs, empty/500-site workspaces, quota/write failures, corrupt data, permission denial, offline use, rapid repeated actions, and worker suspension.
- Performance: popup, options startup, 100-site launch, 500-site list, bundle sizes, memory, and storage write volume.
- Security: permission review, CSP, message sender/schema checks, dependency/secret/license scans, archive contents, import fuzzing, and URL redaction.
- Accessibility: automated checks plus keyboard, screen reader, zoom, contrast, reduced motion, and forced-colors manual review.
- Compatibility: pinned minimum and current stable Chrome on supported OS set.

### Release assets

- Production README and troubleshooting guide.
- Changelog, license, privacy policy, and terms if legally required.
- Store description, short description, keywords/category, permission explanations, and support contact.
- Final icons and screenshots at required store sizes, promotional art if used, and optional demo video/GIF.
- Versioning/release notes, reproducible zip, checksum, and rollback/hotfix plan.

### Gate R1 — 1.0 release

- PRD release criteria pass.
- No open critical/high defect; medium defects are explicitly accepted with owner/reason.
- Store listing accurately matches shipped permissions and data behavior.
- Release candidate is smoke-tested from the exact archive uploaded to the store.

## 12. Phase 9 — Productivity automation (1.x)

Automation ships after the core launch engine proves stable.

### Modules

1. Schedule domain, recurrence/time-zone engine, alarms reconciliation, next/last-run UX, and missed-run policy.
2. Startup automation, cooldown, opt-in confirmation, and update/reload protection.
3. Chrome commands mapped to selected/favorite workspaces with conflict/help UX.
4. Optional context-menu quick launch/save after separate permission review.
5. Automation audit outcomes and master disable control.

### Gate R2

Time-zone/DST, browser restart, missed alarm, duplicate alarm, extension update, and permission-loss tests pass. Automation never creates an untracked duplicate launch.

## 13. Phase 10 — Premium expansion (later)

Each item requires its own discovery, privacy model, architecture decision, and release plan:

- Workspace templates.
- Small-preference sync, then optional encrypted cloud backup.
- Shared/team workspaces and conflict resolution.
- AI-assisted workspace creation from user-provided URLs.
- Saved-site health checks.
- Usage suggestions based only on explicit, privacy-reviewed data.
- Edge/Brave/Opera compatibility and Firefox architecture assessment.

Do not add account/cloud infrastructure “for future use” to the local-first releases.

## 14. Cross-cutting test matrix

| Capability | Unit | Integration | Component | Extension E2E | Performance/resilience |
| --- | ---: | ---: | ---: | ---: | ---: |
| Storage/migrations | Yes | Yes | Recovery UI | Smoke | Quota/corruption/restart |
| Workspace/site CRUD | Yes | Yes | Yes | Yes | 500 sites/write faults |
| Launch engine | Yes | Yes | Progress | Yes | 100 sites/restart/cancel |
| Search | Ranking | Projection | Yes | Smoke | 500 sites |
| Theme/settings | Defaults | Persistence | Yes | Smoke | No-flash startup |
| Import/export | Schema | Transaction | Yes | Yes | Fuzz/oversize/rollback |
| Analytics | Aggregation | Retention | Chart/table | Smoke | Disabled/large history |
| Automation | Recurrence | Alarms | Yes | Yes | DST/restart/duplicates |

## 15. Working method for AI-assisted implementation

Use senior-engineer roles as review lenses, not disconnected code generators. For each module:

1. **Product/architecture:** restate scope, dependencies, data/messages, failure modes, and acceptance tests.
2. **UX/design:** specify all states and accessibility behavior using the shared system.
3. **Implementation:** build the smallest vertical slice behind typed interfaces.
4. **Chrome/platform:** verify MV3 lifecycle, permissions, and API failure behavior.
5. **Test:** cover domain, integration, UI, and relevant real-browser paths.
6. **Security/privacy:** audit inputs, outputs, permissions, logs, CSP, and stored data.
7. **Performance:** measure budgets and entry-point impact.
8. **Refactor/document:** remove duplication, freeze public contracts, update ADR/changelog/docs.

The next module does not begin with unresolved critical review findings. Parallel work is safe only when contracts are already approved and file ownership does not overlap.

## 16. Immediate next action

After Phase 0 decisions are approved, execute **Phase 1 only**: scaffold the production toolchain and prove a minimal popup/options/background build. Do not implement feature UI or business logic until Gate P1 passes.

