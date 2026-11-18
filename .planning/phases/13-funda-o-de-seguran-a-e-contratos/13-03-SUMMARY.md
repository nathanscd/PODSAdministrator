---
phase: 13-funda-o-de-seguran-a-e-contratos
plan: 03
subsystem: security
tags: [python, http, no-store, cache-control, error-envelope, sanitization, pytest]

requires:
  - phase: 13-funda-o-de-seguran-a-e-contratos
    provides: "config.py/secret_provider.py from 13-01 (SEC-03) and the crypto envelope from 13-02 (SEC-04)"
provides:
  - "responses.py: immutable no-store header contract and closed sanitized error vocabulary for SEC-05"
  - "private_error as the only ApiError-to-HTTP-body path for the 13-07 endpoints"
  - "32 passing pytest cases covering the 7 required behaviors plus the lazy-import failure path"
affects:
  - "13-07: endpoints must compose private_json/private_error and must never build error dicts by hand"
  - "Phase 14-18: every private HTTP response inherits these headers and this fixed error shape"

actuals:
  tokens: 2361
  tasks: 2
  commits: 2
plan_head_before: 7f3720ca8f895b08e758737b1a154714af815490

tech-stack:
  added:
    - "No packages added or installed; 13-01 pins were already human-verified and left untouched"
  patterns:
    - "MappingProxyType constants for headers, error messages and default statuses; every response gets a fresh dict copy"
    - "Closed str Enum code vocabulary with fixed English sentences; no free-form message parameter and no exception interpolation"
    - "Lazy third-party import behind a RuntimeError naming firebase_functions so the pure helpers import without the runtime"

key-files:
  created:
    - apis/sharepoint-functions/responses.py
    - apis/sharepoint-functions/tests/test_http_headers.py
  modified: []

key-decisions:
  - "PRIVATE_NO_STORE_HEADERS is exactly cache-control: no-store, private, max-age=0, no-cache, must-revalidate; pragma: no-cache; expires: 0; x-content-type-options: nosniff."
  - "Error bodies are exactly {'error': {'code': <ErrorKind value>, 'message': <fixed sentence>}} with no details, debug or cause field."
  - "private_json rejects any extra header whose value conflicts case-insensitively with an existing header, so cache-control cannot be stripped by a case variant."
  - "ApiError.__str__ returns only the fixed sentence; chained causes are deliberately excluded from str() and to_body()."
  - "to_https_response imports firebase_functions.https.https_fn.Response inside the function and raises RuntimeError naming the dependency when it is unavailable."
  - "The plan's ordering (implementation task 1, proof tests task 2) was followed verbatim; no pre-implementation RED phase was fabricated."
  - "An eighth test function covers the explicitly required lazy-import failure path; the plan's '7 tests' line enumerates the 7 behavior groups, all of which are present."

patterns-established:
  - "responses.py is the single response boundary; no-store headers are impossible to forget because they are applied inside private_json."
  - "Any future error kind must be added to ErrorKind, ERROR_MESSAGES and DEFAULT_STATUSES together, keeping the body vocabulary closed."

requirements-completed: [SEC-05]

coverage:
  - id: D1
    description: "Immutable no-store header constant applied to every success and error status, with copy-on-response and override rejection"
    requirement: SEC-05
    verification:
      - kind: unit
        ref: "apis/sharepoint-functions/tests/test_http_headers.py#test_no_store_headers_on_every_status"
        status: pass
      - kind: unit
        ref: "apis/sharepoint-functions/tests/test_http_headers.py#test_header_constant_is_immutable_and_responses_are_copies"
        status: pass
    human_judgment: false
  - id: D2
    description: "Closed nine-member error vocabulary with a two-field nested body and fixed internal sentences"
    requirement: SEC-05
    verification:
      - kind: unit
        ref: "apis/sharepoint-functions/tests/test_http_headers.py#test_error_body_has_exactly_code_and_message"
        status: pass
      - kind: unit
        ref: "apis/sharepoint-functions/tests/test_http_headers.py#test_fixed_messages_have_no_internal_detail"
        status: pass
    human_judgment: false
  - id: D3
    description: "No exception text, traceback, secret, token, internal path or chained-cause sentinel can reach a response body"
    requirement: SEC-05
    verification:
      - kind: unit
        ref: "apis/sharepoint-functions/tests/test_http_headers.py#test_chained_cause_text_never_reaches_the_body"
        status: pass
    human_judgment: false
  - id: D4
    description: "Retry-After is present only when supplied and the safety-header predicate recognises only the complete header set"
    requirement: SEC-05
    verification:
      - kind: unit
        ref: "apis/sharepoint-functions/tests/test_http_headers.py#test_retry_after_is_present_only_when_supplied"
        status: pass
      - kind: unit
        ref: "apis/sharepoint-functions/tests/test_http_headers.py#test_safety_headers_present_predicate"
        status: pass
      - kind: unit
        ref: "apis/sharepoint-functions/tests/test_http_headers.py#test_to_https_response_reports_missing_firebase_dependency"
        status: pass
    human_judgment: false

duration: 2min
completed: 2026-11-18
status: complete
---

# Phase 13 Plan 03: Fundação de Segurança e Contratos Summary

**Immutable no-store response headers with a closed nine-code sanitized error envelope, a single ApiError-to-body path and a lazy Firebase adapter for SEC-05**

## Performance

- **Duration:** 2 min
- **Started:** 2026-11-18T16:49:10Z
- **Completed:** 2026-11-18T16:51:31Z
- **Tasks:** 2 of 2
- **Files created:** 2 (no other source file touched)

## Accomplishments

- Created `apis/sharepoint-functions/responses.py` with all eight required symbols: `PRIVATE_NO_STORE_HEADERS`, `ErrorKind`, `ERROR_MESSAGES`, `ApiError`, `private_json`, `private_error`, `to_https_response` and `safety_headers_present`.
- Made the header constant a `MappingProxyType` with the exact four keys; every `private_json` result is a fresh dict and any conflicting override (including a case variant of `cache-control`) raises `ValueError`.
- Defined a closed nine-member `ErrorKind` with immutable fixed English messages and default statuses (400/401/403/404/413/415/429/500), so a caller cannot supply a free-form message.
- Routed every error body through `ApiError.to_body()` as exactly `{"error": {"code": ..., "message": ...}}`; `str(ApiError)` returns only the fixed sentence and chained causes are excluded from both body and string.
- Kept the Firebase dependency lazy: `to_https_response` imports `firebase_functions.https.https_fn.Response` inside the function, reports a `RuntimeError` naming the dependency when absent, and the pure helpers import with no third-party runtime.
- Added a 32-case test suite proving no-store headers on nine statuses, exact body shape for all nine kinds, forbidden-substring absence, chained-cause suppression, immutability/copy semantics, retry-after presence, the header predicate and the lazy-import failure path.

## Backstop Truths Answered

- **What error text reaches the browser when this fails:** only the fixed `ErrorKind` sentence in `error.message` and the fixed snake_case `error.code`. Exception text, tracebacks, `error.message` interpolation, secret values/paths and internal paths never enter the body. `str(ApiError)` is likewise pinned to the fixed sentence, so a chained cause cannot leak through logging built on the exception string.
- **Running twice on the same input:** `private_json` returns a new dict each call and never mutates the shared constant; a caller that mutates one response header cannot poison the next response or another handler.
- **Interruption or parallel execution:** all contract constants are immutable mappings, there is no module state to race on, and the only third-party import happens per call inside `to_https_response`.
- **First run and a missing Firebase runtime:** importing `responses` succeeds with no `firebase_functions` installed; only calling the adapter raises a clear `RuntimeError` naming `firebase_functions`, so unit tests and pure helpers never need the Cloud Functions runtime.

## Task Commits

1. **Task 1: Build the immutable no-store response contract** — `6218b5b` (feat)
2. **Task 2: Prove no-store on every branch and no internal text in any error body** — `ec007b2` (test)

**Plan metadata:** separate `docs(13-03): complete 13-03-PLAN.md` commit.

## Files Created/Modified

- `apis/sharepoint-functions/responses.py` — immutable no-store headers, closed error vocabulary, sanitized envelope helpers and lazy Firebase adapter
- `apis/sharepoint-functions/tests/test_http_headers.py` — 8 test functions / 32 parametrized cases covering the 7 required behaviors plus the lazy-import failure path

## Decisions Made

- Execution was sequential on the current worktree/branch `main` per the explicit instruction; no branch was created, switched or reset, and only the two declared source files were staged for task commits. The GSD protected-default-branch commit guard was therefore not invoked; the operator explicitly pinned base HEAD `7f3720c` and required atomic commits on this branch.
- No package was installed and `requirements.txt` was not changed: the human-verified pins from 13-01 remain authoritative.
- Header override protection was generalised to all keys with case-insensitive comparison, not only the literal `cache-control` example, because a case variant would otherwise be a second way to strip no-store.
- The extra lazy-import test is additive proof of an action explicitly required by the plan; it stays inside the single declared test file and task-2 commit.
- GSD planning files were updated by direct file edit rather than through state SDK commands, so the pre-existing dirty `.planning/config.json` and `.planning/state.json` were never read for writing or modified.

## Deviations from Plan

None - plan executed as written. The plan ordered implementation before proof tests and that order was kept; the TDD-specific consequences are recorded below rather than hidden.

## TDD Gate Compliance

Task 2 carries `tdd="true"`. The plan itself ordered implementation (task 1) before the proof tests (task 2), and task 1's acceptance criteria already required the behavior, so a pre-implementation RED commit could not be produced without reverting committed production code. The explicit execution instruction was to follow that plan order and record it honestly rather than fabricate a RED phase. No RED evidence record was created and no `feat` or `refactor` commit was added for task 2; the tests were authored as the task-2 deliverable and committed under the `test(13-03)` scope.

## Issues Encountered

- The global Python has no pytest; every pytest and import verification used `backend/.venv/Scripts/python.exe` (3.14.7, pytest 8.4.2). `PYTHONDONTWRITEBYTECODE=1` and `-p no:cacheprovider` were used throughout.
- The plan's inline `python -c` verify needed PowerShell-safe quoting (single quotes inside a double-quoted command); the first attempt lost inner double quotes and was re-run with an equivalent quoting form, which passed with `responses-ok`. No source change was needed.
- pytest reports one third-party `pytest_asyncio` `DeprecationWarning` about `asyncio.get_event_loop_policy`; it is unrelated to this codebase and does not affect the suite result.
- Git reported LF→CRLF normalization warnings when staging the two new files; no functional change.
- `firebase_functions` is absent from the venv, as the plan's lazy-import failure test assumes; no installation was attempted.

## Verification Results

| Check | Command | Result |
|-------|---------|--------|
| Task 1 automated verify | `backend/.venv/Scripts/python.exe -c "…responses-ok assertions…"` | PASS — `responses-ok`, exit 0 |
| Task 1 acceptance gate | inline Python assertions for MappingProxyType, mutation TypeError, four header keys, nine members/messages, all statuses, cache-control rejection, 429/500 codes and forbidden source strings | PASS — `acceptance-1-ok`, exit 0 |
| Task 2 verify | `backend/.venv/Scripts/python.exe -m pytest -q apis/sharepoint-functions/tests/test_http_headers.py -p no:cacheprovider` | PASS — 32 passed, 1 warning |
| Plan full verification | `backend/.venv/Scripts/python.exe -m pytest -q apis/sharepoint-functions/tests -p no:cacheprovider` | PASS — 51 passed, 1 warning |
| Forbidden literal | `git grep -n "error.message" -- apis/sharepoint-functions` | PASS — no matches (exit 1) |
| Test inventory | `backend/.venv/Scripts/python.exe -m pytest --collect-only -q apis/sharepoint-functions/tests/test_http_headers.py -p no:cacheprovider` | PASS — 8 functions / 32 cases |
| Import discipline | grep of import lines in the test file | PASS — only `__future__`, `json`, `sys`, `pytest`, `responses` |
| No runtime import in tests | grep for `firebase_functions` in the test file | PASS — only a sys.modules sentinel and a RuntimeError match; no import |
| Post-commit deletion check | `git diff --diff-filter=D --name-only HEAD~1 HEAD` for both task commits | PASS — no deletions |

## Self-Check: PASSED

Both created files exist on disk; both task commits (`6218b5b`, `ec007b2`) are present in git history; all task acceptance criteria, the backstop truths and all three plan-level verification commands pass; no stubs, skipped tests, unrun verifications or new threat-model surfaces remain.

## User Setup Required

None. No dependency was added or installed and no credential is needed for this pure-Python response contract.

## Next Phase Readiness

SEC-05 is implemented and proven: the no-store header contract is immutable and copied per response, the error vocabulary is closed and fixed, no exception or chained-cause text can reach a browser, and 13-07 can compose `private_json`/`private_error` instead of inventing an error dictionary. Ready for 13-04 (`firestore.rules` default-deny and SharePoint indexes). No blockers.

---
*Phase: 13-funda-o-de-seguran-a-e-contratos*
*Completed: 2026-11-18*
