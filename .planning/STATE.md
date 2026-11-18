---
gsd_state_version: "1.0"
milestone: v2.0
milestone_name: )
current_phase: 14
current_phase_name: OAuth e Ciclo de Vida da Conexão
status: executing
stopped_at: Phase 14 plans created; checker next
last_updated: "2026-11-18T20:36:21.669Z"
last_activity: 2026-11-18
last_activity_desc: Phase 14 execution started
state_head: 4375e89782dc1cce60090aca15842d5f6c2da52f
progress:
  total_phases: 6
  completed_phases: 0
  total_plans: 13
  completed_plans: 8
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-11-17)

**Core value:** Tornar o SharePoint o repositório oficial de documentos do Atlas, com autoria delegada preservada e nenhuma perda de alterações durante indisponibilidade.
**Current focus:** Phase 14 — OAuth e Ciclo de Vida da Conexão

## Current Position

Phase: 14 (OAuth e Ciclo de Vida da Conexão) — EXECUTING
Plan: 1 of ?
Status: Executing Phase 14
Last activity: 2026-11-18 — Phase 14 execution started

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocity:**

- Total plans completed: 8
- Average duration: 7 min
- Total execution time: 0.9 hours

**Recent Trend:**

- Trend: Stable

*Updated after each plan completion. Métricas do milestone v1.0 preservadas; v2.0 com 5 planos executados.*
**Per-Plan Metrics:**

| Plan | Duration | Tasks | Files |
|------|----------|-------|-------|
| Phase 13 P01 | 12 min | 3 tasks | 7 files |
| Phase 13 P02 | 6min | 2 tasks | 2 files |
| Phase 13 P03 | 2min | 2 tasks | 2 files |
| Phase 13 P04 | 11 min | 3 tasks | 3 files |
| Phase 13 P05 | 5min | 3 tasks | 5 files |
| Phase 13 P06 | 4min | 3 tasks | 4 files |
| Phase 13 P07 | 12min | 3 tasks | 3 files |
| Phase 13 P08 | 8min | 2 tasks | 2 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Phase 1]: Reject VPS/PostgreSQL migrations. Retain Firebase infrastructure to maintain zero-cost tier thresholds.
- [Phase 2]: Monorepo Workspaces setup establishing apps/web, shared, and firebase workspaces.
- [Phase 3]: Enforced runtime and compile-time type safety via Zod validation schemas and typed Firestore Converters.
- [v2.0]: Backend em Cloud Functions Python Gen2 no projeto Firebase existente — viabiliza MSAL Python e triggers Firestore.
- [v2.0]: R2 como staging temporário de todos os binários; remoção somente após confirmação do SharePoint.
- [v2.0]: Cache MSAL cifrado com AES-256-GCM, chaves no Secret Manager; permissões exclusivamente delegadas (sem app-only).
- [Phase 13]: Secret values are resolved only on demand from injected Secret Manager env names; settings and errors carry names only — SEC-03 fail-closed requirement: no default, generated, hardcoded or logged key material
- [Phase 13]: AES-256-GCM envelopes persist keyVersion; decryption dispatches on the stored version and never uses a module-level active key — Key rotation must not require migrating stored rows
- [Phase 13]: responses.py is the single response boundary — immutable no-store headers and a closed fixed error vocabulary; no exception text, traceback, secret or free-form message reaches the browser (SEC-05)
- [Phase 13]: Firestore rules are explicit and deny-by-default (no catch-all); live client collections keep prior semantics, datatem collections remain read-only to clients, and SharePoint/datatemIntegration are client-deny-all with fixed collection names for later plans (SEC-02)
- [Phase 13]: Identity resolves per invocation from a verified Firebase ID token; no module-level token, claim set, AuthContext or profile document is cached (SEC-01)
- [Phase 13]: Tenant comes only from the verified `companyId` claim or a server-side `users/{uid}.companyId` read; request data is never an authority and cross-tenant access is NotFoundError (404-equivalent) (SEC-06)
- [Phase 13]: AuthError.kind reuses the closed responses.ErrorKind vocabulary so endpoint plans need no exception-to-status translation table (SEC-01)
- [Phase 13]: Log events are built only from a 15-key scalar allow-list; bytes, nested values, oversized strings and exception text are dropped before serialization — no repr/print/basicConfig (SEC-07)
- [Phase 13]: Upload policy uses a closed 8-type MIME allow-list, extension agreement and exact integer size comparisons; only the normalized filename may reach Graph (SEC-08)
- [Phase 13]: Production rate limiting is a Firestore transaction in sharepointRateLimits keyed by sha256(uid|endpoint|windowIndex); backend errors fail closed as RateLimitUnavailable and in-memory state exists only in tests (SEC-08)
- [Phase 13]: Every exported HTTPS handler passes through the single _authenticated decorator before any tenant, validation, limiter or Firestore work; an AST guard fails on any future on_request handler lacking the decorator (SEC-01)
- [Phase 13]: firebase.json declares exactly two independent codebases; the reporting Node source/predeploy and the hosting block are preserved byte-for-byte while the Python 3.12 sharepoint codebase excludes tests and venv artifacts (SEC-01)
- [Phase 13]: settings screen asserts no unimplemented encryption state — both the Data Encryption row and the decorative console use the neutral em dash; a production-only static guard forbids temp files, SQLite, pickle, write-mode open, browser storage and long key-like literals (SEC-09)

### Pending Todos

None yet.

### Blockers/Concerns

- [v2.0] Nenhuma credencial Microsoft real disponível — fases 14, 16 e 18 exigem `--research-phase` para app registration/consent, limites R2/Graph e versão do firebase-tools.
- [v2.0] Working tree sujo com mudanças prévias ao milestone — não tocar em source; orquestrador commita apenas os 3 arquivos de planejamento.
- [v2.0] Duas fontes de identidade no frontend (`AuthProvider` legado + `AtlasAuthProvider`) — consolidar num `TenantUser` tipado antes da UI de documentos (Phase 15).
- Phase 13 UAT humano adiado por decisão do usuário; verificação human_needed com 5 itens em 13-UAT.md

### Roadmap Evolution

- Phase 4 edited: Completely reorganized roadmap and project state for Atlas 1.0 commercial SaaS transformation (TailwindCSS, shadcn/ui, widget system, multi-tenancy, editable pages)
- v2.0: Roadmap substituído para 6 fases contínuas (13–18), derivadas dos 55 requisitos v1 — segurança → OAuth → leitura → R2/fila → status/conflitos → testes/deploy. Fases 10–12 do v1.0 arquivadas.

## Deferred Items

Items acknowledged and carried forward from previous milestone close:

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| v1.0 | Fases 10–12 (PDF Puppeteer, Emulator/Security Rules, Deploy SaaS) | Arquivadas | 2026-11-17 |
| v2 | EXPL-08..10, SYNC-18, STAT-08 e pendências v1.0 (FUNC-01, TEST-08, DEPL-01) | Deferred | 2026-11-17 |

## Session Continuity

Last session: 2026-11-18T20:36:21.597Z
Stopped at: Phase 14 plans created; checker next
Resume file: .planning/phases/14-oauth-e-ciclo-de-vida-da-conex-o/14-01-PLAN.md
