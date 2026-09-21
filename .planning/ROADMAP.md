# Roadmap: Atlas 1.0 (Commercial SaaS Platform Transformation)

## Overview

A comprehensive, production-grade 12-stage execution plan transforming the Atlas platform (formerly PODSAdministrator) into the first commercial SaaS product of Fifteen Miles. The platform retains Google Firebase infrastructure while executing a complete frontend transformation: replacing custom variants with TailwindCSS + shadcn/ui and CSS variables (`globals.css`), modularizing screens into reusable blocks and widget systems, supporting dynamic page instances with full Firestore customization persistence, templates, dynamic sidebars, multi-tenancy, and domain-driven type decoupling.

---

## Milestone 1: Foundation & Architecture (Phases 1-3)
*Status: Completed*

- [x] **Phase 1: Project Audit & Code Mapping** - Catalog scattered queries, data models, and Firebase entrypoints.
- [x] **Phase 2: Base Modular Setup** - Initialize Monorepo workspaces (`apps/web`, `shared`, `firebase`) and feature directories.
- [x] **Phase 3: Database Converters & Schemas** - Establish Zod entity validators and Firestore type converters with native Date support.

---

## Milestone 2: Core SaaS Architecture & Multi-Tenancy (Phases 4-6)
*Status: In Progress / Planned*

- [x] **Phase 4: Centralized Authentication & Multi-Tenancy Shell**
  - **Goal**: Implement decoupled AuthService/AuthRepository layers supporting multi-company, workspace, department, team, and role definitions without breaking existing Eletra users.
  - **Why it exists**: Atlas must support full organization multi-tenancy for commercial SaaS deployment while maintaining 100% backward compatibility.
  - **Dependencies**: Phase 3
  - **Expected architectural outcome**: Clean separation of auth state and tenant context from React components.
  - **Files/modules involved**: `shared/types/auth/`, `apps/web/src/contexts/AuthContext.tsx`, `apps/web/src/repositories/AuthRepository.ts`
  - **Validation checklist**: Login/register flow works for legacy and new tenant structures; build passes.
  - **Estimated complexity**: Medium
  - **Progress tracking**: 1/1 plans complete (04-01 completed)
  - **Plans**:
    - [x] `04-01-PLAN.md` — Decoupled AuthService/AuthRepository and Multi-Tenancy Shell
  - **Risks**: Breaking existing Eletra user session persistence.
  - **Rollback strategy**: Revert AuthContext to previous state adapter fallback.

- [x] **Phase 5: Dynamic Sidebar & Navigation Tree**
  - **Goal**: Replace hardcoded navigation with a dynamic sidebar reflecting company, workspace, permissions, installed modules, pinned pages, favorites, recent pages, templates, and settings.
  - **Why it exists**: Commercial SaaS products require flexible, role-aware, and customizable navigation trees.
  - **Dependencies**: Phase 4
  - **Expected architectural outcome**: Dynamic sidebar provider and components driven by user permissions and workspace state.
  - **Files/modules involved**: `apps/web/src/components/Sidebar/`, `shared/types/workspace/`
  - **Validation checklist**: Sidebar items render dynamically based on active workspace permissions.
  - **Estimated complexity**: Medium
  - **Progress tracking**: 1/1 plans complete
  - **Risks**: Navigation latency on deep permission checks.
  - **Rollback strategy**: Fallback to static default navigation items.
  - **Plans**:
    - [x] `05-01-PLAN.md` — Dynamic Sidebar & Workspace Switcher Integration

- [x] **Phase 6: Domain Types Reorganization & Repository Layer**
  - **Goal**: Completely reorganize the monolithic types file into domain-specific modules (`auth/`, `workspace/`, `page/`, `calendar/`, `crm/`, `asset/`, `task/`, `tracker/`, `automation/`, `reports/`, `testbook/`, `shared/`) with compatibility exports, and deploy abstract Repository structures.
  - **Why it exists**: Scalable commercial SaaS requires clean domain boundaries and decoupled data access.
  - **Dependencies**: Phase 5
  - **Expected architectural outcome**: Modular type definitions and robust repository classes isolating Firestore interactions.
  - **Files/modules involved**: `shared/types/`, `apps/web/src/repositories/`
  - **Validation checklist**: All TypeScript imports resolve correctly without breaking legacy references.
  - **Estimated complexity**: High
  - **Progress tracking**: 1/1 plans complete
  - **Risks**: Circular type imports or broken legacy imports.
  - **Rollback strategy**: Maintain re-export compatibility barrel files at root.
  - **Plans**:
    - [x] `06-01-PLAN.md` — Domain Types Modularization & BaseRepository Pattern

---

## Milestone 3: Complete Frontend Transformation & Design System (Phases 7-9)
*Status: Planned*

- [x] **Phase 7: Design System Migration (TailwindCSS + shadcn/ui + CSS Variables)**
  - **Goal**: Remove custom System Design variants. Adopt TailwindCSS, shadcn/ui, and `globals.css` as the single design token source (`--background`, `--card`, `--sidebar`, `--border`, `--accent`, etc.). Ensure dark/light mode, accent color, and themes work seamlessly.
  - **Why it exists**: Achieving a polished, modern Notion/Linear-grade visual aesthetic across the entire platform.
  - **Dependencies**: Phase 6
  - **Expected architectural outcome**: Centralized token variables in `globals.css` consumed by all UI components without hardcoded values.
  - **Files/modules involved**: `apps/web/src/index.css`, `apps/web/tailwind.config.js`, `apps/web/src/components/ui/`
  - **Validation checklist**: Dark mode, light mode, and custom accents function correctly; zero hardcoded color/spacing in components.
  - **Estimated complexity**: High
  - **Progress tracking**: 1/1 plans complete
  - **Risks**: Visual regressions across legacy pages during variant removal.
  - **Rollback strategy**: Keep legacy CSS utility fallbacks until page refactoring concludes.
  - **Plans**:
    - [x] `07-01-PLAN.md` — TailwindCSS Design Token & shadcn/ui Variables Integration

- [x] **Phase 8: UI Modularization & Reusable Blocks**
  - **Goal**: Break large monolithic pages into reusable modular blocks (`DashboardHeader`, `MetricsGrid`, `RecentActivity`, `QuickActions`, `SidebarSection`, `WorkspaceSwitcher`, `NavigationTree`, `EmptyState`, `LoadingState`, `ErrorState`).
  - **Why it exists**: Reusability and maintainability across the SaaS platform.
  - **Dependencies**: Phase 7
  - **Expected architectural outcome**: Clean, small, modular components under `apps/web/src/components/blocks/`.
  - **Files/modules involved**: `apps/web/src/components/blocks/`, `apps/web/src/pages/`
  - **Validation checklist**: Pages assemble cleanly from modular blocks.
  - **Estimated complexity**: Medium
  - **Progress tracking**: 1/1 plans complete
  - **Risks**: Prop drilling or layout shifts during refactor.
  - **Rollback strategy**: Retain page monolithic wrappers as fallbacks.
  - **Plans**:
    - [x] `08-01-PLAN.md` — UI Modularization & Reusable Blocks Implementation

- [x] **Phase 9: Widget System & Editable Page Instances**
  - **Goal**: Transform pages into instances composed of dynamic widgets (Calendar, Kanban, Rich Text, Metrics, Chart, Activity, Tasks, Documents, Comments, Timeline, Database). Enable full page customization (move, resize, hide, rename, duplicate, delete, icons, colors, layout, order) persisting exclusively to Firestore per page instance while keeping templates immutable.
  - **Why it exists**: Customization is Atlas's core competitive advantage over Notion, ClickUp, and Linear.
  - **Dependencies**: Phase 8
  - **Expected architectural outcome**: Robust widget registry, drag-and-drop grid layout engine, and instance state persistence.
  - **Files/modules involved**: `shared/types/page/`, `shared/types/widget/`, `apps/web/src/components/widgets/`, `apps/web/src/hooks/usePageCustomization.ts`
  - **Validation checklist**: Customizing a page instance persists to Firestore without modifying the underlying template.
  - **Estimated complexity**: High
  - **Progress tracking**: 1/1 plans complete
  - **Risks**: Complex drag-and-drop state sync with Firestore writes.
  - **Rollback strategy**: Disable grid resizing temporarily while maintaining static widget ordering.
  - **Plans**:
    - [x] `09-01-PLAN.md` — Widget System & Page Customization Persistence

---

## Milestone 4: Production Hardening, Cloud Functions & Deployment (Phases 10-12)
*Status: Planned*

- [ ] **Phase 10: Serverless Cloud Functions & PDF Reporting**
  - **Goal**: Relocate sensitive audit logging, alerts, and heavy PDF report rendering to Node.js Puppeteer Cloud Functions.
  - **Why it exists**: Prevent browser freezing and ensure secure server-side execution.
  - **Dependencies**: Phase 9
  - **Expected architectural outcome**: Optimized Cloud Functions triggers and Puppeteer PDF renderer.
  - **Files/modules involved**: `firebase/functions/`, `apps/web/src/utils/reportExporter.ts`
  - **Validation checklist**: PDF reports generate successfully via serverless triggers; client threads remain unblocked.
  - **Estimated complexity**: Medium
  - **Progress tracking**: 0/1 plans complete
  - **Risks**: Cold start delays or memory limits in serverless functions.
  - **Rollback strategy**: Client-side fallback exporter for offline environments.

- [ ] **Phase 11: Emulator Suite & Security Rules Hardening**
  - **Goal**: Configure the local Firebase Emulator Suite and deploy rigorous Firestore security rules enforcing multi-tenant isolation.
  - **Why it exists**: Reliable offline development and bulletproof commercial data security.
  - **Dependencies**: Phase 10
  - **Expected architectural outcome**: `firebase.json` emulator configuration and secure `.rules`.
  - **Files/modules involved**: `firebase.json`, `firestore.rules`, `firestore.indexes.json`
  - **Validation checklist**: Local emulators simulate full offline database; unauthorized tenant access blocked by security rules.
  - **Estimated complexity**: Medium
  - **Progress tracking**: 0/1 plans complete
  - **Risks**: Overly restrictive rules breaking legitimate legacy queries.
  - **Rollback strategy**: Incrementally test rules in emulator test suite.

- [ ] **Phase 12: Atlas 1.0 Production SaaS Deployment**
  - **Goal**: Execute comprehensive test suites (Vitest + Playwright), verify build and linting passes, and deploy decoupled monorepo packages to live Firebase Hosting and Cloud Functions.
  - **Why it exists**: Launch Atlas 1.0 commercially with zero downtime and 100% backward compatibility for existing Eletra users.
  - **Dependencies**: Phase 11
  - **Expected architectural outcome**: Fully deployed commercial SaaS platform.
  - **Files/modules involved**: `DEVOPS.md`, `DEPLOYMENT_GUIDE.md`, CI/CD pipelines
  - **Validation checklist**: Build passes with zero TypeScript/lint errors; all automated tests pass; live deployment verified.
  - **Estimated complexity**: High
  - **Progress tracking**: 0/1 plans complete
  - **Risks**: Production deployment configuration mismatches.
  - **Rollback strategy**: Roll back Firebase hosting deployment version instantly via Firebase CLI.

---

## Detailed Phase Tasks & Validation

### Phase 4: Centralized Authentication & Multi-Tenancy Shell
- **Tasks**:
  1. Create `shared/types/auth/` and `shared/types/workspace/` domain types with compatibility wrappers.
  2. Implement `AuthRepository` and `AuthService` wrapping Firebase Auth.
  3. Update `AuthContext` to expose tenant, company, workspace, and role properties.
- **Validation**: Build passes, existing Eletra logins function correctly alongside new multi-tenant structures.

### Phase 5: Dynamic Sidebar & Navigation Tree
- **Tasks**:
  1. Build dynamic sidebar component consuming workspace, permissions, and favorites.
  2. Add support for pinned pages, recent items, and module navigation sections.
- **Validation**: Sidebar reflects correct permissions and links without hardcoded routes.

### Phase 6: Domain Types Reorganization & Repository Layer
- **Tasks**:
  1. Split `shared/types/index.ts` into domain subdirectories with barrel exports.
  2. Deploy abstract Firestore repository pattern for feature collections.
- **Validation**: All imports resolve; compiler succeeds.

### Phase 7: Design System Migration
- **Tasks**:
  1. Populate `globals.css` with comprehensive CSS design tokens (`--background`, `--card`, `--accent`, etc.).
  2. Configure Tailwind and shadcn/ui integration.
  3. Purge custom component variants and refactor to consume tokens.
- **Validation**: Dark/light modes and theme accents function flawlessly.

### Phase 8: UI Modularization
- **Tasks**:
  1. Extract monolithic pages into modular blocks (`DashboardHeader`, `MetricsGrid`, `EmptyState`, etc.).
  2. Recompose pages using modular building blocks.
- **Validation**: Reduced component line counts, improved readability and testability.

### Phase 9: Widget System & Editable Page Instances
- **Tasks**:
  1. Implement widget registry and component mapping (Kanban, Calendar, Metrics, Rich Text, etc.).
  2. Build grid customization state manager persisting to Firestore page instances.
- **Validation**: Page customizations persist to Firestore without altering base templates.

### Phase 10: Serverless Cloud Functions & PDF Reporting
- **Tasks**:
  1. Implement Puppeteer Cloud Function for server-side PDF generation.
  2. Connect client report exporter to Cloud Function trigger.
- **Validation**: Clean PDF reports generated without client performance degradation.

### Phase 11: Emulator Suite & Security Rules
- **Tasks**:
  1. Configure Firebase local emulators for auth, firestore, and functions.
  2. Write and test tenant-isolated Firestore security rules.
- **Validation**: Local emulator test suite passes successfully.

### Phase 12: Atlas 1.0 Production SaaS Deployment
- **Tasks**:
  1. Run complete TypeScript build (`tsc`), linter, and unit/E2E test suites.
  2. Deploy hosting, functions, and rules to production Firebase project.
- **Validation**: Zero build errors; live SaaS platform verified operational.

---

## Progress Tracking

| Phase | Plans Complete | Status | Completed |
|---|---|---|---|
| 1. Project Audit | 1/1 | Complete | 2026-06-01 |
| 2. Base Setup | 1/1 | Complete | 2026-06-01 |
| 3. Database Converters | 1/1 | Complete | 2026-06-01 |
| 4. Auth & Multi-Tenancy Shell | 1/1 | Complete | 2026-07-28 |
| 5. Dynamic Sidebar | 1/1 | Complete | 2026-07-28 |
| 6. Domain Types & Repositories | 1/1 | Complete | 2026-07-28 |
| 7. Design System Migration | 1/1 | Complete | 2026-07-28 |
| 8. UI Modularization | 1/1 | Complete | 2026-07-28 |
| 9. Widget System & Editable Pages | 1/1 | Complete | 2026-07-28 |
| 10. Cloud Functions & PDF Reporting | 0/1 | Not started | - |
| 11. Emulators & Security Rules | 0/1 | Not started | - |
| 12. Atlas 1.0 SaaS Deployment | 0/1 | Not started | - |
