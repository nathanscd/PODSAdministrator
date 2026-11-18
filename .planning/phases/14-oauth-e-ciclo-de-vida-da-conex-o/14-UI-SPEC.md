---
phase: "14"
slug: "oauth-e-ciclo-de-vida-da-conex-o"
status: approved
reviewed_at: "2026-11-18"
shadcn_initialized: true
preset: "b2fA (base-nova / neutral / lucide / geist)"
created: "2026-11-18"
---

# Phase 14 — UI Design Contract

> Contrato visual e de interação para a UI da Phase 14 (OAuth e Ciclo de Vida da Conexão). Gerado por gsd-ui-researcher; validado por gsd-ui-checker. Toda prosa voltada ao usuário é em português; identificadores, caminhos e nomes de endpoints permanecem como no código.

**Fonte das decisões:** tudo abaixo foi pré-preenchido a partir de `CONTEXT.md` (D-01…D-18), `REQUIREMENTS.md` (CONN-01…CONN-08), `ROADMAP.md` §Phase 14 e do design system detectado no repositório. Não houve perguntas ao usuário: nenhuma área ficou sem decisão (ver `14-CONTEXT.md` §"the agent's Discretion"). Valores sem origem em decisão travada foram tomados como *default* do design system existente e estão marcados como tal.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | shadcn |
| Preset | `b2fA` — https://ui.shadcn.com/create?preset=b2fA (style `base-nova`, baseColor `neutral`, radius `default`, font `geist`, fontHeading `inherit`, iconLibrary `lucide`) — lido de `npx shadcn info` |
| Component library | base-ui (`@base-ui/react@1.9.0` via `@shadcn/react@0.2.1`) |
| Icon library | `lucide-react@0.562.0` |
| Font | Geist Variable (`@fontsource-variable/geist@5.3.0`), fallback: `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Geist", "Inter", system-ui, sans-serif` (`apps/web/src/index.css:173`) |
| Styling | TailwindCSS v4 + CSS variables em `apps/web/src/index.css` (mapeadas em `@theme` e em `tailwind.config.js`); sem classes de cor hardcoded |

---

## Component Inventory

Enumerated by `npx shadcn info` (cwd `apps/web`) — 60 components — shadcn@4.16.0 (style base-nova; primitivas @base-ui/react@1.9.0) — 2026-11-18.

Esta tabela é uma lista **não exaustiva** de componentes conhecidos como bons — nunca um *allowlist* fechado. O executor pode usar qualquer componente que o design system exporte; consultar algo fora da tabela é o caminho esperado, não uma exceção.

| Component | Import path | Notes |
|-----------|-------------|-------|
| Button | `@/components/ui/button` | CTA primário "Conectar/Reconectar conta Microsoft" e ação "Desconectar conta Microsoft" (variante outline/destructive) |
| Switch | `@/components/ui/switch` | Ativar/desativar a integração (CONN-01) |
| Badge | `@/components/ui/badge` | Indicador de status com texto (nunca só cor) |
| AlertDialog | `@/components/ui/alert-dialog` | Confirmação da ação destrutiva de desconexão |
| Separator | `@/components/ui/separator` | Divisória entre o cabeçalho do card e o painel de conexão |
| Skeleton | `@/components/ui/skeleton` | Placeholder durante o carregamento do status |
| Spinner | `@/components/ui/spinner` | Indicador de requisição em andamento no CTA |
| ScrollArea | `@/components/ui/scroll-area` | Região de rolagem já usada pelo `SettingsModal` |
| Tooltip | `@/components/ui/tooltip` | Opcional: explicação ao passar o mouse sobre o badge de status |

Primitivas **locais** reutilizadas (não vêm do pacote shadcn): `SettingsSection`, `SettingsGroup`, `SettingsRow`, `ControlledByOrganization` — todas em `apps/web/src/components/SettingsModal.tsx`. Não criar novo template de página.

---

## Layout & Placement

- **Local obrigatório:** aba `Integrações` do `SettingsModal` existente (`SIDEBAR_CATEGORIES` → categoria `Product` → item `{ id: "integrations", name: "Integrações", icon: <Box /> }`). Substituir exatamente a linha `{activeTab === "integrations" && <PlaceholderSection title="Integrações" />}` (`SettingsModal.tsx:347`) pelo novo componente `IntegrationsSection`.
- **Proibido:** nova rota, nova página, novo modal ou outro template para o card (D-11).
- **Estrutura do card** (usando as primitivas locais):
  1. `SettingsSection title="Integrações" description="Gerencie as conexões com serviços externos."`
  2. `SettingsGroup` contendo:
     - `SettingsRow` de cabeçalho: tile de ícone (40×40, `rounded-xl`, `bg-muted`, `border border-border`) com o glifo de marca do SharePoint (SVG inline estático, sem rede; fallback: `Building2` do lucide a 20px) + título `Microsoft SharePoint` (18px/600) + descrição `Armazene e sincronize documentos usando sua conta Microsoft.` (12px/400) + `Badge` de status + `Switch` de ativação.
     - `Separator` (`bg-border/50`) e, **somente quando a integração estiver ativada**, um painel de detalhe (`p-4`, `divide-y divide-border/50`) com a linha de identidade/timestamp e as ações status-específicas descritas em `## Interaction & State Matrix`.
- **Ícone:** `aria-hidden="true"` no glifo decorativo; o estado nunca é comunicado apenas pelo ícone.
- **Ordem de leitura:** nome → descrição → badge de status → switch → identidade → timestamp → ações. Manter essa ordem no DOM (não apenas visual).

---

## Spacing Scale

Declared values (múltiplos de 4; usar classes Tailwind do tema, nunca px literais no componente):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Gaps inline ícone/texto e padding interno do badge (`gap-1`) |
| sm | 8px | Gap entre título e badge, entre identidade e timestamp (`gap-2`); padding horizontal do badge (`px-2`) |
| md | 16px | Padding do `SettingsRow` e do painel de detalhe (`p-4`), gap entre bloco de texto e controles (`gap-4`) |
| lg | 24px | Espaçamento entre blocos dentro do painel de detalhe (`gap-6`) |
| xl | 32px | Espaço entre `SettingsSection`s (`mb-8`) |
| 2xl | 48px | Margem superior de blocos secundários (`mt-12`) |
| 3xl | 64px | Reservado; não usado neste card |

Exceptions:
- Área mínima de toque de **44×44px** para `Switch`, CTA e botão "Desconectar conta Microsoft" (WCAG 2.5.5/2.5.8), obtida com padding ao redor do controle — o tamanho visual permanece o do primitive.
- Tamanhos estruturais fixos: tile do ícone 40×40px, glifo 20px, ícone de status 14–16px. Não são escala de espaçamento.

---

## Typography

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Heading | 18px (`text-lg`) | 600 (`font-semibold`) | 1.2 (`leading-tight`) |
| Body | 14px (`text-sm`) | 400 (`font-normal`) | 1.5 (`leading-relaxed`) |
| Label / meta | 12px (`text-xs`) | 400 (`font-normal`) | 1.5 (`leading-relaxed`) |

- Exatamente **3 tamanhos** e **2 pesos** nesta phase (400 regular e 600 semibold). Não usar `font-medium`, `font-bold` ou `font-black` no card.
- Badge de status: 12px/600 (`text-[11px]`/600 é aceito somente no badge, para alinhar ao `SettingsRow` existente).
- Fonte Geist Variable herdada do `body`; não declarar `font-family` localmente.

---

## Color

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `--background` = `#fcfcfd` (light) / `#09090b` (dark) | Fundo do modal e do painel principal (`bg-background`) |
| Secondary (30%) | `--card` = `#ffffff` / `#121215`; `--muted` = `#f4f4f5` / `#1e1e24` | Card, tile do ícone, `SettingsGroup`, linhas, sidebar (`bg-card`, `bg-muted`) |
| Accent (10%) | `--primary` / `--accent` = `#ff6a00` (light-orange padrão; varia por tema) | Ver lista reservada abaixo |
| Destructive | `--destructive` = `#ef4444` (light) / `#f87171` (dark) | Ações destrutivas e estado de falha `problems` |

Accent reservado **exclusivamente** para: (1) fundo dos CTAs "Conectar conta Microsoft" e "Reconectar conta Microsoft"; (2) anel de foco `--ring` em todos os controles interativos; (3) item ativo "Integrações" na sidebar (`bg-primary/10 text-primary`); (4) trilha do `Switch` quando ativado.

Destructive reservado **exclusivamente** para: (1) botão "Desconectar conta Microsoft" e o botão de confirmação do `AlertDialog`; (2) badge/ícone/texto de orientação do status `problems` (estado de erro — nunca um estado positivo).

Regras:
- Usar somente utilitários ligados a CSS variables: `bg-background`, `bg-card`, `bg-muted`, `text-foreground`, `text-muted-foreground`, `border-border`, `text-primary`, `text-destructive`. Modificadores de opacidade (`bg-primary/10`, `border-border/50`) são permitidos.
- **Proibido** hexadecimal/rgb literal no componente (ex.: `#ff6a00`, `rgba(255,106,0,0.3)`). As únicas exceções são as já existentes em `index.css` e na paleta `THEMES` (fora do escopo desta phase).
- O status é sempre acompanhado de **texto**; cor/ícone nunca são o único sinal (D-13).

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA | `Conectar conta Microsoft` |
| Reconnect CTA (status `problems`) | `Reconectar conta Microsoft` |
| CTA em andamento | `Conectando conta Microsoft…` |
| Carregamento do status | `Carregando status da conexão…` |
| Empty state heading (sem conta / `disconnected`) | `Nenhuma conta conectada` |
| Empty state body | `Conecte sua conta Microsoft para sincronizar documentos com o SharePoint. Documentos já sincronizados permanecem disponíveis.` |
| Error state (`problems`, refresh token revogado/expirado) | `A conexão com o SharePoint expirou ou foi revogada. Conecte novamente para continuar. A autoria dos documentos já sincronizados não será alterada.` |
| Falha ao carregar status | `Não foi possível carregar o status da conexão. Tente novamente.` + botão `Recarregar status da conexão` |
| Falha ao iniciar OAuth | `Não foi possível iniciar a conexão com a Microsoft. Tente novamente.` |
| Falha ao desconectar | `Não foi possível desconectar. Tente novamente.` |
| Destructive confirmation | `Desconectar conta Microsoft?` / `Isso remove apenas as credenciais desta integração. Os documentos já sincronizados e a autoria original serão preservados.` / confirmar: `Desconectar conta Microsoft` / dispensar: `Manter conexão` |
| Sucesso da desconexão (toast sonner) | `Conta Microsoft desconectada.` |
| Rótulo do switch de ativação | `Ativar integração Microsoft SharePoint` |
| Dica quando desativada | `Integração desativada. Ative a integração para conectar uma conta Microsoft.` |
| Identidade conectada | `Conectado como {email}` (somente valor vindo do backend) |
| Última sincronização | `Última sincronização: {dd/MM/yyyy HH:mm}`; quando nunca houve: `Última sincronização: ainda não houve` |
| Status desconhecido | Badge: `Status indisponível`; corpo: `Não foi possível determinar o status desta conexão.` |

Rótulos de badge (sempre com texto):

| Enum do backend | Badge | Variant | Ícone (decorativo) |
|-----------------|-------|---------|--------------------|
| `disabled` | `Desativada` | `secondary` | nenhum |
| `disconnected` | `Desconectada` | `outline` | nenhum |
| `connected` | `Conectada` | `secondary` | `Check` em `text-muted-foreground` |
| `syncing` | `Sincronizando` | `secondary` | `Loader2` com `animate-spin` |
| `problems` | `Atenção necessária` | `destructive` | `AlertTriangle` |
| qualquer outro | `Status indisponível` | `outline` | nenhum |

---

## Interaction & State Matrix

O frontend **nunca** infere status. Ele consome somente `GET sharepoint_connection_status`, cuja resposta é tratada como dados não confiáveis: validar `status` contra a união exata `disabled | disconnected | connected | syncing | problems`; qualquer outro valor (inclusive `undefined`) cai no ramo neutro "Status indisponível" (D-12, D-13).

| Status | Identidade / timestamp | Ação primária | Ação secundária | Regra de renderização |
|--------|------------------------|---------------|-----------------|-----------------------|
| `disabled` | ocultar identidade | nenhuma (CTA oculto) | `Switch` desligado | Mostrar dica "Integração desativada…"; nenhuma chamada OAuth |
| `disconnected` | ocultar identidade | `Conectar conta Microsoft` | `Switch` ligado | Empty state com heading + body + CTA |
| `connected` | `Conectado como {email}` + última sincronização | `Desconectar conta Microsoft` (outline/destructive) | `Switch` ligado | Badge `Conectada`; sem CTA de conectar |
| `syncing` | identidade + última sincronização | `Desconectar conta Microsoft` desabilitado durante a transição | `Switch` ligado | Badge `Sincronizando` com spinner; sem "check verde" otimista |
| `problems` | ocultar identidade suspeita; mostrar apenas se o backend a fornecer | `Reconectar conta Microsoft` | `Desconectar conta Microsoft` | Orientação explícita; **nunca** trocar identidade do criador nem reautorizar automaticamente (D-09) |
| desconhecido | ocultar | `Recarregar status da conexão` | `Switch` conforme último valor local | Badge neutro; nenhum texto positivo |

**Fluxo de conexão (CONN-02, D-01, D-15):**
1. Clique em `Conectar conta Microsoft` → CTA entra em `loading` (`aria-busy`, texto `Conectando conta Microsoft…`, `disabled`).
2. Frontend chama `POST sharepoint_oauth_start` autenticado (Firebase ID token via `useAuth`/`auth`). Resposta esperada: `{ authorizationUrl: string }`.
3. Frontend navega com `window.location.assign(authorizationUrl)` para a página **oficial da Microsoft**. O frontend não constrói, edita, decodifica nem exibe `state`, `nonce`, verificado PKCE, `code`, access token, refresh token ou `client_secret`.
4. A Microsoft faz `form_post` para o callback do backend (`sharepoint_oauth_callback`, público por protocolo); backend valida e redireciona para `/settings` **sem** `code`, `state`, `token` ou segredo na URL.
5. Ao montar novamente, a UI recarrega o status via `GET sharepoint_connection_status`. O frontend não lê parâmetros sensíveis da URL.

**Fluxo de desconexão (CONN-07):**
1. Clique em `Desconectar conta Microsoft` → abre `AlertDialog` de confirmação (texto da tabela `Copywriting Contract`). O botão de dispensa `Manter conexão` mantém o foco inicial; `Escape` fecha sem desconectar.
2. Confirmação chama `POST sharepoint_disconnect`; backend remove a credencial cifrada e marca `disconnected`, preservando documentos e autoria.
3. UI recarrega o status e exibe toast `Conta Microsoft desconectada.`; falha exibe o texto de erro inline + botão `Repetir desconexão da conta Microsoft`.

**Contrato de dados consumido pela UI (somente leitura):**

| Endpoint | Uso no frontend | Campos relevantes |
|----------|-----------------|-------------------|
| `GET sharepoint_connection_status` | Preenche badge, identidade e timestamp | `status` (obrigatório, enum fechado), `accountEmail?`, `lastSuccessfulSyncAt?` (ISO 8601) |
| `POST sharepoint_oauth_start` | Obtém URL de redirecionamento | `authorizationUrl` (URL https da Microsoft) |
| `POST sharepoint_disconnect` | Efeito da desconexão | ack; recarregar status |

`accountEmail` e `lastSuccessfulSyncAt` vêm **somente do backend**; `useAuth` é usado apenas para autenticação/gating e para obter o ID token — nunca como fonte da identidade conectada (D-14). Formatação de timestamp: `dd/MM/yyyy HH:mm` em `America/Sao_Paulo` (fuso já usado em `PreferencesSection`).

---

## Loading, Error & Empty States

- **Carregamento inicial do status:** substituir o conteúdo do painel por `Skeleton` de badge + duas linhas de texto; manter o `Switch` desabilitado até a resposta. Texto acessível: `Carregando status da conexão…`.
- **Carregamento do OAuth:** CTA com `Spinner` e texto `Conectando conta Microsoft…`, `disabled` para evitar duplo clique; não bloquear o modal inteiro.
- **Erro de carregamento do status:** badge neutro + texto `Não foi possível carregar o status da conexão. Tente novamente.` + botão `Recarregar status da conexão`. Nenhum status positivo é assumido.
- **Erro `problems`:** texto de orientação completo da tabela de copy + CTA `Reconectar conta Microsoft`. Não exibir detalhes de token, segredo ou exceção do backend.
- **Empty state (`disconnected`):**heading + body + CTA, ícone `Cloud` muted 24px acima; sem ilustração externa.
- **Dados parciais:** se `connected` sem `lastSuccessfulSyncAt`, renderizar `Última sincronização: ainda não houve`; se sem `accountEmail`, omitir a linha "Conectado como" sem inventar valor.
- **Texto longo / overflow:** e-mail e nome exibidos com `truncate` + `title={valor}`; nunca quebrar o layout do `SettingsRow`.

---

## UI Considerations

> Cobertura de estados shape-rooted (empty / loading / error / populated / partial / overflow / zero-one-many / long-text). O copy de empty/error vive em `## Copywriting Contract`; aqui apenas a cobertura.

Applicable state considerations resolved: 7 covered, 1 dismissed, 0 unresolved.

| Category | Element(s) | Status | Resolution / Reason |
|----------|------------|--------|---------------------|
| empty | painel de conexão (`disconnected`) | ✅ covered | Renderiza heading `Nenhuma conta conectada`, body e CTA `Conectar conta Microsoft` exatamente como no contrato de copy |
| loading | badge/identidade, CTA OAuth | ✅ covered | `Skeleton` + `Carregando status da conexão…`; CTA com `Spinner` e `Conectando conta Microsoft…`, `aria-busy` |
| error | status `problems`, falha de `GET status` | ✅ covered | Orientação de reconexão sem troca de identidade; erro de load com `Recarregar status da conexão`, status neutro |
| populated | card `connected` | ✅ covered | Badge `Conectada` + `Conectado como {email}` + última sincronização, todos do backend |
| partial | `connected` sem `lastSuccessfulSyncAt` / sem `accountEmail` | ✅ covered | `Última sincronização: ainda não houve`; linha de identidade omitida, sem valor fabricado |
| overflow | linha de identidade e descrição | ✅ covered | `truncate` + `title`; `SettingsRow` já limita texto a `max-w-[70%]` |
| long-text | e-mail/identidade longa | ✅ covered | `truncate` com `title`, `break-words` no tooltip; sem quebra do badge |
| zero-one-many | `SettingsGroup` de integrações | dismissed | Existe exatamente **um** card (Microsoft SharePoint) nesta phase — sem escala zero-um-muitos (CONN-01, escopo de fase) |

---

## Accessibility

- `Switch`: `role="switch"` / `aria-checked` nativos do primitive, com nome acessível `Ativar integração Microsoft SharePoint`; operável por teclado.
- Região de status: `aria-live="polite"` no container do badge/identidade para anunciar mudanças de status sem interromper.
- Badge: sempre com texto visível; ícones `aria-hidden="true"`.
- CTAs: nome acessível igual ao rótulo visível; `aria-busy="true"` durante `Conectando conta Microsoft…`; `disabled` enquanto em voo.
- `AlertDialog`: `aria-labelledby`/`aria-describedby` apontando para título e corpo; foco inicial no botão `Manter conexão` (opção de dispensa); `Escape` fecha sem desconectar.
- Foco visível: `focus-visible:ring-2 focus-visible:ring-ring` em todos os controles (`--ring` = accent).
- Contraste: `text-foreground` sobre `bg-background` e `text-muted-foreground` sobre `bg-card` ≥ 4.5:1 nos dois temas; `text-destructive` usado apenas em texto curto e com ícone/texto de reforço.
- Alvos de toque mínimos de 44×44px (ver Spacing Scale).
- Sem `alert()` do navegador para erros — usar texto inline e, para confirmações de ação, sonner/toast.

---

## Responsiveness

- O modal existente já limita a `max-w-[1200px]`, `h-[85vh]`, `max-h-[800px]`, com sidebar de 280px e painel direito oculto abaixo de `xl` — **não alterar**.
- Painel de Integrações: uma única coluna; dentro dele seguir o padrão responsivo de `SettingsRow` (`flex items-start sm:items-center justify-between gap-4`).
- Abaixo de `sm` (640px): controles e badge passam para baixo do texto; CTA ocupa `w-full sm:w-auto`; tile do ícone permanece 40px; paddings permanecem em `p-4`.
- A partir de `sm`: identidade/timestamp e ações na mesma linha, `justify-between`.
- Conteúdo nunca transborda horizontalmente; `truncate` + `title` para textos longos; `ScrollArea` existente absorve o excesso vertical.
- Layout idêntico nos temas claro/escuro e em todas as 5 cores de destaque (tokens via CSS variables).

---

## Forbidden Patterns

1. Nenhum campo de entrada, textarea, paste target ou formulário para `client_secret`, access token, refresh token, `state`, `nonce`, `code`, verificado PKCE ou qualquer segredo (D-01).
2. Nenhum segredo/token/code/state exibido, mesmo mascarado, truncado ou em `title`/tooltip/log do navegador.
3. Nenhum uso de `localStorage`, `sessionStorage`, `IndexedDB`, Cache API ou service worker para dados de conexão (SEC-09).
4. Nenhum status positivo inferido no frontend: não mapear ausência de erro, presença de `user` do `useAuth` ou valor desconhecido para `connected` (D-13).
5. Nenhuma troca silenciosa de identidade do criador; `problems` exige reconexão explícita e nunca reautoriza automaticamente (D-09).
6. Nenhuma nova rota/página/template para o card — tudo dentro da aba `Integrações` do `SettingsModal` (D-11).
7. Nenhum parâmetro sensível na URL de retorno (`/settings?code=…`, `?state=…`, `?token=…`); o frontend não lê tais parâmetros (D-15).
8. Nenhuma cor ou espaçamento hardcoded no componente (hex/rgb ou px fora dos tokens declarados em Spacing/Typography e dos tamanhos estruturais 20/40/44px).
9. Nenhum progresso, "check verde" ou status fictício (ex.: `Math.random()`, otimismo antes da confirmação do backend).
10. Nenhuma credencial Microsoft real em código, teste ou mock (D-17); toda a UI deve ser implementável e verificável com mocks do endpoint de status.
11. Nenhuma afirmação positiva não respaldada pelo backend (ex.: "Criptografia ativa", "Conectado" quando o enum não diz isso) — herança da correção honesta da Phase 13 (D-13).

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official (`@shadcn`, base-nova) | button, switch, badge, alert-dialog, separator, skeleton, spinner, tooltip | not required |
| Terceiros | nenhum — `components.json` declara `"registries": {}` e `npx shadcn info` lista somente `@shadcn` | not applicable |

Nenhum bloco de registro de terceiros foi declarado, portanto o gate de vetted-registry não foi acionado.

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS
- [ ] Dimension 7 Inventory Provenance: PASS

**Approval:** pending
