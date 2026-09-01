# Phase 1 Data Model: LIAC Club — Hub de Portfólio Digital

Todas as entidades abaixo são somente-leitura neste repositório (frontend-only, Constitution
Princípio I). Os tipos TypeScript concretos vivem em `src/types/entities.ts`; este documento é a
especificação de referência para `MockApiClient` e para o contrato REST em
`specs/contracts/api-contract.md`.

## NewsItem

| Campo | Tipo | Obrigatório | Regra |
|-------|------|:-----------:|-------|
| `slug` | `string` | sim | Identificador de URL, único na coleção, autoral (ver `research.md` §7) |
| `title` | `string` | sim | — |
| `publishedAt` | `string` (ISO 8601 date) | sim | Usado para ordenação cronológica (FR-003) |
| `category` | `string` | sim | Texto livre curto (ex: "Divulgação Científica") |
| `summary` | `string` | sim | Exibido no card da listagem |
| `content` | `string` (markdown ou HTML sanitizado) | sim | Exibido na página de detalhe |
| `coverImageUrl` | `string` | não | Ausente → `EmptyState`/placeholder visual, nunca ícone quebrado |

**Relacionamentos**: nenhum. **Estado/lifecycle**: nenhum (não há rascunho/publicado nesta fase
— toda entrada da fixture é considerada publicada).

## Event

| Campo | Tipo | Obrigatório | Regra |
|-------|------|:-----------:|-------|
| `slug` | `string` | sim | Único na coleção |
| `title` | `string` | sim | — |
| `startDate` | `string` (ISO 8601 date) | sim | — |
| `endDate` | `string` (ISO 8601 date) | sim | Igual a `startDate` quando o evento dura um único dia (Edge Case) |
| `location` | `string` | sim | — |
| `type` | `"workshop" \| "congresso" \| "palestra"` | sim | Enum fechado — controla o filtro por tipo se adicionado futuramente |
| `description` | `string` | sim | — |
| `coverImageUrl` | `string` | não | Ausente → card sem imagem |

**Derivado (não persistido)**: `isPast: boolean` = `endDate < hoje`, calculado em runtime para o
filtro futuro/passado (FR-003) — não é um campo de dado, é lógica de apresentação.

## ScientificArticle

| Campo | Tipo | Obrigatório | Regra |
|-------|------|:-----------:|-------|
| `slug` | `string` | sim | Único na coleção |
| `title` | `string` | sim | — |
| `publishedAt` | `string` (ISO 8601 date) | sim | Exibido no card e no detalhe (dd/mm/aaaa); usado para ordenação cronológica |
| `authors` | `string[]` | sim | Um ou mais (Clarifications 2026-08-29) |
| `abstract` | `string` | sim | Exibido na listagem (resumo) e no detalhe |
| `tags` | `string[]` | sim | Usado no filtro por tema (FR-003) |
| `externalUrl` | `string` (URL) | sim | Link para PDF/DOI original (FR-005) |

**Relacionamentos**: nenhum.

## ResearchProject

| Campo | Tipo | Obrigatório | Regra |
|-------|------|:-----------:|-------|
| `id` | `string` | sim | Sem página de detalhe própria — não precisa ser um slug de URL, apenas chave estável para `key` de lista |
| `title` | `string` | sim | — |
| `status` | `"ativo" \| "concluído"` | sim | Enum fechado (FR-007) |
| `summary` | `string` | sim | — |
| `members` | `string[]` | sim | Nomes de exibição (texto livre) — não referencia `TeamMember.id`; um projeto pode envolver orientadores/colaboradores externos que não são membros atuais da liga |

## TeamMember

| Campo | Tipo | Obrigatório | Regra |
|-------|------|:-----------:|-------|
| `id` | `string` | sim | — |
| `name` | `string` | sim | — |
| `role` | `string` | sim | Cargo/função (ex: "Diretora de Marketing") |
| `area` | `string` | sim | Diretoria/área usada para agrupamento (FR-006) |
| `photoUrl` | `string` | não | Ausente → avatar placeholder consistente (Edge Case) |
| `socialLinks` | `{ platform: "instagram" \| "linkedin"; url: string }[]` | não | Array vazio permitido |

## Partner

| Campo | Tipo | Obrigatório | Regra |
|-------|------|:-----------:|-------|
| `id` | `string` | sim | — |
| `name` | `string` | sim | — |
| `logoUrl` | `string` | sim | — |
| `externalUrl` | `string` (URL) | sim | Abre em nova aba (FR-008) |
| `tier` | `string` | não | Nível de parceria; ausente → agrupado em categoria única "Parceiros" (Assumption) |

## ContactFormPayload

| Campo | Tipo | Obrigatório | Regra |
|-------|------|:-----------:|-------|
| `name` | `string` | sim | Não vazio |
| `email` | `string` | sim | Formato de e-mail válido |
| `phone` | `string` | sim | Formato de telefone BR válido (aceita `(21) 91234-5678` e variações com/sem máscara) |
| `preferredContactTime` | `string` | sim | Texto livre curto (ex: "Manhã", "14h-17h") |
| `message` | `string` | sim | "Conte-nos sobre sua necessidade" — não vazio |

**Validação** (`validateContactForm`, ver `research.md` §6): todos os campos são obrigatórios;
`email` e `phone` têm validação de formato; demais campos apenas checam não-vazio. Erros são
retornados por campo (`Partial<Record<keyof ContactFormPayload, string>>`) para exibição inline
(User Story 9, Acceptance Scenario 2).

## Relações entre entidades

Nenhuma entidade referencia outra por chave estrangeira nesta fase — todas as 7 coleções são
independentes. Isso é intencional: a fonte de dados real (backend futuro) pode introduzir
relações (ex: `ResearchProject.members` apontando para `TeamMember.id`), mas antecipar essa
modelagem agora seria especular sobre um contrato que ainda não existe.
