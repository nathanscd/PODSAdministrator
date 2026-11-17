# Project Research Summary

**Project:** Atlas 1.0 / PODSAdministrator (milestone v2.0)
**Domain:** Integração nativa Microsoft SharePoint em SaaS Firebase-centric multi-tenant
**Researched:** 2026-11-17
**Confidence:** MEDIUM (versões de stack e mapa do codebase com HIGH; decisões de integração, APIs externas e UX com MEDIUM; nenhuma credencial Microsoft real disponível para validação)

## Executive Summary

Atlas/PODSAdministrator é uma plataforma de documentos multi-tenant já construída (React 19 + Vite 7, Firebase Auth/Firestore, monorepo, Zod, design system, widget platform). O milestone v2.0 adiciona uma integração **nativa** com SharePoint/Graph. Especialistas constroem esse tipo de integração com um cliente OAuth 2.0 confidencial (Authorization Code + PKCE) inteiramente no backend, um cofre de tokens cifrado, chamadas delegadas ao Microsoft Graph que preservam a autoria do usuário original, e uma fila de sincronização durável que separa "salvo" de "sincronizado". O norte é confiança: o frontend nunca vê token, blob cifrado nem cache MSAL.

A abordagem recomendada é um **novo codebase de Cloud Functions Gen2 em Python 3.12** (`sharepoint`, separado do `reporting` Node), usando `msal` + `httpx` REST em vez do SDK do Graph; cache MSAL serializado e cifrado com **AES-256-GCM** no Firestore, com chaves no Secret Manager; **R2 como staging temporário** de todo binário até o SharePoint confirmar; e uma fila durável no Firestore com claim transacional, lease com `leaseEpoch` e reconciliação agendada. O frontend consome somente status/metadados via `onSnapshot`, atravessando a interface `DocumentStorageService` — nenhum componente conhece R2, Graph ou MSAL.

Os riscos concentram-se em quatro frentes: (1) **vazamento de credencial** — a regra wildcard atual do `firestore.rules` torna qualquer coleção nova legível por qualquer `signedIn()`, e o Admin SDK bypassa regras; (2) **OAuth/cripto** — `state`/PKCE/`nonce` sem validação transacional, replay de authorization code e reuso de nonce GCM/AAD ausente podem destruir confidencialidade e integridade; (3) **limites do Gen2** — corpo de 32 MB, timeout de 540 s em eventos e cold starts exigem streaming resumável por chunks e **zero arquivos temporários**; (4) **Graph/R2** — throttling 429, conflitos por ETag (`412`) e uploads multipart órfãos. A mitigação é estritamente faseada: regras/autu/segredos primeiro, depois OAuth + cofre, depois fila durável, depois streaming, depois UI, com gates de teste em cada etapa.

## Key Findings

### Recommended Stack

A stack nova é deliberadamente mínima e evita dependências que violariam "sem cache/temp/disco" ou que inflariam o cold start. Detalhes em `STACK.md`.

**Core technologies:**
- **Python 3.12 (`python312`)** — runtime já declarado no repo (`apis/connectivity/render.yaml`), suportado até 2028; evita drift para `python313/314`. `python310` já depreciado — não usar.
- **`firebase-functions` 0.6.0 + `firebase-admin` 7.8.0** — decorators `https_fn`/`firestore_fn`/`scheduler_fn` e `verify_id_token()` com ADC em Gen2 (nenhum JSON de service account em disco).
- **`msal` 1.39.0** — PKCE S256, `state`, `nonce` e refresh automáticos via `initiate_auth_code_flow()` / `acquire_token_by_auth_code_flow()` / `acquire_token_silent()`. **Não reimplementar PKCE à mão.**
- **`cryptography` 50.0.2 (AESGCM)** — cifrar o `SerializableTokenCache.serialize()` (JSON em texto claro); nonce de 12 bytes por escrita + AAD = uid/version.
- **`boto3` 1.44.5** — staging R2 via S3 API (`endpoint_url=https://<ACCOUNT_ID>.r2.cloudflarestorage.com`, `region_name="auto"`). Configurar checksums `when_required` — o default CRC32 do botocore é rejeitado pelo R2.
- **`httpx` 0.28.1** — chamadas REST ao Graph v1.0; `msgraph-sdk` 1.65.0 existe, mas seu auth provider exige credential async do `azure-identity`, incompatível com nosso cache MSAL no Firestore. **`microsoft-graph-sdk` retorna 404 no PyPI — não existe.**
- **`functions-framework` 3.10.2** — paridade emulador/produção.

**Decisões de exclusão críticas:** sem `msgraph-sdk`/`azure-identity`/Kiota no caminho crítico; sem `msal-extensions`/`FilePersistence`/`build_encrypted_persistence` (persistem em arquivo/keyring do SO — proibido); sem `http_cache` persistente do MSAL; sem Redis/SQLite/`/tmp`/IndexedDB/`localStorage`/service-worker cache; sem app-only (`acquire_token_for_client`); sem tokens/client secret/chave AES no frontend nem em `VITE_*`; sem FastAPI/Mangum no Gen2; manter `offline_access` nos scopes. `firebase.json` deve virar **array** de `functions` (`reporting` Node 18 + `sharepoint` Python 3.12) sem sobrescrever o deploy atual. Fixar `firebase-tools` ≥ 15.16.0 (regressão multi-codebase em 15.15.0).

### Expected Features

Apenas as features novas do v2.0 são escopo; shell multi-tenant, sidebar, design system e documents widget existentes são dependências. Detalhes em `FEATURES.md`.

**Must have (table stakes):**
- Ciclo de vida da conexão no card de Configurações: toggle ativar/desativar, conectar via OAuth (consent screen, nunca colar API key), desconectar com revogação imediata (simetria obrigatória), 5 estados (`disabled`/`disconnected`/`connected`/`syncing`/`problems`) e "última sincronização bem-sucedida" com timestamp local.
- Explorador: navegar sites → bibliotecas (drives) → pastas → arquivos com permissões delegadas, breadcrumb, busca no escopo com indicador de origem, painel de propriedades (autoria Microsoft + eTag), download em streaming sem cache, upload/criar pasta/substituir versão.
- Status honesto por item (`pendente`/`sincronizando`/`sincronizado`/`falhou`/`conflito`), contagem de fila com retry manual, e detecção de conflito por ETag com modal de resolução (manter ambos / substituir / manter versão SharePoint / pular / resolver depois).

**Should have (diferenciadores):**
- Explorador **verdadeiramente unificado**: arquivos SharePoint e binários R2 pendentes na **mesma** lista, com discriminador de origem e badge distinto — é a promessa explícita do milestone.
- Preservação real de autoria (identidade delegada do criador no `lastModifiedByUser`, inclusive quando o worker processa a fila depois).
- Zero perda de alterações durante indisponibilidade do SharePoint (R2 durável + fila com backoff/idempotência).
- "Salvo ≠ sincronizado" como princípio de produto (sem check verde mentiroso); ações cientes de permissão; auditoria integrada via `systemLog`.

**Defer (v1.x / v2+):**
- v1.x: histórico de versões completo (listar/baixar/promover), "aplicar a todos" em conflitos, upload resumable com progresso, filtros por tipo/data.
- v2+: outros provedores de nuvem, edição inline de Office / Office Online embed, split-view/abas múltiplas/ZIP de pasta, drag-and-drop entre pastas distantes.

**Anti-features explícitas:** cache no navegador de metadados/tokens/bytes; MSAL no browser ou token em Redux/localStorage; sync app-only; substituição silenciosa no conflito; espelhar todo o Drive no Firestore; check verde "Sincronizado" logo após salvar no R2; cópia permanente no R2 como "backup"; retry automático infinito sem visibilidade.

### Architecture Approach

A mudança estrutural central: o backend deixa de ser só "HTTP request → resposta" e passa a ter trabalho assíncrono durável disparado por eventos do Firestore + reconciliação periódica — mantendo o Firestore como fonte de verdade e o frontend em `onSnapshot`. Detalhes em `ARCHITECTURE.md`.

**Major components:**
1. **`apis/sharepoint-functions/` (novo codebase Python Gen2)** — `main.py` (https_fn + firestore_fn + scheduler_fn), `auth.py`, `crypto.py`, `secrets.py`, `config.py`, `oauth.py`/`msal_client.py`, `graph_client.py`, `r2_client.py`, `stores/*.py`, `sync/{state,worker,reconciler}.py`. **Replicar o padrão** de `apis/connectivity` (transações, `SERVER_TIMESTAMP`, histórico append-only), nunca importar跨-codebase.
2. **Firestore (7 coleções)** — `sharepointSettings`, `sharepointCredentials` (blob cifrado), `sharepointOAuthTransactions` (PKCE/`codeVerifier` cifrado, `used`), `sharepointDocuments` (`docId` determinístico, `eTag`), `sharepointSyncQueue` (lease, `idempotencyKey`, `leaseEpoch`), `sharepointAudit` (append-only), `sharepointUsage` (quota com `Increment`). Mais 5 índices compostos.
3. **Frontend (abstração antes de tudo)** — `DocumentStorageService` (interface em `core/services/`), `SharePointService` (HTTP + erro tipado `SharePointApiError`/`FRIENDLY_MESSAGES`), `SharePointContext`, `useSharePoint`, UI em `SettingsPage`/`SettingsModal` e `DocumentsPage` + rota `/documents`.

**Key patterns:** (a) `DocumentStorageService` isola Graph/R2 dos componentes; (b) claim transacional com lease e **fencing** por `leaseEpoch` (at-least-once, não exactly-once); (c) idempotência por `docId`/`idempotencyKey` + `If-Match`/ETag → `412` vira estado `conflict`, não overwrite; (d) **streaming puro** (`request.stream()` → adaptador file-like → boto3), nunca `UploadFile`/`multipart/form-data` (Starlette `SpooledTemporaryFile` despeja em disco acima de 1 MB); (e) OAuth transacional + cache cifrado por uid; (f) worker = 2 funções (trigger `on_document_created` + `scheduler_fn` a cada 1 min para leases expirados), nenhuma com estado em memória — payload contém só `docId`.

### Critical Pitfalls

Top 5 de `PITFALLS.md` (as 9 armadilhas completas e mapeamento por fase estão no arquivo):

1. **`state`/PKCE/`nonce` não validados por transação + replay de authorization code** — login CSRF/account takeover. Usar MSAL para gerar/validar, persistir o objeto `flow` opaco no Firestore keyed por `txId` com `ownerUid` do ID token verificado, TTL ≤ 10 min e `used: false`; marcar `used = true` (CAS) **antes** de trocar o código. Nunca na borda (cookie/localStorage).
2. **Token chega ao frontend / regra wildcard do Firestore expõe coleção nova** — IDOR em nível de banco. **Antes de qualquer feature**, trocar para allow-list explícita com default deny (sem `/{document=**}`), `allow read, write: if false` para `Credentials`/`OAuthTransactions`/`SyncQueue`/`Audit`/`Usage`; `no-store` em toda resposta; lembrar que Admin SDK bypassa rules — autorizar também no código.
3. **Serialização do cache MSAL** — um blob cifrado por conta (`msalTokenCache/{uid}`), gravar **somente se `cache.has_state_changed`** em transação; AES-256-GCM com nonce fresco de 12 bytes por escrita, **AAD = uid + version**, `keyVersion`, chave no Secret Manager; **fail closed** (nunca `fallback_toplaintext`/texto claro, nunca copiar `datatem/token_store.py`). Nonce reutilizado exige rotação de chave + re-selo.
4. **Graph: upload simples, ETag/`If-Match`, `conflictBehavior` e throttling** — `< 4 MB` → PUT simples; `>= 4 MB` → `createUploadSession` com chunks múltiplos de 320 KiB (≤ 60 MiB), persistindo `uploadUrl`/`nextExpectedRanges`; **nunca** enviar `Authorization` nos PUTs de chunk (URL é pré-autenticada); `If-Match` + tratar `412` como conflito real; `Retry-After`/jitter em `429`/`5xx`; separar `graphETag` de `r2ETag`.
5. **Disco temporário, órfãos R2 e cold start/timeout do Gen2** — streaming puro (zero `/tmp`, `seek(0)` se reler); `abort()`/`AbortMultipartUpload` em `finally` + lifecycle rule (1–2 dias) + apagar staging **só após** confirmação do `driveItem`; separar endpoint HTTP rápido (202) de worker em lotes com `timeout_sec`/`concurrency`/`max_instances` explícitos; upload resumável para sobreviver ao limite de 540 s do trigger.

Agravantes transversais: **IDOR multi-tenant** (usar `verify_id_token(check_revoked=True)` + validar `firebase.tenant`, derivar uid/tenant do token — nunca de body/query; consolidar as duas fontes de identidade do frontend) e **documentos que descrevem estado irreal** (`IMPLEMENTATION_STATUS.md`, "Encryption: Enabled (AES-256)" em `SettingsPage.tsx:167`) — validar tudo contra o código e hacer deploy em clone limpo antes de codar.

## Implications for Roadmap

Suggested phase structure (reconcilia a ordem de `FEATURES.md`, o build order de `ARCHITECTURE.md` e as fases A–F de `PITFALLS.md`). O ROADMAP atual só cobre v1.0/Phases 10–12 (arquivadas) — o planejador deve criar a numeração v2.0.

### Phase 1: Fundação de Contratos e Segurança
**Rationale:** Bloqueante de tudo. Sem allow-list no Firestore, auth de API e segredos, qualquer feature seguinte vaza credenciais corporativas; e sem o schema definido agora, a fila/idempotência precisam ser reescritas.
**Delivers:** Tipos Zod em `shared/types/sharepoint` + converter; 7 coleções, 5 índices e `firestore.rules` com default deny; `firebase.json` com 2 codebases; `.env.example`; `auth.py`/`crypto.py`/`secrets.py`/`config.py`; deploy de validação em clone limpo; remoção do texto "AES-256 Enabled" falso.
**Addresses:** prerequisite do card de configuração e do backend de token.
**Avoids:** Pitfalls 2 e 8 (tokens/rules, IDOR), Pitfall 9 (docs/deploy enganosos).

### Phase 2: OAuth e Cofre de Tokens
**Rationale:** Fecha o ciclo de credencial antes de qualquer chamada ao Graph; valida que o callback sobrevive em outra instância Gen2. Produz o token que as fases 3–5 consomem.
**Delivers:** `oauth.py` + `msal_client.py`; transação PKCE/state/nonce no Firestore com `used` atômico; cache MSAL cifrado por uid; conectar/desconectar + revogação; card real em Settings (toggle, 5 estados, última sync).
**Uses:** `msal` 1.39.0, `cryptography` 50.0.2, Secret Manager, `--set-secrets`.
**Implements:** Pattern 5 (OAuth transacional + cache cifrado).
**Avoids:** Pitfalls 1 e 3 (replay/CSRF, serialização do cache).

### Phase 3: Abstração e Leitura Delegada
**Rationale:** A UI deve navegar com permissões reais já usando a abstração — assim trocar o destino depois não mexe nos componentes. Vem antes do streaming para que a UI nunca conheça R2.
**Delivers:** `graph_client` (sites/drives/items/search), `DocumentStorageService`, `SharePointService`, `useSharePoint`, rota `/documents`; navegação + breadcrumb, busca com indicador de origem, painel de propriedades (autoria/eTag), download em streaming sem cache.
**Uses:** `httpx` 0.28.1 (REST v1.0), `onSnapshot`, erro tipado com `FRIENDLY_MESSAGES`.
**Implements:** Pattern 1 (abstração de storage).

### Phase 4: Staging R2 e Fila Durável
**Rationale:** Núcleo de durabilidade do milestone. Streaming e fila são entrelaçados (o worker lê bytes do R2 e confirma no Graph), então pertencem ao mesmo bloco — após a abstração (Fase 3) e depois de existir token (Fase 2).
**Delivers:** `r2_client` (put/multipart/abort), `uploadInit`/`uploadStream`; `sync/state.py` + `worker.py` + `reconciler.py`; claim transacional com lease/`leaseEpoch`, backoff com `Retry-After`, quota antes de criar job, limpeza do R2 pós-confirmação; lifecycle rule no bucket.
**Uses:** `boto3` 1.44.5 (checksums `when_required`), trigger `on_document_created` + `scheduler_fn` a cada 1 min.
**Implements:** Patterns 2, 3, 4 (lease/fencing, idempotência+ETag, streaming puro).
**Avoids:** Pitfalls 4, 5, 6 e 7 (Graph/limites, disco temp, órfãos R2, timeout/cold start).

### Phase 5: Status Honesto, Auditoria e Resolução de Conflitos
**Rationale:** Depende da fila (Fase 4) para ter estados reais; fecha as promessas "nenhuma perda" e "salvo ≠ sincronizado" sem expor dado antigo.
**Delivers:** `StatusBadge` e estados por item na UI (`pendente`/`uploading`/`conflict`/`synced`/`dead_letter`); contagem de fila + retry manual; `lastSuccessfulSyncAt` honesto; detecção `412` → modal de resolução; `audit_store` append-only + `sharepointUsage`.
**Addresses:** status por item, resolução de conflito, auditoria, ações cientes de permissão.
**Avoids:** check verde mentiroso, substituição silenciosa, progresso fictício (ex.: `Math.random()` em `useETLResearch.ts`).

### Phase 6: Testes, Mocks e Deploy
**Rationale:** Gate final de qualidade; garante entrega configurável sem credenciais reais, como exige `PROJECT.md`.
**Delivers:** mocks `respx` (Graph) + `moto` (R2) cobrindo `412`/`413`/`429`/`5xx` e órfãos; pytest de transação/lease/idempotência e round-trip AES/AAD-inválido; suíte de regras no emulator (cross-user, leitura de credencial negada); teste "zero disco"; fix `firebase-tools` ≥ 15.16.0; `docs/SHAREPOINT_INTEGRATION.md`.
**Uses:** `respx` 0.23.1, `moto[s3]` 5.2.5, pytest alinhado a `apis/connectivity`.

### Phase Ordering Rationale
- **Segurança antes de credencial, credencial antes de Graph:** regras/auth/segredos (1) → token (2) → leitura (3) → binário/fila (4) → observabilidade (5). Fazer a fila antes do OAuth geraria jobs impossíveis de executar.
- **Abstração antes de streaming:** `DocumentStorageService` (3) precede R2 (4) para que a UI nunca importe boto3/Graph.
- **Fila + staging juntos, conflito depois:** resolução de conflito (5) só faz sentido quando `412`, ETag e estados da fila (4) existem.
- **Testes como gate em cada fase e consolidados no fim** (6), com deploy validado desde clone limpo — o risco de "parece pronto mas não deploya" é real neste repo.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2 (OAuth):** config exata do app registration Azure — `redirect_uri` (recomenda-se `form_post`, exatamente igual ao registrado), scopes mínimos (`Files.ReadWrite`, `Sites.Read.All`, `offline_access`), comportamento de consent do tenant e revogação programática. Depende de credenciais reais indisponíveis.
- **Phase 4 (R2 + Graph upload):** limites práticos de timeout/upload session com arquivos grandes reais, fatiamento de jobs e config de checksums do boto3 no endpoint R2 — validar com teste de integração.
- **Phase 6 (Deploy):** versão mínima estável do `firebase-tools` no ambiente e deploy multi-codebase (regressão 15.15.0 / fix 15.16.0).

Phases with standard patterns (skip research-phase):
- **Phase 1:** regras Firestore, `verify_id_token`, AES-256-GCM e multi-codebase são bem documentados e já verificados nesta pesquisa.
- **Phase 3:** navegação/leitura Graph v1.0 e padrão `onSnapshot`/erro tipado são established.
- **Phase 5:** padrões de UX de sync/conflict (side-by-side, keep both/replace/skip) cross-checkados em 4–6 fontes.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH / MEDIUM | Versões exatas e limites Gen2 = HIGH (PyPI JSON API + docs oficiais, 2026-11-17); escolha `msal`+`httpx` vs SDK e config R2 = MEDIUM (tradeoff de arquitetura / incidente de checksum) |
| Features | MEDIUM | UX e lifecycle cross-checkados em 4–6 fontes independentes; Graph APIs são fonte primária oficial; sem credenciais reais para validar limite exato de upload simples e revogação |
| Architecture | MEDIUM | Mapa do codebase = HIGH (leitura direta); APIs externas (MSAL/Graph/Gen2/R2/rules/verify_id_token) = MEDIUM (WebSearch com cross-check, nenhuma afirmação crítica depende só de memória) |
| Pitfalls | MEDIUM | Detalhes do codebase = HIGH; comportamento de SDKs/RFCs = MEDIUM (docs oficiais Microsoft/Cloudflare/Firebase + RFC 9700) |

**Overall confidence:** MEDIUM — suficiente para estruturar o roadmap; os pontos HIGH (stack versions, schema, regras) dão uma base sólida, e os MEDIUM concentram-se em config dependente de ambiente/credenciais.

### Gaps to Address

- **App registration Azure e scopes exatos** — redirect URI `form_post`, `Files.ReadWrite`/`Sites.Read.All`, consent do tenant. Validar na Fase 2 com credenciais reais; planejar como flag de pesquisa, não como suposição.
- **Limites reais de upload e timeout por tamanho de arquivo** — confirmar threshold de upload simples e fatiamento de chunks na Fase 4 com arquivos grandes do tenant.
- **Versão estável do `firebase-tools` + deploy multi-codebase** — fixar ≥ 15.16.0 e validar deploy em clone limpo na Fase 6.
- **Config de checksums do boto3/R2** — validar `request_checksum_calculation`/`response_checksum_validation = "when_required"` com teste de integração; o default CRC32 é rejeitado pelo R2.
- **Working tree e docs desatualizados** — `git status` tem entradas pendentes; documentos dizem "ready for production" sem lastro. Limpar/commitar antes de planejar e tratar esses docs como histórico.
- **Duas fontes de identidade no frontend** (`AuthProvider` com `user: unknown` + `AtlasAuthProvider`) — consolidar num `TenantUser` tipado antes da UI de documentos, para não reintroduzir IDOR.

## Sources

### Primary (HIGH confidence)
- PyPI JSON API (`https://pypi.org/pypi/<pacote>/json`) — versões e datas de release, consultado 2026-11-17
- Microsoft Learn — MSAL Python token cache serialization, Graph upload (`driveitem-put-content`, `createUploadSession`), Graph errors, permissions reference, OAuth auth code flow
- Cloudflare R2 — S3 API compatibility, boto3, object lifecycles, error codes (atualizado 2026-11-10)
- Google/Firebase — Python runtimes, Cloud Run functions quotas (32 MB/timeout/memória, 2026-11-12), `firebase_functions.options`, organize functions in codebases, Firestore rules/transactions, Admin SDK `verify_id_token`
- cryptography — AESGCM (nonce/AAD); NIST SP 800-38D; RFC 9700 (OAuth 2.0 Security BCP)
- **Internos (leitura direta):** `.planning/PROJECT.md`, `.planning/codebase/{ARCHITECTURE,STRUCTURE,INTEGRATIONS,CONCERNS,TESTING}.md`, `firebase.json`, `firestore.rules`, `firestore.indexes.json`, `apps/web/src/pages/SettingsPage.tsx`, `apps/web/src/services/DatatemService.ts`, `apis/connectivity/fastapi_app/firebase_client.py`

### Secondary (MEDIUM confidence)
- Padrões de UX de conexão/sync/conflict e file managers: Dropbox, Google Workspace, Gamut, Agently, Vellum, Nextcloud (#2540), ownCloud, Autodesk, shadcn.io, Pixso, Offline Protocol, uxpatternsguide, Google Open Health Stack, Beamline, WebPal, Unopim, SVAR, Open-Xchange
- Issues/PRs do firebase-tools (#10402, #10384, #10393) sobre runtime Python e regressão multi-codebase
- Padrões de stale-lease recovery e Cloud Tasks + Firestore durable queue (Medium/Google Cloud, devguide.dev) — padrão, não fonte normativa

### Tertiary (LOW confidence — validar)
- Limite exato de upload simples, comportamento de revogação programática e `firebase-tools` mínimo estável — dependentes de credenciais/ambiente não disponíveis neste milestone.

---
*Research completed: 2026-11-17*
*Ready for roadmap: yes*
