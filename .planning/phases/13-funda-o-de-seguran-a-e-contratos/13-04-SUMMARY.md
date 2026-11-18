---
phase: 13-funda-o-de-seguran-a-e-contratos
plan: 04
subsystem: firestore-security
tags: [firestore, rules, indexes, emulator, security, default-deny]
requires:
  - phase: 13-01
    provides: approved sharepoint-functions test scaffold and baseline tooling
provides:
  - explicit deny-by-default Firestore rules covering live collections and SharePoint collections
  - SharePoint composite indexes for queue and audit queries
  - static and emulator-backed rules/index verification tests
affects: [13-05, 13-06, 13-07, 14, 16, 17]
tech-stack:
  added: []
  patterns:
    - literal per-collection Firestore match blocks with no catch-all
    - block-scoped rules parsing tests and order-sensitive composite index assertions
key-files:
  created:
    - apis/sharepoint-functions/tests/test_firestore_rules.py
  modified:
    - firestore.rules
    - firestore.indexes.json
key-decisions:
  - "Checkpoint Option A selected: emulator verification executed (demo-pods) because Java 21 and Firebase CLI 15.36.0 were present."
  - "Rules enumerate every live client collection explicitly and keep datatem collections read-only/deny semantics while denying all SharePoint/datatemIntegration client access."
patterns-established:
  - "SEC-02 proof combines static block-scoped assertions in every environment with guarded emulator execution when prerequisites exist."
requirements-completed: [SEC-02]
actuals:
  tokens: 3114
  tasks: 3
  commits: 2
coverage:
  - id: D1
    description: "firestore.rules is default-deny with explicit blocks for live client collections, datatem protections, and SharePoint/datatemIntegration deny-all"
    requirement: SEC-02
    verification:
      - kind: automated
        ref: "backend\\.venv\\Scripts\\python.exe -m pytest -q -p no:cacheprovider apis/sharepoint-functions/tests/test_firestore_rules.py"
        status: pass
      - kind: automated
        ref: "firebase emulators:exec --project demo-pods --only firestore \"backend\\.venv\\Scripts\\python.exe -m pytest -q -p no:cacheprovider apis/sharepoint-functions/tests/test_firestore_rules.py\""
        status: pass
    human_judgment: false
  - id: D2
    description: "firestore.indexes.json retains the original chipAssignmentHistory index and adds three exact SharePoint composite indexes in specified field order"
    requirement: SEC-02
    verification:
      - kind: automated
        ref: "backend\\.venv\\Scripts\\python.exe -m pytest -q -p no:cacheprovider apis/sharepoint-functions/tests/test_firestore_rules.py"
        status: pass
      - kind: automated
        ref: "python -c \"import json; json.load(open('firestore.indexes.json', encoding='utf-8')); print('json-ok')\""
        status: pass
    human_judgment: false
duration: 11 min
completed: 2026-11-18T17:11:40Z
status: complete
commits: 2
plan_head_before: f3639224b405cbbfba2cfbfbf91d5a4a5a263d51
---

# Phase 13 Plan 04: Firestore default-deny rules and SharePoint indexes Summary

**Deny-by-default Firestore rules with explicit live/datatem/SharePoint blocks and three SharePoint composite indexes, proven statically and in the Firebase emulator.**

## Performance

- **Duration:** 11 min
- **Started:** 2026-11-18T17:00:37Z
- **Completed:** 2026-11-18T17:11:40Z
- **Tasks:** 3 (checkpoint decision + rules/indexes + test proof)
- **Files modified:** 3

## Accomplishments
- Replaced the wildcard `match /{document=**}` rule with `signedIn()` and explicit literal blocks for every live client collection (24), `testbooks/modules`, five datatem read-only collections, and seven deny-all collections (`datatemIntegration` plus six SharePoint collections).
- Preserved existing semantics: client-writable collections remain `allow read, write: if signedIn()`, datatem-protected collections remain signed-in read with denied writes, and server-only collections deny all client reads/writes.
- Added three composite indexes in exact order: `sharepointQueue(status ASC, createdAt ASC)`, `sharepointQueue(companyId ASC, createdAt DESC)`, `sharepointAuditLog(companyId ASC, occurredAt DESC)` while keeping `chipAssignmentHistory` and empty `fieldOverrides`.
- Added `apis/sharepoint-functions/tests/test_firestore_rules.py` with block-scoped parsing, hardcoded SharePoint collection names, static rules/index assertions, and an emulator-guarded permission test (`@pytest.mark.skipif` naming missing prerequisite when unavailable).

## Task Commits

Each task was committed atomically:

1. **Task 1: Checkpoint decision (Option A, emulator run)** - documented in this summary/docs commit (no source-file change required)
2. **Task 2: Rewrite rules and add SharePoint indexes** - `432206e` (`feat(13-04)`)
3. **Task 3: Add rules/index verification tests (TDD-order proof)** - `3d7e015` (`test(13-04)`)

**Plan metadata:** recorded in follow-up docs commit.

## Files Created/Modified
- `firestore.rules` - default-deny explicit per-collection rules, datatem read-only blocks, SharePoint/datatemIntegration deny-all blocks, no catch-all.
- `firestore.indexes.json` - original `chipAssignmentHistory` index retained plus three SharePoint composite indexes in required field order.
- `apis/sharepoint-functions/tests/test_firestore_rules.py` - block-scoped rules parser, static inventory/permission/index assertions, and emulator-backed read/write checks.

## Checkpoint Decision (Task 1, `gate="blocking"`)

- **Selected option:** `A` (Emulator run) — auto-selected as first option under `workflow.auto_advance=true` per checkpoint protocol.
- **Observed `java -version` (prerequisite check):**
  - `openjdk version "21.0.12.1" 2026-08-18 LTS`
  - `OpenJDK Runtime Environment Temurin-21.0.12.1+1 (build 21.0.12.1+1-LTS)`
  - `OpenJDK 64-Bit Server VM Temurin-21.0.12.1+1 (build 21.0.12.1+1-LTS, mixed mode, sharing)`
- **Observed `firebase --version`:** `15.36.0`
- **Observed `firebase emulators:exec --help` (relevant):** supports `--only <emulators>` with valid emulator `firestore` (among others).
- **Observed `firebase login:list`:** `Logged in as nathansec26@gmail.com`; other available account `contato.fifteenmiles@gmail.com`.
- **Additional confirmation:** `firebase emulators:exec --project demo-pods --only firestore "echo emulator-smoke-ok"` succeeded (script exit code 0). No JDK installed.

## Verification Results

### Required verification commands
- `python -m pytest -q apis/sharepoint-functions/tests/test_firestore_rules.py` (venv, `PYTHONDONTWRITEBYTECODE=1 -p no:cacheprovider`): **PASS** — `6 passed, 1 skipped, 1 warning in 0.08s` (emulator case skipped outside emulator host env as designed; real emulator run executed separately).
- `python -m pytest -q apis/sharepoint-functions/tests` (venv, `PYTHONDONTWRITEBYTECODE=1 -p no:cacheprovider`): **PASS** — `57 passed, 1 skipped, 1 warning in 0.27s` (full SharePoint suite green).
- `python -c "import json; json.load(open('firestore.indexes.json', encoding='utf-8')); print('json-ok')"`: **PASS** — `json-ok`.
- `git grep -n "document=\*\*" -- firestore.rules`: **PASS** — no matches.

### Emulator execution (Option A)
- Command: `firebase emulators:exec --project demo-pods --only firestore "backend\.venv\Scripts\python.exe -m pytest -q -p no:cacheprovider apis/sharepoint-functions/tests/test_firestore_rules.py"`
- Result: **PASS** — `7 passed, 1 warning in 1.78s`; script exited successfully (code 0). Emulator started/stopped normally (Firestore logging to `firestore-debug.log` observed; no emulator cache/log files added to git).

### TDD ordering note (Task 3, `tdd="true"`)
- Plan explicitly ordered rules/indexes before the proof test. Existing RED→GREEN→REFACTOR commits were therefore not fabricated; correctness was proven by implementing the specified contract first, then adding `test_firestore_rules.py` and running it to green (including emulator execution). Recorded as a documented ordering/deviation from canonical cycle sequencing, not as a missing proof.

## Decisions Made
- Selected checkpoint Option A (emulator run) based on observed prerequisites (Java 21 Temurin, Firebase CLI 15.36.0, login available) and confirmed by emulator smoke + real rules test execution.
- Kept explicit literal `match /<collection>/{docId}` blocks (including `datatemIntegration` and `sharepoint*` deny-all, datatem read-only exact semantics) with no catch-all to satisfy SEC-02 and preserve live-screen behavior.
- Chose SharePoint collection literals now (`sharepointSettings`, `sharepointTokens`, `sharepointOAuthTransactions`, `sharepointQueue`, `sharepointRateLimits`, `sharepointAuditLog`) so later plans can rely on fixed names; test hardcodes them locally as the independent oracle.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Emulator test required environment/host handling and module path resolution**
- **Found during:** Task 3 (rules/index verification test)
- **Issue:** Running under `firebase emulators:exec` requires reading Firestore emulator host from environment and resolving repo paths from the test location; outside emulator context the test must skip with a clear missing-prerequisite reason.
- **Fix:** Implemented repo-root resolution from `Path(__file__).resolve().parents[3]`, `EMULATOR_AVAILABLE` guards with `pytest.mark.skipif` naming missing binaries/files, and emulator HTTP checks that skip if `FIRESTORE_EMULATOR_HOST` is absent.
- **Files modified:** `apis/sharepoint-functions/tests/test_firestore_rules.py`
- **Verification:** Static run `6 passed, 1 skipped`; emulator run `7 passed` with demo project.
- **Commit:** `3d7e015`

---

**Total deviations:** 1 auto-fixed (1 blocking implementation detail)
**Impact on plan:** Necessary to satisfy "emulator test real when available" and "skip reason names the missing binary"; no scope creep, no rule/security semantics changed.

## Issues Encountered
- Local/global `python` did not have `pytest`; used `backend\.venv\Scripts\python.exe` with `PYTHONDONTWRITEBYTECODE=1 -p no:cacheprovider` as required. No other blocking issues.

## Known Stubs
None - no stubs introduced; rules and indexes are concrete and verified.

## Threat Flags
None - no new network endpoints, auth paths, or schema changes beyond the security-hardening rule/index changes already covered by SEC-02 and threat mitigations.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- SEC-02 is satisfied: default deny, explicit allow-list, SharePoint/datatemIntegration inaccessible to client SDK, datatem write protection preserved, and SharePoint composite indexes in place.
- Phase 13 plans 05-07 can rely on stable SharePoint collection names and deny-all client posture while implementing backend-only access paths and metadata commit flow. Phase 14+ can write via Admin SDK without editing `firestore.rules` or `firestore.indexes.json`.
- No blockers identified.

## Self-Check: PASSED

- FOUND: `firestore.rules`
- FOUND: `firestore.indexes.json`
- FOUND: `apis/sharepoint-functions/tests/test_firestore_rules.py`
- FOUND: `.planning/phases/13-funda-o-de-seguran-a-e-contratos/13-04-SUMMARY.md`
- FOUND commit: `432206e` (`feat(13-04): deny Firestore by default and add SharePoint indexes`)
- FOUND commit: `3d7e015` (`test(13-04): verify default-deny Firestore rules and SharePoint indexes`)
- Verified: `git grep -n "document=\*\*" -- firestore.rules` returned no matches
- Verified: `firestore.indexes.json` parses as valid JSON
- Verified: rules suite `6 passed, 1 skipped` (static) and `7 passed` (emulator exec, Option A)
- Verified: full SharePoint suite `57 passed, 1 skipped`

---
*Phase: 13-funda-o-de-seguran-a-e-contratos*
*Completed: 2026-11-18*
