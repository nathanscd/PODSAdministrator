# Stack Research

**Domain:** Integração nativa Microsoft SharePoint — Atlas 1.0 / PODSAdministrator (milestone v2.0)
**Researched:** 2026-11-17
**Confidence:** HIGH (versões e limites oficiais) / MEDIUM (decisões de integração e configuração)

> **Escopo:** apenas as adições/alterações de stack necessárias aos NOVOS recursos (OAuth delegado, Graph file APIs, cache MSAL cifrado, R2 como staging, fila durável no Firestore, backend Python Gen2). Firebase Auth/Firestore, monorepo, Zod, design system, widget platform e funções PDF já validados **não** são reavaliados aqui.

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended | Confiança |
|---|---|---|---|---|
| Python / runtime Cloud Functions Gen2 | `python312` (Python 3.12) | Runtime das funções `sharepoint_*` | É o runtime já declarado no repositório (`apis/connectivity/render.yaml`), é totalmente suportado (depreciação 2028-10-02, descomissionamento 2029-04-02) e evita a migração para `python313/314`. `python310` já entrou em depreciação em 2026-10-04 — não usar. | HIGH |
| `firebase-functions` (Python) | `0.6.0` | Decorators `https_fn`/`firestore_fn` e descoberta de funções pelo Firebase CLI | Fecha o contrato de deploy com `firebase deploy --only functions` no mesmo projeto Firebase, sem introduzir um pipeline `gcloud` paralelo. Requer Python ≥3.10. | HIGH |
| `firebase-admin` (Python) | `7.8.0` | `auth.verify_id_token()` + Firestore transacional com ADC | Reutiliza o padrão já existente em `apis/connectivity/fastapi_app/firebase_client.py:82`, mas em Gen2 com Application Default Credentials — nenhum JSON de service account em disco (isolamento de credenciais). `google-cloud-firestore` `2.34.1` vem como dependência transitiva. | HIGH |
| `msal` | `1.39.0` | Cliente confidencial, Authorization Code + PKCE, refresh delegado | `ConfidentialClientApplication.initiate_auth_code_flow()` gera automaticamente `code_verifier`/`code_challenge` S256, `state` e `nonce`; `acquire_token_by_auth_code_flow()` valida o retorno. `acquire_token_silent()` renova tokens sem interação usando o cache por conta. PKCE **não** precisa ser implementado à mão. | HIGH |
| `cryptography` | `50.0.2` | Cifrar o blob serializado do cache MSAL com AES-256-GCM | `msal.SerializableTokenCache.serialize()` devolve JSON em texto puro e não oferece persistência nem criptografia. `AESGCM` (com nonce de 12 bytes e AAD ligado a `uid`/tenant) é a única dependência criptográfica necessária. | HIGH |
| `boto3` | `1.44.5` | Staging temporário de binários no Cloudflare R2 via API S3 | Documentado oficialmente pela Cloudflare: `endpoint_url=https://<ACCOUNT_ID>.r2.cloudflarestorage.com`, `region_name="auto"`. Suporta `PutObject`, `GetObject`, `DeleteObject`, multipart (`create_multipart_upload`/`upload_part`/`complete`/`abort`) e presigned URLs. | HIGH |
| `httpx` | `0.28.1` | Chamadas REST ao Microsoft Graph v1.0 com o access token delegado | Já é dependência do repositório (`apis/connectivity`). O conjunto de file APIs necessário (sites, drives, pastas, upload, download, ETag) é pequeno e o Graph SDK adicionaria `azure-identity` + Kiota + 4 serializers ao cold start sem benefício real aqui. | MEDIUM |
| `functions-framework` | `3.10.2` | Execução local e emulador das funções HTTP | É o framework embutido no runtime Gen2; declarar a versão garante paridade entre `firebase emulators:start` e produção. | HIGH |

**Nota sobre o Graph SDK (MEDIUM):** o pacote mantido é **`msgraph-sdk` `1.65.0`** (Python ≥3.10, Kiota, `httpx`, `azure-identity`, `msgraph_core`). O nome antigo `microsoft-graph-sdk` retorna **404 no PyPI** — não existe mais como pacote instalável. O `AzureIdentityAuthenticationProvider` do SDK espera uma credential **assíncrona do Azure Identity**, enquanto o projeto exige tokens **delegados** vindos de um cache MSAL serializado no Firestore; adaptar isso custa mais que chamar a REST diretamente.

### Supporting Libraries

| Library | Version | Purpose | When to Use | Confiança |
|---|---|---|---|---|
| `google-cloud-secret-manager` | `2.32.0` | Leitura/rotação programática da chave AES e do client secret | **Opcional.** Preferir `--set-secrets` do Gen2 (injeção como env var); adicionar o pacote apenas se a rotação precisar acontecer sem redeploy. | MEDIUM |
| `respx` | `0.23.1` | Mock de requests `httpx` (Microsoft Graph) | Sempre que testar navegação/upload/comportamento de ETag sem tenant real. | HIGH |
| `moto` | `5.2.5` | Mock da API S3 (Cloudflare R2) | Sempre que testar multipart, limpeza pós-confirmação e SHA-256. | HIGH |
| `pytest` / `pytest-asyncio` | `9.2.0` / `1.5.0` | Runner dos testes assíncronos das funções | O repositório já usa `pytest>=8,<9`; alinhar a faixa do `requirements-dev.txt` com o projeto (ex.: `>=8,<10`) para não divergir do `apis/connectivity`. | HIGH |
| `python-dotenv` | `1.2.4` | Carregar `.env.example` no desenvolvimento local | Somente fora do deploy; em Gen2 as variáveis vêm de config/Secret Manager. | MEDIUM |
| `google-cloud-firestore` | `2.34.1` | Transações e retry de `Aborted` na fila | Já transitivo via `firebase-admin`; **não** declarar explicitamente. | HIGH |

### Development Tools

| Tool | Purpose | Notes |
|---|---|---|
| Firebase CLI (`firebase-tools` ≥ 15.x) | Deploy do codebase Python e emuladores | Versões ≥15.5 corrigem a descoberta de código Python; runtime `python312` é aceito em `firebase.json`. |
| `firebase emulators:start` | Desenvolvimento local de Functions + Firestore | Usar mocks `respx`/`moto`; nunca credenciais Microsoft reais. |
| `.env.example` | Configuração declarável sem segredos | `MICROSOFT_CLIENT_ID`, `MICROSOFT_TENANT_ID`, `MICROSOFT_REDIRECT_URI`, `MICROSOFT_SCOPES`, `R2_ACCOUNT_ID`, `R2_BUCKET`, `R2_ENDPOINT`. Nada com prefixo `VITE_*`. |

## Python Gen2 Cloud Functions — viabilidade e limites

| Aspecto | Valor / regra | Impacto no design |
|---|---|---|
| Runtime | `python312` suportado; `python313`, `python314` GA; `python315` preview. `python310` depreciado em 2026-10-04. | Viável: o backend Python é suportado nativamente pelo Firebase CLI e pelo Functions Framework. |
| Corpo de requisição HTTP | **32 MB não comprimidos, não aumentável** | Upload do navegador **deve** ser em chunks (≤8–16 MiB) ou via presigned URL do R2. Um `PUT` único de arquivo grande será rejeitado pelo GFE antes do código rodar (413 sem log). |
| Resposta HTTP | 10 MB em streaming / 32 MB não-streaming | Downloads devem usar `Range`/URL assinada, não devolver o binário inteiro pelo functions. |
| Timeout | até 60 min (HTTP) / 9 min (event-driven via API v2) | Suficiente para o worker de sincronização com backoff. |
| Memória / concorrência | até 32 GiB na cota (a visão Cloud Run functions cita 16 GiB / 4 vCPU); até 1000 requisições concorrentes por instância | Planejar com 512 MiB–1 GiB; usar transações Firestore com lease para evitar duplo processamento sob concorrência. |
| Eventos | 512 KB para Eventarc | Fila fica no Firestore; eventos carregam só `jobId`. |
| Dependências | `requirements.txt` ou `pyproject.toml`; `Pipfile` **não** suportado | Usar `requirements.txt` por codebase, alinhado ao padrão atual do repo. |
| Disco / persistência | Somente `/tmp` efêmero (e proibido pelas regras do projeto) | Nenhum arquivo temporário: cache MSAL vai cifrado no Firestore, binário fica no R2, tudo o mais em memória. |
| Segredos | ADC automático + `--set-secrets` via Secret Manager | Sem service account em disco e sem segredo no frontend. |

## Installation

```bash
# functions/sharepoint/requirements.txt  (runtime python312)
firebase-functions~=0.6.0
firebase-admin~=7.8.0
msal~=1.39.0
cryptography~=50.0.2
boto3~=1.44.5
httpx~=0.28.1
functions-framework~=3.10.2
# opcional, apenas se rotação em runtime:
# google-cloud-secret-manager~=2.32.0

# functions/sharepoint/requirements-dev.txt
pytest>=8,<10
pytest-asyncio>=0.24,<2
respx~=0.23.1
moto[s3]~=5.2.5

# firebase.json — functions como ARRAY (não sobrescrever o codebase Node atual)
# { "functions": [
#     { "source": "apis/reporting-functions", "codebase": "default", "runtime": "nodejs20" },
#     { "source": "functions/sharepoint", "codebase": "sharepoint", "runtime": "python312" }
#   ] }
```

## Pontos de integração com o stack existente

| Ponto existente | Ajuste necessário |
|---|---|
| `firebase.json` (hoje `functions.source = apis/reporting-functions`) | Converter `functions` em array com `codebase` separado (`default` = Node/PDF, `sharepoint` = Python) para não quebrar o deploy atual. |
| `apis/connectivity/fastapi_app/firebase_client.py:82` (`require_firebase_user`) | Replicar a verificação com `firebase_admin.auth.verify_id_token()` em `firebase_functions.https_fn`; respostas com `Cache-Control: no-store`. |
| `firestore.rules:9-25` (`datatemProtectedCollection`) | Adicionar as novas coleções protegidas (cache MSAL, fila, auditoria, quota) à lista de somente-backend; frontend não pode ler tokens. |
| `firestore.indexes.json` | Índices compostos para a fila (`status` + `createdAt`/`nextAttemptAt`) e para consultas por `uid`+`tenantId`. |
| `shared/types/**` + `shared/schemas/index.ts` + `firebase/converters/index.ts` | Novos tipos Zod apenas para **metadados/status** expostos à UI (nunca tokens nem blobs cifrados). |
| `apps/web/src/pages/SettingsPage.tsx` / `SettingsModal.tsx:347` | Substituir o placeholder "Integrações" pela UI de conectar/desconectar; frontend recebe só `status`, `lastSync` e erros sanitizados. |
| Padrão de erro `HTTPException(detail={"code","message"})` | Manter o mesmo contrato (`{"code","message"}`) para o frontend traduzir falhas do Graph/R2. |

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|---|---|---|
| `msal` + `httpx` REST v1.0 | `msgraph-sdk` `1.65.0` | Usar o SDK se o escopo evoluir para dezenas de endpoints e modelos tipados; nesse caso encapsular a credential MSAL num adaptador `azure-identity`. **Não** usar `microsoft-graph-sdk` (inexistente no PyPI). |
| AES-256-GCM via `cryptography` | `msal-extensions` `1.3.1` (`build_encrypted_persistence`) | Nunca neste projeto: a persistência do `msal-extensions` é baseada em arquivo/keyring do SO, proibida pela arquitetura. |
| `--set-secrets` (Secret Manager → env) | `google-cloud-secret-manager` | Usar o pacote se for necessário ler/rotacionar segredos em runtime sem redeploy. |
| `python312` | `python313` / `python314` | Migrar quando o projeto inteiro estiver pronto; `python314` já é suportado por firebase-tools recentes, mas aumenta o risco de drift. |
| Múltiplas funções HTTP + dispatcher fino | FastAPI + Mangum/container ASGI | Somente se o backend virar um serviço Cloud Run em container (fora da decisão atual de source-based Gen2). |
| `boto3` | `aioboto3` / `s3fs` | `aioboto3` se o worker precisar de concorrência assíncrona pesada; `s3fs` nunca (usa sistema de arquivos local). |
| Upload em chunks + presigned PUT | Enviar o binário inteiro na requisição Gen2 | Não é possível: limite fixo de 32 MB. |

## What NOT to Use

| Avoid | Why | Use Instead |
|---|---|---|
| `microsoft-graph-sdk` | Pacote retorna 404 no PyPI — não é instalável | `msgraph-sdk` se precisar de SDK; caso contrário `httpx` |
| `msgraph-sdk` + `azure-identity`/Kiota no caminho crítico | Auth provider exige credential async do Azure Identity; nossos tokens vêm do cache MSAL no Firestore; árvore de dependências grande aumenta cold start | `msal` + `httpx` |
| `msal-extensions`, `FilePersistence`, `build_encrypted_persistence` | Persistem em arquivo/keyring do SO — viola "sem cache/temp/disco" | `SerializableTokenCache` → `serialize()` → AES-256-GCM → Firestore |
| `http_cache` persistente do MSAL | Mesmo sendo apenas metadados sem PII/tokens, ainda é um cache persistente proibido | Manter o `http_cache` padrão em memória (ou omitir o parâmetro) |
| `firebase/storage`, `google-cloud-storage` | Seria Cloud Storage/GCS, fora da decisão R2 | `boto3` apontando para o endpoint R2 |
| Redis/Memorystore, SQLite, `/tmp`, IndexedDB, `localStorage`, service-worker cache | Proibidos: durabilidade só em Firestore + R2 e nenhum dado antigo pode ser exibido | Firestore (estado/metadados/credenciais cifradas) + R2 (binário pendente) |
| App-only: `acquire_token_for_client`, `ClientSecretCredential` | Quebra a autoria delegada no SharePoint | `ConfidentialClientApplication` + `acquire_token_silent(scopes, account)` |
| `fastapi` no backend Gen2 | O Functions Framework já faz o dispatch HTTP; FastAPI exigiria adapter ASGI/container | `firebase_functions.https_fn` / `@functions_framework.http` |
| Tokens, client secret ou chave AES no frontend / `VITE_*` | Vazamento de credencial corporativa | Secret Manager + `--set-secrets`; frontend recebe só status |
| `pyjwt` para validar ID token do Firebase | O Admin SDK já valida assinatura, `aud`, `iss` e expiração | `firebase_admin.auth.verify_id_token()` |
| `pycryptodome`, `pynacl`, `bcrypt` | Redundantes e aumentam a superfície de deploy | `cryptography` (`AESGCM`) |
| `exclude_scopes=["offline_access"]` | Impediria refresh tokens e quebraria a sincronização contínua | Manter `offline_access` nos scopes delegados |

## Stack Patterns by Variant

**Se o arquivo chega por upload HTTP do navegador:**
- Enviar em chunks ≤8–16 MiB; cada chunk vai para o R2 com estado de upload no Firestore; o limite de 32 MB do Gen2 é inegociável.
- **Porque** o GFE rejeita o corpo antes da função executar, sem log e sem chance de enfileirar.

**Se o binário precisa ser gravado no SharePoint:**
- R2 é somente staging: calcular SHA-256 em streaming (`hashlib`), gravar no R2, enviar ao Graph (`PUT /drives/{id}/items/{id}/content` até 250 MB; upload session acima disso), conferir ETag e **apagar o objeto do R2** só após confirmação.
- **Porque** o R2 nunca é repositório final e nenhum binário pendente pode sobreviver à confirmação.

**Se for necessário usar o SDK do Graph:**
- Isolar `msgraph-sdk` num módulo adapter com credential customizada; nunca misturar com o caminho MSAL → Firestore sem wrapper.
- **Porque** o auth provider do SDK é acoplado ao `azure-identity` assíncrono.

## Version Compatibility

| Package A | Compatible With | Notes |
|---|---|---|
| `firebase-functions` `0.6.0` | Python ≥3.10, firebase-tools ≥15, runtime `python312` | Decorator `https_fn.Request` é a interfaceHTTP |
| `firebase-admin` `7.8.0` | `google-cloud-firestore` `2.34.1` (transitivo) | Usar ADC em Gen2; nenhum arquivo de credencial |
| `msal` `1.39.0` | `requests` `2.34.2` (http_client padrão), `cryptography` `50.0.2` (nosso código) | PKCE automático desde 2020; serialize() devolve `str` JSON |
| `boto3` `1.44.5` | R2 S3 API (`region=auto`) | Configurar `Config(request_checksum_calculation="when_required", response_checksum_validation="when_required")` — o default CRC32 do botocore é rejeitado pelo R2 (`FULL_OBJECT` não suportado) |
| `httpx` `0.28.1` | `respx` `0.23.1` | Par de versões verificado para mocks de teste |
| `pytest` `>=8,<10` | `pytest-asyncio` `>=0.24,<2` | Manter faixa compatível com `apis/connectivity` |

## Confidence Assessment

| Área | Confiança | Base |
|---|---|---|
| Versões exatas das bibliotecas | HIGH | PyPI JSON API (registro canônico) consultada em 2026-11-17, cruzada com docs oficiais Microsoft/Cloudflare/Google |
| Runtime e limites Gen2 | HIGH | Docs oficiais Cloud Run functions / Firebase quotas (atualizados em 2026-11-12) |
| Escolha `msal` + `httpx` em vez do SDK | MEDIUM | Doc oficial do SDK e issue do maintainer MSAL confirmam o acoplamento a `azure-identity`; a decisão final é um tradeoff de arquitetura, não uma regra do vendor |
| Configuração R2/checksums | MEDIUM | Docs Cloudflare (2026-11-10) + incidente oficial de checksum; validar com teste de integração no primeiro phase |

## Sources

- PyPI JSON API (`https://pypi.org/pypi/<pacote>/json`) — versões e datas de release, consultado 2026-11-17 — **HIGH**
- Microsoft Learn, MSAL Python `SerializableTokenCache` e token cache serialization — `https://learn.microsoft.com/en-us/entra/msal/python/advanced/msal-python-token-cache-serialization` — **HIGH**
- MSAL Python docs / maintainer (PKCE automático) — `https://msal-python.readthedocs.io/en/latest/` e discussion #729 — **HIGH**
- Microsoft Learn, Instalar SDK Graph Python — `https://learn.microsoft.com/en-us/graph/sdks/sdk-installation` — **HIGH**
- PyPI `msgraph-sdk` 1.65.0 / README oficial — `https://pypi.org/project/msgraph-sdk/` — **HIGH**
- Microsoft Learn, Upload small files (Graph v1.0, limite 250 MB) — `https://learn.microsoft.com/en-us/graph/api/driveitem-put-content` — **HIGH**
- Cloudflare R2, S3 API compatibility e boto3 — `https://developers.cloudflare.com/r2/api/s3/api/`, `https://developers.cloudflare.com/r2/examples/aws/boto3/` (atualizado 2026-11-10 / 2026-06-08) — **HIGH/MEDIUM**
- Google Cloud, Python runtimes e Cloud Run functions overview — `https://cloud.google.com/functions/docs/concepts/python-runtime`, `https://cloud.google.com/functions/docs/2nd-gen/overview` — **HIGH**
- Firebase/Google, Quotas (request 32 MB, timeout, memória) — `https://firebase.google.com/docs/functions/quotas` (atualizado 2026-11-12) — **HIGH**
- firebase-tools, suporte a runtime Python em `firebase.json` — issues/PRs #10384, #10393, #9855 — **MEDIUM**

---
*Stack research for: novos recursos de integração Microsoft SharePoint (milestone v2.0)*
*Researched: 2026-11-17*
