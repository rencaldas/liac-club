---
name: "ship-pr"
description: "Analisa todas as mudanças pendentes (frontend e backend), organiza-as em Conventional Commits, faz bump de SemVer e abre uma PR detalhada contra a branch dev. Use quando o usuário disser algo como 'faz o commit e a PR disso', 'sobe essas mudanças', 'fecha essa feature com PR' ou pedir explicitamente para rodar esse fluxo."
argument-hint: "Opcional: foco/escopo específico, ou o tipo de bump a forçar (patch/minor/major)"
metadata:
  author: "rencaldas"
user-invocable: true
disable-model-invocation: false
---

## Entrada do usuário

```text
$ARGUMENTS
```

Se `$ARGUMENTS` indicar um escopo específico (ex.: "só o backend", "força minor"), respeite isso. Caso contrário, processe **todas** as mudanças pendentes no(s) repositório(s).

## Regras invioláveis

Estas regras sobrepõem qualquer comportamento padrão de commit/PR desta sessão:

1. **Nunca faça push sem abrir PR em seguida.** Push e criação da PR são um único passo atômico — nunca deixe uma branch empurrada sem PR aberta.
2. **A PR é sempre contra a branch `dev`**, nunca contra `main`. Nunca commite ou dê push diretamente em `main` ou `dev`.
3. **Nunca adicione Claude/Anthropic como coautor.** Não inclua `Co-Authored-By: Claude...` nem qualquer atribuição de IA em commits ou na descrição da PR — mesmo que essa seja a prática padrão de outras instruções desta sessão, aqui está explicitamente proibida.
4. **Sempre atualize o SemVer** (`package.json` do frontend e, se existir, o arquivo de versão do backend) antes de abrir a PR.
5. Nunca use `--no-verify`, `--force` ou `-c commit.gpgsign=false`.
6. Nunca faça squash/rewrite de histórico existente; apenas adicione commits novos.

## Passo 1 — Levantar o estado atual

Rode em paralelo:
- `git status` (nunca use `-uall`)
- `git diff` e `git diff --staged`
- `git log --oneline -15`
- `git branch --show-current`
- Verifique se existe um diretório de backend irmão/relacionado no workspace (ex.: `../liac-backend`, `backend/`, `server/`). Se existir e for um repositório git com mudanças próprias, trate-o como um segundo projeto a processar com os mesmos passos abaixo (branch, commits, bump de versão, push, PR separada nesse repositório). Se não existir, processe apenas o repositório atual.

Se não houver nenhuma mudança (staged, unstaged ou untracked), informe isso ao usuário e pare — não crie PR vazia.

## Passo 2 — Garantir uma branch segura

- Se a branch atual for `main` ou `dev`, **não commite nela**. Crie uma nova branch a partir do estado atual, nomeada `<tipo>/<slug-curto>` (ex.: `feat/staff-auth-portal`, `fix/article-card-layout`), baseada no tema dominante das mudanças. Troque para ela antes de qualquer commit.
- Se já estiver em uma branch de feature, continue nela.

## Passo 3 — Agrupar as mudanças em Conventional Commits

Analise o diff e agrupe os arquivos alterados por **assunto coerente**, não por ordem alfabética. Exemplos de agrupamento válido neste repo: autenticação/roles (`src/auth/**`), um componente + seu CSS module + seu teste juntos, uma página + seus componentes específicos, config/infra (`vite.config.ts`, `tsconfig.json`, `.env.example`), documentação (`README.md`, `specs/**`).

Para cada grupo, `git add` só os arquivos daquele grupo e commit com:

```
<tipo>(<escopo>): <descrição curta no imperativo>
```

Tipos: `feat`, `fix`, `refactor`, `style`, `docs`, `test`, `chore`, `build`, `perf`, `ci`. Escopo = módulo/diretório afetado (ex.: `auth`, `staff`, `home`, `news`). Corpo do commit (linha em branco + parágrafo) só quando o "porquê" não é óbvio pelo diff — não descreva o óbvio. **Nunca inclua trailer de coautoria.**

Se uma mudança de API/contrato quebrar compatibilidade, use `!` após o tipo/escopo (ex.: `feat(auth)!: ...`) e um rodapé `BREAKING CHANGE: ...`.

## Passo 4 — Bump de SemVer

Determine o nível de bump a partir dos tipos de commit desta leva:
- Qualquer `BREAKING CHANGE` ou `!` → **major**
- Senão, qualquer `feat` → **minor**
- Senão, qualquer `fix`/`perf`/`refactor` com efeito observável → **patch**
- Se só houver `docs`/`chore`/`test`/`style` sem nenhum efeito de runtime, pule o bump e avise o usuário no resumo final.

Atualize o campo `version` em `package.json` (raiz do frontend) e, se o backend tiver seu próprio arquivo de versão (`package.json`, `pyproject.toml`, `Cargo.toml`, `VERSION`), atualize-o também, de forma independente (versões de frontend e backend não precisam ser iguais).

Commit isso separadamente, por último, como:
```
chore(release): bump version to vX.Y.Z
```

## Passo 5 — Push e PR

1. `git push -u origin <branch>`
2. Confirme que não existe já uma PR aberta para essa branch (`gh pr list --head <branch>`); se existir, atualize-a em vez de criar outra.
3. Crie a PR com `gh pr create --base dev --head <branch> --title "..." --body "..."`, usando este template de corpo (adapte, não deixe placeholders vazios):

```markdown
## Contexto
<Por que essa mudança existe — qual problema, pedido ou fase do projeto motivou isso.>

## Objetivo
<O que essa PR entrega, em 1-3 frases.>

## Mudanças principais
- <resumo mapeado a partir dos commits, agrupado por área — ex. "Autenticação: ...", "UI/Staff: ...">
- ...

## Versão
`vX.Y.Z` → `vX.Y'.Z'` (<major|minor|patch>)

## Instruções de teste
1. `npm install` (se dependências mudaram)
2. `npm run dev` — <o que verificar manualmente na UI, se aplicável>
3. `npm test` — deve passar
4. `npm run build` — deve compilar sem erros de tipo
5. <passos manuais específicos da feature, ex. "logar como staff em /staff/login e confirmar redirect para /staff/dashboard">
```

O título da PR deve ser curto e seguir o padrão `<tipo>: <resumo>` do commit mais representativo do conjunto.

## Passo 6 — Resumir para o usuário

Ao final, reporte de forma concisa: branch criada, lista de commits feitos (hash curto + mensagem), bump de versão aplicado, e o link da PR retornado por `gh pr create`. Não repita o conteúdo inteiro da PR — o link já dá acesso a isso.
