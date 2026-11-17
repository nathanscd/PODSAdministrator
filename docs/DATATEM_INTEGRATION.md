# Integração DATATEM e SIMs manuais — PODSAdministrator

## Visão geral

A página `SimCardControl` (`apps/web/src/pages/ChipControl.tsx`) consome exclusivamente a Connectivity API do PODSAdministrator (`apis/connectivity`). O navegador nunca recebe credenciais DATATEM e não envia token Firebase para essas rotas: o login DATATEM é único, estático e feito somente pelo backend com as variáveis `DATATEM_*`.

Fluxo:

1. A página chama `GET /api/datatem/bootstrap` ao abrir, o que também faz auto-wake do backend no Render.
2. O backend autentica na DATATEM apenas para listar inventário e conectividade, normaliza os dados e cruza com atribuições operacionais no Firestore.
3. SIMs manuais ficam em `manualSimcards`, marcados com `source: "manual"`, e aparecem no mesmo inventário com badge `MANUAL · NÃO DATATEM`.
4. Atribuição, liberação, criação, edição e exclusão são gravadas somente no PODSAdministrator, em `chipAssignments` e `chipAssignmentHistory`, sem chamada de escrita à DATATEM.
5. No primeiro `bootstrap`, chips antigos da coleção `chips` são comparados com o inventário DATATEM por ICCID/telefone: match gera atribuição com os dados legados; sem match vira SIM manual com atribuição.
6. A UI acompanha as coleções operacionais via `onSnapshot`, agrupa chips por `4G`, `NB-IoT` e `Outros`, e mantém o histórico auditável.

## Configuração

### Connectivity API

Variáveis em `.env.example` e no Render (`apis/connectivity/render.yaml`):

- `DATATEM_BASE_URL` — default `https://app-gateway.brcaptura.com.br`
- `DATATEM_USERNAME`, `DATATEM_PASSWORD`, `DATATEM_CLIENT_ID`, `DATATEM_CLIENT_SECRET` — obrigatórias
- `DATATEM_REFRESH_GRANT_TYPE` — default `refresh_token`; confirmar valor real com a DATATEM
- `DATATEM_PAGE_SIZE`, `DATATEM_MAX_PAGES`, `DATATEM_REQUEST_TIMEOUT`, `DATATEM_TOKEN_EXPIRY_SKEW`
- `DATATEM_TOKEN_COLLECTION` / `DATATEM_TOKEN_DOCUMENT` — default `datatemIntegration/session`
- `CORS_ALLOWED_ORIGINS` — lista separada por vírgula; incluir domínio real do Firebase Hosting
- `FIREBASE_PROJECT_ID` — default `podsadministrator`
- `FIREBASE_SERVICE_ACCOUNT_JSON` ou `GOOGLE_APPLICATION_CREDENTIALS`

A API não carrega `.env` automaticamente. No PowerShell, defina as variáveis com `$env:NOME = "valor"` antes de executar uvicorn/pytest.

A senha DATATEM é enviada como Base64 UTF-8 no login. Tokens ficam somente no backend, em memória ou no Firestore (`datatemIntegration/session`), nunca no frontend.

Health check público: `GET /api/datatem/health`.

### Frontend

- `VITE_DATATEM_API_URL` — URL pública da Connectivity API. Não usar prefixo `VITE_` para segredos.
- `VITE_ETL_API_URL` — URL pública da Research/ETL API; fallback `https://podsadministrator.onrender.com`.
- `apps/web/src/vite-env.d.ts` declara ambas as variáveis.
- `apps/web/src/services/DatatemService.ts` apenas chama a Connectivity API e traduz erros da API para mensagens amigáveis; nenhum header de autenticação é necessário.

### Firestore

`firestore.rules` permite leitura autenticada e escrita normal nas coleções existentes, mas bloqueia escrita do navegador em:

- `chipAssignments`
- `chipAssignmentHistory`
- `manualSimcards`
- `datatemInventory`
- `datatemIntegration`
- `datatemSyncState`

`chipAssignmentHistory` usa índice composto (`datatemSimcardId` ASC + `performedAt` DESC) definido em `firestore.indexes.json`.

## Endpoints

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/datatem/health` | Health check público para Render |
| GET | `/api/datatem/bootstrap` | Inventário DATATEM + SIMs manuais + conectividade + atribuições |
| GET | `/api/datatem/simcards` | Inventário DATATEM salvo no Firestore |
| POST | `/api/datatem/simcards/sync` | Força sincronização do inventário |
| GET | `/api/datatem/connections` | Conectividade isolada |
| GET | `/api/datatem/assignments` | Atribuições atuais |
| GET | `/api/datatem/history` | Histórico (filtro opcional `simcardId`) |
| GET | `/api/datatem/simcards/{id}` | Detalhe local de um SIM DATATEM salvo no Firestore ou manual |
| POST | `/api/datatem/simcards/{id}/assign` | Atribui a oportunidade ou projeto manual |
| POST | `/api/datatem/simcards/{id}/release` | Libera o chip |
| PATCH | `/api/datatem/simcards/{id}/assignment` | Edita metadados operacionais |
| GET | `/api/datatem/manual-simcards` | Lista SIMs manuais |
| POST | `/api/datatem/manual-simcards` | Cria SIM manual com atribuição inicial em transação |
| PATCH | `/api/datatem/manual-simcards/{id}` | Edita SIM manual com evento `manual_updated` |
| DELETE | `/api/datatem/manual-simcards/{id}` | Exclui SIM manual, libera atribuição e registra auditoria |
| POST | `/api/datatem/legacy-migrate` | Reconcilia chips legados com DATATEM/manual de forma idempotente |
| GET | `/api/datatem/legacy-metadata` | Metadados legados associados por identificador único |

As rotas DATATEM não exigem token do PODSAdministrator no navegador. O login DATATEM é estático, configurado no backend por `DATATEM_USERNAME`, `DATATEM_PASSWORD`, `DATATEM_CLIENT_ID` e `DATATEM_CLIENT_SECRET`, e é usado igualmente para qualquer usuário do sistema. A DATATEM é usada somente nas rotas de listagem/sincronização; nenhuma rota de escrita chama `DatatemClient`.

## Dados e normalização

- Caminho de inventário: `/simcard/invetory/v1/simcard` (grafia preservada da API).
- Paginação: query string `Pagesize`, `PageNumber`, `Paginate`.
- `statusName`, `operatorStatusName` e `operationalStatusName` são preservados separadamente.
- `lifecycleState` é derivado apenas desses campos; status desconhecido não vira "inativo".
- Conectividade fica em estrutura isolada; nenhum indicador é inventado quando a API não responde.
- Detalhe de SIM não consulta a DATATEM: usa o inventário salvo no Firestore, SIM manual ou snapshot da atribuição local.
- Reset de SIM não tem rota nem botão: apenas scaffold no cliente (`DatatemClient.reset_simcard` / `bulk_reset`).

`chipAssignments` usa o ID do SIM como document ID, garantindo uma atribuição ativa por chip. `chipAssignmentHistory` é append-only com eventos `assigned`, `transfer`, `released`, `metadata_updated`, `created`, `manual_updated` e `deleted`.

## Chips legados

- A coleção `chips` do PODSAdministrator é lida pelo backend e comparada com `datatemInventory` por ICCID e telefone normalizados.
- Match inequívoco cria `chipAssignments/{simcardId}` com `projeto`, `cliente`, `equipamento`, `tecnologia` e `responsavel` legados; a chamada é idempotente e não sobrescreve atribuição ativa existente.
- Sem match, o chip é criado em `manualSimcards/legacy-{id}` com `source: "manual"` e recebe atribuição/histórico com os mesmos metadados legados.
- A reconciliação roda automaticamente no primeiro `bootstrap` por processo e também pode ser disparada por `POST /api/datatem/legacy-migrate`.

## SIMs manuais

- Grupo lógico: `manualSimcards`, ID `manual:{docId}`, `source: "manual"`.
- Cadastro mínimo: ICCID + tecnologia `4G` ou `NB-IoT`.
- Criação com oportunidade/projeto gera eventos `created` e `assigned` na mesma transação.
- Edição gera `manual_updated`; exclusão libera atribuição ativa e gera `released` + `deleted`.
- Indicadores de conectividade não são exibidos para SIMs manuais.
- Na UI, origem e tecnologia são filtráveis e SIMs manuais ficam agrupados junto dos DATATEM.

## Validações pendentes com a DATATEM

- Valor real de `grantType` no refresh token.
- Formato/parâmetros reais de paginação.
- Formato real da resposta de `/simcard/connection/v1/connections`.
- Necessidade de endpoint de reset (o scaffold existe, mas não foi exposto).

## Testes

Connectivity API:

```powershell
cd apis\connectivity
..\..\backend\.venv\Scripts\python.exe -m pytest -q --disable-warnings
```

Os testes cobrem login Base64, refresh single-flight, respostas inválidas, paginação/deduplicação, retry em 401, mensagens amigáveis, normalização, atribuições com conflito, CRUD transacional de SIMs manuais, persistência do inventário no Firestore, reconciliação de chips legados, CORS com `DELETE` e regressão que proíbe chamada à DATATEM no endpoint de atribuição. Última execução: `24 passed, 56 warnings in 2.12s`.

Frontend (linha de base do repositório):

```bash
npm run web:build
npm run web:lint
npx tsc -p apps/web/tsconfig.app.json --noEmit
```

`npm run web:lint` e `npx tsc ...` já falhavam antes desta integração por configuração/erros preexistentes; `npm run web:build` passa e continua sendo a verificação principal do bundle.
