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

## Endpoints

### Novidades

| Método | Rota | Descrição | Query params |
|--------|------|-----------|---------------|
| GET | `/news` | Lista novidades, mais recente primeiro | `page`, `pageSize` |
| GET | `/news/:slug` | Detalhe de uma novidade | — |

**Response item (NewsItem)**: `slug, title, publishedAt, category, summary, content,
coverImageUrl?`

### Eventos

| Método | Rota | Descrição | Query params |
|--------|------|-----------|---------------|
| GET | `/events` | Lista eventos | `page`, `pageSize`, `when=upcoming\|past` |
| GET | `/events/:slug` | Detalhe de um evento | — |

**Response item (Event)**: `slug, title, startDate, endDate, location, type, description`

### Artigos Científicos

| Método | Rota | Descrição | Query params |
|--------|------|-----------|---------------|
| GET | `/articles` | Lista artigos | `page`, `pageSize`, `tag`, `author` |
| GET | `/articles/:slug` | Detalhe de um artigo | — |

**Response item (ScientificArticle)**: `slug, title, authors[], abstract, tags[], externalUrl`

### Projetos de Pesquisa

| Método | Rota | Descrição | Query params |
|--------|------|-----------|---------------|
| GET | `/projects` | Lista projetos | `page`, `pageSize`, `status=ativo\|concluído` |

**Response item (ResearchProject)**: `id, title, status, summary, members[]`

### Equipe

| Método | Rota | Descrição | Query params |
|--------|------|-----------|---------------|
| GET | `/team` | Lista membros da equipe | `area` |

**Response item (TeamMember)**: `id, name, role, area, photoUrl?, socialLinks[]`

### Parceiros

| Método | Rota | Descrição | Query params |
|--------|------|-----------|---------------|
| GET | `/partners` | Lista parceiros | `tier` |

**Response item (Partner)**: `id, name, logoUrl, externalUrl, tier?`

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

Autenticação, upload de arquivos, e qualquer endpoint de escrita além de `/contact` estão fora de
escopo enquanto as páginas correspondentes não exigirem (Constitution — Não-Objetivos
Explícitos).
