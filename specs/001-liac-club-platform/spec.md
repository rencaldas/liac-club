# Feature Specification: LIAC Club — Hub de Portfólio Digital

**Feature Branch**: `001-liac-club-platform`

**Created**: 2026-08-29

**Status**: Draft

**Input**: User description: "Construir o LIAC Club: o hub de portfólio digital da LIAC (Liga
Acadêmica de Cosmetologia da UFRJ), onde a liga publica novidades, eventos e artigos
científicos, além de apresentar equipe, projetos e parceiros. Site institucional composto por 9
páginas navegáveis: Home, Sobre a LIAC, Equipe/Membros, Eventos, Artigos Científicos,
Novidades/Notícias, Projetos de Pesquisa, Parceiros/Patrocinadores, Contato."

## Clarifications

### Session 2026-08-29

- Q: A listagem de Novidades precisa de filtro por categoria (como Eventos e Artigos têm), ou
  basta ordenação cronológica simples? → A: Só cronológico — sem filtro por categoria nesta
  fase.
- Q: Quais campos o formulário de Contato deve ter, e ele precisa de um checkbox de
  consentimento LGPD? → A: Nome, E-mail, Telefone, Melhor horário para contato e um campo livre
  "Conte-nos sobre sua necessidade", com botão Enviar. Sem checkbox de consentimento LGPD
  explícito nesta fase. Abaixo do botão, mensagem: "Ao responder o formulário, nossa equipe
  entrará em contato em até 36h para agendar uma reunião diagnóstico. Caso queira entrar em
  contato por outras vias: (telefone), (e-mail)".
- Q: As URLs de detalhe (artigos, eventos, notícias) devem usar slugs legíveis ou ids opacos? →
  A: Slugs legíveis derivados do título (ex: `/artigos/beneficios-colageno`).
- Q: Artigos científicos têm múltiplos autores? E eventos como o Simpósio (que costuma durar
  mais de um dia) precisam de data de início E fim, ou só uma data? → A: Artigos com múltiplos
  autores (lista); eventos com data de início e data de fim, suportando eventos de um único dia
  (início = fim) ou multi-dia.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Publicar e consultar Novidades (Priority: P1)

Um visitante (membro da comunidade acadêmica ou público externo) acessa a listagem de
Novidades/Notícias para acompanhar o que a LIAC está fazendo, e consegue abrir uma notícia
específica para ler o conteúdo completo.

**Why this priority**: É o tipo de conteúdo com maior frequência de atualização e o principal
motivo de retorno recorrente ao site — sem ele, o "hub" não cumpre sua função central de
divulgação contínua.

**Independent Test**: Pode ser testado isoladamente navegando para a listagem de novidades,
verificando que os itens aparecem com data/categoria, e abrindo o detalhe de uma notícia a
partir de um card.

**Acceptance Scenarios**:

1. **Given** a listagem de Novidades, **When** o visitante acessa a página, **Then** vê cards
   com data, categoria, título e resumo de cada novidade, ordenados do mais recente para o mais
   antigo.
2. **Given** um card de novidade na listagem, **When** o visitante clica em "Leia mais" (ou no
   próprio card), **Then** é levado à página de detalhe daquela notícia com o conteúdo completo.
3. **Given** a página de detalhe de uma notícia, **When** o visitante a acessa diretamente por
   URL, **Then** o conteúdo carrega normalmente (rota client-side navegável diretamente).

---

### User Story 2 - Descobrir e consultar Eventos (Priority: P1)

Um visitante consulta a listagem de Eventos para saber o que já aconteceu e o que está por vir
(workshops, palestras, congressos), podendo filtrar entre eventos futuros e passados e abrir o
detalhe de um evento específico.

**Why this priority**: Eventos são a atividade mais visível da liga (ex: Simpósio de
Cosmetologia) e um dos principais motivadores de visita ao site por não-membros.

**Independent Test**: Pode ser testado isoladamente acessando a listagem, aplicando o filtro
futuro/passado e abrindo o detalhe de um evento a partir de um card.

**Acceptance Scenarios**:

1. **Given** a listagem de Eventos, **When** o visitante acessa a página, **Then** vê cards com
   data (início, e fim quando o evento durar mais de um dia), local e tipo do evento (workshop,
   congresso, palestra).
2. **Given** a listagem de Eventos, **When** o visitante aplica o filtro "futuro" ou "passado",
   **Then** somente os eventos correspondentes àquele período são exibidos.
3. **Given** um card de evento, **When** o visitante clica nele, **Then** é levado à página de
   detalhe daquele evento com informações completas.

---

### User Story 3 - Explorar Artigos Científicos (Priority: P1)

Um visitante (membro, pesquisador ou público interessado em ciência cosmética) consulta a
listagem de artigos científicos divulgados pela liga, filtra por tema ou autor, e abre o detalhe
de um artigo para ler o resumo e acessar o link externo do PDF/DOI original.

**Why this priority**: A divulgação científica é um dos três pilares centrais descritos para o
hub (junto com novidades e eventos) e é o que diferencia a LIAC de um site institucional
genérico.

**Independent Test**: Pode ser testado isoladamente acessando a listagem, aplicando um filtro
por tema/autor e abrindo o detalhe de um artigo, verificando a presença do link externo.

**Acceptance Scenarios**:

1. **Given** a listagem de Artigos Científicos, **When** o visitante acessa a página, **Then**
   vê cards com título, um ou mais autores, resumo curto e tags temáticas.
2. **Given** a listagem de Artigos Científicos, **When** o visitante filtra por tema ou autor,
   **Then** somente os artigos correspondentes ao filtro são exibidos.
3. **Given** a página de detalhe de um artigo, **When** o visitante a acessa, **Then** vê o
   abstract completo e um link externo para o PDF ou DOI do artigo original.

---

### User Story 4 - Ponto de entrada e visão geral (Home) (Priority: P1)

Um visitante que chega ao site pela primeira vez entende em segundos o que é a LIAC, vê
destaques recentes de cada tipo de conteúdo (novidade, evento, artigo) e encontra um caminho
claro para se envolver (virar membro ou entrar em contato).

**Why this priority**: É o ponto de entrada de praticamente todo o tráfego do site; sem uma Home
funcional, nenhuma outra página é descoberta organicamente.

**Independent Test**: Pode ser testado isoladamente acessando a rota raiz e verificando a
presença do hero, dos destaques (3 itens de cada tipo de conteúdo), das métricas e do CTA.

**Acceptance Scenarios**:

1. **Given** a Home, **When** o visitante a acessa, **Then** vê um hero com a proposta de valor
   da LIAC e um CTA primário ("Seja Membro" ou "Fale Conosco").
2. **Given** a Home, **When** o visitante rola a página, **Then** vê os 3 itens mais recentes de
   cada tipo de conteúdo (novidade, evento, artigo), cada um levando à respectiva página de
   detalhe.
3. **Given** a Home, **When** o visitante rola até a seção de métricas, **Then** vê números de
   destaque da liga (ex: anos de atividade, membros ativos, eventos realizados, artigos
   publicados).

---

### User Story 5 - Conhecer a Equipe (Priority: P2)

Um visitante consulta a página de Equipe/Membros para ver quem compõe a liga, agrupado por
diretoria/área, com nome, cargo e links sociais de cada membro.

**Why this priority**: Reforça a credibilidade institucional e é frequentemente consultada por
candidatos a processos seletivos e parceiros, mas não bloqueia o valor central de publicação de
conteúdo.

**Independent Test**: Pode ser testado isoladamente acessando a página de equipe e verificando o
agrupamento por diretoria/área e a presença de nome, cargo e links sociais em cada card.

**Acceptance Scenarios**:

1. **Given** a página de Equipe, **When** o visitante a acessa, **Then** vê os membros
   agrupados por diretoria ou área.
2. **Given** um card de membro, **When** o visitante o observa, **Then** vê foto (placeholder),
   nome, cargo/função e ícones de links sociais.

---

### User Story 6 - Conhecer Projetos de Pesquisa (Priority: P2)

Um visitante consulta a página de Projetos de Pesquisa para ver quais projetos a liga conduz ou
já concluiu, com status, resumo e membros envolvidos.

**Why this priority**: Complementa a prova de valor científico da liga, mas é conteúdo de
consulta menos frequente que novidades/eventos/artigos.

**Independent Test**: Pode ser testado isoladamente acessando a página e verificando a presença
de status (ativo/concluído), resumo e membros envolvidos em cada card.

**Acceptance Scenarios**:

1. **Given** a página de Projetos de Pesquisa, **When** o visitante a acessa, **Then** vê um
   grid de projetos com título, status (ativo ou concluído), resumo e membros envolvidos.

---

### User Story 7 - Consultar Parceiros/Patrocinadores (Priority: P2)

Um visitante (potencial parceiro, patrocinador ou membro) consulta a página de
Parceiros/Patrocinadores para ver quem apoia a liga, podendo acessar o site externo de cada
parceiro.

**Why this priority**: Importante para credibilidade e para atrair novos parceiros, mas é uma
página de consulta pontual, não um destino de retorno recorrente.

**Independent Test**: Pode ser testado isoladamente acessando a página e clicando no logo de um
parceiro, verificando que abre o link externo correspondente.

**Acceptance Scenarios**:

1. **Given** a página de Parceiros, **When** o visitante a acessa, **Then** vê os logos
   organizados (por nível de parceria, se aplicável).
2. **Given** um logo de parceiro, **When** o visitante clica nele, **Then** é levado ao site
   externo daquele parceiro em uma nova aba.

---

### User Story 8 - Entender a LIAC (Sobre) (Priority: P3)

Um visitante consulta a página "Sobre a LIAC" para entender a missão, história e vínculo da liga
com a UFRJ.

**Why this priority**: Conteúdo institucional de apoio; reforça confiança, mas não é o motivo
principal de visita ao site.

**Independent Test**: Pode ser testado isoladamente acessando a página e verificando a presença
de missão, história e menção ao vínculo institucional com a UFRJ.

**Acceptance Scenarios**:

1. **Given** a página Sobre a LIAC, **When** o visitante a acessa, **Then** vê a missão, a
   história da liga e uma seção explicando o vínculo com a UFRJ (incluindo o selo de afiliação
   institucional).

---

### User Story 9 - Entrar em contato (Priority: P3)

Um visitante interessado em se tornar membro, propor parceria ou tirar dúvidas preenche o
formulário de contato ou usa os canais informados (redes sociais, e-mail).

**Why this priority**: É um destino de conversão importante, mas depende de um backend real para
funcionar de ponta a ponta (fora de escopo deste repositório) — nesta fase entrega apenas a
interface.

**Independent Test**: Pode ser testado isoladamente preenchendo o formulário e verificando que a
submissão aciona a camada de serviço abstrata (mock) e exibe feedback de sucesso ao usuário, sem
qualquer chamada de rede real.

**Acceptance Scenarios**:

1. **Given** a página de Contato, **When** o visitante preenche Nome, E-mail, Telefone, Melhor
   horário para contato e "Conte-nos sobre sua necessidade" com dados válidos e envia, **Then**
   vê, abaixo do botão Enviar, a mensagem "Ao responder o formulário, nossa equipe entrará em
   contato em até 36h para agendar uma reunião diagnóstico. Caso queira entrar em contato por
   outras vias: (telefone), (e-mail)" (simulada pela camada mock).
2. **Given** a página de Contato, **When** o visitante tenta enviar o formulário com campos
   obrigatórios vazios ou inválidos (ex: e-mail ou telefone em formato inválido), **Then** vê
   mensagens de validação indicando o que precisa ser corrigido, sem que a submissão seja
   processada.
3. **Given** a página de Contato, **When** o visitante a acessa, **Then** vê informações
   institucionais (endereço/vínculo UFRJ), redes sociais e um mapa/localização placeholder.

---

### Edge Cases

- O que acontece quando uma listagem (Novidades, Eventos, Artigos, Projetos, Parceiros) não tem
  nenhum item cadastrado? O sistema deve exibir um estado vazio claro, não uma tela em branco ou
  erro.
- O que acontece quando o usuário acessa diretamente a URL de detalhe de um item que não existe
  (ex: `/artigos/id-invalido`)? O sistema deve exibir uma página de "não encontrado" com um
  caminho de volta à listagem.
- Como o sistema se comporta enquanto os dados mockados ainda estão "carregando" (latência
  simulada)? Deve exibir um estado de carregamento (skeleton/spinner), não conteúdo vazio.
- Como o filtro de Eventos (futuro/passado) e os filtros de Artigos (tema/autor) se comportam
  quando nenhum resultado corresponde ao filtro aplicado? Deve exibir um estado vazio específico
  ("nenhum resultado para este filtro"), distinto do estado vazio de "nenhum item cadastrado".
- Como o layout se comporta em telas muito estreitas (mobile) e muito largas (desktop grande),
  para grids de 3 colunas e para a navbar?
- O que acontece se um membro da equipe não tiver foto cadastrada? Deve exibir um placeholder
  consistente (avatar genérico), nunca um ícone quebrado.
- Quando um evento ocorre em um único dia, a data de início e a data de fim coincidem — a
  exibição deve mostrar apenas uma data, não uma faixa redundante ("29/08 – 29/08").
- O que acontece quando dois itens diferentes (ex: dois artigos) gerariam o mesmo slug a partir
  do título? O sistema deve garantir unicidade do slug (ex: sufixo numérico) na camada de dados.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE expor 9 páginas navegáveis via rotas client-side: Home, Sobre a
  LIAC, Equipe/Membros, Eventos (listagem + detalhe), Artigos Científicos (listagem + detalhe),
  Novidades/Notícias (listagem + detalhe), Projetos de Pesquisa, Parceiros/Patrocinadores e
  Contato.
- **FR-002**: A Home DEVE exibir um hero com proposta de valor e CTA primário, os 3 itens mais
  recentes de cada tipo de conteúdo (novidade, evento, artigo) e uma seção de métricas de
  destaque.
- **FR-003**: As listagens de Eventos e Artigos Científicos DEVEM suportar filtragem (Eventos:
  futuro/passado; Artigos: tema e/ou autor) sem recarregar a página. A listagem de Novidades NÃO
  possui filtro nesta fase — exibição estritamente cronológica (mais recente primeiro).
- **FR-004**: Cada item de Novidade, Evento e Artigo Científico DEVE ter uma página de detalhe
  acessível a partir do card correspondente e diretamente por URL, usando um slug legível
  derivado do título (ex: `/artigos/beneficios-colageno`) como identificador na rota.
- **FR-005**: A página de Artigos Científicos (detalhe) DEVE exibir todos os autores do artigo
  (um ou mais) e um link externo para o PDF/DOI original do artigo.
- **FR-006**: A página de Equipe DEVE agrupar membros por diretoria/área e exibir foto
  (placeholder), nome, cargo/função e links sociais por membro.
- **FR-007**: A página de Projetos de Pesquisa DEVE exibir status (ativo/concluído), resumo e
  membros envolvidos por projeto.
- **FR-008**: A página de Parceiros DEVE exibir logos com link externo para o site de cada
  parceiro, categorizados por nível de parceria quando aplicável.
- **FR-009**: A página de Contato DEVE apresentar um formulário com os campos Nome, E-mail,
  Telefone, Melhor horário para contato e "Conte-nos sobre sua necessidade" (texto livre), cuja
  submissão é tratada exclusivamente pela camada de serviço abstrata (mock), sem qualquer
  chamada de rede real. Após o envio bem-sucedido, o sistema DEVE exibir, abaixo do botão
  Enviar, a mensagem de confirmação com o prazo de retorno (36h) e os canais alternativos de
  contato (telefone, e-mail). O sistema DEVE também exibir mensagens de validação por campo
  quando dados obrigatórios estiverem ausentes ou em formato inválido.
- **FR-010**: Todos os dados de conteúdo (novidades, eventos, artigos, projetos, membros,
  parceiros) DEVEM ser fornecidos por uma camada de abstração de dados substituível, e não
  embutidos diretamente nos componentes de página.
- **FR-011**: O sistema DEVE exibir um estado de carregamento durante a busca de dados mockados
  e um estado vazio claro quando uma listagem não retornar itens.
- **FR-012**: O sistema DEVE exibir uma página de "não encontrado" para rotas de detalhe cujo
  identificador não corresponda a nenhum item existente.
- **FR-013**: A navegação (navbar) DEVE dar acesso a todas as 9 páginas e permanecer utilizável
  em telas mobile (menu responsivo).
- **FR-014**: Todas as páginas DEVEM ser responsivas, com grids de 3 colunas colapsando para 1
  coluna em telas mobile.
- **FR-015**: A identidade visual (cores, tipografia) aplicada em todas as páginas DEVE seguir os
  design tokens definidos para a marca LIAC.

### Key Entities

- **NewsItem**: Uma novidade/notícia publicada pela liga — slug (identificador legível na URL),
  título, data, categoria, resumo, conteúdo completo, imagem de capa.
- **Event**: Um evento (workshop, congresso ou palestra) — slug, título, data de início, data de
  fim (igual à de início quando o evento dura um único dia), local, tipo, descrição, indicação
  de futuro/passado.
- **ScientificArticle**: Um artigo científico divulgado pela liga — slug, título, um ou mais
  autores, resumo (abstract), tags temáticas, link externo para PDF/DOI.
- **ResearchProject**: Um projeto de pesquisa conduzido pela liga — título, status
  (ativo/concluído), resumo, membros envolvidos.
- **TeamMember**: Um membro da liga — nome, cargo/função, diretoria/área, foto, links sociais.
- **Partner**: Um parceiro ou patrocinador — nome, logo, link externo, nível de parceria
  (opcional).
- **ContactFormPayload**: Os dados submetidos pelo visitante através do formulário de contato —
  nome, e-mail, telefone, melhor horário para contato, mensagem ("conte-nos sobre sua
  necessidade").

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um visitante consegue localizar e abrir o detalhe de qualquer novidade, evento ou
  artigo em até 3 cliques a partir da Home.
- **SC-002**: Todas as 9 páginas carregam e permanecem plenamente utilizáveis em viewports de
  360px (mobile) a 1920px (desktop) de largura, sem rolagem horizontal e sem sobreposição de
  elementos.
- **SC-003**: 100% dos textos de corpo e cabeçalhos do site atendem contraste mínimo AA (WCAG)
  contra seu respectivo fundo.
- **SC-004**: Um visitante consegue filtrar a listagem de Eventos por período (futuro/passado) e
  ver o resultado atualizado em menos de 1 segundo (sem chamada de rede real).
- **SC-005**: Um visitante consegue completar e submeter o formulário de Contato, recebendo
  confirmação visual, em menos de 1 minuto, sem sair da página.
- **SC-006**: Nenhuma página resulta em tela em branco ou erro não tratado quando a fonte de
  dados mockada retorna uma lista vazia.

## Assumptions

- O conteúdo real (textos, imagens, dados de membros/eventos/artigos/parceiros) ainda não existe
  em formato estruturado; a especificação assume que fixtures de exemplo (dados fictícios
  plausíveis) serão usadas até que o backend real e o conteúdo oficial existam.
- "Seja Membro" é tratado, nesta fase, como um CTA que direciona para a página de Contato (não
  existe fluxo de inscrição/associação com autenticação real neste repositório).
- O mapa de localização na página de Contato é um placeholder visual (imagem estática ou
  componente sem integração real com serviço de mapas), já que integrações externas reais estão
  fora de escopo.
- A ordenação padrão de listagens (Novidades, Eventos) é da mais recente para a mais antiga,
  salvo filtro aplicado pelo usuário.
- Parceiros sem nível de parceria definido são exibidos em um grupo único, sem categorização.
- O idioma de todo o conteúdo e da interface é português brasileiro.
