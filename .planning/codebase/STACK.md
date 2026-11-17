# Technology Stack

**Analysis Date:** 2026-11-17

## Languages

**Primary:**
- TypeScript `~5.9.3` — frontend React em `apps/web/src/**`, helpers/converters Firebase em `firebase/**`, tipos compartilhados e esquemas Zod em `shared/**`, scripts de seed em `scripts/**`
- JavaScript (ESM) — APIs Node: `apis/research-etl/src/server.js`, `apis/reporting-functions/index.js`; arquivos de configuração `apps/web/vite.config.ts`, `apps/web/eslint.config.js`, `apps/web/tailwind.config.js`, `apps/web/postcss.config.js`

**Secondary:**
- Python `3.12` (declarado em `apis/connectivity/render.yaml`) — API FastAPI em `apis/connectivity/fastapi_app/**` e testes em `apis/connectivity/tests/**`
- CSS/Tailwind CSS `^4.1.18` — `apps/web/src/index.css`, `apps/web/tailwind.config.js`, `apps/web/postcss.config.js`
- JSON — i18n (`apps/web/src/locales/en.json`, `apps/web/src/locales/pt.json`, `apps/web/src/locales/es.json`, `apps/web/src/locales/cn.json`), config Firebase (`firebase.json`, `firestore.indexes.json`, `.firebaserc`)

## Runtime

**Environment:**
- Navegador via Vite `^7.2.4` (dev) e bundle estático (build) para `apps/web`
- Node.js `20` em `apis/research-etl/render.yaml` (`NODE_VERSION: "20"`); Node.js `18` em `apis/reporting-functions/package.json` (`engines.node`)
- Python `3.12` em `apis/connectivity/render.yaml`; ambiente virtual local em `backend/.venv` (contém apenas dependências — não há arquivos `.py` de aplicação em `backend/`)
- `vite-tsconfig-paths` `^6.1.1` na raiz (`package.json`) resolve aliases `@/*` definidos em `apps/web/tsconfig.app.json`

**Package Manager:**
- npm com workspaces (`apps/web`, `firebase`, `shared`) — `package.json`, `package-lock.json` (`lockfileVersion: 3`)
- npm isolado para `apis/research-etl` (`apis/research-etl/package-lock.json`); `apis/reporting-functions` não possui lockfile próprio
- pip para `apis/connectivity/requirements.txt` (faixas de versão, sem lockfile Python); script `api:connectivity:install` em `package.json`

## Frameworks

**Core:**
- React `^19.2.0` + React DOM `^19.2.0` — UI em `apps/web/src/**`, entrada em `apps/web/src/main.tsx`
- React Router `^7.11.0` — rotas em `apps/web/src/routes/index.tsx`
- Tailwind CSS `^4.1.18` + `@tailwindcss/postcss`, `tw-animate-css` — estilos
- FastAPI `>=0.115,<1` (uvicorn `>=0.30,<1`) — API de conectividade, `apis/connectivity/fastapi_app/main.py`
- Express `^4.22.1` + `cors` `^2.8.6` — API de pesquisa/ETL, `apis/research-etl/src/server.js`
- Firebase Functions v2 (`firebase-functions` `^4.3.1`) — `apis/reporting-functions/index.js`

**Testing:**
- pytest `>=8.0,<9` + pytest-asyncio `>=0.24,<1` — `apis/connectivity/tests/` (config em `apis/connectivity/pytest.ini`); comando `api:connectivity:test` em `package.json`
- Frontend: nenhum runner de testes declarado em `apps/web/package.json` (sem script `test`, sem Jest/Vitest/Playwright)

**Build/Dev:**
- Vite `^7.2.4` + `@vitejs/plugin-react` `^5.1.1` — `apps/web/vite.config.ts`
- TypeScript `~5.9.3`, configuração em `apps/web/tsconfig.json`, `apps/web/tsconfig.app.json`, `apps/web/tsconfig.node.json`
- ESLint `^10.0.0` + `@typescript-eslint/*` `^8.36.0` — `apps/web/eslint.config.js`; script `web:lint` em `package.json`
- Firebase CLI — emuladores e deploy (`firebase.json`, scripts `firebase:emulators`, `api:reporting:deploy`)

## Key Dependencies

**Critical:**
- `firebase` `^12.7.0` — Auth + Firestore no navegador; inicialização em `apps/web/src/firebase.ts`
- `firebase-admin` `^11.8.0` (Node) e `firebase-admin` `>=6.4,<7` (Python) — Admin SDK: `apis/reporting-functions/index.js`, `apis/connectivity/fastapi_app/firebase_client.py`
- `google-cloud-firestore` `>=2.20,<3` — persistência operacional e transações em `apis/connectivity/fastapi_app/simcard_store.py`
- `zod` `^3.23.8` — validação de esquemas compartilhados em `shared/schemas/index.ts`, usada pelos converters em `firebase/converters/index.ts`
- `axios` `^1.13.2` — único uso em `apps/web/src/components/Dashboard.tsx`; demais chamadas usam `fetch` nativo (`apps/web/src/services/DatatemService.ts`, `apps/web/src/hooks/useETLResearch.ts`)
- `httpx` `>=0.27,<1` — cliente HTTP assíncrono da integração DATATEM em `apis/connectivity/fastapi_app/datatem/client.py`
- `dotenv` `^17.3.1`/`^17.4.2` — carregamento de `.env` em `apis/research-etl/src/server.js` e nos scripts TypeScript

**Infrastructure:**
- `puppeteer-core` `^21.0.0` — declarado em `apis/reporting-functions/package.json` para geração de PDF; hoje a função é stub (`apis/reporting-functions/index.js`)
- `pandas` `>=2.0,<3` + `openpyxl` `>=3.1,<4` — leitura de datasets CSV/XLSX em `apis/connectivity/fastapi_app/loader.py` e `collect_aneel.py`
- `ai` `^6.0.177` e `@react-pdf/renderer` `^4.3.2`, `jspdf` `^4.2.0`, `pdfjs-dist` `^5.5.207`, `xlsx` (tarball `0.20.1` via CDN SheetJS) — declarados em `apps/web/package.json`; `pdfjs-dist`/`xlsx`/`jspdf` usados em `apps/web/src/hooks/useComparison.ts`
- UI/runtime: `@base-ui/react` `^1.6.0`, `shadcn` `^4.16.0`, `@shadcn/react` `^0.2.1`, `framer-motion` `^12.26.1`, `lucide-react` `^0.562.0`, `recharts` `^3.8.0`, `chart.js` `^4.5.1`, `@dnd-kit/*`, `@tiptap/*` `^3.16.0`, `three` `^0.182.0`, `react-simple-maps` `^1.0.0`

## Configuration

**Environment:**
- Frontend (`VITE_*`, visíveis ao navegador; declarados em `apps/web/src/vite-env.d.ts`): `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`, `VITE_FIREBASE_MEASUREMENT_ID`, `VITE_DATATEM_API_URL`, `VITE_ETL_API_URL`
- `apps/web/src/firebase.ts` usa config Firebase fixa (sem `import.meta.env`), com `projectId` `podsadministrator` e bucket `podsadministrator.firebasestorage.app`; os scripts `scripts/seedTestbooks.ts` e `scripts/migrateModuleContents.ts` leem as variáveis `VITE_FIREBASE_*` via `process.env`
- Backend conectividade: `FIREBASE_PROJECT_ID`, `FIREBASE_SERVICE_ACCOUNT_JSON` ou `GOOGLE_APPLICATION_CREDENTIALS`, `CORS_ALLOWED_ORIGINS`, `DATATEM_*`, `DATATEM_TOKEN_COLLECTION`, `DATATEM_TOKEN_DOCUMENT` — `apis/connectivity/fastapi_app/config.py`, `apis/connectivity/fastapi_app/datatem/config.py`
- Research/ETL: `GROQ_API_KEY`, `PORT` — `apis/research-etl/src/server.js`, `apis/research-etl/render.yaml`
- `.env.example` e `.env` existem na raiz (modelo e configuração local; conteúdo não lido); `.gitignore` exclui `.env`, `*.env`, `.env.*` (exceto `.env.example`) e `*firebase-adminsdk*.json`
- Arquivo de credencial Admin SDK `podsadministrator-firebase-adminsdk-fbsvc-7cccb6de83.json` presente na raiz e ignorado por `.gitignore`

**Build:**
- `firebase.json` — hosting (`apps/web/dist` com rewrite SPA), firestore (`firestore.rules`, `firestore.indexes.json`) e functions (`source: apis/reporting-functions`)
- `.firebaserc` — projeto padrão `podsadministrator`
- `apis/connectivity/render.yaml` — serviço Render Python (`rootDir: apis/connectivity`, health check `/api/datatem/health`)
- `apis/research-etl/render.yaml` — serviço Render Node (`rootDir: apis/research-etl`, health check `/health`)
- `apps/web/components.json` — configuração de componentes UI; `tsconfig.tsbuildinfo` na raiz é artefato gerado

## Platform Requirements

**Development:**
- Node.js com npm (workspaces), Python 3.12 com pip/venv (`backend/.venv` conforme `apis/connectivity/README.md`), Firebase CLI para emuladores
- PostgreSQL/outras infraestruturas relacionais: não detectadas; Firestore é o único banco

**Production:**
- Firebase Hosting (SPA) + Firestore + Firebase Functions (`firebase.json`, `.firebaserc`)
- Render web services para as duas APIs (`apis/connectivity/render.yaml`, `apis/research-etl/render.yaml`)
- Sem pipeline CI detectado (nenhum `.github/workflows/**`)

---

*Stack analysis: 2026-11-17*
