# Quickstart: LIAC Club — Hub de Portfólio Digital

Guia de validação end-to-end desta feature. Não repete o `data-model.md` nem o
`specs/contracts/api-contract.md` — referencia-os quando necessário.

## Pré-requisitos

- Node.js 20+
- Repositório em `c:\Progamer\Projetos\liac-ufrj`, na raiz (não em subpasta)

## Setup

```bash
npm install
npm run dev
```

Abre a SPA em `http://localhost:5173` (porta padrão do Vite), com `MockApiClient` como única
implementação de `ApiClient` — nenhuma chamada de rede real ocorre (verificável na aba Network do
devtools: nenhuma requisição além dos assets estáticos do próprio Vite).

## Cenários de validação (mapeados às User Stories do spec.md)

1. **Home (US4)** — acessar `/`; confirmar hero + CTA, 3 destaques de cada tipo de conteúdo,
   seção de métricas.
2. **Novidades (US1)** — acessar `/novidades`; confirmar ordenação cronológica (sem filtro);
   abrir um card e confirmar navegação para `/novidades/:slug` com conteúdo completo; acessar um
   slug inválido (ex: `/novidades/nao-existe`) e confirmar página "não encontrado".
3. **Eventos (US2)** — acessar `/eventos`; alternar filtro futuro/passado; abrir um evento
   multi-dia e confirmar exibição de intervalo de datas; abrir um evento de um único dia e
   confirmar que só uma data aparece (não um intervalo redundante).
4. **Artigos (US3)** — acessar `/artigos`; filtrar por tema e por autor; abrir o detalhe de um
   artigo com múltiplos autores e confirmar que todos aparecem, além do link externo para
   PDF/DOI.
5. **Equipe (US5)** — acessar `/equipe`; confirmar agrupamento por diretoria/área; conferir
   avatar placeholder em um membro sem foto.
6. **Projetos (US6)** — acessar `/projetos`; confirmar status (ativo/concluído), resumo e
   membros por card.
7. **Parceiros (US7)** — acessar `/parceiros`; clicar em um logo e confirmar abertura em nova
   aba do `externalUrl`.
8. **Sobre (US8)** — acessar `/sobre`; confirmar missão, história e selo de afiliação UFRJ.
9. **Contato (US9)** — acessar `/contato`; submeter com campo obrigatório vazio e confirmar
   mensagens de validação inline; preencher todos os campos corretamente e confirmar a mensagem
   de confirmação (36h + canais alternativos) abaixo do botão Enviar.
10. **Estado vazio** — temporariamente esvaziar uma fixture (ex: `src/mocks/news.json` → `[]`) e
    confirmar que a listagem correspondente mostra um `EmptyState`, não uma tela em branco.

## Testes automatizados

```bash
npm run test
```

Deve rodar sem falhas (Constitution — "Stack e Qualidade"). Cobre, no mínimo: um teste por
componente de card (`content/*Card.test.tsx`), um teste por listagem confirmando os estados
loading/empty/success, e um teste do `ContactForm` cobrindo validação e submissão bem-sucedida.

## Verificação de responsividade e contraste (SC-002, SC-003)

- DevTools em modo responsivo: 360px, 768px, 1920px — sem rolagem horizontal, grids de 3 colunas
  colapsando para 1 coluna em mobile.
- Extensão de contraste (ex: axe DevTools) rodada em pelo menos: Home (hero sobre gradiente),
  qualquer card de conteúdo, e o formulário de Contato.
