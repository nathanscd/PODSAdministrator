# Phase 14: OAuth e Ciclo de Vida da Conexão - Context

**Gathered:** 2026-11-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Esta phase entrega apenas o ciclo de vida da conexão Microsoft/SharePoint: card de integração em Configurações, início do OAuth Authorization Code + PKCE, callback seguro, persistência criptografada do cache de credenciais, leitura do estado real da conexão, desconexão e orientação de reconexão quando o refresh token estiver revogado ou expirado. Não entrega navegação de sites/bibliotecas, upload, download, fila de sincronização, resolução de conflitos nem deploy de produção.

A Phase 13 fornece a base obrigatória: verificação de Firebase ID Token, tenant por claim/profile, `sharepoint_me`, `sharepoint_upload_intent`, respostas `no-store`, criptografia AES-256-GCM por `keyVersion`, allow-list de logs, regras Firestore default-deny e proibição de persistência no navegador/temporária.
</domain>

<decisions>
## Implementation Decisions

### OAuth contract
- **D-01:** Usar Authorization Code + PKCE com backend confidencial Cloud Functions Python Gen2; a interface nunca recebe `client_secret`, access token, refresh token nem cache MSAL. — **Reversibility:** one-way — o contrato de redirect/registro Azure e o formato do token cache afetam configuração externa e registros persistidos.
- **D-02:** Gerar `state`, `nonce` e verificado PKCE no backend e persistir a transação no Firestore com UID, tenant, expiração e consumo único atômico. — **Reversibility:** costly — muda o contrato das coleções `sharepointOAuthTransactions` e dos testes de replay.
- **D-03:** Registrar `redirect_uri` exatamente como usado pelo callback `form_post`; sem `localhost`, wildcard ou redirect configurável pelo frontend. — **Reversibility:** one-way — exige atualização do app registration Azure.
- **D-04:** Validar no callback `state`, `nonce`, PKCE, identidade Microsoft, tenant Microsoft, UID Firebase, expiração e reutilização. Qualquer divergência resulta em erro sanitizado, sem emissão de credencial. — **Reversibility:** costly — altera a fronteira de segurança já auditada na Phase 13.
- **D-05:** Solicitar somente os scopes `Files.ReadWrite`, `Sites.Read.All` e `offline_access`; nenhum scope de diretório e nenhuma autenticação app-only. — **Reversibility:** costly — exige novo consentimento e revisão do app registration.

### Credential lifecycle
- **D-06:** Serializar o cache MSAL e cifrá-lo com o envelope AES-256-GCM da Phase 13, incluindo AAD por tenant/purpose e `keyVersion`; gravar somente no Firestore. — **Reversibility:** one-way — mudar o formato do envelope exige migração de registros já cifrados.
- **D-07:** Secret Manager continua sendo a única fonte de `SHAREPOINT_MS_CLIENT_SECRET` e `SHAREPOINT_TOKEN_CRYPTO_KEY_V*`; `.env.example` conterá apenas nomes/referências, nunca valores. — **Reversibility:** costly — muda configuração de deploy e nomes de segredos.
- **D-08:** Desconexão remove a credencial cifrada e marca o estado como `disconnected`; documentos já sincronizados e metadados de autoria permanecem intactos. — **Reversibility:** one-way — apagar credenciais e metadados de vínculo não é reversível sem nova autorização do usuário.
- **D-09:** Refresh token revogado/expirado não dispara substituição automática da identidade do criador; o backend expõe `problems` e a interface orienta reconexão explícita. — **Reversibility:** costly — altera a semântica de autoria usada pelas fases de sincronização.
- **D-10:** Revogação programática, quando suportada, é melhor esforço no backend; falha de revogação nunca impede a remoção local da credencial nem é exibida ao usuário com detalhes sensíveis. — **Reversibility:** reversible — política pode ser ajustada sem migrar dados.

### UI and status
- **D-11:** O card Microsoft SharePoint fica na aba `Integrações` do `SettingsModal` existente, não em um novo template de página; a integração pode ser ativada/desativada e conectada/desconectada ali. — **Reversibility:** reversible — layout local, sem contrato externo.
- **D-12:** A interface consome somente um endpoint de status do backend; estados são exatamente `disabled`, `disconnected`, `connected`, `syncing` e `problems`, com data/hora da última sincronização bem-sucedida quando houver. — **Reversibility:** costly — o enum é contrato compartilhado com fases posteriores.
- **D-13:** Nenhum status positivo ou identidade é inferido no frontend; valores desconhecidos são renderizados como neutros. O texto falso de UI revisado na Phase 13 não se estende a esta phase. — **Reversibility:** reversible — mudança local de renderização.
- **D-14:** A identidade autenticada do frontend continua sendo o `AuthContext` legado com `TenantUser`; a consolidação das duas fontes de identidade permanece na Phase 15 e não é antecipada aqui. — **Reversibility:** costly — a consolidação posterior terá que migrar consumidores.
- **D-15:** Após o callback, o backend redireciona para `/settings` sem token, code, state ou segredo na URL; a UI recarrega o status pelo endpoint autenticado. — **Reversibility:** reversible — fluxo de navegação local.

### Research and verification
- **D-16:** Executar research obrigatório da configuração Azure (redirect `form_post`, consent do tenant, scopes, revogação) usando documentação oficial, sem credenciais reais. — **Reversibility:** reversible — research não altera runtime.
- **D-17:** Todo comportamento de OAuth sem credenciais reais é provado com mocks de MSAL/Graph, emulator Firestore e testes de replay/tamper; nenhum teste depende de segredo externo. — **Reversibility:** costly — reestruturar a suíte de mocks afeta várias fases.
- **D-18:** Os itens de UAT humano da Phase 13 permanecem adiados por decisão explícita; isso não bloqueia o trabalho de código da Phase 14, mas deve continuar registrado como dependência verificacional do milestone. — **Reversibility:** reversible — registro de estado.

### the agent's Discretion
Nenhuma área ficou sem decisão. Em modo auto, todas as áreas de cinza identificadas foram selecionadas e resolvidas com as opções recomendadas acima, derivadas das decisões travadas nas fases anteriores.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project and milestone
- `.planning/PROJECT.md` — escopo do milestone v2.0, restrições de persistência, identidade delegada e runtime.
- `.planning/ROADMAP.md` §Phase 14 — objetivo, critérios de sucesso, requisitos CONN-01…CONN-08 e avisos de research.
- `.planning/REQUIREMENTS.md` — requisitos CONN-01…CONN-08 e rastreabilidade.
- `.planning/STATE.md` — estado atual, decisões acumuladas e UAT adiado da Phase 13.

### Phase 13 foundation
- `.planning/phases/13-funda-o-de-seguran-a-e-contratos/13-RESEARCH.md` — decisões de segurança/backend já validadas.
- `.planning/phases/13-funda-o-de-seguran-a-e-contratos/13-VERIFICATION.md` — fatos verificados e itunes que exigem UAT humano.
- `.planning/phases/13-funda-o-de-seguran-a-e-contratos/13-SECURITY.md` — ameaças mitigadas e riscos aceitos.
- `.planning/phases/13-funda-o-de-seguran-a-e-contratos/13-UAT.md` — UAT humano da Phase 13 adiado.
- `.planning/phases/13-funda-o-de-seguran-a-e-contratos/13-08-SUMMARY.md` — contrato honesto da UI e guarda de não persistência.

### Backend contracts
- `apis/sharepoint-functions/main.py` — handlers autenticados existentes e padrão `_authenticated`.
- `apis/sharepoint-functions/auth.py` — verificação de ID token, tenant e `AuthContext`.
- `apis/sharepoint-functions/config.py` — configuração fail-closed por nomes de variáveis.
- `apis/sharepoint-functions/secret_provider.py` — resolução de segredos injetados.
- `apis/sharepoint-functions/crypto.py` — envelope AES-256-GCM com nonce, AAD e `keyVersion`.
- `apis/sharepoint-functions/responses.py` — contrato de resposta privada `no-store` e vocabulário de erro.
- `apis/sharepoint-functions/logging_utils.py` — allow-list de campos de log e hash de identificadores.
- `apis/sharepoint-functions/stores/sharepoint_store.py` — padrão de acesso Firestore por tenant.
- `apis/sharepoint-functions/validation.py` — validação e rate limiting reutilizáveis.
- `apis/sharepoint-functions/requirements.txt` — dependências Python exatas aprovadas.
- `firebase.json` — codebases `reporting` e `sharepoint`.
- `firestore.rules` — coleções explícitas e default-deny.
- `firestore.indexes.json` — índices compostos existentes.
- `.env.example` — nomes de configuração sem valores sensíveis.

### Frontend integration points
- `apps/web/src/components/SettingsModal.tsx` — aba `Integrações`, primitives de layout e padrão de seções/linhas.
- `apps/web/src/pages/SettingsPage.tsx` — página existente de configurações; não é o ponto principal do card.
- `apps/web/src/contexts/AuthContext.tsx` — `TenantUser`, UID/tenant e tema/idioma.
- `apps/web/src/core/providers/AuthProvider.tsx` — wrapper legado que ainda expõe `user` como `unknown`.
- `apps/web/src/routes/index.tsx` — rota `/settings` para retorno do callback.
- `apps/web/src/components/ui/button.tsx` — primitiva de botão existente.
- `apps/web/src/components/ui/dialog.tsx` — primitiva de modal existente.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `main.py::_authenticated` — garante Firebase ID token e `AuthContext` antes de qualquer trabalho; novos endpoints autenticados devem reutilizá-lo.
- `responses.py::private_json` / `private_error` / `to_https_response` — única fronteira de resposta com headers privados imutáveis.
- `crypto.py::encrypt` / `decrypt` — envelope cifrado já testado para tokens Microsoft.
- `secret_provider.py` — resolução de client secret e chave de cifra sem expor valores.
- `validation.py::FirestoreRateLimiter` — padrão de operação Firestore transacional e fail-closed.
- `SettingsModal.tsx::SettingsSection`, `SettingsGroup`, `SettingsRow` — blocos reutilizáveis para o card de integração.
- `useAuth` de `AuthContext.tsx` — fonte atual de UID/tenant no frontend.

### Established Patterns
- Nenhum handler exportado sem autenticação, exceto o callback OAuth, que é público por protocolo e precisa de exceção explícita no guard AST com testes.
- Nenhum segredo em `config.py`, logs, URL, estado do navegador ou arquivo temporário.
- Toda resposta privada usa o vocabulário fechado de `ErrorKind` e headers `no-store`.
-前端 consome CSS variables de `globals.css` e componentes shadcn/ui existentes.
- Testes Python usam `backend\.venv\Scripts\python.exe` com `PYTHONDONTWRITEBYTECODE=1` e `-p no:cacheprovider`.

### Integration Points
- `apis/sharepoint-functions/main.py` — novos handlers `sharepoint_oauth_start`, `sharepoint_oauth_callback`, `sharepoint_connection_status` e `sharepoint_disconnect`, com exceção documentada para o callback público.
- Firestore — novas coleções para transação OAuth, conexão por UID/tenant e cache cifrado, com regras client-deny-all e índices se necessário.
- `SettingsModal.tsx` — substituir o placeholder `Integrações` pelo card Microsoft SharePoint.
- `routes/index.tsx` — manter `/settings` como destino pós-callback, sem parâmetros sensíveis.
- `firebase.json` — nenhuma mudança de codebase; tudo permanece em `apis/sharepoint-functions`.

</code_context>

<specifics>
## Specific Ideas

Nenhuma ideia específica adicional além dos critérios de sucesso da ROADMAP e das decisões acima.
</specifics>

<deferred>
## Deferred Ideas

- UAT humano da Phase 13 (5 itens) — adiado por decisão do usuário; retomar com `/gsd-verify-work 13`.
- Consolidação das duas fontes de identidade do frontend num `TenantUser` tipado — Phase 15.
- Correção dos valores placeholder `Disabled` e `3 Devices` na seção de segurança do `SettingsPage` — fora do escopo desta phase; registrado pela auditoria UI da Phase 13.
- Navegação SharePoint, upload, download, fila R2 e conflitos — fases 15 a 17.
- Deploy real e documentação operacional — Phase 18.

</deferred>

---

*Phase: 14-OAuth e Ciclo de Vida da Conexão*
*Context gathered: 2026-11-18*
