<!-- refreshed: 2026-11-17 -->
# Codebase Concerns

**Analysis Date:** 2026-11-17

## Tech Debt

**Código legado removido / renomeado e trabalho não commitado:**
- Issue: o `git status` da branch `main` contém 20 entradas pendentes. Foram **deletados** `APIETL/Server.js`, `APIETL/package.json`, `APIETL/package-lock.json`, todo `backend/fastapi_app/` (`main.py`, `loader.py`, `collect_aneel.py`, `processed/*.csv`, `__pycache__/*.pyc`) e `firebase/functions/index.js` + `firebase/functions/package.json`. Em paralelo, estão **não rastreados** `apis/README.md`, `apis/reporting-functions/`, `apis/research-etl/`. Os diretórios antigos `APIETL/`, `backend/fastapi_app/` e `firebase/functions/` não existem mais no disco; o código vivo está em `apis/connectivity/`, `apis/research-etl/` e `apis/reporting-functions/`. `firebase.json:7` já aponta `functions.source` para `apis/reporting-functions`.
- Files: `APIETL/`, `backend/fastapi_app/`, `firebase/functions/`, `firebase.json`, `apis/README.md`, `apis/reporting-functions/index.js`, `apis/research-etl/src/server.js`, `apis/connectivity/fastapi_app/main.py`, `.firebase/hosting.YXBwc1x3ZWJcZGlzdA.cache`
- Impact: o repositório está em estado transitório — um deploy feito a partir do HEAD (sem o working tree) usa `firebase.json` novo, mas não contém `apis/reporting-functions/` (untracked) e ainda contém os arquivos antigos. Há risco de functions quebradas em produção e de confusão sobre qual é a origem da verdade (o script `package.json:15` ainda usa o caminho antigo `fastapi_app.main:app --app-dir apis/connectivity`, coerente com o novo `apis/connectivity/fastapi_app/`).
- Fix approach: commitar/descartar explicitamente o conjunto de mudanças, remover referências a `APIETL`/`backend/fastapi_app`/`firebase/functions` de READMEs e scripts, e validar um `firebase deploy --only functions` a partir de um clone limpo.

**Duplicação de camada de autenticação no frontend:**
- Issue: `apps/web/src/main.tsx:11-17` empilha `AuthProvider` (legado), `AtlasAuthProvider` (novo) e `PlatformProvider`. `apps/web/src/core/providers/AuthProvider.tsx` é apenas um adaptador que repassa `useLegacyAuth()` de `apps/web/src/contexts/AuthContext.tsx`, com `user: unknown` e casts `as`.
- Files: `apps/web/src/main.tsx`, `apps/web/src/core/providers/AuthProvider.tsx`, `apps/web/src/contexts/AuthContext.tsx`, `apps/web/src/services/AuthService.ts`
- Impact: duas fontes de verdade para identidade do usuário e perda de tipagem no caminho "Atlas". Para uma integração que exige identidade delegada por usuário, essa indireção é um ponto de erro (atribuição errada, `loading` dessincronizado).
- Fix approach: consolidar em um único provider autoral com tipos fortes (`TenantUser`), removendo o adaptador de compatibilidade.

**Configuração de ambiente inconsistente entre declaração e uso:**
- Issue: `apps/web/src/vite-env.d.ts:4-13` declara `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, etc., mas `apps/web/src/firebase.ts:5-13` ignora todas e usa objeto hardcoded. Já `apps/web/src/services/DatatemService.ts:12` e `apps/web/src/hooks/useETLResearch.ts:6` usam `import.meta.env` com fallback para URLs públicas fixas (`https://datatemapi-podsadministrator.onrender.com`, `https://podsadministrator.onrender.com`).
- Files: `apps/web/src/firebase.ts`, `apps/web/src/vite-env.d.ts`, `apps/web/src/services/DatatemService.ts`, `apps/web/src/hooks/useETLResearch.ts`, `apis/connectivity/render.yaml`
- Impact: configuração de produção depende de valores embutidos no bundle; trocar de projeto/ambiente exige rebuild. Variáveis `VITE_*` são, por definição, públicas no navegador — nunca devem carregar segredos.
- Fix approach: carregar config Firebase de `import.meta.env` com validação no bootstrap; manter apenas identificadores públicos no frontend e mover qualquer segredo para backend/Secret Manager.

**Abuso de `as any` e `@ts-ignore`:**
- Issue: ~36 ocorrências em `apps/web/src`, incluindo `apps/web/src/hooks/useComparison.ts:7` (`@ts-ignore`), `apps/web/src/hooks/usePages.ts:97`, `apps/web/src/hooks/usePageMutations.ts:8` (`updateDoc(..., data as any)`), `apps/web/src/components/Toolbar.tsx:117-119`, e vários componentes de `apps/web/src/components/SampleControl/` e `apps/web/src/pages/SalesEngineering/SESampleControl.tsx` (estilos `S.section as any`).
- Files: `apps/web/src/hooks/usePages.ts`, `apps/web/src/hooks/usePageMutations.ts`, `apps/web/src/hooks/useComparison.ts`, `apps/web/src/components/SampleControl/SampleList.tsx`, `apps/web/src/pages/SalesEngineering/SESampleControl.tsx`
- Impact: perda de checagem de tipos justamente nas camadas de persistência e UI; facilita regressões silenciosas.
- Fix approach: tipar os payloads de `updateDoc` com os modelos de `shared/types/` e substituir estilos `as any` por `CSSProperties`.

**Função de PDF é placeholder e dependência morta:**
- Issue: `apis/reporting-functions/index.js:13-14` responde `Buffer.from("PDF Report: ...")` com `Content-Type: application/pdf` — não é um PDF válido. `puppeteer-core` está em `apis/reporting-functions/package.json:18` mas não é usado.
- Files: `apis/reporting-functions/index.js`, `apis/reporting-functions/package.json`, `apis/reporting-functions/README.md:31`
- Impact: qualquer fluxo que consuma "relatório em PDF" recebe conteúdo corrompido; o README admite explicitamente que a renderização real falta.
- Fix approach: implementar a renderização server-side na function ou remover a dependência e documentar o endpoint como stub.

**Documentação enganosa / desatualizada (não confiar cegamente):**
- Issue: `.planning/IMPLEMENTATION-GUIDE.md` e `.planning/REDESIGN-PROGRESS.md` são documentos de design system que afirmam conclusão ("Phase 1 Foundation Complete", "Design System Establishment", guia com 8+ padrões prontos). O guia está tecnicamente alinhado a `apps/web/src/styles/designSystem.ts`, mas `REDESIGN-PROGRESS.md:122-152` marca a Phase 2 como "In Progress" com checklist inteiro aberto, e a realidade do código ainda tem estilos inline com `as any`. Além disso, `.planning/REDESIGN-PROGRESS.md:216-220`, `IMPLEMENTATION_STATUS.md:12-30` e `DEPLOYMENT_GUIDE.md:200-216` citam caminhos da estrutura plana antiga (`src/index.css`, `src/pages/...`) que hoje ficam em `apps/web/src/...`. `IMPLEMENTATION_STATUS.md:178` afirma "Everything is implemented and ready", e `DEPLOYMENT_GUIDE.md:245` diz "Ready for Production" — declarações não verificáveis e potencialmente falsas.
- Files: `.planning/IMPLEMENTATION-GUIDE.md`, `.planning/REDESIGN-PROGRESS.md`, `.planning/IMPLEMENTATION_STATUS.md`, `DEPLOYMENT_GUIDE.md`, `TESTBOOK_MIGRATION_COMPLETE.md`, `TESTBOOK_UPGRADE_GUIDE.md`
- Impact: planejadores podem assumir que design system, autenticação e migração de testbooks estão prontos e pular trabalho real. Nenhum desses documentos descreve o estado atual das APIs em `apis/` nem a migração para monorepo.
- Fix approach: tratar esses arquivos como histórico; validar qualquer afirmação contra o código antes de planejar. Atualizar ou arquivar os documentos com o estado real de `apps/web/` e `apis/`.

## Known Bugs

**CORS de produção configurado apenas para localhost:**
- Issue: `apis/connectivity/render.yaml:14-15` define `CORS_ALLOWED_ORIGINS=http://localhost:5173`. `apis/connectivity/fastapi_app/main.py:29-35` usa esse valor com `allow_credentials=True`, `allow_methods=["*"]`, `allow_headers=["*"]`.
- Files: `apis/connectivity/render.yaml`, `apis/connectivity/fastapi_app/main.py`, `apps/web/src/services/DatatemService.ts`
- Impact: o frontend hospedado no Firebase Hosting (`firebase.json:13`, `apps/web/dist`) deve ser bloqueado pelo navegador ao chamar a API DATATEM em Render, a menos que a variável seja sobrescrita fora do repositório — o que não fica registrado.
- Fix approach: parametrizar origens por ambiente e incluir o domínio de produção do Hosting; restringir methods/headers ao necessário.

**Regras do Firestore com lógica de leitura confusa e irrestrita:**
- Issue: `firestore.rules:21-25` usa `match /{document=**}` com `allow read: if signedIn() && (!datatemProtectedCollection() || request.path[0] != 'datatemIntegration')`. Como `datatemIntegration` já está na lista protegida, a segunda cláusula só nega leitura desse documento; qualquer outra coleção — inclusive futuras coleções de credenciais — é legível por **qualquer usuário autenticado**.
- Files: `firestore.rules`, `firestore.indexes.json`
- Impact: violação direta do requisito de "regras bloqueando acesso do cliente a documentos privados de credenciais". É um IDOR em nível de banco: não há checagem de `request.auth.uid` contra `ownerId`/`userId`, nem allow-list de coleções.
- Fix approach: substituir o wildcard por regras explícitas por coleção, com `request.auth.uid == resource.data.ownerId` (ou equivalente) e uma negação explícita (`allow read: if false`) para coleções de tokens/credenciais; validar com emulator de regras.

**Fluxo ETL com progresso fictício e fallback legacy:**
- Issue: `apps/web/src/hooks/useETLResearch.ts:122-137` avança a barra com `Math.random()` e `:159-169` usa `setTimeout` simulando etapas. `:79-85` faz fallback de `/api/research` para `/api/claude` quando recebe 404.
- Files: `apps/web/src/hooks/useETLResearch.ts`, `apis/research-etl/src/server.js:116-117`
- Impact: o usuário vê progresso que não reflete trabalho real; erros de rede/API podem ser mascarados pelo caminho legacy.
- Fix approach: derivar progresso de eventos reais (SSE/polling de status) e registrar qual endpoint respondeu.

**Cache global mutável na API de conectividade:**
- Issue: `apis/connectivity/fastapi_app/main.py:39` carrega `cache = load_all()` no import; `/indicadores/perdas` (`:62-66`) escreve `df["Score"] = ...` diretamente no DataFrame compartilhado e ordena em seguida.
- Files: `apis/connectivity/fastapi_app/main.py`, `apis/connectivity/fastapi_app/loader.py`
- Impact: mutação de estado global entre requisições concorrentes; risco de valores inconsistentes e de erro se as colunas esperadas não existirem. Endpoints `/datasets*` também são públicos.
- Fix approach: copiar o DataFrame antes de derivar colunas e mover o cache para um singleton imutável com carregamento sob demanda.

**Flag de migração em memória:**
- Issue: `apis/connectivity/fastapi_app/routes_datatem.py:32` (`_legacy_migration_done`) e `:223-237` garantem reconciliação "uma vez por processo".
- Files: `apis/connectivity/fastapi_app/routes_datatem.py`
- Impact: em múltiplas instâncias/restarts a migração roda mais de uma vez; a reconciliação é idempotente, mas gasta escritas e pode gerar ruído no histórico.
- Fix approach: persistir o estado da migração no Firestore (`datatemSyncState`) com transação.

## Security Considerations

**Regras do Firestore — ausência total de autorização por usuário (CRÍTICO para a integração SharePoint):**
- Risk: `firestore.rules:22-24` concede leitura a qualquer `signedIn()` e escrita a qualquer `signedIn()` em praticamente todo o banco. Não existe segregação por usuário, empresa, workspace ou papel. Um documento futuro do tipo `msalTokenCache/{uid}` ou `sharepointCredentials/...` seria **legível por qualquer usuário autenticado** se criado fora da lista `datatemProtectedCollection()` (`firestore.rules:9-19`).
- Files: `firestore.rules`, `apps/web/src/firebase.ts`, `apps/web/src/hooks/usePages.ts`, `apps/web/src/hooks/usePageMutations.ts`
- Current mitigation: apenas as coleções `chipAssignments`, `chipAssignmentHistory`, `manualSimcards`, `datatemInventory`, `datatemIntegration`, `datatemSyncState` têm escrita bloqueada via cliente; `datatemIntegration` também tem leitura bloqueada.
- Recommendations: antes de qualquer integração, reescrever as regras com allow-list explícita e `allow read, write: if false` para coleções privadas de credenciais/token; exigir `request.auth.uid == resource.data.uid`; adicionar testes de regras no emulator cobrindo tentativa de leitura cross-user.

**Rotas DATATEM sem autenticação e autoria sempre fictícia:**
- Risk: `apis/connectivity/fastapi_app/routes_datatem.py:180-181` retorna `SYSTEM_ACTOR` (`uid="datatem-integration"`) para todas as operações de escrita; nenhuma rota usa `Depends(require_firebase_user)`. O helper `require_firebase_user` existe em `apis/connectivity/fastapi_app/firebase_client.py:82-110`, mas uma busca no repositório encontra apenas sua definição (e `require_write_permission`, `:113-115`) — nunca são chamados. `apis/connectivity/README.md:74` documenta explicitamente: "As rotas DATATEM não exigem token do PODSAdministrator ... vale para qualquer usuário do sistema". O frontend `apps/web/src/services/DatatemService.ts:75-88` não envia header `Authorization`.
- Files: `apis/connectivity/fastapi_app/routes_datatem.py`, `apis/connectivity/fastapi_app/firebase_client.py`, `apis/connectivity/fastapi_app/simcard_store.py:104-108`, `apps/web/src/services/DatatemService.ts`, `apis/connectivity/README.md`
- Current mitigation: `firestore.rules` bloqueia escrita client-side nas coleções protegidas, obrigando passagem pela API.
- Recommendations: exigir Firebase ID token em todas as rotas de escrita (e idealmente leitura), propagar o `AuthenticatedUser` para `ResponsibleActor` em `simcard_store.py` e aplicar `require_write_permission`. Isso é pré-requisito para o requisito de "identidade/autoria delegada por usuário" do SharePoint.

**Token cache em texto puro no Firestore:**
- Risk: `apis/connectivity/fastapi_app/datatem/token_store.py:45-63` lê/grava `access_token`, `refresh_token`, `expires_at`, `token_type` e `scope` como campos claros no documento `datatemIntegration/session`. Não há criptografia AES-256-GCM, IV, AAD nem chave em Secret Manager. Embora `firestore.rules` negue leitura client-side dessa coleção, qualquer vazamento de backup, admin SDK ou regra mal configurada expõe o token.
- Files: `apis/connectivity/fastapi_app/datatem/token_store.py`, `apis/connectivity/fastapi_app/datatem/config.py:40-41`, `firestore.rules`
- Current mitigation: coleção `datatemIntegration` bloqueada para leitura/escrita pelo cliente; mensagens de erro em `apis/connectivity/fastapi_app/datatem/errors.py:53` são sanitizadas ("Nunca contém credenciais").
- Recommendations: usar o padrão exigido para MSAL — cifrar o blob com AES-256-GCM, chave mestra em Secret Manager, AAD vinculado ao `uid`, metadados `version`/`updatedAt`; rotacionar tokens existentes e migrar o documento legado.

**Manuseio de segredos:**
- Risk: existe `podsadministrator-firebase-adminsdk-fbsvc-7cccb6de83.json` na raiz do repositório (arquivo de service account do Firebase Admin, **conteúdo não lido nesta análise**). Está listado em `.gitignore:32-34` e `git ls-files` não o rastreia — o que é positivo —, mas `apis/connectivity/README.md:32` orienta carregá-lo via `Get-Content` em `FIREBASE_SERVICE_ACCOUNT_JSON`. `apis/connectivity/render.yaml:30-31` recebe esse JSON por variável de ambiente (`sync: false`), não por Secret Manager. Também há `.env` e `.env.example` na raiz (conteúdos não lidos; `.env` ignorado por `.gitignore:26-28`).
- Files: `podsadministrator-firebase-adminsdk-fbsvc-7cccb6de83.json`, `.gitignore`, `.env`, `.env.example`, `apis/connectivity/README.md`, `apis/connectivity/render.yaml`, `apis/connectivity/fastapi_app/firebase_client.py:37-46`
- Current mitigation: nenhum arquivo de credencial aparece em `git ls-files`; `firebase_client.py` aceita ADC (`credentials.ApplicationDefault()`) como alternativa.
- Recommendations: remover o JSON da árvore de trabalho, usar exclusivamente ADC/Secret Manager, nunca passar JSON de service account por variável de ambiente de platform config, e adicionar varredura de segredos no CI.

**Chave de API do Firebase embutida no bundle:**
- Risk: `apps/web/src/firebase.ts:6` contém a Web API key do projeto `podsadministrator` hardcoded (valor não reproduzido aqui). Não é um segredo de servidor, mas ignora `VITE_FIREBASE_API_KEY` declarado em `apps/web/src/vite-env.d.ts:4`, dificulta rotação e cria divergência de configuração.
- Files: `apps/web/src/firebase.ts`, `apps/web/src/vite-env.d.ts`
- Current mitigation: chaves Web do Firebase são identificadores públicos protegidos por regras/domínios autorizados.
- Recommendations: ler de `import.meta.env` e reforçar `firestore.rules`/App Check, já que a chave é distribuída ao navegador.

**API de Research/ETL sem autenticação, sem rate limit e CORS irrestrito:**
- Risk: `apis/research-etl/src/server.js:6` usa `app.use(cors())` (qualquer origem), `:116-117` expõe `/api/research` e `/api/claude` sem token, `:77-79` aceita `prompt` e `system` arbitrários do cliente, e `:110-113` devolve `err.message` bruto. `:70` faz `console.error("Groq error:", JSON.stringify(data))`, que pode registrar detalhes sensíveis da resposta do provedor. `GROQ_API_KEY` vem de `process.env` (`:47`) — correto, mas sem Secret Manager.
- Files: `apis/research-etl/src/server.js`, `apis/research-etl/render.yaml`, `apps/web/src/hooks/useETLResearch.ts`
- Current mitigation: `callGroq` valida presença da chave e usa `AbortSignal.timeout`.
- Recommendations: exigir ID token Firebase, whitelist de origens, rate limiting por `uid`, sanitizar/ocultar mensagens de erro e não logar payloads de terceiros.

**Cloud Function de PDF sem autenticação e com conteúdo arbitrário:**
- Risk: `apis/reporting-functions/index.js:5-18` é `onRequest` pública; aceita `htmlContent` arbitrário e devolve `error.message` em 500 (:17). Não há verificação de `req.auth`, ID token ou limite de tamanho.
- Files: `apis/reporting-functions/index.js`, `apis/reporting-functions/README.md`
- Current mitigation: validação mínima de presença de `htmlContent` (`:8-11`).
- Recommendations: exigir token, sanitizar HTML, limitar payload e responder com códigos genéricos; logar detalhes apenas no servidor.

**CSRF e defesas de request ausentes:**
- Risk: não há tokens CSRF, cookies SameSite, header customizado obrigatório nem middleware de rate limiting em `apis/connectivity/fastapi_app/main.py`, `apis/research-etl/src/server.js` ou `apis/reporting-functions/index.js`. A combinação `allow_credentials=True` + `allow_methods=["*"]` em `apis/connectivity/fastapi_app/main.py:29-35` amplia a superfície. As chamadas do frontend (`apps/web/src/services/DatatemService.ts:81-88`, `apps/web/src/hooks/useETLResearch.ts:74-85`) não enviam header de autenticação nem token anti-CSRF.
- Files: `apis/connectivity/fastapi_app/main.py`, `apis/research-etl/src/server.js`, `apis/reporting-functions/index.js`, `apps/web/src/services/DatatemService.ts`
- Current mitigation: autenticação Firebase no cliente (`apps/web/src/contexts/AuthContext.tsx`) e regras Firestore; as APIs backend não a consomem.
- Recommendations: adotar bearer tokens (sem cookies) ou CSRF token, CORS restrito, rate limiting por usuário/IP e validação de `Origin`/`Referer` para operações de escrita.

**Persistência local no navegador:**
- Risk: `apps/web/src/components/WelcomeNotificationModal.tsx:26,50,63,73` grava `lastSeenVersion` e `lastNotificationPopupDate` em `localStorage`. Existe uso de `crypto.randomUUID()` em `apps/web/src/pages/TaskTrackerPages.tsx:230` e `apps/web/src/components/SampleControl/SampleForm.tsx:76`, que é geração de ID (não criptografia de tokens).
- Files: `apps/web/src/components/WelcomeNotificationModal.tsx`, `apps/web/src/pages/TaskTrackerPages.tsx`, `apps/web/src/components/SampleControl/SampleForm.tsx`
- Current mitigation: os dados persistidos são apenas flags de UI, sem tokens.
- Recommendations: manter tokens MSAL exclusivamente no backend; para o requisito "sem cache persistente (browser ou backend)", evitar `localStorage`/`sessionStorage`/IndexedDB para qualquer dado de SharePoint e usar cache de token criptografado somente no Firestore, controlado pelo servidor.

**Links do SharePoint hoje são apenas URLs públicas no frontend:**
- Risk: `apps/web/src/components/Dashboard/DashboardQuickLinks.tsx:38` e `apps/web/src/pages/Templates.tsx:13` contêm links diretos para `https://hexingbrasil.sharepoint.com/...`, alguns com parâmetro de compartilhamento (`?e=...`). Não há SDK MSAL em `apps/web/package.json` nem fluxo OAuth backend.
- Files: `apps/web/src/components/Dashboard/DashboardQuickLinks.tsx`, `apps/web/src/pages/Templates.tsx`, `apps/web/src/components/Opportunities/OpportunityFormSections.tsx:323-328`, `apps/web/package.json`
- Current mitigation: nenhuma credencial é enviada nesses links; são apenas navegação.
- Recommendations: substituir por chamadas a endpoints backend que usem identidade delegada do usuário; tratar as URLs atuais como legado a ser removido.

**Afirmação de criptografia na UI:**
- Risk: `apps/web/src/pages/SettingsPage.tsx:167` exibe "Data Encryption: Enabled (AES-256)" como status, mas não há implementação de AES-256-GCM em nenhum dos arquivos analisados (`apps/web/src` e `apis/`).
- Files: `apps/web/src/pages/SettingsPage.tsx`
- Current mitigation: nenhuma.
- Recommendations: não exibir status de criptografia sem implementação real e evidência; implementar cifragem antes de manter o texto.

**Armazenamento privado类型 R2 / Secret Manager ausentes:**
- Risk: não há referência a Cloudflare R2, S3, Secret Manager, `@azure/msal-node` ou `@azure/identity` em `package.json`, `apis/*/package.json` ou `apis/*/requirements.txt`. O único backend de arquivos é o Firebase Storage implícito em `apps/web/src/firebase.ts:9`.
- Files: `package.json`, `apps/web/package.json`, `apis/reporting-functions/package.json`, `apis/connectivity/requirements.txt`, `apis/research-etl/package.json`
- Current mitigation: não aplicável.
- Recommendations: ao implementar o requisito, manter credenciais R2 e chaves de criptografia exclusivamente no backend (Secret Manager), com bucket privado e acesso via signed URLs de curta duração geradas no servidor.

## Performance Bottlenecks

**Bootstrap DATATEM varre coleções inteiras por requisição:**
- Problem: `apis/connectivity/fastapi_app/routes_datatem.py:204-248` chama `_load_inventory`, `_load_connections`, `get_assignments`, `list_manual_simcards`, `get_legacy_chips` e `reconcile_legacy_chips` no primeiro bootstrap. `apis/connectivity/fastapi_app/simcard_store.py:191-196,248-269` usa `.stream()` em coleções completas; `:278-297` reescreve o inventário em lotes de 450.
- Files: `apis/connectivity/fastapi_app/routes_datatem.py`, `apis/connectivity/fastapi_app/simcard_store.py`
- Cause: leitura não paginada e reconciliação legacy acoplada ao caminho de leitura.
- Improvement path: mover reconciliação para job administrativo, paginar/índexar consultas (`firestore.indexes.json`) e usar cache com TTL curto e chave por usuário.

**Wake-up de servidor com polling longo no cliente:**
- Problem: `apps/web/src/hooks/useETLResearch.ts:38-51` faz polling de `/health` a cada 5 s por até 60 s; cada chamada depende de cold start do Render (plano free em `apis/connectivity/render.yaml:5` e `apis/research-etl/render.yaml`).
- Files: `apps/web/src/hooks/useETLResearch.ts`, `apis/connectivity/render.yaml`, `apis/research-etl/render.yaml`
- Cause: hospedagem em plano free com hibernação.
- Improvement path: serviço sempre-on ou lógica de retry com backoff exponencial e feedback real de estado.

**Bundles e componentes muito grandes:**
- Problem: `apps/web/dist/assets/index-BbnXfdws.js` (~1,04 MB), `Comparacao-BsL0yXnB.js` (~962 KB) e `WorkspacePage-DkdKLHcB.js` (~471 KB); no fonte, `apps/web/src/pages/testbooks/Streelight.tsx` (~58 KB), `HybridNIC.tsx`/`Zeus.tsx` (~47 KB cada) e `apps/web/src/components/Report/ReportPDF.tsx` (~36 KB). `apps/web/src/hooks/useComparison.ts:8` carrega worker do pdf.js via CDN.
- Files: `apps/web/dist/assets/`, `apps/web/src/pages/testbooks/`, `apps/web/src/components/Report/ReportPDF.tsx`, `apps/web/src/hooks/useComparison.ts`
- Cause: imports estáticos de PDF/chart/3D e páginas monolíticas.
- Improvement path: code splitting por rota, lazy import de `@react-pdf/renderer`, `pdfjs-dist` e `three`, e servir o worker localmente.

## Fragile Areas

**`routes_datatem.py` com estado global e responsabilidades misturadas:**
- Files: `apis/connectivity/fastapi_app/routes_datatem.py`, `apis/connectivity/fastapi_app/datatem/client.py`
- Why fragile: 469 linhas com `_client`, `_legacy_migration_done`, `SYSTEM_ACTOR` e lógica de negócio, sincronização e tratamento de erros (fallback, migração, formatação de erros) no mesmo módulo. Mudanças em uma rota afetam bootstrap e escrita.
- Safe modification: cobrir com os testes existentes em `apis/connectivity/tests/test_assignment.py`, extrair migração e mover estado para dependências injetadas.
- Test coverage: parcial — há testes de atribuição, cliente e normalização, mas nenhum teste de autorização/auth nas rotas.

**`firestore.rules` como único controle de acesso ao banco:**
- Files: `firestore.rules`
- Why fragile: um wildcard `/{document=**}` com `signedIn()` qualquer alteração inadvertida abre todo o banco; a lógica de `datatemProtectedCollection()` é difícil de auditar.
- Safe modification: trocar para regras por coleção e executar o emulator de regras antes de cada deploy.
- Test coverage: nenhuma suíte de regras encontrada.

**Compatibilidade de versão do SDK Firestore no código de transação:**
- Files: `apis/connectivity/fastapi_app/simcard_store.py:37-47`
- Why fragile: `_transaction_get` tem workaround para dois comportamentos diferentes do SDK (`DocumentSnapshot` vs gerador), com comment "Google Cloud Firestore >=2.34 ...". `requirements.txt:7` fixa `>=2.20,<3`, então o comportamento muda conforme a versão instalada.
- Safe modification: fixar versão exata do SDK e eliminar o workaround com testes para ambos os formatos.
- Test coverage: transações são exercitadas em `apis/connectivity/tests/test_assignment.py`, mas não com as duas versões do SDK.

**Árvore de trabalho suja:**
- Files: `apps/web/src/pages/Initial.tsx`, `apps/web/src/index.css`, `apps/web/index.html`, `apps/web/src/vite-env.d.ts`, `apps/web/src/hooks/useETLResearch.ts`, `apps/web/src/services/DatatemService.ts`, `firebase.json`, `.firebase/hosting.YXBwc1x3ZWJcZGlzdA.cache`
- Why fragile: alterações não commitadas misturam refactor de API, UI e config de deploy; o cache do Firebase Hosting está modificado e avisos de CRLF aparecem no diff.
- Safe modification: revisar `git diff` por arquivo, separar em commits lógicos e normalizar finais de linha antes de planejar mudanças estruturais.
- Test coverage: não aplicável.

## Scaling Limits

**API de conectividade em plano free / cold starts:**
- Current capacity: `apis/connectivity/render.yaml:5` (`plan: free`), `apis/connectivity/render.yaml:12-13` (Python 3.12).
- Limit: hibernação, timeout de requisição e limites de memória do plano free; client faz polling de até 60 s (`apps/web/src/hooks/useETLResearch.ts:10-11`).
- Scaling path: plano pago/always-on, ou mover sincronização para fila/Cloud Scheduler.

**Escritas em lote e histórico sem retenção:**
- Current capacity: lotes de 450 operações em `apis/connectivity/fastapi_app/simcard_store.py:50-52,289-297`.
- Limit: `chipAssignmentHistory` cresce sem política de retenção; `get_history` limita a 500 (`routes_datatem.py:292`), mas a coleção não é particionada.
- Scaling path: TTL/particionamento por mês e índice composto (`firestore.indexes.json`).

**Runtime das Functions:**
- Current capacity: `apis/reporting-functions/package.json:11-13` declara Node 18.
- Limit: Node 18 está fora de suporte; firebase-admin `^11.8.0` e firebase-functions `^4.3.1` são versões antigas.
- Scaling path: atualizar runtime e dependências, com teste de deploy.

## Dependencies at Risk

**`xlsx` via URL externa:**
- Risk: `apps/web/package.json:83` usa `https://cdn.sheetjs.com/xlsx-0.20.1/xlsx-0.20.1.tgz` em vez de registro versionado.
- Impact: build depende de disponibilidade do CDN e de integridade do tarball; sem `integrity` fixo no lockfile pode haver deriva.
- Migration plan: publicar em registry privado ou fixar versão com hash, e validar lockfile no CI.

**Versões antigas/desatualizadas no backend:**
- Risk: `apis/reporting-functions/package.json:16-18` (firebase-admin 11, firebase-functions 4, puppeteer-core 21) e `apis/connectivity/requirements.txt:6` (firebase-admin `<7`).
- Impact: correções de segurança e compatibilidade com Node/Firebase modernos ficam de fora; `puppeteer-core` não é usado.
- Migration plan: atualizar para as majors suportadas e remover dependências mortas com teste de deploy.

**Stack frontend em versões de fronteira:**
- Risk: `apps/web/package.json:99` (eslint `^10.0.0`), `:68` (react `^19.2.0`), `:24-42` (tiptap `^3.16.0`), `:56` (firebase `^12.7.0`), `:83` (CDN xlsx). `apps/web/eslint.config.js` e `package.json:9` usam `--max-warnings 0`, mas há `as any`/`@ts-ignore` — o lint pode estar reclamando ou sendo ignorado.
- Impact: atualizações frequentes podem quebrar build; regras de lint restritivas com dívida existente geram ruído.
- Migration plan: fixar versões, executar `npm run web:lint` no CI e quitar `as any`/`@ts-ignore` antes de elevar regras.

## Missing Critical Features

**Integração nativa com Microsoft SharePoint — pré-requisitos ausentes:**
- Problem: não há MSAL (`@azure/msal-node`/`@azure/msal-browser`), fluxo de delegated permission, endpoint backend de token, cache cifrado, R2 privado, rate limiting, CSRF ou regras Firestore para credenciais. O estado atual usa links públicos (`apps/web/src/components/Dashboard/DashboardQuickLinks.tsx:38`, `apps/web/src/pages/Templates.tsx:13`) e autoria fictícia (`apis/connectivity/fastapi_app/routes_datatem.py:33-37,180-181`).
- Blocks: impossível atender simultaneamente a "tokens nunca no frontend", "cache MSAL AES-256-GCM no Firestore com chave no Secret Manager", "sem arquivos temporários ou cache persistente", "R2 backend-only", "identidade/autoria delegada por usuário" e "defesas IDOR/CSRF/rate limit" sem antes corrigir `firestore.rules`, autenticar as APIs e introduzir camada de segredos no backend.

**Autorização nas APIs:**
- Problem: `require_firebase_user`/`require_write_permission` (`apis/connectivity/fastapi_app/firebase_client.py:82-115`) nunca são usados; `/api/research`, `/api/claude` e a Cloud Function são públicos.
- Blocks: qualquer operação sensível (inclusive escrita de documentos de credenciais) não pode ser atribuída a um usuário real nem protegida por papel.

**Gestão de chaves e cofre:**
- Problem: `apis/connectivity/render.yaml:30-31` usa env var para service account; nenhuma integração com Secret Manager existe. Chave de criptografia para o futuro cache MSAL não está definida.
- Blocks: rotação, auditoria e o requisito de "chaves no Secret Manager".

## Test Coverage Gaps

**Testes de frontend e de segurança ausentes:**
- What's not tested: não existe nenhum `*.test.ts(x)`/`*.spec.ts(x)` em `apps/web/`. As únicas suítes do projeto são `apis/connectivity/tests/test_assignment.py`, `test_datatem_client.py` e `test_normalize.py`.
- Files: `apps/web/src/` (sem testes), `apis/connectivity/tests/`, `firestore.rules` (sem testes de regras), `apis/research-etl/src/server.js` (sem testes), `apis/reporting-functions/index.js` (sem testes)
- Risk: mudanças em autenticação (`apps/web/src/contexts/AuthContext.tsx`), regras Firestore e rotas backend podem quebrar sem detecção; requisitos de IDOR/CSRF não têm regress tests.
- Priority: High

**Token store e credenciais sem testes:**
- What's not tested: `apis/connectivity/fastapi_app/datatem/token_store.py` (load/save/clear), criptografia de token (inexistente) e carregamento de service account (`apis/connectivity/fastapi_app/firebase_client.py:26-50`).
- Files: `apis/connectivity/fastapi_app/datatem/token_store.py`, `apis/connectivity/fastapi_app/firebase_client.py`
- Risk: vazamento ou perda de tokens passaria despercebido; impossível validar o requisito AES-256-GCM sem testes.
- Priority: High

**Cloud Function e API de research sem testes:**
- What's not tested: validação de `htmlContent` em `apis/reporting-functions/index.js`, autenticação/CORS/rate limit em `apis/research-etl/src/server.js` e sanitização de erros.
- Files: `apis/reporting-functions/index.js`, `apis/research-etl/src/server.js`
- Risk: endpoints públicos com payload arbitrário e vazamento de `err.message`.
- Priority: Medium

**Ausência de pipeline de CI detectado:**
- What's not tested: não há arquivos de workflow (`.github/workflows/`) ou config de CI no repositório; `npm run web:lint` e `npm run api:connectivity:test` (`package.json:13,16`) não são executados automaticamente.
- Files: `package.json`, `apps/web/package.json`, `apis/connectivity/pytest.ini`
- Risk: nenhuma barreira automática antes de deploy; regras Firestore e segredos não são verificados.
- Priority: Medium

---

*Concerns audit: 2026-11-17*
