# Requirements: Atlas 1.0 — Integração Nativa Microsoft SharePoint (v2.0)

**Defined:** 2026-11-17
**Core Value:** Entregar um sistema operacional SaaS customizationável de nível empresarial, preservando 100% de compatibilidade com os usuários Eletra existentes.

## v1 Requirements

Requisitos do milestone v2.0. Cada um será mapeado para exatamente uma fase do roadmap.

### Segurança & Fundação (SEC)

- [x] **SEC-01**: Backend em Cloud Functions Python Gen2 implantado no projeto Firebase, com verificação do Firebase ID Token em todo endpoint autenticado.
- [x] **SEC-02**: Regras Firestore com `default deny` e allow-list explícita, impedindo que o SDK cliente leia coleções privadas de credenciais.
- [x] **SEC-03**: Client Secret Microsoft e chave mestra de criptografia obtidos do Google Cloud Secret Manager, nunca versionados ou enviados ao frontend.
- [x] **SEC-04**: Cache serializado do MSAL armazenado no Firestore com AES-256-GCM, IV único, tag de autenticação e `keyVersion`.
- [x] **SEC-05**: Respostas HTTP de documentos, tokens e dados privados com `Cache-Control: no-store, private, max-age=0`, `Pragma: no-cache` e `Expires: 0`.
- [x] **SEC-06**: Isolamento por Firebase UID e tenant em toda consulta, bloqueando acesso cruzado por IDOR.
- [x] **SEC-07**: Logs e auditoria sem tokens, segredos ou conteúdo de arquivo — apenas IDs, status e timestamps.
- [x] **SEC-08**: Rate limiting e validação de tipo, tamanho, MIME, nome e caminho de arquivos nos endpoints sensíveis.
- [ ] **SEC-09**: Nenhum mecanismo de persistência além de Firestore e R2 — sem localStorage, sessionStorage, IndexedDB, Cache API, service worker, Redis, SQLite, arquivos JSON locais ou `tempfile`.

### Conexão (CONN)

- [ ] **CONN-01**: Usuário encontra o card Microsoft SharePoint na aba Integrações de Configurações, com nome, descrição, ícone adequado e botão para ativar/desativar.
- [ ] **CONN-02**: Usuário inicia a conexão com "Conectar conta Microsoft" e é redirecionado para a página oficial de autenticação da Microsoft.
- [ ] **CONN-03**: Backend gera `state`, verificador PKCE e transação persistida no Firestore com expiração, associados ao Firebase UID autenticado.
- [ ] **CONN-04**: Callback valida `state`, nonce, PKCE, identidade Microsoft, tenant, expiração e reutilização de authorization code.
- [ ] **CONN-05**: Backend troca o code por credenciais, consulta o perfil Microsoft, vincula a conta ao Firebase UID e persiste o cache criptografado.
- [ ] **CONN-06**: Usuário vê a identificação da conta conectada e os estados `disabled`, `disconnected`, `connected`, `syncing` ou `problems`, além da data/hora da última sincronização bem-sucedida.
- [ ] **CONN-07**: Usuário pode desconectar a conta; o backend remove as credenciais e marca `disconnected` sem apagar documentos já sincronizados.
- [ ] **CONN-08**: Usuário com refresh token revogado ou expirado é orientado a reconectar, sem substituição automática da identidade do criador.

### Exploração (EXPL)

- [ ] **EXPL-01**: Usuário visualiza os sites do SharePoint aos quais possui acesso.
- [ ] **EXPL-02**: Usuário abre bibliotecas de um site e navega por pastas com breadcrumb e voltar.
- [ ] **EXPL-03**: Usuário pesquisa documentos no escopo acessível, com indicador da origem de cada resultado.
- [ ] **EXPL-04**: Usuário visualiza propriedades do arquivo, incluindo autor Microsoft, eTag, tamanho, MIME type e datas.
- [ ] **EXPL-05**: Usuário baixa documentos do SharePoint por streaming, sem cópia intermediária em disco ou R2.
- [ ] **EXPL-06**: Usuário vê arquivos pendentes no R2 na mesma lista dos documentos do SharePoint, com badge de origem distinto.
- [ ] **EXPL-07**: Ações e itens exibidos respeitam as permissões delegadas do usuário no SharePoint.

### Escrita & Sincronização (SYNC)

- [ ] **SYNC-01**: Usuário envia arquivo novo para uma biblioteca/pasta e o backend transmite o binário por streaming ao R2.
- [ ] **SYNC-02**: Backend calcula ou valida SHA-256 e grava metadados no Firestore antes de confirmar o salvamento ao usuário.
- [ ] **SYNC-03**: Confirmação de "salvo com segurança" ocorre somente após R2 e Firestore — nunca antes da confirmação do SharePoint.
- [ ] **SYNC-04**: Cada operação registra de forma permanente o Firebase UID, tenant ID e Microsoft Object ID do usuário que a iniciou.
- [ ] **SYNC-05**: Worker renova credenciais pelo cache MSAL, persiste a rotação do refresh token e envia o arquivo usando a identidade delegada original.
- [ ] **SYNC-06**: Worker envia novos arquivos e versões modificadas ao SharePoint via Microsoft Graph, usando upload simples ou sessão resumável conforme o tamanho.
- [ ] **SYNC-07**: Worker remove o objeto do R2 somente após o SharePoint confirmar a gravação; o registro permanece no Firestore como histórico.
- [ ] **SYNC-08**: Máquina de estados `PREPARING`, `STORED`, `PENDING_SYNC`, `SYNCING`, `SYNCED`, `AUTH_REQUIRED`, `CONFLICT`, `FAILED_RETRYABLE`, `FAILED_FINAL` com transições válidas e persistentes.
- [ ] **SYNC-09**: Lease transacional com `leaseEpoch` impede que múltiplos workers processem a mesma operação simultaneamente.
- [ ] **SYNC-10**: Retry com exponential backoff e jitter, limite de tentativas e classificação de erros (rede, indisponibilidade, auth, permissão, conflito, inexistência, throttling, quota).
- [ ] **SYNC-11**: Operações pendentes sobrevivem ao reinício do backend e são retomadas automaticamente pelo worker/reconciliador.
- [ ] **SYNC-12**: Processamento idempotente não cria arquivos duplicados no SharePoint.
- [ ] **SYNC-13**: Indisponibilidade do SharePoint mantém o arquivo no R2 e a operação pendente, sem perda de alterações.
- [ ] **SYNC-14**: Usuário cria pastas e substitui versões existentes respeitando permissões e controle de versão.
- [ ] **SYNC-15**: Quota do R2 é monitorada e novos uploads são bloqueados com mensagem adequada quando não há espaço operacional.
- [ ] **SYNC-16**: Objetos órfãos do R2 são identificados e removidos por rotina de limpeza.
- [ ] **SYNC-17**: Uploads e downloads ocorrem por streaming, sem arquivos temporários em disco — incluindo desativação de `SpooledTemporaryFile` do FastAPI.

### Status & Conflitos (STAT)

- [ ] **STAT-01**: Usuário vê status por item: salvo/pendente, sincronizando, sincronizado, requer autenticação, conflito ou falha.
- [ ] **STAT-02**: Status "sincronizado" só aparece após confirmação do Microsoft Graph.
- [ ] **STAT-03**: Usuário vê a contagem de arquivos aguardando envio e pode solicitar retry manual.
- [ ] **STAT-04**: Sistema detecta conflito por ETag/cTag e marca a operação como `CONFLICT` sem sobrescrever a versão oficial.
- [ ] **STAT-05**: Usuário resolve conflitos com manter ambos, substituir, manter versão do SharePoint, pular ou resolver depois.
- [ ] **STAT-06**: Versão enviada permanece no R2 até a decisão do usuário; nenhuma versão desaparece silenciosamente.
- [ ] **STAT-07**: Auditoria registra conexão, desconexão, falhas e resolução de conflitos sem expor dados sensíveis.

### Testes & Documentação (TEST)

- [ ] **TEST-01**: Testes automatizados cobrem OAuth (sucesso, callback inválido, state inválido, UID divergente, expiração, reconexão e desconexão).
- [ ] **TEST-02**: Testes cobrem permissões (isolamento entre usuários, IDOR, conta sem permissão Microsoft, acesso limitado a sites).
- [ ] **TEST-03**: Testes cobrem arquivos (listagem, propriedades, download SharePoint/R2, upload, SHA-256, arquivos grandes e falha de upload).
- [ ] **TEST-04**: Testes cobrem sincronização (SharePoint disponível/indisponível, retry, restart, duplicidade, token expirado, conflito e falha ao remover objeto do R2).
- [ ] **TEST-05**: Testes verificam storage/cache (nenhum token/documento no navegador, nenhum temp file, regras Firestore, R2 privado, `no-store` e recuperação após restart).
- [ ] **TEST-06**: Mocks de Microsoft Graph e Cloudflare R2 permitem executar a suíte completa sem credenciais reais.
- [ ] **TEST-07**: `.env.example` completo e documentação técnica cobrindo arquitetura, OAuth, Entra, permissões, Firebase, Firestore, criptografia, R2, sincronização, conflitos, deploy, variáveis, execução local, testes, monitoramento, limites do plano gratuito e recuperação, com diagramas de arquitetura e sequência.

## v2 Requirements

Diferidos para depois da validação do milestone v2.0.

### Exploração avançada

- **EXPL-08**: Histórico completo de versões no painel (listar, baixar e promover).
- **EXPL-09**: Filtros por tipo e data no explorador.
- **EXPL-10**: Upload resumable com barra de progresso por arquivo e drag-and-drop.

### Operações em escala

- **SYNC-18**: Resolução de conflitos em lote com "aplicar a todos".
- **STAT-08**: Painel de monitoramento com métricas de sincronização e consumo de quota.

### Pendências do milestone v1.0

- **FUNC-01**: Migrar exportação PDF para Cloud Function Puppeteer (Phase 10 original).
- **TEST-08**: Emulator Suite e endurecimento de regras de segurança (Phase 11 original).
- **DEPL-01**: Deploy comercial do Atlas 1.0 no Firebase (Phase 12 original).

## Out of Scope

| Feature | Reason |
|---------|--------|
| Autenticação app-only no Microsoft Graph | Destrói a autoria genuína no SharePoint; todas as operações usam permissões delegadas. |
| Cache persistente ou armazenamento temporário em disco | Firestore e R2 são as únicas fontes de persistência autorizadas; evita dados antigos e vazamento. |
| Cópia permanente de arquivos no R2 | R2 é temporário até o SharePoint confirmar; duplicidade criaria divergência de fonte oficial. |
| Espelhar todos os arquivos do SharePoint no Firestore | Firestore guarda apenas metadados operacionais; conteúdo oficial permanece no SharePoint. |
| Outros provedores (Google Drive, Dropbox) neste milestone | Cada provedor tem escopos e modelos de conflito próprios; foco exclusivo em SharePoint. |
| Edição inline de Office no navegador | Custo de autenticação e compliance elevado; reavaliar em v2+. |
| Split-view, abas múltiplas e ZIP de pasta | Não são table stake; aumentam superfície de teste sem validar o core. |
| VPS, servidores dedicados e PostgreSQL | Decisão anterior do projeto: arquitetura estritamente Firebase serverless. |

## Traceability

Cada requisito `v1` mapeado para exatamente uma fase do roadmap v2.0 (Phases 13–18).

| Requirement | Phase | Status |
|-------------|-------|--------|
| SEC-01 | Phase 13 | Complete |
| SEC-02 | Phase 13 | Complete |
| SEC-03 | Phase 13 | Complete |
| SEC-04 | Phase 13 | Complete |
| SEC-05 | Phase 13 | Complete |
| SEC-06 | Phase 13 | Complete |
| SEC-07 | Phase 13 | Complete |
| SEC-08 | Phase 13 | Complete |
| SEC-09 | Phase 13 | Pending |
| CONN-01 | Phase 14 | Pending |
| CONN-02 | Phase 14 | Pending |
| CONN-03 | Phase 14 | Pending |
| CONN-04 | Phase 14 | Pending |
| CONN-05 | Phase 14 | Pending |
| CONN-06 | Phase 14 | Pending |
| CONN-07 | Phase 14 | Pending |
| CONN-08 | Phase 14 | Pending |
| EXPL-01 | Phase 15 | Pending |
| EXPL-02 | Phase 15 | Pending |
| EXPL-03 | Phase 15 | Pending |
| EXPL-04 | Phase 15 | Pending |
| EXPL-05 | Phase 15 | Pending |
| EXPL-07 | Phase 15 | Pending |
| EXPL-06 | Phase 16 | Pending |
| SYNC-01 | Phase 16 | Pending |
| SYNC-02 | Phase 16 | Pending |
| SYNC-03 | Phase 16 | Pending |
| SYNC-04 | Phase 16 | Pending |
| SYNC-05 | Phase 16 | Pending |
| SYNC-06 | Phase 16 | Pending |
| SYNC-07 | Phase 16 | Pending |
| SYNC-08 | Phase 16 | Pending |
| SYNC-09 | Phase 16 | Pending |
| SYNC-10 | Phase 16 | Pending |
| SYNC-11 | Phase 16 | Pending |
| SYNC-12 | Phase 16 | Pending |
| SYNC-13 | Phase 16 | Pending |
| SYNC-14 | Phase 16 | Pending |
| SYNC-15 | Phase 16 | Pending |
| SYNC-16 | Phase 16 | Pending |
| SYNC-17 | Phase 16 | Pending |
| STAT-01 | Phase 17 | Pending |
| STAT-02 | Phase 17 | Pending |
| STAT-03 | Phase 17 | Pending |
| STAT-04 | Phase 17 | Pending |
| STAT-05 | Phase 17 | Pending |
| STAT-06 | Phase 17 | Pending |
| STAT-07 | Phase 17 | Pending |
| TEST-01 | Phase 18 | Pending |
| TEST-02 | Phase 18 | Pending |
| TEST-03 | Phase 18 | Pending |
| TEST-04 | Phase 18 | Pending |
| TEST-05 | Phase 18 | Pending |
| TEST-06 | Phase 18 | Pending |
| TEST-07 | Phase 18 | Pending |

**Coverage:**

- v1 requirements: 55 total
- Mapped to phases: 55 ✓
- Unmapped: 0 ✓

---
*Requirements defined: 2026-11-17*
*Last updated: 2026-11-17 after v2.0 roadmap creation (traceability 55/55)*
