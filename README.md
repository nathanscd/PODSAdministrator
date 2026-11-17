# PODSAdministrator

Monorepo do PODSAdministrator: frontend web, APIs isoladas por responsabilidade e funções Firebase. A DATATEM é consultada apenas para listar SIM cards e informações; atribuição, cadastro, edição e exclusão são gravadas no PODSAdministrator.

## Estrutura

- `apps/web/` — frontend React/Vite.
- `apis/connectivity/` — API FastAPI de conectividade, DATATEM, SIMs manuais, atribuição e auditoria.
- `apis/research-etl/` — API Express de pesquisa e enriquecimento com GROQ.
- `apis/reporting-functions/` — Cloud Functions Firebase para relatórios/PDF.
- `firebase/` — configuração e helpers TypeScript do Firebase.
- `shared/` — código compartilhado.
- `docs/` — documentação funcional, incluindo `DATATEM_INTEGRATION.md`.

## Comandos

```bash
npm install
npm run web:dev
npm run web:build

npm run api:connectivity:install
npm run api:connectivity:dev
npm run api:connectivity:test

npm run api:research:install
npm run api:research:dev

npm run api:reporting:install
npm run api:reporting:serve
```

## Documentação das APIs

Consulte `apis/README.md` para mapa, variáveis de ambiente, comandos e deploy de cada API.

## Deploy

- Frontend: Firebase Hosting configurado em `firebase.json`.
- Conectividade: `apis/connectivity/render.yaml`.
- Research/ETL: `apis/research-etl/render.yaml`.
- Reporting: `firebase deploy --only functions`, com `functions.source = apis/reporting-functions`.
