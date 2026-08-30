---

description: "Task list template for feature implementation"
---

# Tasks: LIAC Club — Hub de Portfólio Digital

**Input**: Design documents from `/specs/001-liac-club-platform/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md,
`specs/contracts/api-contract.md`

**Tests**: Incluídos — a Constitution (Princípio III, seção "Stack e Qualidade") e o Definition
of Done do projeto exigem testes de componente com Vitest + Testing Library para cards,
listagens e formulário; nenhum teste existente pode ser removido.

**Organization**: Tarefas agrupadas por user story (spec.md) para permitir implementação e
teste independentes de cada uma.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: A qual user story a tarefa pertence (US1–US9)
- Caminhos de arquivo exatos em cada descrição

## Path Conventions

Projeto único (SPA frontend) na raiz do repositório — `src/` e testes colocados
(`Component.test.tsx` ao lado de `Component.tsx`), conforme `plan.md`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inicialização do projeto Vite + React + TypeScript

- [x] T001 Criar o scaffold Vite + React 18 + TypeScript na raiz do repositório
      (`package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`,
      `src/App.tsx` mínimos)
- [x] T002 Instalar dependências: `react`, `react-dom`, `react-router-dom`, `vitest`,
      `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`,
      `jsdom`, `typescript`, `@vitejs/plugin-react` (`react-router-dom` instalado em v7.18.3, não
      v6 — v6.x inteiro tem uma vulnerabilidade de open-redirect sem patch, corrigida só a partir
      de 7.18.0; ver `research.md` §2)
- [x] T003 [P] Configurar ESLint + regras de TypeScript/React em `.eslintrc.cjs` (ou
      `eslint.config.js`)
- [x] T004 [P] Configurar Vitest em `vite.config.ts` (bloco `test`, ambiente `jsdom`) e criar
      `src/test/setup.ts` importando `@testing-library/jest-dom`
- [x] T005 [P] Adicionar scripts `dev`, `build`, `preview`, `test`, `lint` em `package.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Infraestrutura que TODAS as user stories dependem — tokens de marca, tipos,
camada de serviço mockada, layout base e roteamento.

**⚠️ CRÍTICO**: Nenhuma user story pode começar antes desta fase estar completa.

- [x] T006 Criar `src/styles/tokens.css` com a paleta e a tipografia da Constitution
      (`--liac-primary`, `--liac-gradient-*`, `--liac-accent-*`, `--liac-neutral-*`, escala
      tipográfica Playfair Display / Poppins)
- [x] T007 [P] Adicionar Playfair Display e Poppins via `<link>` do Google Fonts em `index.html`
- [x] T008 [P] Criar `src/types/entities.ts` com as 7 interfaces de `data-model.md`: `NewsItem`,
      `Event`, `ScientificArticle`, `ResearchProject`, `TeamMember`, `Partner`,
      `ContactFormPayload`
- [x] T009 Criar a interface `ApiClient` em `src/services/ApiClient.ts` cobrindo todos os
      endpoints de `specs/contracts/api-contract.md` (`getNews`, `getNewsBySlug`, `getEvents`,
      `getEventBySlug`, `getArticles`, `getArticleBySlug`, `getProjects`, `getTeam`,
      `getPartners`, `submitContactForm`) (depende de T008)
- [x] T010 [P] Criar `src/services/mock/delay.ts` (latência simulada) e
      `src/services/mock/paginate.ts` (paginação simulada, espelhando os query params do
      contrato)
- [x] T011 [P] Criar as fixtures `src/mocks/news.json`, `events.json`, `articles.json`,
      `projects.json`, `team.json`, `partners.json` com dados de exemplo plausíveis — incluir ao
      menos: 1 evento multi-dia (`startDate` ≠ `endDate`) e 1 de dia único, 1 artigo com múltiplos
      autores, 1 membro de equipe sem `photoUrl` (depende de T008). Todos os nomes de
      pessoas/parceiros nas fixtures são fictícios — nenhum dado real da LIAC foi usado.
- [x] T012 Criar `src/services/mock/MockApiClient.ts` implementando `ApiClient` a partir das
      fixtures + `delay`/`paginate` (depende de T009, T010, T011)
- [x] T013 [P] Criar o hook genérico `src/hooks/useAsyncResource.ts`
      (`idle`/`loading`/`success`/`empty`/`error`)
- [x] T014 [P] Criar `src/utils/slug.ts` (`findBySlug`) e `src/utils/date.ts`
      (`formatEventDateRange`, retorna data única quando `startDate === endDate`)
- [x] T015 [P] Criar componentes base `src/components/ui/Button.tsx`, `Card.tsx`, `Badge.tsx`
      usando os tokens de T006
- [x] T016 [P] Criar `src/components/ui/LoadingState.tsx`, `EmptyState.tsx`, `NotFound.tsx`
- [x] T017 Criar `src/components/layout/Navbar.tsx` (menu responsivo com as 9 páginas),
      `Footer.tsx` e `PageLayout.tsx` (depende de T006, T015). Logo da marca: por ora só o
      wordmark "LIAC Club" em Playfair Display (o ícone do pote é asset a ser substituído
      depois, conforme seção 1.3 do brief original — e além disso o PNG oficial tem baixo
      contraste sobre fundo branco).
- [x] T018 Criar `src/router.tsx` com `createBrowserRouter`: rota de layout (`PageLayout`),
      placeholders das 9 páginas + 3 rotas de detalhe (`/novidades/:slug`, `/eventos/:slug`,
      `/artigos/:slug`) e rota catch-all `*` → `NotFound` (depende de T016, T017)
- [x] T019 Criar `src/services/client.ts` instanciando um único `MockApiClient` (nome
      deliberadamente diferente de `ApiClient.ts` — em filesystem case-insensitive/Windows,
      `apiClient.ts` e `ApiClient.ts` são o mesmo arquivo e um sobrescreveria o outro; isso
      realmente aconteceu e foi corrigido durante a implementação) e atualizar `src/App.tsx`
      para prover `RouterProvider` (ponto único de troca futura pela implementação real —
      Constitution Princípio I) (depende de T012, T018)

**Checkpoint**: Fundação pronta — as user stories podem começar.

---

## Phase 3: User Story 1 - Publicar e consultar Novidades (Priority: P1) 🎯 MVP parcial

**Goal**: Visitante lista novidades em ordem cronológica e abre o detalhe de uma delas.

**Independent Test**: Acessar `/novidades`, ver os cards ordenados por data, abrir um card e
chegar ao detalhe; acessar um slug inexistente e ver a página "não encontrado".

### Tests for User Story 1

- [x] T020 [P] [US1] Teste de componente para `NewsCard` em
      `src/components/content/NewsCard.test.tsx`
- [x] T021 [P] [US1] Teste de componente para `NewsList` (estados loading/empty/success, ordem
      cronológica) em `src/pages/News/NewsList.test.tsx`
- [x] T022 [P] [US1] Teste de componente para `NewsDetail` (item existente + slug inexistente →
      not-found) em `src/pages/News/NewsDetail.test.tsx`

### Implementation for User Story 1

- [x] T023 [US1] Criar `src/components/content/NewsCard.tsx` (depende de T015)
- [x] T024 [US1] Criar `src/pages/News/NewsList.tsx` usando `useAsyncResource` +
      `ApiClient.getNews` (depende de T013, T023)
- [x] T025 [US1] Criar `src/pages/News/NewsDetail.tsx` usando `findBySlug` +
      `ApiClient.getNewsBySlug`, renderizando `NotFound` quando o slug não existir (depende de
      T014, T016)
- [x] T026 [US1] Substituir os placeholders de `/novidades` e `/novidades/:slug` em
      `src/router.tsx` pelos componentes reais (depende de T018, T024, T025)

**Checkpoint**: Novidades funcional e testável de forma independente.

---

## Phase 4: User Story 2 - Descobrir e consultar Eventos (Priority: P1)

**Goal**: Visitante lista eventos, filtra futuro/passado e abre o detalhe de um evento
(incluindo multi-dia).

**Independent Test**: Acessar `/eventos`, alternar o filtro futuro/passado, abrir um evento
multi-dia e confirmar o intervalo de datas; abrir um evento de um dia e confirmar data única.

### Tests for User Story 2

- [x] T027 [P] [US2] Teste de componente para `EventCard` (exibição de data única vs intervalo)
      em `src/components/content/EventCard.test.tsx`
- [x] T028 [P] [US2] Teste de componente para `EventsList` (filtro futuro/passado) em
      `src/pages/Events/EventsList.test.tsx`
- [x] T029 [P] [US2] Teste de componente para `EventDetail` em
      `src/pages/Events/EventDetail.test.tsx`

### Implementation for User Story 2

- [x] T030 [US2] Criar `src/components/content/EventCard.tsx` usando `formatEventDateRange`
      (depende de T014, T015)
- [x] T031 [US2] Criar `src/pages/Events/EventsList.tsx` com filtro futuro/passado
      client-side (depende de T013, T030)
- [x] T032 [US2] Criar `src/pages/Events/EventDetail.tsx` (depende de T014, T016)
- [x] T033 [US2] Substituir os placeholders de `/eventos` e `/eventos/:slug` em
      `src/router.tsx` (depende de T018, T031, T032)

**Checkpoint**: Novidades e Eventos funcionam de forma independente.

---

## Phase 5: User Story 3 - Explorar Artigos Científicos (Priority: P1)

**Goal**: Visitante lista artigos, filtra por tema/autor e abre o detalhe com link externo para
PDF/DOI.

**Independent Test**: Acessar `/artigos`, aplicar filtro por tema e por autor, abrir um artigo
com múltiplos autores e verificar que todos aparecem, além do link externo.

### Tests for User Story 3

- [ ] T034 [P] [US3] Teste de componente para `ArticleCard` (múltiplos autores) em
      `src/components/content/ArticleCard.test.tsx`
- [ ] T035 [P] [US3] Teste de componente para `ArticlesList` (filtro por tema e por autor) em
      `src/pages/Articles/ArticlesList.test.tsx`
- [ ] T036 [P] [US3] Teste de componente para `ArticleDetail` (link externo presente) em
      `src/pages/Articles/ArticleDetail.test.tsx`

### Implementation for User Story 3

- [ ] T037 [US3] Criar `src/components/content/ArticleCard.tsx` (depende de T015)
- [ ] T038 [US3] Criar `src/pages/Articles/ArticlesList.tsx` com filtro por tema e autor
      (depende de T013, T037)
- [ ] T039 [US3] Criar `src/pages/Articles/ArticleDetail.tsx` com link externo
      (`rel="noopener noreferrer" target="_blank"`) (depende de T014, T016)
- [ ] T040 [US3] Substituir os placeholders de `/artigos` e `/artigos/:slug` em
      `src/router.tsx` (depende de T018, T038, T039)

**Checkpoint**: Novidades, Eventos e Artigos funcionam de forma independente.

---

## Phase 6: User Story 4 - Ponto de entrada e visão geral (Home) (Priority: P1)

**Goal**: Home com hero, CTA, destaques dos 3 tipos de conteúdo e métricas.

**Independent Test**: Acessar `/`, ver hero + CTA, ver os 3 itens mais recentes de cada tipo de
conteúdo (cada um levando ao detalhe correspondente), ver a seção de métricas.

**Nota de dependência**: Esta story reusa `NewsCard`, `EventCard` e `ArticleCard` das Stories
1–3 — implemente depois delas mesmo sendo todas P1.

### Tests for User Story 4

- [ ] T041 [P] [US4] Teste de componente para o hero + CTA da Home em
      `src/pages/Home/Home.test.tsx`
- [ ] T042 [P] [US4] Teste de componente para `HomeHighlights` (3 itens de cada tipo, links para
      o detalhe correto) em `src/pages/Home/HomeHighlights.test.tsx`

### Implementation for User Story 4

- [ ] T043 [US4] Criar `src/pages/Home/Home.tsx` (hero + CTA "Fale Conosco" → `/contato`)
      (depende de T015)
- [ ] T044 [US4] Criar `src/pages/Home/HomeHighlights.tsx` buscando os 3 itens mais recentes de
      Novidades/Eventos/Artigos e reusando `NewsCard`/`EventCard`/`ArticleCard` (depende de T023,
      T030, T037)
- [ ] T045 [US4] Criar `src/pages/Home/HomeMetrics.tsx` (métricas de destaque da liga) (depende
      de T015)
- [ ] T046 [US4] Substituir o placeholder de `/` em `src/router.tsx` compondo `Home`,
      `HomeHighlights` e `HomeMetrics` (depende de T018, T043, T044, T045)

**Checkpoint**: Todas as 4 stories P1 funcionam de forma independente — MVP completo.

---

## Phase 7: User Story 5 - Conhecer a Equipe (Priority: P2)

**Goal**: Página de Equipe agrupada por diretoria/área.

**Independent Test**: Acessar `/equipe`, ver membros agrupados por área, ver avatar placeholder
em membro sem foto.

### Tests for User Story 5

- [ ] T047 [P] [US5] Teste de componente para `TeamMemberCard` (fallback de avatar) em
      `src/components/content/TeamMemberCard.test.tsx`
- [ ] T048 [P] [US5] Teste de componente para `Team` (agrupamento por área) em
      `src/pages/Team/Team.test.tsx`

### Implementation for User Story 5

- [ ] T049 [US5] Criar `src/components/content/TeamMemberCard.tsx` (depende de T015)
- [ ] T050 [US5] Criar `src/pages/Team/Team.tsx` agrupando por `area` (depende de T013, T049)
- [ ] T051 [US5] Substituir o placeholder de `/equipe` em `src/router.tsx` (depende de T018,
      T050)

**Checkpoint**: US1–US5 funcionam de forma independente.

---

## Phase 8: User Story 6 - Conhecer Projetos de Pesquisa (Priority: P2)

**Goal**: Grid de projetos com status, resumo e membros envolvidos.

**Independent Test**: Acessar `/projetos`, ver status (ativo/concluído), resumo e membros por
card.

### Tests for User Story 6

- [ ] T052 [P] [US6] Teste de componente para `ProjectCard` em
      `src/components/content/ProjectCard.test.tsx`
- [ ] T053 [P] [US6] Teste de componente para `Projects` em `src/pages/Projects/Projects.test.tsx`

### Implementation for User Story 6

- [ ] T054 [US6] Criar `src/components/content/ProjectCard.tsx` (depende de T015)
- [ ] T055 [US6] Criar `src/pages/Projects/Projects.tsx` (depende de T013, T054)
- [ ] T056 [US6] Substituir o placeholder de `/projetos` em `src/router.tsx` (depende de T018,
      T055)

**Checkpoint**: US1–US6 funcionam de forma independente.

---

## Phase 9: User Story 7 - Consultar Parceiros/Patrocinadores (Priority: P2)

**Goal**: Grid de logos de parceiros com link externo, categorizado por nível quando aplicável.

**Independent Test**: Acessar `/parceiros`, clicar em um logo e confirmar abertura em nova aba.

### Tests for User Story 7

- [ ] T057 [P] [US7] Teste de componente para `PartnerLogo` (link externo em nova aba) em
      `src/components/content/PartnerLogo.test.tsx`
- [ ] T058 [P] [US7] Teste de componente para `Partners` (agrupamento por `tier` quando presente)
      em `src/pages/Partners/Partners.test.tsx`

### Implementation for User Story 7

- [ ] T059 [US7] Criar `src/components/content/PartnerLogo.tsx`
      (`rel="noopener noreferrer" target="_blank"`) (depende de T015)
- [ ] T060 [US7] Criar `src/pages/Partners/Partners.tsx` (depende de T013, T059)
- [ ] T061 [US7] Substituir o placeholder de `/parceiros` em `src/router.tsx` (depende de T018,
      T060)

**Checkpoint**: US1–US7 funcionam de forma independente.

---

## Phase 10: User Story 8 - Entender a LIAC (Sobre) (Priority: P3)

**Goal**: Página institucional com missão, história e vínculo com a UFRJ.

**Independent Test**: Acessar `/sobre`, ver missão, história e o selo de afiliação institucional
à UFRJ.

### Tests for User Story 8

- [ ] T062 [P] [US8] Teste de componente para `About` (presença do selo de afiliação UFRJ) em
      `src/pages/About/About.test.tsx`

### Implementation for User Story 8

- [ ] T063 [US8] Criar `src/pages/About/About.tsx` (missão, história, selo de afiliação UFRJ)
      (depende de T015)
- [ ] T064 [US8] Substituir o placeholder de `/sobre` em `src/router.tsx` (depende de T018, T063)

**Checkpoint**: US1–US8 funcionam de forma independente.

---

## Phase 11: User Story 9 - Entrar em contato (Priority: P3)

**Goal**: Formulário de contato com validação e mensagem de confirmação, mais informações
institucionais.

**Independent Test**: Preencher o formulário com campo obrigatório vazio/inválido e ver
validação inline; preencher tudo corretamente e ver a mensagem de confirmação (36h + canais
alternativos).

### Tests for User Story 9

- [ ] T065 [P] [US9] Testes de componente para `ContactForm` (erros de validação por campo +
      submissão bem-sucedida com mensagem de confirmação) em
      `src/components/content/ContactForm.test.tsx`
- [ ] T066 [P] [US9] Teste de componente para `Contact` (informações institucionais, redes
      sociais, mapa placeholder) em `src/pages/Contact/Contact.test.tsx`

### Implementation for User Story 9

- [ ] T067 [US9] Criar `src/utils/validateContactForm.ts` (nome, e-mail, telefone, melhor
      horário, mensagem — todos obrigatórios; e-mail e telefone com validação de formato)
- [ ] T068 [US9] Criar `src/components/content/ContactForm.tsx` (estado controlado, chama
      `validateContactForm` e `ApiClient.submitContactForm`, exibe a mensagem de confirmação de
      36h com canais alternativos) (depende de T015, T067)
- [ ] T069 [US9] Criar `src/pages/Contact/Contact.tsx` (informações institucionais, redes
      sociais, mapa placeholder, incorpora `ContactForm`) (depende de T068)
- [ ] T070 [US9] Substituir o placeholder de `/contato` em `src/router.tsx` (depende de T018,
      T069)

**Checkpoint**: Todas as 9 user stories funcionam de forma independente.

---

## Phase 12: Polish & Cross-Cutting Concerns

**Purpose**: Qualidade transversal — não pertence a nenhuma story específica.

- [ ] T071 [P] Escrever `README.md` com instruções de setup, estrutura de pastas e como trocar
      `MockApiClient` pela implementação real quando o backend existir
- [ ] T072 Rodar `npm run test` completo e corrigir eventuais falhas
- [ ] T073 [P] Passagem de acessibilidade: validar contraste de todas as combinações de texto
      sobre `--liac-gradient-mid` (só H1/H2 bold em branco, nunca corpo pequeno — Constitution
      Princípio II) e rodar um checador de contraste (ex: axe) nas páginas principais
- [ ] T074 [P] Passagem de responsividade em 360px, 768px e 1920px conforme `quickstart.md`
      (sem rolagem horizontal, grids de 3 colunas colapsando para 1 em mobile)
- [ ] T075 Executar manualmente todos os cenários de `quickstart.md`, incluindo o cenário de
      estado vazio (esvaziar uma fixture temporariamente e confirmar `EmptyState`)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências
- **Foundational (Phase 2)**: depende do Setup — BLOQUEIA todas as user stories
- **User Stories (Phase 3–11)**: todas dependem da Fase 2 completa
  - US1, US2, US3 (P1) são mutuamente independentes e podem ser feitas em paralelo
  - US4 (Home, P1) depende de componentes de US1–US3 já existirem (T023, T030, T037) — sempre
    por último entre as P1
  - US5, US6, US7 (P2) são mutuamente independentes
  - US8, US9 (P3) são mutuamente independentes
- **Polish (Phase 12)**: depende de todas as stories desejadas para o release estarem completas

### Parallel Opportunities

- Todas as tarefas `[P]` da Fase 1 e da Fase 2 podem rodar em paralelo entre si (arquivos
  distintos)
- Depois da Fase 2, US1, US2 e US3 podem ser implementadas em paralelo por pessoas diferentes;
  US4 só começa depois que ao menos os cards de US1–US3 existirem
- Dentro de cada story, todas as tarefas de teste marcadas `[P]` podem rodar em paralelo entre si

---

## Parallel Example: User Story 1

```bash
# Testes de User Story 1 em paralelo:
Task: "Component test for NewsCard in src/components/content/NewsCard.test.tsx"
Task: "Component test for NewsList in src/pages/News/NewsList.test.tsx"
Task: "Component test for NewsDetail in src/pages/News/NewsDetail.test.tsx"
```

---

## Implementation Strategy

### MVP (as 4 stories P1)

1. Completar Fase 1 (Setup) e Fase 2 (Foundational)
2. Completar US1 (Novidades), US2 (Eventos), US3 (Artigos) — em paralelo se houver mais de uma
   pessoa
3. Completar US4 (Home), que integra os cards das três anteriores
4. **PARAR e VALIDAR**: rodar os cenários 1–4 do `quickstart.md`
5. Neste ponto o "hub de portfólio digital" já cumpre sua proposta de valor central

### Entrega incremental

1. Setup + Foundational → base pronta
2. US1 + US2 + US3 + US4 → MVP (publicação de conteúdo + ponto de entrada)
3. US5 + US6 + US7 → apresentação institucional (equipe, projetos, parceiros)
4. US8 + US9 → páginas de suporte (sobre, contato)
5. Polish → qualidade transversal (a11y, responsividade, README)

Cada story adiciona valor sem quebrar as anteriores — o checkpoint de cada fase confirma isso
antes de seguir.

---

## Notes

- `[P]` = arquivos diferentes, sem dependência entre si
- `[Story]` mapeia a tarefa à user story correspondente para rastreabilidade
- Cada user story deve ser completável e testável de forma independente
- Commitar após cada tarefa ou grupo lógico de tarefas relacionadas, com resumo ao final de cada
  bloco (Constitution Princípio VI)
- Nenhum teste existente pode ser removido ao longo da implementação (Constitution Princípio III)
