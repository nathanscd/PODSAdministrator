# Requirements: PODSAdministrator Clean Firebase Refactoring

**Defined:** 2026-06-01
**Core Value:** Decouple UI pages from Cloud Firestore SDK transactions by introducing a robust Repository Pattern, dynamic localization caching, and serverless Cloud Functions, running entirely within Firebase.

## v1 Requirements

### Folder Restructuring & Features
- [ ] **FEAT-01**: Refactor directories into decoupled monorepo packages (`apps/web`, `firebase/`, `shared/`).
- [ ] **FEAT-02**: Restructure all key modules (Assets, Chips, Testbooks, Localization, Tasks) into isolated feature sub-folders.
- [ ] **FEAT-03**: Enforce strict separation where pages, hooks, and services handle only UI representation.

### Repository Pattern
- [ ] **REP-01**: Abstract database CRUD methods into specialized Repository layers (e.g. `TestbookRepository`).
- [ ] **REP-02**: Enforce strict document type-safety via Firestore Data Converters.
- [ ] **REP-03**: Integrate runtime input validations using **Zod Schemas**.

### Caching & Advanced State
- [ ] **STAT-01**: Replace context files with tree-shakable **Zustand** stores for global UI state.
- [ ] **STAT-02**: Deploy **TanStack Query** for fetching, invalidating, and caching server documents.
- [ ] **STAT-03**: Centralize real-time `onSnapshot` listeners to prevent redundant query executions.

### Localization & Translations
- [ ] **LOC-01**: Delete static JSON translations, loading languages dynamically from a Firestore `translations` collection.
- [ ] **LOC-02**: Cache locale structures locally (Zustand storage persistent fallback) to bypass redundant database read reads.
- [ ] **LOC-03**: Automate missing locale keys creation when creating testbooks or modules.

### Serverless Processing
- [ ] **FUNC-01**: Migrate client-side PDF document exports to a dedicated Node.js Puppeteer Cloud Function.
- [ ] **FUNC-02**: Secure Firestore collections with strict `firestore.rules` checking authentication states and user roles.
- [ ] **FUNC-03**: Relocate sensitive actions (sending alerts, audit logging) out of client code to secure functions triggers.

### Testing & Simulation
- [ ] **TEST-01**: Configure the local **Firebase Emulator Suite** for Auth, Firestore, Functions, and Storage.
- [ ] **TEST-02**: Write automated unit tests (Vitest) for repositories, and E2E validation tests (Playwright) covering critical paths.

## Out of Scope

| Feature | Reason |
|---------|--------|
| PostgreSQL Migrations | Replaced. Firestore satisfies free tier limits and zero maintenance operations. |
| VPS/Dedicated Servers | Replaced. System runs entirely serverless within Firebase platforms. |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FEAT-01     | Phase 2 | Pending |
| FEAT-02     | Phase 2 | Pending |
| FEAT-03     | Phase 2 | Pending |
| REP-01      | Phase 5 | Pending |
| REP-02      | Phase 3 | Pending |
| REP-03      | Phase 3 | Pending |
| STAT-01     | Phase 5 | Pending |
| STAT-02     | Phase 6 | Pending |
| STAT-03     | Phase 6 | Pending |
| LOC-01      | Phase 7 | Pending |
| LOC-02      | Phase 7 | Pending |
| LOC-03      | Phase 8 | Pending |
| FUNC-01     | Phase 9 | Pending |
| FUNC-02     | Phase 10| Pending |
| FUNC-03     | Phase 8 | Pending |
| TEST-01     | Phase 10| Pending |
| TEST-02     | Phase 11| Pending |

**Coverage:**
- v1 requirements: 17 total
- Mapped to phases: 17
- Unmapped: 0 ✓

---
*Requirements defined: 2026-06-01*
*Last updated: 2026-06-01 after architecture revision*
