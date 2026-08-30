# Phase 1 Data Model: Área da Equipe LIAC

Este documento cobre apenas o que é **novo ou alterado** em relação a
`specs/001-liac-club-platform/data-model.md`. As 6 entidades de conteúdo mantêm todos os campos
já documentados lá; aqui só listamos as adições.

## Alterações em entidades existentes

### NewsItem, Event, ScientificArticle — novo campo

| Campo | Tipo | Obrigatório | Regra |
|-------|------|:-----------:|-------|
| `featured` | `boolean` | sim (default `false`) | Controla a aparição no carrossel de destaques da Home (FR-007/008) |

### Todas as 6 entidades de conteúdo (NewsItem, Event, ScientificArticle, ResearchProject,
TeamMember, Partner)

Ganham operações de escrita via `ApiClient`: `create`, `update`, `delete` — nenhum novo campo de
dado, apenas novas capacidades na interface de serviço (ver `specs/contracts/api-contract.md`).

## Novas entidades

### StaffCredentials

| Campo | Tipo | Obrigatório | Regra |
|-------|------|:-----------:|-------|
| `email` | `string` | sim | Enviado a `ApiClient.login()`; nunca armazenado após o envio |
| `password` | `string` | sim | Idem — nunca armazenado, nunca logado/exibido |

### AuthSession (retorno de `login()`, guardado via `AuthContext`)

| Campo | Tipo | Obrigatório | Regra |
|-------|------|:-----------:|-------|
| `token` | `string` | sim | Opaco — o frontend não interpreta seu conteúdo |
| `role` | `"director" \| "member"` | sim | Único dado do token que o frontend efetivamente lê, para FR-013 |
| `displayName` | `string` | sim | Exibido no `StaffLayout` e usado como autor nas entradas de auditoria |

**Persistência**: serializado em `localStorage` sob uma chave própria (ex: `liac_staff_session`);
é a única exceção à regra "sem dados de conteúdo em `localStorage`" (FR-005 vs FR-009 — sessão
não é conteúdo).

### AuditLogEntry

| Campo | Tipo | Obrigatório | Regra |
|-------|------|:-----------:|-------|
| `id` | `string` | sim | Identificador único da entrada (gerado pelo mock) |
| `author` | `string` | sim | `AuthSession.displayName` de quem realizou a ação |
| `timestamp` | `string` (ISO 8601 datetime) | sim | Momento da ação |
| `action` | `"create" \| "update" \| "delete" \| "feature" \| "unfeature"` | sim | Tipo de operação |
| `entityType` | `"news" \| "event" \| "article" \| "project" \| "team" \| "partner"` | sim | Tipo de conteúdo afetado |
| `entityLabel` | `string` | sim | Título/nome do item afetado, para exibição legível no histórico |

**Ciclo de vida**: append-only em memória (`auditLog.ts`), nunca editado ou removido pela UI —
mesmo excluir o item de conteúdo original não remove suas entradas passadas do histórico
(rastro de auditoria preservado).

## Relações

`AuditLogEntry` referencia (por `entityType` + `entityLabel`, não por ID estrangeiro rígido) um
item de uma das 6 coleções de conteúdo — a referência é por rótulo, não por chave estrangeira,
porque uma entrada de auditoria de `delete` precisa continuar legível mesmo depois que o item
correspondente deixou de existir na coleção.
