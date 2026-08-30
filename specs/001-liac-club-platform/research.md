# Phase 0 Research: LIAC Club — Hub de Portfólio Digital

Nenhum item do Technical Context ficou marcado como `NEEDS CLARIFICATION` — a stack já está
definida pela Constitution (Princípio I e seção "Stack e Qualidade"). As decisões abaixo cobrem
escolhas de implementação deixadas em aberto pelo brief original ("CSS Modules, ou Tailwind se
avaliar que acelera") e por lacunas técnicas naturais de qualquer plano (roteamento, datas,
ícones, formulário).

## 1. Estilização: CSS Modules vs Tailwind

**Decision**: CSS Modules, com `src/styles/tokens.css` como única fonte de verdade para cores e
tipografia (custom properties consumidas via `var(--liac-*)`).

**Rationale**: A marca LIAC depende de detalhes finos e não-padronizados — gradiente de 3 pontos
(`135deg, #FC2973 0%, #ED2835 55%, #FF6B4A 100%`), blobs orgânicos desfocados, um par tipográfico
serifado/geométrico específico e uma regra de contraste condicional (branco só é válido sobre o
gradiente em texto grande/bold). Expressar isso em Tailwind exigiria estender fortemente o tema
padrão e ainda assim lutar com a mesma quantidade de CSS customizado — sem ganho real de
velocidade. CSS Modules dá controle direto e escopo automático por componente, sem risco de
colisão de nomes entre `components/ui` e `components/content`.

**Alternatives considered**: Tailwind (rejeitado — overhead de configuração de tema customizado
não compensa para uma marca tão específica); styled-components/Emotion (rejeitado — runtime CSS-
in-JS é peso extra desnecessário para uma SPA estática sem theming dinâmico).

## 2. Roteamento

**Decision**: `react-router-dom` v6 com `createBrowserRouter` e uma rota de layout
(`PageLayout` com Navbar + Footer) envolvendo as 9 páginas + 3 rotas de detalhe
(`/novidades/:slug`, `/eventos/:slug`, `/artigos/:slug`), mais uma rota catch-all `*` renderizando
`NotFound`.

**Rationale**: `createBrowserRouter` é o padrão atual do React Router v6 (data router), com
suporte nativo a `errorElement` por rota — encaixa direto no requisito de página "não encontrado"
(FR-012) sem lógica manual de fallback.

**Alternatives considered**: `<BrowserRouter>` + `<Routes>` clássico (rejeitado — mesma
capacidade, mas sem `errorElement` embutido, exigindo tratamento manual de 404 em cada rota de
detalhe).

## 3. Camada de dados / hook de busca

**Decision**: Um único hook genérico `useAsyncResource<T>(fetchFn)` retornando
`{ data, status: 'idle' | 'loading' | 'success' | 'empty' | 'error' }`, reutilizado pelas 6
páginas de listagem/detalhe que consomem o `ApiClient`.

**Rationale**: As 6 páginas de conteúdo (Novidades, Eventos, Artigos, Projetos, Equipe,
Parceiros) precisam do mesmo tratamento de loading/empty/error (FR-011, Edge Cases). Duplicar
esse `useEffect` 6+ vezes violaria a preferência por evitar repetição; um hook genérico usado em
6 lugares é reuso real, não abstração prematura.

**Alternatives considered**: React Query/TanStack Query (rejeitado — traz cache, revalidação em
background e devtools que não fazem sentido para uma fonte de dados 100% local e estática;
dependência desproporcional ao problema).

## 4. Datas (eventos com início/fim)

**Decision**: `Intl.DateTimeFormat` nativo do navegador + um pequeno utilitário
`formatEventDateRange(start, end)` em `src/utils/date.ts` que retorna uma data única quando
`start === end` e um intervalo formatado quando diferentes (resolve o Edge Case de eventos de um
único dia).

**Rationale**: O único requisito de data é formatação de exibição (pt-BR) e comparação
futuro/passado — `Intl` nativo cobre isso sem dependência externa.

**Alternatives considered**: `date-fns` (rejeitado — utilitário de poucas linhas não justifica
uma dependência nova).

## 5. Ícones

**Decision**: Componentes SVG inline hand-authored em `components/ui/icons/` (Instagram,
LinkedIn, WhatsApp, external-link, filtro/chevron — conjunto pequeno e fixo).

**Rationale**: O conjunto de ícones necessário é pequeno e conhecido antecipadamente (definido
pela spec: redes sociais no rodapé/equipe, link externo em artigos/parceiros, filtro em
eventos/artigos). Um punhado de SVGs de ~10 linhas cada não justifica uma dependência de ícones
inteira.

**Alternatives considered**: `lucide-react` (razoável, mas rejeitado por ora — reavaliar se o
conjunto de ícones crescer significativamente durante a implementação).

## 6. Formulário de Contato

**Decision**: Estado controlado simples (`useState` por campo ou um único objeto de estado) com
uma função `validateContactForm(payload)` própria, sem biblioteca de formulário.

**Rationale**: O formulário tem 5 campos (Nome, E-mail, Telefone, Melhor horário, Mensagem) com
regras de validação simples (obrigatoriedade, formato de e-mail/telefone) — proporcional a
validação manual. `react-hook-form` ou `zod` adicionariam uma API inteira para um caso de uso que
não peça performance de re-render em formulários grandes nem schemas compartilhados.

**Alternatives considered**: `react-hook-form` (rejeitado — desproporcional para 5 campos sem
reuso de schema em outro lugar do app).

## 7. Slugs

**Decision**: Slugs são um campo explícito e autoral nas fixtures JSON (`slug: "beneficios-
colageno"`), não gerados dinamicamente em runtime a partir do título.

**Rationale**: No fluxo real da LIAC (documentado no Case de Marketing), quem escreve o
conteúdo é a equipe de marketing/pesquisa — o backend real (fora deste repositório) deverá
igualmente tratar slug como campo de conteúdo, não como derivação automática client-side (que
criaria risco de dessincronia entre o slug exibido na URL e o que o backend eventualmente
persistir). Um utilitário `findBySlug(collection, slug)` em `utils/slug.ts` faz apenas a busca;
não há geração de slug em runtime.

**Alternatives considered**: Gerar slug em runtime via `title.toLowerCase().replace(...)`
(rejeitado — funcionaria para o mock, mas estabeleceria um padrão que não sobreviveria à troca
pela API real, contrariando a Constitution Princípio I sobre a mock ser uma interface estável).

## 8. Testes

**Decision**: Vitest + React Testing Library, testes colocados (`Component.test.tsx` ao lado de
`Component.tsx`), consultas por role/label (não por classe CSS ou test-id) para forçar semântica
acessível.

**Rationale**: Colocação reduz fricção para "nunca remover um teste existente" (Constitution
Princípio III) — fica visualmente óbvio quando um componente muda sem seu teste correspondente
mudar junto. Queries por role/label fazem o teste falhar se a marcação semântica regredir,
reforçando o Princípio V (acessibilidade) como efeito colateral do próprio teste.

**Alternatives considered**: Diretório `tests/` espelhando `src/` (rejeitado — mesma cobertura,
mas mais fricção para manter os dois em sincronia; nenhuma vantagem real para um projeto deste
tamanho).
