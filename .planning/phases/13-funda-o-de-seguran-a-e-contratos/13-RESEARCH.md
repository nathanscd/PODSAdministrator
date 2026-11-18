# Phase 13: Fundação de Segurança e Contratos - Research

**Researched:** 2026-11-18
**Domain:** Segurança fundacional para integração SharePoint em Firebase/Firestore + Cloud Functions Python Gen2 (milestone v2.0)
**Confidence:** MEDIUM

## Summary

A Phase 13 estabelece a base de confiança obrigatória antes de qualquer credencial Microsoft ou fluxo OAuth: **default deny** no Firestore, verificação de identidade em todo endpoint autenticado, segregação de segredos/chaves fora do código e do frontend, cifragem do cache MSAL, respostas `no-store` para dados privados, isolamento por UID/tenant no código (Admin SDK ignora regras), logging redigido e validação/rate limiting de entradas sensíveis. O repositório atual confirma que essa fundação ainda não existe: `firebase.json` declara um único codebase de Functions Node (`apis/reporting-functions`) `[VERIFIED: firebase.json:6-11]`, `firestore.rules` usa wildcard permissivo para qualquer usuário autenticado e bloqueia escrita apenas em uma allow-list parcial `[VERIFIED: firestore.rules:9-25]`, e a UI afirma falsamente `"Data Encryption: Enabled (AES-256)"` `[VERIFIED: apps/web/src/pages/SettingsPage.tsx:167]`.

A abordagem recomendada é **corrigir segurança no estado atual antes de adicionar features SharePoint**: reescrever regras para allow-list explícita com `default deny`, criar um novo codebase `apis/sharepoint-functions/` (Python Gen2) sem mover o `reporting-functions`, introduzir helpers de auth/crypto/config/segredos/headers/validação no backend, definir contratos de dados (coleções, campos, IDs determinísticos, índices) e remover afirmações enganosas da UI. O padrão de referência para auth e store transacional existe no codebase (`apis/connectivity/fastapi_app/firebase_client.py:82-115`, `apis/connectivity/fastapi_app/simcard_store.py:26-31`, `apis/connectivity/fastapi_app/datatem/token_store.py:33-65`) e deve ser **replicado e endurecido**, nunca copiado com os mesmos comportamentos inseguros (tokens em claro, rotas sem auth, fallback em memória para credenciais).

**Primary recommendation:** Tratar a Phase 13 como uma entrega de **contratos e guardrails** (regras, auth, segredos, cifragem, headers, validação, logging, testes-base) em `apis/sharepoint-functions/` + ajustes mínimos em `firebase.json`/`firestore.rules`/`SettingsPage.tsx`, de forma que as fases 14–17 possam construir OAuth, Graph, R2 e fila sem reabrir superfícies críticas de vazamento ou IDOR.

## User Constraints

Nenhum `CONTEXT.md` existe para esta fase (`context_path` é null). Não há decisões de usuário travadas para inventar; lacunas foram registradas em `## Open Questions`.

### Locked Decisions
- (nenhuma — sem `CONTEXT.md`)

### the agent's Discretion
- (nenhuma definida em `CONTEXT.md`; escolhas de implementação abaixo são recomendações de pesquisa, não decisões travadas)

### Deferred Ideas (OUT OF SCOPE)
- (nenhuma definida em `CONTEXT.md`)

### Active Constraints (confirmadas no prompt; tratar como restrições ativas do milestone)
- Firebase é a fonte oficial de dados operacionais: perfil, metadados, fila, estados, auditoria e quota.
- Cloudflare R2 é object storage temporário para todos os binários (planilhas, DOCX, imagens) até o SharePoint confirmar o sync.
- SharePoint é o repositório oficial após a sincronização.
- Backend: Cloud Functions Python Gen2 no projeto Firebase existente; não criar FastAPI standalone, VPS ou Postgres.
- OAuth: Authorization Code + PKCE; state, PKCE e transação no Firestore; validar state, nonce, identidade, tenant, expiração e replay.
- Cache MSAL cifrado com AES-256-GCM; chaves no Secret Manager; tokens nunca no frontend.
- Identidade delegada: Firebase UID → Tenant ID → Microsoft Object ID → credenciais; sem app-only.
- Sem `localStorage`, `sessionStorage`, IndexedDB, Cache API, service worker, Redis, SQLite, `tempfile`, `/tmp` ou `SpooledTemporaryFile`.
- Respostas privadas devem usar `Cache-Control: no-store, private, max-age=0`, `Pragma: no-cache`, `Expires: 0`.
- Não criar, renomear ou trocar branches de git. Não fazer commits. Não editar arquivos de source; escrever apenas o artefato de pesquisa.

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SEC-01 | Backend em Cloud Functions Python Gen2 implantado no projeto Firebase, com verificação do Firebase ID Token em todo endpoint autenticado. | `firebase.json` atual é single-codebase Node `[VERIFIED: firebase.json:6-11]`; criar codebase `sharepoint` Python 3.12 e helper `require_firebase_user` (replicar padrão `apis/connectivity/fastapi_app/firebase_client.py:82-115`) aplicado em todos os `https_fn` autenticados; respostas `401/403` padronizadas. |
| SEC-02 | Regras Firestore com `default deny` e allow-list explícita, impedindo que o SDK cliente leia coleções privadas de credenciais. | Substituir wildcard de `firestore.rules:21-25` `[VERIFIED]` por matches explícitos; negar `read/write` em credenciais/transações/fila/auditoria/uso e permitir leitura somente em coleções/paths de dono quando necessário; Admin SDK não é protegido por rules, então autorização também no código. |
| SEC-03 | Client Secret Microsoft e chave mestra de criptografia obtidos do Google Cloud Secret Manager, nunca versionados ou enviados ao frontend. | Usar `--set-secrets`/config do Gen2 ou `google-cloud-secret-manager` (opcional) `[ASSUMED]`; nomes propostos: `SHAREPOINT_MS_CLIENT_SECRET`, `SHAREPOINT_TOKEN_CRYPTO_KEY(_V<N>)`; sem `VITE_*`, sem `.env` versionado com valores reais. |
| SEC-04 | Cache serializado do MSAL armazenado no Firestore com AES-256-GCM, IV único, tag de autenticação e `keyVersion`. | Evitar anti-padrão de `datatemIntegration/session` em texto claro `[VERIFIED: apis/connectivity/fastapi_app/datatem/token_store.py:45-65]`; formato de blob proposto: `{ciphertext_b64, nonce_b64, keyVersion, aad, algorithm, updatedAt}` com nonce 12 bytes por escrita e AAD ligada a `ownerUid`. |
| SEC-05 | Respostas HTTP de documentos, tokens e dados privados com `Cache-Control: no-store, private, max-age=0`, `Pragma: no-cache` e `Expires: 0`. | Helper único de resposta/headers aplicado a todos os `https_fn` SharePoint; frontend deve usar `fetch(..., { cache: "no-store" })` ao consumir endpoints privados (gap atual: `DatatemService.ts` não envia auth/cache especial `[VERIFIED: apps/web/src/services/DatatemService.ts:81]`). |
| SEC-06 | Isolamento por Firebase UID e tenant em toda consulta, bloqueando acesso cruzado por IDOR. | Derivar `uid`/`tenantId` apenas do ID token decodificado; nunca aceitar `uid/tenantId` de body/query como autoridade; filtrar todas as queries Admin SDK por dono/tenant; consolidar identidade frontend antes da UI (risco conhecido: duas fontes de auth `[VERIFIED: .planning/codebase/CONCERNS.md:14-18]`). |
| SEC-07 | Logs e auditoria sem tokens, segredos ou conteúdo de arquivo — apenas IDs, status e timestamps. | Reusar lição de sanitização de `DatatemError` (`"Nunca contém credenciais"`) `[VERIFIED: apis/connectivity/fastapi_app/datatem/errors.py:52-53]`; logar `requestId`, `uid`, `tenantId`, `docId/jobId`, códigos/estados e timestamps; nunca `code/state/nonce/token/Authorization/ciphertext/conteúdo`. |
| SEC-08 | Rate limiting e validação de tipo, tamanho, MIME, nome e caminho de arquivos nos endpoints sensíveis. | Validar Content-Type/headers/tamanho antes de aceitar stream; whitelist de MIME/extensão, limites de nome/path (sem `..`, separadores, NUL), limites por requisição/usuário e mensagens compreensíveis; aplicar em endpoints HTTP sensíveis (upload/init/callback/admin-like). |
| SEC-09 | Nenhum mecanismo de persistência além de Firestore e R2 — sem localStorage, sessionStorage, IndexedDB, Cache API, service worker, Redis, SQLite, arquivos JSON locais ou `tempfile`. | Proibir `UploadFile`/spool multipart e escrita em disco; usar streaming puro para R2; manter cache MSAL/estado/fila apenas no Firestore (cifrado quando sensível); evitar caches persistentes no browser e libs como `msal-extensions` `[ASSUMED: violação arquitetural conhecida]`. |

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Verificação de Firebase ID Token e autorização por UID/tenant | API / Backend (Cloud Functions Python Gen2) | — | Identidade confiável e enforcement real; Admin SDK bypassa regras Firestore. |
| Regras Firestore `default deny` e visibilidade de documentos operacionais | Database / Storage (Firestore Security Rules) | Frontend Server (N/A) / Client (consumo read-only) | Rules protegem SDK cliente, mas não substituem autorização backend. |
| Armazenamento e acesso a segredos/chave AES | API / Backend + Secret Manager | — | Segredos nunca podem existir no bundle/browser (`VITE_*` proibido). |
| Cifragem/decifragem do cache MSAL (AES-256-GCM) | API / Backend | Database / Storage (blob cifrado no Firestore) | Cálculo criptográfico e uso de chave ocorrem somente no servidor. |
| Headers `no-store` e contratos de resposta privada | API / Backend | Browser / Client (respeita/solicita `no-store`) | Backend define política autoritativa de cache HTTP. |
| Validação de upload e rate limiting | API / Backend | — | Proteção de superfície e custo deve ocorrer antes de IO caro (R2/Graph). |
| UI de configuração/estado e correção de textos enganosos | Browser / Client (React) | API / Backend (fonte de verdade de status) | UI exibe status/erros, mas não guarda segredos nem decide autorização. |

## Standard Stack

### Core (Phase 13 scope)

| Library / Service | Version | Purpose | Why Standard | Confidence |
|-------------------|---------|---------|--------------|------------|
| Python Cloud Functions Gen2 (`python312`) | 3.12 runtime target `[ASSUMED]` | Runtime do codebase `sharepoint` | Alinha com pesquisa do milestone e evita drift; `firebase-tools` 15.36.0 já instalado no ambiente `[VERIFIED: environment probe]` | MEDIUM |
| `firebase-functions` | `~0.6.x` `[ASSUMED]` | Decorators `https_fn`/event/scheduler e contrato de deploy | Padrão para Functions Gen2 em Python no ecossistema Firebase | LOW-MEDIUM |
| `firebase-admin` | `>=6.4,<8` (alinhado ao repo: connectivity usa `>=6.4,<7` `[VERIFIED: apis/connectivity/requirements.txt:6]`) | `auth.verify_id_token`, Admin SDK Firestore | Já usado no repo; necessário para auth backend e operações transacionais | MEDIUM |
| `google-cloud-firestore` | transitivo/admin ou explícito conforme padrão | Transações, `SERVER_TIMESTAMP`, queries | Persistência operacional oficial do milestone | MEDIUM |
| `cryptography` | `~46/50.x` range a validar `[ASSUMED]` | AES-256-GCM para blob MSAL | Primitiva AEAD madura; implementação local controlada (nonce/AAD/keyVersion) | MEDIUM |
| `functions-framework` | compatível com runtime/deploy `[ASSUMED]` | Paridade local/emulador e runtime HTTP | Útil para testes locais de handlers Gen2 | LOW-MEDIUM |
| Google Cloud Secret Manager | serviço gerenciado | Armazenar `client_secret` MS e chave mestra AES | Segredo fora do repo/runtime config exposta; rotação por versão | MEDIUM |
| `firebase-tools` | `15.36.0` `[VERIFIED: environment probe]` | Deploy/emuladores multi-codebase | Já presente; versão alta reduz risco da regressão 15.15.0 citada na pesquisa `[ASSUMED: histórico de issue]` | MEDIUM |

### Supporting

| Library / Service | Version | Purpose | When to Use |
|-------------------|---------|---------|-------------|
| `pydantic` | a definir `[ASSUMED]` | Modelos/validação de payloads internos | Se o codebase SharePoint adotar modelos tipados; opcional na Phase 13 se usar validação manual clara |
| `google-cloud-secret-manager` (Python) | a validar `[ASSUMED]` | Leitura programática de segredos | Somente se precisar rotação/leitura sem redeploy; preferir `--set-secrets` primeiro |
| `pytest` | já disponível no workspace connectivity (`>=8.0,<9` `[VERIFIED: apis/connectivity/requirements.txt:9]`) | Testes unitários Python puros | Para crypto/auth helpers/validators/response headers sem dependência externa |
| Firestore Emulator / Rules tests | via `firebase-tools` 15.36.0 `[VERIFIED]` | Validar `default deny` e isolamento | Recomendado, mas suíte ainda não existe no repo `[VERIFIED: .planning/codebase/TESTING.md:171]` |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Novo codebase `apis/sharepoint-functions/` | `functions/sharepoint/` na raiz | Ambos funcionam; `apis/<service>` preserva o padrão atual do monorepo `[VERIFIED: apis/]` e evita ambiguidade com a ausência de `functions/` raiz `[VERIFIED: filesystem]`. |
| `--set-secrets` (Gen2) | `google-cloud-secret-manager` SDK em runtime | SDK permite leitura/rotação dinâmica, mas adiciona dependência e caminho de falha; `--set-secrets` é mais simples para Phase 13. |
| `cryptography` AESGCM | `msal-extensions` encrypted persistence | `msal-extensions` usa persistência de arquivo/keyring do SO e viola a política "sem disco/cache local" `[ASSUMED]`. |
| Implementação própria de PKCE/state/nonce | MSAL flow helpers (Phase 14) | Nunca reimplementar crypto/OAuth manualmente; na Phase 13 preparar contratos/storage/validações, e usar MSAL na Phase 14 `[ASSUMED]`. |

**Installation (proposto, a validar antes de codar):**
```bash
# apis/sharepoint-functions/requirements.txt (proposta para planejamento)
firebase-functions~=0.6.0  # [ASSUMED]
firebase-admin>=6.4,<8     # [ASSUMED - alinhar com política do repo]
cryptography>=43,<47       # [ASSUMED - validar versão estável]
functions-framework>=3.0,<4 # [ASSUMED]
# opcional: google-cloud-secret-manager~=2.32.0  # [ASSUMED]
```

**Version verification:** Não executei `pip index versions`/consulta web nesta sessão; versões acima são **propostas** baseadas em pesquisa existente do milestone e devem ser verificadas no registry correto antes da implementação `[ASSUMED]`.

## Package Legitimacy Audit

> Execução do protocolo via seam (`gsd-tools query package-legitimacy check`) em 2026-11-18. Observação: para `pypi`, o sinal `weeklyDownloads` veio `null` e o seam retornou `SUS` por `unknown-downloads`/`too-new` em vários pacotes; isso **não** equivale a prova de malícia, mas exige verificação humana/registry antes de instalar.

| Package | Registry | Age / Published (seam) | Downloads | Source Repo (seam) | Verdict | Disposition |
|---------|----------|-------------------------|-----------|--------------------|---------|-------------|
| `firebase-functions` | PyPI | 2026-06-04T21:49:21Z `[VERIFIED: package-legitimacy seam]` | unknown | https://github.com/firebase/firebase-functions-python `[VERIFIED: package-legitimacy seam]` | SUS | Manter como candidato; planejar `checkpoint:human-verify` antes da primeira instalação + confirmar versão/maintainer no PyPI oficial |
| `firebase-admin` | PyPI | 2026-11-12T03:13:01Z `[VERIFIED: package-legitimacy seam]` | unknown | https://github.com/firebase/firebase-admin-python `[VERIFIED: package-legitimacy seam]` | SUS | Manter candidato; verificar versão mais recente adequada e release notes |
| `msal` | PyPI | 2026-09-17T16:07:46Z `[VERIFIED: package-legitimacy seam]` | unknown | https://github.com/AzureAD/microsoft-authentication-library-for-python `[VERIFIED: package-legitimacy seam]` | SUS | Necessário na Phase 14 (não instalar na 13 sem necessidade); verificar antes do uso |
| `cryptography` | PyPI | 2026-09-30T14:43:44Z `[VERIFIED: package-legitimacy seam]` | unknown | none (seam) `[VERIFIED: package-legitimacy seam]` | SUS | Candidato central da Phase 13; validar repositório oficial PyPI/docs antes de fixar versão |
| `google-cloud-secret-manager` | PyPI | 2026-11-05T18:39:33Z `[VERIFIED: package-legitimacy seam]` | unknown | https://github.com/googleapis/google-cloud-python/... `[VERIFIED: package-legitimacy seam]` | SUS | Opcional; preferir `--set-secrets` primeiro |
| `boto3` | PyPI | 2026-11-17T20:24:21Z `[VERIFIED: package-legitimacy seam]` | unknown | https://github.com/boto/boto3 `[VERIFIED: package-legitimacy seam]` | SUS | Uso principal na Phase 16 (R2); não necessário na Phase 13 |
| `functions-framework` | PyPI | 2026-06-17T18:58:07Z `[VERIFIED: package-legitimacy seam]` | unknown | https://github.com/googlecloudplatform/functions-framework-python `[VERIFIED: package-legitimacy seam]` | SUS | Candidato de suporte para handlers/testes locais |
| `httpx` | PyPI | (execução do seam truncada no ambiente durante coleta) `[ASSUMED: verificação incompleta nesta sessão]` | unknown | — | SUS (provisório) | Já existe no repo em `apis/connectivity/requirements.txt:3` `[VERIFIED]`; manter alinhamento de faixa no novo codebase |
| `pydantic` | PyPI | (não consultado individualmente no seam desta sessão) `[ASSUMED]` | — | — | SUS (provisório) | Opcional na Phase 13; validar antes de introduzir |
| `@google-cloud/secret-manager` | npm | 2026-11-09T17:08:36Z `[VERIFIED: package-legitimacy seam]` | 5,235,899 weekly (seam) `[VERIFIED: package-legitimacy seam]` | git+https://github.com/googleapis/google-cloud-node.git `[VERIFIED: package-legitimacy seam]` | SUS | Não recomendado para o backend Python Gen2 desta fase; relevante apenas se algum tooling Node futuro precisar |

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** todos os candidatos externos consultados (principalmente por `unknown-downloads`/`too-new` no seam). O planner deve inserir `checkpoint:human-verify` antes da primeira instalação/pinning em `apis/sharepoint-functions/requirements.txt` e registrar evidência de verificação no ecossistema correto (PyPI/npm).

*Packages descobertos via pesquisa de milestone/training data e não verificados contra documentação oficial nesta sessão permanecem `[ASSUMED]` para fins de recomendação, mesmo que existam no registry.*

## Architecture Patterns

### System Architecture Diagram

```text
[Browser / Client - React apps/web]
  ├─ Settings UI / futuras telas SharePoint
  │    └─ exibe status/erros; NÃO guarda tokens/segredos; NÃO lê coleções privadas
  │
  └─ fetch(..., Authorization: Bearer <Firebase ID token>, cache: "no-store")
           │ HTTPS (JSON / stream conforme endpoint)
           ▼
[API / Backend - Cloud Functions Python Gen2, codebase "sharepoint"]
  ├─ auth.py        -> verify Firebase ID token, extrai uid/tenant, aplica RBAC mínimo
  ├─ config.py      -> carrega env/secrets refs, fail-fast em config inválida
  ├─ secrets.py     -> obtém client_secret/chave AES (Secret Manager / set-secrets)
  ├─ crypto.py      -> AES-256-GCM (nonce único, tag, keyVersion, AAD=uid/tenant/version)
  ├─ http.py        -> headers privados no-store + serialização de erros sanitizados
  ├─ validation.py  -> rate limit/validação de tipo,tamanho,MIME,nome,caminho
  └─ stores/*       -> Firestore transacional (Admin SDK) filtrando por ownerUid/tenantId
           │                    │
           │                    └─ [Database / Storage - Firestore (fonte operacional)]
           │                         ├─ sharepointSettings/{uid} (leitura cliente restrita)
           │                         ├─ sharepointCredentials/{uid} (backend-only, blob cifrado)
           │                         ├─ sharepointOAuthTransactions/{txId} (backend-only)
           │                         ├─ sharepointSyncQueue/{jobId} (backend-only)
           │                         ├─ sharepointAudit/{eventId} (backend-only, append-only)
           │                         └─ sharepointUsage/{uid}/... (backend-only)
           │
           └─ [Secret Manager] -> SHAREPOINT_MS_CLIENT_SECRET, SHAREPOINT_TOKEN_CRYPTO_KEY_V*
                  (nunca retornado ao cliente; nunca em VITE_*; nunca em logs)

[R2 / SharePoint / Graph]
  - fora do escopo de execução da Phase 13, mas contratos/guardrails devem já impedir
    persistência indevida e preparar staging seguro nas fases seguintes.
```

### Recommended Project Structure

```text
firebase.json                         # MODIFICADO: functions em array (reporting Node + sharepoint Python)
firestore.rules                       # MODIFICADO: default deny + allow-list explícita SharePoint
firestore.indexes.json                # MODIFICADO: índices para fila/docs/auditoria por ownerUid/tenant/status
apps/web/src/pages/SettingsPage.tsx   # MODIFICADO: remover afirmação falsa de AES-256 / refletir status real

apis/sharepoint-functions/            # NOVO (proposto) - codebase Python Gen2
├── main.py                           # entrypoints https_fn (e futuros triggers/scheduler)
├── requirements.txt
├── config.py                         # frozen settings, validação de env/secret refs
├── auth.py                           # require_firebase_user + tenant enforcement
├── secrets.py                        # acesso a segredos/chave (injeção/env ou client)
├── crypto.py                         # AES-256-GCM encrypt/decrypt + envelope/keyVersion
├── http.py                           # private response helpers / no-store / error envelope
├── validation.py                     # MIME/tamanho/nome/path/rate-limit guards
├── logging_utils.py                  # redação/sanitização (IDs, status, timestamps)
├── models/                           # contratos (opcional; pydantic/dataclasses)
└── stores/                           # firestore access com filtros ownerUid/tenantId

shared/types/sharepoint/              # NOVO (proposto, Phase 13 se necessário): contratos expostos à UI
shared/schemas/                       # MODIFICADO (se tipos novos): zod schemas SharePoint
firebase/converters/                  # MODIFICADO (se tipos novos): converters com parse/normalize
```

**Racional:** preservar `apis/reporting-functions` no lugar (`firebase.json` atual `[VERIFIED: firebase.json:7]`) e adicionar um segundo codebase em `apis/sharepoint-functions/` evita quebrar o deploy Node existente e segue o padrão de APIs por domínio já usado em `apis/` `[VERIFIED]`.

### Pattern 1: Multi-codebase Firebase Functions sem quebrar o Node atual

**What:** migrar `firebase.json.functions` de objeto para array com `codebase` explícito, mantendo o `source` atual do reporting.
**When to use:** antes de introduzir qualquer função Python do SharePoint.
**Example (proposta):**
```jsonc
// Source: padrão de multi-codebase Firebase + estado atual [VERIFIED: firebase.json:6-11], [ASSUMED: sintaxe exata por versão do firebase-tools]
{
  "functions": [
    {
      "codebase": "reporting",
      "source": "apis/reporting-functions",
      "predeploy": ["npm --prefix \"$RESOURCE_DIR\" run lint"]
    },
    {
      "codebase": "sharepoint",
      "source": "apis/sharepoint-functions",
      "runtime": "python312",
      "ignore": ["__pycache__", ".venv", "venv", "*.pyc", "tests", ".pytest_cache"]
    }
  ]
}
```

### Pattern 2: Auth backend obrigatória e isolamento por token (não por input do cliente)

**What:** todo `https_fn` autenticado extrai `uid`/`tenantId` do Firebase ID token verificado e ignora IDs sensíveis vindos do body/query para autorização.
**When to use:** em todos os endpoints SharePoint que leem/escrevem estado do usuário.
**Example (proposta, baseada no padrão existente):**
```python
# Source: padrão existente [VERIFIED: apis/connectivity/fastapi_app/firebase_client.py:82-115] adaptado para Cloud Functions [ASSUMED]
# Pseudocódigo: validar Authorization Bearer, verify_id_token(check_revoked=True quando sensível),
# resolver tenant em decoded_token.get("firebase", {}).get("tenant") ou claim do projeto,
# retornar AuthContext(uid, tenant_id, role, ...) e filtrar Firestore por ownerUid/tenantId.
```

### Pattern 3: Envelope criptográfico AES-256-GCM com rotação de chave

**What:** serializar cache MSAL para bytes/string, cifrar com AES-256-GCM, nonce aleatório 12 bytes por escrita, AAD vinculada ao dono, persistir `keyVersion`.
**When to use:** sempre que o cache/token state mudar (`has_state_changed` na Phase 14+); na Phase 13 definir formato, helpers e testes.
**Example (proposta):**
```python
# Source: requisito SEC-04 [VERIFIED: .planning/REQUIREMENTS.md:16] + padrão AEAD [ASSUMED]
# envelope = {
#   "algorithm": "AES-256-GCM",
#   "keyVersion": 1,
#   "nonce_b64": base64url(12_bytes),
#   "ciphertext_b64": base64url(ciphertext||tag),
#   "aad": "ownerUid:<uid>|tenant:<tenantId>",
#   "updatedAt": SERVER_TIMESTAMP,
# }
# Regras: nunca plaintext fallback; falhar fechado se chave/versão ausente.
```

### Pattern 4: Respostas privadas com headers anti-cache centralizados

**What:** um helper único aplica headers obrigatórios e envelope de erro sanitizado.
**When to use:** em toda resposta HTTP de endpoints SharePoint (sucesso e erro).
**Example (proposta):**
```python
# Source: SEC-05 [VERIFIED: .planning/REQUIREMENTS.md:17]
PRIVATE_HEADERS = {
  "Cache-Control": "no-store, private, max-age=0",
  "Pragma": "no-cache",
  "Expires": "0",
}
```

### Anti-Patterns to Avoid

- **Copiar `FirestoreTokenStore` do DATATEM para MSAL:** grava tokens em texto claro (`access_token`, `refresh_token`) `[VERIFIED: apis/connectivity/fastapi_app/datatem/token_store.py:51-57]`.
- **Manter wildcard em `firestore.rules`:** qualquer coleção nova (credenciais/fila/auditoria) fica legível por `signedIn()` `[VERIFIED: firestore.rules:21-25]`.
- **Aceitar `uid`/`tenantId` do body/query:** reintroduz IDOR; o backend já possui helper de verificação mas rotas DATATEM não o aplicam `[VERIFIED: apis/connectivity/fastapi_app/firebase_client.py:82`, `.planning/codebase/CONCERNS.md:84-88]`.
- **Usar `UploadFile`/multipart spool para uploads sensíveis:** risco de escrita em disco/temp (`SpooledTemporaryFile`) e violação de SEC-09 `[ASSUMED]`.
- **Segredo/chave em `VITE_*`, no Firestore em claro, ou em logs:** viola SEC-03/SEC-04/SEC-07/SEC-09 `[VERIFIED: requisitos]`.
- **Confiar apenas em Firestore Rules para proteger operações Admin SDK:** Admin SDK ignora rules; autorização precisa existir no código `[ASSUMED: comportamento padrão Firebase Admin]`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Verificação de ID token Firebase | Parser JWT manual / validação de assinatura caseira | `firebase_admin.auth.verify_id_token` (padrão existente) `[VERIFIED: apis/connectivity/fastapi_app/firebase_client.py:90]` | Cobertura de assinatura, expiração, emissor e revogação (`check_revoked`) com comportamento suportado. |
| AES-GCM / nonce handling | Criptografia artesanal, XOR/Base64 como "proteção", cifra sem tag/AAD | `cryptography.hazmat.primitives.ciphers.aead.AESGCM` `[ASSUMED]` | AEAD correto evita erros catastróficos (reuso de nonce, ausência de autenticação). |
| PKCE/state/nonce OAuth | Geração/validação manual ad hoc | `msal` auth code flow helpers (Phase 14) `[ASSUMED]` | Biblioteca cobre state/nonce/PKCE e reduz risco de CSRF/replay. |
| Upload streaming e multipart S3/R2 | Buffer completo em memória/disco + montagem manual | APIs de streaming do runtime + cliente R2 adequado nas fases seguintes `[ASSUMED]` | Respeita limites de memória/disco e política sem arquivos temporários. |
| Sanitização ad hoc de logs | "Tentar remover segredo" com regex parcial em cada call site | Helper central de redação + envelope de erro tipado (padrão `DatatemError`) `[VERIFIED: apis/connectivity/fastapi_app/datatem/errors.py]` | Consistência e menor risco de vazamento acidental. |

**Key insight:** na Phase 13, o maior risco não é "falta de feature", é **reutilizar padrões inseguros existentes**; padronizar helpers pequenos e obrigatórios (auth, crypto, headers, validation, logging) evita que cada endpoint futuro reabra a mesma vulnerabilidade.

## Common Pitfalls

### Pitfall 1: Wildcard do Firestore expondo coleções novas
**What goes wrong:** `sharepointCredentials`, transações OAuth, fila e auditoria ficam legíveis para qualquer `signedIn()` assim que criadas.
**Why it happens:** a regra atual usa `match /{document=**}` com negação parcial baseada em allow-list incompleta `[VERIFIED: firestore.rules:9-25]`.
**How to avoid:** converter para allow-list explícita com `default deny`; adicionar `match` específico com `allow read, write: if false` para coleções privadas; testar com Firebase Emulator.
**Warning signs:** nova coleção sem `match` explícito; leitura cross-user possível no emulator; cliente lendo credenciais/filas diretamente.

### Pitfall 2: Assumir que Firestore Rules protegem o backend
**What goes wrong:** endpoints Admin SDK aceitam `uid/tenantId` do cliente e vazam/cruzam dados entre usuários.
**Why it happens:** Admin SDK ignora rules e o codebase já tem rotas sem auth (`SYSTEM_ACTOR`/rotas públicas) `[VERIFIED: apis/connectivity/fastapi_app/routes_datatem.py:33-37,180-181]`.
**How to avoid:** `require_firebase_user` em todo endpoint autenticado, derivar identidade do token, filtrar queries no código e negar requests sem `Authorization: Bearer`.
**Warning signs:** handler lê `uid` de query/body; ausência de teste "user A não acessa recurso de B".

### Pitfall 3: Cache MSAL em claro ou cifrado incorretamente
**What goes wrong:** tokens delegados vazam no banco ou se tornam forjáveis/corrompidos.
**Why it happens:** copiar `FirestoreTokenStore` atual (plaintext) `[VERIFIED: apis/connectivity/fastapi_app/datatem/token_store.py:45-65]` ou usar nonce fixo/AAD ausente/keyVersion inexistente.
**How to avoid:** AES-256-GCM com nonce aleatório 12 bytes por escrita, tag verificada, AAD ligada a `ownerUid`/tenant, `keyVersion` e fail-closed; nunca fallback plaintext.
**Warning signs:** campos `access_token`/`refresh_token` em claro; nonce constante; ausência de `keyVersion`; decrypt sem AAD.

### Pitfall 4: Falso status de criptografia na UI
**What goes wrong:** produto comunica segurança inexistente.
**Why it happens:** texto hardcoded "Enabled (AES-256)" permanece na tela `[VERIFIED: apps/web/src/pages/SettingsPage.tsx:167]`.
**How to avoid:** remover/substituir por status real derivado do backend (ou texto neutro) e só exibir "habilitado" quando implementação + evidência existirem.
**Warning signs:** UI afirma AES-256 sem endpoint/config/artefato correspondente.

### Pitfall 5: Vazamento por logs, erros e cache HTTP
**What goes wrong:** `state`, `code`, tokens, `Authorization`, blobs cifrados ou conteúdo sensível aparecem em logs/respostas/cache de navegador/proxy.
**Why it happens:** logging genérico, erros sem sanitização, ausência de headers `no-store`.
**How to avoid:** helper central de redação, envelope de erro com `code/message` seguro, headers `Cache-Control: no-store, private, max-age=0`, `Pragma: no-cache`, `Expires: 0` em todas as respostas privadas.
**Warning signs:** `print`/`console.error` de payload bruto; resposta sem headers; códigos de erro expondo detalhes internos.

### Pitfall 6: Quebra de deploy multi-codebase
**What goes wrong:** adicionar Python "por cima" quebra o deploy do `apis/reporting-functions` ou gera codebase mal configurado.
**Why it happens:** `firebase.json` está em formato de objeto único `[VERIFIED: firebase.json:6-11]`; migração para array exige cuidado com `codebase/source/predeploy`.
**How to avoid:** converter para array preservando o codebase Node atual, validar com `firebase --version`/deploy seletivo em clone limpo quando possível, e isolar o novo código em `apis/sharepoint-functions/`.
**Warning signs:** lint/predeploy do Node executando no codebase Python; paths incorretos; deploy tenta sobrescrever `reporting-functions`.

## Code Examples

### Exemplo 1: `firestore.rules` com `default deny` e coleções SharePoint privadas (proposta)

```js
// Source: estado atual [VERIFIED: firestore.rules:9-25] + requisito SEC-02 [VERIFIED: .planning/REQUIREMENTS.md:14]
// Objetivo: remover wildcard permissivo e explicitar acesso.
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function signedIn() { return request.auth != null; }
    function isOwner(uid) { return signedIn() && request.auth.uid == uid; }

    // Backend-only (Admin SDK escreve/lê; cliente nunca)
    match /sharepointCredentials/{uid} { allow read, write: if false; }
    match /sharepointOAuthTransactions/{txId} { allow read, write: if false; }
    match /sharepointSyncQueue/{jobId} { allow read, write: if false; }
    match /sharepointAudit/{eventId} { allow read, write: if false; }
    match /sharepointUsage/{uid}/{document=**} { allow read, write: if false; }

    // Exemplo de leitura controlada de status do próprio usuário (se necessário)
    match /sharepointSettings/{uid} {
      allow read: if isOwner(uid);
      allow write: if false;
    }

    // Manter/ajustar coleções existentes explicitamente; default deny implícito (sem match catch-all).
  }
}
```

### Exemplo 2: Helper de headers privados (SEC-05)

```python
# Source: SEC-05 [VERIFIED: .planning/REQUIREMENTS.md:17]
PRIVATE_NO_STORE_HEADERS = {
    "Cache-Control": "no-store, private, max-age=0",
    "Pragma": "no-cache",
    "Expires": "0",
}

def private_json(body: dict, status: int = 200):
    # adaptar ao retorno de firebase_functions.https_fn [ASSUMED]
    return (body, status, {**PRIVATE_NO_STORE_HEADERS, "Content-Type": "application/json"})
```

### Exemplo 3: Envelope AES-256-GCM (SEC-04, proposta)

```python
# Source: SEC-04 [VERIFIED: .planning/REQUIREMENTS.md:16], primitiva AESGCM [ASSUMED]
import base64, os
# from cryptography.hazmat.primitives.ciphers.aead import AESGCM

def encrypt_blob(plaintext: bytes, key: bytes, *, aad: bytes, key_version: int) -> dict:
    nonce = os.urandom(12)  # IV/nonce único por escrita
    # ciphertext = AESGCM(key).encrypt(nonce, plaintext, aad)  # inclui tag
    ciphertext = b""  # placeholder de pesquisa
    return {
        "algorithm": "AES-256-GCM",
        "keyVersion": key_version,
        "nonce_b64": base64.b64encode(nonce).decode("ascii"),
        "ciphertext_b64": base64.b64encode(ciphertext).decode("ascii"),
        "aad": aad.decode("utf-8"),
    }
```

### Exemplo 4: Validação de upload segura (SEC-08, proposta)

```python
# Source: SEC-08 [VERIFIED: .planning/REQUIREMENTS.md:20]
ALLOWED_MIME = {"application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "image/png", "image/jpeg"}
MAX_BYTES = 25 * 1024 * 1024  # valor inicial a calibrar [ASSUMED]

def validate_upload_meta(filename: str, mime: str, size: int) -> None:
    if size <= 0 or size > MAX_BYTES:
        raise ValueError("Arquivo excede o tamanho permitido.")
    if mime not in ALLOWED_MIME:
        raise ValueError("Tipo de arquivo não permitido.")
    if ".." in filename or "/" in filename or "\\" in filename or "\x00" in filename:
        raise ValueError("Nome/caminho de arquivo inválido.")
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `firebase.json` com `functions` objeto único (`apis/reporting-functions`) `[VERIFIED: firebase.json:6-11]` | `functions` em array multi-codebase (`reporting` Node + `sharepoint` Python) | Phase 13 (planejado) | Permite Gen2 Python sem quebrar deploy Node existente. |
| Regras Firestore com wildcard `/{document=**}` para `signedIn()` `[VERIFIED: firestore.rules:21-25]` | `default deny` + allow-list explícita por coleção/path | Phase 13 (planejado) | Bloqueia vazamento de credenciais/filas/auditoria por padrão. |
| Tokens DATATEM em claro no Firestore `[VERIFIED: apis/connectivity/fastapi_app/datatem/token_store.py:45-65]` | Cache MSAL como blob AES-256-GCM com `keyVersion`/nonce/AAD | Phase 13/14 (planejado) | Atende SEC-04 e reduz impacto de leitura indevida. |
| UI afirmando "Data Encryption: Enabled (AES-256)" `[VERIFIED: apps/web/src/pages/SettingsPage.tsx:167]` | Status real baseado em implementação/evidência | Phase 13 (planejado) | Remove sinal falso de segurança. |
| Rotas backend sem verificação de identidade/autoria real `[VERIFIED: .planning/codebase/CONCERNS.md:84-88]` | `verify_id_token` obrigatório + autorização por UID/tenant em código | Phase 13 (planejado) | Fecha base para SEC-01/SEC-06. |

**Deprecated/outdated (para esta fase):**
- **Wildcard permissivo em `firestore.rules`:** inseguro para qualquer coleção nova de credenciais.
- **Persistência de segredo/token em plaintext:** incompatível com SEC-03/SEC-04.
- **Afirmações de segurança hardcoded na UI:** substituídas por estado verificável.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | O codebase SharePoint deve viver em `apis/sharepoint-functions/` (e não `functions/` na raiz) para preservar padrão e deploy atual. | Architecture Patterns / Recommended Project Structure | Estrutura divergente pode exigir ajustes de paths/scripts/deploy, mas sem impacto funcional se `firebase.json` apontar corretamente. |
| A2 | Runtime `python312` e formato multi-codebase em array são aceitos pelo `firebase-tools` 15.36.0 do ambiente. | Standard Stack / Pattern 1 | Deploy local/CI pode falhar; será necessário ajustar `runtime`, `codebase` ou versão do CLI. |
| A3 | Versões propostas de `firebase-functions`, `cryptography`, `functions-framework`, `google-cloud-secret-manager` e eventuais deps são adequadas. | Standard Stack / Package Legitimacy Audit | Incompatibilidade de API/runtime ou necessidade de pin diferente; pode atrasar implementação. |
| A4 | `AESGCM` da biblioteca `cryptography` é a melhor primitiva para o envelope descrito e atende requisitos de performance/compatibilidade no Gen2. | Standard Stack / Don't Hand-Roll / Code Examples | Pode ser necessário ajustar dependência/implementação, mantendo os mesmos requisitos de nonce/tag/AAD/keyVersion. |
| A5 | `--set-secrets` do Firebase Functions Gen2 cobre a necessidade inicial de disponibilizar client secret e chave AES sem SDK adicional. | Architecture Patterns / Standard Stack | Pode ser necessário adicionar `google-cloud-secret-manager` para rotação/leitura dinâmica. |
| A6 | Rate limiting efetivo pode ser implementado na Phase 13 com estratégia inicial simples (por UID/IP/endpoint + janela curta) usando apenas estado permitido (Firestore/contadores) ou controles locais de request, sem Redis. | Phase Requirements (SEC-08) / Open Questions | Proteção insuficiente contra abuso distribuído; pode exigir desenho mais robusto em fases posteriores. |
| A7 | `httpx` (PyPI) é adequado para alinhar com o codebase existente, mas sua auditoria de legitimidade ficou incompleta no seam nesta sessão. | Package Legitimacy Audit | Necessita verificação manual adicional antes de pin/instalação. |

## Open Questions (RESOLVED)

All five questions below were answered while planning Phase 13. Each answer is implemented by a named plan and is no longer open.

1. **Formato exato de `tenantId` no Atlas (Firebase tenant vs. tenant lógico da aplicação vs. tenant Microsoft)**
   - What we know: SEC-06 exige isolamento por "Firebase UID e tenant"; o projeto é multi-tenant e há histórico de múltiplas fontes de identidade no frontend `[VERIFIED: .planning/codebase/CONCERNS.md:14-18]`.
   - What was unclear: qual claim/campo é canônico para autorização em todas as coleções SharePoint (`request.auth.token.firebase.tenant`, claim custom, `companyId`/`workspace`?).
   - **RESOLVED:** `companyId` é o identificador canônico — é o campo já exposto por `shared/types/auth/index.ts` em `TenantUser.companyId` e `Workspace.companyId`. O backend resolve o tenant na ordem: claim custom `companyId` do ID token verificado, senão `users/{uid}.companyId` lido server-side com Admin SDK, senão 403 `tenant_required`. Nenhum caminho lê tenant do corpo, query ou header. O tenant Microsoft é um atributo de configuração da conexão (`sharepointSettings`), nunca a chave de autorização. Implementado em `13-05-PLAN.md` (SEC-01/SEC-06).

2. **Estratégia de rate limiting permitida sem Redis/SQLite/arquivos**
   - What we know: SEC-08 exige rate limiting; SEC-09 proíbe Redis/SQLite/temp files `[VERIFIED: .planning/REQUIREMENTS.md:20-21]`.
   - What was unclear: se contadores no Firestore por janela (com custo de escrita) são aceitáveis no free tier e qual granularidade (por UID, por endpoint, por IP quando disponível).
   - **RESOLVED:** contadores de janela fixa no Firestore em `sharepointRateLimits/{sha256(uid|endpoint|windowIndex)}` com `count`, `windowStart` e `expiresAt`, atualizados em transação. Granularidade por UID + endpoint (mais tenant no id do documento); sem IP, porque o IP atrás do Gen2/proxy não é confiável. Limite padrão conservador de 30 req/60 s, configurável por settings, com 429 e `Retry-After`. Nenhum caminho de produção em memória/temp/SQLite/Redis; `InMemoryRateLimiter` é explicitamente test-only e a guarda estática de 13-08 falha se vir persistência local. Implementado em `13-06-PLAN.md` (SEC-08).

3. **Escopo mínimo de leitura cliente nas coleções SharePoint (`sharepointSettings`/metadados)**
   - What we know: SEC-02 proíbe leitura cliente de coleções privadas de credenciais; UI precisará exibir estado de conexão em fases seguintes `[ASSUMED]`.
   - What was unclear: quais campos podem ser expostos via leitura direta (`onSnapshot`) vs. somente via endpoint HTTP `no-store`.
   - **RESOLVED:** escopo de leitura cliente nesta fase é **nenhum**. `sharepointSettings`, `sharepointTokens`, `sharepointOAuthTransactions`, `sharepointQueue`, `sharepointRateLimits` e `sharepointAuditLog` recebem `allow read, write: if false`; todo acesso é via Admin SDK e todo estado exposto à UI sai de endpoint HTTP com `no-store`. Se uma fase futura precisar de `onSnapshot`, ela abre campos específicos e documentados com teste de regra próprio. Implementado em `13-04-PLAN.md` (SEC-02).

4. **Pinagem exata de dependências Python e política de atualização**
   - What we know: `firebase-tools` 15.36.0 está instalado `[VERIFIED]`; projeto usa faixas em `apis/connectivity/requirements.txt` `[VERIFIED]`.
   - What was unclear: versões estáveis/compatíveis de `firebase-functions`, `cryptography`, `functions-framework` no momento da implementação.
   - **RESOLVED:** o plano não fixa versões por conta própria. `13-01-PLAN.md` abre com `checkpoint:human-verify` bloqueante onde o humano confirma cada pacote no PyPI oficial (links de projeto, versão estável, wheel para CPython 3.14) e devolve os pares `name==version`; só então `requirements.txt` é escrito com pins exatos. `pytest`/`pytest-asyncio` mantêm faixa, alinhados a `apis/connectivity/requirements.txt`. `msal` e `boto3` ficam fora desta fase. Política de atualização: pins exatos e bump deliberado em fase posterior, nunca faixa aberta para pacotes novos.

5. **Cobertura de testes de regras Firestore (emulador) no fluxo atual do repo**
   - What we know: não há suíte de regras e não há CI `[VERIFIED: .planning/codebase/TESTING.md:171,264-268]`; `firebase-tools` está disponível `[VERIFIED]`.
   - What was unclear: se o ambiente de execução local terá Java/runtime necessário para emuladores estáveis nesta máquina.
   - **RESOLVED:** camada estática obrigatória sempre (parser block-scoped das regras e dos índices, sem Java e sem rede), mais teste de emulador implementado e `skipif`-guardado por `java`/`firebase` no PATH. `13-04-PLAN.md` abre com `checkpoint:decision` que registra a saída observada de `java -version` e `firebase --version` e escolhe execução no emulador (A) ou somente asserções estáticas (B); instalar JDK está fora do escopo da fase. Nenhuma das opções deixa SEC-02 sem verificação.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | scripts npm, tooling Firebase/React | ✓ | `v24.19.0` `[VERIFIED: environment probe]` | — |
| npm | instalar/build/lint frontend e workspaces | ✓ | `11.17.0` `[VERIFIED: environment probe]` | — |
| Python | testes/handlers Python (planejamento usa conectividade; futuro sharepoint) | ✓ | `3.14.7` (global e `backend/.venv`) `[VERIFIED: environment probe]` | Usar `backend/.venv` para consistência local |
| pip | instalar dependências Python | ✓ | `26.2.1` `[VERIFIED: environment probe]` | — |
| Firebase CLI (`firebase`) | deploy/emuladores/rules validation | ✓ | `15.36.0` `[VERIFIED: environment probe]` | — |
| pytest (workspace connectivity deps) | testes automatizados Python existentes | ✓ (via comandos do repo) | faixa `>=8,<9` declarada `[VERIFIED: apis/connectivity/requirements.txt:9]` | executar com Python do venv se necessário |
| Java (para Firestore Emulator) | testes de regras/integração local com emulator | ? | não verificado nesta sessão `[ASSUMED: desconhecido]` | validação manual de regras + deploy seletivo em ambiente controlado |
| Credenciais Microsoft reais (Entra app/tenant) | OAuth/Graph end-to-end | ✗ | — | **blocking para fases 14/16/18**, mas **não** para contratos de segurança da Phase 13 (usar mocks/stubs) |
| R2 credentials/bucket | staging binário real | ✗ | — | não necessário na Phase 13; usar contratos/mocks nas fases posteriores |

**Missing dependencies with no fallback:**
- Credenciais Microsoft reais (bloqueiam validação end-to-end de OAuth/Graph, fora do escopo executável da Phase 13).

**Missing dependencies with fallback:**
- Java/emulador não verificado: fallback para testes unitários Python + revisão estática das rules + validação em ambiente com emulador quando disponível.
- Ausência de suite de testes frontend/rules: fallback com comandos existentes (`web:build`, `web:lint`, `tsc`, `api:connectivity:test`) e novos testes Python puros adicionados no plano.

## Validation Architecture

> `workflow.nyquist_validation` não está desabilitado em `.planning/config.json` (`nyquist_validation: true`) `[VERIFIED: .planning/config.json]`; seção incluída.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | `pytest` (backend Python, workspace connectivity) `[VERIFIED: apis/connectivity/pytest.ini, apis/connectivity/requirements.txt:9-10]` |
| Config file | `apis/connectivity/pytest.ini` `[VERIFIED]` |
| Quick run command | `python -m pytest -q apis/connectivity/tests/test_normalize.py` (rápido, sem rede; baseline de sanidade) |
| Full suite command | `python -m pytest -q apis/connectivity/tests` |

> Observação: frontend não possui runner de testes automatizados configurado `[VERIFIED: .planning/codebase/TESTING.md:10]`. A Phase 13 deve priorizar validações automatizáveis em Python puro (crypto/headers/validators/auth helpers) e usar comandos de build/lint/typecheck existentes como gates complementares.

### Automation Environment

| Tool | Purpose | Available | Command / Evidence |
|------|---------|-----------|--------------------|
| Python 3.14.7 | executar pytest/helpers | ✓ | `python --version` `[VERIFIED: environment probe]` |
| pytest | unit tests backend | ✓ | `python -m pytest -q apis/connectivity/tests` `[VERIFIED: command exists by repo config]` |
| Node.js / npm | frontend checks | ✓ | `node --version`, `npm --version` `[VERIFIED]` |
| TypeScript compiler | typecheck web | ✓ (repo deps) | `npx tsc -p apps/web/tsconfig.app.json --noEmit` |
| Vite build | bundle sanity | ✓ (repo deps) | `npm run web:build` |
| ESLint | lint web | ✓ (repo deps, baseline pode ter dívida pré-existente) | `npm run web:lint` `[VERIFIED: package.json scripts]` |
| Firebase CLI | deploy/emulators/rules checks | ✓ | `firebase --version` => `15.36.0` `[VERIFIED]` |
| Firestore Emulator | regras SEC-02/SEC-06 client-side | ? | requer ambiente compatível (Java/runtime) não verificado `[ASSUMED]` |

### Test Organization

| Area | Location (proposto/existente) | Notes |
|------|-------------------------------|-------|
| Regressão conectividade existente | `apis/connectivity/tests/` `[VERIFIED]` | Não quebrar comportamento atual ao ajustar config compartilhada. |
| Novos testes SharePoint (Phase 13) | `apis/sharepoint-functions/tests/` (novo) `[ASSUMED]` | Funções puras: crypto envelope, header helper, validação upload/path, redaction, parsing auth context. |
| Rules tests (recomendado) | `apis/sharepoint-functions/tests/rules/` ou pasta dedicada de emulator `[ASSUMED]` | Depende de suporte a emulador no ambiente. |
| Frontend checks | `apps/web/` | Sem testes unitários; usar `build/lint/tsc` e inspeção dirigida. |

### Existing Coverage

| Command | Scope | Status |
|---------|-------|--------|
| `python -m pytest -q apis/connectivity/tests` | normalize/client/assignment DATATEM | Existente `[VERIFIED]` (não executado nesta sessão de pesquisa) |
| `npm run web:build` | build frontend | Existente `[VERIFIED]` (não executado) |
| `npm run web:lint` | lint frontend | Existente `[VERIFIED]`; baseline pode falhar por dívida pré-existente `[VERIFIED: docs/DATATEM_INTEGRATION.md:134 citado em codebase docs]` |
| `npx tsc -p apps/web/tsconfig.app.json --noEmit` | typecheck frontend | Existente `[VERIFIED]`; pode refletir dívida pré-existente |

### New Tests Required (Phase 13)

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SEC-01 | `require_firebase_user` rejeita ausência/invalidade de Bearer token e extrai contexto autenticado sem aceitar uid do body | unit | `python -m pytest -q apis/sharepoint-functions/tests/test_auth.py -k "bearer or invalid or context"` | ❌ Wave 0 |
| SEC-02 | Regras negam leitura/escrita cliente em `sharepointCredentials`, `sharepointOAuthTransactions`, `sharepointSyncQueue`, `sharepointAudit`, `sharepointUsage` e negam cross-user | rules/emulator (preferido) ou validação assistida | `firebase emulators:exec --only firestore "python -m pytest -q apis/sharepoint-functions/tests/test_firestore_rules.py"` | ❌ Wave 0 |
| SEC-03 | Config falha fechado quando segredos/chave ausentes; nenhum segredo exposto em payload/log helper | unit | `python -m pytest -q apis/sharepoint-functions/tests/test_config_secrets.py` | ❌ Wave 0 |
| SEC-04 | `encrypt/decrypt` usa nonce único, preserva `keyVersion`, valida tag/AAD e falha com AAD/chave errada | unit | `python -m pytest -q apis/sharepoint-functions/tests/test_crypto.py` | ❌ Wave 0 |
| SEC-05 | Helper de resposta inclui `Cache-Control: no-store, private, max-age=0`, `Pragma: no-cache`, `Expires: 0` em sucesso e erro | unit | `python -m pytest -q apis/sharepoint-functions/tests/test_http_headers.py` | ❌ Wave 0 |
| SEC-06 | Queries/stores filtram por `ownerUid`/`tenantId` do contexto autenticado; tentativa cross-tenant é negada | unit | `python -m pytest -q apis/sharepoint-functions/tests/test_tenant_isolation.py` | ❌ Wave 0 |
| SEC-07 | Redactor remove/omite tokens, segredos, `Authorization`, conteúdo de arquivo e mantém IDs/status/timestamps | unit | `python -m pytest -q apis/sharepoint-functions/tests/test_logging_redaction.py` | ❌ Wave 0 |
| SEC-08 | Validador rejeita MIME/tamanho/nome/caminho inválidos e aplica limites de requisição com erro compreensível | unit | `python -m pytest -q apis/sharepoint-functions/tests/test_upload_validation.py` | ❌ Wave 0 |
| SEC-09 | Nenhum helper escreve em disco/temp; contratos de storage limitados a Firestore/R2; UI sem cache/persistência proibida para dados SharePoint | unit + inspeção dirigida | `python -m pytest -q apis/sharepoint-functions/tests/test_no_temp_persistence.py` | ❌ Wave 0 |

### Validation Commands

| ID | Command | Observable / Pass Criteria |
|----|---------|-----------------------------|
| V-01 (env) | `node --version; npm --version; python --version; firebase --version` | Versões presentes (Node/npm/Python/Firebase CLI disponíveis) `[VERIFIED: environment probe]` |
| V-02 (repo baseline) | `python -m pytest -q apis/connectivity/tests` | Testes de conectividade existentes continuam passando (sem regressão de base) |
| V-03 (Phase 13 quick) | `python -m pytest -q apis/sharepoint-functions/tests/test_crypto.py apis/sharepoint-functions/tests/test_http_headers.py apis/sharepoint-functions/tests/test_upload_validation.py` | Novos helpers críticos de SEC-04/05/08 passam |
| V-04 (Phase 13 full) | `python -m pytest -q apis/sharepoint-functions/tests` | Suite SharePoint Phase 13 verde (auth/config/crypto/headers/isolation/redaction/validation) |
| V-05 (frontend sanity) | `npm run web:build` | Build Vite conclui com sucesso (inclui correção da UI enganosa) |
| V-06 (frontend types) | `npx tsc -p apps/web/tsconfig.app.json --noEmit` | Sem novos erros introduzidos pela Phase 13 (comparar com baseline conhecido) |
| V-07 (frontend lint) | `npm run web:lint` | Sem novos erros de lint introduzidos; registrar dívida pré-existente se persistir |
| V-08 (rules, preferido) | `firebase emulators:exec --only firestore "python -m pytest -q apis/sharepoint-functions/tests/test_firestore_rules.py"` | Leituras/escritas indevidas negadas conforme SEC-02/SEC-06 |

### Manual Checks

| Req ID | Check | Expected Result |
|--------|-------|-----------------|
| SEC-02 | Revisar `firestore.rules` após alteração: ausência de `match /{document=**}` permissivo e presença de `allow read, write: if false` para credenciais/transações/fila/auditoria/uso | Nenhuma coleção privada SharePoint legível/escrevível pelo SDK cliente |
| SEC-03 | Revisar `firebase.json`, `requirements`, código e `.env.example` propostos para segredos/chaves | Nenhum valor de segredo/chave no repo; apenas nomes/referências (`--set-secrets`/Secret Manager) |
| SEC-05 | Inspecionar respostas de endpoints privados (sucesso e erro) via `curl -i`/cliente HTTP em ambiente local | Headers exatos: `Cache-Control: no-store, private, max-age=0`, `Pragma: no-cache`, `Expires: 0` |
| SEC-07 | Revisar amostras de logs/auditoria gerados em testes locais | Apenas IDs, status e timestamps; sem tokens/segredos/conteúdo |
| SEC-09 | Inspeção dirigida de código: buscar por `localStorage`, `sessionStorage`, `indexedDB`, `caches`, `serviceWorker`, `tempfile`, `SpooledTemporaryFile`, `open(..., "w")` em paths SharePoint/frontend relacionados | Nenhum mecanismo de persistência proibido introduzido |

### Key Links (causa -> validação)

| Risk / Cause | Validated By |
|--------------|--------------|
| Wildcard em `firestore.rules` permite leitura indevida `[VERIFIED: firestore.rules:21-25]` | V-08 + revisão manual SEC-02 |
| `firebase.json` single-codebase pode quebrar ao adicionar Python `[VERIFIED: firebase.json:6-11]` | V-05/V-06/V-07 (sanidade repo) + revisão de config + deploy seletivo futuro |
| Token store plaintext no padrão legado `[VERIFIED: apis/connectivity/fastapi_app/datatem/token_store.py:45-65]` | V-03/V-04 (`test_crypto.py`, `test_no_temp_persistence.py`) |
| UI afirma criptografia inexistente `[VERIFIED: apps/web/src/pages/SettingsPage.tsx:167]` | V-05 + inspeção manual da tela/código |
| Rotas sem auth/IDOR por design legado `[VERIFIED: .planning/codebase/CONCERNS.md:84-88]` | V-04 (`test_auth.py`, `test_tenant_isolation.py`) + revisão de handlers |

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | Verificar Firebase ID Token em todo endpoint autenticado (`verify_id_token`, `check_revoked` quando aplicável) `[VERIFIED: padrão em apis/connectivity/fastapi_app/firebase_client.py:82-93]` |
| V3 Session Management | partial | Sem sessão própria de app; proteger transações OAuth/state/nonce no backend (Phase 14) e não expor tokens ao cliente `[ASSUMED]` |
| V4 Access Control | yes | Isolamento por `uid/tenantId` derivado do token, checks no código (Admin SDK), regras Firestore `default deny` `[VERIFIED: SEC-02/SEC-06]` |
| V5 Input Validation | yes | Validação de tipo/tamanho/MIME/nome/caminho e limites de requisição antes de IO sensível `[VERIFIED: SEC-08]` |
| V6 Cryptography | yes | AES-256-GCM com nonce único, tag, AAD e `keyVersion`; chaves no Secret Manager; nunca hand-roll primitives `[VERIFIED: SEC-04]` |

### Known Threat Patterns for {Firebase + Cloud Functions Python Gen2 + Firestore + futuro R2/Graph}

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Leitura de credenciais/filas por usuário autenticado via wildcard rule | Information Disclosure / Elevation of Privilege | `default deny` + matches explícitos + `allow read, write: if false` para coleções privadas `[VERIFIED: firestore.rules estado atual]` |
| IDOR por `uid/tenantId` vindo do cliente em endpoint Admin SDK | Elevation of Privilege / Tampering | Derivar identidade do ID token e filtrar consultas no backend `[VERIFIED: SEC-06]` |
| Vazamento de token/segredo em logs, erros, query strings ou respostas | Information Disclosure | Redaction central, envelope de erro sanitizado, headers `no-store`, proibir `VITE_*` para segredos `[VERIFIED: SEC-03/05/07]` |
| Cache MSAL em texto claro ou AEAD mal usado (nonce fixo, sem AAD/tag check) | Information Disclosure / Tampering | AES-256-GCM com nonce aleatório por escrita, AAD, `keyVersion`, fail-closed `[VERIFIED: SEC-04]` |
| Upload malicioso (path traversal, tipo/tamanho abusivo) | Tampering / DoS | Whitelist MIME/extensão, limites de tamanho/nome, rejeição de `..`, separadores e NUL `[VERIFIED: SEC-08]` |
| Confiança em UI/claims falsas de segurança ("AES-256 enabled") | Spoofing (de percepção) / Compliance risk | Remover texto hardcoded e exibir apenas estado verificável `[VERIFIED: apps/web/src/pages/SettingsPage.tsx:167]` |

## Sources

### Primary (HIGH confidence)
- `.planning/REQUIREMENTS.md` — definições exatas de SEC-01..SEC-09, critérios e traceability `[VERIFIED: .planning/REQUIREMENTS.md:12-21,123-131]`
- `.planning/ROADMAP.md` — goal, success criteria e riscos da Phase 13 `[VERIFIED: .planning/ROADMAP.md:26-38]`
- `.planning/STATE.md` — decisões v2.0, preocupações ativas e foco atual `[VERIFIED: .planning/STATE.md:54-73]`
- `.planning/PROJECT.md` — restrições de persistência, identidade delegada, runtime e backend `[VERIFIED: .planning/PROJECT.md:58-81]`
- `firebase.json` — configuração atual de functions/hosting/firestore `[VERIFIED: firebase.json:1-26]`
- `firestore.rules` — regra wildcard e allow-list protegida atual `[VERIFIED: firestore.rules:1-27]`
- `firestore.indexes.json` — índices existentes `[VERIFIED: firestore.indexes.json:1-19]`
- `apps/web/src/pages/SettingsPage.tsx` — texto falso de criptografia AES-256 `[VERIFIED: apps/web/src/pages/SettingsPage.tsx:167]`
- `apis/connectivity/fastapi_app/firebase_client.py` — padrão de `verify_id_token` e resolução de perfil `[VERIFIED: firebase_client.py:82-115]`
- `apis/connectivity/fastapi_app/datatem/token_store.py` — anti-padrão de token em claro `[VERIFIED: token_store.py:45-65]`
- `apis/connectivity/fastapi_app/datatem/errors.py` — sanitização de erros sem credenciais `[VERIFIED: errors.py:52-69]`
- `apis/connectivity/requirements.txt`, `apis/connectivity/pytest.ini`, `package.json` — toolchain e comandos reais `[VERIFIED]`
- `.planning/config.json` — `nyquist_validation: true` `[VERIFIED]`
- `.planning/codebase/*` (STACK, INTEGRATIONS, ARCHITECTURE, STRUCTURE, CONVENTIONS, TESTING, CONCERNS) — mapa de código e gaps `[VERIFIED]`

### Secondary (MEDIUM confidence)
- `.planning/research/SUMMARY.md`, `STACK.md`, `ARCHITECTURE.md`, `FEATURES.md`, `PITFALLS.md` — pesquisa de milestone já consolidada; usada para refinar (não duplicar) recomendações de Phase 13 `[CITED: .planning/research/*]`
- `gsd-tools query package-legitimacy check` (PyPI/npm, 2026-11-18) — sinais de existência/publicação/repositório para candidatos de dependência `[VERIFIED: package-legitimacy seam]`

### Tertiary (LOW confidence)
- Versões/pins exatos sugeridos para `firebase-functions`, `cryptography`, `functions-framework`, `google-cloud-secret-manager`, `pydantic` e detalhes finos de config Gen2 multi-codebase — baseados em pesquisa de milestone/conhecimento de treinamento, **não verificados no registry/docs oficiais nesta sessão** `[ASSUMED]`
- Estratégia concreta de rate limiting sem Redis (implementação por contadores/janela em Firestore) — viável como direção, mas requer calibração de custo e consistência `[ASSUMED]`

## Metadata

**Confidence breakdown:**
- Standard stack: MEDIUM - alinhada ao estado do repo e à pesquisa de milestone, mas versões de novas dependências Python não foram verificadas no registry oficial nesta sessão.
- Architecture: HIGH-MEDIUM - pontos críticos de integração no código atual foram verificados diretamente (`firebase.json`, `firestore.rules`, `SettingsPage.tsx`, auth/token store), enquanto detalhes de deploy Gen2/segredos permanecem como recomendações a validar.
- Pitfalls: HIGH - riscos principais (wildcard rules, IDOR/Admin SDK, token plaintext, headers/logging, UI enganosa) estão ancorados em evidências do repositório e nos requisitos SEC.

**Research date:** 2026-11-18
**Valid until:** 2026-11-25 (7 dias; domínio de segurança/configuração de deploy e dependências pode mudar rapidamente)
