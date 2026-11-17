# PROJECT: Atlas 1.0 (Commercial SaaS Platform)

## What This Is

The official commercial transformation of PODSAdministrator into **Atlas 1.0** — the first commercial SaaS product of Fifteen Miles. Atlas combines the power and flexibility of platforms like Notion, ClickUp, Slack, SharePoint, Monday, and Linear, with a unique competitive advantage: deep customization where every company can transform Atlas into its own internal operating system. The platform retains **Google Firebase** as its robust backend infrastructure while executing a complete frontend transformation.

## Core Value

Deliver an enterprise-grade, customizable SaaS operating system by replacing custom UI variants with TailwindCSS + shadcn/ui and CSS variables (`globals.css`), modularizing screens into reusable blocks, introducing an advanced widget-based platform with editable page instances persisting to Firestore, dynamic sidebars, multi-tenancy, and domain-driven types, while preserving 100% backward compatibility with existing Eletra users and data.

## Current Milestone: v2.0 Integração Nativa Microsoft SharePoint

**Goal:** Tornar o SharePoint o repositório oficial de documentos dentro do Atlas, com autoria delegada preservada e nenhuma perda de alterações durante indisponibilidade.

**Target features:**
- Integração configurável em Configurações (ativar/desativar, conectar/desconectar conta Microsoft, status e última sincronização)
- OAuth Authorization Code + PKCE em backend confidencial (Cloud Functions Python Gen2), com transação/state/PKCE persistidos no Firestore e tokens nunca expostos ao frontend
- Credenciais MSAL serializadas e criptografadas com AES-256-GCM; chaves no Google Cloud Secret Manager
- Firebase como fonte oficial de dados operacionais: perfil, metadados de documentos, fila persistente, estados de sincronização, auditoria e quota
- Cloudflare R2 como object storage exclusivo de conteúdo binário (planilhas, DOCX, imagens e demais formatos), temporário até a confirmação do SharePoint
- Worker de sincronização com máquina de estados, lease transacional, retry com backoff, idempotência e resolução de conflitos por ETag
- Interface unificada de documentos (sites, bibliotecas, pastas, busca, download, upload e substituição) com status visual honesto
- Segurança: verificação de Firebase ID Token, isolamento por UID/tenant, regras Firestore restritivas, respostas `no-store` e proibição de cache/temp
- Testes automatizados com mocks de Microsoft Graph e Cloudflare R2 e documentação completa de configuração e deploy

## Requirements

### Validated

- ✓ [Phase 1] — Project audit and Firebase NoSQL data path mapping
- ✓ [Phase 2] — Monorepo workspaces structure (`apps/web`, `shared`, `firebase`)
- ✓ [Phase 3] — Zod entity validation schemas and typed Firestore converters with native Date support

### Active

- [ ] Usuário consegue ativar/desativar a integração e conectar/desconectar sua conta Microsoft em Configurações
- [ ] Credenciais Microsoft ficam criptografadas no Firestore e nunca chegam ao frontend
- [ ] Usuário navega sites, bibliotecas, pastas e arquivos do SharePoint usando permissões delegadas
- [ ] Uploads e downloads em streaming, com R2 apenas para binários pendentes e limpeza após confirmação do SharePoint
- [ ] Fila persistente no Firestore com estados, retry, idempotência e detecção de conflitos
- [ ] Autoria original do usuário Microsoft preservada em todas as operações
- [ ] UI unificada de documentos com status preciso e sem cache local
- [ ] Testes automatizados e documentação técnica completa

### Out of Scope

- [VPS / Dedicated Servers] — Excluded. The system operates strictly within standard Firebase serverless environments.
- [PostgreSQL / SQL Databases] — Excluded. We maintain NoSQL Cloud Firestore to leverage free tier thresholds and zero-maintenance models.
- [Fases 10–12 do milestone v1.0 (Cloud Functions/PDF, Emulator Suite/Security Rules, Deploy SaaS)] — Não iniciadas; arquivadas no início do milestone v2.0 para priorizar a integração SharePoint.
- [Autenticação app-only no Microsoft Graph] — Excluded. Operações devem usar permissões delegadas do usuário para preservar a autoria no SharePoint.
- [Cache persistente, arquivos temporários em disco e persistência offline no navegador] — Excluded by architecture: Firestore e R2 são os únicos mecanismos de persistência autorizados.

## Context

Atlas represents the commercial evolution of PODSAdministrator for Fifteen Miles. To compete with tier-1 productivity platforms while maintaining cost-efficiency on Firebase, we are executing a complete frontend design system migration, UI modularization, widget-based page customization, and multi-tenant domain restructuring while ensuring zero data loss or migration friction for existing Eletra users.

O milestone v2.0 introduz a integração nativa com Microsoft SharePoint. O codebase foi mapeado em `.planning/codebase/` (2026-11-17) e esse mapa deve orientar o planejamento. Não existem credenciais reais disponíveis: a implementação deve ser entregue configurável via `.env.example`, mocks e documentação precisa. O usuário confirmou em 2026-11-17 que o R2 armazena todos os formatos binários, mas continua sendo temporário até o SharePoint confirmar a gravação.

## Constraints

- **Cost-Efficiency**: Optimize reads/writes and caching policies to operate strictly within standard Firebase free tier limits.
- **Backward Compatibility**: Never invalidate existing collections or force migrations; normalize legacy data through adapters.
- **Design Token Purity**: Components must consume CSS variables from `globals.css` without hardcoded colors or spacing.
- **Persistence**: Apenas Firestore (estado/metadados/credenciais) e Cloudflare R2 (binário pendente) podem persistir dados — sem Redis, SQLite, arquivos temporários, armazenamento no navegador ou cache. — Porque a durabilidade depende de fontes oficiais e nenhum dado antigo deve ser exibido.
- **Credential Isolation**: Tokens Microsoft e chaves nunca podem chegar ao frontend nem serem gravados junto com os dados criptografados. — Porque documentos corporativos exigem isolamento rigoroso.
- **Delegated Identity**: A sincronização deve usar a identidade Microsoft original do criador da operação. — Porque a autoria no SharePoint precisa ser genuína.
- **Backend Runtime**: Python Gen2 Cloud Functions dentro do projeto Firebase existente. — Porque preserva a arquitetura serverless e permite MSAL Python.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| TailwindCSS + shadcn/ui + CSS Variables | Replaces custom variants with a clean, standardized design token source for dark/light modes and custom themes. | — Active |
| Widget Platform & Editable Page Instances | Turns every page into a customizable collection of widgets persisting to Firestore per instance, keeping templates immutable. | — Active |
| Domain-Driven Type Decoupling | Splits monolithic types into feature domains while preserving compatibility exports to prevent broken imports. | — Active |
| Serverless Puppeteer Cloud Functions | Offloads heavy CPU testbook PDF rendering away from client browsers. | — Pending |
| Integração SharePoint como capacidade nativa do Atlas | Usuário quer experiência unificada, sem área paralela para documentos. | — Active |
| Backend em Cloud Functions Python Gen2 | Mantém o projeto estritamente serverless no Firebase e viabiliza MSAL Python + triggers Firestore. | — Active |
| R2 como object storage temporário para todos os formatos binários | Usuário confirmou que planilhas, DOCX e imagens passam pelo R2; a remoção após confirmação do SharePoint permanece. | — Active |
| Cache MSAL criptografado com AES-256-GCM e chaves no Secret Manager | Tokens nunca devem ser expostos ao frontend nem gravados em texto puro. | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-11-17 after v2.0 milestone start*
