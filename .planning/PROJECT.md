# PROJECT: Atlas 1.0 (Commercial SaaS Platform)

## What This Is

The official commercial transformation of PODSAdministrator into **Atlas 1.0** — the first commercial SaaS product of Fifteen Miles. Atlas combines the power and flexibility of platforms like Notion, ClickUp, Slack, SharePoint, Monday, and Linear, with a unique competitive advantage: deep customization where every company can transform Atlas into its own internal operating system. The platform retains **Google Firebase** as its robust backend infrastructure while executing a complete frontend transformation.

## Core Value

Deliver an enterprise-grade, customizable SaaS operating system by replacing custom UI variants with TailwindCSS + shadcn/ui and CSS variables (`globals.css`), modularizing screens into reusable blocks, introducing an advanced widget-based platform with editable page instances persisting to Firestore, dynamic sidebars, multi-tenancy, and domain-driven types, while preserving 100% backward compatibility with existing Eletra users and data.

## Requirements

### Validated

- ✓ [Phase 1] — Project audit and Firebase NoSQL data path mapping
- ✓ [Phase 2] — Monorepo workspaces structure (`apps/web`, `shared`, `firebase`)
- ✓ [Phase 3] — Zod entity validation schemas and typed Firestore converters with native Date support

### Active

- [ ] Reorganize monolithic types into domain-specific modules (`auth/`, `workspace/`, `page/`, `calendar/`, `crm/`, `asset/`, `task/`, `tracker/`, `automation/`, `reports/`, `testbook/`, `shared/`) maintaining compatibility exports.
- [ ] Implement multi-tenancy auth shell (companies, workspaces, departments, teams, users, permissions, modules, roles).
- [ ] Deploy dynamic sidebar reflecting organization hierarchy, permissions, installed modules, and favorites.
- [ ] Migrate styling from custom variants to TailwindCSS + shadcn/ui + CSS variables (`globals.css`).
- [ ] Modularize pages into reusable blocks (`DashboardHeader`, `MetricsGrid`, `RecentActivity`, `QuickActions`, etc.).
- [ ] Implement the widget platform (Calendar, Kanban, Rich Text, Metrics, Chart, Activity, Tasks, Documents, Comments, Timeline, Database) and editable page instances persisting custom layouts to Firestore without altering templates.
- [ ] Move heavy PDF rendering to serverless Puppeteer Cloud Functions.
- [ ] Configure local Firebase Emulator Suite and robust tenant-isolated security rules.
- [ ] Execute comprehensive test suites and deploy Atlas 1.0 commercially to Firebase.

### Out of Scope

- [VPS / Dedicated Servers] — Excluded. The system operates strictly within standard Firebase serverless environments.
- [PostgreSQL / SQL Databases] — Excluded. We maintain NoSQL Cloud Firestore to leverage free tier thresholds and zero-maintenance models.

## Context

Atlas represents the commercial evolution of PODSAdministrator for Fifteen Miles. To compete with tier-1 productivity platforms while maintaining cost-efficiency on Firebase, we are executing a complete frontend design system migration, UI modularization, widget-based page customization, and multi-tenant domain restructuring while ensuring zero data loss or migration friction for existing Eletra users.

## Constraints

- **Cost-Efficiency**: Optimize reads/writes and caching policies to operate strictly within standard Firebase free tier limits.
- **Backward Compatibility**: Never invalidate existing collections or force migrations; normalize legacy data through adapters.
- **Design Token Purity**: Components must consume CSS variables from `globals.css` without hardcoded colors or spacing.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| TailwindCSS + shadcn/ui + CSS Variables | Replaces custom variants with a clean, standardized design token source for dark/light modes and custom themes. | — Active |
| Widget Platform & Editable Page Instances | Turns every page into a customizable collection of widgets persisting to Firestore per instance, keeping templates immutable. | — Active |
| Domain-Driven Type Decoupling | Splits monolithic types into feature domains while preserving compatibility exports to prevent broken imports. | — Active |
| Serverless Puppeteer Cloud Functions | Offloads heavy CPU testbook PDF rendering away from client browsers. | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

---
*Last updated: 2026-06-01 after Atlas 1.0 Commercial SaaS Roadmap Reorganization*
