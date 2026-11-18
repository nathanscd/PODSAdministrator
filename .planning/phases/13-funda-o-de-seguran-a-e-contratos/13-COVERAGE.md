# Phase 13 — API Coverage Matrix

Scope: SharePoint/Graph capabilities considered for "Fundação de Segurança e Contratos". Phase 13 ships the trust boundary only (auth, tenancy, secrets, crypto, rules, validation, rate limiting, honest UI). Any capability marked INTEGRATE below is listed for the phase that consumes it, with Phase 13 supplying the contract it will sit behind.

| capability | decision | reason |
|------------|----------|--------|
| Microsoft Graph — read file and item metadata | INTEGRATE | Phase 15 reads document metadata through a backend proxy; Phase 13 fixes the `AuthContext` and no-store response contract it must use. |
| Microsoft Graph — upload file content | INTEGRATE | Phase 14 performs the upload; Phase 13 supplies `validate_upload_metadata`, the size ceiling and the Firestore queue it enqueues into. |
| Microsoft Graph — enumerate drive items and folders | INTEGRATE | Phase 15 needs tenant-scoped listing; Phase 13 supplies the tenant resolution and the store that scopes every query by `companyId`. |
| Microsoft Graph — site and drive discovery by tenant | INTEGRATE | Phase 14 needs the tenant's site id before any call; Phase 13 supplies the encrypted settings document and the deny-all rules block for it. |
| Microsoft Graph — search | INTEGRATE | Phase 15 search reuses the same proxy boundary; no separate credential or storage model is introduced. |
| Microsoft identity platform — authorization code flow with PKCE | INTEGRATE | Phase 14 runs the OAuth exchange; Phase 13 fixes the secret reference names and forbids any `VITE_*` secret exposure. |
| Microsoft identity platform — token endpoint (refresh) | INTEGRATE | Phase 14 refreshes tokens server-side; Phase 13 supplies `crypto.encrypt_blob` for the refresh token and `sharepointTokens` deny-all rules. |
| MSAL token cache serialization | INTEGRATE | Phase 14 persists the cache; Phase 13 defines the envelope shape (`algorithm`, `keyVersion`, `nonce_b64`, `ciphertext_b64`, `aad`, `updatedAt`) so the cache is never stored in plaintext. |
| Google Cloud Secret Manager | INTEGRATE | Phase 13 requirement SEC-03: the client secret and AES key arrive as `--set-secrets` references read through `secret_provider.py`; implemented in this phase. |
| Firebase Admin SDK — Auth token verification | INTEGRATE | Phase 13 requirement SEC-01: `verify_id_token` with revocation check is the sole identity anchor; implemented in this phase. |
| Firebase Admin SDK — Firestore tenant-scoped access | INTEGRATE | Phase 13 requirement SEC-06: `SharePointStore` scopes every read and write by resolved tenant; implemented in this phase. |
| SharePoint REST (legacy `_api`) endpoints | OPT-OUT | Legacy REST requires app-only or cookie auth models that conflict with the delegated Graph model the product is standardizing on. |
| App-only client credentials (application permissions) | OPT-OUT | Tenant-wide application permissions grant far more than per-user document operations need and cannot be tenant-scoped per end user. |
| Graph webhooks and change subscriptions | OPT-OUT | Subscription lifecycle, renewal and secret validation add an inbound endpoint surface that Phase 13 does not need and would ship unverified. |
| Graph delta query for incremental sync | OPT-OUT | No sync loop exists before Phase 15; shipping a delta contract now would be unused surface with no test coverage. |
| Graph `$batch` request batching | OPT-OUT | Phase 13 makes no Graph call at all; batching is a Phase 15 optimization that must be measured before adoption. |
| Graph thumbnail and preview endpoints | OPT-OUT | Preview rendering is a Phase 16 requirement; adopting it now would add an untested binary response path to a JSON-only contract. |
| Cloudflare R2 object storage | OPT-OUT | Requirement scope defers file storage to Phase 16; Phase 13 must not introduce a second storage backend alongside Firestore. |

## Notes

- No capability is decided by convenience: the eleven INTEGRATE rows are each anchored to a named SEC requirement implemented in this phase or to the plan that consumes the contract with a tested boundary in place.
- The seven OPT-OUT rows are excluded by decision, not by being judged too hard. Each names the specific reason (conflicting auth model, unused surface, or a later phase that owns it) so a future phase can revisit the decision explicitly.
- `sharepointSettings`, `sharepointTokens`, `sharepointOAuthTransactions`, `sharepointQueue`, `sharepointRateLimits` and `sharepointAuditLog` exist as deny-all rule blocks in Phase 13 even though most of their writers arrive in Phase 14; that keeps the rules file stable and prevents a later phase from accidentally shipping a client-readable collection.
