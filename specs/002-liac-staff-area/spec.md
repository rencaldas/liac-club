# Feature Specification: Área da Equipe LIAC (login + gestão de conteúdo)

**Feature Branch**: `002-liac-staff-area`

**Created**: 2026-08-29

**Status**: Draft

**Input**: User description: "Um link exclusivo com sistema de autenticação para os usuários da
equipe LIAC poderem criar, editar e destacar posts (novidades, eventos, artigos científicos),
para que apareçam em carrosséis no site público. O frontend nunca acessa banco de dados
diretamente nem implementa autenticação real — apenas consome uma camada de API abstrata (hoje
mockada); a autenticação e a proteção de dados de verdade são responsabilidade de um backend em
repositório separado."

## Clarifications

### Session 2026-08-29

- Q: O login deve exigir apenas usuário/senha, ou também um segundo fator? → A: Apenas
  usuário/senha nesta fase — a validação real (e qualquer 2FA futuro) é decisão do backend; o
  frontend só envia credenciais via `ApiClient.login()` e guarda o token retornado.
- Q: Todo membro autenticado pode editar qualquer tipo de conteúdo, ou existem papéis
  diferenciados (ex: só Marketing edita Novidades)? → A: Sem diferenciação de papéis nesta fase
  — qualquer usuário autenticado tem acesso a todas as telas de gestão de conteúdo. Controle de
  acesso granular fica para uma fase futura, quando o backend real existir.
- Q: Quantos itens "em destaque" (carrossel) cada tipo de conteúdo pode ter ao mesmo tempo? → A:
  Sem limite rígido na interface — a equipe pode marcar quantos quiser; se nenhum item estiver
  marcado, o carrossel cai de volta para os mais recentes (mesmo comportamento de antes desta
  feature).
- Q: O que acontece com a sessão quando a aba é fechada e reaberta? → A: A sessão (token mockado)
  persiste em `localStorage` do navegador até logout explícito ou expiração simulada — não é
  perdida ao fechar a aba, para não forçar login repetido durante o desenvolvimento e demonstração
  do site.
- Q: Existem papéis/permissões diferenciados entre membros da equipe? → A: Não — todos os
  usuários autenticados pertencem à equipe de Marketing e têm acesso total a todas as telas de
  gestão de conteúdo (sem RBAC nesta fase).
- Q: Como a Diretora de Marketing mantém controle sobre o que cada pessoa da equipe altera, já
  que todos têm acesso total? → A: Toda operação de escrita (criar, editar, excluir, destacar)
  gera uma entrada em um histórico de alterações (autor, data/hora, tipo de ação, item afetado),
  visível em uma tela dedicada — controle por auditoria/transparência, não por restrição de
  permissão.
- Q: A tela de Histórico de Alterações fica visível a qualquer membro autenticado, ou só à
  Diretora? → A: Só à Diretora — o login mockado retorna um indicador de papel (`director` |
  `member`) junto do token de sessão; qualquer credencial não-diretora tem acesso de escrita
  igual a todos (US2-7), mas não vê nem acessa a tela de Histórico. É a única distinção de papel
  nesta feature.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Login e proteção da área da equipe (Priority: P1)

Um membro da equipe LIAC acessa uma URL não divulgada publicamente (`/portal-liac`), informa
usuário e senha, e ganha acesso à área de gestão de conteúdo. Um visitante sem sessão válida que
tente acessar qualquer URL de gestão é redirecionado para o login.

**Why this priority**: É o pré-requisito de tudo mais nesta feature — sem login funcional, nenhuma
tela de gestão de conteúdo pode ser demonstrada ou testada de forma realista.

**Independent Test**: Acessar `/portal-liac/novidades` sem estar autenticado e confirmar
redirecionamento para `/portal-liac/login`; fazer login com credenciais válidas (mockadas) e
confirmar acesso à área protegida; fazer logout e confirmar que a área volta a ficar
inacessível.

**Acceptance Scenarios**:

1. **Given** um visitante não autenticado, **When** acessa qualquer rota sob `/portal-liac/`
   (exceto `/portal-liac/login`), **Then** é redirecionado para `/portal-liac/login`.
2. **Given** a tela de login, **When** o usuário informa credenciais válidas (mockadas) e
   confirma, **Then** é redirecionado para o painel da área da equipe e uma sessão (token
   mockado) é armazenada.
3. **Given** a tela de login, **When** o usuário informa credenciais inválidas, **Then** vê uma
   mensagem de erro clara, sem revelar se o problema foi o usuário ou a senha.
4. **Given** um usuário autenticado na área da equipe, **When** clica em "Sair", **Then** a
   sessão é encerrada e ele é redirecionado para `/portal-liac/login`; tentar voltar para uma
   página protegida usando o botão "voltar" do navegador também deve redirecionar ao login.
5. **Given** um usuário com sessão salva de uma visita anterior (token em `localStorage` ainda
   válido), **When** reabre o site, **Then** continua autenticado sem precisar logar de novo.

---

### User Story 2 - Gerenciar Novidades (Priority: P1)

Um membro autenticado cria, edita, exclui e marca/desmarca novidades como "em destaque" (para
aparecer no carrossel da Home/listagem pública).

**Why this priority**: Novidades é o tipo de conteúdo de maior frequência de publicação
(User Story 1 da feature 001) — sem uma forma de gerenciá-lo, o site público fica estático para
sempre.

**Independent Test**: A partir da área protegida, criar uma novidade nova, confirmar que ela
aparece na listagem pública (`/novidades`); editá-la e confirmar que a mudança reflete
publicamente; marcá-la como destaque e confirmar que ela aparece no carrossel da Home;
excluí-la e confirmar que desaparece de ambos os lugares.

**Acceptance Scenarios**:

1. **Given** a lista de novidades na área da equipe, **When** o usuário clica em "Nova
   Novidade" e preenche título, categoria, resumo e conteúdo, **Then** a novidade passa a
   existir e aparece na listagem pública em `/novidades`.
2. **Given** uma novidade existente, **When** o usuário edita qualquer campo e salva, **Then** a
   mudança é refletida imediatamente na listagem e no detalhe públicos.
3. **Given** uma novidade existente, **When** o usuário ativa o toggle "Destacar no carrossel",
   **Then** ela passa a aparecer no carrossel de destaques da Home, substituindo o comportamento
   puramente cronológico quando houver ao menos um item marcado.
4. **Given** uma novidade existente, **When** o usuário a exclui e confirma a exclusão (ação
   destrutiva com confirmação), **Then** ela deixa de aparecer em qualquer lugar do site público.

---

### User Story 3 - Gerenciar Eventos (Priority: P1)

Um membro autenticado cria, edita, exclui e marca/desmarca eventos como "em destaque",
incluindo suporte a eventos multi-dia (data de início e fim).

**Why this priority**: Mesma lógica de valor de US2, aplicada a Eventos — um dos três pilares de
conteúdo do hub.

**Independent Test**: Criar um evento multi-dia pela área protegida, confirmar que aparece
corretamente (com intervalo de datas) na listagem pública; marcar como destaque e confirmar
aparição no carrossel.

**Acceptance Scenarios**:

1. **Given** a lista de eventos na área da equipe, **When** o usuário cria um evento informando
   título, data de início, data de fim, local, tipo e descrição, **Then** o evento aparece na
   listagem pública, com filtro futuro/passado calculado corretamente a partir da data de fim.
2. **Given** um evento existente, **When** o usuário o edita ou exclui, **Then** a mudança
   reflete na listagem e no detalhe públicos (ou o evento desaparece, no caso de exclusão).
3. **Given** um evento existente, **When** o usuário ativa "Destacar no carrossel", **Then** ele
   passa a poder aparecer no carrossel de destaques da Home.

---

### User Story 4 - Gerenciar Artigos Científicos (Priority: P1)

Um membro autenticado cria, edita, exclui e marca/desmarca artigos científicos como "em
destaque", com suporte a múltiplos autores.

**Why this priority**: Completa o terceiro pilar de conteúdo (junto com Novidades e Eventos).

**Independent Test**: Criar um artigo com múltiplos autores pela área protegida, confirmar
exibição correta na listagem/detalhe pública (todos os autores, link externo); marcar como
destaque e confirmar aparição no carrossel.

**Acceptance Scenarios**:

1. **Given** a lista de artigos na área da equipe, **When** o usuário cria um artigo informando
   título, um ou mais autores, resumo, tags e link externo (PDF/DOI), **Then** o artigo aparece
   na listagem e no detalhe públicos.
2. **Given** um artigo existente, **When** o usuário o edita ou exclui, **Then** a mudança
   reflete publicamente (ou o artigo desaparece, no caso de exclusão).
3. **Given** um artigo existente, **When** o usuário ativa "Destacar no carrossel", **Then** ele
   passa a poder aparecer no carrossel de destaques da Home.

---

### User Story 5 - Gerenciar Projetos de Pesquisa (Priority: P2)

Um membro autenticado cria, edita e exclui projetos de pesquisa (título, status, resumo,
membros envolvidos).

**Why this priority**: Mesmo valor institucional de US2-4, mas conteúdo de atualização menos
frequente — não bloqueia o núcleo de publicação.

**Independent Test**: Criar um projeto pela área protegida e confirmar exibição na listagem
pública `/projetos`; editar o status de "ativo" para "concluído" e confirmar a mudança refletida.

**Acceptance Scenarios**:

1. **Given** a lista de projetos na área da equipe, **When** o usuário cria, edita ou exclui um
   projeto, **Then** a mudança reflete na listagem pública `/projetos`.

---

### User Story 6 - Gerenciar Equipe (Priority: P2)

Um membro autenticado cria, edita e exclui membros da equipe exibidos em `/equipe`.

**Why this priority**: Necessário para manter a página de Equipe atualizada, mas de baixa
frequência de mudança (só muda a cada gestão/processo seletivo).

**Independent Test**: Criar um novo membro pela área protegida e confirmar que aparece
agrupado corretamente por área em `/equipe`.

**Acceptance Scenarios**:

1. **Given** a lista de membros na área da equipe, **When** o usuário cria, edita ou exclui um
   membro (nome, cargo, área, foto, links sociais), **Then** a mudança reflete em `/equipe`.

---

### User Story 7 - Gerenciar Parceiros (Priority: P2)

Um membro autenticado cria, edita e exclui parceiros/patrocinadores exibidos em `/parceiros`.

**Why this priority**: Necessário para manter a página de Parceiros atualizada, mas de baixa
frequência de mudança.

**Independent Test**: Criar um novo parceiro pela área protegida e confirmar que aparece em
`/parceiros` com link externo funcional.

**Acceptance Scenarios**:

1. **Given** a lista de parceiros na área da equipe, **When** o usuário cria, edita ou exclui um
   parceiro (nome, logo, link externo, nível), **Then** a mudança reflete em `/parceiros`.

---

### User Story 8 - Auditoria de Alterações (Priority: P2)

A Diretora de Marketing consulta um histórico cronológico de todas as alterações de conteúdo
feitas pela equipe — quem fez o quê e quando — para manter controle sobre o trabalho do time sem
precisar restringir o acesso de escrita de ninguém. É a única tela da área da equipe visível
exclusivamente a quem loga com credencial de Diretora.

**Why this priority**: Como toda a equipe de Marketing tem acesso de escrita total (User Story
1), a prestação de contas vem da transparência do histórico — restrita à Diretora — não de
permissões sobre o conteúdo em si. Não bloqueia o CRUD básico (US2-7), mas é essencial para o
caso de uso real que motivou a feature.

**Independent Test**: Criar, editar e excluir um item de conteúdo autenticado como usuários
diferentes (em sessões separadas) e confirmar que cada ação aparece na tela de Histórico — visível
ao logar como Diretora, mas inacessível ao logar como membro comum — com o autor, o tipo de ação
e o horário corretos, mais recente primeiro.

**Acceptance Scenarios**:

1. **Given** um usuário autenticado (Diretora ou membro comum) realiza qualquer ação de escrita
   (criar, editar, excluir, destacar/remover destaque) em qualquer tipo de conteúdo, **When** a
   ação é concluída com sucesso, **Then** uma entrada é adicionada ao histórico contendo autor,
   data/hora, tipo de ação e o item afetado (tipo + título) — independentemente de quem fez a
   ação ter ou não acesso à tela de Histórico.
2. **Given** um usuário autenticado como Diretora, **When** acessa a tela de Histórico de
   Alterações, **Then** vê as entradas em ordem cronológica reversa (mais recente primeiro) e
   pode filtrar por autor.
3. **Given** um usuário autenticado como membro comum (não-Diretora), **When** tenta acessar a
   tela de Histórico (pelo menu ou digitando a URL diretamente), **Then** é bloqueado/redirecionado
   e não vê o conteúdo do histórico; o item de menu para essa tela também não aparece para esse
   usuário.

---

### Edge Cases

- O que acontece quando o token de sessão mockado "expira" (simulação de expiração)? O sistema
  deve tratar isso como não-autenticado e redirecionar ao login, sem erro não tratado.
- O que acontece se o usuário tentar excluir um item que está atualmente marcado como destaque
  no carrossel? A exclusão deve remover o item de ambos os lugares (listagem e carrossel) sem
  deixar referência quebrada.
- O que acontece se o usuário navegar para longe da tela de edição com alterações não salvas? O
  sistema deve avisar antes de descartar as alterações.
- Como o formulário de criação/edição se comporta com campos obrigatórios vazios ou inválidos
  (ex: URL externa malformada em Artigo/Parceiro, data de fim anterior à data de início em
  Evento)? Deve exibir validação inline e impedir o salvamento até corrigido.
- O que acontece se um membro comum (não-Diretora) acessar `/portal-liac/historico` diretamente
  pela URL? Deve ser bloqueado/redirecionado da mesma forma que um usuário não-autenticado seria
  bloqueado de qualquer rota protegida — a diferença é que aqui a checagem é por papel
  (`role !== 'director'`), não por ausência de sessão.
- O que acontece se duas abas do navegador editarem o mesmo item ao mesmo tempo? Fora de escopo
  nesta fase (mock em memória por sessão de página) — não é necessário resolver conflito de
  edição concorrente; ver Assumptions.
- O que acontece quando o usuário recarrega a página (F5) dentro da área protegida? A sessão
  persiste (token em `localStorage`), mas os dados criados/editados nesta sessão de mock em
  memória são recarregados a partir das fixtures originais (ver Assumptions sobre persistência
  do mock).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE expor uma rota de login em `/portal-liac/login`, não vinculada a
  partir de nenhum menu ou link do site público.
- **FR-002**: Todas as rotas sob `/portal-liac/` (exceto `/portal-liac/login`) DEVEM ser
  protegidas por um guard client-side que verifica a presença de um token de sessão válido,
  redirecionando para o login quando ausente.
- **FR-003**: O login DEVE ser feito exclusivamente através de `ApiClient.login(credentials)`;
  nenhuma validação de credencial DEVE ocorrer no código deste repositório — a implementação
  mockada simula sucesso/falha, mas a lógica real pertence ao backend futuro (Constitution
  Princípio I, conforme emenda v1.1.0).
- **FR-004**: O sistema DEVE oferecer uma ação de logout que limpa o token de sessão e redireciona
  ao login.
- **FR-005**: O token de sessão DEVE persistir em `localStorage` entre recarregamentos de página
  e reaberturas do navegador, até logout explícito ou expiração simulada.
- **FR-006**: A área da equipe DEVE oferecer telas de listagem + criação + edição + exclusão
  (com confirmação) para: Novidades, Eventos, Artigos Científicos, Projetos de Pesquisa, Equipe
  e Parceiros.
- **FR-007**: Novidades, Eventos e Artigos Científicos DEVEM suportar um indicador "em destaque"
  (booleano) editável pela equipe, controlando a aparição no carrossel de destaques da Home.
- **FR-008**: O carrossel de destaques da Home DEVE exibir os itens marcados como "em destaque"
  quando existir ao menos um; na ausência de itens marcados, DEVE cair de volta para o
  comportamento cronológico já especificado na feature 001 (3 mais recentes de cada tipo).
- **FR-009**: Toda operação de escrita (criar, editar, excluir, destacar) DEVE passar
  exclusivamente por `ApiClient`, sem acesso direto a `localStorage`/arquivos para persistir
  conteúdo (o `localStorage` é usado apenas para o token de sessão, não para os dados de
  conteúdo).
- **FR-010**: Os formulários de criação/edição DEVEM validar campos obrigatórios e formatos (URL
  externa, intervalo de datas de evento) antes de permitir salvar, com mensagens de erro
  inline.
- **FR-011**: O sistema DEVE avisar o usuário antes de descartar alterações não salvas ao sair de
  uma tela de edição.
- **FR-012**: Toda operação de escrita bem-sucedida (criar, editar, excluir, destacar/remover
  destaque, em qualquer tipo de conteúdo) DEVE gerar automaticamente uma entrada de log de
  auditoria com autor (identidade do usuário autenticado na sessão), data/hora, tipo de ação e o
  item afetado (tipo de conteúdo + título/identificador).
- **FR-013**: A área da equipe DEVE oferecer uma tela "Histórico de Alterações" listando as
  entradas de auditoria em ordem cronológica reversa, com filtro por autor, **visível e
  acessível somente a sessões com papel `director`**; um membro comum não deve ver o item de
  menu nem conseguir acessar a rota diretamente pela URL.
- **FR-014**: Para todas as demais telas (US2-7), todos os membros autenticados têm o mesmo
  nível de acesso de escrita, independentemente do papel — a distinção `director`/`member`
  aplica-se exclusivamente à visibilidade da tela de Histórico (FR-013).

### Key Entities

- **StaffCredentials**: Dados enviados no login — usuário/e-mail e senha. Nunca persistidos além
  do envio via `ApiClient.login()`.
- **SessionToken**: Token opaco retornado pelo login mockado, guardado em `localStorage`,
  consumido pelo guard de rota. Sem estrutura interpretável pelo frontend além de um campo de
  papel explícito (`role: "director" | "member"`) retornado junto pelo mock — usado apenas para
  decidir a visibilidade da tela de Histórico (FR-013); o restante do token é tratado como string
  opaca (decodificação/verificação de assinatura é responsabilidade do backend real).
- **AuditLogEntry**: Uma entrada do histórico de alterações — autor (identidade do usuário
  autenticado na sessão, ex: nome/e-mail), data/hora, tipo de ação (`create` | `update` |
  `delete` | `feature` | `unfeature`), tipo de conteúdo afetado (`news` | `event` | `article` |
  `project` | `team` | `partner`), e um rótulo do item afetado (ex: título da novidade editada).
- Todas as demais entidades de conteúdo (`NewsItem`, `Event`, `ScientificArticle`,
  `ResearchProject`, `TeamMember`, `Partner`) já definidas em `specs/001-liac-club-platform/
  data-model.md` ganham, nesta feature, operações de escrita (create/update/delete) e — para
  `NewsItem`, `Event`, `ScientificArticle` — um novo campo `featured: boolean`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um visitante sem autenticação que tente acessar qualquer URL de gestão é sempre
  redirecionado ao login, sem exceção, em 100% das rotas protegidas testadas.
- **SC-002**: Um membro da equipe consegue publicar uma nova Novidade e vê-la refletida na
  listagem pública em menos de 5 segundos, sem recarregar a página manualmente.
- **SC-003**: Um membro da equipe consegue marcar um item como destaque e vê-lo aparecer no
  carrossel da Home imediatamente, sem etapas adicionais.
- **SC-004**: 0 casos em que uma ação destrutiva (excluir conteúdo) ocorre sem uma confirmação
  explícita do usuário.
- **SC-005**: Todas as telas da área da equipe atendem os mesmos critérios de contraste AA e
  responsividade (360px–1920px) definidos para o site público (Constitution Princípio V).
- **SC-006**: 100% das operações de escrita bem-sucedidas (criar, editar, excluir,
  destacar/remover destaque) aparecem no Histórico de Alterações com o autor correto, sem
  exceção.

## Assumptions

- "Link exclusivo" é interpretado como uma URL não divulgada/linkada no site público (obscuridade
  por não-descoberta), não como um mecanismo de segurança real — a segurança de verdade (quem
  pode logar, rate limiting, etc.) é responsabilidade do backend futuro.
- A "escrita" simulada pelo `MockApiClient` mantém um estado em memória durante a sessão do
  navegador (permitindo demonstrar criar/editar/excluir refletindo no site público
  imediatamente), mas não persiste entre reloads de página — cada `F5` reinicia os dados a partir
  das fixtures originais. Isso é aceitável nesta fase por ser um mock, não uma base de dados
  real.
- Não há diferenciação de papéis/permissões entre membros da equipe nesta fase — todos
  pertencem à equipe de Marketing e têm acesso total; o controle vem do histórico de alterações,
  não de restrição de acesso (Clarifications).
- O histórico de alterações é visível somente a sessões com papel `director` — a única distinção
  de papel nesta feature; todas as demais telas de gestão de conteúdo permanecem acessíveis
  igualmente a qualquer membro autenticado.
- O identificador de autor gravado no histórico é o que o login mockado retornar associado à
  sessão (ex: nome ou e-mail informado no login) — o backend real definirá a identidade
  autoritativa quando existir.
- As fixtures de credenciais mockadas devem incluir ao menos uma credencial com `role: "director"`
  e uma com `role: "member"`, para permitir testar os dois caminhos (FR-013).
- Não há limite de itens "em destaque" por tipo de conteúdo (Clarifications) — a ordem de
  exibição no carrossel quando há múltiplos destaques segue a ordem em que foram marcados
  (mais recente primeiro), decisão de implementação de baixo impacto.
- Credenciais de login mockadas (usuário/senha de demonstração) serão documentadas no README,
  não em código de produção nem em nenhum repositório público real da LIAC.
