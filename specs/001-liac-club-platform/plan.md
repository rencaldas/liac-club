# Implementation Plan: LIAC Club — Hub de Portfólio Digital

**Branch**: `001-liac-club-platform` | **Date**: 2026-08-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-liac-club-platform/spec.md`

**Note**: No dedicated git branch was created for this feature (no `before_specify` git hook is
registered in `.specify/extensions.yml`); all work lands on `master` per the user's own commit
workflow. The feature id `001-liac-club-platform` still identifies the spec/plan/tasks
directory.

## Summary

Construir uma SPA em React 18 + Vite + TypeScript com 9 páginas navegáveis (Home, Sobre,
Equipe, Eventos, Artigos Científicos, Novidades, Projetos de Pesquisa, Parceiros, Contato), toda
a leitura de dados mediada por uma camada `ApiClient` cuja única implementação neste repositório
é mockada (fixtures JSON locais + latência simulada). A identidade visual segue os design tokens
LIAC (paleta magenta/coral/laranja, Playfair Display + Poppins). Nenhuma chamada de rede real,
nenhum backend, nenhuma autenticação real — consistente com a Constitution v1.0.0.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode) sobre React 18, build via Vite 5.

**Primary Dependencies**: `react-router-dom` v6 (`createBrowserRouter`, rotas aninhadas com
layout compartilhado), Vitest + `@testing-library/react` + `@testing-library/jest-dom` (testes),
sem biblioteca de formulário ou de datas externa (ver `research.md`).

**Storage**: N/A — dados vêm de fixtures JSON estáticas versionadas em `src/mocks/*.json`, sem
persistência real; nenhum banco de dados neste repositório (Constitution Princípio I).

**Testing**: Vitest (test runner, compatível com Vite) + React Testing Library (testes de
componente: cards, listagens, formulário de contato) + `jsdom` como ambiente de teste.

**Target Platform**: Navegador (SPA client-side), build estático para hospedagem em
Vercel/Netlify. Sem SSR/SSG nesta fase (débito técnico documentado no README).

**Project Type**: Aplicação web frontend single-page (todo o repositório é o frontend — não há
diretório `backend/` nem `frontend/` aninhado, pois o backend vive em outro repositório).

**Performance Goals**: Filtros de listagem (Eventos, Artigos) respondem em <1s sem chamada de
rede real (SC-004); navegação entre páginas sem recarregar o documento (SPA routing).

**Constraints**: 100% dos dados servidos por uma camada mockada substituível (Constitution
Princípio I); contraste de texto AA em todas as combinações de cor (Constitution Princípio V);
responsivo de 360px a 1920px sem rolagem horizontal (SC-002); nenhum teste existente pode ser
removido (Constitution Princípio III).

**Scale/Scope**: 9 rotas de página (+ 3 rotas de detalhe: Novidade, Evento, Artigo), 7 entidades
de domínio, dezenas de itens de exemplo por coleção nas fixtures (não é um cenário de escala
"enterprise").

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Avaliação | Status |
|-----------|-----------|--------|
| I. Fronteira Frontend-Only | Nenhum servidor, DB, ORM ou chamada de rede real planejados; toda leitura passa por `ApiClient` com única implementação mock injetável. | PASS |
| II. Fidelidade à Identidade Visual LIAC | `src/styles/tokens.css` centraliza a paleta e tipografia da Constitution; nenhuma cor fora dos tokens. | PASS |
| III. Componentização Modular e Pequena | Estrutura de pastas separa `components/ui`, `components/content`, `components/layout` e `pages/`, cada componente com responsabilidade única (ver Project Structure). | PASS |
| IV. Contrato de API Mockado como Interface Estável | `data-model.md` e `contracts/api-contract.md` são produzidos nesta fase antes da implementação da camada mock. | PASS |
| V. Acessibilidade WCAG AA | Testing Library usado com queries por role/label (força semântica); contraste validado nos tokens (ver `research.md`). | PASS |
| VI. Desenvolvimento Incremental com Gates | Este próprio plano é um gate; `/speckit-tasks` só roda após aprovação deste documento. | PASS |

Nenhuma violação — **Complexity Tracking** não se aplica (seção omitida abaixo por não haver
desvios a justificar).

## Project Structure

### Documentation (this feature)

```text
specs/001-liac-club-platform/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md         # Phase 1 output (/speckit-plan command)
├── quickstart.md         # Phase 1 output (/speckit-plan command)
└── tasks.md              # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)

specs/contracts/
└── api-contract.md       # Phase 1 output — path fixed by Constitution Princípio IV
                           # (repo-wide, not nested under the numbered feature dir, since the
                           # backend contract is a project-level artifact, not feature-scoped)
```

### Source Code (repository root)

```text
src/
├── main.tsx                    # Entry point, mounts <App /> with the router
├── App.tsx                     # Root component (providers only, no business logic)
├── router.tsx                  # createBrowserRouter route tree (layout + 9 pages + 3 detail routes)
├── styles/
│   └── tokens.css              # LIAC design tokens (colors, type scale, spacing) — single source of truth
├── types/
│   └── entities.ts             # NewsItem, Event, ScientificArticle, ResearchProject, TeamMember,
│                                # Partner, ContactFormPayload
├── services/
│   ├── ApiClient.ts            # Abstract interface consumed by pages/hooks
│   └── mock/
│       ├── MockApiClient.ts    # Implements ApiClient, reads src/mocks/*.json
│       ├── delay.ts            # Simulated latency helper
│       └── paginate.ts         # Simulated pagination helper (mirrors future REST query params)
├── mocks/
│   ├── news.json
│   ├── events.json
│   ├── articles.json
│   ├── projects.json
│   ├── team.json
│   └── partners.json
├── hooks/
│   └── useAsyncResource.ts     # Generic loading/error/data hook wrapping ApiClient calls
├── utils/
│   ├── slug.ts                 # Slug lookup/uniqueness helpers (slugs are authored in fixtures)
│   └── date.ts                 # Date range formatting (single-day vs multi-day events)
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── PageLayout.tsx
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── EmptyState.tsx
│   │   ├── LoadingState.tsx
│   │   ├── NotFound.tsx
│   │   └── icons/               # Hand-authored inline SVG icons (social, external-link, filter)
│   └── content/
│       ├── NewsCard.tsx
│       ├── EventCard.tsx
│       ├── ArticleCard.tsx
│       ├── ProjectCard.tsx
│       ├── PartnerLogo.tsx
│       ├── TeamMemberCard.tsx
│       └── ContactForm.tsx
└── pages/
    ├── Home/
    ├── About/
    ├── Team/
    ├── Events/            # EventsList.tsx, EventDetail.tsx
    ├── Articles/          # ArticlesList.tsx, ArticleDetail.tsx
    ├── News/               # NewsList.tsx, NewsDetail.tsx
    ├── Projects/
    ├── Partners/
    └── Contact/

# Testes colocados junto ao código (Component.test.tsx ao lado de Component.tsx) — ver
# research.md para o racional dessa escolha em vez de um diretório tests/ separado.
```

**Structure Decision**: Aplicação frontend única na raiz do repositório (sem `frontend/`
aninhado) — não existe `backend/` neste repositório por definição da Constitution Princípio I,
então a "Option 2: Web application" do template não se aplica; usamos uma variante da "Option 1"
adaptada a uma SPA React. O contrato de API vive em `specs/contracts/api-contract.md` (caminho
fixo definido na Constitution), não em `specs/001-liac-club-platform/contracts/`.
