# SmartTabs

> Your workspace, ready in one click.

SmartTabs is a local-first Manifest V3 Chrome extension for organizing and reliably launching repeatable groups of websites. The project is currently at the Phase 0 product and architecture gate; implementation begins only after the documented open decisions are approved.

## Foundation documents

- [Product requirements](PRD.md)
- [Technical architecture](ARCHITECTURE.md)
- [UI guidelines](UI_GUIDELINES.md)
- [Coding standards](CODING_STANDARDS.md)
- [Delivery roadmap](ROADMAP.md)
- [Original working notes](WorkingFlow.md)

## Current status

The repository contains an early empty folder scaffold and the completed Phase 0 documentation. The next approved unit of work is Roadmap Phase 1: establish the production toolchain and prove minimal popup, options, and background entry points before feature development.

## Product boundaries

- Local-first and useful without an account.
- Lightweight popup for search and launching.
- Full workspace management in the options application.
- Background-owned privileged operations and durable launch orchestration.
- Least-privilege Chrome permissions.
- No remote code, browsing-history collection, or page-content inspection in the 1.0 scope.

Implementation, development, testing, and packaging commands will be added during Phase 1 when exact dependencies are selected and pinned.
