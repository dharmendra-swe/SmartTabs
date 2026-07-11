# SmartTabs Product Requirements

**Status:** Approved foundation for implementation  
**Product:** SmartTabs  
**Positioning:** A workspace operating system for Chromium browsers  
**Primary promise:** Your workspace, ready in one click.

## 1. Product vision

SmartTabs turns repeatable sets of websites into reliable, launchable workspaces. It should feel like a focused productivity application—not a utility popup—and combine the clarity of Notion, the speed of Raycast, and the polish of Linear without copying any product.

The product wins when a user can install it, create a useful workspace, and launch it in less than one minute, then trust it to repeat that launch without duplicate tabs, browser stalls, or lost data.

## 2. Problem

Knowledge workers repeatedly open the same groups of websites for development, office work, research, marketing, or personal routines. Bookmarks do not preserve launch behavior, tab pinning, order, delays, duplicate rules, schedules, or usage context. Opening large groups manually is slow; opening them all at once can make Chrome unresponsive.

## 3. Goals and success metrics

### Product goals

- Make recurring browser setups a single action.
- Keep launches predictable through validation, ordering, delays, duplicate handling, and pinning.
- Provide a fast launcher in the popup and a complete management experience in the options page.
- Store user data locally by default and remain useful offline.
- Establish versioned data and stable internal contracts so future sync, templates, collaboration, and AI features do not require a rewrite.

### Release success metrics

| Metric | Target |
| --- | --- |
| First useful workspace | Median under 60 seconds after onboarding starts |
| Warm popup interactive time | Under 100 ms on the reference machine; p95 under 200 ms |
| Launch reliability | At least 99% of valid, enabled sites produce a documented outcome |
| Large launch | 100 sites processed without freezing the UI or losing queue state |
| Data durability | No silent data loss; corrupt records are quarantined and recoverable |
| Accessibility | WCAG 2.2 AA for the options UI and popup |
| Core unit tests | At least 90% branch coverage for launch, storage migration, import, and duplicate logic |

Metrics are measured after the production build loads from an unpacked extension on the supported Chrome baseline. Performance budgets are gates, not marketing claims.

## 4. Target users

### Primary: repeat-workflow professional

Developers, designers, marketers, operators, students, and researchers who open the same five to one hundred sites for recurring contexts.

### Secondary: routine automator

Users who want a workspace opened at browser startup, on a schedule, or with a keyboard command.

### Not initially targeted

Managed enterprise deployment, shared team workspaces, mobile browsers, remote cloud accounts, and general browser session restoration.

## 5. Product principles

1. **Fast path first:** launching is always easier than editing.
2. **User control:** automation is opt-in, previewable, and reversible.
3. **Local first:** core features work without an account or network service.
4. **Explain outcomes:** opened, focused, skipped, and failed sites are distinguishable.
5. **Progressive disclosure:** advanced per-site behavior does not burden first-time creation.
6. **Least privilege:** request only permissions required by shipped features.
7. **No silent failure:** errors produce a recovery path and useful diagnostics without exposing sensitive browsing data.

## 6. Scope

### MVP (release 1.0)

- First-run onboarding.
- Workspace create, read, update, duplicate, archive, favorite, reorder, and delete.
- Website create, read, update, reorder, enable/disable, and delete.
- One-click sequential launch with URL validation and configurable delays.
- Exact URL/origin duplicate detection with focus, skip, or open-new strategies.
- Current-window and new-window launch modes.
- Per-site pinning.
- Search across workspace name, website title, URL host, category, and tags.
- Favorites and recent workspaces.
- Import/export of a validated, versioned JSON backup.
- Light, dark, and system themes.
- Local aggregate analytics, notifications, and clear partial-failure summaries.
- Popup launcher and options dashboard.

### Productivity release (1.x)

- Scheduled launches using Chrome alarms.
- Startup automation with a safety confirmation and cooldown.
- Configurable keyboard shortcuts mapped to favorite workspaces.
- Workspace templates and context-menu entry points.
- Data migration tooling and conflict-aware sync for small preferences if proven safe.

### Future / explicitly out of 1.0 scope

- Accounts, cloud backup, team sharing, paid plans, and remote telemetry.
- AI-generated workspaces and browsing-based recommendations.
- Cross-browser certification.
- Broken-link crawling.
- Arbitrary script execution or page-content inspection.

Future items must pass privacy, permission, and product review before entering a release.

## 7. Information model

- **Workspace:** a named, ordered collection of websites plus launch defaults and presentation metadata.
- **Website:** a validated URL and its launch overrides.
- **Schedule:** an opt-in trigger that references a workspace; it does not duplicate workspace data.
- **Settings:** global defaults and user preferences.
- **Activity:** bounded, local launch summaries used for recent items and analytics.
- **Template:** a reusable workspace definition without activity history.

Canonical field definitions, storage ownership, retention, and migrations live in `ARCHITECTURE.md`.

## 8. Core journeys and acceptance criteria

### Install and first launch

1. Chrome opens the onboarding route once.
2. The user sees the value proposition and a single primary action.
3. The user names a workspace and adds sites by pasting one or more URLs.
4. SmartTabs normalizes valid URLs and identifies invalid or repeated entries inline.
5. Saving leads to the workspace detail page with a prominent launch action.

**Accepted when:** a new user can create and launch a two-site workspace without opening settings or reading documentation.

### Launch a workspace

1. User launches from popup, dashboard, workspace detail, command, schedule, or startup trigger.
2. The background worker loads an immutable workspace snapshot.
3. The engine validates and sorts enabled sites.
4. It takes one snapshot of relevant open tabs and applies the configured duplicate rule.
5. Existing sites are focused or skipped; missing sites enter the sequential queue.
6. Sites open with resolved delays and pin rules.
7. A structured result records opened, focused, skipped, failed, cancelled, and elapsed counts.
8. UI receives progress while connected and can retrieve the final result after reconnecting.

**Accepted when:** every enabled site has exactly one terminal result and a partial failure does not cancel unrelated sites.

### Manage a workspace

**Accepted when:** create, edit, duplicate, reorder, archive, favorite, and delete are keyboard-accessible; destructive actions are undoable where practical or require confirmation when recovery is not available.

### Import and recovery

1. Import parses into memory before any write.
2. Schema and version are validated.
3. User sees counts, conflicts, warnings, and the selected merge/replace behavior.
4. A pre-import recovery snapshot is stored locally.
5. The operation commits atomically at the application level or restores the snapshot.

**Accepted when:** malformed or unsupported data cannot overwrite current data and the last known-good dataset remains recoverable.

### Schedule and startup (1.x)

**Accepted when:** automation is opt-in; displays its next run; tolerates service-worker restarts; avoids double execution with a persisted idempotency key; and can be disabled globally.

## 9. Functional requirements

### Workspace and website management

- Workspace name is required, trimmed, and unique only as a user experience warning—not a storage invariant.
- URLs accept `http:` and `https:` only in 1.0; other schemes are rejected with a reason.
- Order is explicit and stable.
- Deletion cascades only to data owned by that workspace; aggregate analytics remain anonymized.
- Archive hides a workspace from default launch surfaces without deleting it.

### Launch behavior

- Default delay is configurable from 0 to 10,000 ms; per-site delay may override it.
- A launch can be cancelled; already-created tabs remain open.
- Duplicate comparison modes are `exactUrl` and `originAndPath`; query/hash handling is defined in architecture and covered by tests.
- When focusing multiple existing tabs, the last explicitly selected result becomes active; SmartTabs must not rapidly steal focus for every match.
- Queue progress must survive UI closure. Service-worker suspension may pause work; persisted checkpoints allow safe continuation without duplicating completed items.

### Search

- Search is local, debounced in the options page, and immediate for the small popup dataset.
- Results prioritize exact workspace/title matches, then prefix, then token/host/tag matches.
- Search does not request page content or browsing history.

### Analytics

- Analytics are local aggregates, disabled by a single setting, and clearable.
- Store workspace/site IDs and counters, not page titles from outside saved workspaces or general browsing history.
- A failed launch still records operational timing and outcome counts when analytics are enabled.

## 10. Non-functional requirements

### Reliability

- All stored records are schema-validated at boundaries.
- All mutations update `updatedAt`, increment record `version`, and use an operation ID.
- Migrations are ordered, idempotent, backed up, and never run from UI render code.
- Background event listeners register synchronously at module evaluation.

### Performance

- Popup initial JavaScript target: 100 KB gzip excluding shared framework chunks; total target 180 KB gzip.
- No charting, editor, animation library, or full workspace dataset in the popup startup path.
- Long lists virtualize after 100 visible items.
- Storage writes are coalesced, but user-confirmed saves flush before reporting success.
- Launch processing is O(open tabs + workspace sites), excluding Chrome API cost.

### Accessibility and localization

- Complete keyboard navigation, visible focus, semantic controls, labeled icons, reduced-motion support, and 4.5:1 normal-text contrast.
- Dates, times, counts, and schedules use `Intl`; no concatenated UI sentences that block future localization.
- English ships first. The message catalog structure is created before feature UI.

### Compatibility

- Manifest V3 only.
- The minimum supported Chrome version is pinned during Phase 1 after API and store-policy verification; unsupported versions receive no best-effort promise.
- Options page supports 1024 px and wider as the primary desktop layout, and remains usable at 768 px.

## 11. Security and privacy requirements

- No remote code, `eval`, inline executable script, or dynamically downloaded application logic.
- Restrictive extension Content Security Policy.
- No content scripts or broad host permissions for the MVP.
- Treat imported JSON, stored data, runtime messages, URLs, favicon sources, and notification text as untrusted.
- Validate message sender, message type, schema, and authorization; return typed errors.
- Do not log full exported data, URLs with credentials/tokens, or user-entered notes.
- Strip URL credentials and reject control characters. Redact known sensitive query parameters in diagnostics.
- Export is an explicit user gesture. Reset and replace-import require confirmation and a recovery snapshot.
- Privacy policy clearly describes local storage, optional sync if added, retention, permissions, and deletion.

## 12. Permission budget

Potential permissions are reviewed feature by feature:

| Permission | Justification | Release |
| --- | --- | --- |
| `storage` | Persist settings and product data | 1.0 |
| `tabs` | Inspect/focus duplicates and create/pin tabs | 1.0 |
| `notifications` | Optional launch completion summaries | 1.0 if retained after UX testing |
| `alarms` | Reliable scheduled wake-ups | 1.x |
| `contextMenus` | Optional quick-save/launch actions | 1.x |

Commands and startup/runtime events are declared only when their feature ships. Host permissions, browsing history, page content, and identity are outside the 1.0 permission budget.

## 13. Release criteria

Version 1.0 is releasable only when:

- Every MVP acceptance criterion has an automated or documented manual test.
- Production build contains no high/critical dependency or extension security finding.
- Storage migration and recovery drills pass using current, previous, corrupt, oversized, and future-version fixtures.
- Permission copy, privacy policy, store listing, icons, screenshots, and accessibility review are complete.
- Unpacked-install smoke tests pass on the pinned minimum and current stable Chrome.
- The release archive is reproducible, versioned, and contains no source maps, secrets, test data, or development-only permissions unless explicitly approved.

## 14. Open product decisions

The following must be resolved before their dependent phase starts:

- Whether notifications add enough value to justify their permission in 1.0.
- Whether `chrome.storage.sync` is limited to preferences or deferred entirely; workspace payloads default to local storage.
- Exact duplicate canonicalization for trailing slashes and selected query parameters.
- Whether schedule/startup automation enters 1.0 or the first 1.x release after reliability testing.
- Final product name and trademark/store-name availability.

