# Pitfalls Research — Integração Nativa Microsoft SharePoint no Atlas (milestone v2.0)

**Domain:** Adicionar OAuth/Graph delegado + MSAL Python + Cloudflare R2 + fila durável a um SaaS Firebase existente (multi-tenant, backward-compatibility estrita)
**Researched:** 2026-11-17
**Confidence:** MEDIUM (geral) — detalhes do codebase verificados diretamente nos arquivos (HIGH); comportamento de SDKs/bibliotecas cross-checkado com documentação oficial Microsoft/Cloudflare/Firebase e RFCs via WebSearch (MEDIUM)
**Escopo:** Apenas erros ao **adicionar** estas features ao sistema existente. Não é um checklist genérico de segurança.

**Nota sobre fases:** o ROADMAP atual ainda descreve v1.0/Phases 10–12 (arquivadas). Não existe numeração de fases para v2.0. Usei rótulos de fase propostos (`Fase A`–`Fase F`) para que o planejador os renomeie. A ordem importa: `A` é pré-requisito de tudo.

| Rótulo | Fase proposta |
|--------|---------------|
| A | Fundação de Segurança (rules, auth de API, segredos, saneamento de docs) |
| B | OAuth + Token Vault (app registration, MSAL Python, state/PKCE/nonce, cache cifrado, conectar/desconectar) |
| C | Fila Durável + Worker (máquina de estados, lease, idempotência, retry, conflito por ETag) |
| D | Graph File APIs + Upload/Download em streaming (R2 staging, upload sessions, throttling) |
| E | UI Unificada de Documentos |
| F | Testes, Deploy, Observabilidade |

---

## Critical Pitfalls

### Pitfall 1: `state` / PKCE / `nonce` não validados por transação e reuso de authorization code

**What goes wrong:**
O callback `/oauth/callback` aceita `code`+`state` da query sem checar que o `state` corresponde a uma transação iniciada por aquele usuário, ou reprocessa o mesmo `code` (replay). Resultado: login CSRF / account takeover — o token Microsoft de um atacante é gravado na conta de outra vítima (ou vice-versa), quebrando o requisito de "autoria delegada verdadeira". O `code` é single-use; um segundo `acquire_token_by_auth_code*` falha com `AADSTS54005` ou, pior, é gravado como se fosse uma nova conexão válida.

**Why it happens:**
É tentador gerar `state` uma vez por app (ou usar timestamp) e guardar só o `code` no Firestore. Timeouts/cold starts do Cloud Functions fazem o desenvolvedor "simplificar" o fluxo. O projeto já tem duas fontes de identidade no frontend (`AuthProvider` + `AtlasAuthProvider`, `CONCERNS.md:14-18`), o que incentiva associar o callback ao usuário errado. Ataques de phishing de authorization code ("ConsentFix"/"AuthCodeFix") são ativos e burlam MFA/Conditional Access — confiar apenas no `state` do navegador não basta.

**How to avoid:**
- Usar **MSAL Python** `ConfidentialClientApplication.initiate_auth_code_flow(...)` + `acquire_token_by_auth_code_flow(flow, auth_response)`. MSAL gera `state` e PKCE automaticamente, valida `state`/`nonce` e lança `ValueError` em CSRF. **Não reimplementar** PKCE à mão (`S256`, verifier aleatório).
- Persistir o **objeto `flow` inteiro** (opaco) no Firestore keyed por um `txId` de uso único, com `ownerUid` do **Firebase ID token verificado**, `createdAt`, `consumedAt`, TTL curto (≤10 min) e `used: false`. Nunca guardar o `flow` em cookie/localStorage do navegador.
- No callback: transação Firestore que faz `get` do `txId`, exige `used == false` e `!expired`, marca `used = true` **antes** de trocar o `code` (compare-and-set). Isso é a defesa contra replay/concorrência.
- Validar que o `uid` do ID token confere com o `ownerUid` do `txId` e com o `homeAccountId`/`oid` retornado no `id_token_claims`, antes de salvar qualquer credencial.
- `state`/`code`/tokens **nunca** em logs, mensagens de erro ou query strings persistidas; sanitizar como em `test_datatem_client.py:126`.

**Warning signs:**
- `state` fixo, derivado de timestamp, ou ausente; `flow` guardado no browser.
- Callback aceita `code` sem consultar Firestore; nenhum campo `used`/`consumedAt`.
- Dois cliques rápidos no botão "Conectar" geram dois tokens válidos.
- Logs Contêm `?code=...` ou `state=...`.
- Frontend envia `uid` do Body para associar a conexão em vez de derivar do ID token.

**Phase to address:** **Fase B** (com pré-requisito de auth de API da **Fase A**). Reutilizar `FakeDB(fail_first=True)` de `test_assignment.py` para testar a transação de consumo do `txId`.

---

### Pitfall 2: Tokens/cookies de credencial chegam ao frontend ou ficam legíveis pelas regras atuais do Firestore

**What goes wrong:**
Um documento `msalTokenCache/{uid}` ou `sharepointCredentials/{uid}` criado hoje seria **legível por qualquer usuário autenticado**: `firestore.rules:21-25` usa `match /{document=**}` com `allow read: if signedIn() && (...)`, e a cláusula só nega leitura de `datatemIntegration` (`firestore.rules:23`). Qualquer coleção nova fora da allow-list `datatemProtectedCollection()` (`firestore.rules:9-19`) herda leitura/escrita aberta. É um IDOR em nível de banco e viola diretamente "tokens nunca expostos ao frontend" e `CONCERNS.md:78-82`.

**Why it happens:**
O wildcard foi escrito para um app single-tenant e foi sendo estendido por exclusão. Ninguém percebeu que "adicionar uma coleção" automaticamente a torna legível. Paralelamente, há risco de vazar token via resposta HTTP (`return result` do MSAL), via header de Location, ou via `SettingsPage.tsx:167` que já exibe "AES-256 Enabled" sem implementação real (`CONCERNS.md:138-142`).

**How to avoid:**
- **Antes de qualquer feature**, trocar `firestore.rules` para **allow-list explícita por coleção**, com default deny (sem `/{document=**}`), e para coleções de credencial: `match /msalTokenCache/{uid} { allow read, write: if false; }`. Regras de `request.auth.uid == resource.data.ownerId` para coleções operacionais.
- Escrever e rodar **testes de regras no emulator** cobrindo leitura cross-user e leitura de `msalTokenCache` (hoje não existe nenhuma suíte — `CONCERNS.md:178-182`, `TESTING.md:171`).
- Nenhum endpoint SharePoint devolve token, `access_token`, `refresh_token`, `auth_uri` com segredo ou blob cifrado ao browser. Respostas somente status/ids.
- Todas as respostas das rotas OAuth/Graph: `Cache-Control: no-store`, `Pragma: no-cache` (o requisito `no-store` do PROJECT.md:23). Nunca `Vary: *` com cache compartilhado.
- Backend usa Admin SDK (que **ignora** regras) — portanto a autorização deve existir também no código, não só nas regras.

**Warning signs:**
- Collection path novo sem `match` explícito em `firestore.rules`.
- Teste com usuário A lendo documento do usuário B passa no emulator.
- Resposta de `/oauth/*` contém campo `token`, `cache` ou `flow`.
- `curl -I` mostra `cache-control` ausente/permissivo.
- UI mostra "Encryption enabled" antes da cifragem existir de fato.

**Phase to address:** **Fase A** (bloqueante) e verificado novamente na **Fase B** e **Fase F**.

---

### Pitfall 3: Serialização do cache MSAL — per-account, `has_state_changed`, e nonce/AAD do AES-256-GCM

**What goes wrong:**
`msal.SerializableTokenCache` **não persiste nada** e serializa JSON em texto claro; a doc oficial exige persistência customizada **por conta** para confidential clients (`learn.microsoft.com/.../msal-python-token-cache-serialization`). Se o time usar um único cache global (ou chave de Firestore sem `uid`), os tokens de um tenant vazam para outro. Se sobrescrever o Firestore a cada requisição, uma instância concorrente apaga tokens recém-rotacionados. E se a cifragem AES-256-GCM reutilizar nonce sob a mesma chave, **confidencialidade e integridade colapsam** (recupera-se a chave de hash H e forjam-se tags) — não basta parar de reutilizar: é preciso **rotacionar a chave**.

**Why it happens:**
O padrão `atexit` da doc MSAL é para desktop; em Cloud Functions ele nunca roda (ou roda no container errado). O time pode copiar o recipe e escrever num arquivo `/tmp`, o que a arquitetura proíbe (`PROJECT.md:51,64`). O módulo legado `datatem/token_store.py:45-63` já grava tokens em claro — é a tentação natural de reaproveitar.

**How to avoid:**
- Chave de documento por uid: `msalTokenCache/{uid}` (ou subcollection por `homeAccountId`), **um blob cifrado por conta**.
- `deserialize()` ao iniciar a requisição; `serialize()` e gravação **somente se `cache.has_state_changed`**, dentro de transação, com `updatedAt` e `version`. Persistir o blob **inteiro**, nunca mesclar campos.
- Cifrar com `cryptography.hazmat.primitives.ciphers.aead.AESGCM` (AES-256): nonce fresco de **12 bytes** por escrita (`os.urandom(12)`), AAD = `uid` + `version` (vincula o ciphertext ao dono e à chave), tag de 16 bytes. Armazenar `version || nonce || ciphertext_tag` e a versão da chave no documento.
- Chave mestra no **Google Cloud Secret Manager** (não env var de platform config — ver `CONCERNS.md:96-100`), com `keyVersion`; rotação: novas escritas usam chave nova, leitura escolhe pela versão, job re-sela blobs antigos.
- **Nunca** `fallback_to_plaintext=True` em produção (o padrão do MSAL Extensions faz isso). Falhar fechado.
- Mensuração: contar encryptions por chave e alertar bem antes de 2³² (RFC/NIST).
- Sincronizar acesso ao blob com transação/lease: duas instâncias carregando o mesmo cache e gravando depois podem perder a rotação de refresh token.

**Warning signs:**
- Documento de token com campos `access_token`/`refresh_token` em claro (igual `datatem/token_store.py`).
- Chave de Firestore sem uid; write em toda requisição; nenhum `has_state_changed`.
- Nonce constante, derivado de timestamp, zerado, ou gravado uma vez no deploy.
- AAD ausente (`None`) — ciphertext copiado entre uids ainda decripta.
- Chave de criptografia em `.env`/env var; `fallback_to_plaintext` habilitado.
- Sem `keyVersion` no blob.

**Phase to address:** **Fase B** (cache cifrado) com testes unitários de round-trip, AAD errado e nonce único; chave provisionada na **Fase A**.

---

### Pitfall 4: Graph — limite de upload simples, ETag/`If-Match`, `conflictBehavior` e throttling 429

**What goes wrong:**
Upload que "funciona em dev" com arquivo pequeno estoura em produção: o endpoint simples `PUT ...:/content` tem teto ~4 MB (alguns caminhos aceitam até 250 MB, mas a recomendação é session acima de 4 MB) e devolve 413 ou trunca silenciosamente em rede instável. Sem `createUploadSession`, não há retomada. Sem `If-Match`/ETag, uma substituição sobrescreve alteração feita no SharePoint enquanto o usuário editava (perda de dados — exatamente o que o milestone promete evitar). Sem `@microsoft.graph.conflictBehavior` explícito, o padrão é `fail`. Sem backoff de `Retry-After`, um 429 no chunk 47 gera retry em loop e banimento maior. E enviar `Authorization` nos PUTs de chunk vaza o access token para `*.sharepoint.com`/`api.onedrive.com` — host diferente do emissor.

**Why it happens:**
O time testa só com PDFs de 200 KB e com mocks (`TESTING.md:133` pede mocks de Graph) que não simulam 413/412/429. Confunde ETag do Graph com ETag do R2 (são diferentes e não interoperam). Esquece que `uploadUrl` é pré-autenticado e expira ~1h.

**How to avoid:**
- Decisão por tamanho: `< 4 MB` → PUT simples; `>= 4 MB` → `createUploadSession`, chunks **múltiplos de 320 KiB**, sequenciais, ≤60 MiB cada. Persistir `uploadUrl` + `expirationDateTime` + `nextExpectedRanges` + `opId` no Firestore para retomar após restart.
- **Nunca** enviar header `Authorization` nos PUTs de chunk; usar somente o `uploadUrl`.
- `GET uploadUrl` para consultar `nextExpectedRanges` antes de retomar; `DELETE uploadUrl` para cancelar/abortar sessão órfã.
- Substituição/conflito: ler `eTag` atual, enviar `If-Match: <etag>`; tratar **412** como conflito real e mandar para a máquina de resolução da Fase C (não auto-retry cego). Definir `@microsoft.graph.conflictBehavior` explicitamente (`fail` para substituir com segurança, `rename` quando apropriado).
- Throttling: em 429/5xx, esperar **no mínimo** `Retry-After` com jitter/backoff exponencial; respeitar limites por app e por tenant (`learn.microsoft.com/graph/throttling`).
- Registrar o `driveItem.id`/`eTag` final no Firestore como confirmação; só então apagar o binário do R2.

**Warning signs:**
- Nenhuma ramificação por tamanho de arquivo; upload de 10 MB falha só em produção.
- `If-Match` ausente ou ETag nunca persistido.
- Conflito 412 tratado como erro 500 genérico.
- Log de chunk PUT mostra header `Authorization`.
- Retry sem `Retry-After`; vários 429 em sequência.
- `uploadUrl` gravado só em memória; não sobrevive a cold start.

**Phase to address:** **Fase D** (cliente Graph + upload) integrado à resolução de conflitos da **Fase C**. Mocks de Graph devem cobrir 413/412/429/5xx.

---

### Pitfall 5: `SpooledTemporaryFile` do FastAPI/Starlette grava em disco e o stream chega vazio (EOF)

**What goes wrong:**
`UploadFile` usa `tempfile.SpooledTemporaryFile`: mantém em memória até ~1 MB e **rola para disco** depois disso (`fastapi.tiangolo.com/tutorial/request-files`). Isso viola frontalmente "sem arquivos temporários em disco" (`PROJECT.md:51,64`). Além disso, `fileno()` ou `rollover()` forçam ida a disco mesmo para arquivo pequeno, e após escrever o ponteiro fica no fim: passar o objeto adiante sem `seek(0)` faz o consumidor ler **bytes vazios**. Usar `file: bytes = File()` carrega o corpo todo em RAM (OOM). `max_size` é política de rollover, **não** limite de tamanho — não protege contra upload ilimitado.

**Why it happens:**
É o caminho "padrão e correto" do FastAPI para uploads, copiado sem perceber que a arquitetura do projeto proíbe disco. O codebase já tem `python-multipart` implícito em FastAPI; ninguém testou arquivo >1 MB. O estado global mutável existente (`cache` em `main.py:39`, `CONCERNS.md:64-68`) mostra que o time já acumula esse tipo de surpresa.

**How to avoid:**
- Para o caminho de upload para R2, **não** depender do spool em disco: consumir o stream em chunks com `await file.read(chunk_size)` e fazer PUT streaming direto para R2. Se precisar de `UploadFile`, fixar `MultiPartParser.max_file_size` alto o suficiente ou `0` **e** impor limite próprio de tamanho na aplicação (senão OOM).
- Sempre `await file.seek(0)` antes de qualquer segunda leitura ou handoff; documentar quem faz o `close()`.
- Testar explicitamente: arquivo limítrofe (1 MB ± 1 byte), leitura dupla sem rewind, e consumidor que chama `fileno()`. Usar `tmp_path` do pytest para detectar escrita em disco — **o teste deve falhar se disco for tocado**.
- Impor `Content-Length` máximo no gateway/function e validar `size`/contagem de bytes lidos no handler.
- Alternativa arquitetural preferida: upload direto do browser para R2 via signed URL gerada no backend (backend nunca recebe o binário), com o backend apenas confirmando a chave — elimina o problema de spool por completo.

**Warning signs:**
- Handler faz `await file.read()` uma vez (carrega tudo) ou esquece `seek(0)`.
- Testes só usam arquivos <1 MB.
- Aparece arquivo em `/tmp` durante upload local.
- `fileno()` em algum cliente/biblioteca downstream.
- Nenhum limite de tamanho além do `max_size` do spool.

**Phase to address:** **Fase D** (com teste de "zero disco" na **Fase F**).

---

### Pitfall 6: R2 — partes órfãs de multipart cobrando quota, e ETag de R2 confundido com o do Graph

**What goes wrong:**
Multipart abortado no meio (cold start, timeout, usuário cancela) deixa "Ongoing Multipart Upload": **não é objeto**, não aparece no `list`, não pode ser apagado com `delete`, mas **conta contra storage e billing** até o lifecycle padrão de 7 dias. A quota/custo estoura silenciosamente. Além disso, o time tenta usar o ETag do R2 (MD5 concatenado + `-N` para multipart) como `If-Match` do Graph (outro esquema) e o conflito não é detectado. Partes fora do tamanho mínimo (5 MiB, exceto a última) ou de tamanhos diferentes geram `EntityTooSmall`/`InvalidPart` (10011/10025/10048).

**Why it happens:**
O modelo mental de "apaguei o objeto, limpei". Não existe evento de "upload falhou" quando a função é morta por timeout. O requisito "R2 temporário até confirmação do SharePoint" (`PROJECT.md:20,57`) torna a limpeza obrigatória — mas sem uma fila de limpeza confiável, órfãos se acumulam.

**How to avoid:**
- Sempre `abort()`/`AbortMultipartUpload` em `finally` quando o upload para R2 falha; registrar `uploadId` no documento da fila para permitir abort posterior.
- Configurar **Object Lifecycle Rule** no bucket: `AbortIncompleteMultipartUpload` com `DaysAfterInitiation` baixo (1–2 dias) **e** regra de expiração de objetos temporários por prefixo (ex.: `staging/`). Não confiar apenas no default de 7 dias.
- Apagar o objeto R2 **somente após** confirmar o `driveItem` no Graph; se a confirmação falhar, manter o binário e reagendar. Nunca apagar antes.
- Tratar ETag do Graph e ETag/ETag HTTP do R2 como domínios separados; persistir `graphETag` e `r2ETag` em campos distintos.
- Respeitar limites: mínimo 5 MiB por parte (exceto última), até 10.000 partes, partes não-finais de tamanho igual; multipart só quando fizer sentido.
- Monitorar `listMultipartUploads` periodicamente e alertar se órfãos > threshold.

**Warning signs:**
- Nenhum `abort()` no código; `uploadId` não persistido.
- Bucket sem lifecycle rule customizada.
- Tamanho do bucket crescendo sem objetos listáveis.
- Campo único `etag` usado tanto para Graph quanto para R2.
- Quando o Graph falha, binário já foi removido do R2.

**Phase to address:** **Fase D** (upload/staging + limpeza) e **Fase F** (lifecycle + monitoramento de órfãos/alerta de quota).

---

### Pitfall 7: Cold starts e timeouts do Cloud Functions Gen2 em operações longas de sync/upload

**What goes wrong:**
Gen2 default é timeout de **60 s** e escala até zero; o projeto já sofre com cold start em Render free (`CONCERNS.md:198-201`) e vai repetir o erro no Firebase. Um upload Graph de arquivo grande, ou o worker tentando processar toda a fila em uma requisição, é morto por timeout no meio — deixando a fila num estado inconsistente e o R2 com órfãos (Pitfall 6). Request body limit é 32 MB (gen2) e response 10 MB streaming / 32 MB não-streaming — um proxy de download que lê o arquivo inteiro estoura. Inicialização global pesada (MSAL, crypto clients) aumenta cold start; `min_instances` custa dinheiro ocioso e o modo `yolo` do projeto prioriza free tier (`PROJECT.md:61`).

**Why it happens:**
O time trata function como servidor always-on. Não separa "receber/enfileirar" de "processar". Não sabe que a doc recomenda dividir trabalho longo em unidades request/response curtas + fila durável — que é exatamente a arquitetura que o milestone pede, mas que pode ser mal implementada se o worker for uma única função longa.

**How to avoid:**
- Sephar: endpoint HTTP **rápido** (valida ID token, cria job na fila, responde 202) + **worker** acionado por trigger/Cloud Scheduler em lotes pequenos, com `timeout_sec` explícito e `max_instances` para não sobrecarregar o Graph.
- Nenhuma chamada Graph/R2 de longa duração dentro de uma requisição HTTP síncrona; usar `createUploadSession` com retomada entre invocações.
- Configurar `min_instances` pequeno (ou 0) para funções de callback OAuth sensíveis à latência, aceitando o custo; para worker, manter 0 e confiar em retries.
- Inicializar clientes (MSAL, crypto, Firestore) em escopo global **com block**, mas mínimo; medir cold start em teste de deploy real.
- Upload/download em streaming: nunca materializar o arquivo inteiro em memória nem em resposta; usar signed URL do R2 para download direto.
- Definir `timeout_sec`, `memory`, `concurrency`, `max_instances` explicitamente em código (não depender de default) e validar com `firebase deploy --only functions` a partir de clone limpo (`CONCERNS.md:8-12`).

**Warning signs:**
- Uma única função faz "buscar na fila + baixar do R2 + upload Graph" de ponta a ponta.
- `timeout_sec` não declarado; logs mostram `Function execution timed out`.
- `response` de download com corpo binário grande.
- `min_instances` 0 em endpoint OAuth com reclamação de lentidão no login.
- Deploy falha em clone limpo (source `apis/reporting-functions` Nodes vs novo code source Python — ver Pitfall 9).

**Phase to address:** **Fase C** (worker) e **Fase D** (streaming), com validação de deploy na **Fase F**.

---

### Pitfall 8: IDOR multi-tenant — confiar só nas Firestore rules ou esquecer `check_revoked`/tenant no ID token

**What goes wrong:**
Mesmo com rules corretas, o backend usa Admin SDK que **ignora regras**: se um endpoint `/api/sharepoint/documents?uid=...` aceita `uid`/`tenantId` do cliente, usuário A lê/escreve documentos de B. No frontend existem **duas fontes de identidade** (`AuthProvider` adaptador com `user: unknown` + `AtlasAuthProvider`, `CONCERNS.md:14-18`) e as rotas DATATEM já usam `SYSTEM_ACTOR` fictício (`routes_datatem.py:180-181`) com `require_firebase_user` **nunca chamado** (`CONCERNS.md:84-88`). Copiar esse padrão para SharePoint destrói a autoria delegada. Além disso, `verify_id_token` tem `check_revoked=False` por padrão: usuário demitido/desabilitado continua passando; sem checar `firebase.tenant`, um token de outro tenant é aceito.

**Why it happens:**
O time assume que "rules restritivas" resolvem tudo e que o ID token verificado uma vez serve para sempre. Não existe helper de auth testado no backend (`TESTING.md:133`). O adaptador de auth do frontend perde tipagem e incentiva `as any`.

**How to avoid:**
- **Toda** rota SharePoint começa com dependency `require_firebase_user` (implementar de fato o helper em `firebase_client.py:82-115`) que chama `auth.verify_id_token(token, check_revoked=True, clock_skew_seconds=...)` em endpoints sensíveis (conectar/desconectar, escrita).
- Derivar `uid` e `tenantId` **sempre** do token decodificado (`decoded['uid']`, `decoded['firebase'].get('tenant')`), **nunca** de body/query. Validar que `tenant` bate com o tenant esperado (`TenantIdMismatchError`).
- Em operações sensíveis, checar `auth_time` (ex.: login recente < 5 min, padrão do SDK) antes de conectar conta Microsoft.
- Administration SDK: filtrar toda query com `where('ownerId','==',uid)` **e** tenant; não confiar em rules. `rules != filtro`.
- Consolidar frontend para um único provider com `TenantUser` tipado antes da UI de documentos (`CONCERNS.md:18`). Backend envia `Authorization: Bearer` (sem cookies), CORS restrito, sem `allow_credentials=True` amplo (`CONCERNS.md:46-50,120-124`).
- Testes de autorização: A tentando acessar recurso de B → 403; token revogado → 401; token de outro tenant → 401. Usar `app.dependency_overrides` e fakes de ID token (`TESTING.md:133`).

**Warning signs:**
- Rota aceita `uid`/`tenantId` do cliente.
- `verify_id_token` sem `check_revoked` em escrita; nenhuma checagem de `firebase.tenant`.
- `SYSTEM_ACTOR` ou uid fictício em nova rota.
- Adapter `AuthProvider` com `user: unknown` ainda no path de documentos.
- Testes passam sem nenhum teste de "cross-user 403".

**Phase to address:** **Fase A** (helper + rules), reforçado na **Fase E** (UI) e **Fase F** (testes de regressão IDOR).

---

### Pitfall 9: Confiar em documentos do projeto que descrevem estado irreal (inclusive o próprio mapa de codebase)

**What goes wrong:**
O time planeja "usar o backend FastAPI existente" e "as regras já bloqueiam", mas: `IMPLEMENTATION_STATUS.md:178` diz "Everything is implemented and ready", `DEPLOYMENT_GUIDE.md:245` diz "Ready for Production", `REDESIGN-PROGRESS.md` marca fases como completas enquanto o código tem `as any`/inline styles (`CONCERNS.md:38-42`). O próprio `firebase.json:7` aponta `functions.source` para `apis/reporting-functions` (Node 18) — **não existe source de Python Gen2 configurado**, e o working tree tem 20 entradas pendentes com pastas antigas deletadas e novas untracked (`CONCERNS.md:8-12`). `SettingsPage.tsx:167` afirma AES-256 sem implementação. Começar a implementação assumindo que "o Python backend já está deployável" leva a functions que não compilam em produção.

**Why it happens:**
Documentos de design system e status foram escritos para v1.0 e nunca atualizados; a migração para monorepo e `apis/` não foi refletida. O mapa de codebase é de 2026-11-17 e ele mesmo alerta para não confiar cegamente. Não há CI (`TESTING.md:11,264-268`) para detectar drift.

**How to avoid:**
- Tratar `.planning/IMPLEMENTATION-GUIDE.md`, `REDESIGN-PROGRESS.md`, `IMPLEMENTATION_STATUS.md`, `DEPLOYMENT_GUIDE.md`, `TESTBOOK_*` como **histórico**; validar toda afirmação contra o código antes de planejar.
- **Verificar na prática antes de codar:** rodar `firebase deploy --only functions` a partir de clone limpo; confirmar runtime Python em `firebase.json` (`runtime: python310|python311`) e declarar **segundo codebase de functions** se Node e Python coexistirem (firebase.json suporta array de `functions`).
- Limpar/commitar explicitamente o working tree sujo e remover referências a `APIETL/`, `backend/fastapi_app/`, `firebase/functions/` de READMEs e scripts (`CONCERNS.md:12`).
- Corrigir/remover o texto "Encryption: Enabled (AES-256)" da UI até a cifragem real existir e ter teste.
- Antes de cada fase, checar `git status` e `git diff` — não planejar sobre working tree sujo (`CONCERNS.md:190-194`).

**Warning signs:**
- Plano referencia `backend/fastapi_app` ou `firebase/functions` (não existem mais).
- Doc diz "ready for production" mas `npm run web:build`/`tsc` falham (`TESTING.md:26-27`).
- `functions.source` único apontando para `apis/reporting-functions` enquanto se planeja Python.
- UI exibe recursos de segurança sem teste correspondente.
- `git status` com dezenas de entradas misturando refactor e config.

**Phase to address:** **Fase A** (saneamento, deploy de validação) e revalidado no início de **Fase F**.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Reaproveitar `datatem/token_store.py` (tokens em claro) para MSAL | Implementação rápida | Viola AES-256-GCM/Secret Manager; vazamento em backup | **Nunca** |
| Guardar `flow`/state em cookie do browser em vez do Firestore | Menos escrita | CSRF, replay, perda em cold start; tokens na borda | **Nunca** |
| `min_instances = 0` + one-shot function fazendo upload inteiro | Custo zero ocioso | Cold start + timeout no meio do upload; órfãos | **Nunca** para upload; aceitável para worker com retry |
| `allow read: if signedIn()` no wildcard para "não quebrar legado" | Evita ajustar queries | IDOR em toda coleção nova de credencial | **Nunca**; usar allow-list + adaptadores de legado |
| Upload via `bytes = File()` e `await read()` | Código simples | OOM com arquivos grandes | Somente payloads pequenos e limitados (avatar) |
| Confiar no lifecycle default de 7 dias do R2 | Zero config | Órfãos cobrando quota por uma semana | Aceitável só em MVP com volume baixo e alerta |
| Reusar `SYSTEM_ACTOR` para operações SharePoint | Evita mexer em auth | Destrói autoria delegada ( requisito central) | **Nunca** |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Microsoft Entra / MSAL Python | Reimplementar PKCE/state manualmente | `initiate_auth_code_flow` + `acquire_token_by_auth_code_flow`; MSAL já valida state/nonce e faz PKCE |
| Microsoft Graph upload | Enviar `Authorization` no PUT de chunk do `uploadUrl` | `uploadUrl` é pré-autenticado; strip do header |
| Microsoft Graph upload | Usar ETag do R2 como `If-Match` do Graph | Domínios separados: `graphETag` vs `r2ETag` |
| Microsoft Graph | Deixar `conflictBehavior` default (`fail`) sem tratar | Definir explicitamente; 412 → resolução na Fase C |
| Cloudflare R2 | `delete()` para limpar multipart órfão | `AbortMultipartUpload` + lifecycle rule |
| Cloudflare R2 | Apagar staging antes do Graph confirmar | Apagar só após `driveItem` confirmado no Firestore |
| FastAPI / Starlette | Assumir que arquivo <1 MB "nunca toca disco" | `fileno()`/`rollover()` forçam rollover; `seek(0)` antes de reler |
| Firebase Admin SDK | Assumir que Firestore rules protegem chamadas do backend | Admin SDK bypassa rules; filtrar por uid/tenant no código |
| Firebase ID token | `verify_id_token` sem `check_revoked` e sem tenant | `check_revoked=True` em escrita; validar `firebase.tenant` |
| Firebase CLI | Assumir que functions Python já estão no deploy | `firebase.json` hoje só tem source Node; declarar codebase Python |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Worker processando fila inteira em uma invocação | `Function execution timed out`, jobs travados | Lotes pequenos + Scheduler; state persistido a cada passo | > ~60 s (default timeout) ou qualquer arquivo grande |
| Escrita do cache MSAL a cada requisição | Latência, contended writes, perda de rotação | Gravar só se `has_state_changed`, em transação | Muitas instâncias concorrentes |
| Hotspot em documento único de lease/fila | `ABORTED: Too much contention` | Lease com TTL, backoff, shard por uid/job | Carga concorrente alta no mesmo doc (`transaction-data-contention`) |
| Download via proxy da function | 32 MB request / 10 MB response estoura | Signed URL do R2 para download direto | Arquivos > limite de response |
| `await file.read()` inteiro | OOM, instância reiniciando | Streaming em chunks / upload direto R2 | Arquivos grandes ou múltiplos uploads simultâneos |
| Cold start do MSAL+crypto no callback | Login lento, timeouts intermitentes | `min_instances` baixo no callback, init global mínimo | Spikes de tráfego com `min_instances=0` |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Coleção nova fora da allow-list em `firestore.rules` | Leitura/escrita por qualquer `signedIn()` | Default deny + `allow read,write: if false` para credenciais |
| `uid`/`tenantId` vindos do cliente | IDOR cross-tenant | Derivar do ID token decodificado; filtrar query no Admin SDK |
| Tokens em logs/erros/query strings | Vazamento de credencial delegada | Sanitizar; `assert 'secret' not in str(err)` como em `test_datatem_client.py:206` |
| Nonce GCM reutilizado / AAD ausente | Perda de confidencialidade **e** integridade; forge de tags | Nonce 12B aleatório por escrita, AAD=uid+version, keyVersion, rotação |
| `check_revoked=False` em escrita | Usuário revogado continua agindo | `check_revoked=True`; checar `auth_time` em operação sensível |
| `Authorization` nos chunks do `uploadUrl` | Access token vazado para outro host | Nunca enviar; usar URL pré-autenticada |
| `fallback_to_plaintext=True` | Cache cifrado vira texto claro silenciosamente | Fail closed |
| Service account JSON em env var / repo | Comprometimento de Admin SDK | ADC/Secret Manager; varredura de segredos no CI (`CONCERNS.md:96-100`) |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Progresso de upload fictício (`Math.random()` como em `useETLResearch.ts:122-137`) | Usuário confia que salvou quando não salvou | Derivar status da fila real + `nextExpectedRanges` do Graph |
| UI de documents mostrando "sincronizado" antes do Graph confirmar | Perda de alterações, quebra da promessa do milestone | Estados honestos: `pending`/`uploading`/`conflict`/`synced` com ETag final |
| Exibir "Encryption: Enabled (AES-256)" sem implementação (`SettingsPage.tsx:167`) | Falsa sensação de segurança | Mostrar status real só com evidência/teste |
| Conectar conta sem avisar escopo/tenant Microsoft | Usuário autoriza org errada | Mostrar tenant/conta retornada e exigir confirmação |
| Conflito 412 sem ação clara | Usuário não sabe qual versão prevaleceu | Tela de resolução com ETag/versões das duas cópias |

## "Looks Done But Isn't" Checklist

- [ ] **OAuth:** `state`/PKCE/`nonce` validados, `txId` consumido atomicamente; replay testado — verificar teste de duplo callback.
- [ ] **Token Vault:** nenhum token no frontend; `firestore.rules` com `allow read,write: if false` para `msalTokenCache`; respostas `no-store`.
- [ ] **Cache MSAL:** um blob por uid, `has_state_changed`, AES-256-GCM com nonce único + AAD + keyVersion; teste de AAD inválido falha.
- [ ] **Upload Graph:** ramificação por 4 MB; `If-Match`/412 tratado; `Retry-After` respeitado; sem `Authorization` nos chunks.
- [ ] **R2:** `abort()` em `finally` + lifecycle rule; staging apagado **só após** confirmação; ETags separados.
- [ ] **Upload FastAPI:** nenhum arquivo tocando `/tmp`; `seek(0)` antes de reler; limite de tamanho na app.
- [ ] **Functions:** `timeout_sec`/`concurrency`/`max_instances` explícitos; deploy passa em clone limpo com source Python declarado.
- [ ] **IDOR:** toda rota chama `require_firebase_user` real; uid/tenant do token; cross-user 403 testado.
- [ ] **Docs:** nenhuma afirmação de "pronto" sem verificação contra código; UI sem status de criptografia falso.
- [ ] **Testes:** mocks de Graph e R2 cobrindo 412/413/429/5xx e órfãos; suíte de regras no emulator existe.

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Nonce GCM reutilizado descoberto | HIGH | Rotacionar chave imediatamente, re-seler todos os blobs com nova versão, revogar tokens expostos |
| Replay de authorization code | MEDIUM | Invalidar `txId`, revogar tokens gerados, forçar reconexão do usuário afetado |
| Token cache corrompido/perdido | MEDIUM | Limpar `msalTokenCache/{uid}`, forçar `acquire_token_by_auth_code_flow` (reconsentimento) |
| Órfãos de multipart R2 | LOW | `listMultipartUploads` → `AbortMultipartUpload`; ajustar lifecycle rule |
| Fila travada por lease expirado | LOW | Lease com TTL expira; worker retoma; verificar idempotência do `opId` |
| Upload Graph 412 (conflito) | MEDIUM | Não auto-sobrescrever: registrar ETag atuais, mandar para resolução na UI |
| Regras Firestore vazando | HIGH | Default deny imediato, auditar coleções, rodar suite de regras antes de reabrir |
| Functions não deployam em clone limpo | HIGH | Commitar/descartar working tree, declarar codebase Python, validar deploy antes de qualquer feature |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| 1. state/PKCE/nonce + replay | B | Teste de duplo callback → segundo rejeitado; `txId` `used=true` antes da troca |
| 2. Token exposure / Firestore rules | A (bloqueante), B, F | Suite de regras no emulator: cross-user e leitura de `msalTokenCache` negadas; `no-store` |
| 3. MSAL cache serial/rotação | B | Round-trip cifrado, AAD errado falha, nonce único, keyVersion presente |
| 4. Graph limit/ETag/throttling | D (+ C conflito) | Mock 413/412/429; `If-Match` enviado; sem `Authorization` no chunk |
| 5. SpooledTemporaryFile | D (+ F) | Teste detecta escrita em disco = falha; `seek(0)`; limite de tamanho |
| 6. R2 órfãos/ETag | D, F | `abort()` em `finally`; lifecycle rule configurada; ETag separado |
| 7. Cold start/timeout | C, D, F | Deploy em clone limpo; timeouts explícitos; job sobrevive a restart |
| 8. IDOR multi-tenant | A, E, F | Cross-user 403; token revogado 401; tenant errado 401 |
| 9. Docs enganosas / deploy | A, F | Deploy real passa; texto de "AES-256" removido até implementação |

**Ordenação recomendada:** A → B → C → D → E → F. A vem primeiro porque rules/auth/segredos são pré-requisito de B; B produz o token que C/D consomem; D depende da fila de C para conflitos e staging; E consome os status de C/D; F valida tudo.

## Sources

- RFC 9700 (OAuth 2.0 Security BCP) — PKCE S256, state/nonce por transação, code injection — `https://www.rfc-editor.org/rfc/rfc9700.html` (MEDIUM)
- Microsoft identity platform, authorization code flow & MSAL auth flows — `https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow`, `.../msal-authentication-flows` (MEDIUM)
- MSAL Python token cache serialization — `https://learn.microsoft.com/en-us/entra/msal/python/advanced/msal-python-token-cache-serialization`, `https://learn.microsoft.com/en-us/python/api/msal/msal.token_cache.serializabletokencache` (MEDIUM)
- MSAL Python `initiate_auth_code_flow`/`acquire_token_by_auth_code_flow` — `https://learn.microsoft.com/en-us/python/api/msal/msal.application.clientapplication` (MEDIUM)
- Microsoft Graph `createUploadSession`, large-file upload, throttling — `https://learn.microsoft.com/graph/api/driveitem-createuploadsession`, `.../graph/sdks/large-file-upload`, `.../graph/throttling` (MEDIUM)
- Cloudflare R2 upload objects / error codes / object lifecycles — `https://developers.cloudflare.com/r2/objects/upload-objects`, `.../r2/api/error-codes`, `.../r2/buckets/object-lifecycles` (MEDIUM)
- FastAPI UploadFile / Starlette SpooledTemporaryFile behavior — `https://fastapi.tiangolo.com/tutorial/request-files`, `https://fastapi.tiangolo.com/reference/uploadfile` (MEDIUM)
- Cloud Functions for Firebase Gen2 limits/config — `https://firebase.google.com/docs/functions/manage-functions`, `https://docs.cloud.google.com/functions/quotas`, `https://firebase.google.com/docs/reference/functions/2nd-gen/python/firebase_functions.options` (MEDIUM)
- Firestore security rules (owner checks, rules are not filters, tenant) — `https://firebase.google.com/docs/firestore/security/rules-conditions`, `.../security/rules-query`, `.../rules/rules-and-auth` (MEDIUM)
- Firestore transactions/data contention & idempotency lease — `https://firebase.google.com/docs/firestore/transaction-data-contention`, `https://cloud.google.com/blog/products/serverless/cloud-functions-pro-tips-building-idempotent-functions` (MEDIUM)
- Firebase Admin Python `verify_id_token` — `https://firebase.google.com/docs/reference/admin/python/firebase_admin.auth` (MEDIUM)
- AES-GCM nonce/AAD/key-version guidance — NIST SP 800-38D, `https://learn.microsoft.com/en-us/python/api/cryptography.hazmat.primitives.ciphers.aead` (MEDIUM)
- Codebase primário (HIGH, verificado diretamente): `firestore.rules`, `firebase.json`, `.planning/codebase/CONCERNS.md`, `.planning/codebase/TESTING.md`, `.planning/PROJECT.md`

---
*Pitfalls research for: adicionar integração nativa Microsoft SharePoint ao Atlas (milestone v2.0)*
*Researched: 2026-11-17*
