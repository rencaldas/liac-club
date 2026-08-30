# LIAC Club

Hub de portfólio digital da LIAC (Liga Acadêmica de Cosmetologia da UFRJ) — divulgação de
novidades, eventos e artigos científicos, além de apresentar equipe, projetos de pesquisa e
parceiros.

**Este repositório é 100% frontend.** Nenhuma requisição de rede real, nenhum banco de dados,
nenhuma autenticação real acontece aqui — toda leitura de dados passa por uma camada de
abstração (`ApiClient`) cuja única implementação é mockada, lendo fixtures JSON locais. Veja
`.specify/memory/constitution.md` para os princípios completos do projeto.

## Setup

Requer Node.js 20+.

```bash
npm install
npm run dev       # inicia o servidor de desenvolvimento em http://localhost:5173
```

Outros scripts:

```bash
npm run build      # type-check + build de produção em dist/
npm run preview    # serve o build de produção localmente
npm run test        # roda a suíte de testes (Vitest) uma vez
npm run test:watch  # roda a suíte em modo watch
npm run lint         # ESLint
```

## Estrutura de pastas

```text
src/
├── main.tsx / App.tsx      # bootstrap da aplicação
├── router.tsx                # todas as rotas (createBrowserRouter)
├── styles/tokens.css         # paleta de cores e tipografia da marca LIAC (fonte da verdade)
├── types/entities.ts         # tipos das 7 entidades de domínio
├── services/
│   ├── ApiClient.ts          # interface abstrata consumida pelas páginas
│   ├── client.ts              # instância única injetada (ponto de troca — ver abaixo)
│   └── mock/                  # MockApiClient + fixtures (delay/paginate helpers)
├── mocks/*.json               # dados de exemplo (todos fictícios — ver nota abaixo)
├── hooks/useAsyncResource.ts # hook genérico de loading/empty/success/error
├── utils/                     # slug, datas, formatação de autores, validação de contato
├── components/
│   ├── ui/                    # Button, Card, Badge, LoadingState, EmptyState, NotFound, ícones
│   ├── layout/                # Navbar, Footer, PageLayout
│   └── content/                # cards e formulário específicos de cada entidade
└── pages/                     # uma pasta por página pública (Home, About, Team, Events, ...)
```

Cada componente de conteúdo/página tem seu teste colocado ao lado (`Component.test.tsx`), não em
um diretório `tests/` separado.

## Como trocar o mock pela API real

Quando o backend (repositório separado, contrato documentado em
`specs/contracts/api-contract.md`) existir, a troca é uma linha só: em `src/services/client.ts`,
troque

```ts
export const apiClient: ApiClient = new MockApiClient()
```

por uma implementação real de `ApiClient` que faça as chamadas HTTP correspondentes. Nenhum
componente ou página precisa mudar — todos consomem `apiClient` através dessa mesma interface.

> **Nota sobre nomes de arquivo no Windows**: o arquivo é `client.ts`, não `apiClient.ts`,
> deliberadamente. Em um filesystem case-insensitive (Windows/macOS por padrão), `apiClient.ts`
> e `ApiClient.ts` (a interface) seriam o mesmo arquivo — o que já causou um bug real durante o
> desenvolvimento (um sobrescreveu o outro). Ao adicionar novos arquivos de serviço, evite nomes
> que difiram apenas por capitalização de um arquivo já existente.

## Dados de exemplo

Todo o conteúdo em `src/mocks/*.json` (novidades, eventos, artigos, projetos, membros da equipe,
parceiros) é **fictício**, criado para fins de demonstração. Nenhum nome de pessoa, parceiro ou
dado de contato ali é real.

## Débito técnico conhecido

- **SSR/SSG**: fora de escopo nesta fase. Se SEO de artigos/novidades virar prioridade, migração
  para Next.js é a via natural.
- **Vulnerabilidade de dev-server do esbuild** (`npm audit`): o Vite 5 fixa uma versão do esbuild
  com uma CVE conhecida (CORS no servidor de desenvolvimento, GHSA-67mh-4wv8-2f99). Afeta só
  `npm run dev`, nunca o build de produção. Corrigir exigiria pular para Vite 6+, uma migração
  maior — aceito como risco conhecido por ora.

## Deploy

Build estático (`npm run build` gera `dist/`), compatível com qualquer hospedagem estática
(Vercel, Netlify, GitHub Pages). Nenhuma variável de ambiente ou configuração de servidor é
necessária, já que não há backend neste repositório.
