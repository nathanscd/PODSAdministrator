---
phase: "13"
slug: "funda-o-de-seguran-a-e-contratos"
status: verified
threats_open: 0
asvs_level: 1
created: "2026-11-18"
---

# Phase 13 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| Browser → Cloud Function | Firebase ID token in Authorization header; private JSON over HTTPS | Bearer token, upload metadata, no-store response |
| Cloud Function → Secret Manager | On-demand resolution of injected environment variable names | Secret names in config; key material only in memory |
| Cloud Function → Firestore (SharePoint namespace) | Tenant-scoped reads/writes via Admin SDK after explicit authorization | Tenant id, uid, document metadata, rate-limit counters |
| Browser → Firestore | Deny-by-default rules for private collections | Authenticated reads only on legacy live collections |
| Cloud Function → Microsoft Graph (future phases) | Delegated tokens only; no app-only credentials in this phase | No outbound Graph calls implemented in phase 13 |
| Backend → Logs | Allow-listed scalar telemetry through `log_event` | Hashed identifiers, fixed event names, no secrets or raw tokens |
| Backend → Source tree | Static guards forbid temporary/disk persistence | No temp files, SQLite, pickle, write-mode handles, or browser storage |
| UI → User | Settings screen must not assert unimplemented security state | Neutral status placeholder only |

---

## Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-13-01 | Information Disclosure | `secret_provider.py`, `config.py` | high | mitigate | Names-only errors; strict key decode with chained exceptions suppressed | closed |
| T-13-02 | Elevation of Privilege | `secret_provider.py` | high | mitigate | Missing/wrong-version key fails closed; exactly 32-byte material required; no default/generated/hardcoded key | closed |
| T-13-SC | Tampering | `requirements.txt` | high | mitigate | Exact approved pins; no unapproved auth/storage SDKs; human checkpoint recorded | closed |
| T-13-02b | Information Disclosure | `.env.example` | medium | mitigate | Names and Secret Manager references only; no `VITE_SHAREPOINT` values | closed |
| T-13-04 | Information Disclosure | `crypto.py` | high | mitigate | AES-256-GCM, 12-byte nonce, base64 envelope, fixed-code errors | closed |
| T-13-05 | Tampering | `crypto.py` | high | mitigate | AAD `v1\|tenant\|purpose`, pipe rejection, recomputation on decrypt, `InvalidTag` → fixed `decrypt_failed` | closed |
| T-13-06 | Spoofing | `crypto.py` | medium | mitigate | Resolve key by envelope `keyVersion`; unknown version raises; no active-key fallback | closed |
| T-13-07 | Repudiation | `crypto.py` | high | mitigate | Fresh `os.urandom` nonce per encryption with uniqueness tests | closed |
| T-13-08 | Information Disclosure | `responses.py` | high | mitigate | Closed `ErrorKind` vocabulary and fixed messages; no free-form/error interpolation | closed |
| T-13-09 | Information Disclosure | `responses.py` | high | mitigate | Immutable no-store headers on every success/error; conflicting override rejected | closed |
| T-13-10 | Tampering | `responses.py` | medium | mitigate | Immutable header mapping with fresh per-response dict copy | closed |
| T-13-11 | Denial of Service | error verbosity (13-03) | low | accept | Fixed-length messages; rate limiting owned by 13-06 | closed (accepted) |
| T-13-12 | Elevation of Privilege | `firestore.rules` | high | mitigate | No catch-all; explicit per-collection blocks only | closed |
| T-13-13 | Information Disclosure | `firestore.rules` | high | mitigate | SharePoint and integration collections deny all client read/write | closed |
| T-13-14 | Tampering | `firestore.rules` | high | mitigate | datatem collections allow signed-in reads and deny all client writes | closed |
| T-13-15 | Denial of Service | `firestore.rules` | medium | mitigate | All 24 client collections plus `testbooks/modules` explicitly enumerated | closed |
| T-13-16 | Repudiation | `test_firestore_rules.py` | medium | mitigate | Emulator test env-gated; Java 21 + Firebase CLI 15.36.0 run recorded | closed |
| T-13-17 | Spoofing | `auth.py` | critical | mitigate | Strict Bearer parse, `verify_id_token(check_revoked=True)`, uniform unauthorized error | closed |
| T-13-18 | Elevation of Privilege | `auth.py` | critical | mitigate | Tenant from verified claim or server-side user document only; no request-data authority | closed |
| T-13-19 | Information Disclosure | `sharepoint_store.py` | high | mitigate | Cross-tenant/mis-keyed reads return fixed `resource_not_found` | closed |
| T-13-20 | Tampering | `sharepoint_store.py` | high | mitigate | `<companyId>_<logicalId>` ids and stored `companyId` assertion on write | closed |
| T-13-21 | Repudiation | `auth.py` | medium | mitigate | Fresh `AuthContext` per invocation; no token/claim/profile cache | closed |
| T-13-22 | Information Disclosure | `logging_utils.py` | high | mitigate | 15-key scalar allow-list; redaction and sentinel tests; no `repr`/`print`/`basicConfig` | closed |
| T-13-23 | Tampering | `validation.py` | high | mitigate | Final-segment filename normalization, traversal/control-char rejection, fixed errors | closed |
| T-13-24 | Denial of Service | `validation.py` | high | mitigate | Exact integer size cap; transactional Firestore fixed-window limiter; fail-closed denial | closed |
| T-13-25 | Elevation of Privilege | `validation.py` | medium | mitigate | Closed 8-type MIME allow-list with extension agreement; no script/SVG/HTML/ZIP types | closed |
| T-13-26 | Repudiation | `validation.py`, `firestore.rules` | high | mitigate | Production counter collection denied to clients; in-memory limiter test-only | closed |
| T-13-27 | Tampering | `validation.py` | medium | mitigate | Transactional read-modify-write, window reset, exact-count concurrency test | closed |
| T-13-28 | Spoofing | `main.py`, `test_endpoint_guards.py` | critical | mitigate | Single `_authenticated` boundary per handler; AST guard rejects undecorated handlers | closed |
| T-13-29 | Information Disclosure | `main.py` | high | mitigate | All responses through private helpers; sanitized telemetry; no exception text/traceback | closed |
| T-13-30 | Denial of Service | `main.py` | medium | mitigate | Validation before limiter; limiter failure maps to 429 fail-closed with retry contract | closed |
| T-13-31 | Tampering | `firebase.json` | medium | mitigate | Two independent codebases; reporting source and hosting block preserved; Python 3.12 sharepoint codebase | closed |
| T-13-32 | Elevation of Privilege | outbound calls (13-07) | low | accept | No Graph/HTTP client in this phase; structural guard enforces scope | closed (accepted) |
| T-13-33 | Information Disclosure | production modules, `test_no_temp_persistence.py` | high | mitigate | Static guard forbids tempfile/sqlite3/pickle/shelve/write-mode `open(` | closed |
| T-13-34 | Information Disclosure | production modules, `test_no_temp_persistence.py` | high | mitigate | Static guard forbids browser-storage tokens; no storage access in SettingsPage | closed |
| T-13-35 | Spoofing | `SettingsPage.tsx` | medium | mitigate | Both false encryption claims replaced with neutral `—`; guard asserts literals absent | closed |
| T-13-36 | Repudiation | `test_no_temp_persistence.py` | medium | mitigate | Superset assertion over eight expected module basenames prevents a vacuous pass | closed |

*Status: open · closed · open — below high threshold (non-blocking)*
*Severity: critical > high > medium > low — only open threats at or above workflow.security_block_on count toward threats_open*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-13-01 | T-13-11 | Error messages are fixed-length and rate limiting is enforced by 13-06; verbose-error DoS is not enabled. | Plan-time threat register | 2026-11-18 |
| AR-13-02 | T-13-32 | Phase 13 intentionally implements no outbound Graph/HTTP client; later phases require delegated permissions and separate threat review. | Plan-time threat register | 2026-11-18 |

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-11-18 | 37 | 37 | 0 | gsd-security-auditor |

The five advisory code-review findings were evaluated under ASVS L1 against the plan-time register: WR-01, WR-02, WR-03, WR-04 and IN-01 are hardening/consistency notes; none invalidates a declared mitigation and none creates an open HIGH+ threat.

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-11-18
