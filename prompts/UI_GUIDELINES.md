# SmartTabs UI Guidelines

**Design direction:** Calm, premium, minimal, fast, and positive  
**Product model:** A compact desktop productivity application  
**References:** Arc, Linear, Notion, Raycast, Apple Settings, and Vercel as mood references only

## 1. Experience principles

1. **Launch is the hero action.** Every launcher surface makes the next useful action obvious.
2. **Dense, not cramped.** Use space to establish hierarchy while keeping frequent actions within reach.
3. **Calm confidence.** Prefer neutral surfaces, crisp type, restrained blue emphasis, and almost no decoration.
4. **Progressive complexity.** New users see title and URLs first; advanced launch rules appear on demand.
5. **Visible system status.** Saving, launching, partial failure, offline behavior, and recovery are explicit.
6. **Keyboard complete.** Pointer interaction is never the only path.
7. **Motion explains.** Animation clarifies origin, hierarchy, or state; it never delays a command.

Avoid generic “Chrome extension” styling, Bootstrap/Material visual conventions, heavy gradients, glass effects, excessive shadows, novelty illustrations in working screens, and icon-only primary actions.

## 2. Surfaces and layout

### Popup

- Fixed target width: 360 px; useful height up to 560 px before internal scrolling.
- One compact header, search, favorites/recent results, and launch status.
- No navigation sidebar, charts, workspace editor, schedule editor, backup flow, or complex modal.
- Primary click launches. Secondary affordance opens the full options application.
- Initial skeleton appears only if cached projection is unavailable after the first paint.

### Options application

- Desktop-first responsive shell with 232 px sidebar, top context bar, and content area.
- Content max width: 1280 px; forms max width: 720 px; reading/settings sections max width: 800 px.
- At 768–1023 px, sidebar becomes collapsible. Below 768 px, use a drawer and single-column forms.
- Persistent navigation: Dashboard, Workspaces, Schedules, Analytics, Settings. Templates appears when shipped; About belongs under Settings or the footer.

### Page anatomy

```text
Page title + concise context                         Primary action
Optional tabs / filters / search
Main content
Contextual empty, loading, error, or recovery state
```

Do not stack multiple competing primary buttons. Destructive actions belong in an overflow menu or danger zone.

## 3. Design tokens

Tokens are semantic CSS custom properties and Tailwind theme aliases. Components never use raw palette values except inside the token definition file.

### Color

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--color-bg` | `#F8FAFC` | `#0B1120` | Application canvas |
| `--color-surface` | `#FFFFFF` | `#111827` | Cards, menus, dialogs |
| `--color-surface-subtle` | `#F1F5F9` | `#172033` | Secondary regions |
| `--color-text` | `#0F172A` | `#F8FAFC` | Primary text |
| `--color-text-muted` | `#64748B` | `#94A3B8` | Supporting text |
| `--color-border` | `#E2E8F0` | `#263247` | Standard border |
| `--color-primary` | `#2563EB` | `#60A5FA` | Primary actions/focus |
| `--color-primary-hover` | `#1D4ED8` | `#93C5FD` | Primary hover |
| `--color-accent` | `#4F46E5` | `#818CF8` | Rare secondary accent |
| `--color-success` | `#15803D` | `#4ADE80` | Success status |
| `--color-warning` | `#B45309` | `#FBBF24` | Warning status |
| `--color-danger` | `#DC2626` | `#F87171` | Destructive/error |
| `--color-focus` | `#2563EB` | `#93C5FD` | Focus ring |

Status meaning never relies on color alone. Text, icon, or pattern accompanies it. Contrast is verified in both themes; the values above may be adjusted only through a token-level accessibility review.

### Typography

- Font stack: `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`.
- Use the system fallback until a bundled Inter subset proves worth its bytes. Never fetch fonts remotely.
- Base options size: 14 px / 20 px. Popup: 13 px / 18 px where space is constrained.
- Scale:

| Token | Size / line | Weight | Use |
| --- | --- | --- | --- |
| `display` | 32 / 40 | 650 | Onboarding only |
| `h1` | 24 / 32 | 650 | Page title |
| `h2` | 18 / 26 | 650 | Major section |
| `h3` | 15 / 22 | 600 | Card/section title |
| `body` | 14 / 20 | 400 | Default |
| `small` | 12 / 17 | 400 | Metadata |
| `label` | 13 / 18 | 550 | Form label |

Use sentence case. Avoid all caps except short badges. Use tabular numbers for statistics and durations.

### Spacing

4 px base grid: `1=4`, `2=8`, `3=12`, `4=16`, `5=20`, `6=24`, `8=32`, `10=40`, `12=48`, `16=64`.

- Control gaps: 8–12 px.
- Card padding: 16 px compact, 20–24 px standard.
- Page section gap: 24–32 px.
- Page edge padding: 20 px popup; 24 px tablet; 32 px desktop.

### Radius

| Token | Value | Use |
| --- | --- | --- |
| `sm` | 6 px | Badges, compact controls |
| `md` | 10 px | Inputs, buttons, menus |
| `lg` | 14 px | Cards, popovers |
| `xl` | 18 px | Dialogs, onboarding panels |
| `full` | 999 px | Avatars, status dots, pills |

The 18 px brand radius is reserved for prominent containers; applying it everywhere weakens hierarchy.

### Shadow

- `xs`: `0 1px 2px rgb(15 23 42 / 0.05)` for raised controls.
- `sm`: `0 6px 18px rgb(15 23 42 / 0.08)` for menus/popovers.
- `md`: `0 20px 48px rgb(15 23 42 / 0.14)` for dialogs.
- Cards use borders before shadows. Dark theme uses stronger borders and lower-opacity shadows.

### Motion

- Durations: 100 ms micro feedback, 160 ms controls, 220 ms panels, 280 ms onboarding only.
- Easing: `cubic-bezier(0.2, 0, 0, 1)` enter/move; `ease-in` exit.
- Animate opacity and transform. Avoid layout-heavy width/height animation in lists.
- Respect `prefers-reduced-motion: reduce` by removing nonessential movement and using instant state transitions.
- Launch actions respond immediately; progress animation must never extend actual completion time.

### Icons

- Lucide is the single general icon family.
- Default size 16 px in controls, 18–20 px in navigation, 24 px in empty states.
- Stroke width is visually consistent (normally 1.75–2).
- Icons inherit semantic foreground color. Do not mix filled, emoji, and outline icons in one control family.
- Icon-only buttons require an accessible name and tooltip; destructive icons require clear confirmation context.

## 4. Core component contracts

### Button

Variants: `primary`, `secondary`, `ghost`, `danger`, `link`. Sizes: `sm` 32 px, `md` 38 px, `lg` 44 px. A button may show a leading/trailing icon, loading spinner, or shortcut but never change width unpredictably while loading.

- One primary button per local decision area.
- Loading disables repeated submission and preserves the label context (“Saving…”).
- Disabled controls are visually distinct and expose a reason nearby when non-obvious.

### Icon button

Minimum 36 × 36 px in options and 32 × 32 px in the popup. Requires label, tooltip on hover/focus, and visible focus ring.

### Input, textarea, select, checkbox, radio, switch

- Labels stay visible; placeholders are examples, not labels.
- Help text precedes error text in layout; errors link with `aria-describedby`.
- Validate on blur and submit. Avoid noisy validation on the first keystroke.
- Switches apply immediate preferences; checkboxes select values; do not substitute one for the other.
- Native semantics are preferred; custom visuals preserve complete keyboard behavior.

### Card

Variants: standard, interactive, selected, subtle. Interactive cards use a real link/button for their main action; nested actions remain separate and keyboard reachable. Avoid making every dashboard region a floating card.

### Modal/dialog

- Use for short, blocking decisions and destructive confirmation, not full-page editing.
- Focus enters the dialog, remains trapped, and returns to the trigger.
- Escape closes unless an irreversible operation is in progress.
- Mobile/tablet may promote complex dialogs to a full-height sheet.

### Drawer

Used for mobile navigation, filters, and compact contextual editing. It is not the default workspace editor on desktop.

### Toast

- Use for completed, non-blocking outcomes: saved, copied, restored.
- Do not use as the only representation of an error that needs action.
- Default 4 seconds; persistent if action/recovery is required.
- Announce politely; critical errors use assertive live regions sparingly.

### Tooltip

Only supplements concise controls. Never contains required instructions or interactive content. Opens on keyboard focus as well as hover.

### Tabs and navigation

Tabs switch peer views within a page; sidebar items navigate routes. Use roving keyboard focus and the correct ARIA pattern. Do not use tabs as a substitute for filters.

### Search

Includes a search icon, visible accessible label, clear button when populated, result count, and `/` shortcut on supported screens. Preserve the query when navigating back from a result.

### Skeleton and loading

- Skeleton geometry matches final content and appears only when delay is perceptible.
- Never skeleton a button whose action is already usable.
- For mutations, keep existing content and show local progress rather than blanking the page.
- Spinner-only full-page loading is reserved for app initialization and recovery.

## 5. Product components

### Workspace card

Shows icon/color, name, enabled-site count, last launched relative time, favorite state, and a labeled launch button. Overflow contains edit, duplicate, archive, and delete. The card itself may navigate to detail but must not cause accidental launches.

### Website row/card

Default desktop form is a sortable row for scan efficiency: drag handle, favicon fallback, title/host, tags/category, enabled, pinned, delay summary, and overflow. A card form is used in onboarding or narrow layouts. Advanced duplicate/open behavior is summarized, not always expanded.

### Stat card

Shows one metric, time range, and optional trend with text. Avoid decorative mini-charts without a meaningful scale. Zero is valid data, not an empty state.

### Launch progress

Shows workspace, completed/total, current site, cancel action, and outcome counters. Completion distinguishes opened, focused, skipped, and failed. The user can open details for failures.

## 6. Screen specifications

### Welcome/onboarding

- Step 1: concise promise and “Create your first workspace.”
- Step 2: workspace name/icon/color with useful defaults.
- Step 3: paste/add websites; parse lines and show validation inline.
- Step 4: review and launch.
- Progress is visible but the flow remains under four decisions. “Skip” enters a useful empty dashboard.

### Dashboard

- Time-aware greeting without requiring personal data.
- Quick launch favorites, recent workspaces, and compact activity statistics.
- Empty dashboard teaches creation with one example and one primary action.
- Analytics never dominates launching.

### Workspaces

- Search, status filter, sort, grid/list preference, and create action.
- Archived workspaces are behind a filter.
- Bulk actions appear only after explicit selection.

### Workspace detail/editor

- Sticky header with name, site count, save state, and launch.
- Website list is the main content; workspace settings are a secondary panel/section.
- Reordering provides keyboard controls and announces position changes.
- Unsaved changes prompt before navigation.

### Schedules

- List shows workspace, local schedule, time zone, enabled state, last/next run, and health.
- Editor explains that browser scheduling is approximate and requires Chrome to run.
- Automation has a master off switch and a visible audit of recent triggers.

### Analytics

- Range control, headline counters, activity trend, most-used workspaces/sites, and recent launch outcomes.
- Charts have textual summaries/tables and accessible labels.
- Include “stored locally,” disable, export (if applicable), and clear actions.

### Settings

Sections: Appearance, Launch behavior, Notifications, Automation, Language, Data & backup, Advanced/About. Destructive reset is isolated in a danger zone and explains exactly what is removed.

## 7. Feedback states

Every data surface defines:

- **Empty:** explain why and offer one relevant action.
- **Loading:** preserve layout and avoid flicker under 150 ms.
- **Error:** plain-language problem, impact, retry, and recovery/details where useful.
- **Offline:** core local actions remain enabled; only unavailable remote/future features are affected.
- **Partial success:** summarize completed and failed items without labeling the whole action “failed.”
- **Permission denied:** identify the feature affected and provide a safe route to grant or continue without it.

Copy uses direct language: “3 sites could not open” instead of “An unknown error occurred.” Never blame the user.

## 8. Accessibility rules

- Target WCAG 2.2 AA.
- Minimum pointer target 24 × 24 CSS px, with 36 px preferred for frequent actions.
- Focus ring: 2 px token color plus 2 px offset; never remove without an equivalent.
- DOM order follows visual order.
- Drag-and-drop always has move up/down and position controls.
- Avoid single-key shortcuts while typing; show and allow changing Chrome commands where supported.
- Announce launch progress at meaningful intervals, not every rapidly opened tab.
- Theme and status work in forced-colors/high-contrast modes.
- Zoom to 200% remains usable without loss of functionality.

## 9. Content style

- Use verbs for actions: “Create workspace,” “Open 12 sites,” “Export backup.”
- Use “site” in user-facing copy; “website record” is internal language.
- Use “workspace” consistently; do not alternate with session/group/project.
- Confirmation titles name the consequence: “Delete Development workspace?”
- Avoid exclamation points in routine success states.
- Show URLs as normalized hosts in compact UI; full URL remains accessible and editable.

## 10. Visual QA checklist

- Both themes and system theme transition.
- Popup at its exact extension dimensions.
- Options at 768, 1024, 1280, and 1440 px.
- Empty, loading, populated, overflow, error, corrupt-data, and partial-success states.
- Long names, 500 sites, 50 tags, localized expansion, and 200% zoom.
- Keyboard-only, screen-reader names, reduced motion, high contrast, and contrast ratios.
- No layout shift during favicon failure, saving, or launch progress.

