---
phase: 13-funda-o-de-seguran-a-e-contratos
plan: 07
subsystem: security
tags: [sharepoint, authentication, cloud-functions, firebase, python312, multi-codebase, ast-guard, no-store]

requires:
  - phase: 13-03
    provides: immutable no-store response envelope and closed ErrorKind vocabulary
  - phase: 13-05
    provides: AuthError, extract_bearer_token and resolve_auth_context auth chain
  - phase: 13-06
    provides: validate_upload_metadata, FirestoreRateLimiter, rate-limit and log-event helpers
provides:
  - Single _authenticated decorator that is the only place bearer extraction, tenant resolution and private errors meet
  - GET /sharepoint/me and POST /sharepoint/upload-intent HTTPS handlers with explicit 405 allow-listing
  - Two-codebase firebase.json that keeps the reporting Node function deployable alongside Python 3.12 sharepoint
  - AST-level guard test that fails on any future unprotected on_request handler
affects: [13-08-static-guard, 14-oauth-lifecycle, 18-deploy-validation]

tech-stack:
  added:
    - firebase_functions.https_fn / options (Gen2 request decorators, imported at module load)
  patterns:
    - One @_authenticated boundary per exported handler; auth resolves before any tenant, validation, limiter or Firestore work
    - Sanitized telemetry via logging_utils.log_event with hashed identifiers only
    - Static AST enforcement of security invariants instead of runtime introspection

key-files:
  created:
    - apis/sharepoint-functions/main.py
    - apis/sharepoint-functions/tests/test_endpoint_guards.py
  modified:
    - firebase.json

key-decisions:
  - "\"Authorization\" header is read case-insensitively; a missing or malformed bearer yields private_error(UNAUTHORIZED) 401 before resolve_auth_context is called."
  - "AuthError kinds flow straight through private_error, so tenant resolution failures surface as 403 tenant_required without a parallel translation table."
  - "Any non-AuthError exception inside a decorated handler is mapped to private_error(INTERNAL) and logged once as unhandled_error with a uuid4 hex request_id; exception text is never logged."
  - "405 uses ApiError(INVALID_REQUEST) with an explicit status argument, keeping the closed error vocabulary while overriding the default 400."
  - "sharepoint_upload_intent validates metadata before constructing the Firestore limiter, so invalid payloads never open a client or consume budget; limiter setup or check failure fails closed as rate_limited."
  - "Per-request logs contain only endpoint, status, outcome and hashed uid/filename identifiers; raw filename, MIME, body and Authorization values never reach responses or logs."
  - "firebase.json functions was converted from a single object to a two-entry array; reporting source and its npm lint predeploy are preserved byte-for-byte and the hosting block is unchanged."
  - "The SharePoint codebase predeploy runs the SharePoint pytest suite and ignores __pycache__, .venv, tests, .pytest_cache and *.pyc from the deploy bundle."
  - "Guard tests parse main.py as text/AST and read firebase.json from disk with Path(__file__).resolve().parents[3]; they never import main or firebase_functions, so they run without the decorator dependency."
  - "Tracking Markdown files were updated directly because GSD state commands republish the pre-existing dirty .planning/state.json, which the task explicitly protected."

patterns-established:
  - "Every new HTTPS handler in Phase 14+ must carry @_authenticated and be added to AUTHENTICATED_ENDPOINTS or the guard suite fails."
  - "Responses and logs for SharePoint endpoints go only through responses.private_json/private_error and logging_utils.log_event."

requirements-completed: [SEC-01]

coverage:
  - id: D1
    description: "Single authentication decorator covering both exported HTTPS handlers with 401 no-store, 403 tenant_required, 405 method allow-listing and sanitized internal errors"
    requirement: SEC-01
    verification:
      - kind: automated
        ref: python -c AST acceptance probe; apis/sharepoint-functions/tests/test_endpoint_guards.py#6 tests
        status: pass
    human_judgment: false
  - id: D2
    description: "Authenticated sharepoint_me projection and sharepoint_upload_intent policy decision with validation-before-rate-limit ordering"
    requirement: SEC-01
    verification:
      - kind: automated
        ref: python -c AST acceptance probe (handlers, 405 count, validation/check ordering, forbidden strings)
        status: pass
    human_judgment: false
  - id: D3
    description: "Two-codebase firebase.json preserving the reporting function and excluding Python test/venv artifacts"
    requirement: SEC-01
    verification:
      - kind: automated
        ref: python -c firebase-ok / firebase-two-codebases-ok checks; test_firebase_config_declares_both_codebases_and_ignores_tests
        status: pass
    human_judgment: false
  - id: D4
    description: "AST guard that rejects any future unprotected on_request handler and forbids outbound client imports and unsafe error interpolation"
    requirement: SEC-01
    verification:
      - kind: unit
        ref: apis/sharepoint-functions/tests/test_endpoint_guards.py#6 tests + unprotected-handler probe (PROBE OK)
        status: pass
    human_judgment: false

actuals:
  tokens: 3514
  tasks: 3
  commits: 6
plan_head_before: 14923a1b51a1fae1f911655d21bbe54dce29cffb

duration: 12min
completed: 2026-11-18
status: complete
---

# Phase 13 Plan 07: Authenticated SharePoint Endpoints and Two-Codebase Deployment Summary

**Two authenticated, no-store HTTPS endpoints behind a single auth decorator, registered in a two-codebase firebase.json that keeps reporting deployable, with an AST guard that rejects any future unprotected handler.**

## Performance

- **Duration:** 12 min
- **Started:** 2026-11-18T17:58:00Z
- **Completed:** 2026-11-18T18:10:51Z
- **Tasks:** 3 of 3
- **Files modified:** 3 (2 created, 1 modified)

## Accomplishments

- Added `_authenticated` composing `extract_bearer_token` + `resolve_auth_context` + `private_error`, storing only `request.auth_context` and emitting exactly one sanitized `unhandled_error` event with a uuid4 request id for unexpected failures.
- Exposed `sharepoint_me` (GET) and `sharepoint_upload_intent` (POST) with the required Gen2 options, explicit 405 for wrong methods, and no-store projections.
- Enforced validation before the rate-limit check and fail-closed rate-limit behaviour; success returns normalizedFilename, mime, sizeBytes, maxBytes and a two-key rateLimit object.
- Converted `firebase.json` `functions` to two codebases (reporting Node unchanged + sharepoint python312) without touching hosting, firestore, storage, emulators or extensions.
- Added a 6-test AST/config guard that never imports `main` or `firebase_functions` and was proven to reject an injected unprotected `on_request` handler.

## Task Commits

Each task was committed atomically:

1. **Task 1: Expose the authenticated endpoints and the auth decorator** - `637e771` (`feat(13-07)`)
2. **Task 2: Register both function codebases in firebase.json** - `4de65d5` (`feat(13-07)`)
3. **Task 3: Guard every exported handler with an AST-level authentication check** - `ea49d76` (`feat(13-07)`)

Supplemental proof commits (named clearly, no new task scope):

- `ead6b55` (`feat(13-07)`) - sanitize endpoint log fields to the documented allow-list only
- `96fa935` (`fix(13-07)`) - tighten handler guard detection (ast.Call/ast.Attribute resolution, non-hardcoded discovery)
- Final metadata commit: `docs(13-07)` (recorded below after creation)

## Files Created/Modified

- `apis/sharepoint-functions/main.py` - created; `AUTHENTICATED_ENDPOINTS`, `_authenticated`, `sharepoint_me`, `sharepoint_upload_intent`
- `apis/sharepoint-functions/tests/test_endpoint_guards.py` - created; 6 AST/config guard tests
- `firebase.json` - modified; `functions` object converted to two-codebase array, reporting and hosting blocks preserved

## Decisions Made

- Authorization header lookup is case-insensitive so Flask/Werkzeug header casing cannot bypass auth.
- Tenant-required is surfaced through the existing `ErrorKind.TENANT_REQUIRED` → 403 path rather than a bespoke status.
- Rate-limit failures (client construction or limiter exception) return the sanitized 429 body with a conservative retry value; no backend detail is exposed.
- The guard resolves decorator names through `ast.Name`, `ast.Attribute` and `ast.Call`, so `@on_request(...)` is discovered and future aliasing cannot hide an unverified handler.

## TDD Gate Compliance

Task 3 carries `tdd="true"` but the plan deliberately orders endpoint/config implementation (Tasks 1-2) before the guard proof (Task 3). The guard tests therefore verify already-existing implementation and start green; a RED-before-implementation phase was not applicable under this plan order and was **not fabricated**. Concretely:

- No `test(13-07)` RED commit exists (expected by the plan's ordering, not an implementation shortcut).
- GREEN: `feat(13-07)` guard commit `ea49d76`, refined by `fix(13-07)` `96fa935`.
- Structural security is still proven: an injected unprotected `on_request` handler makes Test 1 fail (`PROBE OK`), so the invariant is enforced even without a classical RED commit.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Guard helper did not resolve decorator factory calls**
- **Found during:** Task 3 first test run (3 failed, 3 passed)
- **Issue:** `_decorator_name` handled `ast.Name`/`ast.Attribute` but not `ast.Call`, so `@https_fn.on_request(...)` was not discovered and handler tests saw an empty set.
- **Fix:** Resolve `ast.Call` via its `.func`, then re-ran all checks; also made Test 1 detect any undecorated handler instead of relying on a hardcoded name list.
- **Files modified:** `apis/sharepoint-functions/tests/test_endpoint_guards.py`
- **Verification:** Guard suite 6 passed; full SharePoint suite 107 passed, 1 skipped; injection probe rejects an unprotected handler.
- **Committed in:** `96fa935` (supplemental proof `fix(13-07)`)

**2. [Rule 2 - Missing Critical] Per-request logs required strict field allow-list**
- **Found during:** Task 1 self-review against threat T-13-29
- **Issue:** Initial `sharepoint_me` log passed `filename_hash=None`, which `scrub_payload` would serialize as a null field; response/log fields must be limited to endpoint, status, outcome and hashed identifiers only.
- **Fix:** Removed the `filename_hash=None` field from the `/me` log and dropped an unused `ApiError` import.
- **Files modified:** `apis/sharepoint-functions/main.py`
- **Verification:** Full acceptance probe confirms no raw body/Authorization/filename log fields; suites green.
- **Committed in:** `ead6b55` (supplemental proof `feat(13-07)`)

**3. [Rule 3 - Blocking] Invalid limiter client construction path**
- **Found during:** Task 1 implementation review
- **Issue:** Initial draft referenced a non-existent `config.firebase_admin.firestore` attribute, which would raise before validation and fail closed with the wrong status.
- **Fix:** Initialize the Firebase app via `auth.initialize_firebase_app()` and import `firestore` from `firebase_admin` inside a guarded block; any failure returns the sanitized internal/rate-limit error after validation.
- **Files modified:** `apis/sharepoint-functions/main.py` (within Task 1 commit `637e771`)
- **Verification:** AST ordering check confirms validation precedes limiter construction; forbidden import scan clean.
- **Committed in:** `637e771`

---

**Total deviations:** 3 auto-fixed (1 bug, 1 missing-critical, 1 blocking). **Impact:** All fixes were required for correctness/security of this plan; no unrelated scope was changed.

## Issues Encountered

- Planning-phase documentation is in pt-BR with mojibake in the checked-out files; implementation followed the English PLAN.md text verbatim.
- One full-suite test is skipped: `test_firestore_rules.py:248` (FIRESTORE_EMULATOR_HOST not set). Pre-existing emulator-dependent test, unrelated to this plan; recorded for Phase 18 deploy validation.

## Authentication Gates

None. Dependency pins from 13-01 were already human-verified and were not reopened; no packages were installed and `requirements.txt` was not changed.

## Verification Results

Commands (all run with `PYTHONDONTWRITEBYTECODE=1`, `backend\.venv\Scripts\python.exe`, `-p no:cacheprovider` where pytest):

| Command | Result |
|---------|--------|
| `python -c "import ast,pathlib; ... assert {'sharepoint_me','sharepoint_upload_intent','_authenticated'} <= names; ... assert 'msal' not in src and 'graph.microsoft' not in src; print('main-ok')"` | `main-ok` |
| `python -c "import json,pathlib; ... assert len(f)==2 ...; print('firebase-ok')"` | `firebase-ok` |
| `python -m pytest -p no:cacheprovider -q apis/sharepoint-functions/tests/test_endpoint_guards.py` | `6 passed, 1 warning` |
| `python -m pytest -p no:cacheprovider -q apis/sharepoint-functions/tests` | `107 passed, 1 skipped, 1 warning` |
| `python -c "import json; d=json.load(open('firebase.json')); assert len(d['functions'])==2; print('firebase-two-codebases-ok')"` | `firebase-two-codebases-ok` |
| AST acceptance probe (34 assertions: exports, decorator coverage, endpoint set, ordering, 405 count, forbidden strings, raw-data log fields, firebase structure, guard imports) | `ALL ACCEPTANCE CHECKS PASSED` |
| Unprotected-handler injection probe | `PROBE OK: guard rejects new unprotected on_request handler` |
| `git diff 14923a1 -- firebase.json` | hosting block unchanged; reporting source/predeploy byte-identical; only `functions` converted to array |

## User Setup Required

None - no external service configuration required for this plan.

## Next Phase Readiness

- Ready for 13-08 (honest SettingsPage correction + static non-persistence guard). SEC-01 is complete; the shared endpoint door is in place for Phase 14 to add Graph calls behind `_authenticated`.
- Reminder: deploy validation in Phase 18 must confirm the multi-codebase config in a clean clone and run the Firestore emulator rules test currently skipped here.
- Blocker for Phase 14 remains external: no real Microsoft credentials; requires `--research-phase` for app registration/consent.

## Self-Check: PASSED

- Created files exist: `apis/sharepoint-functions/main.py`, `apis/sharepoint-functions/tests/test_endpoint_guards.py`
- Modified file exists: `firebase.json`
- All 5 production commits verified present in `git log`; plan metadata `docs(13-07)` commit created after this file.

---
*Phase: 13-funda-o-de-seguran-a-e-contratos*
*Completed: 2026-11-18*
