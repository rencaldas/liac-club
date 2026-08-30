# Phase 0 Research: Área da Equipe LIAC

Sem itens `NEEDS CLARIFICATION` no Technical Context — as decisões abaixo cobrem escolhas de
implementação específicas desta feature, complementando `specs/001-liac-club-platform/research.md`
(que continua valendo para tudo que não é revisitado aqui).

## 1. Guard de rota autenticado + guard de papel

**Decision**: Dois componentes de guard compostos: `<RequireAuth>` (envolve toda a subárvore
`/portal-liac/*` exceto `/login`, redireciona para login se `AuthContext.token` for nulo) e
`<RequireRole role="director">` (envolve especificamente a rota de Histórico, redireciona para o
dashboard da área da equipe se `role !== "director"`).

**Rationale**: Composição de dois guards simples é mais legível que um único guard parametrizado
com lógica condicional interna — e reflete exatamente a regra do spec (FR-013/014): autenticação
é necessária em toda a área, papel só importa para uma tela.

**Alternatives considered**: Um único `<RequireAuth role?: Role>` genérico (rejeitado — esconderia
a assimetria real entre "toda a área exige login" e "só uma tela exige papel específico" atrás de
uma API genérica).

## 2. Estado de autenticação

**Decision**: Um `AuthContext` (React Context + `useReducer` ou `useState` simples) que lê o
token/papel de `localStorage` na inicialização, expõe `{ user, role, login, logout }`, e é o
único lugar do app que toca `localStorage` para dados de sessão.

**Rationale**: Login precisa estar disponível tanto para o guard de rota quanto para o
`StaffLayout` (mostrar nome do usuário, esconder link de Histórico) — Context evita prop drilling
entre esses consumidores não aparentados na árvore.

**Alternatives considered**: Biblioteca de state management (Zustand/Redux) — rejeitada, um
Context simples já resolve um estado desse tamanho sem dependência nova.

## 3. Mock com estado mutável (CRUD real dentro da sessão do navegador)

**Decision**: `mockStore.ts` mantém, por coleção, um array em memória inicializado a partir do
JSON importado; `MockApiClient` lê/escreve nesses arrays (nunca nos JSONs originais). O mesmo
módulo é importado tanto pelas páginas públicas quanto pelas páginas da área da equipe, então uma
criação feita no portal aparece imediatamente nas páginas públicas **da mesma sessão de aba**
(SC-002).

**Rationale**: É o único jeito de demonstrar "criar uma novidade e vê-la aparecer no site
público" sem um backend real — e mantém a garantia da Constitution de que nenhum dado de conteúdo
vai para `localStorage`/disco (FR-009), já que tudo vive em memória do processo do navegador e
some ao recarregar.

**Alternatives considered**: Persistir em `localStorage`/IndexedDB para sobreviver a reloads
(rejeitado — cruzaria a linha de "isso está começando a virar um banco de dados fake" que a
Constitution quer evitar; o Assumption do spec já aceita que um F5 reseta os dados mockados).

## 4. Auditoria (log de alterações)

**Decision**: `auditLog.ts` expõe um array em memória + `appendEntry()` + `queryEntries(filter)`.
Cada método de escrita do `MockApiClient` chama `appendEntry()` internamente, depois de aplicar a
mutação — nenhum componente de página chama `appendEntry()` diretamente.

**Rationale**: Centralizar a emissão da auditoria dentro do próprio `MockApiClient` garante
FR-012 ("toda operação de escrita bem-sucedida DEVE gerar...") por construção — não depende de
cada tela lembrar de registrar o log manualmente, o que seria frágil e fácil de esquecer numa das
6 entidades.

**Alternatives considered**: Cada página de formulário chamar `logAction()` explicitamente após
salvar (rejeitado — replica a mesma chamada em 6+ lugares e cria risco real de uma tela esquecer,
violando FR-012 silenciosamente).

## 5. Confirmação de exclusão e aviso de alterações não salvas

**Decision**: `ConfirmDialog` é um modal acessível próprio (`role="alertdialog"`,
`aria-modal="true"`, foco preso e devolvido ao elemento que abriu o modal ao fechar) — não usa
`window.confirm()`. Para alterações não salvas, `useUnsavedChangesGuard(isDirty)` combina o
`useBlocker` do React Router (data router, já em uso desde a feature 001) para navegação in-app
com um listener de `beforeunload` para fechar a aba/recarregar.

**Rationale**: `window.confirm()`/`window.alert()` não são estilizáveis e ficam visualmente fora
da identidade LIAC (Constitution Princípio II); `useBlocker` é a API nativa do React Router v6
data router para este exato caso, sem exigir dependência nova.

**Alternatives considered**: Nenhuma proteção de navegação in-app, só `beforeunload` (rejeitado —
não cobriria o caso mais comum, que é o usuário clicar em outro link do menu da área da equipe
sem salvar).

## 6. Formulários de criar/editar por entidade

**Decision**: Mantém a decisão da feature 001 (research.md §6) — sem biblioteca de formulário.
`EntityFormLayout` é só o "shell" visual (label, mensagem de erro, botões Salvar/Cancelar);
cada entidade mantém seu próprio componente de formulário com seus próprios campos e sua própria
função `validate*Form`, reusando o shell.

**Rationale**: Os 6 formulários têm campos genuinamente diferentes — forçá-los num componente
"formulário genérico orientado a schema" seria a abstração prematura que o projeto quer evitar;
compartilhar só a casca visual é reuso proporcional (6 usos reais).

**Alternatives considered**: Um `<GenericEntityForm schema={...}>` dirigido por configuração
(rejeitado — over-engineering para 6 formulários fixos e conhecidos, nenhum plano de crescer para
dezenas de tipos de conteúdo).

## 7. Credenciais de demonstração

**Decision**: `src/mocks/staffAccounts.json` com 2 registros claramente fictícios (ex:
`diretora.demo@liac.ufrj.br` / `member.demo@liac.ufrj.br`, senha de demonstração óbvia tipo
`liac-demo-2026`), documentados no `README.md` como "credenciais de demonstração, não reais" —
nunca senhas reais de ninguém da LIAC.

**Rationale**: Precisa de credenciais para demonstrar o fluxo de login, mas usar dados reais da
liga (mesmo que informais) num repositório de código seria um risco de segurança desnecessário
mesmo sendo tudo mock — más práticas de segurança não deixam de ser más práticas só porque o
"backend" é fake.

**Alternatives considered**: Aceitar qualquer usuário/senha não vazia (rejeitado — não permite
testar o caminho `role: "member"` vs `role: "director"` de forma determinística).
