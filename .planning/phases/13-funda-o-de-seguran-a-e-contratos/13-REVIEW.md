---
phase: 13-funda-o-de-seguran-a-e-contratos
reviewed: 2026-11-18T18:41:51Z
depth: standard
files_reviewed: 28
files_reviewed_list:
  - apis/sharepoint-functions/config.py
  - apis/sharepoint-functions/secret_provider.py
  - apis/sharepoint-functions/requirements.txt
  - apis/sharepoint-functions/pytest.ini
  - apis/sharepoint-functions/tests/conftest.py
  - apis/sharepoint-functions/tests/test_config_secrets.py
  - apis/sharepoint-functions/crypto.py
  - apis/sharepoint-functions/tests/test_crypto.py
  - apis/sharepoint-functions/responses.py
  - apis/sharepoint-functions/tests/test_http_headers.py
  - apis/sharepoint-functions/tests/test_firestore_rules.py
  - firestore.rules
  - firestore.indexes.json
  - apis/sharepoint-functions/auth.py
  - apis/sharepoint-functions/stores/__init__.py
  - apis/sharepoint-functions/stores/sharepoint_store.py
  - apis/sharepoint-functions/tests/test_auth.py
  - apis/sharepoint-functions/tests/test_tenant_isolation.py
  - apis/sharepoint-functions/logging_utils.py
  - apis/sharepoint-functions/validation.py
  - apis/sharepoint-functions/tests/test_logging_redaction.py
  - apis/sharepoint-functions/tests/test_upload_validation.py
  - apis/sharepoint-functions/main.py
  - apis/sharepoint-functions/tests/test_endpoint_guards.py
  - firebase.json
  - apis/sharepoint-functions/tests/test_no_temp_persistence.py
  - apps/web/src/pages/SettingsPage.tsx
  - .env.example
findings:
  critical: 0
  warning: 4
  info: 1
  total: 5
status: issues_found
---

# Phase 13: Code Review Report

**Reviewed:** 2026-11-18T18:41:51Z
**Depth:** standard
**Files Reviewed:** 28
**Status:** issues_found

## Summary

Reviewed all 28 source/test/config files changed during Phase 13 (SEC-01…SEC-09), cross-referenced against the eight plan summaries, the UI-SPEC, the validation strategy, and the actual git diff base. The cryptographic envelope (AES-256-GCM, per-write nonce, tenant/purpose AAD with pipe rejection, keyVersion dispatch with no silent fallback), the names-only secret/config boundary, the immutable no-store/closed-error response contract, deny-by-default Firestore rules, server-derived tenant resolution with tenant-namespaced document IDs, the allow-list logger, and the honest UI change are all implemented coherently. The full SharePoint suite was executed read-only and is green (`114 passed, 1 skipped, 1 warning`); the skipped item is the pre-existing emulator-only rules test. Dependency pins and `.env.example` contain references only — no hardcoded secret values were found.

No critical defects or security vulnerabilities were proven. Four warnings concern real contract/consistency gaps (divergent MIME policy, incomplete prior null-field fix, wrong failure status, missing audit events on rejected requests) and one informational hardening note. Several plausible-looking suspicions were investigated and discounted as false positives: (a) the Firestore limiter always writes the counter document on a denied check — this is intentional/contractual and asserted by `test_upload_validation.py:198`; (b) `decrypt_blob` recomputes AAD from caller-supplied tenant/purpose rather than trusting the stored `aad` field — this is a security strength, not a bug; (c) `SENSITIVE_KEY_FRAGMENTS` is unused in production but is deliberately used by `test_logging_redaction.py:16` as an independent allow-list oracle; (d) broad `signedIn()` access on legacy collections is explicitly pre-existing semantics preserved by 13-04, not a phase regression.

## Narrative Findings (AI reviewer)

## Warnings

### WR-01: Two divergent MIME allow-lists; the configured one is never enforced

**File:** `apis/sharepoint-functions/config.py:16-22`, `apis/sharepoint-functions/config.py:70`, `apis/sharepoint-functions/validation.py:13-24`, `apis/sharepoint-functions/validation.py:128`
**Issue:** `SharePointSettings.allowed_mime_types` (defaulting to `DEFAULT_ALLOWED_MIME_TYPES`) declares exactly 5 MIME types (pdf, docx, xlsx, png, jpeg). `validation.ALLOWED_MIME_TYPES` independently hardcodes 8 types (adding pptx, txt, csv), and `validate_upload_metadata()` validates against that module-level frozenset — it never reads `get_settings().allowed_mime_types`. Grep confirms `allowed_mime_types` has no consumer anywhere in the codebase. So the settings field is dead, the two lists disagree, and any operator who changes the configured list would see no effect on the enforced policy. This weakens the "closed MIME allow-list" contract (SEC-08) because the authoritative policy is split across two files.
**Fix:** Make one list authoritative and have validation consume it, e.g.:
```python
# validation.py — remove the local frozenset and read the settings value
from config import get_settings

allowed = frozenset(get_settings().allowed_mime_types)
if clean_mime not in allowed:
    raise UploadValidationError(ErrorKind.UNSUPPORTED_MEDIA_TYPE)
```
Then extend `config.DEFAULT_ALLOWED_MIME_TYPES` to the intended 8 entries (and keep `EXTENSION_BY_MIME` in lockstep). If the 8-entry list is intentional and config is vestigial, delete `DEFAULT_ALLOWED_MIME_TYPES` and `SharePointSettings.allowed_mime_types` entirely so there is a single source of truth.

### WR-02: Incomplete null-field fix — `filename_hash=None` still emitted in two upload-intent branches

**File:** `apis/sharepoint-functions/main.py:121`, `apis/sharepoint-functions/main.py:139`
**Issue:** Both early-return branches of `sharepoint_upload_intent` pass `filename_hash=None` to `logging_utils.log_event`. `scrub_payload()` (`logging_utils.py:64-67`) retains `None` because `redact_value(None) is None` and `None != "[redacted]"`, so the serialized log field becomes `"filename_hash": null`. The 13-07 summary (Deviation 2, commit `ead6b55`) explicitly describes removing `filename_hash=None` as a "Missing Critical" fix because such null fields violate the allow-list-only contract; that fix was applied only to the `/me` log, leaving the same defect in two sibling branches. All other upload-intent branches pass a real `hash_identifier(...)` string, so the field has inconsistent types/nullability across the same event name.
**Fix:** Remove the keyword from both calls (the allow-list already omits absent fields):
```python
logging_utils.log_event(
    logger,
    "sharepoint_upload_intent",
    endpoint="sharepoint_upload_intent",
    status=status,
    outcome="invalid_request",
    uid_hash=logging_utils.hash_identifier(ctx.uid),
)
```
Alternatively, harden `scrub_payload()` to drop `None` values globally (`if redacted is None: continue`) so no caller can reintroduce null fields.

### WR-03: Rate-limit client construction failure returns sanitized 500 instead of the documented 429

**File:** `apis/sharepoint-functions/main.py:159-176`
**Issue:** A failure while initializing Firebase or constructing the Firestore client is mapped to `private_error(ErrorKind.INTERNAL)` → HTTP 500 with no `Retry-After`. By contrast, a `RateLimitUnavailable` from `limiter.check()` (line 180-192) is mapped to 429 with `retry_after_seconds=60`. The 13-07 summary's stated decision ("Rate-limit failures (client construction or limiter exception) return the sanitized 429 body with a conservative retry value") is therefore only half-implemented. The behavior remains fail-closed (the request is denied and no backend detail leaks), so this is not a security hole, but a 500 without `Retry-After` invites immediate client retries against an already degraded limiter path, and the two otherwise identical failure modes are classified inconsistently.
**Fix:** Align the two branches:
```python
result = responses.private_error(
    ErrorKind.RATE_LIMITED, retry_after_seconds=60
)
```
(or, if 500 is deliberately correct for infrastructure failure, update the phase decision/summary and add a documented `Retry-After` so clients back off.)

### WR-04: Rejected authentication and wrong-method requests emit no audit event

**File:** `apis/sharepoint-functions/main.py:34-36`, `apis/sharepoint-functions/main.py:71-73`, `apis/sharepoint-functions/main.py:105-107`
**Issue:** The `AuthError` branch of `_authenticated` returns a 401/403 response without calling `log_event`; the non-GET and non-POST branches of `sharepoint_me` and `sharepoint_upload_intent` likewise return 405 without logging. Every other branch logs exactly once. The 13-07 plan (`13-07-PLAN.md:84`) requires "Log exactly one event per request through `log_event` with `endpoint`, `status`, `outcome`, `uid_hash`, and `filename_hash` only." As written, failed logins, expired/revoked tokens, missing tenants, and method abuse leave no audit trail — a meaningful observability gap for a security-hardening phase (brute-force/credential-stuffing attempts are invisible).
**Fix:** Emit one sanitized event in each rejected path using only allow-listed fields, e.g. in the decorator:
```python
except auth.AuthError as exc:
    logging_utils.log_event(
        logger, "auth_rejected",
        endpoint=handler.__name__,
        status=responses.DEFAULT_STATUSES[exc.kind],
        outcome="auth_rejected",
        error_kind=exc.kind.value,
        request_id=uuid.uuid4().hex,
    )
    return responses.to_https_response(responses.private_error(exc.kind))
```
and similarly in each 405 branch (`outcome="method_not_allowed"`), without echoing any header or body value.

## Info

### IN-01: Hashed identifiers are unsalted and truncated

**File:** `apis/sharepoint-functions/logging_utils.py:91-94`
**Issue:** `hash_identifier()` computes `sha256(value)` with no per-deployment salt and truncates to 16 hex characters (64 bits). This satisfies SEC-07's "hashed identifiers" literally and is adequate for correlation, but low-entropy values such as common filenames are trivially recoverable by dictionary attack by anyone with log access. Consider a deployment-scoped secret salt (available through the existing `secret_provider`) if log pseudonymity is a requirement.
**Fix:** Optional hardening only — e.g. `hashlib.sha256((salt + value).encode("utf-8")).hexdigest()[:16]` with a secret salt injected via `--set-secrets`; keep the `h_` prefix contract stable for log consumers.

---

_Reviewed: 2026-11-18T18:41:51Z_
_Reviewer: the agent (gsd-code-reviewer)_
_Depth: standard_
