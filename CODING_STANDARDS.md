# SmartTabs Coding Standards

**Applies to:** Source, tests, build configuration, extension manifest, documentation, and release automation  
**Default language:** Strict TypeScript

## 1. Engineering principles

- Correctness and recoverability before cleverness.
- Pure domain logic; side effects behind narrow adapters.
- Explicit contracts at every trust boundary.
- Small modules with one reason to change.
- Tests describe behavior, especially failure and restart behavior.
- No speculative abstraction: extract only when a stable boundary or repeated behavior exists.
- A production build with warnings is not “done.”

## 2. Toolchain baseline

Phase 1 pins exact compatible versions and commits the lockfile. The intended stack is React 19, TypeScript, Vite, Tailwind CSS v4, Zustand, Lucide React, a schema validator, ESLint, Prettier, Vitest, Testing Library, and Playwright/Chromium for extension tests.

Required scripts:

```text
dev             local extension build/watch
build           clean production build
format          apply formatting
format:check    verify formatting
lint            lint with zero warnings
typecheck       TypeScript without emit
test            unit/integration/component tests
test:coverage   gated coverage suite
test:e2e        real extension smoke/regression suite
check           format:check + lint + typecheck + test + build
package         verified store archive
```

Do not introduce a runtime dependency when a small platform function is clearer. New dependencies require purpose, bundle impact, license, maintenance, and extension-CSP review.

## 3. TypeScript

- Enable `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `useUnknownInCatchVariables`, `noImplicitOverride`, and unused checks.
- Never use `any` in application code. Use `unknown`, validate, then narrow.
- Prefer `type` for unions/data shapes and `interface` only for intentionally extensible contracts.
- Use discriminated unions for state and results.
- Parse external data at boundaries; TypeScript casts do not validate runtime values.
- Avoid non-null assertions. If an invariant is real, express it through construction or a guard.
- Prefer immutable inputs/outputs and `readonly` collections in domain functions.
- Expected failures return typed results; exceptions represent unexpected or adapter failures and are normalized at a boundary.
- All exported functions have explicit return types. Public asynchronous functions include `Promise<...>`.

```ts
type Result<T, E extends AppError = AppError> =
  | { ok: true; value: T }
  | { ok: false; error: E };
```

## 4. Naming

| Item | Convention | Example |
| --- | --- | --- |
| React component/type/class | PascalCase | `WorkspaceCard` |
| Function/variable/hook | camelCase | `launchWorkspace`, `useLaunchJob` |
| Constant | camelCase unless truly global scalar | `defaultLaunchDelayMs` |
| Environment/build constant | SCREAMING_SNAKE_CASE | `BUILD_CHANNEL` |
| Component file | PascalCase | `WorkspaceCard.tsx` |
| Non-component file | kebab-case | `normalize-url.ts` |
| Test | source name + `.test` | `normalize-url.test.ts` |
| E2E spec | behavior + `.spec` | `launch-workspace.spec.ts` |
| Message command | domain.action | `launch.start` |
| Event | domain.pastTense | `workspace.changed` |
| Storage key | namespaced lowercase | `workspace:<id>` |
| CSS token | semantic kebab | `--color-text-muted` |

- Boolean names begin with `is`, `has`, `can`, `should`, or an imperative setting such as `showNotifications`.
- Include units: `delayMs`, `durationMs`, `sizeBytes`.
- Event handlers use `handle...` internally and `on...` for props.
- Avoid generic `data`, `item`, `manager`, `helper`, or `utils` when a domain name exists.

## 5. Module rules

- Use path aliases for stable roots; relative imports are limited to the same feature/module.
- No feature may import another feature’s private components or store. Shared behavior moves to domain, services, hooks, or components deliberately.
- Domain modules import no React, Chrome, DOM, storage, or date/time globals.
- UI imports no raw Chrome API except entry-point-safe platform glue approved by architecture.
- Infrastructure does not import feature UI.
- Barrel files are limited to intentional public APIs and must not create cycles.
- One primary exported component or concept per file. Small private helpers may stay colocated.
- Keep most source files under roughly 300 lines; split by responsibility, not arbitrary line count.

Boundary rules are enforced by ESLint rather than relying only on review.

## 6. React

- Function components and hooks only.
- Rendering is pure; effects synchronize with external systems and are not used to derive ordinary state.
- Prefer local state. Zustand stores exist for cross-route UI state or application query coordination, not every field.
- Select the smallest Zustand slice and use stable selectors to avoid broad rerenders.
- Forms keep a draft, validate through the same schema family used at the background boundary, and submit explicit commands.
- Do not mirror props into state without a documented draft/reset requirement.
- Memoization follows measurement or clear identity needs. Do not blanket `memo`, `useMemo`, or `useCallback`.
- Lazy-load feature routes and heavyweight charts/editors. Error boundaries exist per entry point and at risky lazy boundaries.
- Lists use stable domain IDs, never array indexes when order can change.
- Effects and subscriptions always return cleanup when applicable.

## 7. Styling and components

- Use semantic design tokens from `UI_GUIDELINES.md`; raw hex values and arbitrary shadows/radii are blocked outside token/theme files.
- Use Tailwind utilities for composition and component variants for repeatable contracts. Avoid unreadable, duplicated class strings.
- Class merging uses one approved utility.
- Shared UI primitives own focus, disabled, loading, error, and dark-theme states.
- Do not create a new button/input/modal/card implementation inside a feature.
- User content is rendered as text. `dangerouslySetInnerHTML` is prohibited unless a reviewed sanitization use case is documented.
- CSS motion respects reduced-motion settings.

## 8. Chrome extension rules

- Manifest V3 only. Manifest permissions match shipped features exactly.
- Register background listeners synchronously at module top level; defer work inside the callback.
- Never assume the service worker remains alive or that module memory survives.
- Persist operation IDs and checkpoints before irreversible/repeated side effects.
- Wrap Chrome APIs in typed adapters that normalize `runtime.lastError`/rejections.
- Runtime messages and storage payloads are untrusted and schema-validated.
- Do not use long timers for scheduling; use alarms and persisted reconciliation.
- Do not inject content scripts or request host permissions without an approved product/security change.
- No remote scripts, remote module imports, `eval`, `new Function`, or inline executable script.
- Every privileged operation checks that its caller and payload are expected.

## 9. Storage and data changes

- Repositories are the only modules that know physical storage keys.
- Every record includes ID, timestamps, record version, and sync metadata as defined by architecture.
- User-visible save success occurs only after the repository confirms the write.
- Update related indexes/projections through the journaled mutation flow.
- Every schema change includes migration, rollback/recovery behavior, fixtures, and documentation.
- Do not store `undefined`; schemas define omitted/default behavior explicitly.
- Bound arrays and histories. No append-only storage without retention.
- Imports validate fully before mutation and never silently coerce unsupported future schemas.

## 10. Errors, logging, and privacy

- Error codes are stable, namespaced strings such as `storage.quota_exceeded` or `launch.invalid_url`.
- UI copy is mapped from error codes; adapters do not write user-facing prose.
- Catch errors only to add context, translate, recover, or clean up. Never empty-catch.
- Production logs exclude full URLs, notes, backup contents, tokens, and general browsing data.
- Diagnostic context uses IDs, counts, durations, and redacted hosts only when necessary.
- User-visible unexpected errors include a correlation ID and recovery action.
- Development assertions may be verbose; production output remains minimal.

## 11. Testing standards

### Test pyramid

- Many fast domain/use-case tests.
- Focused repository, message, component, and adapter integration tests.
- A smaller real-browser extension E2E suite covering critical journeys.

### Required behaviors

- Happy, validation, partial failure, cancellation, retry, and worker-restart paths.
- Current and previous storage migrations plus corrupt/future data.
- Duplicate rules with query, fragment, slash, ports, and case fixtures.
- Time-zone and daylight-saving schedule fixtures.
- Keyboard and accessible-name behavior for shared components.
- Popup and 100-site launch performance budgets.

### Test quality

- Test externally observable behavior, not implementation details.
- Deterministic clock, UUID, and Chrome adapters; no arbitrary sleeps.
- A regression test accompanies every bug fix when practical.
- Snapshots are limited to small stable structures; they do not replace assertions.
- Coverage gates prioritize critical branches. Global percentage alone is insufficient.

## 12. Performance standards

- Set bundle budgets per entry point and fail CI on regression beyond the agreed tolerance.
- Popup must not import options-only modules through a barrel.
- Read the popup projection in one storage request when possible.
- Batch/coalesce noncritical analytics writes; flush explicit user saves.
- Build search indexes from saved data, not Chrome browsing history.
- Virtualize only after measured/list threshold; preserve keyboard and screen-reader behavior.
- Avoid repeated `tabs.query` inside the per-site loop; snapshot once and update the in-memory index as tabs open.
- Measure before adding memoization or caches; every cache defines invalidation and memory bound.

## 13. Documentation

- Exported domain/application contracts receive concise TSDoc when behavior or constraints are not obvious.
- Comments explain why, invariants, browser quirks, and recovery—not syntax.
- README covers install, local development, checks, packaging, permissions, and architecture links.
- Architecture-impacting changes add/update an ADR.
- User-facing changes update the changelog in the same pull request.
- Never duplicate a rule across documents without linking to its canonical source.

## 14. Git and review

- Use focused commits with imperative messages; Conventional Commits are recommended for automated changelog/versioning.
- Never commit secrets, unpacked profiles, generated store archives, coverage, or local environment files.
- Pull requests state scope, screenshots for UI, test evidence, data migration impact, permission impact, performance impact, and rollback plan.
- Required review focus: correctness/recovery, privacy/permissions, accessibility, contracts, tests, and bundle impact.
- A feature is complete only when code, tests, states, documentation, and production build all agree.

## 15. Definition of done

- Acceptance criteria are met and traceable.
- Formatting, lint, strict typecheck, tests, build, manifest validation, and relevant E2E pass with zero warnings.
- Loading, empty, error, partial-success, and permission-denied states exist where applicable.
- Keyboard, focus, reduced motion, contrast, and screen-reader names are verified.
- No new permission, dependency, persistent field, message, or storage key lacks explicit review.
- Performance budgets remain within tolerance.
- Recovery behavior is tested for every durable mutation.

