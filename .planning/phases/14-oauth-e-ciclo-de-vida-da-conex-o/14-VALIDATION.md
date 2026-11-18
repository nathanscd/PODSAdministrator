---
phase: "14"
slug: "oauth-e-ciclo-de-vida-da-conex-o"
status: planned
nyquist_compliant: true
wave_0_complete: false
created: "2026-11-18"
---

# Phase 14 — Estratégia de Validação (Planejada)

> Contrato de validação Nyquist da Phase 14, derivado de `14-RESEARCH.md` §Validation Architecture e alinhado aos cinco planos `14-01`…`14-05`. Nenhum requisito é marcado como concluído neste documento: os status abaixo descrevem o estado do planejamento, não da execução.

---

## Infraestrutura de Testes

| Propriedade | Valor |
|-------------|-------|
| **Framework** | pytest + pytest-asyncio `[VERIFIED: apis/sharepoint-functions/requirements.txt:5-6]` |
| **Arquivo de config** | `apis/sharepoint-functions/pytest.ini` (`testpaths = tests`, `asyncio_mode = auto`) |
| **Runtime Python** | `backend\.venv\Scripts\python.exe` (Python 3.14.7) |
| **Comando rápido** | `$env:PYTHONDONTWRITEBYTECODE='1'; & "backend\.venv\Scripts\python.exe" -m pytest -q apis/sharepoint-functions/tests/test_oauth_transaction.py apis/sharepoint-functions/tests/test_oauth_callback.py apis/sharepoint-functions/tests/test_connection_status.py apis/sharepoint-functions/tests/test_disconnect.py -p no:cacheprovider` |
| **Suíte completa** | `$env:PYTHONDONTWRITEBYTECODE='1'; & "backend\.venv\Scripts\python.exe" -m pytest -q apis/sharepoint-functions/tests -p no:cacheprovider` |
| **Sanidade frontend** | `npm run web:build` e `npm run web:lint` `[VERIFIED: package.json:12-13]` |
| **Baseline (2026-11-18)** | `133 passed, 1 skipped, 1 warning in 0.98s` `[VERIFIED: 14-RESEARCH.md:590]` |
| **Latência estimada** | ~1 s (backend); limite de feedback < 90 s |

---

## Frequência de Amostragem

- **A cada commit de tarefa:** suíte completa (comando acima); deve permanecer abaixo de 90 s.
- **A cada merge de wave:** suíte completa + `npm run web:build`; `npm run web:lint` quando houver mudança de frontend.
- **Gate da phase:** suíte completa verde antes de `/gsd-verify-work`; teste de replay com emulador obrigatório quando `FIRESTORE_EMULATOR_HOST` estiver configurado.
- **Nenhum modo watch:** nenhum `<automated>` usa `--watchAll` ou suíte E2E completa.

---

## Mapa Requisito → Plano/Tarefa → Teste

| Requisito | Plano / Tarefas | Comportamento seguro | Tipo de teste | Comando automatizado | Arquivo de teste | Existe? | Status |
|-----------|-----------------|----------------------|---------------|----------------------|------------------|---------|--------|
| CONN-01 | 14-01 T1/T2, 14-05 T3 | Card substitui o placeholder na aba Integrações; switch e badge de status; nenhum status inferido no cliente | build/lint + checklist manual (sem framework de teste de componente) | `npm run web:build; if ($?) { npm run web:lint }` | `apps/web/src/components/IntegrationsSection.tsx`, `apps/web/src/services/sharepointApi.ts` | ❌ Wave 0 (checklist de UI documentada) | ⬜ pendente |
| CONN-02 | 14-02 T1/T2, 14-03 T1/T2, 14-04 T1 | Start autenticado devolve `authorizationUrl` HTTPS da Microsoft, sem `state`, segredo ou cache | unit + behavioral (MSAL mock) | `$env:PYTHONDONTWRITEBYTECODE='1'; & "backend\.venv\Scripts\python.exe" -m pytest -q apis/sharepoint-functions/tests/test_oauth_transaction.py -k "oauth_start" -p no:cacheprovider` | `test_oauth_transaction.py`, `test_msal_client.py` | ❌ Wave 0 | ⬜ pendente |
| CONN-03 | 14-04 T1 | Transação com `uid`, `companyId`, `state`, `nonce`, PKCE e expiração; consumo atômico | unit + Firestore fake/emulator (replay) | `$env:PYTHONDONTWRITEBYTECODE='1'; & "backend\.venv\Scripts\python.exe" -m pytest -q apis/sharepoint-functions/tests/test_oauth_transaction.py -k "oauth_transaction" -p no:cacheprovider` | `test_oauth_transaction.py` | ❌ Wave 0 | ⬜ pendente |
| CONN-04 | 14-04 T2 | `state`, `nonce`, `tid`, UID divergentes, expiração e replay recusados sem emissão de credencial | unit + behavioral | `$env:PYTHONDONTWRITEBYTECODE='1'; & "backend\.venv\Scripts\python.exe" -m pytest -q apis/sharepoint-functions/tests/test_oauth_callback.py -k "oauth_callback" -p no:cacheprovider` | `test_oauth_callback.py` | ❌ Wave 0 | ⬜ pendente |
| CONN-05 | 14-03 T2/T3, 14-04 T3 | Redenção do code, perfil mínimo via Graph/claims, vínculo ao UID e cache cifrado no Firestore | unit com mocks MSAL/Graph | `$env:PYTHONDONTWRITEBYTECODE='1'; & "backend\.venv\Scripts\python.exe" -m pytest -q apis/sharepoint-functions/tests/test_oauth_callback.py -k "oauth_callback_success" -p no:cacheprovider` | `test_oauth_callback.py`, `test_msal_client.py` | ❌ Wave 0 | ⬜ pendente |
| CONN-06 | 14-01 T1/T2, 14-05 T1/T3 | Enum fechado, identidade e timestamp somente do backend; fallback neutro para valores desconhecidos | unit + build | `$env:PYTHONDONTWRITEBYTECODE='1'; & "backend\.venv\Scripts\python.exe" -m pytest -q apis/sharepoint-functions/tests/test_connection_status.py -k "connection_status" -p no:cacheprovider` | `test_connection_status.py` | ❌ Wave 0 | ⬜ pendente |
| CONN-07 | 14-05 T2/T3 | Desconexão apaga o envelope, marca `disconnected` e preserva documentos e autoria | unit + behavioral | `$env:PYTHONDONTWRITEBYTECODE='1'; & "backend\.venv\Scripts\python.exe" -m pytest -q apis/sharepoint-functions/tests/test_disconnect.py -k "disconnect" -p no:cacheprovider` | `test_disconnect.py` | ❌ Wave 0 | ⬜ pendente |
| CONN-08 | 14-03 T3, 14-04 T3, 14-05 T1/T3 | Refresh revogado/expirado vira `problems` com reconexão explícita, sem trocar identidade | unit com mocks de erro MSAL | `$env:PYTHONDONTWRITEBYTECODE='1'; & "backend\.venv\Scripts\python.exe" -m pytest -q apis/sharepoint-functions/tests/test_connection_status.py -k "connection_status_problems" -p no:cacheprovider` | `test_connection_status.py` | ❌ Wave 0 | ⬜ pendente |

*Legenda: ⬜ pendente · ✅ verde · ❌ vermelho · ⚠️ flaky / env-gated / manual-only.*

Notas de rastreabilidade:

- Não existem arquivos de teste OAuth em `apis/sharepoint-functions/tests/`; os 12 módulos atuais cobrem apenas a Phase 13 `[VERIFIED: 14-RESEARCH.md:622]`.
- O fallback de `accountEmail` quando o Graph responde 403 **não amplia escopo**: D-05 permanece soberano — sem `User.Read`, sem escopo de diretório e sem app-only.
- O callback é a única exceção pública ao guard AST (`PUBLIC_ENDPOINTS`), reservada em 14-01 e ativada somente em 14-04.
- `msal==1.39.0` entra na cadeia somente após o checkpoint `blocking-human` do plano 14-02; nenhum install ou import é automatizado antes disso.
- Nenhum valor de conexão é gravado em `localStorage`, `sessionStorage`, IndexedDB, Cache API, service worker ou arquivo; apenas o envelope cifrado no Firestore.

---

## Lacunas Wave 0 (test-first)

Os arquivos abaixo são pré-requisitos de verificação e devem ser criados em modo **test-first**: o teste é escrito e executado em vermelho antes do código de produção no plano/tarefa que o introduz.

- [ ] `apis/sharepoint-functions/tests/test_oauth_transaction.py` — CONN-03 (replay/expiração/UID/tenant); criado em 14-04 T1.
- [ ] `apis/sharepoint-functions/tests/test_oauth_callback.py` — CONN-02/04/05 (tamper, sucesso, replay); criado em 14-04 T2/T3.
- [ ] `apis/sharepoint-functions/tests/test_connection_status.py` — CONN-06/08 (enum e `problems`); criado em 14-01 T1, estendido em 14-05 T1.
- [ ] `apis/sharepoint-functions/tests/test_disconnect.py` — CONN-07 (remoção de credencial e preservação); criado em 14-05 T2.
- [ ] `apis/sharepoint-functions/tests/test_msal_client.py` — mocks MSAL/Graph, sem segredo real; criado em 14-03 T2/T3.
- [ ] `apis/sharepoint-functions/tests/test_endpoint_guards.py` — atualizar exceção pública do callback e contagem de handlers; ajustado em 14-01 T1.
- [ ] `apis/sharepoint-functions/tests/test_config_secrets.py` e `tests/conftest.py` — identificadores não secretos; estendidos em 14-03 T1.
- [ ] `apps/web/src/services/sharepointApi.ts` + `IntegrationsSection.tsx` com checklist manual documentada — CONN-01/02/06/07; criados em 14-01 T1/T2, 14-05 T3.
- [ ] `msal==1.39.0` — install somente após `checkpoint:human-verify` em 14-02, declarado em 14-03 T1.

---

## Verificações Manuais e UAT Fora de Escopo

| Comportamento | Requisito / Decisão | Por que é manual | Instruções / destino |
|---------------|---------------------|------------------|----------------------|
| UAT humano da Phase 13 (5 itens) | D-18 | Adiado por decisão explícita do usuário; nenhuma automação desta phase aprova estes itens | Retomar com `/gsd-verify-work 13`; permanece registrado como dependência verificacional do milestone |
| Inspeção visual dos estados do card | CONN-01, CONN-06 (A6) | Não há framework de teste de componente no frontend | Checklist manual no `<human-check>` do plano 14-05 T3; execução manual, nunca auto-completada |
| Parsing real de `form_post` no runtime Gen2 | A3 (confiança LOW na research) | Coberto por teste comportamental com request fake; exige ambiente real | Verificar campos preenchidos antes do deploy, na Phase 18 |
| Configuração exata do app registration Azure | D-03, D-16 | Exige portal Azure e decisão humana; nenhuma credencial real nesta phase | Registrar `redirect_uri` exata no backend; sem localhost, wildcard ou redirect configurável pelo frontend |
| Regras Firestore no emulador e contenção transacional | CONN-03, CONN-04 | `FIRESTORE_EMULATOR_HOST` ausente no ambiente padrão | `firebase emulators:exec --only firestore "..."` com Java 21 + Firebase CLI 15.36.0 |
| Revogação programática (`revokeSignInSessions`) | D-10 | Permissão/consent Graph desconhecidos | Melhor esforço: falha nunca bloqueia a limpeza local nem expõe detalhes ao usuário |
| Headers privados no endpoint deployado | SEC-05 (herdado da Phase 13) | Dependem do runtime em produção | `curl -i` no endpoint real na Phase 18 |

**UAT manual permanece fora do escopo e adiado por D-18. Nada nesta phase é autoaprovado.**

---

## Checklist de Validação (Planejamento)

- [x] `workflow.nyquist_validation: true` em `.planning/config.json`.
- [x] Todo `<task>` dos planos 14-01…14-05 possui `<verify><automated>`.
- [x] Nenhum `<automated>` usa modo watch ou suíte E2E completa; latência estimada < 90 s.
- [x] Lacunas Wave 0 vinculadas a planos e tarefas concretos.
- [x] Cada requisito CONN-01…CONN-08 possui comando automatizado e arquivo de teste mapeados.
- [x] Nenhum requisito CONN-01…CONN-08 marcado como concluído neste documento.
- [x] UAT humano da Phase 13 (D-18) registrado como adiado, nunca autoaprovado.
- [ ] Suíte completa verde e emulador executado — somente após a execução dos planos.

**Status:** planejado — sem aprovação de validação até a execução da Phase 14.
