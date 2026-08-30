# Implementation Plan: Área da Equipe LIAC (login + gestão de conteúdo)

**Branch**: `002-liac-staff-area` | **Date**: 2026-08-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-liac-staff-area/spec.md`

**Note**: Assim como na feature 001, todo o trabalho permanece em `master` (sem git hook de
branching configurado).

> **Nota (2026-08-30)**: a fatia US1-US4 (login + Novidades/Eventos/Artigos) desta feature foi
> implementada com um backend real (`liac-backend`, Supabase Edge Functions), não com o
> `MockApiClient` em memória descrito abaixo — decisão tomada com o usuário para que o conteúdo
> criado pela equipe realmente persista. O restante do documento fica como registro do desenho
> original; ver `README.md` deste repositório e `liac-backend/README.md` para o estado real.
> US5-7 (CRUD de Projetos/Equipe pública/Parceiros) continuam não implementadas. US8 (Histórico de
> Auditoria) **foi implementada em 2026-08-30**, mas com um desenho diferente do original: em vez
> do papel binário `director`/`member`, são 5 cargos nomeados da LIAC (Diretor de Marketing,
> Presidente, Vice-Presidente, Coordenador, Diretor de Eventos) — os 3 primeiros veem o histórico
> e gerenciam a equipe (convite por e-mail real via Supabase Auth, troca de cargo, revogação), os
> outros 2 não. Ver `README.md` deste repositório e `liac-backend/README.md`.

## Summary

Adicionar, sobre a base já implantada pela feature 001, uma área protegida
(`/portal-liac/*`) onde a equipe de Marketing da LIAC autentica (login mockado) e gerencia
(cria/edita/exclui/destaca) os 6 tipos de conteúdo já modelados (Novidades, Eventos, Artigos,
Projetos, Equipe, Parceiros). Toda escrita passa por `ApiClient`, cuja implementação mockada
passa a manter um **estado mutável em memória** (em vez de fixtures somente-leitura) e a emitir
uma entrada de auditoria por operação. Um papel `director`, retornado pelo login mockado,
controla exclusivamente a visibilidade da tela de Histórico de Alterações — nenhuma outra
distinção de acesso existe. Continua 100% frontend: nenhuma credencial real, nenhum banco,
nenhuma validação de sessão de verdade neste repositório (Constitution v1.1.0).

## Technical Context

**Language/Version**: TypeScript 5.x / React 18 (mesma base da feature 001 — este plano estende
o projeto já existente, não cria um novo).

**Primary Dependencies**: Nenhuma dependência nova. Reusa `react-router-dom` v6
(`createBrowserRouter`, agora com rotas aninhadas protegidas via `loader`/componente de guard) e
Vitest + Testing Library. Nenhuma lib de auth (ex: `next-auth`, `firebase/auth`) — o "login" é
uma chamada mockada de `ApiClient`.

**Storage**: N/A para dados reais. O `MockApiClient` passa a manter cópias mutáveis em memória
dos arrays das 6 fixtures + um array de auditoria — ainda sem persistência entre reloads (mesma
postura de "mock, não banco" da feature 001). O único uso de `localStorage` nesta feature é o
token de sessão (string opaca + papel), nunca dados de conteúdo (FR-009).

**Testing**: Vitest + React Testing Library, mesmos padrões da feature 001 (testes colocados,
queries por role/label). Cobertura mínima: guard de rota (autenticado vs não, `director` vs
`member`), CRUD de cada entidade, geração de entrada de auditoria por escrita, toggle de
destaque refletindo no carrossel público.

**Target Platform**: Mesmo SPA estático (Vercel/Netlify) da feature 001 — a "proteção" desta
área é client-side apenas; nenhuma infraestrutura de servidor é adicionada.

**Project Type**: Extensão do mesmo projeto frontend único da feature 001.

**Performance Goals**: Reflexo de uma escrita (criar/editar/excluir/destacar) na UI pública em
menos de 5s sem reload manual (SC-002), já que o estado mutável do mock é compartilhado em
memória entre a área protegida e as páginas públicas na mesma sessão de navegador.

**Constraints**: Nenhuma credencial ou segredo real no bundle (Constitution Princípio I,
conforme emenda v1.1.0); toda escrita gera auditoria (FR-012); tela de Histórico
exclusivamente acessível a `role === "director"` (FR-013); aviso antes de descartar edição não
salva (FR-011).

**Scale/Scope**: 1 rota de login + 6 pares de tela (listar-e-gerenciar + formulário
criar/editar) + 1 tela de histórico (condicional) = ~14 rotas novas sob `/portal-liac/`, mais os
guards de rota.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Avaliação | Status |
|-----------|-----------|--------|
| I. Fronteira Frontend-Only (v1.1.0) | Login e guards são UI + verificação de token client-side; nenhuma validação de credencial, hashing ou persistência real. Escrita de conteúdo continua só em memória via `ApiClient`. | PASS |
| II. Fidelidade à Identidade Visual LIAC | Telas da área da equipe reusam `tokens.css` e os componentes `ui/` já existentes — nenhuma cor nova fora dos tokens. | PASS |
| III. Componentização Modular e Pequena | `DataTable`, `EntityFormLayout`, `ConfirmDialog`, `FeaturedToggle` são reusados por 3–6 entidades cada — reuso real, não god components. | PASS |
| IV. Contrato de API Mockado como Interface Estável | `specs/contracts/api-contract.md` é atualizado nesta fase (Phase 1) com os novos endpoints antes da implementação do `MockApiClient` estendido. | PASS |
| V. Acessibilidade WCAG AA | `ConfirmDialog` usa `role="alertdialog"` e foco gerenciado; formulários usam `<label>` associado e mensagens de erro com `aria-describedby`. | PASS |
| VI. Desenvolvimento Incremental com Gates | Este plano é o gate antes de `/speckit-tasks` para esta feature. | PASS |

Nenhuma violação — **Complexity Tracking** omitida.

## Project Structure

### Documentation (this feature)

```text
specs/002-liac-staff-area/
├── plan.md
├── research.md
├── data-model.md          # SOMENTE as entidades/campos novos ou alterados por esta feature
├── quickstart.md
└── tasks.md                # Fase 2 (/speckit-tasks) — ainda não criado

specs/contracts/
└── api-contract.md         # Atualizado nesta fase com os endpoints de auth/escrita/auditoria
                             # (mesmo arquivo compartilhado da feature 001 — Constitution IV)
```

### Source Code (repository root — extensão da árvore da feature 001)

```text
src/
├── auth/
│   ├── AuthContext.tsx          # Estado de sessão (user, token, role), login()/logout(),
│   │                            # inicializa a partir do localStorage
│   ├── RequireAuth.tsx          # Guard: redireciona para /portal-liac/login se não autenticado
│   └── RequireRole.tsx          # Guard: bloqueia/redireciona se role !== papel exigido
├── services/
│   ├── ApiClient.ts             # + login, logout, create/update/delete por entidade,
│   │                            # getAuditLog (estende a interface da feature 001)
│   └── mock/
│       ├── MockApiClient.ts     # Implementa os novos métodos
│       ├── mockStore.ts         # Cópias mutáveis em memória das 6 coleções (seed = fixtures)
│       └── auditLog.ts          # Array de auditoria em memória + append/query
├── mocks/
│   └── staffAccounts.json       # 2 credenciais de demonstração (director, member) — claramente
│                                 # fictícias, documentadas no README, nunca reais
├── hooks/
│   └── useUnsavedChangesGuard.ts # Combina useBlocker (navegação in-app) + beforeunload (fechar aba)
├── components/
│   └── staff/
│       ├── StaffLayout.tsx       # Navbar/sidebar da área protegida (com "Histórico" condicional)
│       ├── LoginForm.tsx
│       ├── ConfirmDialog.tsx     # Reusado pelas 6 telas de exclusão
│       ├── DataTable.tsx         # Reusado pelas 6 telas de listagem-e-gestão
│       ├── EntityFormLayout.tsx  # Reusado pelos 6 formulários (shell de label/erro/ações)
│       └── FeaturedToggle.tsx    # Reusado por News/Event/Article (toggle "destacar no carrossel")
└── pages/
    └── staff/
        ├── Login/
        ├── News/                 # NewsManageList.tsx, NewsForm.tsx
        ├── Events/                # EventsManageList.tsx, EventForm.tsx
        ├── Articles/              # ArticlesManageList.tsx, ArticleForm.tsx
        ├── Projects/              # ProjectsManageList.tsx, ProjectForm.tsx
        ├── Team/                  # TeamManageList.tsx, TeamMemberForm.tsx
        ├── Partners/              # PartnersManageList.tsx, PartnerForm.tsx
        └── History/               # ChangeHistory.tsx (só renderizado sob RequireRole('director'))

# Arquivos da feature 001 tocados por esta feature (não recriados, só estendidos):
# src/types/entities.ts   → + featured?, StaffCredentials, AuthSession, AuditLogEntry
# src/router.tsx           → + subárvore /portal-liac/* (StaffLayout + guards)
# src/pages/Home/HomeHighlights.tsx → passa a preferir itens featured, com fallback cronológico
```

**Structure Decision**: Continua uma única aplicação frontend na raiz do repositório — esta
feature não introduz um projeto novo, só uma subárvore de rotas protegidas dentro do mesmo SPA.
O contrato de API permanece em `specs/contracts/api-contract.md` (mesmo arquivo da feature 001,
estendido com as novas seções).
