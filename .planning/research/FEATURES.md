# Feature Research

**Domain:** Integração nativa Microsoft SharePoint em Atlas 1.0 (milestone v2.0) — features da nova experiência de documentos
**Researched:** 2026-11-17
**Confidence:** MEDIUM (padrões de UX cross-checkados em múltiplas fontes; APIs Microsoft Graph confirmadas em documentação oficial; nenhuma credencial real disponível para validação prática)

> **Escopo:** Este documento cobre **apenas as features novas** do milestone v2.0 — (1) card de configuração SharePoint, (2) explorador unificado de documentos, (3) status visual honesto (salvo ≠ sincronizado) e (4) resolução de conflitos. Features já existentes do Atlas (shell multi-tenant, sidebar dinâmica, design system, widget platform, documents widget) são tratadas como **dependências**, não como escopo.
>
> **Restrições que moldam todas as recomendações abaixo** (de `PROJECT.md`, 2026-11-17):
> - **Sem cache, sem armazenamento persistente no navegador, sem arquivos temporários.** Firestore (estado/metadados/fila/credenciais) e Cloudflare R2 (binário pendente) são os únicos mecanismos de persistência autorizados.
> - **Tokens/credenciais Microsoft nunca chegam ao frontend.** Cliente confidencial em Cloud Functions Python Gen2, cache MSAL criptografado (AES-256-GCM) com chaves no Secret Manager, respostas `no-store`.
> - **Identidade delegada do usuário original** em toda operação Grav no SharePoint — sem app-only.

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features que usuários assumem que existem. Ausência = produto parece incompleto.

#### A. Ciclo de vida da conexão (card em Configurações)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Toggle ativar/desativar integração no tenant | Toda integração séria tem um interruptor mestre; desativar deve parar toute tentativa de sync e ocultar entradas SharePoint no explorador | LOW | Reusa rota `/settings` + `SettingsPage.tsx` + aba "Integrações" hoje placeholder (`SettingsModal.tsx:347`). Usar `Switch`/`Card` do shadcn/ui com tokens de `globals.css`. Estado persistido em Firestore (não em memória do navegador). |
| Conectar conta Microsoft via OAuth (consent screen) | Padrão universal: "Connect with OAuth, não cole API key" (Dropbox, Google Workspace, Vellum, Agently, DocuSign) | HIGH | UI é fina (botão → redirect); complexidade está no backend: Authorization Code + PKCE, `state` e transação persistidos no Firestore, `offline_access` para refresh token, `redirect_uri` exatamente igual ao registrado. `state` validado no callback (CSRF) — confirmado em `learn.microsoft.com/graph/auth-v2-user` (2025-08-29). Nada de token no front. |
| Desconectar conta com revogação imediata | Usuários esperam que "Disconnect" corte o acesso na hora (Dropbox Settings → Apps → Disconnect; Vellum delet o token local imediatamente) | MED | Backend remove o documento de credencial criptografada do Firestore e marca status `disconnected`. Opcionalmente orientar usuário a revogar também em `account.microsoft.com` (defesa em camada dupla, como Vellum/DocuSign). **Atenção:** itens já sincronizados no SharePoint permanecem — desconectar não apaga conteúdo. |
| Status explícito: `disabled` / `disconnected` / `connected` / `syncing` / `problems` | Produtos como Gamut e Agently mostram status de conta (Active/Revoked/Expired) e ação de reconectar; status ambíguo gera suporte | LOW–MED | Modelo de estado único no Firestore, consumido por `onSnapshot` (padrão já disseminado no codebase). `problems` deve ser agregado de falhas de sync/token, não booleano solto. Evitar estado "Online" separado — ver pitfall em status. |
| "Última sincronização bem-sucedida" com timestamp local | Guia de UX (Offline Protocol, Google Open Health Stack) é explícito: timestamp é mais concreto que spinner | LOW | Campo `lastSuccessfulSyncAt` no documento de status. Renderizar em `Intl.DateTimeFormat` com timezone do usuário. Nunca derivar de `Date.now()` do navegador como "sucesso". |

#### B. Explorador unificado de documentos

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Navegar sites → bibliotecas (drives) → pastas → arquivos | É o fluxo mental natural do SharePoint; todo file manager faz isso (WebPal, Beamline, SVAR, openfilz) | MED–HIGH | Graph: `GET /sites/{site-id}/drives` e `GET /drives/{id}/items/{id}/children` (página de 200 itens, `@odata.nextLink`). Respeitar permissões delegadas: só exibir o que o token do usuário alcança. |
| Breadcrumb de navegação + voltar | Orientação básica; ausência deixa usuário perdido em hierarquia profunda | LOW | Derivar do caminho de `driveItem` já percorrido (manter pilha no estado da página, não em cache persistente). |
| Busca no escopo de documentos | Usuários esperam buscar sem saber o caminho (Slack indexa Drive; Unopim/WebPal buscam em toda a biblioteca) | MED | Usar Graph Search/`/search/query` ou `driveItem search` sob demanda. **Resultados devem dizer a origem** (SharePoint vs. R2 pendente) e respeitar permissões. Não indexar/mirrorar tudo no Firestore (ver anti-feature). |
| Painel de propriedades do arquivo | "Clique e veja detalhes" é universal (WebPal right panel, openfilz metadata panel, Beamline details panel) | MED | Expor `name`, `size`, `lastModifiedDateTime`, `lastModifiedByUser` (autoria!), `eTag`/`cTag`, caminho, tipo. Usar `Sheet`/`Dialog` do shadcn/ui. |
| Download em streaming | Table stake de qualquer explorador de arquivos | MED | `@microsoft.graph.downloadUrl` é de curta duração (~1h) e **não pode ser cacheado** (docs oficiais). Backend faz proxy/stream com `Cache-Control: no-store`. Nunca guardar URL nem bytes no navegador. |
| Upload (novo arquivo) com destino em biblioteca/pasta | Primary action de todo file manager; "Upload" no toolbar (Beamline) | HIGH | Binário vai para R2 **temporariamente** até o SharePoint confirmar. Enviar ao Graph após confirmação; limpar R2. Upload simples vs. upload session resumable para arquivos grandes (limite exato a confirmar na fase de implementação — docs Microsoft citam 250 MB para upload simples em SharePoint Embedded; validar para o tenant real). |
| Criar pasta / criar documento | Esperado em qualquer gestor de documentos | LOW–MED | Graph "Create folder" (driveItem com `folder` facet). Criar documento vazio depende de template — se não houver template definido, entregar só "Nova pasta" no MVP. |
| Substituir versão de arquivo existente | Necessário para corrigir/conteúdo atualizado sem duplicar lixo | MED | Graph `PUT` com `@microsoft.graph.conflictBehavior` (`fail`/`replace`/`rename`; default do PUT é `replace` — docs oficiais). Antes de substituir, ler `eTag`/`cTag` para verificar concorrência. Office no SharePoint já tem versioning automático. |

#### C. Status honesto e resolução de conflitos

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Status por item: salvo-no-R2 (pendente) / sincronizando / sincronizado / falhou / conflito | UX moderna de sync exige estado **por objeto**, não só banner global (uxpatternsguide, Offline Protocol, Pixso) | MED | Rótulos precisos importam mais que ícones: "Salvo no Atlas · aguardando envio ao SharePoint" ≠ "Sincronizado no SharePoint". Verde/checked **somente após o Graph aceitar**. Alimentar da fila persistente no Firestore via `onSnapshot`. |
| Indicador de fila com contagem e retry | Partial success deve ficar visível até tudo resolver (uxpatternsguide) | MED | Contagem nomeada ("3 arquivos aguardando envio"), com ações retry/cancel explícitas. Sem toast para problema persistente — toast desaparece e esconde trabalho inacabado. |
| Detecção de conflito por ETag | Sem detecção, uma gravação sobrescreve a outra silenciosamente | MED (backend) | Comparar `eTag`/`cTag` lido antes da edição com o atual do driveItem. Correlacionar com idempotência da fila para não gerar conflito falso em retry. |
| UI de resolução de conflito (comparar + escolher) | Padrão convergente: lado-a-lado (existente à esquerda, novo à direita), com ações manter ambos / substituir / manter atual / pular (Nextcloud PR #2540, Autodesk, ownCloud, shadcn.io block) | MED–HIGH | Modal (um conflito por vez) com: diff de nome/tamanho/data, negrito no que é mais novo/maior, seta entre versões, e botões **Manter ambos / Substituir / Manter versão do SharePoint / Pular / Resolver depois**. Preservar o trabalho local não sincronizado até decisão. "Resolver depois" mantém item marcado na lista. |

---

### Differentiators (Competitive Advantage)

Features que diferenciam o Atlas — alinhadas ao Core Value do `PROJECT.md`.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Explorador **verdadeiramente unificado**: arquivos SharePoint e binários R2 pendentes na mesma lista | É a promessa explícita do milestone ("experiência unificada, sem área paralela para documentos"). Concorrentes (Agently, Vellum) mantêm fontes separadas ou só importam arquivos escolhidos | HIGH | Requer modelo único de "item de documento" no frontend com discriminador de origem (`sharePoint` \| `r2Pending`). Pendentes precisam de badge visual distinto e ações limitadas (não dá para "propriedades SharePoint" de um arquivo ainda não confirmado). |
| Preservação real de autoria (identidade delegada do criador) | Diferencial ético e de auditoria: o `lastModifiedByUser` no SharePoint é o usuário Microsoft original, não um "bot do Atlas" | MED–HIGH | Backend deve usar o token delegado do usuário que iniciou a operação — inclusive quando o worker de sync processa a fila depois. Guardar UID/tenant do iniciador na fila. **Nunca** app-only (fora de escopo por decisão). |
| Zero perda de alterações durante indisponibilidade do SharePoint | R2 como depósito durável de binário pendente + fila persistente no Firestore com backoff/idempotência = promessa de resiliência que poucos integradores entregam | HIGH | Diferencial de confiança. depende de `lastSuccessfulSyncAt` honesto e de retry visível — não de "tudo salvo" otimista. |
| "Salvo ≠ sincronizado" como princípio de produto (sem green-check mentiroso) | Quase todo app otimiza para UI otimista e mente; aqui a distinção é feature, não detalhe | LOW–MED | Separar persistentemente "commit no R2/Firestore" de "aceito pelo SharePoint". Baseado em padrões de local-first (Pixso: "saved should be a precise promise"). Custo baixo, valor de confiança alto. |
| Histórico de versões acessível pelo explorador | Recuperação de "arquivo sobrescrito por colega" em um clique (Open-Xchange, WebPal) | MED | Graph "List versions" (`/drive/items/{id}/versions`). Exibir autor/data, permitir baixar e promover versão. Pode virar v1.x se o milestone apertar prazo. |
| Ações cientes de permissão (UI esconde o que o usuário não pode fazer) | Evita frustração e erros 403; padrão elogiado em Unopim ("permission-aware, actions your role cannot perform are not shown") | MED | Derivar ações disponíveis do escopo delegado consentido e da resposta Graph. Não é só estética — é reflexo do modelo de segurança. |
| Auditoria integrada (quem conectou/desconectou, quem sincronizou, quando falhou) | Rastreabilidade corporativa; já existe `systemLog` no codebase | LOW | Reutilizar `apps/web/src/utils/systemLogger.ts` e `notificationSystem.ts`. Nunca logar token ou conteúdo de arquivo — só IDs, statuses e timestamps. |

---

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Cache no navegador (IndexedDB/localStorage) de metadados, tokens ou bytes | "Performance", "abrir mais rápido", "funcionar offline" | **Proibido por arquitetura** (`PROJECT.md` Out of Scope + Constraints): nenhum cache/temp/offline no browser; estado antigo engana usuário e quebra fonte oficial | `onSnapshot` do Firestore para estado; R2 apenas para binário pendente; buscar no Graph sob demanda |
| MSAL no browser / token no Redux / token em `localStorage` | "Simplifica o fluxo OAuth" | **Viola isolamento de credenciais**: token chegaria ao frontend e ao bundle | Cliente confidencial em Cloud Functions Gen2; cache MSAL criptografado (AES-256-GCM) no Firestore; chaves no Secret Manager; frontend recebe só status opaco |
| Sincronização app-only / admin-consent (identidade de serviço) | "Evita OAuth por usuário", "funciona mesmo sem o usuário logado" | **Fora de escopo** e destrói a autoria genuída no SharePoint (`PROJECT.md` Out of Scope) | Permissões delegadas do usuário; bound ao UID/tenant do iniciador na fila |
| Sobrescrever silenciosamente no conflito ("replace automático") | "Experiência sem atrito" | Perde trabalho do usuário; é exatamente o dano que o milestone promete evitar | Criar nova versão + UI de resolução; `@microsoft.graph.conflictBehavior=fail` como padrão seguro no worker |
| Espelhar/indexar todo o Drive do usuário no Firestore | "Busca instantânea", "filtros ricos" | Quebra "Firestore é fonte oficial de dados operacionais, não cópia de conteúdo"; custo de escrita e risco de stale | Buscar no Graph on demand; persistir só metadados operacionais e estado de sync |
| Check verde "Sincronizado" logo após salvar no R2 | "Feedback imediato", "UX otimista" | Mentira: R2 é temporário; o SharePoint ainda não aceitou. Gera falsa confiança e perda de dados percebida | Dois estados distintos: "Salvo no Atlas (pendente)" e "Sincronizado no SharePoint" |
| Manter cópia permanente no R2 como "backup" | "Segurança extra" | Decisão do milestone: R2 é **temporário até confirmação**; duplicidade cria divergência de fonte | Histórico de versões do SharePoint + limpeza do R2 após confirmação |
| Spinner sem detalhe + retry automático infinito | "Auto-cura" | Esconde trabalho pendente; padrões de UX condenam spinners vagos e retry storms | Fila visível com contagem, backoff exponencial, limite de tentativas e ação manual de retry/exportar |
| Outros provedores (Google Drive, Dropbox) neste milestone | "Aproveitar o card de integrações para tudo" | Scope creep; cada provedor tem escopos, APIs e modelos de conflito próprios | Card desenhado extensível, mas entregar apenas SharePoint agora |
| Split-view / abas múltiplas / drag-and-drop entre pastas distantes | "Parecer file manager profissional (Unopim/Beamline)" | Não table stake; aumenta superfície de teste sem validar o core | Lista + breadcrumb + painel de propriedades no MVP; considerar em v1.x |
| Edição inline de Office no navegador (Office Online embed) | "Editar sem sair do Atlas" | Fluxo de auth e compliance pesado; fora do milestone | Link "Abrir no SharePoint" + download; reavaliar em v2+ |

---

## Feature Dependencies

```
[Backend: cliente confidencial + cofre de tokens no Firestore]
        └──requires──> [Chaves no Secret Manager + regras Firestore restritivas]
                              └──requires──> [Verificação do Firebase ID Token no backend]

[Toggle ativar/desativar]
        └──requires──> [Status persistido no Firestore]

[Conectar conta Microsoft (OAuth + PKCE + state)]
        └──requires──> [Toggle ativado]
        └──requires──> [Backend de token + transação/state/PKCE no Firestore]
                └──requires──> [Desconectar + revogar]  (simetria obrigatória)

[Status disabled/disconnected/connected/syncing/problems + lastSuccessfulSyncAt]
        └──requires──> [Conectar/Desconectar]
        └──requires──> [Worker de sync publicando estado no Firestore]

[Navegar sites → bibliotecas → pastas]
        └──requires──> [Status = connected]

[Explorador unificado (SharePoint + R2 pendente)]
        └──requires──> [Navegar SharePoint]
        └──requires──> [Documents widget existente do Atlas]  ← dependência de feature existente
        └──requires──> [Modelo de item com discriminador de origem]

[Busca] ──enhances──> [Navegar sites → bibliotecas → pastas]
[Propriedades] ──enhances──> [Navegar sites → bibliotecas → pastas]
[Download] ──enhances──> [Propriedades]

[Upload / Criar / Substituir versão]
        └──requires──> [R2 como depósito temporário + fila persistente no Firestore]
        └──requires──> [Explorador unificado]

[Status honesto por item (salvo ≠ sincronizado)]
        └──requires──> [Fila persistente com estados + idempotência]
        └──requires──> [lastSuccessfulSyncAt]
        └──enhances──> [Explorador unificado]

[Detecção de conflito por ETag]
        └──requires──> [Upload/Substituir versão]
        └──requires──> [Leitura prévia de eTag/cTag do driveItem]

[UI de resolução de conflito]
        └──requires──> [Detecção de conflito]
        └──requires──> [Status honesto por item]  (para marcar "Conflito — precisa de decisão")
        └──requires──> [Substituir versão + histórico de versões]

[Histórico de versões] ──enhances──> [UI de resolução de conflito]
```

### Dependency Notes

- **Conectar requer backend de token:** sem cliente confidencial e cofre criptografado não há como entregar OAuth sem expor credenciais — é o prerequisite nº 1 do milestone.
- **Desconectar é simetria obrigatória de Conectar:** produtos de referência (Dropbox, Vellum, Agently) always ship connect + disconnect juntos; entregar só connect deixa o usuário preso.
- **Navegar requer `connected`:** com `disabled`/`disconnected`/`problems`, o explorador deve mostrar estado explicativo em vez de lista vazia ou erro 401.
- **Explorador unificado requer o documents widget existente:** não criar área paralela — reaproveitar o block/widget já presente e estender seu modelo de dados com a origem do arquivo.
- **Upload requer R2 + fila:** o binário precisa de depósito durável enquanto o SharePoint não confirma; sem fila persistente não há retry/idempotência nem status honesto.
- **Resolução de conflito requer status honesto:** "Conflito" é um estado da fila; a UI só faz sentido quando o item já está marcado como tal na lista.
- **Conflito vs. substituição automática:** `conflictBehavior=fail` no worker + `replace` apenas após decisão explícita do usuário — a automação e a UI são complementares, não conflitantes.

---

## Dependências de Recursos Existentes do Atlas (downstream consumer)

Mapeamento explícito para o planejamento de fases — todas as features novas se apoiam nestes pontos já construídos:

| Recurso existente | Onde está (evidência de `INTEGRATIONS.md`) | Como as novas features dependem dele |
|-------------------|---------------------------------------------|--------------------------------------|
| **Área de Configurações** | Rota `/settings` (`apps/web/src/routes/index.tsx:78`), `SettingsPage.tsx`, aba "Integrações" hoje `PlaceholderSection` (`SettingsModal.tsx:347`), aba "API e Webhooks" (`:352`) | O card SharePoint substitui o placeholder da aba Integrações. Toggle, botão Conectar/Desconectar, status e última sync vivem aqui. **Primeiro ponto de integração.** |
| **Design system (TailwindCSS + shadcn/ui + CSS vars)** | Decisão-chave em `PROJECT.md`; tokens em `globals.css` | Todos os novos componentes (card, badges de status, breadcrumb, painel de propriedades, dialog de conflito) devem consumir **somente** CSS variables — sem cores/espaçamentos hardcoded. Existe até um bloco `Dialog File Conflict` de referência em shadcn.io. |
| **Documents widget + modular page blocks + widget platform** | Features já entregues (contexto do milestone) | O explorador unificado **extende** o documents widget; não cria rota paralela. Instâncias de página editáveis persistem no Firestore — o estado de expansão/seleção da árvore pode seguir o mesmo padrão, mas sem cache local. |
| **Firebase Auth + `AuthContext`** | `apps/web/src/contexts/AuthContext.tsx`, `AuthService.ts`, perfil espelhado em `users/{uid}` | Fornece o UID/tenant para isolamento e para amarrar a identidade delegada Microsoft ao iniciador da operação. Backend deve verificar o Firebase ID Token (padrão em `require_firebase_user()`, `firebase_client.py:82`, hoje não aplicado nas rotas — aplicar no novo endpoint). |
| **Padrão Firestore converters + Zod** | `firebase/converters/index.ts`, `shared/types/**`, `shared/schemas/index.ts` | Novos tipos de status de conexão, item de documento e estado de sync devem seguir `schema.parse()` + converters com `Date` nativo, preservando compatibilidade com coleções existentes. |
| **`onSnapshot` reativo** | Hooks como `usePages.ts`, `useSimcardOperations.ts`, `useTodo.ts` | É o mecanismo de UI ao vivo para status de conexão, fila de sync e conflitos — substitui qualquer polling/cache local. |
| **Coleções protegidas + `firestore.rules`** | `datatemIntegration` já é somente-leitura (`firestore.rules:9-25`); padrão de lista protegida | Novas coleções de credenciais/tokens devem entrar na lista protegida — frontend nunca lê. Coleções de status/fila/auditoria seguem `signedIn()` + checagem de `ownerId`/tenant. |
| **Auditoria e notificações** | `apps/web/src/utils/systemLogger.ts` (`systemLog`), `notificationSystem.ts` | Registrar connect/disconnect/falha/resolução de conflito. Nunca logar token, bytes ou conteúdo de documento — apenas IDs, statuses e timestamps. |
| **Padrão de erro estruturado do backend** | `HTTPException` com `{"code","message"}` em `routes_datatem.py:64`; tradução em `DatatemService.ts:14` | Novos endpoints devem devolver códigos estáveis que o frontend traduz para mensagens claras de "problema de conexão" / "token expirado" / "conflito detectado". |
| **Cloud Functions Python Gen2 (a construir)** | Ainda ausente; FastAPI Node/Python existem em `apis/` | É o runtime escolhido para MSAL + Graph + worker de sync. Diferente do padrão FastAPI atual — fase de infraestrutura deve vir antes da UI de connect. |

**Ordem sugerida de dependências para o roadmap:** (1) backend de token + regras Firestore → (2) card de configuração com connect/disconnect/status → (3) explorador (navegação + busca + propriedades + download) → (4) upload/criar/substituir com R2 + fila → (5) status honesto + última sync → (6) detecção e UI de conflito. As features (3) e (4) podem ser paralelas depois de (2); (5) e (6) dependem de (4).

---

## MVP Definition

### Launch With (v1) — alinhado ao milestone v2.0

- [ ] Card SharePoint em Configurações: toggle, conectar/desconectar OAuth, 5 estados, última sync — ** prerequisite de tudo**
- [ ] Backend de token confidencial (PKCE/state no Firestore, cache criptografado, chaves no Secret Manager, `no-store`)
- [ ] Navegação sites → bibliotecas → pastas + breadcrumb (com permissões delegadas)
- [ ] Busca no escopo com indicador de origem (SharePoint vs. R2 pendente)
- [ ] Painel de propriedades (incluindo autor Microsoft e eTag)
- [ ] Download em streaming sem cache
- [ ] Upload + criar pasta + substituir versão (R2 temporário + fila persistente)
- [ ] Status por item: "Salvo no Atlas (pendente)" / "Sincronizando" / "Sincronizado" / "Falhou" / "Conflito"
- [ ] Contagem de fila + retry manual + `lastSuccessfulSyncAt`
- [ ] Detecção de conflito por ETag + modal de resolução (manter ambos / substituir / manter versão SharePoint / pular / resolver depois)
- [ ] Testes com mocks de Microsoft Graph e R2 + documentação de config/deploy

### Add After Validation (v1.x)

- [ ] Histórico de versões completo no painel (listar, baixar, promover) — *trigger: usuários pedindo recuperação de versão*
- [ ] "Aplicar a todos" em conflitos em lote — *trigger: upload múltiplo gerando vários conflitos*
- [ ] Drag-and-drop e upload resumable com progresso por arquivo — *trigger: arquivos grandes recorrentes*
- [ ] Filtros por tipo/data no explorador — *trigger: volume de arquivos dificultando localização*

### Future Consideration (v2+)

- [ ] Outros provedores de nuvem no mesmo card — *só após o padrão SharePoint estabilizar*
- [ ] Edição inline de Office / visualização Office Online — *custo de auth/compliance alto*
- [ ] Split-view, abas múltiplas, ZIP de pasta — *nice-to-have de file manager, sem valor validado ainda*

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Backend de token confidencial + OAuth/PKCE (base de tudo) | HIGH | HIGH | P1 |
| Card: toggle + connect/disconnect + 5 estados + última sync | HIGH | LOW–MED | P1 |
| Status honesto por item (salvo ≠ sincronizado) | HIGH | MED | P1 |
| Navegação sites/bibliotecas/pastas + breadcrumb | HIGH | MED–HIGH | P1 |
| Upload + substituir versão (R2 temporário + fila) | HIGH | HIGH | P1 |
| Detecção e UI de resolução de conflito | HIGH | MED–HIGH | P1 |
| Download em streaming sem cache | HIGH | MED | P1 |
| Busca no escopo | MED | MED | P2 |
| Painel de propriedades (autoria/eTag) | MED | MED | P2 |
| Criar pasta / criar documento | MED | LOW | P2 |
| Contagem de fila + retry manual | MED | MED | P2 |
| Histórico de versões no explorador | MED | MED | P2 |
| Ações cientes de permissão | MED | MED | P2 |
| Auditoria integrada (`systemLog`) | MED | LOW | P2 |
| Filtros / drag-drop / ZIP / split-view | LOW | MED–HIGH | P3 |
| Outros provedores / edição inline Office | LOW | HIGH | P3 |

**Priority key:** P1 = must have for launch (milestone v2.0) · P2 = should have, when possible · P3 = nice to have / future

---

## Competitor Feature Analysis

| Feature | Padrão observado em produtos de referência | Our Approach (Atlas v2.0) |
|---------|---------------------------------------------|---------------------------|
| Onde a conexão vive | Settings → Integrações/Connections; status Active/Revoked/Expired + reconnect (Dropbox Help, Gamut Docs, Agently, Vellum) | Card único em `/settings`, 5 estados explícitos + última sync, reaproveitando o placeholder existente |
| Como conecta | OAuth somente, consent screen do provider, escopo mínimo, sem API key (Dropbox, Google Workspace, Vellum, DocuSign) | Authorization Code + PKCE em backend confidencial; `state` no Firestore; token nunca no front |
| Onde ficam os tokens | Cofre/proxy: token injetado no transporte, nunca entregue à lógica do app/LLM (Gamut secure proxy, Vellum vault, Agently vaulted credentials) | Cache MSAL criptografado AES-256-GCM no Firestore, chaves no Secret Manager, `no-store`, frontend vê só status |
| Escopo da conexão | Workspace-owned vs. pessoal; personal connection nunca é usada por outra pessoa (Agently) | Por tenant + UID; identidade delegada do iniciador preservada na fila e no `lastModifiedByUser` |
| Navegação de arquivos | Árvore + breadcrumb + lista/grid + painel de detalhes (Beamline, WebPal, openfilz, SVAR, Unopim) | Sites → bibliotecas → pastas via Graph, breadcrumb, lista + painel de propriedades; grid/ZIP ficam para v1.x |
| O que aparece na lista | Arquivos de uma fonte; quando há várias, Agently/Vellum as separam | **Diferenciador:** SharePoint + R2 pendente na **mesma** lista, com badge de origem |
| "Salvo" vs. "Sincronizado" | Padrões mais maduros separam local-saved / waiting / confirmed e evitam check verde prematuro (Offline Protocol, Pixso, uxpatternsguide) | Separação explícita "Salvo no Atlas (pendente)" × "Sincronizado no SharePoint", alimentada pela fila real |
| Conflito | Side-by-side, Keep both / Replace / Keep theirs / Skip / Resolve later; nova versão em vez de overwrite (Nextcloud #2540, Autodesk, ownCloud, shadcn.io) | Modal com essas ações, `conflictBehavior=fail` no worker, `replace` só após decisão; histórico de versões como rede de segurança |
| Histórico de versões | Versions panel newest-first com autor/data, view/download/restore (Open-Xchange, WebPal) | Graph `/versions` no painel; MVP entrega leitura, restore em v1.x |
| Cache/offline | Muitos apps fazem cache local para "velocidade" | **Anti-feature explícito:** nenhum cache no navegador; Firestore + R2 são as únicas fontes, Graph é consultado ao vivo |

---

## Sources

- **Microsoft Learn (oficial, primário):**
  - [Get access on behalf of a user — Microsoft Graph](https://learn.microsoft.com/en-us/graph/auth-v2-user) — fluxo de código com `state` (CSRF), `offline_access`/refresh token, `redirect_uri`, client_secret só em web apps (visitado 2026-11-17; atualizado 2025-08-29)
  - [List the contents of a folder — Graph v1.0](https://learn.microsoft.com/en-us/graph/api/driveitem-list-children?view=graph-rest-1.0) — permissões delegadas mínimas (`Files.Read`), paginação `@odata.nextLink`, `if-none-match`
  - [driveItem resource type — Graph v1.0](https://learn.microsoft.com/en-us/graph/api/resources/driveitem?view=graph-rest-1.0) — facets file/folder, `eTag`/`cTag`, `@microsoft.graph.conflictBehavior=fail|replace|rename`, `downloadUrl` ~1h não cacheável, `versions`, `lastModifiedByUser`
  - [Get driveItem — Graph v1.0](https://learn.microsoft.com/en-us/graph/api/driveitem-get?view=graph-rest-1.0) — leitura prévia de eTag, `includeDeletedItems`
  - [Manage files — SharePoint Embedded](https://learn.microsoft.com/en-us/sharepoint/dev/embedded/build/manage-files) — upload simples vs. upload session, stream de download, versioning automático de Office
  - [Microsoft Graph permissions reference](https://learn.microsoft.com/en-us/graph/permissions-reference) — least privilege
- **Ciclo de vida de conexão:** [Dropbox — Manage third-party apps](https://help.dropbox.com/integrations/third-party-apps) (atualizado 2025-08-29), [Google Workspace — Manage third-party Drive access](https://knowledge.workspace.google.com/admin/drive/manage-third-party-data-access-to-drive) (atualizado 2026-11-10), [Gamut — Connected Accounts](https://www.gamut.so/docs/using-gamut/integrations/connected-accounts), [Agently — Integrations](https://agently.dev/docs/integrations) (2026-07-28), [Vellum — OAuth Integrations](https://www.vellum.ai/docs/key-concepts/oauth-integrations), [Document eSign — Integrations](https://documentesign.com/integrations)
- **Status de sync / honestidade:** [Sync state UX Pattern — UX Patterns Guide](https://uxpatternsguide.com/patterns/sync-state/), [How should an app show sync status? — Offline Protocol](https://www.offlineprotocol.com/learning/offline-first/how-should-an-app-show-sync-status), [Offline Editing UX: Saved, Synced, or in Conflict? — Pixso](https://pixso.net/articles/offline-editing-sync-conflict-ux/), [Design Guidelines for Offline & Sync — Google Open Health Stack](https://developers.google.com/open-health-stack/design/offline-sync-guideline), [Offline-First UI/UX Patterns](https://themavik.space/blog/offline-first-ui-ux-patterns) (2026-02-23)
- **Resolução de conflito:** [Nextcloud dialogs PR #2540 — Simplify file conflict dialog](https://github.com/nextcloud-libraries/nextcloud-dialogs/pull/2540) (2026-07-30/08-04), [Autodesk — Resolve File and Folder Conflicts](https://help.autodesk.com/cloudhelp/ENU/CONNECT-User-Guide/files/Resolve_Files_Folder_Conflicts_Docs.htm), [ownCloud Android #3935](https://github.com/owncloud/android/issues/3935), [Marlin PR #245 — interactive conflict dialog](https://github.com/StirlingMarketingGroup/marlin/pull/245) (2026-02-06), [shadcn.io — Dialog File Conflict block](https://www.shadcn.io/blocks/dialog-file-conflict), [Open-Xchange — Working with files / version history](https://documentation.open-xchange.com/ui/latest/features/drive/working-with-files.html)
- **Explorador de arquivos:** [Beamline — File manager component](https://beamline.io/components/file-manager), [WebPal — Document Management](https://www.webpal.net/resources/documentation/document-management), [openfilz-web](https://github.com/openfilz/openfilz-web), [Unopim Explorer View](https://docs-extensions.unopim.com/dam/explorer), [SVAR React File Manager](https://svar.dev/react/filemanager/), [SkyCMS — File & Media](https://docs.sky-cms.com/reference/features/05-file-and-media-management/)
- **Contexto interno (autoritativo para decisões de arquitetura):** `.planning/PROJECT.md`, `.planning/codebase/INTEGRATIONS.md` (auditoria 2026-11-17)

**Nota de confiança:** Padrões de UX e lifecycle foram cross-checkados em 4–6 fontes independentes (MEDIUM). Documentação Microsoft é fonte primária, mas o limite exato de upload simples e o comportamento de revogação programática devem ser confirmados na fase de implementação com as credenciais reais do tenant — não havia credenciais disponíveis nesta pesquisa.

---
*Feature research for: integração nativa Microsoft SharePoint no Atlas 1.0 (milestone v2.0)*
*Researched: 2026-11-17*
