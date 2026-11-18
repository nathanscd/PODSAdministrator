---
phase: "13"
slug: "funda-o-de-seguran-a-e-contratos"
status: approved
shadcn_initialized: true
preset: b2fA
created: "2026-11-18"
reviewed_at: "2026-11-18"
---

# Phase 13 — UI Design Contract

> Contrato visual e de interação da única superfície de frontend tocada nesta fase. Gerado por `gsd-ui-researcher`, validado por `gsd-ui-checker`.

**Escopo UI da fase:** exclusivamente a correção honesta em `apps/web/src/pages/SettingsPage.tsx` — remover/substituir a afirmação falsa `"Data Encryption: Enabled (AES-256)"` (`label: 'Data Encryption'`, `status: 'Enabled (AES-256)'`, linha 167) para que a UI não afirme criptografia não implementada. **Não** há rotas, componentes, primitives, tokens, persistência no navegador nem dependências novas. Telas SharePoint futuras (Phases 14–17) estão fora de escopo.

**Origem dos valores:** `STATE.md`, `ROADMAP.md` (Phase 13), `REQUIREMENTS.md` (SEC-01..SEC-09), `13-RESEARCH.md` e inspeção direta de `apps/web` (`components.json`, `tailwind.config.js`, `src/index.css`, `src/pages/SettingsPage.tsx`, `package.json`). Não existe `CONTEXT.md` para a fase — nenhuma decisão de usuário foi inventada. Escolhas sem origem upstream estão marcadas como **discrição do agente**.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | shadcn (já inicializado em `apps/web`; nenhuma inicialização ou adição nesta fase) |
| Preset | `b2fA` — `style: base-nova`, `baseColor: neutral`, `font: geist`, `radius: default` (via `npx --no-install shadcn info`) |
| Component library | `@shadcn/react@0.2.1` + `@base-ui/react@1.6.0` (primitivas `base-ui`) |
| Icon library | `lucide-react@0.562.0` |
| Font | Geist (`@fontsource-variable/geist`) com fallback do sistema definido em `src/index.css:173` |

Nota: valores pré-preenchidos a partir de `apps/web/components.json` e de `npx --no-install shadcn info`. Como o despacho é `--auto`, não houve confirmação do usuário; registram-se os valores detectados no repositório, sem alterá-los. `registries: {}` em `components.json` — nenhum registro de terceiros declarado.

---

## Component Inventory

Enumerated by `npx --no-install shadcn info` — 60 components — shadcn@4.16.0 — 2026-11-18.

Lista **não exaustiva**. Comando re-executável (em `apps/web`): `npx --no-install shadcn info`. As primitivas em runtime vêm de `@shadcn/react@0.2.1` e `@base-ui/react@1.6.0`; `lucide-react@0.562.0` fornece os ícones. A Phase 13 **não instala nem cria nenhum componente** — os itens abaixo apenas documentam o que já existe e está disponível; nenhum deles é introduzido nesta fase. O `SettingsPage.tsx` atual usa HTML + variáveis CSS legadas (`--bg-app`, `--card-bg`, `--text-primary`, `--text-secondary`, `--accent-color`, `--border-color`) e ícones Lucide, e deve permanecer assim.

| Component | Import path | Notes |
|-----------|-------------|-------|
| badge | `@/components/ui/badge` | Disponível para status; não usar nesta fase (evita novo primitive visual). |
| card | `@/components/ui/card` | Container de seção disponível; não substituir os `<section>` atuais nesta fase. |
| alert | `@/components/ui/alert` | Reservado a mensagens de erro em fases futuras; sem uso na Phase 13. |
| tooltip | `@/components/ui/tooltip` | Não necessário para o texto curto desta fase. |
| separator | `@/components/ui/separator` | Disponível; não introduzir. |
| skeleton | `@/components/ui/skeleton` | Não aplicável: não há carregamento assíncrono nesta fase. |

---

## Spacing Scale

Valores declarados (múltiplos de 4; herdados do scale padrão do Tailwind — **nenhum token novo**):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Gaps de ícone, padding inline |
| sm | 8px | Espaçamento de elementos compactos |
| md | 16px | Espaçamento padrão de elementos |
| lg | 24px | Padding de seção / linha |
| xl | 32px | Gaps de layout |
| 2xl | 48px | Quebras maiores entre seções |
| 3xl | 64px | Espaçamento de nível de página |

Exceptions: nenhuma introduzida na Phase 13. Valores pré-existentes em `SettingsPage.tsx` fora do scale (`p-10` = 40px, `gap-3` = 12px, `p-1.5` = 6px) permanecem intocados e não integram este contrato. A linha alterada reutiliza `p-6` (24px) e `gap-4` (16px) já presentes em `SettingsPage.tsx:169-171`.

---

## Typography

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 12px | 700 | 1.5 |
| Label | 10px | 900 | 1.5 |
| Heading | 14px | 900 | 1.2 |
| Display | 48px | 900 | 1.2 |

Nota: valores herdados das classes já usadas em `SettingsPage.tsx` (`text-xs font-bold`, `text-[10px] font-black`, `text-sm font-black`, `text-5xl font-black`) — exatamente 4 tamanhos e 2 pesos (700, 900). Nenhuma mudança tipográfica nesta fase: a linha de status mantém `text-[10px] font-black uppercase tracking-widest opacity-40`.

---

## Color

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `#fcfcfd` | `--background` / `--bg-app`, fundo da página; `--card` `#ffffff` para superfícies |
| Secondary (30%) | `#f4f4f5` | `--secondary` / `--muted`, linhas e superfícies secundárias; `--card` `#ffffff` nos cards |
| Accent (10%) | `#ff6a00` | `--primary` / `--accent` — botão primário, `focus ring`, ícones de destaque, swatch de tema ativo |
| Destructive | `#ef4444` | `--destructive` — exclusivamente ações destrutivas; nenhuma nesta fase |

Accent reserved for: botão primário existente ("Commit Changes"), `focus ring`, fundo de ícone de destaque e swatch de tema ativo. Explicitamente **não** reservado para o status "Data Encryption" — a correção desta fase remove qualquer cor ou afirmação de sucesso nessa linha.

Nota: tema claro padrão (`light-orange`). Sob `[data-theme^="dark"]` os mesmos papéis resolvem para Dominant `#09090b`, Secondary `#1e1e24`, Accent `#ff8c38`, Destructive `#f87171` — nenhum token novo. O status neutro continua usando `--muted-foreground` (`#71717a` claro / `#a1a1aa` escuro) via `text-[var(--text-secondary)]`.

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA | Nenhum na Phase 13 — nenhum controle novo; a seção "Security & Privacy" permanece somente leitura (`cursor-not-allowed`). O botão existente "Commit Changes" fica inalterado e fora de escopo. |
| Empty state heading | Não aplicável — nenhuma lista/coleção é introduzida; a linha permanece presente com status neutro. |
| Empty state body | Não aplicável — mesma razão; não existe ação de "criar primeiro item" nesta fase. |
| Error state | Não aplicável — nenhum `fetch`/endpoint novo no frontend; nenhum estado de erro a renderizar. Copy de erro de conexão pertence à Phase 14 (CONN-06). |
| Destructive confirmation | Nenhuma — nenhuma ação destrutiva na Phase 13. |
| Security status — `Data Encryption` (linha corrigida) | Substituir `'Enabled (AES-256)'` por `'—'` (travessão), sem afirmar estado. Rótulo `'Data Encryption'` permanece. **Discrição do agente:** string neutra, sem tradução, diff mínimo. |
| Security status — regra futura | Exibir somente estado/timestamp **fornecido pelo backend** quando existir endpoint verificável; nunca um `"enabled"` hardcoded. Fora de escopo na Phase 13. |

Ações destrutivas: nenhuma listada — sem confirmação necessária.

---

## UI Considerations

> Estado/cobertura das superfícies de texto de status de segurança, não do copy (que vive em `## Copywriting Contract`). Populado pelo probe de considerações de UI após aprovação do checker.

Applicable state considerations resolved: 18 covered, 0 backstop, 0 unresolved.

| Category | Element(s) | Status | Resolution / Reason |
|----------|------------|--------|---------------------|
| empty | E1 — `Data Encryption` status row | ✅ covered | Não se aplica: é uma única linha estática, não uma coleção; o valor ausente é representado por `'—'`. |
| loading | E1 — `Data Encryption` status row | ✅ covered | Não se aplica: a linha não faz fetch nem aguarda dados na Phase 13. |
| error | E1 — `Data Encryption` status row | ✅ covered | Não se aplica: nenhuma requisição de rede é introduzida no frontend nesta fase. |
| populated | E1 — `Data Encryption` status row | ✅ covered | Estado normal é rótulo `'Data Encryption'` com valor neutro `'—'`; nenhum estado fabricado. |
| partial | E1 — `Data Encryption` status row | ✅ covered | Não se aplica: não há múltiplos campos ou itens parcialmente preenchidos. |
| overflow | E1 — `Data Encryption` status row | ✅ covered | Strings curtas e fixas no layout flex existente; sem nova largura, corte ou rolagem. |
| zero-one-many | E1 — `Data Encryption` status row | ✅ covered | Exatamente uma linha; nenhum plural, lista ou contagem é introduzida. |
| long-text | E1 — `Data Encryption` status row | ✅ covered | Texto fixo e curto (`'Data Encryption'`, `'—'`); nenhuma entrada dinâmica de usuário. |
| overflow | E2 — bloco "Advanced Console" | ✅ covered | Bloco decorativo usa linhas fixas e já existentes; nenhuma alteração de largura ou overflow. |
| long-text | E2 — bloco "Advanced Console" | ✅ covered | Linhas curtas e estáticas; nenhum texto longo dinâmico é introduzido. |
| empty | E3 — linhas fixas de "Security & Privacy" | ✅ covered | Não se aplica: linhas estáticas fixas, não uma coleção carregada. |
| loading | E3 — linhas fixas de "Security & Privacy" | ✅ covered | Não se aplica: nenhum fetch ou endpoint de status é adicionado nesta fase. |
| error | E3 — linhas fixas de "Security & Privacy" | ✅ covered | Não se aplica: nenhuma operação de rede é introduzida para essas linhas. |
| populated | E3 — linhas fixas de "Security & Privacy" | ✅ covered | Estado atual é placeholder fabricado; permanece como follow-up fora de escopo, sem alteração nesta fase. |
| partial | E3 — linhas fixas de "Security & Privacy" | ✅ covered | Não se aplica: valores fixos e completos, sem campos ausentes. |
| overflow | E3 — linhas fixas de "Security & Privacy" | ✅ covered | Strings curtas e fixas no layout existente; sem novo comportamento de corte ou rolagem. |
| zero-one-many | E3 — linhas fixas de "Security & Privacy" | ✅ covered | Duas linhas fixas e nomeadas; nenhuma lista dinâmica de zero/um/muitos itens. |
| long-text | E3 — linhas fixas de "Security & Privacy" | ✅ covered | Valores fixos e curtos (`'Disabled'`, `'3 Devices'`); nenhum texto dinâmico. |

<!-- Status vocabulary: ✅ covered = verdade explícita; 🧪 backstop = teste de estado retention; ⚠ unresolved = premissa do planner. -->

---

## Flagged / Unresolved Items

1. **`ENCRYPTION: SECURE` em `apps/web/src/pages/SettingsPage.tsx:246`** — mesma classe de afirmação falsa de criptografia, dentro do console decorativo "Advanced Console" (`SYSTEM_READY`, `KERNEL_ACTIVE: 0x823F`, `WAITING_FOR_INPUT_`). O `phase_ui_scope` nomeia apenas a string da linha 167. Padrão recomendado (discrição do agente): neutralizar também para `ENCRYPTION: —`. Requer decisão do planner — **não alterado por padrão nesta fase**.
2. **Status placeholder fabricados em `SettingsPage.tsx:165-166`** — `'Disabled'` (2FA) e `'3 Devices'` são valores fixos, não verificáveis. Fora do escopo da Phase 13; registrar como follow-up, sem alteração agora.
3. **Ausência de endpoint de status de segurança** — a Phase 13 não expõe estado verificável ao frontend; por isso o placeholder `'—'` é a única opção honesta sem inventar dados ou adicionar persistência.
4. **Preset shadcn não confirmado pelo usuário** — valores lidos de `components.json` / `npx shadcn info` em modo `--auto`; registrados como detectados, não como decisão travada.

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | nenhum adicionado na Phase 13 | not required |
| third-party | nenhum (`components.json.registries = {}`) | not applicable |

Nenhum registro de terceiros foi declarado; gate de vetting de blocos de terceiros não aplicável.

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: FLAG (non-blocking; no CTA/empty/error/destructive triggers, false-claim fix contract is unambiguous)
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS
- [x] Dimension 7 Inventory Provenance: PASS

**Approval:** approved 2026-11-18

## UI-SPEC COMPLETE
