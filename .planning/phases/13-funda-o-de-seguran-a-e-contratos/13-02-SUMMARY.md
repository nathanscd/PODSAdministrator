---
phase: 13-funda-o-de-seguran-a-e-contratos
plan: 02
subsystem: security
tags: [python, cryptography, aes-256-gcm, envelope, firestore, key-rotation, pytest]

requires:
  - phase: 13-funda-o-de-seguran-a-e-contratos
    provides: "config.py settings and secret_provider.get_crypto_key from 13-01 (SEC-03)"
provides:
  - "crypto.py: AES-256-GCM envelope boundary with keyVersion dispatch and tenant/purpose AAD for SEC-04"
  - "EncryptedBlob with the exact six-key Firestore document shape and dict conversion"
  - "11 passing pytest cases across the 9 required behaviors, including V2 rotation and parallel encryption"
affects:
  - "Phase 14: OAuth e Ciclo de Vida da Conexão — persists the Graph refresh-token cache through crypto.encrypt_blob/decrypt_blob"
  - "Phases 15-18: any persisted MSAL token state must go through this envelope"

actuals:
  tokens: 2912
  tasks: 2
  commits: 3
plan_head_before: 57c6ff9c2ab8b2f3fc5c2e8c7f0a0082d16234b3
commits: 3

tech-stack:
  added:
    - "cryptography==50.0.2 AESGCM (pin already approved in 13-01; no package installed or changed)"
  patterns:
    - "AEAD envelope with a fresh 12-byte os.urandom nonce per write, tag appended, v1|tenantId|purpose AAD"
    - "Per-envelope keyVersion dispatch via secret_provider; unknown versions raise UnknownKeyVersionError with no active-key fallback"
    - "Fail-closed fixed-code CryptoError messages: no plaintext, key material, ciphertext or nonce state in errors"
    - "Frozen dataclass with camelCase Firestore keys and to_dict/from_dict conversion"

key-files:
  created:
    - apis/sharepoint-functions/crypto.py
    - apis/sharepoint-functions/tests/test_crypto.py
  modified: []

key-decisions:
  - "Envelope fields are exactly algorithm, keyVersion, nonce_b64, ciphertext_b64, aad, updatedAt so Phase 14 can persist to_dict() directly."
  - "AAD is v1|<tenantId>|<purpose>; a pipe inside either component is rejected so the binding cannot be reinterpreted across tenants."
  - "decrypt_blob resolves the key from the envelope's keyVersion through secret_provider.get_crypto_key; it never reads a module-level active key."
  - "InvalidTag, malformed base64, wrong nonce length and unsupported algorithm/schema version all fail closed; tampering yields exactly CryptoError('decrypt_failed')."
  - "The plan's ordering (implementation task 1, proof tests task 2) was followed verbatim; no pre-implementation RED phase was fabricated."

patterns-established:
  - "crypto.py is the single AES boundary; callers supply tenant and purpose and never see key material."
  - "Adding SHAREPOINT_TOKEN_CRYPTO_KEY_V2 rotates writes without modifying existing rows because reads dispatch on stored keyVersion."

requirements-completed: [SEC-04]

coverage:
  - id: D1
    description: "AES-256-GCM envelope with exact Firestore shape, fresh 12-byte nonce and v1 tenant/purpose AAD"
    requirement: SEC-04
    verification:
      - kind: unit
        ref: "apis/sharepoint-functions/tests/test_crypto.py#test_two_hundred_encryptions_have_distinct_nonces"
        status: pass
      - kind: unit
        ref: "apis/sharepoint-functions/tests/test_crypto.py#test_nonce_length_and_ciphertext_tag"
        status: pass
      - kind: unit
        ref: "apis/sharepoint-functions/tests/test_crypto.py#test_firestore_shaped_dict_round_trip"
        status: pass
    human_judgment: false
  - id: D2
    description: "Tampered, tenant-swapped and wrong-purpose ciphertexts are rejected without leaking ciphertext or keys"
    requirement: SEC-04
    verification:
      - kind: unit
        ref: "apis/sharepoint-functions/tests/test_crypto.py#test_aad_rejects_tenant_and_purpose_substitution"
        status: pass
      - kind: unit
        ref: "apis/sharepoint-functions/tests/test_crypto.py#test_ciphertext_tamper_raises_sanitized_decrypt_failed"
        status: pass
    human_judgment: false
  - id: D3
    description: "Key-version dispatch, V2 rotation and unknown-version rejection"
    requirement: SEC-04
    verification:
      - kind: unit
        ref: "apis/sharepoint-functions/tests/test_crypto.py#test_unknown_key_version_and_unsupported_algorithm"
        status: pass
    human_judgment: false
  - id: D4
    description: "Parallel encryption produces unique nonces and every value decrypts to its exact plaintext"
    requirement: SEC-04
    verification:
      - kind: unit
        ref: "apis/sharepoint-functions/tests/test_crypto.py#test_parallel_encryption_nonces_unique_and_decryptable"
        status: pass
    human_judgment: false

duration: 6min
completed: 2026-11-18
status: complete
---

# Phase 13 Plan 02: Fundação de Segurança e Contratos Summary

**AES-256-GCM envelope encryption with a fresh 12-byte nonce per write, tenant/purpose-bound AAD, keyVersion rotation and tamper-fail-closed decryption for SEC-04**

## Performance

- **Duration:** 6 min
- **Started:** 2026-11-18T16:35:51Z
- **Completed:** 2026-11-18T16:42:00Z
- **Tasks:** 2 of 2
- **Files created:** 2 (no other source file touched)

## Accomplishments

- Created `apis/sharepoint-functions/crypto.py` as the single cryptographic boundary with `ALGORITHM`, `NONCE_BYTES`, `KEY_BYTES`, `SCHEMA_VERSION`, `CryptoError`, `UnknownKeyVersionError`, `EncryptedBlob`, `build_aad`, `encrypt_blob` and `decrypt_blob`.
- Persisted the final envelope shape (`algorithm`, `keyVersion`, `nonce_b64`, `ciphertext_b64`, `aad`, `updatedAt`), so Phase 14 can write `to_dict()` into Firestore without translation.
- Bound decryption to `v1|<tenantId>|<purpose>` and dispatched the AES key by the envelope's `keyVersion` through the 13-01 secret provider; unknown versions and tampered rows fail closed.
- Added 9 behavior tests (11 parametrized cases) covering round-trip, 200 nonces, 12-byte nonce/tag, AAD substitution, tamper leakage, dict round-trip, version dispatch with V2 rotation, AAD validation and 100 parallel encryptions.

## Backstop Truths Answered

- **What is stored while this runs:** only the six-field envelope with base64 ciphertext and identifiers; no plaintext token, AES key, temp file or Firestore client in the module or tests. The nonce is per-write state, never reused or cached.
- **Running twice on the same input:** produces a different nonce and a different ciphertext, both decrypting to the identical plaintext; the previous envelope remains valid because its `keyVersion` is stored with it.
- **Interruption or parallel execution:** no shared mutable state in production code; `os.urandom` supplies each nonce and the settings singleton is already lock-guarded. The 100-sample parallel test proves nonce uniqueness and per-value decryption.
- **First run and changed key version:** the first run resolves the active version from settings (default 1) and fetches its key on demand; after adding `SHAREPOINT_TOKEN_CRYPTO_KEY_V2` and switching the active version, new rows use V2 while old V1 rows still decrypt. An unresolvable version raises `UnknownKeyVersionError` instead of falling back.

## Task Commits

1. **Task 1: Write the AES-256-GCM envelope module** — `54898c3` (feat)
2. **Task 2: Prove nonce uniqueness, AAD binding, tamper detection and key-version dispatch** — `a52b362` (test)
3. **Task 2 supplemental proof: V2 rotation preserves prior-version envelopes** — `046499c` (test)

**Plan metadata:** `docs(13-02): complete 13-02-PLAN.md` (separate docs commit).

## Files Created/Modified

- `apis/sharepoint-functions/crypto.py` — AES-256-GCM envelope implementation, AAD builder, key-version dispatch and sanitized errors
- `apis/sharepoint-functions/tests/test_crypto.py` — 9 behavior tests / 11 cases using `clean_env` and `valid_key_b64`

## Decisions Made

- Sequential execution on the main working tree per the explicit execution instruction; only the two declared source files were staged for task commits and unrelated dirty files were left untouched.
- No package installation or `requirements.txt` change: the human-approved `cryptography==50.0.2` pin from 13-01 already satisfies the implementation.
- The extra V2 rotation assertions were placed inside task 2's existing key-version test so the plan's stated rotation success criterion is proven without adding a new test function.

## Deviations from Plan

None - plan executed as written. The supplemental V2 assertions are additive proof inside task 2's key-version test and stay within the two declared source files.

## TDD Gate Compliance

Task 2 carries `tdd="true"`. The plan itself ordered implementation (task 1) before the proof tests (task 2), and task 1's acceptance criteria already required the behavior, so a pre-implementation RED commit could not be produced without reverting committed production code. The explicit execution instruction was to follow that plan order and record it honestly rather than fabricate a RED phase. The tests were authored as the task-2 deliverable and committed under the `test(13-02)` scope; no `feat`/`refactor` commit was added for task 2 and no RED evidence record was fabricated.

## Issues Encountered

- The global Python 3.14 has no pytest; every pytest and import verification used `backend/.venv/Scripts/python.exe` (3.14.7, pytest 8.4.2, cryptography 50.0.2). No version was substituted.
- The first attempt at the plan's inline `python -c` verify failed because PowerShell stripped inner double quotes. The command was re-run with Python single quotes and passed with `crypto-ok`; no source change was needed.
- pytest reports one third-party `pytest_asyncio` `DeprecationWarning` about `asyncio.get_event_loop_policy`; it is unrelated to this codebase and does not affect the suite result.
- Git reported LF→CRLF normalization warnings when staging the two new files; no functional change.
- `PYTHONDONTWRITEBYTECODE=1` and `-p no:cacheprovider` were used throughout; no new `.pytest_cache` or `.pyc` file was created (two caches and four `.pyc` files from 2026-11-17 were already present and untouched).

## Verification Results

| Check | Command | Result |
|-------|---------|--------|
| Task 1 automated verify | `backend/.venv/Scripts/python.exe -c "... crypto.encrypt_blob/decrypt_blob assertions ..."` | PASS — `crypto-ok`, exit 0 |
| Task 1 acceptance gate | inline Python assertions for constants, symbols, six envelope keys, 12-byte nonce, distinct nonces, tenant swap, exact `decrypt_failed`, algorithm rejection | PASS — `acceptance-1-ok`, exit 0 |
| Forbidden imports | grep for `logging`, `pickle`, `tempfile`, `open(` in `crypto.py` | PASS — no matches |
| Task 2 verify | `python -m pytest -q apis/sharepoint-functions/tests/test_crypto.py -p no:cacheprovider` | PASS — 11 passed, 1 warning |
| Plan full verification | `python -m pytest -q apis/sharepoint-functions/tests -p no:cacheprovider` | PASS — 19 passed, 1 warning (13-01 suite unaffected) |
| No developer SHAREPOINT_* env | clear `Env:SHAREPOINT_*`, then the Task 2 verify above | PASS — 11 passed |
| Test inventory | `python -m pytest --collect-only -q ...test_crypto.py` | PASS — 9 test functions, 11 cases |
| No disk/Firestore access in tests | static grep for `firestore`/`tempfile`/`open(`/HTTP clients in the test file | PASS — no client or file access; only a test name mentions the Firestore-shaped dict |
| Post-commit deletion check | `git diff --diff-filter=D --name-only HEAD~1 HEAD` for all three task commits | PASS — no deletions |

## Self-Check: PASSED

Both created files exist on disk; all three task commits (`54898c3`, `a52b362`, `046499c`) are present in git history; all task acceptance criteria, the 4 backstop truths and both plan-level verification commands pass; no stubs, skipped tests or unrun verifications remain.

## User Setup Required

No new setup beyond 13-01. Before Phase 14 persists encrypted tokens, configure the live `SHAREPOINT_TOKEN_CRYPTO_KEY_V1` secret (and `SHAREPOINT_TOKEN_CRYPTO_KEY_V2` when rotating) in Secret Manager and inject it via `--set-secrets`; only names are ever stored in the repository.

## Next Phase Readiness

SEC-04 is implemented and proven: the envelope shape is final, nonces are unique under load, AAD binds tenant and purpose, tampering raises a sanitized error and key rotation needs no row migration. Ready for 13-03 (immutable `no-store` response contract and sanitized errors). No blockers.

---
*Phase: 13-funda-o-de-seguran-a-e-contratos*
*Completed: 2026-11-18*
