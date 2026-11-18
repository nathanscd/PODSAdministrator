---
phase: 13-funda-o-de-seguran-a-e-contratos
plan: 01
subsystem: security
tags: [python, firebase-gen2, secret-manager, fail-closed, pytest, cryptography]

requires:
  - phase: none
    provides: "First Python Gen2 codebase skeleton in the monorepo"
provides:
  - "Fail-closed config.py and secret_provider.py implementing SEC-03"
  - "Human-approved exact dependency pins and pytest harness"
  - "Eight SEC-03 unit tests proving names-only errors and no value leakage"
  - "Names-only SharePoint reference block in .env.example"
affects:
  - "13-02 crypto key injection via secret_provider.get_crypto_key"
  - "13-06 validation settings (upload limit, rate limit, MIME allow-list)"
  - "13-07 firebase.json python312 codebase registration"

actuals:
  tokens: 3775
  tasks: 3
  commits: 2
plan_head_before: 0b0584a87425985a3c92a651da9125f785c99bc6
commits: 2

tech-stack:
  added:
    - "firebase-functions==0.6.0"
    - "firebase-admin==7.8.0"
    - "cryptography==50.0.2"
    - "functions-framework==3.10.2"
    - "pytest>=8.0,<9"
    - "pytest-asyncio>=0.24,<1"
  patterns:
    - "frozen dataclass with lazy thread-safe get_settings() singleton"
    - "names-only errors for every secret/config failure path"
    - "on-demand resolution of --set-secrets injected environment values"
    - "base64 decode with strict 32-byte key-material validation"

key-files:
  created:
    - apis/sharepoint-functions/config.py
    - apis/sharepoint-functions/secret_provider.py
    - apis/sharepoint-functions/requirements.txt
    - apis/sharepoint-functions/pytest.ini
    - apis/sharepoint-functions/tests/conftest.py
    - apis/sharepoint-functions/tests/test_config_secrets.py
  modified:
    - .env.example

key-decisions:
  - "Settings contain only non-secret identifiers and env names; importing and constructing settings never require secret values."
  - "SecretUnavailableError str() is exactly the environment variable name — no value, length, prefix or hash."
  - "Crypto key material must base64-decode to exactly 32 bytes; invalid material never escapes as binascii.Error."
  - "Dependency pins are the exact pairs approved by the human; msal, boto3 and google-cloud-firestore are excluded from this plan."

patterns-established:
  - "config.get_settings is the single reader of non-secret SHAREPOINT_* identifiers; secret_provider is the only path to injected secret values."
  - "reset_settings_for_tests() is the supported way to rebuild the process-cached settings between tests."

requirements-completed: [SEC-03]

coverage:
  - id: D1
    description: "Fail-closed config and secret provider with names-only failures"
    requirement: SEC-03
    verification:
      - kind: unit
        ref: "apis/sharepoint-functions/tests/test_config_secrets.py#test_client_secret_present_and_fail_closed_when_absent"
        status: pass
      - kind: unit
        ref: "apis/sharepoint-functions/tests/test_config_secrets.py#test_short_key_error_leaks_no_key_material"
        status: pass
      - kind: unit
        ref: "apis/sharepoint-functions/tests/test_config_secrets.py#test_non_base64_key_raises_typed_error"
        status: pass
    human_judgment: false
  - id: D2
    description: "Idempotent and concurrency-safe settings/key reads with no value leakage in representations"
    requirement: SEC-03
    verification:
      - kind: unit
        ref: "apis/sharepoint-functions/tests/test_config_secrets.py#test_settings_singleton_and_reset"
        status: pass
      - kind: unit
        ref: "apis/sharepoint-functions/tests/test_config_secrets.py#test_concurrent_key_reads_are_consistent"
        status: pass
      - kind: unit
        ref: "apis/sharepoint-functions/tests/test_config_secrets.py#test_repr_and_str_never_contain_injected_secret"
        status: pass
    human_judgment: false
  - id: D3
    description: "Dependency pins verified by the human at the blocking checkpoint and recorded verbatim"
    requirement: SEC-03
    verification:
      - kind: manual_procedural
        ref: "13-01 task 1 checkpoint — human pypi.org verification; response: Aprovar lista observada"
        status: pass
    human_judgment: false
  - id: D4
    description: ".env.example documents SharePoint reference names only, with no frontend secret entries"
    requirement: SEC-03
    verification:
      - kind: other
        ref: "git grep -n SHAREPOINT_ -- .env.example"
        status: pass
    human_judgment: false

duration: 12min
completed: 2026-11-18
status: complete
---

# Phase 13 Plan 01: Fundação de Segurança e Contratos Summary

**Fail-closed Python Gen2 config and Secret Manager provider with names-only errors, human-approved exact dependency pins, and 8 SEC-03 proof tests**

## Performance

- **Duration:** 12 min (continuation from the human-approved dependency checkpoint)
- **Started:** 2026-11-18T16:14:00Z (continuation session)
- **Completed:** 2026-11-18T16:25:54Z
- **Tasks:** 3 of 3 (task 1 approved by the human before this continuation; tasks 2 and 3 executed here)
- **Files modified:** 7

## Accomplishments

- Created `apis/sharepoint-functions/` with a frozen `SharePointSettings`, lazy thread-safe `get_settings()`, `MissingConfigError`, and `reset_settings_for_tests()`.
- Created `secret_provider.py` so the Microsoft client secret and the 32-byte AES key are read on demand from `--set-secrets` injected environment names, with names-only failures.
- Pinned exactly the human-approved dependency pairs; excluded `msal`, `boto3` and `google-cloud-firestore` from this plan.
- Added the pytest harness and 8 tests covering defaults, secret absence, 31-byte/non-base64 key rejection, singleton reset, 32 concurrent key reads, representation leakage and name-list errors.
- Documented names-only SharePoint references in `.env.example` with no frontend secret variable.

## Approved Dependency Pins (verbatim, human-verified)

```
firebase-functions==0.6.0
firebase-admin==7.8.0
cryptography==50.0.2
functions-framework==3.10.2
google-cloud-firestore: excluded (do not add)
pytest>=8.0,<9
pytest-asyncio>=0.24,<1
msal: excluded
boto3: excluded
```

These pairs are recorded exactly as approved by the human response "Aprovar lista observada". All runtime dependencies are treated as human-verified; the checkpoint is not re-opened. No packages were installed during this continuation — the test interpreter already provides cryptography 50.0.2, pytest 8.4.2 and pytest-asyncio 0.26.0, matching the approved pins/ranges.

## Task Commits

1. **Task 1: Verify every new Python dependency before it is pinned** — no commit (blocking checkpoint approved by the human before this continuation; pins recorded above)
2. **Task 2: Scaffold the Python Gen2 codebase with fail-closed config, secret provider and test harness** — `3cd4e2f` (feat)
3. **Task 3: Prove fail-closed secret handling and no secret leakage** — `848c3b1` (test)

**Plan metadata:** committed with this summary (`docs(13-01): complete 13-01-PLAN.md`).

## Files Created/Modified

- `apis/sharepoint-functions/config.py` — frozen settings, lazy singleton, names-only configuration errors
- `apis/sharepoint-functions/secret_provider.py` — on-demand client secret and 32-byte key resolution with `SecretUnavailableError`
- `apis/sharepoint-functions/requirements.txt` — checkpoint-approved exact pins
- `apis/sharepoint-functions/pytest.ini` — `testpaths = tests`, `asyncio_mode = auto`
- `apis/sharepoint-functions/tests/conftest.py` — local `sys.path` injection plus `clean_env`, `valid_key_b64`, `fake_settings`
- `apis/sharepoint-functions/tests/test_config_secrets.py` — 8 SEC-03 behavior tests
- `.env.example` — names-only SharePoint reference block

## Decisions Made

- Sequential execution on the main working tree per explicit continuation instruction; only plan-declared files plus tracking files were staged, leaving all unrelated dirty files untouched.
- No new package installation: the approved pins were written to `requirements.txt`, and the existing `backend/.venv` interpreter already satisfied every import needed by the stated verifications.

## Deviations from Plan

None - plan executed as written.

## TDD Gate Compliance

Task 3 carries `tdd="true"`. The plan itself ordered the implementation (task 2) before the proof tests (task 3), and task 2's acceptance criteria already required the behavior, so a pre-implementation RED could not be produced without reverting committed production code. The investigation concluded this is plan-ordering, not a missing feature or a faulty test. The test file was authored as the task-3 deliverable and committed with the `test(13-01)` scope; no additional `feat`/`refactor` commit was needed because the implementation was already committed in task 2.

## Issues Encountered

- The global `python` (3.14.7) has no pytest installed. All pytest and import verifications were run with `backend/.venv/Scripts/python.exe` (3.14.7), which has pytest 8.4.2, pytest-asyncio 0.26.0 and cryptography 50.0.2. No version was silently substituted.
- The venv currently holds firebase-admin 6.9.0 while `requirements.txt` pins the human-approved 7.8.0. No install was attempted because none of the stated verifications import firebase-admin; the approved pin is recorded verbatim for the deployment runtime.
- pytest emitted one third-party `DeprecationWarning` from `pytest_asyncio` about `asyncio.get_event_loop_policy`. It is unrelated to this codebase and does not affect the suite result.
- `PYTEST_ADDOPTS="-p no:cacheprovider"` was used during verification so no untracked `.pytest_cache` directory was left in the repository.

## Verification Results

| Check | Command | Result |
|-------|---------|--------|
| Scaffold import | `python -c "import sys; sys.path[:0]=['apis/sharepoint-functions']; import config, secret_provider; ...; import cryptography, pytest; print('scaffold-ok')"` | PASS — `scaffold-ok` |
| SEC-03 unit suite | `python -m pytest -q apis/sharepoint-functions/tests/test_config_secrets.py` | PASS — 8 passed, 1 third-party warning |
| Full SharePoint suite | `python -m pytest -q apis/sharepoint-functions/tests` | PASS — 8 passed |
| Plain module import | `python -c "import sys; sys.path[:0]=['apis/sharepoint-functions']; import config, secret_provider"` | PASS — exit 0 |
| Secret names in env example | `git grep -n "SHAREPOINT_" -- .env.example` | PASS — 4 names, no `VITE_SHAREPOINT` entry |
| Forbidden patterns in modules | `Select-String` for `dotenv`, `load_dotenv`, `open(`, `tempfile`, `pickle` | PASS — no matches |
| Pins / exclusions | inspection of `requirements.txt` | PASS — 4 exact `==` pins, 2 pytest ranges, no `msal`/`boto3`/`google-cloud-firestore` |
| Post-commit deletion check | `git diff --diff-filter=D --name-only HEAD~1 HEAD` for both task commits | PASS — no deletions |

## Self-Check: PASSED

All 7 deliverable files exist on disk; both task commits (`3cd4e2f`, `848c3b1`) are present in git history; all 8 behaviors and all plan-level verification commands pass.

## User Setup Required

The plan declares `user_setup` for Google Cloud Secret Manager, but it is documentation/deployment setup rather than a blocker for this plan: the repository intentionally stores only reference names. Configure the live `sharepoint-ms-client-secret` and `sharepoint-token-crypto-key-v1` secrets and grant `roles/secretmanager.secretAccessor` to the Gen2 service account before deploying plan 13-07. See the SharePoint block in `.env.example` for the variable names.

## Next Phase Readiness

SEC-03 is proven at the unit level: `config.get_settings()` is the single non-secret reader, `secret_provider` is the only secret path, and no value can appear in an error string. Plans 13-02 onward can add crypto, response helpers, rules, auth and stores on this scaffold without touching setup files. No blockers for 13-02.

---
*Phase: 13-funda-o-de-seguran-a-e-contratos*
*Completed: 2026-11-18*
