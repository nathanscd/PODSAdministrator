<!-- refreshed: 2026-11-17 -->
# Architecture

**Analysis Date:** 2026-11-17

## System Overview

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                 FRONTEND SPA — React 19 + Vite 7 (apps/web)                 │
│  main.tsx → AuthProvider → AtlasAuthProvider → PlatformProvider → App      │
│  App.tsx → LangProvider → ToastProvider → BrowserRouter → AppRoutes        │
│  pages/ · components/ · layouts/ · contexts/ · hooks/ · modules/           │
│  services/ (HTTP) · repositories/ + core/repositories/ (Firestore)         │
└───────────┬──────────────────────────────┬──────────────────────────────────┘
            │ fetch (VITE_*_API_URL)       │ firebase JS SDK (db, auth)
            ▼                              ▼
┌───────────────────────────┐   ┌────────────────────────────────────────────┐
│  API / BACKEND BOUNDARY   │   │  FIREBASE PLATFORM                          │
│  apis/connectivity/       │   │  Firebase Auth (sessão do navegador)        │
│   FastAPI (Python 3.12)   │   │  Firestore (estado operacional + auditoria) │
│   /api/datatem/*          │──▶│  Firebase Hosting (apps/web/dist)           │
│  apis/research-etl/       │   │  Cloud Functions (apis/reporting-functions) │
│   Express (Node, Render)  │   │  firestore.rules · firestore.indexes.json   │
│  apis/reporting-functions/│   └────────────────────────────────────────────┘
│   firebase-functions v2   │
└───────────┬───────────────┘
            │ Firebase Admin SDK (service account) + HTTP externo
            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  EXTERNAL: DATATEM API (somente leitura) · DuckDuckGo HTML · GROQ LLM       │
└─────────────────────────────────────────────────────────────────────────────┘
```

O repositório é um **monorepo npm** (`package.json` na raiz, workspaces `apps/web`, `firebase`, `shared`) com APIs isoladas por responsabilidade em `apis/`. O navegador nunca recebe segredos: credenciais DATATEM/GROQ/Firebase Admin ficam apenas no backend (`apis/README.md:11`).

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Bootstrap React | Monta providers de autenticação e plataforma | `apps/web/src/main.tsx` |
| Shell da aplicação | Providers de i18n/toast, smooth-scroll, roteador | `apps/web/src/App.tsx` |
| Roteamento | Rotas públicas vs. privadas, lazy loading, rotas dinâmicas de módulos | `apps/web/src/routes/index.tsx` |
| Guard de rota | Redireciona para `/login` quando não autenticado | `apps/web/src/components/PrivateRoute.tsx` |
| Shell visual | Sidebar + Header + `<Outlet />` | `apps/web/src/components/Layout.tsx` |
| Sessão de usuário | `onAuthStateChanged`, perfil Firestore, empresa/workspaces/departamentos/times | `apps/web/src/contexts/AuthContext.tsx` |
| Adaptador de auth "Atlas" | Reexporta o contexto legado com nome novo (ponto de migração) | `apps/web/src/core/providers/AuthProvider.tsx` |
| Registro de plataforma | Estado de workspace, módulos e blueprints de página | `apps/web/src/core/providers/PlatformProvider.tsx` |
| Clientes HTTP | Tradução de erros das APIs para mensagens amigáveis | `apps/web/src/services/DatatemService.ts`, `apps/web/src/hooks/useETLResearch.ts` |
| Acesso a dados (web) | CRUD Firestore genérico e específico por domínio | `apps/web/src/repositories/BaseRepository.ts`, `apps/web/src/repositories/AuthRepository.ts`, `apps/web/src/core/repositories/*.ts` |
| Contratos compartilhados | Tipos e schemas Zod consumidos por web e pacotes | `shared/types/index.ts`, `shared/schemas/index.ts` |
| Conversores Firestore | Valida Zod e normaliza `Timestamp`/defaults ao (des)serializar | `firebase/converters/index.ts` |
| API de conectividade | Inventário DATATEM, SIMs manuais, atribuição e auditoria | `apis/connectivity/fastapi_app/routes_datatem.py` |
| Store operacional | Transações Firestore para atribuição/histórico/inventário | `apis/connectivity/fastapi_app/simcard_store.py` |
| Cliente DATATEM | Login, paginação, normalização e conexões (read-only) | `apis/connectivity/fastapi_app/datatem/client.py`, `apis/connectivity/fastapi_app/datatem/normalize.py` |
| API Research/ETL | Web search + enriquecimento via GROQ | `apis/research-etl/src/server.js` |
| Função de relatório | Endpoint HTTP de geração de PDF (stub) | `apis/reporting-functions/index.js` |
| Configuração de deploy | Hosting + Functions + rewrites SPA | `firebase.json` |

## Pattern Overview

**Overall:** Monorepo federado com SPA em camadas + plugin/registry "Atlas" + três backends independentes que compartilham Firestore como fonte de verdade operacional.

**Key Characteristics:**
- **Frontend em camadas:** `pages`/`components` → `contexts`/`hooks` → `services` → `repositories` → `firebase.ts`. Hooks consomem diretamente o SDK do Firebase em alguns domínios (`apps/web/src/hooks/usePages.ts:61`) e services HTTP em outros (`apps/web/src/hooks/useSimcardInventory.ts:57`).
- **Registro/plugin:** `moduleRegistry` e `widgetRegistry` são `Map` module-level com `register/get/list`; `PlatformProvider` hidrata o contexto a partir deles (`apps/web/src/core/registry/moduleRegistry.ts:3`, `apps/web/src/core/providers/PlatformProvider.tsx:25`).
- **Separação de responsabilidades por API:** cada backend tem runtime, deploy e credenciais próprios (`apis/README.md:5`).
- **Firestore como fonte de verdade:** escritas operacionais passam pelo backend e são protegidas por `firestore.rules:9`; o navegador lê coleções operacionais via `onSnapshot`.
- **Read-only externo:** integrações de terceiros (DATATEM) nunca recebem escrita; todo estado persistido é local (`docs/DATATEM_INTEGRATION.md:12`).

## Layers

**Apresentação (frontend):**
- Purpose: UI, navegação e composição de telas.
- Location: `apps/web/src/pages/`, `apps/web/src/components/`, `apps/web/src/layouts/`, `apps/web/src/routes/index.tsx`
- Contains: páginas lazy-loaded, componentes de domínio (`components/SimCards/`, `components/Testbook/`, `components/Todo/`), biblioteca `components/ui/` (shadcn/@base-ui), `{Sidebar,Header,Layout}`.
- Depends on: contexts, hooks, servicios, tipos de `shared`.
- Used by: roteador e providers.

**Estado e contexto (frontend):**
- Purpose: sessão, idioma, toast, plataforma e estado de domínio reativo.
- Location: `apps/web/src/contexts/`, `apps/web/src/core/providers/`, `apps/web/src/hooks/`
- Contains: `AuthContext` (sessão real), `AtlasAuthProvider` (adaptador), `PlatformProvider`, `LangContext`, `ToastContext`, hooks de domínio (`useTestbook.ts`, `useWorkspace.ts`, `useSimcardInventory.ts`).
- Depends on: `services/`, `repositories/`, Firebase SDK.
- Used by: páginas e componentes.

**Serviços e acesso a dados (frontend):**
- Purpose: isolar chamadas HTTP e persistência Firestore.
- Location: `apps/web/src/services/`, `apps/web/src/repositories/`, `apps/web/src/core/services/`, `apps/web/src/core/repositories/`
- Contains: `DatatemService.ts` (fetch + `DatatemApiError`), `AuthService.ts`, `firebaseService.ts`, `BaseRepository` (duas implementações), `PageRepository`, `WorkspaceRepository`.
- Depends on: `apps/web/src/firebase.ts`, `shared/types`.
- Used by: hooks, contexts e `PlatformService`.

**Pacotes compartilhados (workspaces):**
- Purpose: contratos de dados reutilizáveis e conversores Firestore.
- Location: `shared/types/`, `shared/schemas/`, `firebase/converters/`, `firebase/repositories/`
- Contains: interfaces de domínio (auth, page, crm, testbook, workspace, widget, ...), schemas Zod, `userConverter`/`testbookConverter`/etc., `AuthRepository` com `withConverter`.
- Depends on: `zod`, `firebase` (somente pacote `firebase/`).
- Used by: web, APIs Node e funções (via imports de workspace).

**API / backend:**
- Purpose: integrações externas, trabalho protegido e operações transacionais.
- Location: `apis/connectivity/fastapi_app/`, `apis/research-etl/src/`, `apis/reporting-functions/`
- Contains: rotas FastAPI, `SimcardStore`, `FirestoreTokenStore`, cliente DATATEM, proxy Express, Cloud Function.
- Depends on: Firebase Admin SDK, credenciais de ambiente, CSVs em `fastapi_app/processed/`.
- Used by: frontend via URLs públicas (`VITE_DATATEM_API_URL`, `VITE_ETL_API_URL`).

**Persistência:**
- Purpose: estado operacional, auditoria e cache de integração.
- Location: Firestore (projeto `podsadministrator`, ver `.firebaserc`); cache local somente leitura em `apis/connectivity/fastapi_app/loader.py`.
- Coleções-chave: `users`, `companies`, `workspaces`, `departments`, `teams`, `pages`, `testbooks`, `modules`, `chipAssignments`, `chipAssignmentHistory`, `manualSimcards`, `datatemInventory`, `datatemSyncState`, `datatemIntegration/session`, `chips` (legado).
- Rules: `firestore.rules:21`; índice composto: `firestore.indexes.json:4`.

> **Seams para a integração SharePoint (extend, não duplicar):** autenticação/sessão em `apps/web/src/contexts/AuthContext.tsx` + `apps/web/src/services/AuthService.ts`; estado e credenciais no Firestore via `apis/connectivity/fastapi_app/simcard_store.py` e `apis/connectivity/fastapi_app/datatem/token_store.py`; service layer HTTP em `apps/web/src/services/DatatemService.ts`; UI de configuração em `apps/web/src/pages/SettingsPage.tsx` e `apps/web/src/components/SettingsModal.tsx`; API layer em `apis/connectivity/fastapi_app/routes_datatem.py`; trabalhos de sincronização em `apis/connectivity/fastapi_app/routes_datatem.py:87` (`_load_inventory`) e novos workers devem seguir o padrão de `asyncio.to_thread` + transação Firestore de `SimcardStore`.

## Data Flow

### Primary Request Path

1. `apps/web/src/main.tsx:9` monta `AuthProvider` → `AtlasAuthProvider` → `PlatformProvider`.
2. `apps/web/src/contexts/AuthContext.tsx:43` registra `onAuthStateChanged(auth, ...)`.
3. Com `firebaseUser`, `apps/web/src/services/AuthService.ts:13` chama `getOrCreateUserProfile` → `AuthRepository.getUser/saveUser` (`apps/web/src/repositories/AuthRepository.ts:6`).
4. O perfil `TenantUser` (`shared/types/auth/index.ts:36`) dispara carregamento de `companies`, `workspaces`, `departments` e `teams` (`apps/web/src/contexts/AuthContext.tsx:49`).
5. `apps/web/src/App.tsx:22` instala `BrowserRouter`; `apps/web/src/routes/index.tsx:55` aplica `PrivateRoute` antes do `Layout`.
6. `apps/web/src/components/PrivateRoute.tsx:98` libera `<Outlet />` ou redireciona para `/login`.

### Fluxo de inventário e atribuição de chips (DATATEM)

1. `apps/web/src/hooks/useSimcardInventory.ts:57` chama `datatemApi.bootstrap()` com `AbortController` e retry ([600, 1200, 2400] ms).
2. `apps/web/src/services/DatatemService.ts:81` faz `fetch` para `${VITE_DATATEM_API_URL}/api/datatem/bootstrap` (sem header de autenticação).
3. `apis/connectivity/fastapi_app/routes_datatem.py:204` executa `_load_inventory`: lê `datatemInventory` no Firestore; se vazio/forçado, chama `DatatemClient.list_simcards()` e faz `replace_inventory` em batches de 450 (`simcard_store.py:278`).
4. O mesmo endpoint cruza atribuições (`chipAssignments`), SIMs manuais (`manualSimcards`), conectividade e reconciliação legada (`chips`) em uma única resposta `BootstrapPayload` (`routes_datatem.py:239`).
5. Escritas (`assign`, `release`, `update_metadata`, CRUD manual) usam `firestore.transactional` em `SimcardStore` (`simcard_store.py:183`) e emitem eventos append-only em `chipAssignmentHistory` (`simcard_store.py:116`).
6. A UI acompanha mudanças com `onSnapshot` nas coleções operacionais (`docs/DATATEM_INTEGRATION.md:14`).

### Fluxo Research/ETL

1. `apps/web/src/hooks/useETLResearch.ts:6` resolve `VITE_ETL_API_URL`, faz health-check/"wake" do serviço Render e chama `POST /api/research`.
2. `apis/research-etl/src/server.js:77` faz 3 buscas DuckDuckGo em paralelo, concatena o contexto e chama GROQ (`server.js:46`) com `GROQ_API_KEY` apenas no servidor.
3. Resposta `{ text }` volta ao hook e alimenta o estado do relatório.

### Fluxo de relatório PDF

1. `apps/web/src/components/Report/ReportPDF.tsx` / `TestbookPDF.tsx` geram HTML no cliente (`@react-pdf/renderer`, `html2canvas`).
2. `apis/reporting-functions/index.js:5` expõe `generateReportPDF` (onRequest) — atualmente um stub que devolve texto (`index.js:14`); `puppeteer-core` está declarado em `apis/reporting-functions/package.json:18`.

**State Management:**
- Sessão e tenant: `AuthContext` (React Context) com derivações `isAdmin`, `language`, `userGroup`.
- Plataforma: `PlatformProvider` com `workspace`, `modules`, `pageBlueprints` em `useState`.
- Domínio: hooks com `useState` + `useEffect`/`onSnapshot` (Firestore) ou `fetch` com `AbortController` (HTTP).
- Globais de backend: singletons de cliente e DB (`routes_datatem.py:31`, `firebase_client.py:13`), um `_legacy_migration_done` por processo (`routes_datatem.py:32`).

## Key Abstractions

**BaseRepository (duas variantes):**
- Purpose: CRUD Firestore com `serverTimestamp()` e soft delete (`apps/web/src/repositories/BaseRepository.ts:16`) e CRUD de documentos "plataforma" com `merge` (`apps/web/src/core/repositories/BaseRepository.ts:8`).
- Examples: `apps/web/src/repositories/BaseRepository.ts`, `apps/web/src/core/repositories/BaseRepository.ts`, `apps/web/src/core/repositories/pageRepository.ts`, `apps/web/src/core/services/firebaseService.ts`
- Pattern: classe abstrata + especialização por coleção; `PlatformService` (`apps/web/src/core/services/platformService.ts:6`) faz a fachada e mapeia legado→Atlas (`apps/web/src/core/types/compat.ts`).

**Registries de plataforma ("Atlas"):**
- Purpose: desacoplar módulos e widgets do núcleo via registro por chave/tipo.
- Examples: `apps/web/src/core/registry/moduleRegistry.ts`, `apps/web/src/core/registry/widgetRegistry.ts`, `apps/web/src/core/engine/pageEngine.tsx`
- Pattern: `Map` + `register/get/list`; `widgetRegistry.createWidget` (`widgetRegistry.ts:16`) e `buildPageModel` (`pageEngine.tsx:5`) aplicam defaults; `getVisibleWidgets` (`pageEngine.tsx:28`) implementa visibilidade por papel.

**SimcardStore / transação operacional:**
- Purpose: garantir uma atribuição ativa por chip, histórico auditável e consistência transacional.
- Examples: `apis/connectivity/fastapi_app/simcard_store.py:179`, `:456` (`assign`), `:514` (`release`)
- Pattern: `_run_transaction` converte `Aborted` em `AssignmentConflictError` → HTTP 409; document ID = `simcard.id`; `firestore.SERVER_TIMESTAMP` para auditoria; ator responsável propagado em `responsible`/`assignedBy`/`updatedBy`.

**TokenStore (Protocol):**
- Purpose: isolar onde sessões de integração são persistidas (memória ou Firestore).
- Examples: `apis/connectivity/fastapi_app/datatem/token_store.py:11`
- Pattern: `Protocol` + `MemoryTokenStore` + `FirestoreTokenStore`, selecionável por config (`DATATEM_TOKEN_COLLECTION`/`DATATEM_TOKEN_DOCUMENT` → `datatemIntegration/session`). **Ponto de extensão natural** para credenciais delegadas/token state da integração Microsoft.

**Settings e configuração por ambiente:**
- Purpose: centralizar parâmetros por ambiente.
- Examples: `apis/connectivity/fastapi_app/config.py:55` (`BackendSettings`), `apis/connectivity/fastapi_app/datatem/config.py:12` (`DatatemSettings`), `apps/web/src/vite-env.d.ts`, `apps/web/src/pages/SettingsPage.tsx`
- Pattern: dataclasses frozen com `from_env()` no backend; `import.meta.env` no frontend; UI de preferências do usuário em `SettingsPage` e `components/SettingsModal.tsx`.

**Validators e schemas:**
- Purpose: validar fronteiras de dados.
- Examples: `shared/schemas/index.ts`, `firebase/converters/index.ts:31`, `apps/web/src/core/validation/platformValidators.ts`
- Pattern: Zod `.parse()` em `toFirestore` antes de gravar; `validatePage`/`validateWorkspace` antes de `platformService`.

## Entry Points

**Frontend:**
- Location: `apps/web/src/main.tsx` → `apps/web/src/App.tsx` → `apps/web/src/routes/index.tsx`
- Triggers: `vite dev` / build estático servido por Firebase Hosting (`firebase.json:12`).
- Responsibilities: montar providers, aplicar guard de autenticação, resolver rotas lazy e rotas fornecidas por módulos (`routes/index.tsx:80`).

**Connectivity API:**
- Location: `apis/connectivity/fastapi_app/main.py:27` (`app = FastAPI(..., lifespan=lifespan)`)
- Triggers: `uvicorn fastapi_app.main:app` (local/Render, ver `apis/connectivity/render.yaml:9`).
- Responsibilities: inicializar Firebase Admin e cliente DATATEM no startup (`main.py:12`), incluir router `/api` (`main.py:37`), expor datasets/indicadores.

**Research/ETL API:**
- Location: `apis/research-etl/src/server.js:119`
- Triggers: `node src/server.js` no Render (`apis/research-etl/render.yaml`).
- Responsibilities: expor `/health`, `/api/research`, `/api/claude`.

**Reporting Functions:**
- Location: `apis/reporting-functions/index.js:5`
- Triggers: Firebase CLI (`firebase.json:6`, script `api:reporting:deploy`).
- Responsibilities: endpoint `generateReportPDF`.

**Scripts de manutenção:**
- Location: `scripts/seedTestbooks.ts`, `scripts/migrateModuleContents.ts`
- Triggers: execução manual via runner TypeScript.
- Responsibilities: seed/migração de conteúdo Firestore.

## Architectural Constraints

- **Threading:** FastAPI é assíncrono, mas o SDK Firestore é síncrono — toda chamada é envolvida em `asyncio.to_thread(...)` (`apis/connectivity/fastapi_app/routes_datatem.py:91`, `simcard_store.py` via rotas). Não há workers/queued jobs dedicados; sincronização é disparada por request HTTP.
- **Global state:** `cache = load_all()` em `main.py:39`; `_client`/`_legacy_migration_done` em `routes_datatem.py:31`; `_db`/`_initialized` em `firebase_client.py:13`; registries de módulos/widgets e o `Map` interno; `AuthContext` e `PlatformProvider` mantêm estado em memória.
- **Circular imports:** nenhum ciclo detectado. Existem, porém, três camadas de repositório paralelas (`apps/web/src/repositories/`, `apps/web/src/core/repositories/`, `firebase/repositories/`) que se sobrepõem conceitualmente.
- **Autenticação das rotas DATATEM:** `require_firebase_user` está implementado em `apis/connectivity/fastapi_app/firebase_client.py:82`, mas **não é aplicado** como dependency em `routes_datatem.py`; as rotas `/api/datatem/*` são públicas por design (login DATATEM estático no backend, `docs/DATATEM_INTEGRATION.md:5`).
- **Configuração do Firebase web:** `apps/web/src/firebase.ts:5` embute o objeto `firebaseConfig` no código (valores públicos de web config, não segredos). Backend usa service account por env (`FIREBASE_SERVICE_ACCOUNT_JSON` / `GOOGLE_APPLICATION_CREDENTIALS`, `firebase_client.py:37`).
- **Regras Firestore:** escritas do navegador são bloqueadas nas coleções operacionais (`firestore.rules:9-25`); leitura exige `request.auth != null`. Qualquer nova coleção de credenciais/estado de sync deve ser adicionada à lista protegida.
- **CORS:** origens permitidas em `BackendSettings.cors_allowed_origins` (`config.py:63`) — incluir o domínio de deploy ao integrar novos callbacks OAuth.

## Anti-Patterns

### Camadas de acesso a dados duplicadas

**What happens:** Existem `apps/web/src/repositories/AuthRepository.ts`, `apps/web/src/core/repositories/BaseRepository.ts` e `firebase/repositories/AuthRepository.ts` implementando responsabilidades semelhantes, além de hooks que acessam `db` diretamente (`apps/web/src/hooks/usePages.ts:7`).
**Why it's wrong:** Regras de conversão de datas, defaults e tratamento de ausência divergem entre camadas; mudanças de schema exigem editar vários lugares.
**Do this instead:** Consolidar novos domínios em um único caminho — service HTTP ou `BaseRepository` + converter em `firebase/converters/index.ts` — e expor ao restante da UI somente via hooks (`apps/web/src/hooks/`).

### Autoria de escrita substituída por ator fixo

**What happens:** Todas as mutações de chips usam `SYSTEM_ACTOR` (`uid="datatem-integration"`) definido em `apis/connectivity/fastapi_app/routes_datatem.py:33` e retornado por `_actor()` (`:180`), mesmo quando `require_firebase_user` poderia fornecer o usuário.
**Why it's wrong:** `responsible`, `assignedBy` e `updatedBy` em `build_assignment_document` (`simcard_store.py:93`) não refletem quem executou a ação; auditoria e "preserved user authorship" ficam comprometidos.
**Do this instead:** Passar o `AuthenticatedUser` autenticado como `ResponsibleActor` para `SimcardStore`, mantendo o ator fixo apenas para reconciliação legada.

### Registro de módulos sem efeito

**What happens:** `apps/web/src/modules/index.ts` contém apenas `export {}` e `modules/*/index.ts` exportam constantes que não são registradas em `moduleRegistry`; `PlatformProvider` importa `../../modules` apenas pelo efeito de side-effect (`PlatformProvider.tsx:2`).
**Why it's wrong:** As rotas dinâmicas em `routes/index.tsx:80` derivam somente dos `defaultModules` (`moduleRegistry.ts:18`), então módulos novos não aparecem.
**Do this instead:** registrar explicitamente cada módulo em `apps/web/src/modules/index.ts` via `moduleRegistry.register(...)`.

## Error Handling

**Strategy:** Tradução em camadas — erro de domínio no backend → HTTP com `detail` estruturado → erro tipado no service → mensagem amigável na UI.

**Patterns:**
- Backend: `DatatemError`/`AssignmentConflictError` → `HTTPException` com `{"code", "message"}` (`apis/connectivity/fastapi_app/routes_datatem.py:64`, conflito 409 em `:320`).
- Backend: startup tolera falha de inicialização do cliente (`main.py:17-24` usa `except Exception: pass`).
- Frontend: `DatatemApiError` com `code`/`status` e mapa `FRIENDLY_MESSAGES` (`apps/web/src/services/DatatemService.ts:14`, `:30`), `friendlyMessage()` para fallback.
- Frontend: retry apenas em `status >= 500` ou `network_unavailable`, com abort/generation guard (`apps/web/src/hooks/useSimcardInventory.ts:64`).
- Validação: `schema.parse` lança `ZodError` antes de gravar no Firestore (`firebase/converters/index.ts:33`).

## Cross-Cutting Concerns

**Logging:** `console.error` em contexts/hooks (`apps/web/src/contexts/AuthContext.tsx:68`), `console.log` no ETL (`apis/research-etl/src/server.js:85`), `console.error` nas Functions (`apis/reporting-functions/index.js:16`); registro estruturado de operações no Firestore (`apps/web/src/utils/systemLogger.ts`, `chipAssignmentHistory`).

**Validation:** Zod em `shared/schemas/index.ts` + `firebase/converters/index.ts`; Pydantic models em `apis/connectivity/fastapi_app/datatem/models.py`; validadores de plataforma em `apps/web/src/core/validation/platformValidators.ts`.

**Authentication:** Firebase Auth no navegador (`apps/web/src/firebase.ts:17` → `AuthContext`); Firebase Admin com `verify_id_token` disponível no backend (`firebase_client.py:82`) porém não exigido nas rotas DATATEM; helpers `require_firebase_user` e `require_write_permission` (`firebase_client.py:113`) prontos para reforçar endpoints protegidos. Para uma integração delegada (MSAL/Graph), o estado OAuth e as credenciais devem ser gravados no Firestore pelo backend e protegidos nas `firestore.rules`, seguindo `datatemIntegration/session` como referência.

---

*Architecture analysis: 2026-11-17*
