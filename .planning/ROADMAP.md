# Roadmap: Atlas 1.0 — Integração Nativa Microsoft SharePoint (v2.0)

## Overview

Roadmap do milestone **v2.0 — Integração Nativa Microsoft SharePoint**. A numeração continua a do milestone v1.0 (encerrado na Phase 12): este milestone compreende as **Phases 13 a 18**. O objetivo é tornar o SharePoint o repositório oficial de documentos dentro do Atlas, com autoria delegada preservada e nenhuma perda de alterações durante indisponibilidade.

A ordem de construção segue o backbone da pesquisa (`research/SUMMARY.md`): fundação de segurança → OAuth e cofre de tokens → abstração e leitura delegada → staging R2 e fila durável → status honesto e conflitos → testes, mocks e deploy. Os **55 requisitos v1** deste milestone são mapeados, cada um, para exatamente uma fase.

**Princípios que atravessam o milestone:** tokens nunca chegam ao frontend; Firestore e R2 são as únicas fontes de persistência; "salvo" ≠ "sincronizado"; identidade delegada do autor original em toda operação.

---

## Phases

- [ ] **Phase 13: Fundação de Segurança e Contratos** — Backend Python Gen2, default-deny no Firestore, segredos no Secret Manager, AES-256-GCM, `no-store`, isolamento UID/tenant, rate limiting e contratos de dados.
- [ ] **Phase 14: OAuth e Ciclo de Vida da Conexão** — Autorização com state/PKCE/nonce persistidos, callback validado, cache MSAL cifrado e card de conexão com cinco estados em Configurações.
- [ ] **Phase 15: Abstração e Leitura Delegada** — `DocumentStorageService`, leitura Graph de sites/bibliotecas/pastas, busca, propriedades e download em streaming com permissões delegadas.
- [ ] **Phase 16: Staging R2 e Fila Durável de Sincronização** — Upload em streaming para R2, máquina de estados, lease transacional, retry/backoff, idempotência, worker delegado, quota, limpeza e lista unificada.
- [ ] **Phase 17: Status Honesto, Conflitos e Auditoria** — Status por item confiável, contagem da fila com retry manual, detecção e resolução de conflito por ETag e auditoria append-only.
- [ ] **Phase 18: Testes, Mocks, Documentação e Deploy** — Suíte completa com mocks de Graph e R2, `.env.example`, documentação técnica e deploy multi-codebase validado em clone limpo.

---

## Phase Details

### Phase 13: Fundação de Segurança e Contratos

**Goal**: Nenhuma credencial corporativa vaza e nenhuma coleção privada é legível por outro usuário — a base de confiança sobre a qual todo o resto é construído.
**Depends on**: Nada (primeira fase do milestone v2.0; sucede a Phase 12)
**Requirements**: SEC-01, SEC-02, SEC-03, SEC-04, SEC-05, SEC-06, SEC-07, SEC-08, SEC-09
**Success Criteria** (o que deve ser TRUE):

  1. Usuário autenticado recebe acesso negado ao tentar ler credenciais, cache de tokens ou itens de outro UID/tenant.
  2. Nenhuma resposta de documento, token ou dado privado é armazenada em cache pelo navegador; as respostas trazem `Cache-Control: no-store, private, max-age=0`, `Pragma: no-cache` e `Expires: 0`.
  3. Chaves e segredos Microsoft nunca aparecem no frontend, em logs nem em arquivos versionados — somente IDs, status e timestamps são registrados.
  4. Uploads com tipo, tamanho, MIME, nome ou caminho inválidos, ou acima do limite de requisições, são recusados com mensagem compreensível.
  5. Exclusivamente Firestore e R2 persistem dados — nenhum token ou documento aparece em `localStorage`, `sessionStorage`, IndexedDB, Cache API, service worker ou arquivo temporário.

**Plans**: 1/8 plans executed
Plans:
**Wave 1**

- [x] 13-01-PLAN.md — Checkpoint de legitimidade de dependências + scaffold `apis/sharepoint-functions/` com `config.py`/`secret_provider.py` fail-closed (SEC-03)

**Wave 2** *(blocked on Wave 1 completion)*

- [ ] 13-02-PLAN.md — Envelope AES-256-GCM com `keyVersion`, nonce de 12 bytes e AAD por tenant (SEC-04)
- [ ] 13-03-PLAN.md — Contrato de resposta `no-store` imutável e erros sanitizados (SEC-05)
- [ ] 13-04-PLAN.md — `firestore.rules` default-deny com coleções explícitas + índices SharePoint (SEC-02)

**Wave 3** *(blocked on Wave 2 completion)*

- [ ] 13-05-PLAN.md — `AuthContext`/`resolve_auth_context` + `SharePointStore` isolado por tenant (SEC-01, SEC-06)
- [ ] 13-06-PLAN.md — Logging redigido por allow-list + validação de upload e rate limiting Firestore (SEC-07, SEC-08)

**Wave 4** *(blocked on Wave 3 completion)*

- [ ] 13-07-PLAN.md — Endpoints autenticados `sharepoint_me`/`sharepoint_upload_intent` + `firebase.json` multi-codebase (SEC-01)

**Wave 5** *(blocked on Wave 4 completion)*

- [ ] 13-08-PLAN.md — Correção honesta do `SettingsPage` + guarda estática de não-persistência (SEC-09)

**Cross-cutting constraints:**

- What happens if this runs twice on the same input?
- If interrupted or run in parallel, what is guaranteed?
- What is stored on disk or in Firestore while this runs?
- What error text reaches the browser when this fails?
- What happens when this is called without authentication?
- What happens on the very first run, where state does not exist yet?
- When elements compare equal, is output order specified and stable?

**Riscos / Research**: Padrões já verificados na pesquisa (regras Firestore, `verify_id_token`, AES-256-GCM, multi-codebase) — **não** requer `--research-phase`. Atenção: regra wildcard atual do `firestore.rules` e o texto falso "Data Encryption: Enabled (AES-256)" em `SettingsPage.tsx` devem ser corrigidos aqui; Admin SDK bypassa regras, então autorizar também no código.

### Phase 14: OAuth e Ciclo de Vida da Conexão

**Goal**: Usuário conecta e desconecta sua conta Microsoft com segurança e vê sempre o estado real da conexão — sem nunca manusear segredos.
**Depends on**: Phase 13
**Requirements**: CONN-01, CONN-02, CONN-03, CONN-04, CONN-05, CONN-06, CONN-07, CONN-08
**Success Criteria** (o que deve ser TRUE):

  1. Usuário encontra o card Microsoft SharePoint em Configurações → Integrações e consegue ativar/desativar a integração.
  2. Usuário inicia "Conectar conta Microsoft", é redirecionado para a página oficial da Microsoft e retorna com a conta vinculada ao seu UID, sem digitar ou colar nenhuma chave.
  3. Um callback com `state`, nonce, PKCE, tenant ou UID divergente, expirado ou reutilizado é recusado — nenhuma credencial é emitida.
  4. Usuário vê a identidade da conta conectada, um dos estados `disabled`/`disconnected`/`connected`/`syncing`/`problems` e a data/hora da última sincronização bem-sucedida.
  5. Usuário desconecta a conta (estado muda para `disconnected`, documentos já sincronizados permanecem) e, com refresh token revogado/expirado, é orientado a reconectar sem substituição automática da identidade do criador.

**Plans**: TBD
**UI hint**: yes
**Riscos / Research**: Requer **`--research-phase`** para a config exata do app registration Azure — `redirect_uri` (`form_post`, exatamente igual ao registrado), scopes mínimos (`Files.ReadWrite`, `Sites.Read.All`, `offline_access`), comportamento de consent do tenant e revogação programática. Nenhuma credencial Microsoft real disponível neste milestone.

### Phase 15: Abstração e Leitura Delegada

**Goal**: Usuário navega e lê o SharePoint usando suas próprias permissões delegadas, sem que a interface conheça Graph, R2 ou MSAL.
**Depends on**: Phase 14
**Requirements**: EXPL-01, EXPL-02, EXPL-03, EXPL-04, EXPL-05, EXPL-07
**Success Criteria** (o que deve ser TRUE):

  1. Usuário vê somente os sites do SharePoint aos quais possui acesso.
  2. Usuário abre bibliotecas de um site e percorre pastas com breadcrumb e voltar, encontrando documentos por busca no escopo acessível com indicador da origem de cada resultado.
  3. Usuário abre as propriedades de um arquivo e vê autor Microsoft, eTag, tamanho, MIME type e datas.
  4. Usuário baixa documentos do SharePoint em streaming, sem cópia intermediária em disco nem no R2.
  5. Itens e ações exibidos respeitam as permissões delegadas — operações sem permissão não aparecem ou são bloqueadas com mensagem amigável.

**Plans**: TBD
**UI hint**: yes
**Riscos / Research**: Rota `/documents`, `DocumentStorageService` e erro tipado com `FRIENDLY_MESSAGES` são padrões established — **não** requer `--research-phase`. Pré-requisito: consolidar as duas fontes de identidade do frontend num `TenantUser` tipado antes da UI, para não reintroduzir IDOR.

### Phase 16: Staging R2 e Fila Durável de Sincronização

**Goal**: Usuário envia arquivos que sobrevivem a indisponibilidade do SharePoint e ao reinício do backend, sem perda, sem duplicatas e com a autoria original preservada.
**Depends on**: Phase 15 (abstração antes do R2) e Phase 14 (credenciais para o worker)
**Requirements**: EXPL-06, SYNC-01, SYNC-02, SYNC-03, SYNC-04, SYNC-05, SYNC-06, SYNC-07, SYNC-08, SYNC-09, SYNC-10, SYNC-11, SYNC-12, SYNC-13, SYNC-14, SYNC-15, SYNC-16, SYNC-17
**Success Criteria** (o que deve ser TRUE):

  1. Usuário envia um arquivo e vê "salvo com segurança" somente depois que o binário está no R2 (por streaming, sem arquivo temporário) e o SHA-256 com metadados está no Firestore — nunca antes da confirmação do SharePoint.
  2. Usuário vê arquivos pendentes no R2 na mesma lista dos documentos do SharePoint, com badge de origem distinto.
  3. A autoria no SharePoint reflete sempre o usuário que iniciou a operação (UID, tenant ID e Microsoft Object ID registrados), inclusive quando o worker envia a versão minutos depois renovando o token pelo cache MSAL.
  4. Com o SharePoint indisponível, o arquivo permanece no R2 e a operação pendente; após reinício do backend a fila é retomada automaticamente, com retry/backoff, lease por `leaseEpoch` e idempotência — sem duplicatas e sem overwritten silencioso.
  5. Usuário cria pastas e substitui versões com controle de versão; novos uploads são bloqueados com mensagem adequada quando a quota do R2 se esgota, e objetos órfãos são removidos por rotina de limpeza.

**Plans**: TBD
**UI hint**: yes
**Riscos / Research**: Requer **`--research-phase`** para limites práticos de upload do Graph (simples vs. sessão resumável, fatiamento em chunks de 320 KiB), comportamento de timeout do Gen2 e config de checksums do boto3 no endpoint R2 (`when_required` — o default CRC32 é rejeitado). Streaming e fila permanecem na mesma fase porque o worker lê bytes do R2 e confirma no Graph.

### Phase 17: Status Honesto, Conflitos e Auditoria

**Goal**: Usuário confia no que vê: o status reflete o mundo real, conflitos nunca sobrescrevem a versão oficial e nenhuma versão desaparece silenciosamente.
**Depends on**: Phase 16
**Requirements**: STAT-01, STAT-02, STAT-03, STAT-04, STAT-05, STAT-06, STAT-07
**Success Criteria** (o que deve ser TRUE):

  1. Usuário vê status por item — pendente/salvo, sincronizando, sincronizado, requer autenticação, conflito ou falha — e "sincronizado" só aparece após confirmação do Microsoft Graph.
  2. Usuário vê a contagem de arquivos aguardando envio e pode solicitar retry manual de um item.
  3. Ao detectar divergência por ETag/cTag, o sistema marca a operação como `CONFLICT` sem sobrescrever a versão oficial, e a versão enviada permanece no R2 até a decisão do usuário.
  4. Usuário resolve o conflito escolhendo manter ambos, substituir, manter a versão do SharePoint, pular ou resolver depois — nenhuma versão desaparece sem decisão explícita.
  5. Conexões, desconexões, falhas e resoluções de conflito aparecem na auditoria sem expor tokens, segredos ou conteúdo de arquivo.

**Plans**: TBD
**UI hint**: yes
**Riscos / Research**: Padrões de UX de sync/conflict cross-checkados na pesquisa — **não** requer `--research-phase`. Evitar check verde mentiroso, substituição silenciosa e progresso fictício (ex.: `Math.random()` em `useETLResearch.ts`).

### Phase 18: Testes, Mocks, Documentação e Deploy

**Goal**: A integração é entregue verificável sem credenciais reais e reproduzível por qualquer pessoa a partir de um clone limpo.
**Depends on**: Todas as anteriores (13, 14, 15, 16, 17)
**Requirements**: TEST-01, TEST-02, TEST-03, TEST-04, TEST-05, TEST-06, TEST-07
**Success Criteria** (o que deve ser TRUE):

  1. Qualquer pessoa executa a suíte completa de testes sem credenciais reais, usando mocks de Microsoft Graph e Cloudflare R2 que simulam `412`, `413`, `429`, `5xx` e objetos órfãos.
  2. Os testes cobrem OAuth (sucesso, callback/state inválidos, UID divergente, expiração, reconexão, desconexão), permissões (isolamento, IDOR, acesso limitado), arquivos, sincronização (indisponibilidade, restart, duplicidade, token expirado, conflito, falha ao remover do R2) e storage/cache (sem token no navegador, sem temp file, regras Firestore, R2 privado, `no-store`).
  3. O arquivo `.env.example` é completo e a documentação técnica cobre arquitetura, OAuth/Entra, permissões, Firebase, Firestore, criptografia, R2, sincronização, conflitos, deploy, variáveis, execução local, testes, monitoramento, limites do plano gratuito e recuperação — com diagramas de arquitetura e sequência.
  4. Um deploy multi-codebase (reporting Node + sharepoint Python 3.12) é validado a partir de clone limpo, sem depender do working tree sujo.

**Plans**: TBD
**Riscos / Research**: Requer **`--research-phase`** para fixar a versão mínima estável do `firebase-tools` no ambiente (≥ 15.16.0 — regressão multi-codebase em 15.15.0). O repositório tem working tree sujo e docs que se dizem "ready for production" sem lastro: tratar como histórico e validar tudo contra o código.

---

## Dependencies

- **Segurança antes de credencial:** regras/auth/segredos (13) → token (14) → leitura (15) → binário/fila (16) → observabilidade (17). Fazer a fila antes do OAuth geraria jobs impossíveis de executar.
- **Abstração antes de streaming:** `DocumentStorageService` (15) precede o R2 (16) para que a UI nunca importe `boto3`/Graph.
- **Fila e staging juntos, conflito depois:** resolução de conflito (17) só faz sentido quando `412`, ETag e estados da fila (16) existem.
- **Testes como gate final (18)**, com deploy validado desde clone limpo.

| Phase | Depends on |
|-------|-----------|
| 13 | Nada |
| 14 | 13 |
| 15 | 14 |
| 16 | 15, 14 |
| 17 | 16 |
| 18 | 13, 14, 15, 16, 17 |

---

## Coverage Validation

Mapeamento de todos os **55 requisitos v1** — cada um em exatamente uma fase:

| Requisitos | Fase | Qtd. |
|-----------|------|------|
| SEC-01 … SEC-09 | Phase 13 | 9 |
| CONN-01 … CONN-08 | Phase 14 | 8 |
| EXPL-01, EXPL-02, EXPL-03, EXPL-04, EXPL-05, EXPL-07 | Phase 15 | 6 |
| EXPL-06, SYNC-01 … SYNC-17 | Phase 16 | 18 |
| STAT-01 … STAT-07 | Phase 17 | 7 |
| TEST-01 … TEST-07 | Phase 18 | 7 |
| **Total** | | **55** |

- Mapeados: **55 / 55**
- Órfãos: **0**
- Duplicatas: **0**

`EXPL-06` (lista unificada) fica na Phase 16 porque depende dos binários pendentes no R2; os demais EXPL de leitura ficam na Phase 15. Esse é o único requisito cuja fase difere da categoria nominal.

---

## Progress

**Ordem de execução:** 13 → 14 → 15 → 16 → 17 → 18

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 13. Fundação de Segurança e Contratos | 1/8 | In Progress|  |
| 14. OAuth e Ciclo de Vida da Conexão | 0/TBD | Not started | - |
| 15. Abstração e Leitura Delegada | 0/TBD | Not started | - |
| 16. Staging R2 e Fila Durável de Sincronização | 0/TBD | Not started | - |
| 17. Status Honesto, Conflitos e Auditoria | 0/TBD | Not started | - |
| 18. Testes, Mocks, Documentação e Deploy | 0/TBD | Not started | - |
