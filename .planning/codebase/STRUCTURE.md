# Codebase Structure

**Analysis Date:** 2026-11-17

## Directory Layout

```text
PODSAdministrator/                         # monorepo npm privado (podsadm-monorepo)
├── apps/
│   └── web/                               # SPA React 19 + Vite 7 (workspace npm)
│       ├── public/
│       │   └── testbooks/                 # conteúdo estático de testbooks (pantheon, Streetlight)
│       ├── src/
│       │   ├── main.tsx                   # entry point React + providers
│       │   ├── App.tsx                    # shell: i18n, toast, router
│       │   ├── routes/index.tsx           # todas as rotas (lazy + privadas + módulos)
│       │   ├── firebase.ts                # initializeApp/getFirestore/getAuth
│       │   ├── components/                # UI por domínio + biblioteca ui/
│       │   │   ├── ui/                    # primitivos shadcn/@base-ui (~70 arquivos)
│       │   │   ├── SimCards/              # inventário, atribuição, histórico
│       │   │   ├── Testbook/              # criação, compartilhamento, PDF
│       │   │   ├── Todo/, Assets/, Opportunities/, Report/, ETL/, ...
│       │   │   └── common/, blocks/, widgets/, Admin/, Dashboard/
│       │   ├── contexts/                  # AuthContext, LangContext, ToastContext, AIContext
│       │   ├── core/                      # camada "Atlas" (plataforma plugin-based)
│       │   │   ├── engine/pageEngine.tsx
│       │   │   ├── providers/             # PlatformProvider, AuthProvider (adaptador)
│       │   │   ├── registry/              # moduleRegistry, widgetRegistry
│       │   │   ├── repositories/          # BaseRepository, page/workspace
│       │   │   ├── services/              # firebaseService, pageService, platformService
│       │   │   ├── types/                 # platform.ts, compat.ts, firebase.ts
│       │   │   └── validation/            # platformValidators.ts
│       │   ├── hooks/                     # hooks de domínio (usePages, useTestbook, ...)
│       │   ├── layouts/                   # AuthLayout, DashboardLayout, SettingsLayout, WorkspaceLayout
│       │   ├── lib/utils.ts               # helpers (cn etc.)
│       │   ├── locales/                   # pt.json, en.json, es.json, cn.json
│       │   ├── modules/                   # shells de módulo (dashboard, settings, workspace)
│       │   ├── pages/                     # páginas/rotas (Auth/, testbooks/, SalesEngineering/)
│       │   ├── repositories/              # BaseRepository + AuthRepository (Firestore)
│       │   ├── services/                  # AuthService, DatatemService (HTTP)
│       │   ├── styles/designSystem.ts
│       │   ├── types.ts, types/           # tipos da web (simcard.ts)
│       │   └── utils/                     # notificationSystem, reportExporter, security, systemLogger
│       ├── index.html
│       ├── vite.config.ts, tsconfig*.json, eslint.config.js, tailwind.config.js
│       └── package.json                   # nome "podsadm"
├── apis/                                  # backends independentes (não são workspaces npm)
│   ├── README.md                          # mapa de APIs, env vars, deploy
│   ├── connectivity/                      # FastAPI (Python 3.12) — inventário/atribuição
│   │   ├── fastapi_app/
│   │   │   ├── main.py                    # app + lifespan + datasets/indicadores
│   │   │   ├── config.py                  # BackendSettings.from_env()
│   │   │   ├── firebase_client.py         # Admin SDK, auth helpers
│   │   │   ├── routes_datatem.py          # /api/datatem/* (todas as rotas)
│   │   │   ├── simcard_store.py           # transações e collections operacionais
│   │   │   ├── loader.py, legacy.py, collect_aneel.py
│   │   │   ├── datatem/                   # client, config, errors, models, normalize, token_store
│   │   │   └── processed/                 # CSVs de datasets (FiscalizacaoGeracao)
│   │   ├── tests/                         # pytest (assignment, client, normalize)
│   │   ├── requirements.txt, pytest.ini, render.yaml, README.md
│   ├── research-etl/                      # Express (Node) — web search + GROQ
│   │   ├── src/server.js                  # /health, /api/research, /api/claude
│   │   ├── package.json, render.yaml, README.md
│   └── reporting-functions/               # Firebase Cloud Functions (Node 18)
│       ├── index.js                       # generateReportPDF (onRequest)
│       └── package.json, README.md
├── firebase/                              # workspace npm — helpers Firestore tipados
│   ├── index.ts                           # export * from './converters'
│   ├── converters/index.ts                # converters Zod + defaults + Timestamp
│   ├── repositories/                      # AuthRepository (withConverter)
│   └── package.json                       # nome "firebase", depende de "shared"
├── shared/                                # workspace npm — contratos de domínio
│   ├── index.ts                           # export * from types + schemas
│   ├── types/                             # auth, page, crm, task, testbook, workspace, widget, ...
│   ├── schemas/index.ts                   # schemas Zod (user, testbook, opportunity, ...)
│   └── package.json                       # nome "shared", depende de "zod"
├── backend/                               # apenas .venv e .pytest_cache (sem código-fonte)
├── scripts/                               # seedTestbooks.ts, migrateModuleContents.ts
├── docs/DATATEM_INTEGRATION.md
├── firebase.json                          # hosting (apps/web/dist), functions, firestore
├── firestore.rules, firestore.indexes.json, .firebaserc
├── package.json                           # workspaces + scripts de orquestração
└── README.md                              # visão geral e comandos
```

## Directory Purposes

**`apps/web/`:**
- Purpose: único frontend da plataforma, servido como site estático.
- Contains: SPA React/Vite, arquivos de configuração de build e `public/`.
- Key files: `apps/web/src/main.tsx`, `apps/web/src/App.tsx`, `apps/web/src/routes/index.tsx`, `apps/web/src/firebase.ts`, `apps/web/vite.config.ts`.

**`apps/web/src/core/`:**
- Purpose: camada "Atlas" de plataforma extensível (módulos, widgets, páginas, workspace).
- Contains: registries, providers, engine, serviços/repositórios de plataforma, tipos e validadores.
- Key files: `apps/web/src/core/providers/PlatformProvider.tsx`, `apps/web/src/core/registry/moduleRegistry.ts`, `apps/web/src/core/engine/pageEngine.tsx`.

**`apps/web/src/contexts/` e `apps/web/src/hooks/`:**
- Purpose: estado global (sessão/i18n/toast) e lógica de domínio reutilizável.
- Contains: `AuthContext.tsx` (sessão Firebase + tenant), hooks com `onSnapshot` ou `fetch`.
- Key files: `apps/web/src/contexts/AuthContext.tsx`, `apps/web/src/hooks/useSimcardInventory.ts`, `apps/web/src/hooks/usePages.ts`.

**`apps/web/src/services/` e `apps/web/src/repositories/`:**
- Purpose: fronteira de integração HTTP e persistência Firestore da web.
- Contains: `DatatemService.ts` (fetch + erros), `AuthService.ts`, `BaseRepository.ts`, `AuthRepository.ts`.
- Key files: `apps/web/src/services/DatatemService.ts`, `apps/web/src/repositories/AuthRepository.ts`.

**`apis/connectivity/`:**
- Purpose: API de integração com DATATEM e dona das escritas operacionais de chips.
- Contains: FastAPI, cliente DATATEM, `SimcardStore`, testes pytest, config de deploy Render.
- Key files: `apis/connectivity/fastapi_app/main.py`, `apis/connectivity/fastapi_app/routes_datatem.py`, `apis/connectivity/fastapi_app/simcard_store.py`, `apis/connectivity/fastapi_app/datatem/token_store.py`.
- Nota: `backend/` contém somente ambiente virtual/cache — código Python ativo está em `apis/connectivity/`.

**`apis/research-etl/`:**
- Purpose: proxy de pesquisa e enriquecimento com LLM.
- Contains: servidor Express minimalista, deploy Render.
- Key files: `apis/research-etl/src/server.js`.

**`apis/reporting-functions/`:**
- Purpose: funções Firebase para geração de PDFs.
- Contains: `index.js` com endpoint `onRequest`.
- Key files: `apis/reporting-functions/index.js`, `apis/reporting-functions/package.json`.

**`firebase/`:**
- Purpose: pacote compartilhado de conversores/repositórios Firestore tipados.
- Contains: `converters/`, `repositories/`.
- Key files: `firebase/converters/index.ts`, `firebase/repositories/AuthRepository.ts`.

**`shared/`:**
- Purpose: contratos (tipos) e validação (schemas) usados por web e backends Node.
- Contains: `types/` por domínio e `schemas/index.ts`.
- Key files: `shared/types/index.ts`, `shared/types/auth/index.ts`, `shared/schemas/index.ts`.

**`scripts/`:**
- Purpose: utilitários de migração/seed de dados Firestore executados manualmente.
- Contains: `seedTestbooks.ts`, `migrateModuleContents.ts`.

## Key File Locations

**Entry Points:**
- `apps/web/src/main.tsx`: bootstrap React.
- `apps/web/src/App.tsx`: providers e roteador.
- `apps/web/src/routes/index.tsx`: mapa de rotas.
- `apis/connectivity/fastapi_app/main.py`: app FastAPI.
- `apis/research-etl/src/server.js`: servidor Express.
- `apis/reporting-functions/index.js`: Cloud Function.

**Configuration:**
- `package.json`: workspaces e scripts `web:*`, `api:*`, `firebase:emulators`.
- `apps/web/vite.config.ts`, `apps/web/tsconfig.json` (alias `@/*` → `src/*`), `apps/web/tsconfig.app.json`.
- `apps/web/src/vite-env.d.ts`: `VITE_DATATEM_API_URL`, `VITE_ETL_API_URL`.
- `apis/connectivity/fastapi_app/config.py`, `apis/connectivity/fastapi_app/datatem/config.py`.
- `apis/connectivity/render.yaml`, `apis/research-etl/render.yaml`, `firebase.json`, `.firebaserc`.
- `firestore.rules`, `firestore.indexes.json`.

**Core Logic:**
- `apps/web/src/core/providers/PlatformProvider.tsx`, `apps/web/src/core/registry/*`, `apps/web/src/core/engine/pageEngine.tsx`.
- `apps/web/src/contexts/AuthContext.tsx`, `apps/web/src/services/AuthService.ts`, `apps/web/src/repositories/AuthRepository.ts`.
- `apis/connectivity/fastapi_app/routes_datatem.py`, `apis/connectivity/fastapi_app/simcard_store.py`.
- `apis/connectivity/fastapi_app/datatem/client.py`, `apis/connectivity/fastapi_app/datatem/token_store.py`.
- `shared/types/`, `shared/schemas/index.ts`, `firebase/converters/index.ts`.

**Testing:**
- `apis/connectivity/tests/test_assignment.py`, `apis/connectivity/tests/test_datatem_client.py`, `apis/connectivity/tests/test_normalize.py`.
- `apis/connectivity/pytest.ini`.
- Sem suíte de testes automatizados no frontend (apenas lint via `npm run web:lint`).

**Deployment:**
- `firebase.json`: Hosting (`apps/web/dist`) + Functions (`apis/reporting-functions`) + rewrites SPA.
- `apis/connectivity/render.yaml`, `apis/research-etl/render.yaml`.

## Naming Conventions

**Files:**
- Componentes React: `PascalCase.tsx` (`apps/web/src/components/SimCards/SimCardCard.tsx`, `apps/web/src/pages/SettingsPage.tsx`).
- Hooks: `use` + `PascalCase.ts` (`apps/web/src/hooks/useSimcardInventory.ts`, `apps/web/src/hooks/useETLResearch.ts`).
- Serviços/repositórios: `PascalCase.ts` com sufixo (`AuthService.ts`, `AuthRepository.ts`, `BaseRepository.ts`).
- Utilitários e registries: `camelCase.ts` (`apps/web/src/lib/utils.ts`, `apps/web/src/core/registry/moduleRegistry.ts`).
- Módulos de domínio Node: `camelCase`/`kebab-case` em pastas (`apis/research-etl/src/server.js`, `apis/reporting-functions/index.js`).
- Módulos Python: `snake_case.py` (`apis/connectivity/fastapi_app/simcard_store.py`, `apis/connectivity/fastapi_app/routes_datatem.py`).
- Arquivos de teste Python: `test_*.py` em `apis/connectivity/tests/`.

**Directories:**
- Pastas de domínio em PascalCase sob `components/` e `pages/` (`SimCards/`, `Testbook/`, `SalesEngineering/`).
- Pastas de camada em minúsculas sob `src/` (`contexts/`, `hooks/`, `services/`, `repositories/`, `core/`).
- APIs em `kebab-case` (`apis/research-etl/`, `apis/reporting-functions/`); `apis/connectivity/` em minúsculo simples.
- Tipos compartilhados agrupados por domínio em minúsculas (`shared/types/auth/`, `shared/types/testbook/`).

**Exports:**
- `export const <nome>Service = new <Nome>Service()` para singletons (`apps/web/src/services/AuthService.ts:54`).
- Barrels `index.ts` reexportando módulos (`apps/web/src/layouts/index.ts`, `shared/types/index.ts`).
- Python: `datatem_settings = DatatemSettings.from_env()` e funções `get_*` para dependências (`apis/connectivity/fastapi_app/routes_datatem.py:30`).

## Where to Add New Code

**New backend service (novo domínio de integração, ex.: SharePoint/Graph):**
- Estrutura: criar `apis/<novo-servico>/` com `src/` (ou pacote Python), `package.json`/`requirements.txt`, `render.yaml`, `README.md` — seguindo `apis/research-etl/` e `apis/connectivity/`.
- Rotas/controladores: `apis/<novo-servico>/src/server.js` (Node) ou `apis/connectivity/fastapi_app/<dominio>/` + registro de router em `apis/connectivity/fastapi_app/main.py:37` (Python).
- Persistência e transações: espelhar `apis/connectivity/fastapi_app/simcard_store.py` (transação + histórico append-only + `SERVER_TIMESTAMP`) em `apis/connectivity/fastapi_app/<dominio>/store.py`.
- Credenciais/estado OAuth: usar o padrão `TokenStore` de `apis/connectivity/fastapi_app/datatem/token_store.py` + coleção protegida no Firestore (`firestore.rules:9`) — nunca enviar tokens ao navegador.
- Filas duráveis e upload de binários (R2): manter no backend, com estado da fila no Firestore e conteúdo pendente fora do Firestore; não criar cache/temp files no cliente.
- Orquestração: adicionar scripts `api:<servico>:*` em `package.json` (raiz) e documentar em `apis/README.md`.
- Testes: `apis/<novo-servico>/tests/` com `pytest.ini` equivalente.

**New frontend feature (ex.: UI unificada de documentos):**
- Página/rota: `apps/web/src/pages/<Feature>Page.tsx` + registro em `apps/web/src/routes/index.tsx` (lazy import; dentro de `PrivateRoute` se exigir login).
- Componentes: `apps/web/src/components/<Feature>/` (modais, tabelas, estados) reaproveitando `apps/web/src/components/ui/`.
- Hook de domínio: `apps/web/src/hooks/use<Feature>.ts` com `AbortController`/retry (padrão `useSimcardInventory.ts`) ou `onSnapshot` (padrão `usePages.ts`).
- Cliente HTTP: `apps/web/src/services/<Feature>Service.ts` com erro tipado e `FRIENDLY_MESSAGES` (padrão `DatatemService.ts`); declarar `VITE_<FEATURE>_API_URL` em `apps/web/src/vite-env.d.ts`.
- Persistência: `apps/web/src/repositories/<Feature>Repository.ts` estendendo `BaseRepository` **ou** concentrar escritas no backend quando a coleção for protegida por `firestore.rules`.
- Settings da integração: adicionar seção em `apps/web/src/pages/SettingsPage.tsx` e/ou `apps/web/src/components/SettingsModal.tsx`; estado de usuário via `useAuth()` (`apps/web/src/contexts/AuthContext.tsx`).
- Tipos/contratos: `shared/types/<feature>/index.ts` + reexport em `shared/types/index.ts`; schemas Zod em `shared/schemas/index.ts`.
- Módulo "Atlas": se a feature precisar ser plugável, criar `apps/web/src/modules/<feature>/index.ts` e registrar em `apps/web/src/modules/index.ts` + `apps/web/src/core/registry/moduleRegistry.ts`.

**Utilities:**
- Helpers compartilhados da web: `apps/web/src/lib/utils.ts` ou `apps/web/src/utils/`.
- Validação: `apps/web/src/core/validation/platformValidators.ts` (plataforma) ou `shared/schemas/index.ts` (domínio).
- Conversores Firestore: `firebase/converters/index.ts` com `schema.parse()` em `toFirestore` e `convertDate` em `fromFirestore`.

## Special Directories

**`node_modules/`:**
- Purpose: dependências npm (raiz, `apps/web/`, `shared/`).
- Generated: Yes (npm install).
- Committed: No.

**`backend/.venv/`, `backend/.pytest_cache/`, `apis/connectivity/.pytest_cache/`:**
- Purpose: ambiente virtual Python e cache de testes.
- Generated: Yes.
- Committed: No.
- Observação: não há código-fonte em `backend/`; usar `apis/connectivity/` para código Python.

**`apps/web/dist/`:**
- Purpose: build de produção do Vite, publicado pelo Firebase Hosting (`firebase.json:13`).
- Generated: Yes (`npm run web:build`).
- Committed: No.

**`apps/web/public/testbooks/`:**
- Purpose: conteúdo estático de testbooks (`pantheon/`, `Streetlight/`).
- Generated: No.
- Committed: Yes.

**`.firebase/`:**
- Purpose: cache do Firebase CLI.
- Generated: Yes.
- Committed: No.

**`.planning/codebase/`:**
- Purpose: documentação de arquitetura/convenções gerada pelo GSD (esta pasta).
- Generated: Yes (GSD map-codebase).
- Committed: conforme fluxo GSD.

---

*Structure analysis: 2026-11-17*
