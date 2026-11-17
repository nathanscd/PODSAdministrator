# APIs — PODSAdministrator

Todas as APIs ficam em `apis/` e podem ser desenvolvidas, versionadas e publicadas de forma independente.

| API | Pasta | Responsabilidade | Runtime | Deploy |
| --- | --- | --- | --- | --- |
| Conectividade | `apis/connectivity/` | DATATEM, SIMs manuais, inventário, atribuição e auditoria | Python/FastAPI | Render (`apis/connectivity/render.yaml`) |
| Research/ETL | `apis/research-etl/` | Pesquisa na web e enriquecimento de relatórios com GROQ | Node/Express | Render (`apis/research-etl/render.yaml`) |
| Reporting Functions | `apis/reporting-functions/` | Cloud Functions para geração de relatórios/PDF | Firebase Functions | Firebase CLI (`firebase.json`) |

O frontend continua em `apps/web/` e consome apenas URLs públicas configuradas em `VITE_DATATEM_API_URL` e `VITE_ETL_API_URL`. Credenciais DATATEM, GROQ e Firebase Admin nunca são expostas ao navegador. A integração DATATEM é somente leitura: escritas de chips são persistidas no PODSAdministrator.

## Comandos na raiz

```bash
npm install
npm run web:dev
npm run web:build

npm run api:connectivity:install
npm run api:connectivity:dev
npm run api:connectivity:test

npm run api:research:install
npm run api:research:dev
npm run api:research:start

npm run api:reporting:install
npm run api:reporting:serve
npm run api:reporting:deploy
```

## Documentação individual

- `apis/connectivity/README.md`
- `apis/research-etl/README.md`
- `apis/reporting-functions/README.md`

Contexto funcional da integração DATATEM: `docs/DATATEM_INTEGRATION.md`.
