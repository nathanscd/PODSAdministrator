---
phase: "13"
slug: "funda-o-de-seguran-a-e-contratos"
status: validated
nyquist_compliant: true
wave_0_complete: true
created: "2026-11-18"
validated: "2026-11-18"
---

# Phase 13 — Validation Strategy (Validated)

> Per-phase validation contract, audited against the eight implemented plans and the automated test suite on 2026-11-18.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | pytest (backend Python), Firebase CLI (rules/emulator), npm scripts (frontend sanity) |
| **Config file** | `apis/connectivity/pytest.ini`; novo codebase `apis/sharepoint-functions/` |
| **Python runtime** | `backend\.venv\Scripts\python.exe` (Python 3.14.7) |
| **Quick run command** | `python -m pytest -q apis/sharepoint-functions/tests/test_crypto.py apis/sharepoint-functions/tests/test_http_headers.py apis/sharepoint-functions/tests/test_upload_validation.py apis/sharepoint-functions/tests/test_endpoint_behavior.py` |
| **Full suite command** | `python -m pytest -q apis/sharepoint-functions/tests` |
| **Connectivity suite** | `python -m pytest -q apis/connectivity/tests` |
| **Measured results (2026-11-18)** | SharePoint: `133 passed, 1 skipped`; Connectivity: `25 passed`; frontend `npm run web:build` passed |
| **Estimated runtime** | ~2s (SharePoint), ~2s (Connectivity); emulador pode exigir Java |

Comando exato executado (cache desabilitada):

```
$env:PYTHONDONTWRITEBYTECODE='1'; & "backend\.venv\Scripts\python.exe" -m pytest -q apis/sharepoint-functions/tests -p no:cacheprovider
```

---

## Sampling Rate

- **After every task commit:** `python -m pytest -q apis/sharepoint-functions/tests`
- **After every plan wave:** `python -m pytest -q apis/sharepoint-functions/tests` + `python -m pytest -q apis/connectivity/tests`
- **Before `/gsd-verify-work`:** Full suite must be green; frontend sanity green or baseline debt explicitly recorded
- **Max feedback latency:** 90 seconds (medido: ~2s)

---

## Requirement → Task → Test Map

| Requirement | Plan / Tasks | Secure Behavior | Test Type | Automated Command | Test File | File Exists | Status |
|-------------|--------------|-----------------|-----------|-------------------|-----------|-------------|--------|
| SEC-01 | 13-05 + 13-07 | Bearer ausente/malformado → 401 no-store; erro de tenant → 403; métodos errados → 405; sucesso sem vazar dados; erro não expõe detalhe | unit + behavioral | `python -m pytest -q apis/sharepoint-functions/tests/test_auth.py apis/sharepoint-functions/tests/test_endpoint_behavior.py apis/sharepoint-functions/tests/test_endpoint_guards.py` | `test_auth.py`, `test_endpoint_behavior.py`, `test_endpoint_guards.py` | ✅ | ✅ green |
| SEC-02 | 13-04 | Regras negam leitura/escrita cliente em coleções privadas; deny-all para SharePoint; índices presentes | rules/static + emulator | `python -m pytest -q apis/sharepoint-functions/tests/test_firestore_rules.py` | `test_firestore_rules.py` | ✅ | ✅ green (static) / ⚠️ emulator env-gated |
| SEC-03 | 13-01 | Config falha fechado sem segredos/chave; nomes de variáveis, nunca valores | unit | `python -m pytest -q apis/sharepoint-functions/tests/test_config_secrets.py` | `test_config_secrets.py` | ✅ | ✅ green |
| SEC-04 | 13-02 | AES-256-GCM com nonce único, tag/AAD por tenant/purpose, rotação `keyVersion`, envelopes malformados rejeitados | unit | `python -m pytest -q apis/sharepoint-functions/tests/test_crypto.py` | `test_crypto.py` | ✅ | ✅ green |
| SEC-05 | 13-03 | Sucesso e erro com `Cache-Control: no-store, private, max-age=0`, `Pragma: no-cache`, `Expires: 0`; vocabulário de erro fechado | unit + behavioral | `python -m pytest -q apis/sharepoint-functions/tests/test_http_headers.py apis/sharepoint-functions/tests/test_endpoint_behavior.py` | `test_http_headers.py`, `test_endpoint_behavior.py` | ✅ | ✅ green |
| SEC-06 | 13-05 | Stores filtram por `companyId`/`ownerUid`; cross-tenant → 404; ordenação estável | unit | `python -m pytest -q apis/sharepoint-functions/tests/test_tenant_isolation.py` | `test_tenant_isolation.py` | ✅ | ✅ green |
| SEC-07 | 13-06 | Allow-list de 15 chaves escalares; tokens/segredos/Authorization removidos; IDs hasheados; severidade mapeada | unit | `python -m pytest -q apis/sharepoint-functions/tests/test_logging_redaction.py` | `test_logging_redaction.py` | ✅ | ✅ green |
| SEC-08 | 13-06 | MIME/extensão/tamanho/caminho normalizados; limites com erro compreensível; rate limiter fail-closed | unit | `python -m pytest -q apis/sharepoint-functions/tests/test_upload_validation.py apis/sharepoint-functions/tests/test_endpoint_behavior.py` | `test_upload_validation.py`, `test_endpoint_behavior.py` | ✅ | ✅ green / ⚠️ contention manual |
| SEC-09 | 13-08 | Nenhum helper usa disco/temp; storage restrito a Firestore/R2; UI sem alegação falsa de criptografia | static | `python -m pytest -q apis/sharepoint-functions/tests/test_no_temp_persistence.py` | `test_no_temp_persistence.py` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky / env-gated / manual-only*

Notas:
- SEC-01 era coberto apenas por testes unitários de `auth.py` e por guarda AST em `test_endpoint_guards.py`; o comportamento HTTP real dos handlers não era executado. Gap fechado em 2026-11-18 com `test_endpoint_behavior.py` (19 testes).
- SEC-02: teste com emulador existe mas é ignorado quando `FIRESTORE_EMULATOR_HOST` não está definido (`test_firestore_rules.py:248`); durante a execução da fase o emulador foi executado com Java 21 + Firebase CLI 15.36.0.
- SEC-08: contenção transacional real do Firestore marcada `human_judgment: true` na decisão D4; coberta por `InMemoryRateLimiter` concorrente nos testes automatizados.

---

## Nyquist Audit Trail (2026-11-18)

| Step | Result |
|------|--------|
| Baseline SharePoint suite | `114 passed, 1 skipped` |
| Baseline Connectivity suite | `25 passed` |
| Gap identificado | SEC-01: `main.py` imports `firebase_functions` at module load; handlers never executed, only AST-checked |
| Test created | `apis/sharepoint-functions/tests/test_endpoint_behavior.py` — 19 behavioral tests with stubbed `firebase_functions`/`firebase_admin` |
| Debug iteration 1 | 2/19 failed: `firestore.client()` raised before stubbed limiter; added `stub_firestore_client` fixture |
| Debug iteration 2 | `19 passed` — no implementation changes |
| Final SharePoint suite | `133 passed, 1 skipped` (114 baseline + 19 new) |
| Final Connectivity suite | `25 passed` |
| Implementation files modified | Nenhum |
| Unrelated files modified | Nenhum |

---

## Wave 0 Requirements

- [x] `apis/sharepoint-functions/tests/test_auth.py` — SEC-01
- [x] `apis/sharepoint-functions/tests/test_firestore_rules.py` — SEC-02 (static + emulador)
- [x] `apis/sharepoint-functions/tests/test_config_secrets.py` — SEC-03
- [x] `apis/sharepoint-functions/tests/test_crypto.py` — SEC-04
- [x] `apis/sharepoint-functions/tests/test_http_headers.py` — SEC-05
- [x] `apis/sharepoint-functions/tests/test_tenant_isolation.py` — SEC-06
- [x] `apis/sharepoint-functions/tests/test_logging_redaction.py` — SEC-07
- [x] `apis/sharepoint-functions/tests/test_upload_validation.py` — SEC-08
- [x] `apis/sharepoint-functions/tests/test_no_temp_persistence.py` — SEC-09
- [x] `apis/sharepoint-functions/tests/test_endpoint_behavior.py` — SEC-01/SEC-05/SEC-08 (behavioral, created during audit)
- [x] `apis/sharepoint-functions/tests/conftest.py` — fixtures compartilhadas
- [x] `apis/sharepoint-functions/requirements.txt` — dependências verificadas/pinadas

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Regras do Firestore no emulador | SEC-02 | `FIRESTORE_EMULATOR_HOST` não definido no ambiente padrão; teste é ignorado | `firebase emulators:exec --only firestore "python -m pytest -q apis/sharepoint-functions/tests/test_firestore_rules.py"` (Java + Firebase CLI necessários) |
| Contenção transacional real do Firestore | SEC-08 | Decisão D4 `human_judgment: true`; exige instância real | Revisar `FirestoreRateLimiter.check` sob concorrência real com `firestore.transactional`; verificar decisão única de `allowed` |
| Respostas privadas no endpoint deployado | SEC-05 | Headers dependem do runtime deployado (cobertos localmente por `test_endpoint_behavior.py`) | `curl -i` no endpoint real e conferir os três headers exatos em sucesso e erro |
| Nenhum segredo/chave versionado | SEC-03 | Inspeção de config/repo | Buscar valores reais em `firebase.json`, `.env.example`, `requirements.txt`, código e logs de teste; apenas nomes/referências são permitidos |
| Aprovação humana dos pins exatos de dependência | SEC-03 | Decisão D-13-D; exige julgamento humano | Revisar `apis/sharepoint-functions/requirements.txt` e confirmar os pins aprovados antes do deploy |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 90s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** validated 2026-11-18 (auditoria Nyquist; manual-only items documentados acima)
