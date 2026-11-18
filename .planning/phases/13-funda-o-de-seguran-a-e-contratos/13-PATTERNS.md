# Phase 13: Fundação de Segurança e Contratos - Pattern Map

**Mapped:** 2026-11-18
**Files analyzed:** 29 (4 modified, 25 created — several optional/tests)
**Analogs found:** 23 strong / 29; 3 partial (http headers, secrets access, validation rate-limit); 3 intentionally have no analog (crypto, rules tests, no-temp-persistence test)

**Inputs:** `13-RESEARCH.md` (§ Recommended Project Structure, § Code Examples, § Validation Architecture), `13-UI-SPEC.md` (single-surface SettingsPage correction). No `CONTEXT.md` exists for Phase 13; no user decisions to honor beyond the active milestone constraints in RESEARCH § User Constraints.

**Tracked-source gate:** every analog below is git-tracked (`git ls-files` confirmed). Do not substitute any path under a gitignored install/mirror directory.

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `firebase.json` (MOD) | config | deploy / request-response | `apis/reporting-functions/index.js` (current single-codebase target) | role-match |
| `firestore.rules` (MOD) | config (security rules) | request-response / authorization | `firestore.rules` (current wildcard — **invert this pattern**) | role-match (negative) |
| `firestore.indexes.json` (MOD) | config (indexes) | CRUD query | `firestore.indexes.json` (existing single index) | exact |
| `apps/web/src/pages/SettingsPage.tsx` (MOD) | component | transform (static render copy) | same file, security section `:154-181` | exact (self) |
| `apis/sharepoint-functions/main.py` | route / entrypoint | request-response | `apis/reporting-functions/index.js` + `apis/connectivity/fastapi_app/main.py` | role-match |
| `apis/sharepoint-functions/config.py` | config | startup / transform | `apis/connectivity/fastapi_app/config.py` + `apis/connectivity/fastapi_app/datatem/config.py` | exact |
| `apis/sharepoint-functions/auth.py` | middleware (auth guard) | request-response | `apis/connectivity/fastapi_app/firebase_client.py:82-115` | role-match (harden) |
| `apis/sharepoint-functions/secrets.py` | service (secrets provider) | request-response | `apis/connectivity/fastapi_app/datatem/config.py:27-58` (fail-fast validation only) | role-match (partial) |
| `apis/sharepoint-functions/crypto.py` | utility (crypto) | transform | **none** — use RESEARCH § Code Example 3 | no analog |
| `apis/sharepoint-functions/http.py` | utility (response/error) | request-response | `apis/connectivity/fastapi_app/datatem/errors.py:52-69` + `routes_datatem.py:64-71` | partial |
| `apis/sharepoint-functions/validation.py` | utility (input guards) | batch / request-response | `apis/connectivity/fastapi_app/datatem/models.py:24-52` (field constraints) | partial |
| `apis/sharepoint-functions/logging_utils.py` | utility (redaction) | transform | `apis/connectivity/fastapi_app/datatem/errors.py:52-53` | partial |
| `apis/sharepoint-functions/requirements.txt` | config (deps) | build | `apis/connectivity/requirements.txt` | exact |
| `apis/sharepoint-functions/pytest.ini` (implied) | config (test) | — | `apis/connectivity/pytest.ini` | exact |
| `apis/sharepoint-functions/models/__init__.py` (or `models/sharepoint.py`) | model | contracts | `apis/connectivity/fastapi_app/datatem/models.py:8-70` | role-match |
| `apis/sharepoint-functions/stores/sharepoint_store.py` | service (data access) | CRUD (transactional) | `apis/connectivity/fastapi_app/simcard_store.py:179-189, 314-363, 456-512` | role-match (add owner filter) |
| `apis/sharepoint-functions/tests/test_auth.py` | test | unit | `apis/connectivity/tests/test_datatem_client.py:40-60` | role-match |
| `apis/sharepoint-functions/tests/test_firestore_rules.py` | test | rules / emulator | **none** (no rules tests exist) | no analog |
| `apis/sharepoint-functions/tests/test_config_secrets.py` | test | unit | `apis/connectivity/tests/test_normalize.py:1-40` | role-match |
| `apis/sharepoint-functions/tests/test_crypto.py` | test | unit | `apis/connectivity/tests/test_normalize.py` | role-match |
| `apis/sharepoint-functions/tests/test_http_headers.py` | test | unit | `apis/connectivity/tests/test_normalize.py` | role-match |
| `apis/sharepoint-functions/tests/test_tenant_isolation.py` | test | unit | `apis/connectivity/tests/test_assignment.py:39-70` (fake Firestore) | role-match |
| `apis/sharepoint-functions/tests/test_logging_redaction.py` | test | unit | `apis/connectivity/tests/test_normalize.py` | role-match |
| `apis/sharepoint-functions/tests/test_upload_validation.py` | test | unit | `apis/connectivity/tests/test_normalize.py` | role-match |
| `apis/sharepoint-functions/tests/test_no_temp_persistence.py` | test | unit / static inspection | **none** (new class of test) | no analog |
| `.env.example` (MOD) | config | build / docs | `.env.example` (existing DataTEM/Firebase block) | exact |
| `shared/types/sharepoint/index.ts` (OPTIONAL) | model / types | contracts | `shared/types/workspace/index.ts` + `shared/types/auth/index.ts` | exact |
| `shared/schemas/index.ts` (OPTIONAL MOD) | model / validation | transform | `shared/schemas/index.ts:1-34` | exact |
| `firebase/converters/index.ts` (OPTIONAL MOD) | converter | CRUD | `firebase/converters/index.ts:31-69` | exact |

---

## Pattern Assignments

### `firebase.json` (config, deploy)

**Analog:** current `firebase.json` (only `functions` object) + `apis/reporting-functions/index.js`

**Current shape to preserve** (`firebase.json`, HEAD):
```json
"functions": {
  "source": "apis/reporting-functions",
  "predeploy": [
    "npm --prefix \"$RESOURCE_DIR\" run lint"
  ]
}
```

**Change to multi-codebase array** (RESEARCH Pattern 1, lines 203-220): keep `reporting` codebase with its existing `source` and `predeploy`, add `sharepoint` codebase with `"source": "apis/sharepoint-functions"`, `"runtime": "python312"`, and an `ignore` list excluding `__pycache__`, `.venv`, `venv`, `*.pyc`, `tests`, `.pytest_cache`.

**Do not:** drop the Node `predeploy` (it is the only existing predeploy gate), or re-point `source` away from `apis/reporting-functions`.

---

### `firestore.rules` (config, authorization)

**Analog (inverted):** current `firestore.rules` — this is the anti-pattern to replace.

**Anti-pattern to remove** (`firestore.rules` lines 21-25):
```js
match /{document=**} {
  allow read: if signedIn()
    && (!datatemProtectedCollection() || request.path[0] != 'datatemIntegration');
  allow write: if signedIn() && !datatemProtectedCollection();
}
```

**Target pattern** (RESEARCH § Code Example 1, lines 329-354): explicit `isOwner(uid)` helper, explicit `match` per collection, and `allow read, write: if false;` for `sharepointCredentials`, `sharepointOAuthTransactions`, `sharepointSyncQueue`, `sharepointAudit`, `sharepointUsage`. Keep existing `datatemProtectedCollection()` deny semantics by listing existing protected collections explicitly instead of relying on the wildcard. Default deny is the absence of a catch-all match.

**Preserve helper style** (`firestore.rules:6-19`): keep `function signedIn()` and add `function isOwner(uid) { return signedIn() && request.auth.uid == uid; }`.

---

### `firestore.indexes.json` (config, query indexes)

**Analog:** `firestore.indexes.json` (existing single composite index).

**Existing structure to copy** (`firestore.indexes.json:1-19`): `indexes` array of `{collectionGroup, queryScope: "COLLECTION", fields:[{fieldPath, order}]}` plus `"fieldOverrides": []`.

**Add for Phase 13:** composite indexes on `sharepointSyncQueue` (`ownerUid ASC, status ASC, createdAt DESC`), `sharepointAudit` (`ownerUid ASC, timestamp DESC`), and `sharepointOAuthTransactions` (`ownerUid ASC, expiresAt ASC`) — final field names per the contracts chosen in the plan. Keep field naming camelCase to match `simcard_store.py:65-113` (`assignedAt`, `updatedAt`, `performedAt`).

---

### `apps/web/src/pages/SettingsPage.tsx` (component, static render)

**Analog:** same file, Security section (`SettingsPage.tsx:154-181`).

**Row object to correct** (`SettingsPage.tsx:164-167`):
```tsx
{[
  { label: 'Two-Factor Authentication', status: 'Disabled', icon: <Shield size={16}/> },
  { label: 'Active Sessions', status: '3 Devices', icon: <Cpu size={16}/> },
  { label: 'Data Encryption', status: 'Enabled (AES-256)', icon: <Lock size={16}/> }
].map((item, idx) => (
```

**Minimum diff (UI-SPEC Copywriting Contract, line 107):** replace only `'Enabled (AES-256)'` with `'—'`. Preserve label, icon (`Lock` from `lucide-react`), key/idx mapping, and the row markup at `:168-179` (`p-6`, `gap-4`, `text-[10px] font-black uppercase tracking-widest opacity-40`). No new component, no shadcn primitive, no state, no fetch.

**Flagged, planner decision (UI-SPEC lines 147-149):** `ENCRYPTION: SECURE` at `SettingsPage.tsx:246` is the same class of false claim. Recommended neutralization is `ENCRYPTION: —`. Not changed by default — planner must decide. Do **not** touch `:165-166` placeholder statuses (out of scope).

---

### `apis/sharepoint-functions/main.py` (route/entrypoint, request-response)

**Analogs:** `apis/reporting-functions/index.js` (entrypoint shape) + `apis/connectivity/fastapi_app/main.py` (app wiring/registration).

**Entrypoint analog** (`apis/reporting-functions/index.js:1-19`): single-file exports of `onRequest` handlers, `admin.initializeApp()` at module top, handlers wrap logic in `try/catch` and return status-coded responses.

**Wiring analog** (`apis/connectivity/fastapi_app/main.py:27-39`): app created once at module scope, dependencies (`settings`, router) imported at top, `include_router` with `/api` prefix. For Gen2 Python, translate this to `@https_fn.on_request()` decorated handlers imported from `auth`, `http`, `validation`, `stores` — keep the handler body thin and delegate to helpers.

**Must apply on every authenticated handler:** `require_firebase_user` (see Shared Patterns → Authentication) and `private_json`/error envelope (see Shared Patterns → Private responses).

---

### `apis/sharepoint-functions/config.py` (config, startup)

**Analog:** `apis/connectivity/fastapi_app/config.py:41-73`.

**Pattern to copy** (`config.py:41-74`): frozen dataclass with `from_env()` classmethod, typed conversion helpers (`_int_env`), and a module-level singleton:
```python
@dataclass(frozen=True)
class BackendSettings:
    ...
    @classmethod
    def from_env(cls) -> "BackendSettings":
        return cls(...)

settings = BackendSettings.from_env()
```

**Fail-fast validation reference** (`apis/connectivity/fastapi_app/datatem/config.py:44-58`): collect missing required names into a list and raise a typed configuration error — adapt so missing secret **references** fail closed at startup (SEC-03), without logging values.

**Harden:** no `dotenv` file loading of real secrets in Gen2; read from env vars injected by `--set-secrets`. `.env.example` carries names only.

---

### `apis/sharepoint-functions/auth.py` (middleware/auth guard, request-response)

**Analog:** `apis/connectivity/fastapi_app/firebase_client.py:82-115`.

**Bearer extraction + verification pattern** (`firebase_client.py:82-93`):
```python
header = request.headers.get("authorization", "")
if not header.lower().startswith("bearer "):
    raise HTTPException(status_code=401, detail="autenticação necessária")
token = header[7:].strip()
if not token:
    raise HTTPException(status_code=401, detail="autenticação necessária")
try:
    claims = firebase_auth.verify_id_token(token)
except Exception as exc:
    raise HTTPException(status_code=401, detail="token inválido ou expirado") from exc
```

**Claims → context pattern** (`firebase_client.py:17-24, 69-79`): frozen `@dataclass` `AuthenticatedUser` + `_claims_to_user(claims)`. Extend to `AuthContext(uid, tenant_id, role, is_admin)` with `tenant_id` derived **only** from verified claims (RESEARCH Open Question 1) — never from body/query. Raise `403` for missing role/tenant (mirror `require_write_permission`, `firebase_client.py:113-115`).

**Harden (do NOT copy as-is):** the profile lookup at `:96-109` is a nice role-enrichment pattern, but it silently swallows Firestore errors (`except Exception: profile = {}`). For Phase 13 fail closed on sensitive endpoints; keep the enrichment optional and non-authoritative.

**Do not use** `routes_datatem.py:33-37` (`SYSTEM_ACTOR`) as an auth shortcut — that is the known IDOR pattern (RESEARCH Anti-Patterns, line 270).

---

### `apis/sharepoint-functions/secrets.py` (service, secrets provider)

**Analog (partial):** `apis/connectivity/fastapi_app/datatem/config.py:44-58` + `apis/connectivity/fastapi_app/firebase_client.py:26-50` (credential resolution/init).

**Pattern to reuse:** centralized credential resolution with explicit precedence and fail-closed return (`firebase_client.py:37-50`: JSON env → file path → application default, `try/except` returning failure). For Phase 13 the equivalent is: read injected env names (`SHAREPOINT_MS_CLIENT_SECRET`, `SHAREPOINT_TOKEN_CRYPTO_KEY_V<N>`) → optionally Secret Manager client → raise typed config error if absent.

**Do not:** log the resolved value, return it to handlers beyond the crypto/MSAL call site, or expose it via any response/UI path.

---

### `apis/sharepoint-functions/crypto.py` (utility, transform) — NO ANALOG

**No analog exists.** Use RESEARCH § Code Example 3 (`13-RESEARCH.md:371-389`) and `cryptography.hazmat.primitives.ciphers.aead.AESGCM`.

Required shape: `nonce = os.urandom(12)` per write, `ciphertext = AESGCM(key).encrypt(nonce, plaintext, aad)` (tag included), envelope `{algorithm, keyVersion, nonce_b64, ciphertext_b64, aad, updatedAt}`, fail closed on unknown key version, never plaintext fallback (RESEARCH Pattern 3, lines 234-250; Anti-Patterns line 268 forbids copying `token_store.py:45-65`).

---

### `apis/sharepoint-functions/http.py` (utility, response/error) — PARTIAL ANALOG

**Analog:** `apis/connectivity/fastapi_app/datatem/errors.py:52-69` + `apis/connectivity/fastapi_app/routes_datatem.py:64-71`.

**Sanitized error envelope pattern** (`errors.py:52-69`): typed error with a fixed `message` lookup, never carrying credentials (`"""Erro sanitizado ... Nunca contém credenciais."""`). HTTP projection pattern (`routes_datatem.py:64-71`):
```python
detail={"code": error.kind.value, "message": error.message}
```
Use the same `{code, message}` response body for SharePoint errors; map internal kinds to 400/401/403/404/409/429/500/503.

**No-store headers (no repo analog):** create `PRIVATE_NO_STORE_HEADERS` exactly as RESEARCH § Code Example 2 (`13-RESEARCH.md:358-369`): `Cache-Control: no-store, private, max-age=0`, `Pragma: no-cache`, `Expires: 0`, plus `Content-Type: application/json`. Apply to success **and** error responses (SEC-05).

---

### `apis/sharepoint-functions/validation.py` (utility, input guards) — PARTIAL ANALOG

**Analog:** `apis/connectivity/fastapi_app/datatem/models.py:24-52` (typed contracts/field constraints).

**Reuse:** pydantic `BaseModel` + `Field`/`Literal` typed contracts so invalid payloads fail early (see `models.py:24-52`). For SEC-08 add explicit guards per RESEARCH § Code Example 4 (`13-RESEARCH.md:393-407`): MIME allow-list, byte-size cap, filename rejection of `..`, `/`, `\`, `\x00`.

**Rate limiting:** no analog. Use a small per-`uid`+`endpoint` counter with a short window stored in Firestore (RESEARCH Open Question 2) or an in-process request guard; return `429` with the sanitized error envelope. No Redis/SQLite/temp files (SEC-09).

---

### `apis/sharepoint-functions/logging_utils.py` (utility, redaction) — PARTIAL ANALOG

**Analog:** `apis/connectivity/fastapi_app/datatem/errors.py:52-53` (the "never contains credentials" contract).

**Pattern to extend:** a central `redact(record)` / `safe_log(event)` that keeps only `requestId`, `uid`, `tenantId`, `docId/jobId`, status codes and timestamps, and drops/replaces `code`, `state`, `nonce`, `token`, `Authorization`, `ciphertext`, and file content (SEC-07). All handlers and stores log through it — no raw `print(payload)`.

---

### `apis/sharepoint-functions/requirements.txt` (config, deps)

**Analog:** `apis/connectivity/requirements.txt`.

**Range style to copy** (`requirements.txt:6-9`): `firebase-admin>=6.4,<7`, `google-cloud-firestore>=2.20,<3`, `pytest>=8.0,<9`. Start from RESEARCH Installation block (`13-RESEARCH.md:100-107`) but keep the repo's compatible ranges. **Checkpoint:** all candidates are flagged `[SUS]` in RESEARCH § Package Legitimacy Audit — planner must insert `checkpoint:human-verify` before pinning/installing.

---

### `apis/sharepoint-functions/pytest.ini` (config, test)

**Analog:** `apis/connectivity/pytest.ini`:
```ini
[pytest]
testpaths = tests
asyncio_mode = auto
```
Copy as-is if async handlers are tested; otherwise keep `testpaths = tests`.

---

### `apis/sharepoint-functions/models/` (model, contracts)

**Analog:** `apis/connectivity/fastapi_app/datatem/models.py:8-70`.

**Pattern** (`models.py:1-21`): `from __future__ import annotations`, pydantic `BaseModel`, `ConfigDict`, `Field(default_factory=...)`, `Literal[...]` for enums. Define `AuthContext` (frozen dataclass is fine — see `firebase_client.py:17-24`), `EncryptedBlob` (`algorithm`, `keyVersion`, `nonce_b64`, `ciphertext_b64`, `aad`, `updatedAt`), and queue/settings/usage contracts. Keep camelCase field names so documents match `simcard_store.py:65-113` and the web `shared/types/*` conventions.

---

### `apis/sharepoint-functions/stores/sharepoint_store.py` (service, CRUD transactional)

**Analog:** `apis/connectivity/fastapi_app/simcard_store.py`.

**Transaction wrapper to copy** (`simcard_store.py:179-189`):
```python
def _run_transaction(self, operation: Callable[[firestore.Transaction], T]) -> T:
    try:
        return firestore.transactional(operation)(self._db.transaction())
    except ValueError as exc:
        if isinstance(exc.__cause__, Aborted):
            raise AssignmentConflictError() from None
        raise
```

**Transaction get compatibility helper** (`simcard_store.py:37-47`) — copy unchanged; it handles both old/new Firestore SDK return shapes.

**Write pattern** (`simcard_store.py:314-363`): build snapshot dicts as pure functions (`build_*_document`, `simcard_snapshot`, lines 65-113), then `transaction.set(ref, {..., "createdAt": firestore.SERVER_TIMESTAMP, "updatedAt": firestore.SERVER_TIMESTAMP})`. Use `SERVER_TIMESTAMP` for all timestamps.

**HARDENING (critical divergence):** every read/write must take `owner_uid`/`tenant_id` from `AuthContext` and filter by it (`query.where("ownerUid", "==", ctx.uid)`), because Admin SDK bypasses rules (RESEARCH Anti-Patterns line 273; SEC-06). Never copy the unfiltered `get_assignments()` / `stream()` pattern at `simcard_store.py:191-211` for user-scoped SharePoint collections.

**Do not copy:** `datatem/token_store.py` `FirestoreTokenStore` (plaintext `access_token`/`refresh_token`, lines 45-65).

---

### Tests (`apis/sharepoint-functions/tests/`)

**Analog:** `apis/connectivity/tests/` — `test_normalize.py:1-40` (pure-function asserts), `test_datatem_client.py:40-60` (fake/in-memory collaborator injection), `test_assignment.py:39-70` (hand-rolled `FakeSnapshot`/`FakeDocument`/`FakeDB` to exercise Firestore stores without the emulator).

**Pattern:**
```python
from __future__ import annotations
import pytest
from fastapi_app... import ...
```
For the new codebase, import from the local package (`from auth import require_firebase_user`, etc.) and inject fakes for `firestore.Client` and the token verifier. Use the `FakeDB` approach from `test_assignment.py:39-70` for `test_tenant_isolation.py` / `test_config_secrets.py`.

**Test-to-requirement mapping** (from RESEARCH § New Tests Required, lines 532-542): `test_auth.py`→SEC-01, `test_firestore_rules.py`→SEC-02, `test_config_secrets.py`→SEC-03, `test_crypto.py`→SEC-04, `test_http_headers.py`→SEC-05, `test_tenant_isolation.py`→SEC-06, `test_logging_redaction.py`→SEC-07, `test_upload_validation.py`→SEC-08, `test_no_temp_persistence.py`→SEC-09.

**No analog:** `test_firestore_rules.py` (no rules-test suite exists — RESEARCH § Existing Coverage, line 528) and `test_no_temp_persistence.py` (new static/behavioral class). Use RESEARCH Validation Architecture commands and fall back to static inspection if the emulator/Java is unavailable (RESEARCH § Environment Availability, line 473).

---

### `.env.example` (MOD, config/docs)

**Analog:** current `.env.example`.

**Pattern** (`.env.example`, DataTEM block): grouped sections with comments, real-looking placeholders only (`seu-usuario-datatem`, `sua-senha-datatem`), and the frontend section explicitly labeled `# Frontend (Vite) - apenas valores publicos`.

**Add** a `# SharePoint (Cloud Functions Gen2 — referências, sem valores)` block listing only names: `SHAREPOINT_MS_CLIENT_SECRET`, `SHAREPOINT_TOKEN_CRYPTO_KEY_V1`, `SHAREPOINT_TENANT_ID` (reference), and a note that values come from Secret Manager / `--set-secrets`. Never add `VITE_*` secret entries (SEC-03).

---

### Optional UI contract files (only if the plan exposes SharePoint types to the web app)

**`shared/types/sharepoint/index.ts`** — analog `shared/types/workspace/index.ts:1-21`: `import { BaseEntity } from '../index';`, interfaces extending `BaseEntity`, optional fields with `?`. Then re-export from `shared/types/index.ts:1-13` (`export * from './sharepoint';`) — copy the barrel pattern.

**`shared/schemas/index.ts` (MOD)** — analog `shared/schemas/index.ts:15-34`: `baseEntitySchema.extend({...})`, `z.enum`, `.default(...)`, `.optional()`.

**`firebase/converters/index.ts` (MOD)** — analog `firebase/converters/index.ts:31-69`: `FirestoreDataConverter<T>` with `toFirestore` calling `schema.parse(entity)` and `fromFirestore` normalizing via `convertDate` (`:24-29`).

These three are optional in Phase 13; if skipped, no SharePoint data contract is exposed to the client — which is the safer default (RESEARCH Open Question 3).

---

## Shared Patterns

### Authentication / identity derivation
**Source:** `apis/connectivity/fastapi_app/firebase_client.py:82-115`
**Apply to:** every authenticated `https_fn` in `main.py`; all stores receive `AuthContext`.
- `Authorization: Bearer <token>` → `firebase_admin.auth.verify_id_token`.
- 401 on missing/invalid token; 403 on missing role/tenant.
- `uid`/`tenant_id` come from the decoded token only. Never read them from body/query (SEC-06).
- Optionally use `check_revoked=True` on sensitive operations (RESEARCH Pattern 2, line 231).

### Private response headers (anti-cache)
**Source:** RESEARCH § Code Example 2 (`13-RESEARCH.md:358-369`) — **no repo analog**
**Apply to:** all SharePoint HTTP responses (success and error).
```python
PRIVATE_NO_STORE_HEADERS = {
    "Cache-Control": "no-store, private, max-age=0",
    "Pragma": "no-cache",
    "Expires": "0",
}
```

### Sanitized error envelope
**Source:** `apis/connectivity/fastapi_app/datatem/errors.py:52-69`, projected at `routes_datatem.py:64-71`
**Apply to:** `http.py` and every handler catch block.
- Fixed human messages keyed by error kind; never credentials/tokens/payloads.
- Body shape `{"code": <stable_string>, "message": <safe_message>}`.
- Never reuse the reporting function's `res.status(500).send({ error: error.message })` (`apis/reporting-functions/index.js:15-18`) — it leaks internal messages.

### Firestore transactional access (owner-scoped)
**Source:** `apis/connectivity/fastapi_app/simcard_store.py:37-47, 179-189, 314-363`
**Apply to:** all SharePoint stores.
- `SERVER_TIMESTAMP` for `createdAt`/`updatedAt`.
- Transaction wrapper with `Aborted` → typed conflict error.
- Pure snapshot-builder functions separate from writes.
- **Divergence:** add `where("ownerUid", "==", ctx.uid)` (and tenant) to every query; Admin SDK bypasses Firestore rules.

### Fail-fast configuration
**Source:** `apis/connectivity/fastapi_app/config.py:41-74` + `datatem/config.py:44-58`
**Apply to:** `config.py`, `secrets.py`, `main.py` startup.
- Frozen dataclass + `from_env()` singleton.
- Validate required names at startup; raise a typed error listing **names** (never values).

### Redaction / safe logging
**Source:** `apis/connectivity/fastapi_app/datatem/errors.py:52-53` (contract) — extend with centralized redactor
**Apply to:** every handler, store, and exception path. Log only IDs/status/timestamps (SEC-07).

### UI row rendering (SettingsPage)
**Source:** `apps/web/src/pages/SettingsPage.tsx:163-181`
**Apply to:** the single text correction. Keep the inline-array `.map` render, Lucide icons, and existing Tailwind/legacy-CSS classes; change only the status string.

### Dependency range style
**Source:** `apis/connectivity/requirements.txt:6-9`
**Apply to:** new `requirements.txt` — compatible lower/upper ranges, aligned with existing `firebase-admin` and `pytest`.

---

## No Analog Found

| File | Role | Data Flow | Reason / Fallback |
|------|------|-----------|-------------------|
| `apis/sharepoint-functions/crypto.py` | utility (crypto) | transform | No AEAD/crypto helper exists in repo. Use RESEARCH § Code Example 3 + `cryptography` AESGCM; never copy `datatem/token_store.py`. |
| `apis/sharepoint-functions/http.py` (no-store half) | utility | request-response | No response-header helper exists. Use RESEARCH § Code Example 2. The error-envelope half has a partial analog (`errors.py`). |
| `apis/sharepoint-functions/secrets.py` | service | request-response | No Secret Manager integration exists. Use `--set-secrets` + fail-fast config pattern from `datatem/config.py:44-58`. |
| `apis/sharepoint-functions/tests/test_firestore_rules.py` | test | rules/emulator | No rules-test suite exists in the repo (`TESTING.md:171`). Use `firebase emulators:exec` per RESEARCH V-08, with manual rules review as fallback. |
| `apis/sharepoint-functions/tests/test_no_temp_persistence.py` | test | static inspection | New test class. Assert no `tempfile`/`SpooledTemporaryFile`/disk writes; combine unit assertions with a directed `Grep` of SharePoint paths. |
| `apis/sharepoint-functions/validation.py` (rate-limit half) | utility | request-response | No rate-limiting code exists. Use Firestore counters keyed by `uid`+endpoint (RESEARCH Open Question 2) or an in-process guard; no Redis/SQLite. |

---

## Metadata

**Analog search scope:** repo root, `apis/connectivity/fastapi_app/`, `apis/connectivity/tests/`, `apis/reporting-functions/`, `shared/types/`, `shared/schemas/`, `firebase/converters/`, `apps/web/src/pages/`
**Files scanned:** ~18 source files + 6 configs
**Tracked-source verification:** all named analog paths confirmed via `git ls-files` (no mirror/gitignored paths emitted)
**Pattern extraction date:** 2026-11-18

## PATTERN MAPPING COMPLETE
