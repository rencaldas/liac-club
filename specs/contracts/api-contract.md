# Contrato de API — LIAC Club (backend futuro)

Este documento é a especificação que o backend do LIAC Club (construído em repositório separado)
deve implementar. `MockApiClient` (`src/services/mock/MockApiClient.ts`) implementa o mesmo
contrato lendo fixtures locais, para que a troca da implementação injetada — sem tocar
componentes — seja possível assim que o backend existir (Constitution Princípios I e IV).

Este arquivo vive em `specs/contracts/` (não em `specs/001-liac-club-platform/contracts/`)
porque é um artefato de projeto, não de uma feature específica — todo novo trabalho no frontend
deve continuar respeitando este mesmo contrato.

## Convenções gerais

- Base path: `/api/v1`
- Formato: JSON (`Content-Type: application/json`)
- Paginação: query params `?page=<n>&pageSize=<n>` (padrão `page=1`, `pageSize=12`); resposta de
  listagem sempre no formato `{ items: T[], page: number, pageSize: number, total: number }`
- Erros: `{ error: { code: string, message: string } }` com status HTTP apropriado
  (`404` para item não encontrado, `422` para validação, `500` para erro inesperado)
- Datas: ISO 8601 (`YYYY-MM-DD`)

## Autenticação (equipe LIAC)

| Método | Rota | Descrição | Body / Headers |
|--------|------|-----------|-----------------|
| POST | `/auth/login` | Autentica um membro da equipe | Body: `{ email, password }` |
| POST | `/auth/logout` | Encerra a sessão | Header: `Authorization: Bearer <token>` |

**Response de `/auth/login` (200)**: `{ token: string, role: "director" | "member", displayName:
string }`. **Response (401)**: `{ error: { code: "INVALID_CREDENTIALS", message: string } }` —
mensagem genérica, sem indicar se o problema foi o e-mail ou a senha (spec US1, Acceptance
Scenario 3).

Toda rota abaixo marcada **[autenticado]** exige o header `Authorization: Bearer <token>`;
resposta `401` se ausente/inválido. Toda rota marcada **[director]** exige adicionalmente que o
token pertença a um usuário com `role: "director"`; resposta `403` caso contrário.

## Endpoints

### Novidades

| Método | Rota | Descrição | Query params / Body |
|--------|------|-----------|-----------------------|
| GET | `/news` | Lista novidades, mais recente primeiro (ou por `featured` — ver nota) | `page`, `pageSize` |
| GET | `/news/:slug` | Detalhe de uma novidade | — |
| POST | `/news` **[autenticado]** | Cria uma novidade | Body: `NewsItem` sem `slug` (gerado/validado pelo backend) |
| PUT | `/news/:slug` **[autenticado]** | Edita uma novidade (inclui `featured`) | Body: `Partial<NewsItem>` |
| DELETE | `/news/:slug` **[autenticado]** | Exclui uma novidade | — |

**Response item (NewsItem)**: `slug, title, publishedAt, category, summary, content,
coverImageUrl?, featured`

**Nota sobre `featured`**: a Home consome os itens com `featured: true` para o carrossel de
destaques; quando nenhum item de um tipo estiver marcado, o frontend usa os mais recentes (mesmo
contrato de listagem — não é um endpoint separado).

### Eventos

| Método | Rota | Descrição | Query params / Body |
|--------|------|-----------|-----------------------|
| GET | `/events` | Lista eventos | `page`, `pageSize`, `when=upcoming\|past` |
| GET | `/events/:slug` | Detalhe de um evento | — |
| POST | `/events` **[autenticado]** | Cria um evento | Body: `Event` sem `slug` |
| PUT | `/events/:slug` **[autenticado]** | Edita um evento (inclui `featured`) | Body: `Partial<Event>` |
| DELETE | `/events/:slug` **[autenticado]** | Exclui um evento | — |

**Response item (Event)**: `slug, title, startDate, endDate, location, type, description,
featured`

### Artigos Científicos

| Método | Rota | Descrição | Query params / Body |
|--------|------|-----------|-----------------------|
| GET | `/articles` | Lista artigos | `page`, `pageSize`, `tag`, `author` |
| GET | `/articles/:slug` | Detalhe de um artigo | — |
| POST | `/articles` **[autenticado]** | Cria um artigo | Body: `ScientificArticle` sem `slug` |
| PUT | `/articles/:slug` **[autenticado]** | Edita um artigo (inclui `featured`) | Body: `Partial<ScientificArticle>` |
| DELETE | `/articles/:slug` **[autenticado]** | Exclui um artigo | — |

**Response item (ScientificArticle)**: `slug, title, authors[], abstract, tags[], externalUrl,
featured`

### Projetos de Pesquisa

| Método | Rota | Descrição | Query params / Body |
|--------|------|-----------|-----------------------|
| GET | `/projects` | Lista projetos | `page`, `pageSize`, `status=ativo\|concluído` |
| POST | `/projects` **[autenticado]** | Cria um projeto | Body: `ResearchProject` sem `id` |
| PUT | `/projects/:id` **[autenticado]** | Edita um projeto | Body: `Partial<ResearchProject>` |
| DELETE | `/projects/:id` **[autenticado]** | Exclui um projeto | — |

**Response item (ResearchProject)**: `id, title, status, summary, members[]`

### Equipe

| Método | Rota | Descrição | Query params / Body |
|--------|------|-----------|-----------------------|
| GET | `/team` | Lista membros da equipe | `area` |
| POST | `/team` **[autenticado]** | Cria um membro | Body: `TeamMember` sem `id` |
| PUT | `/team/:id` **[autenticado]** | Edita um membro | Body: `Partial<TeamMember>` |
| DELETE | `/team/:id` **[autenticado]** | Exclui um membro | — |

**Response item (TeamMember)**: `id, name, role, area, photoUrl?, socialLinks[]`

### Parceiros

| Método | Rota | Descrição | Query params / Body |
|--------|------|-----------|-----------------------|
| GET | `/partners` | Lista parceiros | `tier` |
| POST | `/partners` **[autenticado]** | Cria um parceiro | Body: `Partner` sem `id` |
| PUT | `/partners/:id` **[autenticado]** | Edita um parceiro | Body: `Partial<Partner>` |
| DELETE | `/partners/:id` **[autenticado]** | Exclui um parceiro | — |

**Response item (Partner)**: `id, name, logoUrl, externalUrl, tier?`

### Histórico de Alterações

| Método | Rota | Descrição | Query params |
|--------|------|-----------|---------------|
| GET | `/audit-log` **[director]** | Lista entradas de auditoria, mais recente primeiro | `page`, `pageSize`, `author` |

**Response item (AuditLogEntry)**: `id, author, timestamp, action, entityType, entityLabel`.
Gerada automaticamente pelo backend a cada escrita bem-sucedida nos endpoints acima — não existe
um endpoint de escrita direto para `/audit-log` (ver `data-model.md` desta feature).

### Contato

| Método | Rota | Descrição | Body |
|--------|------|-----------|------|
| POST | `/contact` | Submete o formulário de contato | `ContactFormPayload` |

**Request body (ContactFormPayload)**: `name, email, phone, preferredContactTime, message`

**Response (200)**: `{ status: "received" }` — o backend real decide o que fazer com o payload
(ex: notificação interna); o frontend só precisa do status de sucesso/erro para exibir a
mensagem de confirmação (User Story 9).

**Response (422)**: `{ error: { code: "VALIDATION_ERROR", message: string, fields:
Partial<Record<keyof ContactFormPayload, string>> } }`

## Fora de escopo deste contrato

Upload de arquivos (fotos de equipe, logos de parceiros, capas de novidade continuam sendo
informadas por URL, não por upload), recuperação de senha, 2FA, e qualquer sistema de permissões
além da distinção binária `director`/`member` usada só por `/audit-log` (Constitution —
Não-Objetivos Explícitos).
