# Phase 14: OAuth e Ciclo de Vida da Conexão - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-11-18
**Phase:** 14-OAuth e Ciclo de Vida da Conexão
**Areas discussed:** OAuth contract, credential lifecycle, UI and status, research and verification

---

## OAuth Contract

| Option | Description | Selected |
|--------|-------------|----------|
| Backend-only Authorization Code + PKCE | Backend confidencial gera state, nonce e PKCE; frontend nunca vê segredos | ✓ |
| SPA PKCE sem secret | Frontend gerencia o fluxo diretamente | |
| Client credentials | Autenticação app-only sem usuário | |

**User's choice:** Backend-only Authorization Code + PKCE, derivado das decisões travadas do milestone e da restrição de autoria delegada.
**Notes:** Nenhuma credencial Microsoft real disponível; research official obrigatório.

---

## Credential Lifecycle

| Option | Description | Selected |
|--------|-------------|----------|
| Firestore + AES-256-GCM + Secret Manager | Cache MSAL cifrado, chaves gerenciadas e rotação por keyVersion | ✓ |
| Browser storage | Tokens no navegador | |
| Disk temp files | Cache em arquivo temporário | |

**User's choice:** Firestore + AES-256-GCM + Secret Manager.
**Notes:** Desconexão remove credencial local e preserva documentos sincronizados; refresh token revogado exige reconexão explícita.

---

## UI and Status

| Option | Description | Selected |
|--------|-------------|----------|
| Card na aba Integrações do SettingsModal | Reutiliza estrutura existente, sem nova página | ✓ |
| Nova página de integrações | Cria rota e layout dedicados | |
| Status inferido no frontend | Frontend deduz estado sem endpoint de verdade | |

**User's choice:** Card na aba Integrações do SettingsModal com status vindo somente do backend.
**Notes:** Usuário pediu para seguir com a construção geral da integração sem testes manuais agora; isso foi registrado como adiamento, não como aprovação de UAT.

---

## Research and Verification

| Option | Description | Selected |
|--------|-------------|----------|
| Research + mocks | Documentação oficial Azure, mocks MSAL/Graph e testes de replay/tamper | ✓ |
| Credenciais reais | Usar app registration real neste milestone | |
| Sem research | Implementar diretamente sem validar redirect/consent/revogação | |

**User's choice:** Research + mocks.
**Notes:** Phase 13 UAT humano permanece adiado; Phase 14 segue com código e automação.

## the agent's Discretion

Nenhuma área ficou sem decisão. Todas as áreas de cinza foram automaticamente resolvidas com base em decisões anteriores travadas no projeto e na falta de credenciais reais.

## Deferred Ideas

- UAT humano da Phase 13 — retomar depois com `/gsd-verify-work 13`.
- Consolidação das duas fontes de identidade do frontend — Phase 15.
- Navegação SharePoint, upload, download, fila R2 e conflitos — fases 15 a 17.
- Deploy real e documentação operacional — Phase 18.
