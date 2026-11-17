# Coding Conventions

**Analysis Date:** 2026-11-17

## Naming Patterns

**Files:**
- Componentes React: PascalCase com `.tsx` — `apps/web/src/components/PrivateRoute.tsx`, `apps/web/src/pages/TestbookEditor.tsx`, `apps/web/src/layouts/DashboardLayout.tsx`.
- Primitivas de UI (shadcn/base-ui): kebab-case com `.tsx` — `apps/web/src/components/ui/button.tsx`, `apps/web/src/components/ui/alert-dialog.tsx`.
- Hooks: `use*.ts` em camelCase — `apps/web/src/hooks/use-mobile.ts`, `apps/web/src/hooks/useSimcardInventory.ts`.
- Contextos: `<Domínio>Context.tsx` — `apps/web/src/contexts/AuthContext.tsx`, `apps/web/src/contexts/ToastContext.tsx`.
- Serviços / repositórios: `<Domínio>Service.ts` e `<Domínio>Repository.ts` — `apps/web/src/services/DatatemService.ts`, `apps/web/src/repositories/AuthRepository.ts`, `apps/web/src/core/services/firebaseService.ts`.
- Barris: `index.ts` — `apps/web/src/layouts/index.ts`, `apps/web/src/modules/index.ts`, `firebase/converters/index.ts`, `shared/schemas/index.ts`.
- Python: módulos `snake_case.py` — `apis/connectivity/fastapi_app/simcard_store.py`, `routes_datatem.py`, `firebase_client.py`; pacote `apis/connectivity/fastapi_app/datatem/`; testes `test_<alvo>.py` em `apis/connectivity/tests/test_assignment.py`.
- Nomes de coleções Firestore em camelCase dentro de strings — `chipAssignments`, `chipAssignmentHistory`, `datatemSyncState` (constantes em `apis/connectivity/fastapi_app/simcard_store.py:26-31`).

**Functions:**
- TypeScript: camelCase; hooks começam com `use` (`export function useSimcardInventory(...)`, `apps/web/src/hooks/useSimcardInventory.ts:32`); helpers privados podem ser `function` local (`isNonEmptyString`, `apps/web/src/core/validation/platformValidators.ts:3`).
- Métodos de classe em camelCase (`AuthService.getOrCreateUserProfile`, `apps/web/src/services/AuthService.ts:13`; `DatatemStore.assign`, `apis/connectivity/fastapi_app/simcard_store.py`).
- Python: funções `snake_case` (`get_datatem_client`, `_http_error`, `_load_inventory` em `apis/connectivity/fastapi_app/routes_datatem.py:40,64,87`); helpers privados com `_` ou `__` prefix; classes PascalCase (`SimcardStore`, `DatatemSettings`, `AuthenticatedUser`, `FakeDB`).

**Variables:**
- TypeScript: `camelCase`; constantes de módulo em `UPPER_SNAKE_CASE` — `API_URL`, `FRIENDLY_MESSAGES` (`apps/web/src/services/DatatemService.ts:12,14`), `RETRY_DELAYS` (`apps/web/src/hooks/useSimcardInventory.ts:12`).
- Python: `snake_case` para locais; `UPPER_SNAKE_CASE` para constantes de módulo — `SETTINGS`, `TOKEN_RESPONSE` (`apis/connectivity/tests/test_datatem_client.py:14,29`), `SYSTEM_ACTOR` (`routes_datatem.py:33`); atributos privados com `_` (`_client`, `_db`, `_env_loaded`).
- Prefira `const`/`readonly` em TypeScript e `@dataclass(frozen=True)` para configuração Python (`BackendSettings`, `DatatemSettings`).

**Types:**
- `interface` para contratos de props/contexto — `ErrorStateProps` (`apps/web/src/components/blocks/ErrorState.tsx:6`), `AuthContextType` (`apps/web/src/contexts/AuthContext.tsx:8`), `InventoryState` (`apps/web/src/hooks/useSimcardInventory.ts:5`).
- `type` para aliases e uniões — `PageType`, `Fiscalizacao` (`apps/web/src/types.ts:1,8`), `RepositoryResult<T>` (`apps/web/src/core/repositories/BaseRepository.ts:3`).
- Schemas Zod em `shared/schemas/index.ts` (`userSchema`, `testbookSchema`) com tipos derivados em `shared/types/`; conversores Firestore validam com `.parse()` antes de gravar (`firebase/converters/index.ts:33,73`).
- Modelos Pydantic no backend usam campos em camelCase para casar com o contrato do front (`apis/connectivity/fastapi_app/datatem/models.py`); configurações usam `dataclass(frozen=True)` com `from_env()` (`apis/connectivity/fastapi_app/config.py:55-74`).
- Existem duas classes `BaseRepository` distintas — `apps/web/src/repositories/BaseRepository.ts` (Firestore direto, `getById` retorna `T | null`) e `apps/web/src/core/repositories/BaseRepository.ts` (wrapper `RepositoryResult<T>` sobre `firebaseService`). Ao estender, escolha explicitamente a camada desejada.

## Code Style

**Formatting:**
- Não há Prettier, Biome ou `.editorconfig` no repositório. Estilo é misto: aspas duplas e simples coexistem, ponto e vírgula é opcional. Siga o estilo do arquivo que está sendo editado; em arquivos novos prefira aspas duplas e `;` (majoritário em `apps/web/src/services/`, `apps/web/src/hooks/`).
- `strict: true` em ambos os tsconfigs. `apps/web/tsconfig.app.json:20-25` habilita `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`, `noFallthroughCasesInSwitch` e `noUncheckedSideEffectImports`; `apps/web/tsconfig.json:20-21` desliga os dois primeiros. Trate `tsconfig.app.json` como a referência para código novo.
- UI usa Tailwind CSS v4 com classes utilitárias e o helper `cn()` (`apps/web/src/lib/utils.ts:4`); variantes de componentes são definidas com `cva()` (`apps/web/src/components/ui/button.tsx:6-41`).
- Python usa `from __future__ import annotations` no topo de todos os módulos de `apis/connectivity/fastapi_app/` e testes; type hints em assinaturas (`-> None`, `dict[str, Any] | None`).

**Linting:**
- ESLint flat config em `apps/web/eslint.config.js`: `js.configs.recommended` + `tseslint.configs.recommended` para `**/*.{ts,tsx}`, `globalIgnores(['dist'])`. Não há regras customizadas de React Hooks/Refresh habilitadas apesar dos pacotes instalados.
- Comando: `npm run web:lint` (equivalente a `npm run lint --workspace=apps/web`, com `--max-warnings 0`).
- Verificação de tipos: `npx tsc -p apps/web/tsconfig.app.json --noEmit`.
- `docs/DATATEM_INTEGRATION.md:134` registra que `web:lint` e `tsc` já falhavam por problemas preexistentes; `npm run web:build` é a verificação de baseline confiável. Não altere essa baseline sem corrigir a causa.
- Não há lint configurado para os pacotes `apis/research-etl` ou `apis/reporting-functions` além de `npx eslint .` em `apis/reporting-functions/package.json:5`.

## Import Organization

**Order:** Não há ordem forçada por lint; o padrão observado é:
1. Bibliotecas externas (`react`, `firebase/firestore`, `firebase/auth`, `fastapi`, `httpx`).
2. Imports absolutos via alias do frontend (`@/components/ui/button`, `@/firebase`) ou tipos compartilhados (`shared/types/auth`).
3. Imports relativos do próprio módulo (`../firebase`, `../services/DatatemService`) — comuns em `apps/web/src/services/` e `apps/web/src/hooks/`.
4. Python: `from __future__ import annotations` → stdlib → terceiros → relativos (`from .config import settings`).

Use `import type` para tipos puros em TypeScript — ver `apps/web/src/services/DatatemService.ts:1-10` e `apps/web/src/core/validation/platformValidators.ts:1`.

**Path Aliases:**
- `@/*` → `src/*` definido em `apps/web/tsconfig.json:24-27` e resolvido pelo plugin `vite-tsconfig-paths` em `apps/web/vite.config.ts:3,8`.
- Workspaces npm: `shared`, `firebase` (declarados em `package.json:5-9`); imports como `shared/types/auth` e `shared/schemas`.
- Python: módulos importados como `fastapi_app.*` com `--app-dir apis/connectivity` (scripts em `package.json:15-16`).

## Error Handling

**Patterns:**
- Erros de API no front são classes customizadas com código/status e factory: `DatatemApiError` + `DatatemApiError.fromStatus()` (`apps/web/src/services/DatatemService.ts:30-54`). A tradução para o usuário passa por `FRIENDLY_MESSAGES` e `friendlyMessage(error)` (`:14-28`, `:174-178`).
- `extractError()` lê `{ detail: { code, message } }`, nunca repassa detalhes crus de upstream; `DOMException` com `AbortError` é preservado, demais falhas de rede viram `network_unavailable`/503 (`DatatemService.ts:56-113`).
- Retry com backoff explícito e guardas de concorrência: `RETRY_DELAYS = [600, 1200, 2400]`, `AbortController`, `generationRef` e `inFlightRef` em `apps/web/src/hooks/useSimcardInventory.ts:12-112`. Somente `status >= 500` e `network_unavailable` são retentáveis.
- Hooks e páginas usam `try/catch` com `console.error` e estado de erro; validação de domínio lança `new Error("...")` com mensagem curta (`apps/web/src/core/validation/platformValidators.ts:7-29`).
- Backend: `DatatemErrorKind` (Enum), `MESSAGES` e `STATUS_MAP` em `apis/connectivity/fastapi_app/datatem/errors.py:6-49`; `DatatemError` é documentado como "nunca contém credenciais" (`:52-69`); `_http_error()` converte para `HTTPException` com `detail={"code": ..., "message": ...}` (`routes_datatem.py:64-71`). Conflitos de transação usam `AssignmentConflictError` (`:98-100`) e são recuperados por retry na camada de store.
- Dependências indisponíveis retornam 503 (`get_simcard_store`, `routes_datatem.py:57-61`); chamadas bloqueantes ao Firestore passam por `asyncio.to_thread` (`:91,104,117`).
- Para uma integração nativa com SharePoint, aplique o mesmo desenho: erros sanitizados por enum/código (state/PKCE inválido, token rejeitado, conflito de fila), sem valores de `state`, `code`, tokens ou segredos nas mensagens; autorização por usuário via dependency injectável no estilo `require_firebase_user` (`apis/connectivity/fastapi_app/firebase_client.py:82-115`). Note que hoje as rotas DATATEM não usam essa dependency (`apis/connectivity/README.md:74`) — não replique essa ausência em rotas novas.

## Logging

**Framework:** `console` do navegador no frontend; `console.log`/`console.error` com prefixo nos serviços Node (`apis/research-etl/src/server.js:85-107`); nenhum logger estruturado, Sentry ou agregador configurado.

**Patterns:**
- `console.error` em `catch` de hooks/páginas, geralmente com mensagem em português — `apps/web/src/hooks/usePages.ts:36,66`, `useTodo.ts:180-307`, `apps/web/src/contexts/AuthContext.tsx:68`.
- Auditoria de ações de usuário é persistida no Firestore via `logAction(action, target, type)` em `apps/web/src/utils/systemLogger.ts:5-20`; falhas de auditoria são engolidas com `console.error`.
- Backend usa exceções e detalhes HTTP em vez de logs; não há `logging` configurado em `apis/connectivity/`.

## Comments

**When to Comment:**
- Comentários curtos explicam intenção ou compatibilidade, não o óbvio — veja a nota sobre versões do SDK do Firestore em `apis/connectivity/fastapi_app/simcard_store.py:39-43` e o comentário de conversão de datas em `firebase/converters/index.ts:23`.
- Comentários em português predominam em código legado (`apps/web/src/utils/systemLogger.ts:4,22`); código novo em `apps/web/src/core/` e `apps/web/src/services/DatatemService.ts` é basicamente autocontido.

**JSDoc/TSDoc:**
- Uso esporádico: docstring explicando invariante de segurança em `apis/connectivity/fastapi_app/datatem/errors.py:53`. Prefira esse formato para documentar invariantes (ex.: "o payload da fila não contém tokens").

## Function Design

**Size:** Funções pequenas e nomeadas são a norma nas camadas novas (`DatatemService.ts`, `platformValidators.ts`, `firebaseService.ts`); exceções legítimas são orquestradores grandes — `apps/web/src/pages/TestbookEditor.tsx`, `apis/connectivity/fastapi_app/routes_datatem.py` (~469 linhas) e `simcard_store.py` (~595 linhas). Extraia lógica nova para helpers em vez de engrossar esses arquivos.

**Parameters:** Parâmetros tipados explicitamente; objetos de opções para parâmetros opcionais (`request(path, { method, body, signal })` em `DatatemService.ts:75-78`); `AbortSignal` é propagado em todas as chamadas HTTP do front. Python usa parâmetros keyword-only após `*` (`_resolve_simcard(..., *, allow_unknown=False)` em `routes_datatem.py:146-151`) e `TypeVar` para helpers genéricos (`_chunks`, `simcard_store.py:50`).

**Return Values:** Tipos explícitos (`Promise<T>`, `T | null`), `RepositoryResult<T>` para operações de repositório `core`, tuplas nomeadas por convenção para resultados com avisos (`(cards, warnings)`, `(connections, warnings)` em `datatem/normalize.py`), e dicionários estruturados para operações de domínio (`{"simcardId", "previousActive"}`, `{"changed": bool}` em `simcard_store.py`). Use `null`/`None` para "não encontrado" em vez de exceção.

## Module Design

**Exports:** Predomínio de named exports; default export reservado para páginas, layouts e alguns componentes (`export default function PrivateRoute()` em `apps/web/src/components/PrivateRoute.tsx:6`, `export default AppRoutes` em `apps/web/src/routes/index.tsx:91`). Serviços e repositórios exportam classe + instância singleton: `export class AuthService` / `export const authService = new AuthService()` (`apps/web/src/services/AuthService.ts:10,54`), mesma forma em `platformService.ts:6,41`, `datatemApi` (`DatatemService.ts:115`). Construtores aceitam dependências injetáveis (`constructor(private repo: AuthRepository = authRepository)`) — mantenha esse padrão para permitir testes com fakes.

**Barrel Files:** Use `index.ts` para agrupar módulos de uma pasta — `apps/web/src/layouts/index.ts`, `apps/web/src/modules/index.ts`, `apps/web/src/modules/dashboard/index.ts`, `firebase/index.ts`, `firebase/repositories/index.ts`, `shared/schemas/index.ts`. Em Python, reexporte tipos em `apis/connectivity/fastapi_app/datatem/__init__.py` quando fizer sentido.

**Convenção para código novo (integração SharePoint):** mantenha lógica pura (validação de state/PKCE, transições de fila, decisão de retry/conflito) em funções exportadas separadas de E/S — espelhe `datatem/normalize.py` (puro e testado diretamente) e `simcard_store.py` (lógica de domínio sobre um cliente injectável). Isso é pré-requisito para testar a integração SharePoint sem rede.

---

*Convention analysis: 2026-11-17*
