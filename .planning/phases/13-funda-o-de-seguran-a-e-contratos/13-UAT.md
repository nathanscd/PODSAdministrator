---
status: partial
phase: 13-funda-o-de-seguran-a-e-contratos
source: 13-01-SUMMARY.md, 13-02-SUMMARY.md, 13-03-SUMMARY.md, 13-04-SUMMARY.md, 13-05-SUMMARY.md, 13-06-SUMMARY.md, 13-07-SUMMARY.md, 13-08-SUMMARY.md
started: 2026-11-18T19:11:04Z
updated: 2026-11-18T19:32:51Z
---

## Current Test

[testing paused — 5 items outstanding]

## Tests

### 1. Firestore emulator rule enforcement
expected: Unauthenticated reads/writes return 403; signed-in reads on allowed collections return 200 or 404; SharePoint credential collections remain denied.
result: skipped
reason: Deferred by user; manual UAT to resume later. Earlier "Issue" selection was not a test result and was discarded.

### 2. Real Firestore transactional rate-limit contention
expected: Only the configured number of requests is allowed; the last slot is consumed exactly once; excess requests are denied with sanitized `rate_limited`.
result: skipped
reason: Deferred by user; manual UAT to resume later.

### 3. Deployed no-store response headers
expected: Every `/sharepoint/me` and `/sharepoint/upload-intent` response includes `Cache-Control: no-store, private, max-age=0, no-cache, must-revalidate`, `Pragma: no-cache`, and `Expires: 0`, with fixed sanitized error bodies.
result: skipped
reason: Deferred by user; manual UAT to resume later.

### 4. Secret Manager deployment wiring
expected: `SHAREPOINT_MS_CLIENT_SECRET` and `SHAREPOINT_TOKEN_CRYPTO_KEY_V1` are injected from Secret Manager via `--set-secrets`; `secretmanager.secretAccessor` is granted; no value appears in config output.
result: skipped
reason: Deferred by user; manual UAT to resume later.

### 5. Settings page visual confirmation
expected: Data Encryption and ENCRYPTION display a neutral dash; no AES-256/SECURE claim; layout and other rows unchanged.
result: skipped
reason: Deferred by user; manual UAT to resume later.

## Summary

total: 5
passed: 0
issues: 0
pending: 0
skipped: 5
blocked: 0

## Gaps
