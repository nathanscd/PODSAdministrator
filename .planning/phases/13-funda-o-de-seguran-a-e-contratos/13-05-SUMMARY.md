---
phase: 13-funda-o-de-seguran-a-e-contratos
plan: 05
subsystem: auth
tags: [firebase-auth, tenant-isolation, firestore, python, pytest, security]

requires:
  - phase: 13-01
    provides: fail-closed configuration, secret provider and pinned Python test environment
  - phase: 13-03
    provides: ErrorKind vocabulary and sanitized response boundary
provides:
  - AuthContext with server-derived company_id as the single tenant input to data access
  - Tenant-namespaced SharePoint Firestore store with 404-equivalent cross-tenant behavior
  - Credential-free auth and tenant-isolation unit suites
affects: [13-06, 13-07, 14]

tech-stack:
  added: []
  patterns:
    - claim-first tenant resolution with server-side users/{uid}.companyId fallback
    - tenant-namespaced document ids plus stored companyId assertion on every read
    - client-side stable ordering by createdAt then document id before applying limit

key-files:
  created:
    - apis/sharepoint-functions/auth.py
    - apis/sharepoint-functions/stores/__init__.py
    - apis/sharepoint-functions/stores/sharepoint_store.py
    - apis/sharepoint-functions/tests/test_auth.py
    - apis/sharepoint-functions/tests/test_tenant_isolation.py
  modified: []

key-decisions:
  - "D-13-A: verified ID token companyId claim wins; otherwise users/{uid}.companyId is read server-side; neither yields AuthError(TENANT_REQUIRED)."
  - "Cross-tenant access and mis-keyed documents raise NotFoundError (404-equivalent) with a fixed message; TenantMismatchError is reserved for writes."
  - "Document ids are <companyId>_<logicalId> and every document also carries companyId, so the field is re-checked on reads."
  - "list_pending_uploads sorts by createdAt and then document id in Python before slicing to limit, so equal timestamps stay stable without an extra index."
  - "COL_RATE_LIMITS is declared only for the rules-sync assertion; 13-06 owns FirestoreRateLimits and validation.py was not touched."

patterns-established:
  - "Auth errors carry a responses.ErrorKind so 13-07 needs no translation table."
  - "No module-level token, AuthContext, verified claim set or profile document is cached; identity resolves per invocation."
  - "Tests inject fakes (verifier, profile reader, Firestore client) so no credentials, network or emulator are required."

requirements-completed: [SEC-01, SEC-06]

coverage:
  - id: D1
    description: "Strict Bearer parsing and fail-closed token verification reject unauthenticated callers"
    requirement: SEC-01
    verification:
      - kind: unit
        ref: "apis/sharepoint-functions/tests/test_auth.py#test_malformed_authorization_headers_are_rejected"
        status: pass
      - kind: unit
        ref: "apis/sharepoint-functions/tests/test_auth.py#test_verifier_failures_collapse_to_unauthorized_without_exception_text"
        status: pass
    human_judgment: false
  - id: D2
    description: "Tenant derives from verified claim first and server-side profile second, never from request data"
    requirement: SEC-06
    verification:
      - kind: unit
        ref: "apis/sharepoint-functions/tests/test_auth.py#test_claim_tenant_wins_over_profile_tenant"
        status: pass
      - kind: unit
        ref: "apis/sharepoint-functions/tests/test_auth.py#test_profile_tenant_used_when_claim_absent"
        status: pass
      - kind: unit
        ref: "apis/sharepoint-functions/tests/test_auth.py#test_missing_tenant_on_both_sources_is_tenant_required"
        status: pass
    human_judgment: false
  - id: D3
    description: "Cross-tenant reads are indistinguishable from absence and mis-keyed writes cannot overwrite another tenant"
    requirement: SEC-06
    verification:
      - kind: unit
        ref: "apis/sharepoint-functions/tests/test_tenant_isolation.py#test_cross_tenant_read_is_not_found_without_leaking_identifiers"
        status: pass
      - kind: unit
        ref: "apis/sharepoint-functions/tests/test_tenant_isolation.py#test_mis_keyed_document_cannot_be_overwritten"
        status: pass
    human_judgment: false
  - id: D4
    description: "Upload listing has contractual stable order for equal timestamps and applies limit after ordering"
    requirement: SEC-06
    verification:
      - kind: unit
        ref: "apis/sharepoint-functions/tests/test_tenant_isolation.py#test_equal_created_at_ordering_is_stable_and_limit_is_after_ordering"
        status: pass
    human_judgment: false
  - id: D5
    description: "Store collection constants stay in sync with the firestore.rules deny-all block names"
    requirement: SEC-06
    verification:
      - kind: unit
        ref: "apis/sharepoint-functions/tests/test_tenant_isolation.py#test_collection_constants_match_rules_deny_all_block_names"
        status: pass
    human_judgment: false
  - id: D6
    description: "Full SharePoint Python suite remains green after adding auth and store modules"
    verification:
      - kind: other
        ref: "PYTHONDONTWRITEBYTECODE=1 backend/.venv/Scripts/python.exe -m pytest -q -p no:cacheprovider apis/sharepoint-functions/tests"
        status: pass
    human_judgment: false

actuals:
  tokens: 5716
  tasks: 3
  commits: 4
plan_head_before: 0172b05978ab447c060e99bf57d7506c682b6f8c

duration: 5min
completed: 2026-11-18
status: complete
---

# Phase 13 Plan 05: Authentication and Tenant Isolation Summary

**Firebase ID-token verification with claim-then-profile tenant resolution and a tenant-namespaced Firestore store that returns 404-equivalent NotFoundError on cross-tenant access**

## Performance

- **Duration:** 5 min
- **Started:** 2026-11-18T17:25:12Z
- **Completed:** 2026-11-18T17:30:04Z
- **Tasks:** 3 of 3
- **Files modified:** 5 created, 0 modified
- **Commits measured from plan base:** 4 (`git rev-list --count 0172b05..HEAD`)

## Accomplishments

- `auth.py` resolves identity per invocation: strict `Bearer` extraction, `verify_id_token(..., check_revoked=True)` with all failures collapsed to `AuthError(UNAUTHORIZED)`, then `companyId` claim first and server-side `users/{uid}.companyId` fallback.
- `AuthContext.company_id` is the only tenant value the store consumes; no body, query, path or header value can supply a tenant.
- `SharePointStore` namespaces every document id as `<companyId>_<logicalId>`, re-checks the stored `companyId` on reads, and treats cross-tenant or mis-keyed reads as `NotFoundError` while reserving `TenantMismatchError` for writes.
- Pending-upload listing sorts by `createdAt` then document id before applying `limit`, so ten repeated calls return the same order with identical timestamps.
- Nine authentication tests and nine isolation tests run with injected fakes and no credentials, network or emulator.

## Task Commits

Each task was committed atomically:

1. **Task 1: Token verification, tenant resolution and tenant-scoped store** - `5cb55ba` (feat)
2. **Task 2: Authentication rejection paths and tenant precedence** - `216bd13` (test)
3. **Task 3: Cross-tenant reads and writes through the store** - `ee76f99` (test)

**Supplemental fix commit:** `d220a07` (fix) - sanitize exceptions raised by an injected verifier; found by Task 2 verification.

**Plan metadata:** `docs(13-05)` commit recorded in the completion output.

## Files Created/Modified

- `apis/sharepoint-functions/auth.py` - `AuthContext`, `AuthError`, `extract_bearer_token`, `require_firebase_user`, `resolve_auth_context`, Firebase init/reset helpers and tenant constants.
- `apis/sharepoint-functions/stores/__init__.py` - re-exports `SharePointStore`, errors and collection constants.
- `apis/sharepoint-functions/stores/sharepoint_store.py` - six rule-matching collection constants, tenant-namespaced CRUD, stable pending-upload listing and audit/token/settings/queue methods.
- `apis/sharepoint-functions/tests/test_auth.py` - nine fake-injected authentication tests.
- `apis/sharepoint-functions/tests/test_tenant_isolation.py` - nine isolation tests with an in-module fake Firestore client.

## Decisions Made

- Tenant resolution follows D-13-A (claim, then server-side profile, then `TENANT_REQUIRED`), matching `TenantUser.companyId` in `shared/types/auth/index.ts`.
- Cross-tenant existence is never disclosed: both missing and foreign documents raise `NotFoundError` with the fixed message `resource_not_found`.
- Ordering and id namespacing are contractual so Phase 14 can persist tokens and queue entries without adding its own tenant checks.
- No package was installed and `requirements.txt` was untouched; the human-verified 13-01 pins remain authoritative.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Injected verifier exceptions were not sanitized**
- **Found during:** Task 2 verification (`test_verifier_failures_collapse_to_unauthorized_without_exception_text`)
- **Issue:** `resolve_auth_context` propagated a raw `ValueError`/`ExpiredIdTokenError` from an injected verifier, which would let exception text escape the auth boundary when a non-default verifier is used.
- **Fix:** Wrapped the verifier call so `AuthError` is re-raised unchanged and every other exception becomes `AuthError(UNAUTHORIZED)` with `from None`; no exception text is retained.
- **Files modified:** `apis/sharepoint-functions/auth.py`
- **Verification:** Task 2 suite went from 1 failed / 8 passed to 9 passed; full SharePoint suite 75 passed / 1 skipped.
- **Committed in:** `d220a07` (supplemental `fix(13-05)` commit)

---

**Total deviations:** 1 auto-fixed (1 missing critical). **Impact:** Security-only correction inside the auth boundary; no scope creep and no change to the plan's architecture.

## TDD Gate Compliance

The plan frontmatter is `type: execute`; tasks 2 and 3 carry `tdd="true"`, but `workflow.tdd_mode` is `false` in this project, so no RED-evidence gate was active. The plan explicitly orders implementation (task 1) before the proof-test tasks, so no pre-implementation RED phase could be produced without reverting already-committed production code. No RED commit or RED evidence record was fabricated.

| Gate | Commit | Status |
|------|--------|--------|
| RED (`test(...)` before implementation) | - | Not produced by plan order; documented, not simulated |
| GREEN / implementation | `5cb55ba` (feat), `d220a07` (fix) | Pass - 18 targeted tests green |
| Proof tests | `216bd13`, `ee76f99` (test) | Pass - 9 + 9 tests green |

## Verification Results

All commands used `PYTHONDONTWRITEBYTECODE=1` and `-p no:cacheprovider`; `backend\.venv\Scripts\python.exe` was the interpreter.

| Command | Result |
|---------|--------|
| `python -c "<plan Task 1 inline assertion script>"` | `auth-ok`, exit 0 |
| Extended Task 1 acceptance assertions (symbols, strict Bearer, tenant precedence, cross-tenant NotFoundError) | `acceptance-1-ok`, exit 0 |
| `python -m pytest -q apis/sharepoint-functions/tests/test_auth.py` | 9 passed, exit 0 |
| `python -m pytest -q apis/sharepoint-functions/tests/test_tenant_isolation.py` | 9 passed, exit 0 |
| `python -m pytest -q apis/sharepoint-functions/tests/test_auth.py apis/sharepoint-functions/tests/test_tenant_isolation.py` | 18 passed, exit 0 |
| `python -m pytest -q apis/sharepoint-functions/tests` | 75 passed, 1 skipped, exit 0 |
| Rules-name assertion for all six `sharepoint*` deny-all collections | `rules-constants-ok`, exit 0 |
| `git grep -n "companyId" -- apis/sharepoint-functions/auth.py` | Only `TENANT_CLAIM = "companyId"`; no request-argument usage |
| `git grep -n -E "from stores|import stores" -- apis/sharepoint-functions/validation.py` | No matches (13-06 owns that file) |
| Stub/placeholder scan of new files | No matches |

The single skipped test is the pre-existing Firestore-emulator rules test from plan 13-04; it is unrelated to this plan and remains skipped in this environment.

## Issues Encountered

- One injected-verifier exception-leak failure during Task 2 verification, resolved by the supplemental fix commit `d220a07` and documented above.
- The pre-existing emulator-dependent rules test remains skipped; no emulator or Java was required for this plan.

## Known Stubs

None - all methods persist to the injected or lazily resolved Firestore client; no placeholder data or empty mock flows were introduced.

## Threat Flags

None - new network endpoints, auth paths and trust boundaries are limited to the authentication helper and tenant-scoped store already enumerated in the plan's STRIDE register (T-13-17 through T-13-21). No new schema or endpoint was introduced.

## Next Phase Readiness

SEC-01 and SEC-06 are implemented and proven without cloud credentials. Phase 13 plan 06 can add logging, upload validation and `FirestoreRateLimiter` without importing from `stores/`; plan 13-07 can convert `AuthError.kind` directly through `responses.ErrorKind` and pass only `AuthContext.company_id` into `SharePointStore`. No blockers.

## Self-Check: PASSED

- Created files verified on disk: 5 of 5.
- Commits verified in git log: `5cb55ba`, `d220a07`, `216bd13`, `ee76f99`.
- Task acceptance criteria and plan-level verification commands re-run and green.

---
*Phase: 13-funda-o-de-seguran-a-e-contratos*
*Completed: 2026-11-18*
