# Testing Patterns

**Analysis Date:** 2026-11-17

## Test Framework

**Runner:**
- pytest 8.x — dependência em `apis/connectivity/requirements.txt:9`; configuração em `apis/connectivity/pytest.ini` (`testpaths = tests`, `asyncio_mode = auto`); plugin `pytest-asyncio>=0.24,<1` em `apis/connectivity/requirements.txt:10`.
- Testes assíncronos também marcados explicitamente com `@pytest.mark.asyncio` — ver `apis/connectivity/tests/test_datatem_client.py:63,84,117,130,175,206`.
- **Nenhum runner JavaScript instalado:** não há vitest, jest, @testing-library, jsdom, happy-dom, Playwright ou Cypress em `apps/web/package.json`, `package.json` ou `package-lock.json`. `apps/web/package.json:6-11` contém apenas `dev`, `build`, `lint`, `preview`. Não existe script `test` em nenhum workspace.
- Não há CI: nenhum `.github/workflows/`, `.gitlab-ci.yml` ou pipeline equivalente no repositório. Não há `conftest.py`, `pyproject.toml`, `setup.cfg` ou `tox.ini`.

**Assertion Library:**
- `assert` nativo do pytest. Sem `pytest-mock`, sem `unittest.mock`, sem biblioteca de assertions fluentes.
- `pytest.raises(...) as error` para exceções, combinado com assertions sobre `error.value.kind` / `.message` — `apis/connectivity/tests/test_datatem_client.py:123-127,214-217`.
- Fakes e stubs escritos à mão substituem frameworks de mock (ver **Mocking**).

**Run Commands:**
```bash
npm run api:connectivity:test                                   # root: python -m pytest -q apis/connectivity/tests
cd apis/connectivity && python -m pytest -q --disable-warnings  # forma documentada em apis/connectivity/README.md:45-50
..\..\backend\.venv\Scripts\python.exe -m pytest -q --disable-warnings  # venv real usado no Windows (docs/DATATEM_INTEGRATION.md:120-123)
# não há comando de watch mode, nem de coverage
# baseline de frontend (não são testes): npm run web:build; npm run web:lint; npx tsc -p apps/web/tsconfig.app.json --noEmit
```
- `docs/DATATEM_INTEGRATION.md:125` registra a última execução conhecida: `24 passed, 56 warnings in 2.12s`.
- `docs/DATATEM_INTEGRATION.md:134` registra que `web:lint` e `tsc` falhavam por problemas preexistentes; `web:build` é a verificação de bundle confiável.

## Test File Organization

**Location:**
- Único diretório de testes: `apis/connectivity/tests/`, separado do código em `apis/connectivity/fastapi_app/`.
- Nenhum outro arquivo `*.test.*`, `*.spec.*` ou `test_*.py` existe em `apps/web/`, `firebase/`, `shared/`, `apis/research-etl/` ou `apis/reporting-functions/`.

**Naming:**
- Python: `test_<alvo>.py` — `test_assignment.py`, `test_datatem_client.py`, `test_normalize.py`.
- Funções: `test_<comportamento>_<resultado>()` — `test_transaction_retry_after_conflict_does_not_duplicate_history` (`test_assignment.py:262`).
- Para a integração SharePoint, use o mesmo padrão em `apis/connectivity/tests/`, por exemplo `test_sharepoint_oauth.py`, `test_sharepoint_queue.py`, `test_sharepoint_upload.py`.

**Structure:**
```
apis/connectivity/
├── pytest.ini                  # testpaths=tests, asyncio_mode=auto
├── requirements.txt            # pytest, pytest-asyncio
├── tests/
│   ├── test_assignment.py      # 443 linhas: fakes de Firestore + store + TestClient
│   ├── test_datatem_client.py  # 220 linhas: httpx.MockTransport, token/refresh/paginação
│   └── test_normalize.py       # 69 linhas: funções puras de normalização
└── fastapi_app/                # código sob teste (sem testes co-locados)
```

## Test Structure

**Suite Organization:**
```python
# apis/connectivity/tests/test_datatem_client.py:14-27,54-60,63-81
SETTINGS = DatatemSettings(base_url="https://datatem.test", ...)
TOKEN_RESPONSE = {"authenticationToken": {...}}

class MemoryStore(TokenStore):
    def __init__(self) -> None:
        self.session: StoredSession | None = None
    def load(self) -> StoredSession | None: ...
    def save(self, session: StoredSession) -> None: ...

def make_client(handler, store: TokenStore | None = None) -> DatatemClient:
    transport = httpx.MockTransport(handler)
    return DatatemClient(SETTINGS, http_client=httpx.AsyncClient(transport=transport),
                         token_store=store or MemoryStore())

@pytest.mark.asyncio
async def test_login_uses_base64_password_and_nested_token():
    captured: dict[str, object] = {}
    def handler(request: httpx.Request) -> httpx.Response:
        captured.update(json.loads(request.content))
        return httpx.Response(200, json=TOKEN_RESPONSE)
    client = make_client(handler)
    await client.ensure_session()
    assert captured["password"] == "c2VjcmV0"
    await client.close()
```

**Patterns:**
- Constantes de cenário no topo do módulo (`ACTOR`, `OTHER`, `SIM`, `MANUAL` em `test_assignment.py:20-36`; `SETTINGS`, `TOKEN_RESPONSE` em `test_datatem_client.py:14-37`) — não há fixtures pytest.
- Helpers de construção são funções simples: `make_client(handler, store)`, `destination(project="Projeto A")`, `history_events(db)` (`test_assignment.py:185-195`).
- Nomes descritivos e longos, com comportamento esperado embutido; um cenário por teste.
- Testes de endpoints usam `TestClient(app)` com `app.dependency_overrides`, sempre limpos em `try/finally` (`test_assignment.py:405-417,419-443`).
- Testes de store usam o domínio real (`SimcardStore(db)`) sobre um banco falso em memória, verificando o estado resultante em `db.data` (`test_assignment.py:198-209`).

## Mocking

**Framework:** Nenhum. Fakes, stubs e `httpx.MockTransport` escritos à mão; `monkeypatch` do pytest para funções de módulo; `app.dependency_overrides` do FastAPI para dependencies.

**Patterns:**
```python
# apis/connectivity/tests/test_assignment.py:419-443 — override + "exploding" stub
app.dependency_overrides[get_simcard_store] = lambda: store
app.dependency_overrides[get_datatem_client] = lambda: ExplodingDatatemClient()
try:
    response = TestClient(app).post("/api/datatem/simcards/8379297/assign", json={...})
finally:
    app.dependency_overrides.clear()

class ExplodingDatatemClient:
    async def get_simcard(self, simcard_id: str) -> SimcardRecord:
        raise AssertionError("assign não deve consultar a DATATEM")   # linha 332-334
```
```python
# apis/connectivity/tests/test_assignment.py:101-145,167-179 — conflito injetado
class FakeTransaction:
    def __init__(self, db: "FakeDB", fail_first: bool = False) -> None: ...
    def commit(self) -> None:
        if self._fail_first:
            self._fail_first = False
            raise Aborted("concurrent update")   # simula google.api_core.exceptions.Aborted

db = FakeDB(fail_first=True)
store = SimcardStore(db)
```

**What to Mock:**
- HTTP externo: `httpx.MockTransport(handler)` com um handler que inspeciona URL, headers e body — `test_datatem_client.py:55-60,67-72,134-162`. Não existe chamada de rede real em nenhum teste.
- Firestore: hierarquia de fakes `FakeDB` / `FakeCollection` / `FakeDocument` / `FakeSnapshot` / `FakeTransaction` / `FakeBatch` em `test_assignment.py:39-183`. `FakeTransaction` reproduz a API de transação (incluindo `get()` retornando iterável) e permite injetar `Aborted` no primeiro `commit()`.
- Armazenamento de token: `MemoryStore(TokenStore)` (`test_datatem_client.py:40-51`).
- Cliente externo inteiro: `StubDatatemClient` (retorna listas vazias) e `ExplodingDatatemClient` (falha se chamado) em `test_assignment.py:332-343`.
- Funções de módulo sem dependency injection: `monkeypatch.setattr("fastapi_app.routes_datatem.get_optional_store", lambda: None)` (`test_assignment.py:406-407`).

**What NOT to Mock:**
- Funções puras: `normalize_inventory`, `normalize_connections`, `classify_lifecycle` (`apis/connectivity/fastapi_app/datatem/normalize.py`) são testadas diretamente em `test_normalize.py:10-69`.
- Regras de domínio: `SimcardStore.assign/release/update_metadata/create_manual_with_assignment` rodam reais sobre `FakeDB` (`test_assignment.py:198-330`).
- Mapeamento de erros: `DatatemError.from_status`, `DatatemErrorKind` e mensagens são exercitados de verdade (`test_datatem_client.py:117-127,206-220`).

**Serviços externos e o que ainda não é mockado:** DATATEM e Firestore são mockados como acima. Firebase Auth **não** é mockado em nenhum teste — as rotas DATATEM não exigem token e o helper `require_firebase_user` (`apis/connectivity/fastapi_app/firebase_client.py:82-115`) não possui testes. Para a integração SharePoint, será preciso adicionar fakes para (1) verificação de ID token do Firebase, (2) validação de `state`/PKCE, (3) autorização por usuário, (4) fila durável com retries/conflitos — reutilizando `FakeDB(fail_first=True)` e `app.dependency_overrides` como base.

## Fixtures and Factories

**Test Data:**
```python
# apis/connectivity/tests/test_assignment.py:20-36,185-191
ACTOR = ResponsibleActor(uid="uid-1", name="Ana", email="ana@example.com")
SIM = SimcardRecord(id="SIM-1", iccid="8955", ...)

def destination(project: str = "Projeto A") -> AssignmentDestination:
    return AssignmentDestination(destinationType="manual_project", projectName=project, ...)
```
- Dados de resposta externa ficam em constantes de dicionário (`TOKEN_RESPONSE`, `test_datatem_client.py:29-37`), com valores fictícios (`https://datatem.test`, `access-1`, `refresh-1`).
- Cenários de erro usam fakes especializados em vez de parametrização: `FakeDB(fail_first=True)` para conflito, handler que devolve `503` para indisponibilidade (`test_datatem_client.py:206-220`).

**Location:**
- Todo dado/factory vive dentro do próprio módulo de teste. Não há `conftest.py`, diretório de fixtures ou fábricas compartilhadas entre arquivos; se um fake for necessário em dois módulos, hoje ele é duplicado.

## Coverage

**Requirements:** Nenhuma meta, nenhum `pytest-cov`, nenhuma configuração de cobertura e nenhuma etapa de CI. A único registro quantitativo é o resultado documentado em `docs/DATATEM_INTEGRATION.md:125` (24 testes).

**View Coverage:**
```bash
# não configurado no repositório; seria necessário instalar pytest-cov e executar, por exemplo:
python -m pytest --cov=fastapi_app apis/connectivity/tests
```

## Test Types

**Unit Tests:**
- `apis/connectivity/tests/test_normalize.py` — funções puras, casos de borda (respostas vazias/inconsistentes, deduplicação por id/iccid, statuses desconhecidos).
- `apis/connectivity/tests/test_datatem_client.py` — login Base64, refresh single-flight, sanitização de respostas inválidas, paginação, retry em 401, mapeamento de 503.
- `apis/connectivity/tests/test_assignment.py` — transações, histórico, CRUD manual, reconciliação de legados, persistência de inventário.

**Integration Tests:**
- Feitos com `fastapi.testclient.TestClient` sobre o `app` real de `apis/connectivity/fastapi_app/main.py`, substituindo dependencies por fakes — `test_assignment.py:392-443` (CORS preflight, bootstrap sem token, Endpoint de assign que nunca chama a DATATEM).
- Não há uso do Firebase Emulator Suite em testes. `npm run firebase:emulators` e `npm run api:reporting:serve` existem em `package.json:21-23`, mas nenhum teste se conecta a eles; `firebase.json` não define configuração de emuladores.

**E2E Tests:** Não utilizados. Nenhum runner de browser instalado ou configurado.

**Gaps para a integração SharePoint (estado atual):** não existem testes para OAuth state/PKCE, verificação de Firebase ID token, autorização por usuário, fila durável no Firestore com retry/conflito, upload streaming para R2 ou garantias de no-cache/no-temp. Também não há runner de testes no frontend, o que impede testes de componentes/hooks de OAuth no navegador sem adicionar infraestrutura nova.

## Common Patterns

**Async Testing:**
```python
# apis/connectivity/tests/test_datatem_client.py:84-114
@pytest.mark.asyncio
async def test_refresh_uses_configured_grant_and_keeps_single_flight():
    calls = {"refresh": 0}
    def handler(request: httpx.Request) -> httpx.Response:
        calls["refresh"] += 1
        return httpx.Response(200, json={...})
    store = MemoryStore()
    client = make_client(handler, store)
    client._session = StoredSession(access_token="expired", expires_at=time.time() - 1)
    await client.ensure_session()
    await client.ensure_session()
    assert calls["refresh"] == 1
    await client.close()
```
- `asyncio_mode = auto` em `pytest.ini` convive com `@pytest.mark.asyncio` explícito; mantenha o decorator em testes novos para consistência.
- Contadores em dicionário (`calls`, `attempts`, `seen_pages`) capturam número/ordem de chamadas dentro do handler — use o mesmo recurso para assertar single-flight, retries e idempotência de fila.

**Error Testing:**
```python
# apis/connectivity/tests/test_datatem_client.py:117-127
client = make_client(lambda _request: httpx.Response(200, json={"unexpected": True}))
with pytest.raises(DatatemError) as error:
    await client.ensure_session()
assert error.value.kind == DatatemErrorKind.INVALID_RESPONSE
assert "secret" not in str(error.value)     # garante que credenciais nunca vazam
```
- Asserções de segurança explícitas: nenhuma credencial ou detalhe bruto de upstream nas mensagens (`test_datatem_client.py:126,217`). Aplique o mesmo a `state`, `code`, tokens e URLs assinadas do SharePoint.
- Conflito/retry é verificado pelo estado final, não pela exceção: `db = FakeDB(fail_first=True)` → `assert len(history_events(db)) == 1` (`test_assignment.py:262-266`).
- "Nunca chamar" é verificado com stub que lança `AssertionError` (`ExplodingDatatemClient`, `test_assignment.py:332-334`).

---

*Testing analysis: 2026-11-17*
