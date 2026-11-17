# Architecture Research — Integração Nativa Microsoft SharePoint (Atlas v2.0)

**Domain:** Integração Microsoft SharePoint/Graph em monorepo Firebase-centric (Atlas / PODSAdministrator)
**Researched:** 2026-11-17
**Confidence:** MEDIUM — o mapa do codebase é HIGH (leitura direta dos arquivos); as APIs externas (MSAL, Graph, Gen2, R2, regras, verify_id_token) foram verificadas em documentação oficial via WebSearch com cross-check, classificadas como MEDIUM pelo seam. Nenhuma afirmação crítica depende apenas de memória de treinamento.
**Mode:** Project Research — ARCHITECTURE for new features (milestone subsequente)

## 0. Escopo e premissas

Este documento cobre **apenas as novas features** do milestone v2.0. Não repropõe a arquitetura existente — ela é a base sobre a qual a integração é **estendida**.

Premissas confirmadas pelo `PROJECT.md` e pelo mapa em `.planning/codebase/`:

| Premissa | Consequência arquitetural |
|----------|---------------------------|
| Firebase é a fonte oficial de perfil, metadados, fila, estados, auditoria e quota | Todo estado durável vai para Firestore; R2 guarda somente binário pendente |
| R2 é temporário até o SharePoint confirmar a gravação | O objeto R2 é **staging**, não repositório final; deve ser apagado após confirmação |
| Identidade delegada preservada (autoria real no SharePoint) | Proibido app-only/client credentials para Graph; usar token de usuário via MSAL |
| Tokens nunca chegam ao frontend | MSAL roda no backend; cache serializado **criptografado** no Firestore; chave no Secret Manager |
| Sem cache e sem arquivos temporários (browser ou backend) | Nenhum `UploadFile` com spool em disco, nenhum `localStorage`/service-worker cache, respostas `no-store` |
| Backend em Python Gen2 no projeto Firebase existente | Novo *codebase* de Functions Python convivendo com `apis/reporting-functions` (Node) |
| Zero credenciais reais no repo | Tudo configurável por `.env.example`, secrets e mocks |

> **Esclarecimento importante sobre "no cache":** o cache de token do MSAL é um **repositório durável de credencial** exigido pela biblioteca, não um cache de dados de domínio. Ele fica criptografado no Firestore e não deve ser confundido com cache de documentos/metadados — estes não podem ser cacheados em lugar nenhum.

---

## 1. Standard Architecture — System Overview

```text
┌──────────────────────────────────────────────────────────────────────────────────┐
│ FRONTEND — React 19 + Vite 7 (apps/web)                                          │
│ pages/SettingsPage · components/SharePoint/* · hooks/useSharePoint*              │
│ ┌──────────────────────────────────────────────────────────────────────────────┐ │
│ │ DocumentStorageService (interface)  →  SharePointService (HTTP, ID token)    │ │
│ │ Componentes NUNCA importam Graph SDK, MSAL, boto3 nem leem chaves R2         │ │
│ └──────────────────────────────────────────────────────────────────────────────┘ │
└──────────┬──────────────────────────────────────┬────────────────────────────────┘
           │ HTTPS Authorization: Bearer <ID token>│ onSnapshot (status/metadados)
           ▼                                      │
┌──────────────────────────────────────────────────┼────────────────────────────────┐
│ CLOUD FUNCTIONS GEN2 — codebase "sharepoint" (Python 3.12)                       │
│ apis/sharepoint-functions/main.py                                                │
│  ├─ https_fn: oauth_start / oauth_callback / connect / disconnect / status       │
│  ├─ https_fn: browse / search / upload_init / download / replace                 │
│  ├─ firestore_fn.on_document_created → claim_and_process(worker)                 │
│  └─ scheduler_fn.on_schedule → reconciler (leased expirados / retry)             │
│                                                                                  │
│  auth.py (verify_id_token) · crypto.py (AES-256-GCM) · secrets.py (Secret Mgr)   │
│  msal_client.py · graph_client.py · r2_client.py · sync/ (state machine + lease)  │
└───────┬──────────────┬──────────────┬───────────────┬────────────────────────────┘
        │              │              │               │
        ▼              ▼              ▼               ▼
┌──────────────┐ ┌─────────────┐ ┌──────────────┐ ┌──────────────────────────────┐
│ Microsoft    │ │ Cloudflare  │ │ Secret Mgr   │ │ FIRESTORE (projeto existente)│
│ Entra ID +   │ │ R2 (S3 API) │ │ (chave AES, │ │ oauthTransactions · credentials│
│ Graph v1.0   │ │ staging     │ │ client secret│ │ documents · syncQueue · audit  │
│ (delegado)   │ │ binário     │ │ MSAL)        │ │ usage · settings              │
└──────────────┘ └─────────────┘ └──────────────┘ └──────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│ SharePoint / OneDrive for Business — destino final (autoria do usuário MS)       │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Mudança estrutural central:** o backend deixa de ser somente "HTTP request → resposta" (padrão DATATEM) e passa a ter **trabalho assíncrono durável disparado por eventos do Firestore + reconciliação periódica**. Ainda assim, não é uma arquitetura paralela: o Firestore continua sendo a fonte de verdade e o frontend continua consumindo `onSnapshot`, exatamente como em `useSimcardOperations.ts` / `usePages.ts`.

---

## 2. Component Responsibilities

| Componente | Responsabilidade | Caminho / implementação | Novo ou Modificado |
|-----------|------------------|-------------------------|--------------------|
| Entry point Functions Gen2 | Registrar HTTPS, Firestore trigger e scheduler | `apis/sharepoint-functions/main.py` | **Novo** |
| Config de deploy | Adicionar 2º codebase Python ao lado do Node | `firebase.json` (`functions` de objeto → array) | **Modificado** |
| Autenticação de backend | `verify_id_token` + uid/tenant extraído | `apis/sharepoint-functions/auth.py` (espelha o padrão de `apis/connectivity/fastapi_app/firebase_client.py:82`, sem import cross-codebase) | **Novo** (padrão existente) |
| Criptografia | AES-256-GCM, nonce por escrita, AAD = uid | `apis/sharepoint-functions/crypto.py` | **Novo** |
| Segredos | Buscar chave AES e client secret no runtime | `apis/sharepoint-functions/secrets.py` | **Novo** |
| OAuth + MSAL | `initiate_auth_code_flow`, transação state/PKCE, cache serializado, refresh | `apis/sharepoint-functions/oauth.py`, `msal_client.py` | **Novo** |
| Graph client | Navegação, upload resumável, ETag/If-Match, backoff com `Retry-After` | `apis/sharepoint-functions/graph_client.py` | **Novo** |
| R2 client | `put_object`/multipart via boto3, streaming, abort em falha | `apis/sharepoint-functions/r2_client.py` | **Novo** |
| State machine + lease | Claim transacional, backoff, idempotência, dead-letter | `apis/sharepoint-functions/sync/worker.py`, `sync/state.py` | **Novo** |
| Reconciliador | Retomar jobs com lease expirado | `apis/sharepoint-functions/sync/reconciler.py` | **Novo** |
| Stores Firestore | Leituras/escritas transacionais porcoleção | `apis/sharepoint-functions/stores/*.py` | **Novo** |
| Contratos compartilhados | Tipos e schemas Zod do domínio SharePoint | `shared/types/sharepoint/index.ts`, `shared/schemas/index.ts` | **Modificado** (novo domínio + reexport) |
| Conversor Firestore | `sharepointDocumentConverter` com `schema.parse()` | `firebase/converters/index.ts` | **Modificado** |
| Abstração de storage (frontend) | Interface que isola Graph/R2 dos componentes | `apps/web/src/core/services/DocumentStorageService.ts` | **Novo** |
| Implementação da abstração | Chamadas HTTP ao codebase Python | `apps/web/src/services/SharePointService.ts` | **Novo** |
| Hook de domínio | Status/queue via `onSnapshot`, ações via service | `apps/web/src/hooks/useSharePoint.ts` | **Novo** |
| Contexto de integração | Estado "conectado/desconectado/erro" | `apps/web/src/contexts/SharePointContext.tsx` | **Novo** |
| UI de configuração | Ativar/desativar, conectar/desconectar, status | `apps/web/src/pages/SettingsPage.tsx`, `apps/web/src/components/SettingsModal.tsx` | **Modificado** |
| UI unificada de documentos | Sites, bibliotecas, pastas, busca, upload, download | `apps/web/src/pages/DocumentsPage.tsx`, `apps/web/src/components/SharePoint/*` | **Novo** |
| Rota | `/documents` dentro de `PrivateRoute` | `apps/web/src/routes/index.tsx` | **Modificado** |
| Segurança Firestore | Proteger novas coleções + ownership | `firestore.rules` | **Modificado** |
| Índices | Consultas de fila e auditoria | `firestore.indexes.json` | **Modificado** |
| Testes | Mocks de Graph e R2, transação/lease | `apis/sharepoint-functions/tests/` | **Novo** |
| Documentação | Setup Azure app, R2, secrets, deploy | `docs/SHAREPOINT_INTEGRATION.md`, `.env.example` | **Novo / Modificado** |

---

## 3. Recommended Project Structure

```text
apis/sharepoint-functions/                 # NOVO codebase Python Gen2
├── main.py                                # https_fn + firestore_fn + scheduler_fn
├── requirements.txt                       # firebase-functions, firebase-admin, msal,
│                                          # cryptography, google-cloud-secret-manager,
│                                          # boto3, httpx, pydantic
├── config.py                             # Settings.from_env() (padrão dataclass frozen)
├── auth.py                                # require_firebase_user(Authorization: Bearer)
├── crypto.py                              # encrypt/decrypt AES-256-GCM
├── secrets.py                             # get_secret() via Secret Manager
├── msal_client.py                         # ConfidentialClientApplication + cache Firestore
├── oauth.py                               # start/callback/disconnect + transação state/PKCE
├── graph_client.py                        # Graph REST (delegado) + upload resumável
├── r2_client.py                           # boto3 streaming + multipart + abort
├── stores/
│   ├── connection_store.py                # settings + credentials (criptografadas)
│   ├── document_store.py                  # metadados + ETag
│   ├── queue_store.py                     # claim transacional + lease epoch
│   └── audit_store.py                     # eventos append-only + contadores de quota
├── sync/
│   ├── state.py                           # enum de estados e transições legais
│   ├── worker.py                          # claim → executar → confirmar/compensar
│   └── reconciler.py                      # varredura de leases expirados
├── models/                                # Pydantic: payloads e documentos Firestore
└── tests/                                 # mocks Graph + R2 + Firestore emulator

apps/web/src/
├── core/services/DocumentStorageService.ts       # NOVO — abstração (interface + tipos)
├── services/SharePointService.ts                  # NOVO — HTTP + erro tipado
├── contexts/SharePointContext.tsx                 # NOVO
├── hooks/useSharePoint.ts                         # NOVO (onSnapshot + ações)
├── components/SharePoint/                         # NOVO — StatusBadge, FileBrowser, UploadDialog
├── pages/DocumentsPage.tsx                        # NOVO
├── pages/SettingsPage.tsx                         # MODIFICADO — seção SharePoint
├── components/SettingsModal.tsx                   # MODIFICADO — aba real (hoje PlaceholderSection)
└── routes/index.tsx                               # MODIFICADO — rota /documents

shared/types/sharepoint/index.ts                   # NOVO (reexport em shared/types/index.ts)
shared/schemas/index.ts                            # MODIFICADO (schemas Zod sharepoint)
firebase/converters/index.ts                       # MODIFICADO (novo converter)
firebase.json · firestore.rules · firestore.indexes.json · package.json (raiz)
```

### Structure Rationale

- **`apis/sharepoint-functions/` separado de `apis/connectivity/`:** são runtimes e ciclos de vida diferentes (FastAPI no Render vs. Functions Gen2 no Firebase). O mapa de codebase recomenda `apis/<novo-servico>/` para novo domínio de integração (`STRUCTURE.md:196-203`). **Não importar** `apis/connectivity/fastapi_app/*` de dentro do novo codebase — cada codebase é um pacote de deploy independente; **replicar o padrão** (`@firestore.transactional`, histórico append-only, `SERVER_TIMESTAMP`) em vez de compartilhar código.
- **`DocumentStorageService` em `core/services/`:** segue a convenção de fachada de `core/services/platformService.ts` (`ARCHITECTURE.md:157-158`). É a fronteira que garante o requisito "componentes nunca sabem se o dado veio de R2 ou Graph".
- **`stores/` separado de `sync/`:** persistência transacional vs. orquestração. Espelha a separação `simcard_store.py` (transação) ↔ `routes_datatem.py` (orquestração), evitando o anti-padrão de lógica de domínio dentro do handler HTTP.
- **Tipos em `shared/` + converter em `firebase/`:** um único caminho de validação (`Zod.parse` em `toFirestore`), evitando as três camadas de repositório sobrepostas que o mapa aponta como anti-padrão (`ARCHITECTURE.md:224-228`).

---

## 4. Integration Points — pontos concretos no código existente

### 4.1 Autenticação (modificar o padrão, não duplicar)

O codebase já tem `require_firebase_user()` em `apis/connectivity/fastapi_app/firebase_client.py:82` (`verify_id_token` + perfil em `users/{uid}`), mas **não é aplicado** nas rotas DATATEM (`ARCHITECTURE.md:217`). A integração SharePoint **deve** aplicá-lo desde o primeiro endpoint.

- **Backend:** criar `apis/sharepoint-functions/auth.py` com `require_firebase_user` usando `firebase_admin.auth.verify_id_token(id_token, check_revoked=True)` (a doc recomenda `check_revoked=True` para detectar revogação; custo extra de rede — aceitável em endpoints de mutação, opcional em leitura). Mapear `RevokedIdTokenError`/`UserDisabledError` → `401`, `InvalidIdTokenError` → `401`.
- **Frontend:** `apps/web/src/services/SharePointService.ts` deve obter o ID token via `auth.currentUser.getIdToken()` (o SDK já inicializado em `apps/web/src/firebase.ts`) e enviar `Authorization: Bearer <token>` — diferença deliberada em relação a `DatatemService.ts:81`, que envia apenas `Content-Type`.
- **Identidade delegada:** o `uid` do Firebase autenticado é a chave de isolamento (`ownerUid`) em **toda** coleção; o `msAccountId`/`homeAccountId` do MSAL é guardado somente no backend para recuperar o token de usuário correto na hora de chamar o Graph. A autoria no SharePoint é do usuário Microsoft cujo token foi usado — nunca de um ator fixo como `SYSTEM_ACTOR` (`ARCHITECTURE.md:230-234`).

### 4.2 UI e configuração

- `apps/web/src/pages/SettingsPage.tsx`: adicionar seção "Microsoft SharePoint" (ativar/desativar, status, última sincronização, botão conectar/desconectar) usando `useAuth()` já presente na linha 23.
- `apps/web/src/components/SettingsModal.tsx:347` hoje renderiza `PlaceholderSection` para "Integrações"; substituir por componente real que chama `useSharePoint()`.
- Botão "Continue with Microsoft" em `apps/web/src/pages/Auth/LoginPage.tsx:177-183` **não deve** ser reutilizado: ele é login no Firebase, não consentimento Graph. O fluxo OAuth começa na Settings, não no login.
- `apps/web/src/routes/index.tsx`: adicionar rota lazy `/documents` dentro de `PrivateRoute` (padrão em `:55`/`:78`).

### 4.3 Service layer e erros

Seguir `apps/web/src/services/DatatemService.ts`: classe de erro tipada (`SharePointApiError` com `code`/`status`), mapa `FRIENDLY_MESSAGES`, `extractError()` lendo `detail.code`/`detail.message`, e retry apenas em `5xx`/`network_unavailable` com `AbortController` (padrão de `useSimcardInventory.ts:57-64`).

Códigos de erro esperados do backend: `sharepoint_not_connected`, `sharepoint_consent_required`, `sharepoint_conflict` (ETag 412), `sharepoint_throttled` (429), `sharepoint_quota_exceeded`, `sharepoint_unavailable`.

### 4.4 Estado reativo

Usar `onSnapshot` nas coleções `sharepointDocuments` e `sharepointSyncQueue/{...}` filtradas por `ownerUid`, exatamente como `docs/DATATEM_INTEGRATION.md:14` descreve para coleções operacionais. **Não** criar cache local, store do Redux ou persistência offline: o snapshot é a leitura autorizada da fonte oficial.

### 4.5 Deploy (modificação obrigatória em `firebase.json`)

Hoje `firebase.json:6-11` tem um único `functions.source`. Converter para array com `codebase` único por pacote:

```json
"functions": [
  {
    "source": "apis/reporting-functions",
    "codebase": "reporting",
    "predeploy": ["npm --prefix \"$RESOURCE_DIR\" run lint"]
  },
  {
    "source": "apis/sharepoint-functions",
    "codebase": "sharepoint",
    "ignore": ["__pycache__", ".venv", "*.pyc", "tests"]
  }
]
```

> **Flag de versão (MEDIUM, verificado em issue do firebase-tools):** `firebase-tools@15.15.0` teve regressão em deploy paralelo de múltiplos codebases (imagens de container misturadas; quando um codebase é Python e outro Node, erro `must use the same runtime as the source_token`). Corrigido em `15.16.0`; workaround é fixar `15.14.0` ou deploy sequencial por codebase. Fixar a versão no `package.json` raiz e documentar.

### 4.6 Padrão reaproveitado de credenciais

`apis/connectivity/fastapi_app/datatem/token_store.py:11` define `Protocol` + `MemoryTokenStore` + `FirestoreTokenStore` com seleção por config. **Reaplicar o conceito** (um `TokenStore` com `FirestoreTokenStore` criptografado) no novo codebase, mas **sem** o fallback `MemoryTokenStore` em produção — memória de processo não sobrevive a restart e violaria a retomada. O documento `datatemIntegration/session` (`INTEGRATIONS.md:42`) é a referência de caminho protegido; o equivalente SharePoint será `sharepointCredentials/{uid}` **cifrado**.

### 4.7 Matriz de fronteiras

| Fronteira | Comunicação | Observação |
|-----------|-------------|-----------|
| React ↔ Functions | HTTPS + Firebase ID token, JSON (upload usa stream binário) | `no-store` em todas as respostas; frontend usa `cache: 'no-store'` |
| React ↔ Firestore | `onSnapshot` somente leitura em coleções próprias | Escritas pelo frontend apenas onde as regras permitirem; estado de sync é somente leitura |
| Functions ↔ Firestore | Admin SDK, `@firestore.transactional` para claim/lease | Fonte de verdade; nenhum estado de worker em memória |
| Functions ↔ MSAL/Graph | Tokens delegados do usuário; `If-Match`, `Retry-After` | Nunca app-only (autoria) |
| Functions ↔ R2 | boto3 S3 API, `region_name="auto"` | Staging; apagar após confirmação do Graph |
| Functions ↔ Secret Manager | Chave AES + client secret no runtime | Nunca em `.env` do frontend nem no Firestore |

---

## 5. Firestore Schema — credenciais, metadados, fila, OAuth, auditoria e uso

**Convenção:** `ownerUid` = uid Firebase; `tenantId` = `request.auth.token.firebase.tenant` ou custom claim; `msAccountId` = `homeAccountId` do MSAL (presente só no backend); todos os `createdAt`/`updatedAt` usam `firestore.SERVER_TIMESTAMP`.

### 5.1 `sharepointSettings/{uid}` — configuração por usuário

```ts
{
  ownerUid: string,          // = uid (também é o ID do documento)
  tenantId: string,
  enabled: boolean,          // ativar/desativar integração
  connected: boolean,
  msAccountId?: string,      // backend-only, usado para localizar o account no cache
  displayName?: string,      // e-mail do usuário MS (informativo na UI)
  scopesGranted: string[],
  lastSyncAt?: Timestamp,
  lastError?: { code: string, at: Timestamp },
  createdAt: Timestamp, updatedAt: Timestamp
}
```

### 5.2 `sharepointCredentials/{uid}` — cache MSAL cifrado

```ts
{
  ownerUid: string,
  tenantId: string,
  ciphertext: string,        // base64(nonce[12] || AES-256-GCM(serialize()))
  keyVersion: number,        // rotação de chave no Secret Manager
  aad: string,               // uid — autenticado como Additional Authenticated Data
  algorithm: "AES-256-GCM",
  tokenExpiresAt?: Timestamp,
  updatedAt: Timestamp
}
```

> **Nunca** gravar access/refresh token em texto. O `nonce` é de 12 bytes, gerado por escrita (`os.urandom(12)`); reutilizar nonce com a mesma chave compromete o GCM. A chave de 32 bytes vem do Secret Manager; `client_secret` também. (MEDIUM, doc `cryptography` AESGCM + MSAL token cache serialization.)

### 5.3 `sharepointOAuthTransactions/{state}` — transação OAuth (PKCE)

```ts
{
  state: string,             // ID do documento = state aleatório (opaque)
  ownerUid: string,
  tenantId: string,
  codeChallenge: string,     // S256
  codeVerifier: string,      // cifrado com a mesma chave AES; nunca enviado ao browser
  nonce?: string,            // proteção OIDC contra replay
  redirectUri: string,
  status: "pending" | "consumed" | "expired" | "failed",
  createdAt: Timestamp, expiresAt: Timestamp,   // ~10 min; codes MS expiram ~1 min
  consumedAt?: Timestamp
}
```

O frontend recebe **apenas** `{ authUri, state }`. No callback, o backend valida `state`, troca o código via `acquire_token_by_auth_code_flow()` (que valida state **e** nonce automaticamente e lança `ValueError` em CSRF), grava o cache cifrado e marca a transação como `consumed` **em transação** — código é single-use, então a segunda tentativa falha de forma determinística.

### 5.4 `sharepointDocuments/{docId}` — metadados oficiais

```ts
{
  docId: string,             // determinístico: hash(ownerUid + driveId + itemId) → idempotência
  ownerUid: string, tenantId: string,
  siteId?: string, driveId: string, itemId?: string,
  name: string, mimeType: string, size: number,
  eTag?: string,             // ETag do Graph — base do If-Match
  status: "staging" | "queued" | "uploading" | "synced" | "conflict" | "failed",
  r2Key?: string,            // staging; preenchido enquanto pendente
  r2UploadId?: string,       // multipart UploadId, se aplicável
  graphUploadUrl?: string,   // upload session do Graph (renovável)
  graphUploadExpiresAt?: Timestamp,
  createdByMsId?: string,    // autoria delegada preservada
  createdAt: Timestamp, updatedAt: Timestamp
}
```

`docId` determinístico é o que torna o produtor idempotente: escrever o mesmo pending doc duas vezes é no-op.

### 5.5 `sharepointSyncQueue/{jobId}` — fila durável + state machine

```ts
{
  jobId: string,             // determinístico por operação (ex.: docId + op + revision)
  ownerUid: string, tenantId: string,
  docId: string,
  op: "upload" | "replace" | "delete" | "download_stage",
  status: "queued" | "leased" | "succeeded" | "failed" | "dead_letter",
  idempotencyKey: string,    // chave estável; operações repetidas são no-op
  attemptCount: number,
  backoffSeconds: number,    // exponencial com jitter, limitado por Retry-After se houver
  leaseEpoch: number,        // fencing: worker antigo não pode gravar após reclaim
  leaseOwner?: string,       // ID da invocação (não confiar nele para retomada)
  leaseExpiresAt?: Timestamp,
  nextAttemptAt: Timestamp,  // alimenta o índice de dispatch
  lastError?: { code: string, message: string },
  payloadRef: string,        // só referência ao docId — nunca dados/tokens no payload
  createdAt: Timestamp, updatedAt: Timestamp, completedAt?: Timestamp
}
```

**Transições legais:** `queued → leased → (succeeded | failed | dead_letter)`; `failed → queued` (backoff) enquanto `attemptCount < max`; `leased → queued` apenas se `leaseExpiresAt < now` (reclaim pelo reconciliador). Terminais: `succeeded`, `dead_letter`.

### 5.6 `sharepointAudit/{eventId}` — append-only

```ts
{
  eventId: string,
  ownerUid: string, tenantId: string,
  action: "connect" | "disconnect" | "upload" | "replace" | "delete" | "download" | "sync_retry" | "conflict",
  targetDocId?: string,
  actorUid: string,          // uid Firebase que executou
  actorMsId?: string,        // identidade Microsoft delegada (autoria)
  result: "ok" | "error",
  errorCode?: string,
  at: Timestamp              // SERVER_TIMESTAMP
}
```

Padrão idêntico ao `chipAssignmentHistory` (`simcard_store.py:116`): eventos **append-only**, nunca update/delete.

### 5.7 `sharepointUsage/{uid}/daily/{yyyy-mm-dd}` — quota

```ts
{
  ownerUid: string, tenantId: string, date: string,
  bytesUploaded: number, bytesDownloaded: number,
  operations: number, r2StagedBytes: number
}
```

Atualizado com `firestore.Increment()` dentro da transação de conclusão — evita contadores perdidos por retry. A quota é verificada **antes** de criar o job (falha rápida com `sharepoint_quota_exceeded`).

### 5.8 Índices compuestos (`firestore.indexes.json`)

| Coleção | Campos (ordem) | Finalidade |
|---------|----------------|-----------|
| `sharepointSyncQueue` | `status` ASC + `nextAttemptAt` ASC | dispatch de jobs prontos |
| `sharepointSyncQueue` | `status` ASC + `leaseExpiresAt` ASC | detecção de leases expirados (reconciler) |
| `sharepointSyncQueue` | `ownerUid` ASC + `status` ASC + `createdAt` DESC | UI de status por usuário |
| `sharepointDocuments` | `ownerUid` ASC + `updatedAt` DESC | listagem/UI |
| `sharepointAudit` | `ownerUid` ASC + `at` DESC | trilha por usuário |

### 5.9 Security rules (adição em `firestore.rules`)

Estender `datatemProtectedCollection()` para uma função genérica `protectedCollection()` e incluir as sete coleções:

```js
function sharepointProtectedCollection() {
  return request.path.size() >= 1
    && request.path[0] in [
      'sharepointSettings', 'sharepointCredentials', 'sharepointOAuthTransactions',
      'sharepointDocuments', 'sharepointSyncQueue', 'sharepointAudit', 'sharepointUsage'
    ];
}

match /sharepointSettings/{uid} {
  allow read: if signedIn() && request.auth.uid == uid;
  allow write: if false; // gravado somente pelo backend (Admin SDK)
}
match /sharepointDocuments/{docId} {
  allow read: if signedIn() && resource.data.ownerUid == request.auth.uid;
  allow write: if false;
}
match /sharepointCredentials/{uid},
      /sharepointOAuthTransactions/{id},
      /sharepointSyncQueue/{id},
      /sharepointAudit/{id},
      /sharepointUsage/{uid}/{rest=**} {
  allow read, write: if false; // backend-only; UI consome via endpoints/HTTPS
}
```

**Regras de ouro:** (1) `Credentials`, `OAuthTransactions`, `Audit`, `Usage` e `SyncQueue` são **backend-only** — o navegador nunca lê nem escreve; (2) `Documents`/`Settings` são somente leitura com checagem de `ownerUid`; (3) na atualização, se houvesse escrita pelo cliente, exigir `request.resource.data.ownerUid == resource.data.ownerUid` para impedir troca de propriedade; (4) usar a regra global `match /{document=**}` atual com cuidado — regras são OR-combinadas e um match recursivo amplo "ganha" sobre regras específicas (`ARCHITECTURE.md:219`, verificado na doc de insecure rules).

---

## 6. Architectural Patterns

### Pattern 1: `DocumentStorageService` — abstração de storage no frontend

**What:** interface única consumida por páginas/componentes; a implementação escolhe internamente Graph/R2, mas o componente só vê conceitos de domínio (site, biblioteca, pasta, arquivo, status).

**When to use:** sempre que um componente precisar listar, buscar, enviar, baixar ou substituir um documento.

**Trade-offs:** mais uma camada e tipos de domínio a manter; em troca, trocar R2 por SharePoint como destino final não mexe na UI.

```ts
// apps/web/src/core/services/DocumentStorageService.ts
export interface UploadTarget { siteId: string; driveId: string; folderId?: string; }
export interface UploadReceipt { docId: string; status: SyncStatus; }

export interface DocumentStorageService {
  listSites(): Promise<SharePointSite[]>;
  listDrives(siteId: string): Promise<SharePointDrive[]>;
  listItems(driveId: string, folderId?: string): Promise<SharePointItem[]>;
  search(query: string): Promise<SharePointItem[]>;
  upload(file: File, target: UploadTarget, onProgress?: (p: number) => void): Promise<UploadReceipt>;
  download(itemId: string): Promise<Blob>;
  replace(itemId: string, file: File): Promise<UploadReceipt>;
  getStatus(docId: string): Promise<SyncStatus>;
}
// Componentes recebem via useDocumentStorage() (contexto); nunca importam msal/graph/boto3.
```

### Pattern 2: Claim transacional com lease e fencing

**What:** o worker "aluga" um job dentro de uma transação Firestore. `leaseEpoch` impede que um worker antigo (cuja invocação ainda está viva) grave o resultado depois que outro recuperou o job.

**When to use:** todo processamento de `sharepointSyncQueue`.

**Trade-offs:** não é exactly-once; é at-least-once com recuperação — aceitável e observável. Exige que toda escrita terminal apresente o `leaseEpoch`.

```python
# apis/sharepoint-functions/sync/worker.py (esqueleto)
@firestore.transactional
def _claim_txn(tx, ref, now, lease_seconds, worker_id):
    snap = ref.get(transaction=tx)
    job = snap.to_dict() or {}
    if not snap.exists or job.get("status") in TERMINAL:
        return None
    if job.get("status") == "leased" and job.get("leaseExpiresAt", now) > now:
        return None                      # ainda possuído — sai limpo
    epoch = int(job.get("leaseEpoch", 0)) + 1
    tx.update(ref, {
        "status": "leased",
        "leaseOwner": worker_id,
        "leaseEpoch": epoch,
        "leaseExpiresAt": now + timedelta(seconds=lease_seconds),
        "attemptCount": firestore.Increment(1),
        "updatedAt": firestore.SERVER_TIMESTAMP,
    })
    return epoch
```

### Pattern 3: Idempotência + detecção de conflito por ETag

**What:** `docId` e `idempotencyKey` determinísticos tornam reenvios inofensivos; o Graph usa `If-Match: <eTag>` e responde `412 Precondition Failed` quando o item mudou.

**When to use:** upload, replace, delete. Graph `429` usa `Retry-After`; `5xx` usa backoff exponencial com jitter; `404` em upload session reinicia a sessão (`INTEGRATIONS`/doc Graphics — ver fontes).

**Trade-offs:** conflito vira estado explícito (`conflict`) na UI em vez de sobrescrever silenciosamente — é o "status honesto" exigido pelo milestone.

```python
# ao concluir: gravar estado terminal somente se leaseEpoch ainda vigora
@firestore.transactional
def _finish_txn(tx, ref, epoch, outcome):
    job = ref.get(transaction=tx).to_dict() or {}
    if job.get("leaseEpoch") != epoch or job.get("status") in TERMINAL:
        return False            # worker foi cercado (fenced) — não grava
    tx.update(ref, {"status": outcome, "completedAt": firestore.SERVER_TIMESTAMP})
    return True
```

### Pattern 4: Streaming puro — zero arquivos temporários

**What:** ler `request.stream()` e alimentar diretamente o cliente boto3; no download, fazer stream da resposta do Graph para a resposta HTTP.

**When to use:** **todo** upload/download. **Nunca** usar `UploadFile`/`multipart/form-data`: Starlette usa `SpooledTemporaryFile` com `max_size` de 1 MB e despeja em disco acima disso. Metadados (nome, tipo, destino) devem ir por headers/query, não por multipart.

**Trade-offs:** o cliente HTTP precisa expor uma interface file-like; example: adaptar `async for chunk in request.stream()` em um gerador síncrono para `boto3.put_object(Body=...)`/`upload_fileobj`.

```python
# upload para R2 em stages — sem gravar em disco
def iter_request_body(request):
    # adaptador assíncrono→síncrono executado em thread, emitindo chunks
    ...
s3.put_object(Bucket=..., Key=r2_key, Body=iter_request_body(request))
```

### Pattern 5: OAuth transacional + cache cifrado

**What:** `oauth_start` cria `sharepointOAuthTransactions/{state}` com `codeVerifier` cifrado e devolve só `authUri`+`state`; `oauth_callback` valida, troca o código, cifra o cache MSAL e marca a transação `consumed` na mesma transação.

**When to use:** conectar/reconectar conta Microsoft.

**Trade-offs:** state e PKCE no Firestore adicionam uma escrita por fluxo, mas sobrevivem a restarts de instância — essencial porque o callback pode cair em outra instância Gen2.

---

## 7. Data Flow — mudanças em relação ao existente

### 7.1 Conectar conta (novo)

```text
SettingsPage → useSharePoint.connect()
  → SharePointService.beginConnect()  [ID token]
  → https_fn oauth_start: gera state/PKCE/nonce, grava transação no Firestore,
    chama msal.initiate_auth_code_flow(scopes, redirect_uri, state)
  → devolve { authUri, state } → browser redireciona para o Entra ID
  ← callback POST redirect_uri?code=...&state=...
  → https_fn oauth_callback: valida state/PKCE/nonce,
    acquire_token_by_auth_code_flow → cache serializado → AES-256-GCM → Firestore,
    transação marcada consumed, sharepointSettings.connected = true
  → UI atualiza via onSnapshot; headers no-store
```

### 7.2 Upload com staging (novo — principal mudança de fluxo)

```text
FileBrowser → DocumentStorageService.upload(file, target)
  → SharePointService.uploadInit(metadata) → https_fn upload_init:
      verifica quota, cria docId determinístico + job na fila ( estado queued ),
      devolve { docId, uploadUrl }
  → streaming do navegador → https_fn uploadStream:
      request.stream() → R2 put_object/multipart (r2Key no doc)
  → worker (trigger onDocumentCreated no job):
      claim transacional (lease) → ler bytes do R2 em stream →
      Graph createUploadSession → PUT chunks (múltiplos de 320 KiB, ≤60 MiB) →
      If-Match com eTag salvo → 201/200 = confirmado
  → transação terminal: status synced, eTag atualizado, quota incrementada,
    audit append-only, objeto R2 apagado
  → UI recebe status via onSnapshot (staging → queued → uploading → synced)
```

**Se o Graph falhar:** `429` → backoff com `Retry-After`; `5xx` → backoff exponencial + jitter; `412` → estado `conflict` (não sobrescreve); `404` em upload session → recria sessão; esgotados os attempts → `dead_letter`, R2 **mantido** para não perder alteração ( limpeza só após confirmação ).

### 7.3 Download (novo)

```text
DocumentStorageService.download(itemId) → https_fn download:
  valida uid/tenant → MSAL acquire_token_silent (cache cifrado) →
  Graph GET /drives/{id}/items/{id}/content com stream →
  StreamingResponse direto ao navegador (Cache-Control: no-store)
```
Nenhum byte é persistido em R2 no download (R2 é somente staging de upload pendente).

### 7.4 Navegação/busca (novo)

`listSites/listDrives/listItems/search` chamam Graph com token delegado e devolvem DTOs; **não** gravam cache. `sharepointDocuments` guarda somente metadados de documentos que o usuário operou — não é espelho do drive inteiro.

### 7.5 Diferenças em relação ao fluxo DATATEM

| Aspecto | DATATEM (existente) | SharePoint (novo) |
|---------|--------------------|-------------------|
| Auth no backend | Rotas públicas (`require_firebase_user` não aplicado) | `Bearer <Firebase ID token>` obrigatório |
| Escrita | Direta via request HTTP | Assíncrona via fila + worker |
| Ator | `SYSTEM_ACTOR` fixo | uid Firebase + identidade MS delegada |
| Estado | `onSnapshot` em coleções operacionais | `onSnapshot` + status de sync honesto |
| Persistência | Firestore | Firestore (estado) + R2 (binário pendente) |

---

## 8. Onde o worker roda no Gen2 e como retoma após restarts

**Resposta direta:** o worker roda como **duas Cloud Functions Gen2 Python no mesmo codebase**, e **nenhuma depende de estado em memória**:

1. **Trigger de baixa latência** — `@firestore_fn.on_document_created(document="sharepointSyncQueue/{jobId}")` chama `claim_and_process()`. Faz o claim transacional e, se o job já estiver `leased`, sai sem fazer nada.
2. **Reconciliação durável** — `@scheduler_fn.on_schedule(schedule="every 1 minutes")` varre `status=leased AND leaseExpiresAt < now` (índice composto) e recoloca os jobs em `queued`, incrementando `leaseEpoch`. É este mecanismo — **não** o retry do trigger — que garante retomada após restart/crash/mastoide de instância.

**Por que os dois?** Triggers de Firestore são **at-least-once, sem ordenação garantida** e um evento pode gerar múltiplas invocações; o `retry` do Gen2 é desligado por padrão e tem janela limitada. Se só existisse o trigger, um crash após o claim deixaria o job preso em `leased` para sempre. O scheduler é a rede de segurança. (MEDIUM, documentação oficial Firebase + padrão de stale-lease recovery.)

**Sequência de retomada:**

```text
worker A faz claim (leaseEpoch=3, lease until T+150s)
  → instância morre antes de gravar o resultado
  → doc permanece leased com leaseEpoch=3
  → scheduler (T+150s+) detecta lease vencido → status=queued, leaseEpoch=4
  → trigger/dispara novo claim → worker B pega leaseEpoch=4
  → se A ainda estivesse vivo e tentasse gravar, _finish_txn compara epoch 3≠4 e descarta
  → worker B conclui → succeeded, R2 removido, audit gravado
```

**Configuração recomendada (`firebase_functions.options`):**

| Função | Timeout | Concorrência | Outros |
|--------|---------|--------------|--------|
| `oauth_*`, `browse`, `search`, `status` (HTTPS) | 60–120 s | padrão (80 se CPU ≥ 1) | `secrets=[...]`, `region` único, `no-store` |
| `uploadStream` (HTTPS) | até 3600 s (máx. HTTP Gen2) | 1 por instância (evitar interleaving) | streaming de request body |
| `onDocumentCreated` (evento) | **máx. 540 s** | 1 | `retry=False` (o scheduler é o recovery) |
| `on_schedule` (reconciler) | até 540 s | 1 | `schedule="every 1 minutes"`, region igual à dos triggers |

> O limite de 540 s para funções orientadas a evento é o que obriga o upload ao Graph a ser **resumável por chunks**: cada invocação processa um job com orçamento de tempo conhecido e retoma pelo `nextExpectedRanges` do upload session se exceder/for interrompido. Jobs muito grandes devem ser fatiados em múltiplos itens de fila, não executados num único evento longo.

**Regras adicionais de restart-safety:**

- O payload do job contém **só `docId`**; o worker relê o documento do Firestore — nenhum dado viaja no evento, evitando drift de schema (padrão de "Cloud Tasks + Firestore" verificado).
- `msal_client` recria o `ConfidentialClientApplication` a cada invocação a partir do cache cifrado no Firestore; nunca confia em cache em memória da instância.
- `r2_client` e `graph_client` são inicializados no handler (ou lazy singleton de processo) — se o processo morrer, nada é perdido porque o estado está no Firestore/R2.
- Ao reclamar, se o `r2Key` não existir mais no R2, marcar `dead_letter` com erro honesto — nunca reexibir versão antiga.
- Firestore transactions devem ser curtas; **não** fazer chamadas Graph/R2 dentro da transação — claim e finish são transacionais, o trabalho intermediate é fora.

---

## 9. Build Order (respeitando dependências)

| # | Fase | Entrega | Depende de | Racional / risco evitado |
|---|------|---------|-----------|--------------------------|
| 0 | **Contratos e terreno** | Tipos Zod em `shared/types/sharepoint`, converter em `firebase/converters`, coleções+índices+regras em `firestore.*`, `firebase.json` com 2 codebases, `.env.example` | — | Tudo depois depende do schema; definir `ownerUid` e ids determinísticos agora evita reescrita de fila/idempotência |
| 1 | **Segurança e segredos** | `auth.py` (verify_id_token), `crypto.py` (AES-256-GCM), `secrets.py`, `config.py`, erro tipado no service | 0 | Nenhum endpoint sai sem autenticação; sem isso, credenciais vazariam para o frontend |
| 2 | **OAuth + conexão** | `oauth.py`, `msal_client.py`, transação PKCE/state, seção conectar/desconectar em Settings, `SharePointContext` | 0,1 | Fecha o ciclo de credencial antes de qualquer operação Graph; valida retomada do callback em outra instância |
| 3 | **Leitura delegada + abstração** | `graph_client` (sites/drives/items/search), `DocumentStorageService`, `SharePointService`, `useSharePoint`, rota `/documents` | 0,1,2 | UI navega com permissões reais e já usa a abstração — trocar destino depois não mexe nos componentes |
| 4 | **Streaming R2** | `r2_client` (put/multipart/abort), `uploadInit`/`uploadStream`/`download`, zero `UploadFile`/multipart | 0,1,3 | Staging de binário funciona; flag do quality gate (sem disco temp) validada cedo |
| 5 | **Fila + worker + reconciliação** | `sync/state.py`, `sync/worker.py`, `sync/reconciler.py`, stores transacionais, índices de fila, ETag/If-Match, backoff | 0,1,3,4 | Núcleo de durabilidade; testar lease/fencing com mocks antes de ligar a UI de status |
| 6 | **Auditoria, quota e status honesto** | `audit_store`, `usage`, StatusBadge, estados `conflict`/`dead_letter` na UI, limpeza do R2 pós-confirmação | 5 | Fecha "nenhuma perda" e "status preciso" sem exponer dados antigos |
| 7 | **Testes, mocks e deploy** | mocks Graph/R2, pytest de transação/lease/idempotência, build/lint, docs de Azure app + R2 + secrets, fix `firebase-tools` | 1–6 | Entrega configurável sem credenciais reais, como exigido no `PROJECT.md:57` |

**Ordenação crítica:** schema (0) → segurança (1) → credencial (2) → leitura (3) → binário (4) → durabilidade (5) → observabilidade (6). Fazer a fila (5) antes do OAuth (2) geraria jobs impossíveis de executar; fazer o streaming (4) antes da abstração (3) tentaria a UI a conhecer R2.

**Research flags para fases posteriores:**
- Fase 2: validar config exata do app registration (redirect URI `form_post`, scopes `Files.ReadWrite`, `Sites.Read.All`) e comportamento de consent do tenant — depende de credenciais reais indisponíveis agora.
- Fase 5: validar limites práticos de timeout do upload session com arquivos grandes reais; ajustar fatiamento.
- Fase 7: fixar versão do `firebase-tools` e validar deploy multi-codebase no ambiente.

---

## 10. Anti-Patterns

### Anti-Pattern 1: `UploadFile`/multipart com spool em disco
**What:** usar `fastapi UploadFile` ou `request.form()` no endpoint de upload.
**Why bad:** `SpooledTemporaryFile` despeja acima de 1 MB no temp dir — viola a proibição de arquivos temporários e a restrição do milestone.
**Instead:** `request.stream()` → adaptador file-like → `boto3.put_object`/`upload_fileobj`; metadados por headers.

### Anti-Pattern 2: Importar código de `apis/connectivity` no codebase Python
**What:** `from apis.connectivity.fastapi_app.simcard_store import ...` dentro das Functions.
**Why bad:** codebases são pacotes de deploy distintos; o import não é empacotado e cria acoplamento entre runtime FastAPI/Render e Functions Gen2.
**Instead:** replicar o **padrão** (`@firestore.transactional`, `SERVER_TIMESTAMP`, histórico append-only) em `stores/*.py`.

### Anti-Pattern 3: Ator fixo / app-only no Graph
**What:** gravar `createdBy = "atlas-system"` ou usar client credentials flow do Graph.
**Why bad:** repete o erro de `SYSTEM_ACTOR` (`ARCHITECTURE.md:230`) e destrói a autoria delegada — requisito explícito do milestone.
**Instead:** `verify_id_token` → uid Firebase + `homeAccountId` MSAL → token delegado em toda chamada ao Graph.

### Anti-Pattern 4: Worker com estado em memória ou confiar em retry do trigger
**What:** manter `current_job` em variável global; assumir que o evento será reentregue após crash.
**Why bad:** instâncias Gen2 são efêmeras; eventos são at-least-once sem ordem e o retry é desligado por padrão.
**Instead:** estado no Firestore + lease com `leaseEpoch` + reconciliador agendado.

### Anti-Pattern 5: Token em texto no Firestore (copiar `datatemIntegration/session`)
**What:** reutilizar `FirestoreTokenStore` sem criptografia.
**Why bad:** `INTEGRATIONS.md:42` registra que os tokens DATATEM são plaintext; isso é inaceitável para credenciais Microsoft corporativas.
**Instead:** AES-256-GCM com nonce único e AAD = uid; chave no Secret Manager; rotação por `keyVersion`.

### Anti-Pattern 6: Regras Firestore amplas sobrescrevendo as específicas
**What:** manter `match /{document=**} { allow read: if signedIn() }` e acrescentar regras restritivas para `sharepointCredentials`.
**Why bad:** regras são OR-combinadas — a regra ampla libera tudo, incluindo credenciais.
**Instead:** excluir as coleções SharePoint da regra global via `!sharepointProtectedCollection()` e usar matches específicos `allow ...: if false`.

### Anti-Pattern 7: Componente React sabendo de R2/Graph
**What:** `FileBrowser.tsx` montando URL do R2 ou chamando Graph direto.
**Why bad:** quebra a abstração e espalha detalhes de implementação; trocar R2 pelo SharePoint final exigiria editar vários componentes.
**Instead:** tudo passa por `DocumentStorageService`.

### Anti-Pattern 8: Deploy multi-codebase sem fixar `firebase-tools`
**What:** `firebase deploy --only functions` com vários codebases em versão afetada pela regressão de imagens misturadas.
**Why bad:** functions Python podem receber container Node (ou vice-versa) e falhar healthcheck.
**Instead:** fixar versão corrigida (≥15.16.0) ou deploy sequencial por codebase; documentar no README.

---

## 11. Scaling Considerations

| Concern | ~100 usuários | ~10K usuários | ~1M usuários |
|---------|---------------|---------------|--------------|
| Leitura de status | `onSnapshot` direto em `sharepointDocuments`/`sharepointSyncQueue` filtrado por `ownerUid` | Mesmo padrão; índices compostos obrigatórios; limitar `limit()` nas queries | Avaliar fan-out: agregar status por usuário em `sharepointSettings.lastSyncAt` e reduzir listeners |
| Worker | 1 codebase, trigger + scheduler a cada minuto | Concurrency=1 por instância; `maxInstances` para conter cold starts; region única | Particionar fila por `tenantId`/hash e codebases/workers separados; Cloud Tasks para controle de vazão |
| Graph throttling | Backoff simples com `Retry-After` | `429` comum: respeitar header + jitter; `rateLimits` equivalentes via `maxDispatchesPerSecond` se migrar para task queue | Limitar requisições por usuário; considerar lotes e delta API |
| R2 staging | `put_object` simples para a maioria dos arquivos | Multipart acima de ~100 MB; `abort_multipart_upload` em falha; lifecycle de 7 dias para órfãos | Política de lifecycle customizada + limpeza ativa pelo reconciler |
| Firestore escritas | Transações por job | `Increment` contadores; escrita em batch para auditoria | Evitar hot documents de quota por tenant; shard de contadores |
| Custos (free tier) | Manter leituras de snapshot por usuário | Monitorar leituras; status via `onSnapshot` só quando a tela está aberta | Reavaliar modelo — o milestone prioriza durabilidade, não escala extrema |

**Primeiro gargalo real:** não é volume de dados, é **throttling do Graph + timeout de 540 s do trigger**. Por isso o desenho com upload resumável por chunks e reconciliação agendada vem antes de qualquer otimização de Firestore.

---

## 12. Integration Points — resumo (template)

### External Services

| Serviço | Padrão de integração | Gotchas |
|---------|----------------------|---------|
| Microsoft Entra ID | Auth Code + PKCE (S256) + state + nonce, confidencial no backend | Code ~1 min, single-use; `form_post` recomendado; callback em outra instância |
| Microsoft Graph v1.0 | Token delegado do usuário; `If-Match`/ETag; upload session; `Retry-After` | Sem app-only; sem `Authorization` no PUT da upload URL; range múltiplo de 320 KiB |
| Cloudflare R2 | boto3 S3 API, `region_name="auto"`, streaming + multipart | Orfãos abortados em 7 dias por padrão; `abort` explícito em falha |
| Secret Manager | Chave AES de 32 B + client secret lidos no runtime | Nunca em `VITE_*`, nunca no Firestore |
| Firebase Auth/Admin | `verify_id_token` no header `Authorization` | `check_revoked=True` custa uma chamada extra |
| Firestore | Admin SDK + `@firestore.transactional` | Transação curta; sem chamadas externas dentro dela |

### Internal Boundaries

| Fronteira | Comunicação | Consideração |
|-----------|-------------|--------------|
| `SettingsPage`/`DocumentsPage` ↔ `useSharePoint` | Context + hooks | Estado de UI; sem cache |
| `useSharePoint` ↔ `SharePointService` | fetch com ID token + `AbortController` | Erro tipado e `FRIENDLY_MESSAGES` |
| `SharePointService` ↔ `DocumentStorageService` | implementa a interface | Componentes dependem só da interface |
| Functions ↔ `stores/*` | Firestore transacional | `ownerUid`/`tenantId` em todo documento |
| `worker` ↔ `reconciler` | compartilham `claim()` e `_finish_txn()` | Reconciler é a rede de segurança pós-restart |
| `firebase.json` ↔ codebases | array com `codebase` único | `reporting` (Node) + `sharepoint` (Python) |

---

## 13. Sources

Todas as fontes externas foram obtidas via WebSearch com cross-check entre múltiplos resultados; confiança atribuída pelo seam (`websearch --verified` = MEDIUM). Arquivos internos foram lidos diretamente (HIGH).

- [Microsoft identity platform — OAuth 2.0 auth code flow (PKCE, state, nonce)](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow) — MEDIUM
- [MSAL Python — token cache serialization](https://learn.microsoft.com/en-us/entra/msal/python/advanced/msal-python-token-cache-serialization) e [MSAL Python stable docs](https://msal-python.readthedocs.io/en/stable/) — MEDIUM
- [MSAL Django sample — auth_helper.py (initiate/acquire/serialize)](https://github.com/microsoftgraph/msgraph-sample-pythondjangoapp/blob/main/graph_tutorial/tutorial/auth_helper.py) — MEDIUM
- [Microsoft Graph — createUploadSession](https://learn.microsoft.com/en-us/graph/api/driveitem-createuploadsession?view=graph-rest-1.0) e [Graph errors (412/429/409)](https://learn.microsoft.com/en-us/graph/errors) — MEDIUM
- [Microsoft Graph — permissions overview (delegated vs application)](https://learn.microsoft.com/en-us/graph/permissions-overview) e [best practices](https://learn.microsoft.com/en-us/graph/best-practices-concept) — MEDIUM
- [Firebase — Firestore triggers 2nd gen (at-least-once, no ordering)](https://firebase.google.com/docs/firestore/extend-with-functions-2nd-gen) — MEDIUM
- [Firebase — Python `firebase_functions.options` (timeout, min_instances, concurrency, retry)](https://firebase.google.com/docs/reference/functions/2nd-gen/python/firebase_functions.options) — MEDIUM
- [Firebase — `scheduler_fn.on_schedule`](https://firebase.google.com/docs/reference/functions/2nd-gen/python/firebase_functions.scheduler_fn) — MEDIUM
- [Firebase — organize functions in codebases (monorepo, Python + Node)](https://firebase.google.com/docs/functions/organize-functions) — MEDIUM
- [firebase-tools #10402 — regressão multi-codebase 15.15.0, fix 15.16.0](https://github.com/firebase/firebase-tools/issues/10402) — MEDIUM
- [Cloudflare R2 — upload objects / multipart / incomplete lifecycle](https://developers.cloudflare.com/r2/objects/upload-objects/) e [boto3](https://developers.cloudflare.com/r2/examples/aws/boto3/) — MEDIUM
- [FastAPI — Request Files (SpooledTemporaryFile)](https://fastapi.tiangolo.com/tutorial/request-files/) e [Starlette — request.stream()](https://www.starlette.io/requests/) — MEDIUM
- [Firebase Admin SDK Python — `verify_id_token`](https://firebase.google.com/docs/reference/admin/python/firebase_admin.auth) e [Verify ID tokens](https://firebase.google.com/docs/auth/admin/verify-id-tokens) — MEDIUM
- [Firebase — Firestore security rules conditions / insecure rules / rules-and-auth](https://firebase.google.com/docs/firestore/security/rules-conditions) — MEDIUM
- [cryptography — AESGCM](https://cryptography.io/en/latest/hazmat/primitives/aead/) — MEDIUM
- [Padrão de stale-lease recovery + claim transacional (Medium/Google Cloud)](https://medium.com/google-cloud/how-i-built-stale-lease-recovery-for-async-gemini-jobs-on-cloud-run-1a55df3f82e3) e [Cloud Tasks + Firestore durable queue](https://devguide.dev/blog/cloud-tasks-firestore-durable-queue) — MEDIUM (padrão, não fonte normativa)

**Fontes internas (HIGH):** `.planning/PROJECT.md`, `.planning/codebase/ARCHITECTURE.md`, `.planning/codebase/STRUCTURE.md`, `.planning/codebase/INTEGRATIONS.md`, `firebase.json`, `firestore.rules`, `firestore.indexes.json`, `apps/web/src/services/DatatemService.ts`, `apps/web/src/pages/SettingsPage.tsx`.

**Gaps (LOW / a validar):** config exata do app registration Azure e scopes; limites reais de timeout por tamanho de arquivo; versão mínima estável do `firebase-tools` no ambiente de deploy. Dependem de credenciais/ambiente não disponíveis neste milestone.

---
*Architecture research for: integração nativa Microsoft SharePoint no Atlas v2.0*
*Researched: 2026-11-17*
