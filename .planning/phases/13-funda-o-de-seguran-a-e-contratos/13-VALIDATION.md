---
phase: "13"
slug: "funda-o-de-seguran-a-e-contratos"
status: draft
nyquist_compliant: false
wave_0_complete: false
created: "2026-11-18"
---

# Phase 13 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | pytest (backend Python), Firebase CLI (rules/emulator), npm scripts (frontend sanity) |
| **Config file** | `apis/connectivity/pytest.ini`; novo codebase `apis/sharepoint-functions/` |
| **Quick run command** | `python -m pytest -q apis/sharepoint-functions/tests/test_crypto.py apis/sharepoint-functions/tests/test_http_headers.py apis/sharepoint-functions/tests/test_upload_validation.py` |
| **Full suite command** | `python -m pytest -q apis/sharepoint-functions/tests` |
| **Estimated runtime** | ~30-60 seconds (sem emulador); emulador pode exigir Java |

---

## Sampling Rate

- **After every task commit:** `python -m pytest -q apis/sharepoint-functions/tests`
- **After every plan wave:** `python -m pytest -q apis/sharepoint-functions/tests` + `python -m pytest -q apis/connectivity/tests`
- **Before `/gsd-verify-work`:** Full suite must be green; frontend sanity green or baseline debt explicitly recorded
- **Max feedback latency:** 90 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 13-01-01 | TBD | 1 | SEC-01 | T-13-01 | Bearer ausente/inválido é rejeitado; uid/tenant vêm do token, não do body | unit | `python -m pytest -q apis/sharepoint-functions/tests/test_auth.py` | ❌ W0 | ⬜ pending |
| 13-01-02 | TBD | 1 | SEC-02 | T-13-02 | Regras negam leitura/escrita cliente em coleções privadas e cross-user | rules/emulator | `firebase emulators:exec --only firestore "python -m pytest -q apis/sharepoint-functions/tests/test_firestore_rules.py"` | ❌ W0 | ⬜ pending |
| 13-01-03 | TBD | 1 | SEC-03 | T-13-03 | Config falha fechado sem segredos/chave; nenhum valor vaza em payload/log | unit | `python -m pytest -q apis/sharepoint-functions/tests/test_config_secrets.py` | ❌ W0 | ⬜ pending |
| 13-01-04 | TBD | 1 | SEC-04 | T-13-04 | AES-256-GCM usa nonce único, tag/AAD e keyVersion; falha com chave/AAD errados | unit | `python -m pytest -q apis/sharepoint-functions/tests/test_crypto.py` | ❌ W0 | ⬜ pending |
| 13-01-05 | TBD | 1 | SEC-05 | T-13-05 | Sucesso e erro incluem `Cache-Control: no-store, private, max-age=0`, `Pragma: no-cache`, `Expires: 0` | unit | `python -m pytest -q apis/sharepoint-functions/tests/test_http_headers.py` | ❌ W0 | ⬜ pending |
| 13-01-06 | TBD | 1 | SEC-06 | T-13-06 | Stores filtram por `ownerUid`/`tenantId`; cross-tenant é negado | unit | `python -m pytest -q apis/sharepoint-functions/tests/test_tenant_isolation.py` | ❌ W0 | ⬜ pending |
| 13-01-07 | TBD | 1 | SEC-07 | T-13-07 | Redactor remove tokens/segredos/Authorization/conteúdo e mantém IDs/status/timestamps | unit | `python -m pytest -q apis/sharepoint-functions/tests/test_logging_redaction.py` | ❌ W0 | ⬜ pending |
| 13-01-08 | TBD | 1 | SEC-08 | T-13-08 | MIME/tamanho/nome/caminho inválidos e limites geram erro compreensível | unit | `python -m pytest -q apis/sharepoint-functions/tests/test_upload_validation.py` | ❌ W0 | ⬜ pending |
| 13-01-09 | TBD | 1 | SEC-09 | T-13-09 | Nenhum helper usa disco/temp; storage restrito a Firestore/R2 | unit | `python -m pytest -q apis/sharepoint-functions/tests/test_no_temp_persistence.py` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apis/sharepoint-functions/tests/test_auth.py` — SEC-01
- [ ] `apis/sharepoint-functions/tests/test_firestore_rules.py` — SEC-02/SEC-06 (emulador)
- [ ] `apis/sharepoint-functions/tests/test_config_secrets.py` — SEC-03
- [ ] `apis/sharepoint-functions/tests/test_crypto.py` — SEC-04
- [ ] `apis/sharepoint-functions/tests/test_http_headers.py` — SEC-05
- [ ] `apis/sharepoint-functions/tests/test_tenant_isolation.py` — SEC-06
- [ ] `apis/sharepoint-functions/tests/test_logging_redaction.py` — SEC-07
- [ ] `apis/sharepoint-functions/tests/test_upload_validation.py` — SEC-08
- [ ] `apis/sharepoint-functions/tests/test_no_temp_persistence.py` — SEC-09
- [ ] `apis/sharepoint-functions/tests/conftest.py` — fixtures compartilhadas
- [ ] `apis/sharepoint-functions/requirements.txt` — dependências verificadas/pinadas

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Texto enganoso "Data Encryption: Enabled (AES-256)" removido de `SettingsPage.tsx` | SEC-03/SEC-04 | UI não tem runner de testes automatizados | Abrir `apps/web/src/pages/SettingsPage.tsx` e confirmar ausência da string; rodar `npm run web:build` |
| Nenhum segredo/chave versionado | SEC-03 | Inspeção de config/repo | Buscar valores reais em `firebase.json`, `.env.example`, `requirements.txt`, código e logs de teste; apenas nomes/referências são permitidos |
| Respostas privadas via HTTP | SEC-05 | Headers dependem do runtime deployado | `curl -i` no endpoint local e conferir os três headers exatos em sucesso e erro |
| Log redigido | SEC-07 | Saída de runtime não é totalmente determinística | Revisar amostras de logs/auditoria geradas nos testes; apenas IDs, status e timestamps |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 90s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
