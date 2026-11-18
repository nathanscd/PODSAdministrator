---
phase: 13-funda-o-de-seguran-a-e-contratos
verified: 2026-11-18T19:08:11Z
status: human_needed
score: 9/11 must-haves verified
covered_files:
  - .planning/phases/13-funda-o-de-seguran-a-e-contratos/13-01-PLAN.md
  - .planning/phases/13-funda-o-de-seguran-a-e-contratos/13-01-SUMMARY.md
  - .planning/phases/13-funda-o-de-seguran-a-e-contratos/13-02-PLAN.md
  - .planning/phases/13-funda-o-de-seguran-a-e-contratos/13-02-SUMMARY.md
  - .planning/phases/13-funda-o-de-seguran-a-e-contratos/13-03-PLAN.md
  - .planning/phases/13-funda-o-de-seguran-a-e-contratos/13-03-SUMMARY.md
  - .planning/phases/13-funda-o-de-seguran-a-e-contratos/13-04-PLAN.md
  - .planning/phases/13-funda-o-de-seguran-a-e-contratos/13-04-SUMMARY.md
  - .planning/phases/13-funda-o-de-seguran-a-e-contratos/13-05-PLAN.md
  - .planning/phases/13-funda-o-de-seguran-a-e-contratos/13-05-SUMMARY.md
  - .planning/phases/13-funda-o-de-seguran-a-e-contratos/13-06-PLAN.md
  - .planning/phases/13-funda-o-de-seguran-a-e-contratos/13-06-SUMMARY.md
  - .planning/phases/13-funda-o-de-seguran-a-e-contratos/13-07-PLAN.md
  - .planning/phases/13-funda-o-de-seguran-a-e-contratos/13-07-SUMMARY.md
  - .planning/phases/13-funda-o-de-seguran-a-e-contratos/13-08-PLAN.md
  - .planning/phases/13-funda-o-de-seguran-a-e-contratos/13-08-SUMMARY.md
  - .planning/REQUIREMENTS.md
  - .env.example
  - apis/sharepoint-functions/auth.py
  - apis/sharepoint-functions/config.py
  - apis/sharepoint-functions/crypto.py
  - apis/sharepoint-functions/logging_utils.py
  - apis/sharepoint-functions/main.py
  - apis/sharepoint-functions/pytest.ini
  - apis/sharepoint-functions/requirements.txt
  - apis/sharepoint-functions/responses.py
  - apis/sharepoint-functions/secret_provider.py
  - apis/sharepoint-functions/stores/__init__.py
  - apis/sharepoint-functions/stores/sharepoint_store.py
  - apis/sharepoint-functions/tests/conftest.py
  - apis/sharepoint-functions/tests/test_auth.py
  - apis/sharepoint-functions/tests/test_config_secrets.py
  - apis/sharepoint-functions/tests/test_crypto.py
  - apis/sharepoint-functions/tests/test_endpoint_behavior.py
  - apis/sharepoint-functions/tests/test_endpoint_guards.py
  - apis/sharepoint-functions/tests/test_firestore_rules.py
  - apis/sharepoint-functions/tests/test_http_headers.py
  - apis/sharepoint-functions/tests/test_logging_redaction.py
  - apis/sharepoint-functions/tests/test_no_temp_persistence.py
  - apis/sharepoint-functions/tests/test_tenant_isolation.py
  - apis/sharepoint-functions/tests/test_upload_validation.py
  - apis/sharepoint-functions/validation.py
  - apps/web/src/pages/SettingsPage.tsx
  - firebase.json
  - firestore.indexes.json
  - firestore.rules
covered_digest: "v1:sha256:280a084aad282fc9f55dec400822069239288b3a8481abb38b00331e4041354d"
behavior_unverified: 2
overrides_applied: 0
behavior_unverified_items:
  - truth: "SEC-02: Firestore rules deny by default; unauthenticated reads/writes fail, the wildcard catch-all is gone, every live collection has an explicit block, and all SharePoint collections deny client read/write."
    test: "Run the emulator-gated pytest case test_emulator_denies_unauthenticated_and_allows_signed_in_reads with FIRESTORE_EMULATOR_HOST configured."
    expected: "Unauthenticated GET settings/x and PATCH sharepointTokens/y return 403; signed-in GET settings/x returns 200 or 404, never 403."
    why_human: "The static rule assertions pass, but the emulator test is skipped without a running Firestore emulator and cannot be executed by the verifier without starting a service."
  - truth: "SEC-08: FirestoreRateLimiter enforces a transactional fixed-window budget under concurrent requests, allowing only the configured number of requests per tenant, uid, endpoint and window."
    test: "Exercise FirestoreRateLimiter.check against a real Firestore instance with simultaneous requests competing for the last slot."
    expected: "Exactly rate_limit_max_requests requests are allowed in the window; the final slot is consumed once, and later requests return RateLimitUnavailable/decision.allowed false."
    why_human: "The in-memory limiter concurrency test passes, but no test exercises firestore.transactional contention against a real Firestore backend."
human_verification:
  - test: "Run the emulator-gated Firestore rules test with Java and Firebase CLI installed."
    expected: "Unauthenticated access is denied; signed-in access to allowed collections is permitted; private SharePoint collections remain denied."
    why_human: "Requires a running Firestore emulator; the local suite skipped this case."
  - test: "Apply concurrent traffic to the deployed FirestoreRateLimiter against real Firestore."
    expected: "The fixed-window budget is never exceeded and the last slot is consumed exactly once."
    why_human: "Real transactional contention is not exercised by automated tests."
  - test: "Call deployed /sharepoint/me and /sharepoint/upload-intent with success and error inputs using curl -i."
    expected: "Every response includes Cache-Control no-store, Pragma no-cache and Expires 0; error bodies are fixed sanitized code/message pairs."
    why_human: "Requires a deployed HTTPS endpoint; the local behavioral test stubs the Firebase Response object."
  - test: "Inspect the deployed Cloud Functions Gen2 secret configuration and service-account IAM."
    expected: "SHAREPOINT_MS_CLIENT_SECRET and SHAREPOINT_TOKEN_CRYPTO_KEY_V1 are injected via Secret Manager with --set-secrets; the runtime service account has secretmanager.secretAccessor; no secret value appears in configuration output."
    why_human: "External GCP deployment configuration is not represented in the repository."
  - test: "Open the Settings page and inspect the Security & Privacy and Advanced Console blocks."
    expected: "Data Encryption and ENCRYPTION display a neutral dash; no AES-256 or SECURE claim is shown; layout and other rows are unchanged."
    why_human: "Visual appearance and user-visible rendering require human review."
---

# Phase 13: Fundação de Segurança e Contratos Verification Report

**Phase Goal:** Nenhuma credencial corporativa vaza e nenhuma coleção privada é legível por outro usuário — a base de confiança sobre a qual todo o resto é construído.
**Verified:** 2026-11-18T19:08:11Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | SC1 — Authenticated users are denied credentials, token cache, and other UID/tenant data. | ✓ VERIFIED | `auth.py` verifies Firebase ID tokens with `check_revoked=True`; tenant comes only from claim or server-side profile; `SharePointStore` namespaces IDs and rechecks `companyId`; `test_endpoint_behavior.py::test_missing_header_returns_401_no_store_without_resolving_tenant` and `test_tenant_isolation.py::test_cross_tenant_read_is_not_found_without_leaking_identifiers` passed. |
| 2 | SC2 — Private responses carry exact no-store headers. | ✓ VERIFIED | `responses.py` uses immutable `PRIVATE_NO_STORE_HEADERS`; all handlers return through `private_json`/`private_error`; `test_http_headers.py::test_no_store_headers_on_every_status` and endpoint behavior tests passed. |
| 3 | SC3 — Microsoft keys/secrets never appear in frontend, logs, or versioned files. | ✓ VERIFIED | `config.py`/`secret_provider.py` carry names only; `.env.example` has Secret Manager references only; `logging_utils.py` uses a 15-key scalar allow-list; grep found no `VITE_SHAREPOINT` or secret names in `apps/web/src`; `test_config_secrets.py` and `test_logging_redaction.py` passed. |
| 4 | SC4 — Invalid upload type, size, MIME, name, path, or exhausted rate budget is rejected clearly. | ✓ VERIFIED | `validation.py` normalizes filenames, enforces an 8-MIME allow-list and integer size cap; `main.py` validates before limiter construction; `test_endpoint_behavior.py::test_invalid_upload_payload_never_constructs_the_rate_limiter` and rate-limit tests passed. |
| 5 | SC5 — Only Firestore/R2 persist data; no browser storage, Cache API, service worker, or temp files. | ✓ VERIFIED | Production modules contain no `tempfile`, `sqlite3`, `pickle`, `shelve`, write-mode `open(`, `localStorage`, `sessionStorage`, `indexedDB`, `document.cookie`, `caches.`, or `serviceWorker`; `test_no_temp_persistence.py` passed and scans all eight expected production modules. |
| 6 | SEC-02 — Firestore rules default-deny with explicit collection blocks and SharePoint deny-all. | ⚠️ PRESENT_BEHAVIOR_UNVERIFIED | `firestore.rules` has no wildcard catch-all and all six SharePoint collections deny read/write; static tests passed; emulator test exists but was skipped locally without `FIRESTORE_EMULATOR_HOST`. |
| 7 | SEC-03 — Secret references fail closed; no hardcoded/default/generated key; exact dependency pins. | ✓ VERIFIED | `secret_provider.py` accepts only 32-byte base64 key material and raises names-only `SecretUnavailableError`; `requirements.txt` uses approved exact pins for runtime SDKs; `test_config_secrets.py` passed. |
| 8 | SEC-04 — Tokens use AES-256-GCM envelopes with nonce, AAD, keyVersion, and tamper detection. | ✓ VERIFIED | `crypto.py` uses `AESGCM`, 12-byte `os.urandom` nonce, `v1|tenant|purpose` AAD, envelope `keyVersion`; `test_crypto.py::test_aad_rejects_tenant_and_purpose_substitution` and related tests passed. |
| 9 | SEC-06 — Tenant is derived from verified token claim or server-side profile; cross-tenant is indistinguishable from absence. | ✓ VERIFIED | `resolve_auth_context` uses `companyId` claim then `users/{uid}`; `SharePointStore._read` raises fixed `resource_not_found`; `test_auth.py` and tenant-isolation tests passed. |
| 10 | SEC-07 — Logs use allow-listed scalar keys; no tokens, secrets, headers, or file content. | ✓ VERIFIED | `logging_utils.py` drops non-allow-listed keys and non-scalars; `test_logging_redaction.py::test_sensitive_sentinel_values_absent_from_serialized_event` passed. |
| 11 | SEC-08 — Firestore fixed-window limiter enforces budget transactionally and fails closed. | ⚠️ PRESENT_BEHAVIOR_UNVERIFIED | `FirestoreRateLimiter` uses `firestore.transactional`, hashed keys, and fail-closed denial; in-memory concurrency test passed; real Firestore contention has no passing behavioral test. |

**Score:** 9/11 truths verified (2 present, behavior-unverified)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `apis/sharepoint-functions/config.py` | Fail-closed non-secret config | ✓ VERIFIED | Lazy singleton; environment names only. |
| `apis/sharepoint-functions/secret_provider.py` | Secret Manager-backed key/secret access | ✓ VERIFIED | Reads injected env at call time; names-only errors; 32-byte key validation. |
| `apis/sharepoint-functions/crypto.py` | AES-256-GCM envelope boundary | ✓ VERIFIED | Nonce, AAD, keyVersion, tamper rejection implemented. |
| `apis/sharepoint-functions/responses.py` | Immutable no-store response contract | ✓ VERIFIED | Closed error vocabulary; fixed bodies; header override rejected. |
| `apis/sharepoint-functions/auth.py` | Firebase token verification and tenant resolution | ✓ VERIFIED | Claim-first, server-side profile fallback; fresh context per call. |
| `apis/sharepoint-functions/stores/sharepoint_store.py` | Tenant-scoped SharePoint Firestore access | ✓ VERIFIED | Tenant-prefixed IDs and read/write tenant assertions. |
| `apis/sharepoint-functions/logging_utils.py` | Allow-list redacted logging | ✓ VERIFIED | 15 scalar keys; non-scalars/dropped fields; hashed identifiers. |
| `apis/sharepoint-functions/validation.py` | Upload validation and rate limiting | ✓ VERIFIED | MIME/size/path policy; Firestore limiter; test-only in-memory limiter documented. |
| `apis/sharepoint-functions/main.py` | Authenticated HTTPS entry points | ✓ VERIFIED | Both handlers decorated; validation before limiter; sanitized errors. |
| `firestore.rules` | Default-deny explicit rules | ✓ VERIFIED | No catch-all; 24 live collections plus `testbooks/modules`; SharePoint deny-all. |
| `firestore.indexes.json` | SharePoint composite indexes | ✓ VERIFIED | Static test confirmed three expected indexes and preserved original index. |
| `firebase.json` | Two-codebase deployment config | ✓ VERIFIED | Reporting and SharePoint codebases both present. |
| `.env.example` | Secret names only | ✓ VERIFIED | Secret Manager references; no `VITE_SHAREPOINT` values. |
| `apps/web/src/pages/SettingsPage.tsx` | No false encryption claim | ✓ VERIFIED | Two neutral em dashes; diff from `88b082d` is exactly 2 insertions/2 deletions. |
| `apis/sharepoint-functions/requirements.txt` | Approved exact pins | ✓ VERIFIED | Runtime SDKs exact-pinned; human checkpoint recorded in 13-01. |
| `apis/sharepoint-functions/tests/conftest.py` | Shared test fixtures | ✓ VERIFIED | Present and used by suites. |
| `apis/sharepoint-functions/tests/test_config_secrets.py` | SEC-03 unit proof | ✓ VERIFIED | 8 tests in green suite. |
| `apis/sharepoint-functions/tests/test_crypto.py` | SEC-04 unit proof | ✓ VERIFIED | Nonce, AAD, tamper, rotation tests in green suite. |
| `apis/sharepoint-functions/tests/test_http_headers.py` | SEC-05 unit proof | ✓ VERIFIED | 32 cases in green suite. |
| `apis/sharepoint-functions/tests/test_firestore_rules.py` | SEC-02 static/emulator proof | ✓ VERIFIED | Static assertions pass; emulator case present but skipped locally. |
| `apis/sharepoint-functions/tests/test_auth.py` | SEC-01 auth proof | ✓ VERIFIED | Bearer and tenant resolution cases pass. |
| `apis/sharepoint-functions/tests/test_tenant_isolation.py` | SEC-06 isolation proof | ✓ VERIFIED | Cross-tenant and concurrency cases pass. |
| `apis/sharepoint-functions/tests/test_logging_redaction.py` | SEC-07 proof | ✓ VERIFIED | Sentinel/nested/exception redaction cases pass. |
| `apis/sharepoint-functions/tests/test_upload_validation.py` | SEC-08 validation proof | ✓ VERIFIED | MIME, size, path, and limiter cases pass. |
| `apis/sharepoint-functions/tests/test_endpoint_guards.py` | SEC-01 structural guard | ✓ VERIFIED | AST guard tests pass. |
| `apis/sharepoint-functions/tests/test_endpoint_behavior.py` | SEC-01/05/08 behavioral proof | ✓ VERIFIED | 19 behavioral tests pass. |
| `apis/sharepoint-functions/tests/test_no_temp_persistence.py` | SEC-09 static guard | ✓ VERIFIED | 7 guard tests pass. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `crypto.py` | `secret_provider.py` | `get_crypto_key(key_version)` | ✓ WIRED | Encrypt/decrypt resolve keys by envelope version; no active-key fallback. |
| `config.py` | environment | `get_settings()` | ✓ WIRED | Grep confirmed only `config.py` and `secret_provider.py` read `SHAREPOINT_*` in production. |
| `responses.py` | `main.py` | `private_json` / `private_error` | ✓ WIRED | All handler branches use response helpers; no hand-built error bodies. |
| `auth.py` | `responses.py` | `AuthError.kind` → `ErrorKind` | ✓ WIRED | Decorator maps auth failures through `private_error`. |
| `auth.py` | `stores/sharepoint_store.py` | `AuthContext.company_id` | ✓ WIRED | Store accepts only tenant-scoped company IDs; tests prove cross-tenant denial. |
| `validation.py` | `firestore.rules` | `sharepointRateLimits` | ✓ WIRED | Production limiter writes to collection denied to clients. |
| `validation.py` | `main.py` | `validate_upload_metadata` before `RateLimiter.check` | ✓ WIRED | Source order confirmed at `main.py:144` and `main.py:179`. |
| `main.py` | `firebase.json` | Two codebases | ✓ WIRED | `apis/reporting-functions` preserved; `apis/sharepoint-functions` registered. |
| `firestore.rules` | `stores/sharepoint_store.py` | Six SharePoint collection names | ✓ WIRED | Constants match deny-all rule blocks; test asserts synchronization. |
| `test_no_temp_persistence.py` | production modules | Exclude `tests/` only | ✓ WIRED | Eight expected production module basenames discovered. |
| `SettingsPage.tsx` | phase scope | Two-literal diff | ✓ WIRED | `git diff 88b082d HEAD --numstat` returned 2/2. |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `main.py::sharepoint_me` | `ctx` / payload | Verified Firebase ID token via `resolve_auth_context` | Yes | ✓ FLOWING |
| `main.py::sharepoint_upload_intent` | `meta.normalizedFilename` | Request body through `validate_upload_metadata` | Yes | ✓ FLOWING |
| `main.py::sharepoint_upload_intent` | `decision` | `FirestoreRateLimiter.check` transaction | Yes | ✓ FLOWING |
| `logging_utils.py` | log `fields` | Caller-supplied scalars filtered by allow-list | Yes | ✓ FLOWING |
| `crypto.py` | `ciphertext_b64` | AES-256-GCM encryption with secret-provider key | Yes | ✓ FLOWING |
| `firestore.rules` | access decision | Rule file referenced by `firebase.json` | Yes | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Full SharePoint suite | `PYTHONDONTWRITEBYTECODE=1 backend\.venv\Scripts\python.exe -m pytest -q apis/sharepoint-functions/tests -p no:cacheprovider` | `133 passed, 1 skipped` | ✓ PASS |
| Connectivity regression suite | `PYTHONDONTWRITEBYTECODE=1 ..\..\backend\.venv\Scripts\python.exe -m pytest -q tests -p no:cacheprovider` (workdir `apis/connectivity`) | `25 passed` | ✓ PASS |
| Focused security invariants | Same venv, named pytest selectors for auth/no-store/AAD/tenant/logging/invalid-upload/no-persistence | `19 passed, 1 warning` | ✓ PASS |
| SettingsPage scope | `git diff 88b082d HEAD --numstat -- apps/web/src/pages/SettingsPage.tsx` | `2 2` | ✓ PASS |
| Frontend build | `npm run web:build` | Documented as passed in `13-VALIDATION.md`; not re-run to avoid build-side filesystem writes | ? SKIP |
| Firestore emulator rules | Emulator-gated `test_emulator_denies_unauthenticated_and_allows_signed_in_reads` | Skipped locally; no `FIRESTORE_EMULATOR_HOST` | ? SKIP |

### Probe Execution

| Probe | Command | Result | Status |
|-------|---------|--------|--------|
| None declared or discovered | — | No `probe-*.sh` files or phase-declared probes found | ? SKIP |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| SEC-01 | 13-05, 13-07 | Firebase ID token verification and auth on every endpoint | ✓ SATISFIED | `auth.py`, `main.py`, `test_auth.py`, `test_endpoint_behavior.py`, `test_endpoint_guards.py` |
| SEC-02 | 13-04 | Default-deny Firestore rules; private collections unreadable by clients | ✓ SATISFIED | `firestore.rules`, `test_firestore_rules.py`; emulator confirmation remains human item |
| SEC-03 | 13-01 | Secrets from Secret Manager, never versioned/frontend | ✓ SATISFIED | `config.py`, `secret_provider.py`, `.env.example`, frontend grep, `test_config_secrets.py`; deployed injection remains human item |
| SEC-04 | 13-02 | AES-256-GCM token envelopes with AAD/keyVersion | ✓ SATISFIED | `crypto.py`, `test_crypto.py` |
| SEC-05 | 13-03 | Exact no-store headers on all responses | ✓ SATISFIED | `responses.py`, `test_http_headers.py`, `test_endpoint_behavior.py`; deployed curl remains human item |
| SEC-06 | 13-05 | UID/tenant isolation and anti-IDOR store behavior | ✓ SATISFIED | `auth.py`, `stores/sharepoint_store.py`, `test_tenant_isolation.py` |
| SEC-07 | 13-06 | Logs contain only IDs, status, timestamps, allow-listed metadata | ✓ SATISFIED | `logging_utils.py`, `test_logging_redaction.py` |
| SEC-08 | 13-06 | Upload validation and rate limiting with comprehensible rejection | ✓ SATISFIED | `validation.py`, `main.py`, `test_upload_validation.py`, `test_endpoint_behavior.py`; real contention remains human item |
| SEC-09 | 13-08 | No localStorage/sessionStorage/IndexedDB/Cache API/service worker/temp files | ✓ SATISFIED | `test_no_temp_persistence.py`, production grep, two-literal SettingsPage diff |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `apis/sharepoint-functions/validation.py` | 239-240 | `InMemoryRateLimiter` in production module | ℹ️ Info | Explicitly documented test-only and asserted by `test_no_temp_persistence.py`; `main.py` uses `FirestoreRateLimiter`. |
| `apps/web/src/pages/SettingsPage.tsx` | 154 | `Security Section (Placeholder)` comment | ℹ️ Info | Pre-existing comment outside the two-literal phase diff; no user-visible stub introduced. |
| — | — | TBD / FIXME / XXX | ✓ None | No debt markers found in phase-modified source files. |

### Human Verification Required

### 1. Firestore emulator rule enforcement

**Test:** Run `firebase emulators:exec --only firestore "python -m pytest -q apis/sharepoint-functions/tests/test_firestore_rules.py::test_emulator_denies_unauthenticated_and_allows_signed_in_reads"` with Java and Firebase CLI installed.
**Expected:** Unauthenticated reads/writes return 403; signed-in reads on allowed collections return 200 or 404; SharePoint credential collections remain denied.
**Why human:** Requires a running emulator; the verifier's local suite skipped this case without `FIRESTORE_EMULATOR_HOST`.

### 2. Real Firestore transactional rate-limit contention

**Test:** Send simultaneous requests through `FirestoreRateLimiter.check` against a real Firestore instance for one tenant/uid/endpoint/window.
**Expected:** Only the configured number of requests is allowed; the last slot is consumed exactly once; excess requests are denied with sanitized `rate_limited`.
**Why human:** Automated tests cover the in-memory limiter only; `firestore.transactional` contention is not exercised.

### 3. Deployed no-store response headers

**Test:** `curl -i` the deployed `/sharepoint/me` and `/sharepoint/upload-intent` endpoints for success and error cases.
**Expected:** `Cache-Control: no-store, private, max-age=0, no-cache, must-revalidate`, `Pragma: no-cache`, and `Expires: 0` on every response; fixed sanitized error bodies.
**Why human:** Requires a deployed HTTPS endpoint; local tests use a stubbed Firebase `Response`.

### 4. Secret Manager deployment wiring

**Test:** Inspect deployed Cloud Functions Gen2 secret bindings and runtime service-account IAM.
**Expected:** `SHAREPOINT_MS_CLIENT_SECRET` and `SHAREPOINT_TOKEN_CRYPTO_KEY_V1` are injected from Secret Manager via `--set-secrets`; `secretmanager.secretAccessor` is granted; no value appears in config output.
**Why human:** GCP deployment state is external to the repository.

### 5. Settings page visual confirmation

**Test:** Open the Settings page and inspect the Security & Privacy and Advanced Console blocks.
**Expected:** The Data Encryption row and console line show a neutral dash; no AES-256/SECURE claim; layout and other rows unchanged.
**Why human:** Visual appearance and user-visible rendering require human review.

### Gaps Summary

No blocking gaps were found. All 8 plans' artifacts exist, are substantive, and are wired; all required SEC IDs are covered; no source files were modified during verification. The status is `human_needed` because two runtime invariants require external environments and four additional checks depend on deployed/visual state that cannot be proven by repository inspection.

---

_Verified: 2026-11-18T19:08:11Z_
_Verifier: the agent (gsd-verifier)_
