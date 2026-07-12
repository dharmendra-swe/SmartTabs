# SmartTabs Technical Architecture

**Status:** Phase 0 architecture baseline  
**Architecture style:** Local-first, event-driven Chrome Extension (Manifest V3)  
**Primary rule:** UI requests intent; the background worker owns privileged operations and durable orchestration.

## 1. System context

```text
User
  |-- toolbar --> Popup (fast launcher)
  |-- options --> Options application (management)
  |-- command / alarm / startup
                      |
React UI --> UI stores --> typed client --> Runtime messages / Ports
                                             |
                                      Background service worker
                                      | launch coordinator
                                      | schedule coordinator
                                      | notification adapter
                                      | migration/recovery coordinator
                                             |
                 Chrome tabs/windows | storage | alarms | notifications
                                             |
                               Local aggregates and audit summaries
```

Chrome may stop the Manifest V3 service worker between events. Memory is a cache, never the sole source of truth. Durable work is checkpointed and every event handler is restart-safe.

## 2. Architectural boundaries

| Layer | Owns | Must not own |
| --- | --- | --- |
| Entry points | Bootstrapping, error boundary, dependency composition | Business rules |
| Features | Screens, feature-specific components, feature state | Direct privileged Chrome calls |
| Shared UI | Accessible primitives and presentation contracts | Product workflows |
| Client stores | View state, cached query state, optimistic UI | Canonical durable records |
| Domain | Entities, policies, validation, pure use cases | React or Chrome APIs |
| Application services | Use-case orchestration and typed results | Markup |
| Infrastructure | Chrome adapters, storage repositories, clocks, IDs | UI decisions |
| Background | Privileged event handling and durable queues | Component state |

Dependencies point inward: entry points/features -> application/domain; infrastructure implements domain/application interfaces. Chrome globals are isolated behind adapters and mocked in tests.

## 3. Runtime surfaces

### Popup

- Read-optimized projection: favorites, recent workspaces, search index, compact statistics.
- May launch or open the options app; cannot edit records.
- Loads no chart/editor/scheduler bundles.
- Uses a port during an active launch and falls back to request/response messages.

### Options application

- React single-page application with lazy feature routes.
- Owns onboarding, dashboard, workspace/site management, schedules, analytics, settings, backup, and about.
- Writes through typed application clients; it does not call `chrome.storage` directly.

### Background service worker

- Registers all Chrome listeners synchronously at top level.
- Validates every message and routes it to a use case.
- Owns tab/window calls, launch concurrency, alarm reconciliation, notifications, migrations, and recovery.
- Keeps no required timer solely in memory. Short launch delays may use timers while active; persisted checkpoints and idempotency prevent duplicate work after restart.

## 4. Recommended source structure

```text
src/
  entrypoints/
    background.ts
    popup.tsx
    options.tsx
  background/
    listeners/
    launch/
    scheduling/
    notifications/
  features/
    onboarding/
    dashboard/
    workspaces/
    schedules/
    analytics/
    settings/
    backup/
  components/
    ui/
    feedback/
    layout/
  domain/
    workspace/
    launch/
    schedule/
    settings/
    analytics/
  services/
    clients/
    use-cases/
  infrastructure/
    chrome/
    storage/
    logging/
  stores/
  hooks/
  schemas/
  types/
  constants/
  utils/
  styles/
  assets/
tests/
  unit/
  integration/
  extension/
public/
  icons/
  screenshots/
```

Existing empty folders/files may be replaced in Phase 2. Folders are created when their first owned module is implemented; empty placeholder files are not architecture.

## 5. Data model

Timestamps are ISO 8601 UTC strings. IDs are UUIDs. Record `version` is an integer incremented on mutation; `schemaVersion` versions serialized shapes. `sync` is metadata, not a promise that a record is stored in `chrome.storage.sync`.

```ts
type BaseRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  sync: {
    state: 'local' | 'pending' | 'synced' | 'conflict';
    deviceId?: string;
    revision?: string;
  };
};

type Workspace = BaseRecord & {
  name: string;
  description?: string;
  icon: { kind: 'emoji' | 'lucide'; value: string };
  colorToken: string;
  favorite: boolean;
  archived: boolean;
  order: number;
  launchDefaults: {
    delayMs?: number;
    duplicateStrategy?: DuplicateStrategy;
    openMode: 'currentWindow' | 'newWindow';
  };
  sites: Website[];
};

type Website = BaseRecord & {
  title: string;
  url: string;
  categoryId?: string;
  tags: string[];
  notes?: string;
  faviconUrl?: string;
  enabled: boolean;
  pinned: boolean;
  order: number;
  delayMs?: number;
  duplicateStrategy?: DuplicateStrategy;
  openMode?: 'inherit' | 'currentWindow' | 'newWindow';
};

type DuplicateStrategy = 'focusExisting' | 'skipExisting' | 'openNew';

type Schedule = BaseRecord & {
  workspaceId: string;
  enabled: boolean;
  localTime: string;
  daysOfWeek: number[];
  timeZone: string;
  lastRunKey?: string;
  nextRunAt?: string;
};
```

Categories and tags begin as lightweight values/projections. Promote them to independent records only when they gain behavior requiring identity. Avoid speculative tables.

## 6. Storage architecture

### Storage areas

| Area | Data | Reason |
| --- | --- | --- |
| `chrome.storage.local` | Workspace shards, schedules, activity buckets, recovery snapshots, launch jobs | Capacity, durability, local-first behavior |
| `chrome.storage.sync` | Small preferences only, if enabled after quota testing | Cross-device convenience; never assumed available |
| `chrome.storage.session` | Rebuildable caches and transient UI/session hints | Cleared across browser sessions; not durable |

### Logical keys

```text
meta                       -> schema version, migration status, device ID
settings                   -> Settings record
workspace:index            -> ordered workspace summaries
workspace:<workspaceId>    -> complete workspace record
schedule:index             -> schedule summaries
schedule:<scheduleId>      -> schedule record
activity:<YYYY-MM>         -> bounded aggregate/activity bucket
launch:<operationId>       -> launch job checkpoint and result
recovery:latest            -> encrypted-at-rest-by-browser best-effort snapshot metadata/data
popup:projection           -> denormalized, rebuildable launcher data
```

Sharding avoids rewriting all workspaces for a one-site edit and reduces write amplification. Repositories serialize writes per key. Multi-key mutations use a small journal:

1. Write operation intent and previous affected values to a recovery record.
2. Apply validated writes.
3. Re-read critical keys and validate invariants.
4. Mark operation committed, rebuild projections, then expire the journal.

Chrome storage is not a relational transaction system. “Atomic” in product copy means the application can roll forward or restore a known-good snapshot.

### Schema and migrations

- `meta.schemaVersion` is independent from extension version.
- Migrations run in the background before normal commands are accepted.
- Each migration is deterministic, idempotent, fixture-tested, and writes a backup first.
- A future schema is opened read-only and produces an upgrade-required error; it is never downgraded.
- Invalid records are moved to a quarantine payload with reason codes, then excluded from normal projections.

### Retention

- Launch job details: 7 days; final summary may be aggregated before deletion.
- Recent activity: 90 days by default, bounded per day.
- Aggregate monthly counters: 13 months.
- Recovery snapshot: latest successful pre-migration/import/reset snapshot plus one previous snapshot, subject to size limits.
- Diagnostic logs: in-memory/development by default; no persistent full-URL logs.

## 7. State flow

Three categories prevent state confusion:

1. **Durable domain state:** repositories in Chrome storage are canonical.
2. **Server-like query state:** UI caches background responses and invalidates by revision/event.
3. **Ephemeral UI state:** open dialogs, filters, draft fields, and selection remain local to a feature or small Zustand store.

Zustand is not the database. Persist middleware is prohibited for domain records. Forms use drafts and save explicit commands.

On mutation:

```text
UI command -> validate client shape -> background validates again
-> use case -> repository/journal -> projection rebuild
-> DomainChanged event with revision -> UI invalidates/refetches
```

Optimistic UI is limited to reversible, low-risk presentation mutations. Deletes, imports, launches, and scheduling report authoritative background results.

## 8. Communication contracts

All runtime traffic uses discriminated, schema-validated envelopes:

```ts
type Request<TType extends string, TPayload> = {
  protocolVersion: 1;
  requestId: string;
  type: TType;
  payload: TPayload;
};

type Response<T> =
  | { requestId: string; ok: true; data: T; revision?: string }
  | { requestId: string; ok: false; error: AppError };

type AppError = {
  code: string;
  message: string;
  retryable: boolean;
  details?: Record<string, unknown>;
};
```

Example command names use `domain.action`: `workspace.list`, `workspace.save`, `launch.start`, `launch.cancel`, `backup.previewImport`. Event names use past tense: `workspace.changed`, `launch.progress`, `launch.completed`.

- Unknown types and protocol versions are rejected.
- The handler checks `sender.id === chrome.runtime.id` and expected extension origin/context.
- Errors crossing the boundary are serialized; raw exceptions and stacks are development-only.
- Ports are for progress streams, not required durability. Reconnection requests current job state by operation ID.

## 9. Launch engine

### Pipeline

```text
authorize trigger
-> load immutable workspace snapshot
-> validate and normalize enabled sites
-> stable sort by order
-> resolve workspace/site defaults
-> snapshot open tabs once
-> classify duplicates
-> create durable launch job
-> focus selected existing result
-> sequentially open missing sites
-> apply pinning and capture per-site outcome
-> finalize counters and elapsed time
-> update recents/analytics/projection
-> optional notification and completion event
```

### Job model and idempotency

Each launch receives an `operationId` and immutable site tasks. Task states are `pending | opening | opened | focused | skipped | failed | cancelled`. Before creating a tab, a task records its intent. After creation it records the returned tab ID. On recovery, an `opening` task rechecks open tabs before retrying.

Only one active launch per workspace is allowed by default. A second request returns the active job unless the caller explicitly cancels and restarts. Global launch concurrency begins at one and is configurable only after performance testing.

### URL normalization and duplicates

- Parse with `URL`; allow only HTTP(S).
- Lowercase hostname, remove default ports, preserve path case, and remove fragment for matching.
- `exactUrl`: normalized origin + path + query.
- `originAndPath`: normalized origin + path, ignoring query and fragment.
- A trailing slash policy and optional sensitive/tracking parameter rules are frozen with fixtures before implementation.
- Do not transform the actual navigation URL beyond validated security normalization; comparison keys are separate.

### Delay

Delay is applied between creations, not before the first site. The effective value is site override -> workspace default -> global setting. Cancellation is checked before and after every delay and Chrome call.

## 10. Scheduling and startup

- Alarms are hints, not exact cron guarantees. On install/startup and every alarm, reconcile persisted schedules with registered alarms.
- Compute next occurrence in the schedule’s IANA time zone; daylight-saving transitions must have tests.
- Persist a run key such as `<scheduleId>:<local-date>:<local-time>` before launch to prevent duplicates.
- Startup automation has a cooldown and does not run on extension update/reload unless explicitly intended.
- Missed-run policy defaults to “skip” rather than unexpectedly opening tabs hours later.

## 11. Error flow and recovery

| Failure | Behavior |
| --- | --- |
| Invalid site URL | Exclude site, report validation failure, continue |
| `tabs.create/update` failure | Record site failure and continue |
| Permission unavailable | Typed permission error with settings/retry guidance |
| Worker/UI disconnect | Job continues/checkpoints; UI reconnects by operation ID |
| Storage write/quota failure | Keep prior state, stop mutation, show recovery/export action |
| Corrupt record | Quarantine, rebuild projection, expose recovery notice |
| Invalid import | Preview fails with field-level reasons; no writes |
| Alarm failure/drift | Reconcile next wake; show degraded automation status |
| Favicon failure | Use deterministic generated fallback; never block content |

Use typed `Result` values for expected failures. Unexpected exceptions go to a top-level boundary that assigns a correlation ID, redacts context, and returns a stable error.

## 12. Security architecture

- Default deny in message router and URL parser.
- No HTML injection; user content renders as text.
- Favicon strategy uses Chrome-provided or explicitly safe sources; arbitrary remote image URLs are not trusted by default.
- No remote code or runtime CDN dependencies.
- Package lockfile is committed; CI runs dependency, license, secret, and bundle inspection.
- Production builds disable verbose logs and exclude source maps from the store archive unless approved.
- Extension CSP and web-accessible resources are minimal and tested.
- Permission additions require a PR section explaining feature, data accessed, alternative considered, and store disclosure impact.

## 13. Testing architecture

- **Unit:** domain policies, URL keys, schema validation, migrations, recurrence, reducers, and use cases with fake adapters.
- **Integration:** repositories against a Chrome storage mock; message router; launch coordinator with deterministic clocks/tabs.
- **Component:** accessible behavior, forms, keyboard navigation, and states.
- **Extension E2E:** packed/unpacked extension in real Chromium using a persistent test profile.
- **Resilience:** worker restart during launch, storage quota error, corrupt record, disconnected popup, duplicate launch, and import rollback.
- **Performance:** popup cold/warm marks, 100-site launch, 500-site management list, storage write volume, bundle budgets.

Tests use fake time and seeded UUIDs. Business logic never sleeps in tests.

## 14. Build and release architecture

- TypeScript strict mode; React 19; Vite; Tailwind CSS v4; Zustand; Lucide icons.
- Animation begins with CSS; add a motion library only to routes that need orchestrated transitions and lazy-load it.
- Build emits separate popup, options, and background entry points with deterministic filenames referenced by the manifest.
- CI gates: format, lint, typecheck, unit/integration/component tests, production build, manifest validation, bundle budget, extension E2E smoke, archive inspection.
- The release artifact is generated from a clean, tagged commit and its checksum is recorded.

Exact dependency versions are selected and pinned during scaffold implementation, after compatibility checks; architecture documents do not use floating “latest” versions.

## 15. Architecture decision records to create

- ADR-001: local versus sync storage boundaries.
- ADR-002: launch checkpoint strategy under MV3 worker suspension.
- ADR-003: URL duplicate canonicalization.
- ADR-004: notification permission in 1.0.
- ADR-005: feature-folder versus layer-folder imports and enforced boundaries.
- ADR-006: analytics retention and privacy model.

