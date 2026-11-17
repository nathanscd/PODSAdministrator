# Connectivity API

API FastAPI responsável pelo inventário DATATEM, SIMs manuais, atribuições, liberações, conectividade e histórico auditável. A DATATEM é usada somente para listar SIM cards e informações; atribuição, cadastro, edição, exclusão e demais alterações são gravadas no PODSAdministrator.

## Estrutura

- `fastapi_app/main.py` — aplicação FastAPI e CORS.
- `fastapi_app/routes_datatem.py` — endpoints públicos e autenticados.
- `fastapi_app/simcard_store.py` — Firestore, transações, atribuições e CRUD manual.
- `fastapi_app/datatem/` — cliente DATATEM, cache de token, normalização e modelos.
- `tests/` — testes pytest.
- `requirements.txt` — dependências Python.
- `render.yaml` — configuração de deploy no Render.

## Configuração local

O ambiente virtual atual permanece em `backend/.venv` porque o diretório antigo estava em uso quando a API foi movida.

```powershell
python -m venv backend\.venv
backend\.venv\Scripts\python.exe -m pip install -r apis\connectivity\requirements.txt
```

A API não carrega `.env` automaticamente. Defina as variáveis no PowerShell antes de executar:

```powershell
$env:DATATEM_BASE_URL = "https://app-gateway.brcaptura.com.br"
$env:DATATEM_USERNAME = "..."
$env:DATATEM_PASSWORD = "..."
$env:DATATEM_CLIENT_ID = "..."
$env:DATATEM_CLIENT_SECRET = "..."
$env:FIREBASE_SERVICE_ACCOUNT_JSON = (Get-Content .\podsadministrator-firebase-adminsdk-*.json -Raw)
$env:CORS_ALLOWED_ORIGINS = "http://localhost:5173"
```

Também é possível usar `$env:GOOGLE_APPLICATION_CREDENTIALS` com o caminho do service account.

## Executar

```powershell
cd apis\connectivity
..\..\backend\.venv\Scripts\python.exe -m uvicorn fastapi_app.main:app --reload --port 8000
```

## Testes

```powershell
cd apis\connectivity
..\..\backend\.venv\Scripts\python.exe -m pytest -q --disable-warnings
```

## Endpoints

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/datatem/health` | Health check público |
| GET | `/api/datatem/bootstrap` | Inventário DATATEM, SIMs manuais, conectividade e atribuições |
| GET | `/api/datatem/simcards` | Inventário DATATEM salvo no Firestore |
| POST | `/api/datatem/simcards/sync` | Força sincronização do inventário |
| GET | `/api/datatem/connections` | Conectividade isolada |
| GET | `/api/datatem/assignments` | Atribuições atuais |
| GET | `/api/datatem/history` | Histórico; filtro opcional `simcardId` |
| GET | `/api/datatem/simcards/{id}` | Detalhe de um SIM |
| POST | `/api/datatem/simcards/{id}/assign` | Atribui um SIM DATATEM ou manual |
| POST | `/api/datatem/simcards/{id}/release` | Libera o chip |
| PATCH | `/api/datatem/simcards/{id}/assignment` | Edita metadados operacionais |
| GET | `/api/datatem/manual-simcards` | Lista SIMs manuais |
| POST | `/api/datatem/manual-simcards` | Cria SIM manual e atribuição em transação |
| PATCH | `/api/datatem/manual-simcards/{id}` | Edita SIM manual com auditoria |
| DELETE | `/api/datatem/manual-simcards/{id}` | Exclui SIM manual, libera atribuição e registra auditoria |
| POST | `/api/datatem/legacy-migrate` | Reconcilia chips legados com DATATEM/manual de forma idempotente |
| GET | `/api/datatem/legacy-metadata` | Metadados legados por identificador inequívoco |

As rotas DATATEM não exigem token do PODSAdministrator. O login DATATEM é estático, feito somente no backend com `DATATEM_USERNAME`, `DATATEM_PASSWORD`, `DATATEM_CLIENT_ID` e `DATATEM_CLIENT_SECRET`, e vale para qualquer usuário do sistema. Nenhuma rota de escrita chama `DatatemClient`. Inventário, atribuições, histórico e SIMs manuais são persistidos no Firestore; não há cache em memória para dados operacionais.

## SIMs manuais

- Coleção protegida: `manualSimcards`.
- ID lógico: `manual:{docId}`.
- `source: "manual"` e `notes` opcionais.
- Tecnologia aceita: `4G` ou `NB-IoT`.
- Criação, edição, exclusão, atribuição e liberação gravam `chipAssignmentHistory`.
- Chips antigos da coleção `chips` são reconciliados no primeiro `bootstrap`: com match DATATEM viram `chipAssignments`; sem match viram `manualSimcards` com `source: "manual"` e atribuição legada.

## Deploy

`apis/connectivity/render.yaml` define o serviço `podsadministrator-connectivity-api`, com `rootDir: apis/connectivity`, build Python e health check em `/api/datatem/health`.
