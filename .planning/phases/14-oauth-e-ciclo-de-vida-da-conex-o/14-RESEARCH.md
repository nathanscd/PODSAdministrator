# Phase 14: OAuth e Ciclo de Vida da Conexão - Research

**Researched:** 2026-11-18
**Domain:** OAuth 2.0 Authorization Code + PKCE, MSAL Python, Firebase Cloud Functions Gen2, Firestore/Crypto, React settings UI
**Confidence:** MEDIUM

<user_constraints>
## User Constraints (from CONTEXT.md)

Fonte integral das restrições abaixo: `[VERIFIED: .planning/phases/14-oauth-e-ciclo-de-vida-da-conex-o/14-CONTEXT.md:14-41]`.

### Locked Decisions
- **D-01:** Usar Authorization Code + PKCE com backend confidencial Cloud Functions Python Gen2; a interface nunca recebe `client_secret`, access token, refresh token nem cache MSAL. — **Reversibility:** one-way — o contrato de redirect/registro Azure e o formato do token cache afetam configuração externa e registros persistidos.
- **D-02:** Gerar `state`, `nonce` e verificado PKCE no backend e persistir a transação no Firestore com UID, tenant, expiração e consumo único atômico. — **Reversibility:** costly — muda o contrato das coleções `sharepointOAuthTransactions` e dos testes de replay.
- **D-03:** Registrar `redirect_uri` exatamente como usado pelo callback `form_post`; sem `localhost`, wildcard ou redirect configurável pelo frontend. — **Reversibility:** one-way — exige atualização do app registration Azure.
- **D-04:** Validar no callback `state`, `nonce`, PKCE, identidade Microsoft, tenant Microsoft, UID Firebase, expiração e reutilização. Qualquer divergência resulta em erro sanitizado, sem emissão de credencial. — **Reversibility:** costly — altera a fronteira de segurança já auditada na Phase 13.
- **D-05:** Solicitar somente os scopes `Files.ReadWrite`, `Sites.Read.All` e `offline_access`; nenhum scope de diretório e nenhuma autenticação app-only. — **Reversibility:** costly — exige novo consentimento e revisão do app registration.

### Credential lifecycle
- **D-06:** Serializar o cache MSAL e cifrá-lo com o envelope AES-256-GCM da Phase 13, incluindo AAD por tenant/purpose e `keyVersion`; gravar somente no Firestore. — **Reversibility:** one-way — mudar o formato do envelope exige migração de registros já cifrados.
- **D-07:** Secret Manager continua sendo a única fonte de `SHAREPOINT_MS_CLIENT_SECRET` e `SHAREPOINT_TOKEN_CRYPTO_KEY_V*`; `.env.example` conterá apenas nomes/referências, nunca valores. — **Reversibility:** costly — muda configuração de deploy e nomes de segredos.
- **D-08:** Desconexão remove a credencial cifrada e marca o estado como `disconnected`; documentos já sincronizados e metadados de autoria permanecem intactos. — **Reversibility:** one-way — apagar credenciais e metadados de vínculo não é reversível sem nova autorização do usuário.
- **D-09:** Refresh token revogado/expirado não dispara substituição automática da identidade do criador; o backend expõe `problems` e a interface orienta reconexão explícita. — **Reversibility:** costly — altera a semântica de autoria usada pelas fases de sincronização.
- **D-10:** Revogação programática, quando suportada, é melhor esforço no backend; falha de revogação nunca impede a remoção local da credencial nem é exibida ao usuário com detalhes sensíveis. — **Reversibility:** reversible — política pode ser ajustada sem migrar dados.

### UI and status
- **D-11:** O card Microsoft SharePoint fica na aba `Integrações` do `SettingsModal` existente, não em um novo template de página; a integração pode ser ativada/desativada e conectada/desconectada ali. — **Reversibility:** reversible — layout local, sem contrato externo.
- **D-12:** A interface consome somente um endpoint de status do backend; estados são exatamente `disabled`, `disconnected`, `connected`, `syncing` e `problems`, com data/hora da última sincronização bem-sucedida quando houver. — **Reversibility:** costly — o enum é contrato compartilhado com fases posteriores.
- **D-13:** Nenhum status positivo ou identidade é inferido no frontend; valores desconhecidos são renderizados como neutros. O texto falso de UI revisado na Phase 13 não se estende a esta phase. — **Reversibility:** reversible — mudança local de renderização.
- **D-14:** A identidade autenticada do frontend continua sendo o `AuthContext` legado com `TenantUser`; a consolidação das duas fontes de identidade permanece na Phase 15 e não é antecipada aqui. — **Reversibility:** costly — a consolidação posterior terá que migrar consumidores.
- **D-15:** Após o callback, o backend redireciona para `/settings` sem token, code, state ou segredo na URL; a UI recarrega o status pelo endpoint autenticado. — **Reversibility:** reversible — fluxo de navegação local.

### Research and verification
- **D-16:** Executar research obrigatório da configuração Azure (redirect `form_post`, consent do tenant, scopes, revogação) usando documentação oficial, sem credenciais reais. — **Reversibility:** reversible — research não altera runtime.
- **D-17:** Todo comportamento de OAuth sem credenciais reais é provado com mocks de MSAL/Graph, emulator Firestore e testes de replay/tamper; nenhum teste depende de segredo externo. — **Reversibility:** costly — reestruturar a suíte de mocks afeta várias fases.
- **D-18:** Os itens de UAT humano da Phase 13 permanecem adiados por decisão explícita; isso não bloqueia o trabalho de código da Phase 14, mas deve continuar registrado como dependência verificacional do milestone. — **Reversibility:** reversible — registro de estado.

### the agent's Discretion
Nenhuma área ficou sem decisão. Em modo auto, todas as áreas de cinza identificadas foram selecionadas e resolvidas com as opções recomendadas acima, derivadas das decisões travadas nas fases anteriores.

### Deferred Ideas (OUT OF SCOPE)

- UAT humano da Phase 13 (5 itens) — adiado por decisão do usuário; retomar com `/gsd-verify-work 13`.
- Consolidação das duas fontes de identidade do frontend num `TenantUser` tipado — Phase 15.
- Correção dos valores placeholder `Disabled` e `3 Devices` na seção de segurança do `SettingsPage` — fora do escopo desta phase; registrado pela auditoria UI da Phase 13.
- Navegação SharePoint, upload, download, fila R2 e conflitos — fases 15 a 17.
- Deploy real e documentação operacional — Phase 18.

</user_constraints>

<phase_requirements>
## Phase Requirements

Descrições copiadas verbatim de `[VERIFIED: .planning/REQUIREMENTS.md:24-31]`; rastreabilidade em `[VERIFIED: .planning/REQUIREMENTS.md:132-139]`.

| ID | Description | Research Support |
|----|-------------|------------------|
| CONN-01 | Usuário encontra o card Microsoft SharePoint na aba Integrações de Configurações, com nome, descrição, ícone adequado e botão para ativar/desativar. | Substituir o placeholder em `SettingsModal.tsx:347`; contrato visual completo em `14-UI-SPEC.md:54-68` `[VERIFIED: apps/web/src/components/SettingsModal.tsx:347]`. |
| CONN-02 | Usuário inicia a conexão com "Conectar conta Microsoft" e é redirecionado para a página oficial de autenticação da Microsoft. | `sharepoint_oauth_start` autenticado devolve `authorizationUrl`; UI usa `window.location.assign` sem construir parâmetros sensíveis `[VERIFIED: 14-UI-SPEC.md:170-175]`, `[CITED: https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow]`. |
| CONN-03 | Backend gera `state`, verificador PKCE e transação persistida no Firestore com expiração, associados ao Firebase UID autenticado. | Reutilizar `auth.resolve_auth_context` e gravar em `sharepointOAuthTransactions` com `companyId` `[VERIFIED: apis/sharepoint-functions/auth.py:106-152; stores/sharepoint_store.py:8-16]`. |
| CONN-04 | Callback valida `state`, nonce, PKCE, identidade Microsoft, tenant, expiração e reutilização de authorization code. | Validar em transação atômica Firestore; Microsoft/OAuth recomenda state de uso único e PKCE `[CITED: learn.microsoft.com/v2-oauth2-auth-code-flow; rfc-editor.org/rfc/rfc9700.txt]`. |
| CONN-05 | Backend troca o code por credenciais, consulta o perfil Microsoft, vincula a conta ao Firebase UID e persiste o cache criptografado. | `acquire_token_by_auth_code_flow` + `GET /me` (`User.Read`) e envelope `encrypt_blob` `[CITED: https://msal-python.readthedocs.io/en/latest/; https://learn.microsoft.com/en-us/graph/api/user-get?view=graph-rest-1.0]`, `[VERIFIED: apis/sharepoint-functions/crypto.py:112-136]`. |
| CONN-06 | Usuário vê a identificação da conta conectada e os estados `disabled`, `disconnected`, `connected`, `syncing` ou `problems`, além da data/hora da última sincronização bem-sucedida. | Enum travado em D-12; contrato de badge e timestamp em `14-UI-SPEC.md:144-153,182-190` `[VERIFIED: 14-CONTEXT.md:33; 14-UI-SPEC.md:144-153]`. |
| CONN-07 | Usuário pode desconectar a conta; o backend remove as credenciais e marca `disconnected` sem apagar documentos já sincronizados. | D-08 exige remoção da credencial e preservação de documentos/autoria `[VERIFIED: 14-CONTEXT.md:27]`. |
| CONN-08 | Usuário com refresh token revogado ou expirado é orientado a reconectar, sem substituição automática da identidade do criador. | D-09 define `problems` e reconexão explícita; `user: revokeSignInSessions` invalida refresh tokens `[VERIFIED: 14-CONTEXT.md:28]`, `[CITED: learn.microsoft.com/graph/api/user-revokesigninsessions]`. |

</phase_requirements>

## Summary

Phase 14 must add a confidential-client OAuth flow **without moving any trust boundary to the browser**. The backend owns MSAL, PKCE, state/nonce, redirect URI, tenant validation, token-cache encryption, connection status and disconnect; the UI only calls four authenticated endpoints and renders a closed status vocabulary. `[VERIFIED: 14-CONTEXT.md:17-37]`

The Phase 13 codebase already supplies the exact reusable primitives: `resolve_auth_context` for UID/tenant, `private_json`/`private_error`/`to_https_response` for immutable `no-store` responses, `encrypt_blob`/`decrypt_blob` with AES-256-GCM and `keyVersion`, `secret_provider` for Secret Manager-injected env vars, `SharePointStore` collection constants including `sharepointOAuthTransactions`, and transactional Firestore rate limiting. `[VERIFIED: apis/sharepoint-functions/auth.py:106-152; responses.py:20-27,95-139; crypto.py:102-168; secret_provider.py:29-66; stores/sharepoint_store.py:8-16; validation.py:181-236]`

External documentation supports the locked design: Microsoft's auth-code flow requires exact `redirect_uri` matching and PKCE verifier reuse at token redemption; RFC 9700 updates the OAuth 2.0 security BCP with one-time state, exact redirect matching and least privilege; Firebase Gen2 functions expose `on_request` HTTP functions, configurable timeout/secrets, and Firebase recommends parameterized config over deprecated `functions.config()`. `[CITED: https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow; https://www.rfc-editor.org/rfc/rfc9700.txt; https://firebase.google.com/docs/functions/http-events?gen=2nd; https://firebase.google.com/docs/functions/config-env?gen=2nd]`

**Primary recommendation:** implement OAuth start/callback/status/disconnect in `apis/sharepoint-functions/`, keep all MSAL/Graph imports out of `main.py`, put new OAuth logic in separate modules, persist single-use transactions and encrypted cache only in Firestore, and gate the `msal` install behind a human verification checkpoint. `[VERIFIED: apis/sharepoint-functions/tests/test_endpoint_guards.py:82-93]`, `[WARNING: `msal` flagged as suspicious — verify before using.]`

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Firebase ID token, UID/tenant and endpoint authorization | API / Backend (Cloud Functions Python Gen2) | — | Phase 13 already resolves identity only from verified token/server profile `[VERIFIED: apis/sharepoint-functions/auth.py:78-152]`. |
| OAuth transaction creation, state/nonce/PKCE and callback validation | API / Backend | Database / Storage (Firestore) | Secrets and single-use state must stay server-side; Firestore gives atomic consumption `[VERIFIED: 14-CONTEXT.md:18-21]`, `[CITED: https://www.rfc-editor.org/rfc/rfc9700.txt]`. |
| MSAL confidential-client flow and token cache | API / Backend | Database / Storage (encrypted blob) | Frontend must never receive client secret/tokens/cache; cache ciphertext belongs only in Firestore `[VERIFIED: 14-CONTEXT.md:18,25]`. |
| Graph profile read and programmatic revoke best-effort | API / Backend | External Microsoft Graph | Backend needs account email and optional revoke; UI sees only sanitized status `[VERIFIED: 14-CONTEXT.md:28-29]`, `[CITED: https://learn.microsoft.com/en-us/graph/api/user-get?view=graph-rest-1.0]`. |
| Connection status enum and last successful sync timestamp | API / Backend | Browser / Client (read-only render) | Backend is source of truth; unknown values render neutrally in UI `[VERIFIED: 14-CONTEXT.md:33-34]`. |
| Microsoft SharePoint integration card | Browser / Client (React) | API / Backend | Local UI in existing `SettingsModal`, consuming status/OAuth endpoints `[VERIFIED: 14-CONTEXT.md:32; apps/web/src/components/SettingsModal.tsx:81,347]`. |
| Secret injection and crypto key versioning | API / Backend + Secret Manager | Database / Storage (encrypted records) | Runtime resolves injected names on demand; envelopes persist `keyVersion` `[VERIFIED: apis/sharepoint-functions/secret_provider.py:29-66; crypto.py:34-41,112-168]`. |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Python Cloud Functions Gen2 (`python312`) | `python312` in `firebase.json` | OAuth/callback/status/disconnect handlers | Existing codebase `sharepoint` already declared `[VERIFIED: firebase.json:14-17]`. |
| `firebase-functions` | `0.6.0` | `https_fn.on_request` decorators and `options.MemoryOption` | Existing pin and used by `main.py` `[VERIFIED: apis/sharepoint-functions/requirements.txt:1; main.py:9,62-68]`. |
| `firebase-admin` | `7.8.0` | ID token verification and Firestore Admin SDK | Existing pin and `verify_id_token(check_revoked=True)` `[VERIFIED: apis/sharepoint-functions/requirements.txt:2; auth.py:78-88]`. |
| `cryptography` | `50.0.2` | AES-256-GCM envelope for serialized MSAL cache | Existing pin and tested envelope `[VERIFIED: apis/sharepoint-functions/requirements.txt:3; crypto.py:112-168]`. |
| `functions-framework` | `3.10.2` | Local/runtime HTTP compatibility | Existing pin `[VERIFIED: apis/sharepoint-functions/requirements.txt:4]`. |
| `msal` | `1.39.0` | Confidential-client auth-code flow, token cache serialization, silent refresh | Official MSAL Python docs `[CITED: https://msal-python.readthedocs.io/en/latest/]`; version observed on configured PyPI index `[VERIFIED: environment probe: `pip index versions msal` → `msal (1.39.0)`]`; `[WARNING: flagged as suspicious — verify before using.]` |
| Google Cloud Secret Manager via injected env | service | Client secret and AES key material | Locked in D-07 and already implemented by `secret_provider.py` `[VERIFIED: 14-CONTEXT.md:26; apis/sharepoint-functions/secret_provider.py:29-66]`. |
| Firestore | service | OAuth transactions, connection record, encrypted cache | Locked persistence boundary `[VERIFIED: .planning/PROJECT.md:59-67; firestore.rules:106-124]`. |

**Verbatim dependency pins from `apis/sharepoint-functions/requirements.txt:1-6`** `[VERIFIED: apis/sharepoint-functions/requirements.txt:1-6]`:

```text
firebase-functions==0.6.0
firebase-admin==7.8.0
cryptography==50.0.2
functions-framework==3.10.2
pytest>=8.0,<9
pytest-asyncio>=0.24,<1
```

**Verbatim env-name values from `apis/sharepoint-functions/config.py:13-14`** `[VERIFIED: apis/sharepoint-functions/config.py:13-14]`:

```python
DEFAULT_MS_CLIENT_SECRET_ENV = "SHAREPOINT_MS_CLIENT_SECRET"
DEFAULT_CRYPTO_KEY_ENV_PREFIX = "SHAREPOINT_TOKEN_CRYPTO_KEY_V"
```

**Verbatim collection constants from `apis/sharepoint-functions/stores/sharepoint_store.py:8-16`** `[VERIFIED: apis/sharepoint-functions/stores/sharepoint_store.py:8-16]`:

```python
COL_SETTINGS = "sharepointSettings"
COL_TOKENS = "sharepointTokens"
COL_OAUTH_TRANSACTIONS = "sharepointOAuthTransactions"
COL_QUEUE = "sharepointQueue"
COL_RATE_LIMITS = "sharepointRateLimits"
COL_AUDIT = "sharepointAuditLog"
TENANT_FIELD = "companyId"
PENDING_STATUS = "pending"
DEFAULT_SETTINGS_ID = "default"
```

**Verbatim connection-status values from `14-CONTEXT.md:33`** `[VERIFIED: .planning/phases/14-oauth-e-ciclo-de-vida-da-conex-o/14-CONTEXT.md:33]`:

```text
disabled, disconnected, connected, syncing, problems
```

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `pytest` | `>=8.0,<9` | OAuth replay/tamper/mock tests | Existing sharepoint test config `[VERIFIED: apis/sharepoint-functions/requirements.txt:5; pytest.ini:1-3]`. |
| `pytest-asyncio` | `>=0.24,<1` | async test compatibility | Existing pin `[VERIFIED: apis/sharepoint-functions/requirements.txt:6]`. |
| shadcn/ui base-nova components | existing local registry | Button, Switch, Badge, AlertDialog, Separator, Skeleton, Spinner | Approved UI inventory; no third-party registries `[VERIFIED: 14-UI-SPEC.md:32-50,266-273]`. |
| Firebase CLI | `15.36.0` | Emulator/rules/deploy tooling | Available in environment `[VERIFIED: environment probe: `firebase --version` → `15.36.0`]`. |
| Java | `21.0.12.1 LTS` | Firestore emulator requirement | Available in environment `[VERIFIED: environment probe: `java -version`]`. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| MSAL Python confidential client | Hand-rolled OAuth token exchange/PKCE | Do not hand-roll; MSAL owns protocol edge cases and token cache behavior `[CITED: https://msal-python.readthedocs.io/en/latest/]`. |
| Firestore-only encrypted cache | `msal-extensions` file/keyring persistence | Rejected: project forbids disk/browser persistence; Firestore/R2 are the only allowed stores `[VERIFIED: .planning/PROJECT.md:64-65]`. |
| Separate `msal_client.py` module | Import `msal` directly in `main.py` | Rejected by AST guard: banned imports include `msal` and the token `msal` must not appear in `main.py` source `[VERIFIED: apis/sharepoint-functions/tests/test_endpoint_guards.py:82-93]`. |
| Cloud Functions Python Gen2 | FastAPI/VPS/PostgreSQL | Out of scope by project constraints `[VERIFIED: .planning/PROJECT.md:45-51,67]`. |
| Secret Manager-injected env values | `functions.config()` | Firebase recommends parameterized config/secrets; `functions.config()` is deprecated and new deployments fail after March 2027 `[CITED: https://firebase.google.com/docs/functions/config-env?gen=2nd]`. |

**Installation:** after `checkpoint:human-verify` approves the suspicious package, add `msal==1.39.0` to `apis/sharepoint-functions/requirements.txt` and install with the existing venv:

```bash
& "backend\.venv\Scripts\python.exe" -m pip install "msal==1.39.0"
```

**Version verification:** `msal` latest/available versions were checked on the correct PyPI ecosystem this session; the top result was `msal (1.39.0)` `[VERIFIED: environment probe: `pip index versions msal`]`. Other versions above came from verified in-repo pins `[VERIFIED: apis/sharepoint-functions/requirements.txt:1-6]`. No npm ecosystem package is recommended for this phase.

## Package Legitimacy Audit

> Gate executed via `gsd-tools query package-legitimacy check --ecosystem pypi msal` and `pip index versions msal` on 2026-11-18.

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| `msal` | PyPI | published `2026-09-17T16:07:46.722488Z` `[VERIFIED: package-legitimacy seam]` | unknown (`weeklyDownloads: null`) `[VERIFIED: package-legitimacy seam]` | `https://github.com/AzureAD/microsoft-authentication-library-for-python` `[VERIFIED: package-legitimacy seam]` | `SUS` (`unknown-downloads`) `[VERIFIED: package-legitimacy seam]` | Flagged — planner must add `checkpoint:human-verify` before install; keep because official MSAL Python docs prescribe it `[CITED: https://msal-python.readthedocs.io/en/latest/]`. |

**Packages removed due to `[SLOP]` verdict:** none `[VERIFIED: package-legitimacy seam]`.

**Packages flagged as suspicious `[SUS]`:** `msal` — insert `checkpoint:human-verify` before adding/installing; verify publisher, source repo, official docs and exact version `[VERIFIED: package-legitimacy seam]`.

*The name `msal` is also confirmed by official documentation, but the registry verdict is `SUS`; do not mark it `[VERIFIED: npm registry]` or install without the checkpoint.*

## Architecture Patterns

### System Architecture Diagram

```text
[Browser / Client - React apps/web]
  Integrações tab in SettingsModal
       │ click "Conectar conta Microsoft"
       ▼
  POST sharepoint_oauth_start  (Bearer Firebase ID token)
       │
       ▼
[API / Backend - Cloud Functions Python Gen2, codebase "sharepoint"]
  main.py authenticated handler
       │ delegates to oauth.py
       ├─ config + secret_provider ──► [Secret Manager injected env]
       │                                 SHAREPOINT_MS_CLIENT_SECRET
       │                                 SHAREPOINT_TOKEN_CRYPTO_KEY_V1
       ├─ msal_client.py ──► state / nonce / PKCE / authorizationUrl
       └─ Firestore transaction ──► [Database / Storage]
                                      sharepointOAuthTransactions
                                      (uid, companyId, expiry, consumed)
       │
       ▼ authorizationUrl (https, official Microsoft domain)
[External - Microsoft identity platform]
       │ user authenticates; Microsoft form_post to callback
       ▼
  POST sharepoint_oauth_callback (public protocol exception)
       │
       ├─ single-use Firestore transaction: state + expiry + UID/tenant + replay
       ├─ msal_client.py: redeem code with same redirect_uri + PKCE verifier
       ├─ graph_client.py: GET /me ; optional best-effort revoke on disconnect
       └─ crypto.py encrypt_blob ──► Firestore sharepointTokens + connection record
       │
       ▼ 302 redirect to /settings with no code/state/token
[Browser / Client]
       │ GET sharepoint_connection_status (Bearer Firebase ID token)
       ▼
  Render closed enum: disabled | disconnected | connected | syncing | problems
       │ POST sharepoint_disconnect
       ▼
  Backend deletes encrypted credential; keeps synced docs/creator metadata
```

Sources for flow/decisions: `[VERIFIED: 14-CONTEXT.md:18-37]`, `[VERIFIED: apis/sharepoint-functions/main.py:23-49]`, `[CITED: https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow]`, `[CITED: https://firebase.google.com/docs/functions/http-events?gen=2nd]`.

### Recommended Project Structure

```text
apis/sharepoint-functions/
├── main.py                       # keep thin; add 4 handlers + explicit public callback exception
├── oauth.py                      # transaction creation/validation, status/disconnect orchestration
├── msal_client.py                # ONLY module importing msal; builds confidential client/app
├── graph_client.py               # ONLY module for Graph GET /me and optional revoke call
├── oauth_store.py                # Firestore transaction helpers for OAuth tx/connection record
├── auth.py                       # reuse resolve_auth_context; do not duplicate identity logic
├── config.py                     # add non-secret OAuth config names only
├── secret_provider.py            # reuse injected client secret and crypto keys
├── crypto.py                     # reuse encrypt_blob/decrypt_blob for serialized cache
├── responses.py                  # reuse private_json/private_error/to_https_response
├── logging_utils.py              # reuse allow-list redaction
├── validation.py                 # reuse existing Firestore transaction rate limiter pattern
├── requirements.txt              # add msal==1.39.0 only after human checkpoint
└── tests/
    ├── test_oauth_transaction.py
    ├── test_oauth_callback.py
    ├── test_connection_status.py
    ├── test_disconnect.py
    ├── test_msal_client.py
    └── test_endpoint_guards.py   # update public-callback exception and handler list

apps/web/src/components/
├── SettingsModal.tsx             # replace line 347 placeholder
└── IntegrationsSection.tsx       # new local component for SharePoint card

apps/web/src/services/
└── sharepointApi.ts              # thin fetch wrapper using auth.currentUser.getIdToken()
```

The structure above is a prescriptive recommendation `[ASSUMED]` derived from verified integration points `[VERIFIED: 14-CONTEXT.md:112-117; apps/web/src/components/SettingsModal.tsx:81,347]` and the verified ban on outbound clients in `main.py` `[VERIFIED: apis/sharepoint-functions/tests/test_endpoint_guards.py:82-93]`.

### Pattern 1: Keep `main.py` thin and move outbound clients out

**What:** exported `on_request` handlers authenticate via `_authenticated`, validate HTTP method, then delegate to `oauth.py`/`msal_client.py`. `[VERIFIED: apis/sharepoint-functions/main.py:23-49,62-93]`

**When to use:** every new endpoint, especially the callback which is the single public protocol exception. `[VERIFIED: 14-CONTEXT.md:106,113]`

**Example:**

```python
# Source: existing handler pattern [VERIFIED: apis/sharepoint-functions/main.py:62-93]
# and AST guard [VERIFIED: apis/sharepoint-functions/tests/test_endpoint_guards.py:37-93]
@https_fn.on_request(...)
@_authenticated
def sharepoint_oauth_start(request: Any) -> Any:
    # validate method, then delegate; no msal/Graph import in this module
    ...
```

### Pattern 2: Single-use OAuth transaction in Firestore

**What:** create the transaction with UID, tenant, expiry, nonce/state/PKCE verifier; callback consumes it atomically inside `firestore.transactional`. `[VERIFIED: 14-CONTEXT.md:19]`, `[CITED: https://www.rfc-editor.org/rfc/rfc9700.txt]`

**When to use:** before redirecting to Microsoft and again before token redemption. `[CITED: https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow]`

**Example:**

```python
# Source: existing transactional rate-limit pattern [VERIFIED: apis/sharepoint-functions/validation.py:181-236]
# and locked OAuth contract [VERIFIED: 14-CONTEXT.md:18-21]
def operation(tx):
    snapshot = tx.get(tx_ref)
    tx.update(tx_ref, {"consumedAt": now_iso, "status": "consumed"})
    return validated_snapshot
```

The values `"consumedAt"` and `"consumed"` above are proposed field/state names `[ASSUMED]`; the planner should choose the canonical names once and cover them in replay tests.

### Pattern 3: Encrypt serialized MSAL cache with the existing envelope

**What:** call `encrypt_blob(serialized_cache, tenant_id, purpose, key_version)` and persist only the returned envelope; decrypt with the same tenant/purpose AAD. `[VERIFIED: apis/sharepoint-functions/crypto.py:102-168]`

**When to use:** after successful code redemption and after any refresh-token rotation, never in browser storage. `[VERIFIED: 14-CONTEXT.md:25]`, `[CITED: https://github.com/AzureAD/microsoft-authentication-library-for-python/wiki/Token-Cache-Serialization]`

**Example:**

```python
# Source: exact signatures [VERIFIED: apis/sharepoint-functions/crypto.py:112-117,139-143]
def encrypt_blob(
    plaintext: str,
    tenant_id: str,
    purpose: str,
    key_version: int | None = None,
) -> EncryptedBlob: ...

def decrypt_blob(
    blob_or_dict: EncryptedBlob | Mapping[str, Any],
    tenant_id: str,
    purpose: str,
) -> str: ...
```

Use a stable purpose string such as the proposed `"msal-cache-v1"` `[ASSUMED]`; it must be identical at write and read and included in tests.

### Pattern 4: One status endpoint, closed enum, neutral fallback

**What:** frontend reads only `sharepoint_connection_status`, validates `status` against the exact enum, and treats anything else as neutral. `[VERIFIED: 14-CONTEXT.md:33-34; 14-UI-SPEC.md:157-168]`

**When to use:** every render of badge, identity and last-sync timestamp. `[VERIFIED: 14-UI-SPEC.md:182-190]`

**Verbatim enum values** `[VERIFIED: 14-CONTEXT.md:33]`:

```text
disabled | disconnected | connected | syncing | problems
```

### Anti-Patterns to Avoid

- **Frontend-built authorization URL:** rejected because `client_secret`, state, nonce and PKCE verifier must remain server-side `[VERIFIED: 14-CONTEXT.md:18,172-173]`.
- **Sensitive values in redirect URL:** rejected by D-15; redirect to `/settings` must not carry `code`, `state`, `token` or secret `[VERIFIED: 14-CONTEXT.md:36]`.
- **Generic catch-all Firestore rules:** existing rules already deny client access to `sharepointOAuthTransactions` and `sharepointTokens`; do not widen them `[VERIFIED: firestore.rules:106-124]`.
- **Unbounded log fields:** use the existing 15-key allow-list; do not log `state`, `code`, tokens, cache ciphertext, nonce or AAD `[VERIFIED: apis/sharepoint-functions/logging_utils.py:9-42]`.
- **Importing `msal` in `main.py`:** the AST guard bans it `[VERIFIED: apis/sharepoint-functions/tests/test_endpoint_guards.py:82-93]`.
- **Leaving the callback decorated with `_authenticated`:** protocol requires a public callback with explicit AST-guard exception `[VERIFIED: 14-CONTEXT.md:106; apis/sharepoint-functions/tests/test_endpoint_guards.py:37-45]`.
- **Optimistic `connected` UI:** no positive status/identity may be inferred from `useAuth` or absence of error `[VERIFIED: 14-UI-SPEC.md:250-262]`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| OAuth authorization-code/PKCE exchange | Custom HTTP exchange/state machine | MSAL Python confidential client `[CITED: https://msal-python.readthedocs.io/en/latest/]` | MSAL owns protocol edge cases and cache serialization contracts `[CITED: https://github.com/AzureAD/microsoft-authentication-library-for-python/wiki/Token-Cache-Serialization]`. |
| Encrypted token cache | New cipher or file persistence | `crypto.py::encrypt_blob`/`decrypt_blob` + Firestore `[VERIFIED: apis/sharepoint-functions/crypto.py:112-168]` | Existing envelope has AES-256-GCM, nonce, AAD and key rotation tests `[VERIFIED: .planning/phases/13-funda-o-de-seguran-a-e-contratos/13-VALIDATION.md:54]`. |
| Private HTTP responses | Ad-hoc `Response` objects | `responses.py::private_json`/`private_error`/`to_https_response` `[VERIFIED: apis/sharepoint-functions/responses.py:95-139]` | Immutable `no-store` headers and closed error vocabulary are already enforced `[VERIFIED: apis/sharepoint-functions/responses.py:20-54]`. |
| UID/tenant authorization | Reading body/query IDs | `auth.py::resolve_auth_context` `[VERIFIED: apis/sharepoint-functions/auth.py:106-152]` | Tenant authority is verified claim or server-side profile only `[VERIFIED: apis/sharepoint-functions/auth.py:121-143]`. |
| Log redaction | `print`, `repr`, free-form fields | `logging_utils.log_event` `[VERIFIED: apis/sharepoint-functions/logging_utils.py:71-107]` | Allow-list drops sensitive keys and oversized/nested values `[VERIFIED: apis/sharepoint-functions/logging_utils.py:9-68]`. |
| Atomic OAuth replay guard | Naive read-then-write | `firestore.transactional` pattern from `FirestoreRateLimiter` `[VERIFIED: apis/sharepoint-functions/validation.py:181-236]` | Firestore transactions retry on contention and never partially apply writes `[CITED: https://firebase.google.com/docs/firestore/manage-data/transactions]`. |
| UI primitives | New modal/page/card template | `SettingsModal.tsx` local primitives + shadcn components `[VERIFIED: 14-UI-SPEC.md:50-57]` | Locked D-11 forbids a new template `[VERIFIED: 14-CONTEXT.md:32]`. |

**Key insight:** the only genuinely new security logic in Phase 14 is binding the Microsoft identity/tenant to the Firebase UID via a single-use transaction; everything else should reuse Phase 13 boundaries `[VERIFIED: 14-CONTEXT.md:18-29; apis/sharepoint-functions/auth.py:106-152; crypto.py:112-168]`.

## Common Pitfalls

### Pitfall 1: Redirect URI mismatch or configurable redirect
**What goes wrong:** Microsoft rejects the token request or, worse, the app accepts a redirect controlled by the browser/query. `[CITED: https://learn.microsoft.com/en-us/entra/identity-platform/reply-url]`
**Why it happens:** the value is often copied between app registration, MSAL config and callback body instead of being one backend constant. `[CITED: https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow]`
**How to avoid:** hard-code the exact registered `redirect_uri` in backend config, use the same value in flow initiation and redemption, forbid frontend-supplied redirect values, and use `form_post`. `[VERIFIED: 14-CONTEXT.md:20]`
**Warning signs:** localhost/wildcard in Azure config, callback reading `redirect_uri` from request input, or docs showing a different path/case. `[CITED: https://learn.microsoft.com/en-us/entra/identity-platform/reply-url]`

### Pitfall 2: Treating the OAuth callback like an authenticated endpoint
**What goes wrong:** `_authenticated` would require a Firebase ID token on a request that Microsoft initiates, so the flow never completes. `[VERIFIED: 14-CONTEXT.md:106]`
**Why it happens:** Phase 13's AST guard currently requires every `on_request` handler to use `_authenticated`. `[VERIFIED: apis/sharepoint-functions/tests/test_endpoint_guards.py:37-45]`
**How to avoid:** add one explicit public-callback allow-list in the guard/tests and keep all other handlers authenticated; preserve the single `_authenticated` definition. `[VERIFIED: apis/sharepoint-functions/tests/test_endpoint_guards.py:64-79]`
**Warning signs:** callback returns 401, AST guard fails after adding handlers, or the allow-list silently exempts more than the callback. `[VERIFIED: apis/sharepoint-functions/tests/test_endpoint_guards.py:48-79]`

### Pitfall 3: Reusing state/nonce/code
**What goes wrong:** authorization code replay or account-link substitution. `[CITED: https://www.rfc-editor.org/rfc/rfc9700.txt]`
**Why it happens:** transaction is read but not atomically consumed, or validation happens after token redemption. `[VERIFIED: 14-CONTEXT.md:19,21]`
**How to avoid:** consume transaction inside `firestore.transactional`, compare UID/tenant/expiry/nonce/state/PKCE before redemption, and write a consumed marker in the same transaction. `[CITED: https://firebase.google.com/docs/firestore/manage-data/transactions]`
**Warning signs:** two successful callbacks for one transaction, missing expiry field, or logs containing `state`/`code`. `[VERIFIED: apis/sharepoint-functions/logging_utils.py:29-42]`

### Pitfall 4: Leaking sensitive values through URLs, logs or browser storage
**What goes wrong:** tokens, state, PKCE verifier or secrets reach the browser history, logs or local persistence. `[VERIFIED: 14-CONTEXT.md:18,36; 14-UI-SPEC.md:250-258]`
**Why it happens:** developers use query params for convenience or `msal-extensions` for cache persistence. `[CITED: https://learn.microsoft.com/en-us/entra/msal/python/advanced/msal-python-token-cache-serialization]`
**How to avoid:** redirect only to `/settings`, use `private_json`/`log_event`, persist only encrypted envelopes in Firestore. `[VERIFIED: apis/sharepoint-functions/responses.py:20-27; logging_utils.py:9-42;PROJECT.md:64-65]`
**Warning signs:** URLs with `?code=`, browser storage APIs in new UI code, or log keys containing `token`, `secret`, `credential`, `nonce`, `aad`. `[VERIFIED: apis/sharepoint-functions/logging_utils.py:29-42]`

### Pitfall 5: Firebase tenant and Microsoft tenant treated as the same value
**What goes wrong:** a user from the wrong Microsoft tenant can be linked to a Firebase UID, or a valid Microsoft login can be attached to the wrong company. `[VERIFIED: 14-CONTEXT.md:21]`
**Why it happens:** both are called "tenant" and may be accidentally conflated in DTOs. `[ASSUMED]`
**How to avoid:** keep `ctx.company_id` from Firebase as the app tenant and validate the Microsoft tenant ID separately against the configured/app-allowed tenant before linking. `[VERIFIED: apis/sharepoint-functions/auth.py:125-143]`, `[CITED: https://learn.microsoft.com/en-us/entra/identity-platform/v2-protocols-oidc]`
**Warning signs:** one field named `tenantId` used for both systems, or callback accepting `tid` without comparison. `[ASSUMED]`

### Pitfall 6: Disconnect deletes too much or hides revocation failure
**What goes wrong:** synced documents/creator metadata are removed, or a failed programmatic revoke blocks local cleanup. `[VERIFIED: 14-CONTEXT.md:27-29]`
**Why it happens:** disconnect implemented as broad user-data deletion or as a synchronous remote-only operation. `[ASSUMED]`
**How to avoid:** delete only encrypted credentials/connection link, mark status `disconnected`, treat revoke as best-effort, and preserve documents/autoria. `[VERIFIED: 14-CONTEXT.md:27-29]`
**Warning signs:** Firestore deletes outside credential collections, error text mentioning revoke details, or status left as `connected` after local cleanup. `[VERIFIED: stores/sharepoint_store.py:8-16]`

### Pitfall 7: Frontend guesses identity or status
**What goes wrong:** UI shows `connected` from `useAuth`, invents identity from Firebase profile, or fabricates progress. `[VERIFIED: 14-UI-SPEC.md:250-262]`
**Why it happens:** the identity sources are not consolidated until Phase 15. `[VERIFIED: 14-CONTEXT.md:35]`
**How to avoid:** use only backend `accountEmail`/`lastSuccessfulSyncAt`, render unknown values as `Status indisponível`, and get tokens via Firebase SDK when calling APIs. `[VERIFIED: 14-UI-SPEC.md:182-190]`, `[VERIFIED: apps/web/src/firebase.ts:15-17]`
**Warning signs:** `connected` rendered before status fetch, `user.email` shown as Microsoft identity, or `Math.random()` progress. `[VERIFIED: 14-UI-SPEC.md:250-262]`

### Pitfall 8: Under-testing OAuth because no real credentials exist
**What goes wrong:** callback/tamper/expiry/replay paths remain unverified. `[VERIFIED: 14-CONTEXT.md:40]`
**Why it happens:** tests wait for real Azure app registration. `[ASSUMED]`
**How to avoid:** mock MSAL/Graph and use fake Firestore/emulator state; test success, tampered state/nonce, expired tx, UID mismatch, tenant mismatch, replay and disconnect. `[VERIFIED: 14-CONTEXT.md:40; .planning/REQUIREMENTS.md:75]`
**Warning signs:** tests requiring real secrets, no replay test, or skipped callback tests. `[VERIFIED: .planning/REQUIREMENTS.md:75-80]`

## Code Examples

Verified patterns from official sources and the current codebase:

### Private JSON and no-store response

```python
# Source: exact implementation [VERIFIED: apis/sharepoint-functions/responses.py:20-27,95-111]
PRIVATE_NO_STORE_HEADERS = MappingProxyType(
    {
        "cache-control": "no-store, private, max-age=0, no-cache, must-revalidate",
        "pragma": "no-cache",
        "expires": "0",
        "x-content-type-options": "nosniff",
    }
)

result = responses.private_json(payload, status=200)
return responses.to_https_response(result)
```

### Encrypted MSAL cache envelope

```python
# Source: exact constants and signatures [VERIFIED: apis/sharepoint-functions/crypto.py:17-20,34-41,112-168]
ALGORITHM = "AES-256-GCM"
NONCE_BYTES = 12
KEY_BYTES = 32
SCHEMA_VERSION = "v1"

# EncryptedBlob fields [VERIFIED: crypto.py:34-41]
# algorithm, keyVersion, nonce_b64, ciphertext_b64, aad, updatedAt

envelope = crypto.encrypt_blob(serialized_cache, ctx.company_id, purpose)
store.save_token_envelope(ctx.company_id, purpose, envelope.to_dict())
```

The variable `purpose` must be a stable non-secret string chosen by the planner `[ASSUMED]`; do not use a value that was not defined in the implementation/tests.

### OAuth start/callback boundary

```python
# Source: existing handler pattern [VERIFIED: apis/sharepoint-functions/main.py:62-93]
# and Microsoft auth-code flow guidance [CITED: https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow]
@https_fn.on_request(...)
@_authenticated
def sharepoint_oauth_start(request: Any) -> Any:
    ctx: auth.AuthContext = request.auth_context
    return responses.to_https_response(responses.private_json({"authorizationUrl": url}))


@https_fn.on_request(...)
# public protocol exception, explicitly allowed by AST guard tests
def sharepoint_oauth_callback(request: Any) -> Any:
    # consume transaction atomically, validate identity/tenant/expiry/replay,
    # redeem code via msal_client.py, persist encrypted cache, then redirect
    ...
```

The field name `authorizationUrl` is locked by the approved UI contract `[VERIFIED: 14-UI-SPEC.md:172,187]`; the concrete URL and redirect URI are not available in the repo and must be configured from the Azure app registration `[ASSUMED]`.

### Frontend API token acquisition

```ts
// Source: existing Firebase SDK export [VERIFIED: apps/web/src/firebase.ts:15-17]
// and UI flow contract [VERIFIED: 14-UI-SPEC.md:170-175]
import { auth } from "../firebase";

const idToken = await auth.currentUser?.getIdToken();
const response = await fetch(url, {
  method: "POST",
  headers: { Authorization: `Bearer ${idToken}` },
});
```

Do not add `getIdToken` to `AuthContext`; the current context has no token method `[VERIFIED: apps/web/src/contexts/AuthContext.tsx:8-24,106-129]`.

### Firestore transactional consumption

```python
# Source: verified transactional pattern [VERIFIED: apis/sharepoint-functions/validation.py:181-236]
# and Firestore transaction docs [CITED: https://firebase.google.com/docs/firestore/manage-data/transactions]
return firestore.transactional(operation)(transaction)
```

Keep all reads before writes inside `operation`; Firestore transaction functions can run more than once and fail offline `[CITED: https://firebase.google.com/docs/firestore/manage-data/transactions]`.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| OAuth without PKCE for confidential clients | Authorization Code + PKCE with `S256` and single-use state | OAuth 2.0 Security BCP / RFC 9700 `[CITED: https://www.rfc-editor.org/rfc/rfc9700.txt]` | Callback must verify PKCE and rotate/consume state `[VERIFIED: 14-CONTEXT.md:18-21]`. |
| Redirect URI variants/wildcards | Exact registered URI, `form_post`, no frontend-configurable redirect | Microsoft reply URL/OAuth docs `[CITED: https://learn.microsoft.com/en-us/entra/identity-platform/reply-url; https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow]` | Azure app registration must be updated once exact URL is known `[VERIFIED: 14-CONTEXT.md:20]`. |
| `functions.config()` env values | Parameterized config + Secret Manager + `on_request(secrets=[...])` | Firebase docs; new deployments fail after March 2027 `[CITED: https://firebase.google.com/docs/functions/config-env?gen=2nd]` | Use existing injected env names, not legacy config `[VERIFIED: apis/sharepoint-functions/secret_provider.py:1-6]`. |
| Token cache on disk/keyring | Serialized cache encrypted in Firestore | Project persistence constraint `[VERIFIED: .planning/PROJECT.md:64-66]`, MSAL serialization docs `[CITED: https://github.com/AzureAD/microsoft-authentication-library-for-python/wiki/Token-Cache-Serialization]` | Need explicit rotation/serialization tests; no `msal-extensions`. |
| Broad `Error.message` to browser | Closed `ErrorKind` vocabulary and `no-store` headers | Phase 13 `[VERIFIED: .planning/phases/13-funda-o-de-seguran-a-e-contratos/13-SECURITY.md:43-45]` | OAuth failures must reuse sanitized errors; no exception text. |

**Deprecated/outdated:**
- `functions.config()`: deprecated; new deployments fail after March 2027 `[CITED: https://firebase.google.com/docs/functions/config-env?gen=2nd]`.
- Any OAuth flow that returns `code`, `state`, `token` or secret in the final URL: rejected by locked D-15 `[VERIFIED: 14-CONTEXT.md:36]`.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | The exact Azure `redirect_uri`, app registration ID and tenant consent state are not present in the repo; they must be supplied by a human/deployment config. | Pattern 4, Open Questions | Wrong redirect rejects all callbacks or creates a security gap. |
| A2 | Firebase `companyId` and Microsoft `tid` are distinct values that must be compared explicitly; the current repo defines only the Firebase side. | Pitfall 5, Security Domain | Wrong tenant linkage creates IDOR/cross-customer credential binding. |
| A3 | Firebase Gen2 Python `form_post` URL-encoded body parsing should be verified with a runtime-level test; the fetched official page did not expose a Python-specific extraction recipe. | Pitfall 1, Open Questions | Callback may receive empty form fields in production. |
| A4 | Proposed internal names (`consumedAt`, `consumed`, `msal-cache-v1`, new module filenames) are recommendations, not existing constants. | Pattern 2/3, Project Structure | Executor must define canonical names consistently or tests/code drift. |
| A5 | Programmatic revocation support for the registered Microsoft app is unknown; D-10 treats it as best-effort. | Pitfall 6, Open Questions | Planner may overpromise revoke behavior; must keep local cleanup unconditional. |
| A6 | The frontend has no automated component-test framework; frontend verification relies on build/lint plus UAT/manual state checks. | Validation Architecture | Visual/interaction regressions may not be caught automatically. |

## Open Questions

1. **What is the exact registered `redirect_uri` and Azure app registration identity?**
   - What we know: D-03 requires an exact `form_post` redirect with no localhost/wildcard/frontend config `[VERIFIED: 14-CONTEXT.md:20]`.
   - What's unclear: the concrete HTTPS URL and client ID are absent from the repo; `.env.example` only has placeholder names `[VERIFIED: .env.example:28-34]`.
   - Recommendation: add non-secret config names only, keep exact URI in backend config, and make human registration a pre-deploy checkpoint.

2. **Which Microsoft identity/tenant values are authoritative for tenant binding?**
   - What we know: Firebase tenant comes from `companyId` claim or server-side `users/{uid}` profile `[VERIFIED: apis/sharepoint-functions/auth.py:125-143]`; D-04 requires Microsoft tenant validation `[VERIFIED: 14-CONTEXT.md:21]`.
   - What's unclear: whether to compare against a single configured tenant or a per-tenant mapping is not specified in the repo.
   - Recommendation: compare the callback ID-token `tid` against a backend-controlled allow-list/mapping and cover mismatch in tests `[ASSUMED]`.

3. **How does the Gen2 Python handler read Microsoft `form_post` fields in the deployed runtime?**
   - What we know: Gen2 HTTP functions support HTTP methods and request handling `[CITED: https://firebase.google.com/docs/functions/http-events?gen=2nd]`.
   - What's unclear: the fetched docs did not expose a Python-specific `form_post` body extraction recipe; confidence is LOW for this detail `[ASSUMED]`.
   - Recommendation: write a behavioral test with a request object exposing form/body data and record a manual emulator check before relying on production parsing.

4. **Is programmatic refresh-token revocation supported/desired for this app registration?**
   - What we know: `user: revokeSignInSessions` invalidates refresh tokens and session cookies `[CITED: https://learn.microsoft.com/en-us/graph/api/user-revokesigninsessions?view=graph-rest-1.0]`; D-10 says best-effort `[VERIFIED: 14-CONTEXT.md:29]`.
   - What's unclear: Graph permission/admin consent and app policy are unknown.
   - Recommendation: do not block disconnect on revoke; keep errors server-side and sanitized.

5. **Where does `lastSuccessfulSyncAt` come from in Phase 14?**
   - What we know: UI requires the timestamp from backend `[VERIFIED: 14-UI-SPEC.md:186-190]`; no sync engine exists until Phase 16 `[VERIFIED: .planning/ROADMAP.md:16-19]`.
   - What's unclear: the field can be absent/"nunca houve" until sync phases add it.
   - Recommendation: expose optional field from backend connection record initially; never fabricate a timestamp in frontend.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Frontend build/lint | ✓ | `v24.19.0` | — |
| npm | `npm run web:build`, `npm run web:lint` | ✓ | `11.17.0` | — |
| Python venv | SharePoint backend tests/install | ✓ | `backend\.venv\Scripts\python.exe` → `Python 3.14.7` | — |
| pip | Install `msal` | ✓ | `26.2.1` | — |
| Firebase CLI | Firestore emulator/rules/deploy | ✓ | `15.36.0` | — |
| Java | Firestore emulator | ✓ | `openjdk version "21.0.12.1" 2026-08-18 LTS` | — |
| `msal` | OAuth flow implementation | ✗ | `WARNING: Package(s) not found: msal` | Mock `msal` in tests; production install blocked by human checkpoint. |
| Microsoft credentials | Real Azure/Graph calls | ✗ | none available `[VERIFIED: 14-CONTEXT.md:39-41]` | Mock MSAL/Graph; no live UAT in this phase. |
| Firestore emulator | Transaction/replay verification | ✓ via Firebase CLI + Java | `15.36.0` / Java 21 | Static/mocked tests if emulator env not configured. |

All availability rows above are `[VERIFIED: environment probe]` unless explicitly cited otherwise.

**Missing dependencies with no fallback:**
- Real Microsoft app registration credentials for live end-to-end OAuth — out of scope by D-16/D-17 `[VERIFIED: 14-CONTEXT.md:39-40]`.

**Missing dependencies with fallback:**
- `msal` — not installed and flagged `SUS`; tests can use fakes, but implementation/deploy requires install after `checkpoint:human-verify` `[VERIFIED: environment probe; package-legitimacy seam]`.

## Validation Architecture

> Included because `workflow.nyquist_validation` is `true` `[VERIFIED: .planning/config.json:7-15]`.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | pytest + pytest-asyncio `[VERIFIED: apis/sharepoint-functions/requirements.txt:5-6]` |
| Config file | `apis/sharepoint-functions/pytest.ini` (`testpaths = tests`, `asyncio_mode = auto`) `[VERIFIED: apis/sharepoint-functions/pytest.ini:1-3]` |
| Quick run command | `$env:PYTHONDONTWRITEBYTECODE='1'; & "backend\.venv\Scripts\python.exe" -m pytest -q apis/sharepoint-functions/tests/test_oauth_transaction.py apis/sharepoint-functions/tests/test_oauth_callback.py apis/sharepoint-functions/tests/test_connection_status.py apis/sharepoint-functions/tests/test_disconnect.py -p no:cacheprovider` |
| Full suite command | `$env:PYTHONDONTWRITEBYTECODE='1'; & "backend\.venv\Scripts\python.exe" -m pytest -q apis/sharepoint-functions/tests -p no:cacheprovider` |
| Frontend sanity | `npm run web:build` and `npm run web:lint` `[VERIFIED: package.json:12-13]` |
| Baseline | `133 passed, 1 skipped, 1 warning in 0.98s` on 2026-11-18 `[VERIFIED: environment probe]` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| CONN-01 | Integration card replaces placeholder; switch toggles | unit/render or manual | `npm run web:build` + UI checklist | ❌ Wave 0 (no frontend test files found) |
| CONN-02 | Authenticated start returns official Microsoft authorization URL | unit + behavioral | `pytest ...::test_oauth_start_*` | ❌ Wave 0 |
| CONN-03 | Transaction stores UID/tenant/expiry/PKCE/state atomically | unit + Firestore fake/emulator | `pytest ...::test_oauth_transaction_*` | ❌ Wave 0 |
| CONN-04 | Tampered/expired/replayed callback refused, no credential emitted | unit + behavioral | `pytest ...::test_oauth_callback_*` | ❌ Wave 0 |
| CONN-05 | Code redemption, `/me`, UID binding, encrypted cache persisted | unit with MSAL/Graph mocks | `pytest ...::test_oauth_callback_success*` | ❌ Wave 0 |
| CONN-06 | Closed status enum, identity, last successful sync or neutral fallback | unit + frontend manual | `pytest ...::test_connection_status_*` + build | ❌ Wave 0 |
| CONN-07 | Disconnect deletes credentials and marks disconnected, preserves docs | unit + behavioral | `pytest ...::test_disconnect_*` | ❌ Wave 0 |
| CONN-08 | Revoked/expired refresh token maps to `problems` without identity swap | unit with MSAL error mocks | `pytest ...::test_connection_status_problems_*` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** full pytest suite command above; must stay under 90 seconds (baseline ~1 s) `[VERIFIED: environment probe]`.
- **Per wave merge:** full pytest suite + `npm run web:build`; `npm run web:lint` when frontend files change `[VERIFIED: package.json:12-13]`.
- **Phase gate:** full suite green before `/gsd-verify-work`; emulator-backed replay test required when `FIRESTORE_EMULATOR_HOST` is configured `[VERIFIED: 13-VALIDATION.md:65,104-112]`.

### Wave 0 Gaps

- [ ] `apis/sharepoint-functions/tests/test_oauth_transaction.py` — CONN-03 replay/expiry/UID/tenant.
- [ ] `apis/sharepoint-functions/tests/test_oauth_callback.py` — CONN-02/04/05 tamper, success, replay.
- [ ] `apis/sharepoint-functions/tests/test_connection_status.py` — CONN-06/08 status enum and `problems`.
- [ ] `apis/sharepoint-functions/tests/test_disconnect.py` — CONN-07 credential deletion and preservation.
- [ ] `apis/sharepoint-functions/tests/test_msal_client.py` — mocked MSAL/Graph, no real secrets.
- [ ] `apis/sharepoint-functions/tests/test_endpoint_guards.py` — update public callback exception and handler-count expectations.
- [ ] `apps/web/src/services/sharepointApi.ts` + integration component tests or documented manual checklist — CONN-01/02/06/07.
- [ ] `msal==1.39.0` install after `checkpoint:human-verify`.

*No existing OAuth test files were found in `apis/sharepoint-functions/tests/`; existing 12 test modules cover Phase 13 only* `[VERIFIED: filesystem glob; environment probe]`.

## Security Domain

> Included because `security_enforcement` is absent from config and therefore enabled.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|------------------|
| V2 Authentication | yes | Firebase ID token verification via `resolve_auth_context` on all authenticated endpoints; Microsoft OIDC validation on callback `[VERIFIED: apis/sharepoint-functions/auth.py:78-152]`, `[CITED: https://learn.microsoft.com/en-us/entra/identity-platform/v2-protocols-oidc]`. |
| V3 Session Management | no | No new app session layer; Firebase Auth remains identity source and MSAL cache stays backend-only `[VERIFIED: 14-CONTEXT.md:14,35]`. |
| V4 Access Control | yes | UID/tenant from verified token/server profile; Microsoft tenant checked separately; Firestore client-deny rules `[VERIFIED: apis/sharepoint-functions/auth.py:121-143; firestore.rules:106-124]`. |
| V5 Input Validation | yes | Validate callback form fields, state/nonce/PKCE, expiry, UID/tenant; reuse sanitized `ErrorKind` `[VERIFIED: 14-CONTEXT.md:21; responses.py:30-54]`. |
| V6 Cryptography | yes | AES-256-GCM envelope via existing `crypto.py`; no hand-rolled crypto `[VERIFIED: apis/sharepoint-functions/crypto.py:17-20,112-168]`. |
| V7 Storage | yes | Only Firestore encrypted records; no browser/disk persistence `[VERIFIED: .planning/PROJECT.md:64-66; firestore.rules:106-124]`. |
| V10 API/Web Services | yes | Public callback is protocol-required with explicit AST exception; all other handlers authenticated `[VERIFIED: 14-CONTEXT.md:106; test_endpoint_guards.py:37-79]`. |

### Known Threat Patterns for {stack}

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Redirect URI manipulation | Tampering / Spoofing | Exact registered backend `redirect_uri`, `form_post`, no frontend input `[VERIFIED: 14-CONTEXT.md:20]`. |
| State/code replay | Replay / Elevation of Privilege | Single-use Firestore transaction before token redemption `[CITED: https://www.rfc-editor.org/rfc/rfc9700.txt]`. |
| Cross-tenant credential binding | Elevation of Privilege | Compare Firebase `companyId` and Microsoft tenant separately; bind account to Firebase UID `[VERIFIED: 14-CONTEXT.md:21]`. |
| Token/cache disclosure | Information Disclosure | Encrypt serialized cache; deny client Firestore access; `no-store`; allow-list logs `[VERIFIED: crypto.py:112-168; firestore.rules:106-124; responses.py:20-27; logging_utils.py:9-42]`. |
| Secret exposure in frontend/URL | Information Disclosure | No `VITE_*` secrets; redirect without sensitive params; backend-only Secret Manager env `[VERIFIED: .env.example:28-34; 14-CONTEXT.md:36]`. |
| Destructive disconnect | Tampering | Delete credentials only; preserve docs/authorship; best-effort revoke never blocks cleanup `[VERIFIED: 14-CONTEXT.md:27-29]`. |

## Sources

### Primary (HIGH confidence)
- Direct source reads this session: `14-CONTEXT.md`, `REQUIREMENTS.md`, `ROADMAP.md`, `PROJECT.md`, `STATE.md`, `config.json`, `14-UI-SPEC.md`, `13-VALIDATION.md`, `13-SECURITY.md`, `main.py`, `auth.py`, `config.py`, `secret_provider.py`, `crypto.py`, `responses.py`, `logging_utils.py`, `validation.py`, `stores/sharepoint_store.py`, tests, `firebase.json`, `firestore.rules`, `.env.example`, `package.json`, frontend integration files.
- Environment probes: versions, package index, package legitimacy seam, baseline pytest run, research-plan/classify-confidence/research-store seam.

### Secondary (MEDIUM confidence)
- `[CITED: https://www.rfc-editor.org/rfc/rfc9700.txt]` — OAuth 2.0 Security BCP; classified `MEDIUM` by `gsd-tools query classify-confidence --provider websearch --verified`.
- Official-source links listed below were fetched via WebFetch and classified `LOW`; they are cited as documentation references, not marked `[VERIFIED]`.

### Tertiary (LOW confidence)
- `[CITED: https://learn.microsoft.com/en-us/entra/identity-platform/reply-url]`
- `[CITED: https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow]`
- `[CITED: https://learn.microsoft.com/en-us/entra/identity-platform/v2-protocols-oidc]`
- `[CITED: https://learn.microsoft.com/en-us/graph/api/user-get?view=graph-rest-1.0]`
- `[CITED: https://learn.microsoft.com/en-us/graph/api/user-revokesigninsessions?view=graph-rest-1.0]`
- `[CITED: https://msal-python.readthedocs.io/en/latest/]`
- `[CITED: https://github.com/AzureAD/microsoft-authentication-library-for-python/wiki/Token-Cache-Serialization]`
- `[CITED: https://learn.microsoft.com/en-us/entra/msal/python/advanced/msal-python-token-cache-serialization]`
- `[CITED: https://firebase.google.com/docs/firestore/manage-data/transactions]`
- `[CITED: https://firebase.google.com/docs/functions/config-env?gen=2nd]`
- `[CITED: https://firebase.google.com/docs/functions/http-events?gen=2nd]`
- Context7 MCP was unavailable and `ctx7` CLI was not installed; WebFetch/WebSearch fallback was used, as required by the documentation lookup policy `[ASSUMED: tooling limitation observed this session]`.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — in-repo pins and environment/package probes verified; `msal` version verified but package flagged `SUS` and install gated.
- Architecture: MEDIUM — locked decisions and existing code are verified; exact Azure configuration and `form_post` parsing remain assumed/open.
- Pitfalls: MEDIUM — grounded in official docs and verified Phase 13 guards; tenant mapping and runtime parsing details require confirmation.

**Research date:** 2026-11-18
**Valid until:** 2026-11-25 (OAuth SDK/runtime details are fast-moving; re-check before deploy).

