# External Integrations

**Analysis Date:** 2026-11-17

## APIs & External Services

**[Firebase — Auth e Firestore]:**
- SDK web `firebase` `^12.7.0`; inicialização em `apps/web/src/firebase.ts` (`initializeApp`, `getFirestore`, `getAuth`), projeto `podsadministrator`
- Admin SDK Node `firebase-admin` `^11.8.0` em `apis/reporting-functions/index.js`; Admin SDK Python `>=6.4,<7` em `apis/connectivity/fastapi_app/firebase_client.py`
- Auth: e-mail/senha; fluxos em `apps/web/src/pages/Auth/LoginPage.tsx`, `RegisterPage.tsx`, `ForgotPasswordPage.tsx`, serviço em `apps/web/src/services/AuthService.ts`, repositório em `apps/web/src/repositories/AuthRepository.ts`, estado global em `apps/web/src/contexts/AuthContext.tsx`
- Verificação de token no backend: `require_firebase_user()` em `apis/connectivity/fastapi_app/firebase_client.py:82` usa `firebase_admin.auth.verify_id_token()` e completa perfil com `users/{uid}`; **atualmente não é usada como dependência em nenhuma rota** — ver `apis/connectivity/fastapi_app/routes_datatem.py` e `apis/connectivity/README.md:74`

**[DATATEM — inventário de SIM cards]:**
- API REST `https://app-gateway.brcaptura.com.br` (default em `apis/connectivity/fastapi_app/datatem/config.py:30`), cliente em `apis/connectivity/fastapi_app/datatem/client.py`
- Autenticação: login `[POST] /authorization/api/v1/auth/login` com senha em Base64 UTF-8 (`encoded_password()`), refresh em `/authorization/api/v1/auth/refresh_token`; sessão com refresh single-flight (`asyncio.Lock`) em `ensure_session()`
- Leitura: `/simcard/invetory/v1/simcard` (grafia original) e `/simcard/connection/v1/connections`, paginação `Pagesize`/`PageNumber`/`Paginate`
- Escrita: nenhuma rota de escrita chama a DATATEM; atribuições e histórico ficam no Firestore (`apis/connectivity/fastapi_app/simcard_store.py`)
- Erros sanitizados em `apis/connectivity/fastapi_app/datatem/errors.py` (`DatatemErrorKind` + `STATUS_MAP`), traduzidos para `HTTPException` em `routes_datatem.py:64` e para mensagens amigáveis em `apps/web/src/services/DatatemService.ts:14`
- Frontend: `apps/web/src/services/DatatemService.ts` usa `fetch` com `VITE_DATATEM_API_URL` (fallback `https://datatemapi-podsadministrator.onrender.com`), **sem header `Authorization`**

**[GROQ + DuckDuckGo — pesquisa e enriquecimento de relatórios]:**
- API Express em `apis/research-etl/src/server.js`; endpoints `[POST] /api/research` e alias legado `[POST] /api/claude`, health check `[GET] /health`
- LLM: `https://api.groq.com/openai/v1/chat/completions`, modelo `llama-3.3-70b-versatile`, chave `GROQ_API_KEY` somente no servidor
- Web search: scraping de `https://html.duckduckgo.com/html/` em `webSearch()` (3 consultas em paralelo, timeout 10 s)
- Consumo no frontend: `apps/web/src/hooks/useETLResearch.ts` (health check, wake do serviço Render, fallback de `/api/research` para `/api/claude`)

**[ANEEL — dados abertos]:**
- Coletor pontual em `apis/connectivity/fastapi_app/collect_aneel.py`: CKAN `https://dadosabertos.aneel.gov.br/api/3/action/package_show?id=...` para `geracao`, `indicadores-de-distribuicao`, `sird`; download de CSV/XLSX e gravação em `apis/connectivity/fastapi_app/processed/`

**[Power Automate — apenas placeholder]:**
- `apps/web/src/hooks/useSampleControl.ts:3-6` define constantes `SUA_URL_DO_POWER_AUTOMATE_GET/POST/DELETE/UPDATE`; não há URL real configurada

**[Microsoft Identity Platform / SharePoint / Graph]:**
- Não detectado. Ausência de `@azure/*`, `msal`, `@microsoft/microsoft-graph-client` em todos os `package.json`; botão "Continue with Microsoft" em `apps/web/src/pages/Auth/LoginPage.tsx:177-183` usa apenas o ícone `IconMicrosoft` (`apps/web/src/components/common/ConnectionIcons.tsx:20`), sem handler

## Data Storage

**Databases:**
- Cloud Firestore (projeto `podsadministrator`), regras em `firestore.rules`, índice em `firestore.indexes.json`, config em `firebase.json`
- Coleções de domínio (frontend/converters): `users`, `testbooks`, `testbooks/{id}/modules`, `opportunities`, `notifications`, `systemLog` — `firebase/converters/index.ts`, `apps/web/src/repositories/AuthRepository.ts`, `apps/web/src/utils/systemLogger.ts`
- Coleções operacionais protegidas: `chipAssignments`, `chipAssignmentHistory`, `manualSimcards`, `datatemInventory`, `datatemSyncState` — constantes em `apis/connectivity/fastapi_app/simcard_store.py:26-31`; legado `chips`; escritas transacionais com `firestore.Transaction` e retry de `Aborted`
- Credenciais/sessão DATATEM: documento `datatemIntegration/session` (`DATATEM_TOKEN_COLLECTION`/`DATATEM_TOKEN_DOCUMENT`) em `apis/connectivity/fastapi_app/datatem/token_store.py:33-65`; **tokens em texto simples**, sem camada de criptografia; fallback `MemoryTokenStore` em memória quando o Admin SDK não está disponível
- Regras: `signedIn()` para leitura de qualquer coleção; escrita permitida apenas fora de `datatemProtectedCollection()`; `datatemIntegration` é somente leitura inclusive para usuários autenticados (`firestore.rules:9-25`)
- Índice composto: `chipAssignmentHistory` (`datatemSimcardId` ASC + `performedAt` DESC) em `firestore.indexes.json`
- Padrão de conversão: `FirestoreDataConverter` com `schema.parse()` do Zod e normalização de datas (`convertDate`) em `firebase/converters/index.ts`; novos tipos devem seguir `shared/types/**` + `shared/schemas/index.ts`
- Real-time: `onSnapshot` disseminado em hooks (ex.: `apps/web/src/hooks/useSimcardOperations.ts`, `usePages.ts`, `useTodo.ts`) — qualquer novo estado no Firestore pode ser consumido da mesma forma

**File Storage:**
- Bucket `podsadministrator.firebasestorage.app` configurado em `apps/web/src/firebase.ts:9` e `VITE_FIREBASE_STORAGE_BUCKET` em `apps/web/src/vite-env.d.ts`, mas **nenhum import de `firebase/storage`** no código
- Cloudflare R2 / S3: nenhuma referência no repositório
- Leitura de arquivos no navegador: `FileReader` (`apps/web/src/components/SettingsModal.tsx:409`, `apps/web/src/pages/ProfilePage.tsx:40`) e `file.arrayBuffer()` com `pdfjs-dist` (`apps/web/src/hooks/useComparison.ts:62,286`) — processamento em memória, sem persistência local
- Arquivos locais no backend: downloads ANEEL em `apis/connectivity/fastapi_app/processed/` (`collect_aneel.py`) e datasets carregados por `apis/connectivity/fastapi_app/loader.py`; são os únicos arquivos gravados em disco

**Caching:**
- Nenhum cache de dados operacionais em disco: inventário/atribuições/histórico são lidos do Firestore (`apis/connectivity/README.md:74`)
- Cache em memória: sessão DATATEM em `DatatemClient._session` e `MemoryTokenStore`; datasets pandas em `apis/connectivity/fastapi_app/main.py:39`
- Nenhuma biblioteca de criptografia (`crypto`, `node:crypto`, `cryptography`, `bcrypt`) declarada ou utilizada para credenciais; senha DATATEM usa apenas Base64 em `apis/connectivity/fastapi_app/datatem/config.py:60`

## Authentication & Identity

**Auth Provider:**
- Firebase Auth (e-mail/senha) — `apps/web/src/firebase.ts`, `apps/web/src/contexts/AuthContext.tsx`, `apps/web/src/services/AuthService.ts`, `apps/web/src/repositories/AuthRepository.ts`, `firebase/repositories/AuthRepository.ts`
- Perfil do usuário é espelhado em `users/{uid}`; papéis/flag `isAdmin` lidos do perfil no backend por `require_firebase_user()` (`apis/connectivity/fastapi_app/firebase_client.py:69-110`)
- `require_write_permission()` bloqueia papéis `VIEWER`/`READONLY`/`LEITOR` (`firebase_client.py:113`), mas não está aplicado nas rotas atuais
- Microsoft/Google/GitHub: botões puramente visuais em `apps/web/src/pages/Auth/LoginPage.tsx:169-191`, sem OAuth, MSAL ou Graph

**Padrão a seguir para novas integrações com backend (SharePoint):**
- Verificação de identidade no backend já existe em `apis/connectivity/fastapi_app/firebase_client.py:82` (`Authorization: Bearer <Firebase ID token>` → `verify_id_token`); o frontend precisa passar a enviar o token (hoje `apps/web/src/services/DatatemService.ts:81` envia somente `Content-Type`), ou o novo endpoint deve validar o token de acesso Microsoft conforme o fluxo escolhido
- Erros de autenticação do backend devem usar `HTTPException` com `detail` estruturado (`{"code", "message"}`) como em `apis/connectivity/fastapi_app/routes_datatem.py:64-71`; o frontend traduz códigos em `apps/web/src/services/DatatemService.ts:14-73`
- Estado e metadados pertencem ao Firestore; coleções com credenciais/tokens devem ser adicionadas à lista protegida em `firestore.rules:9-19` e receber índices em `firestore.indexes.json` quando necessário

## Monitoring & Observability

**Error Tracking:**
- Nenhum serviço externo (Sentry, Datadog) detectado; erros são tratados com `console.error` em APIs e UI

**Logs:**
- `apps/web/src/utils/systemLogger.ts` grava eventos (`action`, `detail`, `userId`, `createdAt`) na coleção `systemLog` via `addDoc`/`serverTimestamp`
- Notificações em `apps/web/src/utils/notificationSystem.ts` também usam Firestore
- Backend research/ETL usa `console.log`/`console.error` em `apis/research-etl/src/server.js`; FastAPI expõe health check em `/api/datatem/health` (`routes_datatem.py:184`)

## CI/CD & Deployment

**Hosting:**
- Firebase Hosting do bundle `apps/web/dist` com rewrite SPA (`firebase.json:12-25`), projeto `podsadministrator` (`.firebaserc`)
- Render: `podsadministrator-connectivity-api` (`apis/connectivity/render.yaml`) e `podsadministrator-research-etl-api` (`apis/research-etl/render.yaml`), região `oregon`, planos free
- Firebase Functions: `generateReportPDF` em `apis/reporting-functions/index.js`, deploy via `firebase deploy --only functions`

**CI Pipeline:**
- Nenhum workflow CI detectado (sem `.github/workflows/**`); validações locais documentadas em `docs/DATATEM_INTEGRATION.md:127-135` (`npm run web:build`, `npm run web:lint`, `npx tsc ...`, pytest)
- Novos serviços backend seguem o padrão de um `render.yaml` por API com `envVars` `sync: false` para segredos; novos endpoints frontend devem usar `VITE_*` apenas para URLs públicas

## Environment Configuration

**Required env vars:**
- Firebase Admin (backend): `FIREBASE_SERVICE_ACCOUNT_JSON` **ou** `GOOGLE_APPLICATION_CREDENTIALS`, `FIREBASE_PROJECT_ID` (`apis/connectivity/fastapi_app/firebase_client.py:37-46`)
- DATATEM: `DATATEM_BASE_URL`, `DATATEM_USERNAME`, `DATATEM_PASSWORD`, `DATATEM_CLIENT_ID`, `DATATEM_CLIENT_SECRET`, `DATATEM_REFRESH_GRANT_TYPE`, `DATATEM_PAGE_SIZE`, `DATATEM_MAX_PAGES`, `DATATEM_REQUEST_TIMEOUT`, `DATATEM_TOKEN_EXPIRY_SKEW`, `DATATEM_TOKEN_COLLECTION`, `DATATEM_TOKEN_DOCUMENT` (`apis/connectivity/fastapi_app/datatem/config.py`)
- API conectividade: `CORS_ALLOWED_ORIGINS` (`apis/connectivity/fastapi_app/config.py:65`)
- Research/ETL: `GROQ_API_KEY`, `PORT` (`apis/research-etl/src/server.js:47,119`)
- Frontend: `VITE_DATATEM_API_URL`, `VITE_ETL_API_URL` e as variáveis `VITE_FIREBASE_*` usadas pelos scripts (`apps/web/src/vite-env.d.ts`)

**Secrets location:**
- `.env` na raiz (existe; conteúdo não lido) e `.env.example` como modelo; ambos fora do controle de versão exceto o example (`.gitignore:26-32`)
- Chave de service account `podsadministrator-firebase-adminsdk-fbsvc-7cccb6de83.json` na raiz, ignorada pelo Git (`.gitignore:32-34`)
- Segredos de produção configurados no Render (`sync: false` nos `render.yaml`); nunca com prefixo `VITE_`
- Config web do Firebase é pública e está embutida em `apps/web/src/firebase.ts:5-13`

## Webhooks & Callbacks

**Incoming:**
- Nenhum endpoint de webhook implementado; `apps/web/src/components/SettingsModal.tsx:352` mostra apenas aba placeholder "API e Webhooks"

**Outgoing:**
- Nenhum webhook detectado; comunicações são chamadas HTTP diretas (DATATEM, Groq, DuckDuckGo, ANEEL, Firebase)
- Tela de integrações existente: item "Integrações" em `apps/web/src/components/SettingsModal.tsx:81` renderiza `PlaceholderSection` em `:347`; rota `/settings` em `apps/web/src/routes/index.tsx:78` com `apps/web/src/pages/SettingsPage.tsx` — ponto natural para a UI de conexão SharePoint

---

*Integration audit: 2026-11-17*
