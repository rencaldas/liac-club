---

description: "Task list template for feature implementation"
---

# Tasks: Área da Equipe LIAC (login + gestão de conteúdo)

**Input**: Design documents from `/specs/002-liac-staff-area/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md,
`specs/contracts/api-contract.md` — **e a implementação da feature 001 já concluída**
(`src/types/entities.ts`, `ApiClient.ts`, `MockApiClient.ts`, `router.tsx`, `tokens.css`,
`HomeHighlights.tsx` precisam existir no código antes de começar esta feature).

**Tests**: Incluídos, mesmo padrão da feature 001 (Constitution Princípio III + "Stack e
Qualidade").

**Organization**: Tarefas agrupadas por user story (spec.md).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: US1–US8, conforme spec.md
- Caminhos de arquivo exatos em cada descrição

---

## Phase 1: Setup

- [ ] T001 Verificar pré-requisito: as Fases 1 e 2 (Setup + Foundational) da feature 001 estão
      implementadas no código (`src/types/entities.ts`, `src/services/ApiClient.ts`,
      `src/services/mock/MockApiClient.ts`, `src/router.tsx`, `src/styles/tokens.css`,
      `src/pages/Home/HomeHighlights.tsx`) — esta feature não instala nenhuma dependência nova

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Autenticação, guards de rota, estado mutável do mock e auditoria — tudo que as 8
user stories desta feature dependem.

**⚠️ CRÍTICO**: Nenhuma user story desta feature pode começar antes desta fase estar completa.

- [ ] T002 Adicionar `featured?: boolean` a `NewsItem`, `Event`, `ScientificArticle` em
      `src/types/entities.ts`
- [ ] T003 Adicionar os tipos `StaffCredentials`, `AuthSession`, `AuditLogEntry` em
      `src/types/entities.ts` (depende de T002 — mesmo arquivo)
- [ ] T004 [P] Criar `src/mocks/staffAccounts.json` com 2 credenciais de demonstração
      claramente fictícias (`role: "director"` e `role: "member"`)
- [ ] T005 Criar `src/services/mock/mockStore.ts` — cópias mutáveis em memória das 6 coleções,
      seed a partir das fixtures da feature 001 (depende de T002, T003)
- [ ] T006 [P] Criar `src/services/mock/auditLog.ts` — array em memória + `appendEntry()` +
      `queryEntries(filter)` (depende de T003)
- [ ] T007 Estender a interface `ApiClient` em `src/services/ApiClient.ts`: `login`, `logout`,
      `create`/`update`/`delete` para as 6 entidades, `getAuditLog` (depende de T003)
- [ ] T008 Estender `src/services/mock/MockApiClient.ts` implementando os novos métodos sobre
      `mockStore` + `auditLog` — cada método de escrita chama `appendEntry()` internamente
      (depende de T005, T006, T007)
- [ ] T009 [P] Criar `src/auth/AuthContext.tsx` (sessão, `login()`/`logout()`, inicializa e
      persiste em `localStorage`) (depende de T003)
- [ ] T010 [P] Criar `src/auth/RequireAuth.tsx`
- [ ] T011 [P] Criar `src/auth/RequireRole.tsx`
- [ ] T012 [P] Criar `src/hooks/useUnsavedChangesGuard.ts` (`useBlocker` + `beforeunload`)
- [ ] T013 [P] Criar `src/components/staff/ConfirmDialog.tsx` (`role="alertdialog"`, foco
      gerenciado)
- [ ] T014 [P] Criar `src/components/staff/DataTable.tsx`
- [ ] T015 [P] Criar `src/components/staff/EntityFormLayout.tsx`
- [ ] T016 [P] Criar `src/components/staff/FeaturedToggle.tsx`
- [ ] T017 Criar `src/components/staff/StaffLayout.tsx` (nav da área protegida, link
      "Histórico" condicional a `role === "director"`, botão Sair) (depende de T009)
- [ ] T018 Atualizar `src/pages/Home/HomeHighlights.tsx` (feature 001) para preferir itens
      `featured: true` por tipo, com fallback cronológico quando nenhum estiver marcado (depende
      de T002, T008)
- [ ] T019 Criar a subárvore `/portal-liac/*` em `src/router.tsx`: `/login` pública dentro da
      subárvore, `RequireAuth` envolvendo o restante, `StaffLayout`, placeholders de rota para
      cada tela de gestão, e `/historico` sob `RequireRole('director')` (depende de T010, T011,
      T017)

**Checkpoint**: Fundação pronta — as 8 user stories podem começar.

---

## Phase 3: User Story 1 - Login e proteção da área da equipe (Priority: P1) 🎯 MVP parcial

**Goal**: Login funcional, guard de autenticação protegendo toda a área.

**Independent Test**: Acessar rota protegida sem sessão → redireciona ao login; logar com
credenciais válidas → acessa o painel; logout → área volta a ficar inacessível.

### Tests for User Story 1

- [ ] T020 [P] [US1] Teste de `AuthContext` (login/logout, persistência em `localStorage`) em
      `src/auth/AuthContext.test.tsx`
- [ ] T021 [P] [US1] Teste de `RequireAuth` (redireciona sem sessão, permite com sessão) em
      `src/auth/RequireAuth.test.tsx`
- [ ] T022 [P] [US1] Teste de `LoginForm` (erro genérico em credencial inválida, sucesso
      redireciona) em `src/components/staff/LoginForm.test.tsx`

### Implementation for User Story 1

- [ ] T023 [US1] Criar `src/components/staff/LoginForm.tsx` (depende de T013)
- [ ] T024 [US1] Criar `src/pages/staff/Login/Login.tsx` (depende de T023)
- [ ] T025 [US1] Substituir o placeholder de `/portal-liac/login` em `src/router.tsx` e ligar o
      botão "Sair" do `StaffLayout` a `AuthContext.logout()` (depende de T019, T024)

**Checkpoint**: Login e proteção de rota funcionam de forma independente.

---

## Phase 4: User Story 2 - Gerenciar Novidades (Priority: P1)

**Goal**: CRUD completo de Novidades + toggle de destaque, refletindo no site público e no
carrossel da Home.

**Independent Test**: Criar, editar, destacar e excluir uma novidade pelo painel; confirmar cada
mudança refletida em `/novidades` e (para destaque) no carrossel da Home.

### Tests for User Story 2

- [ ] T026 [P] [US2] Teste de `NewsManageList` (listar, abrir confirmação de exclusão) em
      `src/pages/staff/News/NewsManageList.test.tsx`
- [ ] T027 [P] [US2] Teste de `NewsForm` (validação, criar, editar, toggle de destaque) em
      `src/pages/staff/News/NewsForm.test.tsx`
- [ ] T028 [P] [US2] Teste de que `MockApiClient` gera uma `AuditLogEntry` para
      create/update/delete/feature de Novidade em
      `src/services/mock/MockApiClient.news.test.ts`

### Implementation for User Story 2

- [ ] T029 [US2] Criar `src/pages/staff/News/NewsForm.tsx` (usa `EntityFormLayout`,
      `FeaturedToggle`, `useUnsavedChangesGuard`) (depende de T014, T015, T016)
- [ ] T030 [US2] Criar `src/pages/staff/News/NewsManageList.tsx` (usa `DataTable`,
      `ConfirmDialog`) (depende de T013, T014)
- [ ] T031 [US2] Substituir os placeholders de `/portal-liac/novidades` (lista, nova, editar) em
      `src/router.tsx` (depende de T019, T029, T030)

**Checkpoint**: Login + Novidades funcionam de forma independente.

---

## Phase 5: User Story 3 - Gerenciar Eventos (Priority: P1)

**Goal**: CRUD completo de Eventos (com data início/fim) + toggle de destaque.

**Independent Test**: Criar um evento multi-dia pelo painel e confirmar exibição correta do
intervalo na listagem pública; editar, destacar e excluir.

### Tests for User Story 3

- [ ] T032 [P] [US3] Teste de `EventsManageList` em
      `src/pages/staff/Events/EventsManageList.test.tsx`
- [ ] T033 [P] [US3] Teste de `EventForm` (validação de `endDate >= startDate`, criar, editar,
      destacar) em `src/pages/staff/Events/EventForm.test.tsx`
- [ ] T034 [P] [US3] Teste de auditoria para Evento em
      `src/services/mock/MockApiClient.events.test.ts`

### Implementation for User Story 3

- [ ] T035 [US3] Criar `src/pages/staff/Events/EventForm.tsx` (depende de T014, T015, T016)
- [ ] T036 [US3] Criar `src/pages/staff/Events/EventsManageList.tsx` (depende de T013, T014)
- [ ] T037 [US3] Substituir os placeholders de `/portal-liac/eventos` em `src/router.tsx`
      (depende de T019, T035, T036)

**Checkpoint**: Login + Novidades + Eventos funcionam de forma independente.

---

## Phase 6: User Story 4 - Gerenciar Artigos Científicos (Priority: P1)

**Goal**: CRUD completo de Artigos (múltiplos autores) + toggle de destaque.

**Independent Test**: Criar um artigo com múltiplos autores pelo painel e confirmar exibição
correta na listagem/detalhe pública; editar, destacar e excluir.

### Tests for User Story 4

- [ ] T038 [P] [US4] Teste de `ArticlesManageList` em
      `src/pages/staff/Articles/ArticlesManageList.test.tsx`
- [ ] T039 [P] [US4] Teste de `ArticleForm` (múltiplos autores, validação de URL externa, criar,
      editar, destacar) em `src/pages/staff/Articles/ArticleForm.test.tsx`
- [ ] T040 [P] [US4] Teste de auditoria para Artigo em
      `src/services/mock/MockApiClient.articles.test.ts`

### Implementation for User Story 4

- [ ] T041 [US4] Criar `src/pages/staff/Articles/ArticleForm.tsx` (depende de T014, T015, T016)
- [ ] T042 [US4] Criar `src/pages/staff/Articles/ArticlesManageList.tsx` (depende de T013, T014)
- [ ] T043 [US4] Substituir os placeholders de `/portal-liac/artigos` em `src/router.tsx`
      (depende de T019, T041, T042)

**Checkpoint**: Todas as 4 stories P1 funcionam de forma independente — MVP completo desta
feature.

---

## Phase 7: User Story 5 - Gerenciar Projetos de Pesquisa (Priority: P2)

**Goal**: CRUD completo de Projetos (sem destaque/carrossel — não se aplica a este tipo).

**Independent Test**: Criar um projeto pelo painel e confirmar exibição em `/projetos`; editar o
status; excluir.

### Tests for User Story 5

- [ ] T044 [P] [US5] Teste de `ProjectsManageList` em
      `src/pages/staff/Projects/ProjectsManageList.test.tsx`
- [ ] T045 [P] [US5] Teste de `ProjectForm` (validação, criar, editar) em
      `src/pages/staff/Projects/ProjectForm.test.tsx`

### Implementation for User Story 5

- [ ] T046 [US5] Criar `src/pages/staff/Projects/ProjectForm.tsx` (depende de T014, T015)
- [ ] T047 [US5] Criar `src/pages/staff/Projects/ProjectsManageList.tsx` (depende de T013, T014)
- [ ] T048 [US5] Substituir os placeholders de `/portal-liac/projetos` em `src/router.tsx`
      (depende de T019, T046, T047)

**Checkpoint**: US1–US5 funcionam de forma independente.

---

## Phase 8: User Story 6 - Gerenciar Equipe (Priority: P2)

**Goal**: CRUD completo de membros da equipe.

**Independent Test**: Criar um membro pelo painel e confirmar exibição agrupada por área em
`/equipe`; editar; excluir.

### Tests for User Story 6

- [ ] T049 [P] [US6] Teste de `TeamManageList` em
      `src/pages/staff/Team/TeamManageList.test.tsx`
- [ ] T050 [P] [US6] Teste de `TeamMemberForm` (validação, criar, editar) em
      `src/pages/staff/Team/TeamMemberForm.test.tsx`

### Implementation for User Story 6

- [ ] T051 [US6] Criar `src/pages/staff/Team/TeamMemberForm.tsx` (depende de T014, T015)
- [ ] T052 [US6] Criar `src/pages/staff/Team/TeamManageList.tsx` (depende de T013, T014)
- [ ] T053 [US6] Substituir os placeholders de `/portal-liac/equipe` em `src/router.tsx`
      (depende de T019, T051, T052)

**Checkpoint**: US1–US6 funcionam de forma independente.

---

## Phase 9: User Story 7 - Gerenciar Parceiros (Priority: P2)

**Goal**: CRUD completo de parceiros/patrocinadores.

**Independent Test**: Criar um parceiro pelo painel e confirmar exibição em `/parceiros` com
link externo funcional; editar; excluir.

### Tests for User Story 7

- [ ] T054 [P] [US7] Teste de `PartnersManageList` em
      `src/pages/staff/Partners/PartnersManageList.test.tsx`
- [ ] T055 [P] [US7] Teste de `PartnerForm` (validação de URL externa, criar, editar) em
      `src/pages/staff/Partners/PartnerForm.test.tsx`

### Implementation for User Story 7

- [ ] T056 [US7] Criar `src/pages/staff/Partners/PartnerForm.tsx` (depende de T014, T015)
- [ ] T057 [US7] Criar `src/pages/staff/Partners/PartnersManageList.tsx` (depende de T013, T014)
- [ ] T058 [US7] Substituir os placeholders de `/portal-liac/parceiros` em `src/router.tsx`
      (depende de T019, T056, T057)

**Checkpoint**: US1–US7 funcionam de forma independente.

---

## Phase 10: User Story 8 - Auditoria de Alterações (Priority: P2)

**Goal**: Tela de Histórico visível só à Diretora, listando todas as ações de escrita já
capturadas pelas stories anteriores.

**Independent Test**: Logado como `member`, tentar acessar `/portal-liac/historico` diretamente
pela URL → bloqueado. Logado como `director`, acessar a mesma rota → vê as entradas geradas
pelas ações de US2-7, mais recente primeiro, com filtro por autor funcional.

### Tests for User Story 8

- [ ] T059 [P] [US8] Teste de `ChangeHistory` (lista entradas, filtro por autor) em
      `src/pages/staff/History/ChangeHistory.test.tsx`
- [ ] T060 [P] [US8] Teste de `RequireRole` bloqueando `member` e permitindo `director` em
      `src/auth/RequireRole.test.tsx`

### Implementation for User Story 8

- [ ] T061 [US8] Criar `src/pages/staff/History/ChangeHistory.tsx` (depende de T014)
- [ ] T062 [US8] Substituir o placeholder de `/portal-liac/historico` em `src/router.tsx`
      (depende de T019, T061)

**Checkpoint**: Todas as 8 user stories funcionam de forma independente.

---

## Phase 11: Polish & Cross-Cutting Concerns

- [ ] T063 [P] Atualizar `README.md` (feature 001) com a URL de demonstração (`/portal-liac`),
      as credenciais de demonstração e o aviso de que os dados mockados resetam ao recarregar
- [ ] T064 Rodar `npm run test` completo (features 001 + 002) e corrigir eventuais falhas
- [ ] T065 [P] Passagem de acessibilidade nas telas novas: `ConfirmDialog` (foco preso e
      devolvido), formulários (label + `aria-describedby` em erros), contraste AA
- [ ] T066 [P] Passagem de responsividade em 360px, 768px e 1920px nas telas da área da equipe
- [ ] T067 Executar manualmente todos os cenários de `quickstart.md` desta feature

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: depende da feature 001 já implementada (fora deste repositório de
  tarefas, mas é um bloqueio real)
- **Foundational (Phase 2)**: depende do Setup — BLOQUEIA todas as 8 user stories
- **User Stories (Phase 3–10)**: todas dependem da Fase 2 completa
  - US1 (Login) deve vir primeiro na prática, ainda que US2-7 sejam tecnicamente independentes
    entre si — sem login não há como demonstrar nenhuma delas de ponta a ponta
  - US2, US3, US4 (P1, conteúdo com destaque) são mutuamente independentes
  - US5, US6, US7 (P2, sem destaque) são mutuamente independentes
  - US8 (Auditoria) só é observável depois que pelo menos uma de US2-7 gerou entradas, mas o
    componente em si (`ChangeHistory`, `RequireRole`) pode ser construído em paralelo
- **Polish (Phase 11)**: depende de todas as stories desejadas para o release estarem completas

### Parallel Opportunities

- Todas as tarefas `[P]` da Fase 2 podem rodar em paralelo entre si (arquivos distintos)
- Depois da Fase 2 + US1, US2/US3/US4 podem ser feitas em paralelo por pessoas diferentes; o
  mesmo vale para US5/US6/US7 depois

---

## Implementation Strategy

### MVP desta feature

1. Completar Fase 1 (Setup) e Fase 2 (Foundational)
2. Completar US1 (Login) — pré-requisito prático de tudo mais
3. Completar US2 (Novidades) — prova o ciclo completo: criar → refletir no público → destacar →
   aparecer no carrossel → excluir
4. **PARAR e VALIDAR**: rodar os cenários 1–7 do `quickstart.md`

### Entrega incremental

1. Setup + Foundational → base pronta (auth, mock mutável, auditoria)
2. US1 + US2 → MVP (login funcional + um tipo de conteúdo gerenciável ponta a ponta)
3. US3 + US4 → completa os 3 pilares de conteúdo com destaque
4. US5 + US6 + US7 → completa a gestão institucional (projetos, equipe, parceiros)
5. US8 → auditoria, fechando o requisito de controle da Diretora
6. Polish → qualidade transversal

---

## Notes

- `[P]` = arquivos diferentes, sem dependência entre si
- Nenhum teste existente (desta feature ou da 001) pode ser removido (Constitution Princípio III)
- Commitar após cada tarefa ou grupo lógico, com resumo ao final de cada bloco (Constitution
  Princípio VI)
